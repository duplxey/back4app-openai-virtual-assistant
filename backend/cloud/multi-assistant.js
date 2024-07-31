/**
 * Back4app Multi-Agent Cloud Code for interacting with OpenAI's Assistants API
 * (https://platform.openai.com/docs/assistants/overview)
 *
 * This script provides functions for:
 *   - Setting up a virtual assistant (`setup()`)
 *   - Creating and deleting threads (`createThread()`, `deleteThread()`)
 *   - Generating responses from the assistant (`addMessage()`)
 *
 * It supports multiple assistants and synchronizes OpenAI's assistant instances with the database.
 */

const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

Parse.Cloud.afterSave("Assistant", async (request) => {
  const assistantInstance = request.object;

  // If the object is not new, skip processing
  if (assistantInstance.get("assistantId")) return;

  try {
    // Use OpenAI API to create the assistant
    const tools = assistantInstance.get("tools");
    const assistant = await openai.beta.assistants.create({
      name: assistantInstance.get("name"),
      instructions: assistantInstance.get("instructions"),
      tools: tools ? tools.map(tool => ({type: tool})) : undefined,
      model: assistantInstance.get("model"),
    });

    // Store the assistant's id in the database
    assistantInstance.set("assistantId", assistant.id);
    await assistantInstance.save();

    console.log("Successfully created a new OpenAI agent with ID: " + assistant.id);
  } catch (e) {
    console.error("Failed creating the assistant.");
    console.error(e);
  }
});

Parse.Cloud.afterDelete("Assistant", async (request) => {
  const assistantInstance = request.object;
  const assistantId = assistantInstance.get("assistantId");

  // If object doesn't have an assistant id, skip processing
  if (!assistantId) return;

  try {
    // Use OpenAI API to delete the assistant
    await openai.beta.assistants.del(assistantId);

    console.log("Successfully deleted an OpenAI agent with ID: " + assistantId);
  } catch (e) {
    console.error("Failed deleting the assistant.");
    console.error(e);
  }
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
  const _assistantId = request.params.assistantId;
  const _message = request.params.message;

  // Verify all parameters are provided
  if (!_threadId || !_assistantId || !_message) {
    throw new Parse.Error(Parse.Error.VALIDATION_ERROR, "You need to provide: threadId, assistantId, message.");
  }

  // Get the thread, add the message, and generate a response
  let buffer = "";
  const thread = await openai.beta.threads.retrieve(_threadId);
  const message = await openai.beta.threads.messages.create(
    _threadId, {role: "user", content: _message},
  );
  let run = await openai.beta.threads.runs.createAndPoll(
    _threadId, {assistant_id: _assistantId},
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
