'use client';

import { useState, useEffect } from 'react';
import { productAPI } from '@/lib/api';
import ThemedProductCard from '@/components/product/ThemedProductCard';
import { Product } from '@/types';

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await productAPI.getAll({ size: 8 });
        const items = data?.content || data || [];
        setProducts(items);
      } catch {
        console.log('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <section className="py-16 md:py-20" style={{ backgroundColor: '#f8f8f8' }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
            熱銷商品
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            探索最受歡迎的精選商品
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl aspect-square mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ThemedProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-12">目前沒有商品</p>
        )}

        <div className="text-center mt-12">
          <a
            href="/products"
            className="inline-flex items-center gap-2 text-white px-8 py-3 rounded-lg transition-colors font-medium"
            style={{ backgroundColor: '#72a499' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#5e8a80')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#72a499')}
          >
            查看所有商品
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
