/**
 * route.ts
 * Single Responsibility: Xử lý HTTP request cho Quick Edit endpoint.
 *
 * Đã tách:
 * - Schema validation → schema.ts (shared)
 * - Prompt building → prompt.ts
 * - URL scraping → scraper.ts
 */

import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { buildQuickEditPrompt } from "./prompt";
import { quickEditRequestSchema, quickEditResponseSchema } from "./schema";
import { scrapeUrlsFromInstruction } from "./scraper";

const MODEL_AI = process.env.MODEL_AI;
if (!MODEL_AI) {
  throw new Error("Missing MODEL_AI environment variable");
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      payload = quickEditRequestSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: "Invalid request", details: error.issues },
          { status: 400 }
        );
      }
      throw error;
    }

    const documentationContext = await scrapeUrlsFromInstruction(
      payload.instruction
    );

    const prompt = buildQuickEditPrompt({
      ...payload,
      documentationContext,
    });

    const { output } = await generateText({
      model: google(MODEL_AI as Parameters<typeof google>[0]),
      output: Output.object({ schema: quickEditResponseSchema }),
      prompt,
    });

    return NextResponse.json({ editedCode: output.editedCode });
  } catch (error) {
    console.error("Edit error:", error);
    return NextResponse.json(
      { error: "Failed to generate edit" },
      { status: 500 }
    );
  }
}
