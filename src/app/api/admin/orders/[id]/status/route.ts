import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateOrderStatus, releaseStockReservation } from "@/services/order.service";
import { prisma } from "@/lib/db";
import { z } from "zod";
import type { OrderStatus } from "@prisma/client";

const schema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
  note: z.string().optional(),
  trackingNumber: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { status, note, trackingNumber } = parsed.data;

    // If shipping, update tracking number
    if (trackingNumber) {
      await prisma.order.update({
        where: { id },
        data: { trackingNumber },
      });
    }

    // If cancelling, release stock
    if (status === "CANCELLED") {
      await releaseStockReservation(id);
    }

    await updateOrderStatus(
      id,
      status as OrderStatus,
      note,
      session.user.email
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update order status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
