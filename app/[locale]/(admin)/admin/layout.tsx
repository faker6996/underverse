import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Ctx): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: {
      default: "Admin",
      template: "%s | Admin",
    },
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
  };
}

export default async function AdminLayout({ children }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  // Dedicated admin chrome: custom header + sidebar, hide public header/footer
  return <AdminShell>{children}</AdminShell>;
}
