/**
 * index.ts (Barrel file)
 * Composition Root: Kết hợp tất cả các thành phần suggestion lại.
 *
 * Mỗi thành phần có Single Responsibility riêng:
 * - state.ts      → Quản lý trạng thái suggestion
 * - widget.ts     → Hiển thị DOM element (ghost text)
 * - payload.ts    → Tạo payload từ editor context
 * - fetcher.ts    → Gọi API suggestion
 * - debounce-plugin.ts → Debounce + trigger fetch
 * - render-plugin.ts   → Render ghost text decoration
 * - accept-keymap.ts   → Tab để chấp nhận suggestion
 */

import { acceptSuggestionKeymap } from "./accept-keymap";
import { createDebouncePlugin } from "./debounce-plugin";
import { renderPlugin } from "./render-plugin";
import { suggestionState } from "./state";

/**
 * Tạo extension bundle cho AI suggestion.
 *
 * @param fileName - Tên file đang edit (gửi lên API để context)
 * @returns Array các CodeMirror extension
 */
export const suggestion = (fileName: string) => [
  suggestionState,
  createDebouncePlugin(fileName),
  renderPlugin,
  acceptSuggestionKeymap,
];
