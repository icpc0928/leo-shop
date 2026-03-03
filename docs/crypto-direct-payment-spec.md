# Leo Shop — 直接轉帳加密支付規格書

> 日期：2026-03-03
> 狀態：待實作

## 概述
支援運營商自行配置加密貨幣支付方式，買家直接轉帳到運營商錢包，後端透過區塊鏈 API 驗證交易。

### 架構定位
- 每個運營商獨立部署一套平台
- 運營商之間完全隔離
- 所有設定（幣種、錢包、匯率）從 Admin 後台管理，不寫死
- 保留 NOWPayments 程式碼，未來可切換 gateway

---

## 一、資料模型

### 1.1 PaymentMethod（幣種設定）

```java
@Entity
@Table(name = "payment_methods")
public class PaymentMethod {
    Long id;
    String name;              // "AAA Token", "USDT (TRC-20)", "Bitcoin"
    String symbol;            // "AAA", "USDT", "BTC"
    String network;           // "polygon", "tron", "ethereum", "bitcoin"
    String contractAddress;   // ERC-20/TRC-20 合約地址（原生幣為 null）
    String walletAddress;     // 運營商收款錢包
    BigDecimal exchangeRate;  // 對 TWD 匯率（1幣=多少TWD）
    String rateSource;        // "manual" | "api"
    String gateway;           // "direct" | "nowpayments"
    String explorerUrl;       // 區塊鏈瀏覽器 URL 模板，如 "https://polygonscan.com/tx/{hash}"
    String apiEndpoint;       // 驗證用 API endpoint
    String apiKey;            // 區塊鏈 API key（Polygonscan 等）
    String iconUrl;           // 幣種 icon
    Boolean enabled;          // 是否啟用
    Integer sortOrder;        // 顯示順序
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
```

### 1.2 CryptoOrder（加密支付訂單）

```java
@Entity
@Table(name = "crypto_orders")
public class CryptoOrder {
    Long id;
    Long orderId;             // 關聯訂單
    Long paymentMethodId;     // 使用哪個幣種
    String symbol;            // 冗餘：幣種符號
    String network;           // 冗餘：網路
    BigDecimal expectedAmount;// 應付金額（含識別碼小數）
    BigDecimal actualAmount;  // 實際鏈上金額（驗證後填入）
    String walletAddress;     // 收款地址（快照）
    String txHash;            // 買家填的交易 hash
    String verifyStatus;      // "pending" | "verified" | "failed" | "manual"
    String verifyMessage;     // 驗證失敗原因
    LocalDateTime createdAt;
    LocalDateTime paidAt;     // 買家提交 hash 的時間
    LocalDateTime verifiedAt; // 驗證完成時間
}
```

---

## 二、API 設計

### 2.1 PaymentMethod 管理（Admin）

```
GET    /api/admin/payment-methods          → 列出所有幣種
POST   /api/admin/payment-methods          → 新增幣種
PUT    /api/admin/payment-methods/{id}     → 修改幣種
DELETE /api/admin/payment-methods/{id}     → 刪除幣種
PATCH  /api/admin/payment-methods/{id}/toggle → 啟用/停用
```

### 2.2 前台支付 API

```
GET    /api/payment-methods                → 列出已啟用的幣種（買家看）

POST   /api/crypto-orders                  → 建立加密支付訂單
  Body: { orderId, paymentMethodId }
  Response: { 
    id, expectedAmount, symbol, network, 
    walletAddress, explorerUrl, qrCodeData 
  }

PUT    /api/crypto-orders/{id}/submit-hash → 買家提交交易 hash
  Body: { txHash }

GET    /api/crypto-orders/{id}/status      → 查詢驗證狀態
```

### 2.3 Admin 訂單管理

```
GET    /api/admin/crypto-orders            → 列出所有加密支付訂單
POST   /api/admin/crypto-orders/{id}/verify → 手動觸發驗證
POST   /api/admin/crypto-orders/{id}/confirm → 手動確認收款
POST   /api/admin/crypto-orders/{id}/reject  → 手動拒絕
```

---

## 三、結帳流程

### 3.1 買家端

```
1. 結帳 → 選擇「加密貨幣」
2. 列出運營商啟用的幣種（從 GET /api/payment-methods）
3. 選擇幣種（如 AAA Token）
4. 建立訂單 → POST /api/crypto-orders
5. 顯示付款頁面：
   - 付款金額（含隨機識別碼小數）
   - 收款地址 + QR Code
   - 網路提醒（請使用 Polygon 網路）
6. 買家轉帳後填入交易 Hash → PUT /submit-hash
7. 顯示「等待驗證中」
8. 驗證通過 → 訂單完成
```

### 3.2 金額換算邏輯

```
訂單金額（TWD）÷ exchangeRate = 基礎幣量
+ 隨機識別碼（0.0001 ~ 0.0099）= 最終付款金額

例：
  訂單 NT$590, AAA exchangeRate = 13.8（1 AAA = 13.8 TWD）
  590 ÷ 13.8 = 42.7536
  + 0.0047（隨機）= 42.7583 AAA
  
  這個 42.7583 是唯一的，可以用來配對交易
```

