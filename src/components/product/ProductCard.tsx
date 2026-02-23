"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { ShoppingBag, Eye } from "lucide-react";
import { useTranslations } from "next-intl";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const t = useTranslations("product");

  return (
    <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow group">
      <figure className="relative aspect-square overflow-hidden">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {product.comparePrice && (
            <span className="badge badge-primary absolute top-3 left-3 text-xs">
              {t("sale")}
            </span>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
            <span className="btn btn-sm bg-base-100 text-base-content opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-[opacity,transform] duration-300">
              <Eye className="w-4 h-4" aria-hidden="true" />
              {t("quickView")}
            </span>
          </div>
        </Link>
      </figure>

      <div className="card-body items-center text-center p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="card-title text-sm tracking-wider hover:text-primary transition-colors min-w-0 truncate">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="rating rating-sm rating-half">
          {[...Array(5)].map((_, i) => (
            <input
              key={i}
              type="radio"
              name={`rating-${product.id}`}
              aria-label={`${i + 1} star`}
              className={`mask mask-star-2 ${i < Math.floor(product.rating) ? "bg-warning" : "bg-base-300"}`}
              disabled
              checked={i === Math.floor(product.rating) - 1}
              readOnly
            />
          ))}
          <span className="text-xs text-base-content/60 ml-1">{product.rating}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{formatPrice(product.price)}</span>
          {product.comparePrice && (
            <span className="text-sm text-base-content/40 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        <button className="btn btn-outline btn-primary btn-sm mt-1" onClick={() => addItem(product)}>
          <ShoppingBag className="w-4 h-4" aria-hidden="true" />
          {t("addToCart")}
        </button>
      </div>
    </div>
  );
}
