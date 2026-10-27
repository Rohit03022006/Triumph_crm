import React from "react";
import { Link, useLocation } from "react-router";
import { Clock, Eye, ExternalLink, History, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACTION_CONFIG = {
  CREATE: {
    label: "Created",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotClass: "bg-emerald-500",
  },
  STATUS_CHANGE: {
    label: "Status Changed",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    dotClass: "bg-amber-500",
  },
  UPDATE: {
    label: "Field Edited",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    dotClass: "bg-blue-500",
  },
  DELETE: {
    label: "Deleted",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    dotClass: "bg-rose-500",
  },
  UNIT_UPDATE: {
    label: "Unit Modified",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    dotClass: "bg-purple-500",
  },
};

function formatDateTime(dateStr) {
  if (!dateStr) return { date: "-", time: "" };
  const d = new Date(dateStr);
  const date = d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return { date, time };
}

function getRelativeTime(dateStr) {
  if (!dateStr) return "";
  const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

const LogsTable = ({
  logs = [],
  isLoading,
  isError,
  onRetry,
  onSelectLog,
  hasActiveFilters,
  onResetFilters,
}) => {
  const location = useLocation();
  const basePath = location.pathname.startsWith("/admin") ? "/admin" : "/executive";

  if (isLoading) {
    return (
      <div className="bg-white border border-border/70 rounded-xl p-12 text-center text-slate-500 shadow-xs">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-3" />
        <p className="text-sm font-medium">Loading audit logs...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white border border-border/70 rounded-xl p-12 text-center text-danger shadow-xs">
        <AlertCircle className="w-8 h-8 mx-auto mb-3" />
        <p className="text-sm font-semibold">Failed to load audit logs.</p>
        <Button onClick={onRetry} variant="outline" className="mt-3">
          Retry
        </Button>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white border border-border/70 rounded-xl p-16 text-center text-slate-500 shadow-xs">
        <History className="w-10 h-10 mx-auto mb-3 text-slate-300" />
        <h3 className="text-base font-semibold text-slate-800">No Audit Logs Found</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          {hasActiveFilters
            ? "No logs matched your current filters. Try resetting the search or filter options."
            : "Every time a property is edited, created, or its status changes, an audit record will be logged here."}
        </p>
        {hasActiveFilters && (
          <Button onClick={onResetFilters} variant="outline" className="mt-4">
            Clear Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-border/70 rounded-xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-border/70 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3.5 px-4">Date & Time</th>
              <th className="py-3.5 px-4">Executive</th>
              <th className="py-3.5 px-4">Action</th>
              <th className="py-3.5 px-4">Property</th>
              <th className="py-3.5 px-4">Change Summary</th>
              <th className="py-3.5 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {logs.map((log) => {
              const actionCfg = ACTION_CONFIG[log.action] || {
                label: log.action,
                badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
                dotClass: "bg-slate-400",
              };

              const hasChanges = Array.isArray(log.changes) && log.changes.length > 0;

              return (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Timestamp (1st row: Date, 2nd row: Time, 3rd row: Relative Time) */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {(() => {
                      const dt = formatDateTime(log.createdAt);
                      const relTime = getRelativeTime(log.createdAt);
                      return (
                        <div className="space-y-0.5">
                          <div className="font-semibold text-xs text-slate-800">{dt.date}</div>
                          {dt.time && (
                            <div className="text-[12px] text-slate-500 flex items-center gap-1 font-medium">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{dt.time}</span>
                            </div>
                          )}
                          {relTime && (
                            <div className="text-[12px] text-slate-400 font-normal">
                              {relTime}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </td>

                  {/* Executive / User */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                    <div>
                        <div className="font-semibold text-slate-900 leading-tight">
                          {log.userName || "Unknown"}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          {log.userRole && (
                            <span className="uppercase text-[10px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                              {log.userRole}
                            </span>
                          )} 
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Action Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${actionCfg.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${actionCfg.dotClass}`} />
                      {actionCfg.label}
                    </span>
                  </td>

                  {/* Property Title & Deal Type */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      {log.propertyId ? (
                        <Link
                          to={`${basePath}/inventory/${log.propertyId}`}
                          className="hover:text-primary transition-colors hover:underline flex items-center gap-1 line-clamp-1 max-w-[220px]"
                        >
                          <span>{log.propertyTitle}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                        </Link>
                      ) : (
                        <span className="line-clamp-1 max-w-[220px] text-slate-700">
                          {log.propertyTitle}
                        </span>
                      )}
                    </div>
                    {log.dealType && (
                      <div className="text-xs text-slate-500 font-medium mt-0.5">{log.dealType}</div>
                    )}
                  </td>

                  {/* Change Summary */}
                  <td className="py-3.5 px-4">
                    <p className="text-sm text-slate-700 font-medium line-clamp-2 max-w-[360px]">
                      {log.summary || "Inventory record modified"}
                    </p>
                  </td>

                  {/* Details / Diff View Button */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    {hasChanges ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectLog(log)}
                        className="h-8 px-2.5 text-xs font-semibold bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-primary" />
                        View Diff ({log.changes.length})
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No field details</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogsTable;

