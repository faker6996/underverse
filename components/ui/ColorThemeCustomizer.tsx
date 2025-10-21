"use client";

import React, { useState, useEffect, useRef } from "react";
import { Palette, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Button from "./Button";
import Input from "./Input";
import { createPortal } from "react-dom";

// Convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : null;
}

// Convert RGB to OKLCH (simplified conversion)
function rgbToOklch(r: number, g: number, b: number): string {
  // Linear RGB
  const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);

  // Convert to OKLab
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  // Convert to LCH
  const C = Math.sqrt(a * a + b_ * b_);
  let h = Math.atan2(b_, a) * (180 / Math.PI);
  if (h < 0) h += 360;

  // Format as OKLCH
  const lightness = Math.round(L * 100);
  const chroma = Math.round(C * 100) / 100;
  const hue = Math.round(h);

  return `oklch(${lightness}% ${chroma.toFixed(2)} ${hue})`;
}

// Convert hex to OKLCH
function hexToOklch(hex: string): string | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToOklch(rgb.r, rgb.g, rgb.b);
}

const DEFAULT_COLOR = "00E0FF";

export default function ColorThemeCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const [hexColor, setHexColor] = useState(DEFAULT_COLOR);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    setMounted(true);
    // Load saved color
    const saved = localStorage.getItem("customPrimaryColor");
    if (saved) {
      setHexColor(saved);
      applyColor(saved);
    }
  }, []);

  const calculatePosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    return {
      top: rect.bottom + scrollTop + 8,
      left: rect.right + scrollLeft - 320, // Align right
    };
  };

  const applyColor = (hex: string) => {
    const cleanHex = hex.replace("#", "");
    const oklch = hexToOklch(cleanHex);

    if (!oklch) return;

    // Apply to CSS variables
    const root = document.documentElement;

    // Light mode
    root.style.setProperty("--primary", oklch);

    // Dark mode - slightly brighter
    const rgb = hexToRgb(cleanHex);
    if (rgb) {
      const brighterOklch = rgbToOklch(
        Math.min(rgb.r * 1.1, 1),
        Math.min(rgb.g * 1.1, 1),
        Math.min(rgb.b * 1.1, 1)
      );
      root.style.setProperty("--primary-dark", brighterOklch);

      // Update dark mode class
      if (root.classList.contains("dark")) {
        root.style.setProperty("--primary", brighterOklch);
      }
    }

    // Save to localStorage
    localStorage.setItem("customPrimaryColor", cleanHex);
  };

  const handleApply = () => {
    applyColor(hexColor);
    setIsOpen(false);
  };

  const handleReset = () => {
    setHexColor(DEFAULT_COLOR);
    applyColor(DEFAULT_COLOR);
    localStorage.removeItem("customPrimaryColor");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace("#", "").toUpperCase();
    if (/^[0-9A-F]{0,6}$/.test(value)) {
      setHexColor(value);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setDropdownPosition(calculatePosition());
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        const dropdown = document.getElementById("color-customizer-dropdown");
        if (
          dropdown &&
          !dropdown.contains(e.target as Node) &&
          !triggerRef.current?.contains(e.target as Node)
        ) {
          handleClose();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  if (!mounted) return null;

  const previewColor = `#${hexColor}`;

  return (
    <>
      <button
        ref={triggerRef}
        onClick={handleOpen}
        className={cn(
          "relative p-2 rounded-md transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          isOpen && "bg-accent"
        )}
        title="Customize theme color"
      >
        <Palette className="w-5 h-5" />
      </button>

      {isOpen && dropdownPosition && typeof window !== "undefined" && createPortal(
        <div
          id="color-customizer-dropdown"
          className="fixed z-[100] w-80 p-4 rounded-lg border bg-popover shadow-lg"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Customize Primary Color</h3>
            <button
              onClick={handleClose}
              className="p-1 rounded-md hover:bg-accent transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Preview */}
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-md border-2 border-border shadow-sm"
                style={{ backgroundColor: previewColor }}
              />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Preview</p>
                <p className="text-sm font-mono">#{hexColor}</p>
              </div>
            </div>

            {/* Hex Input */}
            <div>
              <label className="text-xs font-medium mb-1.5 block">
                Hex Color Code
              </label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-1 px-3 py-2 rounded-md border bg-background">
                  <span className="text-muted-foreground">#</span>
                  <input
                    type="text"
                    value={hexColor}
                    onChange={handleInputChange}
                    placeholder="D500F9"
                    maxLength={6}
                    className="flex-1 bg-transparent outline-none font-mono text-sm uppercase"
                  />
                </div>
                <input
                  type="color"
                  value={previewColor}
                  onChange={(e) => setHexColor(e.target.value.replace("#", "").toUpperCase())}
                  className="w-12 h-10 rounded-md cursor-pointer border"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleApply}
                className="flex-1"
                size="sm"
                disabled={hexColor.length !== 6}
              >
                Apply
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </Button>
            </div>

            {/* Presets */}
            <div>
              <p className="text-xs font-medium mb-2">Quick Presets</p>
              <div className="grid grid-cols-6 gap-2">
                {[
                  "00E0FF", // Cyan (default)
                  "3B82F6", // Blue
                  "10B981", // Green
                  "F59E0B", // Amber
                  "EF4444", // Red
                  "D500F9", // Magenta
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => setHexColor(color)}
                    className={cn(
                      "w-full aspect-square rounded-md border-2 transition-all hover:scale-110",
                      hexColor === color ? "border-foreground ring-2 ring-offset-2 ring-foreground" : "border-border"
                    )}
                    style={{ backgroundColor: `#${color}` }}
                    title={`#${color}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
