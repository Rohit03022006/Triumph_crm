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
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            <span
              className="cursor-pointer hover:text-foreground transition-colors"
              onClick={() => navigate("/admin")}
            >
              Dashboard
            </span>
            <span>›</span>
            <span
              className="cursor-pointer hover:text-foreground transition-colors"
              onClick={() => navigate("/admin/approved")}
            >
              Approvals & Review
            </span>
            <span>›</span>
            <span className="font-bold text-foreground">
              Property Approvals
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground tracking-tight">
              Property Approvals & Review
            </h1>
            {pendingCount > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                {pendingCount} Pending Review
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                All Up to Date
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground mt-1">
            Complete management of property submissions from executives. Review
            specifications, approve to publish live, or request revisions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/approved")}
            className="bg-card border-border text-foreground hover:bg-muted hover:text-foreground font-semibold text-xs sm:text-sm h-10 px-3.5 shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Approvals</span>
          </Button>

          <Button
            onClick={handleRefresh}
            disabled={isSpinning}
            variant="outline"
            className="group bg-card border-border text-foreground hover:bg-muted hover:text-foreground active:scale-95 transition-all font-semibold text-xs sm:text-sm h-10 px-4 shadow-2xs flex items-center gap-2 cursor-pointer"
            title="Refresh List"
          >
            <RotateCcw
              className={`w-4 h-4 text-muted-foreground transition-transform duration-700 ${
                isSpinning ? "animate-spin text-primary" : "group-hover:-rotate-180"
              }`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Full-width Approved List */}
      <ApprovedList />
    </div>
  );
};

export default PropertyApprovedPage;
