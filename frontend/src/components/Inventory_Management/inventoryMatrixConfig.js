// Matrix configuration derived directly from "Rohit Resources.xlsx"
// Sheets: "Property form Booking", "Property form Retrade", "Property form Lease"

export const STANDARD_CITIES = ["Gurgaon", "Delhi", "Kasauli", "Goa"];

export const SUBCATEGORIES_BY_DEAL_TYPE = {
  BOOKING: {
    Residential: [
      "Residential plot",
      "Villa",
      "Farm House",
      "Independent Floor",
      "Apartment",
      "Serviced Apartment",
      "Other",
    ],
    Commercial: [
      "Mixed Use (Retail+Office)",
      "SCO",
      "Commercial Plot",
      "Other",
    ],
    Other: ["Other"],
  },
  RETRADE: {
    Residential: [
      "Residential plot",
      "Villa",
      "Farm House",
      "Independent Floor",
      "Apartment",
      "Serviced Apartment",
      "Guest House",
      "Other",
    ],
    Commercial: [
      "Retail Shop",
      "Office Space",
      "SCO",
      "Commercial Plot",
      "Factory",
      "Warehouse",
      "Other",
    ],
    Other: ["Other"],
  },
  LEASE: {
    Residential: [
      "Residential plot",
      "Villa",
      "Farm House",
      "Independent Floor",
      "Apartment",
      "Serviced Apartment",
      "Guest House",
      "Other",
    ],
    Commercial: [
      "Retail Shop",
      "Office Space",
      "SCO",
      "Commercial Plot",
      "Factory",
      "Warehouse",
      "Other",
    ],
    Other: ["Other"],
  },
};

export const USP_GROUPS = {
  Connectivity: [
    "Metro Station Nearby",
    "Airport Nearby",
    "Railway Station Nearby",
    "Highway Access",
    "On Main Road",
    "On Service Road",
  ],
  Surrounding: [
    "School Nearby",
    "Hospital Nearby",
    "Market Nearby",
    "Mall Nearby",
    "Park Nearby",
    "High Street Location",
    "High Footfall Area",
  ],
  Others: [
    "Recently Renovated",
    "Luxury Interiors",
    "Visitor Parking",
    "Park-Facing",
    "Low-Density",
    "Corner Property",
    "Vastu Compliant",
    "Low CAM",
    "Gated Society",
    "Private Terrace",
    "Grade-A Building",
    "IGBC/LEED Certified",
    "Assured Rental Returns",
    "Ready-to-Operate",
    "Located in SEZ",
  ],
};

export const AMENITIES_GROUPS = {
  Security: [
    "CCTV",
    "Security Personnel",
    "Fire Safety",
    "Video Door Phone",
  ],
  "Life Style": [
    "Swimming Pool",
    "Clubhouse",
    "Gymnasium",
    "Sports Facilities",
    "Jogging Track",
    "Kids Play Area",
    "Multipurpose Hall",
    "Pet Park",
    "Restaurants",
    "Cafeteria",
    "Conceirage",
    "Creche/Daycare",
  ],
  Others: [
    "Piped Gas Connection",
    "unit",
    "High Speed Elevator",
    "Power Backup (DG Set)",
    "Loading/Unloading Bay",
    "Rainwater Harvesting",
    "Service Lift",
    "Wheel chair Accessibility",
    "ATM/Bank",
    "Covenience Store",
  ],
};

// Furnishing Items / Counters per category type
export const FURNISHING_OPTIONS = [
  "Semi-Furnished",
  "Bare Shell",
  "Fully Furnished",
  "Unfurnished",
];

export const FURNISHING_ITEMS_RESIDENTIAL = [
  "Fridge",
  "Cooktop",
  "RO",
  "Dining Table",
  "Beds",
  "Sofa",
  "Geysers",
  "AC",
];

export const FURNISHING_ITEMS_SERVICED_APT = [
  "Reception",
  "Waiting Area",
  "Restaurant",
  "Bed",
  "AC",
  "Hot water",
  "Sofa",
  "Kitchenette",
  "Desk",
];

