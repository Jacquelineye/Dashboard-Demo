import { useEffect } from "react";
import Card from "../data-display/card";
import Button from "../actions/button";
import { Slider } from "../forms/slider";
import Switch from "../forms/switch";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * 警示線條預設門檻選項
 */
export const THRESHOLD_PRESETS = [
  { value: 70, label: "70%", desc: "寬鬆容許線" },
  { value: 75, label: "75%", desc: "廠務重大警戒線 (廠長視角)" },
  { value: 80, label: "80%", desc: "標準妥善率線 (設備/產線視角)" },
  { value: 85, label: "85%", desc: "品保嚴格管制線 (品保視角)" },
  { value: 90, label: "90%", desc: "高標精實線" },
];

/**
 * 儀表板可監控之 4 大核心製造指標項目清單
 */
export const MONITORED_METRIC_OPTIONS = [
  {
    key: "oee",
    name: "綜合 OEE",
    roleTag: "廠長",
    icon: "🏭",
    desc: "整體設備效率（稼動率 × 表現率 × 良率）",
  },
  {
    key: "utilization",
    name: "設備稼動率",
    roleTag: "設備",
    icon: "🔧",
    desc: "時間稼動率，反映硬體運轉與停機維護狀態",
  },
  {
    key: "yieldRate",
    name: "製程良率",
    roleTag: "品保",
    icon: "🔬",
    desc: "產品一次通過率 (FPY)，即時監控不良率與品質漂移",
  },
  {
    key: "achievement",
    name: "排程達成率",
    roleTag: "生管",
    icon: "📦",
    desc: "當班工單達成進度與產能產出節拍速度",
  },
];

/**
 * Dashboard 警示線條設定彈窗 (AlertSettingsModal)
 * 允許使用者依據不同職位角色，自訂儀表板上的警示分界線條門檻 (OEE Threshold)
 * 並提供指標項目監控開關（開啟 2 項以上即自動啟用副指標提醒）
 */
