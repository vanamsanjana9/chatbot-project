const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", (req, res) => {
  const userMessage = req.body.message;

  const sql = "SELECT answer FROM chat_responses WHERE question LIKE ?";

  db.query(sql, [`%${userMessage}%`], (err, result) => {
    let reply = "Sorry, I don't understand.";

    if (result.length > 0) {
      reply = result[0].answer;
    }

    db.query(
      "INSERT INTO chat_history (user_message, bot_reply) VALUES (?, ?)",
      [userMessage, reply]
    );

    res.json({ reply });
  });
});

module.exports = router;