export const FURNISHING_ITEMS_COMMERCIAL = [
  "Reception",
  "Pantry",
  "Workstations",
  "Meeting Rooms",
  "Conference Room",
  "Cabins",
];

/**
 * Returns field visibility and requirement rules for a specific dealType, category and subcategory
 */
export function getFieldVisibility(dealType = "BOOKING", category = "Residential", subcategory = "Apartment") {
  const normDeal = (dealType || "BOOKING").toUpperCase();
  const normCat = category || "Residential";
  const normSub = (subcategory || "").trim().toLowerCase();

  const isPlot = normSub.includes("plot");
  const isResidential = normCat === "Residential";
  const isCommercial = normCat === "Commercial";
  const isGuestHouse = normSub.includes("guest house");
  const isApartment = normSub === "apartment";
  const isServicedApt = normSub.includes("serviced");
  const isFactoryOrWarehouse = normSub.includes("factory") || normSub.includes("warehouse");
  const isVillaOrFarmHouse = normSub.includes("villa") || normSub.includes("farm house") || normSub.includes("farmhouse");
  const isIndependentFloor = normSub.includes("floor") || normSub.includes("independent floor");

  // Booking vs Retrade/Lease rules
  const isBooking = normDeal === "BOOKING";
  const isRetrade = normDeal === "RETRADE";
  const isLease = normDeal === "LEASE";

  // Title / Project Name
  const titleLabel = isBooking ? "Project Name" : "Property / Project Name";
  const titlePlaceholder = isBooking
    ? "e.g. Godrej Aristocrat / DLF The Camellias"
    : "e.g. 3 BHK Luxury Apartment in DLF Phase 5";

  // Developer Name: Mandatory in Booking, Optional/Selectable in Retrade/Lease
  const isDeveloperRequired = isBooking;

  // Project / Society:
  // - Booking: hidden (Project Name IS the project)
  // - Retrade/Lease: Mandatory for Apartment, Optional for others, ❌ Hidden for Factory & Warehouse
  const showProjectSociety = !isBooking && !isFactoryOrWarehouse;
  const isProjectSocietyMandatory = !isBooking && isApartment;

  // BHK:
  // - Booking: Mandatory for Residential (except plot). ❌ Hidden for Plots & Commercial.
  // - Retrade/Lease: Mandatory for Villa, Farm House, Independent Floor, Apartment.
  //   Optional for Serviced Apartment. ❌ Hidden for Plots, Commercial, Guest House.
  let showBhk = false;
  let isBhkMandatory = false;
  if (isBooking) {
    if (isResidential && !isPlot) {
      showBhk = true;
      isBhkMandatory = true;
    }
  } else {
    if (isVillaOrFarmHouse || isIndependentFloor || isApartment) {
      showBhk = true;
      isBhkMandatory = true;
    } else if (isServicedApt) {
      showBhk = true;
      isBhkMandatory = false;
    }
  }

  // Also Selection (Penthouse/Duplex/Triplex):
  // Shown for Villa, Farm House, Independent Floor, Apartment
  const showAlsoSelection = isVillaOrFarmHouse || isIndependentFloor || isApartment;

  // No. of Rooms:
  // Shown ONLY for Guest House in Retrade/Lease
  const showRooms = !isBooking && isGuestHouse;

  // Furnishing:
  // Hidden for Plots. Shown for built residential & commercial.
  const showFurnishing = !isPlot;

  // Furnishing Chips:
  let furnishingType = null;
  if (!isPlot) {
    if (isServicedApt) {
      furnishingType = "SERVICED_APT";
    } else if (isCommercial && (normSub.includes("shop") || normSub.includes("office") || normSub.includes("sco"))) {
      furnishingType = "COMMERCIAL";
    } else if (isResidential && !isGuestHouse) {
      furnishingType = "RESIDENTIAL";
    }
  }

  // Area types allowed:
  // - Plot only: Plot Area
  // - Villa / Farmhouse: Super Area, Carpet Area, Built Up Area, Plot Area (Plot Area mandatory)
  // - Independent Floor: Super Area, Carpet Area, Built Up Area, Plot Area
  // - Apartment / Serviced Apt: Super Area, Carpet Area, Built Up Area
  // - Commercial Built (Shop, Office, SCO, Factory, Warehouse): Super Area, Carpet Area, Built Up Area, Plot Area
  let allowedAreaTypes = ["Super Area", "Carpet Area", "Built Up Area", "Plot Area"];
  if (isPlot) {
    allowedAreaTypes = ["Plot Area"];
  } else if (isApartment || isServicedApt) {
    allowedAreaTypes = ["Super Area", "Carpet Area", "Built Up Area"];
  }

  // Availability / Project Status:
  // - Booking: Status (Pre Launch / Launched / Under Construction), Possession Month & Year
  // - Retrade: Availability Status (Ready to Move / Under Construction -> possession date). ❌ for Commercial Plot.
  // - Lease: Availability Status (Immediate OR Date Selection -> available from date). ❌ for Commercial Plot.
  const showAvailabilityStatus = !isPlot || normSub.includes("residential plot");

  // Plot Attributes:
  // Boundary Wall, Plot Shape, Construction Allowed, Size Length X Breadth, Connections (Water, Sewage)
  // Shown ONLY for Residential plot & Commercial Plot
  const showPlotAttributes = isPlot;

  // Floors:
  // - Independent buildings (Villa, Farm House, Guest House, Factory, Warehouse): No. of Floors
  // - Booking: No. of Storeys
  // - Apartments, Floors, Commercial Built (Office, Shop, SCO): ___ of ___ floors (Floor Number & Total Floors)
  // - Plots: Hidden
  const showFloorNumber = !isPlot && (isApartment || isIndependentFloor || normSub.includes("shop") || normSub.includes("office") || normSub.includes("sco") || isFactoryOrWarehouse);
  const showNumberOfFloors = !isPlot && (isVillaOrFarmHouse || isGuestHouse || isFactoryOrWarehouse || isBooking);

  // Age of Property:
  // Shown for built properties in Retrade & Lease. Hidden for Plots and Booking.
  const showAge = !isBooking && !isPlot;

  // Servant / Puja / Store chips:
  // Shown for Villa, Farm House, Independent Floor, Apartment
  const showServantPujaStore = isVillaOrFarmHouse || isIndependentFloor || isApartment;

  // Parking:
  // Shown for built properties. Hidden for Plots.
  const showParking = !isPlot;

  // Ceiling Height:
  // Shown for Commercial built (Shop, Office, SCO, Factory, Warehouse) and Booking commercial
  const showCeilingHeight = isCommercial && !isPlot;

  // Washrooms:
  // Shown for built properties. Factory/Warehouse has Yes/No & count. Office/Shop/SCO has Public/Private.
  const showWashrooms = !isPlot;

  // Pre-Leased & ROI %:
  // Shown in Retrade & Lease
  const showPreLeased = !isBooking;

  // Developer Sales Contact (Booking) vs Seller / Landlord Info (Retrade/Lease)
  const showDeveloperSalesContact = isBooking;
  const showSellerInfo = !isBooking;

  return {
    isBooking,
    isRetrade,
    isLease,
    titleLabel,
    titlePlaceholder,
    isDeveloperRequired,
    showProjectSociety,
    isProjectSocietyMandatory,
    showBhk,
    isBhkMandatory,
    showAlsoSelection,
    showRooms,
    showFurnishing,
    furnishingType,
    allowedAreaTypes,
    showAvailabilityStatus,
    showPlotAttributes,
    showFloorNumber,
    showNumberOfFloors,
    showAge,
    showServantPujaStore,
    showParking,
    showCeilingHeight,
    showWashrooms,
    showPreLeased,
    showDeveloperSalesContact,
    showSellerInfo,
    isPlot,
    isCommercial,
    isResidential,
  };
}

