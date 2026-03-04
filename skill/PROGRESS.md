# Leo Shop — 進度追蹤

## 當前階段：Phase 1 - 前端骨架 ✅ → Phase 1.5 進行中

### Phase 0 - 規劃 ✅
- [x] 專案方向確認（Next.js + Spring Boot 自建）
- [x] 技術棧選定
- [x] 架構設計文件
- [x] Skill 文件建立
- [x] LeArts 主題分析（視覺參考用）

### Phase 1 - 前端骨架 ✅
- [x] Next.js 專案初始化
- [x] Tailwind CSS 設定
- [x] 基本路由建立（首頁/商品/購物車/關於/聯絡/FAQ）
- [x] Header + Footer 組件
- [x] 首頁（HeroBanner Swiper 輪播 + 精選商品 + Newsletter）
- [x] 商品列表頁（篩選、排序）
- [x] 商品詳情頁（圖片輪播、Tabs、相關商品）
- [x] 購物車頁面（Zustand + localStorage 持久化）
- [x] 關於/聯絡/FAQ 頁面
- [x] Mock Data（10 個商品、3 個分類）
- [x] 安裝 zustand / swiper / lucide-react

### Phase 1.5 - 前端完善 ✅
- [x] 中英雙語（next-intl）
  - next-intl 安裝與設定（NextIntlClientProvider）
  - 翻譯檔：`src/i18n/en.json`、`src/i18n/zh-TW.json`
  - i18n 設定：`src/i18n/config.ts`、`src/i18n/request.ts`
  - 語言切換按鈕（Header，zustand persist）
  - 所有組件硬編碼文字改用 `useTranslations()`
  - 語言狀態管理：`src/stores/localeStore.ts`
  - IntlProvider 包裝：`src/components/providers/IntlProvider.tsx`
- [x] 視覺調整（對照 LeArts 精修細節）
  - Announcement bar（公告欄）
  - Playfair Display 字體（標題 serif）
  - 導航底線動畫（nav-link::after）
  - HeroBanner 漸層 overlay
  - FeaturedProducts 裝飾線（section-line）
  - Shop by Category 區塊：`src/components/home/ShopByCategory.tsx`
  - 商品卡片 Quick View overlay + 星星評分 + SALE badge
  - globals.css 統一按鈕樣式、scroll-behavior smooth
  - Footer payment icons + Back to Top 按鈕
- [x] 結帳頁面（收件資訊 + 付款方式選擇）
  - `src/app/checkout/page.tsx`
  - 3 步驟流程：收件資訊 → 付款方式 → 訂單確認
  - 側邊欄訂單摘要
  - 表單驗證（必填、Email、電話格式）
  - 訂單完成感謝頁面

### Phase 2 - 會員系統 ✅
- [x] Auth Store（Zustand + localStorage persist）
- [x] 登入頁面（表單驗證、記住我、忘記密碼連結）
- [x] 註冊頁面（表單驗證、同意條款、密碼一致性檢查）
- [x] 會員中心主頁（功能卡片、未登入重導）
- [x] 個人資料頁面（編輯姓名/Email/電話、變更密碼）
- [x] 訂單記錄頁面（mock 訂單、展開明細）
- [x] 收件地址管理（新增/編輯/刪除/設預設）
- [x] Header 用戶圖示 + dropdown 選單
- [x] 中英翻譯更新（account 相關）
- [x] Types 更新（User/Order/OrderItem/Address）

