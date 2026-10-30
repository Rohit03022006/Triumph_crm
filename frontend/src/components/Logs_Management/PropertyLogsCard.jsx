import React from "react";
import { useNavigate } from "react-router";
import {
  Building2,
  ArrowRight,
  Clock,
  User,
  Eye,
  FileEdit,
  PlusCircle,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

const getActionBadge = (action) => {
  switch (action) {
    case "CREATED":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <PlusCircle className="w-3 h-3" /> Created
        </span>
      );
    case "UPDATED":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <FileEdit className="w-3 h-3" /> Updated
        </span>
      );
    case "STATUS_CHANGED":
    case "STATUS_CHANGE":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <CheckCircle2 className="w-3 h-3" /> Status
        </span>
      );
    case "DELETED":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <Trash2 className="w-3 h-3" /> Deleted
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
          {action || "Modified"}
        </span>
      );
  }
};

const PropertyLogsCard = ({ logs = [], totalCount = 0, isLoading = false, onSelectLog }) => {
  const navigate = useNavigate();

  // Show top 5 recent logs
  const previewLogs = logs.slice(0, 5);

  return (
    <div className="bg-card border border-border/70 rounded-xl p-6 shadow-xs flex flex-col justify-between h-full space-y-5">
      {/* Card Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground font-heading">
                Property Audit Trail
              </h3>
              <p className="text-xs text-muted-foreground">
                Live inventory modifications & executive actions
              </p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            {totalCount} Total Logs
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Audit history for all residential and commercial inventory. Every field
          edit, price revision, and approval status movement is logged with user attribution.
        </p>
      </div>

      {/* Recent Activity Preview List */}
      <div className="space-y-2 flex-1">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-1 border-b border-border/60">
          <span>Recent Activity</span>
          <span>Latest Changes</span>
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
        ) : previewLogs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No audit logs recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {previewLogs.map((log) => {
              const userName =
                log.user?.fullName ||
                (log.user?.firstName
                  ? `${log.user.firstName} ${log.user.lastName || ""}`.trim()
                  : "System");
              const userInitial = userName.charAt(0).toUpperCase() || "U";
              const propertyTitle =
                log.inventory?.title ||
                log.inventory?.projectName ||
                `Property #${log.inventoryId || ""}`;
              const dealType = log.inventory?.dealType;

              return (
                <div
                  key={log.id}
                  onClick={() => onSelectLog && onSelectLog(log)}
                  className="py-2.5 px-2 -mx-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-muted text-foreground font-semibold text-xs flex items-center justify-center shrink-0 border border-border">
                      {userInitial}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-foreground truncate max-w-[140px] sm:max-w-[180px]">
                          {propertyTitle}
                        </span>
                        {dealType && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-muted text-foreground">
                            {dealType}
                          </span>
                        )}
                        {getActionBadge(log.action)}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-muted-foreground" />
                          {userName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          {formatRelativeTime(log.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground group-hover:text-primary transition-colors shrink-0"
                    title="View Change Diff"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Card Action: View All */}
      <div className="pt-2 border-t border-border/60">
        <Button
          onClick={() => navigate("/admin/logs/properties")}
          className="w-full bg-primary hover:bg-brand-dark text-primary-foreground font-semibold text-sm h-10 shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
        >
          <span>View All Property Logs</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default PropertyLogsCard;

