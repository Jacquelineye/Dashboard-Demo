import { MachineOEECard } from "../data-display/oeeCard";
import { SectionDivider } from "../data-display/divider";
import Button from "../actions/button";
import ToggleButton from "../actions/togglebutton";
import { Tab } from "../actions/tabs";
import { Switch } from "../forms/switch";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function UpArrowIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-14 w-14 fill-none stroke-current"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 12.5v-9M4.5 7 8 3.5 11.5 7" />
    </svg>
  );
}

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

/**
 * 新增元件與「警示優先」4 種互動方案展示視窗
 */
export function NewComponentsStyleModal({
  isOpen,
  onClose,
  sortControlVariant,
  onSortControlVariantChange,
  alertPriorityOn,
  onAlertPriorityChange,
  cardStyle,
  onCardStyleChange,
  barStyle,
  onBarStyleChange,
  barSize,
  onBarSizeChange,
  dividerVariant,
  onDividerVariantChange,
}) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-comp-style-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-16 backdrop-blur-sm animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-[980px] flex-col overflow-hidden rounded-3xl border border-stroke/80 bg-white shadow-drop-l font-primary text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stroke/60 px-24 py-16">
          <div>
            <div className="flex items-center gap-8">
              <h2
                id="new-comp-style-title"
                className="m-0 text-title-3 font-semibold text-fontcolor"
              >
                🎨 「警示優先」4 種設計範例 &amp; 新增元件樣式展示
              </h2>
              <span className="rounded-full bg-primary/10 px-10 py-2 text-caption-2 font-semibold text-primary">
                可直接在下方點擊測試切換
              </span>
            </div>
            <p className="m-0 mt-4 text-caption-1 text-description">
              所有範例皆可直接點擊互動：開啟時「將異常機台往上推置頂」，關閉時「依機台編號 (01→70) 排序」。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-32 w-32 items-center justify-center rounded-full text-description hover:bg-bg hover:text-fontcolor transition-colors cursor-pointer text-title-3"
            aria-label="關閉視窗"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-24 space-y-24 custom-scrollbar">
          {/* 區塊 0：警示優先 4 種互動設計範例 */}
          <div className="space-y-14">
            <div className="flex flex-wrap items-center justify-between gap-8">
              <div>
                <h3 className="m-0 text-label-1 font-semibold text-fontcolor">
                  ⚡ 「警示優先（錯誤置頂 ⇄ 機台編號順序）」4 種設計範例對比
                </h3>
                <p className="m-0 mt-2 text-caption-1 text-description">
                  目前排序狀態：
                  <span className="ml-4 font-semibold text-primary">
                    {alertPriorityOn
                      ? "已開啟「警示優先」（OEE < 80% 置頂排序）"
                      : "已關閉（目前依機台編號 01 → 70 順序排列）"}
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
              {/* 方案 A */}
              <div
                onClick={() => onSortControlVariantChange?.("A")}
                className={cx(
                  "flex flex-col justify-between gap-12 rounded-2xl border p-16 transition-all cursor-pointer",
                  sortControlVariant === "A"
                    ? "border-primary bg-primary/5 shadow-drop-s"
                    : "border-stroke/80 bg-white hover:border-primary/50",
                )}
              >
                <div className="flex items-start justify-between gap-8">
                  <div>
                    <div className="text-label-2 font-semibold text-fontcolor">
                      方案 A：ToggleButton 切換按鈕
                    </div>
                    <p className="m-0 mt-2 text-caption-1 text-description">
                      使用元件庫 `ToggleButton`。開啟時為藍底內陰影，取消點選時退回淺色外框，文字維持不變。
                    </p>
                  </div>
                  <span
                    className={cx(
                      "shrink-0 rounded-full px-8 py-2 text-caption-2 font-semibold",
                      sortControlVariant === "A"
                        ? "bg-primary text-white"
                        : "bg-bg text-description",
                    )}
                  >
                    {sortControlVariant === "A" ? "主畫面使用中" : "點擊套用"}
                  </span>
                </div>

                <div
                  className="flex items-center justify-between rounded-xl bg-bg/50 px-14 py-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-caption-1 text-description">
                    點擊右側按鈕測試開關 👉
                  </span>
                  <ToggleButton
                    variant="filled"
                    selected={alertPriorityOn}
                    onSelectedChange={onAlertPriorityChange}
                    icon={<UpArrowIcon />}
                    className={
                      !alertPriorityOn
                        ? "border border-stroke bg-white text-fontcolor"
                        : ""
                    }
                  >
                    警示優先
                  </ToggleButton>
                </div>
              </div>

              {/* 方案 B */}
              <div
                onClick={() => onSortControlVariantChange?.("B")}
                className={cx(
                  "flex flex-col justify-between gap-12 rounded-2xl border p-16 transition-all cursor-pointer",
                  sortControlVariant === "B"
                    ? "border-primary bg-primary/5 shadow-drop-s"
                    : "border-stroke/80 bg-white hover:border-primary/50",
                )}
              >
                <div className="flex items-start justify-between gap-8">
                  <div>
                    <div className="text-label-2 font-semibold text-fontcolor">
                      方案 B：單顆按鈕動態換字與圖示
                    </div>
                    <p className="m-0 mt-2 text-caption-1 text-description">
                      開啟時顯示藍底「↑ 警示優先」；關閉時自動換成白底外框「# 依編號排序」，清楚提示當前邏輯。
                    </p>
                  </div>
                  <span
                    className={cx(
                      "shrink-0 rounded-full px-8 py-2 text-caption-2 font-semibold",
                      sortControlVariant === "B"
                        ? "bg-primary text-white"
                        : "bg-bg text-description",
                    )}
                  >
                    {sortControlVariant === "B" ? "主畫面使用中" : "點擊套用"}
                  </span>
                </div>

                <div
                  className="flex items-center justify-between rounded-xl bg-bg/50 px-14 py-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-caption-1 text-description">
                    點擊右側按鈕測試開關 👉
                  </span>
                  <Button
                    variant={alertPriorityOn ? "filled" : "outline"}
                    intent={alertPriorityOn ? "primary" : "secondary"}
                    showLeftIcon={true}
                    leftIcon={
                      alertPriorityOn ? <UpArrowIcon /> : <HashOrderIcon />
                    }
                    showRightIcon={false}
                    onClick={() => onAlertPriorityChange(!alertPriorityOn)}
                  >
                    {alertPriorityOn ? "警示優先" : "依編號排序"}
                  </Button>
                </div>
              </div>

              {/* 方案 C */}
              <div
                onClick={() => onSortControlVariantChange?.("C")}
                className={cx(
                  "flex flex-col justify-between gap-12 rounded-2xl border p-16 transition-all cursor-pointer",
                  sortControlVariant === "C"
                    ? "border-primary bg-primary/5 shadow-drop-s"
                    : "border-stroke/80 bg-white hover:border-primary/50",
                )}
              >
                <div className="flex items-start justify-between gap-8">
                  <div>
                    <div className="text-label-2 font-semibold text-fontcolor">
                      方案 C：雙選項分段膠囊切換器 (Segmented Tabs)
                    </div>
                    <p className="m-0 mt-2 text-caption-1 text-description">
                      並列呈現「↑ 警示優先」與「# 機台編號」兩顆膠囊，一眼就能看出兩種排序模式。
                    </p>
                  </div>
                  <span
                    className={cx(
                      "shrink-0 rounded-full px-8 py-2 text-caption-2 font-semibold",
                      sortControlVariant === "C"
                        ? "bg-primary text-white"
                        : "bg-bg text-description",
                    )}
                  >
                    {sortControlVariant === "C" ? "主畫面使用中" : "點擊套用"}
                  </span>
                </div>

                <div
                  className="flex items-center justify-between rounded-xl bg-bg/50 px-14 py-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-caption-1 text-description">
                    點擊右側分段測試 👉
                  </span>
                  <div className="inline-flex h-[36px] items-center gap-2 rounded-full border border-stroke bg-white p-2">
                    <Tab
                      selected={alertPriorityOn}
                      showLeftIcon={true}
                      leftIcon={<UpArrowIcon />}
                      onSelect={() => onAlertPriorityChange(true)}
                      className="!h-[30px] [&>button]:!h-[30px] [&>button]:!text-caption-1 [&>button]:!px-10"
                    >
                      警示優先
                    </Tab>
                    <Tab
                      selected={!alertPriorityOn}
                      showLeftIcon={true}
                      leftIcon={<HashOrderIcon />}
                      onSelect={() => onAlertPriorityChange(false)}
                      className="!h-[30px] [&>button]:!h-[30px] [&>button]:!text-caption-1 [&>button]:!px-10"
                    >
                      機台編號
                    </Tab>
                  </div>
                </div>
              </div>

              {/* 方案 D */}
              <div
                onClick={() => onSortControlVariantChange?.("D")}
                className={cx(
                  "flex flex-col justify-between gap-12 rounded-2xl border p-16 transition-all cursor-pointer",
                  sortControlVariant === "D"
                    ? "border-primary bg-primary/5 shadow-drop-s"
                    : "border-stroke/80 bg-white hover:border-primary/50",
                )}
              >
                <div className="flex items-start justify-between gap-8">
                  <div>
                    <div className="text-label-2 font-semibold text-fontcolor">
                      方案 D：Switch 撥桿開關膠囊
                    </div>
                    <p className="m-0 mt-2 text-caption-1 text-description">
                      使用元件庫 `Switch` 元件搭配文字，最直覺表達「是否開啟將錯誤往上推」的開關機制。
                    </p>
                  </div>
                  <span
                    className={cx(
                      "shrink-0 rounded-full px-8 py-2 text-caption-2 font-semibold",
                      sortControlVariant === "D"
                        ? "bg-primary text-white"
                        : "bg-bg text-description",
                    )}
                  >
                    {sortControlVariant === "D" ? "主畫面使用中" : "點擊套用"}
                  </span>
                </div>

                <div
                  className="flex items-center justify-between rounded-xl bg-bg/50 px-14 py-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-caption-1 text-description">
                    點擊右側撥桿測試 👉
                  </span>
                  <div
                    onClick={() => onAlertPriorityChange(!alertPriorityOn)}
                    className={cx(
                      "inline-flex h-[36px] items-center gap-8 rounded-full border px-12 transition-colors cursor-pointer",
                      alertPriorityOn
                        ? "border-primary/40 bg-primary/5 text-primary"
                        : "border-stroke bg-white text-fontcolor",
                    )}
                  >
                    <span className="text-label-3 font-medium">警示優先</span>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={alertPriorityOn}
                        onChange={onAlertPriorityChange}
                        containerClassName="!min-h-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 1. OEE 進度條風格 */}
          <div className="space-y-12 border-t border-stroke/50 pt-20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="m-0 text-label-1 font-semibold text-fontcolor">
                  1. OEE 進度條外觀 (`OEEProgressBar`)
                </h3>
                <p className="m-0 mt-2 text-caption-1 text-description">
                  依 OEE 數值自動切換紅 (&lt;60%)、橘 (60~79%)、綠 (&ge;80%) 三色
                </p>
              </div>
              <div className="flex items-center gap-8">
                {[
                  { id: "gradient", label: "柔和漸層 (預設)" },
                  { id: "solid", label: "飽和純色" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onBarStyleChange(opt.id)}
                    className={cx(
                      "rounded-full px-12 py-6 text-caption-1 font-medium transition-all cursor-pointer border",
                      barStyle === opt.id
                        ? "border-primary bg-primary text-white shadow-drop-s"
                        : "border-stroke bg-white text-fontcolor hover:bg-bg/50",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. 區間分隔線樣式 */}
          <div className="space-y-12 border-t border-stroke/50 pt-20">
            <div className="flex flex-wrap items-center justify-between gap-8">
              <div>
                <h3 className="m-0 text-label-1 font-semibold text-fontcolor">
                  2. 區間文字分隔線 (`SectionDivider`)
                </h3>
              </div>
              <div className="flex items-center gap-8">
                {[
                  { id: "dashed", label: "虛線分隔 (預設)" },
                  { id: "line", label: "極簡實線" },
                  { id: "pill", label: "膠囊標籤" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onDividerVariantChange(opt.id)}
                    className={cx(
                      "rounded-full px-12 py-6 text-caption-1 font-medium transition-all cursor-pointer border",
                      dividerVariant === opt.id
                        ? "border-primary bg-primary text-white shadow-drop-s"
                        : "border-stroke bg-white text-fontcolor hover:bg-bg/50",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-stroke/60 bg-bg/30 px-24 py-14">
          <span className="text-caption-1 text-description">
            💡 上方選擇的方案與開關狀態會即時同步至主畫面
          </span>
          <Button
            intent="primary"
            variant="filled"
            showLeftIcon={false}
            showRightIcon={false}
            onClick={onClose}
          >
            套用並返回主畫面
          </Button>
        </div>
      </div>
    </div>
  );
}
