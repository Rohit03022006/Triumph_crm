import React from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';

const ExecutivesHeader = ({ onAddClick }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span
            className="cursor-pointer hover:text-foreground"
            onClick={() => navigate("/admin")}
          >
            Dashboard
          </span>
          <span>›</span>
          <span className="font-medium text-foreground">Staff Management</span>
        </div>
        <h2 className="text-3xl font-heading font-bold text-slate-800 tracking-tight">
          Staff Management
        </h2>
      </div>

      <Button
        onClick={onAddClick}
        className="bg-primary hover:bg-brand-dark text-primary-foreground"
      >
        + Add Staff
      </Button>

  
    </div>
  );
};

export default ExecutivesHeader;

