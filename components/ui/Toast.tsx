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

      if (toast.duration !== 0) {
        setTimeout(() => {
          removeToast(id);
        }, toast.duration || 5000);
      }
    },
    [maxToasts, removeToast]
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
  const [startTs] = useState(() => Date.now());
  const total = toast.duration && toast.duration > 0 ? toast.duration : 5000;
  const [remaining, setRemaining] = useState(total);

  useEffect(() => {
    setIsVisible(true);
    if (toast.duration === 0) return;
    let raf: number;
    const tick = () => {
      if (!paused) {
        const elapsed = Date.now() - startTs;
        const remain = Math.max(total - elapsed, 0);
        setRemaining(remain);
        setProgress((remain / total) * 100);
        if (remain === 0) {
          handleRemove();
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 150);
  };

  const typeConfig = {
    success: {
      icon: CheckCircle,
      className: "bg-success/10 border-success/20 text-foreground",
      iconClassName: "text-success",
    },
    error: {
      icon: AlertCircle,
      className: "bg-destructive/10 border-destructive/20 text-foreground",
      iconClassName: "text-destructive",
    },
    warning: {
      icon: AlertTriangle,
      className: "bg-warning/10 border-warning/20 text-foreground",
      iconClassName: "text-warning",
    },
    info: {
      icon: Info,
      className: "bg-info/10 border-info/20 text-foreground",
      iconClassName: "text-info",
    },
  };

  const config = typeConfig[toast.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative w-80 rounded-lg border backdrop-blur-sm transition-all duration-300 ease-soft pointer-events-auto",
        "bg-card/95 shadow-lg animate-in slide-in-from-right-full",
        config.className,
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
      )}
      role="status"
      aria-live={toast.type === "error" ? "assertive" : "polite"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-start gap-3 p-4">
        <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", config.iconClassName)} />

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
              "rounded-md p-1 hover:bg-accent hover:text-accent-foreground",
              "transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
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
              toast.type === "info" && "bg-info"
            )}
            style={{ width: `${progress}%`, transition: paused ? "none" : "width 100ms linear" }}
          />
        </div>
      )}
    </div>
  );
};

export default ToastProvider;
