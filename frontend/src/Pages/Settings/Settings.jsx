import React from "react";
import { useNavigate } from "react-router";
import SettingsPanel from "@/components/Admin_Management/SettingsPanel";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 pb-12">
      {/* Header & Breadcrumbs */}
      <div className="pb-2 border-b border-border/70">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          <span
            className="cursor-pointer hover:text-slate-900 transition-colors"
            onClick={() => navigate("/admin")}
          >
            Dashboard
          </span>
          <span>›</span>
          <span className="font-bold text-slate-800">System Resources</span>
        </div>

        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight">
            System Resources & Taxonomy
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            Admin Controls
          </span>
        </div>

        <p className="text-sm text-slate-500 mt-1">
          Configure global taxonomy for lead acquisition sources, property categories, and pipeline progress stages.
        </p>
      </div>

      <SettingsPanel />
    </div>
  );
};

export default Settings;
