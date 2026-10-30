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
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2 border-b border-border/70">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          <span
            className="cursor-pointer hover:text-foreground transition-colors"
            onClick={() => navigate(basePath)}
          >
            Dashboard
          </span>
          <span>›</span>
          <span className="font-bold text-foreground">Audit Logs</span>
        </div>

        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground tracking-tight">
            Audit Logs
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
            {totalCount} Records
          </span>
        </div>

        <p className="text-sm text-muted-foreground mt-1">
          Complete audit trail of every inventory change, status edit, creation, and executive action.
        </p>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <Button
          onClick={handleRefresh}
          disabled={isSpinning}
          variant="outline"
          className="group bg-card border-border text-foreground hover:bg-muted active:scale-95 transition-all font-semibold text-xs sm:text-sm h-10 px-4 shadow-2xs flex items-center gap-2 cursor-pointer"
          title="Refresh List"
        >
          <RotateCcw
            className={`w-4 h-4 text-muted-foreground transition-transform duration-700 ${
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
