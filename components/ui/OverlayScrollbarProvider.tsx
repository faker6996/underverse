"use client";

import { useEffect } from "react";
import { OverlayScrollbars } from "overlayscrollbars";

const EXPLICIT_SCROLLABLE_SELECTOR = [".thin-scrollbar", ".scrollbar-thin", ".custom-scrollbar", "[data-os-scrollbar]"].join(", ");

const GENERIC_SCROLLABLE_SELECTOR = [
  ".overflow-auto",
  ".overflow-x-auto",
  ".overflow-y-auto",
  ".overflow-scroll",
  ".overflow-x-scroll",
  ".overflow-y-scroll",
].join(", ");

const SCROLLBAR_OPTIONS = {
  scrollbars: {
    theme: "os-theme-underverse",
    visibility: "auto" as const,
    autoHide: "leave" as const,
    autoHideDelay: 600,
    dragScroll: true,
    clickScroll: false,
  },
};

export default function OverlayScrollbarProvider() {
  useEffect(() => {
    const bodyInstance = OverlayScrollbars(document.body, SCROLLBAR_OPTIONS);
    const instances = new Map<HTMLElement, ReturnType<typeof OverlayScrollbars>>();

    const shouldSkip = (element: HTMLElement) => {
      if (element === document.body) return true;
      if (element.hasAttribute("data-os-ignore")) return true;
      if (element.hasAttribute("data-overlayscrollbars")) return true;
      return false;
    };

    const initElement = (element: HTMLElement) => {
      if (shouldSkip(element)) return;
      if (instances.has(element)) return;
      instances.set(element, OverlayScrollbars(element, SCROLLBAR_OPTIONS));
    };

    const collectCandidates = (root: ParentNode, selector: string) => {
      const candidates: HTMLElement[] = [];

      if (root instanceof HTMLElement && root.matches(selector)) {
        candidates.push(root);
      }

      if ("querySelectorAll" in root) {
        root.querySelectorAll<HTMLElement>(selector).forEach((element) => {
          candidates.push(element);
        });
      }

      return candidates.filter((element, index) => candidates.indexOf(element) === index);
    };

    const scan = (root: ParentNode) => {
      const explicitCandidates = collectCandidates(root, EXPLICIT_SCROLLABLE_SELECTOR).filter((element) => !shouldSkip(element));
      explicitCandidates.forEach(initElement);

      const genericCandidates = collectCandidates(root, GENERIC_SCROLLABLE_SELECTOR).filter((element) => !shouldSkip(element));

      // Explicit targets (e.g. DataTable wrappers) take precedence. Skip generic
      // nodes that would overlap with them to avoid nested scrollbar instances.
      const filteredGeneric = genericCandidates.filter(
        (element) => !explicitCandidates.some((explicit) => explicit === element || explicit.contains(element) || element.contains(explicit)),
      );

      const leafGeneric = filteredGeneric.filter((element) => !filteredGeneric.some((other) => other !== element && element.contains(other)));
      leafGeneric.forEach(initElement);
    };

    const cleanup = () => {
      instances.forEach((instance, element) => {
        if (!element.isConnected) {
          instance.destroy();
          instances.delete(element);
        }
      });
    };

    scan(document.body);

    let rafId = 0;
    const observer = new MutationObserver((mutations) => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        const scanRoots = new Set<ParentNode>();

        mutations.forEach((mutation) => {
          if (mutation.target instanceof Element || mutation.target instanceof Document || mutation.target instanceof DocumentFragment) {
            scanRoots.add(mutation.target);
          }
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              scanRoots.add(node);
            }
          });
        });

        scanRoots.forEach(scan);
        cleanup();
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      observer.disconnect();
      instances.forEach((instance) => instance.destroy());
      bodyInstance.destroy();
    };
  }, []);

  return null;
}
