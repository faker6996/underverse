"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";
import { cn } from "../utils/cn";

type AnimationVariant = "slide" | "fade" | "scale" | "coverflow" | "stack";
type Orientation = "horizontal" | "vertical";
export type CarouselEffectPreset = "cinematic" | "gallery" | "poster" | "minimal";

export interface CarouselEffectOptions {
  mainScale?: number;
  sideScale?: number;
  farScale?: number;
  sideOpacity?: number;
  farOpacity?: number;
  sideOffset?: number;
  rotate?: number;
  depthStep?: number;
  blur?: number;
  stackOffset?: number;
  stackLift?: number;
}

/** Public props for the `Carousel` component. */
interface CarouselProps {
  children: React.ReactNode;
  autoScroll?: boolean;
  autoScrollInterval?: number;
  animation?: AnimationVariant;
  orientation?: Orientation;
  showArrows?: boolean;
  showDots?: boolean;
  showProgress?: boolean;
  showThumbnails?: boolean;
  loop?: boolean;
  slidesToShow?: number;
  slidesToScroll?: number;
  className?: string;
  containerClassName?: string;
  slideClassName?: string;
  onSlideChange?: (index: number) => void;
  thumbnailRenderer?: (child: React.ReactNode, index: number) => React.ReactNode;
  ariaLabel?: string;
  effectPreset?: CarouselEffectPreset;
  effectOptions?: CarouselEffectOptions;
}

