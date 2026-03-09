import { CURRENT_THEME } from '@/config/themes';

// Import Home-1 components
import * as Home1 from '@/components/themes/home1';

// Import Home-2 components
import * as Home2 from '@/components/themes/home2';

export default function Home() {
  // Select theme components based on configuration
  if (CURRENT_THEME === 'home2') {
    return (
      <>
        <Home2.SliderTwo />
        <Home2.PromoBanner />
        <Home2.CollectionSlider />
        <Home2.BestSellers />
        <Home2.ImageGallery />
      </>
    );
  }

  // Default: Home-1 (Arts Propelled)
  return (
    <>
      <Home1.HeroBanner />
      <Home1.FeaturedProducts />
      <Home1.ShopByCategory />
      <Home1.Newsletter />
    </>
  );
}
