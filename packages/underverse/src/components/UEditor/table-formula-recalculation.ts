import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import {
  createActiveTableFormulaRecalculationTransaction,
  UEDITOR_TABLE_FORMULA_RECALCULATE_META,
} from "./table-formula-commands";

export const TableFormulaRecalculation = Extension.create({
  name: "tableFormulaRecalculation",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction: (transactions, _oldState, newState) => {
          if (!transactions.some((transaction) => transaction.docChanged)) return null;
          if (transactions.some((transaction) => transaction.getMeta(UEDITOR_TABLE_FORMULA_RECALCULATE_META))) {
            return null;
          }

          return createActiveTableFormulaRecalculationTransaction(newState);
        },
      }),
    ];
  },
});
