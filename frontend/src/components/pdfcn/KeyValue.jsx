import React from "react";

/**
 * pdfcn.dev inspired KeyValue component
 * Renders structured attributes in a clean 2, 3, or 4 column grid.
 */
export const KeyValue = ({
  items = [],
  columns = 3,
  className = "",
}) => {
  const colClass = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  }[columns] || "grid-cols-3";

  return (
    <div className={`grid ${colClass} gap-x-4 gap-y-2.5 ${className}`}>
      {items.map((item, index) => {
        if (!item || item.value === undefined || item.value === null || item.value === "") {
          return null;
        }

        return (
          <div
            key={index}
            className={`p-2 rounded bg-slate-50/80 border border-slate-100/80 print-avoid-break ${
              item.highlight ? "bg-blue-50/50 border-blue-100" : ""
            }`}
          >
            <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">
              {item.label}
            </p>
            <p className="text-xs font-bold text-slate-900 mt-0.5 break-words">
              {item.value}
            </p>
            {item.subtext && (
              <p className="text-[10px] text-slate-400 mt-0.5">
                {item.subtext}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default KeyValue;

