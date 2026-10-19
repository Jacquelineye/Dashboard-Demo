import { forwardRef } from "react";
import Card from "./card";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * 依據 OEE 數值決定狀態配色：
 * - < 60%: 異常紅 (error: #C74949)
 * - 60% ~ 79%: 警示橘 (warning: #DE8D31)
 * - >= 80%: 正常綠 (success: #369379)
 */
export function getOEEStatusConfig(valueInput, threshold = 80) {
  const value = Number(valueInput) || 0;
  // 嚴重偏低（紅色異常）：低於 60% 或低於門檻 10% 以上
  const criticalThreshold = Math.min(60, threshold - 10);
  if (value < criticalThreshold) {
    return {
      level: "error",
      textClass: "text-error",
      solidClass: "bg-error",
      gradientClass: "bg-gradient-to-r from-[#E29595] to-error",
      subtleBgClass: "bg-error/5 border-error/30",
    };
  }
  // 未達門檻（橘色警示）：低於目前角色的標準線
  if (value < threshold) {
    return {
      level: "warning",
      textClass: "text-warning",
      solidClass: "bg-warning",
      gradientClass: "bg-gradient-to-r from-[#F0C28B] to-warning",
      subtleBgClass: "bg-warning/5 border-warning/30",
    };
  }
  // 達標（綠色正常）
  return {
    level: "success",
    textClass: "text-success",
    solidClass: "bg-success",
    gradientClass: "bg-gradient-to-r from-[#7BC4AE] to-success",
    subtleBgClass: "bg-success/5 border-success/30",
  };
}

/**
 * OEEProgressBar 進度條元件（原元件庫未提供之新元件）
 *
 * 支援樣式變體：
 * - barStyle: "gradient" (設計稿漸層風格，預設) | "solid" (純色風格)
 * - size: "sm" (6px) | "md" (8px，預設) | "lg" (10px)
 */
export const OEEProgressBar = forwardRef(function OEEProgressBar(
  {
    value = 0,
    threshold = 80,
    barStyle = "gradient", // "gradient" | "solid"
    size = "md", // "sm" | "md" | "lg"
    className = "",
    ...props
  },
  ref,
) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  const status = getOEEStatusConfig(clamped, threshold);

  const heightClasses = {
    sm: "h-[6px]",
    md: "h-[8px]",
    lg: "h-[10px]",
  };

  return (
    <div
      {...props}
      ref={ref}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cx(
        "w-full overflow-hidden rounded-full bg-bg",
        heightClasses[size] || heightClasses.md,
        className,
      )}
    >
      <div
        style={{ width: `${clamped}%` }}
        className={cx(
          "h-full rounded-full transition-all duration-300 ease-out",
          barStyle === "solid" ? status.solidClass : status.gradientClass,
        )}
      />
    </div>
  );
});

/**
 * MachineOEECard 機台指標狀態小卡元件
 *
 * 內部複用現有 Card 容器元件，依據檢視角色動態切換顯示指標（OEE / 稼動率 / 良率 / 達成率）與進度條。
 * 支援樣式變體：
 * - cardStyle: "default" (白底細框微陰影，1:1 還原設計稿) | "tinted" (依狀態微染色外框) | "interactive" (懸浮上移與聚焦外框)
 * - barStyle: "gradient" | "solid"
 * - barSize: "sm" | "md" | "lg"
 */
export const MachineOEECard = forwardRef(function MachineOEECard(
  {
    machineId,
    oee = 0,
    value,
    label = "OEE",
    unit = "%",
    threshold = 80,
    secondaryAlert = null, // 方案 A: 異常副指標警示標籤 { label, value, threshold, level, count, tooltip }
    cardStyle = "default", // "default" | "tinted" | "interactive"
    barStyle = "gradient", // "gradient" | "solid"
    barSize = "md", // "sm" | "md" | "lg"
    selected = false,
    onClick,
    className = "",
    ...props
  },
  ref,
) {
  const displayValue = typeof value === "number" ? value : (typeof oee === "number" ? oee : 0);
  const status = getOEEStatusConfig(displayValue, threshold);

  const styleVariants = {
    default:
      "border-stroke bg-white shadow-none hover:border-primary/70 hover:shadow-drop-m",
    static:
      "border-stroke bg-white shadow-none",
    tinted: cx(
      "bg-white shadow-none hover:border-primary/70 hover:shadow-drop-m",
      status.subtleBgClass,
    ),
  };

  return (
    <Card
      {...props}
      ref={ref}
      variant="flat"
      onClick={onClick}
      className={cx(
        "relative px-16 py-14 rounded-2xl transition-all duration-150 hover:z-10",
        onClick ? "cursor-pointer" : "cursor-default",
        styleVariants[cardStyle] || styleVariants.default,
        selected && "border-primary ring-2 ring-primary/20 shadow-drop-m z-10",
        className,
      )}
    >
      {/* 第一列：機台編號 + 方案 A 副指標異常警示標籤 */}
      <div className="flex items-center justify-between gap-4 min-h-[22px]">
        <div className="text-body-4 font-semibold tracking-tight text-fontcolor truncate">
          {machineId}
        </div>

        {secondaryAlert && (
          <span
            title={secondaryAlert.tooltip || `副指標異常提醒：${secondaryAlert.fullLabel || secondaryAlert.label} ${secondaryAlert.value}%（低於標準 ${secondaryAlert.threshold}%）`}
            className={cx(
              "inline-flex items-center gap-2 rounded-full px-6 py-1 text-[10px] font-semibold leading-none shrink-0 transition-all select-none",
              secondaryAlert.level === "error"
                ? "bg-error/10 text-error border border-error/25 hover:bg-error/15"
                : "bg-warning/10 text-warning border border-warning/25 hover:bg-warning/15"
            )}
          >
            <span className="opacity-85">{secondaryAlert.label}</span>
            <span className="tabular-nums font-bold">{secondaryAlert.value}%</span>
            {secondaryAlert.count > 1 && (
              <span className="opacity-60 text-[9px] font-normal">+{secondaryAlert.count - 1}</span>
            )}
          </span>
        )}
      </div>

      {/* 第二列：動態指標標籤與數值 */}
      <div className="mt-8 flex items-baseline justify-between">
        <span className={cx("text-caption-1 font-medium", status.textClass)}>
          {label}
        </span>
        <span className={cx("text-caption-1 font-semibold tabular-nums", status.textClass)}>
          {displayValue}{unit}
        </span>
      </div>

      {/* 第三列：進度條 */}
      <div className="mt-6">
        <OEEProgressBar value={displayValue} threshold={threshold} barStyle={barStyle} size={barSize} />
      </div>
    </Card>
  );
});

export default MachineOEECard;
