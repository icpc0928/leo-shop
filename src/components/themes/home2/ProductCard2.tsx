"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useAuthStore } from "@/stores/authStore";
import { ShoppingBag, Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import "./theme.css";

interface ProductCard2Props {
  product: Product;
}

export default function ProductCard2({ product }: ProductCard2Props) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const { formatPrice } = useCurrency();
  const t = useTranslations("product");
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const productId = typeof product.id === 'number' ? product.id : parseInt(String(product.id), 10);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(productId));

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round((1 - product.price / product.comparePrice) * 100)
      : 0;

  // TODO: Color options will be added when product variants are available
  const uniqueColors: string[] = [];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock > 0) addItem(product);
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await toggleWishlist(productId);
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
    }
  };

  return (
    <div className="home2-product-card">
      {/* Image */}
      <Link href={`/products/${product.slug}`}>
        <div className="home2-product-image-wrapper">
          {(product.images?.[0] || product.imageUrl) && (
            <Image
              src={product.images?.[0] || product.imageUrl || ''}
              alt={product.name}
              fill
              className="home2-product-image object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}

          {/* Sale Badge */}
          {discount > 0 && (
            <div className="home2-sale-badge">
              SALE {discount}%
            </div>
          )}

          {/* Hover Actions */}
          <div className="home2-product-actions">
            <button
              className="home2-product-action-btn"
              onClick={handleAddToCart}
              aria-label={t("addToCart")}
              disabled={product.stock <= 0}
            >
              <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
              <span className="hidden sm:inline">{product.stock <= 0 ? "已售完" : t("addToCart")}</span>
            </button>
            <button
              className="home2-product-action-btn"
              onClick={handleToggleWishlist}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className="w-4 h-4"
                strokeWidth={1.5}
                fill={isWishlisted ? "#ef4444" : "none"}
                stroke={isWishlisted ? "#ef4444" : "currentColor"}
              />
            </button>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="home2-product-info">
        <Link href={`/products/${product.slug}`}>
          <h3 className="home2-product-name">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="home2-product-price">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="home2-product-price-compare">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        {/* Color Dots */}
        {uniqueColors.length > 0 && (
          <div className="home2-color-dots">
            {uniqueColors.slice(0, 5).map((color, idx) => (
              <span
                key={idx}
                className="home2-color-dot"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            {uniqueColors.length > 5 && (
              <span className="text-xs text-[var(--home2-text-light)] ml-1">
                +{uniqueColors.length - 5}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
