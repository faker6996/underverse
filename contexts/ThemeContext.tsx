"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { saveToLocalStorage, loadFromLocalStorage } from '@/lib/utils/local-storage';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark'; // The actual applied theme
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Lazy initial state - đọc localStorage ngay lần đầu
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = loadFromLocalStorage<Theme>('theme', 'system');
    if (['light', 'dark', 'system'].includes(savedTheme)) {
      return savedTheme;
    }
    return 'system';
  });
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = window.document.documentElement;
    
    const updateTheme = () => {
      let appliedTheme: 'light' | 'dark';
      
      if (theme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        appliedTheme = systemPrefersDark ? 'dark' : 'light';
      } else {
        appliedTheme = theme;
      }

      // Remove previous theme classes
      root.classList.remove('light', 'dark');
      
      // Add new theme class
      root.classList.add(appliedTheme);
      
      setActualTheme(appliedTheme);
      
      // Save to localStorage
      saveToLocalStorage('theme', theme);
    };

    updateTheme();

    // Listen for system theme changes when using 'system' mode
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateTheme();
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}