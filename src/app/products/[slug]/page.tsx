"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Button from "@/components/ui/CustomButton";
import ProductGrid from "@/components/product/ProductGrid";
import { mockProducts } from "@/lib/mockData";
import { productAPI } from "@/lib/api";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCartStore } from "@/stores/cartStore";
import { useTranslations } from "next-intl";
import { notFound } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs, Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/thumbs";
import "swiper/css/navigation";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { mapApiProduct } from "@/lib/mappers";
import type { Product } from "@/types";

type Tab = "description" | "specs" | "reviews";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>("description");
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const { formatPrice } = useCurrency();
  const t = useTranslations("product");

  useEffect(() => {
    (async () => {
      try {
        const data = await productAPI.getBySlug(slug);
        const p = mapApiProduct(data);
        setProduct(p);
        // Fetch related products
        try {
          const relData = await productAPI.getAll({ category: p.category, size: 5 });
          setRelated(relData.content.map(mapApiProduct).filter((r: Product) => r.slug !== slug).slice(0, 4));
        } catch {
          setRelated([]);
        }
      } catch {
        console.warn('API unavailable, using mock data for product detail');
        const mockProduct = mockProducts.find((p) => p.slug === slug);
        if (!mockProduct) {
          setNotFoundState(true);
        } else {
          setProduct(mockProduct);
          setRelated(mockProducts.filter((p) => p.category === mockProduct.category && p.id !== mockProduct.id).slice(0, 4));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <Container>
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg" />
        </div>
      </Container>
    );
  }

  if (notFoundState || !product) return notFound();

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    setQuantity(1);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "description", label: t("description") },
    { key: "specs", label: t("specifications") },
    { key: "reviews", label: t("reviews") },
  ];

  return (
    <Container>
      <Breadcrumb
        items={[
          { label: t("allProducts"), href: "/products" },
          { label: product.name },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-8">
        <div>
          <Swiper
            modules={[Thumbs, Navigation]}
            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
            navigation
            className="mb-4 bg-[#f5f0eb] product-swiper"
          >
            {product.images.map((img, i) => (
              <SwiperSlide key={i}>
                <div className="relative aspect-square">
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          {product.images.length > 1 && (
            <Swiper
              modules={[Thumbs]}
              onSwiper={setThumbsSwiper}
              slidesPerView={4}
              spaceBetween={8}
              watchSlidesProgress
              className="product-thumbs"
            >
              {product.images.map((img, i) => (
                <SwiperSlide key={i} className="cursor-pointer">
                  <div className="relative aspect-square bg-[#f5f0eb] opacity-60 hover:opacity-100 transition-opacity [.swiper-slide-thumb-active_&]:opacity-100">
                    <Image src={img} alt={`thumb ${i + 1}`} fill className="object-cover" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-sm text-muted tracking-wider mb-2">{product.category}</p>
          <h1 className="text-3xl font-serif tracking-wider mb-4">{product.name}</h1>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl font-medium">{formatPrice(product.price)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <>
                <span className="text-lg text-base-content/40 line-through">
                  {formatPrice(product.comparePrice)}
                </span>
                <span className="text-xs bg-[#c8956c] text-white px-2 py-0.5 rounded-full">
                  -{Math.round((1 - product.price / product.comparePrice) * 100)}%
                </span>
              </>
            )}
          </div>

          <p className="text-muted leading-relaxed mb-8">{product.description}</p>

          <div className="flex items-center gap-4 mb-8">
            <span className="text-sm text-muted">{t("quantity")}</span>
            <div className="flex items-center border border-base-200 rounded-full bg-gray-50">
              <button
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" aria-hidden="true" />
              </button>
              <span className="w-10 text-center text-sm font-medium">{quantity}</span>
              <button
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <span className="text-xs text-muted">{t("inStock", { count: product.stock })}</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="w-full py-4 rounded-full text-base font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--home2-primary, #c8956c)', color: '#fff' }}
          >
            <ShoppingBag className="w-5 h-5" />
            {product.stock <= 0 ? "已售完" : t("addToCart")}
          </button>
        </div>
      </div>

      <div className="border-t border-base-200 mt-8 py-12">
        <div className="flex gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 text-sm tracking-wider transition-colors rounded-full ${
                activeTab === tab.key
                  ? "bg-gray-900 text-white"
                  : "bg-gray-50 text-muted hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "description" && (
          <div className="text-muted leading-relaxed max-w-2xl">
            {product.details || product.description}
          </div>
        )}
        {activeTab === "specs" && product.specs && (
          <div className="max-w-lg">
            {Object.entries(product.specs).map(([key, value]) => (
              <div key={key} className="flex border-b border-border py-3">
                <span className="w-32 text-sm font-medium">{key}</span>
                <span className="text-sm text-muted">{value}</span>
              </div>
            ))}
          </div>
        )}
        {activeTab === "reviews" && (
          <p className="text-muted">{t("reviewsComingSoon")}</p>
        )}
      </div>

      {related.length > 0 && (
        <div className="py-12 border-t border-border">
          <h2 className="text-2xl font-serif tracking-wider mb-8 text-center">
            {t("relatedProducts")}
          </h2>
          <ProductGrid products={related} />
        </div>
      )}

      <style jsx global>{`
        .product-swiper .swiper-button-next,
        .product-swiper .swiper-button-prev {
          color: #1a1a1a;
          width: 36px;
          height: 36px;
          background: rgba(255,255,255,0.8);
          border-radius: 50%;
        }
        .product-swiper .swiper-button-next::after,
        .product-swiper .swiper-button-prev::after {
          font-size: 14px;
        }
      `}</style>
    </Container>
  );
}
