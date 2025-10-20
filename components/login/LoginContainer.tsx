"use client";

import { FacebookIcon, GoogleIcon } from "@/components/icons/SocialIcons";
import { Form, FormActions, FormCheckbox, FormInput, FormSubmitButton } from "@/components/ui/Form";
import { useAuth } from "@/contexts/AuthContext";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
import { useLocale } from "@/hooks/useLocale";
import { User } from "@/lib/models/user";
import { callApi } from "@/lib/utils/api-client";
import { loading } from "@/lib/utils/loading";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import Button from "../ui/Button";
import { useToast } from "../ui/Toast";

interface SsoReq {
  redirectUrl: string;
}

export default function LoginContainer() {
  const router = useRouter();
  const { login } = useAuth();
  const locale = useLocale();
  const t = useTranslations("LoginPage");
  const { addToast } = useToast();
  const [passwordKey, setPasswordKey] = React.useState(0); // Key to force password field reset

  // Show toast if session expired flag is set
  React.useEffect(() => {
    try {
      const flag = localStorage.getItem("session_expired");
      if (flag === "1") {
        addToast({ type: "error", message: t("errors.sessionExpired") });
        localStorage.removeItem("session_expired");
      }
    } catch {}
  }, [addToast, t]);

  const handleLoginWithGoogle = async () => {
    loading.show(t("social.loggingInGoogle"));
    try {
      const res = await callApi<SsoReq>(API_ROUTES.AUTH.SSO_GOOGLE, HTTP_METHOD_ENUM.POST, { locale });
      if (res?.redirectUrl) {
        // Keep loading visible until redirect completes
        window.location.replace(res.redirectUrl);
        return;
      }
      throw new Error(t("errors.googleLoginFailed"));
    } catch (err: any) {
      console.error("Google SSO error:", err);
      addToast({
        type: "error",
        message: err?.message || t("errors.googleLoginFailed"),
      });
      loading.hide();
    }
  };

  const handleEmailPasswordLogin = async (values: { email: string; password: string; rememberMe: boolean }) => {
    loading.show();

    try {
      // Use silent flag to prevent alert() and only use toast
      const loginResult = await callApi<any>(
        API_ROUTES.AUTH.LOGIN,
        HTTP_METHOD_ENUM.POST,
        {
          // Backend now accepts either email or username in this field
          email: values.email,
          password: values.password,
          rememberMe: values.rememberMe,
        },
        { silent: true }
      );

      // Fetch user data after successful login
      const userData = await callApi<User>(API_ROUTES.AUTH.ME, HTTP_METHOD_ENUM.GET, undefined, { silent: true });
      if (userData) {
        login(userData, null); // Token is stored in cookie, not needed in context
      }

      addToast({
        type: "success",
        message: t("loginSuccess"),
      });

      // Show loading for navigation

      // Navigate based on role: admin/super_admin -> /{locale}/admin, else -> /{locale}
      const role = (userData as any)?.role;
      const isAdmin = role === "admin" || role === "super_admin";
      const target = isAdmin ? `/${locale}/admin` : `/${locale}`;
      window.location.replace(target);

      // Don't hide loading here - let the page navigation handle it
      return;
    } catch (err: any) {
      console.error("Login error:", err);

      // Force password field to reset by changing its key
      setPasswordKey((prev) => prev + 1);

      addToast({
        type: "error",
        message: err?.message || t("errors.loginFailed"),
      });
    }
    loading.hide();
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url(/images/banner/banner_pickleball.png)" }} />
      <div className="absolute inset-0 bg-gradient-to-br from-background/10 via-background/10 to-background/20" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Form */}
        <div className="rounded-xl border border-border/60 bg-card/80 backdrop-blur text-card-foreground px-6 py-8 shadow-sm sm:px-10">
          <Form
            initialValues={{ email: "", password: "", rememberMe: false }}
            validationSchema={{
              email: { required: true },
              password: { required: true }
            }}
            onSubmit={handleEmailPasswordLogin}
            className="space-y-6"
          >
            <FormInput name="email" type="text" label={t("emailLabel")} placeholder="Email hoặc username" required />

            <FormInput
              key={passwordKey} // Force re-render when key changes
              name="password"
              type="password"
              label={t("passwordLabel")}
              placeholder="Enter your password"
              required
            />

            <div className="flex items-center justify-between">
              <FormCheckbox name="rememberMe" label={t("rememberMe")} />
              <Link href={`/${locale}/forgot-password`} className="text-sm text-primary hover:underline font-medium">
                {t("forgotPassword")}
              </Link>
            </div>

            <FormActions className="justify-center">
              <FormSubmitButton className="w-full">{t("signInButton")}</FormSubmitButton>
            </FormActions>
          </Form>

          {/* Divider */}
          <div className="mt-6 flex items-center">
            <div className="w-full border-t border-border" />
            <div className="px-4 text-sm text-muted-foreground whitespace-nowrap">{t("dividerText")}</div>
            <div className="w-full border-t border-border" />
          </div>

          {/* Social Buttons */}
          <div className="mt-6 grid gap-4">
            <Button onClick={handleLoginWithGoogle} icon={GoogleIcon}>
              {t("social.google")}
            </Button>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t("dontHaveAccount")}{" "}
              <Link href={`/${locale}/register`} className="text-primary hover:underline font-medium">
                {t("signUpLink")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
