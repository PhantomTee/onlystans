import OpenAI from "openai";
import { allowMockFallback } from "@/lib/env";
import { autoTag as mockAutoTag } from "@/lib/mock";
import type { TagResult } from "@/types";

const systemPrompt = "You are a content tagging assistant. Given a video filename and optional creator notes, return a JSON object: { title (max 60 chars), description (max 200 chars), tags (array of 3-5 strings) }. Return only JSON. No markdown.";

function stripFences(value: string) {
  return value.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
}

export async function autoTag(filename: string, notes = ""): Promise<TagResult> {
  if (allowMockFallback() && (process.env.MOCK_MODE !== "false" || !process.env.OPENROUTER_API_KEY)) return mockAutoTag(filename);
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://onlystans.app",
        "X-Title": "OnlyStans",
      },
    });
    const response = await client.chat.completions.create({
      model: "meta-llama/llama-3.1-8b-instruct:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Filename: ${filename}\nNotes: ${notes}` },
      ],
    });
    return JSON.parse(stripFences(response.choices[0]?.message?.content || "{}")) as TagResult;
  } catch {
    return mockAutoTag(filename);
  }
}
