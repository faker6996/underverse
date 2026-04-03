"use client";

import tippyModule, { type Instance as TippyInstance } from "tippy.js";

type TippyFn = typeof import("tippy.js")["default"];

const maybeNestedDefault = tippyModule as unknown as { default?: unknown };
const unsupportedTippyModule = (() => {
  throw new TypeError("tippy.js did not resolve to a callable function");
}) as unknown as TippyFn;

export const tippy: TippyFn =
  typeof tippyModule === "function"
    ? tippyModule
    : typeof maybeNestedDefault.default === "function"
      ? (maybeNestedDefault.default as TippyFn)
      : unsupportedTippyModule;

export function getFirstTippyInstance(instances?: TippyInstance[]) {
  return instances?.[0];
}

export function hideTippyInstance(instance?: TippyInstance) {
  if (!instance || instance.state.isDestroyed) return;
  instance.hide();
}

export function destroyTippyInstance(instance?: TippyInstance) {
  if (!instance || instance.state.isDestroyed) return;
  instance.destroy();
}

export type { TippyInstance };
