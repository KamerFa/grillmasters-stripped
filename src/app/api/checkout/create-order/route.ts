import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOrder } from "@/services/order.service";
import { z } from "zod";

const createOrderSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().optional().nullable(),
      name: z.string(),
      sku: z.string(),
      price: z.number().int().positive(),
      quantity: z.number().int().positive(),
    })
  ),
  shippingAddress: z.object({
    firstName: z.string(),
    lastName: z.string(),
    street: z.string(),
    city: z.string(),
    zip: z.string(),
    country: z.string(),
    phone: z.string().optional(),
  }),
  shippingMethod: z.string().optional(),
  shippingCost: z.number().int().min(0),
  discountAmount: z.number().int().min(0).default(0),
  discountCode: z.string().optional(),
  taxAmount: z.number().int().min(0),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Server-side price verification
    // In production, you'd re-calculate prices from DB here
    const order = await createOrder({
      userId: session?.user?.id,
      email: data.email,
      phone: data.phone,
      items: data.items.map((item) => ({
        ...item,
        variantId: item.variantId ?? undefined,
      })),
      shippingAddress: data.shippingAddress,
      shippingMethod: data.shippingMethod,
      shippingCost: data.shippingCost,
      discountAmount: data.discountAmount,
      taxAmount: data.taxAmount,
      notes: data.notes,
    });

    return NextResponse.json({
      orderNumber: order.orderNumber,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Create order error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
