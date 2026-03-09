"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const keywordParam = searchParams.get("keyword") || "";
  const [keyword, setKeyword] = useState(keywordParam);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("default");
  const [filterOpen, setFilterOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const t = useTranslations("product");

  // Sync keyword from URL
  useEffect(() => {
    setKeyword(keywordParam);
    setCurrentPage(0);
  }, [keywordParam]);

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
        keyword: keyword || undefined,
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
  }, [selectedCategory, sort, currentPage, keyword]);

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
              className="text-sm border border-base-200 pl-4 pr-8 py-2 rounded-full focus:outline-none focus:border-gray-400 bg-white cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_0.75rem_center]"
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
                        className={`w-9 h-9 rounded-full text-sm flex items-center justify-center transition-colors cursor-pointer ${currentPage === i ? "bg-[var(--home2-primary,#333)] text-white" : "border border-base-200 hover:bg-base-200"}`}
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
