import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  RotateCcw,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Eye,
  Check,
  X,
  HelpCircle,
  Lock,
  User,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  fetchClearanceRequests,
  decideClearanceRequest,
} from "@/api/inventory";

const REASONS = [
  { value: "ALL", label: "All Reasons" },
  { value: "Client Site Visit Scheduled", label: "Site Visit Scheduled" },
  { value: "Direct Negotiation Required", label: "Direct Negotiation" },
  { value: "Documentation / Title Verification", label: "Title Verification" },
  { value: "Price & Payment Term Discussion", label: "Price Discussion" },
];

const formatDateTime = (isoStr) => {
  if (!isoStr) return { date: "—", time: "", relative: "" };
  try {
    const d = new Date(isoStr);
    const date = d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const time = d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const now = new Date();
    const diffInSeconds = Math.floor((now - d) / 1000);
    let relative = "Just now";
    if (diffInSeconds >= 60 && diffInSeconds < 3600) {
      relative = `${Math.floor(diffInSeconds / 60)}m ago`;
    } else if (diffInSeconds >= 3600 && diffInSeconds < 86400) {
      relative = `${Math.floor(diffInSeconds / 3600)}h ago`;
    } else if (diffInSeconds >= 86400) {
      relative = `${Math.floor(diffInSeconds / 86400)}d ago`;
    }

    return { date, time, relative };
  } catch {
    return { date: isoStr, time: "", relative: "" };
  }
};

const PAGE_SIZE = 10;

const RequestsApprovedPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [statusTab, setStatusTab] = useState("ALL"); // "ALL" | "PENDING" | "APPROVED" | "QUERY_ASKED" | "REJECTED"
  const [reasonFilter, setReasonFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [spinning, setSpinning] = useState(false);

  // Admin action dialog states
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogAction, setDialogAction] = useState(null); // null | "QUERY" | "REJECT"
  const [actionNotes, setActionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all clearance requests from backend
  const {
    data: allRequests = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["clearanceRequests", "all"],
    queryFn: () => fetchClearanceRequests({ all: "true" }),
    refetchInterval: 6000,
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

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return allRequests.filter((req) => {
      if (statusTab !== "ALL" && req.status !== statusTab) {
        return false;
      }
      if (reasonFilter !== "ALL" && req.reason !== reasonFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const titleMatch = (req.propertyTitle || "").toLowerCase().includes(q);
        const requesterMatch = (req.requestedBy || "").toLowerCase().includes(q);
        const emailMatch = (req.requestedByEmail || "").toLowerCase().includes(q);
        const clientMatch = (req.clientName || "").toLowerCase().includes(q);
        const reasonMatch = (req.reason || "").toLowerCase().includes(q);
        const notesMatch = (req.notes || "").toLowerCase().includes(q);
        const localityMatch = (req.locality || "").toLowerCase().includes(q);
        return (
          titleMatch ||
          requesterMatch ||
          emailMatch ||
          clientMatch ||
          reasonMatch ||
          notesMatch ||
          localityMatch
        );
      }
      return true;
    });
  }, [allRequests, statusTab, reasonFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRequests.slice(start, start + PAGE_SIZE);
  }, [filteredRequests, currentPage]);

  const pendingCount = allRequests.filter((r) => r.status === "PENDING").length;
  const approvedCount = allRequests.filter((r) => r.status === "APPROVED").length;
  const queryCount = allRequests.filter((r) => r.status === "QUERY_ASKED").length;
  const rejectedCount = allRequests.filter((r) => r.status === "REJECTED").length;

  const isFiltered = Boolean(
    search || reasonFilter !== "ALL" || statusTab !== "ALL",
  );

  const handleResetFilters = () => {
    setSearch("");
    setReasonFilter("ALL");
    setStatusTab("ALL");
    setCurrentPage(1);
  };

  // Actions
  const handleGrant = async (req) => {
    try {
      await decideClearanceRequest(req.propertyId, { action: "APPROVE" });
      queryClient.invalidateQueries({ queryKey: ["clearanceRequests"] });
      queryClient.invalidateQueries({
        queryKey: ["propertyClearance", req.propertyId],
      });
      toast.success(
        "Clearance Granted",
        `Executive ${req.requestedBy} has been authorized to access seller info.`,
      );
    } catch (err) {
      toast.error("Failed to grant clearance", err.message);
    }
  };

  const handleRevoke = async (req) => {
    try {
      await decideClearanceRequest(req.propertyId, { action: "REVOKE" });
      queryClient.invalidateQueries({ queryKey: ["clearanceRequests"] });
      queryClient.invalidateQueries({
        queryKey: ["propertyClearance", req.propertyId],
      });
      toast.info(
        "Clearance Revoked",
        `Seller access revoked for ${req.propertyTitle}.`,
      );
    } catch (err) {
      toast.error("Failed to revoke", err.message);
    }
  };

  const handleOpenQuery = (req) => {
    setSelectedRequest(req);
    setDialogAction("QUERY");
    setActionNotes("");
  };

  const handleOpenReject = (req) => {
    setSelectedRequest(req);
    setDialogAction("REJECT");
    setActionNotes("");
  };

  const handleSubmitAdminAction = async (e) => {
    e.preventDefault();
    if (!selectedRequest || !dialogAction) return;
    setIsSubmitting(true);
    try {
      if (dialogAction === "QUERY") {
        if (!actionNotes.trim()) {
          toast.warning("Query Required", "Please enter your query.");
          setIsSubmitting(false);
          return;
        }
        await decideClearanceRequest(selectedRequest.propertyId, {
          action: "QUERY",
          feedback: actionNotes.trim(),
        });
        toast.success(
          "Query Sent",
          `Clarification query sent to ${selectedRequest.requestedBy}.`,
        );
      } else if (dialogAction === "REJECT") {
        await decideClearanceRequest(selectedRequest.propertyId, {
          action: "REJECT",
          feedback:
            actionNotes.trim() ||
            "Clearance request declined by Administrator.",
        });
        toast.info("Request Rejected", `Clearance request declined.`);
      }
      queryClient.invalidateQueries({ queryKey: ["clearanceRequests"] });
      queryClient.invalidateQueries({
        queryKey: ["propertyClearance", selectedRequest.propertyId],
      });
      setDialogAction(null);
      setSelectedRequest(null);
      setActionNotes("");
    } catch (err) {
      toast.error("Action failed", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 pb-16 overflow-x-hidden">
      {/* Header & Breadcrumb (Exact same UI as PropertyApprovedPage) */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span
              className="cursor-pointer hover:text-slate-900 transition-colors"
              onClick={() => navigate("/admin")}
            >
              Dashboard
            </span>
            <span>›</span>
            <span
              className="cursor-pointer hover:text-slate-900 transition-colors"
              onClick={() => navigate("/admin/approved")}
            >
              Approvals & Review
            </span>
            <span>›</span>
            <span className="font-bold text-slate-800">Clearance Requests</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight">
              Seller Clearance Requests & Approvals
            </h1>
            {pendingCount > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                {pendingCount} Pending Review
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                All Up to Date
              </span>
            )}
          </div>

          <p className="text-sm text-slate-500 mt-1">
            Audit history and management of sales executive requests to access
            confidential seller & landlord contact details.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/approved")}
            className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm h-10 px-3.5 shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Approvals</span>
          </Button>

          <Button
            onClick={handleRefresh}
            disabled={isSpinning}
            variant="outline"
            className="group bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition-all font-semibold text-xs sm:text-sm h-10 px-4 shadow-2xs flex items-center gap-2 cursor-pointer"
            title="Refresh List"
          >
            <RotateCcw
              className={`w-4 h-4 text-slate-600 transition-transform duration-700 ${
                isSpinning ? "animate-spin text-primary" : "group-hover:-rotate-180"
              }`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar (Exact same UI as ApprovedFilters.jsx) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 border border-b-0 border-border/60 bg-white rounded-t-xl">
        {/* Search & Reason Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 min-w-[220px]">
            <Input
              placeholder="Search property, executive, client..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-4 h-9.5 text-sm bg-slate-50 border-slate-200 rounded-lg"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <select
            value={reasonFilter}
            onChange={(e) => {
              setReasonFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9.5 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium outline-none cursor-pointer hover:border-slate-300"
          >
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="group h-9.5 px-3 text-xs sm:text-sm text-red-500 hover:text-red-800 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 transition-transform duration-500 group-hover:-rotate-180" />{" "}
              Reset
            </Button>
          )}
        </div>

        {/* Status Segmented Tabs (Matching ApprovedFilters) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start flex-wrap">
          <button
            type="button"
            onClick={() => {
              setStatusTab("ALL");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              statusTab === "ALL"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({allRequests.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusTab("PENDING");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusTab === "PENDING"
                ? "bg-white text-amber-900 shadow-xs border border-amber-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusTab("APPROVED");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusTab === "APPROVED"
                ? "bg-white text-emerald-900 shadow-xs border border-emerald-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Approved ({approvedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusTab("QUERY_ASKED");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusTab === "QUERY_ASKED"
                ? "bg-white text-blue-900 shadow-xs border border-blue-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>Queried ({queryCount})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusTab("REJECTED");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusTab === "REJECTED"
                ? "bg-white text-rose-900 shadow-xs border border-rose-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Declined ({rejectedCount})</span>
          </button>
        </div>
      </div>

      {/* Table (Exact same UI as ApprovedTable.jsx) */}
      <div className="bg-white rounded-b-xl border border-t-0 border-border/70 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="flex items-center justify-center py-24 bg-white">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500 font-medium">
                Loading clearance requests...
              </p>
            </div>
          </div>
        ) : paginatedRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white text-center px-4">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No Clearance Requests Found
            </h3>
            <p className="text-sm text-slate-500 max-w-md mt-1">
              There are currently no seller clearance requests matching your filter
              criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="border-b border-border/70">
                  <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider py-3.5 px-4">
                    Property & Deal
                  </TableHead>
                  <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider py-3.5 px-4">
                    Requesting Executive
                  </TableHead>
                  <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider py-3.5 px-4">
                    Purpose & Client
                  </TableHead> 
                  <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider py-3.5 px-4">
                    Date & Time
                  </TableHead>
                  <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider py-3.5 px-4">
                    Status
                  </TableHead>
                  <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider py-3.5 px-4 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedRequests.map((req) => {
                  const requesterInitial =
                    (req.requestedBy || "E").charAt(0).toUpperCase() || "E";
                  const dt = formatDateTime(req.requestedAt);
                  const isPending = req.status === "PENDING";
                  const isApproved = req.status === "APPROVED";
                  const isQueried = req.status === "QUERY_ASKED";
                  const isRejected = req.status === "REJECTED";

                  return (
                    <TableRow
                      key={req.propertyId}
                      className="hover:bg-slate-50/60 transition-colors border-b border-slate-100"
                    >
                      {/* Property & Deal */}
                      <TableCell className="py-4 px-4 align-top">
                        <div className="space-y-1">
                          <div
                            onClick={() =>
                              navigate(`/admin/inventory/${req.propertyId}`)
                            }
                            className="font-bold text-slate-900 text-sm hover:text-primary cursor-pointer line-clamp-1"
                            title={req.propertyTitle}
                          >
                            {req.propertyTitle || "Property Listing"}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500">
                            {req.dealType && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                                {req.dealType}
                              </span>
                            )}
                            {req.locality && (
                              <span className="text-slate-600 truncate max-w-[130px]">
                                {req.locality}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Requesting Executive */}
                      <TableCell className="py-4 px-4 align-top">
                        <div className="flex items-center gap-2.5"> 
                          <div>
                            <p className="font-bold text-slate-900 text-xs">
                              {req.requestedBy || "Executive"}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate max-w-35">
                              {req.requestedByEmail || "—"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Purpose & Client */}
                      <TableCell className="py-4 px-4 align-top">
                        <div className="space-y-0.5 text-xs">
                          <p className="font-semibold text-slate-800">
                            {req.reason}
                          </p>
                          {req.clientName && (
                            <p className="text-slate-600 text-[11px]">
                              Client:{" "}
                              <strong className="text-slate-800">
                                {req.clientName}
                              </strong>
                            </p>
                          )}
                          {req.notes && (
                            <p className="text-slate-500 italic text-[11px] line-clamp-2">
                              "{req.notes}"
                            </p>
                          )}
                        </div>
                      </TableCell>


                      {/* Date & Time */}
                      <TableCell className="py-4 px-4 align-top whitespace-nowrap">
                        <div className="flex flex-col text-xs space-y-0.5">
                          <span className="font-semibold text-slate-800">
                            {dt.date}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {dt.time}
                          </span>
                          {dt.relative && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              {dt.relative}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-4 px-4 align-top">
                        {isPending && (
                          <span className="px-2.5 py-1 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Pending
                          </span>
                        )}
                        {isApproved && (
                          <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Approved
                          </span>
                        )}
                        {isQueried && (
                          <span className="px-2.5 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                            Queried
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2.5 py-1 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Declined
                          </span>
                        )}
                      </TableCell>

                      {/* Actions Dropdown (Exact same UI as ApprovedTable.jsx) */}
                      <TableCell className="py-4 px-4 align-middle text-right">
                        <div
                          className="flex items-center justify-end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-slate-400 hover:text-slate-800 hover:bg-slate-100 h-8 w-8 rounded-lg cursor-pointer"
                                  title="Actions"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              }
                            />
                            <DropdownMenuContent
                              align="end"
                              className="w-48 rounded-xl shadow-lg border border-border/70 p-1 bg-white"
                            >
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(`/admin/inventory/${req.propertyId}`)
                                }
                                className="cursor-pointer font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-sm py-2 px-3 rounded-lg flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4 text-primary" />
                                <span>View Property</span>
                              </DropdownMenuItem>

                              {isPending && (
                                <>
                                  <DropdownMenuSeparator className="my-1 bg-slate-100" />
                                  <DropdownMenuItem
                                    onClick={() => handleGrant(req)}
                                    className="cursor-pointer font-semibold text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 text-sm py-2 px-3 rounded-lg flex items-center gap-2"
                                  >
                                    <Check className="w-4 h-4 text-emerald-600" />
                                    <span>Grant Clearance</span>
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() => handleOpenQuery(req)}
                                    className="cursor-pointer font-medium text-amber-700 hover:bg-amber-50 hover:text-amber-800 text-sm py-2 px-3 rounded-lg flex items-center gap-2"
                                  >
                                    <HelpCircle className="w-4 h-4 text-amber-600" />
                                    <span>Ask Query</span>
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() => handleOpenReject(req)}
                                    className="cursor-pointer font-medium text-rose-700 hover:bg-rose-50 hover:text-rose-800 text-sm py-2 px-3 rounded-lg flex items-center gap-2"
                                  >
                                    <X className="w-4 h-4 text-rose-600" />
                                    <span>Reject Request</span>
                                  </DropdownMenuItem>
                                </>
                              )}

                              {isQueried && (
                                <>
                                  <DropdownMenuSeparator className="my-1 bg-slate-100" />
                                  <DropdownMenuItem
                                    onClick={() => handleGrant(req)}
                                    className="cursor-pointer font-semibold text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 text-sm py-2 px-3 rounded-lg flex items-center gap-2"
                                  >
                                    <Check className="w-4 h-4 text-emerald-600" />
                                    <span>Grant Clearance</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleOpenQuery(req)}
                                    className="cursor-pointer font-medium text-amber-700 hover:bg-amber-50 hover:text-amber-800 text-sm py-2 px-3 rounded-lg flex items-center gap-2"
                                  >
                                    <HelpCircle className="w-4 h-4 text-amber-600" />
                                    <span>Update Query</span>
                                  </DropdownMenuItem>
                                </>
                              )}

                              {isApproved && (
                                <>
                                  <DropdownMenuSeparator className="my-1 bg-slate-100" />
                                  <DropdownMenuItem
                                    onClick={() => handleRevoke(req)}
                                    className="cursor-pointer font-medium text-rose-700 hover:bg-rose-50 hover:text-rose-800 text-sm py-2 px-3 rounded-lg flex items-center gap-2"
                                  >
                                    <Lock className="w-4 h-4 text-rose-600" />
                                    <span>Revoke Access</span>
                                  </DropdownMenuItem>
                                </>
                              )}

                              {isRejected && (
                                <>
                                  <DropdownMenuSeparator className="my-1 bg-slate-100" />
                                  <DropdownMenuItem
                                    onClick={() => handleGrant(req)}
                                    className="cursor-pointer font-semibold text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 text-sm py-2 px-3 rounded-lg flex items-center gap-2"
                                  >
                                    <Check className="w-4 h-4 text-emerald-600" />
                                    <span>Re-approve Clearance</span>
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Footer (Matching ApprovedList) */}
        {!isLoading && filteredRequests.length > 0 && (
          <div className="p-4 border-t border-border/60 bg-white rounded-b-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
              {Math.min(currentPage * PAGE_SIZE, filteredRequests.length)} of{" "}
              {filteredRequests.length} requests
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-8 px-2.5 text-xs cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Previous
              </Button>
              <span className="px-2 font-semibold text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 px-2.5 text-xs cursor-pointer"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Admin Action Dialog for Query / Reject */}
      <Dialog
        open={Boolean(dialogAction)}
        onOpenChange={(open) => !open && setDialogAction(null)}
      >
        <DialogContent className="sm:max-w-md p-6 bg-white rounded-xl shadow-xl border">
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div
                className={`p-2 rounded-lg ${
                  dialogAction === "QUERY"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {dialogAction === "QUERY" ? (
                  <MessageSquare className="w-5 h-5 text-amber-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600" />
                )}
              </div>
              <DialogTitle className="text-base font-bold text-slate-900">
                {dialogAction === "QUERY"
                  ? `Ask Query from ${selectedRequest?.requestedBy}`
                  : `Reject Clearance for ${selectedRequest?.requestedBy}`}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500">
              Property:{" "}
              <strong className="text-slate-700">
                {selectedRequest?.propertyTitle}
              </strong>
              {selectedRequest?.clientName &&
                ` • Client: ${selectedRequest?.clientName}`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitAdminAction} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                {dialogAction === "QUERY"
                  ? "Question / Information Required from Executive"
                  : "Reason for Rejection"}
                <span className="text-destructive">*</span>
              </Label>
              <Textarea
                rows={3}
                required={dialogAction === "QUERY"}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder={
                  dialogAction === "QUERY"
                    ? "e.g. Please confirm if the client has visited similar projects, or what is their exact budget?"
                    : "e.g. Seller is currently unavailable or details cannot be disclosed at this stage."
                }
                className="text-sm resize-none"
              />
            </div>

            <DialogFooter className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDialogAction(null)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className={`font-medium cursor-pointer gap-1.5 text-white ${
                  dialogAction === "QUERY"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {dialogAction === "QUERY" ? (
                  <>
                    <MessageSquare className="w-3.5 h-3.5" />
                    {isSubmitting ? "Sending..." : "Send Query"}
                  </>
                ) : (
                  <>
                    <X className="w-3.5 h-3.5" />
                    {isSubmitting ? "Rejecting..." : "Confirm Rejection"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequestsApprovedPage;

