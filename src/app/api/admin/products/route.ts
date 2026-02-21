import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { productSchema } from "@/lib/validations/product";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Generate slug if not provided or auto-generate
    const slug = data.slug || slugify(data.name.en || data.name.bs);

    // Check for slug uniqueness
    const existing = await prisma.product.findFirst({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A product with this slug already exists" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        sku: data.sku,
        name: data.name,
        slug,
        description: data.description ?? undefined,
        price: data.price,
        compareAtPrice: data.compareAtPrice ?? null,
        costPrice: data.costPrice ?? null,
        categoryId: data.categoryId ?? null,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        weight: data.weight ?? null,
        dimensions: data.dimensions ?? undefined,
        metaTitle: data.metaTitle ?? undefined,
        metaDescription: data.metaDescription ?? undefined,
        variants: {
          create: {
            sku: `${data.sku}-DEFAULT`,
            stock: 0,
            isActive: true,
          },
        },
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: true,
        images: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: { select: { id: true, sku: true, stock: true, reservedStock: true, price: true, attributes: true, isActive: true } },
        images: { take: 1, orderBy: { sortOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
