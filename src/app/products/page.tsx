"use client";

import { useState, useEffect, useCallback } from "react";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ProductGrid from "@/components/product/ProductGrid";
import { mockProducts, categories as mockCategories } from "@/lib/mockData";
import { productAPI } from "@/lib/api";
import { useTranslations } from "next-intl";
import { SlidersHorizontal, X } from "lucide-react";
import { mapApiProduct } from "@/lib/mappers";
import type { Product } from "@/types";

type SortOption = "default" | "price-asc" | "price-desc" | "name";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("default");
  const [filterOpen, setFilterOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const t = useTranslations("product");

  const sortMap: Record<string, string | undefined> = {
    "default": undefined,
    "price-asc": "price_asc",
    "price-desc": "price_desc",
    "name": "newest",
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productAPI.getAll({
        category: selectedCategory || undefined,
        sort: sortMap[sort],
        page: currentPage,
        size: 12,
      });
      setProducts(data.content.map(mapApiProduct));
      setTotalPages(data.totalPages);
    } catch {
      console.warn('API unavailable, using mock data for products');
      let list = selectedCategory
        ? mockProducts.filter((p) => p.category === selectedCategory)
        : [...mockProducts];
      switch (sort) {
        case "price-asc": list.sort((a, b) => a.price - b.price); break;
        case "price-desc": list.sort((a, b) => b.price - a.price); break;
        case "name": list.sort((a, b) => a.name.localeCompare(b.name)); break;
      }
      setProducts(list);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, sort, currentPage]);

  useEffect(() => {
    (async () => {
      try {
        const cats = await productAPI.getCategories();
        setCategories(cats);
      } catch {
        console.warn('API unavailable, using mock categories');
        setCategories(mockCategories);
      }
    })();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const Sidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium tracking-wider mb-3">{t("categoriesLabel")}</h3>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => { setSelectedCategory(null); setCurrentPage(0); }}
              className={`text-sm transition-colors ${!selectedCategory ? "text-primary font-medium" : "text-muted hover:text-foreground"}`}
            >
              {t("allProducts")}
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat}>
              <button
                onClick={() => { setSelectedCategory(cat); setCurrentPage(0); }}
                className={`text-sm transition-colors ${selectedCategory === cat ? "text-primary font-medium" : "text-muted hover:text-foreground"}`}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <Container>
      <Breadcrumb items={[{ label: t("allProducts") }]} />

      <div className="py-8">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-serif tracking-wider">{t("allProducts")}</h1>
          <div className="flex items-center gap-4">
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value as SortOption); setCurrentPage(0); }}
              aria-label={t("sortDefault")}
              className="text-sm border border-border px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 bg-white"
            >
              <option value="default">{t("sortDefault")}</option>
              <option value="price-asc">{t("sortPriceAsc")}</option>
              <option value="price-desc">{t("sortPriceDesc")}</option>
              <option value="name">{t("sortName")}</option>
            </select>
            <button
              className="md:hidden p-2 border border-border focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              onClick={() => setFilterOpen(true)}
              aria-label="Open filters"
            >
              <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex gap-12">
          <aside className="hidden md:block w-48 shrink-0">
            <Sidebar />
          </aside>
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-16">
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : (
              <>
                <ProductGrid products={products} />
                {products.length === 0 && (
                  <p className="text-center text-muted py-16">{t("noProducts")}</p>
                )}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`px-3 py-1 text-sm border ${currentPage === i ? "bg-foreground text-white border-foreground" : "border-border hover:border-foreground"}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {filterOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFilterOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white p-6" style={{ overscrollBehavior: 'contain' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-medium tracking-wider">{t("filters")}</h2>
              <button onClick={() => setFilterOpen(false)} aria-label="Close filters">
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}
    </Container>
  );
}
