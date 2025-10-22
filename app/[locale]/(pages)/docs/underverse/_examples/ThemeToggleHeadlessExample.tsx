"use client";

import React from 'react';
import { ThemeToggle } from '@underverse-ui/underverse';

export default function ThemeToggleHeadlessExample() {
  const [theme, setTheme] = React.useState<'light'|'dark'|'system'>('system');
  return (
    <div className="flex items-center gap-3">
      <ThemeToggle theme={theme} onChange={setTheme} />
      <span className="text-sm text-muted-foreground">Current: <strong className="text-foreground">{theme}</strong></span>
    </div>
  );
}

