import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import InventoryHeader from "@/components/Inventory_Management/InventoryHeader";
import InventoryStats from "@/components/Inventory_Management/InventoryStats";
import InventoryFilters from "@/components/Inventory_Management/InventoryFilters";
import InventoryTable from "@/components/Inventory_Management/InventoryTable";
import InventoryGrid from "@/components/Inventory_Management/InventoryGrid";
import ProjectUnitsDialog from "@/components/Inventory_Management/ProjectUnitsDialog";
import {
  fetchInventoryMasterData,
  fetchInventoryMetrics,
  fetchProperties,
  deleteProperty,
} from "@/api/inventory";
import { toast } from "@/components/ui/toast";

const fetchMe = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, { credentials: "include" });
  if (!res.ok) return null;
  return (await res.json()).data;
};

const ITEMS_PER_PAGE = 12;

const Inventory = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const isExecutive = location.pathname.startsWith("/executive");
  const basePath = isExecutive ? "/executive/inventory" : "/admin/inventory";

  // Auth user & role
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
  });
  const isAdmin = user?.role === "ADMIN";

  // URL search params for pagination & filter persistence
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page") || sessionStorage.getItem("inventory_page") || "1", 10);
  const initialPage = !isNaN(pageParam) && pageParam > 0 ? pageParam : 1;

  // Filter States initialized from URL params / defaults
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [dealTypeFilter, setDealTypeFilter] = useState(searchParams.get("dealType") || "ALL");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "ALL");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "ALL");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest");
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [viewMode, setViewMode] = useState("grid");

  const prevFiltersRef = useRef({
    search: searchParams.get("search") || "",
    dealTypeFilter: searchParams.get("dealType") || "ALL",
    categoryFilter: searchParams.get("category") || "ALL",
    statusFilter: searchParams.get("status") || "ALL",
    sortBy: searchParams.get("sortBy") || "newest",
  });

  // Sync state to URL searchParams & sessionStorage so back navigation preserves current page
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set("page", String(currentPage));
    if (search.trim()) params.set("search", search.trim());
    if (dealTypeFilter !== "ALL") params.set("dealType", dealTypeFilter);
    if (categoryFilter !== "ALL") params.set("category", categoryFilter);
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (sortBy !== "newest") params.set("sortBy", sortBy);

    const queryString = params.toString();
    sessionStorage.setItem("inventory_page", String(currentPage));
    sessionStorage.setItem("inventory_search_params", queryString);

    if (searchParams.toString() !== queryString) {
      setSearchParams(params, { replace: true });
    }
  }, [currentPage, search, dealTypeFilter, categoryFilter, statusFilter, sortBy]);

  // Reset page when active search/filters change in UI
  useEffect(() => {
    const prev = prevFiltersRef.current;
    if (
      prev.search !== search ||
      prev.dealTypeFilter !== dealTypeFilter ||
      prev.categoryFilter !== categoryFilter ||
      prev.statusFilter !== statusFilter ||
      prev.sortBy !== sortBy
    ) {
      prevFiltersRef.current = {
        search,
        dealTypeFilter,
        categoryFilter,
        statusFilter,
        sortBy,
      };
      setCurrentPage(1);
    }
  }, [search, dealTypeFilter, categoryFilter, statusFilter, sortBy]);

  // Sync state when URL searchParams change externally (e.g. browser back/forward buttons)
  useEffect(() => {
    const pageInUrl = parseInt(searchParams.get("page") || "1", 10);
    const validPage = !isNaN(pageInUrl) && pageInUrl > 0 ? pageInUrl : 1;
    setCurrentPage((prev) => (prev !== validPage ? validPage : prev));

    const searchInUrl = searchParams.get("search") || "";
    setSearch((prev) => (prev !== searchInUrl ? searchInUrl : prev));

    const dealInUrl = searchParams.get("dealType") || "ALL";
    setDealTypeFilter((prev) => (prev !== dealInUrl ? dealInUrl : prev));

    const catInUrl = searchParams.get("category") || "ALL";
    setCategoryFilter((prev) => (prev !== catInUrl ? catInUrl : prev));

    const statusInUrl = searchParams.get("status") || "ALL";
    setStatusFilter((prev) => (prev !== statusInUrl ? statusInUrl : prev));

    const sortInUrl = searchParams.get("sortBy") || "newest";
    setSortBy((prev) => (prev !== sortInUrl ? sortInUrl : prev));
  }, [searchParams]);

  // Units dialog for booking properties
  const [unitsProperty, setUnitsProperty] = useState(null);

  // Queries
  const { data: masterData } = useQuery({
    queryKey: ["inventoryMasterData"],
    queryFn: fetchInventoryMasterData,
    staleTime: 5 * 60 * 1000,
  });

  const { data: metrics } = useQuery({
    queryKey: ["inventoryMetrics"],
    queryFn: fetchInventoryMetrics,
  });

  // Query params
  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      sortBy,
    };
    if (search.trim()) params.search = search.trim();
    if (dealTypeFilter !== "ALL") params.dealType = dealTypeFilter;
    if (categoryFilter !== "ALL") params.category = categoryFilter;
    if (statusFilter !== "ALL") params.status = statusFilter;
    return params;
  }, [currentPage, search, dealTypeFilter, categoryFilter, statusFilter, sortBy]);

  const { data: propertiesData, isLoading } = useQuery({
    queryKey: ["inventoryProperties", queryParams],
    queryFn: () => fetchProperties(queryParams),
  });

  // Mutations
  const deleteMut = useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventoryProperties"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryMetrics"] });
      toast.success("Property deleted successfully");
    },
    onError: (err) => toast.error("Failed to delete property", err.message),
  });

  // Handlers - All navigate to dedicated pages with UUIDs (NO POPUPS)
  const handleOpenAdd = () => {
    navigate(`${basePath}/add`);
  };

  const handleOpenEdit = (property) => {
    navigate(`${basePath}/${property.id}/edit`);
  };

  const handleViewProperty = (property) => {
    navigate(`${basePath}/${property.id}`);
  };

  const handleResetFilters = () => {
    setSearch("");
    setDealTypeFilter("ALL");
    setCategoryFilter("ALL");
    setStatusFilter("ALL");
    setSortBy("newest");
    setCurrentPage(1);
    sessionStorage.removeItem("inventory_page");
    sessionStorage.removeItem("inventory_search_params");
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const properties = propertiesData?.properties || [];
  const pagination = propertiesData?.pagination || { page: 1, totalPages: 1, total: 0 };

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 overflow-x-hidden">
      {/* Header matching /users */}
      <InventoryHeader onAddClick={handleOpenAdd} />

      {/* Stats Cards matching /users */}
      <InventoryStats stats={metrics} />

      {/* Main Table / Grid Area matching /users */}
      <div className="w-full max-w-full min-w-0 bg-white border rounded-xl shadow-sm overflow-hidden">
        {/* Filters Bar */}
        <InventoryFilters
          search={search}
          setSearch={setSearch}
          dealTypeFilter={dealTypeFilter}
          setDealTypeFilter={setDealTypeFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onReset={handleResetFilters}
        />

        {/* View Component: Table or Grid */}
        {viewMode === "list" ? (
          <InventoryTable
            properties={properties}
            totalPages={pagination.totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            isLoading={isLoading}
            onView={handleViewProperty}
            onEdit={handleOpenEdit}
            onManageUnits={(p) => setUnitsProperty(p)}
            onDelete={(p) => deleteMut.mutate(p.id)}
            onPrint={(p) => navigate(`${basePath}/${p.id}/print`)}
            isAdmin={isAdmin}
          />
        ) : (
          <InventoryGrid
            properties={properties}
            totalPages={pagination.totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            isLoading={isLoading}
            onView={handleViewProperty}
            onEdit={handleOpenEdit}
            onManageUnits={(p) => setUnitsProperty(p)}
            onDelete={(p) => deleteMut.mutate(p.id)}
            onPrint={(p) => navigate(`${basePath}/${p.id}/print`)}
            isAdmin={isAdmin}
          />
        )}
      </div>

      {/* Project Units Dialog (Quick action for Booking inventory) */}
      <ProjectUnitsDialog
        property={unitsProperty}
        isOpen={Boolean(unitsProperty)}
        setIsOpen={(open) => !open && setUnitsProperty(null)}
        masterData={masterData}
        onUnitsUpdated={() => {
          queryClient.invalidateQueries({ queryKey: ["inventoryProperties"] });
        }}
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default Inventory;
