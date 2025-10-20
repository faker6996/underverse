// ShadCN UI Animation Styles
export const shadcnAnimationStyles = `
  [data-state="open"] {
    animation: slideDownAndFade 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  [data-state="closed"] {
    animation: slideUpAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  @keyframes slideDownAndFade {
    from {
      opacity: 0;
      transform: translateY(-2px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideUpAndFade {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-2px);
    }
  }
  
  .dropdown-item {
    opacity: 0;
    animation: fadeInUp 200ms ease-out forwards;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Tooltip specific animations */
  [data-side="top"] {
    animation: slideDownAndFade 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  [data-side="bottom"] {
    animation: slideUpAndFade 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  [data-side="left"] {
    animation: slideRightAndFade 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  [data-side="right"] {
    animation: slideLeftAndFade 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  @keyframes slideLeftAndFade {
    from {
      opacity: 0;
      transform: translateX(2px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideRightAndFade {
    from {
      opacity: 0;
      transform: translateX(-2px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

// Hook to inject ShadCN animation styles
export const useShadCNAnimations = () => {
  if (typeof document !== 'undefined') {
    const styleId = 'shadcn-animations';
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = shadcnAnimationStyles;
      document.head.appendChild(styleElement);
    }
  }
};