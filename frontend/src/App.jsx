import {useEffect, useState} from "react";

import AssistantMessage from "./components/AssistantMessage.jsx";
import UserMessage from "./components/UserMessage.jsx";
import Spinner from "./components/Spinner.jsx";

function App() {

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {role: "assistant", content: "Hi! How can I help you?"},
    {role: "user", content: "What is 2+2?"},
    {role: "assistant", content: "2+2 is 4."},
  ]);

  useEffect(() => {
    // TODO: fetch the initial message
    setLoading(false);
  }, []);

  function onSubmit(event) {
    event.preventDefault();
    if (loading || !message) return;

    setMessages([...messages, {role: "user", content: message}]);
    setMessage("");

    setLoading(true);
    // TODO: generate the response
  }

  function onNewThread() {
    if (loading) return;

    setLoading(true);
    // TODO: create a new thread and fetch messages
  }

  return (
    <main className="container mx-auto py-8 px-8 md:px-32 lg:px-64 h-[100vh]">
      <div className="pb-12 space-y-2">
        <h1 className="text-3xl font-bold">
          back4app-openai-virtual-assistant
        </h1>
        <p>A simple virtual assistant using OpenAI + Back4app.</p>
      </div>
      <div className="space-y-2">
        {messages.map((message, index) => {
          if (message.role === "assistant") {
            return <AssistantMessage key={index} content={message.content}/>;
          } else {
            return <UserMessage key={index} content={message.content}/>;
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
