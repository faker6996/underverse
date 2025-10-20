export type SameSiteOpt = "lax" | "strict" | "none";

export function getAuthCookieBaseOptions(httpOnly: boolean = true) {
  const frontendUrl = process.env.FRONTEND_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

  let derivedDomain: string | undefined;
  try {
    derivedDomain = new URL(frontendUrl).hostname;
  } catch {
    derivedDomain = undefined;
  }

  // Only set Domain for non-localhost, non-IP hostnames
  const envDomain = process.env.AUTH_COOKIE_DOMAIN || derivedDomain;
  const isIp = (host?: string) => !!host && /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
  const cookieDomain = envDomain && envDomain !== "localhost" && !isIp(envDomain) ? envDomain : undefined;
  const secureFromEnv = process.env.AUTH_COOKIE_SECURE;
  const isHttps = frontendUrl.startsWith("https://");
  const secure = secureFromEnv ? secureFromEnv === "true" : isHttps;

  const sameSiteEnv = (process.env.AUTH_COOKIE_SAMESITE || "")
    .toLowerCase() as SameSiteOpt | "";
  const sameSite: SameSiteOpt = sameSiteEnv || (secure ? "none" : "lax");

  return {
    httpOnly,
    secure,
    path: "/",
    sameSite: sameSite as any,
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  };
}
