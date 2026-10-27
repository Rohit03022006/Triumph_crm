import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Maximize2,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  FileText,
  Phone,
  User,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Compass,
  Car,
  Home,
  Tag,
  Lock,
  ExternalLink,
  ChevronRight,
  Printer,
  History,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  Send,
  Check,
  HelpCircle,
  MessageSquare,
  X,
} from "lucide-react";
import {
  fetchPropertyById,
  deleteProperty,
  approveProperty,
  rejectProperty,
  fetchInventoryMasterData,
  submitClearanceRequest,
  fetchPropertyClearanceRequest,
  decideClearanceRequest,
} from "@/api/inventory";
import { fetchPropertyLogs } from "@/api/logs";
import { toast } from "@/components/ui/toast";
import {
  formatPrice,
  getDealTypeTheme,
  getStatusTheme,
} from "@/components/Inventory_Management/InventoryTable";
import ProjectUnitsDialog from "@/components/Inventory_Management/ProjectUnitsDialog";
import ReviewActionDialog from "@/components/Approved_Management/ReviewActionDialog";

const fetchMe = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
    credentials: "include",
  });
  if (!res.ok) return null;
  return (await res.json()).data;
};

const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const isExecutive = location.pathname.startsWith("/executive");
  const basePath = isExecutive ? "/executive/inventory" : "/admin/inventory";

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isUnitsOpen, setIsUnitsOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  // User auth & role
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    staleTime: 30000,
  });
  const isAdmin = user?.role === "ADMIN";

  // Seller info clearance query from backend
  const { data: clearanceRequest } = useQuery({
    queryKey: ["propertyClearance", id],
    queryFn: () => fetchPropertyClearanceRequest(id),
    enabled: Boolean(id),
    refetchInterval: 5000,
  });

  // Seller info clearance states
  const [isRequestSellerOpen, setIsRequestSellerOpen] = useState(false);
  const [requestReason, setRequestReason] = useState("Client Site Visit Scheduled");
  const [requestClientName, setRequestClientName] = useState("");
  const [requestNotes, setRequestNotes] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Executive Reply & Admin Action states
  const [executiveReplyText, setExecutiveReplyText] = useState("");
  const [isExecutiveReplying, setIsExecutiveReplying] = useState(false);
  const [isAdminQueryModalOpen, setIsAdminQueryModalOpen] = useState(false);
  const [isAdminRejectModalOpen, setIsAdminRejectModalOpen] = useState(false);
  const [adminQueryText, setAdminQueryText] = useState("");
  const [adminRejectText, setAdminRejectText] = useState("");

  const handleRequestSellerSubmit = async (e) => {
    e.preventDefault();
    if (!requestReason.trim()) {
      toast.warning("Clearance Reason Required", "Please select or enter a reason for the clearance request.");
      return;
    }
    setIsSubmittingRequest(true);
    try {
      await submitClearanceRequest(id, {
        propertyTitle: property?.title || "Property Listing",
        reason: requestReason,
        clientName: requestClientName.trim() || undefined,
        notes: requestNotes.trim() || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["propertyClearance", id] });
      queryClient.invalidateQueries({ queryKey: ["clearanceRequests"] });
      setIsRequestSellerOpen(false);
      setRequestClientName("");
      setRequestNotes("");
      toast.success(
        "Clearance Requested",
        "Your request for seller details has been sent to Administrator for clearance.",
      );
    } catch (err) {
      toast.error("Failed to submit request", err.message);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleGrantClearance = async () => {
    try {
      await decideClearanceRequest(id, { action: "APPROVE" });
      queryClient.invalidateQueries({ queryKey: ["propertyClearance", id] });
      queryClient.invalidateQueries({ queryKey: ["clearanceRequests"] });
      toast.success(
        "Clearance Granted",
        `Executive ${clearanceRequest?.requestedBy || "Executive"} has been authorized to access seller info.`,
      );
    } catch (e) {
      toast.error("Failed to grant clearance", e.message);
    }
  };

  const handleAskQuerySubmit = async (e) => {
    e.preventDefault();
    if (!adminQueryText.trim()) {
      toast.warning("Query Required", "Please enter the query / clarification needed.");
      return;
    }
    try {
      await decideClearanceRequest(id, {
        action: "QUERY",
        feedback: adminQueryText.trim(),
      });
      queryClient.invalidateQueries({ queryKey: ["propertyClearance", id] });
      queryClient.invalidateQueries({ queryKey: ["clearanceRequests"] });
      setIsAdminQueryModalOpen(false);
      setAdminQueryText("");
      toast.success("Query Sent", `Clarification query sent to ${clearanceRequest?.requestedBy || "Executive"}.`);
    } catch (err) {
      toast.error("Failed to send query", err.message);
    }
  };

  const handleRejectRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      await decideClearanceRequest(id, {
        action: "REJECT",
        feedback: adminRejectText.trim() || "Clearance declined by Administrator.",
      });
      queryClient.invalidateQueries({ queryKey: ["propertyClearance", id] });
      queryClient.invalidateQueries({ queryKey: ["clearanceRequests"] });
      setIsAdminRejectModalOpen(false);
      setAdminRejectText("");
      toast.info("Request Rejected", "Clearance request has been declined.");
    } catch (err) {
      toast.error("Failed to reject request", err.message);
    }
  };

  const handleExecutiveReplySubmit = async (e) => {
    e.preventDefault();
    if (!executiveReplyText.trim()) {
      toast.warning("Reply Required", "Please provide your reply to the administrator's query.");
      return;
    }
    setIsExecutiveReplying(true);
    try {
      await decideClearanceRequest(id, {
        action: "REPLY",
        reply: executiveReplyText.trim(),
      });
      queryClient.invalidateQueries({ queryKey: ["propertyClearance", id] });
      queryClient.invalidateQueries({ queryKey: ["clearanceRequests"] });
      setExecutiveReplyText("");
      toast.success("Response Sent", "Your response has been submitted to the Administrator for review.");
    } catch (err) {
      toast.error("Failed to send response", err.message);
    } finally {
      setIsExecutiveReplying(false);
    }
  };

  const handleDismissRequest = async () => {
    try {
      await decideClearanceRequest(id, { action: "DISMISS" });
      queryClient.invalidateQueries({ queryKey: ["propertyClearance", id] });
      queryClient.invalidateQueries({ queryKey: ["clearanceRequests"] });
      toast.info("Request Dismissed", "Clearance request has been removed.");
    } catch (e) {
      toast.error("Failed to dismiss request", e.message);
    }
  };

  const handleRevokeClearance = async () => {
    try {
      await decideClearanceRequest(id, { action: "REVOKE" });
      queryClient.invalidateQueries({ queryKey: ["propertyClearance", id] });
      queryClient.invalidateQueries({ queryKey: ["clearanceRequests"] });
      toast.info("Clearance Revoked", "Seller details are masked again for executives.");
    } catch (e) {
      toast.error("Failed to revoke clearance", e.message);
    }
  };

  // Master data for unit management
  const { data: masterData } = useQuery({
    queryKey: ["inventoryMasterData"],
    queryFn: fetchInventoryMasterData,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch property details
  const {
    data: property,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["property", id],
    queryFn: () => fetchPropertyById(id),
  });

  // Fetch property audit logs (Admin only)
  const { data: auditLogs = [] } = useQuery({
    queryKey: ["propertyLogs", id],
    queryFn: () => fetchPropertyLogs(id),
    enabled: Boolean(id && isAdmin),
  });

  // Delete mutation
  const deleteMut = useMutation({
    mutationFn: () => deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventoryProperties"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryMetrics"] });
      toast.success("Property deleted successfully");
      navigate(basePath);
    },
    onError: (err) => toast.error("Failed to delete property", err.message),
  });

  const approveMut = useMutation({
    mutationFn: () => approveProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property", id] });
      queryClient.invalidateQueries({ queryKey: ["inventoryProperties"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryMetrics"] });
      queryClient.invalidateQueries({ queryKey: ["propertyLogs", id] });
      queryClient.invalidateQueries({ queryKey: ["auditLogs"] });
      toast.success(
        "Property Approved!",
        "Listing status has been marked as AVAILABLE and published across the CRM.",
      );
    },
    onError: (err) => toast.error("Failed to approve property", err.message),
  });

  const rejectMut = useMutation({
    mutationFn: (reason) => rejectProperty(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property", id] });
      queryClient.invalidateQueries({ queryKey: ["inventoryProperties"] });
      queryClient.invalidateQueries({ queryKey: ["propertyLogs", id] });
      queryClient.invalidateQueries({ queryKey: ["auditLogs"] });
      toast.info("Status Updated", "Property kept in review and feedback logged.");
    },
    onError: (err) => toast.error("Failed to update status", err.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-base text-slate-600 font-medium">
            Loading property details...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="bg-white border rounded-xl p-12 text-center max-w-lg mx-auto my-12 space-y-5">
        <Building2 className="w-14 h-14 text-muted-foreground/40 mx-auto" />
        <h3 className="text-xl font-bold text-slate-800">Property Not Found</h3>
        <p className="text-base text-muted-foreground">
          {error?.message ||
            "The requested property could not be found or may have been deleted."}
        </p>
        <Button
          onClick={handleBack}
          variant="outline"
          className="h-10 px-5 text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Inventory
        </Button>
      </div>
    );
  }

  const deal = getDealTypeTheme(property.dealType);
  const status = getStatusTheme(property.status);
  const displayPrice =
    property.dealType === "LEASE"
      ? formatPrice(property.monthlyRent, "LEASE")
      : formatPrice(property.price, property.dealType);

  const images =
    property.media?.filter(
      (m) => m.type === "IMAGE" || m.mimeType?.startsWith("image/"),
    ) || [];
  const documents =
    property.media?.filter(
      (m) => m.type !== "IMAGE" && !m.mimeType?.startsWith("image/"),
    ) || [];
  const activeImage = images[activeImageIndex] || images[0];

  const primaryArea = property.primaryArea || property.areas?.[0]?.value;
  const primaryUnit =
    property.primaryAreaUnit || property.areas?.[0]?.unit || "sq. ft.";

  const handleBack = () => {
    const savedQuery = sessionStorage.getItem("inventory_search_params");
    if (savedQuery) {
      navigate(`${basePath}?${savedQuery}`);
    } else {
      const savedPage = sessionStorage.getItem("inventory_page");
      if (savedPage && savedPage !== "1") {
        navigate(`${basePath}?page=${savedPage}`);
      } else {
        navigate(basePath);
      }
    }
  };

  const handleDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete "${property.title}"? This cannot be undone.`,
      )
    ) {
      deleteMut.mutate();
    }
  };

  return (
    <div className="w-full max-w-full min-w-0 space-y-7 pb-16 overflow-x-hidden">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-2 border-b border-border/70">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            className="rounded-full shadow-sm bg-white hover:bg-slate-50 border-slate-200 shrink-0 w-10 h-10"
            title="Back to Inventory"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Button>

          <div>
            <div className="text-xs font-semibold text-slate-500 flex items-center gap-2 uppercase tracking-wider mb-1">
              <span
                onClick={handleBack}
                className="cursor-pointer hover:text-slate-900 transition-colors"
              >
                Dashboard
              </span>
              <span>›</span>
              <span
                onClick={handleBack}
                className="cursor-pointer hover:text-slate-900 transition-colors"
              >
                Inventory
              </span>
              <span>›</span>
              <span className="font-bold text-slate-800 line-clamp-1 max-w-[320px]">
                {property.title}
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight">
                {property.title}
              </h1>
              <span
                className={`px-3 py-1 rounded-full border text-xs sm:text-sm font-semibold uppercase tracking-wider ${deal.badgeClass}`}
              >
                {deal.label}
              </span>
              <span
                className={`px-3 py-1 rounded-full border text-xs sm:text-sm font-semibold uppercase tracking-wider ${status.badgeClass}`}
              >
                {status.label}
              </span>
            </div>

            <p className="text-sm text-slate-600 flex items-center gap-2 mt-1.5 font-normal">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                {property.locality ? `${property.locality}, ` : ""}
                {property.city}
                {property.projectSociety ? ` (${property.projectSociety})` : ""}
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-semibold text-slate-700">
                {property.category} • {property.subcategory}
              </span>
            </p>
          </div>
        </div>

        {/* Action Buttons: 2x2 grid layout with full-width spanning (start-to-end) when a button is absent */}
        {(() => {
          const hasManageUnits = property.dealType === "BOOKING";
          const hasDelete = Boolean(isAdmin);
          const isPrintColSpan2 = !hasManageUnits && hasDelete;
          const isEditColSpan2 = hasManageUnits && !hasDelete;

          return (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 shrink-0 w-full sm:w-auto sm:min-w-[360px] self-start">
              {/* Print Property */}
              <Button
                variant="outline"
                onClick={() => navigate(`${basePath}/${property.id}/print`)}
                className={`w-full bg-white border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm h-10 px-3 shadow-xs flex items-center justify-center gap-2 ${
                  isPrintColSpan2 ? "col-span-2" : "col-span-1"
                }`}
                title="Print Property Dossier"
              >
                <Printer className="w-4 h-4 text-primary shrink-0" />
                Print Property
              </Button>

              {/* Manage Units */}
              {hasManageUnits && (
                <Button
                  variant="outline"
                  onClick={() => setIsUnitsOpen(true)}
                  className="col-span-1 w-full bg-white border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm h-10 px-3 flex items-center justify-center"
                >
                  <Layers className="w-4 h-4 mr-2 text-blue-600 shrink-0" />
                  <span className="truncate">
                    Manage Units ({property.units?.length || 0})
                  </span>
                </Button>
              )}

              {/* Edit Property */}
              <Button
                onClick={() => navigate(`${basePath}/${property.id}/edit`)}
                className={`w-full bg-primary hover:bg-brand-dark text-primary-foreground font-semibold text-sm h-10 px-3 shadow-sm flex items-center justify-center ${
                  isEditColSpan2 ? "col-span-2" : "col-span-1"
                }`}
              >
                <Edit className="w-4 h-4 mr-2 shrink-0" />
                Edit Property
              </Button>

              {/* Delete */}
              {hasDelete && (
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={deleteMut.isPending}
                  className="col-span-1 w-full bg-white border-danger/30 text-danger hover:bg-danger/10 hover:text-danger font-medium text-sm h-10 px-3 flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4 mr-2 shrink-0" />
                  {deleteMut.isPending ? "Deleting..." : "Delete"}
                </Button>
              )}
            </div>
          );
        })()}
      </div>

      {/* Pending Review & Approval Banner */}
      {property.status === "UNDER_REVIEW" && (
        <div className="bg-amber-50/90 border border-amber-300/80 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-amber-100 rounded-xl text-amber-800 shrink-0">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-amber-950 text-base">
                  Listing Under Review
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-200/80 text-amber-900">
                  Pending Admin Approval
                </span>
              </div>
              <p className="text-sm text-amber-900/90 mt-1">
                {property.createdByUser ? (
                  <>
                    Submitted by{" "}
                    <span className="font-semibold text-amber-950">
                      {property.createdByUser.name}
                    </span>{" "}
                    ({property.createdByUser.role || "Executive"})
                    {property.createdAt && (
                      <span className="text-amber-800/80">
                        {" "}
                        on{" "}
                        {new Date(property.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </span>
                    )}
                  </>
                ) : (
                  "Submitted for review by executive team. Review specifications below and approve to make live."
                )}
              </p>
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
              <Button
                onClick={() => setIsReviewDialogOpen(true)}
                disabled={rejectMut.isPending || approveMut.isPending}
                variant="outline"
                className="bg-white border-amber-300 text-amber-900 hover:bg-amber-100/70 text-sm font-semibold h-10 px-4"
              >
                <XCircle className="w-4 h-4 mr-1.5 text-amber-700" />
                Request Revision
              </Button>
              <Button
                onClick={() => approveMut.mutate()}
                disabled={approveMut.isPending || rejectMut.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold h-10 px-5 shadow-xs"
              >
                <CheckCircle className="w-4 h-4 mr-1.5" />
                {approveMut.isPending ? "Approving..." : "Approve Listing"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 5-Column Stats Cards (Matching /users ExecutivesStats layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Card 1: Price / Monthly Rent */}
        <div className="bg-white border border-border/70 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="text-sm text-slate-500 font-semibold uppercase tracking-wider">
            {property.dealType === "LEASE" ? "Monthly Rent" : "Price"}
          </div>
          <div className="mt-2.5">
            <span className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
              {displayPrice}
            </span>
            {property.pricePerUnitArea && (
              <span className="block text-sm text-slate-500 mt-1">
                ₹{Number(property.pricePerUnitArea).toLocaleString("en-IN")} /{" "}
                {primaryUnit}
              </span>
            )}
            {property.dealType === "LEASE" && property.securityDeposit && (
              <span className="block text-sm text-slate-500 mt-1">
                Deposit: {property.securityDeposit}
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Primary Area */}
        <div className="bg-white border border-border/70 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="text-sm text-slate-500 font-semibold uppercase tracking-wider">
            Primary Area
          </div>
          <div className="mt-2.5">
            <span className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
              {primaryArea ? Number(primaryArea).toLocaleString("en-IN") : "—"}{" "}
              <span className="text-sm font-normal text-slate-500">
                {primaryUnit}
              </span>
            </span>
            <span className="block text-sm text-slate-500 mt-1">
              {property.areas?.length || 1} Area Measurements
            </span>
          </div>
        </div>

        {/* Card 3: Configuration */}
        <div className="bg-white border border-border/70 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="text-sm text-slate-500 font-semibold uppercase tracking-wider">
            Configuration
          </div>
          <div className="mt-2.5">
            <span className="text-xl sm:text-2xl font-bold font-heading text-slate-900 line-clamp-1">
              {property.bhk && property.bhk.length > 0
                ? property.bhk.join(", ")
                : property.subcategory}
            </span>
            <span className="block text-sm text-slate-500 mt-1 truncate">
              {property.furnishing || "Unspecified"}
            </span>
          </div>
        </div>

        {/* Card 4: Project Status / Possession */}
        <div className="bg-white border border-border/70 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="text-sm text-slate-500 font-semibold uppercase tracking-wider">
            Project Status
          </div>
          <div className="mt-2.5">
            <span className="text-xl sm:text-2xl font-bold font-heading text-slate-900 line-clamp-1">
              {property.projectStatus ||
                property.availabilityStatus ||
                "Available"}
            </span>
            <span className="block text-sm text-slate-500 mt-1">
              {property.possessionMonth && property.possessionYear
                ? `Possession: ${property.possessionMonth} ${property.possessionYear}`
                : property.propertyAge
                  ? `Age: ${property.propertyAge}`
                  : "Ready to Move"}
            </span>
          </div>
        </div>

        {/* Card 5: Units / Facing */}
        <div className="bg-white border border-border/70 rounded-xl p-5 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="text-sm text-slate-500 font-semibold uppercase tracking-wider">
            {property.dealType === "BOOKING"
              ? "Inventory Units"
              : "Facing & Floor"}
          </div>
          <div className="mt-2.5">
            {property.dealType === "BOOKING" ? (
              <>
                <span className="text-2xl sm:text-3xl font-bold font-heading text-blue-600">
                  {property.units?.filter((u) => u.status === "AVAILABLE")
                    .length || 0}{" "}
                  <span className="text-sm font-normal text-slate-500">
                    / {property.units?.length || 0} Avail
                  </span>
                </span>
                <span className="block text-sm text-slate-500 mt-1">
                  {property.units?.filter((u) => u.status === "TAGGED")
                    .length || 0}{" "}
                  Tagged to Leads
                </span>
              </>
            ) : (
              <>
                <span className="text-xl sm:text-2xl font-bold font-heading text-slate-900">
                  {property.facingDirection || "East Facing"}
                </span>
                <span className="block text-sm text-slate-500 mt-1">
                  {property.floorNumber
                    ? `Floor ${property.floorNumber}`
                    : "Ground Floor"}{" "}
                  {property.totalFloors ? `of ${property.totalFloors}` : ""}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {/* Left Column: Media Gallery, Overview, Units, Amenities (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-7">
          {/* Media Gallery Card */}
          <div className="bg-white border border-border/70 rounded-xl p-6 shadow-sm space-y-5">
            <h3 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Property Gallery
            </h3>

            {images.length > 0 ? (
              <div className="space-y-4">
                {/* Featured Main Image */}
                <div className="w-full h-80 sm:h-96 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                  <img
                    src={activeImage?.url}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3.5 left-3.5 bg-black/70 backdrop-blur-md text-white text-sm font-medium px-3.5 py-1.5 rounded-lg">
                    {activeImage?.name ||
                      `Image ${activeImageIndex + 1} of ${images.length}`}
                  </div>
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-1.5">
                    {images.map((img, idx) => (
                      <button
                        key={img.id || idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-24 h-18 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                          activeImageIndex === idx
                            ? "border-primary shadow-sm ring-2 ring-primary/20 scale-102"
                            : "border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={img.name || `Thumb ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-64 rounded-xl bg-slate-50 border border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-6">
                <Building2 className="w-14 h-14 text-muted-foreground/30 mb-2.5" />
                <p className="text-base font-semibold text-slate-700">
                  No media uploaded yet
                </p>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Add photos, brochures, and layout drawings by editing this
                  property.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`${basePath}/${property.id}/edit`)}
                  className="mt-4 text-sm h-9"
                >
                  <Edit className="w-4 h-4 mr-1.5" /> Add Photos
                </Button>
              </div>
            )}

            {/* Documents List */}
            {documents.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <span className="text-sm font-semibold text-slate-800 block mb-3">
                  Attached Documents ({documents.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {documents.map((doc, idx) => (
                    <a
                      key={doc.id || idx}
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-sm text-slate-800 font-medium"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="truncate">
                          {doc.name || "Document"}
                        </span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description & Project Overview */}
          <div className="bg-white border border-border/70 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold font-heading text-slate-900">
              Project & Society Overview
            </h3>

            {property.description ? (
              <p className="text-base text-slate-700 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No description provided for this property.
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 pt-5 border-t border-slate-100 text-sm">
              <div>
                <span className="text-slate-500 font-medium block mb-1">
                  Developer
                </span>
                <span className="font-bold text-slate-900 text-base">
                  {property.developerName ||
                    property.developer?.name ||
                    "Independent"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block mb-1">
                  Project / Society
                </span>
                <span className="font-bold text-slate-900 text-base">
                  {property.projectSociety || "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block mb-1">
                  City & Locality
                </span>
                <span className="font-bold text-slate-900 text-base">
                  {property.locality ? `${property.locality}, ` : ""}
                  {property.city}
                </span>
              </div>
            </div>
          </div>

          {/* Booking Project Units Section (Only for BOOKING deal type) */}
          {property.dealType === "BOOKING" && (
            <div className="bg-white border border-border/70 rounded-xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-600" />
                    Project Units & Lead Tagging
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Individual inventory units available for booking and tagged
                    CRM leads
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsUnitsOpen(true)}
                  className="bg-primary hover:bg-brand-dark text-white text-sm h-9 px-4 font-semibold"
                >
                  Manage Units
                </Button>
              </div>

              {property.units && property.units.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                      <tr>
                        <th className="px-4 py-3">Unit Name</th>
                        <th className="px-4 py-3">Area</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Tagged Lead</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {property.units.map((unit) => {
                        const statusColors = {
                          AVAILABLE:
                            "bg-success/10 text-success border-success/30",
                          TAGGED: "bg-blue-50 text-blue-700 border-blue-200",
                          BOOKED:
                            "bg-warning/10 text-warning border-warning/30",
                          SOLD: "bg-purple/10 text-purple border-purple/30",
                        };

                        return (
                          <tr
                            key={unit.id}
                            className="hover:bg-slate-50/80 transition-colors"
                          >
                            <td className="px-4 py-3.5 font-bold text-slate-900">
                              {unit.unitName}
                            </td>
                            <td className="px-4 py-3.5 text-slate-700 font-medium">
                              {unit.area} {unit.areaUnit}
                            </td>
                            <td className="px-4 py-3.5 font-bold text-slate-900">
                              ₹{Number(unit.price).toLocaleString("en-IN")}
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`px-2.5 py-1 rounded-full border text-xs font-semibold uppercase ${
                                  statusColors[unit.status] || "bg-slate-100"
                                }`}
                              >
                                {unit.status}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-slate-800">
                              {unit.lead ? (
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-blue-600 shrink-0" />
                                  <span className="font-semibold text-blue-700">
                                    {unit.lead.firstName} {unit.lead.lastName}
                                  </span>
                                  {unit.lead.phone && (
                                    <span className="text-slate-400 text-xs">
                                      ({unit.lead.phone})
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">
                                  Unassigned
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-7 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-sm">
                  No project units created yet. Click "Manage Units" to add
                  units for booking.
                </div>
              )}
            </div>
          )}

          {/* USPs & Amenities */}
          <div className="bg-white border border-border/70 rounded-xl p-6 shadow-sm space-y-5">
            <h3 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              USPs & Key Highlights
            </h3>

            {property.usps && property.usps.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {property.usps.map((usp, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-semibold text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    {usp}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No USPs specified.
              </p>
            )}

            <h4 className="text-base font-bold font-heading text-slate-900 pt-4 border-t border-slate-100">
              Project Amenities
            </h4>

            {property.amenities && property.amenities.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {property.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 text-sm font-medium"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    {amenity}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No amenities specified.
              </p>
            )}
          </div>

          {/* Audit Trail & Change History Card (Admin Only) */}
          {isAdmin && (
            <div className="bg-white border border-border/70 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Audit Trail & Change History
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                    {auditLogs.length} events
                  </span>
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    navigate(
                      `/admin/logs?search=${encodeURIComponent(
                        property.title
                      )}`
                    )
                  }
                  className="text-xs font-semibold text-primary hover:text-brand-dark"
                >
                  View in Logs <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>

              {auditLogs.length === 0 ? (
                <p className="text-sm text-slate-400 italic">
                  No modifications recorded yet for this property.
                </p>
              ) : (
                <div className="space-y-3 divide-y divide-slate-100">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="pt-3 first:pt-0 flex items-start justify-between gap-3 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900">{log.userName || "System"}</span>
                          {log.userRole && (
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                              {log.userRole}
                            </span>
                          )}
                          <span className="text-xs text-slate-400">
                            {new Date(log.createdAt).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{log.summary}</p>
                      </div>
                      <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {log.action}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Pricing & Terms, Area Breakdown, Specs, Contacts (1 col on lg) */}
        <div className="space-y-7">
          {/* Quick Share & Print Actions Card */}

          {/* Commercial & Pricing Card */}
          <div className="bg-white border border-border/70 rounded-xl p-6 shadow-sm space-y-5">
            <h3 className="text-lg font-bold font-heading text-slate-900">
              {property.dealType === "LEASE"
                ? "Lease & Commercial Terms"
                : "Pricing & Payment Terms"}
            </h3>

            <div className="space-y-3.5 text-sm">
              {property.dealType === "LEASE" ? (
                <>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">
                      Monthly Rent
                    </span>
                    <span className="font-bold text-slate-900 text-base">
                      {displayPrice}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">
                      Security Deposit
                    </span>
                    <span className="font-semibold text-slate-800">
                      {property.securityDeposit || "2 Months"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">
                      Maintenance Charges
                    </span>
                    <span className="font-semibold text-slate-800">
                      {property.maintenanceCharges
                        ? `₹${Number(property.maintenanceCharges).toLocaleString("en-IN")} (${property.maintenanceFrequency || "Monthly"})`
                        : "Included"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">
                      Lease Duration
                    </span>
                    <span className="font-semibold text-slate-800">
                      {property.leaseDuration
                        ? `${property.leaseDuration} Months`
                        : "11 Months"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">
                      Lock-in Period
                    </span>
                    <span className="font-semibold text-slate-800">
                      {property.lockInPeriod
                        ? `${property.lockInPeriod} Months`
                        : "None"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">
                      Available For
                    </span>
                    <span className="font-semibold text-slate-800">
                      {property.availableFor?.join(", ") || "All"}
                    </span>
                  </div>
                  {property.preLeased && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 mt-3 space-y-1">
                      <span className="font-bold text-emerald-900 block text-sm">
                        Pre-Leased Commercial Asset
                      </span>
                      {property.roiPercentage && (
                        <span className="text-emerald-700 text-sm font-semibold block">
                          ROI: {property.roiPercentage}%
                        </span>
                      )}
                      {property.preLeasedDetails && (
                        <p className="text-emerald-700 text-xs mt-1">
                          {property.preLeasedDetails}
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">
                      Total Price
                    </span>
                    <span className="font-bold text-slate-900 text-base">
                      {displayPrice}
                    </span>
                  </div>
                  {property.pricePerUnitArea && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">
                        Price per {primaryUnit}
                      </span>
                      <span className="font-bold text-slate-800">
                        ₹
                        {Number(property.pricePerUnitArea).toLocaleString(
                          "en-IN",
                        )}
                      </span>
                    </div>
                  )}
                  {property.paymentPlan && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">
                        Payment Plan
                      </span>
                      <span className="font-semibold text-slate-800">
                        {property.paymentPlan}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Multi-Area Breakdown Card */}
          <div className="bg-white border border-border/70 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <Maximize2 className="w-5 h-5 text-primary" />
              Area & Dimensional Details
            </h3>

            {property.areas && property.areas.length > 0 ? (
              <div className="divide-y divide-slate-100 text-sm">
                {property.areas.map((a, idx) => (
                  <div
                    key={a.id || idx}
                    className="py-2.5 flex items-center justify-between"
                  >
                    <span className="font-medium text-slate-600">
                      {a.areaType}
                    </span>
                    <span className="font-bold text-slate-900">
                      {Number(a.value).toLocaleString("en-IN")} {a.unit}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Primary Area: {primaryArea} {primaryUnit}
              </p>
            )}

            {/* Plot Specific Dimensions */}
            {property.plotShape && (
              <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 text-sm space-y-2 mt-3">
                <span className="font-bold text-slate-900 block">
                  Plot Specifications
                </span>
                <div className="flex justify-between text-slate-700">
                  <span>Plot Shape:</span>
                  <span className="font-semibold text-slate-900">
                    {property.plotShape}
                  </span>
                </div>
                {property.plotLength && property.plotBreadth && (
                  <div className="flex justify-between text-slate-700">
                    <span>Dimensions:</span>
                    <span className="font-semibold text-slate-900">
                      {property.plotLength} x {property.plotBreadth} m
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-700">
                  <span>Boundary Wall:</span>
                  <span className="font-semibold text-slate-900">
                    {property.boundaryWall ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Physical Specifications */}
          <div className="bg-white border border-border/70 rounded-xl p-6 shadow-sm space-y-4 text-sm">
            <h3 className="text-lg font-bold font-heading text-slate-900">
              Structural & Property Details
            </h3>

            <div className="grid grid-cols-2 gap-3.5 pt-1">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium block text-xs">
                  Furnishing
                </span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {property.furnishing || "Unfurnished"}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium block text-xs">
                  Facing Direction
                </span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {property.facingDirection || "North-East"}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium block text-xs">
                  Floor / Total
                </span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {property.floorNumber ? `${property.floorNumber}` : "1"}{" "}
                  {property.totalFloors ? `of ${property.totalFloors}` : ""}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium block text-xs">
                  Parking
                </span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {property.numberOfParkings || 1} (
                  {property.parkingType || "Covered"})
                </span>
              </div>
            </div>

            {property.servantPujaStore &&
              property.servantPujaStore.length > 0 && (
                <div className="pt-2">
                  <span className="text-slate-500 font-medium block text-xs mb-1.5">
                    Additional Rooms:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {property.servantPujaStore.map((r, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 text-xs font-semibold"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Contact Details & RBAC Protection Card */}
          <div className="bg-white border border-border/70 rounded-xl p-6 shadow-sm space-y-4 text-sm">
            <h3 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Contact Information
            </h3>

            {property.dealType === "BOOKING" ? (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Developer Sales Representative
                </span>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                  <p className="font-bold text-slate-900 text-base">
                    {property.developerContactName || "Developer Sales Desk"}
                  </p>
                  {property.developerContactDesignation && (
                    <p className="text-slate-600 text-sm font-medium">
                      {property.developerContactDesignation}
                    </p>
                  )}
                  {property.developerContactNumber && (
                    <a
                      href={`tel:${property.developerContactNumber}`}
                      className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline pt-1 text-sm"
                    >
                      <Phone className="w-4 h-4" />
                      {property.developerContactNumber}
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Seller / Owner Details
                  </span>
                  {!isAdmin && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                      <Lock className="w-3.5 h-3.5" /> Admin Protected
                    </span>
                  )}
                </div>

                {isAdmin ? (
                  <div className="space-y-3">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900 text-base">
                          {property.sellerName || "Unspecified Seller"}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5" /> Full Admin Access
                        </span>
                      </div>
                      {property.sellerPhone ? (
                        <a
                          href={`tel:${property.sellerPhone}`}
                          className="inline-flex items-center gap-2 text-primary font-semibold hover:underline pt-1 text-sm"
                        >
                          <Phone className="w-4 h-4" />
                          {property.sellerPhone}
                        </a>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No phone number recorded</p>
                      )}
                    </div>

                    {/* Admin Clearance Requests Banner */}
                    {clearanceRequest && (
                      <div
                        className={`p-3.5 rounded-xl border text-xs space-y-2.5 ${
                          clearanceRequest.status === "APPROVED"
                            ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                            : clearanceRequest.status === "QUERY_ASKED"
                            ? "bg-blue-50/80 border-blue-200 text-blue-900"
                            : clearanceRequest.status === "REJECTED"
                            ? "bg-rose-50/80 border-rose-200 text-rose-900"
                            : "bg-amber-50/80 border-amber-200 text-amber-900"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold">
                            {clearanceRequest.status === "APPROVED" ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : clearanceRequest.status === "QUERY_ASKED" ? (
                              <HelpCircle className="w-4 h-4 text-blue-600" />
                            ) : clearanceRequest.status === "REJECTED" ? (
                              <XCircle className="w-4 h-4 text-rose-600" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-amber-600" />
                            )}
                            <span>
                              {clearanceRequest.status === "APPROVED"
                                ? `Clearance Granted for ${clearanceRequest.requestedBy}`
                                : clearanceRequest.status === "QUERY_ASKED"
                                ? `Query Sent to ${clearanceRequest.requestedBy}`
                                : clearanceRequest.status === "REJECTED"
                                ? `Clearance Declined for ${clearanceRequest.requestedBy}`
                                : `Clearance Requested by ${clearanceRequest.requestedBy}`}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {new Date(clearanceRequest.requestedAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        <div className="text-[11px] bg-white/70 p-2.5 rounded-lg border border-border/40 space-y-1 text-slate-700">
                          <div>
                            <span className="text-slate-500 font-medium">Reason: </span>
                            <span className="font-semibold text-slate-900">
                              {clearanceRequest.reason}
                            </span>
                          </div>
                          {clearanceRequest.clientName && (
                            <div>
                              <span className="text-slate-500 font-medium">Client: </span>
                              <span className="font-semibold text-slate-900">
                                {clearanceRequest.clientName}
                              </span>
                            </div>
                          )}
                          {clearanceRequest.notes && (
                            <div>
                              <span className="text-slate-500 font-medium">Notes: </span>
                              <span className="italic text-slate-700">
                                "{clearanceRequest.notes}"
                              </span>
                            </div>
                          )}
                          {clearanceRequest.adminFeedback && clearanceRequest.status === "QUERY_ASKED" && (
                            <div className="mt-1 pt-1 border-t border-slate-200 text-blue-800">
                              <span className="font-semibold text-[10px] block text-blue-700">Admin Query:</span>
                              <span className="italic">"{clearanceRequest.adminFeedback}"</span>
                            </div>
                          )}
                          {clearanceRequest.adminFeedback && clearanceRequest.status === "REJECTED" && (
                            <div className="mt-1 pt-1 border-t border-slate-200 text-rose-800">
                              <span className="font-semibold text-[10px] block text-rose-700">Rejection Reason:</span>
                              <span>{clearanceRequest.adminFeedback}</span>
                            </div>
                          )}
                          {clearanceRequest.executiveReply && (
                            <div className="mt-1 pt-1 border-t border-slate-200 text-emerald-800 bg-emerald-50/70 p-1.5 rounded">
                              <span className="font-bold text-[10px] block text-emerald-700">Executive Reply:</span>
                              <span>{clearanceRequest.executiveReply}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                          {clearanceRequest.status !== "APPROVED" ? (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                onClick={handleGrantClearance}
                                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5 mr-1" /> Grant Clearance
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setAdminQueryText("");
                                  setIsAdminQueryModalOpen(true);
                                }}
                                className="h-7 text-xs text-amber-700 border-amber-300 hover:bg-amber-50 cursor-pointer font-medium"
                              >
                                <HelpCircle className="w-3.5 h-3.5 mr-1" /> Ask Query
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setAdminRejectText("");
                                  setIsAdminRejectModalOpen(true);
                                }}
                                className="h-7 text-xs text-rose-700 border-rose-300 hover:bg-rose-50 cursor-pointer font-medium"
                              >
                                <X className="w-3.5 h-3.5 mr-1" /> Reject
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleDismissRequest}
                                className="h-7 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                              >
                                Dismiss
                              </Button>
                            </>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleRevokeClearance}
                              className="h-7 text-xs text-amber-700 border-amber-300 hover:bg-amber-100 cursor-pointer"
                            >
                              Revoke Clearance
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : clearanceRequest?.status === "APPROVED" ? (
                  <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 text-emerald-950 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Clearance Granted by Admin
                      </span>
                      <span className="text-[10px] bg-emerald-200/60 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                        Authorized
                      </span>
                    </div>
                    <div className="bg-white/80 p-3 rounded-lg border border-emerald-200/80 space-y-1.5">
                      <p className="text-xs text-slate-500 font-medium">Seller / Owner:</p>
                      <p className="font-bold text-slate-900 text-base">
                        {clearanceRequest.sellerName || property.sellerName || "Direct Seller"}
                      </p>
                      {(clearanceRequest.sellerContact ||
                        (property.sellerPhone &&
                          property.sellerPhone !== "Hidden (Admin Only)")) && (
                        <a
                          href={`tel:${clearanceRequest.sellerContact || property.sellerPhone}`}
                          className="inline-flex items-center gap-2 text-primary font-semibold hover:underline pt-1 text-sm"
                        >
                          <Phone className="w-4 h-4" />
                          {clearanceRequest.sellerContact || property.sellerPhone}
                        </a>
                      )}
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      Clearance active for client site visit and negotiation.
                    </p>
                  </div>
                ) : clearanceRequest?.status === "QUERY_ASKED" ? (
                  /* Executive View: Admin asked a Query */
                  <div className="bg-amber-50/90 p-4 rounded-xl border border-amber-200 text-amber-950 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-1.5 text-amber-900">
                        <MessageSquare className="w-4 h-4 text-amber-600" />
                        Action Required: Administrator Query
                      </span>
                      <span className="text-[10px] bg-amber-200 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                        Clarification Needed
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-amber-200 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500">
                        Administrator question:
                      </span>
                      <p className="text-xs text-slate-900 font-medium whitespace-pre-wrap">
                        "{clearanceRequest.adminFeedback}"
                      </p>
                      <span className="text-[10px] text-slate-400 block pt-0.5">
                        Asked by {clearanceRequest.adminName || "Admin"} •{" "}
                        {new Date(
                          clearanceRequest.adminActionAt || clearanceRequest.requestedAt
                        ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <form onSubmit={handleExecutiveReplySubmit} className="space-y-2 pt-1">
                      <Label className="text-xs font-semibold text-slate-700">
                        Your Response to Administrator:
                      </Label>
                      <Textarea
                        rows={2}
                        required
                        value={executiveReplyText}
                        onChange={(e) => setExecutiveReplyText(e.target.value)}
                        placeholder="Provide details, budget confirmation, or schedule..."
                        className="text-xs resize-none bg-white"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isExecutiveReplying}
                        className="w-full h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                        {isExecutiveReplying ? "Submitting..." : "Send Reply to Administrator"}
                      </Button>
                    </form>
                  </div>
                ) : clearanceRequest?.status === "REJECTED" ? (
                  /* Executive View: Admin Declined */
                  <div className="bg-rose-50/90 p-4 rounded-xl border border-rose-200 text-rose-950 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-1.5 text-rose-800">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        Clearance Request Declined
                      </span>
                      <span className="text-[10px] bg-rose-200 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                        Declined
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-rose-200 text-xs text-slate-700 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500">
                        Administrator feedback:
                      </span>
                      <p className="italic text-slate-900">"{clearanceRequest.adminFeedback}"</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setClearanceRequest(null);
                        setIsRequestSellerOpen(true);
                      }}
                      className="w-full h-8 text-xs text-rose-800 border-rose-300 hover:bg-rose-100 cursor-pointer"
                    >
                      Submit New Clearance Request
                    </Button>
                  </div>
                ) : clearanceRequest?.status === "PENDING" ? (
                  <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 text-amber-950 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-1.5 text-amber-800">
                        <Clock className="w-4 h-4 text-amber-600" />
                        Clearance Request Pending
                      </span>
                      <span className="text-[10px] bg-amber-200/60 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                        Under Admin Review
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-normal">
                      Your request was submitted on{" "}
                      <span className="font-semibold text-slate-800">
                        {new Date(clearanceRequest.requestedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      .
                    </p>
                    <div className="text-[11px] bg-white/70 p-2.5 rounded-lg border border-amber-200/60 space-y-1 text-slate-700">
                      <div>
                        <span className="text-slate-500 font-medium">Reason: </span>
                        <span className="font-semibold text-slate-900">
                          {clearanceRequest.reason}
                        </span>
                      </div>
                      {clearanceRequest.clientName && (
                        <div>
                          <span className="text-slate-500 font-medium">Client: </span>
                          <span className="font-semibold text-slate-900">
                            {clearanceRequest.clientName}
                          </span>
                        </div>
                      )}
                      {clearanceRequest.notes && (
                        <div>
                          <span className="text-slate-500 font-medium">Notes: </span>
                          <span className="italic text-slate-700">
                            "{clearanceRequest.notes}"
                          </span>
                        </div>
                      )}
                      {clearanceRequest.executiveReply && (
                        <div className="mt-1 pt-1 border-t border-amber-200 text-emerald-800">
                          <span className="font-bold text-[10px] block text-emerald-700">
                            Your Latest Reply:
                          </span>
                          <span className="text-slate-800">{clearanceRequest.executiveReply}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsRequestSellerOpen(true)}
                      className="w-full h-8 text-xs text-amber-800 border-amber-300 hover:bg-amber-100 cursor-pointer"
                    >
                      Update Clearance Request
                    </Button>
                  </div>
                ) : (
                  /* Initial Executive View - Request Seller Info Button */
                  <div className="bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 p-4 rounded-xl border border-amber-200/80 space-y-3 shadow-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
                        <div className="p-1.5 bg-amber-100 rounded-lg text-amber-700">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <span>Confidential Seller Info</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Seller contact details are restricted to Administrator oversight. If you have an active client ready to inspect this property or negotiate terms, submit a clearance request.
                    </p>

                    <Button
                      type="button"
                      onClick={() => setIsRequestSellerOpen(true)}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs h-9 shadow-xs gap-2 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Request Seller Info
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Units Dialog (for Booking Deal Type) */}
      <ProjectUnitsDialog
        property={property}
        isOpen={isUnitsOpen}
        setIsOpen={setIsUnitsOpen}
        masterData={masterData}
        onUnitsUpdated={() => {
          queryClient.invalidateQueries({ queryKey: ["property", id] });
          queryClient.invalidateQueries({ queryKey: ["inventoryProperties"] });
        }}
        isAdmin={isAdmin}
      />

      {/* Review & Revision Feedback Dialog */}
      {isReviewDialogOpen && (
        <ReviewActionDialog
          isOpen={isReviewDialogOpen}
          onClose={() => setIsReviewDialogOpen(false)}
          property={property}
          onSubmitFeedback={(id, reason) => {
            setIsReviewDialogOpen(false);
            rejectMut.mutate(reason);
          }}
          isPending={rejectMut.isPending}
        />
      )}

      {/* Request Seller Info Clearance Dialog */}
      <Dialog open={isRequestSellerOpen} onOpenChange={setIsRequestSellerOpen}>
        <DialogContent className="sm:max-w-lg p-6 bg-white rounded-xl shadow-lg border">
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center gap-2 text-amber-700">
              <div className="p-2 bg-amber-100 rounded-lg">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
              </div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Request Seller Info Clearance
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500">
              Submit a formal clearance request to access seller/landlord contact information for{" "}
              <strong className="text-slate-700 font-semibold">{property?.title}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRequestSellerSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Clearance Reason <span className="text-destructive">*</span>
              </Label>
              <select
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              >
                <option value="Client Site Visit Scheduled">Client Site Visit Scheduled</option>
                <option value="Buyer Ready for Direct Negotiation">Buyer Ready for Direct Negotiation</option>
                <option value="Document & Title Deed Verification">Document & Title Deed Verification</option>
                <option value="Pricing / Payment Term Clarification">Pricing / Payment Term Clarification</option>
                <option value="Urgent Landlord Query on Lease Terms">Urgent Landlord Query on Lease Terms</option>
                <option value="Other Business Justification">Other Business Justification</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Prospective Client / Lead Name <span className="text-slate-400 font-normal">(Optional)</span>
              </Label>
              <Input
                placeholder="e.g. Vikram Kapoor"
                value={requestClientName}
                onChange={(e) => setRequestClientName(e.target.value)}
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Additional Notes / Context <span className="text-slate-400 font-normal">(Optional)</span>
              </Label>
              <Textarea
                rows={3}
                placeholder="Explain the client requirement or urgency for the administrator..."
                value={requestNotes}
                onChange={(e) => setRequestNotes(e.target.value)}
                className="text-sm resize-none"
              />
            </div>

            <DialogFooter className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsRequestSellerOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmittingRequest}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium cursor-pointer gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmittingRequest ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Admin Ask Query Dialog */}
      <Dialog open={isAdminQueryModalOpen} onOpenChange={setIsAdminQueryModalOpen}>
        <DialogContent className="sm:max-w-md p-6 bg-white rounded-xl shadow-xl border">
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                <MessageSquare className="w-5 h-5 text-amber-600" />
              </div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Ask Clarification Query
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500">
              Send a query to <strong className="text-slate-700">{clearanceRequest?.requestedBy}</strong> regarding this clearance request.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAskQuerySubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Question / Query for Executive <span className="text-destructive">*</span>
              </Label>
              <Textarea
                rows={3}
                required
                value={adminQueryText}
                onChange={(e) => setAdminQueryText(e.target.value)}
                placeholder="e.g. Please confirm if the client has visited similar projects, or what is their exact budget?"
                className="text-sm resize-none"
              />
            </div>

            <DialogFooter className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAdminQueryModalOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium cursor-pointer gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Send Query
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Admin Reject Clearance Dialog */}
      <Dialog open={isAdminRejectModalOpen} onOpenChange={setIsAdminRejectModalOpen}>
        <DialogContent className="sm:max-w-md p-6 bg-white rounded-xl shadow-xl border">
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-rose-100 rounded-lg text-rose-700">
                <X className="w-5 h-5 text-rose-600" />
              </div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Decline Clearance Request
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500">
              Decline seller info clearance for <strong className="text-slate-700">{clearanceRequest?.requestedBy}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRejectRequestSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Rejection Reason / Guidance
              </Label>
              <Textarea
                rows={3}
                value={adminRejectText}
                onChange={(e) => setAdminRejectText(e.target.value)}
                placeholder="e.g. Seller details cannot be shared at this stage or client verification is pending."
                className="text-sm resize-none"
              />
            </div>

            <DialogFooter className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAdminRejectModalOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white font-medium cursor-pointer gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                Confirm Rejection
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyDetailPage;
