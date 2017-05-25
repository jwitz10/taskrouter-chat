var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var promiseRetry = require('promise-retry');

/**
 * @author jwitz
 * @version 1.0
 * 
 * Handles creating and managing of a chat channel
 *
 * @param {string} identity - the identity of the user
 */
function ChatChannel(identity) {
    this.username = identity;

    var self = this;

    // Get an access token for the current user, passing a username (identity)
    // and a device ID - for browser-based apps, we'll always just use the 
    // value "browser"
    $.getJSON('/token', {
        device: 'browser',
        identity: identity
    }, function(data) {
        // Initialize the Chat client
        self.chatClient = new Twilio.Chat.Client(data.token);
        self.chatClient.initialize().then(function() {
            self.chatClient.getSubscribedChannels().then(function() {
                self.emit('ready');
            });
        });
    });
}
inherits(ChatChannel, EventEmitter);

ChatChannel.prototype.createChannel = function createChannel(channelName, $chatWindow, $chatInput) {
    var self = this;

    self.chatClient.createChannel({
        uniqueName: channelName,
        friendlyName: channelName + ' Chat Channel'
    }).then(function(channel) {
        self.setupChannel(channel, $chatWindow, $chatInput);
    });
}

ChatChannel.prototype.setupChannel = function setupChannel(chatChannel, $chatWindow, $chatInput) {
    var self = this;
    // Join the channel
    chatChannel.join().then(function(channel) {
        self.printJoin($chatWindow);
    });

    // Listen for new messages sent to the channel
    chatChannel.on('messageAdded', function(message) {
        self.printMessage(message.author, message.body, $chatWindow);
    });

    // Send a new message
    $chatInput.on('keydown', function(e) {
        if (e.keyCode == 13) {
            chatChannel.sendMessage($chatInput.val())
            $chatInput.val('');
        }
    });
}

// Helper function to print chat message to the chat window
ChatChannel.prototype.printMessage = function printMessage(fromUser, message, $chatWindow) {
    var $user;
    if (fromUser === this.username) {
        $user = $('<span class="username">').text('Me:').addClass('me');
    }else {
        $user = $('<span class="username">').text(fromUser + ':');
    }
    var $message = $('<span class="message">').text(message);
    var $container = $('<div class="message-container">');
    $container.append($user).append($message);
    $chatWindow.append($container);
    $chatWindow.scrollTop($chatWindow[0].scrollHeight);
}

ChatChannel.prototype.printJoin = function printJoin($chatWindow) {
    var $message = $('<div class="message">').append("Initialized Chat");
    $chatWindow.append($message);
}

/**
 * Join the given chat channel that is presented in the given window
 * @param {string} channelName - the channel to join
 * @param {dom} where to print out the chat messages
 * @param {dom} where to capture the input from
 */
ChatChannel.prototype.joinChannel = function joinChannel(channelName, $chatWindow, $chatInput) {
    var self = this;

    // handling race condition of receiving the task but the channel is not setup yet
    promiseRetry(function (retry, number) {
        console.log('attempt number', number);

        return self.chatClient.getChannelByUniqueName(channelName)
        .catch(retry);
    })
    .then(function (channel) {
        self.setupChannel(channel, $chatWindow, $chatInput);

        // Get Messages that were previously populated in the channel
        channel.getMessages().then(function(messages) {
          var totalMessages = messages.items.length;
          for (i=0; i<totalMessages; i++) {
            var message = messages.items[i];
            self.printMessage(message.author, message.body, $chatWindow);
          }
        });
    }, function (err) {
        console.log('Could not find channel')
    });
};

/**
 * Leave the given chat channel
 * @param {string} channelName - the channel to leave
 */
ChatChannel.prototype.leaveChannel = function leaveChannel(channelName) {
    var self = this;

    // Fetch the channel to be left
    var promise = self.chatClient.getChannelByUniqueName(channelName);
    promise.then(function(channel) {
        // Leave the channel
        channel.leave();
    }).catch(function() {
        console.log('Could not find channel')
    });
};

module.exports = ChatChannel;