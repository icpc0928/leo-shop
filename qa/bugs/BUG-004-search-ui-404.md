# BUG-004：前台搜尋頁面 404

## 基本資訊
- **發現日期**：2026-03-11
- **發現者**：AI QA Agent
- **關聯測試**：TC-PROD-003
- **嚴重度**：Major
- **狀態**：Open

## 重現步驟
1. 訪問前台搜尋頁面
2. URL: https://cryptoshop.aligrich.com/products/search?q=Tesla
3. 觀察頁面

## 預期結果
- 顯示搜尋結果頁面
- 列出包含「Tesla」的商品
- 顯示搜尋關鍵字和結果數量

## 實際結果
- 顯示 404 頁面
- 內容：「404 - This page could not be found.」
- 搜尋功能無法使用

## 截圖
![搜尋 404 錯誤](MEDIA:/Users/leo/.openclaw/media/browser/ce7fa875-6c14-4baa-ad28-13487c277e29.jpg)

## 環境
- **前台 URL**：https://cryptoshop.aligrich.com
- **問題路徑**：/products/search?q=Tesla
- **瀏覽器**：Chrome（透過 OpenClaw）
- **測試時間**：2026-03-11 15:50 GMT+8

## 影響
- 前台用戶無法使用搜尋功能
- 影響用戶體驗
- 用戶需要手動瀏覽分類尋找商品

## 對比測試
**API 正常**：
```bash
curl "https://cryptoshop-api.aligrich.com/api/products?search=Tesla"
# ✅ 正常返回搜尋結果
```

## 可能原因
1. 前端路由配置缺少 /products/search 路徑
2. 搜尋功能使用不同的 URL 格式
3. Next.js 動態路由配置錯誤

## 建議修復
1. 添加搜尋頁面路由（/products/search 或 /search）
2. 或調整搜尋邏輯，使用現有的 /products 頁面 + query 參數
3. 確保前端搜尋框導向正確的 URL

## 修復紀錄
- **修復日期**：
- **修復 commit**：
- **驗證結果**：
