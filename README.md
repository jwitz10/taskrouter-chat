<a href="https://www.twilio.com">
  <img src="https://static0.twilio.com/marketing/bundles/marketing/img/logos/wordmark-red.svg" alt="Twilio" width="250" />
</a>

# Twilio TaskRouter Multi-Task Chat Starter Application for Node.js

This sample project demonstrates how to use Twilio TaskRouter Multi-Tasking in combination with Twilio Chat in a Node.js web 
application to allow a Worker to receive multiple chats at any given time. 

Let's get started!

## Configure the sample application

To run the application, you'll need to gather your Twilio account credentials and configure them
in a file named `.env`. To create this file from an example template, do the following in your
Terminal.

```bash
cp .env.example .env
```

Open `.env` in your favorite text editor and configure the following values.

### Configure account information

This demo requires some basic credentials from your Twilio account. Configure these first.

| Config Value  | Description |
| :-------------  |:------------- |
`TWILIO_ACCOUNT_SID` | Your primary Twilio account identifier - find this [in the console here](https://www.twilio.com/console).
`TWILIO_AUTH_TOKEN` | Used to authenicate REST API requests - find this [in the console here](https://www.twilio.com/console).
`TWILIO_API_KEY` | Used to authenticate JS SDKs - [generate one here](https://www.twilio.com/console/chat/dev-tools/api-keys).
`TWILIO_API_SECRET` | Used to authenticate JS SDKs - [just like the above, you'll get one here](https://www.twilio.com/console/chat/dev-tools/api-keys).

#### A Note on API Keys

When you generate an API key pair at the URLs above, your API Secret will only be shown once - 
make sure to save this information in a secure location, or possibly your `~/.bash_profile`.

### Configure Chat

There a few more items you need to configure for this demo.

You will need to configure a Chat service. This is like a database for your Chat Data. You can [generate one in the console here](https://www.twilio.com/console/chat/services). Add this to your `.env` file.

In the configuration, be sure to change `DEFAULT CHANNEL ROLE` to be `Channel Admin`. This will allow deleting of a channel once the Task is complete. 

| Config Value  | Product | Description |
| :-------------  |:------------- |:------------- |
`TWILIO_CHAT_SERVICE_SID` | Chat | Like a database for your Chat data - [generate one in the console here](https://www.twilio.com/console/chat/services)

### Configure TaskRouter

You will need to configure a TaskRouter Multi-Task Workspace and Worker with Chat Capacity of 3. 

You can do so with the following steps:

1. [Create a Workspace](https://www.twilio.com/console/taskrouter/workspaces) with a FIFO Template and Multi-Task Enabled.
2. Create a Worker (Attributes not required at this point; this will be relevant in Workflow TaskQueue Routing Configurations).
3. Upon creating the Worker, you will note a list of TaskChannels the Worker can listen to. You will also note the capacity of that TaskChannel. Bump the `chat` TaskChannel to have a capacity of 3.

Add your newly created `WorkspaceSid` and `WorkerSid` to your `.env` file.

| Config Value  | Product | Description |
| :-------------  |:------------- |:------------- |
`TWILIO_WORKSPACE_SID` | TaskRouter | Encapsulates all TaskRouter data - [generate one in the console here](https://www.twilio.com/console/taskrouter/workspaces)
`TWILIO_WORKER_SID` | TaskRouter | The Worker that can take multiple Chats (this demo can be expanded for multiple Workers with a little bit of hacking)

## Run the sample application

Now that the application is configured, we need to install our dependencies from npm.

```bash
npm install
```

We will also now need to build our application. This is because we are using browersify to link javascript files together.

```bash
make
```

Now we should be all set! Run the application using the `node` command.

```bash
node .
```

Your application should now be running at [http://localhost:3000/](http://localhost:3000/). 

### Starting the Worker Multi-Chat UI

Load up the Worker Multi-Chat UI at [http://localhost:3000/worker.html](http://localhost:3000/worker.html). This can send and recieve up to the max number of chats configured in TaskRouter Worker. The UI itself only supports 3, but with a little tinkering this could be dynamic.

### Starting the Customer Chat

Load up the Customer Single Chat UI at [http://localhost:3000/customer.html](http://localhost:3000/customer.html). Upon loading the page, this will create a Task, and then create a Chat Channel based on the TaskSid. Workers will join this Chat Channel upon receiving a Reservation. Workers can also free up the capacity of their Chat by Completing the Task.

## Running the TaskRouter Multi-Chat demo with ngrok

If you want multiple computers to be able send in chats to this app, you will need a publicly accessible URL. You can do this using a tool like [ngrok](https://ngrok.com/) to send HTTP/HTTPS traffic to a server running on your localhost. Use HTTPS to make web connections that retrieve a Twilio access token.

```bash
ngrok http 3000
```

## License
MIT
