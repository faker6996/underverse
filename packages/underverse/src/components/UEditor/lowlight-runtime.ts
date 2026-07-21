import { common, createLowlight } from "lowlight";

/** Loads Highlight.js and the common grammar registry only when code exists. */
export function createCommonLowlightRuntime() {
  return createLowlight(common);
}
