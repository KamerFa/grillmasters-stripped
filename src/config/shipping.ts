export interface ShippingMethod {
  name: string;
  price: number;
  freeAbove: number | null;
  estimatedDays: string;
}

export interface ShippingZoneConfig {
  id: string;
  name: { bs: string; en: string };
  countries: string[];
  methods: ShippingMethod[];
}

export const SHIPPING_ZONES: ShippingZoneConfig[] = [
  {
    id: "bih",
    name: { bs: "Bosna i Hercegovina", en: "Bosnia and Herzegovina" },
    countries: ["BA"],
    methods: [
      { name: "Standard", price: 700, freeAbove: 10000, estimatedDays: "2-4" },
      { name: "Express", price: 1200, freeAbove: null, estimatedDays: "1-2" },
    ],
  },
  {
    id: "balkans",
    name: { bs: "Region", en: "Balkans Region" },
    countries: ["HR", "RS", "ME", "MK", "AL", "XK", "SI"],
    methods: [
      {
        name: "Standard",
        price: 1500,
        freeAbove: 20000,
        estimatedDays: "5-8",
      },
    ],
  },
  {
    id: "eu",
    name: { bs: "Evropska unija", en: "European Union" },
    countries: [
      "DE", "AT", "IT", "FR", "NL", "BE", "ES", "PT", "PL", "CZ",
      "SK", "HU", "RO", "BG", "GR", "SE", "DK", "FI", "IE", "LU",
      "EE", "LV", "LT", "MT", "CY",
    ],
    methods: [
      {
        name: "Standard",
        price: 2500,
        freeAbove: 30000,
        estimatedDays: "7-14",
      },
    ],
  },
  {
    id: "international",
    name: { bs: "Me\u0111unarodno", en: "International" },
    countries: ["*"],
    methods: [
      {
        name: "Standard",
        price: 4000,
        freeAbove: null,
        estimatedDays: "14-21",
      },
    ],
  },
];

export function getShippingZone(countryCode: string): ShippingZoneConfig {
  const zone = SHIPPING_ZONES.find((z) =>
    z.countries.includes(countryCode)
  );
  return zone ?? SHIPPING_ZONES[SHIPPING_ZONES.length - 1];
}

export function calculateShippingCost(
  countryCode: string,
  methodName: string,
  orderSubtotal: number
): number {
  const zone = getShippingZone(countryCode);
  const method = zone.methods.find((m) => m.name === methodName);
  if (!method) return zone.methods[0].price;

  if (method.freeAbove && orderSubtotal >= method.freeAbove) {
    return 0;
  }
  return method.price;
}
