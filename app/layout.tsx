import type { Metadata } from "next";
import React from "react";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

