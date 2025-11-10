"use client";

import React from "react";
import FallingIcons from "@/components/ui/FallingIcons";
import { Leaf } from "lucide-react";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function GlobalFallingIcons() {
  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    setEnabled(readCookie("uv_falling_icons") === "1");
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail && typeof (e as CustomEvent).detail.enabled === "boolean") {
        setEnabled(!!(e as CustomEvent).detail.enabled);
      } else {
        setEnabled(readCookie("uv_falling_icons") === "1");
      }
    };
    window.addEventListener("uv:falling-icons:change", handler as EventListener);
    return () => window.removeEventListener("uv:falling-icons:change", handler as EventListener);
  }, []);

  if (!enabled) return null;
  return (
    <FallingIcons fullScreen icon={Leaf} count={48} speedRange={[6, 14]} sizeRange={[14, 28]} horizontalDrift={28} colorClassName="text-warning" zIndex={1200} />
  );
}

