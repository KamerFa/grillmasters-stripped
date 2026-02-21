import { PrismaClient, UserRole, DiscountType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@shop.ba" },
    update: {},
    create: {
      email: "admin@shop.ba",
      passwordHash: adminPassword,
      firstName: "Admin",
      lastName: "User",
      role: UserRole.SUPER_ADMIN,
      emailVerified: new Date(),
      isActive: true,
    },
  });
  console.log(`Admin user created: ${admin.email}`);

  // Create test customer
  const customerPassword = await bcrypt.hash("customer123", 12);
  const customer = await prisma.user.upsert({
    where: { email: "kupac@shop.ba" },
    update: {},
    create: {
      email: "kupac@shop.ba",
      passwordHash: customerPassword,
      firstName: "Test",
      lastName: "Kupac",
      role: UserRole.CUSTOMER,
      emailVerified: new Date(),
      isActive: true,
    },
  });
  console.log(`Customer user created: ${customer.email}`);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "odjeca" },
      update: {},
      create: {
        name: { bs: "Odjeća", en: "Clothing" },
        slug: "odjeca",
        description: {
          bs: "Kvalitetna odjeća za svaku priliku",
          en: "Quality clothing for every occasion",
        },
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: "obuva" },
      update: {},
      create: {
        name: { bs: "Obuća", en: "Footwear" },
        slug: "obuva",
        description: {
          bs: "Udobna i moderna obuća",
          en: "Comfortable and modern footwear",
        },
        isActive: true,
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: "dodaci" },
      update: {},
      create: {
        name: { bs: "Dodaci", en: "Accessories" },
        slug: "dodaci",
        description: {
          bs: "Modni dodaci i aksesoari",
          en: "Fashion accessories",
        },
        isActive: true,
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: "elektronika" },
      update: {},
      create: {
        name: { bs: "Elektronika", en: "Electronics" },
        slug: "elektronika",
        description: {
          bs: "Najnovija elektronika i gadgeti",
          en: "Latest electronics and gadgets",
        },
        isActive: true,
        sortOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: "kuca-i-vrt" },
      update: {},
      create: {
        name: { bs: "Kuća i vrt", en: "Home & Garden" },
        slug: "kuca-i-vrt",
        description: {
          bs: "Sve za vaš dom i vrt",
          en: "Everything for your home and garden",
        },
        isActive: true,
        sortOrder: 5,
      },
    }),
  ]);

  console.log(`${categories.length} categories created`);

  // Placeholder images
  const placeholderImages = [
    "/images/products/placeholder-1.svg",
    "/images/products/placeholder-2.svg",
    "/images/products/placeholder-3.svg",
    "/images/products/placeholder-4.svg",
    "/images/products/placeholder-5.svg",
  ];

  // Create products
  const products = [
    {
      sku: "CLT-001",
      name: { bs: "Pamučna majica", en: "Cotton T-Shirt" },
      slug: "pamucna-majica",
      description: {
        bs: "Kvalitetna pamučna majica za svakodnevno nošenje. 100% organski pamuk.",
        en: "Quality cotton t-shirt for everyday wear. 100% organic cotton.",
      },
      price: 3500,
      compareAtPrice: 4500,
      categoryId: categories[0].id,
      isFeatured: true,
      weight: 200,
      variants: [
        { sku: "CLT-001-S", attrs: { size: "S" }, stock: 15 },
        { sku: "CLT-001-M", attrs: { size: "M" }, stock: 25 },
        { sku: "CLT-001-L", attrs: { size: "L" }, stock: 20 },
        { sku: "CLT-001-XL", attrs: { size: "XL" }, stock: 10 },
      ],
    },
    {
      sku: "CLT-002",
      name: { bs: "Džins jakna", en: "Denim Jacket" },
      slug: "dzins-jakna",
      description: {
        bs: "Klasična džins jakna sa modernim krojem.",
        en: "Classic denim jacket with a modern cut.",
      },
      price: 12900,
      compareAtPrice: 15900,
      categoryId: categories[0].id,
      isFeatured: true,
      weight: 800,
      variants: [
        { sku: "CLT-002-S", attrs: { size: "S" }, stock: 8 },
        { sku: "CLT-002-M", attrs: { size: "M" }, stock: 12 },
        { sku: "CLT-002-L", attrs: { size: "L" }, stock: 10 },
        { sku: "CLT-002-XL", attrs: { size: "XL" }, stock: 5 },
      ],
    },
    {
      sku: "CLT-003",
      name: { bs: "Sportske hlače", en: "Sport Pants" },
      slug: "sportske-hlace",
      description: {
        bs: "Udobne sportske hlače za trening i slobodno vrijeme.",
        en: "Comfortable sport pants for training and leisure.",
      },
      price: 6500,
      categoryId: categories[0].id,
      isFeatured: false,
      weight: 350,
      variants: [
        { sku: "CLT-003-S", attrs: { size: "S" }, stock: 20 },
        { sku: "CLT-003-M", attrs: { size: "M" }, stock: 30 },
        { sku: "CLT-003-L", attrs: { size: "L" }, stock: 25 },
      ],
    },
    {
      sku: "SHO-001",
      name: { bs: "Kožne cipele", en: "Leather Shoes" },
      slug: "kozne-cipele",
      description: {
        bs: "Elegantne kožne cipele ručne izrade.",
        en: "Elegant handcrafted leather shoes.",
      },
      price: 18900,
      compareAtPrice: 22900,
      categoryId: categories[1].id,
      isFeatured: true,
      weight: 900,
      variants: [
        { sku: "SHO-001-40", attrs: { size: "40" }, stock: 5 },
        { sku: "SHO-001-41", attrs: { size: "41" }, stock: 8 },
        { sku: "SHO-001-42", attrs: { size: "42" }, stock: 12 },
        { sku: "SHO-001-43", attrs: { size: "43" }, stock: 10 },
        { sku: "SHO-001-44", attrs: { size: "44" }, stock: 6 },
      ],
    },
    {
      sku: "SHO-002",
      name: { bs: "Tenisice", en: "Sneakers" },
      slug: "tenisice",
      description: {
        bs: "Moderne tenisice za svakodnevno nošenje.",
        en: "Modern sneakers for everyday wear.",
      },
      price: 9900,
      categoryId: categories[1].id,
      isFeatured: true,
      weight: 600,
      variants: [
        { sku: "SHO-002-39", attrs: { size: "39" }, stock: 10 },
        { sku: "SHO-002-40", attrs: { size: "40" }, stock: 15 },
        { sku: "SHO-002-41", attrs: { size: "41" }, stock: 20 },
        { sku: "SHO-002-42", attrs: { size: "42" }, stock: 18 },
        { sku: "SHO-002-43", attrs: { size: "43" }, stock: 12 },
      ],
    },
    {
      sku: "ACC-001",
      name: { bs: "Kožni novčanik", en: "Leather Wallet" },
      slug: "kozni-novcanik",
      description: {
        bs: "Premium kožni novčanik sa RFID zaštitom.",
        en: "Premium leather wallet with RFID protection.",
      },
      price: 4900,
      compareAtPrice: 5900,
      categoryId: categories[2].id,
      isFeatured: true,
      weight: 100,
      variants: [
        { sku: "ACC-001-BLK", attrs: { color: "Black" }, stock: 30 },
        { sku: "ACC-001-BRN", attrs: { color: "Brown" }, stock: 25 },
      ],
    },
    {
      sku: "ACC-002",
      name: { bs: "Sunčane naočale", en: "Sunglasses" },
      slug: "suncane-naocale",
      description: {
        bs: "Stilvne sunčane naočale sa UV zaštitom.",
        en: "Stylish sunglasses with UV protection.",
      },
      price: 7500,
      categoryId: categories[2].id,
      isFeatured: false,
      weight: 40,
      variants: [
        { sku: "ACC-002-BLK", attrs: { color: "Black" }, stock: 20 },
        { sku: "ACC-002-TORT", attrs: { color: "Tortoise" }, stock: 15 },
      ],
    },
    {
      sku: "ELC-001",
      name: { bs: "Bežične slušalice", en: "Wireless Headphones" },
      slug: "bezicne-slusalice",
      description: {
        bs: "Premium bežične slušalice sa aktivnim poništavanjem buke.",
        en: "Premium wireless headphones with active noise cancellation.",
      },
      price: 15900,
      compareAtPrice: 19900,
      categoryId: categories[3].id,
      isFeatured: true,
      weight: 250,
      variants: [
        { sku: "ELC-001-BLK", attrs: { color: "Black" }, stock: 20 },
        { sku: "ELC-001-WHT", attrs: { color: "White" }, stock: 15 },
      ],
    },
    {
      sku: "ELC-002",
      name: { bs: "Pametni sat", en: "Smart Watch" },
      slug: "pametni-sat",
      description: {
        bs: "Pametni sat sa praćenjem zdravlja i fitness funkcijama.",
        en: "Smart watch with health tracking and fitness features.",
      },
      price: 24900,
      categoryId: categories[3].id,
      isFeatured: true,
      weight: 50,
      variants: [
        { sku: "ELC-002-BLK", attrs: { color: "Black" }, stock: 10 },
        { sku: "ELC-002-SLV", attrs: { color: "Silver" }, stock: 8 },
      ],
    },
    {
      sku: "HOM-001",
      name: { bs: "Pamučna posteljina", en: "Cotton Bedding Set" },
      slug: "pamucna-posteljina",
      description: {
        bs: "Luksuzna pamučna posteljina za udoban san.",
        en: "Luxury cotton bedding set for comfortable sleep.",
      },
      price: 8900,
      compareAtPrice: 11900,
      categoryId: categories[4].id,
      isFeatured: false,
      weight: 1500,
      variants: [
        { sku: "HOM-001-SGL", attrs: { size: "Single" }, stock: 15 },
        { sku: "HOM-001-DBL", attrs: { size: "Double" }, stock: 20 },
        { sku: "HOM-001-KNG", attrs: { size: "King" }, stock: 10 },
      ],
    },
    {
      sku: "HOM-002",
      name: { bs: "Keramička vaza", en: "Ceramic Vase" },
      slug: "keramicka-vaza",
      description: {
        bs: "Ručno rađena keramička vaza za vaš dom.",
        en: "Handmade ceramic vase for your home.",
      },
      price: 4500,
      categoryId: categories[4].id,
      isFeatured: false,
      weight: 800,
      variants: [
        { sku: "HOM-002-SM", attrs: { size: "Small" }, stock: 25 },
        { sku: "HOM-002-LG", attrs: { size: "Large" }, stock: 15 },
      ],
    },
    {
      sku: "CLT-004",
      name: { bs: "Zimska jakna", en: "Winter Jacket" },
      slug: "zimska-jakna",
      description: {
        bs: "Topla zimska jakna sa vodootpornom oblogom.",
        en: "Warm winter jacket with waterproof coating.",
      },
      price: 19900,
      compareAtPrice: 25900,
      categoryId: categories[0].id,
      isFeatured: true,
      weight: 1200,
      variants: [
        { sku: "CLT-004-S", attrs: { size: "S" }, stock: 5 },
        { sku: "CLT-004-M", attrs: { size: "M" }, stock: 10 },
        { sku: "CLT-004-L", attrs: { size: "L" }, stock: 8 },
        { sku: "CLT-004-XL", attrs: { size: "XL" }, stock: 3 },
      ],
    },
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        sku: p.sku,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        categoryId: p.categoryId,
        isFeatured: p.isFeatured,
        isActive: true,
        weight: p.weight,
        images: {
          create: [
            {
              url: placeholderImages[Math.floor(Math.random() * placeholderImages.length)],
              altText: p.name,
              sortOrder: 0,
              isPrimary: true,
            },
          ],
        },
        variants: {
          create: p.variants.map((v) => ({
            sku: v.sku,
            stock: v.stock,
            reservedStock: 0,
            attributes: v.attrs,
            isActive: true,
          })),
        },
      },
    });
    console.log(`Product created: ${product.sku}`);
  }

  // Create shipping zones
  const zones = [
    {
      name: { bs: "Bosna i Hercegovina", en: "Bosnia and Herzegovina" },
      countries: ["BA"],
      method: "Standard",
      price: 700,
      freeAbove: 10000,
      estimatedDays: "2-4",
    },
    {
      name: { bs: "Bosna i Hercegovina - Express", en: "Bosnia and Herzegovina - Express" },
      countries: ["BA"],
      method: "Express",
      price: 1200,
      freeAbove: null,
      estimatedDays: "1-2",
    },
    {
      name: { bs: "Region", en: "Balkans Region" },
      countries: ["HR", "RS", "ME", "MK", "AL", "XK", "SI"],
      method: "Standard",
      price: 1500,
      freeAbove: 20000,
      estimatedDays: "5-8",
    },
    {
      name: { bs: "Evropska unija", en: "European Union" },
      countries: ["DE", "AT", "IT", "FR", "NL", "BE", "ES"],
      method: "Standard",
      price: 2500,
      freeAbove: 30000,
      estimatedDays: "7-14",
    },
  ];

  for (const z of zones) {
    await prisma.shippingZone.create({ data: z });
  }
  console.log(`${zones.length} shipping zones created`);

  // Create discount codes
  await prisma.discountCode.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      type: DiscountType.PERCENTAGE,
      value: 10,
      minimumOrderAmount: 5000,
      usageLimit: 100,
      isActive: true,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.discountCode.upsert({
    where: { code: "FREESHIP" },
    update: {},
    create: {
      code: "FREESHIP",
      type: DiscountType.FREE_SHIPPING,
      value: 0,
      minimumOrderAmount: 5000,
      usageLimit: 50,
      isActive: true,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("Discount codes created");

  // Create site settings
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteName: "SHOP.BA",
      currency: "BAM",
      taxRate: 1700,
      contactEmail: "info@shop.ba",
      contactPhone: "+387 33 123 456",
      address: "Ferhadija 1, 71000 Sarajevo, BiH",
      socialLinks: {
        facebook: "https://facebook.com/shop.ba",
        instagram: "https://instagram.com/shop.ba",
      },
      seoDefaults: {
        title: "SHOP.BA - Online kupovina",
        description: "Vaša online prodavnica u Bosni i Hercegovini",
      },
      maintenanceMode: false,
    },
  });

  console.log("Site settings created");
  console.log("Seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
