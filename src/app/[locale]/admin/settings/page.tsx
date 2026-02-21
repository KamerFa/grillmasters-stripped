"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SiteSettingsData {
  siteName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  taxRate: number;
  maintenanceMode: boolean;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettingsData>({
    siteName: "SHOP.BA",
    contactEmail: "",
    contactPhone: "",
    address: "",
    taxRate: 1700,
    maintenanceMode: false,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          setSettings(data.settings);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setMessage("Settings saved successfully");
      } else {
        setMessage("Failed to save settings");
      }
    } catch {
      setMessage("Failed to save settings");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">Settings</h1>

      {message && (
        <div className="bg-muted text-sm p-3 rounded-md">{message}</div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Store Name</Label>
              <Input
                value={settings.siteName}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, siteName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input
                type="email"
                value={settings.contactEmail}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, contactEmail: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Phone</Label>
              <Input
                value={settings.contactPhone}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, contactPhone: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={settings.address}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, address: e.target.value }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tax Rate (basis points, 1700 = 17%)</Label>
              <Input
                type="number"
                value={settings.taxRate}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    taxRate: Number(e.target.value),
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    maintenanceMode: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <span className="text-sm">Enable maintenance mode</span>
            </label>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}
