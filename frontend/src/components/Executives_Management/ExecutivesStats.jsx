import React from 'react';
import StatCard from './StatCard';
import { Users, CheckCircle2, Hourglass, UserMinus } from 'lucide-react';

const ExecutivesStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
      <StatCard
        title="TOTAL STAFF"
        value={stats.total}
        icon={Users}
        iconBgClass="bg-blue-50 border border-blue-100"
        iconTextClass="text-blue-600"
      />
      <StatCard
        title="ACTIVE"
        value={stats.active}
        icon={CheckCircle2}
        iconBgClass="bg-emerald-50 border border-emerald-100"
        iconTextClass="text-emerald-600"
      />
      <StatCard
        title="PENDING APPROVAL"
        value={stats.pending}
        icon={Hourglass}
        iconBgClass="bg-amber-50 border border-amber-100"
        iconTextClass="text-amber-600"
      />
      <StatCard
        title="INACTIVE"
        value={stats.leave}
        icon={UserMinus}
        iconBgClass="bg-purple/10 border border-purple/20"
        iconTextClass="text-purple"
      />
    </div>
  );
};

export default ExecutivesStats;
