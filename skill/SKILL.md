# Leo Shop — 專案 Skill

## 概覽
自建購物網站，前端 Next.js + 後台 Java/Spring Boot。
以 ThemeForest 購買的 LeArts 主題為視覺參考，程式碼全部重寫。

## 技術棧

### 前端（商店）
- **框架：** Next.js 14+ (App Router)
- **語言：** TypeScript
- **樣式：** Tailwind CSS + DaisyUI v5（主題系統 + 組件 class）
- **狀態管理：** Zustand（購物車、主題、語言等）
- **多語言：** next-intl（中/英）
- **UI 參考：** `~/WebstormProjects/themeforest/Theme File Needs to Upload/New-Version-Online-Store-2.0/Install-me-learts-v4-0-4-OS-2.0/`（LeArts v4.0.4）

### 前端（管理後台）
- **UI 套件：** shadcn/ui
- **樣式：** Tailwind CSS（與商店前台統一）
- **圖表：** recharts（shadcn/ui 內建支援）
- **表格：** @tanstack/react-table（shadcn/ui 推薦）
- **位置：** 整合在同一個 Next.js 專案，路由 /admin/*

### 後台
- **框架：** Java + Spring Boot
- **資料庫：** PostgreSQL
- **API 風格：** RESTful
- **認證：** JWT

### 金流與錢包
- **錢包計價：** USD
- **虛擬幣支付：** NOWPayments API（BTC/ETH/USDT/USDC，自動匯率轉換）
- **傳統金流：** Stripe / 綠界 / 藍新（待定）
- **錢包功能：** 儲值（虛擬幣+傳統）、餘額消費、混合付款、交易紀錄

### 部署
- **前端：** Vercel 或自架
- **後台：** Docker + 自架
- **資料庫：** PostgreSQL（自架或雲端）

## 專案位置
- **前端：** `~/WebstormProjects/leo-shop/`
- **後台：** `~/IdeaProjects/leo-shop-api/`（待建立）
- **LeArts 參考：** `/tmp/learts_theme/`（解壓後的原始主題）
- **LeArts 原始檔：** `~/WebstormProjects/themeforest/`

## 開發階段

### Phase 1：前端骨架 🔨
- [ ] Next.js 專案初始化
- [ ] Tailwind CSS 設定
- [ ] 基本路由（首頁、商品列表、商品詳情、購物車、關於、聯絡）
- [ ] Layout（Header + Footer）
- [ ] 中英雙語設定

### Phase 2：前端頁面
- [ ] 首頁（Hero Banner、精選商品、新品、Newsletter）
- [ ] 商品列表頁（篩選、排序、分頁）
- [ ] 商品詳情頁（圖片、描述、加入購物車）
- [ ] 購物車頁面
- [ ] 結帳頁面
- [ ] 會員頁面（登入、註冊、訂單記錄）

### Phase 3：後台 API
- [ ] Spring Boot 專案初始化
- [ ] 商品 CRUD API
- [ ] 訂單 API
- [ ] 會員 API（註冊、登入、JWT）
- [ ] 庫存管理

### Phase 4：管理後台
- [ ] Admin Dashboard
- [ ] 商品上架/管理介面
- [ ] 訂單管理介面
- [ ] 數據統計

### Phase 5：金流與上線
- [ ] 金流串接（綠界 / 藍新 / Stripe）
- [ ] 部署設定
- [ ] 正式上線

## Sub-agent 分工策略
- **frontend-agent** — 負責 Next.js 前端開發
- **backend-agent** — 負責 Spring Boot 後台 API
- **admin-agent** — 負責管理後台
- **style-agent** — 負責參考 LeArts 轉換視覺設計

### Sub-agent 規則（每次派任務必須包含）
1. 完成後**必須更新** `~/WebstormProjects/leo-shop/skill/PROGRESS.md`，把完成的項目打勾 `[x]`
2. 如果有新增檔案或重要決策，也要記錄在 PROGRESS.md
3. 確保 `npm run build` 通過再回報完成

## 設計原則
1. **簡約風格** — 乾淨、大量留白、不花俏
2. **模組化** — 每個頁面區塊是獨立 React 組件
3. **可自訂** — 顏色、字體、Logo 等可透過設定檔修改
4. **響應式** — Mobile First
5. **中英雙語** — 所有 UI 文字支援切換

## API 文件
- **完整文件：** `~/IdeaProjects/leo-shop-api/docs/API.md`
- **Base URL：** http://localhost:8080
- **認證方式：** JWT Bearer Token
- **預設帳號：** admin@leoshop.com / admin123

## 注意事項
- LeArts 只作為**視覺參考**，不直接複製 Liquid 程式碼
- 所有 React 組件要有 TypeScript 型別定義
- CSS 統一用 Tailwind，避免混用
- API 要有 Swagger 文件
