/**
 * fetcher.ts
 * Single Responsibility: Gửi HTTP request tới Quick Edit API endpoint.
 *
 * Sử dụng shared schema từ @/app/api/quick-edit/schema
 * để đảm bảo type-safety end-to-end.
 */

import ky from "ky";
import { toast } from "sonner";

import {
  quickEditRequestSchema,
  quickEditResponseSchema,
  type QuickEditRequest,
  type QuickEditResponse,
} from "@/app/api/quick-edit/schema";

export const fetcher = async (
  payload: QuickEditRequest,
  signal: AbortSignal
): Promise<string | null> => {
  try {
    const validatedPayload = quickEditRequestSchema.parse(payload);

    const response = await ky
      .post("/api/quick-edit", {
        json: validatedPayload,
        signal,
        timeout: 30_000,
        retry: 0,
      })
      .json<QuickEditResponse>();

    const validatedResponse = quickEditResponseSchema.parse(response);

    return validatedResponse.editedCode || null;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return null;
    }
    toast.error("Failed to fetch AI quick edit");
    return null;
  }
};
