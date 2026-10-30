import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Plus,
  Trash2,
  Building2,
  Home,
  Key,
  Layers,
  Sparkles,
  Info,
  Check,
  X,
  FileText,
  ImageIcon,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  MapPin,
  IndianRupee,
  Ruler,
  User,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { uploadInventoryFiles } from "@/api/inventory";
import { toast } from "@/components/ui/toast";
import {
  STANDARD_CITIES,
  SUBCATEGORIES_BY_DEAL_TYPE,
  USP_GROUPS,
  AMENITIES_GROUPS,
  FURNISHING_OPTIONS,
  FURNISHING_ITEMS_RESIDENTIAL,
  FURNISHING_ITEMS_SERVICED_APT,
  FURNISHING_ITEMS_COMMERCIAL,
  getFieldVisibility,
} from "./inventoryMatrixConfig";

const STANDARD_CATEGORIES = ["Residential", "Commercial"];

const INITIAL_FORM = {
  dealType: "BOOKING",
  title: "",
  developerId: "",
  developerName: "",
  category: "Residential",
  subcategory: "Apartment",
  city: "Gurgaon",
  locality: "",
  projectSociety: "",

  // Configurations
  bhk: [],
  additionalSelection: [],
  furnishing: "Semi-Furnished",

  // Pricing
  price: "",
  minPrice: "",
  maxPrice: "",
  priceUnit: "Crores",
  pricePerUnitArea: "",
  paymentPlan: "Construction Linked (CLP)",

  // Lease specific
  monthlyRent: "",
  securityDeposit: "2 Months",
  maintenanceCharges: "",
  maintenanceFrequency: "Per Month",
  availableFor: ["Family", "Company Lease"],
  leaseDuration: 12,
  lockInPeriod: 6,
  availableFromDate: "",

  // Retrade / Booking
  facingDirection: "North-East",
  availabilityStatus: "Ready to Move",
  possessionDate: "",
  projectStatus: "Under Construction",
  possessionMonth: "December",
  possessionYear: 2026,

  // Structural & Commercial
  numberOfStoreys: "",
  numberOfUnits: "",
  floorNumber: "",
  totalFloors: "",
  propertyAge: "1 to 3 years",
  servantPujaStore: [],
  parkingType: "Covered",
  numberOfParkings: 1,
  ceilingHeight: "",
  numberOfLifts: 2,
  numberOfWashrooms: 2,
  washroomType: "Private",
  preLeased: false,
  preLeasedDetails: "",
  roiPercentage: "",

  // Plot specific
  boundaryWall: true,
  plotShape: "Regular",
  constructionAllowed: true,
  plotLength: "",
  plotBreadth: "",

  // USPs & Amenities
  usps: [],
  amenities: [],

  // Contacts
  sellerName: "",
  sellerPhone: "",
  developerContactName: "",
  developerContactNumber: "",
  developerContactDesignation: "",

  description: "",
  status: "AVAILABLE",

  // Multi-Area measurements
  areas: [{ areaType: "Super Area", value: "", unit: "sq. ft." }],
  media: [],
};

const MONTHS_LIST = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS_LIST = Array.from({ length: 12 }, (_, i) => CURRENT_YEAR + i);

