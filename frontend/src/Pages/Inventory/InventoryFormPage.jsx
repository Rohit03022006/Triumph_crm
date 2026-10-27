import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Building2,
  Upload,
  Plus,
  Trash2,
  Home,
  Key,
  Layers,
  Sparkles,
  Info,
  Check,
  X,
  FileText,
  ImageIcon,
  Save,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  MapPin,
  IndianRupee,
  Ruler,
  Compass,
  Phone,
  User,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Send,
  Clock,
  ShieldAlert,
} from "lucide-react";
import {
  fetchPropertyById,
  createProperty,
  updateProperty,
  fetchInventoryMasterData,
  uploadInventoryFiles,
} from "@/api/inventory";
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
} from "@/components/Inventory_Management/inventoryMatrixConfig";

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

const fetchMe = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
    credentials: "include",
  });
  if (!res.ok) return null;
  return (await res.json()).data;
};

const InventoryFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
  });

  const isEdit = Boolean(id);
  const isExecutive = currentUser?.role === "EXECUTIVE" || location.pathname.startsWith("/executive");
  const basePath = isExecutive ? "/executive/inventory" : "/admin/inventory";

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [activeTab, setActiveTab] = useState("mandatory");
  const [formErrors, setFormErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  // Category, Subcategory & City states
  const [selectedCategory, setSelectedCategory] = useState("Residential");
  const [otherCategory, setOtherCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("Apartment");
  const [otherSubcategory, setOtherSubcategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("Gurgaon");
  const [otherCity, setOtherCity] = useState("");

  // Master data
  const { data: masterData } = useQuery({
    queryKey: ["inventoryMasterData"],
    queryFn: fetchInventoryMasterData,
    staleTime: 5 * 60 * 1000,
  });

  // If edit mode, fetch current property
  const { data: existingProperty, isLoading: isFetchingProperty } = useQuery({
    queryKey: ["property", id],
    queryFn: () => fetchPropertyById(id),
    enabled: isEdit,
  });

  // Calculate dynamic matrix visibility
  const matrixRules = useMemo(() => {
    const effectiveCat =
      selectedCategory === "Other"
        ? otherCategory || "Other"
        : selectedCategory;
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

  // Ensure selected subcategory is valid when dealType or category changes
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

  // Populate initial values on edit
  useEffect(() => {
    if (isEdit && existingProperty) {
      const isStdCat = STANDARD_CATEGORIES.includes(existingProperty.category);
      setSelectedCategory(isStdCat ? existingProperty.category : "Other");
      setOtherCategory(isStdCat ? "" : existingProperty.category || "");

      const isStdCity = STANDARD_CITIES.includes(existingProperty.city);
      setSelectedCity(isStdCity ? existingProperty.city : "Other");
      setOtherCity(isStdCity ? "" : existingProperty.city || "");

      const knownSubs =
        SUBCATEGORIES_BY_DEAL_TYPE[existingProperty.dealType]?.[
          existingProperty.category
        ] || [];
      const isStdSub = knownSubs.includes(existingProperty.subcategory);
      if (isStdCat && isStdSub) {
        setSelectedSubcategory(existingProperty.subcategory);
        setOtherSubcategory("");
      } else {
        setSelectedSubcategory("Other");
        setOtherSubcategory(existingProperty.subcategory || "");
      }

      setFormData({
        ...INITIAL_FORM,
        ...existingProperty,
        price: existingProperty.price ?? "",
        monthlyRent: existingProperty.monthlyRent ?? "",
        minPrice: existingProperty.minPrice ?? "",
        maxPrice: existingProperty.maxPrice ?? "",
        bhk: existingProperty.bhk || [],
        additionalSelection: existingProperty.additionalSelection || [],
        servantPujaStore: existingProperty.servantPujaStore || [],
        availableFor: existingProperty.availableFor || [
          "Family",
          "Company Lease",
        ],
        usps: existingProperty.usps || [],
        amenities: existingProperty.amenities || [],
        areas:
          existingProperty.areas && existingProperty.areas.length > 0
            ? existingProperty.areas
            : [{ areaType: "Super Area", value: "", unit: "sq. ft." }],
        media: existingProperty.media || [],
      });
    }
  }, [isEdit, existingProperty]);

  // Mutations
  const createMut = useMutation({
    mutationFn: createProperty,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["inventoryProperties"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryMetrics"] });
      queryClient.invalidateQueries({ queryKey: ["auditLogs"] });
      if (isExecutive) {
        toast.success(
          "Submitted for Review!",
          "Your new inventory item has been submitted for Admin approval. It will appear on the Approvals Dashboard.",
        );
      } else {
        toast.success("Property created successfully!");
      }
      const newId = data?.data?.id;
      navigate(newId ? `${basePath}/${newId}` : basePath, { replace: true });
    },
    onError: (err) => {
      toast.error(
        "Failed to create property",
        err.message || "Please check the form fields",
      );
    },
  });

  const updateMut = useMutation({
    mutationFn: (payload) => updateProperty({ id, data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property", id] });
      queryClient.invalidateQueries({ queryKey: ["inventoryProperties"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryMetrics"] });
      toast.success("Property updated successfully!");
      navigate(`${basePath}/${id}`, { replace: true });
    },
    onError: (err) => {
      toast.error(
        "Failed to update property",
        err.message || "Please check the form fields",
      );
    },
  });

  const isPending = createMut.isPending || updateMut.isPending;

  const handleBackOrCancel = () => {
    if (isEdit) {
      navigate(`${basePath}/${id}`, { replace: true });
    } else {
      const savedQuery = sessionStorage.getItem("inventory_search_params");
      navigate(savedQuery ? `${basePath}?${savedQuery}` : basePath);
    }
  };

  const handleBackToInventory = () => {
    const savedQuery = sessionStorage.getItem("inventory_search_params");
    navigate(savedQuery ? `${basePath}?${savedQuery}` : basePath);
  };

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
      // Auto-set appropriate default unit when areaType changes
      if (field === "areaType") {
        if (
          value === "Plot Area" &&
          !["sq. yd.", "acre", "kanal", "sq. m."].includes(current.unit)
        ) {
          current.unit = "sq. yd.";
        } else if (
          value !== "Plot Area" &&
          !["sq. ft.", "sq. m."].includes(current.unit)
        ) {
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

  // Matrix-driven Form Validation
  const validateForm = () => {
    const errors = {};

    // Title / Project Name
    if (!formData.title?.trim()) {
      errors.title = `${matrixRules.titleLabel} is required`;
    }

    // Developer requirement for Booking
    if (matrixRules.isDeveloperRequired && !formData.developerName?.trim()) {
      errors.developerName =
        "Developer Name is mandatory for Booking properties";
    }

    // Project / Society requirement for Retrade/Lease Apartment
    if (
      matrixRules.isProjectSocietyMandatory &&
      !formData.projectSociety?.trim()
    ) {
      errors.projectSociety = "Project / Society is mandatory for Apartments";
    }

    // City validation
    const effectiveCity =
      selectedCity === "Other" ? otherCity?.trim() : selectedCity;
    if (!effectiveCity) {
      errors.city =
        selectedCity === "Other"
          ? "Please enter city name"
          : "City is required";
    }

    // Locality validation
    if (!formData.locality?.trim()) {
      errors.locality = "Locality is required";
    }

    // Category validation
    const effectiveCategory =
      selectedCategory === "Other" ? otherCategory?.trim() : selectedCategory;
    if (!effectiveCategory) {
      errors.category =
        selectedCategory === "Other"
          ? "Please enter category name"
          : "Category is required";
    }

    // Subcategory validation
    const effectiveSubcategory =
      selectedCategory === "Other" || selectedSubcategory === "Other"
        ? otherSubcategory?.trim()
        : selectedSubcategory;
    if (!effectiveSubcategory) {
      errors.subcategory = "Subcategory is required";
    }

    // BHK validation if mandatory
    if (
      matrixRules.isBhkMandatory &&
      (!formData.bhk || formData.bhk.length === 0)
    ) {
      errors.bhk = "Please select at least one BHK configuration";
    }

    // Areas validation
    if (!formData.areas || formData.areas.length === 0) {
      errors.areas = "At least one area measurement is required";
    } else {
      const invalid = formData.areas.some(
        (a) => !a.value || isNaN(Number(a.value)) || Number(a.value) <= 0,
      );
      if (invalid) errors.areas = "All area values must be positive numbers";
    }

    // Deal specific pricing checks
    if (formData.dealType === "LEASE") {
      if (!formData.monthlyRent || Number(formData.monthlyRent) <= 0) {
        errors.monthlyRent = "Monthly rent must be a positive number";
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
      setActiveTab("mandatory");
      toast.warning("Incomplete Form", "Please fill in all required mandatory fields highlighted in red.");
      window.scrollTo({ top: 200, behavior: "smooth" });
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
      status: isExecutive && !isEdit ? "UNDER_REVIEW" : formData.status,
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

    if (isEdit) {
      updateMut.mutate(payload);
    } else {
      createMut.mutate(payload);
    }
  };

  // 2 Form Tabs: 1st All Mandatory, 2nd Optional Details
  const formTabs = useMemo(
    () => [
      { id: "mandatory", label: "Mandatory Details" },
      { id: "optional", label: "Optional Details" },
    ],
    [],
  );

  const tabIds = formTabs.map((t) => t.id);
  const currentTabIndex = tabIds.indexOf(activeTab);
  const isFirstTab = currentTabIndex <= 0;
  const isLastTab = currentTabIndex >= tabIds.length - 1;

  const handleNextTab = () => {
    if (!isLastTab) {
      setActiveTab(tabIds[currentTabIndex + 1]);
      window.scrollTo({ top: 200, behavior: "smooth" });
    }
  };

  const handlePrevTab = () => {
    if (!isFirstTab) {
      setActiveTab(tabIds[currentTabIndex - 1]);
      window.scrollTo({ top: 200, behavior: "smooth" });
    }
  };

  if (isEdit && isFetchingProperty) {
    return (
      <div className="flex items-center justify-center min-h-125">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-base text-slate-600 font-medium">
            Loading property for editing...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 pb-20 overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBackOrCancel}
            className="rounded-full shadow-sm bg-white hover:bg-slate-50 border-slate-200 shrink-0 w-10 h-10"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Button>

          <div>
            <div className="text-sm text-slate-500 flex items-center gap-2 mb-1.5 font-medium">
              <span
                onClick={handleBackToInventory}
                className="cursor-pointer hover:text-slate-900 transition-colors"
              >
                Dashboard
              </span>
              <span>›</span>
              <span
                onClick={handleBackToInventory}
                className="cursor-pointer hover:text-slate-900 transition-colors"
              >
                Inventory
              </span>
              <span>›</span>
              {isEdit && (
                <>
                  <span
                    onClick={() =>
                      navigate(`${basePath}/${id}`, { replace: true })
                    }
                    className="cursor-pointer hover:text-slate-900 transition-colors line-clamp-1 max-w-[240px]"
                  >
                    {existingProperty?.title || id}
                  </span>
                  <span>›</span>
                </>
              )}
              <span className="font-semibold text-slate-800">
                {isEdit
                  ? `Edit ${formData.dealType} Information`
                  : `Add ${formData.dealType} Inventory`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight">
                {isEdit
                  ? `Edit ${formData.dealType} Property`
                  : `Add New ${formData.dealType} Property`}
              </h1>
              <Badge
                className={
                  formData.dealType === "BOOKING"
                    ? "bg-blue-300 text-white"
                    : formData.dealType === "RETRADE"
                      ? "bg-amber-300 text-white"
                      : "bg-emerald-300 text-white"
                }
              >
                {formData.dealType}
              </Badge>
            </div>
            <p className="text-sm text-slate-600 mt-1 font-normal">
              {formData.dealType === "BOOKING" &&
                "Primary project booking form with developer master, CLP plans, and project specifications"}
              {formData.dealType === "RETRADE" &&
                "Resale property form with society master, floor config, resale terms, and seller details"}
              {formData.dealType === "LEASE" &&
                "Rental lease form with monthly rent, security deposit, lock-in period, and tenant parameters"}
            </p>
          </div>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-primary hover:bg-brand-dark text-primary-foreground font-semibold text-sm h-10 px-5 shadow-sm flex items-center gap-2"
          >
            {isPending ? (
              "Saving..."
            ) : isExecutive && !isEdit ? (
              <>
                <Send className="w-4 h-4" />
                Send for Review to Admin
              </>
            ) : isEdit ? (
              <>
                <Save className="w-4 h-4" />
                Update Property
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Property
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Executive Review Banner */}
      {isExecutive && !isEdit && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 flex items-start gap-3.5 shadow-xs">
          <div className="p-2 bg-amber-100/80 rounded-lg shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 text-amber-700" />
          </div>
          <div className="text-sm space-y-1">
            <h4 className="font-bold text-amber-950 text-sm">
              Executive Review Workflow
            </h4>
            <p className="text-amber-800 leading-relaxed">
              As an Executive, your new inventory submissions will be sent directly to the <span className="font-semibold underline">Admin Approved Dashboard</span> for review and verification before being activated as Available.
            </p>
          </div>
        </div>
      )}

      {/* Main Form Container (Card) */}
      <div className="bg-white border border-border/70 rounded-xl shadow-sm overflow-hidden">
        {/* Deal Type Selector Header */}
        <div className="p-6 border-b border-border/70 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Select Transaction Mode
              </span>
              <p className="text-sm text-slate-700 font-medium">
                Fields and requirements adapt dynamically based on transaction
                type and subcategory
              </p>
            </div>

            {/* 3 Prominent Deal Type Cards */}
            <div className="grid grid-cols-3 gap-2 bg-slate-200/80 p-1.5 rounded-xl border border-slate-300 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleDealTypeChange("BOOKING")}
                className={`flex flex-col items-center justify-center px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  formData.dealType === "BOOKING"
                    ? "bg-blue-100 text-black shadow-sm"
                    : "text-slate-700 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <span>Booking</span>
                <span className="text-[10px] font-normal opacity-90 hidden sm:inline">
                  Primary / Developer
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDealTypeChange("RETRADE")}
                className={`flex flex-col items-center justify-center px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  formData.dealType === "RETRADE"
                    ? "bg-amber-100 text-black shadow-sm"
                    : "text-slate-700 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <span>Retrade</span>
                <span className="text-[10px] font-normal opacity-90 hidden sm:inline">
                  Resale / Secondary
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDealTypeChange("LEASE")}
                className={`flex flex-col items-center justify-center px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  formData.dealType === "LEASE"
                    ? "bg-emerald-100 text-black shadow-sm"
                    : "text-slate-700 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <span>Lease</span>
                <span className="text-[10px] font-normal opacity-90 hidden sm:inline">
                  Rent / Commercial
                </span>
              </button>
            </div>
          </div>

          {/* Form Tabs Bar: 2 Tabs (Mandatory & Optional) */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/70 text-sm">
            {formTabs.map((tab, idx) => {
              const isActive = activeTab === tab.id;
              const isMandatory = tab.id === "mandatory";
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-between p-3 sm:px-5 sm:py-3.5 rounded-xl border text-left transition-all ${
                    isActive
                      ? "bg-white border-primary shadow-sm ring-1 ring-primary/20"
                      : "bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold ${
                            isActive ? "text-slate-900" : "text-slate-700"
                          }`}
                        >
                          {tab.label}
                        </span>
                        {isMandatory ? (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">
                            Required
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200">
                            Optional
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium hidden sm:block">
                        {isMandatory
                          ? "Identity, location, configuration, areas & pricing"
                          : "Specifications, amenities, furnishings, media & contacts"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isActive ? "text-primary translate-x-0.5" : "text-slate-400"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-7 space-y-7">
          {/* TAB 1: ALL MANDATORY DETAILS */}
          {activeTab === "mandatory" && (
            <div className="space-y-8">
              {/* Section 1: Property Location & Identity */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-3">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    {formData.dealType === "BOOKING"
                      ? "Project Location & Developer Information"
                      : "Property Location & Identity"}
                  </h4>
                  <span className="text-xs text-slate-500 font-medium">
                    Fields marked with <span className="text-danger">*</span> are mandatory
                  </span>
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Title / Project Name */}
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    {matrixRules.titleLabel}{" "}
                    <span className="text-danger">*</span>
                  </Label>
                  <Input
                    placeholder={matrixRules.titlePlaceholder}
                    value={formData.title}
                    className="h-11 text-base bg-white"
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                  {formErrors.title && (
                    <p className="text-sm text-danger font-medium">
                      {formErrors.title}
                    </p>
                  )}
                </div>

                {/* Developer Name - Mandatory for Booking, Optional for Retrade/Lease */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
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
                    className="w-full h-11 rounded-md border border-input bg-background px-3.5 text-base shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
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
                      className="mt-2 h-11 text-base bg-white"
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
                    <p className="text-sm text-danger font-medium">
                      {formErrors.developerName}
                    </p>
                  )}
                </div>

                {/* Project / Society Name (Conditional by Matrix) */}
                {matrixRules.showProjectSociety && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
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
                      placeholder="e.g. DLF Phase 5 / Sobha City / Central Park"
                      value={formData.projectSociety}
                      className="h-11 text-base bg-white"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          projectSociety: e.target.value,
                        })
                      }
                    />
                    {formErrors.projectSociety && (
                      <p className="text-sm text-danger font-medium">
                        {formErrors.projectSociety}
                      </p>
                    )}
                  </div>
                )}

                {/* Category Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
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
                          SUBCATEGORIES_BY_DEAL_TYPE[formData.dealType]?.[
                            cat
                          ] || [];
                        const firstSub = subs[0] || "";
                        setSelectedSubcategory(firstSub);
                        setFormData((prev) => ({
                          ...prev,
                          category: cat,
                          subcategory: firstSub,
                        }));
                      }
                    }}
                    className="w-full h-11 rounded-md border border-input bg-background px-3.5 text-base shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.category && (
                    <p className="text-sm text-danger font-medium">
                      {formErrors.category}
                    </p>
                  )}
                </div>

                {selectedCategory === "Other" && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Specify Other Category{" "}
                      <span className="text-danger">*</span>
                    </Label>
                    <Input
                      placeholder="e.g. Industrial, Agricultural, Hospitality"
                      value={otherCategory}
                      className="h-11 text-base bg-white"
                      onChange={(e) => {
                        const val = e.target.value;
                        setOtherCategory(val);
                        setFormData((prev) => ({ ...prev, category: val }));
                      }}
                    />
                    {formErrors.category && (
                      <p className="text-sm text-danger font-medium">
                        {formErrors.category}
                      </p>
                    )}
                  </div>
                )}

                {/* Subcategory Selection (Matrix Based) */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    Sub-category <span className="text-danger">*</span>
                  </Label>
                  {selectedCategory === "Other" ? (
                    <Input
                      placeholder="e.g. Warehouse, Industrial Plot, Land"
                      value={otherSubcategory}
                      className="h-11 text-base bg-white"
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
                          setFormData((prev) => ({
                            ...prev,
                            subcategory: sub,
                          }));
                        }
                      }}
                      className="w-full h-11 rounded-md border border-input bg-background px-3.5 text-base shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {availableSubcategories.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  )}
                  {formErrors.subcategory && (
                    <p className="text-sm text-danger font-medium">
                      {formErrors.subcategory}
                    </p>
                  )}
                </div>

                {selectedCategory !== "Other" &&
                  selectedSubcategory === "Other" && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Specify Other Subcategory{" "}
                        <span className="text-danger">*</span>
                      </Label>
                      <Input
                        placeholder="e.g. Studio, Kiosk, Penthouse Office"
                        value={otherSubcategory}
                        className="h-11 text-base bg-white"
                        onChange={(e) => {
                          const val = e.target.value;
                          setOtherSubcategory(val);
                          setFormData((prev) => ({
                            ...prev,
                            subcategory: val,
                          }));
                        }}
                      />
                      {formErrors.subcategory && (
                        <p className="text-sm text-danger font-medium">
                          {formErrors.subcategory}
                        </p>
                      )}
                    </div>
                  )}

                {/* City Selection: Gurgaon, Delhi, Kasauli, Goa, Other */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
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
                    className="w-full h-11 rounded-md border border-input bg-background px-3.5 text-base shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {STANDARD_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.city && (
                    <p className="text-sm text-danger font-medium">
                      {formErrors.city}
                    </p>
                  )}
                </div>

                {selectedCity === "Other" && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Specify Other City <span className="text-danger">*</span>
                    </Label>
                    <Input
                      placeholder="Enter city name (e.g. Noida, Mumbai, Pune, etc.)"
                      value={otherCity}
                      className="h-11 text-base bg-white"
                      onChange={(e) => {
                        const val = e.target.value;
                        setOtherCity(val);
                        setFormData((prev) => ({ ...prev, city: val }));
                      }}
                    />
                    {formErrors.city && (
                      <p className="text-sm text-danger font-medium">
                        {formErrors.city}
                      </p>
                    )}
                  </div>
                )}

                {/* Locality */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    Locality / Sector <span className="text-danger">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. Golf Course Road, Sector 54"
                    value={formData.locality}
                    className="h-11 text-base bg-white"
                    onChange={(e) =>
                      setFormData({ ...formData, locality: e.target.value })
                    }
                  />
                  {formErrors.locality && (
                    <p className="text-sm text-danger font-medium">
                      {formErrors.locality}
                    </p>
                  )}
                </div>

                {/* Facing Direction */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
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
                    className="w-full h-11 rounded-md border border-input bg-background px-3.5 text-base shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
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

                {/* Booking: Project Status & Possession Month/Year */}
                {matrixRules.isBooking && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
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
                        className="w-full h-11 rounded-md border border-input bg-background px-3.5 text-base shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="Pre Launch">Pre Launch</option>
                        <option value="Launched">Launched</option>
                        <option value="Under Construction">
                          Under Construction
                        </option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Possession Timeline{" "}
                        <span className="text-danger">*</span>
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
                          className="h-11 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
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
                          className="h-11 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
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
                )}

                {/* Retrade / Lease: Availability Status */}
                {!matrixRules.isBooking &&
                  matrixRules.showAvailabilityStatus && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Availability Status{" "}
                        <span className="text-danger">*</span>
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
                                val === "Immediate"
                                  ? ""
                                  : formData.availableFromDate,
                            });
                          }}
                          className="w-full h-11 rounded-md border border-input bg-background px-3.5 text-base shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
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
                          className="w-full h-11 rounded-md border border-input bg-background px-3.5 text-base shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          <option value="Ready to Move">Ready to Move</option>
                          <option value="Under Construction">
                            Under Construction
                          </option>
                        </select>
                      )}
                    </div>
                  )}

                {/* Under Construction date or Available From Date */}
                {formData.availabilityStatus === "Under Construction" && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Possession Date
                    </Label>
                    <Input
                      type="date"
                      value={
                        formData.possessionDate
                          ? formData.possessionDate.substring(0, 10)
                          : ""
                      }
                      className="h-11 text-base bg-white"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          possessionDate: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                {matrixRules.isLease &&
                  formData.availabilityStatus === "Date Selection" && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Available From Date
                      </Label>
                      <Input
                        type="date"
                        value={
                          formData.availableFromDate
                            ? formData.availableFromDate.substring(0, 10)
                            : ""
                        }
                        className="h-11 text-base bg-white"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            availableFromDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}

                {/* Inventory Status (Available, Under Review, Sold/Rented, etc.) */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    Listing Status
                  </Label>
                  {isExecutive && !isEdit ? (
                    <div className="flex items-center gap-2 h-11 px-3.5 bg-amber-50 border border-amber-200 rounded-md text-amber-900 text-sm font-semibold">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Under Review (Sent for Admin Approval)</span>
                    </div>
                  ) : isExecutive ? (
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full h-11 rounded-md border border-input bg-background px-3.5 text-base shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="SOLD">Sold</option>
                      <option value="RENT_OUT">Rented Out</option>
                      <option value="LOST">Lost</option>
                    </select>
                  ) : (
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full h-11 rounded-md border border-input bg-background px-3.5 text-base shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="SOLD">Sold</option>
                      <option value="RENT_OUT">Rented Out</option>
                      <option value="LOST">Lost</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Configurations, Furnishing & Area Measurements */}
            <div className="pt-8 border-t border-slate-200 space-y-6">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-primary" />
                  Configurations, Furnishing & Area Measurements
                </h4>
                <span className="text-xs text-slate-500 font-medium">
                  Configured according to {formData.subcategory} standards
                </span>
              </div>

              {/* BHK Options (Shown per Matrix) */}
              {matrixRules.showBhk && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-slate-700">
                      Configuration BHK{" "}
                      {matrixRules.isBhkMandatory ? (
                        <span className="text-danger">*</span>
                      ) : (
                        <span className="text-slate-400 font-normal">
                          (Optional)
                        </span>
                      )}
                    </Label>
                    {formErrors.bhk && (
                      <p className="text-xs text-danger font-medium">
                        {formErrors.bhk}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2.5">
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
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                            selected
                              ? "bg-primary text-primary-foreground border-primary shadow-xs"
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

              {/* Also Selection: Penthouse / Duplex / Triplex */}
              {matrixRules.showAlsoSelection && (
                <div className="space-y-2.5 pt-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    Also Selection (Optional)
                  </Label>
                  <div className="flex flex-wrap gap-2.5">
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
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                            selected
                              ? "bg-slate-800 text-white border-slate-800 shadow-xs"
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

              {/* Guest House: Number of Rooms */}
              {matrixRules.showRooms && (
                <div className="space-y-2 pt-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    No. of Rooms <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g. 12 Rooms"
                    value={formData.numberOfUnits || ""}
                    className="h-11 max-w-xs text-base bg-white"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numberOfUnits: e.target.value,
                      })
                    }
                  />
                </div>
              )}

              {/* Furnishing Status (Hidden for plots) */}
              {matrixRules.showFurnishing && (
                <div className="space-y-2 pt-2">
                  <Label className="text-sm font-semibold text-slate-700">
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
                    className="w-full sm:w-80 h-11 rounded-md border border-input bg-background px-3.5 text-base shadow-sm"
                  >
                    {FURNISHING_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Multi-Area Measurements */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-bold text-slate-900">
                      Area Measurements <span className="text-danger">*</span>
                    </Label>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Allowed for {formData.subcategory}:{" "}
                      {matrixRules.allowedAreaTypes.join(", ")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddArea}
                    className="text-sm h-9 border-slate-300 font-medium"
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Add Measurement
                  </Button>
                </div>

                {formErrors.areas && (
                  <p className="text-sm text-danger font-medium">
                    {formErrors.areas}
                  </p>
                )}

                <div className="space-y-3">
                  {formData.areas.map((area, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 items-center"
                    >
                      <div className="sm:col-span-5">
                        <select
                          value={area.areaType}
                          onChange={(e) =>
                            handleAreaChange(idx, "areaType", e.target.value)
                          }
                          className="w-full h-10 rounded-md border border-input bg-white px-3 text-sm font-medium shadow-xs"
                        >
                          {matrixRules.allowedAreaTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-4">
                        <Input
                          type="number"
                          placeholder="Area value"
                          value={area.value}
                          onChange={(e) =>
                            handleAreaChange(idx, "value", e.target.value)
                          }
                          className="h-10 text-base bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <select
                          value={area.unit}
                          onChange={(e) =>
                            handleAreaChange(idx, "unit", e.target.value)
                          }
                          className="w-full h-10 rounded-md border border-input bg-white px-2.5 text-sm font-medium shadow-xs"
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

                      <div className="sm:col-span-1 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={formData.areas.length <= 1}
                          onClick={() => handleRemoveArea(idx)}
                          className="h-9 w-9 text-danger hover:bg-danger/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Booking: Min Area & Max Area Range */}
              {matrixRules.isBooking && (
                <div className="pt-4 border-t border-slate-100">
                  <Label className="text-sm font-bold text-slate-800">
                    Project Area Range (Optional)
                  </Label>
                  <p className="text-xs text-slate-500 mb-3">
                    If this project offers units ranging from min to max size
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium text-slate-600">
                        Min Area (sq.ft)
                      </Label>
                      <Input
                        type="number"
                        placeholder="e.g. 1850"
                        value={formData.areas[0]?.minArea || ""}
                        className="h-10 bg-white"
                        onChange={(e) =>
                          handleAreaChange(0, "minArea", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-slate-600">
                        Max Area (sq.ft)
                      </Label>
                      <Input
                        type="number"
                        placeholder="e.g. 4200"
                        value={formData.areas[0]?.maxArea || ""}
                        className="h-10 bg-white"
                        onChange={(e) =>
                          handleAreaChange(0, "maxArea", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Pricing & Commercial Terms */}
            <div className="pt-8 border-t border-slate-200 space-y-6">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-primary" />
                  {formData.dealType === "LEASE"
                    ? "Rental Lease Terms & Deposit Details"
                    : formData.dealType === "BOOKING"
                      ? "Booking Pricing"
                      : "Price & Resale Terms"}
                </h4>
                <span className="text-xs text-slate-500 font-medium">
                  Commercial & transaction terms
                </span>
              </div>

              {/* LEASE PRICING */}
              {formData.dealType === "LEASE" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Monthly Rent <span className="text-danger">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="e.g. 125000"
                        value={formData.monthlyRent}
                        className="h-11 text-base bg-white"
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
                        className="w-32 h-11 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                      >
                        <option value="Thousands">Thousands</option>
                        <option value="Lakhs">Lakhs</option>
                        <option value="Crores">Crores</option>
                      </select>
                    </div>
                    {formErrors.monthlyRent && (
                      <p className="text-sm text-danger font-medium">
                        {formErrors.monthlyRent}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Price / sq. unit Area (₹)
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g. 85 / sq.ft"
                      value={formData.pricePerUnitArea}
                      className="h-11 text-base bg-white"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricePerUnitArea: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Security Deposit <span className="text-danger">*</span>
                    </Label>
                    <Input
                      placeholder="e.g. 2 Months / 3 Months / ₹3,00,000"
                      value={formData.securityDeposit}
                      className="h-11 text-base bg-white"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          securityDeposit: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Maintenance Charges (₹) & Frequency{" "}
                      <span className="text-danger">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="e.g. 8500"
                        value={formData.maintenanceCharges}
                        className="h-11 text-base bg-white"
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
                        className="w-36 h-11 rounded-md border border-input bg-background px-2.5 text-sm shadow-sm"
                      >
                        <option value="Per Month">Per Month</option>
                        <option value="Per Quarter">Per Quarter</option>
                        <option value="Per Year">Per Year</option>
                      </select>
                    </div>
                  </div>

                  {/* Available For Multi-Select */}
                  <div className="md:col-span-2 space-y-2.5 pt-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Available For (Multi-Select)
                    </Label>
                    <div className="flex flex-wrap gap-2.5">
                      {[
                        "All",
                        "Company Lease",
                        "Family",
                        "MNC",
                        "Expats",
                        "Bachelors",
                      ].map((type) => {
                        const selected =
                          formData.availableFor &&
                          formData.availableFor.includes(type);
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() =>
                              toggleArrayItem("availableFor", type)
                            }
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                              selected
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Lease Duration (Months)
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g. 11, 24, 36"
                      value={formData.leaseDuration}
                      className="h-11 text-base bg-white"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          leaseDuration: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Lock-in Period (Months)
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g. 6, 12"
                      value={formData.lockInPeriod}
                      className="h-11 text-base bg-white"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lockInPeriod: e.target.value,
                        })
                      }
                    />
                    {formErrors.lockInPeriod && (
                      <p className="text-sm text-danger font-medium">
                        {formErrors.lockInPeriod}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* BOOKING PRICING */}
              {formData.dealType === "BOOKING" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Price <span className="text-danger">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="e.g. 3.5"
                        value={formData.price}
                        className="h-11 text-base bg-white"
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
                        className="w-32 h-11 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                      >
                        <option value="Crores">Crores</option>
                        <option value="Lakhs">Lakhs</option>
                        <option value="Thousands">Thousands</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Price / sq. unit Area (₹)
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g. 18500"
                      value={formData.pricePerUnitArea}
                      className="h-11 text-base bg-white"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricePerUnitArea: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Or Min - Max Price Range
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Min Price"
                        value={formData.minPrice}
                        className="h-11 bg-white"
                        onChange={(e) =>
                          setFormData({ ...formData, minPrice: e.target.value })
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Max Price"
                        value={formData.maxPrice}
                        className="h-11 bg-white"
                        onChange={(e) =>
                          setFormData({ ...formData, maxPrice: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* RETRADE PRICING */}
              {formData.dealType === "RETRADE" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Total Resale Price <span className="text-danger">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="e.g. 4.25"
                        value={formData.price}
                        className="h-11 text-base bg-white"
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
                        className="w-32 h-11 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                      >
                        <option value="Crores">Crores</option>
                        <option value="Lakhs">Lakhs</option>
                        <option value="Thousands">Thousands</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Price / sq. unit Area (₹)
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g. 19500"
                      value={formData.pricePerUnitArea}
                      className="h-11 text-base bg-white"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricePerUnitArea: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ALL OPTIONAL DETAILS */}
        {activeTab === "optional" && (
          <div className="space-y-8">
            {/* Section 1: Building & Property Specifications */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-primary" />
                  Specifications & Architectural Features
                </h4>
                <span className="text-xs text-slate-500 font-medium">
                  Optional property parameters
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                {/* Floor Number & Total Floors (Apartment / Floor / Commercial) */}
                {matrixRules.showFloorNumber && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Floor Number
                      </Label>
                      <Input
                        placeholder="e.g. 14 / Ground"
                        value={formData.floorNumber}
                        className="h-11 text-base bg-white"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            floorNumber: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Total Floors
                      </Label>
                      <Input
                        type="number"
                        placeholder="e.g. 32"
                        value={formData.totalFloors}
                        className="h-11 text-base bg-white"
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

                {/* No. of Floors / Storeys (Independent building or Booking) */}
                {matrixRules.showNumberOfFloors && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      {matrixRules.isBooking
                        ? "Number of Storeys"
                        : "Number of Floors"}
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g. 4"
                      value={formData.numberOfStoreys}
                      className="h-11 text-base bg-white"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          numberOfStoreys: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                {/* Units Available / Total Units in Project */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    {matrixRules.isBooking ? "No. of Units" : "Units Available"}
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g. 1"
                    value={formData.numberOfUnits}
                    className="h-11 text-base bg-white"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numberOfUnits: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Age of Property (Retrade & Lease) */}
                {matrixRules.showAge && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Property Age
                    </Label>
                    <select
                      value={formData.propertyAge}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          propertyAge: e.target.value,
                        })
                      }
                      className="w-full h-11 rounded-md border border-input bg-background px-3.5 text-base shadow-sm"
                    >
                      <option value="Under 1 year">Under 1 year</option>
                      <option value="1 to 3 years">1 to 3 years</option>
                      <option value="3 to 5 years">3 to 5 years</option>
                      <option value="5 to 10 years">5 to 10 years</option>
                      <option value="10+ years">10+ years</option>
                    </select>
                  </div>
                )}

                {/* Parking Type & Count */}
                {matrixRules.showParking && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Parking Type
                      </Label>
                      <select
                        value={formData.parkingType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            parkingType: e.target.value,
                          })
                        }
                        className="w-full h-11 rounded-md border border-input bg-background px-3.5 text-base shadow-sm"
                      >
                        <option value="Covered">Covered</option>
                        <option value="Open">Open</option>
                        <option value="None">None</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Number of Parkings
                      </Label>
                      <Input
                        type="number"
                        value={formData.numberOfParkings}
                        className="h-11 text-base bg-white"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            numberOfParkings: e.target.value,
                          })
                        }
                      />
                    </div>
                  </>
                )}

                {/* Ceiling Height (Commercial) */}
                {matrixRules.showCeilingHeight && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Ceiling Height (ft)
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g. 14"
                      value={formData.ceilingHeight}
                      className="h-11 text-base bg-white"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ceilingHeight: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                {/* Washrooms (Commercial / Built) */}
                {matrixRules.showWashrooms && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Washroom Type
                      </Label>
                      <select
                        value={formData.washroomType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            washroomType: e.target.value,
                          })
                        }
                        className="w-full h-11 rounded-md border border-input bg-background px-3.5 text-base shadow-sm"
                      >
                        <option value="Private">Private</option>
                        <option value="Public">Public / Common</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Number of Washrooms
                      </Label>
                      <Input
                        type="number"
                        value={formData.numberOfWashrooms}
                        className="h-11 text-base bg-white"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            numberOfWashrooms: e.target.value,
                          })
                        }
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Furnishings Chips (Residential vs Serviced Apt vs Commercial) */}
              {matrixRules.furnishingType && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <Label className="text-sm font-bold text-slate-800">
                    Included Furnishings & Appliances
                  </Label>
                  <div className="flex flex-wrap gap-2.5">
                    {(matrixRules.furnishingType === "RESIDENTIAL"
                      ? FURNISHING_ITEMS_RESIDENTIAL
                      : matrixRules.furnishingType === "SERVICED_APT"
                        ? FURNISHING_ITEMS_SERVICED_APT
                        : FURNISHING_ITEMS_COMMERCIAL
                    ).map((item) => {
                      const selected =
                        formData.servantPujaStore &&
                        formData.servantPujaStore.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() =>
                            toggleArrayItem("servantPujaStore", item)
                          }
                          className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors ${
                            selected
                              ? "bg-slate-800 text-white border-slate-800 shadow-xs"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Servant / Puja / Store chips (Residential Built) */}
              {matrixRules.showServantPujaStore && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <Label className="text-sm font-bold text-slate-800">
                    Utility & Additional Rooms
                  </Label>
                  <div className="flex flex-wrap gap-2.5">
                    {["Servant Room", "Puja Room", "Store Room"].map((room) => {
                      const selected =
                        formData.servantPujaStore &&
                        formData.servantPujaStore.includes(room);
                      return (
                        <button
                          key={room}
                          type="button"
                          onClick={() =>
                            toggleArrayItem("servantPujaStore", room)
                          }
                          className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors ${
                            selected
                              ? "bg-primary text-primary-foreground border-primary shadow-xs"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {room}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Plot Attributes (Shown ONLY for Residential plot & Commercial Plot) */}
              {matrixRules.showPlotAttributes && (
                <div className="pt-4 border-t border-slate-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-600" />
                    <h5 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Plot Specifications & Approvals
                    </h5>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Plot Shape
                      </Label>
                      <select
                        value={formData.plotShape}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            plotShape: e.target.value,
                          })
                        }
                        className="w-full h-11 rounded-md border border-input bg-background px-3.5 text-base shadow-sm"
                      >
                        <option value="Regular">Regular</option>
                        <option value="Irregular">Irregular</option>
                        <option value="Corner">Corner</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Plot Length (m)
                      </Label>
                      <Input
                        type="number"
                        placeholder="e.g. 30"
                        value={formData.plotLength}
                        className="h-11 text-base bg-white"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            plotLength: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Plot Breadth (m)
                      </Label>
                      <Input
                        type="number"
                        placeholder="e.g. 15"
                        value={formData.plotBreadth}
                        className="h-11 text-base bg-white"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            plotBreadth: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Boundary Wall
                      </Label>
                      <select
                        value={formData.boundaryWall ? "Yes" : "No"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            boundaryWall: e.target.value === "Yes",
                          })
                        }
                        className="w-full h-11 rounded-md border border-input bg-background px-3.5 text-base shadow-sm"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Construction Allowed
                      </Label>
                      <select
                        value={formData.constructionAllowed ? "Yes" : "No"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            constructionAllowed: e.target.value === "Yes",
                          })
                        }
                        className="w-full h-11 rounded-md border border-input bg-background px-3.5 text-base shadow-sm"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Commercial Terms & Payment Plan (Optional) */}
              {(matrixRules.showPreLeased || formData.dealType === "BOOKING") && (
                <div className="pt-6 border-t border-slate-200 space-y-4">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-primary" />
                    Commercial Terms & Payment Plan
                  </h4>

                  {/* Booking Payment Plan */}
                  {formData.dealType === "BOOKING" && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Payment Plan
                      </Label>
                      <Input
                        placeholder="e.g. Construction Linked (CLP) / 30:70 / Possession Linked"
                        value={formData.paymentPlan}
                        className="h-11 text-base bg-white"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentPlan: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}

                  {/* Pre-Leased & ROI % for Retrade & Lease */}
                  {matrixRules.showPreLeased && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="preLeased"
                          checked={formData.preLeased}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              preLeased: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded text-primary focus:ring-primary"
                        />
                        <Label
                          htmlFor="preLeased"
                          className="text-sm font-bold text-slate-800 cursor-pointer"
                        >
                          Pre-Leased Property
                        </Label>
                      </div>

                      {formData.preLeased && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-slate-700">
                              ROI Percentage (%)
                            </Label>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="e.g. 7.5"
                              value={formData.roiPercentage}
                              className="h-10 text-base bg-white"
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  roiPercentage: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-slate-700">
                              Pre-Leased Details / Tenant
                            </Label>
                            <Input
                              placeholder="e.g. Leased to Bank / Starbucks for 9 years"
                              value={formData.preLeasedDetails}
                              className="h-10 text-base bg-white"
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  preLeasedDetails: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Unique Selling Propositions (USPs) & Amenities */}
            <div className="pt-8 border-t border-slate-200 space-y-8 w-full min-w-0">
              {/* ============================= */}
              {/* SECTION 1: USPs */}
              {/* ============================= */}

              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div className="min-w-0">
                    <h4 className="text-base sm:text-lg font-bold text-slate-900">
                      Unique Selling Propositions (USPs)
                    </h4>

                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Connectivity, Surrounding, and Key Highlights
                    </p>
                  </div>

                  <span className="shrink-0 text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {formData.usps.length} Selected
                  </span>
                </div>

                {/* USP Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Object.entries(USP_GROUPS).map(([groupTitle, list]) => (
                    <div
                      key={groupTitle}
                      className="min-w-0 min-h-[180px] rounded-2xl border border-slate-200 bg-white p-5"
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
                        <h5 className="text-sm sm:text-base font-bold text-slate-900 break-words">
                          {groupTitle}
                        </h5>

                        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {
                            list.filter((item) => formData.usps.includes(item))
                              .length
                          }
                        </span>
                      </div>

                      {/* Text-Only Pill Buttons */}
                      <div className="flex flex-wrap items-start gap-2 pt-4">
                        {list.map((usp) => {
                          const selected = formData.usps.includes(usp);

                          return (
                            <button
                              key={usp}
                              type="button"
                              onClick={() => toggleArrayItem("usps", usp)}
                              aria-pressed={selected}
                              className={`
                    inline-flex items-center justify-center
                    max-w-full min-w-0
                    rounded-full border border-dashed
                    px-3 py-2
                    text-xs sm:text-sm font-medium
                    leading-snug text-center
                    whitespace-normal break-words
                    transition-colors duration-200
                    ${
                      selected
                        ? "bg-amber-500 border-amber-600 text-white"
                        : "bg-slate-50 border-slate-300 text-slate-700 hover:bg-amber-50 hover:border-amber-300"
                    }
                  `}
                            >
                              {usp}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ============================= */}
              {/* SECTION 2: AMENITIES */}
              {/* ============================= */}

              <div className="space-y-4 pt-6 border-t border-slate-200">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div className="min-w-0">
                    <h4 className="text-base sm:text-lg font-bold text-slate-900">
                      Amenities & Facilities
                    </h4>

                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Security, Lifestyle, and Building Infrastructure
                    </p>
                  </div>

                  <span className="shrink-0 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {formData.amenities.length} Selected
                  </span>
                </div>

                {/* Amenities Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Object.entries(AMENITIES_GROUPS).map(
                    ([groupTitle, list]) => (
                      <div
                        key={groupTitle}
                        className="min-w-0 min-h-[180px] rounded-2xl border border-slate-200 bg-white p-5"
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
                          <h5 className="text-sm sm:text-base font-bold text-slate-900 break-words">
                            {groupTitle}
                          </h5>

                          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {
                              list.filter((item) =>
                                formData.amenities.includes(item),
                              ).length
                            }
                          </span>
                        </div>

                        {/* Text-Only Pill Buttons */}
                        <div className="flex flex-wrap items-start gap-2 pt-4">
                          {list.map((amenity) => {
                            const selected =
                              formData.amenities.includes(amenity);

                            return (
                              <button
                                key={amenity}
                                type="button"
                                onClick={() =>
                                  toggleArrayItem("amenities", amenity)
                                }
                                aria-pressed={selected}
                                className={`
                    inline-flex items-center justify-center
                    max-w-full min-w-0
                    rounded-full border border-dashed
                    px-3 py-2
                    text-xs sm:text-sm font-medium
                    leading-snug text-center
                    whitespace-normal break-words
                    transition-colors duration-200
                    ${
                      selected
                        ? "bg-emerald-600 border-emerald-700 text-white"
                        : "bg-slate-50 border-slate-300 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300"
                    }
                  `}
                              >
                                {amenity}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information & Property Media */}
            <div className="pt-8 border-t border-slate-200 space-y-7">
              {/* Contact Information */}
              <div className="space-y-5">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  {formData.dealType === "BOOKING"
                    ? "Developer Sales Team Contact Information"
                    : "Seller / Landlord Contact Information"}
                </h4>

                {formData.dealType === "BOOKING" ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Sales Representative Name
                      </Label>
                      <Input
                        placeholder="e.g. Amitabh Verma"
                        value={formData.developerContactName}
                        className="h-11 text-base bg-white"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            developerContactName: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Contact Phone
                      </Label>
                      <Input
                        placeholder="e.g. +91 98112 00450"
                        value={formData.developerContactNumber}
                        className="h-11 text-base bg-white"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            developerContactNumber: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Designation
                      </Label>
                      <Input
                        placeholder="e.g. VP Luxury Sales"
                        value={formData.developerContactDesignation}
                        className="h-11 text-base bg-white"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        {formData.dealType === "LEASE"
                          ? "Landlord / Owner Name"
                          : "Seller Name"}
                      </Label>
                      <Input
                        placeholder="e.g. Rajesh Singhania"
                        value={formData.sellerName}
                        className="h-11 text-base bg-white"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sellerName: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        {formData.dealType === "LEASE"
                          ? "Landlord Phone"
                          : "Seller Phone"}
                      </Label>
                      <Input
                        placeholder="e.g. +91 98112 34567"
                        value={formData.sellerPhone}
                        className="h-11 text-base bg-white"
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
              </div>

              {/* Description */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <Label className="text-sm font-semibold text-slate-700">
                  Property Description & High-Priority Notes
                </Label>
                <textarea
                  rows={4}
                  placeholder="Enter detailed description of views, specifications, landmarks, and highlights..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-md border border-input bg-background p-3.5 text-base shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Media Upload Area */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      Gallery Photos, Floor Plans & Brochures
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Upload high-res property images, floor layout PDFs, and
                      project brochures
                    </p>
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-xs">
                      <Upload className="w-4 h-4 text-primary" />
                      {isUploading ? "Uploading..." : "Upload Files"}
                    </span>
                  </label>
                </div>

                {formData.media && formData.media.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3.5">
                    {formData.media.map((item, idx) => (
                      <div
                        key={idx}
                        className="group relative rounded-lg border border-slate-200 overflow-hidden bg-slate-50 h-28 flex items-center justify-center"
                      >
                        {item.type === "IMAGE" ||
                        item.mimeType?.startsWith("image/") ? (
                          <img
                            src={item.url}
                            alt={item.name || "Upload"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-1 p-2 text-center">
                            <FileText className="w-8 h-8 text-blue-500" />
                            <span className="text-[10px] text-slate-600 line-clamp-1">
                              {item.name || "Document"}
                            </span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(idx)}
                          className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger"
                          title="Remove media"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-9 rounded-lg border border-dashed border-slate-300 bg-slate-50/70 text-center">
                    <ImageIcon className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-700 font-semibold">
                      No photos or brochures uploaded yet
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Upload high-res images, PDFs, floor plans, and brochures
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

          {/* Form Actions Footer */}
          <div className="pt-6 border-t border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBackOrCancel}
              disabled={isPending}
              className="text-sm font-medium h-10 px-5 w-full sm:w-auto"
            >
              Cancel
            </Button>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
              {!isFirstTab && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevTab}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium h-10 px-4"
                >
                  <ChevronLeft className="w-4 h-4 mr-1.5" />
                  Previous: Mandatory Details
                </Button>
              )}

              {!isLastTab && (
                <Button
                  type="button"
                  onClick={handleNextTab}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm h-10 px-5 shadow-xs"
                >
                  <span>Next: {formTabs[currentTabIndex + 1]?.label}</span>
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </Button>
              )}

              <Button
                type="submit"
                disabled={isPending}
                className="bg-primary hover:bg-brand-dark text-primary-foreground font-semibold text-sm h-10 px-6 shadow-sm flex items-center gap-2"
              >
                {isPending ? (
                  "Saving..."
                ) : isExecutive && !isEdit ? (
                  <>
                    <Send className="w-4 h-4" />
                    Send for Review to Admin
                  </>
                ) : isEdit ? (
                  <>
                    <Save className="w-4 h-4" />
                    Update Property
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Property
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryFormPage;
