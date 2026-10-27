import React from "react";
import { useNavigate } from "react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const ExecutivesHeader = ({ onAddClick }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4 pb-2 border-b border-border/70">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          <span
            className="cursor-pointer hover:text-slate-900 transition-colors"
            onClick={() => navigate("/admin")}
          >
            Dashboard
          </span>
          <span>›</span>
          <span className="font-bold text-slate-800">Staff Management</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight">
          Staff & Executive Management
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage system users, executive assignments, approval rights, and security roles.
        </p>
      </div>

      <div className="shrink-0">
        <Button
          onClick={onAddClick}
          className="bg-primary hover:bg-brand-dark text-primary-foreground font-semibold text-xs sm:text-sm h-10 px-4 shadow-2xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </Button>
      </div>
    </div>
  );
};

export default ExecutivesHeader;
