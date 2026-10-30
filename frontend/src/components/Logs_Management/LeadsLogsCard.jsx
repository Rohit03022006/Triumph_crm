import React from "react";
import { useNavigate } from "react-router";
import { Users, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const LeadsLogsCard = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-card border border-border/70 rounded-xl p-6 shadow-xs flex flex-col justify-between h-full space-y-5">
      {/* Card Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary shadow-2xs">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground font-heading">
                Leads Audit Trail
              </h3>
              <p className="text-xs text-muted-foreground">
                Pipeline movements & executive assignments
              </p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            Coming Soon
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Every customer lead modification — including status changes, executive reassignments, pipeline stages, and contact activity — will be logged with full executive attribution and timestamps.
        </p>
      </div>

      {/* Feature Highlights checklist */}
      <div className="space-y-2 flex-1">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-1 border-b border-border/60">
          <span>Planned Capabilities</span>
          <span>Coverage</span>
        </div>

        <div className="space-y-2.5 pt-1">
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/40 border border-border/70 text-xs text-foreground font-medium">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span>Lead status and pipeline stage history with before/after diffs</span>
          </div>
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/40 border border-border/70 text-xs text-foreground font-medium">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span>Executive reassignment tracking and ownership logs</span>
          </div>
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/40 border border-border/70 text-xs text-foreground font-medium">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span>Call notes, WhatsApp follow-ups, and interaction timestamps</span>
          </div>
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/40 border border-border/70 text-xs text-foreground font-medium">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span>Source attribution and marketing channel tracking</span>
          </div>
        </div>
      </div>

      {/* Card Action: View All */}
      <div className="pt-2 border-t border-border/60">
        <Button
          onClick={() => navigate("/admin/logs/leads")}
          variant="outline"
          className="w-full bg-card border-border text-foreground hover:bg-muted font-semibold text-sm h-10 shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>View All Leads Logs</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default LeadsLogsCard;
