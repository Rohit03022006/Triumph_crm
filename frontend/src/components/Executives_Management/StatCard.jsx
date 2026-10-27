import React from 'react';

const StatCard = ({ title, value, icon: Icon, colorClass, iconBgClass, iconTextClass }) => (
  <div className="relative p-5 rounded-xl border border-border/70 bg-white shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all duration-200 flex items-center justify-between group">
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{title}</p>
      <h3 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight">{value}</h3>
    </div>
    <div className={`w-11 h-11 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs ${iconBgClass || 'bg-slate-100'} ${iconTextClass || 'text-slate-700'}`}>
      <Icon className="w-5 h-5" />
    </div>
  </div>
);

export default StatCard;

