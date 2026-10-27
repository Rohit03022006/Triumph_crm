import React from 'react';
import { useNavigate } from 'react-router';

const SettingsHeader = () => {
  const navigate = useNavigate();
  const isAdmin = window.location.pathname.startsWith("/admin");

  return (
    <div className="flex flex-col gap-1 pb-2 border-b border-border/70">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
        <span
          className="cursor-pointer hover:text-slate-900 transition-colors"
          onClick={() => navigate(isAdmin ? "/admin" : "/executive")}
        >
          Dashboard
        </span>
        <span>›</span>
        <span className="font-bold text-slate-800">Settings</span>
      </div>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight">
          Account Settings
        </h1>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          Preferences
        </span>
      </div>
      <p className="text-sm text-slate-500 mt-0.5">
        Manage personal credentials, preferences, and security settings.
      </p>
    </div>
  );
};

export default SettingsHeader;
