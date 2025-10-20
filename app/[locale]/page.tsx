import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/utils/jwt";

export const revalidate = 0;

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (token) {
      const payload = verifyJwt(token);
      const role = (payload as any)?.role;
      if (role === "admin" || role === "super_admin") {
        return redirect(`/${locale}/admin`);
      }
    }
  } catch {}

  return redirect(`/${locale}/operator`);
}
