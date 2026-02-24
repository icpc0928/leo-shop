import type { Product } from "@/types";

export function resolveImageUrl(url: string): string {
  if (url.startsWith('http')) return url;
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  return `${base}${url}`;
}

export function mapApiProduct(p: Record<string, unknown>): Product {
  const imageUrls = (p.imageUrls as string[]) || [];
  const rawImages =
    imageUrls.length > 0
      ? imageUrls
      : p.imageUrl
        ? [p.imageUrl as string]
        : [];
  const images = rawImages.map(resolveImageUrl);

  return {
    id: p.id as number,
    slug: p.slug as string,
    name: p.name as string,
    price: p.price as number,
    comparePrice: p.comparePrice as number | undefined,
    images,
    description: p.description as string,
    category: p.category as string,
    stock: p.stock as number,
    rating: (p.rating as number) || 0,
  };
}
