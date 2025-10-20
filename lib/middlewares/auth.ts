import { NextRequest, NextResponse } from "next/server";
import { API_ROUTES } from "../constants/api-routes";
import { LOCALE } from "@/lib/constants/enum";

const PUBLIC_ROUTES = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/api/forgot-password",
  "/register",
  "/api/public",
  "/delete-data",
  "/api/auth/sso_facebook",
  API_ROUTES.AUTH.SSO_GOOGLE,
];

// If a route is NOT in PUBLIC_ROUTES, it will require authentication by default

export async function withAuth(req: NextRequest, res: NextResponse): Promise<NextResponse> {
  const pathname = req.nextUrl.pathname;

  // Skip auth check for API routes - let them handle their own auth
  if (pathname.startsWith('/api')) {
    return res;
  }

  // Lấy locale từ URL (vd: /vi/login → locale = 'vi') và path sau locale
  const segments = pathname.split("/");
  const locale = segments[1] || LOCALE.VI; // fallback locale mặc định
  const pathAfterLocale = `/${segments.slice(2).join("/")}`.replace(/\/+$/, "");

  const isPublic = PUBLIC_ROUTES.some((path) => pathname.startsWith(`/${locale}${path}`));

  const token = req.cookies.get("access_token")?.value;
  const refresh = req.cookies.get("refresh_token")?.value;

  // Mặc định: nếu không đăng nhập và route không nằm trong PUBLIC_ROUTES → chuyển hướng đến trang login
  if (!token && !refresh && !isPublic) {
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
  }

  return res;
}
