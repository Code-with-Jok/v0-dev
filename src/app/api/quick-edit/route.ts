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

import { buildQuickEditPrompt } from "./prompt";
import { quickEditRequestSchema, quickEditResponseSchema } from "./schema";
import { scrapeUrlsFromInstruction } from "./scraper";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 400 });
    }

    const body = await request.json();
    const payload = quickEditRequestSchema.parse(body);

    const documentationContext = await scrapeUrlsFromInstruction(
      payload.instruction
    );

    const prompt = buildQuickEditPrompt({
      ...payload,
      documentationContext,
    });

    const { output } = await generateText({
      model: google(process.env.MODEL_AI!),
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
