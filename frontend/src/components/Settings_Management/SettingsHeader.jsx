import React from 'react';
import { useNavigate } from 'react-router';

const SettingsHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col mb-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <span className="cursor-pointer hover:text-foreground" onClick={() => navigate(window.location.pathname.startsWith("/admin") ? "/admin" : "/executive")}>
          Dashboard
        </span>
        <span>›</span>
        <span className="font-medium text-foreground">Settings</span>
      </div>
      <h2 className="text-3xl font-heading font-bold text-slate-800 tracking-tight">Settings</h2>
    </div>
  );
};

export default SettingsHeader;
