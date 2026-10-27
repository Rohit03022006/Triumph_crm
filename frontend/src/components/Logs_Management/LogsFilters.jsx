import React from "react";
import { Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const LogsFilters = ({
  search,
  setSearch,
  actionFilter,
  setActionFilter,
  dealTypeFilter,
  setDealTypeFilter,
  dateFilter,
  setDateFilter,
  onReset,
}) => {
  const isFiltered = Boolean(
    search ||
    actionFilter !== "ALL" ||
    dealTypeFilter !== "ALL" ||
    dateFilter !== "ALL"
  );

  return (
    <div className="bg-white border border-border/70 rounded-xl p-3 sm:p-4 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 w-full">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px] max-w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search by property, executive, or change summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 rounded-full h-10 text-sm bg-muted/40 border-border/70 w-full focus-visible:ring-1"
          />
        </div>

        {/* Filter Dropdowns & Reset in the Same Line */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            aria-label="Filter by action"
            className="rounded-full h-10 px-3.5 text-sm font-medium border border-border/70 bg-background text-foreground cursor-pointer outline-none hover:border-slate-400 transition-colors"
          >
            <option value="ALL">All Actions</option>
            <option value="STATUS_CHANGE">Status Changes</option>
            <option value="UPDATE">Field Updates</option>
            <option value="CREATE">Properties Created</option>
            <option value="DELETE">Properties Deleted</option>
            <option value="UNIT_UPDATE">Unit Updates</option>
          </select>

          {/* Deal Type Filter */}
          <select
            value={dealTypeFilter}
            onChange={(e) => setDealTypeFilter(e.target.value)}
            aria-label="Filter by deal type"
            className="rounded-full h-10 px-3.5 text-sm font-medium border border-border/70 bg-background text-foreground cursor-pointer outline-none hover:border-slate-400 transition-colors"
          >
            <option value="ALL">All Deal Types</option>
            <option value="BOOKING">Booking</option>
            <option value="RETRADE">Retrade</option>
            <option value="LEASE">Lease</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            aria-label="Filter by date range"
            className="rounded-full h-10 px-3.5 text-sm font-medium border border-border/70 bg-background text-foreground cursor-pointer outline-none hover:border-slate-400 transition-colors"
          >
            <option value="ALL">All Time</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>

          {/* Reset Filters */}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={onReset}
              className="group rounded-full h-10 px-3 text-sm text-red-500 hover:text-red-900 active:scale-95 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 transition-transform duration-500 group-hover:-rotate-180" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsFilters;
