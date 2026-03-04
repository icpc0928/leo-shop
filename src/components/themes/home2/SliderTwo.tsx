'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  bgColor: string;
  imageUrl: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Handcrafted Elegance',
    subtitle: 'Discover unique pieces that tell a story',
    cta: 'Shop Now',
    bgColor: '#EEE5DD',
    imageUrl: 'https://picsum.photos/600/600?random=1',
  },
  {
    id: 2,
    title: 'Artisan Collection',
    subtitle: 'Curated designs for your home',
    cta: 'Explore',
    bgColor: '#F5F1F1',
    imageUrl: 'https://picsum.photos/600/600?random=2',
  },
  {
    id: 3,
    title: 'Timeless Beauty',
    subtitle: 'Quality craftsmanship meets modern design',
    cta: 'View Collection',
    bgColor: '#F1DED0',
    imageUrl: 'https://picsum.photos/600/600?random=3',
  },
];

export default function SliderTwo() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[500px] md:h-[600px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundColor: slide.bgColor }}
          >
            <div className="container mx-auto px-4 h-full">
              <div className="grid md:grid-cols-2 gap-8 items-center h-full">
                {/* Left: Text Content */}
                <div className="space-y-6 z-10">
                  <h2 className="text-sm uppercase tracking-widest text-gray-600">
                    New Collection
                  </h2>
                  <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900">
                    {slide.title}
                  </h1>
                  <p className="text-lg text-gray-700 max-w-md">
                    {slide.subtitle}
                  </p>
                  <Link
                    href="/shop"
                    className="inline-block bg-[#72a499] text-white px-8 py-3 rounded-lg hover:bg-[#5e8a80] transition-colors"
                  >
                    {slide.cta}
                  </Link>
                </div>

                {/* Right: Image */}
                <div className="relative h-full flex items-center justify-center">
                  <div className="relative w-full max-w-md aspect-square">
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      className="w-full h-full object-cover rounded-2xl shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide ? 'bg-gray-900 w-8' : 'bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
