"use client";

import { useState, useEffect } from "react";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { wishlistAPI } from "@/lib/api";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useAuthStore } from "@/stores/authStore";
import { mapApiProduct } from "@/lib/mappers";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Heart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuthStore();
  const { wishlistIds, toggleWishlist } = useWishlistStore();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      if (!isLoggedIn) {
        // Not logged in — no server data, show empty or local-only
        setProducts([]);
        setLoading(false);
        return;
      }
      try {
        const data = await wishlistAPI.getProducts();
        setProducts(data.map(mapApiProduct));
      } catch (e) {
        console.error("Failed to fetch wishlist products:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [isLoggedIn, wishlistIds]);

  const handleRemove = async (productId: number) => {
    await toggleWishlist(productId);
  };

  const breadcrumbItems = [{ label: "收藏清單" }];

  return (
    <Container className="py-8">
      <Breadcrumb items={breadcrumbItems} />

      <div className="mt-6">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-6 h-6" strokeWidth={1.5} />
          <h1 className="text-2xl font-medium tracking-wide">收藏清單</h1>
          {products.length > 0 && (
            <span className="text-sm text-base-content/50">({products.length} 件商品)</span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="loading loading-spinner loading-md" />
          </div>
        ) : !isLoggedIn ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 mx-auto text-base-content/20 mb-4" strokeWidth={1} />
            <p className="text-base-content/50 mb-4">登入後即可查看您的收藏清單</p>
            <Link
              href="/account/login"
              className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-medium bg-[var(--home2-primary,#c8956c)] text-white hover:opacity-90 transition-opacity"
            >
              前往登入
            </Link>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 mx-auto text-base-content/20 mb-4" strokeWidth={1} />
            <p className="text-base-content/50 mb-4">收藏清單是空的</p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-medium bg-[var(--home2-primary,#c8956c)] text-white hover:opacity-90 transition-opacity"
            >
              去逛逛
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="group relative">
                <Link href={`/products/${product.slug}`}>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-base-200">
                    {product.imageUrl || product.images?.[0] ? (
                      <Image
                        src={product.imageUrl || product.images?.[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-base-content/30">
                        No Image
                      </div>
                    )}
                    {product.comparePrice && product.comparePrice > product.price && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                        SALE {Math.round((1 - product.price / product.comparePrice) * 100)}%
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-medium truncate">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className="text-xs text-base-content/40 line-through">
                          {formatPrice(product.comparePrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => handleRemove(Number(product.id))}
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors cursor-pointer"
                  aria-label="移除收藏"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
