"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

export type IconComponent = React.ComponentType<{ className?: string }>;

export interface FallingIconsProps {
  icon?: IconComponent;
  imageUrl?: string; // Custom image URL to use instead of icon
  count?: number;
  className?: string;
  areaClassName?: string;
  colorClassName?: string;
  zIndex?: number;
  speedRange?: [number, number]; // seconds
  sizeRange?: [number, number]; // px
  horizontalDrift?: number; // px amplitude
  spin?: boolean;
  fullScreen?: boolean;
  // Randomize properties again each time a particle finishes a fall
  randomizeEachLoop?: boolean;
  // Modern UI enhancements
  glow?: boolean; // Add glow/shadow effect
  glowColor?: string; // Custom glow color
  glowIntensity?: number; // 0-1
  trail?: boolean; // Add particle trail effect
  trailLength?: number; // Number of trail particles (1-5)
  physics?: {
    gravity?: number; // 0.5-2, default 1
    windDirection?: number; // -1 (left) to 1 (right), default 0
    windStrength?: number; // 0-1
    rotation?: boolean; // Physics-based rotation
  };
  easingFunction?: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out" | "bounce" | "elastic";
}

type Particle = {
  leftPct: number;
  size: number;
  fallDur: number;
  delay: number;
  driftAmp: number;
  spinDur: number;
  key: number;
};

const DEFAULT_COUNT = 24;
const DEFAULT_SPEED_RANGE: [number, number] = [6, 14];
const DEFAULT_SIZE_RANGE: [number, number] = [14, 28];

