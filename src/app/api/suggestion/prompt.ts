/**
 * prompt.ts
 * Single Responsibility: Chỉ chịu trách nhiệm xây dựng prompt cho AI suggestion.
 *
 * Open/Closed: Có thể mở rộng template bằng cách thêm placeholder mới
 * mà không cần sửa logic buildSuggestionPrompt.
 */

import type { SuggestionRequest } from "./schema";

const SUGGESTION_TEMPLATE = `You are a code suggestion assistant.

<context>
<file_name>{fileName}</file_name>
<previous_lines>
{previousLines}
</previous_lines>
<current_line number="{lineNumber}">{currentLine}</current_line>
<before_v0dev>{textBeforeV0dev}</before_v0dev>
<after_v0dev>{textAfterV0dev}</after_v0dev>
<next_lines>
{nextLines}
</next_lines>
<full_code>
{code}
</full_code>
</context>

<instructions>
Follow these steps IN ORDER:

1. First, look at next_lines. If next_lines contains ANY code, check if it continues from where the v0dev is. If it does, return empty string immediately - the code is already written.

2. Check if before_v0dev ends with a complete statement (;, }, )). If yes, return empty string.

3. Only if steps 1 and 2 don't apply: suggest what should be typed at the v0dev position, using context from full_code.

Your suggestion is inserted immediately after the v0dev, so never suggest code that's already in the file.
</instructions>`;

export const buildSuggestionPrompt = (params: SuggestionRequest): string => {
  const replacements: Record<string, string> = {
    fileName: params.fileName,
    code: params.code,
    currentLine: params.currentLine,
    previousLines: params.previousLines || "",
    textBeforeV0dev: params.textBeforeV0dev,
    textAfterV0dev: params.textAfterV0dev,
    nextLines: params.nextLines || "",
    lineNumber: params.lineNumber.toString(),
  };

  return SUGGESTION_TEMPLATE.replace(
    /\{(fileName|code|currentLine|previousLines|textBeforeV0dev|textAfterV0dev|nextLines|lineNumber)\}/g,
    (_, key: string) => replacements[key] ?? ""
  );
};
