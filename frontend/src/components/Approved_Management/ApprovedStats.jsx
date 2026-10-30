import React from "react";
import { Clock, CheckCircle2, ShieldCheck, Building2 } from "lucide-react";

const ApprovedStats = ({ stats = {} }) => {
  const {
    underReview = 0,
    available = 0,
    closed = 0,
    total = 0,
  } = stats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Pending Review */}
      <div className="bg-card border border-amber/30 rounded-xl p-4.5 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-amber uppercase tracking-wider">
            Pending Review
          </p>
          <p className="text-2xl font-bold font-heading text-amber mt-1">
            {underReview}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-amber/15 border border-amber/30 flex items-center justify-center text-amber">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      {/* Approved & Available */}
      <div className="bg-card border border-border/70 rounded-xl p-4.5 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Approved & Available
          </p>
          <p className="text-2xl font-bold font-heading text-teal mt-1">
            {available}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-teal/15 border border-teal/30 flex items-center justify-center text-teal">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* Under Contract / Closed */}
      <div className="bg-card border border-border/70 rounded-xl p-4.5 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Closed / Booked
          </p>
          <p className="text-2xl font-bold font-heading text-info mt-1">
            {closed}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-info/15 border border-info/30 flex items-center justify-center text-info">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>

      {/* Total Inventory Submissions */}
      <div className="bg-card border border-border/70 rounded-xl p-4.5 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Inventory
          </p>
          <p className="text-2xl font-bold font-heading text-foreground mt-1">
            {total}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-muted border border-border flex items-center justify-center text-foreground">
          <Building2 className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default ApprovedStats;
