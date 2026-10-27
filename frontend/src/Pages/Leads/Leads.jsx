import React from "react";
import { useNavigate, useLocation } from "react-router";
import { Users, Plus, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import LeadTable from "@/components/Lead_Management/LeadTable";

const Leads = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const prefix = isAdmin ? "/admin" : "/executive";

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 pb-12">
      {/* Header & Breadcrumb */}
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
            <span className="font-bold text-slate-800">Leads Pipeline</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight">
              Leads Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              Pipeline
            </span>
          </div>

          <p className="text-sm text-slate-500 mt-1">
            Track potential buyers, customer inquiries, executive follow-ups, and conversion stages.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            className="bg-primary hover:bg-brand-dark text-primary-foreground font-semibold text-xs sm:text-sm h-10 px-4 shadow-2xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </Button>
        </div>
      </div>

      {/* Main Leads Board / Table Area */}
      <LeadTable />
    </div>
  );
};

export default Leads;
