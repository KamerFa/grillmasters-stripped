"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    firstName: session?.user?.firstName ?? "",
    lastName: session?.user?.lastName ?? "",
    email: session?.user?.email ?? "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/account/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setMessage(t("common.success"));
      }
    } catch {
      setMessage(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage(t("auth.passwordsDoNotMatch"));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      if (res.ok) {
        setMessage(t("common.success"));
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const data = await res.json();
        setMessage(data.error || t("common.error"));
      }
    } catch {
      setMessage(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-8 max-w-2xl">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/account" className="hover:text-foreground">
          {t("account.title")}
        </Link>
        <span className="mx-2">/</span>
        <span>{t("account.settings")}</span>
      </nav>

      <h1 className="text-2xl font-bold mb-8">{t("account.settings")}</h1>

      {message && (
        <div className="bg-muted text-sm p-3 rounded-md mb-4">{message}</div>
      )}

      {/* Personal Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("account.personalInfo")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("checkout.firstName")}</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("checkout.lastName")}</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("checkout.email")}</Label>
              <Input value={formData.email} disabled />
            </div>
            <Button type="submit" disabled={saving}>
              {t("common.save")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>{t("account.changePassword")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("account.currentPassword")}</Label>
              <Input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((p) => ({
                    ...p,
                    currentPassword: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t("account.newPassword")}</Label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData((p) => ({
                    ...p,
                    newPassword: e.target.value,
                  }))
                }
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("auth.confirmPassword")}</Label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData((p) => ({
                    ...p,
                    confirmPassword: e.target.value,
                  }))
                }
                required
              />
            </div>
            <Button type="submit" disabled={saving}>
              {t("account.changePassword")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
