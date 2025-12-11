// ShadCN UI Animation Styles - Enhanced with smooth spring-like animations
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
    0% {
      opacity: 0;
      transform: translateY(-2px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Subtle hover effect */
  .dropdown-item {
    transition: background-color 100ms ease;
  }
  
  /* ============================================
   * TOOLTIP / SIDE ANIMATIONS
   * ============================================ */
  
  [data-side="top"] {
    animation: slideFromBottom 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  [data-side="bottom"] {
    animation: slideFromTop 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  [data-side="left"] {
    animation: slideFromRight 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  [data-side="right"] {
    animation: slideFromLeft 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  @keyframes slideFromTop {
    from {
      opacity: 0;
      transform: translateY(-6px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @keyframes slideFromBottom {
    from {
      opacity: 0;
      transform: translateY(6px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @keyframes slideFromLeft {
    from {
      opacity: 0;
      transform: translateX(-6px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }
  
  @keyframes slideFromRight {
    from {
      opacity: 0;
      transform: translateX(6px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }
  
  /* ============================================
   * UTILITY ANIMATIONS
   * ============================================ */
  
  .animate-bounce-subtle {
    animation: bounceSubtle 600ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  @keyframes bounceSubtle {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }
  
  .animate-scale-in {
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

// Hook to inject ShadCN animation styles
export const useShadCNAnimations = () => {
  if (typeof document !== "undefined") {
    const styleId = "shadcn-animations";
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement("style");
      styleElement.id = styleId;
      styleElement.textContent = shadcnAnimationStyles;
      document.head.appendChild(styleElement);
    }
  }
};
