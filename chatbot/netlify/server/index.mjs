import express from "express";
import process from "node:process";
import { compayinfo } from "../../src/Components/Companyinfo.js";

const model = "gemini-3.5-flash-lite";
const app = express();
app.use(express.json({ limit: "32kb" }));

app.post("/api/chat", async (req, res) => {
  if (!Array.isArray(req.body?.contents)) {
    return res.status(400).json({ error: "Chat messages are missing or invalid." });
  }

  const baseUrl = (process.env.GOOGLE_GEMINI_BASE_URL || "https://generativelanguage.googleapis.com").replace(/\/$/, "");

  try {
    const response = await fetch(`${baseUrl}/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY || "",
      },
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
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const detail = data?.error?.message || response.statusText;
      console.error("Gemini API error:", response.status, detail);
      return res.status(502).json({ error: "The Gemini API request failed.", detail, upstreamStatus: response.status });
    }
    return res.json(data);
  } catch (error) {
    console.error("Gemini request failed:", error);
    return res.status(502).json({ error: "Could not connect to Gemini." });
  }
});

app.listen(process.env.PORT || 3001);

export const config = { path: "/api/*" };
