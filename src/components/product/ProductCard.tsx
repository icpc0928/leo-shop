"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCartStore } from "@/stores/cartStore";
import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { formatPrice } = useCurrency();
  const t = useTranslations("product");

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round((1 - product.price / product.comparePrice) * 100)
      : 0;

  return (
    <div className="group relative">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f0eb]">
          {product.images?.[0] || product.imageUrl && (
            <Image
              src={product.images?.[0] || product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}
          {discount > 0 && (
            <span className="absolute top-3 right-3 bg-[#c8956c] text-white text-[10px] font-medium tracking-wide px-2 py-1 rounded-sm">
              -{discount}%
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="pt-3 pb-1">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm tracking-wide text-base-content/80 hover:text-[#c8956c] transition-colors truncate">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-medium text-base-content">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-xs text-base-content/40 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
      </div>

      {/* Add to cart - appears on hover */}
      <div className="absolute bottom-[4.5rem] left-0 right-0 px-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
        <button
          className="btn btn-sm w-full bg-white/90 backdrop-blur-sm border border-base-300 text-base-content hover:bg-[#c8956c] hover:text-white hover:border-[#c8956c] text-xs tracking-wider"
          onClick={(e) => {
            e.preventDefault();
            if (product.stock > 0) addItem(product);
          }}
          disabled={product.stock <= 0}
        >
          <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
          {product.stock <= 0 ? "已售完" : t("addToCart")}
        </button>
      </div>
    </div>
  );
}
