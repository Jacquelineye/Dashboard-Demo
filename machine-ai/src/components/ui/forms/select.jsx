import { forwardRef, useState, useRef, useEffect, useLayoutEffect, useId, useCallback } from "react";
import { createPortal } from "react-dom";
import { ListItem } from "../data-display/listitem";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

const STATUS_STYLES = {
  default: "bg-white border-stroke text-fontcolor",
  hover: "bg-white border-primary/70 text-fontcolor shadow-drop-s",
  focus: "bg-white border-primary ring-2 ring-primary/20 text-fontcolor",
  disabled: "bg-bg/60 border-stroke/60 text-description cursor-not-allowed",
  error: "bg-white border-error text-fontcolor", // 錯誤未聚焦 (純紅框)
  "error-hover": "bg-white border-error text-fontcolor shadow-drop-s ring-2 ring-error/15", // 錯誤懸停 (紅框 + 微紅外環與陰影)
  errorHover: "bg-white border-error text-fontcolor shadow-drop-s ring-2 ring-error/15",
  "error-focus": "bg-white border-error text-fontcolor ring-2 ring-error/20", // 錯誤且聚焦/展開中
  errorFocus: "bg-white border-error text-fontcolor ring-2 ring-error/20",
};

export const Select = forwardRef(function Select(
  {
    options = [],
    value: propValue,
    defaultValue,
    onChange,
    placeholder = "請選擇...",
    disabled = false,
    error = false,
    status, // "default" | "hover" | "focus" | "disabled" | "error" | "error-focus" (展示專用)
    prefixIcon,
    label,
    helperText,
    errorMessage,
    id: propId,
    size = "md", // "sm" (32px) | "md" (36px, 預設) | "lg" (44px, 舒適點擊)
    className = "",
    containerClassName = "",
    dropdownClassName = "",
    menuHeader = null,
  },
  ref,
) {
  const generatedId = useId();
  const id = propId || generatedId;

  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? options[0]?.value ?? "");
  const value = propValue !== undefined ? propValue : internalValue;

  const selectRef = useRef(null);
  const internalButtonRef = useRef(null);
  const menuRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  const isDisabled = disabled || status === "disabled";
  const isError = Boolean(error || errorMessage || status === "error" || status === "error-focus" || status === "errorFocus");

  const selectedOption = options.find((opt) => opt.value === value);

  // 結合外部 ref 與內部按鈕 ref
  const setButtonRefs = useCallback(
    (node) => {
      internalButtonRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

  // 精確計算浮動清單之 fixed 座標，使其徹底跨出父容器與卡片之限制
  const updatePosition = useCallback(() => {
    const el = internalButtonRef.current || selectRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    if (rect.width <= 0) return;

    // 若觸發按鈕已滾動離開視窗範圍，主動關閉選單
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      setIsOpen(false);
      return;
    }

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const menuMaxHeight = 320;

    // 若下方空間不足 180px 且上方空間更大，則往上展開；否則正常往下展開
    const openUpward = spaceBelow < 180 && spaceAbove > spaceBelow;
    const availableHeight = openUpward ? spaceAbove - 16 : spaceBelow - 16;
    const maxHeight = Math.min(menuMaxHeight, Math.max(100, availableHeight));

    // 橫向位置：嚴格與觸發按鈕左邊界對齊，並確保不超出螢幕左右邊界，選單寬度至少 108px 以舒適容納文字與勾選圖示
    const menuWidth = Math.max(108, rect.width);
    const safeLeft = Math.max(8, Math.min(rect.left, window.innerWidth - menuWidth - 8));

    setDropdownStyle({
      position: "fixed",
      left: `${safeLeft}px`,
      width: `${menuWidth}px`,
      top: openUpward ? "auto" : `${rect.bottom + 4}px`,
      bottom: openUpward ? `${window.innerHeight - rect.top + 4}px` : "auto",
      maxHeight: `${maxHeight}px`,
      boxSizing: "border-box",
      margin: 0,
      zIndex: 99999,
    });
  }, []);

  // 監聽全域事件：一次只能打開一個 select
  useEffect(() => {
    const handleCloseOther = (e) => {
      if (e.detail?.id !== id) {
        setIsOpen(false);
      }
    };
    document.addEventListener("close-other-selects", handleCloseOther);
    return () => {
      document.removeEventListener("close-other-selects", handleCloseOther);
    };
  }, [id]);

  // 開啟選單時立即在 Paint 之前精確計算位置 (useLayoutEffect)
  useLayoutEffect(() => {
    if (!isOpen) return;
    updatePosition();
  }, [isOpen, updatePosition]);

  // 開啟選單時監聽全域滾動與視窗大小變更以即時同步位置
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, updatePosition]);

  // 點選外部關閉選單（需同時判斷按鈕容器與 Portal 選單）
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      const inButton = selectRef.current && selectRef.current.contains(e.target);
      const inMenu = menuRef.current && menuRef.current.contains(e.target);
      if (!inButton && !inMenu) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const toggleOpen = () => {
    if (isDisabled) return;
    if (!isOpen) {
      updatePosition();
      document.dispatchEvent(new CustomEvent("close-other-selects", { detail: { id } }));
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelectOption = (opt) => {
    if (opt.disabled) return;
    if (propValue === undefined) {
      setInternalValue(opt.value);
    }
    onChange?.(opt.value, opt);
    setIsOpen(false);
  };

  const sizeConfig = {
    sm: {
      btn: "h-[32px] min-h-[32px] max-h-[32px] rounded-[16px] px-10 text-caption-1",
      icon: "h-14 w-14 text-[12px]",
      text: "text-caption-1",
      badge: "text-[10px] px-6 py-0.5 rounded",
      chevronBox: "h-[18px] w-[18px]",
      chevronSvg: "h-12 w-12",
      itemMinH: "!min-h-[32px] !py-4 !px-10",
      itemText: "text-caption-1",
    },
    md: {
      btn: "h-[36px] min-h-[36px] max-h-[36px] rounded-[18px] px-12 text-label-3",
      icon: "h-16 w-16 text-[13px]",
      text: "text-label-3",
      badge: "text-[10px] px-6 py-0.5 rounded",
      chevronBox: "h-[20px] w-[20px]",
      chevronSvg: "h-14 w-14",
      itemMinH: "!min-h-[36px] !py-6 !px-12",
      itemText: "text-caption-1",
    },
    lg: {
      btn: "h-[44px] min-h-[44px] max-h-[44px] rounded-[22px] px-14 text-body-4 font-medium",
      icon: "h-20 w-20 text-[16px]",
      text: "text-[13.5px]",
      badge: "text-[11px] px-7 py-1 rounded-full",
      chevronBox: "h-[24px] w-[24px]",
      chevronSvg: "h-16 w-16",
      itemMinH: "!min-h-[42px] !py-8 !px-14",
      itemText: "text-body-4",
    },
  };
  const currentSize = sizeConfig[size] || sizeConfig.md;

  return (
    <div
      ref={selectRef}
      className={cx("relative flex flex-col gap-4 font-primary text-left", containerClassName)}
    >
      {label && (
        <label htmlFor={id} className="text-caption-1 font-medium text-[#A3A3A3] select-none">
          {label}
        </label>
      )}

      {/* 觸發按鈕 (依據 size 動態調整高度與點擊範圍，預設 36px，lg 為 44px) */}
      <button
        ref={setButtonRefs}
        id={id}
        type="button"
        disabled={isDisabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={toggleOpen}
        className={cx(
          "box-border flex w-full items-center justify-between border font-primary transition-all duration-150 active:scale-[0.99]",
          currentSize.btn,
          "outline-none text-left select-none cursor-pointer",
          prefixIcon && "pl-10",

          isDisabled
            ? "!bg-bg/60 bg-bg/60 !border-stroke/60 border-stroke/60 !text-description text-description !cursor-not-allowed cursor-not-allowed shadow-none pointer-events-none"
            : status
              ? cx("bg-white cursor-pointer", STATUS_STYLES[status])
              : isError
                ? cx(
                    "bg-white cursor-pointer border-error text-fontcolor hover:border-error hover:ring-2 hover:ring-error/15 hover:shadow-drop-s focus:border-error focus:ring-2 focus:ring-error/20",
                    isOpen && "ring-2 ring-error/20",
                  )
                : cx(
                    "bg-white cursor-pointer border-stroke text-fontcolor hover:border-primary/70 hover:shadow-drop-s focus:border-primary focus:ring-2 focus:ring-primary/20",
                    isOpen && "border-primary ring-2 ring-primary/20",
                  ),

          "disabled:!bg-bg/60 disabled:bg-bg/60 disabled:!border-stroke/60 disabled:border-stroke/60 disabled:!text-description disabled:text-description disabled:!cursor-not-allowed disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none",
          className,
        )}
      >
        <div className="flex min-w-0 items-center gap-8 truncate flex-1 mr-4">
          {prefixIcon && (
            <span className={cx("flex shrink-0 items-center justify-center text-description", currentSize.icon)}>
              {prefixIcon}
            </span>
          )}
          {selectedOption?.icon && (
            <span className={cx("flex shrink-0 items-center justify-center leading-none", currentSize.icon)}>
              {selectedOption.icon}
            </span>
          )}
          <span className={cx("truncate font-medium", currentSize.text, !selectedOption && "text-placeholder", isDisabled && "!text-description")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className={cx("ml-auto text-primary bg-primary/10 font-semibold shrink-0", currentSize.badge)}>
              {selectedOption.badge}
            </span>
          )}
        </div>

        {/* 箭頭指示圖示 */}
        <span
          className={cx(
            "flex shrink-0 items-center justify-center rounded-full transition-all",
            currentSize.chevronBox,
            isOpen ? "bg-[#CEDAE3] text-primary shadow-inner" : "text-description",
          )}
        >
          <svg
            viewBox="0 0 24 24"
            className={cx(
              "shrink-0 stroke-current fill-none stroke-2 transition-transform duration-150",
              currentSize.chevronSvg,
              isDisabled ? "opacity-40" : isOpen ? "rotate-180 text-primary" : "text-description",
            )}
          >
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {/* 下拉浮動清單：以 Portal 渲染於最外層，超出卡片時直接跨出，不被 card 限制裁切 */}
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <ul
            ref={menuRef}
            role="listbox"
            style={dropdownStyle}
            onMouseDown={(e) => e.stopPropagation()}
            className={cx(
              "m-0 box-border flex flex-col gap-4 overflow-y-auto rounded-[22px] border border-stroke bg-white p-6 shadow-drop-m list-none animate-in fade-in duration-100 custom-scrollbar select-none",
              dropdownClassName,
            )}
          >
            {menuHeader && (
              <div className="px-12 py-4 text-caption-2 font-semibold text-description border-b border-stroke/50 mb-2">
                {menuHeader}
              </div>
            )}
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <ListItem
                  as="li"
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  selected={isSelected}
                  disabled={opt.disabled}
                  onClick={() => handleSelectOption(opt)}
                  showLeftIcon={Boolean(opt.icon)}
                  leftIcon={
                    typeof opt.icon === "string" ? (
                      <span className={cx("leading-none", currentSize.icon)}>{opt.icon}</span>
                    ) : (
                      opt.icon
                    )
                  }
                  showDescription={Boolean(opt.description)}
                  description={opt.description}
                  showSuffix={isSelected}
                  suffix={
                    <svg
                      viewBox="0 0 16 16"
                      className="h-14 w-14 shrink-0 stroke-current fill-none stroke-2 text-primary"
                    >
                      <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
                    </svg>
                  }
                  className={cx(
                    "!rounded-full transition-colors select-none",
                    opt.description
                      ? size === "lg"
                        ? "!min-h-[46px] !py-6 !px-14"
                        : "!min-h-[44px] !py-6 !px-12"
                      : currentSize.itemMinH,
                    isSelected ? "!bg-primary/15 !text-primary font-medium" : "hover:!bg-primary/10",
                  )}
                >
                  <span className={cx("truncate font-medium", currentSize.itemText)}>{opt.label}</span>
                </ListItem>
              );
            })}
          </ul>,
          document.body,
        )}

      {(errorMessage || helperText) && (
        <p className={cx("m-0 text-caption-2", isError ? "text-error" : "text-description")}>
          {errorMessage || helperText}
        </p>
      )}
    </div>
  );
});

export default Select;
