import React from "react";
import { Building2, Layers, Home, Key, CheckCircle2 } from "lucide-react";
import StatCard from "../Executives_Management/StatCard";

const InventoryStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      <StatCard
        title="TOTAL PROPERTIES"
        value={stats?.total ?? 0}
        icon={Building2}
        iconBgClass="bg-blue-50 border border-blue-100"
        iconTextClass="text-blue-600"
      />
      <StatCard
        title="BOOKING (NEW)"
        value={stats?.booking ?? 0}
        icon={Layers}
        iconBgClass="bg-sky-50 border border-sky-100"
        iconTextClass="text-sky-600"
      />
      <StatCard
        title="RETRADE (RESALE)"
        value={stats?.retrade ?? 0}
        icon={Home}
        iconBgClass="bg-amber-50 border border-amber-100"
        iconTextClass="text-amber-600"
      />
      <StatCard
        title="LEASE (RENTAL)"
        value={stats?.lease ?? 0}
        icon={Key}
        iconBgClass="bg-emerald-50 border border-emerald-100"
        iconTextClass="text-emerald-600"
      />
      <StatCard
        title="AVAILABLE UNITS"
        value={stats?.available ?? 0}
        icon={CheckCircle2}
        iconBgClass="bg-purple/10 border border-purple/20"
        iconTextClass="text-purple"
      />
    </div>
  );
};

export default InventoryStats;

