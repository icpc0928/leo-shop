# 快速切換主題

## 當前主題：Home-2 "Decor Thriving" ✨

如需切換回 Home-1，編輯此檔案：
```bash
~/WebstormProjects/leo-shop/src/config/themes.ts
```

將第 18 行改為：
```typescript
export const CURRENT_THEME: ThemeId = 'home1'; // 改回 'home1'
```

## 或使用環境變數
建立/編輯 `.env.local`：
```bash
NEXT_PUBLIC_THEME=home1
```

---

## Home-2 特色（當前）
✓ SliderTwo — 暖色系大圖輪播
✓ CollectionGrid — 2×3 分類網格  
✓ PromoBanner — 促銷橫幅
✓ CollectionSlider — 橫向滑動分類
✓ BestSellers — 暢銷商品區
✓ ImageGallery — Instagram 圖牆

## Home-1 特色
- HeroBanner — 經典主視覺
- FeaturedProducts — 精選商品
- ShopByCategory — 分類瀏覽
- Newsletter — 電子報

---
查看完整文檔：`THEMES.md`
