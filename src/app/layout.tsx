import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HANA Beauty | Premium Korean Skincare",
  description: "Premium Korean skincare & beauty. Curated K-beauty essentials for radiant, healthy skin.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bs" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
