import React from "react";
import { Search, LayoutGrid, List, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SORT_OPTIONS = [
  { label: "Newest Added (Newest first)", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Area (Sq. Ft.): Low to High", value: "area_asc" },
  { label: "Area (Sq. Ft.): High to Low", value: "area_desc" },
];

const InventoryFilters = ({
  search,
  setSearch,
  dealTypeFilter,
  setDealTypeFilter,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  onReset,
}) => {
  const isFiltered = Boolean(
    search || dealTypeFilter !== "ALL" || categoryFilter !== "ALL" || statusFilter !== "ALL" || sortBy !== "newest"
  );

  return (
    <div className="flex flex-col xl:flex-row items-center justify-between gap-4 p-4 border-b border-border/60">
      {/* Search Input matching ExecutivesFilters */}
      <div className="relative w-full xl:max-w-sm">
        <Input
          placeholder="Search properties, developers, locations..."
          className="pl-9 pr-9 bg-muted/50 border border-border/60 rounded-full h-10 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>

      {/* Filter Selects & Controls */}
      <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-start xl:justify-end">
        {/* Deal Type Dropdown */}
        <select
          value={dealTypeFilter}
          onChange={(e) => setDealTypeFilter(e.target.value)}
          aria-label="Filter by deal type"
          className="rounded-full h-10 px-4 text-sm font-medium border border-border/60 bg-background text-foreground outline-none cursor-pointer hover:border-border transition-colors"
        >
          <option value="ALL">All Deal Types</option>
          <option value="BOOKING">Booking (New)</option>
          <option value="RETRADE">Retrade (Resale)</option>
          <option value="LEASE">Lease (Rental)</option>
        </select>

        {/* Category Dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filter by category"
          className="rounded-full h-10 px-4 text-sm font-medium border border-border/60 bg-background text-foreground outline-none cursor-pointer hover:border-border transition-colors"
        >
          <option value="ALL">All Categories</option>
          <option value="Residential">Residential</option>
          <option value="Commercial">Commercial</option>
          <option value="Other">Other</option>
        </select>

        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
          className="rounded-full h-10 px-4 text-sm font-medium border border-border/60 bg-background text-foreground outline-none cursor-pointer hover:border-border transition-colors"
        >
          <option value="ALL">All Status</option>
          <option value="AVAILABLE">Available</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="SOLD">Sold</option>
          <option value="RENT_OUT">Rented Out</option>
          <option value="LOST">Lost</option>
        </select>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort properties by"
          className="rounded-full h-10 px-4 text-sm font-medium border border-border/60 bg-background text-foreground outline-none cursor-pointer hover:border-border transition-colors"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Reset button if filtered */}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="group rounded-full h-10 px-3.5 text-sm text-red-500 hover:text-red-800 active:scale-95 transition-all"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4 mr-1.5 transition-transform duration-500 group-hover:-rotate-180" /> Reset
          </Button>
        )}

        {/* View Mode Toggle matching ExecutivesFilters */}
        <div className="flex bg-muted/50 p-1 rounded-full border border-border ml-auto xl:ml-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("list")}
            className={`rounded-full h-8 px-3.5 text-sm font-medium ${
              viewMode === "list"
                ? "bg-white shadow-sm text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="w-4 h-4 mr-2" /> List
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("grid")}
            className={`rounded-full h-8 px-3.5 text-sm font-medium ${
              viewMode === "grid"
                ? "bg-white shadow-sm text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="w-4 h-4 mr-2" /> Grid
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InventoryFilters;
