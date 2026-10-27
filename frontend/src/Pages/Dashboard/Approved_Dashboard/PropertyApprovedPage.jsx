import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { ArrowLeft, Building2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchInventoryMetrics } from "@/api/inventory";
import ApprovedList from "@/components/Approved_Management/ApprovedList";

const PropertyApprovedPage = () => {
  const navigate = useNavigate();
  const [spinning, setSpinning] = useState(false);

  const {
    data: metrics,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["inventoryMetrics"],
    queryFn: fetchInventoryMetrics,
    staleTime: 60 * 1000,
  });

  const handleRefresh = async () => {
    if (spinning || isFetching) return;
    setSpinning(true);
    try {
      await refetch();
    } finally {
      setTimeout(() => {
        setSpinning(false);
      }, 700);
    }
  };

  const isSpinning = spinning || isFetching;

  const pendingCount =
    metrics?.byStatus?.find((s) => s.status === "UNDER_REVIEW")?._count || 0;

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
              Property Approvals
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight">
              Property Approvals & Review
            </h1>
            {pendingCount > 0 ? (
              <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-xs font-bold animate-pulse">
                {pendingCount} Pending Review
              </span>
            ) : (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold">
                All Up to Date
              </span>
            )}
          </div>

          <p className="text-sm text-slate-500 mt-1">
            Complete management of property submissions from executives. Review
            specifications, approve to publish live, or request revisions.
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
            onClick={handleRefresh}
            disabled={isSpinning}
            variant="outline"
            className="group bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition-all font-medium text-sm h-10 px-4 shadow-2xs"
            title="Refresh List"
          >
            <RotateCcw
              className={`w-4 h-4 text-slate-600 transition-transform duration-700 ${
                isSpinning ? "animate-spin text-primary" : "group-hover:-rotate-180"
              }`}
            />
            <span className="ml-2 hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Full-width Approved List */}
      <ApprovedList />
    </div>
  );
};

export default PropertyApprovedPage;
