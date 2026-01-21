"use client";

import Image, { ImageProps } from "next/image";
import React from "react";
import { cn } from "@/lib/utils/cn";

type Fit = "cover" | "contain";

interface SmartImageProps {
  src: string | undefined | null;
  alt: string;
  className?: string;
  /**
   * Aspect ratio utility class, e.g. `aspect-square`, `aspect-4/3`.
   * If provided with `fill`, the wrapper enforces the ratio.
   */
  ratioClass?: string;
  /**
   * Rounded corners; defaults to `rounded-lg` to match project style.
   */
  roundedClass?: string;
  /**
   * When true, uses fill layout; otherwise width/height if provided.
   */
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  fit?: Fit;
  /** Control object position, e.g. 'center', 'top', 'left', '50% 50%'. */
  objectPosition?: React.CSSProperties["objectPosition"];
  /** Optional fallback src if original fails. */
  fallbackSrc?: string;
}

// SVG placeholder as data URL to avoid 404 errors
const DEFAULT_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Cpath fill='%239ca3af' d='M160 150h80v60h-80z'/%3E%3Ccircle fill='%239ca3af' cx='180' cy='130' r='20'/%3E%3Cpath fill='%239ca3af' d='M120 240l60-60 40 40 40-30 60 50v40H120z'/%3E%3C/svg%3E";

// Cache các URL đã lỗi để không gọi lại nhiều lần
const FAILED_SRCS = new Set<string>();

export default function SmartImage({
  src,
  alt,
  className,
  ratioClass,
  roundedClass = "rounded-2xl md:rounded-3xl",
  fill = true,
  width,
  height,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
  quality = 80,
  fit = "cover",
  objectPosition,
  fallbackSrc = DEFAULT_FALLBACK,
}: SmartImageProps) {
  const normalize = (input?: string | null) => {
    if (!input || input.length === 0) return fallbackSrc;
    const raw = input.trim();
    // Proactively convert local product JPGs -> PNG to avoid 404s
    if (raw.startsWith("/images/products/") && /\.(jpg|jpeg)($|\?)/i.test(raw)) {
      return raw.replace(/\.(jpg|jpeg)(?=$|\?)/i, ".png");
    }
    // Hỗ trợ protocol-relative //host/path -> https://host/path
    if (raw.startsWith("//")) {
      return `https:${raw}`;
    }
    // Cho phép absolute http(s), data:, blob:
    if (/^(https?:|data:|blob:)/i.test(raw)) {
      return FAILED_SRCS.has(raw) ? fallbackSrc : raw;
    }
    // Cho phép path bắt đầu bằng /
    if (raw.startsWith("/")) {
      return FAILED_SRCS.has(raw) ? fallbackSrc : raw;
    }
    // Các đường dẫn tương đối (vd: "invalid-url.jpg") -> thêm leading slash để tránh lỗi Next Image
    const normalized = `/${raw.replace(/^\.\/?/, "")}`;
    return FAILED_SRCS.has(normalized) ? fallbackSrc : normalized;
  };

  const [resolvedSrc, setResolvedSrc] = React.useState<string>(() => normalize(src));

  // Keep internal resolved source in sync when `src` prop changes
  React.useEffect(() => {
    setResolvedSrc(normalize(src));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const handleError: NonNullable<ImageProps["onError"]> = () => {
    // Ghi nhớ URL lỗi để lần sau bỏ qua
    if (resolvedSrc && resolvedSrc !== fallbackSrc) FAILED_SRCS.add(resolvedSrc);
    if (resolvedSrc.endsWith(".jpg")) {
      const next = resolvedSrc.replace(/\.jpg($|\?)/, ".png$1");
      setResolvedSrc(next);
    } else if (resolvedSrc !== fallbackSrc) {
      setResolvedSrc(fallbackSrc);
    }
  };

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div
      className={cn(
        "relative overflow-hidden bg-muted/30",
        // remove any default focus outline/ring for visual consistency with Card
        "outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0",
        ratioClass,
        roundedClass,
        className,
      )}
    >
      {children}
    </div>
  );

  if (fill) {
    return (
      <Wrapper>
        <Image
          src={resolvedSrc}
          alt={alt}
          fill
          sizes={sizes}
          onError={handleError}
          priority={priority}
          quality={quality}
          style={{ objectFit: fit, objectPosition }}
        />
      </Wrapper>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted/30",
        "outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0",
        roundedClass,
        className,
      )}
    >
      <Image
        src={resolvedSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        onError={handleError}
        priority={priority}
        quality={quality}
        style={{ objectFit: fit, objectPosition, width: "100%", height: "100%" }}
      />
    </div>
  );
}
