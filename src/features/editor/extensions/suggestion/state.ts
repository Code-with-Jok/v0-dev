/**
 * state.ts
 * Single Responsibility: Quản lý trạng thái suggestion trong CodeMirror.
 *
 * - setSuggestionEffect: "message" để cập nhật suggestion
 * - suggestionState: StateField lưu trữ suggestion text hiện tại
 */

import { StateEffect, StateField } from "@codemirror/state";

/**
 * StateEffect: Một cách gửi "messages" để cập nhật state.
 * Khi muốn thay đổi suggestion, ta dispatch effect này với giá trị mới.
 */
export const setSuggestionEffect = StateEffect.define<string | null>();

/**
 * StateField: Lưu trữ suggestion state trong editor.
 * - create(): Giá trị khởi tạo khi editor load (null = không có suggestion)
 * - update(): Được gọi mỗi transaction (keystroke, etc.) để cập nhật giá trị
 */
export const suggestionState = StateField.define<string | null>({
  create() {
    return null;
  },
  update(value, transaction) {
    for (const effect of transaction.effects) {
      if (effect.is(setSuggestionEffect)) {
        return effect.value;
      }
    }
    return value;
  },
});
