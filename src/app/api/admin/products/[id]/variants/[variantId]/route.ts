import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: productId, variantId } = await params;

  try {
    const body = await req.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};
    if (body.sku !== undefined) updateData.sku = body.sku;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.stock !== undefined) updateData.stock = body.stock;
    if (body.attributes !== undefined) updateData.attributes = body.attributes;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const variant = await prisma.productVariant.update({
      where: { id: variantId, productId },
      data: updateData,
    });

    return NextResponse.json(variant);
  } catch (error) {
    console.error("Update variant error:", error);
    return NextResponse.json({ error: "Failed to update variant" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: productId, variantId } = await params;

  try {
    await prisma.productVariant.delete({
      where: { id: variantId, productId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete variant error:", error);
    return NextResponse.json({ error: "Failed to delete variant" }, { status: 500 });
  }
}
