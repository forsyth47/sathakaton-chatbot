// app/api/chat/route.ts
import { NextRequest } from "next/server";

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

  const lastMessage = messages[messages.length - 1]?.content;

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: lastMessage }],
      },
    ],
    model: "gemini-pro",
  };

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    
    return new Response(
      JSON.stringify({
        message: {
          role: "assistant" as const,
          content: text, // Just plain string
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