export function Carousel({
  children,
  autoScroll = true,
  autoScrollInterval = 5000,
  animation = "slide",
  orientation = "horizontal",
  showArrows = true,
  showDots = true,
  showProgress = false,
  showThumbnails = false,
  loop = true,
  slidesToShow = 1,
  slidesToScroll = 1,
  className,
  containerClassName,
  slideClassName,
  onSlideChange,
  thumbnailRenderer,
  ariaLabel = "Carousel",
  effectPreset,
  effectOptions,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  // Progress bar handled via rAF to avoid frequent React state updates
  const progressElRef = React.useRef<HTMLDivElement | null>(null);

  const carouselRef = React.useRef<HTMLDivElement>(null);
  const rafRef = React.useRef<number | null>(null);
  const isDraggingRef = React.useRef(false);
  const dragDistanceRef = React.useRef(0);
  const startPosRef = React.useRef(0);
  const lastDragPositionRef = React.useRef(0);

  const slides = React.useMemo(() => React.Children.toArray(children), [children]);
  const totalSlides = slides.length;
  const isHorizontal = orientation === "horizontal";
  const effectiveAnimation = slidesToShow > 1 && !["slide", "coverflow", "stack"].includes(animation) ? "slide" : animation;
  const isDeckAnimation = effectiveAnimation === "coverflow" || effectiveAnimation === "stack";
  const effectiveSlidesToShow = isDeckAnimation ? 1 : slidesToShow;
  const maxIndex = Math.max(0, totalSlides - effectiveSlidesToShow);
  const shouldShowArrows = showArrows && isHorizontal;
  const presetEffectOptions = React.useMemo<CarouselEffectOptions>(() => {
    if (effectPreset === "cinematic") {
      return effectiveAnimation === "stack"
        ? {
            mainScale: 1.08,
            sideScale: 0.9,
            farScale: 0.84,
            sideOpacity: 0.68,
            farOpacity: 0.3,
            depthStep: 76,
            blur: 2.2,
            stackOffset: 16,
            stackLift: 16,
          }
        : {
            mainScale: 1.12,
            sideScale: 0.82,
            farScale: 0.72,
            sideOpacity: 0.84,
            farOpacity: 0.44,
            sideOffset: 22,
            rotate: 20,
            depthStep: 120,
            blur: 1.6,
          };
    }

    if (effectPreset === "gallery") {
      return effectiveAnimation === "stack"
        ? {
            mainScale: 1.03,
            sideScale: 0.94,
            farScale: 0.88,
            sideOpacity: 0.82,
            farOpacity: 0.5,
            depthStep: 50,
            blur: 0.8,
            stackOffset: 24,
            stackLift: 8,
          }
        : {
            mainScale: 1.05,
            sideScale: 0.9,
            farScale: 0.82,
            sideOpacity: 0.84,
            farOpacity: 0.48,
            sideOffset: 30,
            rotate: 16,
            depthStep: 78,
            blur: 1,
          };
    }

    if (effectPreset === "poster") {
      return effectiveAnimation === "stack"
        ? {
            mainScale: 1.12,
            sideScale: 0.88,
            farScale: 0.78,
            sideOpacity: 0.64,
            farOpacity: 0.22,
            depthStep: 92,
            blur: 2.8,
            stackOffset: 14,
            stackLift: 18,
          }
        : {
            mainScale: 1.16,
            sideScale: 0.78,
            farScale: 0.68,
            sideOpacity: 0.68,
            farOpacity: 0.18,
            sideOffset: 18,
            rotate: 26,
            depthStep: 140,
            blur: 3,
          };
    }

    if (effectPreset === "minimal") {
      return effectiveAnimation === "stack"
        ? {
            mainScale: 1.01,
            sideScale: 0.96,
            farScale: 0.92,
            sideOpacity: 0.88,
            farOpacity: 0.66,
            depthStep: 36,
            blur: 0,
            stackOffset: 26,
            stackLift: 6,
          }
        : {
            mainScale: 1.02,
            sideScale: 0.94,
            farScale: 0.88,
            sideOpacity: 0.9,
            farOpacity: 0.62,
            sideOffset: 34,
            rotate: 10,
            depthStep: 54,
            blur: 0,
          };
    }

    return {};
  }, [effectPreset, effectiveAnimation]);

  const mergedEffectOptions = React.useMemo(
    () => ({
      mainScale: 1.04,
      sideScale: effectiveAnimation === "stack" ? 0.93 : 0.88,
      farScale: effectiveAnimation === "stack" ? 0.86 : 0.76,
      sideOpacity: effectiveAnimation === "stack" ? 0.8 : 0.86,
      farOpacity: effectiveAnimation === "stack" ? 0.5 : 0.48,
      sideOffset: effectiveAnimation === "stack" ? 20 : 28,
      rotate: 24,
      depthStep: effectiveAnimation === "stack" ? 60 : 90,
      blur: 1.1,
      stackOffset: 20,
      stackLift: 12,
      ...presetEffectOptions,
      ...effectOptions,
    }),
    [effectOptions, effectiveAnimation, presetEffectOptions],
  );

  const scrollPrev = React.useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev === 0) {
        return loop ? maxIndex : 0;
      }
      return Math.max(0, prev - slidesToScroll);
    });
  }, [loop, maxIndex, slidesToScroll]);

  const scrollNext = React.useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev >= maxIndex) {
        return loop ? 0 : maxIndex;
      }
      return Math.min(maxIndex, prev + slidesToScroll);
    });
  }, [loop, maxIndex, slidesToScroll]);

  const scrollTo = React.useCallback(
    (index: number) => {
      setCurrentIndex(Math.min(maxIndex, Math.max(0, index)));
    },
    [maxIndex],
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        scrollPrev();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        scrollNext();
      } else if (e.key === "Home") {
        e.preventDefault();
        scrollTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        scrollTo(maxIndex);
      }
    },
    [scrollPrev, scrollNext, scrollTo, maxIndex],
  );

  // Auto scroll with progress (requestAnimationFrame)
  React.useEffect(() => {
    // Cleanup helper
    const stop = () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (progressElRef.current) progressElRef.current.style.width = "0%";
    };

    if (!autoScroll || isPaused || totalSlides <= effectiveSlidesToShow) {
      stop();
      return;
    }

    let start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const ratio = Math.min(1, elapsed / autoScrollInterval);
      if (progressElRef.current) {
        progressElRef.current.style.width = `${ratio * 100}%`;
      }
      if (ratio >= 1) {
        // Advance slide and restart cycle
        scrollNext();
        start = performance.now();
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return stop;
  }, [autoScroll, isPaused, totalSlides, effectiveSlidesToShow, autoScrollInterval, scrollNext]);

  // Touch/Mouse drag handlers
  const getPositionX = (event: TouchEvent | MouseEvent) => {
    return event.type.includes("mouse") ? (event as MouseEvent).pageX : (event as TouchEvent).touches[0].clientX;
  };

  const getPositionY = (event: TouchEvent | MouseEvent) => {
    return event.type.includes("mouse") ? (event as MouseEvent).pageY : (event as TouchEvent).touches[0].clientY;
  };

  const touchStart = (event: React.TouchEvent | React.MouseEvent) => {
    isDraggingRef.current = true;
    dragDistanceRef.current = 0;
    const pos = isHorizontal ? getPositionX(event.nativeEvent) : getPositionY(event.nativeEvent);
    startPosRef.current = pos;
    lastDragPositionRef.current = pos;
  };

  const touchMove = (event: React.TouchEvent | React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const pos = isHorizontal ? getPositionX(event.nativeEvent) : getPositionY(event.nativeEvent);
    lastDragPositionRef.current = pos;
    dragDistanceRef.current = Math.max(dragDistanceRef.current, Math.abs(pos - startPosRef.current));
  };

  const touchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const movedBy = lastDragPositionRef.current - startPosRef.current;
    const threshold = 50;

    if (movedBy < -threshold) {
      scrollNext();
    } else if (movedBy > threshold) {
      scrollPrev();
    }
    startPosRef.current = 0;
    lastDragPositionRef.current = 0;
  };

  const handleDeckAreaClick = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDeckAnimation || dragDistanceRef.current > 8) {
      dragDistanceRef.current = 0;
      return;
    }

    const activeDeck = event.currentTarget.querySelector("[data-active-deck='true']") as HTMLElement | null;
    if (!activeDeck) return;

    const activeRect = activeDeck.getBoundingClientRect();
    const x = event.clientX;

    if (x < activeRect.left) {
      scrollPrev();
      return;
    }

    if (x > activeRect.right) {
      scrollNext();
    }
  }, [isDeckAnimation, scrollNext, scrollPrev]);

  // Call onSlideChange callback
  React.useEffect(() => {
    onSlideChange?.(currentIndex);
  }, [currentIndex, onSlideChange]);

  const getAnimationStyles = (): React.CSSProperties => {
    if (effectiveAnimation !== "slide") {
      return {};
    }

      const baseTransform = isHorizontal
      ? `translateX(-${currentIndex * (100 / effectiveSlidesToShow)}%)`
      : `translateY(-${currentIndex * (100 / effectiveSlidesToShow)}%)`;

    return {
      transform: baseTransform,
      transition: "transform 500ms ease-in-out",
    };
  };

  const slideWidth = 100 / effectiveSlidesToShow;
  const getLoopDistance = React.useCallback(
    (index: number) => {
      if (totalSlides <= 0) return 0;
      const forward = index - currentIndex;
      if (!loop) return forward;
      const altForward = forward - totalSlides;
      const altBackward = forward + totalSlides;
      const candidates = [forward, altForward, altBackward];
      return candidates.reduce((best, candidate) => (Math.abs(candidate) < Math.abs(best) ? candidate : best), candidates[0] ?? 0);
    },
    [currentIndex, loop, totalSlides],
  );

  const getDeckSlideStyles = React.useCallback(
    (index: number): React.CSSProperties => {
      const distance = getLoopDistance(index);
      const absDistance = Math.abs(distance);
      const hidden = absDistance > 2;

      if (hidden) {
        return {
          opacity: 0,
          pointerEvents: "none",
          zIndex: 0,
          transform: `translate3d(0, 0, -${mergedEffectOptions.depthStep! * 2}px) scale(${mergedEffectOptions.farScale})`,
          filter: `blur(${mergedEffectOptions.blur! * 1.4}px)`,
        };
      }

      if (effectiveAnimation === "stack") {
        const xOffset = distance * mergedEffectOptions.stackOffset!;
        const yOffset = absDistance * mergedEffectOptions.stackLift!;
        const scale =
          distance === 0 ? mergedEffectOptions.mainScale! : distance === 1 || distance === -1 ? mergedEffectOptions.sideScale! : mergedEffectOptions.farScale!;
        return {
          opacity:
            distance === 0 ? 1 : distance === 1 || distance === -1 ? mergedEffectOptions.sideOpacity! : mergedEffectOptions.farOpacity!,
          transform: `translate3d(${xOffset}px, ${yOffset}px, -${absDistance * mergedEffectOptions.depthStep!}px) scale(${scale})`,
          filter: distance === 0 ? "blur(0px)" : `blur(${Math.min(absDistance, 2) * mergedEffectOptions.blur!}px)`,
          pointerEvents: "auto",
          zIndex: 30 - absDistance,
        };
      }

      const xOffset = distance * mergedEffectOptions.sideOffset!;
      const rotateY = distance * -mergedEffectOptions.rotate!;
      const scale =
        distance === 0 ? mergedEffectOptions.mainScale! : distance === 1 || distance === -1 ? mergedEffectOptions.sideScale! : mergedEffectOptions.farScale!;
      return {
        opacity:
          distance === 0 ? 1 : distance === 1 || distance === -1 ? mergedEffectOptions.sideOpacity! : mergedEffectOptions.farOpacity!,
        transform: `translate3d(${xOffset}%, 0, -${absDistance * mergedEffectOptions.depthStep!}px) rotateY(${rotateY}deg) scale(${scale})`,
        filter: distance === 0 ? "blur(0px)" : `blur(${Math.min(absDistance, 2) * mergedEffectOptions.blur!}px)`,
        pointerEvents: "auto",
        zIndex: 30 - absDistance,
      };
    },
    [effectiveAnimation, getLoopDistance, mergedEffectOptions],
  );

  return (
    <div
      ref={carouselRef}
      className={cn(
        "relative w-full overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl md:rounded-3xl",
        className,
      )}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label={ariaLabel}
      aria-roledescription="carousel"
      tabIndex={0}
    >
      {/* Progress bar */}
      {showProgress && autoScroll && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted z-20">
          <div ref={progressElRef} className="h-full bg-primary" style={{ width: "0%" }} />
        </div>
      )}

      {/* Slides container */}
      <div
        className={cn(
          effectiveAnimation === "slide" ? "flex" : "grid",
          effectiveAnimation === "slide" && (isHorizontal ? "flex-row" : "flex-col h-full"),
          isDeckAnimation && "place-items-center [transform-style:preserve-3d]",
          isHorizontal ? "touch-pan-y" : "touch-pan-x",
          containerClassName,
        )}
        style={isDeckAnimation ? { perspective: "1400px" } : getAnimationStyles()}
        onTouchStart={touchStart}
        onTouchMove={touchMove}
        onTouchEnd={touchEnd}
        onMouseDown={touchStart}
        onMouseMove={touchMove}
        onMouseUp={touchEnd}
        onMouseLeave={touchEnd}
        onClick={handleDeckAreaClick}
        role="group"
        aria-atomic="false"
        aria-live={autoScroll ? "off" : "polite"}
      >
        {slides.map((child, idx) => {
          const key = (React.isValidElement(child) && child.key) || idx;
          const ariaHidden = effectiveAnimation === "slide" ? idx < currentIndex || idx >= currentIndex + slidesToShow : idx !== currentIndex;

          if (isDeckAnimation) {
            return (
              <div
                key={key}
                className="col-start-1 row-start-1 flex w-full items-center justify-center pointer-events-none"
                aria-hidden={ariaHidden}
              >
                <div
                  className={cn(
                    "w-full max-w-[68%] md:max-w-[60%] transition-[opacity,transform,filter] duration-500 ease-out",
                    idx !== currentIndex && "cursor-pointer",
                    slideClassName,
                  )}
                  data-active-deck={idx === currentIndex ? "true" : undefined}
                  style={getDeckSlideStyles(idx)}
                  onClick={idx !== currentIndex ? () => scrollTo(idx) : undefined}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${idx + 1} of ${totalSlides}`}
                >
                  {child}
                </div>
              </div>
            );
          }

          return (
            <div
              key={key}
              className={cn(
                "shrink-0",
                effectiveAnimation === "slide" ? (isHorizontal ? "h-full" : "h-full w-full") : "col-start-1 row-start-1",
                effectiveAnimation === "fade" &&
                  (idx === currentIndex ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"),
                effectiveAnimation === "scale" &&
                  (idx === currentIndex ? "opacity-100 scale-100 z-10" : "opacity-0 scale-95 pointer-events-none z-0"),
                effectiveAnimation !== "slide" && "transition-[opacity,transform] duration-500 ease-in-out",
                slideClassName,
              )}
              style={effectiveAnimation === "slide" ? { [isHorizontal ? "width" : "height"]: `${slideWidth}%` } : undefined}
              role="group"
              aria-roledescription="slide"
              aria-label={`${idx + 1} of ${totalSlides}`}
              aria-hidden={ariaHidden}
            >
              {child}
            </div>
          );
        })}
      </div>

      {/* Navigation arrows */}
      {shouldShowArrows && totalSlides > effectiveSlidesToShow && (
        <>
          <Button
            onClick={scrollPrev}
            variant="ghost"
            size="icon"
            icon={ChevronLeft}
            noHoverOverlay
            disabled={!loop && currentIndex === 0}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 hover:-translate-y-1/2 active:-translate-y-1/2 z-10 rounded-full will-change-transform backdrop-blur-0 hover:backdrop-blur-0 hover:bg-transparent border-0",
              "max-md:h-8 max-md:w-8 max-md:border max-md:border-border/60 max-md:bg-background/75 max-md:backdrop-blur-sm max-md:shadow-sm",
              isHorizontal ? "left-4 max-md:left-2" : "top-4 left-1/2 -translate-x-1/2 rotate-90 max-md:top-2",
            )}
            aria-label="Previous slide"
          />

          <Button
            onClick={scrollNext}
            variant="ghost"
            size="icon"
            icon={ChevronRight}
            noHoverOverlay
            disabled={!loop && currentIndex >= maxIndex}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 hover:-translate-y-1/2 active:-translate-y-1/2 z-10 rounded-full will-change-transform backdrop-blur-0 hover:backdrop-blur-0 hover:bg-transparent border-0",
              "max-md:h-8 max-md:w-8 max-md:border max-md:border-border/60 max-md:bg-background/75 max-md:backdrop-blur-sm max-md:shadow-sm",
              isHorizontal ? "right-4 max-md:right-2" : "bottom-4 left-1/2 -translate-x-1/2 rotate-90 max-md:bottom-2",
            )}
            aria-label="Next slide"
          />
        </>
      )}

      {/* Dots indicators */}
      {showDots && totalSlides > effectiveSlidesToShow && (
        <div
          className={cn(
            "absolute flex gap-2 z-10",
            isHorizontal ? "bottom-4 left-1/2 -translate-x-1/2 flex-row max-md:bottom-2" : "right-4 top-1/2 -translate-y-1/2 flex-col max-md:right-2",
          )}
          role="tablist"
          aria-label="Carousel pagination"
        >
          {Array.from({ length: maxIndex + 1 }, (_, idx) => (
            <button
              key={idx}
              onClick={() => scrollTo(idx)}
              className={cn(
                "rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "max-md:w-1.5 max-md:h-1.5",
                isHorizontal ? "w-2 h-2" : "w-2 h-2",
                idx === currentIndex
                  ? `bg-primary ${isHorizontal ? "w-6 max-md:w-4" : "h-6 max-md:h-4"}`
                  : "bg-muted-foreground/50 hover:bg-muted-foreground/75",
              )}
              aria-label={`Go to slide ${idx + 1}`}
              aria-selected={idx === currentIndex}
              role="tab"
            />
          ))}
        </div>
      )}

      {/* Thumbnail navigation */}
      {showThumbnails && totalSlides > effectiveSlidesToShow && (
        <div
         
          className={cn(
            "absolute bottom-0 left-0 right-0 flex gap-2 p-4 bg-linear-to-t from-black/50 to-transparent overflow-x-auto",
            "max-md:gap-1.5 max-md:p-2",
            isHorizontal ? "flex-row" : "flex-col",
          )}
        >
          {React.Children.map(children, (child, idx) => (
            <button
              key={idx}
              onClick={() => scrollTo(idx)}
              className={cn(
                "shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary",
                "max-md:w-12 max-md:h-12",
                idx === currentIndex ? "border-primary md:scale-110" : "border-transparent opacity-70 hover:opacity-100",
              )}
              aria-label={`Thumbnail ${idx + 1}`}
            >
              {thumbnailRenderer ? thumbnailRenderer(child, idx) : child}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Carousel;
