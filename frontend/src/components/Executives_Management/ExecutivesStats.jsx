import React from 'react';
import StatCard from './StatCard';
import { Users, CheckCircle2, Hourglass, UserMinus } from 'lucide-react';

const ExecutivesStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="TOTAL STAFF"
        value={stats.total}
        icon={Users}
        colorClass="bg-info/10 border-info/30"
        iconBgClass="bg-info/20"
        iconTextClass="text-info"
      />
      <StatCard
        title="ACTIVE"
        value={stats.active}
        icon={CheckCircle2}
        colorClass="bg-success/10 border-success/30"
        iconBgClass="bg-success/20"
        iconTextClass="text-success"
      />
      <StatCard
        title="PENDING APPROVAL"
        value={stats.pending}
        icon={Hourglass}
        colorClass="bg-warning/10 border-warning/30"
        iconBgClass="bg-warning/20"
        iconTextClass="text-warning"
      />
      <StatCard
        title="INACTIVE"
        value={stats.leave}
        icon={UserMinus}
        colorClass="bg-purple/10 border-purple/30"
        iconBgClass="bg-purple/20"
        iconTextClass="text-purple"
      />
    </div>
  );
};

export default ExecutivesStats;
