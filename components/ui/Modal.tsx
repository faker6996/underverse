"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  overlayClassName?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-full mx-4",
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  className,
  overlayClassName,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  size = "md",
}) => {
  const [isMounted, setIsMounted] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(true);

  React.useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Animation handling
  React.useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
      // Start animation on next frame
      requestAnimationFrame(() => {
        setIsAnimating(false);
      });
    } else if (isVisible) {
      setIsAnimating(true);
      // Hide after animation completes
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 200);
      return () => clearTimeout(hideTimer);
    }
  }, [isOpen, isVisible]);

  // Handle escape key
  React.useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEsc, onClose]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  if (!isMounted || (!isOpen && !isVisible)) {
    return null;
  }

  const modalContent = (
    <div className={cn("fixed inset-0 z-[9999] flex items-center justify-center", overlayClassName)} onClick={handleOverlayClick}>
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-200 ease-out"
        style={{
          opacity: isOpen && !isAnimating ? 1 : 0,
        }}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full rounded-lg  bg-card text-card-foreground shadow-xl",
          "transition-all duration-200 ease-out",
          sizeStyles[size],
          className
        )}
        style={{
          opacity: isOpen && !isAnimating ? 1 : 0,
          transform: isOpen && !isAnimating ? "scale(1)" : "scale(0.9)",
          // Thêm dòng này để tạo hiệu ứng nảy
          transition: "all 300ms cubic-bezier(0.34, 1.76, 0.64, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || description || showCloseButton) && (
          <div className="flex items-start justify-between p-6 pb-0">
            <div className="space-y-1.5">
              {title && <h2 className="text-lg font-semibold leading-none tracking-tight">{title}</h2>}
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className={cn(
                  "rounded-sm opacity-70 ring-offset-background transition-opacity",
                  "hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  "disabled:pointer-events-none "
                )}
              >
                <X className="h-4 w-4 cursor-pointer" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );

  return typeof window !== "undefined" ? createPortal(modalContent, document.body) : null;
};

export default Modal;
