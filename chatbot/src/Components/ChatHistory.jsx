import Boticon from "./Boticon";
import "./Chatbot.css";

const ChatHistory = ({ chat }) => {
  return (
    <div className={`message ${chat.role === "model" ? "bot-message" : "user-message"}`}>
      {chat.role === "model" && <Boticon />}
      <p className="message-text">{chat.text}</p>
    </div>
  );
};

export default ChatHistory;
