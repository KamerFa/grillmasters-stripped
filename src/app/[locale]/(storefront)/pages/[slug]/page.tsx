import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

const STATIC_PAGES: Record<
  string,
  { titleBs: string; titleEn: string; contentBs: string; contentEn: string }
> = {
  about: {
    titleBs: "O nama",
    titleEn: "About Us",
    contentBs:
      "SHOP.BA je vaša online prodavnica u Bosni i Hercegovini. Posvećeni smo pružanju kvalitetnih proizvoda po pristupačnim cijenama. Naš tim radi na tome da vam pruži najbolje iskustvo kupovine.",
    contentEn:
      "SHOP.BA is your online store in Bosnia and Herzegovina. We are dedicated to providing quality products at affordable prices. Our team works to give you the best shopping experience.",
  },
  contact: {
    titleBs: "Kontakt",
    titleEn: "Contact",
    contentBs:
      "Kontaktirajte nas putem emaila: info@shop.ba ili telefona: +387 33 123 456. Adresa: Ferhadija 1, 71000 Sarajevo, BiH. Radno vrijeme: Pon-Pet 09:00-17:00.",
    contentEn:
      "Contact us via email: info@shop.ba or phone: +387 33 123 456. Address: Ferhadija 1, 71000 Sarajevo, BiH. Working hours: Mon-Fri 09:00-17:00.",
  },
  shipping: {
    titleBs: "Dostava",
    titleEn: "Shipping Policy",
    contentBs:
      "Dostava za BiH: 7.00 KM (besplatna za narudžbe preko 100 KM). Standardna dostava 2-4 radna dana. Express dostava 1-2 radna dana za 12.00 KM. Regionalna dostava (HR, RS, ME) 15.00 KM, 5-8 radnih dana.",
    contentEn:
      "Shipping to BiH: 7.00 KM (free for orders over 100 KM). Standard delivery 2-4 business days. Express delivery 1-2 business days for 12.00 KM. Regional shipping (HR, RS, ME) 15.00 KM, 5-8 business days.",
  },
  privacy: {
    titleBs: "Politika privatnosti",
    titleEn: "Privacy Policy",
    contentBs:
      "Vaša privatnost nam je važna. Prikupljamo samo podatke koji su neophodni za obradu vaše narudžbe. Vaši lični podaci su zaštićeni i nikada se ne dijele sa trećim stranama bez vašeg pristanka.",
    contentEn:
      "Your privacy is important to us. We only collect data necessary to process your order. Your personal data is protected and never shared with third parties without your consent.",
  },
  terms: {
    titleBs: "Uslovi korištenja",
    titleEn: "Terms of Service",
    contentBs:
      "Korištenjem SHOP.BA, prihvatate naše uslove korištenja. Svi proizvodi su podložni dostupnosti. Cijene su u konvertibilnim markama (KM/BAM). Pravo na povrat u roku od 14 dana od prijema narudžbe.",
    contentEn:
      "By using SHOP.BA, you accept our terms of service. All products are subject to availability. Prices are in convertible marks (KM/BAM). Right to return within 14 days of receiving the order.",
  },
};

export default async function StaticPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale });

  const page = STATIC_PAGES[slug];
  if (!page) notFound();

  const title = locale === "bs" ? page.titleBs : page.titleEn;
  const content = locale === "bs" ? page.contentBs : page.contentEn;

  return (
    <div className="container py-8 max-w-3xl">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {t("common.home")}
        </Link>
        <span className="mx-2">/</span>
        <span>{title}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      <div className="prose max-w-none">
        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
          {content}
        </p>
      </div>
    </div>
  );
}
