import { useState, useMemo, useEffect } from "react";
import "./App.css";
import {
  // 現有元件 (來自 src/components/ui/)
  Button,
  ToggleButton,
  Tab,
  Input,
  Select,
  Switch,
  Card,
  ListItem,
  UserIcon,
  // 新增元件 (原元件庫未包含，已歸類至 data-display/ 與 feedback/)
  MachineOEECard,
  SectionDivider,
  MachineDetailModal,
  AlertSettingsModal,
  OnboardingTour,
  TOUR_STORAGE_KEY,
} from "./components/ui";

// 左側機台狀態定義（全廠 7 條產線加總：346 + 30 + 5 + 1 + 5 + 0 + 1 + 0 = 388 台）
const MACHINE_STATUSES = [
  { id: "all", label: "ALL", count: 388, dotColor: null, dividerAfter: true },
  { id: "running", label: "運轉中", count: 346, dotColor: "#369379" },
  { id: "idle", label: "待機/閒置", count: 30, dotColor: "#EAB308" },
  { id: "error", label: "異常/停機", count: 5, dotColor: "#C74949" },
  { id: "setup", label: "設定/換線中", count: 1, dotColor: "#5D84A2" },
  { id: "engineering", label: "工程處理中", count: 5, dotColor: "#DE8D31" },
  { id: "maintenance", label: "預防性維護", count: 0, dotColor: "#8B5CF6" },
  { id: "off", label: "關機", count: 1, dotColor: "#52525B" },
  { id: "undefined", label: "非正常/未定義狀態", count: 0, dotColor: null },
];

// 頂部 7 條產線設定（每條產線擁有不同數量的各狀態機台，加總完全對應左側清單數字）
const PRODUCTION_LINES = [
  {
    id: "line-a",
    label: "產線 A (SMT)",
    prefix: "SMT-A",
    counts: {
      running: 70, // 對應截圖：產線 A (SMT) 運轉中 70 台
      idle: 8,
      error: 2,
      setup: 1,
      engineering: 2,
      maintenance: 0,
      off: 1,
      undefined: 0,
    },
  },
  {
    id: "line-b",
    label: "產線 B (組裝)",
    prefix: "ASM-B",
    counts: {
      running: 62,
      idle: 6,
      error: 1,
      setup: 0,
      engineering: 1,
      maintenance: 0,
      off: 0,
      undefined: 0,
    },
  },
  {
    id: "line-c",
    label: "產線 C (測試)",
    prefix: "TST-C",
    counts: {
      running: 55,
      idle: 5,
      error: 1,
      setup: 0,
      engineering: 1,
      maintenance: 0,
      off: 0,
      undefined: 0,
    },
  },
  {
    id: "line-d",
    label: "產線 D (包裝)",
    prefix: "PKG-D",
    counts: {
      running: 48,
      idle: 4,
      error: 0,
      setup: 0,
      engineering: 1,
      maintenance: 0,
      off: 0,
      undefined: 0,
    },
  },
  {
    id: "line-e",
    label: "產線 E (檢測)",
    prefix: "INS-E",
    counts: {
      running: 42,
      idle: 3,
      error: 1,
      setup: 0,
      engineering: 0,
      maintenance: 0,
      off: 0,
      undefined: 0,
    },
  },
  {
    id: "line-f",
    label: "產線 F (焊接)",
    prefix: "WLD-F",
    counts: {
      running: 38,
      idle: 2,
      error: 0,
      setup: 0,
      engineering: 0,
      maintenance: 0,
      off: 0,
      undefined: 0,
    },
  },
  {
    id: "line-g",
    label: "產線 G (塗裝)",
    prefix: "CTG-G",
    counts: {
      running: 31,
      idle: 2,
      error: 0,
      setup: 0,
      engineering: 0,
      maintenance: 0,
      off: 0,
      undefined: 0,
    },
  },
];

