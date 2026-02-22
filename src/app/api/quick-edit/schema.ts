/**
 * schema.ts
 * Single Responsibility: Định nghĩa schema validation (Zod) cho Quick Edit.
 *
 * Shared giữa server (route.ts) và client (fetcher.ts)
 * để đảm bảo type-safety end-to-end.
 */

import { z } from "zod";

export const quickEditRequestSchema = z.object({
  selectedCode: z.string(),
  fullCode: z.string(),
  instruction: z.string(),
});

export const quickEditResponseSchema = z.object({
  editedCode: z
    .string()
    .describe(
      "The edited version of the selected code based on the instruction"
    ),
});

export type QuickEditRequest = z.infer<typeof quickEditRequestSchema>;
export type QuickEditResponse = z.infer<typeof quickEditResponseSchema>;
