import React from "react";
import { Users, CheckCircle2, PhoneCall, Calendar, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const LeadTable = () => {
  return (
    <div className="bg-white border border-border/70 rounded-xl overflow-hidden shadow-xs">
      {/* Top Filter Bar Header */}
      <div className="p-4 border-b border-border/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-slate-800 border border-slate-200 shadow-2xs">
            All Leads (0)
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer">
            New Inquiries
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer">
            Site Visit Scheduled
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer">
            Negotiation
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer">
            Closed
          </span>
        </div>
      </div>

      {/* Empty State / Pipeline View */}
      <div className="p-12 text-center max-w-lg mx-auto space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary mx-auto shadow-2xs">
          <Users className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900 font-heading">
            No Active Leads In Pipeline
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Your customer inquiries and leads pipeline is ready. New leads created via phone, WhatsApp, or direct inquiry will appear here with full assignment and stage tracking.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="pt-2 space-y-2 text-left">
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Multi-stage pipeline: Inquiry, Site Visit, Booking & Closing</span>
          </div>
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Automatic inventory unit tagging and matching</span>
          </div>
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Follow-up reminders with executive assignment</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadTable;
