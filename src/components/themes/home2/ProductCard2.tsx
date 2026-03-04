"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCartStore } from "@/stores/cartStore";
import { ShoppingBag, Heart, Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import "./theme.css";

interface ProductCard2Props {
  product: Product;
}

export default function ProductCard2({ product }: ProductCard2Props) {
  const addItem = useCartStore((s) => s.addItem);
  const { formatPrice } = useCurrency();
  const t = useTranslations("product");

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round((1 - product.price / product.comparePrice) * 100)
      : 0;

  // TODO: Color options will be added when product variants are available
  const uniqueColors: string[] = [];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: Open quick view modal
    console.log("Quick view:", product.slug);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: Toggle wishlist
    console.log("Toggle wishlist:", product.slug);
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
            >
              <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
              <span className="hidden sm:inline">{t("addToCart")}</span>
            </button>
            <button
              className="home2-product-action-btn"
              onClick={handleToggleWishlist}
              aria-label="Add to wishlist"
              style={{ flex: '0 0 auto', minWidth: '44px' }}
            >
              <Heart className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              className="home2-product-action-btn"
              onClick={handleQuickView}
              aria-label="Quick view"
              style={{ flex: '0 0 auto', minWidth: '44px' }}
            >
              <Eye className="w-4 h-4" strokeWidth={1.5} />
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
