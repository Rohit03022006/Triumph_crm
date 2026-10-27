import React from "react";

/**
 * pdfcn.dev inspired Section component
 * Groups document blocks with clean headings and visual dividers.
 */
export const Section = ({
  title,
  subtitle,
  icon,
  children,
  className = "",
  titleClassName = "",
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {title && (
        <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && <span className="text-slate-600">{icon}</span>}
            <h3
              className={`text-xs font-bold uppercase tracking-wider text-slate-800 ${titleClassName}`}
            >
              {title}
            </h3>
          </div>
          {subtitle && (
            <span className="text-[11px] text-slate-500 font-medium">
              {subtitle}
            </span>
          )}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default Section;

