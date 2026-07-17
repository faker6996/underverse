"use client";

import Card from "./Card";
import { cn } from "../utils/cn";
import React, { useState, useEffect, useId, useRef } from "react";

type Variant = "destructive" | "warning" | "info";

/** Public props for the `AccessDenied` component. */
export interface AccessDeniedProps {
  title?: string;
  description?: string;
  variant?: Variant;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  children?: React.ReactNode; // actions
  overflowHidden?: boolean;
  code?: string;
}

const VARIANT_COLOR_VARS: Record<Variant, string> = {
  destructive: "var(--destructive)",
  warning: "var(--warning)",
  info: "var(--info)",
};

const VARIANT_DESIGNS: Record<Variant, {
  borderColor: string;
  iconBg: string;
  iconBorder: string;
  pulseRing: string;
  textColor: string;
}> = {
  destructive: {
    borderColor: "border-destructive/20 hover:border-destructive/40 focus-within:border-destructive/30",
    iconBg: "from-destructive/15 to-destructive/5 dark:from-destructive/25 dark:to-destructive/10",
    iconBorder: "border-destructive/20 group-hover:border-destructive/50",
    pulseRing: "bg-destructive/10 ring-destructive/5 dark:bg-destructive/20 dark:ring-destructive/10",
    textColor: "text-destructive",
  },
  warning: {
    borderColor: "border-warning/20 hover:border-warning/40 focus-within:border-warning/30",
    iconBg: "from-warning/15 to-warning/5 dark:from-warning/25 dark:to-warning/10",
    iconBorder: "border-warning/20 group-hover:border-warning/50",
    pulseRing: "bg-warning/10 ring-warning/5 dark:bg-warning/20 dark:ring-warning/10",
    textColor: "text-warning",
  },
  info: {
    borderColor: "border-info/20 hover:border-info/40 focus-within:border-info/30",
    iconBg: "from-info/15 to-info/5 dark:from-info/25 dark:to-info/10",
    iconBorder: "border-info/20 group-hover:border-info/50",
    pulseRing: "bg-info/10 ring-info/5 dark:bg-info/20 dark:ring-info/10",
    textColor: "text-info",
  },
};

