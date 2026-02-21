import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SHOP.BA",
  description: "Your online store in Bosnia and Herzegovina",
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
