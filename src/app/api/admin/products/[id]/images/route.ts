import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
    const { url, altText, isPrimary } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Get current max sortOrder
    const lastImage = await prisma.productImage.findFirst({
      where: { productId },
      orderBy: { sortOrder: "desc" },
    });

    // If setting as primary, unset all others
    if (isPrimary) {
      await prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });
    }

    const image = await prisma.productImage.create({
      data: {
        productId,
        url,
        altText: altText || null,
        sortOrder: (lastImage?.sortOrder ?? -1) + 1,
        isPrimary: isPrimary ?? !lastImage, // first image is primary by default
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error("Create image error:", error);
    return NextResponse.json({ error: "Failed to add image" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: productId } = await params;

  try {
    const { imageId } = await req.json();

    if (!imageId) {
      return NextResponse.json({ error: "Image ID is required" }, { status: 400 });
    }

    await prisma.productImage.delete({
      where: { id: imageId, productId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete image error:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
