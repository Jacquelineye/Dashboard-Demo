# 智慧製造機台監控儀表板 (Smart Manufacturing OEE Dashboard)

專為現代工廠打造的即時設備效率（OEE）與異常監控儀表板。具備角色化動態連動（廠長、設備、品保、生管）、智慧雙層警示過濾、自訂門檻與互動式操作指引。

---

## ✨ 核心功能特色 (Key Features)

- **角色驅動動態連動 (Persona-driven Architecture)**：
  - **廠長 / 製造主管**：關注綜合設備效率（OEE），掌握全廠稼動瓶頸。
  - **設備維護工程師**：聚焦時間稼動率（Availability），優先維護異常停機機台。
  - **品保監控主管**：聚焦製程良率（Quality），即時防堵不良品擴散。
  - **生管排程專員**：聚焦工單達成率（Performance），確保當班排程如期交付。
- **智慧警示優先排序 (Alert Priority Sorting)**：
  - 一鍵將低於門檻之異常機台自動置頂，並依指標嚴重度加權排序。
- **雙層副指標提醒 (Cross-metric Secondary Badges)**：
  - 核心指標之外，當次要指標跌破標準時自動標記警告徽章，防止隱形製程瓶頸。
- **初次進入操作指引 (Interactive Onboarding Tour)**：
  - 沉浸式聚光燈導覽，涵蓋警示優先、自訂設定與角色切換三大核心操作。
- **機台深度診斷彈窗 (Machine Detail Diagnostics)**：
  - 包含即時 KPI、小時趨勢走勢圖、稼動時間軸與故障代碼維修歷史。

---

## 🚀 快速開始 (Getting Started)

### 安裝依賴 (Install Dependencies)
```bash
npm install
# 或進入專案資料夾
cd machine-ai && npm install
```

### 本地開發 (Local Development)
```bash
npm run dev
```

### 專案打包 (Production Build)
```bash
npm run build
```

---

## 🛠️ 技術棧 (Tech Stack)

- **框架**：React 19 + Vite
- **樣式**：Tailwind CSS (自研 Design System 元件庫)
- **架構**：Portal 下拉選單、SVG 聚光燈遮罩、動態加權排序演算法
- **部署**：GitHub Actions + GitHub Pages
