/**
 * state.ts
 * Single Responsibility: Quản lý trạng thái Quick Edit (bật/tắt).
 *
 * - showQuickEditEffect: "message" để toggle quick edit on/off
 * - quickEditState: StateField lưu trạng thái active/inactive
 */

import { StateEffect, StateField } from "@codemirror/state";

/**
 * StateEffect: Gửi "message" để bật/tắt quick edit.
 * - true = hiện form quick edit
 * - false = ẩn form quick edit
 */
export const showQuickEditEffect = StateEffect.define<boolean>();

/**
 * StateField: Lưu trạng thái quick edit đang active hay không.
 * Auto-reset về false khi selection trở thành empty.
 */
export const quickEditState = StateField.define<boolean>({
  create() {
    return false;
  },

  update(value, transaction) {
    for (const effect of transaction.effects) {
      if (effect.is(showQuickEditEffect)) {
        return effect.value;
      }
    }
    // Auto-close khi selection empty
    if (transaction.selection) {
      const selection = transaction.state.selection.main;
      if (selection.empty) {
        return false;
      }
    }
    return value;
  },
});
