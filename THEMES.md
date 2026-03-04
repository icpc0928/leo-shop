# Leo Shop 主題系統

## 概述
Leo Shop 支援多個首頁主題，可以輕鬆切換不同的視覺風格和佈局。

## 可用主題

### Home-1: "Arts Propelled"
經典的藝術風格，適合藝術品和手工藝商店。

**Sections:**
- HeroBanner — 主視覺橫幅
- FeaturedProducts — 精選商品
- ShopByCategory — 分類瀏覽
- Newsletter — 電子報訂閱

### Home-2: "Decor Thriving"
溫暖居家風格，適合家居裝飾和生活用品。

**Sections:**
- SliderTwo — 大圖輪播（暖色系背景）
- CollectionGrid — 分類網格（2×3）
- PromoBanner — 促銷橫幅
- CollectionSlider — 橫向滑動分類
- BestSellers — 暢銷商品
- ImageGallery — Instagram 圖牆

## 如何切換主題

### 方法 1：環境變數（推薦用於生產環境）
在 `.env.local` 檔案中設定：
```bash
NEXT_PUBLIC_THEME=home2
```

### 方法 2：直接修改配置檔案
編輯 `src/config/themes.ts`：
```typescript
export const CURRENT_THEME: ThemeId = 'home2'; // 或 'home1'
```

## 目錄結構
```
src/
├── components/
│   ├── home/           # Home-1 的原始 components
│   └── themes/
│       ├── home1/      # Home-1 主題（re-export）
│       │   └── index.ts
│       └── home2/      # Home-2 主題
│           ├── SliderTwo.tsx
│           ├── CollectionGrid.tsx
│           ├── PromoBanner.tsx
│           ├── CollectionSlider.tsx
│           ├── BestSellers.tsx
│           ├── ImageGallery.tsx
│           └── index.ts
├── config/
│   └── themes.ts       # 主題配置和切換邏輯
└── app/
    └── page.tsx        # 首頁（根據主題渲染）
```

## 新增主題

1. 在 `src/components/themes/` 建立新目錄，例如 `home3/`
2. 建立該主題的 components
3. 在 `src/config/themes.ts` 中註冊新主題：
```typescript
export type ThemeId = 'home1' | 'home2' | 'home3';

export const themes = {
  // ... existing themes
  home3: {
    name: 'Your Theme Name',
    sections: ['Component1', 'Component2', ...]
  }
};
```
4. 在 `src/app/page.tsx` 中加入新主題的條件判斷

## UI 風格指南

### Home-2 配色
- 主要背景色：`#EEE5DD`, `#F5F1F1`, `#F1DED0`（暖色系）
- 強調色：`#F59E0B`（amber）
- 文字色：`#111827`（gray-900）

### 共用規範
- 圓角：`rounded-lg` 或 `rounded-xl`
- 間距：section 之間 `py-16` ~ `py-20`
- 字體：serif 標題 + sans-serif 內文
- 響應式：桌面 4 欄、平板 2 欄、手機 1 欄

## 測試
```bash
cd ~/WebstormProjects/leo-shop
npx next build
```

## 注意事項
- 切換主題不會影響其他頁面（商品頁、購物車等）
- 所有主題都使用相同的 API 和資料結構
- 圖片目前使用 placeholder，後續需要替換成實際商品圖
- 主題切換不需要重啟開發伺服器（hot reload）
