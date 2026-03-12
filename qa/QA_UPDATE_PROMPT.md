# QA 測試案例增量更新 — Prompt

> **用途**：當專案有新功能或 API 變更時，AI 自動比對 git diff，更新 QA 測試文件。
> **使用方式**：把這份文件交給 AI，指定要比對的 commit 範圍。

---

## 指令

你是 QA 工程師。請根據 git 變更，增量更新 QA 測試文件。

### Step 1：分析變更

執行以下指令，了解這段期間改了什麼：

```bash
# 自動偵測專案類型並比對變更
# {LAST_COMMIT} = 上次 QA 更新的 commit hash（見本文件底部紀錄）

# 如果是後端（Java/Spring Boot）
git log --oneline {LAST_COMMIT}..HEAD
git diff {LAST_COMMIT}..HEAD --stat
git diff {LAST_COMMIT}..HEAD -- '**/controller/'    # API 變更
git diff {LAST_COMMIT}..HEAD -- '**/model/'         # Entity 變更
git diff {LAST_COMMIT}..HEAD -- '**/dto/'            # DTO 變更
git diff {LAST_COMMIT}..HEAD -- '**/SecurityConfig*' # 權限變更

# 如果是前端（Next.js/React）
git log --oneline {LAST_COMMIT}..HEAD
git diff {LAST_COMMIT}..HEAD --stat
git diff {LAST_COMMIT}..HEAD -- 'src/app/'           # 頁面變更
git diff {LAST_COMMIT}..HEAD -- 'src/lib/'           # API 串接變更
git diff {LAST_COMMIT}..HEAD -- 'src/components/'    # 元件變更

# 如果是其他框架，自行調整路徑：
# Node/Express: routes/, controllers/, models/
# Python/Django: views.py, urls.py, models.py, serializers.py
# Go: handlers/, routes/, models/
```

### Step 2：識別變更類型

根據 diff 結果，分類：

| 類型 | 判斷依據 | 影響 |
|------|---------|------|
| **新增 API** | Controller 有新的 @GetMapping/@PostMapping 等 | 需新增測試案例 |
| **修改 API** | Controller 方法邏輯變更 | 需更新或新增回歸測試 |
| **新增 Entity/DTO** | model/ 或 dto/ 有新檔案 | 對應的 CRUD 需測試 |
| **新增頁面** | src/app/ 有新目錄 | 需新增 UI 測試 |
| **權限變更** | SecurityConfig 變更 | 需更新安全測試 |
| **修改驗證規則** | DTO 的 @Size/@NotBlank 等變更 | 需更新邊界測試 |
| **Bug 修復** | commit message 含 BUG/fix | 需新增回歸測試 |

### Step 3：更新文件

#### 3a. 更新 `qa/QA_SKILL.md`

- 如果有新增 API → 加到「API Endpoint 總覽」的對應區塊（Public / User / Admin）
- 如果有新增頁面 → 加到「專案結構」
- 如果測試環境有變 → 更新環境資訊

#### 3b. 更新 `qa/TEST_CASES.md`

對每個新增/修改的功能：

1. **新模組** → 新建一個 `## 模組名 — 說明` 區塊，包含：
   - 功能測試 🔲（基本 CRUD / 正常流程）
   - 邊界測試 📏（極端值：0、-1、空白、超長）
   - 等價類 📊（有輸入欄位時）
   - 白盒 ⬜（有業務邏輯時）

2. **現有模組新增 API** → 在對應模組下新增案例

3. **Bug 修復** → 新增 🔁 回歸測試案例：
```markdown
### 回歸測試 🔁

| 編號 | 測試項目 | 優先級 | 類型 | 說明 |
|------|---------|--------|------|------|
| TC-XXX-R01 | BUG-001 回歸 | P1 | API | 驗證密碼最低 8 字元限制仍有效 |
```

4. **更新歷史紀錄**（底部）：
```markdown
| YYYY-MM-DD | vX.X | 新增 XXX 模組 N 個案例，更新 XXX |
```

#### 3c. 編號規則

- 功能測試：`TC-{模組}-001` 起
- 邊界測試：`TC-{模組}-101` 起
- 等價類：`TC-{模組}-201` 起
- 白盒：`TC-{模組}-301` 起
- 回歸：`TC-{模組}-R01` 起

如果模組已有案例，接續最後的編號。

### Step 4：驗證覆蓋率

更新完成後，確認：

- [ ] 每個新 API endpoint 至少被 1 個測試案例覆蓋
- [ ] 每個新頁面至少被 1 個測試案例覆蓋
- [ ] 新增的輸入欄位有邊界測試
- [ ] Bug 修復有對應的回歸測試
- [ ] QA_SKILL.md 的 API 清單與實際程式碼一致

### Step 5：Commit

```bash
cd ~/WebstormProjects/leo-shop
git add qa/
git commit -m "QA 更新：新增 XXX 測試案例（基於 commit abc123..def456）"
git push
```

---

## 使用方式

```
請讀取 qa/QA_UPDATE_PROMPT.md，然後比對以下 commit 範圍的變更，增量更新 QA 測試文件。

後端：{上次commit}..HEAD
前端：{上次commit}..HEAD

（或簡單說：比對最近 N 天的變更）
```

也可以簡化為：
```
請讀取 qa/QA_UPDATE_PROMPT.md，更新最近一週的變更到 QA 文件。
```

AI 會自動 git log + diff → 分析 → 更新 TEST_CASES.md + QA_SKILL.md。

---

## 記錄上次 QA 更新的 commit

每次更新完，在這裡記錄：

| 日期 | 前端 commit | 後端 commit |
|------|------------|------------|
| 2026-03-11 | `909422c` | `4499583` |
