/**
 * selection-tooltip.ts
 * Single Responsibility: Hiển thị tooltip khi user select text trong editor.
 *
 * Tooltip chứa 2 nút: "Add to Chat" và "Quick Edit".
 * Ẩn tooltip khi Quick Edit form đang active.
 *
 * Cải thiện: editorView được capture qua closure trong selectionTooltip()
 * thay vì module-level global.
 */

import { EditorState, StateField } from "@codemirror/state";
import { EditorView, Tooltip, showTooltip } from "@codemirror/view";
import { quickEditState, showQuickEditEffect } from "./quick-edit";

/**
 * Tạo tooltip cho selection.
 * Hiển thị khi: có selection VÀ Quick Edit form KHÔNG active.
 */
const createTooltipForSelection = (
  state: EditorState,
  getView: () => EditorView | null
): readonly Tooltip[] => {
  const selection = state.selection.main;

  if (selection.empty) {
    return [];
  }

  // Ẩn tooltip khi Quick Edit form đang mở
  const isQuickEditActive = state.field(quickEditState);
  if (isQuickEditActive) {
    return [];
  }

  return [
    {
      pos: selection.to,
      above: false,
      strictSide: false,
      create() {
        const dom = document.createElement("div");
        dom.className =
          "bg-popover text-popover-foreground z-50 rounded-sm border border-input p-1 shadow-md flex items-center gap-2 text-sm";

        // TODO: Wire up to real chat handler when implemented
        const addToChatButton = document.createElement("button");
        addToChatButton.textContent = "Add to Chat";
        addToChatButton.className =
          "font-sans p-1 px-2 hover:bg-foreground/10 rounded-sm opacity-50 cursor-not-allowed";
        addToChatButton.disabled = true;

        const quickEditButton = document.createElement("button");
        quickEditButton.className =
          "font-sans p-1 px-2 hover:bg-foreground/10 rounded-sm flex items-center gap-1";

        const quickEditButtonText = document.createElement("span");
        quickEditButtonText.textContent = "Quick Edit";

        const quickEditButtonShortcut = document.createElement("span");
        quickEditButtonShortcut.textContent = "⌘I";
        quickEditButtonShortcut.className = "text-sm opacity-60";

        quickEditButton.appendChild(quickEditButtonText);
        quickEditButton.appendChild(quickEditButtonShortcut);

        quickEditButton.onclick = () => {
          const view = getView();
          if (view) {
            view.dispatch({
              effects: showQuickEditEffect.of(true),
            });
          }
        };

        dom.appendChild(addToChatButton);
        dom.appendChild(quickEditButton);

        return { dom };
      },
    },
  ];
};

/**
 * Tạo extension bundle cho Selection Tooltip.
 *
 * Sử dụng closure để capture editorView reference,
 * tránh module-level mutable state.
 */
export const selectionTooltip = () => {
  let capturedView: EditorView | null = null;
  const getView = () => capturedView;

  const selectionTooltipField = StateField.define<readonly Tooltip[]>({
    create(state) {
      return createTooltipForSelection(state, getView);
    },

    update(tooltips, transaction) {
      if (transaction.docChanged || transaction.selection) {
        return createTooltipForSelection(transaction.state, getView);
      }
      for (const effect of transaction.effects) {
        if (effect.is(showQuickEditEffect)) {
          return createTooltipForSelection(transaction.state, getView);
        }
      }
      return tooltips;
    },

    provide: (field) =>
      showTooltip.computeN([field], (state) => state.field(field)),
  });

  return [
    selectionTooltipField,
    EditorView.updateListener.of((update) => {
      capturedView = update.view;
    }),
  ];
};
