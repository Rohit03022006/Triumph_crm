import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import {
  Building2,
  ArrowRight,
  Clock,
  User,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchProperties } from "@/api/inventory";

const formatPrice = (price) => {
  if (!price && price !== 0) return "Price on Request";
  const num = Number(price);
  if (isNaN(num)) return `₹${price}`;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(0)} K`;
  return `₹${num.toLocaleString("en-IN")}`;
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
};

const PropertyApprovedCard = ({ pendingCount = 0 }) => {
  const navigate = useNavigate();

  // Fetch pending review properties first; if none, fetch recent properties
  const { data, isLoading } = useQuery({
    queryKey: ["approved-preview-properties"],
    queryFn: async () => {
      // First try to fetch under_review
      const pendingRes = await fetchProperties({
        page: 1,
        limit: 5,
        status: "UNDER_REVIEW",
      });

      if (pendingRes?.data && pendingRes.data.length > 0) {
        return { items: pendingRes.data, isPending: true };
      }

      // If no under_review, fetch recent submissions
      const recentRes = await fetchProperties({ page: 1, limit: 5 });
      return { items: recentRes?.data || [], isPending: false };
    },
    staleTime: 30 * 1000,
  });

  const previewItems = data?.items || [];
  const isPendingList = data?.isPending || false;

  return (
    <div className="bg-white border border-border/70 rounded-xl p-6 shadow-xs flex flex-col justify-between h-full space-y-5">
      {/* Card Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Property Approvals
              </h3>
              <p className="text-xs text-slate-500">
                Executive submissions & publication review
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

        <p className="text-xs text-slate-600 leading-relaxed">
          Review and approve inventory listings submitted by sales executives.
          Verify documentation, pricing, and project specs before going live.
        </p>
      </div>

      {/* Submissions Preview List */}
      <div className="space-y-2 flex-1">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100">
          <span>{isPendingList ? "Awaiting Review" : "Recent Submissions"}</span>
          <span>Status</span>
        </div>

        {isLoading ? (
          <div className="space-y-2 py-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-12 bg-slate-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : previewItems.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No property submissions found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {previewItems.map((item) => {
              const creatorName =
                item.creator?.fullName ||
                (item.creator?.firstName
                  ? `${item.creator.firstName} ${item.creator.lastName || ""}`.trim()
                  : "Executive");
              const creatorInitial = creatorName.charAt(0).toUpperCase() || "E";
              const title = item.title || item.projectName || "Untitled Property";

              return (
                <div
                  key={item.id}
                  onClick={() => navigate("/admin/approved/properties")}
                  className="py-2.5 px-2 -mx-2 rounded-lg hover:bg-slate-50/80 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                      {creatorInitial}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-slate-800 truncate max-w-[140px] sm:max-w-[180px]">
                          {title}
                        </span>
                        {item.dealType && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                            {item.dealType}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          {creatorName}
                        </span>
                        {item.locality && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 truncate max-w-[100px]">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {item.locality}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span className="font-medium text-slate-700">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {item.status === "UNDER_REVIEW" ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        Pending
                      </span>
                    ) : item.status === "ACTIVE" ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Live
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
                        {item.status || "Draft"}
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
      <div className="pt-2 border-t border-slate-100">
        <Button
          onClick={() => navigate("/admin/approved/properties")}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm h-10 shadow-xs flex items-center justify-center gap-2 transition-all"
        >
          <span>View All Property Approvals</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default PropertyApprovedCard;

