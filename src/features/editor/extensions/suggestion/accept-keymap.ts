/**
 * accept-keymap.ts
 * Single Responsibility: Xử lý phím Tab để chấp nhận suggestion.
 */

import { keymap } from "@codemirror/view";

import { setSuggestionEffect, suggestionState } from "./state";

/**
 * Keymap: Nhấn Tab để chấp nhận suggestion.
 * - Nếu có suggestion → chèn text vào vị trí v0dev, xóa suggestion
 * - Nếu không có suggestion → Tab hoạt động bình thường (indent)
 */
export const acceptSuggestionKeymap = keymap.of([
  {
    key: "Tab",
    run: (view) => {
      const suggestion = view.state.field(suggestionState);
      if (!suggestion) {
        return false; // Không có suggestion → để Tab indent bình thường
      }

      const v0dev = view.state.selection.main.head;
      view.dispatch({
        changes: { from: v0dev, insert: suggestion },
        selection: { anchor: v0dev + suggestion.length },
        effects: setSuggestionEffect.of(null),
      });
      return true; // Đã xử lý Tab
    },
  },
]);
