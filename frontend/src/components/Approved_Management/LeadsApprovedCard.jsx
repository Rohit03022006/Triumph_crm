import React from "react";
import { useNavigate } from "react-router";
import { UserCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const LeadsApprovedCard = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-border/70 rounded-xl p-6 shadow-xs flex flex-col justify-between h-full space-y-5">
      {/* Card Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-2xs">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Leads Approvals & Verification
              </h3>
              <p className="text-xs text-slate-500">
                Lead qualification & assignment controls
              </p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            Coming Soon
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Review and approve lead qualifications, transfer requests, and executive assignments before routing them to sales teams.
        </p>
      </div>

      {/* Feature Highlights checklist */}
      <div className="space-y-2 flex-1">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100">
          <span>Planned Verification Flows</span>
          <span>Status</span>
        </div>

        <div className="space-y-2.5 pt-1">
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50/80 border border-slate-100 text-xs text-slate-700 font-medium">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Admin verification before high-value lead assignment</span>
          </div>
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50/80 border border-slate-100 text-xs text-slate-700 font-medium">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Executive lead transfer request approvals and routing</span>
          </div>
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50/80 border border-slate-100 text-xs text-slate-700 font-medium">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Disqualification and lost lead review workflow</span>
          </div>
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50/80 border border-slate-100 text-xs text-slate-700 font-medium">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Duplicate contact merge and customer validation</span>
          </div>
        </div>
      </div>

      {/* Card Action: View All */}
      <div className="pt-2 border-t border-slate-100">
        <Button
          onClick={() => navigate("/admin/approved/leads")}
          variant="outline"
          className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 font-semibold text-sm h-10 shadow-2xs flex items-center justify-center gap-2 transition-all"
        >
          <span>View All Leads Approvals</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default LeadsApprovedCard;
