/**
 * Back4app Cloud Code for interacting with OpenAI's Assistants API
 * (https://platform.openai.com/docs/assistants/overview)
 *
 * This script provides functions for:
 *   - Setting up a virtual assistant (`setup()`)
 *   - Creating and deleting threads (`createThread()`, `deleteThread()`)
 *   - Generating responses from the assistant (`addMessage()`)
 */

const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_INITIAL_MESSAGE = "Hi, my name is Math Bot. How can I help you?";
const ASSISTANT_SETTINGS = {
  name: "Math Bot",
  instructions: "Very smart math bot that answers math questions.",
  model: "gpt-3.5-turbo-0125",
  tools: [],
};

Parse.Cloud.define("setup", async (request) => {
  const Assistant = Parse.Object.extend("Assistant");
  const query = await new Parse.Query(Assistant);
  const count = await query.count();

  // Check if virtual assistant already exists
  if (count !== 0) {
    throw new Parse.Error(Parse.Error.VALIDATION_ERROR, "A virtual assistant already exists!");
  }

  // Use OpenAI's API to create an assistant
  const openAssistant = await openai.beta.assistants.create(
    ASSISTANT_SETTINGS,
  );

  // Store the assistant in Back4app database
  const assistant = new Assistant();
  for (const key in ASSISTANT_SETTINGS) {
    assistant.set(key, ASSISTANT_SETTINGS[key]);
  }
  assistant.set("initialMessage", ASSISTANT_INITIAL_MESSAGE);
  assistant.set("assistantId", openAssistant.id);
  await assistant.save();

  return assistant.get("assistantId");
});

Parse.Cloud.define("createThread", async (request) => {
  const thread = await openai.beta.threads.create();
  return thread.id;
});

Parse.Cloud.define("deleteThread", async (request) => {
  const _threadId = request.params.threadId;
  return await openai.beta.threads.del(_threadId);
});

Parse.Cloud.define("addMessage", async (request) => {
  const _threadId = request.params.threadId;
  const _message = request.params.message;

  // Verify all the parameters are provided
  if (!_threadId || !_message) {
    throw new Parse.Error(Parse.Error.VALIDATION_ERROR, "You need to provide: threadId & message.");
  }

  const Assistant = Parse.Object.extend("Assistant");
  const query = await new Parse.Query(Assistant);
  const count = await query.count();

  // Check if a virtual assistant exists
  if (count === 0) {
    throw new Parse.Error(Parse.Error.VALIDATION_ERROR, "A virtual assistant does not exist!");
  }

  const assistant = await new Parse.Query(Assistant).first();
  const assistantId = assistant.get("assistantId");

  // Get the thread, add the message, and generate a response
  let buffer = "";
  const message = await openai.beta.threads.messages.create(
    _threadId, {role: "user", content: _message},
  );
  let run = await openai.beta.threads.runs.createAndPoll(
    _threadId, {assistant_id: assistantId},
  );

  // Add the last message to the buffer
  if (run.status === "completed") {
    const messages = await openai.beta.threads.messages.list(run.thread_id);
    buffer += messages.data[0].content[0].text.value;
  } else {
    console.error("Failed to run the assistant.");
  }

  return buffer;
});
