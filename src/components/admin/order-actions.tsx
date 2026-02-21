"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdminOrderActionsProps {
  orderId: string;
  currentStatus: string;
}

const statusFlow: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
};

export function AdminOrderActions({
  orderId,
  currentStatus,
}: AdminOrderActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [note, setNote] = useState("");

  const availableStatuses = statusFlow[currentStatus] ?? [];

  const handleUpdateStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          note: note || undefined,
          trackingNumber:
            newStatus === "SHIPPED" ? trackingNumber : undefined,
        }),
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setLoading(false);
    }
  };

  if (availableStatuses.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {availableStatuses.includes("SHIPPED") && (
          <div className="space-y-2">
            <Label>Tracking Number</Label>
            <Input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Note (optional)</Label>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {availableStatuses.map((status) => (
            <Button
              key={status}
              variant={status === "CANCELLED" ? "destructive" : "default"}
              onClick={() => handleUpdateStatus(status)}
              disabled={loading}
            >
              Mark as {status}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
