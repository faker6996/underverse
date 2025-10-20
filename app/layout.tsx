import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "E-commerce Web",
  description: "E-commerce web platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

