export const CURRENCY_CONFIG = {
  default: "BAM",
  supported: ["BAM"] as const,
  symbols: { BAM: "KM", EUR: "\u20AC", USD: "$" } as const,
  minorUnits: { BAM: 100, EUR: 100, USD: 100 } as const,
  locale: { BAM: "bs-BA", EUR: "de-DE", USD: "en-US" } as const,
} as const;

export type SupportedCurrency = (typeof CURRENCY_CONFIG.supported)[number];

export function formatPrice(
  amountMinor: number,
  currency: string = CURRENCY_CONFIG.default
): string {
  const major = amountMinor / (CURRENCY_CONFIG.minorUnits[currency as keyof typeof CURRENCY_CONFIG.minorUnits] ?? 100);
  const symbol = CURRENCY_CONFIG.symbols[currency as keyof typeof CURRENCY_CONFIG.symbols] ?? currency;

  return `${major.toFixed(2)} ${symbol}`;
}

export function toMinorUnits(
  amount: number,
  currency: string = CURRENCY_CONFIG.default
): number {
  return Math.round(
    amount * (CURRENCY_CONFIG.minorUnits[currency as keyof typeof CURRENCY_CONFIG.minorUnits] ?? 100)
  );
}

export function toMajorUnits(
  amountMinor: number,
  currency: string = CURRENCY_CONFIG.default
): number {
  return amountMinor / (CURRENCY_CONFIG.minorUnits[currency as keyof typeof CURRENCY_CONFIG.minorUnits] ?? 100);
}
