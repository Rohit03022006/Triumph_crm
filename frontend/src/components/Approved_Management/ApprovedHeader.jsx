import React, { useState } from "react";
import { useNavigate } from "react-router";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const ApprovedHeader = ({ pendingCount = 0, onRefresh, isRefreshing = false }) => {
  const navigate = useNavigate();
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = async () => {
    if (spinning || isRefreshing) return;
    setSpinning(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } finally {
      setTimeout(() => {
        setSpinning(false);
      }, 700);
    }
  };

  const isSpinning = spinning || isRefreshing;

  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2 border-b border-border/70">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          <span
            className="cursor-pointer hover:text-slate-900 transition-colors"
            onClick={() => navigate("/admin")}
          >
            Dashboard
          </span>
          <span>›</span>
          <span className="font-bold text-slate-800">
            Approvals & Review
          </span>
        </div>

        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight">
            Inventory Approvals & Review
          </h1>
          {pendingCount > 0 ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              {pendingCount} Pending Review
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              All Up to Date
            </span>
          )}
        </div>

        <p className="text-sm text-slate-500 mt-1">
          Review, approve, or request revisions for inventory items submitted by
          executive team members.
        </p>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <Button
          onClick={handleRefresh}
          disabled={isSpinning}
          variant="outline"
          className="group bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition-all font-semibold text-xs sm:text-sm h-10 px-4 shadow-2xs flex items-center gap-2"
          title="Refresh List"
        >
          <RotateCcw
            className={`w-4 h-4 text-slate-600 transition-transform duration-700 ${
              isSpinning ? "animate-spin text-primary" : "group-hover:-rotate-180"
            }`}
          />
          <span>Refresh</span>
        </Button>
      </div>
    </div>
  );
};

export default ApprovedHeader;
