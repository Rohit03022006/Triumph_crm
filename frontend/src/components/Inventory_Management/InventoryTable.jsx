import React from "react";
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  MapPin,
  Eye,
  Edit,
  Trash2,
  Layers,
  MoreVertical,
  Printer
} from "lucide-react";

export const formatPrice = (val, dealType) => {
  if (val === undefined || val === null || val === "") return "Price on Request";
  const num = Number(val);
  if (isNaN(num)) return val;

  if (dealType === "LEASE") {
    return `₹${num.toLocaleString("en-IN")}/mo`;
  }
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2).replace(/\.00$/, "")} L`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
};

export const getDealTypeTheme = (dealType) => {
  switch (dealType) {
    case "BOOKING":
      return {
        label: "Booking",
        badgeClass: "bg-sky-50 text-sky-800 border-sky-200",
      };
    case "RETRADE":
      return {
        label: "Retrade",
        badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
      };
    case "LEASE":
      return {
        label: "Lease",
        badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
      };
    default:
      return {
        label: dealType,
        badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
      };
  }
};

export const getStatusTheme = (status) => {
  switch (status) {
    case "AVAILABLE":
      return {
        label: "Available",
        badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
      };
    case "UNDER_REVIEW":
      return {
        label: "Under Review",
        badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
      };
    case "SOLD":
      return {
        label: "Sold",
        badgeClass: "bg-purple/10 text-purple border-purple/20",
      };
    case "RENT_OUT":
      return {
        label: "Rented Out",
        badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
      };
    case "LOST":
      return {
        label: "Lost",
        badgeClass: "bg-rose-50 text-rose-800 border-rose-200",
      };
    default:
      return {
        label: status || "Unknown",
        badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
      };
  }
};

const InventoryTable = ({
  properties = [],
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  isLoading = false,
  onView,
  onEdit,
  onManageUnits,
  onDelete,
  onPrint,
  isAdmin = false,
}) => {
  return (
    <div className="w-full max-w-full min-w-0 overflow-x-auto">
      <Table className="w-full min-w-[850px]">
        <TableHeader>
          <TableRow className="border-b border-border/60 bg-muted/30 hover:bg-muted/30">
            <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs tracking-wider uppercase h-12">
              PROPERTY / PROJECT
            </TableHead>
            <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs tracking-wider uppercase h-12">
              DEAL TYPE
            </TableHead>
            <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs tracking-wider uppercase h-12">
              CATEGORY
            </TableHead>
            <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs tracking-wider uppercase h-12">
              LOCATION
            </TableHead>
            <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs tracking-wider uppercase h-12">
              CONFIG / BHK
            </TableHead>
            <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs tracking-wider uppercase h-12">
              AREA
            </TableHead>
            <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs tracking-wider uppercase h-12">
              PRICE / RENT
            </TableHead>
            <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs tracking-wider uppercase h-12">
              STATUS
            </TableHead>
            <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs tracking-wider uppercase h-12 text-right">
              ACTION
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-sm">
                Loading inventory data...
              </TableCell>
            </TableRow>
          ) : properties.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-sm">
                No properties found.
              </TableCell>
            </TableRow>
          ) : (
            properties.map((property) => {
              const deal = getDealTypeTheme(property.dealType);
              const status = getStatusTheme(property.status);
              const displayPrice =
                property.dealType === "LEASE"
                  ? formatPrice(property.monthlyRent, "LEASE")
                  : formatPrice(property.price, property.dealType);
              const primaryArea = property.primaryArea || property.areas?.[0]?.value;
              const primaryUnit = property.primaryAreaUnit || property.areas?.[0]?.unit || "sq. ft.";

              return (
                <TableRow
                  key={property.id}
                  onClick={() => onView(property)}
                  className="border-b border-border/40 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  {/* Property Name & Developer */}
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground text-base line-clamp-1">
                        {property.title}
                      </span>
                      <span className="text-sm text-muted-foreground truncate">
                        {property.developerName || property.developer?.name || "Independent"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Deal Type Badge */}
                  <TableCell className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${deal.badgeClass}`}
                    >
                      {deal.label}
                    </span>
                  </TableCell>

                  {/* Category & Subcategory */}
                  <TableCell className="px-6 py-4">
                    <span className="font-semibold text-foreground text-sm block">
                      {property.category}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {property.subcategory}
                    </span>
                  </TableCell>

                  {/* Location */}
                  <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[160px] text-sm">
                        {property.locality ? `${property.locality}, ` : ""}
                        {property.city}
                      </span>
                    </div>
                  </TableCell>

                  {/* BHK */}
                  <TableCell className="px-6 py-4 text-sm font-semibold text-foreground/80">
                    {property.bhk && property.bhk.length > 0 ? property.bhk.join(", ") : "—"}
                  </TableCell>

                  {/* Area */}
                  <TableCell className="px-6 py-4 text-sm font-semibold text-foreground/80">
                    {primaryArea ? `${Number(primaryArea).toLocaleString()} ${primaryUnit}` : "—"}
                  </TableCell>

                  {/* Price */}
                  <TableCell className="px-6 py-4 text-base font-bold text-foreground">
                    {displayPrice}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${status.badgeClass}`}
                    >
                      {status.label}
                    </span>
                  </TableCell>

                  {/* Actions Dropdown */}
                  <TableCell className="px-6 py-4 text-right pr-4">
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-slate-400 hover:text-foreground/80 h-8 w-8"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-48 rounded-xl">
                          <DropdownMenuItem
                            onClick={() => onView(property)}
                            className="cursor-pointer font-medium text-foreground/80 text-sm"
                          >
                            <Eye className="w-4 h-4 mr-2 text-primary" /> View Details
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => onPrint?.(property)}
                            className="cursor-pointer font-medium text-foreground/80 text-sm"
                          >
                            <Printer className="w-4 h-4 mr-2 text-primary" /> Print Dossier (PDF)
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => onEdit(property)}
                            className="cursor-pointer font-medium text-foreground/80 text-sm"
                          >
                            <Edit className="w-4 h-4 mr-2" /> Edit Property
                          </DropdownMenuItem>

                          {property.dealType === "BOOKING" && (
                            <DropdownMenuItem
                              onClick={() => onManageUnits(property)}
                              className="cursor-pointer font-medium text-foreground/80 text-sm"
                            >
                              <Layers className="w-4 h-4 mr-2 text-primary" /> Manage Units
                            </DropdownMenuItem>
                          )}

                          {isAdmin && (
                            <DropdownMenuItem
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete "${property.title}"?`)) {
                                  onDelete(property);
                                }
                              }}
                              className="cursor-pointer font-medium text-danger focus:text-danger focus:bg-danger/10 text-sm"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination Footer matching UsersTable */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/40">
          <p className="text-sm text-muted-foreground">
            Page <span className="font-medium text-foreground">{currentPage}</span> of{" "}
            <span className="font-medium text-foreground">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;
