import React from "react";
import { useNavigate } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Clock,
  User,
  Building2,
  MapPin,
  Calendar,
  AlertCircle,
  MoreVertical,
  Printer,
} from "lucide-react";
import {
  formatPrice,
  getDealTypeTheme,
  getStatusTheme,
} from "@/components/Inventory_Management/InventoryTable";

const formatDateTime = (isoStr) => {
  if (!isoStr) return { date: "—", time: "" };
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
    return { date, time };
  } catch {
    return { date: isoStr, time: "" };
  }
};

const ApprovedTable = ({
  properties = [],
  isLoading,
  onApprove,
  onRequestRevision,
  isActionPending,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 bg-card rounded-b-xl border border-t-0 border-border/70">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">
            Loading submissions...
          </p>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card rounded-b-xl border border-t-0 border-border/70 text-center px-4">
        <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-3">
          <CheckCircle className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-foreground">
          No Inventory Submissions Found
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mt-1">
          There are currently no inventory submissions matching your filter criteria. Newly created executive inventory will appear here for review.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-b-xl border border-t-0 border-border/70 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-b border-border/70">
              <TableHead className="font-bold text-foreground/80 text-xs uppercase tracking-wider py-3.5 px-4">
                Property & Project
              </TableHead>
              <TableHead className="font-bold text-foreground/80 text-xs uppercase tracking-wider py-3.5 px-4">
                Deal & Category
              </TableHead>
              <TableHead className="font-bold text-foreground/80 text-xs uppercase tracking-wider py-3.5 px-4">
                Price & Area
              </TableHead>
              <TableHead className="font-bold text-foreground/80 text-xs uppercase tracking-wider py-3.5 px-4">
                Submitted By
              </TableHead>
              <TableHead className="font-bold text-foreground/80 text-xs uppercase tracking-wider py-3.5 px-4">
                Date & Time
              </TableHead>
              <TableHead className="font-bold text-foreground/80 text-xs uppercase tracking-wider py-3.5 px-4">
                Status
              </TableHead>
              <TableHead className="font-bold text-foreground/80 text-xs uppercase tracking-wider py-3.5 px-4 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property) => {
              const deal = getDealTypeTheme(property.dealType);
              const status = getStatusTheme(property.status);
              const isUnderReview = property.status === "UNDER_REVIEW";
              const isAvailable = property.status === "AVAILABLE";

              const primaryArea =
                property.primaryArea || property.areas?.[0]?.value;
              const primaryUnit =
                property.primaryAreaUnit ||
                property.areas?.[0]?.unit ||
                "sq. ft.";

              const displayPrice =
                property.dealType === "LEASE"
                  ? formatPrice(property.monthlyRent, "LEASE")
                  : formatPrice(property.price, property.dealType);

              const submitter = property.createdByUser;

              return (
                <TableRow
                  key={property.id}
                  className="hover:bg-muted/30 transition-colors border-b border-border/50"
                >
                  {/* Property & Project */}
                  <TableCell className="py-4 px-4 align-top">
                    <div className="space-y-1">
                      <div
                        onClick={() =>
                          navigate(`/admin/inventory/${property.id}`)
                        }
                        className="font-bold text-foreground text-sm hover:text-primary cursor-pointer line-clamp-1"
                        title={property.title}
                      >
                        {property.title}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="line-clamp-1">
                          {property.locality ? `${property.locality}, ` : ""}
                          {property.city}
                        </span>
                      </div>
                      {property.projectSociety && (
                        <div className="text-xs text-foreground/75 font-medium line-clamp-1">
                          Project: {property.projectSociety}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Deal & Category */}
                  <TableCell className="py-4 px-4 align-top">
                    <div className="space-y-1.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full border text-xs font-bold uppercase tracking-wider ${deal.badgeClass}`}
                      >
                        {deal.label}
                      </span>
                      <div className="text-xs text-foreground/90 font-medium">
                        {property.category} • {property.subcategory}
                      </div>
                      {property.bhk && property.bhk.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {property.bhk.join(", ")}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Price & Area */}
                  <TableCell className="py-4 px-4 align-top">
                    <div className="space-y-1">
                      <div className="font-bold text-foreground text-sm">
                        {displayPrice}
                      </div>
                      {primaryArea && (
                        <div className="text-xs text-muted-foreground font-medium">
                          {Number(primaryArea).toLocaleString("en-IN")}{" "}
                          {primaryUnit}
                        </div>
                      )}
                      {property.pricePerUnitArea && (
                        <div className="text-xs text-muted-foreground/80">
                          ₹
                          {Number(property.pricePerUnitArea).toLocaleString(
                            "en-IN",
                          )}
                          /{primaryUnit}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Submitted By */}
                  <TableCell className="py-4 px-4 align-top">
                    {submitter ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="text-xs font-bold text-foreground line-clamp-1">
                            {submitter.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase ${
                              submitter.role === "ADMIN"
                                ? "bg-purple/10 text-purple"
                                : "bg-sky-50 text-sky-800"
                            }`}
                          >
                            {submitter.role || "EXECUTIVE"}
                          </span>
                        </div>
                        {submitter.email && (
                          <div className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                            {submitter.email}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground italic">
                        Not Recorded
                      </div>
                    )}
                  </TableCell>

                  {/* Date & Time */}
                  <TableCell className="py-4 px-4 align-top whitespace-nowrap">
                    {(() => {
                      const dt = formatDateTime(property.createdAt);
                      return (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span>{dt.date}</span>
                          </div>
                          {dt.time && (
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                              <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              <span>{dt.time}</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-4 px-4 align-top">
                    {isUnderReview ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber shrink-0" />
                        Under Review
                      </span>
                    ) : isAvailable ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5 text-teal shrink-0" />
                        Approved & Live
                      </span>
                    ) : (
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full border text-xs font-semibold ${status.badgeClass}`}
                      >
                        {status.label}
                      </span>
                    )}
                  </TableCell>

                  {/* Review Actions 3-Dots Dropdown */}
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
                              className="text-muted-foreground hover:text-foreground hover:bg-muted h-8 w-8 rounded-lg cursor-pointer"
                              title="Review Actions"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent
                          align="end"
                          className="w-48 rounded-xl shadow-lg border border-border p-1 bg-popover text-popover-foreground"
                        >
                          {isUnderReview && (
                            <>
                              <DropdownMenuItem
                                onClick={() => onApprove(property.id)}
                                disabled={isActionPending}
                                className="cursor-pointer font-semibold text-teal hover:bg-teal/10 hover:text-teal text-sm py-2 px-3 rounded-lg flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4 text-teal" />
                                <span>Approve & Publish</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => onRequestRevision(property)}
                                disabled={isActionPending}
                                className="cursor-pointer font-medium text-amber hover:bg-amber/10 hover:text-amber text-sm py-2 px-3 rounded-lg flex items-center gap-2"
                              >
                                <AlertCircle className="w-4 h-4 text-amber" />
                                <span>Request Revisions</span>
                              </DropdownMenuItem>

                              <DropdownMenuSeparator className="my-1 bg-border/60" />
                            </>
                          )}

                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/admin/inventory/${property.id}`)
                            }
                            className="cursor-pointer font-medium text-foreground hover:bg-muted hover:text-foreground text-sm py-2 px-3 rounded-lg flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4 text-primary" />
                            <span>View Details</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/admin/inventory/${property.id}/edit`)
                            }
                            className="cursor-pointer font-medium text-foreground hover:bg-muted hover:text-foreground text-sm py-2 px-3 rounded-lg flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4 text-muted-foreground" />
                            <span>Edit Property</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/admin/inventory/${property.id}/print`)
                            }
                            className="cursor-pointer font-medium text-foreground hover:bg-muted hover:text-foreground text-sm py-2 px-3 rounded-lg flex items-center gap-2"
                          >
                            <Printer className="w-4 h-4 text-muted-foreground" />
                            <span>Print Dossier</span>
                          </DropdownMenuItem>
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
    </div>
  );
};

export default ApprovedTable;
