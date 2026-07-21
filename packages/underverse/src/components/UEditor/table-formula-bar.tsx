"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { AlertCircle, Check, Hash, Sigma, Trash2 } from "lucide-react";
import { useSmartTranslations } from "../../hooks/useSmartTranslations";
import {
  clearSelectedTableCellFormula,
  convertSelectedTableCellFormulaToValue,
  getSelectedTableFormulaCell,
  normalizeFormulaInput,
  setSelectedTableCellFormula,
} from "./table-formula-commands";
import { resolveEventElement } from "./table-dom-utils";

type FormulaDraftState = {
  cellKey: string;
  sourceFormula: string;
  value: string;
};

export function TableFormulaBar({ editor }: { editor: Editor }) {
  const t = useSmartTranslations("UEditor");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [draftState, setDraftState] = useState<FormulaDraftState | null>(null);
  const selectedFormulaState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      const cell = getSelectedTableFormulaCell(currentEditor);
      if (!cell) return null;

      return {
        cellPos: cell.cellPos,
        column: cell.column,
        computedValue: cell.computedValue,
        formula: cell.formula,
        formulaState: cell.formulaState,
        label: cell.label,
        row: cell.row,
        tablePos: cell.tablePos,
      };
    },
  });
  const selectedCell = selectedFormulaState ? getSelectedTableFormulaCell(editor) : null;

  useEffect(() => {
    const focusFormulaInput = () => {
      inputRef.current?.focus();
    };
    const handleDoubleClick = (event: MouseEvent) => {
      const target = resolveEventElement(event.target);
      if (!target?.closest?.("td[data-formula],th[data-formula]")) return;
      event.preventDefault();
      focusFormulaInput();
    };

    editor.view.dom.addEventListener("dblclick", handleDoubleClick);
    return () => {
      editor.view.dom.removeEventListener("dblclick", handleDoubleClick);
    };
  }, [editor]);

  if (!selectedCell) return null;

  const selectedCellKey = `${selectedCell.tablePos}:${selectedCell.row}:${selectedCell.column}`;
  const draft =
    draftState?.cellKey === selectedCellKey && draftState.sourceFormula === selectedCell.formula
      ? draftState.value
      : selectedCell.formula;
  const setDraft = (value: string) => {
    setDraftState({
      cellKey: selectedCellKey,
      sourceFormula: selectedCell.formula,
      value,
    });
  };
  const applyDraft = () => {
    const normalized = normalizeFormulaInput(draft);
    if (normalized) {
      setSelectedTableCellFormula(editor, normalized);
    } else {
      clearSelectedTableCellFormula(editor);
    }
    setDraftState(null);
  };
  const cancelDraft = () => {
    setDraftState(null);
    window.setTimeout(() => {
      if (!editor.isDestroyed) editor.commands.focus();
    }, 0);
  };

  return (
    <div
      data-ueditor-formula-bar=""
      role="toolbar"
      aria-label={t("tableMenu.formulaBar")}
      className="flex min-h-10 items-center gap-2 border-b border-border/60 bg-muted/25 px-2 py-1.5"
    >
      <span
        data-ueditor-formula-cell-label=""
        className="flex h-7 min-w-12 items-center justify-center rounded-md border border-border/60 bg-background px-2 font-mono text-xs font-semibold text-foreground"
      >
        {selectedCell.label}
      </span>
      <Sigma aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
      <input
        ref={inputRef}
        data-ueditor-formula-input=""
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          event.stopPropagation();
          if (event.key === "Enter") {
            event.preventDefault();
            applyDraft();
          } else if (event.key === "Escape") {
            event.preventDefault();
            cancelDraft();
          }
        }}
        aria-label={t("tableMenu.editFormula")}
        className="h-7 min-w-0 flex-1 rounded-md border border-border/60 bg-background px-2 font-mono text-sm text-foreground outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
      />
      {selectedCell.formulaState === "error" && (
        <span
          role="status"
          className="hidden shrink-0 items-center gap-1 text-xs font-medium text-destructive sm:inline-flex"
        >
          <AlertCircle aria-hidden="true" className="h-3.5 w-3.5" />
          {t("tableMenu.formulaError")}
        </span>
      )}
      <button
        type="button"
        onClick={applyDraft}
        aria-label={t("tableMenu.apply")}
        title={t("tableMenu.apply")}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Check aria-hidden="true" className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => {
          convertSelectedTableCellFormulaToValue(editor);
          setDraftState(null);
        }}
        aria-label={t("tableMenu.convertToValue")}
        title={t("tableMenu.convertToValue")}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Hash aria-hidden="true" className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => {
          clearSelectedTableCellFormula(editor);
          setDraftState(null);
        }}
        aria-label={t("tableMenu.clearCell")}
        title={t("tableMenu.clearCell")}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-destructive/30 bg-background text-destructive transition-colors hover:bg-destructive/10"
      >
        <Trash2 aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}
