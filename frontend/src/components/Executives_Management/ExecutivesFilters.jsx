import React from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from "@/components/ui/button";

const ExecutivesFilters = ({ search, setSearch, statusFilter, setStatusFilter, viewMode, setViewMode }) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 border-b border-border/70 bg-slate-50/40">
      <div className="relative w-full sm:max-w-xs md:max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <Input
          placeholder="Search staff by name or email..."
          className="pl-9 pr-4 bg-muted/40 border border-border/70 rounded-full h-10 text-sm focus-visible:ring-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2.5 flex-wrap justify-between sm:justify-end">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 rounded-full h-10 border border-border/70 bg-background text-xs sm:text-sm font-medium shadow-2xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="p-1 rounded-xl shadow-lg border border-border/70">
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex bg-slate-100 p-0.5 rounded-full border border-border/70 shadow-2xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("list")}
            className={`rounded-full h-8 px-3 text-xs font-semibold transition-all ${
              viewMode === "list"
                ? "bg-white shadow-2xs text-slate-900"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <List className="w-3.5 h-3.5 mr-1.5" /> List
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("grid")}
            className={`rounded-full h-8 px-3 text-xs font-semibold transition-all ${
              viewMode === "grid"
                ? "bg-white shadow-2xs text-slate-900"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 mr-1.5" /> Grid
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExecutivesFilters;

