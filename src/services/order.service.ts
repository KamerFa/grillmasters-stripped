import { prisma } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";
import { sendOrderConfirmation } from "@/lib/email";
import { formatPrice } from "@/config/currency";
import type { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";

interface CreateOrderInput {
  userId?: string;
  email: string;
  phone?: string;
  items: {
    productId: string;
    variantId?: string;
    name: string;
    sku: string;
    price: number;
    quantity: number;
    attributes?: Record<string, string>;
  }[];
  shippingAddress: Record<string, unknown>;
  billingAddress?: Record<string, unknown>;
  shippingMethod?: string;
  shippingCost: number;
  discountAmount?: number;
  discountCodeId?: string;
  taxAmount: number;
  notes?: string;
}

export async function createOrder(input: CreateOrderInput) {
  const subtotal = input.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total =
    subtotal +
    input.shippingCost -
    (input.discountAmount ?? 0) +
    input.taxAmount;

  const order = await prisma.$transaction(async (tx) => {
    // Reserve stock for all variants
    for (const item of input.items) {
      if (item.variantId) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
        });

        if (!variant || variant.stock - variant.reservedStock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.name}`);
        }

        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { reservedStock: { increment: item.quantity } },
        });
      }
    }

    // Increment discount usage if applicable
    if (input.discountCodeId) {
      await tx.discountCode.update({
        where: { id: input.discountCodeId },
        data: { usageCount: { increment: 1 } },
      });
    }

    // Create the order
    const created = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: input.userId,
        email: input.email,
        phone: input.phone,
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotal,
        shippingCost: input.shippingCost,
        discountAmount: input.discountAmount ?? 0,
        taxAmount: input.taxAmount,
        total,
        shippingAddress: input.shippingAddress as Prisma.InputJsonValue,
        billingAddress: input.billingAddress as Prisma.InputJsonValue ?? undefined,
        shippingMethod: input.shippingMethod,
        discountCodeId: input.discountCodeId,
        notes: input.notes,
        items: {
          create: input.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            name: item.name,
            sku: item.sku,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity,
            attributes: item.attributes as Prisma.InputJsonValue ?? undefined,
          })),
        },
        timeline: {
          create: {
            status: "PENDING",
            note: "Order created",
          },
        },
      },
      include: {
        items: true,
        timeline: true,
      },
    });

    return created;
  });

  return order;
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { select: { slug: true, images: { take: 1 } } },
        },
      },
      timeline: { orderBy: { createdAt: "desc" } },
      user: { select: { firstName: true, lastName: true, email: true } },
      discountCode: { select: { code: true, type: true, value: true } },
    },
  });
}

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      timeline: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getUserOrders(userId: string, page = 1, pageSize = 10) {
  const skip = (page - 1) * pageSize;
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string,
  createdBy?: string
) {
  const updateData: Prisma.OrderUpdateInput = { status };

  if (status === "SHIPPED") {
    updateData.shippedAt = new Date();
  } else if (status === "DELIVERED") {
    updateData.deliveredAt = new Date();
  }

  return prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: updateData,
    }),
    prisma.orderTimeline.create({
      data: {
        orderId,
        status,
        note,
        createdBy,
      },
    }),
  ]);
}

export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus,
  monriData?: {
    monriTransactionId?: string;
    monriResponseCode?: string;
    monriOrderNumber?: string;
  }
) {
  const updateData: Prisma.OrderUpdateInput = { paymentStatus };

  if (paymentStatus === "CAPTURED") {
    updateData.paidAt = new Date();
    updateData.status = "CONFIRMED";
  }

  if (monriData) {
    updateData.monriTransactionId = monriData.monriTransactionId;
    updateData.monriResponseCode = monriData.monriResponseCode;
    updateData.monriOrderNumber = monriData.monriOrderNumber;
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: { items: true },
  });

  // Commit stock on successful payment
  if (paymentStatus === "CAPTURED") {
    for (const item of order.items) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: { decrement: item.quantity },
            reservedStock: { decrement: item.quantity },
          },
        });
      }
    }

    // Send confirmation email
    await sendOrderConfirmation(
      order.email,
      order.orderNumber,
      formatPrice(order.total),
      order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: formatPrice(item.price),
      }))
    );

    await prisma.orderTimeline.create({
      data: {
        orderId: order.id,
        status: "CONFIRMED",
        note: "Payment confirmed",
      },
    });
  }

  return order;
}

export async function releaseStockReservation(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) return;

  for (const item of order.items) {
    if (item.variantId) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { reservedStock: { decrement: item.quantity } },
      });
    }
  }
}

// Admin functions
export async function getOrders(filters: {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  const { status, paymentStatus, page = 1, pageSize = 20, search } = filters;
  const skip = (page - 1) * pageSize;

  const where: Prisma.OrderWhereInput = {};
  if (status) where.status = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: true,
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    todayOrders,
    todayRevenue,
    totalOrders,
    totalRevenue,
    totalCustomers,
    pendingOrders,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count({
      where: { createdAt: { gte: today } },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: today },
        paymentStatus: "CAPTURED",
      },
      _sum: { total: true },
    }),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { paymentStatus: "CAPTURED" },
      _sum: { total: true },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.count({
      where: { status: { in: ["PENDING", "CONFIRMED", "PROCESSING"] } },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { firstName: true, lastName: true } },
        _count: { select: { items: true } },
      },
    }),
  ]);

  return {
    todayOrders,
    todayRevenue: todayRevenue._sum.total ?? 0,
    totalOrders,
    totalRevenue: totalRevenue._sum.total ?? 0,
    totalCustomers,
    pendingOrders,
    avgOrderValue:
      totalOrders > 0
        ? Math.round((totalRevenue._sum.total ?? 0) / totalOrders)
        : 0,
    recentOrders,
  };
}