### Phase 3 - 後台 API（進行中）
- [x] Spring Boot 專案初始化（~/IdeaProjects/leo-shop-api/）
- [x] H2 Database + JPA 設定
- [x] Security 設定（開發階段全開放）
- [x] CORS 設定（localhost:3000）
- [x] Health Check API（GET /api/health）
- [x] Product Entity + Repository
- [x] 商品 CRUD API
- [x] 訂單 API
- [x] 會員 API（註冊、登入、JWT）
- [x] User Entity + Repository
- [x] Address Entity + Repository
- [x] JWT 認證（JwtUtil + JwtAuthFilter）
- [x] AuthController（POST /api/auth/register, /api/auth/login）
- [x] UserController（GET/PUT /api/user/profile, PUT /api/user/password）
- [x] DataInitializer（admin@leoshop.com 預設帳號）
- [x] 庫存管理
- [x] 地址 CRUD API
- [x] Admin Dashboard 統計 API
- [x] 全域異常處理（GlobalExceptionHandler）
- [x] SecurityConfig 更新（角色權限控制）
- [x] DataInitializer 更新（mock 商品 + 用戶）
- [x] API 文件（~/IdeaProjects/leo-shop-api/docs/API.md）
- [x] 前後端串接
  - API Client（src/lib/api.ts）— fetchAPI wrapper + Token 管理 + 所有 API 模組
  - .env.local（NEXT_PUBLIC_API_URL）
  - Types 更新（id: number | string，role: string，Order status 大寫，PaginatedResponse）
  - authStore 改寫（串接 authAPI + userAPI，JWT token 存 localStorage）
  - cartStore 更新（支援 number | string id）
  - 首頁 FeaturedProducts 串接 productAPI
  - 商品列表頁串接 productAPI（篩選/分類/排序/分頁）
  - 商品詳情頁串接 productAPI.getBySlug
  - 登入/註冊頁串接 authStore（含錯誤顯示）
  - 個人資料頁串接 userAPI（含密碼變更）
  - 訂單頁串接 orderAPI.getMyOrders
  - 地址頁串接 addressAPI CRUD
  - 結帳頁串接 orderAPI.create
  - Admin Dashboard 串接 adminDashboardAPI
  - Admin 商品管理串接 adminProductAPI CRUD
  - Admin 訂單管理串接 adminOrderAPI + updateStatus
  - Admin 會員管理保留 mock data（後端無 user list API）
  - Admin layout 權限判斷支援大寫 ADMIN
  - 所有頁面含 loading 狀態 + try/catch + fallback to mock data

### Phase 4 - 管理後台 ✅
- [x] 安裝 shadcn/ui + 相關套件（recharts）
- [x] Admin Layout（側邊欄導航 + 頂部欄 + 手機版 Sheet）
- [x] Admin Dashboard（數據統計：營收、訂單數、商品數、會員數 + 營收趨勢圖 + 最近訂單）
- [x] 商品管理介面（CRUD 表格、新增/編輯表單、搜尋、刪除確認）
- [x] 訂單管理介面（訂單列表、狀態篩選 Tabs、展開詳情、狀態更新）
- [x] 會員管理介面（會員列表、搜尋、停用/啟用、會員詳情 Dialog）
- [x] Admin 權限控制（僅 ADMIN role 可進入，admin@leoshop.com mock）
- [x] Mock Data（adminMockData.ts：統計、圖表、訂單、用戶）

