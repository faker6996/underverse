"use client";

import React from "react";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import { Lock, ShieldAlert, Ban } from "lucide-react";

type Variant = "destructive" | "warning" | "info";

interface AccessDeniedProps {
  title?: string;
  description?: string;
  variant?: Variant;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  children?: React.ReactNode; // actions
}

const VARIANT_STYLES: Record<Variant, { bg: string; border: string; text: string }> = {
  destructive: { bg: "bg-destructive/5", border: "border-destructive/20", text: "text-destructive" },
  warning: { bg: "bg-warning/5", border: "border-warning/20", text: "text-warning" },
  info: { bg: "bg-info/5", border: "border-info/20", text: "text-info" },
};

const DEFAULT_ICONS: Record<Variant, React.ComponentType<{ className?: string }>> = {
  destructive: ShieldAlert,
  warning: Ban,
  info: Lock,
};

export default function AccessDenied({
  title = "Access Restricted",
  description = "You do not have permission to access this area.",
  variant = "destructive",
  icon: Icon,
  className,
  children,
}: AccessDeniedProps) {
  const styles = VARIANT_STYLES[variant];
  const UsedIcon = Icon || DEFAULT_ICONS[variant];

  return (
    <Card className={cn("p-8 text-center shadow-sm", styles.bg, styles.border, className)}>
      <div className="flex flex-col items-center gap-4">
        <div className={cn("p-3 rounded-lg", styles.bg.replace("/5", "/10"))}>
          <UsedIcon className={cn("w-8 h-8", styles.text)} />
        </div>
        <div>
          <h3 className={cn("font-semibold mb-2", styles.text)}>{title}</h3>
          <p className={cn(styles.text.replace("text-", "text-") + "/80", "text-sm")}>{description}</p>
        </div>
        {children && <div className="mt-2 flex flex-wrap gap-2 justify-center">{children}</div>}
      </div>
    </Card>
  );
}

