"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/CheckBox";
import { MultiCombobox } from "@/components/ui/MultiCombobox";
import { useToast } from "@/components/ui/Toast";
import { callApi } from "@/lib/utils/api-client";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
import { APP_ROLE } from "@/lib/constants/enum";
import { Send, Mail, Users, Shield, AlertCircle } from "lucide-react";
import { API_ROUTES } from "@/lib/constants";

interface NotificationFormProps {
  onSuccess?: () => void;
}

export default function NotificationForm({ onSuccess }: NotificationFormProps) {
  const t = useTranslations("AdminNotifications");
  const { addToast } = useToast();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [userEmails, setUserEmails] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<Array<{ id: number; email: string; role?: string }>>([]);
  const [emailToId, setEmailToId] = useState<Record<string, number>>({});
  const [email, setEmail] = useState(true);
  const [sending, setSending] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Load users for email multiselect
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const sp = new URLSearchParams({ page: "1", pageSize: "1000", q: "" }).toString();
        const res = await callApi<any>(`${API_ROUTES.USERS.LIST}?${sp}`, HTTP_METHOD_ENUM.GET, undefined, { silent: true });
        const rows: any[] = res?.data || [];
        const users = rows
          .filter((u) => !!u?.email && Number.isFinite(Number(u?.id)))
          .map((u) => ({ id: Number(u.id), email: String(u.email), role: String(u.role || "").trim() || undefined }));
        const map: Record<string, number> = {};
        users.forEach((u) => {
          map[u.email] = u.id;
        });
        setAllUsers(users);
        setEmailToId(map);
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);

  // Filter email options by selected roles
  const filteredEmails = useMemo(() => {
    if (!roles || roles.length === 0) return allUsers.map((u) => u.email);
    return allUsers.filter((u) => u.role && roles.includes(u.role)).map((u) => u.email);
  }, [roles, allUsers]);

  // Keep selected emails in sync with role filter
  useEffect(() => {
    setUserEmails((prev) => prev.filter((e) => filteredEmails.includes(e)));
  }, [filteredEmails]);

  const handleSend = async () => {
    if (!message.trim()) {
      addToast({ type: "error", message: t("errors.messageRequired") as string });
      return;
    }

    const ids = (userEmails || []).map((e) => emailToId[e]).filter((n) => Number.isFinite(n) && (n as any) > 0) as number[];
    const all = ids.length === 0 && roles.length === 0;

    setSending(true);
    try {
      const res = await fetch(API_ROUTES.NOTIFICATIONS.BROADCAST, {
        method: HTTP_METHOD_ENUM.POST,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all, userIds: ids, roles, title, message, email }),
      });

      if (!res.ok) throw new Error(await res.text());

      addToast({ type: "success", message: t("success") as string });

      // Reset form
      setTitle("");
      setMessage("");
      setUserEmails([]);
      setRoles([]);

      onSuccess?.();
    } catch (e: any) {
      addToast({ type: "error", message: e?.message || (t("failed") as string) });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="bg-card/50 border-primary/20 shadow-sm">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Send className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t("sendNotification")}</h3>
              <p className="text-sm text-muted-foreground">{t("composeNewNotification") || "Compose and send notifications to users"}</p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title Field */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-secondary/10 rounded">
                  <AlertCircle className="w-4 h-4 text-secondary" />
                </div>
                <Label className="text-sm font-medium text-foreground">{t("titleLabel")}</Label>
              </div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("titlePlaceholder")}
                disabled={sending}
                size="md"
                className="bg-background border-border/50 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>

            {/* Roles Field */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-accent/10 rounded">
                  <Shield className="w-4 h-4 text-accent" />
                </div>
                <Label className="text-sm font-medium text-foreground">{t("roles")}</Label>
              </div>
              <MultiCombobox
                options={Object.values(APP_ROLE)}
                value={roles}
                onChange={setRoles}
                placeholder={t("rolesPlaceholder")}
                disabled={sending}
                size="md"
                showTags={false}
                showClear={false}
                className="bg-background border-border/50"
              />
              <div className="flex items-center gap-2 text-xs text-info">
                <AlertCircle className="w-3 h-3" />
                <span>{t("rolesHint")}</span>
              </div>
            </div>

            {/* Target Users Field */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-info/10 rounded">
                  <Users className="w-4 h-4 text-info" />
                </div>
                <Label className="text-sm font-medium text-foreground">{t("targets")}</Label>
              </div>
              <MultiCombobox
                options={filteredEmails}
                value={userEmails}
                onChange={setUserEmails}
                placeholder={t("targetsPlaceholder")}
                disabled={loadingUsers || sending}
                className="bg-background border-border/50"
              />
              <div className="flex items-center gap-2 text-xs text-info">
                <AlertCircle className="w-3 h-3" />
                <span>{t("targetsHint")}</span>
              </div>
            </div>

            {/* Message Field */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-warning/10 rounded">
                  <AlertCircle className="w-4 h-4 text-warning" />
                </div>
                <Label className="text-sm font-medium text-foreground">
                  {t("messageLabel")} <span className="text-destructive">*</span>
                </Label>
              </div>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("messagePlaceholder")}
                className="min-h-28 bg-background border-border/50 focus:border-primary/50 focus:ring-primary/20"
                disabled={sending}
                required
              />
            </div>
          </div>

          {/* Email Option & Send Button */}
          <div className="flex items-center justify-between p-4 bg-secondary/5 border border-secondary/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info/10 rounded-lg">
                <Mail className="w-5 h-5 text-info" />
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={email}
                  onChange={(e) => setEmail((e.target as HTMLInputElement).checked)}
                  label={t("sendEmail")}
                  disabled={sending}
                />
                <span className="text-sm text-muted-foreground">{t("emailDeliveryNote") || "Also send via email"}</span>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handleSend}
              disabled={!message.trim() || sending}
              loading={sending}
              loadingText={t("sending")}
              className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {sending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                  <span>{t("sending")}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  {t("send")}
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
