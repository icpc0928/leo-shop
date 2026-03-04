'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { productAPI } from '@/lib/api';

export default function CollectionGrid() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await productAPI.getCategories();
        if (Array.isArray(data) && data.length > 0) {
          // API returns string[] like ["上衣","外套","褲子"]
          setCategories(data.slice(0, 6));
        }
      } catch {
        console.log('Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-xl aspect-[4/5]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  // Generate consistent colors for category cards
  const bgColors = ['#EEE5DD', '#F5F1F1', '#F1DED0', '#E8EDE5', '#F0E8F5', '#E5EEF1'];

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3">
            商品分類
          </h2>
          <p className="text-gray-600">探索我們精心策劃的商品系列</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <Link
              key={cat}
              href={`/products?category=${encodeURIComponent(cat)}`}
              className="group relative overflow-hidden rounded-xl aspect-[4/3] flex items-center justify-center transition-transform duration-300 hover:scale-[1.02]"
              style={{ backgroundColor: bgColors[i % bgColors.length] }}
            >
              <div className="text-center p-6">
                <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2 group-hover:text-[var(--theme2-primary,#72a499)] transition-colors">
                  {cat}
                </h3>
              </div>

              <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
