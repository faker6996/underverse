"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

interface DocGroupSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function DocGroupSection({ title, children, className }: DocGroupSectionProps) {
  return (
    <div className={cn("space-y-8", className)}>
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-foreground/90">{title}</h2>
        <div className="flex-1 h-px bg-border/50" />
      </div>
      <div className="space-y-10 pl-0">{children}</div>
    </div>
  );
}
