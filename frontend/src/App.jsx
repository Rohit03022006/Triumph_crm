import React from 'react'
import { Routes, Route, Outlet, useLocation } from 'react-router'
import Header from './components/Common/Header'
import { SidebarProvider, SidebarInset, SidebarTrigger } from './components/ui/sidebar'
import { AppSidebar } from './components/Common/AppSidebar'

// Import Pages
import Dashboard from './Pages/Dashboard/Admin_Dashboard/Dashboard'
import Leads from './Pages/Leads/Leads'
import Inventory from './Pages/Inventory/Inventory'
import Reports from './Pages/Reports/Reports'
import Approved from './Pages/Dashboard/Approved_Dashboard/Approved'
import Executives from './Pages/Executives_Management/Executives'
import UserDetail from './Pages/Executives_Management/UserDetail'
import Settings from './Pages/Settings/Settings'
import ExecutiveSettings from './Pages/Settings/ExecutiveSettings'
import Profile from './Pages/Profile/Profile'
import Login from './Pages/Auth/Login'
import ForgotPassword from './Pages/Auth/ForgotPassword'
import Landing from './Pages/Landing/Landing'

import RoleRedirect from './routes/RoleRedirect'
import GuestRoute from './routes/GuestRoute'

// Layout Component
const Layout = ({ role }) => {
  return (
    <RoleRedirect requireRole={role}>
      <SidebarProvider>
        <AppSidebar role={role} />
        <SidebarInset>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 p-5 space-y-2">
              <Outlet />
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RoleRedirect>
  )
}

// App Component with Routing
const App = () => {
  return (
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
        <Route path="reports" element={<Reports />} />
        <Route path="approved" element={<Approved />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<ExecutiveSettings />} />
      </Route>

      {/* Executive Routes */}
      <Route path="/executive" element={<Layout role="EXECUTIVE" />}>
        <Route index element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="reports" element={<Reports />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<ExecutiveSettings />} />
      </Route>

      {/* Legacy dashboard redirect handled by RoleRedirect inside a specific route? 
          Actually, we can just add a standard redirect here, or just wrap it. */}
      <Route path="/dashboard" element={<RoleRedirect />} />
    </Routes>
  )
}

export default App
