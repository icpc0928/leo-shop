# Leo Shop 主題切換系統

## 概述

Leo Shop 現已支援兩套完整的視覺主題：
- **Home-1 "Arts Propelled"** - 原有的藝術風格主題
- **Home-2 "Decor Thriving"** - 全新的優雅裝飾風格主題

## 如何切換主題

編輯 `src/config/themes.ts` 檔案，修改 `CURRENT_THEME` 變數：

```typescript
// 切換到 Home-2 (Decor Thriving)
export const CURRENT_THEME: ThemeId = 'home2';

// 切換回 Home-1 (Arts Propelled)
export const CURRENT_THEME: ThemeId = 'home1';
```

修改後重新啟動開發伺服器或重新 build 即可看到變化。

## 主題差異對照

### Home-1 "Arts Propelled"
- **Header**: 單層結構，公告條 + 主導航列
- **Footer**: 中央式 footer，4 個區塊橫向排列
- **產品卡片**: 
  - Hover 時底部顯示「加入購物車」按鈕
  - 簡約邊框，溫暖色調 (#c8956c)
  - 3:4 比例圖片
- **配色**: 
  - 主色 #c8956c (駝色)
  - 背景 #f5f0eb (米色)
- **首頁區塊**: HeroBanner, FeaturedProducts, ShopByCategory, Newsletter

### Home-2 "Decor Thriving"
- **Header**: 三層結構
  - 上層：聯絡資訊 (電話/郵件) + 語言/幣別切換
  - 中層：Logo 置中，左側搜尋，右側帳號/願望清單/購物車
  - 下層：導航列 (居中排列，下劃線 hover 效果)
- **Footer**: 四欄式 footer + 電子報訂閱區
  - 關於我們 / 快速連結 / 客戶服務 / 聯絡資訊
  - 底部版權條 + 付款方式
- **產品卡片**:
  - Hover 時顯示三個浮動按鈕 (購物車/願望清單/快速預覽)
  - 無邊框，淡灰背景 (#f5f5f5)
  - 商品名用 serif 字體 (Playfair Display)
  - Sale 標籤為小圓角 pill 樣式
- **配色**:
  - 主色 #72a499 (綠色調)
  - 文字 #333333
  - 背景 #ffffff / #f8f8f8
- **首頁區塊**: SliderTwo, CollectionGrid, PromoBanner, CollectionSlider, BestSellers, ImageGallery

## 檔案結構

```
src/
├── config/
│   └── themes.ts                          # 主題配置與切換
├── components/
│   ├── layout/
│   │   ├── LayoutWrapper.tsx              # 根據主題選擇 Header/Footer
│   │   ├── Header.tsx                     # Home-1 Header
│   │   └── Footer.tsx                     # Home-1 Footer
│   ├── product/
│   │   ├── ProductCard.tsx                # Home-1 產品卡片
│   │   ├── ThemedProductCard.tsx          # 主題化產品卡片 wrapper
│   │   └── ProductGrid.tsx                # 產品網格 (使用 ThemedProductCard)
│   └── themes/
│       ├── home1/
│       │   └── index.ts                   # 重新匯出 Home-1 元件
│       └── home2/
│           ├── theme.css                  # Home-2 專用樣式
│           ├── Header2.tsx                # Home-2 三層 Header
│           ├── Footer2.tsx                # Home-2 四欄 Footer
│           ├── ProductCard2.tsx           # Home-2 產品卡片
│           ├── SliderTwo.tsx              # 首頁輪播
│           ├── CollectionGrid.tsx         # 系列網格
│           ├── PromoBanner.tsx            # 促銷橫幅
│           ├── CollectionSlider.tsx       # 系列輪播
│           ├── BestSellers.tsx            # 暢銷商品
│           ├── ImageGallery.tsx           # 圖片畫廊
│           └── index.ts                   # 匯出所有 Home-2 元件
└── i18n/
    ├── zh-TW.json                         # 繁中翻譯 (已新增 footer 相關 keys)
    └── en.json                            # 英文翻譯 (已新增 footer 相關 keys)
```

## 技術實現

### 1. Layout 切換機制
`LayoutWrapper.tsx` 根據 `CURRENT_THEME` 動態選擇對應的 Header 和 Footer：

```typescript
const HeaderComponent = CURRENT_THEME === "home2" ? Header2 : Header;
const FooterComponent = CURRENT_THEME === "home2" ? Footer2 : Footer;
```

### 2. 產品卡片切換
`ThemedProductCard.tsx` 作為 wrapper，根據主題渲染不同的產品卡片：

```typescript
if (CURRENT_THEME === "home2") {
  return <ProductCard2 product={product} />;
}
return <ProductCard product={product} />;
```

`ProductGrid` 統一使用 `ThemedProductCard`，確保全站產品卡片風格一致。

### 3. CSS 變數
Home-2 使用獨立的 `theme.css` 定義 CSS 變數：

```css
:root {
  --home2-primary: #72a499;
  --home2-text: #333333;
  --home2-bg: #ffffff;
  --home2-bg-secondary: #f8f8f8;
  /* ... */
}
```

## 翻譯檔案更新

為了支援 Home-2 Footer 的新內容，已在 `zh-TW.json` 和 `en.json` 中新增以下 keys：

```json
"footer": {
  "about": "關於我們",
  "aboutUs": "關於我們",
  "ourStory": "我們的故事",
  "careers": "加入我們",
  "sustainability": "永續發展",
  "collections": "精選系列",
  "newArrivals": "最新商品",
  "sale": "特惠專區",
  "customerService": "客戶服務",
  "shipping": "運送方式",
  "returns": "退換貨政策",
  "privacy": "隱私權政策",
  "terms": "服務條款",
  "newsletter": "訂閱電子報",
  "newsletlerDesc": "訂閱電子報，搶先獲得新品與優惠資訊",
  "emailPlaceholder": "請輸入 Email 地址",
  "subscribe": "訂閱"
}
```

## 響應式設計

兩套主題都完全支援響應式設計：
- Mobile-first 設計原則
- 斷點：sm (640px), md (768px), lg (1024px)
- Home-2 Header 在小螢幕會自動調整佈局

## 測試清單

切換主題後，建議測試以下頁面：
- ✅ 首頁 (`/`)
- ✅ 產品列表頁 (`/products`)
- ✅ 產品詳情頁 (`/products/[slug]`)
- ✅ 購物車 (`/cart`)
- ✅ 結帳頁 (`/checkout`)
- ✅ 會員中心 (`/account`)
- ✅ 關於我們 (`/about`)
- ✅ 聯絡我們 (`/contact`)

## Build 測試

```bash
cd ~/WebstormProjects/leo-shop
npx next build
```

✅ **Build 成功通過** (2025-03-04)

## 未來擴展

目前產品列表頁和詳情頁尚未建立 Home-2 專屬版本，使用通用的 `ThemedProductCard` 達成基本的主題統一。

如需進一步客製化這些頁面，可以：
1. 建立 `ProductListPage2.tsx` 和 `ProductDetailPage2.tsx`
2. 在對應的 page.tsx 中根據主題選擇不同的元件
3. 在 Home-2 版本中加入更多專屬的篩選樣式、排序控制等

## 維護注意事項

1. **避免破壞 Home-1**
   - 修改共用元件時要考慮向後相容
   - 新增功能優先放在主題專屬目錄下

2. **保持主題獨立**
   - Home-2 的樣式寫在 `theme.css`
   - 避免在全域 CSS 中加入 Home-2 專屬樣式

3. **翻譯同步**
   - 新增文字時記得同步更新 `zh-TW.json` 和 `en.json`

4. **測試切換**
   - 每次重大改動後都要測試兩套主題的切換
   - 確保 `CURRENT_THEME` 改回 'home1' 時一切正常

---

**建立日期**: 2025-03-04  
**作者**: OpenClaw Agent  
**最後更新**: 2025-03-04
