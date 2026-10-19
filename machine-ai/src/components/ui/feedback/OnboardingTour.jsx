import React, { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "../actions/button";

export const TOUR_STORAGE_KEY = "machine_dashboard_onboarding_seen_v1";

export const TOUR_STEPS = [
  {
    targetId: "tour-alert-priority",
    stepBadge: "步驟 1 / 3",
    title: "1. 警示優先",
    description: "開啟後將未達標的異常機台自動置頂排在最前方，第一時間掌握異常。",
    placement: "left-top",
    highlightPadding: 4,
    borderRadius: 9999,
  },
  {
    targetId: "tour-settings-btn",
    stepBadge: "步驟 2 / 3",
    title: "2. 警示設定",
    description: "點擊齒輪可自訂指標門檻，並自由開啟 OEE、稼動率等監控項目。",
    placement: "right-center",
    highlightPadding: 4,
    borderRadius: 8,
  },
  {
    targetId: "tour-role-select",
    stepBadge: "步驟 3 / 3",
    title: "3. 切換身分視角",
    description: "依廠長、設備、品保、生管身分切換視角，自動切換主指標與門檻。",
    placement: "right-bottom",
    highlightPadding: 4,
    borderRadius: 22,
  },
];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function OnboardingTour({
  isOpen,
  onClose,
  steps = TOUR_STEPS,
  storageKey = TOUR_STORAGE_KEY,
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState(null);
  const [popoverPos, setPopoverPos] = useState({ top: 100, left: 100, width: 360 });

  const currentStep = steps[currentStepIndex];

  // 計算目前步驟目標元素的螢幕位置與彈窗最佳放置位置
  const updateLayout = useCallback(() => {
    if (!isOpen || !currentStep) return;

    const el = document.getElementById(currentStep.targetId);
    if (!el) {
      setSpotlightRect(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    const pad = currentStep.highlightPadding ?? 4;
    const spotWidth = rect.width + pad * 2;
    const spotHeight = rect.height + pad * 2;
    const rawRx = currentStep.borderRadius ?? 16;
    // 嚴格數學限制：SVG rect rx 不得大於半高或半寬，避免 Mac/WebKit 渲染出多重殘影與深色月牙形狀
    const safeRx = Math.min(rawRx, spotHeight / 2, spotWidth / 2);

    const spot = {
      x: Math.max(0, rect.left - pad),
      y: Math.max(0, rect.top - pad),
      width: spotWidth,
      height: spotHeight,
      rx: safeRx,
    };
    setSpotlightRect(spot);

    // 彈窗尺寸（寬 360px，高約 210px，比照圖二標準規格）
    const popWidth = Math.min(360, window.innerWidth - 32);
    const popHeight = 210;

    let targetLeft = 0;
    let targetTop = 0;

    switch (currentStep.placement) {
      case "left-top":
        // 位於目標元素左側，垂直略微偏上（如圖二）
        targetLeft = spot.x - popWidth - 16;
        targetTop = spot.y - 10;
        break;
      case "bottom-left":
        targetLeft = spot.x + spot.width - popWidth;
        targetTop = spot.y + spot.height + 14;
        break;
      case "right-center":
        // 置於目標元素右側垂直居中
        targetLeft = spot.x + spot.width + 16;
        targetTop = spot.y + spot.height / 2 - popHeight / 2;
        break;
      case "right-bottom":
        // 置於目標元素右側偏上方，避免超出螢幕底部
        targetLeft = spot.x + spot.width + 16;
        targetTop = spot.y + spot.height - popHeight;
        break;
      case "top-left":
        targetLeft = spot.x;
        targetTop = spot.y - popHeight - 14;
        break;
      default:
        targetLeft = spot.x;
        targetTop = spot.y + spot.height + 14;
    }

    // 防超出視窗邊界保護 (Safe Viewport Clamp)
    const safeLeft = Math.max(16, Math.min(window.innerWidth - popWidth - 16, targetLeft));
    const safeTop = Math.max(16, Math.min(window.innerHeight - popHeight - 16, targetTop));

    setPopoverPos({ top: safeTop, left: safeLeft, width: popWidth });
  }, [isOpen, currentStep]);

  // 重置為第一步
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  // 開啟或切換步驟時精準計算位置
  useLayoutEffect(() => {
    if (!isOpen) return;
    updateLayout();
  }, [isOpen, currentStepIndex, updateLayout]);

  // 監聽視窗縮放與滾動
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => updateLayout();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [isOpen, updateLayout]);

  // 鍵盤快捷鍵：Esc 略過、左右鍵切換步驟
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleSkip();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStepIndex]);

  const handleSkip = () => {
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, "true");
      } catch (err) {
        // ignore
      }
    }
    onClose?.();
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, "true");
      } catch (err) {
        // ignore
      }
    }
    onClose?.();
  };

  if (!isOpen || typeof document === "undefined") return null;

  const isLastStep = currentStepIndex === steps.length - 1;

  return createPortal(
    <div className="fixed inset-0 z-[99990] select-none font-primary animate-in fade-in duration-200">
      {/* 聚光燈 SVG 遮罩：精準鏤空目標元素，其餘區域鋪上半透明黑底 */}
      <svg className="fixed inset-0 h-full w-full pointer-events-none">
        <defs>
          <mask id="onboarding-tour-mask">
            {/* 白色代表不透明（會渲染背景遮罩色） */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* 黑色代表透明鏤空（目標元素原樣穿透透出） */}
            {spotlightRect && (
              <rect
                x={spotlightRect.x}
                y={spotlightRect.y}
                width={spotlightRect.width}
                height={spotlightRect.height}
                rx={spotlightRect.rx}
                ry={spotlightRect.rx}
                fill="black"
              />
            )}
          </mask>
        </defs>

        {/* 半透明底層 */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.45)"
          mask="url(#onboarding-tour-mask)"
          className="pointer-events-auto cursor-default"
          onClick={handleSkip}
        />
      </svg>

      {/* 目標元素的乾淨微光線條 (與 SVG 圓角完全一致，避免任何雙重描邊或深色月牙) */}
      {spotlightRect && (
        <div
          style={{
            position: "fixed",
            left: `${spotlightRect.x}px`,
            top: `${spotlightRect.y}px`,
            width: `${spotlightRect.width}px`,
            height: `${spotlightRect.height}px`,
            borderRadius: `${spotlightRect.rx}px`,
          }}
          className="pointer-events-none z-[99991] ring-2 ring-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.18)] transition-all duration-300 ease-out"
        />
      )}

      {/* 操作指引彈窗卡片 (完全比照圖二風格：圓角 28px、分隔線、極簡簡短說明) */}
      <div
        style={{
          position: "fixed",
          top: `${popoverPos.top}px`,
          left: `${popoverPos.left}px`,
          width: `${popoverPos.width}px`,
        }}
        onClick={(e) => e.stopPropagation()}
        className="z-[99992] flex flex-col rounded-[28px] border border-slate-100/80 bg-white p-28 shadow-[0_16px_40px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out"
      >
        {/* 頂部標頭：步驟標籤 (高度 20px) + 關閉叉叉按鈕 (36px * 36px) */}
        <div className="flex items-center justify-between">
          <span className="inline-flex h-[20px] min-h-[20px] max-h-[20px] items-center justify-center rounded-full bg-[#EDF2F7] px-8 text-[12px] font-semibold tracking-wide text-[#507693] leading-none select-none">
            {currentStep.stepBadge}
          </span>

          <button
            type="button"
            onClick={handleSkip}
            title="關閉指引"
            className="flex h-[36px] w-[36px] min-h-[36px] min-w-[36px] max-h-[36px] max-w-[36px] items-center justify-center rounded-full text-[#94A3B8] hover:bg-slate-100 hover:text-[#475569] transition-colors cursor-pointer -mr-6 -mt-6"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-16 w-16 stroke-current fill-none stroke-2"
            >
              <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
              <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* 標題 (大字體，深黑字色) */}
        <h3 className="mt-16 mb-10 text-[20px] font-bold text-[#1E293B] tracking-tight leading-snug select-none">
          {currentStep.title}
        </h3>

        {/* 說明文字 (簡明扼要，兩行以內) */}
        <p className="text-[14px] leading-relaxed text-[#64748B] select-none">
          {currentStep.description}
        </p>

        {/* 圖片二同款分隔線 */}
        <div className="h-[1px] w-full bg-[#E5E9EC] my-18" />

        {/* 底部導覽列：略過 (左) + 圓點指示器 (中) + 下一步/完成按鈕 (右，使用 Button 元件，高度固定 36px) */}
        <div className="flex h-[36px] items-center justify-between">
          <button
            type="button"
            onClick={handleSkip}
            className="flex h-[36px] items-center text-[15px] font-medium text-[#4A708B] hover:text-[#33536D] transition-colors cursor-pointer bg-transparent border-none p-0 select-none"
          >
            略過
          </button>

          {/* 分頁進度小圓點 */}
          <div className="flex items-center gap-6">
            {steps.map((_, idx) => (
              <button
                type="button"
                key={idx}
                aria-label={`切換至步驟 ${idx + 1}`}
                onClick={() => setCurrentStepIndex(idx)}
                className={cx(
                  "h-4 rounded-full transition-all duration-300 cursor-pointer p-0 border-none",
                  idx === currentStepIndex
                    ? "w-18 bg-[#4A708B]"
                    : "w-4 bg-[#CBD5E1] hover:bg-[#94A3B8]"
                )}
              />
            ))}
          </div>

          {/* 下一步 / 完成按鈕 (使用專案標準 Button 元件，高＝36px) */}
          <Button
            variant="filled"
            intent="primary"
            onClick={handleNext}
            className="!h-[36px] !min-h-[36px] !max-h-[36px] !px-20 !rounded-full !bg-[#4A708B] hover:!bg-[#3D5F77] !text-white text-[14px] font-medium shadow-sm active:scale-95 transition-all cursor-pointer select-none"
          >
            {isLastStep ? "完成" : "下一步"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
