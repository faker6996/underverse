export const VARIANT_STYLES_BTN = {
  // Mặc định: tối giản, rõ ràng, dùng tokens hệ màu
  default:
    "bg-background/80 backdrop-blur-sm text-foreground border border-border hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",

  // Viền: trong suốt, viền tinh tế, hover nhẹ
  outline:
    "bg-transparent backdrop-blur-sm border border-input hover:bg-accent/40 hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",

  // Primary: dùng brand, bỏ hiệu ứng scale/shadow mạnh
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm border border-primary/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",

  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm border border-secondary/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",

  success:
    "bg-success text-success-foreground hover:bg-success/90 shadow-sm border border-success/20 focus-visible:ring-2 focus-visible:ring-success/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",

  danger:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm border border-destructive/20 focus-visible:ring-2 focus-visible:ring-destructive/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",

  // Alias for shadcn-style prop naming used in some components
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm border border-destructive/20 focus-visible:ring-2 focus-visible:ring-destructive/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",

  warning:
    "bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm border border-warning/20 focus-visible:ring-2 focus-visible:ring-warning/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",

  info: "bg-info text-info-foreground hover:bg-info/90 shadow-sm border border-info/20 focus-visible:ring-2 focus-visible:ring-info/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",

  // Ghost: minimal
  ghost: "bg-transparent hover:bg-accent/20 hover:text-accent-foreground backdrop-blur-sm transition-colors",

  // Link: chỉ văn bản
  link: "text-primary bg-transparent underline-offset-4 hover:underline hover:text-primary/85 transition-colors",

  // Gradient: tuỳ chọn, giảm shadow
  gradient: "bg-linear-to-r from-primary via-secondary to-accent text-primary-foreground hover:opacity-90 shadow-sm border border-primary/10",
};

export const SIZE_STYLES_BTN = {
  sm: "px-3 py-1.5 text-sm h-8 min-w-8 md:px-2.5 md:py-1 md:h-7 md:text-xs",
  md: "px-4 py-2 text-sm h-10 min-w-10 md:px-3 md:py-1.5 md:h-9",
  lg: "px-6 py-3 text-base h-12 min-w-12 md:px-4 md:py-2 md:h-10 md:text-sm",
  smx: "px-3.5 py-1.5 text-[13px] h-9 min-w-9 md:px-3 md:py-1 md:h-8 md:text-xs",
  icon: "w-11 h-11 p-0 rounded-full flex items-center justify-center md:w-10 md:h-10",
};
