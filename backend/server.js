const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection (uses environment variables from Kubernetes ConfigMap/Secret with local fallbacks)
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.MYSQL_PASSWORD || "root",
  database: process.env.DB_NAME || "chatbotdb" // Updated to match your Kubernetes ConfigMap DB_NAME
});

db.connect(err => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
  } else {
    console.log("✅ MySQL Connected");
  }
});

// Root route so browser shows a friendly status instead of "Cannot GET /"
app.get("/", (req, res) => {
  res.send("🤖 Chatbot Backend is running successfully!");
});

// Chat API
app.post("/api/chat", (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.json({ reply: "Please type a message" });
  }

  const sql = "SELECT answer FROM chat_responses WHERE question LIKE ?";

  db.query(sql, [`%${userMessage}%`], (err, result) => {
    let reply = "Sorry, I don't understand that.";

    if (!err && result.length > 0) {
      reply = result[0].answer;
    }

    // Save chat history
    db.query(
      "INSERT INTO chat_history (user_message, bot_reply) VALUES (?, ?)",
      [userMessage, reply]
    );

    res.json({ reply });
  });
});

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});
