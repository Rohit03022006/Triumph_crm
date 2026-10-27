import React from "react";
import { useNavigate, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { History, Plus } from "lucide-react";

const InventoryHeader = ({ onAddClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const prefix = isAdmin ? "/admin" : "/executive";
  const logsPath = "/admin/logs/properties";

  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2 border-b border-border/70">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          <span
            className="cursor-pointer hover:text-slate-900 transition-colors"
            onClick={() => navigate(prefix)}
          >
            Dashboard
          </span>
          <span>›</span>
          <span className="font-bold text-slate-800">Inventory Management</span>
        </div>

        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight">
            Inventory Management
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Portfolio
          </span>
        </div>

        <p className="text-sm text-slate-500 mt-1">
          Manage, organize, and track residential and commercial properties across all categories.
        </p>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {isAdmin && (
          <Button
            variant="outline"
            onClick={() => navigate(logsPath)}
            className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-semibold text-xs sm:text-sm h-10 px-3.5 shadow-2xs flex items-center gap-1.5"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>Audit Logs</span>
          </Button>
        )}
        <Button
          onClick={onAddClick}
          className="bg-primary hover:bg-brand-dark text-primary-foreground font-semibold text-xs sm:text-sm h-10 px-4 shadow-2xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Inventory</span>
        </Button>
      </div>
    </div>
  );
};

export default InventoryHeader;
