import * as React from "react";

export function chainEventHandlers<EventType>(
  ...handlers: Array<((event: EventType) => void) | undefined>
) {
  return (event: EventType) => {
    handlers.forEach((handler) => handler?.(event));
  };
}

export function setRefValue<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  (ref as React.MutableRefObject<T | null>).current = value;
}

export function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (value: T | null) => {
    refs.forEach((ref) => setRefValue(ref, value));
  };
}
