import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { compayinfo } from "./src/Components/Companyinfo.js";

const directory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(directory, ".env") });
dotenv.config({ path: path.resolve(directory, "..", ".env") });

const app = express();
const port = process.env.PORT || 3001;
const model = "gemini-3.5-flash-lite";

app.use(express.json({ limit: "32kb" }));

app.post("/api/chat", async (req, res) => {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    return res.status(503).json({ error: "GEMINI_API_KEY is not configured." });
  }

  if (/^(?:gemini|your_gemini_api_key|placeholder)|\blink\b/i.test(apiKey)) {
    return res.status(400).json({
      error: "GEMINI_API_KEY must be a real Google AI Studio API key, not a model name or link.",
    });
  }

  if (!Array.isArray(req.body?.contents)) {
    return res.status(400).json({ error: "Chat messages are missing or invalid." });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: `${compayinfo}\n\nAnswer naturally across topics. Use chat history to understand follow-up questions. If you do not know something, say so kindly instead of making it up.`,
              },
            ],
          },
          contents: req.body.contents,
        }),
      }
    );
    const data = await response.json();

    if (!response.ok) {
      const detail = data?.error?.message || response.statusText;
      console.error("Gemini API error:", response.status, detail);
      return res.status(502).json({
        error: "The Gemini API request failed.",
        detail,
        upstreamStatus: response.status,
      });
    }

    return res.json(data);
  } catch (error) {
    console.error("Gemini request failed:", error);
    return res.status(502).json({ error: "Could not connect to Gemini." });
  }
});

app.use(express.static(path.join(directory, "dist")));
app.get(/.*/, (req, res, next) => {
  res.sendFile(path.join(directory, "dist", "index.html"), (error) => {
    if (error) next(error);
  });
});

app.listen(port, () => {
  console.log(`Chatbot server listening on http://localhost:${port}`);
});