// 產線運轉中機台與 OEE 基準數據（警示機台 OEE < 80% 控制在 15 台以下）
const BASE_RUNNING_TEMPLATES = [
  // OEE < 80% 警示機台 (最多 9 台，即使在 ALL 狀態加上其他異常機台也保證 < 15 台)
  { suffix: "41", oee: 55 },
  { suffix: "27", oee: 57 },
  { suffix: "70", oee: 58 },
  { suffix: "13", oee: 59 },
  { suffix: "12", oee: 65 },
  { suffix: "14", oee: 71 },
  { suffix: "06", oee: 72 },
  { suffix: "43", oee: 74 },
  { suffix: "10", oee: 78 },

  // OEE >= 80% 正常機台
  { suffix: "57", oee: 80 },
  { suffix: "56", oee: 80 },
  { suffix: "42", oee: 80 },
  { suffix: "28", oee: 80 },
  { suffix: "15", oee: 80 },
  { suffix: "37", oee: 80 },
  { suffix: "63", oee: 80 },
  { suffix: "32", oee: 81 },
  { suffix: "54", oee: 81 },
  { suffix: "58", oee: 81 },
  { suffix: "23", oee: 82 },
  { suffix: "49", oee: 82 },
  { suffix: "18", oee: 83 },
  { suffix: "40", oee: 83 },
  { suffix: "44", oee: 83 },
  { suffix: "66", oee: 83 },
  { suffix: "35", oee: 84 },
  { suffix: "61", oee: 84 },
  { suffix: "26", oee: 85 },
  { suffix: "30", oee: 85 },
  { suffix: "52", oee: 85 },
  { suffix: "21", oee: 86 },
  { suffix: "47", oee: 86 },
  { suffix: "69", oee: 86 },
  { suffix: "05", oee: 87 },
  { suffix: "16", oee: 87 },
  { suffix: "38", oee: 87 },
  { suffix: "64", oee: 87 },
  { suffix: "03", oee: 88 },
  { suffix: "33", oee: 88 },
  { suffix: "55", oee: 88 },
  { suffix: "59", oee: 88 },
  { suffix: "08", oee: 88 },
  { suffix: "24", oee: 88 },
  { suffix: "01", oee: 89 },
  { suffix: "02", oee: 89 },
  { suffix: "04", oee: 89 },
  { suffix: "07", oee: 90 },
  { suffix: "09", oee: 90 },
  { suffix: "11", oee: 90 },
  { suffix: "17", oee: 91 },
  { suffix: "19", oee: 91 },
  { suffix: "20", oee: 91 },
  { suffix: "22", oee: 92 },
  { suffix: "25", oee: 92 },
  { suffix: "29", oee: 92 },
  { suffix: "31", oee: 93 },
  { suffix: "34", oee: 93 },
  { suffix: "36", oee: 93 },
  { suffix: "39", oee: 94 },
  { suffix: "45", oee: 94 },
  { suffix: "46", oee: 94 },
  { suffix: "48", oee: 95 },
  { suffix: "50", oee: 95 },
  { suffix: "51", oee: 95 },
  { suffix: "53", oee: 96 },
  { suffix: "60", oee: 96 },
  { suffix: "62", oee: 96 },
  { suffix: "65", oee: 97 },
  { suffix: "67", oee: 97 },
  { suffix: "68", oee: 98 },
];

// 各產線在「運轉中」狀態下的警示機台數量上限 (全廠合計 < 15 台)
const ALERT_LIMIT_BY_LINE = [5, 2, 1, 1, 1, 0, 0];

/**
 * 簡易字串雜湊，確保同一機台 ID 在全系統各處數值 100% 擬真一致
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * 依據機台 ID 與 OEE，計算該機台在各專業角色（設備稼動率、品保良率、生管達成率）下的專屬指標數值
 * 確保與 MachineDetailModal.jsx 內部呈現之 4 大 KPI 完全 1:1 吻合
 */
function computeMachineMetrics(id, oee) {
  const isTargetA41 = id.endsWith("41") || id === "SMT-A41";
  if (isTargetA41) {
    return {
      oee: 55,
      utilization: 55, // 設備維護：稼動率 55%
      yieldRate: 82,   // 製程品保：良率 82%
      achievement: 52, // 產線組長：達成率 52%
    };
  }

  const hash = hashString(id);
  const isAbnormal = oee < 80;
  const isCritical = oee < 60;

  // 製程品保：良率 (yieldRate)
  const yieldRate = isCritical
    ? 72 + (hash % 12)
    : isAbnormal
    ? 80 + (hash % 8)
    : 95 + (hash % 5);

  // 設備維護：稼動率 (utilization)
  const utilization = Math.min(99, Math.max(40, oee + (hash % 7) - 3));

  // 產線生管：達成率 (achievement)
  const achievement = isCritical
    ? 45 + (hash % 15)
    : isAbnormal
    ? 65 + (hash % 18)
    : 90 + (hash % 12);

  return {
    oee,
    utilization,
    yieldRate,
    achievement,
  };
}

/**
 * 依據產線設定產生該產線所有狀態的機台清單（內含 OEE、稼動率、良率、達成率等動態指標）
 */
