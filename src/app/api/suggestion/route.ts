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
import { ZodError } from "zod";

import { buildSuggestionPrompt } from "./prompt";
import { suggestionRequestSchema, suggestionResponseSchema } from "./schema";

const MODEL_AI = process.env.MODEL_AI;
if (!MODEL_AI) {
  throw new Error("Missing MODEL_AI environment variable");
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    let payload;
    try {
      payload = suggestionRequestSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: "Invalid request", details: error.issues },
          { status: 400 }
        );
      }
      throw error;
    }

    const prompt = buildSuggestionPrompt(payload);

    const { output } = await generateText({
      model: google(MODEL_AI as Parameters<typeof google>[0]),
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
