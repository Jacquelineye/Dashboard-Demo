import { forwardRef } from "react";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * SectionDivider 區間文字分隔線元件（原元件庫未提供之新元件）
 *
 * 支援樣式變體：
 * - variant: "line" (純細線置中文字，1:1 還原設計稿) | "pill" (膠囊標籤置中) | "dashed" (虛線風格)
 */
export const SectionDivider = forwardRef(function SectionDivider(
  {
    children,
    label,
    variant = "dashed", // "dashed" | "line" | "pill"
    className = "",
    ...props
  },
  ref,
) {
  const content = children ?? label;

  return (
    <div
      {...props}
      ref={ref}
      role="separator"
      className={cx(" my-6 flex w-full items-center gap-12 select-none", className)}
    >
      <div
        className={cx(
          "h-[1px] flex-1",
          variant === "dashed"
            ? "border-t border-dashed border-stroke"
            : "bg-stroke/70",
        )}
      />
      {content && (
        <span
          className={cx(
            "shrink-0 text-caption-1 font-normal text-description",
            variant === "pill" &&
              "rounded-full border border-stroke/80 bg-bg/60 px-12 py-2 font-medium text-fontcolor",
          )}
        >
          {content}
        </span>
      )}
      <div
        className={cx(
          "h-[1px] flex-1",
          variant === "dashed"
            ? "border-t border-dashed border-stroke"
            : "bg-stroke/70",
        )}
      />
    </div>
  );
});

export default SectionDivider;
