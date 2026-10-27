import React from "react";
import { Routes, Route, Outlet, useLocation } from "react-router";
import Header from "./components/Common/Header";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "./components/ui/sidebar";
import { AppSidebar } from "./components/Common/AppSidebar";

// Import Pages
import Dashboard from "./Pages/Dashboard/Admin_Dashboard/Dashboard";
import Leads from "./Pages/Leads/Leads";
import Inventory from "./Pages/Inventory/Inventory";
import PropertyDetailPage from "./Pages/Inventory/PropertyDetailPage";
import InventoryFormPage from "./Pages/Inventory/InventoryFormPage";
import PropertyPrintPage from "./Pages/Inventory/PropertyPrintPage";
import Logs from "./Pages/Dashboard/Logs_Dashboard/Logs";
import PropertyLogsPage from "./Pages/Dashboard/Logs_Dashboard/PropertyLogsPage";
import LeadsLogsPage from "./Pages/Dashboard/Logs_Dashboard/LeadsLogsPage";
import Reports from "./Pages/Reports/Reports";
import Approved from "./Pages/Dashboard/Approved_Dashboard/Approved";
import PropertyApprovedPage from "./Pages/Dashboard/Approved_Dashboard/PropertyApprovedPage";
import LeadsApprovedPage from "./Pages/Dashboard/Approved_Dashboard/LeadsApprovedPage";
import Executives from "./Pages/Executives_Management/Executives";
import UserDetail from "./Pages/Executives_Management/UserDetail";
import Settings from "./Pages/Settings/Settings";
import ExecutiveSettings from "./Pages/Settings/ExecutiveSettings";
import Profile from "./Pages/Profile/Profile";
import Login from "./Pages/Auth/Login";
import ForgotPassword from "./Pages/Auth/ForgotPassword";
import Landing from "./Pages/Landing/Landing";

import RoleRedirect from "./routes/RoleRedirect";
import GuestRoute from "./routes/GuestRoute";
import { Toaster } from "./components/ui/toast";

// Layout Component
const Layout = ({ role }) => {
  return (
    <RoleRedirect requireRole={role}>
      <SidebarProvider className="w-full max-w-full min-w-0 overflow-x-hidden">
        <AppSidebar role={role} />
        <SidebarInset className="w-full max-w-full min-w-0 overflow-x-hidden">
          <div className="flex flex-col min-h-screen w-full max-w-full min-w-0 overflow-x-hidden">
            <Header />
            <main className="flex-1 p-3 sm:p-5 space-y-4 w-full max-w-full min-w-0 overflow-x-hidden">
              <Outlet />
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RoleRedirect>
  );
};

// App Component with Routing
const App = () => {
  return (
    <>
      <Toaster />
      <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>
      {/* Admin Routes */}
      <Route path="/admin" element={<Layout role="ADMIN" />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Executives />} />
        <Route path="users/:id" element={<UserDetail />} />
        <Route path="resources" element={<Settings />} />
        <Route path="leads" element={<Leads />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="inventory/new" element={<InventoryFormPage />} />
        <Route path="inventory/add" element={<InventoryFormPage />} />
        <Route path="inventory/:id" element={<PropertyDetailPage />} />
        <Route path="inventory/:id/edit" element={<InventoryFormPage />} />
        <Route path="inventory/:id/print" element={<PropertyPrintPage />} />
        <Route path="logs" element={<Logs />} />
        <Route path="logs/properties" element={<PropertyLogsPage />} />
        <Route path="logs/property" element={<PropertyLogsPage />} />
        <Route path="logs/leads" element={<LeadsLogsPage />} />
        <Route path="reports" element={<Reports />} />
        <Route path="approved" element={<Approved />} />
        <Route path="approved/properties" element={<PropertyApprovedPage />} />
        <Route path="approved/property" element={<PropertyApprovedPage />} />
        <Route path="approved/leads" element={<LeadsApprovedPage />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<ExecutiveSettings />} />
      </Route>

      {/* Executive Routes */}
      <Route path="/executive" element={<Layout role="EXECUTIVE" />}>
        <Route index element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="inventory/new" element={<InventoryFormPage />} />
        <Route path="inventory/add" element={<InventoryFormPage />} />
        <Route path="inventory/:id" element={<PropertyDetailPage />} />
        <Route path="inventory/:id/edit" element={<InventoryFormPage />} />
        <Route path="inventory/:id/print" element={<PropertyPrintPage />} />
        <Route path="reports" element={<Reports />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<ExecutiveSettings />} />
      </Route>

      {/* Legacy dashboard redirect handled by RoleRedirect inside a specific route? 
          Actually, we can just add a standard redirect here, or just wrap it. */}
      <Route path="/dashboard" element={<RoleRedirect />} />
    </Routes>
    </>
  );
};

export default App;
