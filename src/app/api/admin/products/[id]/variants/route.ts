import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { productVariantSchema } from "@/lib/validations/product";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: productId } = await params;

  try {
    const body = await req.json();
    const parsed = productVariantSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        sku: data.sku,
        name: data.name ?? undefined,
        price: data.price ?? null,
        stock: data.stock,
        attributes: data.attributes ?? undefined,
        isActive: data.isActive,
      },
    });

    return NextResponse.json(variant, { status: 201 });
  } catch (error) {
    console.error("Create variant error:", error);
    return NextResponse.json(
      { error: "Failed to create variant" },
      { status: 500 }
    );
  }
}
