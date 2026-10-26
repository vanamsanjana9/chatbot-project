import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const sendMessage = async () => {
    if (message.trim() === "") return;

    setChat([...chat, { sender: "user", text: message }]);

    const res = await axios.post("http://localhost:5000/api/chat", {
      message
    });

    setChat(prev => [...prev, { sender: "bot", text: res.data.reply }]);
    setMessage("");
  };

  return (
    <div className="bg">
      <div className="chat-box">
        <div className="chat-header">
          Interactive Chatbot Application
        </div>

        <div className="chat-body">
          {chat.map((c, i) => (
            <div key={i} className={`bubble ${c.sender}`}>
              {c.text}
            </div>
          ))}
        </div>

        <div className="chat-input">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>➤</button>
        </div>
      </div>
    </div>
  );
}

export default App;