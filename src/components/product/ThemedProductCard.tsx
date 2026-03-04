"use client";

import { Product } from "@/types";
import { CURRENT_THEME } from "@/config/themes";
import ProductCard from "./ProductCard";
import ProductCard2 from "@/components/themes/home2/ProductCard2";

interface ThemedProductCardProps {
  product: Product;
}

export default function ThemedProductCard({ product }: ThemedProductCardProps) {
  if (CURRENT_THEME === "home2") {
    return <ProductCard2 product={product} />;
  }

  return <ProductCard product={product} />;
}
