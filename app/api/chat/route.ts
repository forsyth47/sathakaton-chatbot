import { GoogleGenerativeAI } from "@google/generative-ai";
import { streamText } from "ai";

// Create a Google Generative AI instance
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Get the last user message
    const userMessage = messages[messages.length - 1].content;

    // Get previous messages for context (excluding the last one)
    const previousMessages = messages.slice(0, -1).map((msg: { role: string; content: any; }) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Initialize the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Start a chat session
    const chat = model.startChat({
      history: previousMessages,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    // Send the message and get a streaming response
    const result = await chat.sendMessageStream(userMessage);

    // Create a readable stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Process the response chunks
        for await (const chunk of result.stream) {
          const text = chunk.text();
          controller.enqueue(encoder.encode(text));
        }

        controller.close();
      },
    });

    // Return a streaming response
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
