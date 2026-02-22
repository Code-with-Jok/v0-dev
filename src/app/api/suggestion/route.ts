/**
 * route.ts
 * Single Responsibility: Xử lý HTTP request cho AI suggestion endpoint.
 *
 * Đã tách:
 * - Prompt building → prompt.ts
 * - Schema validation → schema.ts (shared)
 */

import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { generateText, Output } from "ai";
import { NextResponse } from "next/server";

import { buildSuggestionPrompt } from "./prompt";
import { suggestionRequestSchema, suggestionResponseSchema } from "./schema";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const payload = suggestionRequestSchema.parse(body);

    const prompt = buildSuggestionPrompt(payload);

    const { output } = await generateText({
      model: google(process.env.MODEL_AI!),
      output: Output.object({ schema: suggestionResponseSchema }),
      prompt,
    });

    return NextResponse.json({ suggestion: output.suggestion });
  } catch (error) {
    console.error("Suggestion error: ", error);
    return NextResponse.json(
      { error: "Failed to generate suggestion" },
      { status: 500 }
    );
  }
}
