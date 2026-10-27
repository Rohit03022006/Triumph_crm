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
      <div className="bg-white border border-amber-200/80 rounded-xl p-4.5 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            Pending Review
          </p>
          <p className="text-2xl font-bold font-heading text-amber-600 mt-1">
            {underReview}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      {/* Approved & Available */}
      <div className="bg-white border border-border/70 rounded-xl p-4.5 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Approved & Available
          </p>
          <p className="text-2xl font-bold font-heading text-emerald-600 mt-1">
            {available}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* Under Contract / Closed */}
      <div className="bg-white border border-border/70 rounded-xl p-4.5 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Closed / Booked
          </p>
          <p className="text-2xl font-bold font-heading text-blue-600 mt-1">
            {closed}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>

      {/* Total Inventory Submissions */}
      <div className="bg-white border border-border/70 rounded-xl p-4.5 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Inventory
          </p>
          <p className="text-2xl font-bold font-heading text-slate-900 mt-1">
            {total}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
          <Building2 className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default ApprovedStats;

