import { prisma } from "@/lib/db";
import type { DiscountType } from "@prisma/client";

export async function validateDiscountCode(
  code: string,
  orderSubtotal: number,
  userId?: string
) {
  const discount = await prisma.discountCode.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!discount) {
    return { valid: false, error: "Invalid discount code" };
  }

  if (!discount.isActive) {
    return { valid: false, error: "This discount code is no longer active" };
  }

  const now = new Date();
  if (discount.validFrom && now < discount.validFrom) {
    return { valid: false, error: "This discount code is not yet valid" };
  }

  if (discount.validUntil && now > discount.validUntil) {
    return { valid: false, error: "This discount code has expired" };
  }

  if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
    return { valid: false, error: "This discount code has been fully used" };
  }

  if (
    discount.minimumOrderAmount &&
    orderSubtotal < discount.minimumOrderAmount
  ) {
    return {
      valid: false,
      error: `Minimum order amount is ${discount.minimumOrderAmount / 100} KM`,
    };
  }

  // Check per-user limit
  if (userId && discount.perUserLimit) {
    const userUsage = await prisma.order.count({
      where: {
        userId,
        discountCodeId: discount.id,
        paymentStatus: { in: ["AUTHORIZED", "CAPTURED"] },
      },
    });

    if (userUsage >= discount.perUserLimit) {
      return {
        valid: false,
        error: "You have already used this discount code",
      };
    }
  }

  return { valid: true, discount };
}

export function calculateDiscount(
  type: DiscountType,
  value: number,
  orderSubtotal: number,
  maximumDiscountAmount?: number | null
): number {
  let discountAmount = 0;

  switch (type) {
    case "PERCENTAGE":
      discountAmount = Math.round((orderSubtotal * value) / 100);
      break;
    case "FIXED_AMOUNT":
      discountAmount = value;
      break;
    case "FREE_SHIPPING":
      discountAmount = 0; // Handled at shipping level
      break;
  }

  if (maximumDiscountAmount && discountAmount > maximumDiscountAmount) {
    discountAmount = maximumDiscountAmount;
  }

  return Math.min(discountAmount, orderSubtotal);
}
