import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const ACTION_CONFIG = {
  CREATE: {
    label: "Created",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  STATUS_CHANGE: {
    label: "Status Changed",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  UPDATE: {
    label: "Field Edited",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  DELETE: {
    label: "Deleted",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  UNIT_UPDATE: {
    label: "Unit Modified",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
};

function formatDisplayDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderValue(val) {
  if (val === null || val === undefined || val === "") {
    return <span className="text-slate-400 italic">None</span>;
  }
  if (typeof val === "boolean") {
    return val ? "Yes" : "No";
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return <span className="text-slate-400 italic">Empty</span>;
    return val.join(", ");
  }
  if (typeof val === "object") {
    return JSON.stringify(val);
  }
  return String(val);
}

const LogDiffDialog = ({ log, onClose }) => {
  if (!log) return null;

  const actionCfg = ACTION_CONFIG[log.action] || {
    label: log.action,
    badgeClass: "bg-slate-100 text-slate-700",
  };

  return (
    <Dialog open={Boolean(log)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-w-3xl max-h-[85vh] overflow-y-auto p-6">
        <DialogHeader className="pb-3 border-b border-border/70">
          <DialogTitle className="text-xl font-heading font-bold text-slate-900 flex items-center justify-between">
            <span>Change Details</span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${actionCfg.badgeClass}`}
            >
              {actionCfg.label}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Modified on {formatDisplayDate(log.createdAt)} by{" "}
            <span className="font-semibold text-slate-700">{log.userName}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Property Context Box */}
        <div className="bg-slate-50 rounded-lg p-3.5 border border-border/70 mt-3 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase font-semibold">Property</span>
              <p className="font-bold text-slate-900">{log.propertyTitle}</p>
            </div>
            {log.dealType && (
              <span className="text-xs font-semibold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700">
                {log.dealType}
              </span>
            )}
          </div>
          {log.summary && (
            <p className="text-xs text-slate-600 mt-2 font-medium bg-white p-2 rounded border border-slate-200/60">
              {log.summary}
            </p>
          )}
        </div>

        {/* Modified Fields Table */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase text-slate-600 tracking-wider">
              Modified Fields ({log.changes?.length || 0})
            </h4>
          </div>

          <div className="border border-border/70 rounded-xl overflow-hidden bg-white shadow-2xs">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="border-b border-border/70">
                  <TableHead className="w-1/3 py-3 px-4 text-xs font-bold uppercase text-slate-600 tracking-wider">
                    Field Name
                  </TableHead>
                  <TableHead className="w-1/3 py-3 px-4 text-xs font-bold uppercase text-slate-600 tracking-wider">
                    Previous Value
                  </TableHead>
                  <TableHead className="w-1/3 py-3 px-4 text-xs font-bold uppercase text-slate-600 tracking-wider">
                    Updated Value
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/60">
                {log.changes && log.changes.length > 0 ? (
                  log.changes.map((ch, idx) => (
                    <TableRow
                      key={idx}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Field Name */}
                      <TableCell className="py-3 px-4 align-top">
                        <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                          {ch.label || ch.field}
                        </div>
                        {ch.label && ch.field && ch.label !== ch.field && (
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            {ch.field}
                          </div>
                        )}
                      </TableCell>

                      {/* Previous Value */}
                      <TableCell className="py-3 px-4 align-top">
                        <div className="p-2 rounded-md bg-rose-50/70 border border-rose-200/60 text-xs font-medium text-rose-950 break-words">
                          {renderValue(ch.oldValue)}
                        </div>
                      </TableCell>

                      {/* Updated Value */}
                      <TableCell className="py-3 px-4 align-top">
                        <div className="p-2 rounded-md bg-emerald-50/70 border border-emerald-200/60 text-xs font-semibold text-emerald-950 break-words">
                          {renderValue(ch.newValue)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-8 text-center text-xs text-slate-400 italic"
                    >
                      No specific field changes recorded for this action.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} className="h-9 px-4 text-sm font-semibold">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogDiffDialog;
