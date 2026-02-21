export const siteConfig = {
  name: "HANA Beauty",
  description: {
    bs: "Premium korejska kozmetika i njega ko\u017ee",
    en: "Premium Korean skincare & beauty",
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
