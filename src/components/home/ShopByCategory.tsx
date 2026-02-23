"use client";

import Link from "next/link";
import Container from "@/components/ui/Container";
import { useTranslations } from "next-intl";

const categoryData = [
  { key: "homeDecor", image: "https://picsum.photos/seed/cat-decor/600/400", filter: "Home Decor" },
  { key: "accessories", image: "https://picsum.photos/seed/cat-acc/600/400", filter: "Accessories" },
  { key: "lifestyle", image: "https://picsum.photos/seed/cat-life/600/400", filter: "Lifestyle" },
];

export default function ShopByCategory() {
  const t = useTranslations("categories");

  return (
    <section className="py-20 bg-[#faf5f0]">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-serif tracking-wider mb-3">
            {t("title")}
          </h2>
          <p className="section-line text-sm text-muted">{t("subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categoryData.map((cat) => (
            <Link
              key={cat.key}
              href={`/products?category=${encodeURIComponent(cat.filter)}`}
              className="group relative overflow-hidden aspect-[3/2]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${cat.image})` }}
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
              <div className="relative flex items-center justify-center h-full">
                <h3 className="text-white text-lg tracking-[0.2em] font-serif">
                  {t(cat.key)}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
