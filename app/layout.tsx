import type { Metadata } from "next";
import React from "react";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import GlobalFallingIcons from "@/components/ui/GlobalFallingIcons";
import OverlayScrollbarProvider from "@/components/ui/OverlayScrollbarProvider";
import { getOrganizationSchema, getSoftwareApplicationSchema } from "@/lib/seo/structured-data";

// Configure Inter font with Vietnamese support
const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-inter",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://underverse-ui.com";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Underverse UI";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Beautiful React Components`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "A comprehensive React component library with 40+ accessible, customizable UI components built with TypeScript, Tailwind CSS, and Next.js. Perfect for building modern web applications.",
  keywords: [
    "react components",
    "ui library",
    "nextjs",
    "typescript",
    "tailwind css",
    "design system",
    "react ui",
    "component library",
    "accessible components",
    "underverse ui",
    "npm package",
  ],
  authors: [{ name: "Underverse UI Team" }],
  creator: "Underverse UI",
  publisher: "Underverse UI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["vi_VN", "ko_KR", "ja_JP"],
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Beautiful React Components`,
    description: "A comprehensive React component library with 40+ accessible, customizable UI components. Build modern web applications faster.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - React Component Library`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Beautiful React Components`,
    description: "40+ accessible React components for modern web applications. TypeScript, Tailwind CSS, Next.js.",
    images: ["/og-image.png"],
    creator: "@underverse_ui",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    // yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    // bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationSchema = getOrganizationSchema();
  const softwareSchema = getSoftwareApplicationSchema();

  return (
    <html lang="en" suppressHydrationWarning data-overlayscrollbars-initialize>
      <head>
        {/* Organization Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        {/* SoftwareApplication Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      </head>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning={true} data-overlayscrollbars-initialize>
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
        <OverlayScrollbarProvider />
        <GlobalFallingIcons />
        {children}
      </body>
    </html>
  );
}
