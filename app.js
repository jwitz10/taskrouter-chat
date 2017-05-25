// Node/Express
var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var path = require('path');

// Twilio Library
var Twilio = require('twilio');

// Access Token used for Video, IP Messaging, and Sync
var AccessToken = Twilio.jwt.AccessToken;

// Grant IP Messaging capability
var IpMessagingGrant = AccessToken.IpMessagingGrant;

// TaskRouter Grant
var TaskRouterGrant = AccessToken.TaskRouterGrant;

// Process environment variables
require('dotenv').load();

// Setup twilio rest client
var client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Create Express webapp
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Basic health check - check environment variables have been configured
// correctly
app.get('/config', function(request, response) {
  response.json( {
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_API_KEY: process.env.TWILIO_API_KEY,
    TWILIO_API_SECRET: process.env.TWILIO_API_SECRET != '',
    TWILIO_CHAT_SERVICE_SID: process.env.TWILIO_CHAT_SERVICE_SID,
    TWILIO_WORKSPACE_SID: process.env.TWILIO_WORKSPACE_SID,
    TWILIO_WORKFLOW_SID: process.env.TWILIO_WORKFLOW_SID,
    TWILIO_WORKER_SID: process.env.TWILIO_WORKER_SID
  });
});

// Generate an Access Token for an application user
app.get('/token', function(request, response) {

    // Create an access token which we will sign and return to the client
    var token = new AccessToken(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_API_KEY,
        process.env.TWILIO_API_SECRET
    );

    // Assign the generated identity to the token
    token.identity = request.query.identity;

    // add the Chat Grant which enables browser messaging
    if (process.env.TWILIO_CHAT_SERVICE_SID) {
        var ipmGrant = new IpMessagingGrant({
            serviceSid: process.env.TWILIO_CHAT_SERVICE_SID
        });
        token.addGrant(ipmGrant);
    }

    // add the TaskRouter Worker Grant
    if (process.env.TWILIO_WORKSPACE_SID && process.env.TWILIO_WORKER_SID) {
        var taskRouterGrant = new TaskRouterGrant({
            workspaceSid: process.env.TWILIO_WORKSPACE_SID,
            workerSid: process.env.TWILIO_WORKER_SID,
            role: 'worker'
        });
        token.addGrant(taskRouterGrant);
    }

    // Serialize the token to a JWT string and include it in a JSON response
    response.send({
        identity: token.identity,
        token: token.toJwt()
    });
});

// create a task
app.post('/create-task', function(request, response) {
    var accountSid = process.env.TWILIO_ACCOUNT_SID;
    var authToken = process.env.TWILIO_AUTH_TOKEN;
    var workspaceSid = process.env.TWILIO_WORKSPACE_SID;
    var workflowSid = process.env.TWILIO_WORKFLOW_SID;

    client.taskrouter.v1
      .workspaces(workspaceSid)
      .tasks
      .create({
        workflowSid: workflowSid,
        attributes: '{}',
        taskChannel: 'chat'
      })
      .then((task) => {
        console.log('Created '+task.sid);
        // send the task sid back that was created
        response.send({
            taskSid: task.sid
        })
      });
});

// complete a task
app.post('/complete-task', function(request, response) {
    var accountSid = process.env.TWILIO_ACCOUNT_SID;
    var authToken = process.env.TWILIO_AUTH_TOKEN;
    var workspaceSid = process.env.TWILIO_WORKSPACE_SID;
    var workflowSid = process.env.TWILIO_WORKFLOW_SID;
    var taskSid = request.body.taskSid;

    console.log('Completing '+taskSid);

    client.taskrouter.v1
      .workspaces(workspaceSid)
      .tasks(taskSid)
      .update({
        assignmentStatus: 'completed',
      })
      .then((task) => {
        // send the task sid back that was created
        response.send({
            task: task
        })
      });
});

// Create http server and run it
var server = http.createServer(app);
var port = process.env.PORT || 3000;
server.listen(port, function() {
    console.log('Express server running on *:' + port);
});

module.exports = app;
