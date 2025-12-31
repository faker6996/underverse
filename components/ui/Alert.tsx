// components/ui/Alert.tsx
import { cn } from "@/lib/utils/cn";
import { ReactNode, useState } from "react";
import { Info, AlertTriangle, CheckCircle, XCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";

type AlertVariant = "default" | "info" | "success" | "warning" | "error";

const variantConfig: Record<
  AlertVariant,
  {
    icon: typeof Info;
    containerClassName: string;
    iconClassName: string;
    iconBgClassName: string;
    accentBarClassName: string;
  }
> = {
  default: {
    icon: Info,
    containerClassName: "bg-muted/50 border-border",
    iconClassName: "text-muted-foreground",
    iconBgClassName: "bg-muted",
    accentBarClassName: "bg-muted-foreground",
  },
  info: {
    icon: Info,
    containerClassName: "bg-info/5 border-info/30",
    iconClassName: "text-info",
    iconBgClassName: "bg-info/15",
    accentBarClassName: "bg-info",
  },
  success: {
    icon: CheckCircle,
    containerClassName: "bg-success/5 border-success/30",
    iconClassName: "text-success",
    iconBgClassName: "bg-success/15",
    accentBarClassName: "bg-success",
  },
  warning: {
    icon: AlertTriangle,
    containerClassName: "bg-warning/5 border-warning/30",
    iconClassName: "text-warning",
    iconBgClassName: "bg-warning/15",
    accentBarClassName: "bg-warning",
  },
  error: {
    icon: XCircle,
    containerClassName: "bg-destructive/5 border-destructive/30",
    iconClassName: "text-destructive",
    iconBgClassName: "bg-destructive/15",
    accentBarClassName: "bg-destructive",
  },
};

interface AlertProps {
  title?: string;
  description?: ReactNode;
  variant?: AlertVariant;
  className?: string;
  icon?: ReactNode;
  dismissible?: boolean;
  onClose?: () => void;
  actions?: ReactNode;
  closeAriaLabel?: string;
}

const Alert = ({ title, description, variant = "default", className, icon, dismissible = false, onClose, actions, closeAriaLabel }: AlertProps) => {
  const [open, setOpen] = useState(true);
  const t = useTranslations("Common");

  if (!open) return null;

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative w-full rounded-r-lg border border-l-0 overflow-hidden",
        "flex items-start gap-3 p-4 pl-5",
        "backdrop-blur-md",
        config.containerClassName,
        className
      )}
      role="alert"
      aria-live={variant === "error" ? "assertive" : "polite"}
    >
      {/* Accent bar - straight edge, not affected by rounded corners */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", config.accentBarClassName)} />

      <div className={cn("flex items-center justify-center w-8 h-8 rounded-full shrink-0", config.iconBgClassName)}>
        {icon ?? <Icon className={cn("h-4 w-4", config.iconClassName)} />}
      </div>

      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-sm leading-none mb-1 text-foreground">{title}</p>}
        {description &&
          (typeof description === "string" ? (
            <p className="text-sm text-muted-foreground leading-relaxed wrap-break-word">{description}</p>
          ) : (
            <div className="text-sm text-muted-foreground leading-relaxed wrap-break-word">{description}</div>
          ))}
        {actions && <div className="mt-2 flex flex-wrap gap-2">{actions}</div>}
      </div>

      {dismissible && (
        <button
          onClick={handleClose}
          className="rounded-md p-1 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={closeAriaLabel || t("closeAlert")}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
