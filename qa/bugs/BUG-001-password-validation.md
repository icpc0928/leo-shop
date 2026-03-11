# BUG-001：密碼長度驗證缺失

## 基本資訊
- **發現日期**：2026-03-11
- **發現者**：AI QA Agent
- **關聯測試**：TC-AUTH-107
- **嚴重度**：Major
- **狀態**：Open

## 重現步驟
1. 使用 API 註冊用戶
2. 提供 email: "short@test.com"
3. 提供極短密碼: "123"（3 字元）
4. 提交註冊請求

## 預期結果
- 返回 400 Bad Request
- 錯誤訊息：「密碼長度不足，最少需要 X 個字元」

## 實際結果
- 註冊成功
- 返回 token 和用戶資訊
- 弱密碼可以正常使用

## 測試命令
```bash
curl -X POST "https://cryptoshop-api.aligrich.com/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"short@test.com","password":"123","name":"Short"}'
```

**回應**：
```json
{
  "token": "eyJhbGciOiJIUzM4NCJ9...",
  "user": {
    "id": 4,
    "name": "Short",
    "email": "short@test.com",
    "phone": null,
    "role": "USER"
  }
}
```

## 環境
- **URL**：https://cryptoshop-api.aligrich.com
- **API Endpoint**：POST /api/auth/register
- **測試時間**：2026-03-11 15:52 GMT+8

## 安全影響
- 用戶可以使用極弱的密碼（1-3 字元）
- 容易被暴力破解
- 不符合一般密碼安全標準

## 建議修復
1. 在後端添加密碼長度驗證（建議最少 8 字元）
2. 考慮添加密碼複雜度要求（大小寫、數字、特殊字元）
3. 與前端驗證同步

## 修復紀錄
- **修復日期**：
- **修復 commit**：
- **驗證結果**：
