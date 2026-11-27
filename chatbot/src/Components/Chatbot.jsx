import { useRef, useState, useEffect } from "react";
import Boticon from "./Boticon";
import ChatForm from "./ChatForm";
import ChatHistory from "./ChatHistory";
import "./Chatbot.css";
import DownArrow from "../../public/pics/Downarrow.png";

const Chatbot = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const chatBodyRef = useRef(null);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const generateBotResponse = async (userInput, previousHistory) => {
    const contents = [
      ...previousHistory
        .filter((message) => message.text !== "Thinking...")
        .map((message) => ({
          role: message.role,
          parts: [{ text: message.text }],
        })),
      { role: "user", parts: [{ text: userInput }] },
    ];
    setChatHistory((prev) => [...prev, { role: "model", text: "Thinking..." }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      });
      const data = await res.json();
      if (!res.ok) {
        const error = new Error(data.detail || data.error || "The chat service returned an error.");
        error.status = data.upstreamStatus || res.status;
        throw error;
      }

      const botText =
        data?.candidates?.[0]?.content?.parts
          ?.map((part) => part.text)
          .filter(Boolean)
          .join("\n")
          .trim();
      if (!botText) {
        throw new Error("The chat service did not return a response.");
      }

      setChatHistory((prev) =>
        [...prev.filter((msg) => msg.text !== "Thinking..."), { role: "model", text: botText }]
      );
    } catch (error) {
      console.error("Chat response error:", error);
      const errorDetail = error.message.toLowerCase();
      const errorText = errorDetail.includes("not a model name or link")
        ? "That looks like a model name or link, not an API key. Please put a real Google AI Studio API key in C:\\ai bot\\.env as GEMINI_API_KEY=your_key, then restart the app. 🙂"
        : errorDetail.includes("gemini_api_key")
          ? "I’m not connected to my AI service yet. Please add GEMINI_API_KEY to your .env file and restart the app. 🙂"
          : (error.status === 400 || error.status === 401 || error.status === 403) &&
              /api key|credential/.test(errorDetail)
            ? "Gemini rejected that API key. Put a valid Google AI Studio API key in C:\\ai bot\\.env as GEMINI_API_KEY=your_key, then restart the app. 🙂"
            : error.status === 401 || error.status === 403
              ? "Gemini didn’t accept the API key. Please check the key and make sure Gemini API access is enabled. 🙂"
              : error.status === 429
                ? "Gemini is receiving too many requests or the API quota is used up. Please wait a bit and try again. 🙂"
                : error.status === 400
                  ? "Gemini rejected the request. Please check the server terminal for details. 🙂"
                  : "I hit a little connection problem while thinking. Please try again in a moment. 🙂";
      setChatHistory((prev) =>
        [...prev.filter((msg) => msg.text !== "Thinking..."), { role: "model", text: errorText }]
      );
    }
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="container">
      <button id="chatbot-toggle" onClick={handleToggle}>
        <span className={`icon-toggle ${isOpen ? "open" : "closed"}`}>
          {isOpen ? "❌" : "📩"}
        </span>
      </button>

      {isOpen && (
        <div className="chatbot-popup">
          <div className="chat-header">
            <div className="header-info">
              <Boticon />
              <h2 className="logo-text">Chatbot</h2>
            </div>
            <button onClick={handleToggle}>
              <img src={DownArrow} alt="Close" />
            </button>
          </div>

          <div ref={chatBodyRef} className="chat-body">
            <div className="message bot-message">
              <Boticon />
              <p className="message-text">
                Hey there! 👋 <br /> What can I help you with today?
              </p>
            </div>
            {chatHistory.map((chat, index) => (
              <ChatHistory key={index} chat={chat} />
            ))}
          </div>

          <div className="chat-footer">
            <ChatForm
              setChatHistory={setChatHistory}
              generateBotResponse={generateBotResponse}
              chatHistory={chatHistory}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
