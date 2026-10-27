import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchInventoryMetrics } from "@/api/inventory";
import ApprovedHeader from "@/components/Approved_Management/ApprovedHeader";
import LeadsApprovedCard from "@/components/Approved_Management/LeadsApprovedCard";
import PropertyApprovedCard from "@/components/Approved_Management/PropertyApprovedCard";

const Approved = () => {
  const { data: metrics, isFetching, refetch } = useQuery({
    queryKey: ["inventoryMetrics"],
    queryFn: fetchInventoryMetrics,
    staleTime: 60 * 1000,
  });

  const pendingCount =
    metrics?.byStatus?.find((s) => s.status === "UNDER_REVIEW")?._count || 0;

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 pb-12 overflow-x-hidden">
      <ApprovedHeader
        pendingCount={pendingCount}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
      />

      {/* 2-Column Overview Layout: Left (Leads) & Right (Properties) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch w-full min-w-0">
        {/* Left Column: Leads Approvals */}
        <div className="min-w-0 w-full flex flex-col">
          <LeadsApprovedCard />
        </div>

        {/* Right Column: Property Approvals Dashboard */}
        <div className="min-w-0 w-full flex flex-col">
          <PropertyApprovedCard pendingCount={pendingCount} />
        </div>
      </div>
    </div>
  );
};

export default Approved;
