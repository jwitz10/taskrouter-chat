function ChatChannel(identity) {
    this.username = identity;

    // Our interface to the Chat service
    var chatClient;

    // Get an access token for the current user, passing a username (identity)
    // and a device ID - for browser-based apps, we'll always just use the 
    // value "browser"
    $.getJSON('/token', {
        device: 'browser',
        identity: identity
    }, function(data) {
        // Initialize the Chat client
        chatClient = new Twilio.Chat.Client(data.token);
    });
}

ChatChannel.prototype.joinChannel = function fetch(channelName) {
    chatClient.getSubscribedChannels().then(createOrJoinChannel(channelName));

    // Get handle to the chat div 
    var $chatWindow = $('#messages');

    var chatChannel;

    // Send a new message to the general channel
    var $input = $('#chat-input');
    $input.on('keydown', function(e) {
        if (e.keyCode == 13) {
            chatChannel.sendMessage($input.val())
            $input.val('');
        }
    });

    // Helper function to print chat message to the chat window
    function printMessage(fromUser, message) {
        var $user = $('<span class="username">').text(fromUser + ':');
        if (fromUser === username) {
            $user.addClass('me');
        }
        var $message = $('<span class="message">').text(message);
        var $container = $('<div class="message-container">');
        $container.append($user).append($message);
        $chatWindow.append($container);
        $chatWindow.scrollTop($chatWindow[0].scrollHeight);
    }

    function createOrJoinChannel(channelName) {
        // Get the general chat channel, which is where all the messages are
        // sent in this simple application
        print('Attempting to join ' + channelName ' chat channel...');
        var promise = chatClient.getChannelByUniqueName(channelName);
        promise.then(function(channel) {
            chatChannel = channel;
            console.log('Found channel:');
            console.log(chatChannel);
            setupChannel();
        }).catch(function() {
            // If it doesn't exist, let's create it
            console.log('Creating channel');
            chatClient.createChannel({
                uniqueName: channelName,
                friendlyName: channelName + ' Chat Channel'
            }).then(function(channel) {
                console.log('Created channel:');
                console.log(channel);
                chatChannel = channel;
                setupChannel();
            });
        });
    }

    // Set up channel after it has been found
    function setupChannel() {
        // Join the general channel
        chatChannel.join().then(function(channel) {
            print('Joined channel as <span class="me">' + username + '</span>.', true);
        });

        // Listen for new messages sent to the channel
        chatChannel.on('messageAdded', function(message) {
            printMessage(message.author, message.body);
        });
    }
};

module.exports = ChatChannel;