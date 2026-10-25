import React from 'react';

const StatCard = ({ title, value, icon: Icon, colorClass, iconBgClass, iconTextClass }) => (
  <div className={`relative p-5 rounded-xl border shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex items-center justify-between ${colorClass}`}>
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-foreground">{value}</h3>
    </div>
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-inner ${iconBgClass} ${iconTextClass}`}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

export default StatCard;