function buildLineMachines(line, lineIndex) {
  const machines = [];
  const { prefix, counts } = line;
  const maxRunningAlerts = ALERT_LIMIT_BY_LINE[lineIndex] ?? 1;

  const createMachine = (id, oee, status) => ({
    id,
    status,
    lineId: line.id,
    lineLabel: line.label,
    ...computeMachineMetrics(id, oee),
  });

  // 1. 運轉中 (running)
  for (let i = 0; i < counts.running; i++) {
    const tpl = BASE_RUNNING_TEMPLATES[i % BASE_RUNNING_TEMPLATES.length];
    let adjustedOee = tpl.oee;

    if (i >= maxRunningAlerts && adjustedOee < 80) {
      // 超過該產線警示上限者自動轉為 >= 80% 正常機台
      adjustedOee = 80 + (i % 6);
    } else if (adjustedOee >= 80 && lineIndex > 0) {
      // 正常機台微調時保證不低於 80%，避免新增額外警示機台
      adjustedOee = Math.max(80, Math.min(98, adjustedOee + ((i + lineIndex) % 3)));
    }

    machines.push(createMachine(`${prefix}${tpl.suffix}`, adjustedOee, "running"));
  }

  // 2. 待機/閒置 (idle, >=80%)
  const idleOees = [80, 81, 82, 83, 84, 85, 86, 88];
  for (let i = 0; i < counts.idle; i++) {
    const num = String(71 + i).padStart(2, "0");
    machines.push(createMachine(`${prefix}${num}`, idleOees[i % idleOees.length], "idle"));
  }

  // 3. 異常/停機 (error, OEE < 60%)
  const errorOees = [45, 52, 56];
  for (let i = 0; i < counts.error; i++) {
    const num = String(81 + i).padStart(2, "0");
    machines.push(createMachine(`${prefix}${num}`, errorOees[i % errorOees.length], "error"));
  }

  // 4. 設定/換線中 (setup)
  for (let i = 0; i < counts.setup; i++) {
    const num = String(86 + i).padStart(2, "0");
    machines.push(createMachine(`${prefix}${num}`, 72, "setup"));
  }

  // 5. 工程處理中 (engineering)
  const engOees = [66, 75, 81];
  for (let i = 0; i < counts.engineering; i++) {
    const num = String(90 + i).padStart(2, "0");
    machines.push(createMachine(`${prefix}${num}`, engOees[i % engOees.length], "engineering"));
  }

  // 6. 預防性維護 (maintenance)
  for (let i = 0; i < counts.maintenance; i++) {
    const num = String(95 + i).padStart(2, "0");
    machines.push(createMachine(`${prefix}${num}`, 82, "maintenance"));
  }

  // 7. 關機 (off)
  for (let i = 0; i < counts.off; i++) {
    const num = String(98 + i).padStart(2, "0");
    machines.push(createMachine(`${prefix}${num}`, 50, "off"));
  }

  return machines;
}

/* 立方體產線圖示 */
function CubeIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-16 w-16 shrink-0 fill-none stroke-current"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 1.5 14 4.8v6.4L8 14.5 2 11.2V4.8L8 1.5Z" />
      <path d="M2 4.8 8 8.1l6-3.3M8 8.1v6.4" />
    </svg>
  );
}

/* 搜尋放大鏡圖示 */
function SearchIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-14 w-14 fill-none stroke-current"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="4.5" />
      <path d="m10.5 10.5 3 3" />
    </svg>
  );
}

/* 排序箭頭圖示 */
function SortArrowIcon({ ascending = true }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`h-14 w-14 fill-none stroke-current transition-transform duration-200 ${
        ascending ? "" : "rotate-180"
      }`}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 12.5v-9M4.5 7 8 3.5 11.5 7" />
    </svg>
  );
}

/* 編號排序 # 圖示 */
function HashOrderIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-14 w-14 fill-none stroke-current"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h10M3 10h10M6.5 2.5l-1 11M10.5 2.5l-1 11" />
    </svg>
  );
}

