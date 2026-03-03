# Leo Shop — Admin 獨立登入頁面規格書

> 日期：2026-03-03
> 狀態：待實作

## 問題
目前 Admin 後台沒有獨立登入頁面，必須先在前台登入 Admin 帳號才能進後台。

## 目標
- Admin 有獨立的登入頁面 `/admin/login`
- 未登入訪問 `/admin/*` 自動跳轉到 `/admin/login`
- 登入後跳轉到 `/admin` 儀表板
- Admin 登入頁面風格與前台不同（簡潔、專業）
- 登出後回到 `/admin/login`

## 實作

### 1. Admin 登入頁面
`src/app/admin/login/page.tsx`

UI：
```
┌─────────────────────────────┐
│                             │
│        LEO SHOP             │
│      管理後台登入            │
│                             │
│  ┌───────────────────────┐  │
│  │ Email                 │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ 密碼                  │  │
│  └───────────────────────┘  │
│                             │
│  [登入]                     │
│                             │
│  登入失敗時顯示錯誤訊息      │
└─────────────────────────────┘
```

- 簡潔居中卡片式
- 深色或中性背景
- 呼叫 POST /api/auth/login
- 成功後儲存 token + 驗證角色是 ADMIN
- 非 ADMIN 角色顯示「無管理員權限」

### 2. Admin Auth Guard
`src/components/admin/AdminAuthGuard.tsx`

- 包裹所有 `/admin/*` 頁面（除了 `/admin/login`）
- 檢查 authStore 是否已登入且角色為 ADMIN
- 未登入 → redirect 到 `/admin/login`
- 非 ADMIN → 顯示無權限

### 3. Admin Layout 修改
`src/app/admin/layout.tsx`

- `/admin/login` 不顯示側邊欄
- 其他 `/admin/*` 頁面包裹 AdminAuthGuard + 側邊欄

### 4. Admin Header
- 右上角顯示管理員名稱 + 登出按鈕
- 登出清除 token → 跳轉 `/admin/login`
