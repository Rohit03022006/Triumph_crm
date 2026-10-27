import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
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
  Download,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { formatPrice, getDealTypeTheme, getStatusTheme } from "./InventoryTable";

const PropertyDetailModal = ({
  property,
  isOpen,
  setIsOpen,
  onEdit,
  onManageUnits,
  userRole = "ADMIN",
}) => {
  if (!property) return null;

  const deal = getDealTypeTheme(property.dealType);
  const status = getStatusTheme(property.status);

  const displayPrice =
    property.dealType === "LEASE"
      ? formatPrice(property.monthlyRent, "LEASE")
      : formatPrice(property.price, property.dealType);

  const images = property.media?.filter((m) => m.type === "IMAGE" || m.mimeType?.startsWith("image/")) || [];
  const documents = property.media?.filter((m) => m.type !== "IMAGE" && !m.mimeType?.startsWith("image/")) || [];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-white rounded-xl shadow-lg max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border/60 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${deal.badgeClass}`}>
                {deal.label}
              </span>
              <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${status.badgeClass}`}>
                {status.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {property.category} • {property.subcategory}
              </span>
            </div>

            <h3 className="text-xl font-bold font-heading text-slate-800 tracking-tight">
              {property.title}
            </h3>

            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {property.locality ? `${property.locality}, ` : ""}
                {property.city}
                {property.projectSociety ? ` (${property.projectSociety})` : ""}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">
                {property.dealType === "LEASE" ? "Monthly Rent" : "Price"}
              </span>
              <span className="text-xl font-bold text-foreground">
                {displayPrice}
              </span>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                onEdit(property);
              }}
              className="text-xs rounded-lg"
            >
              Edit
            </Button>
            {property.dealType === "BOOKING" && (
              <Button
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  onManageUnits(property);
                }}
                className="bg-primary hover:bg-brand-dark text-primary-foreground text-xs rounded-lg flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Units ({property.units?.length || 0})</span>
              </Button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Gallery */}
          {images.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Photo Gallery ({images.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="h-24 rounded-lg overflow-hidden border border-slate-200">
                    <img
                      src={img.url.startsWith("http") ? img.url : `${import.meta.env.VITE_API_URL?.replace("/api/v1", "") || ""}${img.url}`}
                      alt="Property"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Area Measurements */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-primary" />
              <span>Area Measurements</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {property.areas && property.areas.length > 0 ? (
                property.areas.map((area, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 p-3 rounded-lg shadow-2xs">
                    <span className="text-[11px] text-muted-foreground block">{area.areaType}</span>
                    <span className="text-sm font-bold text-foreground block mt-0.5">
                      {Number(area.value).toLocaleString()} {area.unit}
                    </span>
                  </div>
                ))
              ) : (
                <div className="bg-white border border-slate-200 p-3 rounded-lg">
                  <span className="text-[11px] text-muted-foreground block">Primary Area</span>
                  <span className="text-sm font-bold text-foreground block mt-0.5">
                    {property.primaryArea ? `${Number(property.primaryArea).toLocaleString()} ${property.primaryAreaUnit}` : "—"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Property Specifications */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-primary" />
              <span>Specifications</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              {property.developerName && (
                <div>
                  <span className="text-muted-foreground block text-[11px]">Developer</span>
                  <span className="font-semibold text-foreground">{property.developerName}</span>
                </div>
              )}
              {property.bhk && property.bhk.length > 0 && (
                <div>
                  <span className="text-muted-foreground block text-[11px]">Configuration</span>
                  <span className="font-semibold text-foreground">{property.bhk.join(", ")}</span>
                </div>
              )}
              {property.furnishing && (
                <div>
                  <span className="text-muted-foreground block text-[11px]">Furnishing</span>
                  <span className="font-semibold text-foreground">{property.furnishing}</span>
                </div>
              )}
              {property.facingDirection && (
                <div>
                  <span className="text-muted-foreground block text-[11px]">Facing Direction</span>
                  <span className="font-semibold text-foreground">{property.facingDirection}</span>
                </div>
              )}
              {property.projectStatus && (
                <div>
                  <span className="text-muted-foreground block text-[11px]">Status</span>
                  <span className="font-semibold text-foreground">{property.projectStatus}</span>
                </div>
              )}
              {property.possessionMonth && property.possessionYear && (
                <div>
                  <span className="text-muted-foreground block text-[11px]">Possession</span>
                  <span className="font-semibold text-foreground">
                    {property.possessionMonth} {property.possessionYear}
                  </span>
                </div>
              )}
              {property.leaseDuration && (
                <div>
                  <span className="text-muted-foreground block text-[11px]">Lease Duration</span>
                  <span className="font-semibold text-foreground">{property.leaseDuration} Months</span>
                </div>
              )}
              {property.lockInPeriod && (
                <div>
                  <span className="text-muted-foreground block text-[11px]">Lock-in Period</span>
                  <span className="font-semibold text-foreground">{property.lockInPeriod} Months</span>
                </div>
              )}
            </div>
          </div>

          {/* Categorized USPs & Amenities */}
          {property.usps?.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                USPs
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {property.usps.map((usp, i) => (
                  <span
                    key={i}
                    className="text-xs font-medium px-2.5 py-1 rounded-md bg-warning/10 text-warning border border-warning/20"
                  >
                    {usp}
                  </span>
                ))}
              </div>
            </div>
          )}

          {property.amenities?.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Amenities
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {property.amenities.map((am, i) => (
                  <span
                    key={i}
                    className="text-xs font-medium px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20"
                  >
                    {am}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {property.description && (
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Description
              </h4>
              <p className="text-xs text-muted-foreground p-3.5 bg-slate-50 border border-slate-200 rounded-lg whitespace-pre-wrap">
                {property.description}
              </p>
            </div>
          )}

          {/* Contact Details */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-primary" />
                <span>Contact & Ownership</span>
              </h4>
              {property.dealType !== "BOOKING" && userRole !== "ADMIN" && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <Lock className="w-3 h-3" /> Admin Protected
                </span>
              )}
            </div>

            {property.dealType === "BOOKING" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Developer Sales Person
                  </span>
                  <span className="font-semibold text-foreground">
                    {property.developerContactName || "Not assigned"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Contact Phone</span>
                  <span className="font-semibold text-foreground">
                    {property.developerContactNumber || "Not available"}
                  </span>
                </div>
              </div>
            ) : userRole === "ADMIN" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Seller / Landlord Name
                  </span>
                  <span className="font-semibold text-foreground">
                    {property.sellerName || "Direct Seller"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Contact Phone</span>
                  <span className="font-semibold text-foreground">
                    {property.sellerPhone || "Not available"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50/80 p-3 rounded-lg border border-amber-200/80 text-amber-900 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Confidential Seller Details</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Seller and landlord contact details are protected for Administrator access. Please open the full property view to request seller clearance.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyDetailModal;