/* 設定齒輪圖示 (Standard Settings Gear Icon) */
function SettingsIcon({ className = "h-14 w-14" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

/* 操作指引問號圖示 (Help Circle Icon) */
function HelpCircleIcon({ className = "h-14 w-14" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

// 4 大製造儀表板檢視角色定義與其對應關注之指標與警示線條門檻
const VIEWER_ROLES = [
  {
    id: "plant_manager",
    roleName: "廠長 / 製造主管",
    userName: "王振輝",
    userEnName: "David Wang",
    title: "製造營運處長",
    avatarText: "王",
    icon: "🏭",
    metricKey: "oee",
    metricLabel: "OEE",
    metricUnit: "%",
    defaultThreshold: 75,
    lineDescription: "廠務重大警戒線 (75%)",
    roleDescription: "宏觀營運危機與瓶頸管理視角，綜合 OEE 跌破 75% 視為全廠重大停滯瓶頸",
    thresholdPresets: [
      { value: 70, label: "70%", desc: "寬鬆容許線" },
      { value: 75, label: "75%", desc: "廠務重大警戒線 (推薦)" },
      { value: 80, label: "80%", desc: "健康運轉基準" },
      { value: 85, label: "85%", desc: "精實高標" },
      { value: 90, label: "90%", desc: "世界級製造線" },
    ],
  },
  {
    id: "equipment_engineer",
    roleName: "設備維護工程師",
    userName: "陳建志",
    userEnName: "Ken Chen",
    title: "設備主任工程師",
    avatarText: "陳",
    icon: "🔧",
    metricKey: "utilization",
    metricLabel: "稼動率",
    metricUnit: "%",
    defaultThreshold: 80,
    lineDescription: "設備稼動率基準線 (80%)",
    roleDescription: "關注機台硬體與時間稼動率，低於 80% 視為停機/維護異常並優先置頂處置",
    thresholdPresets: [
      { value: 70, label: "70%", desc: "低稼動預警" },
      { value: 75, label: "75%", desc: "設備容許底線" },
      { value: 80, label: "80%", desc: "稼動標準線 (推薦)" },
      { value: 85, label: "85%", desc: "高稼動目標" },
      { value: 90, label: "90%", desc: "極致妥善率" },
    ],
  },
  {
    id: "process_engineer",
    roleName: "製程品保工程師",
    userName: "林雅婷",
    userEnName: "Emily Lin",
    title: "資深製程品保工程師",
    avatarText: "林",
    icon: "🔬",
    metricKey: "yieldRate",
    metricLabel: "良率",
    metricUnit: "%",
    defaultThreshold: 85,
    lineDescription: "製程良率管制線 (85%)",
    roleDescription: "關注生產一次通過良率 (FPY)，低於 85% 即需注意錫膏偏位、空焊等不良率漂移",
    thresholdPresets: [
      { value: 80, label: "80%", desc: "嚴重不良底線" },
      { value: 85, label: "85%", desc: "品保管制線 (推薦)" },
      { value: 90, label: "90%", desc: "標準良率線" },
      { value: 95, label: "95%", desc: "優質製程線" },
      { value: 98, label: "98%", desc: "六標準差目標" },
    ],
  },
  {
    id: "line_leader",
    roleName: "產線組長 / 生管",
    userName: "張家豪",
    userEnName: "Jason Chang",
    title: "SMT 產線組長",
    avatarText: "張",
    icon: "📦",
    metricKey: "achievement",
    metricLabel: "達成率",
    metricUnit: "%",
    defaultThreshold: 80,
    lineDescription: "排程工單達成線 (80%)",
    roleDescription: "關注當班排程進度與產能達成率，低於 80% 需調度調機或換線支援",
    thresholdPresets: [
      { value: 70, label: "70%", desc: "嚴重進度落後" },
      { value: 75, label: "75%", desc: "排程警戒線" },
      { value: 80, label: "80%", desc: "工單達成線 (推薦)" },
      { value: 85, label: "85%", desc: "進度超前線" },
      { value: 90, label: "90%", desc: "滿載達標" },
    ],
  },
// 4 大製造儀表板檢視角色定義與其對應關注之指標與警示線條門檻
];

/**
 * 依據當前檢視角色與機台各項數據，計算副指標異常提醒標籤 (方案 A: Cross-metric Alert Badge)
 * 當其他核心指標跌破標準門檻時，挑選偏離最嚴重之副指標進行右上角徽章標記，避免假高稼動或隱形瓶頸
 */
function getSecondaryAlert(machine, currentRole, monitoredMetrics = {}) {
  if (!machine) return null;

  // 各指標標準管制門檻
  const METRIC_CONFIGS = {
    utilization: { label: "稼動", fullLabel: "稼動率", threshold: 80, unit: "%" },
    yieldRate: { label: "良率", fullLabel: "良率", threshold: 85, unit: "%" },
    achievement: { label: "達成", fullLabel: "達成率", threshold: 80, unit: "%" },
    oee: { label: "OEE", fullLabel: "綜合OEE", threshold: 75, unit: "%" },
  };

  const primaryKey = currentRole?.metricKey || "oee";
  const anomalies = [];

  // 檢驗除當前主角色的主指標外，是否有其他關鍵副指標異常（且在設定中已被啟用監控）
  Object.keys(METRIC_CONFIGS).forEach((key) => {
    if (key === primaryKey) return;
    // 若該指標未在設定中啟用，則略過不提醒
    if (monitoredMetrics && monitoredMetrics[key] === false) return;
    // 若主指標非 OEE，副指標主要檢驗三大實體支柱 (稼動率、良率、達成率)
    if (primaryKey !== "oee" && key === "oee") return;

    const val = machine[key];
    const cfg = METRIC_CONFIGS[key];
    if (typeof val === "number" && val < cfg.threshold) {
      const deficit = cfg.threshold - val;
      const level = val < cfg.threshold - 10 ? "error" : "warning";
      anomalies.push({
        key,
        label: cfg.label,
        fullLabel: cfg.fullLabel,
        value: val,
        threshold: cfg.threshold,
        unit: cfg.unit,
        deficit,
        level,
      });
    }
  });

  if (anomalies.length === 0) return null;

  // 依偏離幅度由大到小排序，挑選偏離最嚴重（最大瓶頸）之副指標展示
  anomalies.sort((a, b) => b.deficit - a.deficit);
  const primaryAnomaly = anomalies[0];

  // 組合多項異常說明文字（用於 Tooltip）
  const tooltipText = anomalies
    .map((a) => `${a.fullLabel} ${a.value}%（低於標準 ${a.threshold}%）`)
    .join(" · ");

  return {
    ...primaryAnomaly,
    count: anomalies.length,
    tooltip: `副指標異常提醒：${tooltipText}`,
  };
}

export default function App() {
  // 左側狀態篩選與頂部產線切換
  const [selectedStatus, setSelectedStatus] = useState("running");
  const [selectedLineId, setSelectedLineId] = useState("line-a");
  const [searchQuery, setSearchQuery] = useState("");

  // 檢視角色切換與警示線條門檻狀態 (可依據角色自動連動推薦門檻，亦可自由調整)
  const [selectedRoleId, setSelectedRoleId] = useState("plant_manager");
  const currentRole =
    VIEWER_ROLES.find((r) => r.id === selectedRoleId) || VIEWER_ROLES[0];

  // Dashboard 警示線條門檻 (預設依當前角色指標門檻為 75%/80%/85%，可透過入口設定、滑桿或快捷按鈕自由設定)
  const [alertThreshold, setAlertThreshold] = useState(currentRole.defaultThreshold);
  const [isAlertSettingsOpen, setIsAlertSettingsOpen] = useState(false);

  // 初次進入操作指引導覽狀態 (檢查 localStorage)
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem(TOUR_STORAGE_KEY);
      if (!hasSeen) {
        // 初次進入微延遲 400ms，等待各元件掛載完成後呈現指引
        const timer = setTimeout(() => setIsTourOpen(true), 400);
        return () => clearTimeout(timer);
      }
    } catch (err) {
      // ignore
    }
  }, []);

  // 角色切換 Select 元件選項清單
  const roleSelectOptions = useMemo(
    () =>
      VIEWER_ROLES.map((role) => ({
        value: role.id,
        label: role.roleName,
        description: `指標：${role.metricLabel} (${role.defaultThreshold}%)`,
        icon: role.icon,
        badge: role.metricLabel,
      })),
    []
  );

  // 警示優先開關：true = 將當前角色指標 < alertThreshold 異常往上推置頂；false = 依機台編號 (01 -> 70) 順序排列
  const [alertPriorityOn, setAlertPriorityOn] = useState(true);

  // 儀表板監控指標項目設定 (預設 4 大製造核心指標全開；當開啟 >= 2 項時，自動啟用副指標提醒標籤)
  const [monitoredMetrics, setMonitoredMetrics] = useState({
    oee: true,
    utilization: true,
    yieldRate: true,
    achievement: true,
  });

  const enabledMetricsCount = useMemo(
    () => Object.values(monitoredMetrics).filter(Boolean).length,
    [monitoredMetrics]
  );
  // 使用者需求：副指標提醒固定開啟不讓手動選擇，只要設定內開啟兩個以上的顯示，就會自動啟用
  const isSecondaryAlertActive = enabledMetricsCount >= 2;

  // 切換角色統一邏輯：切換身分、套用預設門檻，並確保該角色的主指標必定處於開啟狀態
  const handleSelectRole = (roleId) => {
    setSelectedRoleId(roleId);
    const r = VIEWER_ROLES.find((x) => x.id === roleId);
    if (r) {
      setAlertThreshold(r.defaultThreshold);
      setMonitoredMetrics((prev) => ({
        ...prev,
        [r.metricKey]: true,
      }));
    }
  };

  // 切換欲監控之指標項目（當前角色之主指標為必選鎖定）
  const handleToggleMonitoredMetric = (key) => {
    if (key === currentRole.metricKey) return;
    setMonitoredMetrics((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // 當前點擊打開詳細資訊彈窗之機台（彈窗將依據不同機台動態帶入各自專屬數據）
  const [selectedMachineForModal, setSelectedMachineForModal] = useState(null);

  // 卡片與進度條樣式設定
  const [cardStyle, setCardStyle] = useState("default");
  const [barStyle, setBarStyle] = useState("gradient");
  const [barSize, setBarSize] = useState("md");
  const [dividerVariant, setDividerVariant] = useState("dashed");

  const isAllLines = selectedLineId === "all";
  const currentLineIndex = PRODUCTION_LINES.findIndex(
    (l) => l.id === selectedLineId
  );
  const currentLine = isAllLines
    ? { id: "all", label: "ALL (全部產線)" }
    : PRODUCTION_LINES[currentLineIndex >= 0 ? currentLineIndex : 0];

  // 取得當前產線（或 ALL 全部產線）的所有機台，並依據左側選取的狀態、關鍵字與「角色專屬指標警示優先 / 機台編號」進行排序
  const filteredMachines = useMemo(() => {
    const sourceMachines = isAllLines
      ? PRODUCTION_LINES.flatMap((line, idx) => buildLineMachines(line, idx))
      : buildLineMachines(
          currentLine,
          currentLineIndex >= 0 ? currentLineIndex : 0
        );

    const byStatus =
      selectedStatus === "all"
        ? sourceMachines
        : sourceMachines.filter((m) => m.status === selectedStatus);

    const bySearch = searchQuery.trim()
      ? byStatus.filter((m) =>
          m.id.toLowerCase().includes(searchQuery.trim().toLowerCase())
        )
      : bySearch_fallback(byStatus);

    function bySearch_fallback(list) {
      return list;
    }

    return [...bySearch].sort((a, b) => {
      const aVal = a[currentRole.metricKey] ?? a.oee;
      const bVal = b[currentRole.metricKey] ?? b.oee;

      if (alertPriorityOn) {
        const aIsAlert = aVal < alertThreshold;
        const bIsAlert = bVal < alertThreshold;
        // 1. 警示機台 (角色專屬指標 < alertThreshold) 一律往上排
        if (aIsAlert && !bIsAlert) return -1;
        if (!aIsAlert && bIsAlert) return 1;
        // 2. 同為警示機台時，依指標數值由低至高排列（最嚴重異常優先）
        if (aIsAlert && bIsAlert && aVal !== bVal) {
          return aVal - bVal;
        }
      }
      // 3. 其餘正常機台 (指標 >= alertThreshold) 或未開啟警示優先時，一律依產線與機台編號順序排列
      return a.id.localeCompare(b.id, undefined, { numeric: true });
    });
  }, [isAllLines, currentLine, currentLineIndex, selectedStatus, searchQuery, alertPriorityOn, alertThreshold, currentRole]);

  // 當選擇 ALL 產線且未開啟警示優先時，依產線分組並區分各產線標題
  const groupedByLine = useMemo(() => {
    if (!isAllLines) return [];
    return PRODUCTION_LINES.map((line) => ({
      line,
      machines: filteredMachines.filter((m) => m.lineId === line.id),
    })).filter((group) => group.machines.length > 0);
  }, [isAllLines, filteredMachines]);

  // 依據目前檢視角色之指標門檻 (alertThreshold)，區分警示區機台與正常區機台
  const groupBelowThreshold = filteredMachines.filter(
    (m) => (m[currentRole.metricKey] ?? m.oee) < alertThreshold
  );
  const groupAboveThreshold = filteredMachines.filter(
    (m) => (m[currentRole.metricKey] ?? m.oee) >= alertThreshold
  );
  const currentStatusObj =
    MACHINE_STATUSES.find((s) => s.id === selectedStatus) || MACHINE_STATUSES[0];

  // 渲染可點擊開啟詳細資訊彈窗之機台卡片 (依據當前檢視身分，動態帶入該角色之指標數值、標籤、進度條與自動啟用的副指標提醒)
  const renderOEECard = (machine) => {
    const metricValue = machine[currentRole.metricKey] ?? machine.oee;
    const secondaryAlert = isSecondaryAlertActive
      ? getSecondaryAlert(machine, currentRole, monitoredMetrics)
      : null;

    return (
      <MachineOEECard
        key={machine.id}
        machineId={machine.id}
        oee={machine.oee}
        value={metricValue}
        label={currentRole.metricLabel}
        threshold={alertThreshold}
        unit={currentRole.metricUnit || "%"}
        secondaryAlert={secondaryAlert}
        cardStyle={cardStyle}
        barStyle={barStyle}
        barSize={barSize}
        selected={selectedMachineForModal?.id === machine.id}
        onClick={() => setSelectedMachineForModal(machine)}
      />
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg p-16 gap-16 font-primary text-fontcolor select-none">
      {/* 左側欄位 (寬度 240px)：包含「機台狀態 Card」與其外部下方的獨立「角色切換 Select」 */}
      <div className="flex h-full w-[240px] shrink-0 flex-col gap-10">
        {/* 左側面板：機台狀態 (使用 Card + Button + ListItem) */}
        <Card className="flex flex-1 min-h-0 flex-col justify-between rounded-3xl border border-stroke/80 bg-white px-16 py-20 shadow-drop-m">
          <div className="-mx-4 flex flex-col gap-16 overflow-y-auto px-4 custom-scrollbar">
            {/* 左側標頭 */}
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-6 text-primary">
                <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center">
                  <UserIcon />
                </span>
                <span className="text-H5 font-semibold tracking-tight text-primary">
                  機台狀態
                </span>
              </div>

              {/* 操作指引按鈕 (?) 依據原本樣式 */}
              <button
                type="button"
                onClick={() => setIsTourOpen(true)}
                title="操作指引"
                className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full border border-stroke bg-white text-description hover:border-primary/70 hover:text-primary hover:shadow-drop-s transition-all cursor-pointer"
                aria-label="操作指引"
              >
                <HelpCircleIcon className="h-16 w-16" />
              </button>
            </div>

            {/* 機台狀態清單 (使用現有 ListItem 元件，文字與右側數字 15px/20px 水平對齊) */}
            <ul className="m-0 flex flex-col gap-4 p-0 list-none">
              {MACHINE_STATUSES.map((status) => (
                <div key={status.id}>
                  <ListItem
                    selected={selectedStatus === status.id}
                    onSelectedChange={() => setSelectedStatus(status.id)}
                    showLeftIcon={Boolean(status.dotColor)}
                    leftIcon={
                      status.dotColor ? (
                        <span
                          style={{ backgroundColor: status.dotColor }}
                          className="inline-block h-8 w-8 rounded-full"
                        />
                      ) : null
                    }
                    showSuffix={true}
                    suffix={status.count}
                    className="!min-h-[38px] !px-12 !py-6"
                  >
                    {status.label}
                  </ListItem>

                  {status.dividerAfter && (
                    <div className="my-6 h-[1px] w-full bg-stroke/60" />
                  )}
                </div>
              ))}
            </ul>
          </div>

          {/* 底部：使用者資訊 + 警示設定入口 */}
          <div className="shrink-0 border-t border-stroke/70 pt-12 mt-8">
            <div className="flex items-center justify-between gap-8 px-2">
              <div className="flex items-center gap-8 min-w-0">
                <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-caption-1 border border-primary/25">
                  {currentRole.avatarText}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-body-4 font-semibold text-fontcolor truncate leading-tight">
                    {currentRole.userName}
                  </div>
                  <div className="text-caption-2 text-description truncate leading-tight mt-2">
                    {currentRole.title}
                  </div>
                </div>
              </div>

              {/* 警示設定入口按鈕 */}
              <button
                id="tour-settings-btn"
                type="button"
                onClick={() => setIsAlertSettingsOpen(true)}
                title={`自訂 Dashboard 警示線條門檻 (目前: ${currentRole.metricLabel} ${alertThreshold}%)`}
                className="flex h-28 w-28 shrink-0 items-center justify-center rounded-lg border border-stroke/80 bg-white text-description hover:border-primary/60 hover:text-primary transition-colors cursor-pointer"
                aria-label="警示線條設定"
              >
                <SettingsIcon className="h-14 w-14" />
              </button>
            </div>
          </div>
        </Card>

        {/* 獨立位於「機台狀態」外下方的角色切換 Select (加大高度為 44px 舒適點擊尺寸) */}
        <div id="tour-role-select" className="shrink-0">
          <Select
            size="lg"
            value={selectedRoleId}
            onChange={(val) => handleSelectRole(val)}
            options={roleSelectOptions}
            menuHeader="切換檢視身分"
            className="bg-white border-stroke/80 shadow-drop-s hover:border-primary/60 hover:shadow-drop-m hover:bg-primary/[0.02] cursor-pointer"
            dropdownClassName="!rounded-[22px]"
          />
        </div>
      </div>

      {/* 右側主區塊 */}
      <div className="flex min-w-0 flex-1 flex-col gap-16 h-full">
        {/* 頂部產線切換列：左側獨立 ALL 全圓角框 + 右側產線 Tabs 全圓角框 */}
        <div className="flex shrink-0 items-center gap-10">
          <Card className="shrink-0 rounded-full border border-stroke/80 bg-white p-6 shadow-drop-m">
            <Tab
              selected={selectedLineId === "all"}
              showLeftIcon={false}
              showClose={false}
              onSelect={() => setSelectedLineId("all")}
              className="shrink-0 [&>button]:!px-16"
            >
              ALL
            </Tab>
          </Card>

          <Card className="min-w-0 flex-1 rounded-full border border-stroke/80 bg-white p-6 shadow-drop-m">
            <div className="flex flex-row items-center gap-4 overflow-x-auto custom-scrollbar">
              {PRODUCTION_LINES.map((line) => (
                <Tab
                  key={line.id}
                  selected={selectedLineId === line.id}
                  showLeftIcon={false}
                  showClose={false}
                  onSelect={() => setSelectedLineId(line.id)}
                  className="shrink-0"
                >
                  {line.label}
                </Tab>
              ))}
            </div>
          </Card>
        </div>

        {/* 機台 OEE 卡片主容器 */}
        <Card className="flex min-h-0 flex-1 flex-col rounded-3xl border border-stroke/80 bg-white p-20 shadow-drop-m overflow-hidden">
          {/* 內容區頂部工具列 */}
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-12 pb-8">
            <div className="flex items-center gap-10">
              <span className="inline-flex items-center justify-center text-primary">
                <CubeIcon />
              </span>
              <span className="text-H5 font-semibold text-primary">
                {currentLine.label}
              </span>
              <span className="text-H5 font-normal text-description">
                {filteredMachines.length}台
              </span>
            </div>

            {/* 搜尋框與警示優先 Switch 控制項 */}
            <div className="flex flex-wrap items-center gap-10">

              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="機台編號"
                prefixIcon={<SearchIcon />}
                containerClassName="w-[180px]"
              />

              <div
                id="tour-alert-priority"
                onClick={() => setAlertPriorityOn((prev) => !prev)}
                className={`inline-flex h-[36px] items-center gap-8 rounded-full border px-12 transition-colors cursor-pointer ${
                  alertPriorityOn
                    ? "border-primary/40 bg-primary/5 text-primary"
                    : "border-stroke bg-white text-fontcolor hover:border-primary/50"
                }`}
              >
                <span className="text-label-3 font-medium">警示優先</span>
                <div onClick={(e) => e.stopPropagation()}>
                  <Switch
                    checked={alertPriorityOn}
                    onChange={setAlertPriorityOn}
                    containerClassName="!min-h-0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 機台卡片網格列表 (可垂直捲動，左右與底部預留 12px 內距避免 shadow-drop-m 陰影被裁切) */}
          <div className="-mx-12 flex-1 overflow-y-auto px-12 pt-4 pb-12 custom-scrollbar space-y-16">
            {filteredMachines.length === 0 ? (
              <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-12 rounded-2xl border border-dashed border-stroke/70 bg-bg/20 text-description">
                <div className="text-center">
                  <p className="text-body-3 font-medium text-fontcolor/80">
                    {currentLine.label} 目前無「{currentStatusObj.label}」狀態之機台（0 台）
                  </p>
                  <p className="mt-4 text-caption-1 text-description">
                    可切換至「ALL」產線分頁，直接檢視全廠所有「{currentStatusObj.label}」機台
                  </p>
                </div>
                {!isAllLines && currentStatusObj.count > 0 && (
                  <Button
                    variant="outline"
                    intent="primary"
                    showLeftIcon={false}
                    showRightIcon={false}
                    onClick={() => setSelectedLineId("all")}
                  >
                    切換至 ALL 產線查看（共 {currentStatusObj.count} 台）
                  </Button>
                )}
              </div>
            ) : alertPriorityOn ? (
              <>
                {/* 上半區：所有落於警示門檻以下之機台 (角色指標 < alertThreshold) 置頂 */}
                {groupBelowThreshold.length > 0 && (
                  <div className="grid grid-cols-2 gap-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {groupBelowThreshold.map(renderOEECard)}
                  </div>
                )}

                {/* 分區警示線條：依角色專屬指標動態標示門檻，點擊線條可直接開啟門檻設定彈窗 */}
                {groupBelowThreshold.length > 0 && groupAboveThreshold.length > 0 && (
                  <div
                    onClick={() => setIsAlertSettingsOpen(true)}
                    className="cursor-pointer group select-none py-2 transition-transform hover:scale-[1.002]"
                    title={`點擊調整警示線條門檻 (目前: ${currentRole.metricLabel} ${alertThreshold}% · ${currentRole.roleName}視角)`}
                  >
                    <SectionDivider variant={dividerVariant}>
                      <span className="inline-flex items-center gap-6 group-hover:text-primary transition-colors">
                        <span className="font-medium">以下 {currentRole.metricLabel} 高於 {alertThreshold}%</span>
                        <span className="text-[11px] font-normal text-description group-hover:text-primary/80">
                          ({currentRole.roleName}標準 · 點擊設定 ⚙)
                        </span>
                      </span>
                    </SectionDivider>
                  </div>
                )}

                {/* 下半區：其餘正常機台 (角色指標 >= alertThreshold) 依產線與機台編號順序排列 */}
                {groupAboveThreshold.length > 0 && (
                  <div className="grid grid-cols-2 gap-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {groupAboveThreshold.map(renderOEECard)}
                  </div>
                )}
              </>
            ) : isAllLines ? (
              /* ALL 模式且警示優先關閉：依產線區分並標示各產線標題 */
              <div className="space-y-24">
                {groupedByLine.map((group, idx) => (
                  <section
                    key={group.line.id}
                    className={
                      idx > 0
                        ? "border-t border-stroke/60 pt-20 space-y-12"
                        : "space-y-12"
                    }
                  >
                    <div className="flex items-center gap-8">
                      <span className="inline-flex items-center justify-center text-primary">
                        <CubeIcon />
                      </span>
                      <span className="text-H5 font-semibold text-primary">
                        {group.line.label}
                      </span>
                      <span className="text-H5 font-normal text-description">
                        {group.machines.length}台
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                      {group.machines.map(renderOEECard)}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              /* 單一產線模式且未開啟警示優先：全部機台直接依編號順序單一網格排列 */
              <div className="grid grid-cols-2 gap-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {filteredMachines.map(renderOEECard)}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 1. 機台詳細資訊彈窗 (點擊任一機台卡片開啟，動態載入每台專屬數據) */}
      <MachineDetailModal
        machine={selectedMachineForModal}
        isOpen={Boolean(selectedMachineForModal)}
        onClose={() => setSelectedMachineForModal(null)}
      />

      {/* 2. Dashboard 警示線條與指標項目設定彈窗 */}
      <AlertSettingsModal
        isOpen={isAlertSettingsOpen}
        onClose={() => setIsAlertSettingsOpen(false)}
        currentRole={currentRole}
        threshold={alertThreshold}
        onThresholdChange={setAlertThreshold}
        monitoredMetrics={monitoredMetrics}
        onToggleMonitoredMetric={handleToggleMonitoredMetric}
      />

      {/* 3. 初次進入操作指引導覽 (Onboarding Tour) */}
      <OnboardingTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />
    </div>
  );
}
