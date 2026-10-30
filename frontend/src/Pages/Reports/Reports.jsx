import React from "react";
import { useNavigate, useLocation } from "react-router";
import { BarChart3, Download, FileSpreadsheet, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReportsChart from "@/components/Reports_Management/ReportsChart";

const Reports = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const prefix = isAdmin ? "/admin" : "/executive";

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 pb-12">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span
              className="cursor-pointer hover:text-foreground transition-colors"
              onClick={() => navigate(prefix)}
            >
              Dashboard
            </span>
            <span>›</span>
            <span className="font-bold text-foreground">Operational Reports</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground tracking-tight">
              Reports & Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple/10 text-purple border border-purple/20">
              Analytics
            </span>
          </div>

          <p className="text-sm text-muted-foreground mt-1">
            Comprehensive business reports, sales conversion metrics, and inventory turnover statistics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            className="bg-card border-border text-foreground hover:bg-muted font-semibold text-xs sm:text-sm h-10 px-4 flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-muted-foreground" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* Main Reports Chart / Display Area */}
      <ReportsChart />
    </div>
  );
};

export default Reports;
