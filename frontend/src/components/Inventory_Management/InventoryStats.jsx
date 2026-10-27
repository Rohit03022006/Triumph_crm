import React from "react";
import { Building2, Layers, Home, Key, CheckCircle2 } from "lucide-react";
import StatCard from "../Executives_Management/StatCard";

const InventoryStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6 sm:mb-8">
      <StatCard
        title="TOTAL PROPERTIES"
        value={stats?.total ?? 0}
        icon={Building2}
        colorClass="bg-info/10 border-info/30"
        iconBgClass="bg-info/20"
        iconTextClass="text-info"
      />
      <StatCard
        title="BOOKING (NEW)"
        value={stats?.booking ?? 0}
        icon={Layers}
        colorClass="bg-primary/10 border-primary/30"
        iconBgClass="bg-primary/20"
        iconTextClass="text-primary"
      />
      <StatCard
        title="RETRADE (RESALE)"
        value={stats?.retrade ?? 0}
        icon={Home}
        colorClass="bg-warning/10 border-warning/30"
        iconBgClass="bg-warning/20"
        iconTextClass="text-warning"
      />
      <StatCard
        title="LEASE (RENTAL)"
        value={stats?.lease ?? 0}
        icon={Key}
        colorClass="bg-success/10 border-success/30"
        iconBgClass="bg-success/20"
        iconTextClass="text-success"
      />
      <StatCard
        title="AVAILABLE UNITS"
        value={stats?.available ?? 0}
        icon={CheckCircle2}
        colorClass="bg-purple/10 border-purple/30"
        iconBgClass="bg-purple/20"
        iconTextClass="text-purple"
      />
    </div>
  );
};

export default InventoryStats;

