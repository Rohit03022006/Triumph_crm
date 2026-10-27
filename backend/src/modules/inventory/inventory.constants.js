export const DEVELOPERS_LIST = [
  "4S Developers",
  "Adani Realty",
  "AIPL",
  "Alpha Corp",
  "Ambience Developers",
  "Anant Raj",
  "Ansals",
  "Ashiana Housing",
  "ATS",
  "Baani",
  "Birla Estates",
  "BPTP",
  "BST Developers",
  "CBS Developers",
  "Central Park",
  "Conscient Infrastructure",
  "Dalcore",
  "DLF",
  "Elan",
  "Eldeco",
  "Emaar",
  "Eros Group",
  "Experion Developers",
  "Godrej Properties",
  "Hero Realty",
  "Imperia Structures",
  "Indiabulls",
  "Ireo",
  "Jaypee Group",
  "JMD Group",
  "K Raheja Corp",
  "Karma Lakelands",
  "Krisumi Corporation",
  "Laburnum Developers",
  "Lodha Developers",
  "M3M India",
  "Mahindra Lifespaces",
  "Max Estates",
  "MNB Build Fab Pvt Ltd",
  "Omaxe",
  "Orchid",
  "Orris",
  "Paras Buildtech",
  "Parsvnath",
  "Pioneer Urban",
  "Prime Developments",
  "Puri Constructions",
  "Raheja Developers",
  "Reach Group",
  "Sare Homes",
  "Satya Group",
  "Shapoorji Pallonji",
  "Sidhartha Group",
  "Signature Gobal",
  "Silverglades",
  "Silverglades Group",
  "Smart World",
  "Sobha Limited",
  "Spaze Group",
  "SS Group",
  "Suncity",
  "TARC",
  "Tata Realty",
  "Trehan Group",
  "Tribeca",
  "Tulip Infratech",
  "Unitech",
  "Vatika Group",
  "Vipul Group",
  "VSR Infra",
  "Whiteland Corporation",
];

export const CATEGORIES = {
  RESIDENTIAL: "Residential",
  COMMERCIAL: "Commercial",
};

export const SUBCATEGORIES = {
  Residential: [
    "Residential plot",
    "Villa",
    "Farm House",
    "Farmhouse",
    "Independent Floor",
    "Apartment",
    "Serviced Apartment",
    "Guest House",
    "Other",
  ],
  Commercial: [
    "Retail Shop",
    "Office Space",
    "Office",
    "SCO",
    "Commercial Plot",
    "Factory",
    "Warehouse",
    "Mixed Use (Retail+Office)",
    "Other",
  ],
};

export const DEAL_TYPES = ["BOOKING", "RETRADE", "LEASE"];

export const PROPERTY_STATUSES = [
  "AVAILABLE",
  "UNDER_REVIEW",
  "SOLD",
  "RENT_OUT",
  "LOST",
];

export const BHK_OPTIONS = [
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
];

export const ADDITIONAL_CONFIG_OPTIONS = ["Penthouse", "Duplex", "Triplex"];

export const FURNISHING_OPTIONS = [
  "Unfurnished",
  "Semi-Furnished",
  "Bare Shell",
  "Fully Furnished",
];

export const AREA_TYPES = [
  "Super Area",
  "Carpet Area",
  "Built-up Area",
  "Plot Area",
];

export const AREA_UNITS = ["sq. ft.", "sq. m.", "sq. yd.", "acre", "kanal"];

export const FACING_DIRECTIONS = [
  "North",
  "North-East",
  "East",
  "South-East",
  "South",
  "South-West",
  "West",
  "North-West",
];

export const AVAILABLE_FOR_OPTIONS = [
  "All",
  "Company Lease",
  "Family",
  "MNC",
  "Expats",
  "Bachelors",
];

export const MAINTENANCE_FREQUENCIES = ["Per Month", "Per Quarter", "Per Year"];

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
  Security: ["CCTV", "Security Personnel", "Fire Safety", "Video Door Phone"],
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
    "High-Speed Internet",
  ],
};

// Backward-compatibility alias for tests and consumers
Object.defineProperty(AMENITIES_GROUPS, "Lifestyle", {
  get() {
    return this["Life Style"];
  },
  enumerable: false,
});

export const CITIES = [
  "Gurgaon",
  "Delhi",
  "Kasauli",
  "Goa",
  "Other",
];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest Added (Newest first)" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "area_asc", label: "Area (Sq. Ft.): Low to High" },
  { value: "area_desc", label: "Area (Sq. Ft.): High to Low" },
];
