import { useState } from "react";
import "./Chatbot.css";

const ChatForm = ({ setChatHistory, generateBotResponse, chatHistory }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setChatHistory((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    generateBotResponse(trimmed, chatHistory);
  };

  return (
    <form onSubmit={handleSubmit} className="chat-form">
      <input
        type="text"
        placeholder="Type a message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="chat-input"
      />
      <button type="submit" className="send-button">
        Send
      </button>
    </form>
  );
};

export default ChatForm;
