/**
 * keymap.ts
 * Single Responsibility: Xử lý phím tắt cho Quick Edit.
 *
 * Phím `i` khi có selection → mở Quick Edit form.
 */

import { keymap } from "@codemirror/view";

import { showQuickEditEffect } from "./state";

/**
 * Keymap: Nhấn `i` khi có text được select để mở Quick Edit.
 * - Nếu có selection → dispatch showQuickEditEffect(true)
 * - Nếu không có selection → để phím `i` hoạt động bình thường (gõ chữ)
 */
export const quickEditKeymap = keymap.of([
  {
    key: "i",
    run: (view) => {
      const selection = view.state.selection.main;
      if (selection.empty) {
        return false;
      }

      view.dispatch({
        effects: showQuickEditEffect.of(true),
      });
      return true;
    },
  },
]);
