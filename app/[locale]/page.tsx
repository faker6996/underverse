import { redirect } from 'next/navigation';

export default async function LocaleRootPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Redirect to docs/underverse
  redirect(`/${locale}/docs/underverse`);
}
