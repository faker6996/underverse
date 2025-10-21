// components/ui/Alert.tsx
import { cn } from "@/lib/utils/cn";
import { ReactNode, useState } from "react";
import { InfoIcon, WarningIcon, CheckCircleIcon, ErrorIcon } from "@/components/icons/AlertIcons";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

import { VARIANT_STYLES_ALERT } from "@/lib/constants/constants-ui/alert";

type AlertVariant = "default" | "info" | "success" | "warning" | "error";

const variantIcons: Record<AlertVariant, ReactNode> = {
  default: <InfoIcon className="h-4 w-4 text-muted-foreground" />,
  info: <InfoIcon className="h-4 w-4 text-info" />,
  success: <CheckCircleIcon className="h-4 w-4 text-success" />,
  warning: <WarningIcon className="h-4 w-4 text-warning" />,
  error: <ErrorIcon className="h-4 w-4 text-destructive" />,
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

  return (
    <div
      className={cn("w-full p-4 rounded-md flex items-start gap-3", VARIANT_STYLES_ALERT[variant], className)}
      role="alert"
      aria-live={variant === "error" ? "assertive" : "polite"}
    >
      <div className="pt-1">{icon ?? variantIcons[variant]}</div>
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-sm leading-none mb-1 text-foreground">{title}</p>}
        {description && (
          typeof description === "string" ? (
            <p className="text-sm text-muted-foreground leading-relaxed break-words">{description}</p>
          ) : (
            <div className="text-sm text-muted-foreground leading-relaxed break-words">{description}</div>
          )
        )}
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
