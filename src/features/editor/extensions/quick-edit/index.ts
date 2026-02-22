/**
 * index.ts (Barrel file)
 * Composition Root: Kết hợp tất cả các thành phần Quick Edit.
 *
 * Mỗi thành phần có Single Responsibility riêng:
 * - state.ts    → Quản lý trạng thái bật/tắt
 * - tooltip.ts  → Tạo form UI (DOM)
 * - keymap.ts   → Phím tắt `i`
 * - fetcher.ts  → Gọi API quick edit
 *
 * Exports `quickEditState` và `showQuickEditEffect`
 * cho selection-tooltip.ts sử dụng.
 */

import { EditorView } from "@codemirror/view";

import { quickEditKeymap } from "./keymap";
import { quickEditState, showQuickEditEffect } from "./state";
import { createQuickEditTooltipField } from "./tooltip";

// Re-export cho selection-tooltip.ts sử dụng
export { quickEditState, showQuickEditEffect };

/**
 * Tạo extension bundle cho Quick Edit.
 *
 * Sử dụng closure để capture editorView reference,
 * tránh module-level mutable state.
 */
export const quickEdit = () => {
  let capturedView: EditorView | null = null;
  const getView = () => capturedView;

  return [
    quickEditState,
    createQuickEditTooltipField(getView),
    quickEditKeymap,
    EditorView.updateListener.of((update) => {
      capturedView = update.view;
    }),
  ];
};
