"use client";

import Alert from "@/components/ui/Alert";
import { Form, FormActions, FormInput, FormSubmitButton } from "@/components/ui/Form";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
import { useLocale } from "@/hooks/useLocale";
import { callApi } from "@/lib/utils/api-client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { KeyRound } from "lucide-react"; // Import the new icon

export default function ForgotPassword() {
  /* ---------- hooks ---------- */
  const locale = useLocale();
  const t = useTranslations("ForgotPassword");

  /* ---------- state ---------- */
  const [status, setStatus] = useState("");

  /* ---------- submit ---------- */
  const handleSubmit = async (values: { email: string }) => {
    setStatus(t("sending"));

    try {
      await callApi<null>(API_ROUTES.RESET_PASSWORD.REQUEST, HTTP_METHOD_ENUM.POST, { email: values.email, locale }, { silent: true });
      setStatus(t("sentSuccess"));
    } catch (error) {
      const msg = error instanceof Error ? error.message : t("errorDefault");
      setStatus(msg);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">{t("heading")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-6">
          <Form
            initialValues={{ email: "" }}
            validationSchema={{
              email: { required: true, email: true },
            }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <FormInput
              name="email"
              type="email"
              label={t("emailLabel")}
              placeholder={t("emailPlaceholder")}
              required
              description="We'll send you a reset link to this email address"
            />

            <FormActions className="justify-center">
              <FormSubmitButton className="w-full">{t("submitButton")}</FormSubmitButton>
            </FormActions>
          </Form>

          {/* Status Message */}
          {status && <Alert variant={status === t("sentSuccess") ? "success" : status === t("sending") ? "info" : "error"} description={status} />}
        </div>

        {/* Back to Login Link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {t("rememberPassword")}{" "}
            <Link href={`/${locale}/login`} className="font-medium text-primary hover:text-primary/80 transition-colors">
              {t("backToLogin")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