---

## 四、區塊鏈驗證

### 4.1 驗證邏輯

買家提交 txHash 後，後端呼叫區塊鏈 API：

```
1. 查詢交易詳情（by txHash）
2. 驗證四項：
   ✓ to（收款地址）== 設定的 walletAddress
   ✓ value（金額）>= expectedAmount
   ✓ contractAddress == 設定的 contractAddress（ERC-20 代幣）
   ✓ status == success / confirmed
3. 全部通過 → verifyStatus = "verified"，更新訂單為 PAID
4. 任一失敗 → verifyStatus = "failed"，記錄 verifyMessage
```

### 4.2 各鏈 API

#### Polygon / Ethereum（ERC-20 代幣）
```
GET https://api.polygonscan.com/api
  ?module=proxy
  &action=eth_getTransactionReceipt
  &txhash={hash}
  &apikey={key}

免費 key：https://polygonscan.com/apis 註冊即可
限制：5 calls/sec
```

#### Tron（TRC-20 / USDT）
```
GET https://api.trongrid.io/v1/transactions/{hash}/events

免費，不需 key
```

#### Bitcoin
```
GET https://blockchain.info/rawtx/{hash}

免費，不需 key
```

### 4.3 驗證服務架構

```java
// 策略模式：每條鏈一個驗證器
public interface ChainVerifier {
    String getNetwork();  // "polygon", "tron", "bitcoin"
    VerifyResult verify(String txHash, String expectedWallet, 
                       String contractAddress, BigDecimal expectedAmount);
}

// 實作
PolygonVerifier implements ChainVerifier
TronVerifier implements ChainVerifier
BitcoinVerifier implements ChainVerifier
EthereumVerifier implements ChainVerifier

// Service 根據 network 選擇驗證器
@Service
public class CryptoVerifyService {
    Map<String, ChainVerifier> verifiers;
    
    public VerifyResult verify(CryptoOrder order, PaymentMethod method) {
        ChainVerifier v = verifiers.get(method.getNetwork());
        return v.verify(order.getTxHash(), method.getWalletAddress(),
                       method.getContractAddress(), order.getExpectedAmount());
    }
}
```

---

## 五、前端頁面

### 5.1 Admin — 幣種管理
`/admin/payment-methods`

- 表格：幣種名 | 符號 | 網路 | 錢包地址 | 匯率 | 狀態 | 操作
- 新增/編輯 Dialog：填寫所有欄位
- 啟用/停用 Toggle

### 5.2 Admin — 加密訂單管理
`/admin/crypto-orders`

- 表格：訂單ID | 幣種 | 金額 | Hash | 狀態 | 操作
- Hash 可點擊跳轉到區塊鏈瀏覽器
- 操作按鈕：驗證 | 確認 | 拒絕

### 5.3 結帳 — 幣種選擇
修改現有結帳頁面，動態載入啟用的幣種列表

### 5.4 付款頁面
`/checkout/crypto/[cryptoOrderId]`

- 金額 + 幣種 + 網路
- QR Code（錢包地址）
- 複製地址按鈕
- 填寫交易 Hash 輸入框
- 提交後顯示驗證狀態（polling）

---

## 六、SecurityConfig

```
GET  /api/payment-methods              → permitAll（前台看幣種列表）
POST /api/crypto-orders                → authenticated（建立支付）
PUT  /api/crypto-orders/*/submit-hash  → authenticated
GET  /api/crypto-orders/*/status       → authenticated
/api/admin/payment-methods/**          → ADMIN
/api/admin/crypto-orders/**            → ADMIN
```

---

## 七、開發順序

### Phase 1 — PaymentMethod 管理
- 後端：Entity + Repository + Service + Controller（CRUD）
- 前端：Admin 幣種管理頁面
- 預設塞幾個常見幣種（BTC、USDT TRC-20、ETH）

### Phase 2 — 結帳整合
- 後端：CryptoOrder Entity + 建立/查詢 API + 金額換算
- 前端：結帳選幣種 + 付款頁面（QR Code + 填 Hash）

### Phase 3 — 區塊鏈驗證
- 後端：ChainVerifier 策略模式 + Polygon/Tron/Bitcoin 驗證器
- 前端：驗證狀態顯示

### Phase 4 — Admin 訂單管理
- 前端：加密訂單列表 + 手動確認/拒絕

---

## 八、注意事項

- API key（Polygonscan 等）存 DB，不寫死在程式碼
- 匯率初期手動填，未來可接 CoinGecko API 自動更新
- QR Code 內容：幣種原生格式（如 bitcoin:地址?amount=x）
- 交易 Hash 提交後立即嘗試自動驗證，失敗則等人工
- explorerUrl 模板讓前端能生成區塊鏈瀏覽器連結
- 保留 NOWPayments 程式碼，gateway="nowpayments" 時走原邏輯
