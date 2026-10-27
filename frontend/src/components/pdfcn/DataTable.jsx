import React from "react";

/**
 * pdfcn.dev inspired DataTable component
 * Formatted specifically for printable documents with compact borders, clear headers, and high contrast.
 */
export const DataTable = ({
  columns = [],
  data = [],
  emptyMessage = "No records found.",
  className = "",
}) => {
  return (
    <div className={`w-full overflow-hidden border border-slate-200 rounded ${className}`}>
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`px-3 py-2 ${col.align === "right" ? "text-right" : "text-left"} ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-3 text-center text-slate-400 italic text-[11px]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rIdx) => (
              <tr
                key={rIdx}
                className={rIdx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}
              >
                {columns.map((col, cIdx) => {
                  const val = typeof col.accessor === "function"
                    ? col.accessor(row)
                    : row[col.accessorKey || col.accessor];

                  return (
                    <td
                      key={cIdx}
                      className={`px-3 py-2 text-[11px] text-slate-800 ${
                        col.align === "right" ? "text-right" : "text-left"
                      } ${col.cellClassName || ""}`}
                    >
                      {val !== undefined && val !== null ? val : "—"}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;