export default function AccessDenied({
  title = "Access Restricted",
  description = "You do not have permission to access this area.",
  variant = "destructive",
  icon: Icon,
  className,
  children,
  overflowHidden = true,
  code = "403",
}: AccessDeniedProps) {
  const design = VARIANT_DESIGNS[variant];
  const colorVar = VARIANT_COLOR_VARS[variant];

  // Dynamic IDs for SVG references to prevent layout conflict when multiple instances are rendered
  const reactId = useId();
  const cleanId = reactId.replace(/:/g, "");
  const clipId = `white-clip-${cleanId}`;
  const textId = `text-s-${cleanId}`;
  const eyeId = `white-eye-${cleanId}`;
  const tornilloId = `tornillo-${cleanId}`;

  // SVG ref for precise client-coordinate bounding box calculations
  const svgRef = useRef<SVGSVGElement>(null);

  // Interactive mouse tracking state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [eyeCoords, setEyeCoords] = useState({ cx: 130, cy: 65 });
  const [isHovered, setIsHovered] = useState(false);

  // Handles flashlight spotlight positioning relative to the card container
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Robot eye tracks the screen cursor smoothly relative to its center coordinates
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      
      const rect = svgRef.current.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width * (130 / 260);
      const eyeCenterY = rect.top + rect.height * (65 / 118.9);

      const dx = e.clientX - eyeCenterX;
      const dy = e.clientY - eyeCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const maxShift = 11;
      let shiftX = 0;
      let shiftY = 0;

      if (distance > 0) {
        const currentShift = Math.min(maxShift, distance / 12);
        shiftX = (dx / distance) * currentShift;
        shiftY = (dy / distance) * currentShift;
      }

      setEyeCoords({
        cx: 130 + shiftX,
        cy: 65 + shiftY,
      });
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0 && svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width * (130 / 260);
        const eyeCenterY = rect.top + rect.height * (65 / 118.9);

        const dx = e.touches[0].clientX - eyeCenterX;
        const dy = e.touches[0].clientY - eyeCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const maxShift = 11;
        let shiftX = 0;
        let shiftY = 0;

        if (distance > 0) {
          const currentShift = Math.min(maxShift, distance / 12);
          shiftX = (dx / distance) * currentShift;
          shiftY = (dy / distance) * currentShift;
        }

        setEyeCoords({
          cx: 130 + shiftX,
          cy: 65 + shiftY,
        });
      }
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("touchmove", handleGlobalTouchMove);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("touchmove", handleGlobalTouchMove);
    };
  }, []);

  return (
    <Card
      className={cn(
        "relative p-8 md:p-12 text-center shadow-lg transition-all duration-500 ease-out",
        "bg-linear-to-br from-card/95 via-card/90 to-card/85",
        "border backdrop-blur-md group/ad",
        design.borderColor,
        className
      )}
      innerClassName={cn(
        "relative overflow-hidden",
        !overflowHidden ? "overflow-visible" : undefined
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Inline styles for custom animations to keep component portable */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ad-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes ad-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(12%, -8%) scale(1.08); }
        }
        @keyframes ad-drift-rev {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-10%, 12%) scale(0.92); }
        }
        @keyframes ad-alarm {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        .animate-ad-float {
          animation: ad-float 5s ease-in-out infinite;
        }
        .animate-ad-drift-1 {
          animation: ad-drift 10s ease-in-out infinite;
        }
        .animate-ad-drift-2 {
          animation: ad-drift-rev 12s ease-in-out infinite;
        }
        .animate-ad-alarm {
          animation: ad-alarm 0.5s ease-in-out infinite;
        }
      `}} />

      {/* 1. Ambient Glow Backdrops (drifting mesh gradients) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl md:rounded-3xl">
        {/* Top-left soft glow */}
        <div
          className="absolute -top-24 -left-24 w-64 h-64 rounded-full transition-transform duration-700 ease-out group-hover/ad:scale-110 animate-ad-drift-1"
          style={{
            backgroundImage: `radial-gradient(circle at center, color-mix(in oklch, ${colorVar} 25%, transparent) 0%, transparent 70%)`
          }}
        />
        {/* Bottom-right secondary subtle glow */}
        <div
          className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full transition-transform duration-700 ease-out group-hover/ad:scale-105 animate-ad-drift-2"
          style={{
            backgroundImage: `radial-gradient(circle at center, color-mix(in oklch, ${colorVar} 15%, transparent) 0%, transparent 70%)`
          }}
        />
      </div>

      {/* 2. Interactive Spotlight Tracker */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-100 rounded-2xl md:rounded-3xl"
          style={{
            background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, color-mix(in oklch, ${colorVar} 14%, transparent) 0%, transparent 80%)`,
          }}
        />
      )}

      {/* 3. Premium Dot Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none transition-opacity duration-300 group-hover/ad:opacity-[0.05] dark:group-hover/ad:opacity-[0.08]"
        style={{
          backgroundImage: `radial-gradient(currentColor 1.2px, transparent 1.2px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* 3.5 Centered Flashlight Backdrop (Hidden / Revealed by Cursor) */}
      <div className="absolute inset-0 select-none flex items-center justify-center pointer-events-none overflow-hidden rounded-2xl md:rounded-3xl z-0">
        {/* Base dim code */}
        <div className="text-[120px] md:text-[180px] font-black tracking-tighter opacity-10 dark:opacity-15 select-none text-muted-foreground/40 dark:text-muted-foreground/30 font-sans">
          {code}
        </div>
        {/* Revealed glowing code */}
        <div
          className="absolute text-[120px] md:text-[180px] font-black tracking-tighter select-none font-sans"
          style={{
            color: colorVar,
            opacity: isHovered ? 0.75 : 0,
            transition: "opacity 300ms ease",
            maskImage: `radial-gradient(120px circle at ${mousePos.x}px ${mousePos.y}px, black, transparent 120px)`,
            WebkitMaskImage: `radial-gradient(120px circle at ${mousePos.x}px ${mousePos.y}px, black, transparent 120px)`,
            filter: `drop-shadow(0 0 25px color-mix(in oklch, ${colorVar} 50%, transparent))`,
          }}
        >
          {code}
        </div>
      </div>

      {/* 4. Main Content Container */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* 5. Multi-layered Icon / Illustration Stage */}
        {Icon ? (
          <div className="relative flex items-center justify-center animate-ad-float">
            {/* Animated pulsing outer ring */}
            <div
              className={cn(
                "absolute w-20 h-20 rounded-full opacity-60 animate-pulse duration-2000 ring-8",
                design.pulseRing
              )}
            />
            {/* Middle glassmorphic backdrop with soft rotation on hover */}
            <div
              className={cn(
                "relative flex items-center justify-center p-4 rounded-2xl",
                "bg-linear-to-b border shadow-md transition-all duration-500 ease-out",
                "group-hover/ad:rotate-6 group-hover/ad:scale-105 group-hover/ad:shadow-lg",
                design.iconBg,
                design.iconBorder
              )}
            >
              <Icon className={cn("w-10 h-10 transition-transform duration-500 group-hover/ad:scale-110", design.textColor)} />
            </div>
          </div>
        ) : (
          /* Interactive Robot Face Illustration */
          <div className="relative w-full max-w-65 h-30 select-none animate-ad-float">
            <svg
              ref={svgRef}
              xmlns="http://www.w3.org/2000/svg"
              id="robot-error"
              viewBox="0 0 260 118.9"
              role="img"
              className="w-full h-full"
            >
              <title>403 Error</title>
              <defs>
                <clipPath id={clipId}>
                  <circle id={eyeId} cx="130" cy="65" r="20" />
                </clipPath>
                <text id={textId} className="font-sans font-black tracking-tighter" y="106" style={{ fontSize: code.length > 3 ? "80px" : "120px" }}>
                  {code}
                </text>
              </defs>
              {/* Flashing alarm light */}
              <path
                className="animate-ad-alarm"
                fill={variant === "destructive" ? "#e62326" : variant === "warning" ? "var(--warning)" : "var(--info)"}
                d="M120.9 19.6V9.1c0-5 4.1-9.1 9.1-9.1h0c5 0 9.1 4.1 9.1 9.1v10.6"
              />
              {/* Background shadow text */}
              <use href={`#${textId}`} x="-0.5px" y="-1px" fill="currentColor" className="opacity-15 dark:opacity-10 text-muted-foreground" />
              <use href={`#${textId}`} fill="currentColor" className="opacity-10 dark:opacity-5 text-muted-foreground" />
              <g id="robot">
                <g id="eye-wrap">
                  <use href={`#${eyeId}`} fill="currentColor" className="opacity-20 dark:opacity-15 text-muted-foreground" />
                  <circle
                    id="eyef"
                    clipPath={`url(#${clipId})`}
                    fill="currentColor"
                    className="text-foreground"
                    stroke={variant === "destructive" ? "#e62326" : variant === "warning" ? "var(--warning)" : "var(--info)"}
                    strokeWidth="2.5"
                    strokeMiterlimit="10"
                    cx={eyeCoords.cx}
                    cy={eyeCoords.cy}
                    r="11"
                  />
                  <ellipse fill="currentColor" className="opacity-30 dark:opacity-20 text-muted-foreground" cx="130" cy="40" rx="18" ry="12" />
                </g>
                <circle className="opacity-40 dark:opacity-30 text-muted-foreground" fill="currentColor" cx="105" cy="32" r="2.5" id={tornilloId} />
                <use href={`#${tornilloId}`} x="50" />
                <use href={`#${tornilloId}`} x="50" y="60" />
                <use href={`#${tornilloId}`} y="60" />
              </g>
            </svg>
          </div>
        )}

        {/* 6. Typography block */}
        <div className="space-y-2.5 max-w-sm mx-auto">
          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground transition-colors duration-300">
            {title}
          </h3>
          <p className="text-sm md:text-base text-muted-foreground/80 leading-relaxed font-normal">
            {description}
          </p>
        </div>

        {/* 7. Children / Action Buttons */}
        {children && (
          <div className="mt-2 flex flex-wrap gap-3 justify-center items-center relative z-20">
            {children}
          </div>
        )}
      </div>
    </Card>
  );
}
