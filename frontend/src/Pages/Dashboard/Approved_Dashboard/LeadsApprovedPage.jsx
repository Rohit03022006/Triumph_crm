import React from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, UserCheck, CheckCircle2, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const LeadsApprovedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 pb-16 overflow-x-hidden">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2 font-medium">
            <span
              className="cursor-pointer hover:text-slate-900 transition-colors"
              onClick={() => navigate("/admin")}
            >
              Dashboard
            </span>
            <span>›</span>
            <span
              className="cursor-pointer hover:text-slate-900 transition-colors"
              onClick={() => navigate("/admin/approved")}
            >
              Approvals & Review
            </span>
            <span>›</span>
            <span className="font-semibold text-slate-800">
              Leads Approvals
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight">
              Leads Approvals & Verification
            </h1>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold">
              Under Development
            </span>
          </div>

          <p className="text-sm text-slate-500 mt-1">
            Review and sign off on high-value lead assignments, executive transfer requests, and lead disqualifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/approved")}
            className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm h-10 px-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Approvals Dashboard
          </Button>

          <Button
            onClick={() => navigate("/admin/approved/properties")}
            className="bg-primary hover:bg-brand-dark text-primary-foreground font-semibold text-sm h-10 px-4 shadow-sm"
          >
            View Property Approvals
          </Button>
        </div>
      </div>

      {/* Main Full-page Card */}
      <div className="bg-white border border-border/70 rounded-xl p-12 shadow-xs text-center max-w-3xl mx-auto space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mx-auto shadow-2xs">
          <UserCheck className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900 font-heading">
            Leads Approval Workflow
          </h3>
          <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            Configure approval checkpoints for lead assignments, transfers between executives, and deal qualification before progressing into active pipeline stages.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
              <Clock className="w-4 h-4" />
              <span>Pending Reviews</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Queue of inbound lead assignments requiring administrator review and routing.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified Leads</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Approved qualified leads authorized for executive meetings and site visits.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
              <Users className="w-4 h-4" />
              <span>Transfer Sign-offs</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Formal approval process for transferring leads from one executive to another.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadsApprovedPage;

