"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";
import { cn } from "@/lib/utils/cn";

type AnimationVariant = "slide" | "fade" | "scale";
type Orientation = "horizontal" | "vertical";

interface CarouselProps {
  children: React.ReactNode[];
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
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startPos, setStartPos] = React.useState(0);
  const [currentTranslate, setCurrentTranslate] = React.useState(0);
  const [prevTranslate, setPrevTranslate] = React.useState(0);
  // Progress bar handled via rAF to avoid frequent React state updates
  const progressElRef = React.useRef<HTMLDivElement | null>(null);

  const carouselRef = React.useRef<HTMLDivElement>(null);
  const rafRef = React.useRef<number | null>(null);

  const totalSlides = React.Children.count(children);
  const maxIndex = Math.max(0, totalSlides - slidesToShow);
  const isHorizontal = orientation === "horizontal";

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

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
    };

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener("keydown", handleKeyDown);
      return () => carousel.removeEventListener("keydown", handleKeyDown);
    }
  }, [scrollPrev, scrollNext, scrollTo, maxIndex]);

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

    if (!autoScroll || isPaused || totalSlides <= slidesToShow) {
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
  }, [autoScroll, isPaused, totalSlides, slidesToShow, autoScrollInterval, scrollNext]);

  // Touch/Mouse drag handlers
  const getPositionX = (event: TouchEvent | MouseEvent) => {
    return event.type.includes("mouse") ? (event as MouseEvent).pageX : (event as TouchEvent).touches[0].clientX;
  };

  const getPositionY = (event: TouchEvent | MouseEvent) => {
    return event.type.includes("mouse") ? (event as MouseEvent).pageY : (event as TouchEvent).touches[0].clientY;
  };

  const touchStart = (event: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    const pos = isHorizontal ? getPositionX(event.nativeEvent) : getPositionY(event.nativeEvent);
    setStartPos(pos);
    setPrevTranslate(currentTranslate);
  };

  const touchMove = (event: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const pos = isHorizontal ? getPositionX(event.nativeEvent) : getPositionY(event.nativeEvent);
    const currentPosition = pos;
    setCurrentTranslate(prevTranslate + currentPosition - startPos);
  };

  const touchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const movedBy = currentTranslate - prevTranslate;
    const threshold = 50;

    if (movedBy < -threshold && currentIndex < maxIndex) {
      scrollNext();
    } else if (movedBy > threshold && currentIndex > 0) {
      scrollPrev();
    }

    setCurrentTranslate(0);
    setPrevTranslate(0);
  };

  // Call onSlideChange callback
  React.useEffect(() => {
    onSlideChange?.(currentIndex);
  }, [currentIndex, onSlideChange]);

  const getAnimationStyles = (): React.CSSProperties => {
    const baseTransform = isHorizontal
      ? `translateX(-${currentIndex * (100 / slidesToShow)}%)`
      : `translateY(-${currentIndex * (100 / slidesToShow)}%)`;

    if (animation === "fade") {
      return {
        transition: "opacity 500ms ease-in-out",
      };
    }

    if (animation === "scale") {
      return {
        transform: baseTransform,
        transition: "transform 500ms ease-in-out, scale 500ms ease-in-out",
      };
    }

    return {
      transform: baseTransform,
      transition: isDragging ? "none" : "transform 500ms ease-in-out",
    };
  };

  const slideWidth = 100 / slidesToShow;

  return (
    <div
      ref={carouselRef}
      className={cn(
        "relative w-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-2xl md:rounded-3xl",
        className,
      )}
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
        className={cn("flex", isHorizontal ? "flex-row" : "flex-col", containerClassName)}
        style={getAnimationStyles()}
        onTouchStart={touchStart}
        onTouchMove={touchMove}
        onTouchEnd={touchEnd}
        onMouseDown={touchStart}
        onMouseMove={touchMove}
        onMouseUp={touchEnd}
        onMouseLeave={touchEnd}
        role="group"
        aria-atomic="false"
        aria-live={autoScroll ? "off" : "polite"}
      >
        {React.Children.map(children, (child, idx) => (
          <div
            key={idx}
            className={cn(
              "shrink-0",
              isHorizontal ? "h-full" : "w-full",
              animation === "fade" && idx !== currentIndex && "opacity-0",
              animation === "scale" && idx !== currentIndex && "scale-95",
              slideClassName,
            )}
            style={{
              [isHorizontal ? "width" : "height"]: `${slideWidth}%`,
            }}
            role="group"
            aria-roledescription="slide"
            aria-label={`${idx + 1} of ${totalSlides}`}
            aria-hidden={idx < currentIndex || idx >= currentIndex + slidesToShow}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {showArrows && totalSlides > slidesToShow && (
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
              isHorizontal ? "left-4" : "top-4 left-1/2 -translate-x-1/2 rotate-90",
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
              isHorizontal ? "right-4" : "bottom-4 left-1/2 -translate-x-1/2 rotate-90",
            )}
            aria-label="Next slide"
          />
        </>
      )}

      {/* Dots indicators */}
      {showDots && totalSlides > slidesToShow && (
        <div
          className={cn(
            "absolute flex gap-2 z-10",
            isHorizontal ? "bottom-4 left-1/2 -translate-x-1/2 flex-row" : "right-4 top-1/2 -translate-y-1/2 flex-col",
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
                isHorizontal ? "w-2 h-2" : "w-2 h-2",
                idx === currentIndex ? `bg-primary ${isHorizontal ? "w-6" : "h-6"}` : "bg-muted-foreground/50 hover:bg-muted-foreground/75",
              )}
              aria-label={`Go to slide ${idx + 1}`}
              aria-selected={idx === currentIndex}
              role="tab"
            />
          ))}
        </div>
      )}

      {/* Thumbnail navigation */}
      {showThumbnails && totalSlides > slidesToShow && (
        <div
         
          className={cn(
            "absolute bottom-0 left-0 right-0 flex gap-2 p-4 bg-linear-to-t from-black/50 to-transparent overflow-x-auto",
            isHorizontal ? "flex-row" : "flex-col",
          )}
        >
          {React.Children.map(children, (child, idx) => (
            <button
              key={idx}
              onClick={() => scrollTo(idx)}
              className={cn(
                "shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary",
                idx === currentIndex ? "border-primary scale-110" : "border-transparent opacity-70 hover:opacity-100",
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
