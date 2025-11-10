"use client";

import React from "react";
import Switch from "@/components/ui/Switch";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils/cn";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires.toUTCString()}`;
}

export default function FallingIconsToggle() {
  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    const v = readCookie("uv_falling_icons");
    setEnabled(v === "1");
  }, []);

  const onChange = (val: boolean) => {
    setEnabled(val);
    writeCookie("uv_falling_icons", val ? "1" : "0");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("uv:falling-icons:change", { detail: { enabled: val } }));
    }
  };

  return (
    <div className="flex items-center gap-2" title={enabled ? "Disable falling icons" : "Enable falling icons"}>
      <Leaf className={cn("w-4 h-4", enabled ? "text-warning" : "text-muted-foreground")} />
      <Switch checked={enabled} onCheckedChange={onChange} />
    </div>
  );
}

