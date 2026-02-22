/**
 * payload.ts
 * Single Responsibility: Trích xuất dữ liệu context từ editor view
 * để gửi lên API suggestion.
 *
 * Tách riêng để dễ test và tái sử dụng.
 */

import { EditorView } from "@codemirror/view";

import type { SuggestionRequest } from "@/app/api/suggestion/schema";

/**
 * Trích xuất thông tin context từ editor view hiện tại.
 *
 * @param view - EditorView instance của CodeMirror
 * @param fileName - Tên file đang edit
 * @returns SuggestionRequest payload hoặc null nếu code rỗng
 */
export const generatePayload = (
  view: EditorView,
  fileName: string
): SuggestionRequest | null => {
  const code = view.state.doc.toString();
  if (!code || code.trim().length === 0) return null;

  const v0devPosition = view.state.selection.main.head;
  const currentLine = view.state.doc.lineAt(v0devPosition);
  const v0devInLine = v0devPosition - currentLine.from;

  // Lấy tối đa 5 dòng phía trước v0dev
  const previousLines: string[] = [];
  const previousLinesToFetch = Math.min(5, currentLine.number - 1);
  for (let i = previousLinesToFetch; i >= 1; i--) {
    previousLines.push(view.state.doc.line(currentLine.number - i).text);
  }

  // Lấy tối đa 5 dòng phía sau v0dev
  const nextLines: string[] = [];
  const totalLines = view.state.doc.lines;
  const linesToFetch = Math.min(5, totalLines - currentLine.number);
  for (let i = 1; i <= linesToFetch; i++) {
    nextLines.push(view.state.doc.line(currentLine.number + i).text);
  }

  return {
    fileName,
    code,
    currentLine: currentLine.text,
    previousLines: previousLines.join("\n"),
    textBeforeV0dev: currentLine.text.slice(0, v0devInLine),
    textAfterV0dev: currentLine.text.slice(v0devInLine),
    nextLines: nextLines.join("\n"),
    lineNumber: currentLine.number,
  };
};
