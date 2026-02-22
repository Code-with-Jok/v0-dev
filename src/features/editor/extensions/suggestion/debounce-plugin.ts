/**
 * debounce-plugin.ts
 * Single Responsibility: Quản lý debounce và trigger fetch suggestion.
 *
 * Cải thiện so với code cũ:
 * - Mutable state (debounceTimer, abortController) nằm trong class instance
 *   thay vì module-level → tránh side effects khi có nhiều editor instances.
 */

import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";

import { fetcher } from "./fetcher";
import { generatePayload } from "./payload";
import { setSuggestionEffect } from "./state";

const DEBOUNCE_DELAY = 300;

/**
 * Tạo plugin debounce cho suggestion.
 * Plugin này lắng nghe thay đổi trong editor và trigger fetch suggestion
 * sau khoảng debounce delay.
 *
 * @param fileName - Tên file đang edit (gửi lên API để context)
 */
export const createDebouncePlugin = (fileName: string) => {
  return ViewPlugin.fromClass(
    class {
      private debounceTimer: number | null = null;
      private abortController: AbortController | null = null;
      isWaitingForSuggestion = false;

      constructor(view: EditorView) {
        this.triggerSuggestion(view);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.selectionSet) {
          this.triggerSuggestion(update.view);
        }
      }

      triggerSuggestion(view: EditorView) {
        if (this.debounceTimer !== null) {
          clearTimeout(this.debounceTimer);
        }

        if (this.abortController !== null) {
          this.abortController.abort();
        }

        this.isWaitingForSuggestion = true;

        this.debounceTimer = window.setTimeout(async () => {
          const payload = generatePayload(view, fileName);
          if (!payload) {
            this.isWaitingForSuggestion = false;
            view.dispatch({ effects: setSuggestionEffect.of(null) });
            return;
          }

          this.abortController = new AbortController();
          const suggestion = await fetcher(
            payload,
            this.abortController.signal
          );

          this.isWaitingForSuggestion = false;
          view.dispatch({
            effects: setSuggestionEffect.of(suggestion),
          });
        }, DEBOUNCE_DELAY);
      }

      destroy() {
        if (this.debounceTimer !== null) {
          clearTimeout(this.debounceTimer);
        }

        if (this.abortController !== null) {
          this.abortController.abort();
        }
      }
    }
  );
};
