import type { OverlayScrollbars as OSInstance, PartialOptions } from "overlayscrollbars";

export const DEFAULT_OVERLAY_SCROLLBAR_EXCLUDE = [
  "html",
  "body",
  "[data-os-ignore]",
  "[data-radix-portal]",
  "[role='dialog']",
  "[aria-modal='true']",
  "[data-sonner-toaster]",
].join(", ");

export interface OverlayScrollbarBehavior {
  enabled: boolean;
  theme: string;
  visibility: "visible" | "hidden" | "auto";
  autoHide: "never" | "scroll" | "leave" | "move";
  autoHideDelay: number;
  dragScroll: boolean;
  clickScroll: boolean;
  /**
   * Exclude selector list applied both on current node and ancestors.
   * `html` and `body` are always skipped even if excluded list changes.
   */
  exclude: string;
}

export const DEFAULT_OVERLAY_SCROLLBAR_BEHAVIOR: OverlayScrollbarBehavior = {
  enabled: true,
  theme: "os-theme-underverse",
  visibility: "auto",
  autoHide: "leave",
  autoHideDelay: 600,
  dragScroll: true,
  clickScroll: false,
  exclude: DEFAULT_OVERLAY_SCROLLBAR_EXCLUDE,
};

export function resolveOverlayScrollbarBehavior(overrides: Partial<OverlayScrollbarBehavior> = {}): OverlayScrollbarBehavior {
  return {
    ...DEFAULT_OVERLAY_SCROLLBAR_BEHAVIOR,
    ...overrides,
  };
}

export function buildOverlayScrollbarOptions(config: OverlayScrollbarBehavior): PartialOptions {
  return {
    scrollbars: {
      theme: config.theme,
      visibility: config.visibility,
      autoHide: config.autoHide,
      autoHideDelay: config.autoHideDelay,
      dragScroll: config.dragScroll,
      clickScroll: config.clickScroll,
    },
  };
}

type CreateInstance = (element: HTMLElement, options: PartialOptions) => OSInstance;

type IntersectionObserverLike = {
  observe(target: Element): void;
  disconnect(): void;
};

type IntersectionObserverCallbackLike = (entries: Array<{ isIntersecting?: boolean; intersectionRatio?: number }>) => void;

type CreateIntersectionObserver = (callback: IntersectionObserverCallbackLike) => IntersectionObserverLike;

interface OverlayScrollbarControllerConfig {
  element: HTMLElement;
  enabled: boolean;
  exclude?: string;
  options: PartialOptions;
  createInstance: CreateInstance;
  isVisible?: (element: HTMLElement) => boolean;
  createIntersectionObserver?: CreateIntersectionObserver;
  requestAnimationFrameImpl?: (callback: FrameRequestCallback) => number;
  cancelAnimationFrameImpl?: (id: number) => void;
}

function splitSelectorList(selectorList: string): string[] {
  return selectorList
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function safeMatches(element: HTMLElement, selector: string): boolean {
  try {
    return element.matches(selector);
  } catch {
    return false;
  }
}

function safeClosest(element: HTMLElement, selector: string): Element | null {
  try {
    return element.closest(selector);
  } catch {
    return null;
  }
}

export function shouldSkipOverlayScrollbarElement(element: HTMLElement, exclude = DEFAULT_OVERLAY_SCROLLBAR_EXCLUDE): boolean {
  if (!element) return true;

  const tagName = element.tagName?.toLowerCase?.() ?? "";
  if (tagName === "body" || tagName === "html") return true;
  if (element.classList?.contains("scrollbar-none")) return true;
  if (element.hasAttribute?.("data-os-ignore")) return true;
  if (element.hasAttribute?.("data-overlayscrollbars")) return true;

  const excludeSelectors = splitSelectorList(exclude);
  if (excludeSelectors.some((selector) => safeMatches(element, selector))) return true;

  const ancestorExcludeSelectors = excludeSelectors.filter((item) => item !== "html" && item !== "body");
  if (ancestorExcludeSelectors.some((selector) => safeClosest(element, selector))) return true;

  return false;
}

export function isOverlayScrollbarElementVisible(element: HTMLElement): boolean {
  if (!element?.isConnected) return false;

  if (typeof element.getClientRects === "function") {
    const rects = element.getClientRects();
    if (!rects || rects.length === 0) return false;
  }

  if (typeof window !== "undefined" && typeof window.getComputedStyle === "function") {
    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") return false;
  }

  return true;
}

function createDefaultIntersectionObserver(callback: IntersectionObserverCallbackLike): IntersectionObserverLike | null {
  if (typeof window === "undefined" || typeof window.IntersectionObserver !== "function") return null;

  const observer = new window.IntersectionObserver((entries) => {
    callback(
      entries.map((entry) => ({
        isIntersecting: entry.isIntersecting,
        intersectionRatio: entry.intersectionRatio,
      })),
    );
  });

  return observer;
}

export function createOverlayScrollbarController({
  element,
  enabled,
  exclude = DEFAULT_OVERLAY_SCROLLBAR_EXCLUDE,
  options,
  createInstance,
  isVisible = isOverlayScrollbarElementVisible,
  createIntersectionObserver,
  requestAnimationFrameImpl = (callback) => {
    if (typeof window === "undefined" || typeof window.requestAnimationFrame !== "function") return 0;
    return window.requestAnimationFrame(callback);
  },
  cancelAnimationFrameImpl = (id) => {
    if (typeof window === "undefined" || typeof window.cancelAnimationFrame !== "function") return;
    window.cancelAnimationFrame(id);
  },
}: OverlayScrollbarControllerConfig) {
  let instance: OSInstance | null = null;
  let observer: IntersectionObserverLike | null = null;
  let rafId = 0;

  const tryInit = () => {
    if (instance) return;
    if (!enabled) return;
    if (!element?.isConnected) return;
    if (shouldSkipOverlayScrollbarElement(element, exclude)) return;
    if (!isVisible(element)) return;

    instance = createInstance(element, options);

    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  if (enabled && !shouldSkipOverlayScrollbarElement(element, exclude)) {
    rafId = requestAnimationFrameImpl(() => {
      rafId = 0;
      tryInit();
    });

    const observerFactory = createIntersectionObserver ?? createDefaultIntersectionObserver;
    observer = observerFactory
      ? observerFactory((entries) => {
          const isIntersecting = entries.some((entry) => entry.isIntersecting || (entry.intersectionRatio ?? 0) > 0);
          if (!isIntersecting) return;
          tryInit();
        })
      : null;

    if (observer) {
      observer.observe(element);
    }
  }

  return {
    destroy() {
      if (rafId) cancelAnimationFrameImpl(rafId);
      rafId = 0;

      if (observer) {
        observer.disconnect();
        observer = null;
      }

      if (instance) {
        instance.destroy();
        instance = null;
      }
    },
    refresh() {
      tryInit();
    },
    getInstanceCount() {
      return instance ? 1 : 0;
    },
  };
}
