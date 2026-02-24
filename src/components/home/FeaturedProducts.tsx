"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import ProductGrid from "@/components/product/ProductGrid";
import { mockProducts } from "@/lib/mockData";
import { productAPI } from "@/lib/api";
import { mapApiProduct } from "@/lib/mappers";
import { useTranslations } from "next-intl";
import type { Product } from "@/types";

export default function FeaturedProducts() {
  const t = useTranslations("featured");
  const tp = useTranslations("product");
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
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl lg:text-3xl font-serif tracking-wider">
            {t("title")}
          </h2>
          <Link
            href="/products"
            className="text-sm tracking-wider text-base-content/50 hover:text-[#c8956c] transition-colors"
          >
            {tp("allProducts")} →
          </Link>
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
