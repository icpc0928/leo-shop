# Leo Shop — 多幣別顯示規格書

> 日期：2026-03-03
> 狀態：待實作（排隊中）

## 概述
商品價格統一存基礎幣別（運營商設定），前端根據用戶地區自動換算顯示，用戶也能手動切換。

## 後端

### ExchangeRate Entity
```
exchange_rates 表：
- id, currency (USD/JPY/EUR...), rate (對基礎幣別), updatedAt
```

### API
- GET /api/exchange-rates → 所有匯率（公開）
- GET/PUT /api/admin/exchange-rates → Admin 管理
- POST /api/admin/exchange-rates/refresh → 手動觸發抓最新匯率

### 匯率來源
- 免費 API：exchangerate-api.com（每日 1500 次免費）
- 可設 cron 每日自動更新
- Admin 也能手動覆蓋

### 基礎幣別設定
- Admin 後台設定 → 系統設定頁面
- 存在 system_settings 表或 application config

## 前端

### 偵測邏輯
1. localStorage 有存 → 用儲存的
2. navigator.language 偵測 → zh-TW→TWD, ja→JPY, en-US→USD
3. 預設 TWD

### Currency Context（全域）
- 當前幣別 + 匯率表
- 提供 formatPrice(amount) 自動換算

### Header 幣別切換器
- 🇹🇼 TWD ▾ → 下拉選 USD/JPY/EUR 等
- 切換後全站價格即時更新
- 儲存到 localStorage

### 顯示規則
- 一般頁面：顯示換算後金額（¥2,755）
- 結帳頁面：顯示兩種（¥2,755 ≈ NT$590）
- 加密貨幣付款：用基礎幣別換算幣量
