import React from "react";

/**
 * pdfcn.dev inspired PageFooter component
 * Standardized document footer with confidentiality notice, page count, and system attribution.
 */
export const PageFooter = ({
  leftText = "Confidential • Triumph Real Estate CRM",
  centerText,
  rightText = "System Generated Document",
  className = "",
}) => {
  return (
    <div className={`mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between ${className}`}>
      <span className="font-medium">{leftText}</span>
      {centerText && <span className="text-slate-400">{centerText}</span>}
      <span className="font-medium text-slate-400">{rightText}</span>
    </div>
  );
};

export default PageFooter;

