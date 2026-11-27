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

const lastFromArray = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return "";
  for (let i = arr.length - 1; i >= 0; i--) {
    const item = arr[i];
    if (item?.role === "model" || item?.role === "assistant") continue;
    const text = extractText(item).trim();
    if (text) return text;
  }
  return extractText(arr[arr.length - 1]).trim();
};

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const apiKey =
      process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing Gemini API key in Netlify env" }),
      };
    }

    const body = JSON.parse(event.body || "{}");

    const userMessage = (
      body.message ||
      body.prompt ||
      body.text ||
      body.input ||
      body.query ||
      lastFromArray(body.messages) ||
      lastFromArray(body.history) ||
      lastFromArray(body.contents) ||
      ""
    ).trim();

    if (!userMessage) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Message is required" }),
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: "You are a warm, casual, friendly AI companion. Keep replies helpful, natural, and conversational.",
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: String(userMessage) }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: data?.error?.message || "Gemini API error",
        }),
      };
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Hmm, I couldn't come up with a reply right now.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message || "Internal server error" }),
    };
  }
}const extractText = (item) => {
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

const lastFromArray = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return "";
  for (let i = arr.length - 1; i >= 0; i--) {
    const item = arr[i];
    if (item?.role === "model" || item?.role === "assistant") continue;
    const text = extractText(item).trim();
    if (text) return text;
  }
  return extractText(arr[arr.length - 1]).trim();
};

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const apiKey =
      process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing Gemini API key in Netlify env" }),
      };
    }

    const body = JSON.parse(event.body || "{}");

    const userMessage = (
      body.message ||
      body.prompt ||
      body.text ||
      body.input ||
      body.query ||
      lastFromArray(body.messages) ||
      lastFromArray(body.history) ||
      lastFromArray(body.contents) ||
      ""
    ).trim();

    if (!userMessage) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Message is required" }),
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: "You are a warm, casual, friendly AI companion. Keep replies helpful, natural, and conversational.",
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: String(userMessage) }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: data?.error?.message || "Gemini API error",
        }),
      };
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Hmm, I couldn't come up with a reply right now.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message || "Internal server error" }),
    };
  }
}