import React from "react";
import { useNavigate, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { History, Plus } from "lucide-react";

const InventoryHeader = ({ onAddClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const logsPath = "/admin/logs";

  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span
            className="cursor-pointer hover:text-foreground"
            onClick={() => navigate(isAdmin ? "/admin" : "/executive")}
          >
            Dashboard
          </span>
          <span>›</span>
          <span className="font-medium text-foreground">
            Inventory Management
          </span>
        </div>
        <h2 className="text-3xl font-heading font-bold text-slate-800 tracking-tight">
          Inventory Management
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={onAddClick}
          className="bg-primary hover:bg-brand-dark text-primary-foreground font-semibold text-sm h-10 px-4"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Inventory
        </Button>
      </div>
    </div>
  );
};

export default InventoryHeader;
