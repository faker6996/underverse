"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../utils/cn";
import { X } from "lucide-react";
import Button from "./Button";

/** Public props for the `Sheet` component. */
export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right" | "top" | "bottom";
  size?: "sm" | "md" | "lg" | "xl" | "full";
  variant?: "default" | "overlay" | "push";
  children: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  showClose?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  overlayOpacity?: number;
  /** Allow the user to resize the sheet from the edge closest to the page content. */
  resizable?: boolean;
  /** Minimum sheet width/height in pixels while resizing. */
  minSize?: number;
  /** Maximum sheet width/height in pixels while resizing. Defaults to 90% of the viewport. */
  maxSize?: number;
  /** Called with each width/height update while the user resizes the sheet. */
  onResize?: (size: number) => void;
}

type ResizeState = {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startSize: number;
};

const sizeStyles = {
  sm: {
    right: "w-75",
    left: "w-75",
    top: "h-50",
    bottom: "h-50",
  },
  md: {
    right: "w-100",
    left: "w-100",
    top: "h-75",
    bottom: "h-75",
  },
  lg: {
    right: "w-125",
    left: "w-125",
    top: "h-100",
    bottom: "h-100",
  },
  xl: {
    right: "w-150",
    left: "w-150",
    top: "h-125",
    bottom: "h-125",
  },
  full: {
    right: "w-full",
    left: "w-full",
    top: "h-full",
    bottom: "h-full",
  },
};

const positionStyles = {
  right: "right-0 top-0 h-full",
  left: "left-0 top-0 h-full",
  top: "top-0 left-0 w-full",
  bottom: "bottom-0 left-0 w-full",
};

const animationStyles = {
  right: {
    initial: "translate-x-full",
    animate: "translate-x-0",
    exit: "translate-x-full",
  },
  left: {
    initial: "-translate-x-full",
    animate: "translate-x-0",
    exit: "-translate-x-full",
  },
  top: {
    initial: "-translate-y-full",
    animate: "translate-y-0",
    exit: "-translate-y-full",
  },
  bottom: {
    initial: "translate-y-full",
    animate: "translate-y-0",
    exit: "translate-y-full",
  },
};

