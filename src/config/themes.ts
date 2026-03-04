export type ThemeId = 'home1' | 'home2';

export interface ThemeConfig {
  name: string;
  sections: string[];
}

export const themes: Record<ThemeId, ThemeConfig> = {
  home1: {
    name: 'Arts Propelled',
    sections: ['HeroBanner', 'FeaturedProducts', 'ShopByCategory', 'Newsletter']
  },
  home2: {
    name: 'Decor Thriving',
    sections: ['SliderTwo', 'CollectionGrid', 'PromoBanner', 'CollectionSlider', 'BestSellers', 'ImageGallery']
  },
};

// 暫時用環境變數或 hardcode 切換，之後會從後端 API 讀取
export const CURRENT_THEME: ThemeId = (process.env.NEXT_PUBLIC_THEME as ThemeId) || 'home2';
