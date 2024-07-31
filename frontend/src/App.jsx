import {useEffect, useState} from "react";
import Parse from "parse/dist/parse.min.js";

import AssistantMessage from "./components/AssistantMessage.jsx";
import UserMessage from "./components/UserMessage.jsx";
import Spinner from "./components/Spinner.jsx";

function App() {

  const [initialMessage, setInitialMessage] = useState(undefined);
  const [loading, setLoading] = useState(true);

  const [threadId, setThreadId] = useState(undefined);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  async function getInitialMessage() {
    const Assistant = Parse.Object.extend("Assistant");
    const assistant = await new Parse.Query(Assistant).first();
    return assistant.get("initialMessage");
  }

  useEffect(() => {
    (async () => {
      // Get the initial message from the assistant
      const assistantInitialMessage = await getInitialMessage();
      setInitialMessage(assistantInitialMessage);
      setMessages([
        ...messages,
        {role: "assistant", content: assistantInitialMessage},
      ]);

      // Create a new thread
      const threadId = await Parse.Cloud.run("createThread");
      setThreadId(threadId);

      setLoading(false);
    })();
  }, []);

  function onSubmit(event) {
    event.preventDefault();
    if (loading || !threadId || !message) return;

    // Add the message to the UI
    setMessages([
      ...messages,
      {role: "user", content: message},
    ]);
    setMessage("");

    setLoading(true);

    (async () => {
      // Generate a response from the assistant
      const assistantId = "asst_IhYqLxKvlFxHKGUcJSPGn04m";
      const response = await Parse.Cloud.run("addMessage", {threadId, assistantId, message});
      setMessages(messages => [
        ...messages,
        {role: "assistant", content: response},
      ]);

      setLoading(false);
    })();
  }

  function onNewThread() {
    if (loading || !threadId) return;

    setLoading(true);

    (async () => {
      // Create a new thread and reset the UI
      setThreadId(await Parse.Cloud.run("createThread"));
      setMessages([{role: "assistant", content: initialMessage}]);
      setLoading(false);
    })();
  }

  return (
    <main className="container mx-auto py-8 px-8 md:px-32 lg:px-64 h-[100vh]">
      <div className="pb-12 space-y-2">
        <h1 className="text-3xl font-bold">
          back4app-openai-virtual-assistant
        </h1>
        <p>
          An AI-powered virtual assistant built using OpenAI + Back4app.
        </p>
      </div>
      <div className="space-y-2">
        {messages.map((message, index) => {
          switch (message.role) {
            case "assistant":
              return <AssistantMessage key={index} content={message.content}/>;
            case "user":
              return <UserMessage key={index} content={message.content}/>;
            default:
              return <></>;
          }
        })}
        {loading && <Spinner/>}
      </div>
      <form className="inline-block flex flex-row pt-12" onSubmit={onSubmit}>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md outline-none"
          placeholder="Type a message..."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 px-3 rounded-md ml-2"
        >
          Send
        </button>
        <button
          type="button"
          className="bg-green-500 hover:bg-green-600 text-white p-2 px-3 rounded-md ml-2"
          onClick={onNewThread}
        >
          New
        </button>
      </form>
    </main>
  );
}

export default App;