export const Sheet: React.FC<SheetProps> = ({
  open,
  onOpenChange,
  side = "right",
  size = "md",
  variant = "default",
  children,
  title,
  description,
  className,
  showClose = true,
  closeOnOutsideClick = true,
  closeOnEscape = true,
  header,
  footer,
  overlayOpacity,
  resizable = false,
  minSize = 280,
  maxSize,
  onResize,
}) => {
  const [mounted, setMounted] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(true);
  const [isVisible, setIsVisible] = React.useState(false);
  const [isResizing, setIsResizing] = React.useState(false);
  const [sheetSize, setSheetSize] = React.useState<number | null>(null);
  const sheetRef = React.useRef<HTMLDivElement | null>(null);
  const resizeStateRef = React.useRef<ResizeState | null>(null);
  const isHorizontalSheet = side === "left" || side === "right";
  const canResize = resizable && size !== "full";

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key
  React.useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, closeOnEscape, onOpenChange]);

  // Prevent body scroll when sheet is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  // Animation handling
  React.useEffect(() => {
    if (open) {
      setIsVisible(true);
      setIsAnimating(true);
      // Start animation on next frame to avoid flicker
      requestAnimationFrame(() => {
        setIsAnimating(false);
      });
    } else if (isVisible) {
      setIsAnimating(true);
      // Hide after animation completes
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(hideTimer);
    }
  }, [open, isVisible]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const clampResizeSize = React.useCallback((nextSize: number) => {
    const viewportSize = isHorizontalSheet ? window.innerWidth : window.innerHeight;
    const resolvedMaxSize = maxSize ?? Math.round(viewportSize * 0.9);
    return Math.min(Math.max(nextSize, minSize), resolvedMaxSize);
  }, [isHorizontalSheet, maxSize, minSize]);

  const endResize = React.useCallback(() => {
    if (!resizeStateRef.current) return;
    resizeStateRef.current = null;
    setIsResizing(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  const handleResizePointerMove = React.useCallback((event: PointerEvent) => {
    const resizeState = resizeStateRef.current;
    if (!resizeState || event.pointerId !== resizeState.pointerId) return;

    const delta = isHorizontalSheet
      ? side === "right"
        ? resizeState.startClientX - event.clientX
        : event.clientX - resizeState.startClientX
      : side === "bottom"
        ? resizeState.startClientY - event.clientY
        : event.clientY - resizeState.startClientY;
    const nextSize = clampResizeSize(Math.round(resizeState.startSize + delta));

    setSheetSize(nextSize);
    onResize?.(nextSize);
  }, [clampResizeSize, isHorizontalSheet, onResize, side]);

  const handleResizePointerUp = React.useCallback((event: PointerEvent) => {
    const resizeState = resizeStateRef.current;
    if (!resizeState || event.pointerId !== resizeState.pointerId) return;
    endResize();
  }, [endResize]);

  React.useEffect(() => {
    if (!isResizing) return undefined;

    window.addEventListener("pointermove", handleResizePointerMove);
    window.addEventListener("pointerup", handleResizePointerUp);
    window.addEventListener("pointercancel", handleResizePointerUp);

    return () => {
      window.removeEventListener("pointermove", handleResizePointerMove);
      window.removeEventListener("pointerup", handleResizePointerUp);
      window.removeEventListener("pointercancel", handleResizePointerUp);
    };
  }, [handleResizePointerMove, handleResizePointerUp, isResizing]);

  React.useEffect(() => {
    if (!open) endResize();
  }, [endResize, open]);

  React.useEffect(() => endResize, [endResize]);

  const handleResizePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!canResize || !sheetRef.current) return;

    const rect = sheetRef.current.getBoundingClientRect();
    const startSize = isHorizontalSheet ? rect.width : rect.height;
    resizeStateRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startSize,
    };
    setIsResizing(true);

    event.currentTarget.setPointerCapture(event.pointerId);
    document.body.style.cursor = isHorizontalSheet ? "col-resize" : "row-resize";
    document.body.style.userSelect = "none";
    event.preventDefault();
    event.stopPropagation();
  };

  const sheetInlineStyle: React.CSSProperties = {
    transform:
      open && !isAnimating
        ? "translate(0, 0)"
        : side === "right"
          ? "translateX(100%)"
          : side === "left"
            ? "translateX(-100%)"
            : side === "top"
              ? "translateY(-100%)"
              : "translateY(100%)",
    transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
    ...(sheetSize !== null
      ? isHorizontalSheet
        ? { width: `${sheetSize}px` }
        : { height: `${sheetSize}px` }
      : {}),
  };

  if (!mounted || (!open && !isVisible)) return null;

  const sheetContent = (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 transition-all duration-300 ease-out",
          variant === "overlay" ? "bg-background/95 backdrop-blur-sm" : "bg-background/80 backdrop-blur-sm",
          overlayOpacity === undefined && (open && !isAnimating ? "opacity-100" : "opacity-0"),
        )}
        style={overlayOpacity !== undefined ? { opacity: open && !isAnimating ? overlayOpacity : 0 } : undefined}
        onClick={handleOverlayClick}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          "fixed flex flex-col bg-background text-foreground shadow-2xl",
          "border-border/50 transition-all duration-300 ease-out",
          positionStyles[side],
          sizeStyles[size][side],
          // Borders based on side
          side === "right" && "border-l",
          side === "left" && "border-r",
          side === "top" && "border-b",
          side === "bottom" && "border-t",
          // Animation classes - smooth slide in/out
          open && !isAnimating ? animationStyles[side].animate : animationStyles[side].initial,
          className,
        )}
        style={sheetInlineStyle}
      >
        {canResize && (
          <button
            type="button"
            aria-label="Resize sheet"
            className={cn(
              "absolute z-10 bg-transparent outline-none transition-colors",
              "after:absolute after:rounded-full after:bg-border after:opacity-0 after:transition-opacity hover:after:opacity-100 focus-visible:after:opacity-100",
              isHorizontalSheet
                ? "top-0 h-full w-3 cursor-col-resize after:top-1/2 after:h-12 after:w-1 after:-translate-y-1/2"
                : "left-0 h-3 w-full cursor-row-resize after:left-1/2 after:h-1 after:w-12 after:-translate-x-1/2",
              side === "right" && "-left-1.5 after:left-1/2",
              side === "left" && "-right-1.5 after:right-1/2",
              side === "bottom" && "-top-1.5 after:top-1/2",
              side === "top" && "-bottom-1.5 after:bottom-1/2",
            )}
            onPointerDown={handleResizePointerDown}
            onPointerMove={(event) => handleResizePointerMove(event.nativeEvent)}
            onPointerUp={(event) => handleResizePointerUp(event.nativeEvent)}
            onPointerCancel={(event) => handleResizePointerUp(event.nativeEvent)}
          />
        )}

        {/* Header */}
        {(title || description || header || showClose) && (
          <div className="shrink-0 border-b border-border/50">
            {header || (
              <div className="flex items-center justify-between p-4">
                <div className="flex-1">
                  {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
                  {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
                </div>
                {showClose && <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0 rounded-md cursor-pointer" icon={X} />}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div
         
          className="flex-1 overflow-auto p-4"
          style={{
            opacity: open && !isAnimating ? 1 : 0,
            transform: open && !isAnimating ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 400ms ease-out 100ms, transform 400ms ease-out 100ms",
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && <div className="shrink-0 border-t border-border/50 p-4">{footer}</div>}
      </div>
    </div>
  );

  return typeof window !== "undefined" ? createPortal(sheetContent, document.body) : null;
};

// Specialized Sheet components
/** Public props for the `Drawer` component. */
export interface DrawerProps extends Omit<SheetProps, "side"> {
  placement?: "left" | "right";
}

export const Drawer: React.FC<DrawerProps> = ({ placement = "right", ...props }) => {
  return <Sheet {...props} side={placement} variant="overlay" />;
};

/** Public props for the `SlideOver` component. */
export interface SlideOverProps extends Omit<SheetProps, "side" | "variant"> {}

export const SlideOver: React.FC<SlideOverProps> = (props) => {
  return <Sheet {...props} side="right" variant="overlay" size="lg" />;
};

/** Public props for the `BottomSheet` component. */
export interface BottomSheetProps extends Omit<SheetProps, "side"> {
  snapPoints?: string[];
  defaultSnap?: number;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ snapPoints = ["25%", "50%", "90%"], defaultSnap = 1, ...props }) => {
  return <Sheet {...props} side="bottom" variant="overlay" className={cn("rounded-t-3xl", props.className)} />;
};

/** Public props for the `SidebarSheet` component. */
export interface SidebarSheetProps extends Omit<SheetProps, "side" | "variant"> {
  navigation?: React.ReactNode;
}

export const SidebarSheet: React.FC<SidebarSheetProps> = ({ navigation, children, ...props }) => {
  return (
    <Sheet {...props} side="left" variant="push" size="md">
      {navigation && <div className="border-b border-border/50 pb-4 mb-4">{navigation}</div>}
      {children}
    </Sheet>
  );
};
