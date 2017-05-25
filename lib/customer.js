$(function() {
    var chatWindow = $('#messages');
    var chatInput = $('#chat-input');
    var ChatChannel = require('./chat');
    var chat = new ChatChannel('Customer');

    chat.on('ready', () => {
        // When chat is ready, create the task
        data = {}
        $.post('/create-task', data, function(response) {
            var taskSid = response.taskSid;
            chat.createChannel(taskSid, chatWindow, chatInput);
        }, 'json');
    });
});