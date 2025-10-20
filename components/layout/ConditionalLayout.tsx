"use client";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

// This client component only decides whether to alter layouting in the future.
// To avoid SSR/CSR hydration mismatches, it must not set structural attributes.
export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  // Render children as-is; layout wrappers live in the server layout.
  return children as React.ReactElement;
}
