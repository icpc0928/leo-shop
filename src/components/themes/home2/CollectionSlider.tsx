'use client';

import { useRef } from 'react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  imageUrl: string;
  href: string;
}

const categories: Category[] = [
  {
    id: 1,
    name: 'Home Decor',
    imageUrl: 'https://picsum.photos/300/300?random=30',
    href: '/shop?category=home-decor',
  },
  {
    id: 2,
    name: 'Kitchenware',
    imageUrl: 'https://picsum.photos/300/300?random=31',
    href: '/shop?category=kitchenware',
  },
  {
    id: 3,
    name: 'Bedroom',
    imageUrl: 'https://picsum.photos/300/300?random=32',
    href: '/shop?category=bedroom',
  },
  {
    id: 4,
    name: 'Living Room',
    imageUrl: 'https://picsum.photos/300/300?random=33',
    href: '/shop?category=living-room',
  },
  {
    id: 5,
    name: 'Outdoor',
    imageUrl: 'https://picsum.photos/300/300?random=34',
    href: '/shop?category=outdoor',
  },
];

export default function CollectionSlider() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      const newScrollLeft =
        direction === 'left'
          ? scrollRef.current.scrollLeft - scrollAmount
          : scrollRef.current.scrollLeft + scrollAmount;

      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
              Shop by Room
            </h2>
            <p className="text-gray-600">
              Find the perfect pieces for every space
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
              aria-label="Scroll left"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
              aria-label="Scroll right"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Slider */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group flex-shrink-0 w-72"
            >
              <div className="relative overflow-hidden rounded-2xl aspect-square bg-gray-100 mb-4">
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-gray-900 group-hover:text-gray-600 transition-colors">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
