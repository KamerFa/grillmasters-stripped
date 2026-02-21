import { PrismaClient, UserRole, DiscountType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@hanabeauty.ba" },
    update: {},
    create: {
      email: "admin@hanabeauty.ba",
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
    where: { email: "kupac@hanabeauty.ba" },
    update: {},
    create: {
      email: "kupac@hanabeauty.ba",
      passwordHash: customerPassword,
      firstName: "Test",
      lastName: "Kupac",
      role: UserRole.CUSTOMER,
      emailVerified: new Date(),
      isActive: true,
    },
  });
  console.log(`Customer user created: ${customer.email}`);

  // Create K-beauty categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "cleansers" },
      update: {},
      create: {
        name: { bs: "Čišćenje", en: "Cleansers" },
        slug: "cleansers",
        description: {
          bs: "Nježna čišćenja za blistavu kožu",
          en: "Gentle cleansers for radiant skin",
        },
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: "serums-essences" },
      update: {},
      create: {
        name: { bs: "Serumi i esencije", en: "Serums & Essences" },
        slug: "serums-essences",
        description: {
          bs: "Koncentrirane formule za dubinsku njegu",
          en: "Concentrated formulas for deep care",
        },
        isActive: true,
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: "moisturizers" },
      update: {},
      create: {
        name: { bs: "Hidratacija", en: "Moisturizers" },
        slug: "moisturizers",
        description: {
          bs: "Bogati kremovi i gelovi za hidrataciju",
          en: "Rich creams and gels for hydration",
        },
        isActive: true,
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: "masks-treatments" },
      update: {},
      create: {
        name: { bs: "Maske i tretmani", en: "Masks & Treatments" },
        slug: "masks-treatments",
        description: {
          bs: "Intenzivni tretmani za preobražaj kože",
          en: "Intensive treatments for skin transformation",
        },
        isActive: true,
        sortOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: "sun-protection" },
      update: {},
      create: {
        name: { bs: "Zaštita od sunca", en: "Sun Protection" },
        slug: "sun-protection",
        description: {
          bs: "Lagana SPF zaštita za svaki dan",
          en: "Lightweight SPF protection for every day",
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

  // Create K-beauty products
  const products = [
    {
      sku: "CLN-001",
      name: { bs: "Rižina voda za čišćenje", en: "Rice Water Cleansing Foam" },
      slug: "rice-water-cleansing-foam",
      description: {
        bs: "Nježna pjena za čišćenje obogaćena rižinom vodom. Uklanja nečistoće bez isušivanja kože, ostavljajući je mekom i blistavom.",
        en: "Gentle cleansing foam enriched with rice water extract. Removes impurities without stripping moisture, leaving skin soft and luminous.",
      },
      price: 2900,
      compareAtPrice: 3500,
      categoryId: categories[0].id,
      isFeatured: true,
      weight: 150,
      imgIdx: 0,
      variants: [
        { sku: "CLN-001-150", attrs: { size: "150ml" }, stock: 30 },
        { sku: "CLN-001-300", attrs: { size: "300ml" }, stock: 20 },
      ],
    },
    {
      sku: "CLN-002",
      name: { bs: "Uljni čistač sa kamelijom", en: "Camellia Oil Cleanser" },
      slug: "camellia-oil-cleanser",
      description: {
        bs: "Luksuzan uljni čistač sa kamelijinim uljem koji topi šminku i nečistoće. Idealan kao prvi korak dvostrukog čišćenja.",
        en: "Luxurious oil cleanser with camellia oil that melts away makeup and impurities. Perfect as the first step in double cleansing.",
      },
      price: 3900,
      categoryId: categories[0].id,
      isFeatured: false,
      weight: 200,
      imgIdx: 0,
      variants: [
        { sku: "CLN-002-200", attrs: { size: "200ml" }, stock: 25 },
      ],
    },
    {
      sku: "SRM-001",
      name: { bs: "Hijaluronski serum", en: "Hyaluronic Acid Hydrating Serum" },
      slug: "hyaluronic-acid-hydrating-serum",
      description: {
        bs: "Višeslojni hijaluronski serum sa 5 vrsta hijaluronske kiseline za intenzivnu hidrataciju u svim slojevima kože.",
        en: "Multi-layer hyaluronic serum with 5 types of hyaluronic acid for intense hydration at every skin level.",
      },
      price: 4900,
      compareAtPrice: 5900,
      categoryId: categories[1].id,
      isFeatured: true,
      weight: 30,
      imgIdx: 1,
      variants: [
        { sku: "SRM-001-30", attrs: { size: "30ml" }, stock: 40 },
        { sku: "SRM-001-50", attrs: { size: "50ml" }, stock: 25 },
      ],
    },
    {
      sku: "SRM-002",
      name: { bs: "Vitamin C serum", en: "Vitamin C Brightening Serum" },
      slug: "vitamin-c-brightening-serum",
      description: {
        bs: "Stabilizovan vitamin C serum za sjaj kože. Smanjuje tamne mrlje i ujednačava ton kože uz antioksidativnu zaštitu.",
        en: "Stabilized vitamin C serum for radiant skin. Reduces dark spots and evens skin tone with antioxidant protection.",
      },
      price: 5500,
      compareAtPrice: 6900,
      categoryId: categories[1].id,
      isFeatured: true,
      weight: 30,
      imgIdx: 1,
      variants: [
        { sku: "SRM-002-30", attrs: { size: "30ml" }, stock: 35 },
      ],
    },
    {
      sku: "ESS-001",
      name: { bs: "Fermentirana esencija", en: "Fermented First Essence" },
      slug: "fermented-first-essence",
      description: {
        bs: "Lagana fermentirana esencija koja priprema kožu za sljedeće korake njege. Poboljšava teksturu i sjaj kože.",
        en: "Lightweight fermented essence that preps skin for subsequent skincare steps. Improves texture and luminosity.",
      },
      price: 6900,
      categoryId: categories[1].id,
      isFeatured: true,
      weight: 150,
      imgIdx: 0,
      variants: [
        { sku: "ESS-001-150", attrs: { size: "150ml" }, stock: 20 },
      ],
    },
    {
      sku: "MOI-001",
      name: { bs: "Puž krem za lice", en: "Snail Mucin Repair Cream" },
      slug: "snail-mucin-repair-cream",
      description: {
        bs: "Obnoviteljski krem sa puževim mucinom za dubinsku hidrataciju i obnovu kože. Smanjuje fine linije i poboljšava elastičnost.",
        en: "Restorative cream with snail mucin for deep hydration and skin repair. Reduces fine lines and improves elasticity.",
      },
      price: 5900,
      compareAtPrice: 7500,
      categoryId: categories[2].id,
      isFeatured: true,
      weight: 50,
      imgIdx: 2,
      variants: [
        { sku: "MOI-001-50", attrs: { size: "50ml" }, stock: 30 },
        { sku: "MOI-001-100", attrs: { size: "100ml" }, stock: 15 },
      ],
    },
    {
      sku: "MOI-002",
      name: { bs: "Gel krema s bambusom", en: "Bamboo Water Gel Cream" },
      slug: "bamboo-water-gel-cream",
      description: {
        bs: "Ultra-lagana gel krema sa ekstraktom bambusa. Idealna za mješovitu i masnu kožu koja treba hidrataciju bez težine.",
        en: "Ultra-light gel cream with bamboo extract. Perfect for combination and oily skin that needs hydration without heaviness.",
      },
      price: 3900,
      categoryId: categories[2].id,
      isFeatured: false,
      weight: 50,
      imgIdx: 2,
      variants: [
        { sku: "MOI-002-50", attrs: { size: "50ml" }, stock: 35 },
      ],
    },
    {
      sku: "MSK-001",
      name: { bs: "Korejska sheet maska set", en: "K-Beauty Sheet Mask Set" },
      slug: "k-beauty-sheet-mask-set",
      description: {
        bs: "Set od 7 sheet maski za svaki dan u sedmici. Svaka maska sadrži različite aktivne sastojke za kompletnu njegu kože.",
        en: "Set of 7 sheet masks for every day of the week. Each mask contains different active ingredients for complete skincare.",
      },
      price: 3500,
      compareAtPrice: 4900,
      categoryId: categories[3].id,
      isFeatured: true,
      weight: 200,
      imgIdx: 4,
      variants: [
        { sku: "MSK-001-7PK", attrs: { size: "7 Pack" }, stock: 50 },
      ],
    },
    {
      sku: "MSK-002",
      name: { bs: "Noćna maska s medom", en: "Honey Overnight Sleeping Mask" },
      slug: "honey-overnight-sleeping-mask",
      description: {
        bs: "Bogata noćna maska sa pravim medom iz Manuke. Intenzivno njeguje i obnavlja kožu dok spavate.",
        en: "Rich overnight mask with real Manuka honey. Intensively nourishes and repairs skin while you sleep.",
      },
      price: 4500,
      categoryId: categories[3].id,
      isFeatured: false,
      weight: 80,
      imgIdx: 4,
      variants: [
        { sku: "MSK-002-80", attrs: { size: "80ml" }, stock: 25 },
      ],
    },
    {
      sku: "SPF-001",
      name: { bs: "Lagani dnevni SPF 50+", en: "Lightweight Daily Sunscreen SPF 50+" },
      slug: "lightweight-daily-sunscreen-spf50",
      description: {
        bs: "Ultra-lagana sunčana zaštita koja ne ostavlja bijeli trag. Formulacija pogodna za svakodnevnu upotrebu ispod šminke.",
        en: "Ultra-lightweight sun protection that leaves no white cast. Formulation suitable for daily use under makeup.",
      },
      price: 3200,
      compareAtPrice: 3900,
      categoryId: categories[4].id,
      isFeatured: true,
      weight: 50,
      imgIdx: 3,
      variants: [
        { sku: "SPF-001-50", attrs: { size: "50ml" }, stock: 45 },
      ],
    },
    {
      sku: "SRM-003",
      name: { bs: "Niacinamid serum 10%", en: "Niacinamide 10% Pore Serum" },
      slug: "niacinamide-pore-serum",
      description: {
        bs: "Koncentrirani serum sa 10% niacinamida za sužavanje pora i kontrolu sebuma. Vidljivi rezultati za 2 sedmice.",
        en: "Concentrated serum with 10% niacinamide for pore refinement and sebum control. Visible results in 2 weeks.",
      },
      price: 3900,
      categoryId: categories[1].id,
      isFeatured: true,
      weight: 30,
      imgIdx: 1,
      variants: [
        { sku: "SRM-003-30", attrs: { size: "30ml" }, stock: 30 },
      ],
    },
    {
      sku: "MOI-003",
      name: { bs: "Ceramidna barijerna krema", en: "Ceramide Barrier Repair Cream" },
      slug: "ceramide-barrier-repair-cream",
      description: {
        bs: "Bogata krema sa ceramidima za obnovu kožne barijere. Savršena za suhu i osjetljivu kožu kojoj treba dubinska njega.",
        en: "Rich cream with ceramides for skin barrier repair. Perfect for dry and sensitive skin that needs deep care.",
      },
      price: 4900,
      categoryId: categories[2].id,
      isFeatured: false,
      weight: 50,
      imgIdx: 2,
      variants: [
        { sku: "MOI-003-50", attrs: { size: "50ml" }, stock: 20 },
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
              url: placeholderImages[p.imgIdx],
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
    where: { code: "GLOW15" },
    update: {},
    create: {
      code: "GLOW15",
      type: DiscountType.PERCENTAGE,
      value: 15,
      minimumOrderAmount: 8000,
      usageLimit: 50,
      isActive: true,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
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
      siteName: "HANA Beauty",
      currency: "BAM",
      taxRate: 1700,
      contactEmail: "info@hanabeauty.ba",
      contactPhone: "+387 33 123 456",
      address: "Ferhadija 1, 71000 Sarajevo, BiH",
      socialLinks: {
        facebook: "https://facebook.com/hanabeauty.ba",
        instagram: "https://instagram.com/hanabeauty.ba",
      },
      seoDefaults: {
        title: "HANA Beauty | Premium Korean Skincare",
        description: "Premium Korean skincare & beauty. Curated K-beauty essentials for radiant, healthy skin.",
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
