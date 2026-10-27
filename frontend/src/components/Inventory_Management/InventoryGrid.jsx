import React from "react";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  Eye,
  Edit,
  Trash2,
  Layers,
  Printer
} from "lucide-react";
import { formatPrice, getDealTypeTheme, getStatusTheme } from "./InventoryTable";

const InventoryGrid = ({
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
  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground text-sm">Loading properties...</div>;
  }

  if (!properties || properties.length === 0) {
    return <div className="p-8 text-center text-muted-foreground text-sm">No properties found.</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {properties.map((property) => {
          const deal = getDealTypeTheme(property.dealType);
          const status = getStatusTheme(property.status);
          const firstImage = property.media?.find((m) => m.type === "IMAGE")?.url;
          const displayPrice =
            property.dealType === "LEASE"
              ? formatPrice(property.monthlyRent, "LEASE")
              : formatPrice(property.price, property.dealType);
          const primaryArea = property.primaryArea || property.areas?.[0]?.value;
          const primaryUnit = property.primaryAreaUnit || property.areas?.[0]?.unit || "sq. ft.";

          return (
            <div
              key={property.id}
              onClick={() => onView(property)}
              className="group relative bg-white border border-border/40 hover:border-border/80 rounded-xl p-5 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Badges Absolute at Top Left */}
              <div className="absolute top-2.5 left-4 flex items-center gap-1.5 flex-wrap z-10">
                <span
                  className={`px-2.5 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${deal.badgeClass}`}
                >
                  {deal.label}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${status.badgeClass}`}
                >
                  {status.label}
                </span>
              </div>

              {/* Quick Actions (Appear on Hover) matching UsersGrid */}
              <div
                className="absolute top-3 right-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-white shadow-sm border text-foreground/70 hover:text-primary hover:bg-primary/10"
                  onClick={() => onView(property)}
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-white shadow-sm border text-foreground/70 hover:text-primary hover:bg-primary/10"
                  onClick={() => onPrint?.(property)}
                  title="Print / Save PDF (pdfcn)"
                >
                  <Printer className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-white shadow-sm border text-foreground/70 hover:text-primary hover:bg-primary/10"
                  onClick={() => onEdit(property)}
                  title="Edit Property"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                {property.dealType === "BOOKING" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-white shadow-sm border text-foreground/70 hover:text-primary hover:bg-primary/10"
                    onClick={() => onManageUnits(property)}
                    title="Manage Units"
                  >
                    <Layers className="w-4 h-4" />
                  </Button>
                )}
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-white shadow-sm border text-danger hover:text-danger hover:bg-danger/10"
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${property.title}"?`)) {
                        onDelete(property);
                      }
                    }}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Thumbnail Area */}
              <div className="w-full h-36 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden mb-3 mt-5 flex items-center justify-center relative">
                {firstImage ? (
                  <img
                    src={
                      firstImage.startsWith("http")
                        ? firstImage
                        : `${import.meta.env.VITE_API_URL?.replace("/api/v1", "") || ""}${firstImage}`
                    }
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Building2 className="w-10 h-10 stroke-1 mb-1 text-slate-300" />
                    <span className="text-xs font-medium text-slate-400">
                      {property.category}
                    </span>
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div className="w-full text-left space-y-1">
                <p className="text-sm text-primary font-semibold uppercase tracking-wider truncate">
                  {property.developerName || property.developer?.name || property.subcategory}
                </p>
                <h3 className="font-bold text-foreground text-lg line-clamp-1 group-hover:text-primary transition-colors">
                  {property.title}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 truncate">
                  <MapPin className="w-4 h-4 shrink-0 text-slate-400" />
                  <span className="truncate">
                    {property.locality ? `${property.locality}, ` : ""}
                    {property.city}
                  </span>
                </p>
              </div>

              {/* Price & Meta Footer */}
              <div className="w-full space-y-2 mt-3 pt-3 border-t border-border/40 text-left text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground font-medium">Price</span>
                  <span className="text-lg font-bold text-foreground">
                    {displayPrice}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Config: {property.bhk?.length > 0 ? property.bhk.join(", ") : property.subcategory}</span>
                  {primaryArea && (
                    <span className="font-semibold text-foreground">
                      {Number(primaryArea).toLocaleString()} {primaryUnit}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 mt-auto border-t border-border/40 bg-white">
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

export default InventoryGrid;
