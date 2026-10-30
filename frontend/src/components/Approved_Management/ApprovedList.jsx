import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProperties,
  fetchInventoryMetrics,
  approveProperty,
  rejectProperty,
} from "@/api/inventory";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

import ApprovedFilters from "./ApprovedFilters";
import ApprovedTable from "./ApprovedTable";
import ReviewActionDialog from "./ReviewActionDialog";

const ApprovedList = () => {
  const queryClient = useQueryClient();

  const [statusTab, setStatusTab] = useState("UNDER_REVIEW");
  const [dealTypeFilter, setDealTypeFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewModalProperty, setReviewModalProperty] = useState(null);

  // Fetch Inventory Metrics for stats
  const { data: metrics } = useQuery({
    queryKey: ["inventoryMetrics"],
    queryFn: fetchInventoryMetrics,
    staleTime: 60 * 1000,
  });

  // Calculate stats from metrics
  const stats = {
    underReview: metrics?.byStatus?.find((s) => s.status === "UNDER_REVIEW")?._count || 0,
    available: metrics?.byStatus?.find((s) => s.status === "AVAILABLE")?._count || 0,
    closed:
      (metrics?.byStatus?.find((s) => s.status === "BOOKED")?._count || 0) +
      (metrics?.byStatus?.find((s) => s.status === "SOLD")?._count || 0) +
      (metrics?.byStatus?.find((s) => s.status === "RENT_OUT")?._count || 0),
    total: metrics?.totalProperties || 0,
  };

  // Query properties based on active review filter
  const queryParams = {
    page: currentPage,
    limit: 12,
    sortBy: "newest",
    ...(statusTab !== "ALL" && { status: statusTab }),
    ...(dealTypeFilter !== "ALL" && { dealType: dealTypeFilter }),
    ...(search.trim() && { search: search.trim() }),
  };

  const {
    data: propertyData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["approvedProperties", queryParams],
    queryFn: () => fetchProperties(queryParams),
    keepPreviousData: true,
  });

  const properties = propertyData?.properties || [];
  const pagination = propertyData?.pagination || {
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  };

  // Approve Mutation
  const approveMut = useMutation({
    mutationFn: (id) => approveProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvedProperties"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryProperties"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryMetrics"] });
      queryClient.invalidateQueries({ queryKey: ["auditLogs"] });
      toast.success(
        "Property Approved!",
        "Listing marked as AVAILABLE and published across the CRM."
      );
    },
    onError: (err) => {
      toast.error("Failed to approve property", err.message || "Please try again");
    },
  });

  // Reject / Revision Mutation
  const rejectMut = useMutation({
    mutationFn: ({ id, reason }) => rejectProperty(id, reason),
    onSuccess: () => {
      setReviewModalProperty(null);
      queryClient.invalidateQueries({ queryKey: ["approvedProperties"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryProperties"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryMetrics"] });
      queryClient.invalidateQueries({ queryKey: ["auditLogs"] });
      toast.info("Status Updated", "Revision feedback sent to executive and logged.");
    },
    onError: (err) => {
      toast.error("Failed to submit feedback", err.message || "Please try again");
    },
  });

  const handleApprove = (id) => {
    approveMut.mutate(id);
  };

  const handleRequestRevision = (property) => {
    setReviewModalProperty(property);
  };

  const handleSubmitFeedback = (id, reason) => {
    rejectMut.mutate({ id, reason });
  };

  const handleResetFilters = () => {
    setSearch("");
    setDealTypeFilter("ALL");
    setStatusTab("UNDER_REVIEW");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Main Table Container */}
      <div className="shadow-xs rounded-xl">
        {/* Filters & Segmented Tabs */}
        <ApprovedFilters
          search={search}
          setSearch={(v) => {
            setSearch(v);
            setCurrentPage(1);
          }}
          statusTab={statusTab}
          setStatusTab={(tab) => {
            setStatusTab(tab);
            setCurrentPage(1);
          }}
          dealTypeFilter={dealTypeFilter}
          setDealTypeFilter={(dt) => {
            setDealTypeFilter(dt);
            setCurrentPage(1);
          }}
          pendingCount={stats.underReview}
          onReset={handleResetFilters}
        />

        {/* Submissions Table */}
        <ApprovedTable
          properties={properties}
          isLoading={isLoading}
          onApprove={handleApprove}
          onRequestRevision={handleRequestRevision}
          isActionPending={approveMut.isPending || rejectMut.isPending}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-card border border-t-0 border-border/70 rounded-b-xl text-sm text-muted-foreground">
            <div>
              Showing{" "}
              <span className="font-semibold text-foreground">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-foreground">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {pagination.total}
              </span>{" "}
              submissions
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-8 px-3 text-xs bg-card border-border text-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Previous
              </Button>

              <span className="text-xs font-semibold px-2 text-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                className="h-8 px-3 text-xs bg-card border-border text-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Revision Feedback Dialog */}
      {reviewModalProperty && (
        <ReviewActionDialog
          isOpen={Boolean(reviewModalProperty)}
          onClose={() => setReviewModalProperty(null)}
          property={reviewModalProperty}
          onSubmitFeedback={handleSubmitFeedback}
          isPending={rejectMut.isPending}
        />
      )}
    </div>
  );
};

export default ApprovedList;
