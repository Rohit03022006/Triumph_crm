import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, CheckCircle2, Building2, Clock } from "lucide-react";
import StatCard from "@/components/Executives_Management/StatCard";
import { fetchInventoryMetrics } from "@/api/inventory";

const DashboardStats = () => {
  // Query existing real inventory metrics
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["inventoryMetrics"],
    queryFn: fetchInventoryMetrics,
    staleTime: 60 * 1000,
  });

  const totalInventory = metrics?.total ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
      {/* 1. Total Leads */}
      <StatCard
        title="TOTAL LEADS"
        value="0"
        icon={Users}
        iconBgClass="bg-blue-50 border border-blue-100"
        iconTextClass="text-blue-600"
      />

      {/* 2. Closed Leads */}
      <StatCard
        title="CLOSED LEADS"
        value="0"
        icon={CheckCircle2}
        iconBgClass="bg-emerald-50 border border-emerald-100"
        iconTextClass="text-emerald-600"
      />

      {/* 3. Live Inventory Count */}
      <StatCard
        title="INVENTORY COUNT"
        value={isLoading ? "..." : String(totalInventory)}
        icon={Building2}
        iconBgClass="bg-sky-50 border border-sky-100"
        iconTextClass="text-sky-600"
      />

      {/* 4. Reminders Due */}
      <StatCard
        title="REMINDERS DUE"
        value="0"
        icon={Clock}
        iconBgClass="bg-amber-50 border border-amber-100"
        iconTextClass="text-amber-600"
      />
    </div>
  );
};

export default DashboardStats;
