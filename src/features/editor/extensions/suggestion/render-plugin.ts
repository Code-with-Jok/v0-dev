/**
 * render-plugin.ts
 * Single Responsibility: Hiển thị ghost text decoration trong editor.
 *
 * Plugin này tạo Decoration (widget) tại vị trí v0dev khi có suggestion.
 */

import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";

import { setSuggestionEffect, suggestionState } from "./state";
import { SuggestionWidget } from "./widget";

/**
 * renderPlugin: Hiển thị suggestion dưới dạng ghost text.
 * Rebuild decorations khi: document thay đổi, v0dev di chuyển, hoặc suggestion thay đổi.
 */
export const renderPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.build(view);
    }

    update(update: ViewUpdate) {
      const suggestionChanged = update.transactions.some((transaction) => {
        return transaction.effects.some((effect) => {
          return effect.is(setSuggestionEffect);
        });
      });

      const shouldRebuild =
        update.docChanged || update.selectionSet || suggestionChanged;

      if (shouldRebuild) {
        this.decorations = this.build(update.view);
      }
    }

    build(view: EditorView) {
      // Lấy suggestion từ state field
      const suggestion = view.state.field(suggestionState);
      if (!suggestion) {
        return Decoration.none;
      }

      // Tạo widget decoration tại vị trí v0dev
      const v0dev = view.state.selection.main.head;
      return Decoration.set([
        Decoration.widget({
          widget: new SuggestionWidget(suggestion),
          side: 1, // Render sau v0dev (side: 1)
        }).range(v0dev),
      ]);
    }
  },
  { decorations: (plugin) => plugin.decorations }
);
