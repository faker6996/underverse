"use client";

import { useEffect } from "react";
import { OverlayScrollbars, type OverlayScrollbars as OSInstance, type PartialOptions } from "overlayscrollbars";

const SCROLLABLE_SELECTOR = "[data-os-scrollbar]";

const PORTAL_EXCLUDE_SELECTOR = [
  "[data-radix-portal]",
  "[role='dialog']",
  "[aria-modal='true']",
  "[data-sonner-toaster]",
].join(", ");

export interface OverlayScrollbarProviderProps {
  enabled?: boolean;
  theme?: string;
  visibility?: "visible" | "hidden" | "auto";
  autoHide?: "never" | "scroll" | "leave" | "move";
  autoHideDelay?: number;
  dragScroll?: boolean;
  clickScroll?: boolean;
}

function shouldSkip(element: HTMLElement) {
  if (element === document.body || element === document.documentElement) return true;
  if (element.classList.contains("scrollbar-none")) return true;
  if (element.hasAttribute("data-os-ignore")) return true;
  if (element.hasAttribute("data-overlayscrollbars")) return true;
  if (element.closest(PORTAL_EXCLUDE_SELECTOR)) return true;
  return false;
}

export function OverlayScrollbarProvider({
  enabled = true,
  theme = "os-theme-underverse",
  visibility = "auto",
  autoHide = "leave",
  autoHideDelay = 600,
  dragScroll = true,
  clickScroll = false,
}: OverlayScrollbarProviderProps = {}) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!enabled) return;

    const options: PartialOptions = {
      scrollbars: {
        theme,
        visibility,
        autoHide,
        autoHideDelay,
        dragScroll,
        clickScroll,
      },
    };

    const instances = new Map<HTMLElement, OSInstance>();
    let rafId = 0;

    const init = (element: HTMLElement) => {
      if (shouldSkip(element)) return;
      if (instances.has(element)) return;
      instances.set(element, OverlayScrollbars(element, options));
    };

    const scan = (root: ParentNode | HTMLElement) => {
      if (root instanceof HTMLElement && root.matches(SCROLLABLE_SELECTOR)) {
        init(root);
      }
      if (!("querySelectorAll" in root)) return;
      root.querySelectorAll<HTMLElement>(SCROLLABLE_SELECTOR).forEach(init);
    };

    const cleanup = () => {
      instances.forEach((instance, element) => {
        if (!element.isConnected) {
          instance.destroy();
          instances.delete(element);
        }
      });
    };

    // Intentionally do not initialize OverlayScrollbars on document.body.
    scan(document.body);

    const observer = new MutationObserver((mutations) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const scanRoots = new Set<ParentNode | HTMLElement>();

        mutations.forEach((mutation) => {
          if (mutation.target instanceof HTMLElement || mutation.target instanceof Document || mutation.target instanceof DocumentFragment) {
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

    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
      instances.forEach((instance) => instance.destroy());
      instances.clear();
    };
  }, [enabled, theme, visibility, autoHide, autoHideDelay, dragScroll, clickScroll]);

  return null;
}

export default OverlayScrollbarProvider;
