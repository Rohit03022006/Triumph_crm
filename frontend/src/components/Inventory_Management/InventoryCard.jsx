import React from "react";
import {
  Building2,
  MapPin,
  Maximize2,
  Eye,
  Edit,
  Trash2,
  Layers,
  Sparkles,
  Calendar,
  IndianRupee,
  MoreVertical,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export const getDealTypeBadge = (dealType) => {
  switch (dealType) {
    case "BOOKING":
      return {
        label: "Booking",
        className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      };
    case "RETRADE":
      return {
        label: "Retrade",
        className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      };
    case "LEASE":
      return {
        label: "Lease",
        className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      };
    default:
      return {
        label: dealType,
        className: "bg-muted text-muted-foreground",
      };
  }
};

export const getStatusBadge = (status) => {
  switch (status) {
    case "AVAILABLE":
      return {
        label: "Available",
        className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      };
    case "UNDER_REVIEW":
      return {
        label: "Under Review",
        className: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
      };
    case "SOLD":
      return {
        label: "Sold",
        className: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      };
    case "RENT_OUT":
      return {
        label: "Rented Out",
        className: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
      };
    case "LOST":
      return {
        label: "Lost",
        className: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800",
      };
    default:
      return {
        label: status || "Unknown",
        className: "bg-muted text-muted-foreground",
      };
  }
};

const InventoryCard = ({
  property,
  onView,
  onEdit,
  onDelete,
  onManageUnits,
  isAdmin = false,
}) => {
  const dealTypeInfo = getDealTypeBadge(property.dealType);
  const statusInfo = getStatusBadge(property.status);

  // Thumbnail
  const firstImage = property.media?.find((m) => m.type === "IMAGE")?.url;

  // Primary area
  const primaryArea = property.primaryArea || property.areas?.[0]?.value;
  const primaryUnit = property.primaryAreaUnit || property.areas?.[0]?.unit || "sq. ft.";

  // Price display
  const displayPrice = property.dealType === "LEASE"
    ? formatPrice(property.monthlyRent, "LEASE")
    : formatPrice(property.price, property.dealType);

  return (
    <div className="group bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      {/* Top Media / Thumbnail Section */}
      <div className="relative h-44 w-full bg-muted/40 overflow-hidden">
        {firstImage ? (
          <img
            src={firstImage.startsWith("http") ? firstImage : `${import.meta.env.VITE_API_URL?.replace("/api/v1", "") || ""}${firstImage}`}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-muted/50 to-muted/80 text-muted-foreground">
            <Building2 className="size-10 stroke-1 text-muted-foreground/60 mb-1" />
            <span className="text-[11px] font-medium text-muted-foreground/80">
              {property.category} • {property.subcategory}
            </span>
          </div>
        )}

        {/* Badges on Top */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border backdrop-blur-md ${dealTypeInfo.className}`}>
            {dealTypeInfo.label}
          </span>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border backdrop-blur-md ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Action Menu on Top Right */}
        <div className="absolute top-2.5 right-2.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="size-8 rounded-full bg-background/90 backdrop-blur-md border border-border/60 flex items-center justify-center text-foreground hover:bg-background shadow-xs transition-colors">
                <MoreVertical className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 text-xs">
              <DropdownMenuItem onClick={() => onView(property)} className="cursor-pointer">
                <Eye className="size-3.5 mr-2 text-primary" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(property)} className="cursor-pointer">
                <Edit className="size-3.5 mr-2 text-amber-600" /> Edit Property
              </DropdownMenuItem>
              {property.dealType === "BOOKING" && (
                <DropdownMenuItem onClick={() => onManageUnits(property)} className="cursor-pointer">
                  <Layers className="size-3.5 mr-2 text-blue-600" /> Manage Units
                </DropdownMenuItem>
              )}
              {isAdmin && (
                <DropdownMenuItem
                  onClick={() => onDelete(property)}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-3.5 mr-2" /> Delete Property
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Price Tag pill on bottom of image */}
        <div className="absolute bottom-2.5 left-2.5">
          <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-lg bg-background/95 text-foreground backdrop-blur-md shadow-xs border border-border/40">
            {displayPrice}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Subcategory & Developer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span className="truncate max-w-[65%]">
              {property.developerName || property.developer?.name || property.category}
            </span>
            <span className="text-[11px] bg-muted/60 px-2 py-0.5 rounded text-foreground/80 font-normal">
              {property.subcategory}
            </span>
          </div>

          {/* Project Title */}
          <h3
            onClick={() => onView(property)}
            className="text-base font-bold text-foreground font-heading line-clamp-1 hover:text-primary cursor-pointer transition-colors"
          >
            {property.title}
          </h3>

          {/* Location */}
          <p className="text-xs text-muted-foreground flex items-center gap-1 line-clamp-1">
            <MapPin className="size-3.5 text-muted-foreground/80 shrink-0" />
            <span>
              {property.locality ? `${property.locality}, ` : ""}
              {property.city}
              {property.projectSociety ? ` (${property.projectSociety})` : ""}
            </span>
          </p>
        </div>

        {/* Features / Specs Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60 text-xs text-muted-foreground">
          {property.bhk && property.bhk.length > 0 && (
            <div className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-md text-[11px] font-medium text-foreground">
              <span>{property.bhk.join(", ")}</span>
            </div>
          )}

          {primaryArea && (
            <div className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-md text-[11px] font-medium text-foreground">
              <Maximize2 className="size-3 text-muted-foreground" />
              <span>{Number(primaryArea).toLocaleString()} {primaryUnit}</span>
            </div>
          )}

          {property.furnishing && (
            <div className="bg-muted/50 px-2 py-0.5 rounded-md text-[11px] text-muted-foreground">
              {property.furnishing}
            </div>
          )}

          {property.projectStatus && (
            <div className="bg-muted/50 px-2 py-0.5 rounded-md text-[11px] text-muted-foreground">
              {property.projectStatus}
            </div>
          )}
        </div>

        {/* Card Footer: Units count / view details CTA */}
        <div className="pt-2 flex items-center justify-between text-xs border-t border-border/40">
          {property.dealType === "BOOKING" ? (
            <button
              onClick={() => onManageUnits(property)}
              className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
            >
              <Layers className="size-3.5" />
              <span>{property.units?.length || 0} Units</span>
            </button>
          ) : (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="size-3" />
              {new Date(property.createdAt).toLocaleDateString()}
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(property)}
            className="h-7 px-2.5 text-xs text-primary hover:text-brand-dark hover:bg-primary/10 rounded-lg flex items-center gap-1 font-medium"
          >
            <span>Details</span>
            <ArrowUpRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InventoryCard;

