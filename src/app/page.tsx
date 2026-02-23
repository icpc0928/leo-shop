import HeroBanner from "@/components/home/HeroBanner";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ShopByCategory from "@/components/home/ShopByCategory";
import Newsletter from "@/components/home/Newsletter";

export default function Home() {
  return (
    <>
      <HeroBanner />
      <FeaturedProducts />
      <ShopByCategory />
      <Newsletter />
    </>
  );
}
