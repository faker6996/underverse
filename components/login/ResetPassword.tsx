"use client";

import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Form, FormActions, FormInput, FormSubmitButton } from "@/components/ui/Form";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
import { useLocale } from "@/hooks/useLocale";
import { callApi } from "@/lib/utils/api-client";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation"; // Import useRouter
import { useState } from "react";

export default function ResetPassword() {
  /* ---------- hooks ---------- */
  const locale = useLocale();
  const router = useRouter(); // Get router instance
  const t = useTranslations("ResetPassword");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  /* ---------- state ---------- */
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  /* ---------- submit ---------- */
  const handleSubmit = async (values: { password: string; confirmPassword: string }) => {
    if (values.password !== values.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      await callApi<null>(API_ROUTES.RESET_PASSWORD.RESET, HTTP_METHOD_ENUM.POST, { token, password: values.password }, { silent: true });
      setSuccess(true);
      setMessage("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("errorDefault");
      setMessage(msg);
    }
  };

  /* ---------- UI ---------- */
  if (success) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md text-center p-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-6 w-6 text-success" />
          </div>
          <h3 className="mt-4 text-2xl font-semibold leading-6 text-foreground">{t("successTitle")}</h3>
          <div className="mt-5">
            <Button className="w-full" onClick={() => router.push(`/${locale}/login`)}>
              {t("backToLogin")}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-4 p-6">
      <h2 className="text-xl font-semibold">{t("heading")}</h2>

      <Form
        initialValues={{ password: "", confirmPassword: "" }}
        validationSchema={{
          password: { required: true, minLength: 6 },
          confirmPassword: { required: true },
        }}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <FormInput
          name="password"
          type="password"
          placeholder={t("passwordPlaceholder")}
          label="New Password"
          required
          description="Password must be at least 6 characters"
        />

        <FormInput name="confirmPassword" type="password" placeholder="Confirm new password" label="Confirm Password" required />

        <FormActions className="justify-center">
          <FormSubmitButton className="w-full">{t("submitButton")}</FormSubmitButton>
        </FormActions>
      </Form>

      {message && <Alert variant="error" description={message} />}
    </div>
  );
}
