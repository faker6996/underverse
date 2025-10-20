"use client";
import OperatorInterface from "@/components/admin/operator/OperatorInterface";

export const dynamic = "force-dynamic";

export default function OperatorPublicPage() {
  // Public live view (no admin guard)
  return <OperatorInterface />;
}
