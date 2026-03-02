# Leo Shop — 加密貨幣支付功能規格書（NOWPayments）

> 日期：2026-02-25
> 狀態：待實作

## 目標
整合 NOWPayments API，支援 BTC 和 USDT 付款。

---

## 一、NOWPayments API

### 文件
- API Docs: https://documenter.getpostman.com/view/7907941/2s93JwMgmp
- Sandbox: https://sandbox.nowpayments.io
- Production: https://api.nowpayments.io

### 關鍵 API

#### 1. 建立付款
`POST /v1/payment`
```json
{
  "price_amount": 590,
  "price_currency": "twd",
  "pay_currency": "btc",
  "order_id": "order_123",
  "order_description": "Leo Shop Order #123",
  "ipn_callback_url": "https://leo0928.synology.me:18080/api/payments/crypto/webhook"
}
```
Response:
```json
{
  "payment_id": "5745459",
  "payment_status": "waiting",
  "pay_address": "3EZ7aadfasdf...",
  "pay_amount": 0.00012345,
  "pay_currency": "btc",
  "price_amount": 590,
  "price_currency": "twd"
}
```

#### 2. 查詢付款狀態
`GET /v1/payment/{payment_id}`

#### 3. Webhook (IPN)
NOWPayments POST 到我們的 callback URL：
- Header: `x-nowpayments-sig` — HMAC-SHA512 簽名驗證
- Body 包含 `payment_status`: waiting → confirming → confirmed → sending → finished

### 付款狀態流程
```
waiting → confirming → confirmed → sending → finished
                                              ↗
                    expired / failed / refunded
```

---

## 二、後端實作

### 2.1 設定
`application.yml`:
```yaml
nowpayments:
  api-key: ${NOWPAYMENTS_API_KEY:sandbox-api-key}
  ipn-secret: ${NOWPAYMENTS_IPN_SECRET:sandbox-secret}
  base-url: https://api.nowpayments.io/v1
  sandbox: true
```

### 2.2 新增檔案

#### CryptoPaymentController
`src/main/java/com/leoshop/controller/CryptoPaymentController.java`

```
POST /api/payments/crypto/create
- Body: { orderId, payCurrency: "btc" | "usdt" }
- 呼叫 NOWPayments API 建立付款
- 回傳: { paymentId, payAddress, payAmount, payCurrency, qrCodeUrl }

GET /api/payments/crypto/status/{paymentId}
- 查詢付款狀態

POST /api/payments/crypto/webhook (公開，不需 JWT)
- 接收 NOWPayments IPN callback
- 驗證 HMAC-SHA512 簽名
- 更新訂單狀態
```

#### NowPaymentsService
`src/main/java/com/leoshop/service/NowPaymentsService.java`
- createPayment(orderId, payCurrency) → CryptoPaymentResponse
- getPaymentStatus(paymentId) → status
- verifyWebhookSignature(body, signature) → boolean
- 使用 RestTemplate 或 WebClient 呼叫外部 API

#### CryptoPayment Entity (可選)
`src/main/java/com/leoshop/model/CryptoPayment.java`
- id, orderId, paymentId (NOWPayments 的), payAddress, payAmount, payCurrency, status, createdAt, updatedAt

#### DTOs
- CryptoPaymentRequest: { orderId, payCurrency }
- CryptoPaymentResponse: { paymentId, payAddress, payAmount, payCurrency, priceAmount, priceCurrency, status }

### 2.3 SecurityConfig
- POST /api/payments/crypto/webhook → permitAll（webhook 不需要 JWT）
- POST /api/payments/crypto/create → 需要登入
- GET /api/payments/crypto/status/** → 需要登入

### 2.4 Order 整合
- Order model 加欄位: `paymentMethod` (CASH_ON_DELIVERY / CREDIT_CARD / CRYPTO)
- Order model 加欄位: `cryptoPaymentId` (nullable)
- 付款完成後更新 order status 為 PAID

---

## 三、前端實作

### 3.1 Checkout 頁面 — 付款方式選擇
在結帳流程的付款步驟加入：
- ○ 貨到付款
- ○ 信用卡（未來）
- ○ 加密貨幣 → 展開選擇 BTC / USDT

### 3.2 加密貨幣付款頁面
`src/app/checkout/crypto/page.tsx` 或 dialog

**UI：**
```
┌──────────────────────────────────┐
│  💰 加密貨幣付款                   │
│                                  │
│  訂單金額: NT$ 590               │
│  付款金額: 0.00012345 BTC        │
│                                  │
│  ┌────────────┐                  │
│  │  QR Code   │                  │
│  │            │                  │
│  └────────────┘                  │
│                                  │
│  錢包地址: 3EZ7aadfasdf...  [複製]│
│                                  │
│  狀態: ⏳ 等待付款...             │
│  (自動刷新，每 10 秒查詢一次)      │
│                                  │
│  付款完成後將自動跳轉 ✅           │
└──────────────────────────────────┘
```

### 3.3 API Client
`src/lib/api.ts` 新增：
```typescript
export const cryptoPaymentAPI = {
  create: (data: { orderId: number; payCurrency: string }) =>
    fetchAPI('/api/payments/crypto/create', { method: 'POST', body: JSON.stringify(data) }),
  getStatus: (paymentId: string) =>
    fetchAPI(`/api/payments/crypto/status/${paymentId}`),
};
```

### 3.4 QR Code
使用 `qrcode.react` 套件生成 QR Code（錢包地址）

### 3.5 輪詢
付款頁面每 10 秒 GET /api/payments/crypto/status/{paymentId}
狀態變為 finished 時顯示成功並跳轉訂單頁面

---

## 四、測試

### Sandbox 測試
NOWPayments sandbox 模式下：
- 不需要真的付款
- 可以手動觸發 webhook
- API key 從 sandbox.nowpayments.io 取得

### 測試流程
1. 前端選加密貨幣 → 建立付款 → 顯示 QR Code
2. 手動 curl webhook 模擬付款完成
3. 確認訂單狀態更新

---

## 五、注意事項
- API Key 不要 commit（用環境變數）
- Webhook 必須驗證簽名（防偽造）
- TWD 對 BTC/USDT 匯率由 NOWPayments 即時計算
- 付款有效期限約 20 分鐘，過期需重新建立
- USDT 支援 TRC-20（手續費低）和 ERC-20
