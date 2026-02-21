import { NextResponse } from "next/server";
import { createPayment } from "@/lib/monri";
import { getOrderByNumber } from "@/services/order.service";
import { z } from "zod";

const schema = z.object({
  orderNumber: z.string(),
  locale: z.string().default("bs"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    const order = await getOrderByNumber(parsed.data.orderNumber);
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.paymentStatus !== "PENDING") {
      return NextResponse.json(
        { error: "Payment already processed" },
        { status: 400 }
      );
    }

    const shippingAddr = order.shippingAddress as Record<string, string>;

    const result = await createPayment({
      amount: order.total,
      currency: order.currency,
      orderNumber: order.orderNumber,
      orderInfo: `Order ${order.orderNumber}`,
      language: parsed.data.locale,
      fullName: `${shippingAddr.firstName} ${shippingAddr.lastName}`,
      address: shippingAddr.street,
      city: shippingAddr.city,
      zip: shippingAddr.zip,
      country: shippingAddr.country,
      phone: order.phone ?? "",
      email: order.email,
    });

    return NextResponse.json({
      clientSecret: result.client_secret,
      paymentId: result.id,
    });
  } catch (error) {
    console.error("Create payment error:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
