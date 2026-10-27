import React from "react";
import { BarChart3, TrendingUp, Building2, CheckCircle2, PieChart } from "lucide-react";

const ReportsChart = () => {
  return (
    <div className="bg-white border border-border/70 rounded-xl overflow-hidden shadow-xs">
      {/* Top Tabs Bar */}
      <div className="p-4 border-b border-border/60 flex items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-white text-slate-800 border border-slate-200 shadow-2xs">
            Inventory Turnover
          </span>
          <span className="px-3.5 py-1 rounded-full text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer">
            Executive Performance
          </span>
          <span className="px-3.5 py-1 rounded-full text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer">
            Deal Velocity
          </span>
        </div>
      </div>

      {/* Main Analytics Container */}
      <div className="p-12 text-center max-w-lg mx-auto space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-purple/10 border border-purple/20 flex items-center justify-center text-purple mx-auto shadow-2xs">
          <BarChart3 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900 font-heading">
            Executive Analytics & Reports
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Data aggregation for inventory velocity, executive closed deals, and pipeline performance will calculate automatically as properties and leads progress.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="pt-2 space-y-2 text-left">
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Inventory turnaround time by category (Booking, Retrade, Lease)</span>
          </div>
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Executive performance tracking and deal closing rates</span>
          </div>
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Excel and PDF report export with date filters</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsChart;
