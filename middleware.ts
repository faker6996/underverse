import { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { middlewarePipeline } from "./lib/middlewares/pipeline";
import { withRoleGuard } from "./lib/middlewares/role-guard";
import { withCors, withLogger, withAuth } from "./lib/middlewares";
import { withRateLimit } from "./lib/middlewares/rate-limit";
import { routing } from "@/i18n/routing";
import { APP_ROLE } from "@/lib/constants/enum";

const intlMiddleware = createIntlMiddleware({
  ...routing,
  // Enhanced locale detection
  localeDetection: true,
  alternateLinks: true,
});

export async function middleware(req: NextRequest) {
  try {
    // Skip i18n for API routes
    if (req.nextUrl.pathname.startsWith("/api")) {
      // Skip middleware for linked-videos API to avoid edge runtime issues
      if (req.nextUrl.pathname.startsWith("/api/linked-videos")) {
        return;
      }
      return await middlewarePipeline(req, [withCors, withLogger, withAuth]);
    }

    // Skip i18n and auth for public API Docs page
    if (req.nextUrl.pathname.startsWith("/docs")) {
      return await middlewarePipeline(req, [withCors, withLogger]);
    }

    // Handle root path redirect to locale
    if (req.nextUrl.pathname === "/") {
      const acceptLanguage = req.headers.get("accept-language") || "";
      let detectedLocale = routing.defaultLocale;

      // Parse Accept-Language header
      if (acceptLanguage) {
        const preferredLocales = acceptLanguage
          .split(",")
          .map((lang) => lang.split(";")[0].trim().toLowerCase())
          .map((lang) => lang.split("-")[0]);

        for (const preferredLocale of preferredLocales) {
          if (routing.locales.includes(preferredLocale as (typeof routing.locales)[number])) {
            detectedLocale = preferredLocale as (typeof routing.locales)[number];
            break;
          }
        }
      }

      // Removed debug log
      return Response.redirect(new URL(`/${detectedLocale}`, req.url));
    }

    const intlRes = intlMiddleware(req);
    if (intlRes?.redirected) return intlRes;

    let res = await middlewarePipeline(req, [
      withCors,
      // withRateLimit,
      withLogger,
      withAuth,
    ]);

    intlRes?.headers.forEach((value, key) => {
      res.headers.set(key, value);
    });

    // Role guard for admin area (supports locale prefix: /{locale}/admin)
    {
      const segments = req.nextUrl.pathname.split("/");
      const pathAfterLocale = `/${segments.slice(2).join("/")}`;
      if (pathAfterLocale.startsWith("/admin")) {
        res = await withRoleGuard(req, res, [APP_ROLE.SUPER_ADMIN, APP_ROLE.ADMIN]);
      }
    }

    return res;
  } catch (err: any) {
    console.error("[Middleware Error]", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    "/",

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    "/(vi|en)/:path*",

    // Enable redirects that add missing locales
    // Exclude linked-videos API from middleware
    "/((?!_next|_vercel|api/linked-videos|.*\\..*).*)",
  ],
};
