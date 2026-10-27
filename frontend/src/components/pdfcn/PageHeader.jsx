import React from "react";

/**
 * pdfcn.dev inspired PageHeader component
 * Provides a clean, professional header block for document generation.
 */
export const PageHeader = ({
  title = "Triumph CRM",
  subtitle = "Property Specification ",
  rightText,
  rightSubText,
  badge,
  logo,
  className = "",
}) => {
  return (
    <div className={`border-b-2 border-slate-900 pb-4 mb-6 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        {/* Left: Branding & Title */}
        <div className="flex items-center gap-3.5">
          {logo ? (
            logo
          ) : (
            <img
              src="/logo_main.png"
              alt="Triumph Estates"
              className="h-10 sm:h-11 w-auto max-w-[160px] object-contain shrink-0"
            />
          )}
          <div className="border-l border-slate-200 pl-3.5 py-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                {title}
              </h1>
              {badge && <div>{badge}</div>}
            </div>
            {subtitle && (
              <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Reference / Date / Meta */}
        {(rightText || rightSubText) && (
          <div className="text-right shrink-0">
            {rightText && (
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {rightText}
              </p>
            )}
            {rightSubText && (
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {rightSubText}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;

