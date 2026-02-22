/**
 * tooltip.ts
 * Single Responsibility: Tạo tooltip UI cho Quick Edit form.
 *
 * Chứa logic tạo DOM elements (form, input, buttons)
 * và xử lý submit/cancel actions.
 */

import { EditorState, StateField } from "@codemirror/state";
import { EditorView, Tooltip, showTooltip } from "@codemirror/view";

import { fetcher } from "./fetcher";
import { quickEditState, showQuickEditEffect } from "./state";

/**
 * Tạo tooltip chứa form Quick Edit.
 * Chỉ hiển thị khi: có selection VÀ quickEditState = true.
 */
const createQuickEditTooltip = (
  state: EditorState,
  getView: () => EditorView | null
): readonly Tooltip[] => {
  const selection = state.selection.main;

  if (selection.empty) {
    return [];
  }

  const isQuickEditActive = state.field(quickEditState);
  if (!isQuickEditActive) {
    return [];
  }

  let currentAbortController: AbortController | null = null;

  return [
    {
      pos: selection.to,
      above: false,
      strictSide: false,
      create() {
        const dom = document.createElement("div");
        dom.className =
          "bg-popover text-popover-foreground z-50 rounded-sm border border-input p-2 shadow-md flex flex-col gap-2 text-sm";

        const form = document.createElement("form");
        form.className = "flex flex-col gap-2";

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Edit selected code";
        input.className =
          "bg-transparent border-none outline-none px-2 py-1 font-sans w-100";
        input.autofocus = true;

        const buttonContainer = document.createElement("div");
        buttonContainer.className = "flex items-center justify-between gap-2";

        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.textContent = "Cancel";
        cancelButton.className =
          "font-sans p-1 px-2 text-muted-foreground hover:text-foreground hover:bg-foreground/10 rounded-sm";
        cancelButton.onclick = () => {
          if (currentAbortController) {
            currentAbortController.abort();
            currentAbortController = null;
          }
          const view = getView();
          if (view) {
            view.dispatch({
              effects: showQuickEditEffect.of(false),
            });
          }
        };

        const submitButton = document.createElement("button");
        submitButton.type = "submit";
        submitButton.textContent = "Submit";
        submitButton.className =
          "font-sans p-1 px-2 text-muted-foreground hover:text-foreground hover:bg-foreground/10 rounded-sm";

        form.onsubmit = async (e) => {
          e.preventDefault();

          const view = getView();
          if (!view) return;

          const instruction = input.value.trim();
          if (!instruction) return;

          const sel = view.state.selection.main;
          const selectedCode = view.state.doc.sliceString(sel.from, sel.to);
          const fullCode = view.state.doc.toString();

          submitButton.disabled = true;
          submitButton.textContent = "Editing...";

          currentAbortController = new AbortController();
          const editedCode = await fetcher(
            { selectedCode, fullCode, instruction },
            currentAbortController.signal
          );

          if (editedCode) {
            view.dispatch({
              changes: {
                from: sel.from,
                to: sel.to,
                insert: editedCode,
              },
              selection: { anchor: sel.from + editedCode.length },
              effects: showQuickEditEffect.of(false),
            });
          } else {
            submitButton.disabled = false;
            submitButton.textContent = "Submit";
          }

          currentAbortController = null;
        };

        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(submitButton);

        form.appendChild(input);
        form.appendChild(buttonContainer);

        dom.appendChild(form);

        setTimeout(() => {
          input.focus();
        }, 0);

        return { dom };
      },
    },
  ];
};

/**
 * Tạo tooltip field cho Quick Edit.
 * Nhận getView callback để tránh module-level mutable state.
 */
export const createQuickEditTooltipField = (
  getView: () => EditorView | null
) => {
  return StateField.define<readonly Tooltip[]>({
    create(state) {
      return createQuickEditTooltip(state, getView);
    },

    update(tooltips, transaction) {
      if (transaction.docChanged || transaction.selection) {
        return createQuickEditTooltip(transaction.state, getView);
      }
      for (const effect of transaction.effects) {
        if (effect.is(showQuickEditEffect)) {
          return createQuickEditTooltip(transaction.state, getView);
        }
      }
      return tooltips;
    },

    provide: (field) =>
      showTooltip.computeN([field], (state) => state.field(field)),
  });
};
