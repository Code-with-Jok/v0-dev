/**
 * widget.ts
 * Single Responsibility: Tạo DOM element hiển thị ghost text (suggestion).
 *
 * WidgetType cho phép tạo custom DOM elements trong CodeMirror editor.
 */

import { WidgetType } from "@codemirror/view";

/**
 * SuggestionWidget: Hiển thị text gợi ý dưới dạng "ghost text" (chữ mờ).
 * toDOM() được CodeMirror gọi để tạo element HTML thực tế.
 */
export class SuggestionWidget extends WidgetType {
  constructor(readonly text: string) {
    super();
  }

  toDOM() {
    const span = document.createElement("span");
    span.textContent = this.text;
    span.style.opacity = "0.4";
    span.style.pointerEvents = "none";
    return span;
  }
}
