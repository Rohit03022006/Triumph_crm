import React from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Users, CheckCircle2, PhoneCall, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const LeadsLogsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 pb-16 overflow-x-hidden">
      {/* Header & Breadcrumb */}
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
            <span
              className="cursor-pointer hover:text-slate-900 transition-colors"
              onClick={() => navigate("/admin/logs")}
            >
              Audit Logs
            </span>
            <span>›</span>
            <span className="font-bold text-slate-800">
              Leads Audit Trail
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight">
              Leads Audit Trail
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              Under Development
            </span>
          </div>

          <p className="text-sm text-slate-500 mt-1">
            Complete audit trail of customer lead assignments, stage movements, contact history, and executive follow-up activity.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/logs")}
            className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm h-10 px-3.5 shadow-2xs flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Logs</span>
          </Button>

          <Button
            onClick={() => navigate("/admin/logs/properties")}
            className="bg-primary hover:bg-brand-dark text-primary-foreground font-semibold text-xs sm:text-sm h-10 px-4 shadow-2xs flex items-center gap-1.5"
          >
            <span>Property Logs</span>
          </Button>
        </div>
      </div>

      {/* Main Full-page Card */}
      <div className="bg-white border border-border/70 rounded-xl p-12 shadow-xs text-center max-w-3xl mx-auto space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary mx-auto shadow-2xs">
          <Users className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900 font-heading">
            Leads Audit Logging Module
          </h3>
          <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            The Leads Audit Logging system will track all events across your CRM leads pipeline. Every modification, reassignment, and interaction will be logged with full executive attribution and timestamps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
              <Users className="w-4 h-4" />
              <span>Assignment Logs</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track who assigned leads to executives and monitor ownership changes over time.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
              <Clock className="w-4 h-4" />
              <span>Pipeline Stages</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Record stage changes from New to Contacted, Site Visit, Negotiation, and Closed.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <PhoneCall className="w-4 h-4" />
              <span>Call & Notes</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Log phone notes, meeting summaries, and follow-up reminders entered by staff.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadsLogsPage;

