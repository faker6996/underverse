import * as React from "react";
import { cn } from "@/lib/utils/cn";
import SmartImage from "@/components/ui/SmartImage";

type StatusType = "online" | "offline" | "busy" | "away" | "none";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
  /** Show status indicator dot */
  showStatus?: boolean;
  /** Status type: online, offline, busy, away, none */
  status?: StatusType;
  /** Hide status dot on hover */
  hideStatusOnHover?: boolean;
  onClick?: () => void;
}

const sizeClasses: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-14 w-14 text-lg",
};

const statusColors: Record<StatusType, string> = {
  online: "bg-success",
  offline: "bg-muted-foreground",
  busy: "bg-destructive",
  away: "bg-warning",
  none: "bg-transparent",
};

const statusDotSizes: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "w-2 h-2 border",
  md: "w-3 h-3 border-2",
  lg: "w-4 h-4 border-2",
};

export const Avatar = ({
  src,
  alt = "avatar",
  fallback = "?",
  size = "md",
  showStatus = true,
  status = "online",
  hideStatusOnHover = true,
  className,
  onClick,
  ...props
}: AvatarProps) => {
  // Check if src is valid (not empty string, null, or undefined)
  const hasValidSrc = !!(src && src.trim().length > 0);

  return (
    <div
      className={cn(
        "group relative inline-flex items-center justify-center overflow-visible rounded-full bg-muted text-foreground select-none transition-all duration-200 ease-soft",
        onClick && "cursor-pointer hover:ring-2 hover:ring-primary/50 hover:ring-offset-2 hover:shadow-lg active:scale-95",
        sizeClasses[size],
        className,
      )}
      onClick={onClick}
      {...props}
    >
      {/* Avatar image container - needs overflow-hidden separately */}
      <div className="absolute inset-0 overflow-hidden rounded-full">
        {hasValidSrc && (
          <SmartImage
            src={src!}
            alt={alt}
            fill
            ratioClass={undefined}
            className="h-full w-full"
            roundedClass="rounded-full"
            fit="cover"
            objectPosition="center"
            quality={80}
          />
        )}

        {/* Fallback text with better styling */}
        {!hasValidSrc && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={cn(
                "font-bold uppercase bg-linear-to-br from-primary to-primary/80 bg-clip-text text-transparent",
                "transition-all duration-200 animate-fade-in",
              )}
            >
              {fallback}
            </span>
          </div>
        )}
      </div>

      {/* Status indicator dot - positioned outside overflow-hidden to appear on top */}
      {showStatus && status !== "none" && (
        <div
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-background z-10",
            statusColors[status],
            statusDotSizes[size],
            "transition-opacity duration-200",
            hideStatusOnHover ? "opacity-100 group-hover:opacity-50" : "opacity-100",
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
