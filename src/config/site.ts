export const siteConfig = {
  name: "SHOP.BA",
  description: {
    bs: "Va\u0161a online prodavnica u Bosni i Hercegovini",
    en: "Your online store in Bosnia and Herzegovina",
  },
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  defaultLocale: "bs" as const,
  locales: ["bs", "en"] as const,
  currency: "BAM",
  taxRate: 0.17,
  checkout: {
    reservationTimeoutMinutes: 15,
  },
  pagination: {
    productsPerPage: 12,
    ordersPerPage: 10,
  },
} as const;

export type Locale = (typeof siteConfig.locales)[number];
