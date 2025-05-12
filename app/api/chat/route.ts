// app/api/chat/route.ts
import { NextRequest } from "next/server";
import { systemPrompt } from "./systemPrompt";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: NextRequest) {
  const { messages } = (await req.json()) as { messages: Message[] };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response("Missing GEMINI_API_KEY", { status: 500 });
  }

  // Add system prompt only if first message is user
  const shouldIncludeSystemPrompt =
    messages.length === 1 && messages[0].role === "user";

  const geminiMessages = messages.flatMap((msg, index) => {
    if (index === 0 && shouldIncludeSystemPrompt && msg.role === "user") {
      return {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\n${msg.content}` }],
      };
    }
    return {
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    };
  });

  const body = {
    contents: geminiMessages,
    model: "gemini-2.0-flash", // or "gemini-2.0-flash" if supported
  };

  console.log("Body: ", body) 

  console.log("Body: ", JSON.stringify(body, null, 2));

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();

    console.log("Response Data: ", data)

    console.log("Gemini response:", JSON.stringify(data, null, 2));

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    return new Response(
      JSON.stringify({
        message: {
          role: "assistant" as const,
          content: text,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Gemini API error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch response" }), {
      status: 500,
    });
  }
}