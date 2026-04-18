import fetch from "node-fetch";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Secure API key
const API_KEY = process.env.OPENAI_API_KEY;

app.post("/generate", async (req, res) => {

  const { className, subject, chapter, difficulty, type, count } = req.body;

  // ✅ BASE PROMPT
  let prompt = `
Generate ${count} ${type} questions for a school exam.

Class: ${className}
Subject: ${subject}
Chapter: ${chapter}
Difficulty: ${difficulty}

Rules:
- Numbered questions
- No explanation
- Keep questions clear and syllabus-based
`;

  // ✅ ONLY ADD ANSWER KEY FOR MCQ
  if(type === "mcq"){
    prompt += `
- Include 4 options (a, b, c, d)

IMPORTANT:
At the end, provide the answer key in this exact format:

Answer Key:
1. a
2. b
3. d
`;
  }

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

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running...");
});