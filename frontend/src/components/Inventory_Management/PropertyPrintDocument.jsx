import React from "react";
import { PageHeader, PageFooter, Section, KeyValue, DataTable } from "@/components/pdfcn";
import { formatPrice, getDealTypeTheme, getStatusTheme } from "./InventoryTable";

/**
 * PropertyPrintDocument
 * Professional, printable property dossier styled with pdfcn.dev components.
 * Renders cleanly in standard A4 portrait both on screen and during browser print-to-PDF.
 */
const PropertyPrintDocument = ({ property }) => {
  if (!property) return null;

  const deal = getDealTypeTheme(property.dealType);
  const status = getStatusTheme(property.status);

  const displayPrice =
    property.dealType === "LEASE"
      ? formatPrice(property.monthlyRent, "LEASE")
      : formatPrice(property.price, property.dealType);

  const primaryArea = property.primaryArea || property.areas?.[0]?.value;
  const primaryUnit = property.primaryAreaUnit || property.areas?.[0]?.unit || "sq. ft.";

  const images = property.media?.filter((m) => m.type === "IMAGE" || m.mimeType?.startsWith("image/")) || [];
  const primaryImage = images[0]?.url;

  // Key Specifications
  const specs = [
    { label: "Deal Type", value: deal.label },
    { label: "Status", value: status.label },
    { label: "Category", value: property.category },
    { label: "Subcategory", value: property.subcategory },
    {
      label: "Configuration",
      value: property.bhk && property.bhk.length > 0 ? property.bhk.join(", ") : "Standard",
    },
    { label: "Furnishing", value: property.furnishing || "Unspecified" },
    { label: "Facing", value: property.facingDirection || "Not Specified" },
    {
      label: "Floor",
      value: property.floorNumber ? `${property.floorNumber} of ${property.totalFloors || "—"}` : "Independent",
    },
    {
      label: "Parking",
      value: property.numberOfParkings ? `${property.numberOfParkings} (${property.parkingType || "Reserved"})` : "Available",
    },
    { label: "Washrooms", value: property.numberOfWashrooms ? `${property.numberOfWashrooms} (${property.washroomType || "Private"})` : "—" },
    { label: "Property Age", value: property.propertyAge || "New Launch" },
    {
      label: "Possession / Status",
      value: property.possessionDate
        ? new Date(property.possessionDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
        : property.projectStatus || property.availabilityStatus || "Ready",
    },
  ];

  // Lease specific metrics
  if (property.dealType === "LEASE") {
    if (property.securityDeposit) {
      specs.push({ label: "Security Deposit", value: property.securityDeposit });
    }
    if (property.maintenanceCharges) {
      specs.push({
        label: "Maintenance",
        value: `₹${Number(property.maintenanceCharges).toLocaleString("en-IN")} ${property.maintenanceFrequency || "/mo"}`,
      });
    }
    if (property.leaseDuration) {
      specs.push({ label: "Lease Duration", value: `${property.leaseDuration} Months` });
    }
    if (property.lockInPeriod) {
      specs.push({ label: "Lock-in Period", value: `${property.lockInPeriod} Months` });
    }
  }

  // Areas Table Columns
  const areaColumns = [
    { header: "Area Type", accessor: (r) => r.areaType || "Primary Area" },
    {
      header: "Dimension / Size",
      accessor: (r) => `${Number(r.value || 0).toLocaleString("en-IN")} ${r.unit || "sq. ft."}`,
    },
    {
      header: "Price / Sq. Unit",
      align: "right",
      accessor: () =>
        property.pricePerUnitArea
          ? `₹${Number(property.pricePerUnitArea).toLocaleString("en-IN")}`
          : "—",
    },
  ];

  // Project Units Columns (Booking)
  const unitColumns = [
    { header: "Unit No / Name", accessor: "unitName" },
    {
      header: "Area",
      accessor: (u) => `${Number(u.area || 0).toLocaleString("en-IN")} ${u.areaUnit || "sq. ft."}`,
    },
    {
      header: "Price",
      align: "right",
      accessor: (u) => `₹${Number(u.price || 0).toLocaleString("en-IN")}`,
    },
    { header: "Status", accessor: "status" },
  ];

  const currentDateStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      id="property-print-document"
      className="w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white text-slate-900 p-8 sm:p-10 font-sans border border-slate-200 shadow-md rounded-none print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-none print:min-h-0"
    >
      {/* 1. pdfcn PageHeader with logo_main.png */}
      <PageHeader
        logo={
          <img
            src="/logo_main.png"
            alt="Triumph Estates"
            className="h-11 w-auto max-w-[170px] object-contain shrink-0"
          />
        }
        title="Triumph CRM"
        subtitle="Property Specification"
        rightText={`REF: ${property.id?.slice(0, 8).toUpperCase()}`}
        rightSubText={`Date: ${currentDateStr}`}
        badge={
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300">
            {deal.label}
          </span>
        }
      />

      {/* 2. Property Main Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 sm:p-5 mb-5 print:mb-4 print-avoid-break">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              {property.developerName || property.developer?.name || "Premium Inventory"}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              {property.title}
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              {property.locality ? `${property.locality}, ` : ""}
              {property.city}
              {property.projectSociety ? ` • ${property.projectSociety}` : ""}
            </p>
          </div>

          <div className="sm:text-right shrink-0">
            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block">
              {property.dealType === "LEASE" ? "Monthly Rent" : "Offering Price"}
            </span>
            <span className="text-2xl font-black text-slate-900 tracking-tight block">
              {displayPrice}
            </span>
            {primaryArea && (
              <span className="text-xs text-slate-500 font-medium">
                {Number(primaryArea).toLocaleString()} {primaryUnit}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Optional Photo & Quick Facts Layout */}
      {primaryImage && (
        <div className="mb-5 print:mb-4 rounded-lg overflow-hidden border border-slate-200 max-h-48 bg-slate-100 flex items-center justify-center print-avoid-break">
          <img
            src={
              primaryImage.startsWith("http")
                ? primaryImage
                : `${import.meta.env.VITE_API_URL?.replace("/api/v1", "") || ""}${primaryImage}`
            }
            alt={property.title}
            className="w-full h-44 sm:h-48 object-cover"
          />
        </div>
      )}

      {/* 4. Specifications Matrix (pdfcn KeyValue) */}
      <Section title="Property Specifications" className="mb-5 print:mb-4">
        <KeyValue items={specs} columns={3} />
      </Section>

      {/* 5. Areas Breakdown (pdfcn DataTable) */}
      {property.areas && property.areas.length > 0 && (
        <Section title="Area Measurements" className="mb-5 print:mb-4 print-avoid-break">
          <DataTable columns={areaColumns} data={property.areas} />
        </Section>
      )}

      {/* 6. Project Units (For Booking properties) */}
      {property.dealType === "BOOKING" && property.units && property.units.length > 0 && (
        <Section
          title="Project Inventory Units"
          subtitle={`Total: ${property.units.length} Units`}
          className="mb-5 print:mb-4"
        >
          <DataTable columns={unitColumns} data={property.units} />
        </Section>
      )}

      {/* 7. Key Features & USPs */}
      {((property.usps && property.usps.length > 0) || (property.amenities && property.amenities.length > 0)) && (
        <Section title="Amenities & Key USPs" className="mb-5 print:mb-4 print-avoid-break">
          <div className="flex flex-wrap gap-1.5">
            {[...(property.usps || []), ...(property.amenities || [])].map((item, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200"
              >
                ✓ {item}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* 8. Notes / Additional Info if present */}
      {property.preLeased && (
        <Section title="Pre-Leased Commercial Details" className="mb-5 print:mb-4 print-avoid-break">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
            <span className="font-bold">Pre-Leased Asset: </span>
            {property.preLeasedDetails || "Details available on request."}
            {property.roiPercentage && (
              <span className="block mt-1 font-semibold">
                ROI / Yield: {property.roiPercentage}%
              </span>
            )}
          </div>
        </Section>
      )}

      {/* 9. pdfcn PageFooter */}
      <PageFooter
        leftText="Triumph CRM • Confidential Real Estate Inventory"
        centerText={`Property ID: ${property.id}`}
        rightText="Official Specification Sheet"
        className="print-avoid-break"
      />
    </div>
  );
};

export default PropertyPrintDocument;