export default function FallingIcons({
  icon: Icon,
  imageUrl,
  count = DEFAULT_COUNT,
  className,
  areaClassName,
  colorClassName,
  zIndex = 10,
  speedRange = DEFAULT_SPEED_RANGE,
  sizeRange = DEFAULT_SIZE_RANGE,
  horizontalDrift = 24,
  spin = true,
  fullScreen = false,
  randomizeEachLoop = true,
  // Modern UI enhancements
  glow = false,
  glowColor = "currentColor",
  glowIntensity = 0.5,
  trail = false,
  trailLength = 3,
  physics,
  easingFunction = "linear",
}: FallingIconsProps) {
  const uid = React.useId().replace(/[:]/g, "");
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [fallDist, setFallDist] = React.useState<number | null>(null);
  const idRef = React.useRef(1);

  // Physics calculations
  const gravity = physics?.gravity ?? 1;
  const windDirection = physics?.windDirection ?? 0;
  const windStrength = physics?.windStrength ?? 0;
  const physicsRotation = physics?.rotation ?? false;

  // Easing function mapping
  const easingMap: Record<string, string> = {
    linear: "linear",
    ease: "ease",
    "ease-in": "ease-in",
    "ease-out": "ease-out",
    "ease-in-out": "ease-in-out",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    elastic: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  };

  const makeParticle = React.useCallback((): Particle => {
    const rnd = (min: number, max: number) => min + Math.random() * (max - min);
    return {
      leftPct: rnd(0, 100),
      size: rnd(sizeRange[0], sizeRange[1]),
      fallDur: rnd(speedRange[0], speedRange[1]) / gravity, // Apply gravity to speed
      delay: rnd(-10, 0),
      driftAmp: rnd(horizontalDrift * 0.5, horizontalDrift) + (windDirection * windStrength * 50), // Apply wind
      spinDur: rnd(2, 6),
      key: idRef.current++,
    };
  }, [sizeRange, speedRange, horizontalDrift, gravity, windDirection, windStrength]);

  const [particles, setParticles] = React.useState<Particle[]>([]);

  // Initialize particles
  React.useEffect(() => {
    const arr: Particle[] = Array.from({ length: Math.max(0, count) }).map(() => makeParticle());
    setParticles(arr);
  }, [count, makeParticle]);

  // Measure container height to drive fall distance in px
  React.useEffect(() => {
    if (fullScreen) {
      const measure = () => setFallDist(window.innerHeight + 200);
      measure();
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    const el = containerRef.current;
    if (!el) return;
    const measure = () => setFallDist(el.offsetHeight + 200);
    measure();
    const ResizeObserverCtor: any = (window as any).ResizeObserver;
    if (ResizeObserverCtor) {
      const ro: any = new ResizeObserverCtor(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [fullScreen]);

  const FallName = `uv-fall-${uid}`;
  const SwayName = `uv-sway-${uid}`;
  const SpinName = `uv-spin-${uid}`;
  const PopName = `uv-pop-${uid}`;
  const PhysicsSpinName = `uv-physics-spin-${uid}`;

  // Calculate glow styles
  const glowStyles = React.useMemo(() => {
    if (!glow) return {};
    const intensity = Math.max(0, Math.min(1, glowIntensity));
    return {
      filter: `drop-shadow(0 0 ${4 * intensity}px ${glowColor}) drop-shadow(0 0 ${8 * intensity}px ${glowColor})`,
    };
  }, [glow, glowColor, glowIntensity]);

  // Provide a minimal fallback icon (circle) if none is passed
  const FallbackIcon = React.useMemo<IconComponent>(() => (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  ), []);

  // Use custom image if provided, otherwise use icon
  const TheIcon = imageUrl
    ? ({ className: imgClassName }: { className?: string }) => (
        <img
          src={imageUrl}
          alt=""
          className={cn("w-full h-full object-cover rounded-sm", imgClassName)}
          draggable={false}
        />
      )
    : (Icon || FallbackIcon);

  return (
    <div
      ref={containerRef}
      className={cn(
        fullScreen
          ? "fixed inset-0 overflow-hidden pointer-events-none"
          : "relative w-full h-full overflow-hidden",
        areaClassName
      )}
      style={{ zIndex }}
    >
      <style>{`
        @keyframes ${FallName} {
          0% { transform: translate3d(0, -10vh, 0); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translate3d(0, var(--fall, 120vh), 0); opacity: 0.95; }
        }
        @keyframes ${SwayName} {
          0% { transform: translateX(0); }
          50% { transform: translateX(var(--amp, 16px)); }
          100% { transform: translateX(0); }
        }
        @keyframes ${SpinName} {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes ${PopName} {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.3); }
        }
        @keyframes ${PhysicsSpinName} {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(90deg) scale(1.05); }
          50% { transform: rotate(180deg) scale(1); }
          75% { transform: rotate(270deg) scale(1.05); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .uv-falling-particle {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>

      <div
        className={cn(
          "absolute inset-0 pointer-events-none",
          className
        )}
        aria-hidden
      >
        {particles.map((p, i) => {
          const swayDuration = p.fallDur * (0.8 + (i % 5) * 0.05);
          const spinDuration = Math.max(1, p.spinDur);
          const handlePop: React.MouseEventHandler<HTMLSpanElement> = () => {
            // Replace particle to simulate vanish + respawn
            setParticles((prev) => {
              const next = prev.slice();
              const np = makeParticle();
              np.delay = -Math.random() * 8;
              next[i] = np;
              return next;
            });
          };

          // Render trail particles
          const trailParticles = trail ? Array.from({ length: Math.min(5, Math.max(1, trailLength)) }) : [];

          return (
            <React.Fragment key={p.key}>
              {/* Trail particles */}
              {trail && trailParticles.map((_, trailIndex) => {
                const trailDelay = p.delay - (trailIndex + 1) * 0.15;
                const trailOpacity = 1 - (trailIndex + 1) * (1 / (trailParticles.length + 1));
                const trailScale = 1 - (trailIndex + 1) * 0.15;

                return (
                  <span
                    key={`${p.key}-trail-${trailIndex}`}
                    className={cn("absolute top-0 will-change-transform pointer-events-none uv-falling-particle", colorClassName)}
                    style={{
                      left: `${p.leftPct}%`,
                      animationDelay: `${trailDelay}s`,
                      animationDuration: `${p.fallDur}s`,
                      animationName: FallName,
                      animationTimingFunction: easingMap[easingFunction] || "linear",
                      animationIterationCount: "infinite",
                      opacity: trailOpacity * 0.4,
                      ["--fall" as any]: `${fallDist ?? (typeof window !== 'undefined' ? window.innerHeight + 200 : 1200)}px`,
                    } as React.CSSProperties}
                  >
                    <span
                      className="inline-block uv-sway"
                      style={{
                        transform: `translateX(-50%) scale(${trailScale})`,
                        animationName: SwayName,
                        animationDuration: `${swayDuration}s`,
                        animationTimingFunction: "ease-in-out",
                        animationIterationCount: "infinite",
                        ["--amp" as any]: `${Math.round(p.driftAmp)}px`,
                      } as React.CSSProperties}
                    >
                      <span
                        className="block"
                        style={{
                          width: p.size,
                          height: p.size,
                          ...glowStyles,
                        } as React.CSSProperties}
                      >
                        <TheIcon className={cn("w-full h-full text-primary/70", colorClassName)} />
                      </span>
                    </span>
                  </span>
                );
              })}

              {/* Main particle */}
              <span
                className={cn("absolute top-0 will-change-transform pointer-events-auto uv-falling-particle", colorClassName)}
                style={{
                  left: `${p.leftPct}%`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.fallDur}s`,
                  animationName: FallName,
                  animationTimingFunction: easingMap[easingFunction] || "linear",
                  animationIterationCount: "infinite",
                  ["--fall" as any]: `${fallDist ?? (typeof window !== 'undefined' ? window.innerHeight + 200 : 1200)}px`,
                } as React.CSSProperties}
                onMouseEnter={handlePop}
                onAnimationIteration={(ev: React.AnimationEvent<HTMLSpanElement>) => {
                  // Ignore bubbled events from inner sway/spin animations
                  if (ev.currentTarget !== ev.target) return;
                  if (!randomizeEachLoop) return;
                  if (ev.animationName !== FallName) return;
                  setParticles((prev) => {
                    const next = prev.slice();
                    const np = makeParticle();
                    // Start immediately on next cycle
                    np.delay = -Math.random() * 4;
                    next[i] = np;
                    return next;
                  });
                }}
              >
                <span
                  className="inline-block uv-sway"
                  style={{
                    transform: `translateX(-50%)`,
                    animationName: SwayName,
                    animationDuration: `${swayDuration}s`,
                    animationTimingFunction: "ease-in-out",
                    animationIterationCount: "infinite",
                    ["--amp" as any]: `${Math.round(p.driftAmp)}px`,
                  } as React.CSSProperties}
                >
                  <span
                    className={cn(
                      "block uv-spin hover:animate-[var(--popName)_0.35s_ease-out_forwards]",
                      physicsRotation
                        ? "animate-[var(--physicsSpinName)_var(--spinDur)_ease-in-out_infinite]"
                        : spin && "animate-[var(--spinName)_var(--spinDur)_linear_infinite]"
                    )}
                    style={{
                      width: p.size,
                      height: p.size,
                      ["--spinName" as any]: SpinName,
                      ["--physicsSpinName" as any]: PhysicsSpinName,
                      ["--spinDur" as any]: `${spinDuration}s`,
                      ["--popName" as any]: PopName,
                      ...glowStyles,
                    } as React.CSSProperties}
                  >
                    <TheIcon className={cn("w-full h-full text-primary/70", colorClassName)} />
                  </span>
                </span>
              </span>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
