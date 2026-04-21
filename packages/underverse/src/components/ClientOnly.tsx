"use client";

import { useHydrated } from "../hooks/useHydrated";

/** Public props for the `ClientOnly` component. */
interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const hasMounted = useHydrated();

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