### Phase 4.5 - DaisyUI 主題系統整合 ✅
- [x] 安裝 DaisyUI v5
- [x] globals.css 加入 `@plugin "daisyui"` + `@import "daisyui/themes"`
- [x] 主題切換 Store（`src/stores/themeStore.ts`，Zustand + persist，17 個主題）
- [x] 主題切換組件（`src/components/ui/ThemeSwitcher.tsx`，dropdown + 色票預覽）
- [x] ThemeProvider（`src/components/providers/ThemeProvider.tsx`，useEffect 設定 data-theme）
- [x] layout.tsx 更新（suppressHydrationWarning，ThemeProvider）
- [x] Header.tsx 改用 DaisyUI（navbar, btn, badge, dropdown）
- [x] Footer.tsx 改用 DaisyUI（footer, badge, link, btn）
- [x] ProductCard.tsx 改用 DaisyUI（card, badge, btn, rating）
- [x] HeroBanner.tsx 改用 DaisyUI（hero, hero-overlay, hero-content, btn）
- [x] Newsletter.tsx 改用 DaisyUI（input, btn, join）
- [x] FeaturedProducts.tsx 改用 DaisyUI（divider）
- [x] 購物車頁面改用 DaisyUI（table, btn, join, card, divider）
- [x] 登入/註冊頁面改用 DaisyUI（card, input, checkbox, btn, form-control, label）
- [x] FAQ 頁面改用 DaisyUI（collapse + collapse-arrow，radio accordion）
- [x] 結帳頁面改用 DaisyUI（steps, input, radio, btn, card, divider）
- [x] Admin layout sidebar 改用 DaisyUI（menu, navbar, btn, loading）
- [x] Admin Dashboard 改用 DaisyUI（stat, table, badge, card）
- [x] Admin 商品管理改用 DaisyUI（table, badge, btn, input, textarea, checkbox）+ shadcn Dialog
- [x] Admin 訂單管理改用 DaisyUI（tabs, table, badge, btn, divider）
- [x] Admin 會員管理改用 DaisyUI（table, badge, btn, input）+ shadcn Dialog
- [x] 主題預覽頁面（`src/app/themes/page.tsx`，17 主題色票展示 + 點擊切換）
- [x] `npm run build` 通過