const PropertyFormDialog = ({
  isOpen,
  setIsOpen,
  initialData = null,
  masterData = null,
  onSubmit,
  isPending = false,
  userRole = "ADMIN",
}) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [activeTab, setActiveTab] = useState("basic");
  const [formErrors, setFormErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  // Category, Subcategory & City states
  const [selectedCategory, setSelectedCategory] = useState("Residential");
  const [otherCategory, setOtherCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("Apartment");
  const [otherSubcategory, setOtherSubcategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("Gurgaon");
  const [otherCity, setOtherCity] = useState("");

  const isEdit = Boolean(initialData?.id);

  // Calculate dynamic matrix visibility
  const matrixRules = useMemo(() => {
    const effectiveCat =
      selectedCategory === "Other" ? otherCategory || "Other" : selectedCategory;
    const effectiveSub =
      selectedCategory === "Other" || selectedSubcategory === "Other"
        ? otherSubcategory || "Other"
        : selectedSubcategory;
    return getFieldVisibility(formData.dealType, effectiveCat, effectiveSub);
  }, [
    formData.dealType,
    selectedCategory,
    otherCategory,
    selectedSubcategory,
    otherSubcategory,
  ]);

  // Derived subcategories based on current Deal Type and Category from the Matrix
  const availableSubcategories = useMemo(() => {
    const deal = formData.dealType || "BOOKING";
    const cat = selectedCategory;
    if (cat === "Other") return ["Other"];
    const list = SUBCATEGORIES_BY_DEAL_TYPE[deal]?.[cat] || [
      "Apartment",
      "Other",
    ];
    return list;
  }, [formData.dealType, selectedCategory]);

  const handleDealTypeChange = (newDealType) => {
    const subs =
      SUBCATEGORIES_BY_DEAL_TYPE[newDealType]?.[selectedCategory] || [];
    let nextSub = selectedSubcategory;
    if (!subs.includes(nextSub)) {
      nextSub = subs[0] || "Other";
      setSelectedSubcategory(nextSub);
    }
    setFormData((prev) => ({
      ...prev,
      dealType: newDealType,
      subcategory: nextSub === "Other" ? otherSubcategory : nextSub,
    }));
  };

  // Sync initial data when dialog opens
  useEffect(() => {
    if (initialData) {
      const isStdCat = STANDARD_CATEGORIES.includes(initialData.category);
      setSelectedCategory(isStdCat ? initialData.category : "Other");
      setOtherCategory(isStdCat ? "" : initialData.category || "");

      const isStdCity = STANDARD_CITIES.includes(initialData.city);
      setSelectedCity(isStdCity ? initialData.city : "Other");
      setOtherCity(isStdCity ? "" : initialData.city || "");

      const knownSubs =
        SUBCATEGORIES_BY_DEAL_TYPE[initialData.dealType]?.[
          initialData.category
        ] || [];
      const isStdSub = knownSubs.includes(initialData.subcategory);
      if (isStdCat && isStdSub) {
        setSelectedSubcategory(initialData.subcategory);
        setOtherSubcategory("");
      } else {
        setSelectedSubcategory("Other");
        setOtherSubcategory(initialData.subcategory || "");
      }

      setFormData({
        ...INITIAL_FORM,
        ...initialData,
        price: initialData.price ?? "",
        monthlyRent: initialData.monthlyRent ?? "",
        minPrice: initialData.minPrice ?? "",
        maxPrice: initialData.maxPrice ?? "",
        bhk: initialData.bhk || [],
        additionalSelection: initialData.additionalSelection || [],
        servantPujaStore: initialData.servantPujaStore || [],
        availableFor: initialData.availableFor || ["Family", "Company Lease"],
        usps: initialData.usps || [],
        amenities: initialData.amenities || [],
        areas:
          initialData.areas && initialData.areas.length > 0
            ? initialData.areas
            : [{ areaType: "Super Area", value: "", unit: "sq. ft." }],
        media: initialData.media || [],
      });
    } else {
      setFormData(INITIAL_FORM);
      setSelectedCategory("Residential");
      setSelectedSubcategory("Apartment");
      setSelectedCity("Gurgaon");
    }
    setFormErrors({});
    setActiveTab("basic");
  }, [initialData, isOpen]);

  // Multi-Area helpers
  const handleAddArea = () => {
    const defaultType = matrixRules.isPlot ? "Plot Area" : "Super Area";
    const defaultUnit = matrixRules.isPlot ? "sq. yd." : "sq. ft.";
    setFormData((prev) => ({
      ...prev,
      areas: [
        ...prev.areas,
        { areaType: defaultType, value: "", unit: defaultUnit },
      ],
    }));
  };

  const handleRemoveArea = (index) => {
    if (formData.areas.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      areas: prev.areas.filter((_, i) => i !== index),
    }));
  };

  const handleAreaChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.areas];
      const current = { ...updated[index], [field]: value };
      if (field === "areaType") {
        if (value === "Plot Area" && !["sq. yd.", "acre", "kanal", "sq. m."].includes(current.unit)) {
          current.unit = "sq. yd.";
        } else if (value !== "Plot Area" && !["sq. ft.", "sq. m."].includes(current.unit)) {
          current.unit = "sq. ft.";
        }
      }
      updated[index] = current;
      return { ...prev, areas: updated };
    });
  };

  const toggleArrayItem = (field, item) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      const updated = current.includes(item)
        ? current.filter((x) => x !== item)
        : [...current, item];
      return { ...prev, [field]: updated };
    });
  };

  // Upload handler
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      const uploaded = await uploadInventoryFiles(files);
      const items = Array.isArray(uploaded) ? uploaded : [uploaded];
      setFormData((prev) => ({
        ...prev,
        media: [...prev.media, ...items],
      }));
      toast.success("Media uploaded successfully");
    } catch (err) {
      toast.error("File upload failed", err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveMedia = (index) => {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};

    if (!formData.title?.trim()) {
      errors.title = `${matrixRules.titleLabel} is required`;
    }

    if (matrixRules.isDeveloperRequired && !formData.developerName?.trim()) {
      errors.developerName = "Developer Name is mandatory for Booking properties";
    }

    if (matrixRules.isProjectSocietyMandatory && !formData.projectSociety?.trim()) {
      errors.projectSociety = "Project / Society is mandatory for Apartments";
    }

    const effectiveCity =
      selectedCity === "Other" ? otherCity?.trim() : selectedCity;
    if (!effectiveCity) {
      errors.city =
        selectedCity === "Other" ? "Please enter city name" : "City is required";
    }

    if (!formData.locality?.trim()) {
      errors.locality = "Locality is required";
    }

    const effectiveCategory =
      selectedCategory === "Other" ? otherCategory?.trim() : selectedCategory;
    if (!effectiveCategory) {
      errors.category =
        selectedCategory === "Other"
          ? "Please enter category name"
          : "Category is required";
    }

    const effectiveSubcategory =
      selectedCategory === "Other" || selectedSubcategory === "Other"
        ? otherSubcategory?.trim()
        : selectedSubcategory;
    if (!effectiveSubcategory) {
      errors.subcategory = "Subcategory is required";
    }

    if (matrixRules.isBhkMandatory && (!formData.bhk || formData.bhk.length === 0)) {
      errors.bhk = "Please select at least one BHK configuration";
    }

    if (!formData.areas || formData.areas.length === 0) {
      errors.areas = "At least one area measurement is required";
    } else {
      const invalid = formData.areas.some(
        (a) => !a.value || isNaN(Number(a.value)) || Number(a.value) <= 0,
      );
      if (invalid) errors.areas = "All area values must be positive numbers";
    }

    if (formData.dealType === "LEASE") {
      if (!formData.monthlyRent || Number(formData.monthlyRent) <= 0) {
        errors.monthlyRent = "Monthly rent must be positive";
      }
      if (formData.leaseDuration && formData.lockInPeriod) {
        if (Number(formData.lockInPeriod) > Number(formData.leaseDuration)) {
          errors.lockInPeriod = "Lock-in period cannot exceed lease duration";
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      if (
        formErrors.title ||
        formErrors.developerName ||
        formErrors.projectSociety ||
        formErrors.city ||
        formErrors.locality ||
        formErrors.category ||
        formErrors.subcategory
      ) {
        setActiveTab("basic");
      } else if (formErrors.bhk || formErrors.areas) {
        setActiveTab("config");
      } else if (formErrors.monthlyRent || formErrors.lockInPeriod) {
        setActiveTab("pricing");
      }
      toast.warning("Incomplete Form", "Please check all required fields.");
      return;
    }

    const effectiveCategory =
      selectedCategory === "Other" ? otherCategory.trim() : selectedCategory;
    const effectiveSubcategory =
      selectedCategory === "Other" || selectedSubcategory === "Other"
        ? otherSubcategory.trim()
        : selectedSubcategory;
    const effectiveCity =
      selectedCity === "Other" ? otherCity.trim() : selectedCity;

    const payload = {
      ...formData,
      category: effectiveCategory,
      subcategory: effectiveSubcategory,
      city: effectiveCity,
      developerId: formData.developerId?.trim() ? formData.developerId : null,
      projectSociety: formData.projectSociety?.trim()
        ? formData.projectSociety
        : null,
      floorNumber: formData.floorNumber?.trim() ? formData.floorNumber : null,
      price:
        formData.price !== "" &&
        formData.price !== null &&
        !isNaN(Number(formData.price))
          ? Number(formData.price)
          : null,
      monthlyRent:
        formData.monthlyRent !== "" &&
        formData.monthlyRent !== null &&
        !isNaN(Number(formData.monthlyRent))
          ? Number(formData.monthlyRent)
          : null,
      minPrice:
        formData.minPrice !== "" &&
        formData.minPrice !== null &&
        !isNaN(Number(formData.minPrice))
          ? Number(formData.minPrice)
          : null,
      maxPrice:
        formData.maxPrice !== "" &&
        formData.maxPrice !== null &&
        !isNaN(Number(formData.maxPrice))
          ? Number(formData.maxPrice)
          : null,
      pricePerUnitArea:
        formData.pricePerUnitArea !== "" &&
        formData.pricePerUnitArea !== null &&
        !isNaN(Number(formData.pricePerUnitArea))
          ? Number(formData.pricePerUnitArea)
          : null,
      maintenanceCharges:
        formData.maintenanceCharges !== "" &&
        formData.maintenanceCharges !== null &&
        !isNaN(Number(formData.maintenanceCharges))
          ? Number(formData.maintenanceCharges)
          : null,
      leaseDuration:
        formData.leaseDuration !== "" &&
        formData.leaseDuration !== null &&
        !isNaN(Number(formData.leaseDuration))
          ? Number(formData.leaseDuration)
          : null,
      lockInPeriod:
        formData.lockInPeriod !== "" &&
        formData.lockInPeriod !== null &&
        !isNaN(Number(formData.lockInPeriod))
          ? Number(formData.lockInPeriod)
          : null,
      numberOfParkings:
        formData.numberOfParkings !== "" &&
        formData.numberOfParkings !== null &&
        !isNaN(Number(formData.numberOfParkings))
          ? Number(formData.numberOfParkings)
          : null,
      numberOfLifts:
        formData.numberOfLifts !== "" &&
        formData.numberOfLifts !== null &&
        !isNaN(Number(formData.numberOfLifts))
          ? Number(formData.numberOfLifts)
          : null,
      numberOfWashrooms:
        formData.numberOfWashrooms !== "" &&
        formData.numberOfWashrooms !== null &&
        !isNaN(Number(formData.numberOfWashrooms))
          ? Number(formData.numberOfWashrooms)
          : null,
      numberOfStoreys:
        formData.numberOfStoreys !== "" &&
        formData.numberOfStoreys !== null &&
        !isNaN(Number(formData.numberOfStoreys))
          ? Number(formData.numberOfStoreys)
          : null,
      numberOfUnits:
        formData.numberOfUnits !== "" &&
        formData.numberOfUnits !== null &&
        !isNaN(Number(formData.numberOfUnits))
          ? Number(formData.numberOfUnits)
          : null,
      totalFloors:
        formData.totalFloors !== "" &&
        formData.totalFloors !== null &&
        !isNaN(Number(formData.totalFloors))
          ? Number(formData.totalFloors)
          : null,
      ceilingHeight:
        formData.ceilingHeight !== "" &&
        formData.ceilingHeight !== null &&
        !isNaN(Number(formData.ceilingHeight))
          ? Number(formData.ceilingHeight)
          : null,
      roiPercentage:
        formData.roiPercentage !== "" &&
        formData.roiPercentage !== null &&
        !isNaN(Number(formData.roiPercentage))
          ? Number(formData.roiPercentage)
          : null,
      plotLength:
        formData.plotLength !== "" &&
        formData.plotLength !== null &&
        !isNaN(Number(formData.plotLength))
          ? Number(formData.plotLength)
          : null,
      plotBreadth:
        formData.plotBreadth !== "" &&
        formData.plotBreadth !== null &&
        !isNaN(Number(formData.plotBreadth))
          ? Number(formData.plotBreadth)
          : null,
      possessionYear:
        formData.possessionYear !== "" &&
        formData.possessionYear !== null &&
        !isNaN(Number(formData.possessionYear))
          ? Number(formData.possessionYear)
          : null,
      availableFromDate:
        formData.availableFromDate &&
        typeof formData.availableFromDate === "string" &&
        formData.availableFromDate.trim() !== ""
          ? new Date(formData.availableFromDate).toISOString()
          : null,
      possessionDate:
        formData.possessionDate &&
        typeof formData.possessionDate === "string" &&
        formData.possessionDate.trim() !== ""
          ? new Date(formData.possessionDate).toISOString()
          : null,
      areas: formData.areas.map((a) => ({
        areaType: a.areaType,
        value: Number(a.value),
        unit: a.unit,
        minArea: a.minArea ? Number(a.minArea) : null,
        maxArea: a.maxArea ? Number(a.maxArea) : null,
      })),
    };

    onSubmit(payload);
  };

  const formTabs = useMemo(() => {
    if (formData.dealType === "BOOKING") {
      return [
        { id: "basic", label: "Project & Location" },
        { id: "config", label: "Configs & Areas" },
        { id: "pricing", label: "Pricing & CLP Plan" },
        { id: "specs", label: "Project Specifications" },
        { id: "usps", label: "USPs & Amenities" },
        { id: "contacts", label: "Developer Sales & Media" },
      ];
    }
    if (formData.dealType === "RETRADE") {
      return [
        { id: "basic", label: "Property & Location" },
        { id: "config", label: "Configs & Areas" },
        { id: "pricing", label: "Price & Resale Terms" },
        { id: "specs", label: "Property Specifications" },
        { id: "usps", label: "USPs & Amenities" },
        { id: "contacts", label: "Seller Info & Media" },
      ];
    }
    return [
      { id: "basic", label: "Property & Location" },
      { id: "config", label: "Configs & Areas" },
      { id: "pricing", label: "Rent & Lease Terms" },
      { id: "specs", label: "Property Specifications" },
      { id: "usps", label: "USPs & Amenities" },
      { id: "contacts", label: "Landlord Info & Media" },
    ];
  }, [formData.dealType]);

  const tabIds = formTabs.map((t) => t.id);
  const currentTabIndex = tabIds.indexOf(activeTab);
  const isFirstTab = currentTabIndex <= 0;
  const isLastTab = currentTabIndex >= tabIds.length - 1;

  const handleNextTab = () => {
    if (!isLastTab) {
      setActiveTab(tabIds[currentTabIndex + 1]);
    }
  };

  const handlePrevTab = () => {
    if (!isFirstTab) {
      setActiveTab(tabIds[currentTabIndex - 1]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-border">
        <DialogHeader className="p-6 pb-4 border-b border-border bg-slate-50/60 sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-heading font-bold text-slate-900">
                {isEdit
                  ? `Edit ${formData.dealType} Property`
                  : `Add ${formData.dealType} Inventory`}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Multi-transaction form with matrix-adapted validation
              </DialogDescription>
            </div>

            {/* 3 Prominent Deal Type Cards */}
            <div className="flex bg-slate-200/80 p-1 rounded-xl border border-slate-300">
              <button
                type="button"
                onClick={() => handleDealTypeChange("BOOKING")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  formData.dealType === "BOOKING"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                Booking
              </button>
              <button
                type="button"
                onClick={() => handleDealTypeChange("RETRADE")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  formData.dealType === "RETRADE"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                Retrade
              </button>
              <button
                type="button"
                onClick={() => handleDealTypeChange("LEASE")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  formData.dealType === "LEASE"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                Lease
              </button>
            </div>
          </div>

          {/* Dialog Tabs Bar */}
          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-200 overflow-x-auto text-xs">
            {formTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-white text-slate-900 border border-slate-300 font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </DialogHeader>

        {/* Dialog Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* TAB 1: BASIC DETAILS */}
          {activeTab === "basic" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    {matrixRules.titleLabel}{" "}
                    <span className="text-danger">*</span>
                  </Label>
                  <Input
                    placeholder={matrixRules.titlePlaceholder}
                    value={formData.title}
                    className="h-10 text-sm bg-white"
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                  {formErrors.title && (
                    <p className="text-xs text-danger font-medium">
                      {formErrors.title}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Developer Name{" "}
                    {matrixRules.isDeveloperRequired ? (
                      <span className="text-danger">*</span>
                    ) : (
                      <span className="text-slate-400 font-normal">
                        (Optional)
                      </span>
                    )}
                  </Label>
                  <select
                    value={formData.developerName || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "CUSTOM") {
                        setFormData({
                          ...formData,
                          developerName: "",
                          developerId: null,
                        });
                      } else {
                        const dev = masterData?.developers?.find(
                          (d) => d.name === val,
                        );
                        setFormData({
                          ...formData,
                          developerName: val,
                          developerId: dev ? dev.id : null,
                        });
                      }
                    }}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm shadow-xs"
                  >
                    <option value="">Select Developer (or Independent)</option>
                    {masterData?.developers?.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                    <option value="CUSTOM">+ Enter Custom Developer</option>
                  </select>
                  {formData.developerName === "" && (
                    <Input
                      placeholder="Enter custom developer name"
                      className="mt-1.5 h-10 text-sm bg-white"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          developerName: e.target.value,
                          developerId: null,
                        })
                      }
                    />
                  )}
                  {formErrors.developerName && (
                    <p className="text-xs text-danger font-medium">
                      {formErrors.developerName}
                    </p>
                  )}
                </div>

                {matrixRules.showProjectSociety && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Project / Society Name{" "}
                      {matrixRules.isProjectSocietyMandatory ? (
                        <span className="text-danger">*</span>
                      ) : (
                        <span className="text-slate-400 font-normal">
                          (Optional)
                        </span>
                      )}
                    </Label>
                    <Input
                      placeholder="e.g. DLF Phase 5 / Sobha City"
                      value={formData.projectSociety}
                      className="h-10 text-sm bg-white"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          projectSociety: e.target.value,
                        })
                      }
                    />
                    {formErrors.projectSociety && (
                      <p className="text-xs text-danger font-medium">
                        {formErrors.projectSociety}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Category <span className="text-danger">*</span>
                  </Label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      const cat = e.target.value;
                      setSelectedCategory(cat);
                      if (cat === "Other") {
                        setFormData((prev) => ({
                          ...prev,
                          category: otherCategory,
                          subcategory: otherSubcategory || "",
                        }));
                      } else {
                        const subs =
                          SUBCATEGORIES_BY_DEAL_TYPE[formData.dealType]?.[cat] || [];
                        const firstSub = subs[0] || "";
                        setSelectedSubcategory(firstSub);
                        setFormData((prev) => ({
                          ...prev,
                          category: cat,
                          subcategory: firstSub,
                        }));
                      }
                    }}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm shadow-xs"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {selectedCategory === "Other" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Specify Other Category <span className="text-danger">*</span>
                    </Label>
                    <Input
                      placeholder="e.g. Industrial, Land"
                      value={otherCategory}
                      className="h-10 text-sm bg-white"
                      onChange={(e) => {
                        const val = e.target.value;
                        setOtherCategory(val);
                        setFormData((prev) => ({ ...prev, category: val }));
                      }}
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Sub-category <span className="text-danger">*</span>
                  </Label>
                  {selectedCategory === "Other" ? (
                    <Input
                      placeholder="e.g. Warehouse, Land"
                      value={otherSubcategory}
                      className="h-10 text-sm bg-white"
                      onChange={(e) => {
                        const val = e.target.value;
                        setOtherSubcategory(val);
                        setFormData((prev) => ({ ...prev, subcategory: val }));
                      }}
                    />
                  ) : (
                    <select
                      value={selectedSubcategory}
                      onChange={(e) => {
                        const sub = e.target.value;
                        setSelectedSubcategory(sub);
                        if (sub === "Other") {
                          setFormData((prev) => ({
                            ...prev,
                            subcategory: otherSubcategory,
                          }));
                        } else {
                          setFormData((prev) => ({ ...prev, subcategory: sub }));
                        }
                      }}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm shadow-xs"
                    >
                      {availableSubcategories.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  )}
                  {formErrors.subcategory && (
                    <p className="text-xs text-danger font-medium">
                      {formErrors.subcategory}
                    </p>
                  )}
                </div>

                {selectedCategory !== "Other" && selectedSubcategory === "Other" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Specify Other Subcategory <span className="text-danger">*</span>
                    </Label>
                    <Input
                      placeholder="e.g. Studio, Kiosk"
                      value={otherSubcategory}
                      className="h-10 text-sm bg-white"
                      onChange={(e) => {
                        const val = e.target.value;
                        setOtherSubcategory(val);
                        setFormData((prev) => ({ ...prev, subcategory: val }));
                      }}
                    />
                  </div>
                )}

                {/* City */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    City <span className="text-danger">*</span>
                  </Label>
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      const c = e.target.value;
                      setSelectedCity(c);
                      if (c === "Other") {
                        setFormData((prev) => ({ ...prev, city: otherCity }));
                      } else {
                        setFormData((prev) => ({ ...prev, city: c }));
                      }
                    }}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm shadow-xs"
                  >
                    {STANDARD_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.city && (
                    <p className="text-xs text-danger font-medium">
                      {formErrors.city}
                    </p>
                  )}
                </div>

                {selectedCity === "Other" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Specify Other City <span className="text-danger">*</span>
                    </Label>
                    <Input
                      placeholder="Enter city name"
                      value={otherCity}
                      className="h-10 text-sm bg-white"
                      onChange={(e) => {
                        const val = e.target.value;
                        setOtherCity(val);
                        setFormData((prev) => ({ ...prev, city: val }));
                      }}
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Locality / Sector <span className="text-danger">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. Sector 54"
                    value={formData.locality}
                    className="h-10 text-sm bg-white"
                    onChange={(e) =>
                      setFormData({ ...formData, locality: e.target.value })
                    }
                  />
                  {formErrors.locality && (
                    <p className="text-xs text-danger font-medium">
                      {formErrors.locality}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Facing Direction <span className="text-danger">*</span>
                  </Label>
                  <select
                    value={formData.facingDirection}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        facingDirection: e.target.value,
                      })
                    }
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm shadow-xs"
                  >
                    {[
                      "North",
                      "North-East",
                      "East",
                      "South-East",
                      "South",
                      "South-West",
                      "West",
                      "North-West",
                    ].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {matrixRules.isBooking ? (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">
                        Status <span className="text-danger">*</span>
                      </Label>
                      <select
                        value={formData.projectStatus}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            projectStatus: e.target.value,
                          })
                        }
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm shadow-xs"
                      >
                        <option value="Pre Launch">Pre Launch</option>
                        <option value="Launched">Launched</option>
                        <option value="Under Construction">
                          Under Construction
                        </option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">
                        Possession Timeline <span className="text-danger">*</span>
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={formData.possessionMonth || "December"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              possessionMonth: e.target.value,
                            })
                          }
                          className="h-10 rounded-md border border-input bg-background px-2 text-xs shadow-xs"
                        >
                          {MONTHS_LIST.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                        <select
                          value={formData.possessionYear || CURRENT_YEAR + 2}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              possessionYear: Number(e.target.value),
                            })
                          }
                          className="h-10 rounded-md border border-input bg-background px-2 text-xs shadow-xs"
                        >
                          {YEARS_LIST.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Availability Status <span className="text-danger">*</span>
                    </Label>
                    {matrixRules.isLease ? (
                      <select
                        value={
                          formData.availabilityStatus === "Immediate"
                            ? "Immediate"
                            : "Date Selection"
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({
                            ...formData,
                            availabilityStatus: val,
                            availableFromDate:
                              val === "Immediate" ? "" : formData.availableFromDate,
                          });
                        }}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm shadow-xs"
                      >
                        <option value="Immediate">Immediate</option>
                        <option value="Date Selection">Date Selection</option>
                      </select>
                    ) : (
                      <select
                        value={formData.availabilityStatus}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            availabilityStatus: e.target.value,
                          })
                        }
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm shadow-xs"
                      >
                        <option value="Ready to Move">Ready to Move</option>
                        <option value="Under Construction">
                          Under Construction
                        </option>
                      </select>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CONFIG & AREAS */}
          {activeTab === "config" && (
            <div className="space-y-4">
              {matrixRules.showBhk && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">
                    Configuration BHK{" "}
                    {matrixRules.isBhkMandatory ? (
                      <span className="text-danger">*</span>
                    ) : (
                      <span className="text-slate-400 font-normal">
                        (Optional)
                      </span>
                    )}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "1 RK",
                      "1 BHK",
                      "1.5 BHK",
                      "2 BHK",
                      "2.5 BHK",
                      "3 BHK",
                      "3.5 BHK",
                      "4 BHK",
                      "4.5 BHK",
                      "5 BHK",
                      "5+ BHK",
                    ].map((bhk) => {
                      const selected = formData.bhk.includes(bhk);
                      return (
                        <button
                          key={bhk}
                          type="button"
                          onClick={() => toggleArrayItem("bhk", bhk)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            selected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {bhk}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {matrixRules.showAlsoSelection && (
                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-semibold text-slate-700">
                    Also Selection (Optional)
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {["Penthouse", "Duplex", "Triplex"].map((opt) => {
                      const selected =
                        formData.additionalSelection.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            toggleArrayItem("additionalSelection", opt)
                          }
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            selected
                              ? "bg-slate-800 text-white border-slate-800"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {matrixRules.showRooms && (
                <div className="space-y-1.5 pt-2">
                  <Label className="text-xs font-semibold text-slate-700">
                    No. of Rooms <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g. 12"
                    value={formData.numberOfUnits || ""}
                    className="h-10 max-w-xs text-sm bg-white"
                    onChange={(e) =>
                      setFormData({ ...formData, numberOfUnits: e.target.value })
                    }
                  />
                </div>
              )}

              {/* Area Measurements */}
              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-900">
                    Area Measurements <span className="text-danger">*</span>
                  </Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddArea}
                    className="text-xs h-8"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Measurement
                  </Button>
                </div>

                <div className="space-y-2">
                  {formData.areas.map((area, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 p-2 rounded-lg border bg-slate-50 items-center"
                    >
                      <div className="col-span-5">
                        <select
                          value={area.areaType}
                          onChange={(e) =>
                            handleAreaChange(idx, "areaType", e.target.value)
                          }
                          className="w-full h-9 rounded border bg-white px-2 text-xs"
                        >
                          {matrixRules.allowedAreaTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-4">
                        <Input
                          type="number"
                          placeholder="Value"
                          value={area.value}
                          onChange={(e) =>
                            handleAreaChange(idx, "value", e.target.value)
                          }
                          className="h-9 text-xs bg-white"
                        />
                      </div>

                      <div className="col-span-2">
                        <select
                          value={area.unit}
                          onChange={(e) =>
                            handleAreaChange(idx, "unit", e.target.value)
                          }
                          className="w-full h-9 rounded border bg-white px-1.5 text-xs"
                        >
                          {area.areaType === "Plot Area" ? (
                            <>
                              <option value="sq. yd.">sq. yd.</option>
                              <option value="sq. m.">sq. m.</option>
                              <option value="acre">acre</option>
                              <option value="kanal">kanal</option>
                            </>
                          ) : (
                            <>
                              <option value="sq. ft.">sq. ft.</option>
                              <option value="sq. m.">sq. m.</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div className="col-span-1 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={formData.areas.length <= 1}
                          onClick={() => handleRemoveArea(idx)}
                          className="h-8 w-8 text-danger"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRICING & TERMS */}
          {activeTab === "pricing" && (
            <div className="space-y-4">
              {formData.dealType === "LEASE" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Monthly Rent <span className="text-danger">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="e.g. 85000"
                        value={formData.monthlyRent}
                        className="h-10 text-sm bg-white"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            monthlyRent: e.target.value,
                          })
                        }
                      />
                      <select
                        value={formData.priceUnit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            priceUnit: e.target.value,
                          })
                        }
                        className="w-28 h-10 rounded border bg-background px-2 text-xs"
                      >
                        <option value="Thousands">Thousands</option>
                        <option value="Lakhs">Lakhs</option>
                        <option value="Crores">Crores</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Security Deposit <span className="text-danger">*</span>
                    </Label>
                    <Input
                      placeholder="e.g. 2 Months"
                      value={formData.securityDeposit}
                      className="h-10 text-sm bg-white"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          securityDeposit: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Maintenance Charges (₹)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="e.g. 6500"
                        value={formData.maintenanceCharges}
                        className="h-10 text-sm bg-white"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maintenanceCharges: e.target.value,
                          })
                        }
                      />
                      <select
                        value={formData.maintenanceFrequency}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maintenanceFrequency: e.target.value,
                          })
                        }
                        className="w-32 h-10 rounded border bg-background px-2 text-xs"
                      >
                        <option value="Per Month">Per Month</option>
                        <option value="Per Quarter">Per Quarter</option>
                        <option value="Per Year">Per Year</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Lease Duration (Months)
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g. 11"
                      value={formData.leaseDuration}
                      className="h-10 text-sm bg-white"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          leaseDuration: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Price <span className="text-danger">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="e.g. 4.5"
                        value={formData.price}
                        className="h-10 text-sm bg-white"
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                      />
                      <select
                        value={formData.priceUnit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            priceUnit: e.target.value,
                          })
                        }
                        className="w-28 h-10 rounded border bg-background px-2 text-xs"
                      >
                        <option value="Crores">Crores</option>
                        <option value="Lakhs">Lakhs</option>
                        <option value="Thousands">Thousands</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Price / sq. unit Area (₹)
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g. 18500"
                      value={formData.pricePerUnitArea}
                      className="h-10 text-sm bg-white"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricePerUnitArea: e.target.value,
                        })
                      }
                    />
                  </div>

                  {formData.dealType === "BOOKING" && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">
                        Payment Plan
                      </Label>
                      <Input
                        placeholder="e.g. CLP / 30:70"
                        value={formData.paymentPlan}
                        className="h-10 text-sm bg-white"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentPlan: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SPECIFICATIONS */}
          {activeTab === "specs" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {matrixRules.showFurnishing && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Furnishing <span className="text-danger">*</span>
                    </Label>
                    <select
                      value={formData.furnishing}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          furnishing: e.target.value,
                        })
                      }
                      className="w-full h-10 rounded border bg-background px-3 text-sm"
                    >
                      {FURNISHING_OPTIONS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {matrixRules.showFloorNumber && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">
                        Floor Number
                      </Label>
                      <Input
                        placeholder="e.g. 7"
                        value={formData.floorNumber}
                        className="h-10 text-sm bg-white"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            floorNumber: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">
                        Total Floors
                      </Label>
                      <Input
                        type="number"
                        placeholder="e.g. 24"
                        value={formData.totalFloors}
                        className="h-10 text-sm bg-white"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            totalFloors: e.target.value,
                          })
                        }
                      />
                    </div>
                  </>
                )}

                {matrixRules.showNumberOfFloors && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      {matrixRules.isBooking ? "No. of Storeys" : "No. of Floors"}
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g. 3"
                      value={formData.numberOfStoreys}
                      className="h-10 text-sm bg-white"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          numberOfStoreys: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                {matrixRules.showParking && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Parking
                    </Label>
                    <select
                      value={formData.parkingType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          parkingType: e.target.value,
                        })
                      }
                      className="w-full h-10 rounded border bg-background px-3 text-sm"
                    >
                      <option value="Covered">Covered</option>
                      <option value="Open">Open</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: USPS & AMENITIES */}
          {activeTab === "usps" && (
            <div className="space-y-6">
              {/* USPs 3 Columns */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-900 uppercase">
                  USPs (Unique Selling Propositions)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Object.entries(USP_GROUPS).map(([title, list]) => (
                    <div key={title} className="p-3 rounded-lg border bg-slate-50">
                      <span className="text-xs font-bold text-slate-700 block mb-2">
                        {title}
                      </span>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {list.map((u) => {
                          const checked = formData.usps.includes(u);
                          return (
                            <button
                              key={u}
                              type="button"
                              onClick={() => toggleArrayItem("usps", u)}
                              className={`w-full text-left text-xs p-1.5 rounded flex items-center justify-between ${
                                checked
                                  ? "bg-amber-500 text-white font-semibold"
                                  : "bg-white hover:bg-slate-100 text-slate-700"
                              }`}
                            >
                              <span>{u}</span>
                              {checked && <Check className="w-3 h-3" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities 3 Columns */}
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-xs font-bold text-slate-900 uppercase">
                  Amenities & Facilities
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Object.entries(AMENITIES_GROUPS).map(([title, list]) => (
                    <div key={title} className="p-3 rounded-lg border bg-slate-50">
                      <span className="text-xs font-bold text-slate-700 block mb-2">
                        {title}
                      </span>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {list.map((a) => {
                          const checked = formData.amenities.includes(a);
                          return (
                            <button
                              key={a}
                              type="button"
                              onClick={() => toggleArrayItem("amenities", a)}
                              className={`w-full text-left text-xs p-1.5 rounded flex items-center justify-between ${
                                checked
                                  ? "bg-emerald-600 text-white font-semibold"
                                  : "bg-white hover:bg-slate-100 text-slate-700"
                              }`}
                            >
                              <span>{a}</span>
                              {checked && <Check className="w-3 h-3" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CONTACTS & MEDIA */}
          {activeTab === "contacts" && (
            <div className="space-y-4">
              {formData.dealType === "BOOKING" ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Developer Sales Representative
                    </Label>
                    <Input
                      placeholder="e.g. Sales Executive"
                      value={formData.developerContactName}
                      className="h-10 text-sm bg-white"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          developerContactName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Phone Number
                    </Label>
                    <Input
                      placeholder="e.g. +91 98112 00000"
                      value={formData.developerContactNumber}
                      className="h-10 text-sm bg-white"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          developerContactNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Designation
                    </Label>
                    <Input
                      placeholder="e.g. Director Sales"
                      value={formData.developerContactDesignation}
                      className="h-10 text-sm bg-white"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          developerContactDesignation: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      {formData.dealType === "LEASE" ? "Landlord Name" : "Seller Name"}
                    </Label>
                    <Input
                      placeholder="e.g. Property Owner"
                      value={formData.sellerName}
                      className="h-10 text-sm bg-white"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sellerName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Contact Phone
                    </Label>
                    <Input
                      placeholder="e.g. +91 98112 34567"
                      value={formData.sellerPhone}
                      className="h-10 text-sm bg-white"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sellerPhone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5 pt-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Description & Notes
                </Label>
                <textarea
                  rows={3}
                  placeholder="Key features, highlights, landmarks..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded border bg-background p-2.5 text-xs shadow-2xs"
                />
              </div>

              {/* Media Upload */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700">
                    Photos & Documents
                  </Label>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border bg-white text-xs font-semibold hover:bg-slate-50 cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-primary" />
                      {isUploading ? "Uploading..." : "Upload Files"}
                    </span>
                  </label>
                </div>

                {formData.media && formData.media.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {formData.media.map((item, idx) => (
                      <div
                        key={idx}
                        className="relative rounded border bg-slate-100 h-20 flex items-center justify-center overflow-hidden group"
                      >
                        {item.type === "IMAGE" || item.mimeType?.startsWith("image/") ? (
                          <img
                            src={item.url}
                            alt="Media"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileText className="w-8 h-8 text-blue-500" />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="p-4 border-t sticky bottom-0 bg-white z-10 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
              className="text-xs h-9 px-4 bg-card border-border text-foreground hover:bg-muted cursor-pointer font-semibold"
            >
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              {!isFirstTab && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevTab}
                  className="text-xs h-9 px-3 bg-card border-border text-foreground hover:bg-muted cursor-pointer font-semibold"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  Prev
                </Button>
              )}
              {!isLastTab && (
                <Button
                  type="button"
                  onClick={handleNextTab}
                  className="bg-primary hover:bg-brand-dark text-primary-foreground font-semibold text-xs h-9 px-3.5 shadow-2xs cursor-pointer"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              )}
              <Button
                type="submit"
                disabled={isPending}
                className="bg-primary hover:bg-brand-dark text-primary-foreground font-semibold text-xs h-9 px-5 shadow-xs"
              >
                {isPending
                  ? "Saving..."
                  : isEdit
                    ? "Update Property"
                    : "Save Property"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyFormDialog;
