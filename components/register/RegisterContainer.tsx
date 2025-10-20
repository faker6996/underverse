"use client";

import { useAuth } from "@/contexts/AuthContext";
import { FacebookIcon, GoogleIcon } from "@/components/icons/SocialIcons";
import { Form, FormInput, FormActions, FormSubmitButton } from "@/components/ui/Form";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
import { callApi } from "@/lib/utils/api-client";
import { useTranslations } from "next-intl";
import { useLocale } from "@/hooks/useLocale";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "../ui/Button";
import { useToast } from "../ui/Toast";
import { loading } from "@/lib/utils/loading";
import { User } from "@/lib/models/user";

interface SsoReq {
  redirectUrl: string;
}

export default function RegisterContainer() {
  const router = useRouter();
  const { login } = useAuth();
  const locale = useLocale();
  const t = useTranslations("RegisterPage");
  const { addToast } = useToast();

  const handleRegisterWithGoogle = async () => {
    loading.show(t("social.registeringGoogle"));
    try {
      const res = await callApi<SsoReq>(API_ROUTES.AUTH.SSO_GOOGLE, HTTP_METHOD_ENUM.POST, { locale, register: true });
      window.location.href = res?.redirectUrl!;
    } catch (err: any) {
      console.error("Google SSO register error:", err);
      addToast({
        type: "error",
        message: err?.message || t("errors.googleRegisterFailed"),
      });
    } finally {
      loading.hide();
    }
  };

  const handleEmailPasswordRegister = async (values: {
    username: string;
    password: string;
    confirmPassword: string;
  }) => {
    // Validation
    if (values.password !== values.confirmPassword) {
      addToast({
        type: "error",
        message: t("errors.passwordMismatch"),
      });
      return;
    }

    loading.show(t("registering"));
    try {
      const registerResult = await callApi<any>(API_ROUTES.AUTH.REGISTER, HTTP_METHOD_ENUM.POST, {
        username: values.username,
        password: values.password,
      });

      // Fetch user data after successful registration
      const userData = await callApi<User>(API_ROUTES.AUTH.ME, HTTP_METHOD_ENUM.GET);
      if (userData) {
        login(userData, null); // Token is stored in cookie, not needed in context
      }

      addToast({
        type: "success",
        message: t("registerSuccess"),
      });

      window.location.href = `/${locale}`;
    } catch (err: any) {
      console.error(err);
      addToast({
        type: "error",
        message: err?.message || t("errors.registerFailed"),
      });
    } finally {
      loading.hide();
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      {/* Background Image with Overlay (match Login) */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url(/images/banner/banner_pickleball.png)" }} />
      <div className="absolute inset-0 bg-gradient-to-br from-background/10 via-background/10 to-background/20" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Form (match Login) */}
        <div className="rounded-xl border border-border/60 bg-card/80 backdrop-blur text-card-foreground px-6 py-8 shadow-sm sm:px-10">
          <Form
            initialValues={{ username: "", password: "", confirmPassword: "" }}
            validationSchema={{
              username: { required: true, minLength: 3 },
              password: { required: true, minLength: 6 },
              confirmPassword: { required: true },
            }}
            onSubmit={handleEmailPasswordRegister}
            className="space-y-6"
          >
            <FormInput name="username" type="text" label={t("usernameLabel")} placeholder="Nhập tên đăng nhập" required />
            <FormInput
              name="password"
              type="password"
              label={t("passwordLabel")}
              placeholder="Enter your password"
              description="Password must be at least 6 characters"
              required
            />

            <FormInput name="confirmPassword" type="password" label={t("confirmPasswordLabel")} placeholder="Confirm your password" required />
            <FormActions className="justify-center">
              <FormSubmitButton className="w-full">{t("signUpButton")}</FormSubmitButton>
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
            <Button onClick={handleRegisterWithGoogle} icon={GoogleIcon}>
              {t("social.google")}
            </Button>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t("alreadyHaveAccount")}{" "}
              <Link href={`/${locale}/login`} className="text-primary hover:underline font-medium">
                {t("signInLink")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
