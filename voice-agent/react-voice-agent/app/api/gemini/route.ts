import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY" },
        { status: 500 },
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);

    const summary = result.response.text() || "No summary generated.";

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("Gemini API handler error:", err);
    return NextResponse.json(
      { error: "Failed to summarize transcript" },
      { status: 500 },
    );
  }
}
