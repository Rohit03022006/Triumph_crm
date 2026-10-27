import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedSampleLeads() {
  console.log("Checking sample leads...");
  const leadCount = await prisma.lead.count();
  if (leadCount > 0) {
    console.log(`Found ${leadCount} existing leads.`);
    return await prisma.lead.findMany({ take: 5 });
  }

  console.log("Creating 4 sample leads for unit tagging...");
  const sampleLeads = [
    {
      firstName: "Vikram",
      lastName: "Malhotra",
      email: "vikram.malhotra@zenithenterprises.com",
      phone: "+91 98100 12345"
    },
    {
      firstName: "Pooja",
      lastName: "Sharma",
      email: "pooja.sharma@horizoncap.in",
      phone: "+91 98111 67890"
    },
    {
      firstName: "Ananya",
      lastName: "Singhal",
      email: "ananya.singhal@gmail.com",
      phone: "+91 98200 54321"
    },
    {
      firstName: "Rajesh",
      lastName: "Kothari",
      email: "rajesh@kotharigroup.com",
      phone: "+91 99990 87654"
    }
  ];

  const createdLeads = [];
  for (const lead of sampleLeads) {
    const created = await prisma.lead.create({ data: lead });
    createdLeads.push(created);
  }
  console.log(`✅ Created ${createdLeads.length} sample leads.`);
  return createdLeads;
}

