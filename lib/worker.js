$(function() {
    var username = 'Support';
    $.getJSON('/token', {
        device: 'browser',
        identity: username
    }, function(data) {
        var ChatChannel = require('./chat');
        var chat = new ChatChannel(username);

        chat.on('ready', () => {
            function updateWorker(worker) {
                $("#workername").text(worker.name);
            }

            // Initialize the TR Worker client
            var worker = new Twilio.TaskRouter.Worker(data.token);
            console.log(data.token);

            worker.on('ready', (readyWorker) => {
                console.log('Worker ' + readyWorker.sid + ' is now ready for work');
                updateWorker(readyWorker);
            });

            worker.on('reservationCreated', (reservation) => {
                console.log('Reservation ' + reservation.sid + ' has been created for ' + worker.sid);
                reservation.accept().then((acceptedReservation) => {
                  console.log('Reservation ' + acceptedReservation.sid + ' was accepted');
                  // now join the channel
                  acceptedReservation.getTask().then((task) => {
                    var taskSid = task.sid;
                    
                    var chat1 = $("#chat1");
                    var chat2 = $("#chat2");
                    var chat3 = $("#chat3");
                    var currentChatWindow;
                    var currentChatInput;
                    var currentTaskInfo;
                    var currentChat;

                    if (chat1.css('display') == 'none') {
                        currentChatWindow = $("#chat1-messages");
                        currentChatInput = $("#chat1-input");
                        currentTaskInfo = $("#chat1-info");
                        currentChat = chat1;
                    } else if(chat2.css('display') == 'none') {
                        currentChatWindow = $("#chat2-messages");
                        currentChatInput = $("#chat2-input");
                        currentTaskInfo = $("#chat2-info");
                        currentChat = chat2;
                    } else if(chat3.css('display') == 'none') {
                        currentChatWindow = $("#chat3-messages");
                        currentChatInput = $("#chat3-input");
                        currentTaskInfo = $("#chat3-info");
                        currentChat = chat3;
                    }

                    currentChat.show();

                    var $completeElement = $('<input type="button" value="Complete Task" className="btn btn-primary"></input>');
                    $completeElement.on('click', function() {
                        currentTaskInfo.empty();
                        //currentChatWindow[0].remove('.message');
                        //currentChatWindow[0].remove('.message-container');
                        currentChatInput.empty();
                        currentChatInput.off("keydown");
                        currentChat.hide();
                        chat.deleteChannel(taskSid);
                        data = {'taskSid':taskSid};
                        $.post('/complete-task', data);
                    });
                    currentTaskInfo.append($completeElement);

                    chat.joinChannel(taskSid, currentChatWindow, currentChatInput);

                  });
                }).catch((err) => {
                  console.log('Error: ' + err);
                });
            });
        });
    });
});