"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Link from "next/link";
import { useTranslations } from "next-intl";

const slideImages = [
  "https://picsum.photos/seed/nature1/1600/800",
  "https://picsum.photos/seed/forest2/1600/800",
  "https://picsum.photos/seed/plant3/1600/800",
];

export default function HeroBanner() {
  const t = useTranslations("hero");

  return (
    <section className="relative">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        className="hero-swiper"
      >
        {slideImages.map((image, i) => (
          <SwiperSlide key={i}>
            <div
              className="hero min-h-[60vh] lg:min-h-[80vh]"
              style={{ backgroundImage: `url(${image})` }}
            >
              <div className="hero-overlay bg-opacity-40" />
              <div className="hero-content text-center text-neutral-content">
                <div className="max-w-md">
                  <p className="text-sm tracking-[0.3em] mb-4">{t(`slides.${i}.subtitle`)}</p>
                  <h1 className="text-4xl lg:text-6xl font-serif tracking-wider mb-6">
                    {t(`slides.${i}.title`)}
                  </h1>
                  <p className="mb-8 opacity-90">{t(`slides.${i}.desc`)}</p>
                  <Link href="/products" className="btn btn-outline border-white text-white hover:bg-primary hover:border-primary hover:text-primary-content">
                    {t("shopNow")}
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .hero-swiper .swiper-pagination-bullet {
          background: white;
          opacity: 0.5;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          background: oklch(var(--p));
        }
      `}</style>
    </section>
  );
}
