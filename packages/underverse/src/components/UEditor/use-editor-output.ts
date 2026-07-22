"use client";

import * as React from "react";
import type { Editor } from "@tiptap/core";

type UEditorOutputCallbacks = {
  onChange?: (content: string) => void;
  onHtmlChange?: (html: string) => void;
  onJsonChange?: (json: object) => void;
};

function normalizeDebounceMs(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : 0;
}

export function useUEditorOutput({
  onChange,
  onHtmlChange,
  onJsonChange,
  outputDebounceMs,
}: UEditorOutputCallbacks & { outputDebounceMs?: number }) {
  const callbacksRef = React.useRef<UEditorOutputCallbacks>({});
  const pendingEditorRef = React.useRef<Editor | null>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceMs = normalizeDebounceMs(outputDebounceMs);

  // Event callbacks can fire between render and effects. Keep the ref current
  // during render so a queued emission never calls an obsolete subscriber.
  callbacksRef.current = { onChange, onHtmlChange, onJsonChange };

  const flushOutputUpdates = React.useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const editor = pendingEditorRef.current;
    pendingEditorRef.current = null;
    if (!editor || editor.isDestroyed) return;

    const callbacks = callbacksRef.current;
    if (callbacks.onChange || callbacks.onHtmlChange) {
      const html = editor.getHTML();
      callbacks.onChange?.(html);
      callbacks.onHtmlChange?.(html);
    }
    if (callbacks.onJsonChange) {
      callbacks.onJsonChange(editor.getJSON());
    }
  }, []);

  const scheduleOutputUpdate = React.useCallback((editor: Editor) => {
    const callbacks = callbacksRef.current;
    if (!callbacks.onChange && !callbacks.onHtmlChange && !callbacks.onJsonChange) return;

    pendingEditorRef.current = editor;
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (debounceMs === 0) {
      flushOutputUpdates();
      return;
    }

    timeoutRef.current = setTimeout(flushOutputUpdates, debounceMs);
  }, [debounceMs, flushOutputUpdates]);

  React.useEffect(() => {
    if (!pendingEditorRef.current || timeoutRef.current === null) return;

    clearTimeout(timeoutRef.current);
    timeoutRef.current = debounceMs === 0
      ? null
      : setTimeout(flushOutputUpdates, debounceMs);
    if (debounceMs === 0) flushOutputUpdates();
  }, [debounceMs, flushOutputUpdates]);

  React.useEffect(() => () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    pendingEditorRef.current = null;
  }, []);

  return {
    flushOutputUpdates,
    scheduleOutputUpdate,
  };
}

