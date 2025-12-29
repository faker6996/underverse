import * as React from "react";
import { cn } from "@/lib/utils/cn";
import SmartImage from "@/components/ui/SmartImage";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void; // 👈 thêm onClick rõ ràng
}

const sizeClasses: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-14 w-14 text-lg",
};

export const Avatar = ({ src, alt = "avatar", fallback = "?", size = "md", className, onClick, ...props }: AvatarProps) => {
  // Check if src is valid (not empty string, null, or undefined)
  const hasValidSrc = !!(src && src.trim().length > 0);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-muted text-foreground select-none transition-all duration-200 ease-soft",
        onClick && "cursor-pointer hover:ring-2 hover:ring-primary/50 hover:ring-offset-2 hover:shadow-lg active:scale-95",
        sizeClasses[size],
        className
      )}
      onClick={onClick}
      {...props}
    >
      {hasValidSrc && (
        <div className="absolute inset-0">
          <SmartImage
            src={src!}
            alt={alt}
            fill
            // match container size instead of using aspect ratio padding
            ratioClass={undefined}
            className="h-full w-full"
            roundedClass="rounded-full"
            fit="cover"
            objectPosition="center"
            quality={80}
          />
        </div>
      )}

      {/* Fallback text with better styling */}
      {!hasValidSrc && (
        <span
          className={cn(
            "font-bold uppercase bg-linear-to-br from-primary to-primary/80 bg-clip-text text-transparent",
            "transition-all duration-200 animate-fade-in"
          )}
        >
          {fallback}
        </span>
      )}

      {/* Online indicator (optional) */}
      <div className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-background rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </div>
  );
};

export default Avatar;
