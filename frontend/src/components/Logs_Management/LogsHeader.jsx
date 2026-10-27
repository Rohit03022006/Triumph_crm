import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const LogsHeader = ({ totalCount = 0, onRefresh, isRefreshing = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith("/admin") ? "/admin" : "/executive";
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
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2 font-medium">
          <span
            className="cursor-pointer hover:text-slate-900 transition-colors"
            onClick={() => navigate(basePath)}
          >
            Dashboard
          </span>
          <span>›</span>
          <span className="font-semibold text-slate-800">Audit Logs</span>
        </div>

        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight">
            Audit Logs
          </h1>
          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
            {totalCount} Records
          </span>
        </div>

        <p className="text-sm text-slate-500 mt-1">
          Complete audit trail of every inventory change, status edit, creation, and executive action.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleRefresh}
          disabled={isSpinning}
          variant="outline"
          className="group bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition-all font-medium text-sm h-10 px-4 shadow-2xs"
          title="Refresh List"
        >
          <RotateCcw
            className={`w-4 h-4 mr-2 text-slate-600 transition-transform duration-700 ${
              isSpinning ? "animate-spin text-primary" : "group-hover:-rotate-180"
            }`}
          />
          <span>Refresh</span>
        </Button>
      </div>
    </div>
  );
};

export default LogsHeader;
