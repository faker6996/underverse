import type { OverlayScrollbars as OSInstance, PartialOptions } from "overlayscrollbars";

export const DEFAULT_OVERLAY_SCROLLBAR_SELECTOR = [
  ".overflow-auto",
  ".overflow-y-auto",
  ".overflow-x-auto",
  ".overflow-scroll",
  ".overflow-y-scroll",
  ".overflow-x-scroll",
  "textarea",
  "[data-os-scrollbar]",
].join(", ");
export const DEFAULT_OVERLAY_SCROLLBAR_EXCLUDE = [
  "html",
  "body",
  "[data-os-ignore]",
  "[data-radix-portal]",
  "[role='dialog']",
  "[aria-modal='true']",
  "[data-sonner-toaster]",
].join(", ");

type CreateInstance = (element: HTMLElement, options: PartialOptions) => OSInstance;
type ObserverLike = {
  observe(target: ParentNode, options: MutationObserverInit): void;
  disconnect(): void;
};

interface OverlayScrollbarControllerConfig {
  selector: string;
  exclude: string;
  options: PartialOptions;
  createInstance: CreateInstance;
  root?: ParentNode | HTMLElement;
  createObserver?: (callback: MutationCallback) => ObserverLike;
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

function shouldSkipElement(element: HTMLElement, excludeSelectors: string[], ancestorExcludeSelectors: string[]) {
  const tagName = element.tagName?.toLowerCase?.() ?? "";
  if (tagName === "body" || tagName === "html") return true;
  if (element.classList.contains("scrollbar-none")) return true;
  if (element.hasAttribute("data-overlayscrollbars")) return true;

  if (excludeSelectors.some((selector) => safeMatches(element, selector))) return true;
  if (ancestorExcludeSelectors.some((selector) => safeClosest(element, selector))) return true;

  return false;
}

export function createOverlayScrollbarController({
  selector,
  exclude,
  options,
  createInstance,
  root = document.body,
  createObserver,
  requestAnimationFrameImpl = requestAnimationFrame,
  cancelAnimationFrameImpl = cancelAnimationFrame,
}: OverlayScrollbarControllerConfig) {
  const instances = new Map<HTMLElement, OSInstance>();
  const excludeSelectors = splitSelectorList(exclude);
  const ancestorExcludeSelectors = excludeSelectors.filter((item) => item !== "html" && item !== "body");
  let rafId = 0;

  const init = (element: HTMLElement) => {
    if (shouldSkipElement(element, excludeSelectors, ancestorExcludeSelectors)) return;
    if (instances.has(element)) return;
    instances.set(element, createInstance(element, options));
  };

  const scan = (root: ParentNode | HTMLElement) => {
    if (root instanceof HTMLElement && safeMatches(root, selector)) {
      init(root);
    }

    if (!("querySelectorAll" in root)) return;

    try {
      root.querySelectorAll<HTMLElement>(selector).forEach(init);
    } catch {
      // Invalid selector should not break the app.
    }
  };

  const cleanup = () => {
    instances.forEach((instance, element) => {
      if (!element.isConnected) {
        instance.destroy();
        instances.delete(element);
      }
    });
  };

  scan(root);

  const onMutations: MutationCallback = (mutations) => {
    if (rafId) return;

    rafId = requestAnimationFrameImpl(() => {
      rafId = 0;
      const roots = new Set<ParentNode | HTMLElement>();

      mutations.forEach((mutation) => {
        if (mutation.target && (typeof (mutation.target as ParentNode).querySelectorAll === "function" || mutation.target instanceof HTMLElement)) {
          roots.add(mutation.target);
        }

        Array.from(mutation.addedNodes).forEach((node) => {
          if (node instanceof HTMLElement) {
            roots.add(node);
          }
        });
      });

      roots.forEach(scan);
      cleanup();
    });
  };

  const observer = createObserver ? createObserver(onMutations) : new MutationObserver(onMutations);

  observer.observe(root, { childList: true, subtree: true, attributes: true });

  const destroy = () => {
    if (rafId) cancelAnimationFrameImpl(rafId);
    observer.disconnect();
    instances.forEach((instance) => instance.destroy());
    instances.clear();
  };

  return {
    destroy,
    scan,
    cleanup,
    getInstanceCount: () => instances.size,
  };
}