export async function seedInventoryProperties() {
  console.log("Seeding inventory properties...");

  // Fetch developers for proper relational ID linking
  const developers = await prisma.developer.findMany();
  const devMap = new Map(developers.map((d) => [d.name.toLowerCase(), d]));

  const getDev = (name) => {
    if (!name) return null;
    return devMap.get(name.toLowerCase()) || null;
  };

  // Sample leads for project unit tagging
  const leads = await seedSampleLeads();
  const [lead1, lead2, lead3, lead4] = leads;

  const propertiesData = [
    // ----------------------------------------------------
    // BOOKING PROPERTIES
    // ----------------------------------------------------
    {
      dealType: "BOOKING",
      title: "The Camellias Residences",
      devName: "DLF",
      category: "Residential",
      subcategory: "Apartment",
      city: "Gurgaon",
      locality: "Golf Course Road",
      projectSociety: "DLF Golf Links",
      bhk: ["4 BHK", "5 BHK"],
      additionalSelection: ["Penthouse"],
      furnishing: "Bare Shell",
      price: 320000000,
      priceUnit: "Crores",
      pricePerUnitArea: 43243,
      paymentPlan: "Possession Linked Plan (25:25:50)",
      projectStatus: "Under Construction",
      possessionMonth: "December",
      possessionYear: 2026,
      availabilityStatus: "Under Construction",
      facingDirection: "North-East",
      numberOfStoreys: 38,
      floorNumber: "12 to 38",
      totalFloors: 38,
      numberOfLifts: 6,
      powerBackup: true,
      airConditioning: true,
      parkingType: "Covered",
      numberOfParkings: 4,
      servantPujaStore: ["Servant Room", "Puja Room", "Store Room"],
      usps: ["On Main Road", "Metro Station Nearby", "Park-Facing", "Luxury Interiors", "Gated Society"],
      amenities: ["Swimming Pool", "Clubhouse", "Gymnasium", "Pet Park", "Concierge", "CCTV", "High-Speed Elevator", "Power Backup (DG Set)"],
      description: "DLF's flagship super-luxury residential development offering grand vistas of the Aravallis and the 18-hole Gary Player Golf Course. Features bespoke club amenities and world-class concierge.",
      status: "AVAILABLE",
      developerContactName: "Amitabh Verma",
      developerContactNumber: "+91 98112 00450",
      developerContactDesignation: "VP - Ultra Luxury Sales",
      primaryArea: 7400,
      primaryAreaUnit: "sq. ft.",
      areas: [
        { areaType: "Super Area", value: 7400, unit: "sq. ft." },
        { areaType: "Carpet Area", value: 5800, unit: "sq. ft." }
      ],
      media: [
        {
          type: "IMAGE",
          url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80",
          name: "Camellias Tower Exterior"
        },
        {
          type: "IMAGE",
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
          name: "Living Area Specimen"
        }
      ],
      units: [
        { unitName: "Tower 2 - Unit 1201", area: 7400, areaUnit: "sq. ft.", price: 320000000, status: "AVAILABLE" },
        { unitName: "Tower 2 - Unit 1202", area: 7400, areaUnit: "sq. ft.", price: 320000000, status: "TAGGED", leadId: lead1?.id },
        { unitName: "Tower 3 - Unit 1801", area: 9500, areaUnit: "sq. ft.", price: 410000000, status: "BOOKED" },
        { unitName: "Tower 3 - Unit PH-01", area: 11000, areaUnit: "sq. ft.", price: 520000000, status: "AVAILABLE" }
      ]
    },
    {
      dealType: "BOOKING",
      title: "Godrej Aristocrat",
      devName: "Godrej Properties",
      category: "Residential",
      subcategory: "Apartment",
      city: "Gurgaon",
      locality: "Sector 49, Golf Course Extension Road",
      projectSociety: "Godrej Aristocrat Phase 1",
      bhk: ["3 BHK", "3.5 BHK", "4 BHK"],
      furnishing: "Semi-Furnished",
      price: 48500000,
      priceUnit: "Crores",
      pricePerUnitArea: 17017,
      paymentPlan: "30:40:30 Construction Linked Plan",
      projectStatus: "Launched",
      possessionMonth: "March",
      possessionYear: 2027,
      availabilityStatus: "Under Construction",
      facingDirection: "East",
      numberOfStoreys: 30,
      totalFloors: 30,
      numberOfLifts: 4,
      powerBackup: true,
      airConditioning: true,
      parkingType: "Covered",
      numberOfParkings: 2,
      servantPujaStore: ["Servant Room"],
      usps: ["Highway Access", "Hospital Nearby", "School Nearby", "Gated Society", "Low-Density"],
      amenities: ["Swimming Pool", "Clubhouse", "Gymnasium", "Kids Play Area", "Jogging Track", "CCTV", "Fire Safety"],
      description: "Premium forest-themed residential development by Godrej on Golf Course Extension Road. Expansive green buffers, 45,000 sq ft clubhouse, and direct connectivity to NH-8 & Rapid Metro.",
      status: "AVAILABLE",
      developerContactName: "Rohan Sehgal",
      developerContactNumber: "+91 98711 33221",
      developerContactDesignation: "Senior Sales Manager",
      primaryArea: 2850,
      primaryAreaUnit: "sq. ft.",
      areas: [
        { areaType: "Super Area", value: 2850, unit: "sq. ft." },
        { areaType: "Carpet Area", value: 2150, unit: "sq. ft." }
      ],
      media: [
        {
          type: "IMAGE",
          url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80",
          name: "Project Elevation"
        }
      ],
      units: [
        { unitName: "Tower A - Unit 502", area: 2250, areaUnit: "sq. ft.", price: 38500000, status: "AVAILABLE" },
        { unitName: "Tower A - Unit 804", area: 2850, areaUnit: "sq. ft.", price: 48500000, status: "AVAILABLE" },
        { unitName: "Tower B - Unit 1102", area: 3400, areaUnit: "sq. ft.", price: 59500000, status: "TAGGED", leadId: lead2?.id },
        { unitName: "Tower B - Unit 1401", area: 3400, areaUnit: "sq. ft.", price: 59500000, status: "SOLD" }
      ]
    },
    {
      dealType: "BOOKING",
      title: "Sobha City - Athena Tower",
      devName: "Sobha Limited",
      category: "Residential",
      subcategory: "Apartment",
      city: "Gurgaon",
      locality: "Sector 108, Dwarka Expressway",
      projectSociety: "Sobha City",
      bhk: ["3 BHK", "4 BHK"],
      furnishing: "Bare Shell",
      price: 36000000,
      priceUnit: "Crores",
      pricePerUnitArea: 15000,
      paymentPlan: "Flexible 40:60",
      projectStatus: "Under Construction",
      possessionMonth: "October",
      possessionYear: 2026,
      availabilityStatus: "Under Construction",
      facingDirection: "North",
      numberOfStoreys: 25,
      totalFloors: 25,
      numberOfLifts: 3,
      powerBackup: true,
      parkingType: "Covered",
      numberOfParkings: 2,
      servantPujaStore: ["Servant Room", "Puja Room"],
      usps: ["Highway Access", "Airport Nearby", "Park Nearby", "Grade-A Building"],
      amenities: ["Swimming Pool", "Clubhouse", "Gymnasium", "Sports Facilities", "Jogging Track", "Pet Park"],
      description: "Sobha City is an iconic 39-acre urban park lifestyle development along the Dwarka Expressway with 8.5 acres of uninterrupted greens and seamless Delhi connectivity.",
      status: "AVAILABLE",
      developerContactName: "Meenakshi Iyer",
      developerContactNumber: "+91 99100 44220",
      developerContactDesignation: "Director - Customer Relations",
      primaryArea: 2400,
      primaryAreaUnit: "sq. ft.",
      areas: [
        { areaType: "Super Area", value: 2400, unit: "sq. ft." },
        { areaType: "Carpet Area", value: 1850, unit: "sq. ft." }
      ],
      media: [
        {
          type: "IMAGE",
          url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80",
          name: "Sobha City Elevation"
        }
      ],
      units: [
        { unitName: "Athena - Unit 401", area: 2400, areaUnit: "sq. ft.", price: 36000000, status: "AVAILABLE" },
        { unitName: "Athena - Unit 903", area: 2400, areaUnit: "sq. ft.", price: 36000000, status: "BOOKED" },
        { unitName: "Athena - Unit 1502", area: 2900, areaUnit: "sq. ft.", price: 43500000, status: "AVAILABLE" }
      ]
    },
    {
      dealType: "BOOKING",
      title: "Emaar Business District 65 (EBD 65)",
      devName: "Emaar",
      category: "Commercial",
      subcategory: "SCO",
      city: "Gurgaon",
      locality: "Sector 65, Golf Course Extension Road",
      projectSociety: "EBD 65 Commercial Complex",
      furnishing: "Bare Shell",
      price: 95000000,
      priceUnit: "Crores",
      pricePerUnitArea: 21111,
      paymentPlan: "Possession Linked Plan 50:50",
      projectStatus: "Ready to Move",
      availabilityStatus: "Ready to Move",
      facingDirection: "North-East",
      numberOfStoreys: 5,
      totalFloors: 5,
      powerBackup: true,
      parkingType: "Open",
      numberOfParkings: 6,
      boundaryWall: true,
      plotShape: "Regular",
      constructionAllowed: true,
      usps: ["On Main Road", "High Footfall Area", "High Street Location", "Metro Station Nearby"],
      amenities: ["Power Backup (DG Set)", "Security Personnel", "CCTV", "ATM/Bank", "Visitor Parking"],
      description: "Shop-Cum-Office (SCO) commercial development on the prime Golf Course Extension corridor. Basement + Ground + 4 floors allowed with 100% surface parking and pedestrian promenades.",
      status: "AVAILABLE",
      developerContactName: "Kunal Bansal",
      developerContactNumber: "+91 98101 99000",
      developerContactDesignation: "Commercial Portfolio Head",
      primaryArea: 4500,
      primaryAreaUnit: "sq. ft.",
      areas: [
        { areaType: "Super Area", value: 4500, unit: "sq. ft." },
        { areaType: "Plot Area", value: 150, unit: "sq. yd." }
      ],
      media: [
        {
          type: "IMAGE",
          url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80",
          name: "EBD 65 High Street Promenade"
        }
      ],
      units: [
        { unitName: "Plot SCO-12", area: 4500, areaUnit: "sq. ft.", price: 95000000, status: "AVAILABLE" },
        { unitName: "Plot SCO-14", area: 4500, areaUnit: "sq. ft.", price: 95000000, status: "TAGGED", leadId: lead3?.id },
        { unitName: "Plot SCO-22 Corner", area: 5200, areaUnit: "sq. ft.", price: 112000000, status: "SOLD" }
      ]
    },
    {
      dealType: "BOOKING",
      title: "M3M Jewel High Street",
      devName: "M3M India",
      category: "Commercial",
      subcategory: "Retail Shop",
      city: "Gurgaon",
      locality: "Sector 25, MG Road",
      projectSociety: "M3M Jewel",
      furnishing: "Bare Shell",
      price: 19500000,
      priceUnit: "Crores",
      pricePerUnitArea: 30000,
      paymentPlan: "Assured Return 12% till possession",
      projectStatus: "Under Construction",
      possessionMonth: "June",
      possessionYear: 2026,
      availabilityStatus: "Under Construction",
      facingDirection: "East",
      numberOfStoreys: 8,
      totalFloors: 8,
      numberOfLifts: 4,
      powerBackup: true,
      airConditioning: true,
      parkingType: "Covered",
      numberOfParkings: 2,
      usps: ["High Street Location", "Metro Station Nearby", "High Footfall Area", "Assured Rental Returns"],
      amenities: ["High-Speed Elevator", "Power Backup (DG Set)", "CCTV", "Fire Safety", "Restaurants", "Cafeteria"],
      description: "State-of-the-art hybrid retail luxury mall on MG Road, adjacent to Sikanderpur Metro Station. Features high glass frontage, seamless vertical escalators, and marquee anchor brands.",
      status: "AVAILABLE",
      developerContactName: "Gaurav Chawla",
      developerContactNumber: "+91 99991 55443",
      developerContactDesignation: "AVP Commercial Sales",
      primaryArea: 650,
      primaryAreaUnit: "sq. ft.",
      areas: [
        { areaType: "Super Area", value: 650, unit: "sq. ft." },
        { areaType: "Carpet Area", value: 420, unit: "sq. ft." }
      ],
      media: [
        {
          type: "IMAGE",
          url: "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=1200&auto=format&fit=crop&q=80",
          name: "M3M Jewel Mall Atrium"
        }
      ],
      units: [
        { unitName: "Ground Floor - G-24", area: 650, areaUnit: "sq. ft.", price: 19500000, status: "AVAILABLE" },
        { unitName: "Ground Floor - G-31", area: 800, areaUnit: "sq. ft.", price: 24000000, status: "BOOKED" },
        { unitName: "First Floor - F-12", area: 550, areaUnit: "sq. ft.", price: 14500000, status: "AVAILABLE" }
      ]
    },
    {
      dealType: "BOOKING",
      title: "Central Park Bellavista Towers",
      devName: "Central Park",
      category: "Residential",
      subcategory: "Serviced Apartment",
      city: "Gurgaon",
      locality: "Sector 48, Sohna Road",
      projectSociety: "Central Park Resorts",
      bhk: ["1 BHK", "2 BHK"],
      furnishing: "Fully Furnished",
      price: 21000000,
      priceUnit: "Crores",
      pricePerUnitArea: 16800,
      paymentPlan: "30:70 On Possession",
      projectStatus: "Ready to Move",
      availabilityStatus: "Ready to Move",
      facingDirection: "North-West",
      numberOfStoreys: 32,
      totalFloors: 32,
      numberOfLifts: 4,
      powerBackup: true,
      airConditioning: true,
      parkingType: "Covered",
      numberOfParkings: 1,
      usps: ["Luxury Interiors", "Gated Society", "Park-Facing", "Hospital Nearby"],
      amenities: ["Swimming Pool", "Clubhouse", "Gymnasium", "Concierge", "Restaurants", "High-Speed Elevator"],
      description: "Japanese luxury hospitality-inspired studio and 1-2 BHK serviced suites with 20 acres of resort greens, dedicated butler services, helipad, and 3-tier hospitality operations.",
      status: "AVAILABLE",
      developerContactName: "Sanjay Narula",
      developerContactNumber: "+91 98188 77665",
      developerContactDesignation: "General Manager - Project Sales",
      primaryArea: 1250,
      primaryAreaUnit: "sq. ft.",
      areas: [
        { areaType: "Super Area", value: 1250, unit: "sq. ft." },
        { areaType: "Carpet Area", value: 920, unit: "sq. ft." }
      ],
      media: [
        {
          type: "IMAGE",
          url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&auto=format&fit=crop&q=80",
          name: "Bellavista Suites View"
        }
      ],
      units: [
        { unitName: "Tower Studio - 304", area: 1050, areaUnit: "sq. ft.", price: 18500000, status: "AVAILABLE" },
        { unitName: "Tower Suite - 708", area: 1400, areaUnit: "sq. ft.", price: 24500000, status: "AVAILABLE" }
      ]
    },

    // ----------------------------------------------------
    // RETRADE PROPERTIES
    // ----------------------------------------------------
    {
      dealType: "RETRADE",
      title: "Puri The Aravallis - Luxury 4 BHK",
      devName: "Puri Constructions",
      category: "Residential",
      subcategory: "Apartment",
      city: "Gurgaon",
      locality: "Sector 61, Golf Course Extension Road",
      projectSociety: "The Aravallis",
      bhk: ["4 BHK"],
      furnishing: "Semi-Furnished",
      price: 62500000,
      priceUnit: "Crores",
      pricePerUnitArea: 19230,
      availabilityStatus: "Ready to Move",
      facingDirection: "North-East",
      floorNumber: "14",
      totalFloors: 32,
      propertyAge: "1 to 3 years",
      numberOfLifts: 3,
      powerBackup: true,
      airConditioning: true,
      parkingType: "Covered",
      numberOfParkings: 2,
      servantPujaStore: ["Servant Room", "Puja Room"],
      usps: ["On Main Road", "Metro Station Nearby", "Park-Facing", "Luxury Interiors", "Gated Society"],
      amenities: ["Swimming Pool", "Clubhouse", "Gymnasium", "Kids Play Area", "CCTV", "Power Backup (DG Set)"],
      description: "Spectacular 4 BHK overlooking the scenic Aravalli hills. Italian marble flooring, imported modular kitchen, VRV air conditioning, and 2 dedicated stilt parking slots.",
      status: "AVAILABLE",
      sellerName: "Rajesh Singhania",
      sellerPhone: "+91 98112 34567",
      primaryArea: 3250,
      primaryAreaUnit: "sq. ft.",
      areas: [
        { areaType: "Super Area", value: 3250, unit: "sq. ft." },
        { areaType: "Carpet Area", value: 2450, unit: "sq. ft." }
      ],
      media: [
        {
          type: "IMAGE",
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
          name: "Living Room with Valley View"
        }
      ]
    },
    {
      dealType: "RETRADE",
      title: "Tatvam Villas - Ultra Luxury Independent Villa",
      devName: "Vipul Group",
      category: "Residential",
      subcategory: "Villa",
      city: "Gurgaon",
      locality: "Sector 48, Sohna Road",
      projectSociety: "Tatvam Villas",
      bhk: ["5 BHK", "5+ BHK"],
      furnishing: "Fully Furnished",
      price: 115000000,
      priceUnit: "Crores",
      pricePerUnitArea: 20909,
      availabilityStatus: "Ready to Move",
      facingDirection: "East",
      numberOfStoreys: 3,
      totalFloors: 3,
      propertyAge: "3 to 5 years",
      powerBackup: true,
      airConditioning: true,
      parkingType: "Covered",
      numberOfParkings: 3,
      servantPujaStore: ["Servant Room", "Puja Room", "Store Room"],
      boundaryWall: true,
      plotShape: "Regular",
      constructionAllowed: true,
      usps: ["Private Terrace", "Park-Facing", "Vastu Compliant", "Gated Society", "Low-Density"],
      amenities: ["Swimming Pool", "Clubhouse", "Gymnasium", "Jogging Track", "CCTV", "Rainwater Harvesting"],
      description: "Magnificent Mediterranean-style villa with private temperature-controlled plunge pool, manicured lawn, double-height ceiling in drawing room, and imported German fittings.",
      status: "AVAILABLE",
      sellerName: "Sunita Grover",
      sellerPhone: "+91 98101 88765",
      primaryArea: 5500,
      primaryAreaUnit: "sq. ft.",
      areas: [
        { areaType: "Super Area", value: 5500, unit: "sq. ft." },
        { areaType: "Plot Area", value: 500, unit: "sq. yd." }
      ],
      media: [
        {
          type: "IMAGE",
          url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&auto=format&fit=crop&q=80",
          name: "Villa Front Elevation"
        }
      ]
    },
    {
      dealType: "RETRADE",
      title: "Vasant Vihar Designer Builder Floor",
      devName: null,
      category: "Residential",
      subcategory: "Independent Floor",
      city: "Delhi",
      locality: "Vasant Vihar",
      projectSociety: "Block C",
      bhk: ["4 BHK"],
      furnishing: "Fully Furnished",
      price: 180000000,
      priceUnit: "Crores",
      pricePerUnitArea: 45000,
      availabilityStatus: "Ready to Move",
      facingDirection: "North",
      floorNumber: "2nd Floor",
      totalFloors: 4,
      propertyAge: "Less than 1 year",
      numberOfLifts: 1,
      powerBackup: true,
      airConditioning: true,
      parkingType: "Covered",
      numberOfParkings: 3,
      servantPujaStore: ["Servant Room", "Puja Room"],
      usps: ["Luxury Interiors", "Park-Facing", "Metro Station Nearby", "Visitor Parking"],
      amenities: ["Service Lift", "High-Speed Elevator", "Security Personnel", "CCTV"],
      description: "High-spec modern builder floor in South Delhi diplomatic zone. Features wide front balcony, bespoke Italian lighting, Poggenpohl kitchen, and dedicated stilt parking bays.",
      status: "UNDER_REVIEW",
      sellerName: "Brigadier Harsh Vardhan",
      sellerPhone: "+91 99990 12345",
      primaryArea: 4000,
      primaryAreaUnit: "sq. ft.",
      areas: [
        { areaType: "Super Area", value: 4000, unit: "sq. ft." },
        { areaType: "Carpet Area", value: 3200, unit: "sq. ft." }
      ],
      media: [
        {
          type: "IMAGE",
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
          name: "Modern Drawing Room"
        }
      ]
    },
    {
      dealType: "RETRADE",
      title: "DLF Phase 2 Independent Residential Plot",
      devName: "DLF",
      category: "Residential",
      subcategory: "Residential Plot",
      city: "Gurgaon",
      locality: "DLF Phase 2",
      projectSociety: "Block K",
      price: 78000000,
      priceUnit: "Crores",
      pricePerUnitArea: 260000,
      availabilityStatus: "Ready to Move",
      facingDirection: "North-East",
      boundaryWall: true,
      plotShape: "Regular",
      constructionAllowed: true,
      plotLength: 20,
      plotBreadth: 15,
      usps: ["Metro Station Nearby", "On Main Road", "Highway Access", "Corner Property"],
      amenities: ["Security Personnel", "CCTV"],
      description: "Prime 300 sq. yd. corner plot in DLF Phase 2 within walking distance to Cyber City and Rapid Metro. Clear title, free-hold, registry complete, ready for basement + 4 floors construction.",
      status: "AVAILABLE",
      sellerName: "Mohit Aggarwal",
      sellerPhone: "+91 98711 54321",
      primaryArea: 300,
      primaryAreaUnit: "sq. yd.",
      areas: [
        { areaType: "Plot Area", value: 300, unit: "sq. yd." }
      ],
      media: [
        {
          type: "IMAGE",
          url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80",
          name: "Plot View"
        }
      ]
    },
    {
      dealType: "RETRADE",
      title: "Bandra Pali Hill Sea View Duplex",
      devName: null,
      category: "Residential",
      subcategory: "Apartment",
      additionalSelection: ["Duplex"],
      city: "Mumbai",
      locality: "Pali Hill, Bandra West",
      projectSociety: "Ocean Crest Residences",
      bhk: ["4 BHK"],
      furnishing: "Fully Furnished",
      price: 240000000,
      priceUnit: "Crores",
      pricePerUnitArea: 66666,
      availabilityStatus: "Ready to Move",
      facingDirection: "West",
      floorNumber: "16 & 17",
      totalFloors: 20,
      propertyAge: "1 to 3 years",
      numberOfLifts: 3,
      powerBackup: true,
      airConditioning: true,
      parkingType: "Covered",
      numberOfParkings: 3,
      servantPujaStore: ["Servant Room"],
      usps: ["Luxury Interiors", "Airport Nearby", "Park-Facing", "High Street Location"],
      amenities: ["Swimming Pool", "Clubhouse", "Gymnasium", "Concierge", "High-Speed Elevator", "CCTV"],
      description: "Rarely available high-floor duplex penthouse in Pali Hill with breathtaking Arabian Sea views. Designed by renowned interior architect with private deck and smart home automation.",
      status: "AVAILABLE",
      sellerName: "Kabir Merchant",
      sellerPhone: "+91 98200 99887",
      primaryArea: 3600,
      primaryAreaUnit: "sq. ft.",
      areas: [
        { areaType: "Super Area", value: 3600, unit: "sq. ft." },
        { areaType: "Carpet Area", value: 2900, unit: "sq. ft." }
      ],
      media: [
        {
          type: "IMAGE",
          url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80",
          name: "Arabian Sea View Balcony"
        }
      ]
    },
    {
      dealType: "RETRADE",
      title: "Assagao Portuguese Heritage Villa",
      devName: null,
      category: "Residential",
      subcategory: "Villa",
      city: "Goa",
      locality: "Assagao",
      projectSociety: "Heritage Enclave",
      bhk: ["4 BHK"],
      furnishing: "Fully Furnished",
      price: 92000000,
      priceUnit: "Crores",
      pricePerUnitArea: 21904,
      availabilityStatus: "Ready to Move",
      facingDirection: "East",
      numberOfStoreys: 2,
      totalFloors: 2,
      propertyAge: "Over 10 years",
      powerBackup: true,
      airConditioning: true,
      parkingType: "Open",
      numberOfParkings: 2,
      boundaryWall: true,
      usps: ["Recently Renovated", "Private Terrace", "Luxury Interiors", "Park Nearby"],
      amenities: ["Swimming Pool", "Pet Park", "Security Personnel"],
      description: "Painstakingly restored 100-year-old Portuguese estate in trendy Assagao. Private swimming pool surrounded by tropical palm trees, high arched ceilings, and curated antique decor.",
      status: "SOLD",
      sellerName: "Fernandes Estate Trust",
      sellerPhone: "+91 98221 44332",
      primaryArea: 4200,
      primaryAreaUnit: "sq. ft.",
      areas: [
        { areaType: "Super Area", value: 4200, unit: "sq. ft." },
        { areaType: "Plot Area", value: 650, unit: "sq. yd." }
      ],
      media: [
        {
          type: "IMAGE",
          url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80",
          name: "Heritage Villa Lawn & Pool"
        }
      ]
    },

    // ----------------------------------------------------
    // LEASE PROPERTIES
    // ----------------------------------------------------
    {
      dealType: "LEASE",
      title: "DLF Cyber City - Grade A Corporate Office",
      devName: "DLF",
      category: "Commercial",
      subcategory: "Office",
      city: "Gurgaon",
      locality: "Cyber City, DLF Phase 2",
      projectSociety: "Building 10, Tower B",
      furnishing: "Fully Furnished",
      monthlyRent: 1440000,
      securityDeposit: "6 Months",
      maintenanceCharges: 192000,
      maintenanceFrequency: "Per Month",
      availableFor: ["MNC", "Company Lease"],
      leaseDuration: 36,
      lockInPeriod: 24,
      leaseAvailability: "Immediate",
      floorNumber: "8th Floor",
      totalFloors: 16,
      numberOfLifts: 6,
      powerBackup: true,
      airConditioning: true,
      numberOfWashrooms: 4,
      washroomType: "Private",
      parkingType: "Covered",
      numberOfParkings: 12,
      preLeased: false,
      usps: ["Metro Station Nearby", "Highway Access", "Grade-A Building", "IGBC/LEED Certified", "Ready-to-Operate"],
      amenities: ["High-Speed Elevator", "Power Backup (DG Set)", "CCTV", "Fire Safety", "Cafeteria", "ATM/Bank", "Concierge"],
      description: "Plug-and-play corporate floorplate in DLF Building 10. Equipped with 120 ergonomic workstations, 6 leadership cabins, 2 boardroom video-conference setups, and dedicated cafeteria.",
      status: "AVAILABLE",
      sellerName: "Cyber Corporate Assets Pvt Ltd",
      sellerPhone: "+91 98110 00112",
      primaryArea: 12000,
      primaryAreaUnit: "sq. ft.",
      areas: [
        { areaType: "Super Area", value: 12000, unit: "sq. ft." },
        { areaType: "Carpet Area", value: 9600, unit: "sq. ft." }
      ],
      media: [
        {
          type: "IMAGE",
          url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80",
          name: "Cyber City Tower 10"
        },
        {
          type: "IMAGE",
          url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
          name: "Workstations & Office Layout"
        }
      ]
    },
    {
      dealType: "LEASE",
      title: "One Horizon Center - Premium Corporate Suite",
      devName: "DLF",
      category: "Commercial",
      subcategory: "Office",
      city: "Gurgaon",
      locality: "Golf Course Road, Sector 43",
      projectSociety: "One Horizon Center",
      furnishing: "Semi-Furnished",
      monthlyRent: 1105000,
      securityDeposit: "6 Months",
      maintenanceCharges: 110500,
      maintenanceFrequency: "Per Month",
      availableFor: ["MNC", "Company Lease"],
      leaseDuration: 60,
      lockInPeriod: 36,
      leaseAvailability: "Date Selection",
      availableFromDate: new Date("2026-11-01"),
      floorNumber: "15th Floor",
      totalFloors: 25,
      numberOfLifts: 8,
      powerBackup: true,
      airConditioning: true,
      parkingType: "Covered",
      numberOfParkings: 8,
      preLeased: true,
      preLeasedDetails: "Previously tenanted by leading global consultancy firm",
      roiPercentage: 7.8,
      usps: ["Metro Station Nearby", "On Main Road", "Grade-A Building", "IGBC/LEED Certified", "Luxury Interiors"],
      amenities: ["High-Speed Elevator", "Concierge", "Power Backup (DG Set)", "CCTV", "Restaurants"],
      description: "Prestigious office address at One Horizon Center on Golf Course Road. Double-glazed facade with acoustic insulation, high ceiling clearance, and LEED Platinum rated architecture.",
      status: "AVAILABLE",
      sellerName: "Horizon Portfolio Holdings",
      sellerPhone: "+91 98100 77112",
      primaryArea: 6500,
      primaryAreaUnit: "sq. ft.",
      areas: [
        { areaType: "Super Area", value: 6500, unit: "sq. ft." },
        { areaType: "Carpet Area", value: 5100, unit: "sq. ft." }
      ],
      media: [
        {
          type: "IMAGE",
          url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
          name: "Corporate Suite Reception"
        }
      ]
    },
    {
      dealType: "LEASE",
      title: "The Magnolias - Ultra Luxury Penthouse on Lease",
      devName: "DLF",
      category: "Residential",
      subcategory: "Apartment",
      additionalSelection: ["Penthouse"],
      city: "Gurgaon",
      locality: "Golf Course Road",
      projectSociety: "DLF Golf Links",
      bhk: ["5 BHK", "5+ BHK"],
      furnishing: "Fully Furnished",
      monthlyRent: 850000,
      securityDeposit: "3 Months",
      maintenanceCharges: 65000,
      maintenanceFrequency: "Per Month",
      availableFor: ["Company Lease", "Expats", "Family"],
      leaseDuration: 24,
      lockInPeriod: 12,
      leaseAvailability: "Immediate",
      floorNumber: "22 & 23",
      totalFloors: 24,
      numberOfLifts: 4,
      powerBackup: true,
      airConditioning: true,
      parkingType: "Covered",
      numberOfParkings: 4,
      servantPujaStore: ["Servant Room", "Store Room"],
      usps: ["Park-Facing", "Metro Station Nearby", "Luxury Interiors", "Gated Society", "Private Terrace"],
      amenities: ["Swimming Pool", "Clubhouse", "Gymnasium", "Concierge", "Restaurants", "Pet Park", "CCTV"],
      description: "Expansive 9,800 sq ft duplex penthouse overlooking DLF Golf Course. Opulent modern furnishings, master suite with private sauna, wrap-around deck, and golf privileges.",
      status: "AVAILABLE",
      sellerName: "Oberoi Family Office",
      sellerPhone: "+91 98111 22334",
      primaryArea: 9800,
      primaryAreaUnit: "sq. ft.",
      areas: [
        { areaType: "Super Area", value: 9800, unit: "sq. ft." },
        { areaType: "Carpet Area", value: 7600, unit: "sq. ft." }
      ],
      media: [
        {
          type: "IMAGE",
          url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80",
          name: "Magnolias Golf Course View"
        }
      ]
    },
    {
      dealType: "LEASE",
      title: "Galleria Market High Footfall Retail Shop",
      devName: "DLF",
      category: "Commercial",
      subcategory: "Retail Shop",
      city: "Gurgaon",
      locality: "DLF Phase 4",
      projectSociety: "Galleria Market",
      furnishing: "Bare Shell",
      monthlyRent: 290000,
      securityDeposit: "3 Months",
      maintenanceCharges: 15000,
      maintenanceFrequency: "Per Month",
      availableFor: ["All"],
      leaseDuration: 36,
      lockInPeriod: 18,
      leaseAvailability: "Immediate",
      floorNumber: "Ground Floor",
      totalFloors: 4,
      powerBackup: true,
      parkingType: "Open",
      numberOfParkings: 2,
      usps: ["High Footfall Area", "On Main Road", "Metro Station Nearby", "High Street Location"],
      amenities: ["Power Backup (DG Set)", "Security Personnel", "CCTV", "ATM/Bank"],
      description: "Prime ground floor retail space in the center courtyard of Gurgaon's most buzzing open-air market. Tremendous footfall, exceptional street visibility, and high conversion brand neighbors.",
      status: "AVAILABLE",
      sellerName: "Sanjay Kapoor",
      sellerPhone: "+91 98730 11998",
      primaryArea: 850,
      primaryAreaUnit: "sq. ft.",
      areas: [
        { areaType: "Super Area", value: 850, unit: "sq. ft." },
        { areaType: "Carpet Area", value: 600, unit: "sq. ft." }
      ],
      media: [
        {
          type: "IMAGE",
          url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80",
          name: "Galleria Courtyard Retail"
        }
      ]
    },
    {
      dealType: "LEASE",
      title: "Ambience Creacions Luxury 3 BHK",
      devName: "Ambience Developers",
      category: "Residential",
      subcategory: "Apartment",
      city: "Gurgaon",
      locality: "Sector 22, Old Delhi Gurgaon Road",
      projectSociety: "Ambience Creacions",
      bhk: ["3 BHK"],
      furnishing: "Semi-Furnished",
      monthlyRent: 75000,
      securityDeposit: "2 Months",
      maintenanceCharges: 7500,
      maintenanceFrequency: "Per Month",
      availableFor: ["Family", "Company Lease"],
      leaseDuration: 11,
      lockInPeriod: 6,
      leaseAvailability: "Immediate",
      floorNumber: "7th Floor",
      totalFloors: 19,
      numberOfLifts: 3,
      powerBackup: true,
      airConditioning: true,
      parkingType: "Covered",
      numberOfParkings: 2,
      servantPujaStore: ["Servant Room"],
      usps: ["Airport Nearby", "Highway Access", "Gated Society", "School Nearby"],
      amenities: ["Swimming Pool", "Clubhouse", "Gymnasium", "Kids Play Area", "CCTV"],
      description: "Spacious 3 BHK apartment in Ambience Creacions with premium club access. Strategic location 10 minutes from IGI Airport and Ambience Mall Gurgaon.",
      status: "RENT_OUT",
      sellerName: "Alok Gupta",
      sellerPhone: "+91 98118 44556",
      primaryArea: 2100,
      primaryAreaUnit: "sq. ft.",
      areas: [
        { areaType: "Super Area", value: 2100, unit: "sq. ft." },
        { areaType: "Carpet Area", value: 1650, unit: "sq. ft." }
      ],
      media: [
        {
          type: "IMAGE",
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
          name: "Interior Lounge"
        }
      ]
    },
    {
      dealType: "LEASE",
      title: "Sector 150 Sports City Penthouse",
      devName: "ATS",
      category: "Residential",
      subcategory: "Apartment",
      additionalSelection: ["Penthouse"],
      city: "Noida",
      locality: "Sector 150, Noida-Greater Noida Expressway",
      projectSociety: "ATS Pristine",
      bhk: ["4 BHK"],
      furnishing: "Fully Furnished",
      monthlyRent: 110000,
      securityDeposit: "2 Months",
      maintenanceCharges: 10000,
      maintenanceFrequency: "Per Month",
      availableFor: ["Family", "Expats", "Company Lease"],
      leaseDuration: 12,
      lockInPeriod: 6,
      leaseAvailability: "Immediate",
      floorNumber: "Top Floor",
      totalFloors: 22,
      numberOfLifts: 2,
      powerBackup: true,
      airConditioning: true,
      parkingType: "Covered",
      numberOfParkings: 2,
      servantPujaStore: ["Servant Room", "Puja Room"],
      usps: ["Park-Facing", "Highway Access", "Private Terrace", "Luxury Interiors"],
      amenities: ["Swimming Pool", "Clubhouse", "Gymnasium", "Sports Facilities", "Jogging Track", "CCTV"],
      description: "Low-density eco-friendly luxury penthouse in Noida's greenest sector. Overlooks 40-acre Shaheed Bhagat Singh Park with private terrace garden and modern modular fittings.",
      status: "AVAILABLE",
      sellerName: "Manish Trivedi",
      sellerPhone: "+91 99112 55880",
      primaryArea: 3400,
      primaryAreaUnit: "sq. ft.",
      areas: [
        { areaType: "Super Area", value: 3400, unit: "sq. ft." },
        { areaType: "Carpet Area", value: 2650, unit: "sq. ft." }
      ],
      media: [
        {
          type: "IMAGE",
          url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80",
          name: "Penthouse Terrace Sky Deck"
        }
      ]
    }
  ];

  let createdCount = 0;
  for (const item of propertiesData) {
    const existing = await prisma.property.findFirst({
      where: { title: item.title }
    });

    if (existing) {
      console.log(`Property "${item.title}" already exists. Skipping.`);
      continue;
    }

    const dev = getDev(item.devName);
    const { devName, areas, media, units, ...propFields } = item;

    const property = await prisma.property.create({
      data: {
        ...propFields,
        developerId: dev?.id || null,
        developerName: dev?.name || devName || null,
        areas: areas ? { create: areas } : undefined,
        media: media ? { create: media } : undefined,
        units: units ? { create: units } : undefined
      }
    });

    createdCount++;
    console.log(`✅ Created property: [${property.dealType}] ${property.title}`);
  }

  console.log(`✅ Seed complete! Added ${createdCount} properties.`);
}

async function main() {
  await seedInventoryProperties();
}

if (process.argv[1]?.endsWith("seedInventoryData.js")) {
  main()
    .catch((err) => {
      console.error("Seed error:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

