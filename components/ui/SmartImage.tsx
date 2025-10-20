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
   * Aspect ratio utility class, e.g. `aspect-square`, `aspect-[4/3]`.
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
  /** Optional fallback src if original fails. */
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK = "/images/products/hoa-hong-do.png";

export default function SmartImage({
  src,
  alt,
  className,
  ratioClass,
  roundedClass = "rounded-lg",
  fill = true,
  width,
  height,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
  quality = 80,
  fit = "cover",
  fallbackSrc = DEFAULT_FALLBACK,
}: SmartImageProps) {
  const normalize = (input?: string | null) => {
    if (!input || input.length === 0) return fallbackSrc;
    // Proactively convert local product JPGs -> PNG to avoid 404s
    if (input.startsWith("/images/products/") && /\.(jpg|jpeg)($|\?)/i.test(input)) {
      return input.replace(/\.(jpg|jpeg)(?=$|\?)/i, ".png");
    }
    return input;
  };

  const [resolvedSrc, setResolvedSrc] = React.useState<string>(() => normalize(src));

  const handleError: NonNullable<ImageProps["onError"]> = () => {
    if (resolvedSrc.endsWith(".jpg")) {
      setResolvedSrc(resolvedSrc.replace(/\.jpg($|\?)/, ".png$1"));
    } else if (resolvedSrc !== fallbackSrc) {
      setResolvedSrc(fallbackSrc);
    }
  };

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div className={cn("relative overflow-hidden bg-muted/30", ratioClass, roundedClass, className)}>
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
          style={{ objectFit: fit }}
        />
      </Wrapper>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-muted/30", roundedClass, className)}>
      <Image
        src={resolvedSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        onError={handleError}
        priority={priority}
        quality={quality}
        style={{ objectFit: fit, width: "100%", height: "100%" }}
      />
    </div>
  );
}