export function AlertSettingsModal({
  isOpen,
  onClose,
  currentRole,
  threshold = 80,
  onThresholdChange,
  monitoredMetrics = { oee: true, utilization: true, yieldRate: true, achievement: true },
  onToggleMonitoredMetric,
}) {
  // 按下 ESC 鍵關閉彈窗
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const metricLabel = currentRole?.metricLabel || "OEE";
  const metricUnit = currentRole?.metricUnit || "%";
  const enabledCount = Object.values(monitoredMetrics || {}).filter(Boolean).length;
  const isAutoSecondaryActive = enabledCount >= 2;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-16 backdrop-blur-sm select-none animate-fadeIn"
      onClick={onClose}
    >
      <Card
        variant="flat"
        className="relative flex max-h-[92vh] w-full max-w-[680px] flex-col overflow-hidden !rounded-[24px] border border-stroke/70 bg-white shadow-2xl font-primary text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 標頭列 */}
        <div className="flex shrink-0 items-center justify-between border-b border-stroke/60 px-24 py-18">
          <div>
            <div className="flex items-center gap-8">
              <span className="flex h-24 w-24 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-14 w-14"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </span>
              <h2 className="m-0 text-title-3 font-semibold text-fontcolor">
                Dashboard 警示線條設定
              </h2>
              <span className="rounded-full bg-primary/10 px-10 py-2 text-caption-2 font-semibold text-primary">
                目前門檻：{metricLabel} {threshold}{metricUnit}
              </span>
            </div>
            <p className="m-0 mt-4 text-caption-1 text-description">
              設定儀表板上的警示分界門檻與欲監控之指標項目。
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-32 w-32 items-center justify-center rounded-full text-description hover:bg-bg hover:text-fontcolor transition-colors cursor-pointer text-title-3"
            aria-label="關閉設定視窗"
          >
            ✕
          </button>
        </div>

        {/* 內容設定區域：僅保留「門檻」與「開啟項目」 */}
        <div className="flex-1 overflow-y-auto p-24 space-y-20 custom-scrollbar">
          {/* 1. 調整警示分界門檻 */}
          <div className="space-y-14 rounded-xl border border-stroke/70 bg-white p-18">
            <div className="flex items-center justify-between">
              <label className="text-label-1 font-semibold text-fontcolor">
                調整警示分界門檻 ({metricLabel} {metricUnit})
              </label>
              <div className="flex items-baseline gap-4">
                <span className="text-[28px] font-bold text-primary tabular-nums">
                  {threshold}{metricUnit}
                </span>
                <span className="text-caption-2 text-description">以下為警示機台</span>
              </div>
            </div>

            {/* Slider 元件 */}
            <div className="px-4 py-8">
              <Slider
                min={60}
                max={98}
                step={1}
                value={threshold}
                onChange={onThresholdChange}
                showValue={false}
              />
              <div className="flex justify-between text-caption-2 text-description mt-6">
                <span>60{metricUnit} (寬鬆警戒)</span>
                <span>75{metricUnit} (標準底線)</span>
                <span>80{metricUnit} (常態基準)</span>
                <span>85{metricUnit} (高標管制)</span>
                <span>98{metricUnit} (近零容忍)</span>
              </div>
            </div>
          </div>

          {/* 2. 儀表板監控指標項目設定（開啟 2 項以上自動啟用副指標提醒） */}
          <div className="space-y-12 rounded-xl border border-stroke/70 bg-white p-18">
            <div className="flex flex-wrap items-center justify-between gap-8">
              <div>
                <div className="flex items-center gap-8">
                  <span className="text-label-1 font-semibold text-fontcolor">
                    儀表板監控指標項目
                  </span>
                  {isAutoSecondaryActive ? (
                    <span className="inline-flex items-center gap-4 rounded-full bg-success/10 px-8 py-2 text-caption-2 font-semibold text-success border border-success/20">
                      <span className="h-6 w-6 rounded-full bg-success animate-pulse" />
                      副指標提醒已自動啟用（已開 {enabledCount} 項）
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-4 rounded-full bg-bg px-8 py-2 text-caption-2 font-semibold text-description border border-stroke/70">
                      單一指標模式（開啟 2 項以上自動啟用副指標）
                    </span>
                  )}
                </div>
                <p className="m-0 mt-4 text-caption-2 text-description">
                  設定要在儀表板關注的指標項目。只要開啟 2 項（含）以上，機台卡片將自動啟用「副指標提醒標籤」，在主指標之外即時預警其他異常。
                </p>
              </div>
            </div>

            {/* 指標清單 */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 pt-4">
              {MONITORED_METRIC_OPTIONS.map((item) => {
                const isPrimary = item.key === currentRole?.metricKey;
                const isChecked = Boolean(monitoredMetrics?.[item.key]);

                return (
                  <div
                    key={item.key}
                    onClick={() => {
                      if (!isPrimary && onToggleMonitoredMetric) {
                        onToggleMonitoredMetric(item.key);
                      }
                    }}
                    className={cx(
                      "flex items-center justify-between rounded-xl border p-12 transition-all select-none",
                      isPrimary
                        ? "border-primary/40 bg-primary/5 cursor-default"
                        : "cursor-pointer",
                      !isPrimary && isChecked
                        ? "border-stroke/80 bg-white hover:border-primary/50"
                        : !isPrimary && !isChecked
                        ? "border-stroke/50 bg-bg/30 opacity-60 hover:opacity-100"
                        : ""
                    )}
                  >
                    <div className="flex items-center gap-8 min-w-0 pr-8">
                      <span className="text-[20px]">{item.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-6">
                          <span className="text-body-4 font-semibold text-fontcolor truncate">
                            {item.name}
                          </span>
                          {isPrimary ? (
                            <span className="rounded bg-primary/10 px-6 py-0.5 text-[10px] font-bold text-primary shrink-0">
                              當前主指標
                            </span>
                          ) : (
                            <span className="rounded bg-bg px-6 py-0.5 text-[10px] text-description shrink-0">
                              {item.roleTag}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-description truncate mt-1">
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={isChecked}
                        disabled={isPrimary}
                        onChange={() => {
                          if (!isPrimary && onToggleMonitoredMetric) {
                            onToggleMonitoredMetric(item.key);
                          }
                        }}
                        containerClassName="!min-h-0"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 底部動作列 */}
        <div className="flex shrink-0 items-center justify-between border-t border-stroke/60 bg-bg/15 px-24 py-14">
          <div className="text-caption-1 text-description">
            目前警示線：{metricLabel} {threshold}{metricUnit}
          </div>

          <Button
            variant="solid"
            intent="primary"
            showLeftIcon={false}
            showRightIcon={false}
            onClick={onClose}
          >
            完成設定
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default AlertSettingsModal;
