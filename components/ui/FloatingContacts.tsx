"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { FaInstagram } from "react-icons/fa";
import { SiZalo } from "react-icons/si";

interface FloatingContactsProps {
  className?: string;
}

// Brand icons
function MessengerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} aria-hidden="true" {...props}>
      <path
        d="M12 2C6.477 2 2 6.145 2 11.235c0 2.93 1.35 5.542 3.464 7.25v3.515l3.344-1.836c.894.247 1.843.375 2.192.375 5.523 0 10-4.145 10-9.235S17.523 2 12 2zm.994 12.444l-2.563-2.73-5.004 2.73 5.507-5.84 2.626 2.729 4.942-2.729-5.508 5.84z"
        fill="white"
      />
    </svg>
  );
}

function ZaloIcon(props: React.SVGProps<SVGSVGElement>) {
  return <SiZalo size={20} {...(props as any)} />;
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return <FaInstagram size={20} {...(props as any)} />;
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
    <div className={cn("fixed bottom-6 right-4 z-[100000]", "flex flex-col items-end gap-3", className)} aria-label="Quick contacts">
      {/* Phone on top */}
      <Link
        href={`tel:${hotline.replace(/\D/g, "")}`}
        aria-label="Gọi"
        className={cn(
          "w-12 h-12 rounded-full text-white shadow-lg leading-none",
          "grid place-items-center",
          "hover:scale-105 active:scale-95 transition-transform",
          "bg-[#22c55e]"
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
            bg
          )}
        >
          <Icon className="w-6 h-6" />
        </Link>
      ))}
    </div>
  );
}
