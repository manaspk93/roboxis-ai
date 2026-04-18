import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Secure API key (NO hardcoding)
const API_KEY = process.env.OPENAI_API_KEY;

app.post("/generate", async (req, res) => {

  const { className, subject, chapter, difficulty, type, count } = req.body;

  const prompt = `
Generate ${count} ${type} questions for a school exam.

Class: ${className}
Subject: ${subject}
Chapter: ${chapter}
Difficulty: ${difficulty}

Rules:
- Numbered questions
- No explanation
- If MCQ, include 4 options
- Keep questions clear and syllabus-based
`;

  try {

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt
      })
    });

    const data = await response.json();

    const result = data?.output?.[0]?.content?.[0]?.text;

    if (!result) {
      return res.status(500).json({
        error: "No response from OpenAI",
        full: data
      });
    }

    res.json({ result });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }

});

// 🔥 IMPORTANT for deployment
app.listen(process.env.PORT || 3000, () => {
  console.log("Server running...");
});