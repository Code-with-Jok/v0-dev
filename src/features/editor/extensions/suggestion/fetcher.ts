/**
 * fetcher.ts
 * Single Responsibility: Gửi HTTP request tới API suggestion endpoint.
 *
 * Sử dụng shared schema từ @/app/api/suggestion/schema
 * để đảm bảo type-safety end-to-end.
 */

import ky from "ky";
import { toast } from "sonner";

import {
  suggestionRequestSchema,
  suggestionResponseSchema,
  type SuggestionRequest,
  type SuggestionResponse,
} from "@/app/api/suggestion/schema";

export const fetcher = async (
  payload: SuggestionRequest,
  signal: AbortSignal
): Promise<string | null> => {
  try {
    const validatedPayload = suggestionRequestSchema.parse(payload);

    const response = await ky
      .post("/api/suggestion", {
        json: validatedPayload,
        signal,
        timeout: 10_000,
        retry: 0,
      })
      .json<SuggestionResponse>();

    const validatedResponse = suggestionResponseSchema.parse(response);

    return validatedResponse.suggestion || null;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return null;
    }
    toast.error("Failed to fetch AI completion");
    return null;
  }
};
