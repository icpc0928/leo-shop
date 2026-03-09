import Link from 'next/link';

export default function PromoBanner() {
  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left: Promo Text with Icons */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 md:p-12 space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">
                Why Choose Us
              </h2>
              <p className="text-gray-700">
                Quality craftsmanship and exceptional service
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <svg
                    className="w-6 h-6 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Premium Quality
                  </h3>
                  <p className="text-sm text-gray-600">
                    Handpicked products from trusted artisans
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <svg
                    className="w-6 h-6 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Fast Delivery
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get your items delivered within 3-5 business days
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <svg
                    className="w-6 h-6 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Easy Returns
                  </h3>
                  <p className="text-sm text-gray-600">
                    30-day return policy for your peace of mind
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Image with CTA Overlay */}
          <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-gray-200">
            <img
              src="https://picsum.photos/600/750?random=20"
              alt="Your Next Purchase"
              className="w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

            {/* CTA Content */}
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
              <h3 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                YOUR NEXT
                <br />
                PURCHASE
              </h3>
              <p className="text-lg mb-6 opacity-90">
                Discover pieces that transform your space
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 bg-[var(--home2-primary)] text-white px-6 py-3 rounded-full hover:opacity-90 transition-opacity font-medium"
              >
                關於我們
                <svg
                  className="w-5 h-5"
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
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
