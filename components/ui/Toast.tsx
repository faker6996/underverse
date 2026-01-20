"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";
type ToastPosition = "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";

interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  toasts: Toast[];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children, position = "top-right", maxToasts = 5 }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = `toast-${++idRef.current}`;
      const newToast = { ...toast, id };

      setToasts((prev) => {
        const updated = [newToast, ...prev];
        return updated.slice(0, maxToasts);
      });

      // Auto-dismiss handled by ToastComponent so pause-on-hover works consistently.
    },
    [maxToasts, removeToast],
  );

  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-center": "top-4 left-1/2 transform -translate-x-1/2",
    "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2",
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toasts }}>
      {children}
      <div className={cn("fixed z-99999 flex flex-col gap-2 pointer-events-none", positionClasses[position])} aria-live="polite" aria-atomic>
        {toasts.map((toast) => (
          <ToastComponent key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

interface ToastComponentProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastComponent: React.FC<ToastComponentProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const [paused, setPaused] = useState(false);
  const total = toast.duration && toast.duration > 0 ? toast.duration : 5000;
  const endTsRef = useRef<number>(Date.now() + total);
  const remainingRef = useRef<number>(total);
  const pausedRef = useRef(false);

  const handleRemove = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 150);
  }, [onRemove, toast.id]);

  useEffect(() => {
    setIsVisible(true);
    if (toast.duration === 0) return;
    remainingRef.current = total;
    endTsRef.current = Date.now() + total;
    const intervalId = window.setInterval(() => {
      if (!pausedRef.current) {
        const remain = Math.max(endTsRef.current - Date.now(), 0);
        remainingRef.current = remain;
        setProgress((remain / total) * 100);
        if (remain === 0) {
          handleRemove();
        }
      }
    }, 50);
    return () => window.clearInterval(intervalId);
  }, [handleRemove, toast.duration, total]);

  const typeConfig = {
    success: {
      icon: CheckCircle,
      containerClassName: "bg-success/5 border-success/30",
      iconClassName: "text-success",
      iconBgClassName: "bg-success/15",
      accentBarClassName: "bg-success",
    },
    error: {
      icon: AlertCircle,
      containerClassName: "bg-destructive/5 border-destructive/30",
      iconClassName: "text-destructive",
      iconBgClassName: "bg-destructive/15",
      accentBarClassName: "bg-destructive",
    },
    warning: {
      icon: AlertTriangle,
      containerClassName: "bg-warning/5 border-warning/30",
      iconClassName: "text-warning",
      iconBgClassName: "bg-warning/15",
      accentBarClassName: "bg-warning",
    },
    info: {
      icon: Info,
      containerClassName: "bg-info/5 border-info/30",
      iconClassName: "text-info",
      iconBgClassName: "bg-info/15",
      accentBarClassName: "bg-info",
    },
  };

  const config = typeConfig[toast.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative w-80 rounded-r-xl border border-l-0 backdrop-blur-md transition-all duration-300 pointer-events-auto overflow-hidden",
        "bg-card shadow-xl",
        "animate-in slide-in-from-right-full",
        config.containerClassName,
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full",
      )}
      role="status"
      aria-live={toast.type === "error" ? "assertive" : "polite"}
      onMouseEnter={() => {
        if (toast.duration === 0) return;
        pausedRef.current = true;
        remainingRef.current = Math.max(endTsRef.current - Date.now(), 0);
        setPaused(true);
      }}
      onMouseLeave={() => {
        if (toast.duration === 0) return;
        pausedRef.current = false;
        endTsRef.current = Date.now() + remainingRef.current;
        setPaused(false);
      }}
    >
      {/* Accent bar - straight edge, not affected by rounded corners */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", config.accentBarClassName)} />

      <div className="flex items-start gap-3 p-4 pl-5">
        <div className={cn("flex items-center justify-center w-8 h-8 rounded-full shrink-0", config.iconBgClassName)}>
          <Icon className={cn("h-4 w-4", config.iconClassName)} />
        </div>

        <div className="flex-1 space-y-1">
          {toast.title && <h4 className="font-medium text-sm leading-none">{toast.title}</h4>}
          <p className="text-sm text-muted-foreground leading-relaxed">{toast.message}</p>
          {toast.action && (
            <button
              onClick={() => {
                toast.action!.onClick();
                handleRemove();
              }}
              className="text-sm font-medium hover:underline focus:outline-none"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {(toast.dismissible ?? true) && (
          <button
            onClick={handleRemove}
            className={cn(
              "rounded-lg p-1 hover:bg-accent hover:text-accent-foreground",
              "transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50",
            )}
            aria-label="Close toast"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {/* Progress bar */}
      {toast.duration !== 0 && (
        <div className="absolute left-0 right-0 bottom-0 h-1 bg-transparent">
          <div
            className={cn(
              "h-full bg-current/30",
              toast.type === "success" && "bg-success",
              toast.type === "error" && "bg-destructive",
              toast.type === "warning" && "bg-warning",
              toast.type === "info" && "bg-info",
            )}
            style={{ width: `${progress}%`, transition: paused ? "none" : "width 100ms linear" }}
          />
        </div>
      )}
    </div>
  );
};

export default ToastProvider;