### Phase 4.6 - 圖片上傳功能 ✅
- [x] Admin 圖片上傳組件（拖放 + 多圖 + 預覽）
- [x] 商品管理支援圖片上傳
- [x] 圖片上傳 API（POST /api/admin/upload，檔案系統儲存）
- [x] 靜態資源服務（/uploads/**）

### Phase 5 - 錢包與金流（進行中）

#### 5.0 加密貨幣直接付款（NOWPayments）✅
- [x] CryptoPayment Entity + Repository
- [x] NowPaymentsService（createPayment / getPaymentStatus / handleWebhook）
- [x] CryptoPaymentController（POST create / GET status / POST webhook）
- [x] DTOs（CryptoPaymentRequest / CryptoPaymentResponse）
- [x] Order model 更新（cryptoPaymentId 欄位、PAID 狀態）
- [x] SecurityConfig 更新（webhook permitAll）
- [x] application.yml nowpayments 設定
- [x] RestTemplate bean（AppConfig）
- [x] HMAC-SHA512 webhook 簽名驗證
- [x] `./gradlew compileJava` 通過 ✅

#### 5.0.5 加密貨幣直接轉帳支付（後端）✅
- [x] PaymentMethod Entity + Repository（幣種管理）
- [x] PaymentMethodService（CRUD + toggle 啟停用）
- [x] PaymentMethodController（Admin CRUD: /api/admin/payment-methods）
- [x] PaymentMethodPublicController（GET /api/payment-methods → 列出已啟用幣種）
- [x] CryptoOrder Entity + Repository（加密支付訂單）
- [x] CryptoOrderService（建立訂單、金額換算+隨機識別碼、提交hash、自動驗證、手動確認/拒絕）
- [x] CryptoOrderController（POST /api/crypto-orders、PUT submit-hash、GET status）
- [x] AdminCryptoOrderController（GET list、POST verify/confirm/reject）
- [x] ChainVerifier 介面 + 策略模式
  - PolygonVerifier（Polygonscan API）
  - EthereumVerifier（Etherscan API）
  - TronVerifier（TronGrid API）
  - BitcoinVerifier（Blockchain.info API）
  - CryptoVerifyService（根據 network 自動選擇驗證器）
- [x] DTOs（PaymentMethodRequest/Response、CryptoOrderRequest/Response）
- [x] SecurityConfig 更新（payment-methods permitAll、crypto-orders authenticated、admin/** ADMIN）
- [x] DataInitializer 預設幣種（BTC/USDT TRC-20/ETH，預設 disabled）
- [x] `./gradlew compileJava` 通過 ✅

#### 5.0.6 多幣別顯示 ✅
- [x] ExchangeRate Entity + Repository（exchange_rates 表）
- [x] ExchangeRateService（getAllRates / updateRate / refreshRates from open.er-api.com）
- [x] ExchangeRateController（GET /api/exchange-rates → public map）
- [x] AdminExchangeRateController（GET list / PUT update / POST refresh）
- [x] SecurityConfig 更新（exchange-rates permitAll）
- [x] DataInitializer 預設 10 種匯率（USD/JPY/EUR/GBP/CNY/KRW/THB/VND/SGD/HKD）
- [x] CurrencyContext（`src/contexts/CurrencyContext.tsx`）— 全域幣別狀態 + 匯率表
  - localStorage 持久化
  - navigator.language 自動偵測幣別
  - convertPrice / formatPrice / formatPriceTWD
- [x] layout.tsx 包裹 CurrencyProvider
- [x] Header 幣別切換器（DaisyUI dropdown，11 種幣別 + 國旗 emoji）
- [x] ProductCard 價格顯示改用 CurrencyContext formatPrice
- [x] 商品詳情頁價格顯示改用 CurrencyContext formatPrice
- [x] 購物車頁面價格顯示改用 CurrencyContext formatPrice
- [x] 結帳頁面雙幣別顯示（目標幣別 + ≈ NT$ 基礎金額）
- [x] API Client 新增 exchangeRateAPI / adminExchangeRateAPI
- [x] i18n 中英文翻譯（currency namespace）
- [x] Admin 頁面保持顯示基礎幣別 TWD（不受影響）
- [x] 後端 `./gradlew compileJava` 通過 ✅
- [x] 前端 `npm run build` 通過 ✅

#### 5.1 錢包系統
- [ ] Wallet Entity（userId, balance, currency=USD）
- [ ] Transaction Entity（type: TOPUP/PURCHASE/REFUND, amount, status, reference）
- [ ] 錢包 API（查餘額、交易紀錄）
- [ ] 前端：會員中心「我的錢包」頁面
- [ ] 前端：交易紀錄頁面

#### 5.1.5 加密貨幣支付頁面（前端）✅
- [x] 安裝 qrcode.react
- [x] API Client 新增 cryptoPaymentAPI（create / getStatus）
- [x] Types 新增 CryptoPayment interface
- [x] Checkout 頁面：付款方式改為「貨到付款」+「加密貨幣（BTC/USDT）」
- [x] 加密貨幣付款頁面（`/checkout/crypto/[paymentId]`）
  - QR Code 顯示錢包地址
  - 複製地址按鈕
  - 即時狀態輪詢（每 10 秒）
  - 成功動畫 + 自動跳轉
  - 過期/失敗提示
- [x] i18n 中英文翻譯（cryptoPayment namespace）
- [x] `npm run build` 通過

#### 5.1.6 Admin 獨立登入頁面 ✅
- [x] Admin 登入頁面（`/admin/login`）— 深色背景、居中卡片、Email+密碼
- [x] AdminAuthGuard 組件（`src/components/admin/AdminAuthGuard.tsx`）— 角色檢查、未登入跳轉、無權限提示
- [x] Admin Layout 修改 — `/admin/login` 不顯示側邊欄、其他頁面包裹 AuthGuard
- [x] 側邊欄新增「支付管理」「加密訂單」導航項
- [x] 登出跳轉 `/admin/login`
- [x] LayoutWrapper 確認 `/admin/*` 不顯示前台 Header/Footer

#### 5.1.8 Admin 帳號分離（admin_users 表）✅
- [x] AdminUser Entity（`admin_users` 表，獨立於 `users`）
- [x] AdminUserRepository（findByEmail）
- [x] AdminAuthService（驗證 admin_users + BCrypt + JWT with userType=admin claim）
- [x] AdminAuthController（POST /api/admin/auth/login）
- [x] JwtUtil 更新（generateAdminToken + getUserTypeFromToken + user token 加 userType=user）
- [x] SecurityConfig 更新（/api/admin/auth/** permitAll）
- [x] DataInitializer 更新（admin_users 表建預設管理員，不再寫入 users 表）
- [x] 前端 api.ts：新增 fetchAdminAPI（使用 leo-shop-admin-token）、adminAuthAPI
- [x] 所有 admin API 改用 fetchAdminAPI（adminProductAPI、adminOrderAPI、adminDashboardAPI、adminPaymentMethodAPI、adminCryptoOrderAPI、uploadAPI）
- [x] Admin 登入頁改用 adminAuthAPI.login，token 存 leo-shop-admin-token
- [x] AdminAuthGuard 改用 admin token 驗證
- [x] Admin Layout 登出清除 admin session
- [x] 前後端 build 通過 ✅

#### 5.1.7 加密貨幣直接轉帳前端 ✅
- [x] API Client 更新（paymentMethodAPI、adminPaymentMethodAPI、cryptoOrderAPI、adminCryptoOrderAPI）
- [x] Types 更新（PaymentMethod、CryptoOrder interface）
- [x] Admin 幣種管理頁面（`/admin/payment-methods`）— CRUD 表格、新增/編輯 Dialog、啟停用 Toggle
- [x] Admin 加密訂單頁面（`/admin/crypto-orders`）— 訂單列表、狀態 badge、驗證/確認/拒絕操作
- [x] 結帳頁面修改 — 動態載入啟用幣種（GET /api/payment-methods）、選擇後建立 crypto order
- [x] 付款頁面整合 — 支援 NOWPayments + 直接轉帳雙模式（numeric ID = direct, string = nowpayments）
  - QR Code 收款地址
  - 複製地址按鈕
  - 網路提醒
  - 交易 Hash 輸入+提交
  - 10 秒 polling 驗證狀態
  - verified → 成功動畫 → 跳轉訂單頁
- [x] i18n 中英文翻譯（admin sidebar、paymentMethods、cryptoOrders、付款頁面）
- [x] `npm run build` 通過

#### 5.2 儲值功能
- [ ] 儲值 API（產生付款請求）
- [ ] 虛擬貨幣儲值（NOWPayments API 串接）
  - 支援 BTC / ETH / USDT / USDC
  - 自動匯率轉換為 USD
  - Webhook 接收到帳通知，自動入帳
- [ ] 傳統方式儲值（Stripe / 綠界 / 藍新）
- [ ] 前端：儲值流程頁面（選金額 → 選付款方式 → 付款）

#### 5.3 結帳整合
- [ ] 結帳支援「使用錢包餘額」扣款
- [ ] 餘額不足時可混合付款（餘額 + 其他方式）
- [ ] 直接用虛擬幣付款（不經過錢包）
- [ ] 前端：結帳頁面加入餘額選項

#### 5.4 部署與上線
- [ ] 部署設定
- [ ] 正式上線

---

## 決策記錄

| 日期 | 決策 | 原因 |
|------|------|------|
| 2026-02-11 | 選擇 Next.js + 自建後台 | Leo 希望完全掌控，不想被 Shopify 綁定 |
| 2026-02-11 | 後台用 Java/Spring Boot | Leo 的主力語言 |
| 2026-02-11 | 前端用 Tailwind CSS | 簡約風格首選，開發速度快 |
| 2026-02-11 | LeArts 作為視覺參考 | 已購買授權，參考設計但重寫程式碼 |
| 2026-02-11 | 後台專案放 ~/IdeaProjects/ | Leo 習慣 WebStorm 前端、IntelliJ IDEA 後端 |
| 2026-02-11 | 支付需支援虛擬貨幣 | Leo 希望除了傳統金流外，也能用 BTC/ETH/USDT 等加密貨幣支付 |
| 2026-02-11 | 管理後台用 shadcn/ui | 輕量、Tailwind 統一風格、現成 Table/Form/Chart 組件 |
| 2026-02-11 | 價格用 USD 計價 | 統一貨幣，虛擬幣自動轉換 USD |
| 2026-02-11 | 虛擬幣串接用 NOWPayments | 支援 200+ 幣種、API 簡單、手續費 0.5%、免 KYC |
| 2026-02-11 | 加入錢包儲值系統 | 用戶可儲值後用餘額消費，支援虛擬幣 + 傳統方式儲值 |
| 2026-02-11 | 主題從「溫暖簡約」切換為「自然清新」 | 色系從金棕色 #c8956c 改為綠色系 #22c55e，字體從 Playfair Display+Inter 改為 Lora+Nunito，整體風格更清新自然 |
| 2026-03-03 | 加密訂單頁面 UI 優化 | 狀態 badge 加圖示、按鈕改 icon+文字、失敗狀態改「重新確認」、拒絕按鈕改 outline 風格 |
| 2026-03-03 | 購物車氣泡即時更新+美化 | 修正 zustand selector 訂閱 items 而非 method ref，氣泡改自訂圓形+bounce 動畫 |
| 2026-03-04 | 多幣別匯率 API（CoinGecko 自動更新） | PaymentMethod 新增 `refreshRates()` API，呼叫 CoinGecko API 自動更新加密貨幣匯率（BTC/ETH/USDT） |
| 2026-03-04 | Admin 加密訂單 UI 優化（Polygonscan 風格） | 參考 Polygonscan，狀態顯示優化、按鈕樣式調整、色彩對比提升 |
| 2026-03-04 | Admin 管理員管理頁面（CRUD） | 新增 `/admin/admin-users` 頁面，支援管理員列表、新增、編輯、刪除（admin_users 表） |
| 2026-03-04 | Admin 支付管理「匯率來源」欄位 + 刷新匯率按鈕 | PaymentMethod 列表加入 `rateSource`（CoinGecko）欄位顯示，頁面右上角新增「刷新匯率」按鈕 |
| 2026-03-04 | 購物車氣泡即時更新修復 | 修正 zustand selector 訂閱問題，購物車數量變動即時反映於 Header badge |
| 2026-03-04 | 結帳流程：未登入跳轉登入頁（redirect 回結帳） | Checkout 頁面加入 `isAuthenticated` 檢查，未登入自動跳轉 `/login?redirect=/checkout` |
| 2026-03-04 | 結帳運費改為從後端 API 取得 | 呼叫 `GET /api/orders/shipping-fee?subtotal=xxx`，根據小計動態計算運費（>=1000 免運） |
| 2026-03-04 | 加密付款頁面 BTC 顯示 8 位小數 | formatCryptoAmount() 改為 BTC 顯示 8 位、其他幣種 6 位小數 |
| 2026-03-04 | 確認訂單頁顯示預估加密貨幣金額 | Order summary 顯示「≈ 0.00123456 BTC」預估金額（根據即時匯率） |
| 2026-03-04 | TronVerifier Base58/Hex 地址轉換修復 | 修正 Base58.decode() 異常處理、Hex 地址轉換邏輯，確保 USDT TRC-20 驗證正確 |
| 2026-03-04 | truncate null 修復 | 修正 truncateAddress() 函數 null pointer 問題，加入防禦性檢查 |
| 2026-03-04 | toggle 改按鈕 | Admin 幣種管理「啟用/停用」從 checkbox 改為 DaisyUI toggle button |
| 2026-03-04 | CORS PATCH 方法支援 | 後端 SecurityConfig 加入 `PATCH` 到 allowedMethods，前端可用 PATCH 做局部更新 |
| 2026-03-04 | PostgreSQL constraint 修復 | 修正 `admin_users` 表 unique constraint 衝突問題，調整 migration script |
