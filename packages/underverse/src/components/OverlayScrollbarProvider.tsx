"use client";

import React, { createContext, useContext, useEffect, useMemo } from "react";
import { OverlayScrollbars } from "overlayscrollbars";
import {
  buildOverlayScrollbarOptions,
  createOverlayScrollbarController,
  DEFAULT_OVERLAY_SCROLLBAR_BEHAVIOR,
  resolveOverlayScrollbarBehavior,
  type OverlayScrollbarBehavior,
} from "../utils/overlay-scrollbar-controller";

const OverlayScrollbarConfigContext = createContext<OverlayScrollbarBehavior>(DEFAULT_OVERLAY_SCROLLBAR_BEHAVIOR);

export interface OverlayScrollbarProviderProps extends Partial<OverlayScrollbarBehavior> {
  children?: React.ReactNode;
  /** @deprecated Global selector scanning is removed. Kept only for backward compatibility. */
  selector?: string;
}

export interface UseOverlayScrollbarTargetOptions extends Partial<OverlayScrollbarBehavior> {}

export function OverlayScrollbarProvider({
  enabled = DEFAULT_OVERLAY_SCROLLBAR_BEHAVIOR.enabled,
  theme = DEFAULT_OVERLAY_SCROLLBAR_BEHAVIOR.theme,
  visibility = DEFAULT_OVERLAY_SCROLLBAR_BEHAVIOR.visibility,
  autoHide = DEFAULT_OVERLAY_SCROLLBAR_BEHAVIOR.autoHide,
  autoHideDelay = DEFAULT_OVERLAY_SCROLLBAR_BEHAVIOR.autoHideDelay,
  dragScroll = DEFAULT_OVERLAY_SCROLLBAR_BEHAVIOR.dragScroll,
  clickScroll = DEFAULT_OVERLAY_SCROLLBAR_BEHAVIOR.clickScroll,
  exclude = DEFAULT_OVERLAY_SCROLLBAR_BEHAVIOR.exclude,
  selector,
  children,
}: OverlayScrollbarProviderProps = {}) {
  const value = useMemo(
    () =>
      resolveOverlayScrollbarBehavior({
        enabled,
        theme,
        visibility,
        autoHide,
        autoHideDelay,
        dragScroll,
        clickScroll,
        exclude,
      }),
    [enabled, theme, visibility, autoHide, autoHideDelay, dragScroll, clickScroll, exclude],
  );

  void selector;

  return <OverlayScrollbarConfigContext.Provider value={value}>{children ?? null}</OverlayScrollbarConfigContext.Provider>;
}

export function useOverlayScrollbarTarget<T extends HTMLElement>(
  targetRef: React.RefObject<T | null>,
  options: UseOverlayScrollbarTargetOptions = {},
) {
  const inherited = useContext(OverlayScrollbarConfigContext);

  const resolved = useMemo(
    () =>
      resolveOverlayScrollbarBehavior({
        ...inherited,
        ...options,
      }),
    [inherited, options],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const target = targetRef.current;
    if (!target) return;

    const controller = createOverlayScrollbarController({
      element: target,
      enabled: resolved.enabled,
      exclude: resolved.exclude,
      options: buildOverlayScrollbarOptions(resolved),
      createInstance: (element, instanceOptions) => OverlayScrollbars(element, instanceOptions),
    });

    return () => {
      controller.destroy();
    };
  }, [targetRef, resolved]);
}

export default OverlayScrollbarProvider;
