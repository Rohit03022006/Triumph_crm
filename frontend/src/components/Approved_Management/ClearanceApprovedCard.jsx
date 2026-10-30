import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import {
  ShieldAlert,
  ArrowRight,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchClearanceRequests } from "@/api/inventory";

const formatRelativeTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 60) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
};

const ClearanceApprovedCard = () => {
  const navigate = useNavigate();

  const { data: allRequests = [], isLoading } = useQuery({
    queryKey: ["clearanceRequests", "all"],
    queryFn: () => fetchClearanceRequests({ all: "true" }),
    staleTime: 10 * 1000,
  });

  const pendingRequests = allRequests.filter((r) => r.status === "PENDING");
  const pendingCount = pendingRequests.length;
  const previewItems = allRequests.slice(0, 5);

  return (
    <div className="bg-card border border-border/70 rounded-xl p-6 shadow-xs flex flex-col justify-between h-full space-y-5">
      {/* Card Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber/10 border border-amber/20 flex items-center justify-center text-amber shadow-2xs">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground font-heading">
                Seller Clearance Requests
              </h3>
              <p className="text-xs text-muted-foreground">
                Executive access requests for confidential seller contact details
              </p>
            </div>
          </div>

          {pendingCount > 0 ? (
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
              {pendingCount} Pending
            </span>
          ) : (
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              All Up to Date
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Review and approve executive authorization requests to access
          confidential seller and landlord contact details for client
          negotiations.
        </p>
      </div>

      {/* Submissions Preview List */}
      <div className="space-y-2 flex-1">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-1 border-b border-border/60">
          <span>
            {pendingCount > 0
              ? `Awaiting Clearance (${pendingCount})`
              : "Recent Requests"}
          </span>
          <span>Status</span>
        </div>

        {isLoading ? (
          <div className="space-y-2 py-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-12 bg-muted/50 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : previewItems.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">
            No seller clearance requests found.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {previewItems.map((item) => {
              const creatorName = item.requestedBy || "Executive";
              const creatorInitial =
                creatorName.charAt(0).toUpperCase() || "E";
              const title = item.propertyTitle || "Property Listing";

              return (
                <div
                  key={item.propertyId}
                  onClick={() => navigate("/admin/approved/requests")}
                  className="py-2.5 px-2 -mx-2 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-muted text-foreground font-semibold text-xs flex items-center justify-center shrink-0 border border-border">
                      {creatorInitial}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-[140px] sm:max-w-[200px]">
                          {title}
                        </span>
                        {item.reason && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-muted text-foreground/80 truncate max-w-[120px]">
                            {item.reason}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-muted-foreground" />
                          {creatorName}
                        </span>
                        {item.clientName && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[100px]">
                              Client: {item.clientName}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span className="text-muted-foreground flex items-center gap-0.5">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          {formatRelativeTime(item.requestedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {item.status === "PENDING" ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
                        Pending
                      </span>
                    ) : item.status === "APPROVED" ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Approved
                      </span>
                    ) : item.status === "QUERY_ASKED" ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-blue-600" />
                        Queried
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        Declined
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Card Action: View All */}
      <div className="pt-2 border-t border-border/60">
        <Button
          onClick={() => navigate("/admin/approved/requests")}
          className="w-full bg-primary hover:bg-brand-dark text-primary-foreground font-semibold text-sm h-10 shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>View All Clearance Requests ({allRequests.length})</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ClearanceApprovedCard;
