/**
 * prompt.ts
 * Single Responsibility: Xây dựng prompt cho Quick Edit AI.
 *
 * Open/Closed: Có thể mở rộng template bằng cách thêm placeholder mới
 * mà không cần sửa logic buildQuickEditPrompt.
 */

import type { QuickEditRequest } from "./schema";

const QUICK_EDIT_TEMPLATE = `You are a code editing assistant. Edit the selected code based on the user's instruction.

<context>
<selected_code>
{selectedCode}
</selected_code>
<full_code_context>
{fullCode}
</full_code_context>
</context>

{documentation}

<instruction>
{instruction}
</instruction>

<instructions>
Return ONLY the edited version of the selected code.
Maintain the same indentation level as the original.
Do not include any explanations or comments unless requested.
If the instruction is unclear or cannot be applied, return the original code unchanged.
</instructions>`;

interface BuildPromptParams extends QuickEditRequest {
  documentationContext: string;
}

export const buildQuickEditPrompt = (params: BuildPromptParams): string => {
  return QUICK_EDIT_TEMPLATE.replace("{selectedCode}", params.selectedCode)
    .replace("{fullCode}", params.fullCode || "")
    .replace("{instruction}", params.instruction)
    .replace("{documentation}", params.documentationContext);
};
