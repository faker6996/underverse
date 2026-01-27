"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import React from "react";

interface FloatingContactsProps {
  className?: string;
}

// Brand icons as inline SVGs
function MessengerIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} aria-hidden="true" {...props}>
      <path
        d="M12 2C6.477 2 2 6.145 2 11.235c0 2.93 1.35 5.542 3.464 7.25v3.515l3.344-1.836c.894.247 1.843.375 2.192.375 5.523 0 10-4.145 10-9.235S17.523 2 12 2zm.994 12.444l-2.563-2.73-5.004 2.73 5.507-5.84 2.626 2.729 4.942-2.729-5.508 5.84z"
        fill="white"
      />
    </svg>
  );
}

function ZaloIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 48 48" width={20} height={20} aria-hidden="true" {...props}>
      <path
        fill="white"
        d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20S35.046 4 24 4zm6.164 27.602h-4.239c-.405 0-.732-.328-.732-.732v-7.596l-2.646 7.933c-.096.288-.366.482-.67.482h-1.773c-.304 0-.574-.194-.67-.482l-2.647-7.933v7.596c0 .405-.327.732-.732.732h-2.873c-.405 0-.732-.328-.732-.732V17.134c0-.405.327-.732.732-.732h3.91c.32 0 .602.208.698.514l2.68 8.042 2.68-8.042c.096-.306.378-.514.698-.514h3.91c.405 0 .732.327.732.732v14.466c0 .404-.327.732-.732.732z"
      />
    </svg>
  );
}

function InstagramIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true" fill="white" {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export default function FloatingContacts({ className }: FloatingContactsProps) {
  const pathname = usePathname();
  if (pathname?.includes("/admin")) return null;

  const hotline = process.env.NEXT_PUBLIC_HOTLINE || "0962209870";
  const zalo = process.env.NEXT_PUBLIC_ZALO || "0356611301";
  const messenger = process.env.NEXT_PUBLIC_MESSENGER_URL || "https://m.me/thejojoflowers";
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/thejojoflowers";

  // Order: Zalo → Messenger → Instagram (phone rendered first)
  const moreItems = [
    {
      key: "zalo",
      href: `https://zalo.me/${zalo.replace(/\D/g, "")}`,
      label: "Zalo",
      bg: "bg-[#0068FF]",
      Icon: ZaloIcon,
      external: true,
    },
    {
      key: "messenger",
      href: messenger,
      label: "Messenger",
      bg: "bg-[#0084FF]",
      Icon: MessengerIcon,
      external: true,
    },
    {
      key: "instagram",
      href: instagram,
      label: "Instagram",
      bg: "bg-[#E1306C]",
      Icon: InstagramIcon,
      external: true,
    },
  ];

  return (
    <div className={cn("fixed bottom-6 right-4 z-100000", "flex flex-col items-end gap-3", className)} aria-label="Quick contacts">
      {/* Phone on top */}
      <Link
        href={`tel:${hotline.replace(/\D/g, "")}`}
        aria-label="Gọi"
        className={cn(
          "w-12 h-12 rounded-full text-white shadow-lg leading-none",
          "grid place-items-center",
          "hover:scale-105 active:scale-95 transition-transform",
          "bg-[#22c55e]",
        )}
      >
        <Phone className="w-6 h-6" />
      </Link>

      {/* Then Zalo → Messenger → Instagram */}
      {moreItems.map(({ key, href, label, bg, Icon, external }) => (
        <Link
          key={key}
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          aria-label={label}
          className={cn(
            "w-12 h-12 rounded-full text-white shadow-lg leading-none",
            "grid place-items-center",
            "hover:scale-105 active:scale-95 transition-transform",
            bg,
          )}
        >
          <Icon className="w-6 h-6" />
        </Link>
      ))}
    </div>
  );
}
