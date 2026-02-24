"use client";

import { useEffect } from "react";
import { OverlayScrollbars, type PartialOptions } from "overlayscrollbars";
import {
  createOverlayScrollbarController,
  DEFAULT_OVERLAY_SCROLLBAR_EXCLUDE,
  DEFAULT_OVERLAY_SCROLLBAR_SELECTOR,
} from "@/components/ui/overlay-scrollbar-controller";

export interface OverlayScrollbarProviderProps {
  enabled?: boolean;
  theme?: string;
  visibility?: "visible" | "hidden" | "auto";
  autoHide?: "never" | "scroll" | "leave" | "move";
  autoHideDelay?: number;
  dragScroll?: boolean;
  clickScroll?: boolean;
  selector?: string;
  exclude?: string;
}

export function OverlayScrollbarProvider({
  enabled = true,
  theme = "os-theme-underverse",
  visibility = "auto",
  autoHide = "leave",
  autoHideDelay = 600,
  dragScroll = true,
  clickScroll = false,
  selector = DEFAULT_OVERLAY_SCROLLBAR_SELECTOR,
  exclude = DEFAULT_OVERLAY_SCROLLBAR_EXCLUDE,
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

    const controller = createOverlayScrollbarController({
      selector,
      exclude,
      options,
      createInstance: (element, instanceOptions) => OverlayScrollbars(element, instanceOptions),
    });

    return () => {
      controller.destroy();
    };
  }, [enabled, theme, visibility, autoHide, autoHideDelay, dragScroll, clickScroll, selector, exclude]);

  return null;
}

export default OverlayScrollbarProvider;
