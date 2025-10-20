"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Button from "./Button";

interface CarouselProps {
  children: React.ReactNode[];
  autoScroll?: boolean;
  autoScrollInterval?: number;
}

export function Carousel({ children, autoScroll = true, autoScrollInterval = 5000 }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const totalSlides = React.Children.count(children);
  const [isPaused, setIsPaused] = React.useState(false);

  const scrollPrev = React.useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  }, [totalSlides]);

  const scrollNext = React.useCallback(() => {
    setCurrentIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  }, [totalSlides]);

  // Auto scroll functionality
  React.useEffect(() => {
    if (!autoScroll || isPaused || totalSlides <= 1) return;

    const interval = setInterval(() => {
      scrollNext();
    }, autoScrollInterval);

    return () => clearInterval(interval);
  }, [autoScroll, isPaused, totalSlides, autoScrollInterval, scrollNext]);

  return (
    <div className="relative w-full overflow-hidden" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {React.Children.map(children, (child, idx) => (
          <div key={idx} className="flex-shrink-0 w-full h-full">
            {child}
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {totalSlides > 1 && (
        <>
          <Button
            onClick={scrollPrev}
            variant="outline"
            size="icon"
            icon={ArrowLeft}
            className="absolute left-4 top-1/2 -translate-y-1/2 hover:-translate-y-1/2 z-10 rounded-full will-change-transform bg-background/80 hover:bg-background border-border/50 hover:border-border text-foreground"
          />

          <Button
            onClick={scrollNext}
            variant="outline"
            size="icon"
            icon={ArrowRight}
            className="absolute right-4 top-1/2 -translate-y-1/2 hover:-translate-y-1/2 z-10 rounded-full will-change-transform bg-background/80 hover:bg-background border-border/50 hover:border-border text-foreground"
          />
        </>
      )}

      {/* Dots indicators */}
      {totalSlides > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {Array.from({ length: totalSlides }, (_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex ? "bg-primary w-6" : "bg-muted-foreground/50 hover:bg-muted-foreground/75"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
