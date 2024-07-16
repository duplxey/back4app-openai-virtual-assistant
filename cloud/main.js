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
    const assistant = await openai.beta.assistants.create({
      name: assistantInstance.get("name"),
      instructions: assistantInstance.get("instructions"),
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

  // If object doesn't have an assistant id, skip preprocessing
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
