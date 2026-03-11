# QA 測試目錄

## 結構
```
qa/
├── README.md              # 本文件
├── QA_SKILL.md           # 測試指南（測試 AI 的操作手冊）
├── TEST_CASES.md          # 測試案例總表（持續更新）
├── reports/
│   └── YYYY-MM-DD.md      # 每次測試的完整報告
└── bugs/
    └── BUG-XXX.md         # 已知 Bug 追蹤
```

## 工作流程

### 執行測試
1. AI 讀取 `QA_SKILL.md` 了解專案和環境
2. AI 讀取 `TEST_CASES.md` 取得所有測試案例
3. AI 逐一執行測試，記錄結果
4. AI 產出報告到 `reports/YYYY-MM-DD.md`
5. 發現 Bug 則建立 `bugs/BUG-XXX.md`

### 新增測試案例
當專案有新功能時：
1. 在 `TEST_CASES.md` 新增測試案例
2. 更新 `QA_SKILL.md` 的 API 清單和頁面結構（如有變更）

### 回歸測試
每次部署前，AI 執行全部 P0 + P1 測試案例，產出新報告。
