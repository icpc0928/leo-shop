"use client";

import { useState, useEffect } from "react";
import Container from "@/components/ui/Container";
import ProductGrid from "@/components/product/ProductGrid";
import { mockProducts } from "@/lib/mockData";
import { productAPI } from "@/lib/api";
import { useTranslations } from "next-intl";
import type { Product } from "@/types";

function mapApiProduct(p: Record<string, unknown>): Product {
  return {
    ...p,
    id: p.id as number,
    slug: p.slug as string,
    name: p.name as string,
    price: p.price as number,
    comparePrice: p.comparePrice as number | undefined,
    images: p.imageUrl ? [p.imageUrl as string] : [],
    description: p.description as string,
    category: p.category as string,
    stock: p.stock as number,
    rating: 0,
  };
}

export default function FeaturedProducts() {
  const t = useTranslations("featured");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await productAPI.getAll({ size: 4 });
        setProducts(data.content.map(mapApiProduct));
      } catch {
        console.warn('API unavailable, using mock data for featured products');
        setProducts(mockProducts.slice(0, 4));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="py-20">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-serif tracking-wider mb-3">
            {t("title")}
          </h2>
          <div className="divider max-w-xs mx-auto">
            <span className="text-sm text-base-content/60">{t("subtitle")}</span>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </Container>
    </section>
  );
}
