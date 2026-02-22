/**
 * schema.ts
 * Single Responsibility: Định nghĩa schema validation (Zod) cho AI Suggestion.
 *
 * Shared giữa server (route.ts) và client (fetcher.ts)
 * để đảm bảo type-safety end-to-end.
 */

import { z } from "zod";

export const suggestionRequestSchema = z.object({
  fileName: z.string(),
  code: z.string(),
  currentLine: z.string(),
  previousLines: z.string(),
  textBeforeV0dev: z.string(),
  textAfterV0dev: z.string(),
  nextLines: z.string(),
  lineNumber: z.number(),
});

export const suggestionResponseSchema = z.object({
  suggestion: z
    .string()
    .describe(
      "The code to insert at v0dev, or empty string if no completion needed"
    ),
});

export type SuggestionRequest = z.infer<typeof suggestionRequestSchema>;
export type SuggestionResponse = z.infer<typeof suggestionResponseSchema>;
