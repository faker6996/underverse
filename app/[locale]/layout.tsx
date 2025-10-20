import type { Metadata } from "next";
// Use system fonts to avoid network font fetch during build
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import AppProviders from "@/components/providers/AppProviders";
import { ModalProvider } from "@/components/providers/ModalProvider";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import SiteHeader from "@/components/layout/SiteHeader";
// Footer and floating contacts intentionally disabled

// Note: We rely on system fonts via globals.css. CSS variables will fall back gracefully.

type GenerateCtx = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: GenerateCtx): Promise<Metadata> {
  const { locale } = await params;
  const host = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

  const isVI = locale === "vi";
  const titleBase = "Hawkeye Studio";
  const description = isVI ? "Hệ thống trọng tài & điều hành Pickleball" : "Pickleball refereeing & operations toolkit";

  return {
    metadataBase: new URL(host),
    title: {
      default: titleBase,
      template: `%s | ${titleBase}`,
    },
    description,
    openGraph: {
      type: "website",
      url: `${host}/${locale}`,
      siteName: titleBase,
      locale: isVI ? "vi_VN" : "en_US",
      images: [
        {
          url: `${host}/favicon.ico`,
          width: 1200,
          height: 630,
          alt: titleBase,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titleBase,
      description,
      images: [`${host}/favicon.ico`],
    },
    alternates: {
      languages: {
        vi: `${host}/vi`,
        en: `${host}/en`,
      },
    },
  };
}

export default async function LocaleLayout(props: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { children } = props;
  const params = await props.params;
  // Ensure that the incoming `locale` is valid
  const locale = params.locale;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Providing all messages to the client side is the easiest way to get started
  const messages = await getMessages();

  return (
    <AppProviders>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <ModalProvider>
          <div className="min-h-screen bg-background flex flex-col" role="main" aria-label="Main content">
            {/* Global header for non-login pages */}
            <SiteHeader />
            <div className="flex-1">
              <ConditionalLayout>{children}</ConditionalLayout>
            </div>
          </div>
        </ModalProvider>
      </NextIntlClientProvider>
    </AppProviders>
  );
}
