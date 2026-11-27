export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const apiKey =
      process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing Gemini API key in Netlify env" }),
      };
    }

    const body = JSON.parse(event.body || "{}");
    const userMessage =
      body.message ||
      body.prompt ||
      (Array.isArray(body.history) && body.history.length > 0
        ? body.history[body.history.length - 1]?.text ||
          body.history[body.history.length - 1]?.content
        : "");

    if (!userMessage) {
      return {
        statusCode: 400,
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
      body: JSON.stringify({ error: err.message || "Internal server error" }),
    };
  }
}