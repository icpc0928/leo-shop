# Leo Shop — 圖片上傳功能規格書

> 日期：2026-02-24
> 狀態：待實作

## 目標
讓 Admin 能在後台管理介面上傳商品圖片（支援多張），圖片存在後端檔案系統，DB 存路徑。

---

## 一、後端架構

### 1.1 檔案儲存
- **位置：** `~/IdeaProjects/leo-shop-api/uploads/products/`
- **命名規則：** `{timestamp}_{原始檔名}`（避免衝突）
- **支援格式：** JPG、PNG、WebP
- **大小限制：** 單張 5MB
- **靜態服務：** Spring Boot 設定 `/uploads/**` 映射到檔案目錄

### 1.2 API 設計

#### `POST /api/admin/upload` 🔑
上傳一或多張圖片。

**Request：** `multipart/form-data`
- `files`: 多個檔案（MultipartFile[]）

**Response：**
```json
{
  "urls": [
    "/uploads/products/1708765432_shirt-front.jpg",
    "/uploads/products/1708765433_shirt-back.jpg"
  ]
}
```

#### `DELETE /api/admin/upload` 🔑
刪除指定圖片檔案。

**Request Body：**
```json
{
  "url": "/uploads/products/1708765432_shirt-front.jpg"
}
```

### 1.3 Product Model 變更
- `imageUrl` (String) — 主圖（第一張），保留向下相容
- `imageUrls` (String, TEXT) — 所有圖片 URL，逗號分隔

### 1.4 ProductRequest DTO 變更
- 新增 `imageUrls` 欄位（List<String>）
- 儲存時轉為逗號分隔字串
- `imageUrl` 自動取第一張

### 1.5 Spring Boot 設定
```yaml
spring:
  servlet:
    multipart:
      max-file-size: 5MB
      max-request-size: 25MB

app:
  upload:
    dir: uploads/products
```

### 1.6 靜態資源映射
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
```

### 1.7 CORS
`/uploads/**` 需要允許跨域存取圖片。

---

## 二、前端架構

### 2.1 Admin 商品管理 — 圖片上傳組件
`src/components/admin/ImageUploader.tsx`

**功能：**
- 拖拉上傳（drag & drop zone）
- 點擊選擇檔案（支援多選）
- 上傳預覽（顯示縮圖）
- 上傳進度顯示
- 刪除已上傳圖片
- 拖拉排序（第一張為主圖）
- 最多 5 張圖片

**UI：**
```
┌──────────────────────────────────┐
│  [圖1] [圖2] [圖3]  [+ 新增]    │
│   主圖   ×     ×                 │
│                                  │
│  拖放圖片到此處，或點擊上傳        │
│  支援 JPG/PNG/WebP，每張最大 5MB  │
└──────────────────────────────────┘
```

### 2.2 Admin 商品表單
修改 `src/app/admin/products/page.tsx`：
- 新增/編輯商品時顯示 ImageUploader
- 儲存時把圖片 URL 列表傳給後端
- 支援既有 URL 圖片 + 新上傳圖片混合

### 2.3 前端商品圖片顯示
- `ProductCard` — 主圖用 `imageUrls[0]`
- `ProductDetail` — 圖片輪播用全部 `imageUrls`
- 需要在 `next.config.ts` 加上 `localhost:8080` 和 `leo0928.synology.me` 為允許的圖片域名

### 2.4 API Client 更新
`src/lib/api.ts` 新增：
```typescript
export const uploadAPI = {
  uploadImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    const token = getToken();
    const res = await fetch(`${API_BASE}/api/admin/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData, // 不設 Content-Type，讓瀏覽器自動設定 boundary
    });
    return res.json();
  },
  deleteImage: (url: string) => fetchAPI('/api/admin/upload', { 
    method: 'DELETE', 
    body: JSON.stringify({ url }) 
  }),
};
```

---

## 三、資料流

```
Admin 上傳圖片
    ↓
POST /api/admin/upload (multipart)
    ↓
FileUploadService 儲存到 uploads/products/
    ↓
回傳 URL 列表
    ↓
Admin 提交商品表單（含圖片 URL）
    ↓
POST/PUT /api/admin/products
    ↓
ProductService 儲存 imageUrl + imageUrls
    ↓
前端 GET /api/products → imageUrls 陣列
    ↓
ProductCard / ProductDetail 顯示圖片
```

---

## 四、注意事項
- uploads 目錄要加入 .gitignore
- 刪除商品時應清理對應圖片檔案
- 圖片檔名避免中文（用 timestamp + 隨機碼）
- SecurityConfig 允許 GET /uploads/** 公開存取
- 前端上傳時不設 Content-Type header（multipart 自動處理）
