import process from "node:process";
import { compayinfo } from "../../src/Components/Companyinfo.js";

const jsonResponse = (statusCode, data) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

const extractText = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item;
  if (typeof item.text === "string") return item.text;
  if (typeof item.content === "string") return item.content;
  if (typeof item.message === "string") return item.message;
  if (Array.isArray(item.parts)) {
    return item.parts
      .map((part) => (typeof part === "string" ? part : part?.text || ""))
      .join("");
  }
  return "";
};

const lastUserMessage = (messages) => {
  if (!Array.isArray(messages)) return "";
  for (let index = messages.length - 1; index >= 0; index--) {
    const message = messages[index];
    if (message?.role === "model" || message?.role === "assistant") continue;
    const text = extractText(message).trim();
    if (text) return text;
  }
  return "";
};

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, { error: "Request body must contain valid JSON." });
  }

  const userMessage = (
    body.message ||
    body.prompt ||
    body.text ||
    body.input ||
    body.query ||
    lastUserMessage(body.messages) ||
    lastUserMessage(body.history) ||
    lastUserMessage(body.contents) ||
    ""
  ).trim();

  if (!userMessage) {
    return jsonResponse(400, { error: "Message is required." });
  }

  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    return jsonResponse(503, { error: "Missing GEMINI_API_KEY in Netlify environment variables." });
  }

  const contents =
    Array.isArray(body.contents) && body.contents.length > 0
      ? body.contents
      : [{ role: "user", parts: [{ text: userMessage }] }];

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: `${compayinfo}\n\nUse conversation history to understand follow-up questions. If you are unsure, say so kindly instead of making up facts.`,
              },
            ],
          },
          contents,
        }),
      }
    );
    const data = await response.json();

    if (!response.ok) {
      return jsonResponse(response.status, {
        error: data?.error?.message || "Gemini API request failed.",
      });
    }

    const reply = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join("\n")
      .trim();

    if (!reply) {
      return jsonResponse(502, { error: "Gemini did not return a text response." });
    }

    return jsonResponse(200, data);
  } catch (error) {
    console.error("Netlify chat function failed:", error);
    return jsonResponse(502, { error: "Could not connect to Gemini." });
  }
}
