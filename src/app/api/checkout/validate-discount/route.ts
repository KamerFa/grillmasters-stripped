import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  validateDiscountCode,
  calculateDiscount,
} from "@/services/discount.service";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1),
  subtotal: z.number().int().positive(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { valid: false, error: "Invalid input" },
        { status: 400 }
      );
    }

    const { code, subtotal } = parsed.data;
    const result = await validateDiscountCode(
      code,
      subtotal,
      session?.user?.id
    );

    if (!result.valid || !result.discount) {
      return NextResponse.json({ valid: false, error: result.error });
    }

    const discountAmount = calculateDiscount(
      result.discount.type,
      result.discount.value,
      subtotal,
      result.discount.maximumDiscountAmount
    );

    return NextResponse.json({
      valid: true,
      discountAmount,
      discountId: result.discount.id,
      type: result.discount.type,
    });
  } catch (error) {
    console.error("Validate discount error:", error);
    return NextResponse.json(
      { valid: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
