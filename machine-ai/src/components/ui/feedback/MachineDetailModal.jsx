import { useEffect, useMemo } from "react";
import Card from "../data-display/card";
import { DataTable } from "../data-display/dataTable";
import { SectionDivider } from "../data-display/divider";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * 簡易偽隨機雜湊函式，確保同一機台每次點開皆呈現一致且獨特的數據
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
 * 依據機台 ID、OEE 與狀態，生成高度擬真且每台不同的機台詳細資料
 */
export function getMachineDetailData(machine) {
  if (!machine) return null;

  const id = machine.id || "SMT-A41";
  const oee = typeof machine.oee === "number" ? machine.oee : 55;
  const status = machine.status || "running";
  const hash = hashString(id);

  // 特殊處理：若是 SMT-A41 或尾號為 41，精確呈現使用者設計稿中之 1:1 數據
  const isTargetA41 = id.endsWith("41") || id === "SMT-A41";

  if (isTargetA41) {
    return {
      id: id.includes("-") ? id : `SMT-${id}`,
      yieldRate: 82,
      yieldDelta: -14.8,
      yieldTarget: 98,
      utilization: 55,
      utilDelta: -32.3,
      utilTarget: 90,
      hpu: 1.50,
      hpuDelta: -0.32,
      hpuTarget: 2.0,
      achievement: 52,
      achievementDelta: -40.5,
      achievementTarget: 95,
      machineInfo: {
        machineId: id,
        port: "56/47/64",
        lot: "4377926.01",
        qty: "12515",
        cust: "56",
        pkg: "(56)microSD",
        step: "MT00",
        stepStatus: "1ST",
        statusText: "運轉中",
        statusCode: "running",
        op: "M1195",
        mesCheckIn: "2026-08-25 14:54:50",
        testStart: "2026-08-25 15:17:51",
        lastLog: "2026-08-26 01:18:39",
        duration: "0天 3:33:27",
      },
      temperature: {
        current: 262,
        isOver: true,
        safeRange: "200-220°C",
        history: [
          204, 206, 208, 205, 207, 210, 209, 211, 208, 212,
          215, 218, 222, 226, 231, 235, 238, 242, 245, 248,
          251, 253, 255, 257, 258, 259, 260, 261, 261, 262,
        ],
      },
      alerts: [
        {
          id: "alert-1",
          time: "14:31:05",
          level: "warning",
          levelText: "警告",
          type: "爐溫區段3超標 (262°C)",
          status: "processing",
          statusText: "處理中",
        },
        {
          id: "alert-2",
          time: "14:28:42",
          level: "warning",
          levelText: "警告",
          type: "焊接不良率上升 (3.2%)",
          status: "processing",
          statusText: "處理中",
        },
        {
          id: "alert-3",
          time: "14:24:10",
          level: "danger",
          levelText: "緊急",
          type: "爐溫區段3超標 (258°C)",
          status: "pending",
          statusText: "未處理",
        },
        {
          id: "alert-4",
          time: "14:19:03",
          level: "warning",
          levelText: "警告",
          type: "爐溫區段3超標 (255°C)",
          status: "resolved",
          statusText: "已處理",
        },
        {
          id: "alert-5",
          time: "14:12:55",
          level: "warning",
          levelText: "警告",
          type: "氮氣流量微偏",
          status: "resolved",
          statusText: "已處理",
        },
      ],
      unhandledAlertCount: 3,
    };
  }

  // 其他機台：依機台 Hash 與 OEE 生成擬真數值
  const isAbnormal = oee < 80;
  const isCritical = oee < 60;

  // 良率
  const yieldRate = isCritical
    ? 72 + (hash % 12)
    : isAbnormal
    ? 80 + (hash % 8)
    : 95 + (hash % 5);
  const yieldDelta = isAbnormal
    ? -((hash % 180) / 10 + 2.5).toFixed(1)
    : +((hash % 40) / 10 + 0.3).toFixed(1);

  // 稼動率 (與 OEE 緊密相關)
  const utilization = Math.min(99, Math.max(40, oee + (hash % 7) - 3));
  const utilDelta = utilization < 85
    ? -((hash % 250) / 10 + 5.0).toFixed(1)
    : +((hash % 50) / 10 + 0.8).toFixed(1);

  // HPU (理想 <= 2.0，越高越慢)
  const hpu = isCritical
    ? (2.1 + (hash % 50) / 100).toFixed(2)
    : isAbnormal
    ? (1.75 + (hash % 30) / 100).toFixed(2)
    : (1.2 + (hash % 40) / 100).toFixed(2);
  const hpuDelta = isAbnormal ? `+0.${(hash % 40) + 10}` : `-0.${(hash % 35) + 12}`;

  // 達成率
  const achievement = isCritical
    ? 45 + (hash % 15)
    : isAbnormal
    ? 65 + (hash % 18)
    : 90 + (hash % 12);
  const achievementDelta = achievement < 90
    ? -((hash % 280) / 10 + 3.2).toFixed(1)
    : +((hash % 60) / 10 + 0.5).toFixed(1);

  // 機台狀態標籤
  const statusLabels = {
    running: { text: "運轉中", color: "bg-success" },
    idle: { text: "待機中", color: "bg-warning" },
    maintenance: { text: "保養中", color: "bg-primary" },
    down: { text: "停機", color: "bg-error" },
    engineering: { text: "工程處理中", color: "bg-[#8B5CF6]" },
  };
  const statusInfo = statusLabels[status] || statusLabels.running;

  // 機台資訊清單
  const packages = ["(56)microSD", "(64)eMMC", "(128)UFS", "(32)BGA-Chip", "(16)DDR5"];
  const custIds = ["56", "38", "92", "45", "102"];
  const opIds = [`M${1000 + (hash % 900)}`, `M${2000 + (hash % 800)}`, `M${3100 + (hash % 500)}`];

  // 溫度監控數據 (30 根歷史條)
  const isTempOver = isCritical || (isAbnormal && hash % 2 === 0);
  const baseTemp = isTempOver ? 245 + (hash % 22) : 205 + (hash % 12);
  const tempHistory = Array.from({ length: 30 }, (_, idx) => {
    if (isTempOver) {
      if (idx < 12) return 204 + ((hash + idx) % 7);
      if (idx < 20) return 215 + ((hash + idx) % 15);
      return Math.min(270, 235 + Math.round((idx - 18) * ((baseTemp - 235) / 11)));
    }
    return 202 + ((hash * 3 + idx * 7) % 16);
  });

  // 警報列表
  const alertTypes = [
    { title: `爐溫區段3超標 (${baseTemp}°C)`, level: "warning", levelText: "警告" },
    { title: "焊接不良率上升 (2.8%)", level: "warning", levelText: "警告" },
    { title: "供料器吸嘴真空度微偏", level: "warning", levelText: "警告" },
    { title: "進料輸送帶轉速偏移", level: "danger", levelText: "緊急" },
    { title: "氮氣流量微偏", level: "warning", levelText: "警告" },
    { title: "AOI 檢測零星誤判", level: "warning", levelText: "警告" },
  ];

  const generatedAlerts = [];
  if (isAbnormal) {
    const count = 3 + (hash % 3);
    for (let i = 0; i < count; i++) {
      const at = alertTypes[(hash + i) % alertTypes.length];
      const isLatest = i === 0;
      const isSecond = i === 1;
      let alertStatus = "resolved";
      let alertStatusText = "已處理";

      if (isLatest) {
        alertStatus = hash % 2 === 0 ? "processing" : "pending";
        alertStatusText = alertStatus === "processing" ? "處理中" : "未處理";
      } else if (isSecond) {
        alertStatus = "processing";
        alertStatusText = "處理中";
      }

      const m = 30 - i * 4;
      const s = 10 + (i * 17) % 45;
      const timeStr = `14:${String(Math.max(5, m)).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

      generatedAlerts.push({
        id: `alert-${i + 1}`,
        time: timeStr,
        level: at.level,
        levelText: at.levelText,
        type: at.title,
        status: alertStatus,
        statusText: alertStatusText,
      });
    }
  } else {
    // 正常機台：僅少數已處理紀錄
    generatedAlerts.push(
      {
        id: "alert-1",
        time: "13:45:12",
        level: "warning",
        levelText: "警告",
        type: "常規校準完成",
        status: "resolved",
        statusText: "已處理",
      },
      {
        id: "alert-2",
        time: "11:20:05",
        level: "warning",
        levelText: "警告",
        type: "預防性清潔保養",
        status: "resolved",
        statusText: "已處理",
      }
    );
  }

  const unhandledAlertCount = generatedAlerts.filter((a) => a.status !== "resolved").length;

  return {
    id,
    yieldRate,
    yieldDelta: Number(yieldDelta),
    yieldTarget: 98,
    utilization,
    utilDelta: Number(utilDelta),
    utilTarget: 90,
    hpu: Number(hpu),
    hpuDelta,
    hpuTarget: 2.0,
    achievement,
    achievementDelta: Number(achievementDelta),
    achievementTarget: 95,
    machineInfo: {
      machineId: id,
      port: `${40 + (hash % 30)}/${30 + (hash % 20)}/${50 + (hash % 25)}`,
      lot: `${4300000 + (hash % 90000)}.0${(hash % 9) + 1}`,
      qty: String(8000 + (hash % 14000)),
      cust: custIds[hash % custIds.length],
      pkg: packages[hash % packages.length],
      step: `MT0${hash % 4}`,
      stepStatus: `${(hash % 3) + 1}ST`,
      statusText: statusInfo.text,
      statusClass: statusInfo.color,
      statusCode: status,
      op: opIds[hash % opIds.length],
      mesCheckIn: `2026-08-${24 + (hash % 3)} 14:54:50`,
      testStart: `2026-08-${24 + (hash % 3)} 15:17:51`,
      lastLog: `2026-08-${25 + (hash % 3)} 01:18:39`,
      duration: `${hash % 3}天 ${(hash % 12) + 1}:${(hash % 50) + 10}:${(hash % 50) + 10}`,
    },
    temperature: {
      current: baseTemp,
      isOver: isTempOver,
      safeRange: "200-220°C",
      history: tempHistory,
    },
    alerts: generatedAlerts,
    unhandledAlertCount,
  };
}

/**
 * MachineDetailModal 機台詳細資訊彈窗
 * 使用專案 UI 元件庫 (Card, DataTable, SectionDivider 等)
 */
export function MachineDetailModal({ machine, isOpen, onClose }) {
  const data = useMemo(() => {
    if (!machine) return null;
    return getMachineDetailData(machine);
  }, [machine]);

  // 按下 ESC 鍵自動關閉彈窗
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // 定義 DataTable 警報欄位規範 (對齊設計稿欄位)
  const alertColumns = useMemo(
    () => [
      {
        key: "time",
        title: "監測時間",
        width: "90px",
        headerClassName: "!text-caption-1 !text-description !font-normal",
        render: (value, row) => (
          <span
            className={cx(
              "tabular-nums font-medium text-caption-1",
              row.level === "danger" ? "text-error" : "text-fontcolor"
            )}
          >
            {value}
          </span>
        ),
      },
      {
        key: "level",
        title: "等級",
        width: "72px",
        headerClassName: "!text-caption-1 !text-description !font-normal",
        render: (value, row) => (
          <span
            className={cx(
              "inline-flex items-center rounded-full px-8 py-1.5 text-caption-2 font-medium text-white",
              row.level === "danger" ? "bg-error" : "bg-warning"
            )}
          >
            {row.levelText}
          </span>
        ),
      },
      {
        key: "type",
        title: "警報類型",
        headerClassName: "!text-caption-1 !text-description !font-normal",
        render: (value) => (
          <span className="font-medium text-fontcolor text-caption-1">
            {value}
          </span>
        ),
      },
      {
        key: "status",
        title: "處理狀態",
        align: "right",
        width: "105px",
        headerClassName: "!text-caption-1 !text-description !font-normal !text-right",
        render: (value, row) => (
          <div className="flex justify-end w-full">
            <span
              className={cx(
                "inline-flex items-center gap-4 rounded-full px-8 py-1.5 text-caption-2 font-medium text-white",
                row.status === "resolved"
                  ? "bg-success"
                  : row.status === "processing"
                  ? "bg-[#475569]"
                  : "bg-error"
              )}
            >
              {row.status === "resolved" && (
                <svg
                  viewBox="0 0 12 12"
                  className="h-8 w-8 fill-none stroke-current stroke-2"
                >
                  <polyline points="2.5 6 4.5 8.5 9.5 3.5" />
                </svg>
              )}
              {row.status === "processing" && (
                <svg
                  viewBox="0 0 12 12"
                  className="h-8 w-8 fill-none stroke-current stroke-2 animate-spin"
                >
                  <path d="M10 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0" />
                </svg>
              )}
              {row.status === "pending" && (
                <svg
                  viewBox="0 0 12 12"
                  className="h-8 w-8 fill-none stroke-current stroke-2"
                >
                  <circle cx="6" cy="6" r="4.5" />
                  <line x1="3" y1="3" x2="9" y2="9" />
                </svg>
              )}
              {row.statusText}
            </span>
          </div>
        ),
      },
    ],
    []
  );

  if (!isOpen || !data) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-16 backdrop-blur-sm select-none animate-fadeIn"
      onClick={onClose}
    >
      <Card
        variant="flat"
        className="relative flex max-h-[94vh] w-full max-w-[1020px] flex-col overflow-hidden !rounded-[28px] border border-stroke/70 bg-white shadow-2xl font-primary text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 彈窗頂部標頭列 */}
        <div className="flex shrink-0 items-center justify-between border-b border-stroke/60 px-28 py-18">
          <div className="flex items-center gap-10">
            <span className="flex h-20 w-20 items-center justify-center rounded-full border-[1.6px] border-primary text-primary">
              <svg viewBox="0 0 16 16" className="h-10 w-10 fill-current" aria-hidden="true">
                <circle cx="8" cy="4.5" r="1.2" />
                <path d="M7 7h2v5H7z" />
              </svg>
            </span>
            <h2 className="m-0 text-title-2 font-semibold text-[#1F4568]">
              詳細資訊 {data.id}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-6 text-label-2 font-medium text-[#527494] transition-colors hover:text-fontcolor cursor-pointer"
            aria-label="關閉彈窗"
          >
            <span className="text-[14px]">✕</span>
            <span>關閉</span>
          </button>
        </div>

        {/* 彈窗內容主要區域 (可垂直捲動) */}
        <div className="flex-1 overflow-y-auto p-28 space-y-16 custom-scrollbar bg-white">
          {/* 區塊 1：上方 4 大指標卡片 (良率, 稼動率, HPU, 達成率) - 採用 Card 元件 */}
          <div className="grid grid-cols-1 gap-14 sm:grid-cols-2 lg:grid-cols-4">
            {/* 卡片 1: 良率 */}
            <Card
              variant="flat"
              className="flex flex-col justify-between !rounded-2xl border border-stroke/70 bg-white p-18 min-h-[140px] shadow-sm"
            >
              <div className="text-body-4 font-medium text-description">良率</div>
              <div className="my-6">
                <div
                  className={cx(
                    "text-[34px] font-bold tracking-tight leading-none tabular-nums",
                    data.yieldRate < 90 ? "text-error" : "text-success"
                  )}
                >
                  {data.yieldRate}%
                </div>
                {/* 漸層進度條 */}
                <div className="mt-8 h-[8px] w-full overflow-hidden rounded-full bg-bg">
                  <div
                    style={{ width: `${Math.min(100, data.yieldRate)}%` }}
                    className={cx(
                      "h-full rounded-full transition-all duration-300",
                      data.yieldRate < 80
                        ? "bg-gradient-to-r from-[#E29595] to-error"
                        : data.yieldRate < 90
                        ? "bg-gradient-to-r from-[#F0C28B] to-warning"
                        : "bg-gradient-to-r from-[#7BC4AE] to-success"
                    )}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-caption-1">
                <span
                  className={cx(
                    "inline-flex items-center gap-2 font-medium",
                    data.yieldDelta < 0 ? "text-error" : "text-success"
                  )}
                >
                  {data.yieldDelta < 0 ? "▼" : "▲"}{" "}
                  {Math.abs(data.yieldDelta)}% 較上班次
                </span>
                <span className="text-caption-2 text-description">
                  目標 {data.yieldTarget}%
                </span>
              </div>
            </Card>

            {/* 卡片 2: 稼動率 */}
            <Card
              variant="flat"
              className="flex flex-col justify-between !rounded-2xl border border-stroke/70 bg-white p-18 min-h-[140px] shadow-sm"
            >
              <div className="text-body-4 font-medium text-description">稼動率</div>
              <div className="my-6">
                <div
                  className={cx(
                    "text-[34px] font-bold tracking-tight leading-none tabular-nums",
                    data.utilization < 80 ? "text-error" : "text-success"
                  )}
                >
                  {data.utilization}%
                </div>
                {/* 漸層進度條 */}
                <div className="mt-8 h-[8px] w-full overflow-hidden rounded-full bg-bg">
                  <div
                    style={{ width: `${Math.min(100, data.utilization)}%` }}
                    className={cx(
                      "h-full rounded-full transition-all duration-300",
                      data.utilization < 60
                        ? "bg-gradient-to-r from-[#E29595] to-error"
                        : data.utilization < 80
                        ? "bg-gradient-to-r from-[#F0C28B] to-warning"
                        : "bg-gradient-to-r from-[#7BC4AE] to-success"
                    )}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-caption-1">
                <span
                  className={cx(
                    "inline-flex items-center gap-2 font-medium",
                    data.utilDelta < 0 ? "text-error" : "text-success"
                  )}
                >
                  {data.utilDelta < 0 ? "▼" : "▲"}{" "}
                  {Math.abs(data.utilDelta)}% 較上班次
                </span>
                <span className="text-caption-2 text-description">
                  目標 {data.utilTarget}%
                </span>
              </div>
            </Card>

            {/* 卡片 3: HPU */}
            <Card
              variant="flat"
              className="flex flex-col justify-between !rounded-2xl border border-stroke/70 bg-white p-18 min-h-[140px] shadow-sm"
            >
              <div className="text-body-4 font-medium text-description">HPU</div>
              <div className="my-6">
                <div className="flex items-baseline gap-4">
                  <span
                    className={cx(
                      "text-[34px] font-bold tracking-tight leading-none tabular-nums",
                      data.hpu <= (data.hpuTarget || 2.0) ? "text-success" : "text-error"
                    )}
                  >
                    {data.hpu.toFixed(2)}
                  </span>
                  <span className="text-caption-1 font-normal text-description">
                    hrs/unit
                  </span>
                </div>
                {/* 目標指示進度條（超標 > 目標值時線段顯示警示紅色，達標時顯示綠色） */}
                <div className="relative mt-8 h-[8px] w-full overflow-hidden rounded-full bg-bg">
                  <div
                    style={{ width: `${Math.min(100, (data.hpu / 2.5) * 100)}%` }}
                    className={cx(
                      "h-full rounded-full transition-all duration-300",
                      data.hpu > (data.hpuTarget || 2.0)
                        ? "bg-gradient-to-r from-[#E29595] to-error"
                        : "bg-gradient-to-r from-[#7BC4AE] to-success"
                    )}
                  />
                  {/* 目標刻度標記 (<= 2.0) */}
                  <div
                    style={{ left: "80%" }}
                    className="absolute top-0 bottom-0 w-[2px] bg-[#94A3B8]"
                    title={`目標 ≤ ${data.hpuTarget || 2.0}`}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-caption-1">
                <span
                  className={cx(
                    "inline-flex items-center gap-2 font-medium",
                    Number(data.hpuDelta) > 0 ? "text-error" : "text-success"
                  )}
                >
                  {Number(data.hpuDelta) > 0 ? "▲" : "▼"}{" "}
                  {Math.abs(Number(data.hpuDelta) || 0.32)} 較上班次
                </span>
                <span className="text-caption-2 text-description">
                  目標 ≤ {data.hpuTarget}
                </span>
              </div>
            </Card>

            {/* 卡片 4: 達成率 */}
            <Card
              variant="flat"
              className="flex flex-col justify-between !rounded-2xl border border-stroke/70 bg-white p-18 min-h-[140px] shadow-sm"
            >
              <div className="text-body-4 font-medium text-description">達成率</div>
              <div className="my-6">
                <div
                  className={cx(
                    "text-[34px] font-bold tracking-tight leading-none tabular-nums",
                    data.achievement < 80 ? "text-error" : "text-success"
                  )}
                >
                  {data.achievement}%
                </div>
                {/* 達成率進度條 */}
                <div className="mt-8 h-[8px] w-full overflow-hidden rounded-full bg-bg">
                  <div
                    style={{ width: `${Math.min(100, data.achievement)}%` }}
                    className={cx(
                      "h-full rounded-full transition-all duration-300",
                      data.achievement < 80
                        ? "bg-gradient-to-r from-[#E29595] to-error"
                        : "bg-gradient-to-r from-[#7BC4AE] to-success"
                    )}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-caption-1">
                <span
                  className={cx(
                    "inline-flex items-center gap-2 font-medium",
                    data.achievementDelta < 0 ? "text-error" : "text-success"
                  )}
                >
                  {data.achievementDelta < 0 ? "▼" : "▲"}{" "}
                  {Math.abs(data.achievementDelta)}% 較上班次
                </span>
                <span className="text-caption-2 text-description">
                  目標 {data.achievementTarget}%
                </span>
              </div>
            </Card>
          </div>

          {/* 區塊 2：下方左右兩欄 (左: 機台資訊 Card, 右: 即時溫度監控 Card + 即時警報 DataTable Card) */}
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-12">
            {/* 左欄：機台資訊 (佔 5 欄) */}
            <Card
              variant="flat"
              className="!rounded-2xl border border-stroke/70 bg-white p-20 shadow-sm lg:col-span-5 flex-col"
            >
              <h3 className="m-0 mb-16 text-title-3 font-semibold text-fontcolor">
                機台資訊
              </h3>

              <div className="space-y-10 text-body-4">
                <div className="flex items-center justify-between">
                  <span className="text-description">機台</span>
                  <span className="font-medium text-fontcolor">
                    {data.machineInfo.machineId}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-description">Port</span>
                  <span className="font-medium text-fontcolor">
                    {data.machineInfo.port}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-description">LOT</span>
                  <span className="font-medium text-fontcolor">
                    {data.machineInfo.lot}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-description">Qty</span>
                  <span className="font-medium text-fontcolor">
                    {data.machineInfo.qty}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-description">Cust</span>
                  <span className="font-medium text-fontcolor">
                    {data.machineInfo.cust}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-description">Package</span>
                  <span className="font-medium text-fontcolor">
                    {data.machineInfo.pkg}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-description">Step</span>
                  <span className="font-medium text-fontcolor">
                    {data.machineInfo.step}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-description">Status</span>
                  <span className="font-medium text-fontcolor">
                    {data.machineInfo.stepStatus}
                  </span>
                </div>

                {/* 分隔細線 (使用 SectionDivider 元件) */}
                <SectionDivider variant="line" className="!my-6 !gap-0" />

                <div className="flex items-center justify-between">
                  <span className="text-description">機台狀態</span>
                  <span
                    className={cx(
                      "inline-flex items-center rounded-full px-10 py-2 text-caption-2 font-medium text-white",
                      data.machineInfo.statusClass || "bg-success"
                    )}
                  >
                    {data.machineInfo.statusText}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-description">執機OP</span>
                  <span className="font-medium text-fontcolor">
                    {data.machineInfo.op}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-description">MES Check in 時間</span>
                  <span className="font-medium text-fontcolor tabular-nums">
                    {data.machineInfo.mesCheckIn}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-description">開始測試時間</span>
                  <span className="font-medium text-fontcolor tabular-nums">
                    {data.machineInfo.testStart}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-description">最後Log更新時間</span>
                  <span className="font-medium text-fontcolor tabular-nums">
                    {data.machineInfo.lastLog}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-description">狀態持續時間</span>
                  <span className="font-medium text-fontcolor tabular-nums">
                    {data.machineInfo.duration}
                  </span>
                </div>
              </div>
            </Card>

            {/* 右欄：即時溫度監控 + 即時警報 (佔 7 欄) */}
            <div className="flex flex-col gap-14 lg:col-span-7">
              {/* 右上：即時溫度監控 Card */}
              <Card
                variant="flat"
                className="!rounded-2xl border border-stroke/70 bg-white p-20 shadow-sm flex-col"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="m-0 text-title-3 font-semibold text-fontcolor">
                      即時溫度監控
                    </h3>
                    <div className="mt-4 text-caption-1 text-description">
                      當前溫度
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <span
                      className={cx(
                        "text-[32px] font-bold tracking-tight leading-none tabular-nums",
                        data.temperature.isOver ? "text-error" : "text-success"
                      )}
                    >
                      {data.temperature.current}°C
                    </span>
                    <span
                      className={cx(
                        "rounded-full px-8 py-2 text-caption-2 font-medium text-white",
                        data.temperature.isOver ? "bg-error" : "bg-success"
                      )}
                    >
                      {data.temperature.isOver ? "超標" : "正常"}
                    </span>
                  </div>
                </div>

                {/* 溫度長條柱狀圖 (近 30 分鐘) */}
                <div className="relative mt-20">
                  {/* 背景安全範圍綠色區域指示帶 (200-220°C) */}
                  <div className="absolute top-[40%] bottom-[30%] left-0 right-0 rounded-full bg-success/15 pointer-events-none" />

                  <div className="flex h-[72px] items-end justify-between gap-[3px]">
                    {data.temperature.history.map((temp, index) => {
                      const minT = 180;
                      const maxT = 280;
                      const heightPercent = Math.min(
                        100,
                        Math.max(20, ((temp - minT) / (maxT - minT)) * 100)
                      );
                      const isHigh = temp > 220;
                      const isExtreme = temp >= 245;

                      return (
                        <div
                          key={index}
                          className="group relative flex-1 flex flex-col items-center justify-end h-full cursor-pointer"
                        >
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={cx(
                              "w-full rounded-t-sm transition-all duration-200 group-hover:opacity-80",
                              isExtreme
                                ? "bg-gradient-to-t from-[#F97316] to-[#EF4444]"
                                : isHigh
                                ? "bg-gradient-to-t from-[#5D84A2] to-warning"
                                : "bg-primary"
                            )}
                          />
                          {/* Hover Tooltip */}
                          <div className="pointer-events-none absolute -top-24 hidden rounded bg-black/80 px-6 py-2 text-[10px] text-white shadow group-hover:block z-10 whitespace-nowrap">
                            {temp}°C
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-10 flex items-center justify-between text-caption-2 text-description">
                    <span className="flex items-center gap-6">
                      <span className="inline-block h-6 w-6 rounded-full bg-success" />
                      安全範圍 {data.temperature.safeRange}
                    </span>
                    <span>近 30 分鐘</span>
                  </div>
                </div>
              </Card>

              {/* 右下：即時警報 (使用專案 UI 元件 DataTable) */}
              <Card
                variant="flat"
                className="!rounded-2xl border border-stroke/70 bg-white p-20 shadow-sm flex-1 flex-col"
              >
                <div className="flex items-center justify-between pb-12">
                  <div className="flex items-center gap-8">
                    <h3 className="m-0 text-title-3 font-semibold text-fontcolor">
                      即時警報
                    </h3>
                    <span className="text-caption-2 text-description">
                      每日 07:00 刷新
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-caption-2 text-description">
                    <svg
                      viewBox="0 0 16 16"
                      className="h-12 w-12 fill-none stroke-current"
                      strokeWidth="1.5"
                      aria-hidden="true"
                    >
                      <circle cx="8" cy="8" r="6" />
                      <polyline points="8 4.5 8 8 10.5 9.5" />
                    </svg>
                    <span>
                      {data.unhandledAlertCount > 0
                        ? `${data.unhandledAlertCount} 項未處理`
                        : "全數已處理"}
                    </span>
                  </div>
                </div>

                {/* 警報資料表格：使用現有 DataTable 元件 */}
                <div className="w-full overflow-hidden">
                  <DataTable
                    columns={alertColumns}
                    data={data.alerts}
                    selectable={false}
                    hoverable={true}
                    rowKey="id"
                    className="border border-stroke/60 !rounded-xl !shadow-none overflow-hidden"
                    headerClassName="bg-[#F8FAFC] !h-[36px]"
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default MachineDetailModal;
