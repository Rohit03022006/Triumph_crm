import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

const ExecutivesFilters = ({ search, setSearch, statusFilter, setStatusFilter, viewMode, setViewMode }) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border-b border-border/60">
      <div className="relative w-full md:max-w-sm">
        <Input
          placeholder="Search staff..."
          className="pl-9 bg-muted/50 border-b border-border/60order rounded-full h-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search className="absolute right-3 top-1/2 h-4  w-4  -translate-y-1/2 text-muted-foreground"/>
      </div>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-35 rounded-full h-10 border-b border-border/60order bg-background">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="p-2">
          <SelectItem value="ALL">All Status</SelectItem>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="INACTIVE">Inactive</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex bg-muted/50 p-1 rounded-full border border-border">
        <Button variant="ghost" size="sm" onClick={() => setViewMode("list")} className={`rounded-full h-8 px-3 ${viewMode === "list" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}><List className="w-4 h-4 mr-2" /> List</Button>
        <Button variant="ghost" size="sm" onClick={() => setViewMode("grid")} className={`rounded-full h-8 px-3 ${viewMode === "grid" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}><LayoutGrid className="w-4 h-4 mr-2" /> Grid</Button>
      </div>
    </div>
  );
};

export default ExecutivesFilters;

