import React from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Printer,
  FileText,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { fetchPropertyById } from "@/api/inventory";
import PropertyPrintDocument from "@/components/Inventory_Management/PropertyPrintDocument";

/**
 * PropertyPrintPage
 * Dedicated full-page view for printing and exporting the pdfcn property dossier.
 * Replaces modal pop-ups with an authentic, standalone document workspace.
 */
const PropertyPrintPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isExecutive = location.pathname.startsWith("/executive");
  const basePath = isExecutive ? "/executive/inventory" : "/admin/inventory";

  // Fetch unique property by id
  const { data: property, isLoading, isError, error } = useQuery({
    queryKey: ["property", id],
    queryFn: () => fetchPropertyById(id),
    staleTime: 60 * 1000,
  });

  const handleBackToInventory = () => {
    const savedQuery = sessionStorage.getItem("inventory_search_params");
    navigate(savedQuery ? `${basePath}?${savedQuery}` : basePath);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-base text-slate-600 font-medium">
            Generating Property Dossier (pdfcn.dev)...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Property Not Found</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-md">
            {error?.message || "Unable to load property details for printing."}
          </p>
        </div>
        <Button onClick={handleBackToInventory} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Inventory
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 pb-20 overflow-x-hidden print:p-0 print:m-0 print:space-y-0 print:overflow-visible print:w-full print:max-w-none">
      {/* 1. On-Screen Header Controls (Hidden during browser print) */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/70 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(`${basePath}/${property.id}`, { replace: true })}
            className="rounded-full shadow-xs bg-white hover:bg-slate-50 border-slate-200 shrink-0 w-10 h-10"
            title="Back to Property"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Button>

          <div>
            <div className="text-sm text-slate-500 flex items-center gap-2 mb-1 font-medium">
              <span
                onClick={handleBackToInventory}
                className="cursor-pointer hover:text-slate-900 transition-colors"
              >
                Inventory
              </span>
              <span>›</span>
              <span
                onClick={() => navigate(`${basePath}/${property.id}`, { replace: true })}
                className="cursor-pointer hover:text-slate-900 transition-colors line-clamp-1 max-w-[220px]"
              >
                {property.title}
              </span>
              <span>›</span>
              <span className="font-semibold text-slate-800">Print Dossier (pdfcn)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {property.title} - Official Dossier
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <Button
            onClick={handlePrint}
            className="bg-primary hover:bg-brand-dark text-primary-foreground font-semibold text-sm h-10 px-5 shadow-xs flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </Button>
        </div>
      </div>

      {/* 2. Standalone Document Canvas (Centered A4 preview) */}
      <div className="flex justify-center bg-slate-200/50 p-4 sm:p-10 rounded-2xl border border-slate-200 print:bg-white print:border-none print:p-0 print:m-0 print:block print:w-full print:shadow-none">
        <PropertyPrintDocument property={property} />
      </div>
    </div>
  );
};

export default PropertyPrintPage;

