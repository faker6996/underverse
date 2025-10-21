import type { Metadata } from "next";
import React from "react";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Underverse UI",
  description: "Underverse demo and docs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            try {
              const theme = localStorage.getItem('theme') || 'system';
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              const resolved = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;
              document.documentElement.classList.add(resolved);
            } catch {}
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
