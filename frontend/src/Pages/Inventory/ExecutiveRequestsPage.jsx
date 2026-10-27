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
  Lock,
  Unlock,
  ShieldAlert,
  MoreVertical,
  Phone,
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Send,
  Building2,
  MapPin,
  Calendar,
  AlertCircle,
  Check,
  Bell,
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
import {
  formatPrice,
  getDealTypeTheme,
} from "@/components/Inventory_Management/InventoryTable";

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

const ExecutiveRequestsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [statusTab, setStatusTab] = useState("ALL"); // "ALL" | "QUERY_ASKED" | "PENDING" | "APPROVED" | "REJECTED"
  const [reasonFilter, setReasonFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [spinning, setSpinning] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Executive Reply Dialog state
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Fetch clearance requests (backend automatically scopes to this executive)
  const {
    data: allRequests = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["clearanceRequests", "executive"],
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

  // Filter requests
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
        const clientMatch = (req.clientName || "").toLowerCase().includes(q);
        const reasonMatch = (req.reason || "").toLowerCase().includes(q);
        const notesMatch = (req.notes || "").toLowerCase().includes(q);
        const localityMatch = (req.locality || "").toLowerCase().includes(q);
        const adminFeedbackMatch = (req.adminFeedback || "")
          .toLowerCase()
          .includes(q);
        const sellerNameMatch = (req.sellerName || "")
          .toLowerCase()
          .includes(q);
        return (
          titleMatch ||
          clientMatch ||
          reasonMatch ||
          notesMatch ||
          localityMatch ||
          adminFeedbackMatch ||
          sellerNameMatch
        );
      }
      return true;
    });
  }, [allRequests, statusTab, reasonFilter, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRequests.length / PAGE_SIZE),
  );
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRequests.slice(start, start + PAGE_SIZE);
  }, [filteredRequests, currentPage]);

  const pendingCount = allRequests.filter((r) => r.status === "PENDING").length;
  const approvedCount = allRequests.filter(
    (r) => r.status === "APPROVED",
  ).length;
  const queryCount = allRequests.filter(
    (r) => r.status === "QUERY_ASKED",
  ).length;
  const rejectedCount = allRequests.filter(
    (r) => r.status === "REJECTED",
  ).length;

  const isFiltered = Boolean(
    search || reasonFilter !== "ALL" || statusTab !== "ALL",
  );

  const handleResetFilters = () => {
    setSearch("");
    setReasonFilter("ALL");
    setStatusTab("ALL");
    setCurrentPage(1);
  };

  const handleOpenReplyDialog = (req) => {
    setSelectedRequest(req);
    setReplyMessage(req.executiveReply || "");
    setReplyDialogOpen(true);
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    if (!replyMessage.trim()) {
      toast.warning(
        "Reply Required",
        "Please enter your response to the Administrator.",
      );
      return;
    }

    setIsSubmittingReply(true);
    try {
      await decideClearanceRequest(selectedRequest.propertyId, {
        action: "REPLY",
        reply: replyMessage.trim(),
      });
      queryClient.invalidateQueries({ queryKey: ["clearanceRequests"] });
      queryClient.invalidateQueries({
        queryKey: ["propertyClearance", selectedRequest.propertyId],
      });
      toast.success(
        "Reply Sent to Admin",
        "Your clarification has been submitted. Status updated to Pending Review.",
      );
      setReplyDialogOpen(false);
      setSelectedRequest(null);
      setReplyMessage("");
    } catch (err) {
      toast.error("Failed to submit reply", err.message);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDismissBellAlert = async (req) => {
    try {
      await decideClearanceRequest(req.propertyId, { action: "DISMISS" });
      queryClient.invalidateQueries({ queryKey: ["clearanceRequests"] });
      toast.info(
        "Alert Dismissed",
        "Removed from notification bell. Request remains permanently saved in your history.",
      );
    } catch (err) {
      toast.error("Failed to dismiss alert", err.message);
    }
  };

  const handleCopyPhone = (phone, id) => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    toast.success("Phone Number Copied", `${phone} copied to clipboard.`);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 pb-16 overflow-x-hidden">
      {/* Header & Breadcrumb (exact same UI with border-b border-border/70) */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span
              className="cursor-pointer hover:text-slate-900 transition-colors"
              onClick={() => navigate("/executive")}
            >
              Dashboard
            </span>
            <span>›</span>
            <span
              className="cursor-pointer hover:text-slate-900 transition-colors"
              onClick={() => navigate("/executive/inventory")}
            >
              Inventory
            </span>
            <span>›</span>
            <span className="font-bold text-slate-800">
              My Clearance Requests
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight">
              My Seller Clearance Requests
            </h1>
            {queryCount > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5 animate-pulse">
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                {queryCount} Action Required
              </span>
            ) : pendingCount > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                {pendingCount} Under Review
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                All Up to Date
              </span>
            )}
          </div>

          <p className="text-sm text-slate-500 mt-1">
            Track all your requests for confidential seller contact details,
            review administrator queries, and view unlocked phone numbers once
            approved.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={() => navigate("/executive/inventory")}
            className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm h-10 px-3.5 shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse Inventory</span>
          </Button>

          <Button
            onClick={handleRefresh}
            disabled={isSpinning}
            variant="outline"
            className="group bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition-all font-semibold text-xs sm:text-sm h-10 px-4 shadow-2xs flex items-center gap-2 cursor-pointer"
            title="Refresh Requests"
          >
            <RotateCcw
              className={`w-4 h-4 text-slate-600 transition-transform duration-700 ${
                isSpinning
                  ? "animate-spin text-primary"
                  : "group-hover:-rotate-180"
              }`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => {
            setStatusTab("ALL");
            setCurrentPage(1);
          }}
          className={`p-3.5 sm:p-4 rounded-xl border bg-white transition-all cursor-pointer ${
            statusTab === "ALL"
              ? "border-primary/50 shadow-sm ring-1 ring-primary/20"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Requests
            </span>
            <ShieldAlert className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1.5">
            {allRequests.length}
          </p>
          <span className="text-[11px] text-slate-400">
            All submitted clearance tickets
          </span>
        </div>

        <div
          onClick={() => {
            setStatusTab("APPROVED");
            setCurrentPage(1);
          }}
          className={`p-3.5 sm:p-4 rounded-xl border bg-white transition-all cursor-pointer ${
            statusTab === "APPROVED"
              ? "border-emerald-500/50 shadow-sm ring-1 ring-emerald-500/20"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Approved & Unlocked
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-1.5">
            {approvedCount}
          </p>
          <span className="text-[11px] text-emerald-600/80">
            Seller contact info unlocked
          </span>
        </div>

        <div
          onClick={() => {
            setStatusTab("QUERY_ASKED");
            setCurrentPage(1);
          }}
          className={`p-3.5 sm:p-4 rounded-xl border bg-white transition-all cursor-pointer ${
            statusTab === "QUERY_ASKED"
              ? "border-amber-500/50 shadow-sm ring-1 ring-amber-500/20"
              : "border-slate-200 hover:border-slate-300"
          } ${queryCount > 0 ? "bg-amber-50/30" : ""}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Action Required
            </span>
            <MessageSquare className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-1.5">
            <p className="text-2xl font-bold text-amber-600">{queryCount}</p>
            {queryCount > 0 && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                Admin waiting
              </span>
            )}
          </div>
          <span className="text-[11px] text-amber-600/80">
            Admin asked for clarification
          </span>
        </div>

        <div
          onClick={() => {
            setStatusTab("PENDING");
            setCurrentPage(1);
          }}
          className={`p-3.5 sm:p-4 rounded-xl border bg-white transition-all cursor-pointer ${
            statusTab === "PENDING"
              ? "border-blue-500/50 shadow-sm ring-1 ring-blue-500/20"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
              Under Review
            </span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-1.5">
            {pendingCount}
          </p>
          <span className="text-[11px] text-blue-600/80">
            Waiting for admin decision
          </span>
        </div>
      </div>

      {/* Filter Bar (Matching ApprovedFilters.jsx) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 border border-b-0 border-border/60 bg-white rounded-t-xl">
        {/* Search & Reason Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 min-w-[220px]">
            <Input
              placeholder="Search property, locality, client, notes..."
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
              setStatusTab("QUERY_ASKED");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusTab === "QUERY_ASKED"
                ? "bg-white text-amber-900 shadow-xs border border-amber-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
            <span>Action Needed</span>
            {queryCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full text-xs font-bold animate-pulse">
                {queryCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusTab("PENDING");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusTab === "PENDING"
                ? "bg-white text-blue-900 shadow-xs border border-blue-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Pending ({pendingCount})</span>
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

      {/* Main Table */}
      <div className="bg-white rounded-b-xl border border-t-0 border-border/70 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500 font-medium">
                Loading clearance requests...
              </p>
            </div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No Clearance Requests Found
            </h3>
            <p className="text-sm text-slate-500 max-w-md mt-1">
              {isFiltered
                ? "No requests match your current filters. Try resetting the search or category filters."
                : "You have not submitted any seller contact clearance requests yet. Open any inventory listing to request seller clearance."}
            </p>
            <div className="mt-4 flex items-center gap-2">
              {isFiltered ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="font-semibold text-xs"
                >
                  Clear Filters
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => navigate("/executive/inventory")}
                  className="bg-primary hover:bg-brand-dark text-white font-semibold text-xs"
                >
                  Browse Inventory Listings
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="border-b border-border/70">
                  <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider py-3.5 px-4">
                    Property & Locality
                  </TableHead>
                  <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider py-3.5 px-4">
                    Purpose & Client
                  </TableHead>
                  <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider py-3.5 px-4 min-w-[220px]">
                    Admin Response & Updates
                  </TableHead>
                  <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider py-3.5 px-4">
                    Seller Contact Info
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
                  const deal = getDealTypeTheme(req.dealType);
                  const isApproved = req.status === "APPROVED";
                  const isQuery = req.status === "QUERY_ASKED";
                  const isRejected = req.status === "REJECTED";
                  const isPending = req.status === "PENDING";
                  const dateInfo = formatDateTime(req.requestedAt);

                  return (
                    <TableRow
                      key={req.propertyId}
                      className={`border-b border-border/60 hover:bg-slate-50/70 transition-colors ${
                        isQuery ? "bg-amber-50/20" : ""
                      }`}
                    >
                      {/* Property & Locality */}
                      <TableCell className="py-3.5 px-4 align-top">
                        <div className="flex flex-col gap-1 max-w-[260px]">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/executive/inventory/${req.propertyId}`)
                            }
                            className="text-left font-bold text-slate-900 hover:text-primary transition-colors text-sm line-clamp-1 cursor-pointer flex items-center gap-1.5 group"
                          >
                            <Building2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary shrink-0" />
                            <span className="truncate">
                              {req.propertyTitle || "Property Listing"}
                            </span>
                          </button>

                          <div className="flex items-center gap-2 flex-wrap">
                            {deal && (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${deal.badgeClass}`}
                              >
                                {deal.label}
                              </span>
                            )}
                            {req.locality && (
                              <span className="flex items-center gap-0.5 text-xs text-slate-500 truncate">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{req.locality}</span>
                              </span>
                            )}
                          </div>

                          {req.price && (
                            <span className="text-xs font-semibold text-slate-700">
                              {formatPrice(req.price, req.dealType)}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Purpose & Client */}
                      <TableCell className="py-3.5 px-4 align-top">
                        <div className="space-y-1 max-w-[220px]">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {req.reason}
                          </span>
                          {req.clientName && (
                            <div className="text-xs text-slate-700 flex items-center gap-1">
                              <span className="text-slate-400 font-medium">
                                Client:
                              </span>
                              <strong className="font-semibold text-slate-900">
                                {req.clientName}
                              </strong>
                            </div>
                          )}
                          {req.notes && (
                            <p className="text-[11px] text-slate-500 italic line-clamp-2">
                              "{req.notes}"
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Admin Response & Updates */}
                      <TableCell className="py-3.5 px-4 align-top">
                        <div className="max-w-[280px]">
                          {isApproved && (
                            <div className="p-2 rounded-lg bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-900 space-y-1">
                              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Clearance Granted</span>
                              </div>
                              <p className="text-[11px] text-emerald-700">
                                Authorized by {req.adminName || "Administrator"}
                                .
                              </p>
                              {req.adminActionAt && (
                                <span className="text-[10px] text-emerald-600/80 block">
                                  {formatDateTime(req.adminActionAt).date} •{" "}
                                  {formatDateTime(req.adminActionAt).time}
                                </span>
                              )}
                            </div>
                          )}

                          {isQuery && (
                            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1 font-bold text-amber-900">
                                  <MessageSquare className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span>Admin Query:</span>
                                </div>
                                <span className="text-[10px] text-amber-700 font-semibold bg-amber-100/80 px-1.5 py-0.2 rounded">
                                  Reply Needed
                                </span>
                              </div>

                              <p className="italic text-slate-800 bg-white p-2 rounded border border-amber-200/70 text-[11px] font-medium leading-relaxed">
                                "{req.adminFeedback}"
                              </p>

                              {req.executiveReply && (
                                <div className="bg-emerald-50/80 p-2 rounded border border-emerald-200/60 text-[11px]">
                                  <span className="font-bold text-emerald-800 block text-[10px]">
                                    Your Sent Reply:
                                  </span>
                                  <span className="text-emerald-950">
                                    {req.executiveReply}
                                  </span>
                                </div>
                              )}

                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleOpenReplyDialog(req)}
                                className="w-full h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
                              >
                                <Send className="w-3 h-3" />
                                <span>
                                  {req.executiveReply
                                    ? "Update Reply"
                                    : "Reply to Query"}
                                </span>
                              </Button>
                            </div>
                          )}

                          {isRejected && (
                            <div className="p-2 rounded-lg bg-rose-50/80 border border-rose-200/80 text-xs text-rose-900 space-y-1">
                              <div className="flex items-center gap-1.5 font-bold text-rose-800">
                                <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                <span>Request Declined</span>
                              </div>
                              <p className="text-[11px] text-rose-700 italic">
                                "
                                {req.adminFeedback ||
                                  "Declined by Administrator"}
                                "
                              </p>
                              {req.adminActionAt && (
                                <span className="text-[10px] text-rose-500 block">
                                  {formatDateTime(req.adminActionAt).date}
                                </span>
                              )}
                            </div>
                          )}

                          {isPending && (
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-xs text-slate-600 space-y-1">
                              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                                <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-spin" />
                                <span>Awaiting Review</span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Request in queue. Admin will review and unlock
                                contact.
                              </p>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Seller Contact Info */}
                      <TableCell className="py-3.5 px-4 align-top">
                        {isApproved ? (
                          <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200 space-y-1.5 min-w-[180px]">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                                <Unlock className="w-3 h-3 text-emerald-600" />
                                Unlocked Contact
                              </span>
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            </div>

                            <p className="text-xs font-bold text-slate-900">
                              {req.sellerName || "Confidential Seller"}
                            </p>

                            <div className="flex items-center justify-between gap-2 bg-white px-2 py-1.5 rounded border border-emerald-200/80">
                              <a
                                href={`tel:${req.sellerPhone}`}
                                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1"
                                title="Click to Call"
                              >
                                <Phone className="w-3 h-3 text-emerald-600" />
                                <span>
                                  {req.sellerPhone || "Contact Number"}
                                </span>
                              </a>

                              {req.sellerPhone && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopyPhone(
                                      req.sellerPhone,
                                      req.propertyId,
                                    )
                                  }
                                  className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded hover:bg-slate-100 cursor-pointer"
                                  title="Copy Phone Number"
                                >
                                  {copiedId === req.propertyId ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-center space-y-1 min-w-[160px]">
                            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-500">
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Confidential Info</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block">
                              {isPending
                                ? "Unlocks upon admin approval"
                                : isQuery
                                  ? "Clarify query to unlock"
                                  : "Access restricted"}
                            </span>
                          </div>
                        )}
                      </TableCell>

                      {/* Date & Time */}
                      <TableCell className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className="text-xs font-medium text-slate-700">
                          {dateInfo.date}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {dateInfo.time}
                        </div>
                        <span className="text-[10px] text-slate-400 italic">
                          ({dateInfo.relative})
                        </span>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell className="py-3.5 px-4 align-top whitespace-nowrap">
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Approved
                          </span>
                        )}
                        {isQuery && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                            Action Needed
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            Pending Review
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Declined
                          </span>
                        )}
                      </TableCell>

                      {/* Actions Dropdown */}
                      <TableCell className="py-3.5 px-4 align-top text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
                                title="Action Options"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent
                            align="end"
                            className="w-48 bg-white border border-slate-200 shadow-lg rounded-xl p-1 z-50"
                          >
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(
                                  `/executive/inventory/${req.propertyId}`,
                                )
                              }
                              className="text-xs text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-2 py-2"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>View Property</span>
                            </DropdownMenuItem>

                            {isQuery && (
                              <DropdownMenuItem
                                onClick={() => handleOpenReplyDialog(req)}
                                className="text-xs text-amber-700 hover:bg-amber-50 cursor-pointer flex items-center gap-2 py-2 font-semibold"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                                <span>Reply to Admin Query</span>
                              </DropdownMenuItem>
                            )}

                            {isApproved && req.sellerPhone && (
                              <> 
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleCopyPhone(
                                      req.sellerPhone,
                                      req.propertyId,
                                    )
                                  }
                                  className="text-xs text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-2 py-2"
                                >
                                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Copy Phone Number</span>
                                </DropdownMenuItem>
                              </>
                            )}

                            {!req.dismissedByExecutive && (
                              <>
                                <DropdownMenuSeparator className="my-1 bg-slate-100" />
                                <DropdownMenuItem
                                  onClick={() => handleDismissBellAlert(req)}
                                  className="text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-50 cursor-pointer flex items-center gap-2 py-2"
                                >
                                  <Bell className="w-3.5 h-3.5" />
                                  <span>Dismiss Bell Alert</span>
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Bar */}
        {filteredRequests.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border/70 bg-slate-50/60 text-xs text-slate-500">
            <div>
              Showing{" "}
              <strong className="text-slate-800">
                {(currentPage - 1) * PAGE_SIZE + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-slate-800">
                {Math.min(currentPage * PAGE_SIZE, filteredRequests.length)}
              </strong>{" "}
              of{" "}
              <strong className="text-slate-800">
                {filteredRequests.length}
              </strong>{" "}
              clearance requests
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 px-2.5 text-xs bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Previous
              </Button>

              <span className="px-2 font-medium text-slate-700">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="h-8 px-2.5 text-xs bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Reply to Admin Query Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-xl shadow-xl border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-600" />
              Reply to Admin Clarification Query
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Provide additional details or client info to satisfy the
              Administrator's query. Once sent, status will update to Pending
              Review.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <form onSubmit={handleSubmitReply} className="space-y-4 pt-1">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
                <p className="font-bold text-slate-900">
                  {selectedRequest.propertyTitle}
                </p>
                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  <span>Reason: {selectedRequest.reason}</span>
                  {selectedRequest.clientName && (
                    <span>• Client: {selectedRequest.clientName}</span>
                  )}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200/80">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                    Admin's Question:
                  </span>
                  <p className="italic text-slate-800 font-medium mt-0.5">
                    "{selectedRequest.adminFeedback}"
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="replyMessage"
                  className="text-xs font-semibold text-slate-700"
                >
                  Your Response / Explanation *
                </Label>
                <Textarea
                  id="replyMessage"
                  placeholder="e.g. Client Mr. Sharma has confirmed appointment for tomorrow 4 PM. Budget is 2.5 Cr and pre-approved by HDFC..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={4}
                  className="text-xs bg-slate-50 border-slate-200 rounded-lg focus:bg-white resize-none"
                  autoFocus
                  required
                />
                <span className="text-[10px] text-slate-400">
                  Be specific so the admin can authorize seller contact
                  clearance promptly.
                </span>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReplyDialogOpen(false)}
                  disabled={isSubmittingReply}
                  className="h-8.5 text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingReply || !replyMessage.trim()}
                  className="h-8.5 text-xs bg-primary hover:bg-brand-dark text-white font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  {isSubmittingReply ? (
                    <>
                      <RotateCcw className="w-3 h-3 animate-spin" />
                      <span>Sending Reply...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Reply to Admin</span>
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExecutiveRequestsPage;
