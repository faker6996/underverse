"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  label,
  size = "md",
  variant = "default",
  disabled = false,
  className,
  ...props
}) => {
  const [isPressed, setIsPressed] = React.useState(false);

  const sizeClasses = {
    sm: {
      track: "w-8 h-4",
      handle: "w-3 h-3",
      translate: "translate-x-4"
    },
    md: {
      track: "w-11 h-6", 
      handle: "w-5 h-5",
      translate: "translate-x-5"
    },
    lg: {
      track: "w-14 h-8",
      handle: "w-7 h-7", 
      translate: "translate-x-6"
    }
  };

  const variantClasses = {
    default: {
      active: "bg-primary border-primary",
      inactive: "bg-input border-input",
    },
    success: {
      active: "bg-success border-success",
      inactive: "bg-input border-input",
    },
    warning: {
      active: "bg-warning border-warning",
      inactive: "bg-input border-input",
    },
    danger: {
      active: "bg-destructive border-destructive",
      inactive: "bg-input border-input",
    },
  } as const;

  return (
    <label 
      className={cn(
        "inline-flex items-center gap-3 cursor-pointer select-none",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <div
        className={cn(
          "relative inline-flex rounded-full align-middle",
          sizeClasses[size].track,
          // Focus ring styled like shadcn (via peer-visible)
          "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
          disabled && "opacity-50",
        )}
      >
        <input 
          type="checkbox" 
          className="sr-only peer"
          checked={checked} 
          disabled={disabled}
          onChange={(e) => !disabled && onCheckedChange(e.target.checked)}
          {...props} 
        />
        
        {/* Background track */}
        <div 
          className={cn(
            "block w-full h-full rounded-full transition-colors duration-200 ease-out border",
            checked ? variantClasses[variant].active : variantClasses[variant].inactive
          )} 
        />
        
        {/* Handle */}
        <div
          className={cn(
            "absolute top-0.5 left-0.5 rounded-full transition-transform duration-200 ease-out shadow-sm",
            sizeClasses[size].handle,
            "bg-background border border-border",
            checked ? sizeClasses[size].translate : "translate-x-0",
            !disabled && "hover:scale-[1.02]",
            isPressed && "scale-95",
            disabled && "opacity-70"
          )}
          onMouseDown={() => !disabled && setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
        >
          {/* empty thumb */}
        </div>
      </div>
      
      {label && (
        <span
          className={cn(
            "text-sm font-medium text-foreground transition-colors",
            disabled && "text-muted-foreground"
          )}
        >
          {label}
        </span>
      )}
    </label>
  );
};

Switch.displayName = "Switch";
export default Switch;
