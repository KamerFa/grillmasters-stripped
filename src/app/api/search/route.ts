import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], categories: [] });
  }

  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          deletedAt: null,
          OR: [
            { name: { path: ["en"], string_contains: q } },
            { name: { path: ["bs"], string_contains: q } },
            { sku: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: {
            take: 1,
            orderBy: { sortOrder: "asc" },
            select: { url: true },
          },
        },
        take: 6,
        orderBy: { createdAt: "desc" },
      }),
      prisma.category.findMany({
        where: {
          isActive: true,
          deletedAt: null,
          OR: [
            { name: { path: ["en"], string_contains: q } },
            { name: { path: ["bs"], string_contains: q } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        take: 3,
      }),
    ]);

    return NextResponse.json({ products, categories });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ products: [], categories: [] });
  }
}
