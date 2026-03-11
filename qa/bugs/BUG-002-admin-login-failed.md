# BUG-002：Admin 帳號無法登入

## 基本資訊
- **發現日期**：2026-03-11
- **發現者**：AI QA Agent
- **關聯測試**：TC-AUTH-005
- **嚴重度**：Critical
- **狀態**：Open

## 重現步驟
1. 使用 API 登入 Admin 帳號
2. Email: admin@leoshop.com
3. Password: admin123
4. 提交登入請求

## 預期結果
- 登入成功
- 返回 Admin token
- 用戶角色為 ADMIN

## 實際結果
- 登入失敗
- 返回 400 Bad Request
- 錯誤訊息：「Invalid email or password」

## 測試命令
```bash
curl -X POST "https://cryptoshop-api.aligrich.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@leoshop.com","password":"admin123"}'
```

**回應**：
```json
{
  "error": true,
  "message": "Invalid email or password",
  "status": 400
}
```

## 環境
- **URL**：https://cryptoshop-api.aligrich.com
- **API Endpoint**：POST /api/auth/login
- **測試時間**：2026-03-11 15:51 GMT+8
- **Admin UI**：https://cryptoshop.aligrich.com/admin（頁面正常顯示）

## 影響範圍
- 無法登入 Admin 後台
- 所有後台管理功能無法測試：
  - 商品管理（新增/編輯/刪除）
  - 訂單管理
  - CMS 管理（輪播/FAQ/頁面）
  - 系統設定
  - 支付方式管理

## 可能原因
1. Admin 帳號未在資料庫中創建
2. 密碼不正確（與提供的不符）
3. Admin 登入使用不同的 API endpoint
4. Email 或密碼有誤

## 建議
1. 確認 Admin 帳號是否存在於資料庫
2. 確認正確的 Admin 帳號密碼
3. 檢查是否有獨立的 Admin 登入 API
4. 提供測試用的 Admin 帳號資訊

## 修復紀錄
- **修復日期**：
- **修復 commit**：
- **驗證結果**：
