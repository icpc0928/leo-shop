# BUG-003：購物車 API 不存在（404）

## 基本資訊
- **發現日期**：2026-03-11
- **發現者**：AI QA Agent
- **關聯測試**：TC-CART-001
- **嚴重度**：Critical
- **狀態**：Open

## 重現步驟
1. 使用有效的 JWT token（已登入用戶）
2. POST /api/cart
3. Body: {"productId":17,"quantity":2}
4. 提交請求

## 預期結果
- 商品加入購物車
- 返回購物車內容或成功訊息

## 實際結果
- 返回 404 Not Found
- API endpoint 不存在

## 測試命令
```bash
TOKEN="eyJhbGciOiJIUzM4NCJ9..."
curl -X POST "https://cryptoshop-api.aligrich.com/api/cart" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"productId":17,"quantity":2}'
```

**回應**：
```json
{
  "timestamp": "2026-03-11T07:51:12.232+00:00",
  "status": 404,
  "error": "Not Found",
  "path": "/api/cart"
}
```

## 環境
- **URL**：https://cryptoshop-api.aligrich.com
- **API Endpoint**：POST /api/cart
- **測試時間**：2026-03-11 15:51 GMT+8

## 影響範圍
**阻擋所有購物流程測試**，包括：
- ❌ 加入購物車
- ❌ 查看購物車
- ❌ 修改購物車數量
- ❌ 刪除購物車商品
- ❌ 結帳流程
- ❌ 訂單建立
- ❌ 加密支付流程

## 可能原因
1. 購物車 API 尚未實作
2. API 路徑錯誤（可能是其他路徑，如 /api/cart/items）
3. 需要特定的請求格式或參數
4. 購物車功能僅在前端實作（localStorage）

## 建議
1. 確認正確的購物車 API endpoint
2. 提供購物車 API 文檔
3. 如購物車使用前端 storage，請說明整合方式
4. 優先實作購物車 API（核心功能）

## 相關測試無法執行
- TC-CART-001: 加入購物車
- TC-CART-002: 修改數量
- TC-CART-003: 刪除商品
- TC-CART-101~106: 邊界測試
- TC-ORDER-001: 結帳流程
- TC-ORDER-002: 未登入結帳
- TC-ORDER-101~104: 訂單邊界測試
- TC-CRYPTO-001: 加密支付頁面

## 修復紀錄
- **修復日期**：
- **修復 commit**：
- **驗證結果**：
