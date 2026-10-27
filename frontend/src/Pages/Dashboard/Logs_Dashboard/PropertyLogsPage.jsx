import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Building2,
  RotateCcw,
} from "lucide-react";

import { fetchLogs } from "@/api/logs";
import { Button } from "@/components/ui/button";

import LogsFilters from "@/components/Logs_Management/LogsFilters";
import LogsTable from "@/components/Logs_Management/LogsTable";
import LogDiffDialog from "@/components/Logs_Management/LogDiffDialog";

const PropertyLogsPage = () => {
  const navigate = useNavigate();
  const [spinning, setSpinning] = useState(false);

  // Filters State
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [dealTypeFilter, setDealTypeFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Selected Log for Diff Modal
  const [selectedLog, setSelectedLog] = useState(null);

  // Query Paginated Logs
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: [
      "audit-logs",
      { page: currentPage, search, actionFilter, dealTypeFilter, dateFilter },
    ],
    queryFn: () => {
      const params = {
        page: currentPage,
        limit: 15,
        search: search.trim() || undefined,
        action: actionFilter !== "ALL" ? actionFilter : undefined,
        dealType: dealTypeFilter !== "ALL" ? dealTypeFilter : undefined,
      };

      if (dateFilter === "today") {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        params.startDate = start.toISOString();
      } else if (dateFilter === "7days") {
        const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        params.startDate = start.toISOString();
      } else if (dateFilter === "30days") {
        const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        params.startDate = start.toISOString();
      }

      return fetchLogs(params);
    },
    keepPreviousData: true,
  });

  const handleRefresh = async () => {
    if (spinning || isFetching) return;
    setSpinning(true);
    try {
      await refetch();
    } finally {
      setTimeout(() => {
        setSpinning(false);
      }, 700);
    }
  };

  const isSpinning = spinning || isFetching;

  const logs = data?.logs || [];
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  };

  const handleResetFilters = () => {
    setSearch("");
    setActionFilter("ALL");
    setDealTypeFilter("ALL");
    setDateFilter("ALL");
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    search ||
      actionFilter !== "ALL" ||
      dealTypeFilter !== "ALL" ||
      dateFilter !== "ALL"
  );

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 pb-16 overflow-x-hidden">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2 font-medium">
            <span
              className="cursor-pointer hover:text-slate-900 transition-colors"
              onClick={() => navigate("/admin")}
            >
              Dashboard
            </span>
            <span>›</span>
            <span
              className="cursor-pointer hover:text-slate-900 transition-colors"
              onClick={() => navigate("/admin/logs")}
            >
              Audit Logs
            </span>
            <span>›</span>
            <span className="font-semibold text-slate-800">
              Property Audit Logs
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight">
              Property Audit Logs
            </h1>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold">
              {pagination.total} Records
            </span>
          </div>

          <p className="text-sm text-slate-500 mt-1">
            Complete full-page audit trail of every property change, field edit,
            status update, approval, and executive action.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/logs")}
            className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm h-10 px-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Logs Dashboard
          </Button>

          <Button
            onClick={handleRefresh}
            disabled={isSpinning}
            variant="outline"
            className="group bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition-all font-medium text-sm h-10 px-4 shadow-2xs"
            title="Refresh List"
          >
            <RotateCcw
              className={`w-4 h-4 text-slate-600 transition-transform duration-700 ${
                isSpinning ? "animate-spin text-primary" : "group-hover:-rotate-180"
              }`}
            />
            <span className="ml-2 hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Full-width Filters Bar */}
      <LogsFilters
        search={search}
        setSearch={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        actionFilter={actionFilter}
        setActionFilter={(val) => {
          setActionFilter(val);
          setCurrentPage(1);
        }}
        dealTypeFilter={dealTypeFilter}
        setDealTypeFilter={(val) => {
          setDealTypeFilter(val);
          setCurrentPage(1);
        }}
        dateFilter={dateFilter}
        setDateFilter={(val) => {
          setDateFilter(val);
          setCurrentPage(1);
        }}
        onReset={handleResetFilters}
      />

      {/* Full-width Audit Logs Table */}
      <LogsTable
        logs={logs}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        onSelectLog={setSelectedLog}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
      />

      {/* Full-width Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border border-border/70 rounded-xl shadow-xs text-sm">
          <div className="text-xs text-slate-500">
            Showing Page{" "}
            <span className="font-semibold text-slate-800">
              {pagination.page}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-800">
              {pagination.totalPages}
            </span>{" "}
            ({pagination.total} total changes)
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="h-8 px-3 text-xs font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(pagination.totalPages, p + 1)
                )
              }
              disabled={currentPage >= pagination.totalPages}
              className="h-8 px-3 text-xs font-medium"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Inspect Diff Modal */}
      <LogDiffDialog
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
};

export default PropertyLogsPage;

