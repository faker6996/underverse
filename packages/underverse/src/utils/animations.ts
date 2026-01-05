/**
 * ShadCN UI Animation Styles - Enhanced with smooth spring-like animations
 *
 * This module provides animation utilities used by Underverse UI components.
 * It can be used standalone or with the useShadCNAnimations hook.
 *
 * @example
 * ```tsx
 * import { useShadCNAnimations } from "@underverse-ui/underverse";
 *
 * function MyComponent() {
 *   useShadCNAnimations(); // Injects animation styles
 *   return <div data-state="open">Animated content</div>;
 * }
 * ```
 */

export const shadcnAnimationStyles = `
  /* ============================================
   * DROPDOWN / POPOVER ANIMATIONS
   * Uses spring-like cubic-bezier for natural feel
   * ============================================ */
  
  /* Native-like Combobox Animation - Mimics browser default select */
  [data-state="open"][data-combobox-dropdown] {
    animation: comboboxOpen 150ms cubic-bezier(0.2, 0, 0, 1);
    transform-origin: top center;
  }

  [data-state="closed"][data-combobox-dropdown] {
    animation: comboboxClose 120ms cubic-bezier(0.4, 0, 1, 1);
    transform-origin: top center;
  }

  @keyframes comboboxOpen {
    0% {
      opacity: 0;
      transform: translateY(-4px) scaleY(0.9);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scaleY(1);
    }
  }

  @keyframes comboboxClose {
    0% {
      opacity: 1;
      transform: translateY(0) scaleY(1);
    }
    100% {
      opacity: 0;
      transform: translateY(-4px) scaleY(0.9);
    }
  }

  /* Generic dropdown open/close */
  [data-state="open"] {
    animation: slideDownAndFade 220ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  [data-state="closed"] {
    animation: slideUpAndFade 180ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  @keyframes slideDownAndFade {
    from {
      opacity: 0;
      transform: translateY(-4px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @keyframes slideUpAndFade {
    from {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    to {
      opacity: 0;
      transform: translateY(-4px) scale(0.98);
    }
  }
  
  /* ============================================
   * DROPDOWN ITEMS - Native-like instant appearance
   * ============================================ */

  /* Fast staggered animation for native feel */
  .dropdown-item {
    opacity: 0;
    animation: itemFadeIn 120ms cubic-bezier(0.2, 0, 0, 1) forwards;
  }

  @keyframes itemFadeIn {
    from {
      opacity: 0;
      transform: translateX(-4px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  /* Item stagger delays - minimal for speed */
  .dropdown-item:nth-child(1) { animation-delay: 0ms; }
  .dropdown-item:nth-child(2) { animation-delay: 15ms; }
  .dropdown-item:nth-child(3) { animation-delay: 30ms; }
  .dropdown-item:nth-child(4) { animation-delay: 45ms; }
  .dropdown-item:nth-child(5) { animation-delay: 60ms; }
  .dropdown-item:nth-child(6) { animation-delay: 75ms; }
  .dropdown-item:nth-child(7) { animation-delay: 90ms; }
  .dropdown-item:nth-child(8) { animation-delay: 105ms; }
  .dropdown-item:nth-child(n+9) { animation-delay: 120ms; }

  /* ============================================
   * DATEPICKER ANIMATIONS
   * ============================================ */

  .datepicker-day {
    opacity: 0;
    animation: dayFadeIn 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes dayFadeIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* ============================================
   * TOOLTIP ANIMATIONS
   * ============================================ */

  [data-tooltip] {
    animation: tooltipIn 150ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes tooltipIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* ============================================
   * MODAL / DIALOG ANIMATIONS
   * ============================================ */

  .modal-content {
    animation: scaleIn 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  /* Smooth backdrop blur transition */
  .backdrop-animate {
    transition: backdrop-filter 200ms ease, background-color 200ms ease;
  }
`;

/**
 * Hook to inject ShadCN animation styles into the document head.
 * Call this hook in components that need animations.
 * The styles are only injected once, even if called multiple times.
 *
 * @example
 * ```tsx
 * function Dropdown() {
 *   useShadCNAnimations();
 *   return <div data-state="open">...</div>;
 * }
 * ```
 */
export function useShadCNAnimations(): void {
  if (typeof document !== "undefined") {
    const styleId = "shadcn-animations";
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement("style");
      styleElement.id = styleId;
      styleElement.textContent = shadcnAnimationStyles;
      document.head.appendChild(styleElement);
    }
  }
}

/**
 * Manually inject animation styles.
 * Useful for non-React environments or SSR.
 */
export function injectAnimationStyles(): void {
  useShadCNAnimations();
}

/**
 * Get the animation styles as a string.
 * Useful for including in a style tag or CSS file.
 */
export function getAnimationStyles(): string {
  return shadcnAnimationStyles;
}
