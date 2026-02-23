# Leo Shop — 架構設計

## 系統架構

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│              │     │              │     │              │
│   Browser    │────▶│   Next.js    │────▶│  Spring Boot │
│   (客戶端)   │     │   (前端)     │     │  (後台 API)  │
│              │     │              │     │              │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                           ┌──────▼───────┐
                                           │              │
                                           │  PostgreSQL  │
                                           │  (資料庫)    │
                                           │              │
                                           └──────────────┘
```

## 前端路由結構

```
/                       # 首頁
/products               # 商品列表
/products/[slug]        # 商品詳情
/cart                   # 購物車
/checkout               # 結帳
/account                # 會員中心
/account/login          # 登入
/account/register       # 註冊
/account/orders         # 訂單記錄
/about                  # 關於我們
/contact                # 聯絡我們
/faq                    # 常見問題
/blog                   # 部落格
/blog/[slug]            # 文章詳情
/admin                  # 管理後台 Dashboard
/admin/products         # 商品管理
/admin/orders           # 訂單管理
/admin/users            # 會員管理
```

## 前端組件結構

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root Layout
│   ├── page.tsx            # 首頁
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   ├── account/
│   ├── about/
│   ├── contact/
│   ├── faq/
│   └── blog/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Breadcrumb.tsx
│   ├── home/
│   │   ├── HeroBanner.tsx
│   │   ├── FeaturedProducts.tsx
│   │   ├── NewArrivals.tsx
│   │   └── Newsletter.tsx
│   ├── product/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── ProductGallery.tsx
│   │   └── ProductFilter.tsx
│   ├── cart/
│   │   ├── CartItem.tsx
│   │   ├── CartSummary.tsx
│   │   └── CartDrawer.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── ...
├── lib/
│   ├── api.ts              # API 呼叫封裝
│   ├── auth.ts             # 認證相關
│   └── utils.ts
├── stores/
│   ├── cartStore.ts        # 購物車狀態 (Zustand)
│   └── authStore.ts        # 認證狀態
├── types/
│   ├── product.ts
│   ├── order.ts
│   └── user.ts
├── i18n/
│   ├── en.json
│   └── zh-TW.json
└── styles/
    └── globals.css         # Tailwind 基礎樣式
```

## 後台 API 結構

```
leo-shop-api/
├── src/main/java/com/leoshop/
│   ├── controller/
│   │   ├── ProductController.java
│   │   ├── OrderController.java
│   │   ├── UserController.java
│   │   └── AdminController.java
│   ├── service/
│   ├── repository/
│   ├── model/
│   ├── dto/
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   └── CorsConfig.java
│   └── LeoShopApplication.java
└── src/main/resources/
    └── application.yml
```

## 資料庫 Schema（核心）

```sql
-- 商品
products (id, name, slug, description, price, compare_price, 
          images, category_id, stock, status, created_at)

-- 商品分類
categories (id, name, slug, parent_id, image)

-- 訂單
orders (id, user_id, status, total, shipping_address, 
        payment_method, created_at)

-- 訂單項目
order_items (id, order_id, product_id, quantity, price)

-- 會員
users (id, email, password_hash, name, phone, 
       role, created_at)
```
