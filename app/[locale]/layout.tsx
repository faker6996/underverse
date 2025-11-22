import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LOCALE } from "@/lib/constants/enum";
import "../globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://underverse-ui.com";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;

  // Build alternates for all locales
  const languages: Record<string, string> = {};
  routing.locales.forEach((loc) => {
    languages[loc] = `${SITE_URL}/${loc}`;
  });

  return {
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages,
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  // Do not render <html> or <body> here to avoid nested <html> and hydration mismatches.
  return <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>;
}
