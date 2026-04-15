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
  overflowX = DEFAULT_OVERLAY_SCROLLBAR_BEHAVIOR.overflowX,
  overflowY = DEFAULT_OVERLAY_SCROLLBAR_BEHAVIOR.overflowY,
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
        overflowX,
        overflowY,
        exclude,
      }),
    [enabled, theme, visibility, autoHide, autoHideDelay, dragScroll, clickScroll, overflowX, overflowY, exclude],
  );

  void selector;

  return <OverlayScrollbarConfigContext.Provider value={value}>{children ?? null}</OverlayScrollbarConfigContext.Provider>;
}

export function useOverlayScrollbarTarget<T extends HTMLElement>(
  targetRef: React.RefObject<T | null>,
  options: UseOverlayScrollbarTargetOptions = {},
) {
  const inherited = useContext(OverlayScrollbarConfigContext);

  const enabled = options.enabled ?? inherited.enabled;
  const theme = options.theme ?? inherited.theme;
  const visibility = options.visibility ?? inherited.visibility;
  const autoHide = options.autoHide ?? inherited.autoHide;
  const autoHideDelay = options.autoHideDelay ?? inherited.autoHideDelay;
  const dragScroll = options.dragScroll ?? inherited.dragScroll;
  const clickScroll = options.clickScroll ?? inherited.clickScroll;
  const overflowX = options.overflowX ?? inherited.overflowX;
  const overflowY = options.overflowY ?? inherited.overflowY;
  const exclude = options.exclude ?? inherited.exclude;

  const resolved = useMemo(
    () =>
      resolveOverlayScrollbarBehavior({
        enabled,
        theme,
        visibility,
        autoHide,
        autoHideDelay,
        dragScroll,
        clickScroll,
        overflowX,
        overflowY,
        exclude,
      }),
    [enabled, theme, visibility, autoHide, autoHideDelay, dragScroll, clickScroll, overflowX, overflowY, exclude],
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
  }, [
    targetRef,
    resolved.enabled,
    resolved.theme,
    resolved.visibility,
    resolved.autoHide,
    resolved.autoHideDelay,
    resolved.dragScroll,
    resolved.clickScroll,
    resolved.overflowX,
    resolved.overflowY,
    resolved.exclude,
  ]);
}

export default OverlayScrollbarProvider;
