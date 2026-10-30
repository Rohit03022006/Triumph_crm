import React from "react";
import { Search, RotateCcw, Clock, CheckCircle2, ListFilter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const DEAL_TYPES = [
  { value: "ALL", label: "All Deal Types" },
  { value: "BOOKING", label: "Primary Booking" },
  { value: "RETRADE", label: "Resale Retrade" },
  { value: "LEASE", label: "Commercial Lease" },
];

const ApprovedFilters = ({
  search,
  setSearch,
  statusTab,
  setStatusTab,
  dealTypeFilter,
  setDealTypeFilter,
  pendingCount = 0,
  onReset,
}) => {
  const isFiltered = Boolean(
    search || dealTypeFilter !== "ALL" || statusTab !== "UNDER_REVIEW"
  );

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 border-b border-border/70 bg-card rounded-t-xl">
      {/* Search & Deal Type Filters */}
      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        <div className="relative flex-1">
          <Input
            placeholder="Search title, project, executive..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 h-9.5 text-sm bg-muted/40 border border-border/70 rounded-lg text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
          />
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <select
          value={dealTypeFilter}
          onChange={(e) => setDealTypeFilter(e.target.value)}
          className="h-9.5 px-3 rounded-lg border border-border/70 bg-card text-foreground text-xs sm:text-sm font-medium outline-none cursor-pointer hover:border-input transition-colors"
        >
          {DEAL_TYPES.map((dt) => (
            <option key={dt.value} value={dt.value}>
              {dt.label}
            </option>
          ))}
        </select>

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="group h-9.5 px-3 text-xs sm:text-sm text-destructive hover:text-destructive/80 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5 transition-transform duration-500 group-hover:-rotate-180" /> Reset
          </Button>
        )}
      </div>

      {/* Status Segmented Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-lg border border-border/70 self-start">
        <button
          type="button"
          onClick={() => setStatusTab("UNDER_REVIEW")}
          className={`px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            statusTab === "UNDER_REVIEW"
              ? "bg-card text-foreground shadow-2xs border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber" />
          <span>Pending Review</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setStatusTab("AVAILABLE")}
          className={`px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            statusTab === "AVAILABLE"
              ? "bg-card text-foreground shadow-2xs border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-teal" />
          <span>Approved & Live</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusTab("ALL")}
          className={`px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            statusTab === "ALL"
              ? "bg-card text-foreground shadow-2xs border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ListFilter className="w-3.5 h-3.5 text-muted-foreground" />
          <span>All Submissions</span>
        </button>
      </div>
    </div>
  );
};

export default ApprovedFilters;
