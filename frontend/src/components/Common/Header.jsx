import React, { useState } from "react";
import {
  Bell,
  Plus,
  ShieldAlert,
  Check,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  XCircle,
  X,
  Clock,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { toast } from "@/components/ui/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { fetchClearanceRequests, decideClearanceRequest } from "@/api/inventory";

const fetchMe = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
    credentials: "include",
  });
  if (!res.ok) return null;
  return (await res.json()).data;
};

const Header = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    staleTime: 30000,
  });

  const isAdmin = user?.role === "ADMIN";
  const prefix = isAdmin ? "/admin" : "/executive";

  const { data: clearanceRequests = [] } = useQuery({
    queryKey: ["clearanceRequests"],
    queryFn: fetchClearanceRequests,
    refetchInterval: 5000,
  });

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogAction, setDialogAction] = useState(null); // null | "QUERY" | "REJECT"
  const [actionNotes, setActionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter requests based on role
  const notificationsList = clearanceRequests || [];
  const actionableCount = isAdmin
    ? notificationsList.filter((r) => r.status === "PENDING").length
    : notificationsList.filter(
        (r) =>
          r.status === "QUERY_ASKED" ||
          r.status === "APPROVED" ||
          r.status === "REJECTED",
      ).length;

  const handleViewProperty = (propertyId) => {
    setNotificationsOpen(false);
    navigate(`${prefix}/inventory/${propertyId}`);
  };

  const handleGrantClearance = async (req, e) => {
    if (e) e.stopPropagation();
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

  const handleOpenQueryDialog = (req, e) => {
    if (e) e.stopPropagation();
    setSelectedRequest(req);
    setDialogAction("QUERY");
    setActionNotes("");
  };

  const handleOpenRejectDialog = (req, e) => {
    if (e) e.stopPropagation();
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
          toast.warning(
            "Query Required",
            "Please enter your query for the executive.",
          );
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
        toast.info(
          "Request Rejected",
          `Clearance request from ${selectedRequest.requestedBy} has been declined.`,
        );
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

  const handleDismissNotification = async (req, e) => {
    if (e) e.stopPropagation();
    try {
      await decideClearanceRequest(req.propertyId, { action: "DISMISS" });
      queryClient.invalidateQueries({ queryKey: ["clearanceRequests"] });
      toast.info(
        "Notification Dismissed",
        "Alert removed from bell. Request remains saved in My Requests.",
      );
    } catch (err) {
      toast.error("Failed to dismiss", err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      queryClient.clear();
      navigate("/login");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="h-16 border-b border-border/70 bg-card w-full max-w-full min-w-0 sticky top-0 z-30 shadow-2xs">
      <div className="flex h-full items-center justify-between px-3 sm:px-6 w-full max-w-full min-w-0">
        {/* Left: Mobile Trigger & Workspace Indicator */}
        <div className="flex items-center gap-2 min-w-0">
          <SidebarTrigger className="md:hidden text-slate-700 h-9 w-9 rounded-lg hover:bg-slate-100 shrink-0" />
           
        </div>

        {/* Right: Actions, Notifications & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Add Lead (Visible on sm+) */}
          <Button
            onClick={() => navigate(`${prefix}/leads`)}
            variant="outline"
            size="sm"
            className="hidden lg:inline-flex h-9 border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm px-3 items-center gap-1.5 font-semibold"
          >
            <Plus className="h-3.5 w-3.5 text-primary" />
            <span>Add Lead</span>
          </Button>

          {/* Add Inventory (Primary Action) */}
          <Button
            onClick={() => navigate(`${prefix}/inventory/new`)}
            size="sm"
            className="h-9 bg-primary hover:bg-brand-dark text-primary-foreground text-xs sm:text-sm px-3 sm:px-4 inline-flex items-center gap-1.5 font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Inventory</span>
            <span className="sm:hidden">Inventory</span>
          </Button>

          {/* Notifications Dropdown */}
          <DropdownMenu
            open={notificationsOpen}
            onOpenChange={setNotificationsOpen}
          >
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="relative h-9 w-9 rounded-full border-slate-200 text-slate-600 hover:text-slate-900 shrink-0 cursor-pointer"
                  title="Notifications & Alerts"
                >
                  <Bell className="h-4 w-4" />
                  {actionableCount > 0 ? (
                    <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {actionableCount}
                    </span>
                  ) : (
                    <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-slate-300" />
                  )}
                </Button>
              }
            />

            <DropdownMenuContent
              align="end"
              className="w-80 sm:w-96 rounded-xl p-0 shadow-xl border border-border/80 bg-white overflow-hidden"
            >
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    {isAdmin ? "Clearance Requests & Alerts" : "Notifications"}
                  </span>
                </div>
                {actionableCount > 0 && (
                  <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                    {actionableCount} {isAdmin ? "Pending" : "New"}
                  </span>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notificationsList.length > 0 ? (
                  notificationsList.map((req) => {
                    // ADMIN VIEW: Pending clearance requests to review
                    if (isAdmin) {
                      return (
                        <div
                          key={req.propertyId}
                          className="p-3.5 hover:bg-slate-50 transition-colors flex flex-col gap-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                              <button
                                type="button"
                                className="text-left font-bold truncate hover:text-primary transition-colors cursor-pointer"
                                onClick={() =>
                                  handleViewProperty(req.propertyId)
                                }
                              >
                                {req.propertyTitle || "Property Listing"}
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                              {new Date(req.requestedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                            <div className="flex items-center justify-between text-slate-700">
                              <span>
                                Requester:{" "}
                                <strong className="font-semibold text-slate-900">
                                  {req.requestedBy}
                                </strong>
                              </span>
                              {req.clientName && (
                                <span className="text-slate-500">
                                  Client:{" "}
                                  <strong className="font-medium text-slate-800">
                                    {req.clientName}
                                  </strong>
                                </span>
                              )}
                            </div>
                            <p className="text-slate-700">
                              <span className="text-slate-400 font-medium">
                                Reason:{" "}
                              </span>
                              <strong className="text-slate-900">
                                {req.reason}
                              </strong>
                            </p>
                            {req.notes && (
                              <p className="text-slate-500 italic text-[10px]">
                                "{req.notes}"
                              </p>
                            )}
                            {req.executiveReply && (
                              <div className="mt-1 pt-1 border-t border-slate-200 text-emerald-800 bg-emerald-50/70 p-1.5 rounded">
                                <span className="font-bold text-[10px] block text-emerald-700">
                                  Executive Reply:
                                </span>
                                <span className="text-[11px]">
                                  {req.executiveReply}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-0.5">
                            <button
                              type="button"
                              onClick={() => handleViewProperty(req.propertyId)}
                              className="text-[10px] text-primary hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                            >
                              <span>View Property</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>

                            <div className="flex items-center gap-1.5">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={(e) => handleOpenQueryDialog(req, e)}
                                className="h-6 px-2 text-[10px] sm:text-[11px] text-amber-700 border-amber-300 hover:bg-amber-50 cursor-pointer font-medium"
                                title="Ask query for clarification"
                              >
                                <HelpCircle className="w-3 h-3 mr-1 text-amber-600" />{" "}
                                Query
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={(e) => handleOpenRejectDialog(req, e)}
                                className="h-6 px-2 text-[10px] sm:text-[11px] text-rose-700 border-rose-300 hover:bg-rose-50 cursor-pointer font-medium"
                                title="Reject request"
                              >
                                <X className="w-3 h-3 mr-1 text-rose-600" />{" "}
                                Reject
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                onClick={(e) => handleGrantClearance(req, e)}
                                className="h-6 px-2.5 text-[10px] sm:text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer shadow-2xs"
                                title="Approve clearance"
                              >
                                <Check className="w-3 h-3 mr-1" /> Approve
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // EXECUTIVE VIEW: Status updates, Admin queries, Approvals, Rejections
                    if (req.status === "QUERY_ASKED") {
                      return (
                        <div
                          key={req.propertyId}
                          className="p-3.5 hover:bg-amber-50/50 bg-amber-50/20 transition-colors flex flex-col gap-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900">
                              <MessageSquare className="w-4 h-4 text-amber-600 shrink-0" />
                              <span className="font-semibold text-amber-800">
                                Clarification Needed
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(
                                req.adminActionAt || req.requestedAt,
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-800">
                            {req.propertyTitle}
                          </p>
                          <div className="bg-white p-2.5 rounded-lg border border-amber-200 text-xs text-slate-700">
                            <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider mb-0.5">
                              Admin Query:
                            </p>
                            <p className="italic font-medium">
                              "{req.adminFeedback}"
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setNotificationsOpen(false);
                                navigate("/executive/requests");
                              }}
                              className="text-[10px] text-amber-800 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                            >
                              <span>Track Request</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleViewProperty(req.propertyId)}
                              className="h-7 px-2.5 text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium cursor-pointer"
                            >
                              View Property & Reply
                            </Button>
                          </div>
                        </div>
                      );
                    }

                    if (req.status === "APPROVED") {
                      return (
                        <div
                          key={req.propertyId}
                          className="p-3.5 hover:bg-emerald-50/50 bg-emerald-50/20 transition-colors flex flex-col gap-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Clearance Approved</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(
                                req.adminActionAt || req.requestedAt,
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-800">
                            {req.propertyTitle}
                          </p>
                          <p className="text-[11px] text-slate-600">
                            Seller contact info is now unlocked for your client
                            negotiation.
                          </p>
                          <div className="flex items-center justify-between gap-2 pt-1">
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={(e) => handleDismissNotification(req, e)}
                                className="h-6 px-2 text-[10px] text-slate-500 hover:text-slate-800"
                              >
                                Dismiss
                              </Button>
                              <button
                                type="button"
                                onClick={() => {
                                  setNotificationsOpen(false);
                                  navigate("/executive/requests");
                                }}
                                className="text-[10px] text-emerald-700 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                              >
                                <span>Track Request</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleViewProperty(req.propertyId)}
                              className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer"
                            >
                              View Property Details
                            </Button>
                          </div>
                        </div>
                      );
                    }

                    if (req.status === "REJECTED") {
                      return (
                        <div
                          key={req.propertyId}
                          className="p-3.5 hover:bg-rose-50/50 bg-rose-50/20 transition-colors flex flex-col gap-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-rose-800">
                              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                              <span>Clearance Declined</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(
                                req.adminActionAt || req.requestedAt,
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-800">
                            {req.propertyTitle}
                          </p>
                          <p className="text-[11px] text-slate-600 italic">
                            "{req.adminFeedback || "Declined by Administrator"}"
                          </p>
                          <div className="flex items-center justify-between gap-2 pt-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={(e) => handleDismissNotification(req, e)}
                              className="h-6 px-2 text-[10px] text-slate-500 hover:text-slate-800"
                            >
                              Dismiss
                            </Button>
                            <button
                              type="button"
                              onClick={() => handleViewProperty(req.propertyId)}
                              className="text-[11px] text-primary hover:underline font-semibold"
                            >
                              View Property
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // Status: PENDING (Executive submitted, awaiting admin)
                    return (
                      <div
                        key={req.propertyId}
                        className="p-3.5 hover:bg-slate-50 transition-colors flex flex-col gap-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="text-slate-800 font-semibold truncate">
                              {req.propertyTitle}
                            </span>
                          </div>
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                            Awaiting Admin
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Clearance request submitted. Waiting for Administrator
                          review.
                        </p>
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setNotificationsOpen(false);
                              navigate("/executive/requests");
                            }}
                            className="text-[10px] text-slate-500 hover:text-slate-800 hover:underline font-medium flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>Track Request</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleViewProperty(req.propertyId)}
                            className="text-[10px] text-primary hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>View Property</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 px-4 text-center text-xs text-slate-500 space-y-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <p className="font-semibold text-slate-700">
                      All caught up!
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {isAdmin
                        ? "No pending seller info clearance requests."
                        : "No active notifications or pending reviews."}
                    </p>
                    {!isAdmin && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setNotificationsOpen(false);
                            navigate("/executive/requests");
                          }}
                          className="inline-flex items-center gap-1 text-[11px] text-primary font-semibold hover:underline cursor-pointer bg-primary/5 px-2.5 py-1 rounded-md border border-primary/20"
                        >
                          <span>View Past Clearance Requests</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isAdmin ? (
                <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between px-3">
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate("/admin/approved");
                    }}
                    className="text-[11px] text-slate-600 hover:text-slate-900 font-semibold hover:underline cursor-pointer"
                  >
                    Approvals Hub
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate("/admin/approved/requests");
                    }}
                    className="text-[11px] text-primary font-semibold hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    <span>All Clearance History</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between px-3">
                  <span className="text-[10px] text-slate-500 font-medium">
                    Clearance Tracking
                  </span>
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate("/executive/requests");
                    }}
                    className="text-[11px] text-primary font-semibold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Track All My Requests</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Avatar Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-1 rounded-full p-0 h-9 w-9 outline-none hover:ring-2 hover:ring-primary/20 transition-all shrink-0 cursor-pointer"
                  title="User Profile Menu"
                >
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage
                      src={user?.image}
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              }
            />

            <DropdownMenuContent
              align="end"
              className="w-56 rounded-xl p-1 shadow-lg border border-border/70 bg-white"
            >
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {user?.name || "CRM User"}
                </p>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className="text-xs text-slate-500 truncate max-w-[130px]">
                    {user?.email || ""}
                  </p>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                    {user?.role || "EXECUTIVE"}
                  </span>
                </div>
              </div>

              <DropdownMenuGroup className="py-1">
                <DropdownMenuItem
                  onClick={() => navigate(`${prefix}/profile`)}
                  className="cursor-pointer text-xs sm:text-sm font-medium py-2 px-3 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  My Profile
                </DropdownMenuItem>

                {isAdmin && (
                  <DropdownMenuItem
                    onClick={() => navigate("/admin/settings")}
                    className="cursor-pointer text-xs sm:text-sm font-medium py-2 px-3 rounded-lg text-slate-700 hover:bg-slate-50"
                  >
                    System Settings
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="my-1 bg-slate-100" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-xs sm:text-sm font-semibold py-2 px-3 rounded-lg text-rose-600 hover:bg-rose-50"
              >
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Admin Action Dialog (Query or Reject) */}
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
                  ? "Question / Clarification Required from Executive"
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
    </header>
  );
};

export default Header;
