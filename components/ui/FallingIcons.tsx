"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

export type IconComponent = React.ComponentType<{ className?: string }>;

export interface FallingIconsProps {
  icon?: IconComponent;
  count?: number;
  className?: string;
  areaClassName?: string;
  colorClassName?: string;
  zIndex?: number;
  speedRange?: [number, number]; // seconds
  sizeRange?: [number, number]; // px
  horizontalDrift?: number; // px amplitude
  spin?: boolean;
  pauseOnHover?: boolean;
  fullScreen?: boolean;
  // Randomize properties again each time a particle finishes a fall
  randomizeEachLoop?: boolean;
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
  count = DEFAULT_COUNT,
  className,
  areaClassName,
  colorClassName,
  zIndex = 10,
  speedRange = DEFAULT_SPEED_RANGE,
  sizeRange = DEFAULT_SIZE_RANGE,
  horizontalDrift = 24,
  spin = true,
  pauseOnHover = false,
  fullScreen = false,
  randomizeEachLoop = true,
}: FallingIconsProps) {
  const uid = React.useId().replace(/[:]/g, "");
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [fallDist, setFallDist] = React.useState<number | null>(null);
  const idRef = React.useRef(1);

  const makeParticle = React.useCallback((): Particle => {
    const rnd = (min: number, max: number) => min + Math.random() * (max - min);
    return {
      leftPct: rnd(0, 100),
      size: rnd(sizeRange[0], sizeRange[1]),
      fallDur: rnd(speedRange[0], speedRange[1]),
      delay: rnd(-10, 0),
      driftAmp: rnd(horizontalDrift * 0.5, horizontalDrift),
      spinDur: rnd(2, 6),
      key: idRef.current++,
    };
  }, [sizeRange, speedRange, horizontalDrift]);

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

  // Provide a minimal fallback icon (circle) if none is passed
  const FallbackIcon = React.useMemo<IconComponent>(() => (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  ), []);

  const TheIcon = Icon || FallbackIcon;

  return (
    <div
      ref={containerRef}
      className={cn(fullScreen ? "fixed inset-0 overflow-hidden pointer-events-none" : "relative overflow-hidden", areaClassName)}
      style={{ zIndex }}
    >
      <style jsx>{`
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
      `}</style>

      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          pauseOnHover && "[animation-play-state:running] hover:[animation-play-state:paused]",
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
          return (
            <span
              key={p.key}
              className={cn("absolute top-0 will-change-transform pointer-events-auto", colorClassName)}
              style={{
                left: `${p.leftPct}%`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.fallDur}s`,
                animationName: FallName,
                animationTimingFunction: "linear",
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
                className="inline-block"
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
                  className={cn("block hover:[animation:var(--popName)_0.35s_ease-out_forwards]", spin && "[animation:var(--spinName)_var(--spinDur)_linear_infinite]")}
                  style={{
                    width: p.size,
                    height: p.size,
                    ["--spinName" as any]: SpinName,
                    ["--spinDur" as any]: `${spinDuration}s`,
                    ["--popName" as any]: PopName,
                  } as React.CSSProperties}
                >
                  <TheIcon className={cn("w-full h-full text-primary/70", colorClassName)} />
                </span>
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
