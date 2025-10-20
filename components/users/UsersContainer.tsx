"use client";

import DashboardLayout from "@/app/[locale]/layouts/DashboardLayout";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import AccessDenied from "@/components/ui/AccessDenied";
import { Checkbox } from "@/components/ui/CheckBox";
import { Combobox } from "@/components/ui/Combobox";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { APP_ROLE, HTTP_METHOD_ENUM, LOCALE, AppRole } from "@/lib/constants/enum";
import { callApi } from "@/lib/utils/api-client";
import { Users, UserPlus, Shield, Activity, RefreshCw, UserCheck, AlertCircle, Mail, Info, Loader2 } from "lucide-react";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { useUserRole } from "@/hooks/useUserRole";

export default function UsersContainer() {
  const { user } = useAuth();
  const tu = useTranslations("UsersPage");
  const [qName, setQName] = useState("");
  const [qEmail, setQEmail] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;
  const [form, setForm] = useState({ name: "", email: "", role: APP_ROLE.USER as AppRole });
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});
  const [activationLoading, setActivationLoading] = useState<Record<number, boolean>>({});
  const { addToast } = useToast();
  const { isAdmin, isSuperAdmin } = useUserRole();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = [qName, qEmail].filter(Boolean).join(" ");
      const res = await callApi<any>(API_ROUTES.USERS.LIST, HTTP_METHOD_ENUM.GET, { q, page, pageSize }, { silent: true });
      setUsers(res?.data || []);
      setTotal(res?.total || 0);
    } finally {
      setLoading(false);
    }
  }, [qName, qEmail, page, pageSize]);

  useEffect(() => {
    if (isAdmin) {
      load();
    } else {
      setLoading(false);
    }
  }, [isAdmin, load]);

  const createUser = async () => {
    // Basic client-side validation
    if (!form.name.trim()) {
      addToast({ type: "error", message: tu("nameRequired") || "Name is required" });
      return;
    }
    if (!form.email.trim()) {
      addToast({ type: "error", message: tu("emailRequired") || "Email is required" });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      addToast({ type: "error", message: tu("invalidEmailFormat") || "Invalid email format" });
      return;
    }
    // Existence check via MX/A records
    try {
      const ver = await callApi<any>(API_ROUTES.UTILS.VERIFY_EMAIL, HTTP_METHOD_ENUM.POST, { email: form.email }, { silent: true });
      if (!ver?.data?.exists) {
        addToast({ type: "error", message: (tu("emailNotExist") as string) || "Email does not exist" });
        return;
      }
    } catch {
      // If verification API errors, treat as non-existing to be safe
      addToast({ type: "error", message: (tu("emailNotExist") as string) || "Email does not exist" });
      return;
    }
    setCreating(true);
    try {
      const payload: any = { name: form.name, email: form.email, role: form.role };
      await callApi(API_ROUTES.USERS.LIST, HTTP_METHOD_ENUM.POST, payload);
      addToast({ type: "success", message: tu("createSuccess") });
      setForm({ name: "", email: "", role: APP_ROLE.USER });
      await load();
    } catch (err: any) {
      addToast({ type: "error", message: err?.message || tu("createFailed") });
    } finally {
      setCreating(false);
    }
  };

  const toggleDelete = useCallback(
    async (id: number, isDeleted: boolean) => {
      setActionLoading((prev) => ({ ...prev, [id]: true }));
      try {
        await callApi(API_ROUTES.USERS.ITEM(id), HTTP_METHOD_ENUM.PATCH, { isDeleted: !isDeleted }, { silent: true });
        await load();
        addToast({ type: "success", message: tu("updateSuccess") });
      } finally {
        setActionLoading((prev) => ({ ...prev, [id]: false }));
      }
    },
    [load, addToast, tu]
  );

  const bulkToggle = async (toDelete: boolean) => {
    const ids = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => Number(k));
    if (ids.length === 0) return;
    for (const id of ids) {
      await callApi(API_ROUTES.USERS.ITEM(id), HTTP_METHOD_ENUM.PATCH, { isDeleted: toDelete }, { silent: true });
    }
    setSelected({});
    await load();
  };

  const columns = useMemo<DataTableColumn<any>[]>(
    () => [
      {
        key: "_sel",
        title: (
          <Checkbox
            checked={users.length > 0 && users.every((u) => selected[u.id])}
            onChange={(e: any) => {
              const ck = !!e?.target?.checked;
              const map: Record<number, boolean> = {};
              users.forEach((u) => (map[u.id] = ck));
              setSelected(map);
            }}
          />
        ),
        render: (_v, r) => (
          <Checkbox checked={!!selected[r.id]} onChange={(e: any) => setSelected((s) => ({ ...s, [r.id]: !!e?.target?.checked }))} />
        ),
        width: 36,
      },
      { key: "id", title: "ID", dataIndex: "id", sortable: true, width: 72 },
      {
        key: "name",
        title: tu("name") as string,
        dataIndex: "name",
        sortable: true,
        filter: { type: "text", placeholder: tu("name") as string },
        render: (value, r) => (
          <Link href={`/${(Intl as any).locale || LOCALE.VI}/users/${r.id}`} className="text-primary hover:underline">
            {value}
          </Link>
        ),
      },
      {
        key: "email",
        title: tu("email") as string,
        dataIndex: "email",
        sortable: true,
        filter: { type: "text", placeholder: tu("email") as string },
      },
      {
        key: "role",
        title: tu("role.label") as string,
        dataIndex: "role",
        filter: {
          type: "select",
          options: [APP_ROLE.USER, APP_ROLE.ADMIN, APP_ROLE.SUPER_ADMIN],
          placeholder: tu("role.label") as string,
        },
        render: (_, r) => (
          <Combobox
            options={[APP_ROLE.USER, APP_ROLE.ADMIN, APP_ROLE.SUPER_ADMIN]}
            value={r.role}
            onChange={async (value) => {
              try {
                await callApi(API_ROUTES.USERS.ITEM(r.id), HTTP_METHOD_ENUM.PATCH, { role: value });
                await load();
                addToast({ type: "success", message: tu("updateSuccess") });
              } catch (err: any) {
                addToast({ type: "error", message: err?.message || tu("updateRoleFailed") });
              }
            }}
            disabled={!isSuperAdmin}
            placeholder={tu("role.label") as string}
            size="sm"
            className="min-w-32"
          />
        ),
      },
      {
        key: "active",
        title: tu("active") as string,
        render: (_v, r) => (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={r.is_active}
              onChange={async (e: any) => {
                const newActive = !!e?.target?.checked;
                setActivationLoading((prev) => ({ ...prev, [r.id]: true }));
                try {
                  await callApi(API_ROUTES.USERS.ITEM(r.id), HTTP_METHOD_ENUM.PATCH, { is_active: newActive });
                  await load();
                  addToast({ type: "success", message: tu("updateSuccess") });
                } catch (err: any) {
                  addToast({ type: "error", message: err?.message || tu("updateFailed") });
                } finally {
                  setActivationLoading((prev) => ({ ...prev, [r.id]: false }));
                }
              }}
              disabled={(!isSuperAdmin && (user as any)?.id === r.id) || activationLoading[r.id]}
            />
            {activationLoading[r.id] && <Loader2 className="animate-spin h-3 w-3 text-muted-foreground" />}
          </div>
        ),
        filter: { type: "select", options: [tu("yes"), tu("no")], placeholder: tu("active") as string },
        width: 80,
      },
      {
        key: "deleted",
        title: tu("deleted") as string,
        render: (_v, r) => (r.is_deleted ? tu("yes") : tu("no")),
        filter: { type: "select", options: [tu("yes"), tu("no")], placeholder: tu("deleted") as string },
        width: 90,
      },
      {
        key: "actions",
        title: tu("actions") as string,
        render: (_v, r) => (
          <Button variant="ghost" size="sm" onClick={() => toggleDelete(r.id, r.is_deleted)} disabled={actionLoading[r.id]}>
            {actionLoading[r.id] ? (
              <div className="flex items-center gap-1">
                <Loader2 className="animate-spin h-3 w-3" />
              </div>
            ) : r.is_deleted ? (
              (tu("restore") as string)
            ) : (
              (tu("delete") as string)
            )}
          </Button>
        ),
        width: 120,
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
    ],
    [users, selected, user, tu, isSuperAdmin, activationLoading, actionLoading, load, toggleDelete, addToast]
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {!isAdmin ? (
          <AccessDenied title={tu("forbidden") as string} description={tu("forbidden") as string} />
        ) : (
          <>
            {/* Enhanced Header */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">{tu("title") as string}</h1>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-muted-foreground">{tu("subtitle") as string}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => load()}
                    disabled={loading}
                    className="hover:bg-info/10 border-info/30 text-info hover:text-info"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    {tu("refresh") || "Refresh"}
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card hoverable className="bg-card/50 border-primary/20 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{total}</div>
                      <div className="text-sm text-muted-foreground">{tu("totalUsers") || "Total Users"}</div>
                    </div>
                  </div>
                </Card>

                <Card hoverable className="bg-card/50 border-secondary/20 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <UserCheck className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{users.filter((u) => u.is_active).length}</div>
                      <div className="text-sm text-muted-foreground">{tu("activeUsers") || "Active Users"}</div>
                    </div>
                  </div>
                </Card>

                <Card hoverable className="bg-card/50 border-accent/20 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Shield className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {users.filter((u) => u.role === "admin" || u.role === "super_admin").length}
                      </div>
                      <div className="text-sm text-muted-foreground">{tu("adminUsers") || "Admin Users"}</div>
                    </div>
                  </div>
                </Card>

                <Card hoverable className="bg-card/50 border-info/20 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-info/10 rounded-lg">
                      <Activity className="w-5 h-5 text-info" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{Object.values(selected).filter(Boolean).length}</div>
                      <div className="text-sm text-muted-foreground">{tu("selected") || "Selected"}</div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
            {/* Enhanced Create User Section */}
            <Card className="bg-card/50 border-primary/20 shadow-sm">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <UserPlus className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{tu("createUser") || "Create New User"}</h3>
                      <p className="text-sm text-muted-foreground">{tu("createUserDesc") || "Add a new user to the system"}</p>
                    </div>
                  </div>
                  {/* <Badge variant="success" className="text-xs vanh">
                    {tu("superAdminOnly") || "Super Admin Only"}
                  </Badge> */}
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-secondary/10 rounded">
                          <UserCheck className="w-4 h-4 text-secondary" />
                        </div>
                        <label className="text-sm font-medium text-foreground">{tu("name")}</label>
                        <span className="text-destructive text-sm">*</span>
                      </div>
                      <Input
                        placeholder={tu("enterName") || "Enter full name"}
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        size="md"
                        className="bg-background border-border/50 focus:border-primary/50 focus:ring-primary/20"
                      />
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-info/10 rounded">
                          <Mail className="w-4 h-4 text-info" />
                        </div>
                        <label className="text-sm font-medium text-foreground">{tu("email")}</label>
                        <span className="text-destructive text-sm">*</span>
                      </div>
                      <Input
                        type="email"
                        placeholder={tu("enterEmail") || "Enter email address"}
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        size="md"
                        className="bg-background border-border/50 focus:border-primary/50 focus:ring-primary/20"
                      />
                    </div>

                    {/* Role Field */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-accent/10 rounded">
                          <Shield className="w-4 h-4 text-accent" />
                        </div>
                        <label className="text-sm font-medium text-foreground">{tu("role.label")}</label>
                      </div>
                      <Combobox
                        options={isSuperAdmin ? [APP_ROLE.USER, APP_ROLE.ADMIN, APP_ROLE.SUPER_ADMIN] : [APP_ROLE.USER, APP_ROLE.ADMIN]}
                        value={form.role}
                        onChange={(value) => setForm({ ...form, role: value as AppRole })}
                        placeholder={tu("selectRole") || "Select user role"}
                        className="w-full bg-background border-border/50"
                        size="md"
                      />
                    </div>
                  </div>

                  {/* Create Button */}
                  <div className="flex justify-end">
                    <Button
                      variant="primary"
                      onClick={createUser}
                      disabled={creating || !form.name.trim() || !form.email.trim()}
                      size="md"
                      className="min-w-[140px] bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {creating ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                          <span>{tu("creating") || "Creating..."}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4" />
                          {tu("create") || "Create User"}
                        </div>
                      )}
                    </Button>
                  </div>

                  {/* Password Info */}
                  <div className="p-4 bg-info/5 border border-info/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-info/10 rounded-lg shrink-0 mt-0.5">
                        <Info className="w-5 h-5 text-info" />
                      </div>
                      <div className="space-y-3 text-sm">
                        <div>
                          <div className="font-medium text-info mb-1">{tu("passwordInfo.title")}</div>
                          <div className="text-muted-foreground">{tu("passwordInfo.description")}</div>
                        </div>
                        <div className="p-3 bg-background/50 border border-border/50 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-1">{tu("examplePassword") || "Example Password:"}</div>
                          <div className="font-mono text-info bg-info/5 px-2 py-1 rounded text-xs">{tu("passwordInfo.example")}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Enhanced Users Data Table */}
            <Card className="bg-card/50 border-primary/20 shadow-sm">
              <div className="space-y-6">
                {/* Table Header */}
                <div className="flex items-center justify-between pb-4 border-b border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <Users className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{tu("usersList") || "Users List"}</h3>
                      <p className="text-sm text-muted-foreground">{tu("manageUsersDesc") || "Manage user accounts, roles, and permissions"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="info" className="text-xs">
                      {total} {tu("users") || "users"}
                    </Badge>
                  </div>
                </div>

                {/* Bulk Actions Toolbar */}
                {Object.values(selected).filter(Boolean).length > 0 && (
                  <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-warning/10 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-warning" />
                        </div>
                        <div className="text-sm">
                          <div className="font-medium text-foreground">
                            {Object.values(selected).filter(Boolean).length} {tu("usersSelected") || "users selected"}
                          </div>
                          <div className="text-muted-foreground">{tu("bulkActionsAvailable") || "Bulk actions available"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => bulkToggle(false)}
                          disabled={Object.values(selected).filter(Boolean).length === 0}
                          className="border-success/30 text-success hover:bg-success/10 hover:border-success/50"
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          {tu("restore")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => bulkToggle(true)}
                          disabled={Object.values(selected).filter(Boolean).length === 0}
                          className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          {tu("delete")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Data Table */}
                <DataTable<any>
                  className="overflow-x-auto"
                  columns={columns}
                  data={users}
                  loading={loading}
                  total={total}
                  page={page}
                  pageSize={pageSize}
                  onQueryChange={(q) => {
                    // Map filters to qName/qEmail; other filters not wired to backend yet
                    setPage(q.page);
                    setQName(q.filters.name ?? "");
                    setQEmail(q.filters.email ?? "");
                  }}
                />
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
