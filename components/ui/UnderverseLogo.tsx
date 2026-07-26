"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

export interface UnderverseLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
  className?: string;
  variant?: "default" | "glowing" | "minimal";
  showFrame?: boolean;
  withText?: boolean;
  textClassName?: string;
}

export default function UnderverseLogo({
  size = 36,
  className,
  variant = "default",
  showFrame = false,
  withText = false,
  textClassName,
  ...props
}: UnderverseLogoProps) {
  return (
    <div className={cn("group inline-flex items-center gap-2.5 select-none", className)} {...props}>
      <div className="relative flex shrink-0 items-center justify-center">
        {/* Ambient Glow Backdrop */}
        {variant !== "minimal" && (
          <div
            className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 opacity-60 blur-md transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden="true"
          />
        )}

        <div
          className={cn(
            "relative z-10 overflow-hidden rounded-xl border border-white/20 shadow-xl transition-transform duration-300 group-hover:scale-105",
            showFrame && "bg-slate-950 p-1"
          )}
          style={{ width: size, height: size }}
        >
          <Image
            src="/logo.png"
            alt="Underverse UI Logo"
            width={size * 2}
            height={size * 2}
            className="h-full w-full object-cover rounded-lg"
            priority
          />
        </div>
      </div>

      {withText && (
        <div className={cn("flex flex-col leading-none", textClassName)}>
          <span className="text-base font-bold tracking-tight text-foreground sm:text-lg">
            Underverse <span className="text-primary font-extrabold">UI</span>
          </span>
          <span className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground">
            Component System
          </span>
        </div>
      )}
    </div>
  );
}
