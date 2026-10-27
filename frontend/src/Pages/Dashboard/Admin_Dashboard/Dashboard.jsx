import React from "react";
import { useNavigate, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  Users,
  CheckCircle2,
  History,
  UserCog,
  ArrowRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardStats from "@/components/Dashboard_Mangement/DashboardStats";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const prefix = isAdmin ? "/admin" : "/executive";

  return (
    <div className="w-full max-w-full min-w-0 space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Operations Dashboard</span>
            <span>•</span>
            <span className="text-emerald-600 font-bold">Live System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real estate inventory status, customer pipeline metrics, and daily operations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={() => navigate(`${prefix}/leads`)}
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm h-10 px-4"
          >
            <Plus className="w-4 h-4 mr-1.5 text-primary" />
            Add Lead
          </Button>

          <Button
            onClick={() => navigate(`${prefix}/inventory/new`)}
            className="bg-primary hover:bg-brand-dark text-primary-foreground font-semibold text-xs sm:text-sm h-10 px-4 shadow-2xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Inventory
          </Button>
        </div>
      </div>

      {/* Dashboard KPI Stats */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Executive Overview
        </h3>
        <DashboardStats />
      </div>

      {/* Quick Access to Active Workspaces */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Quick Access Workspaces
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Inventory Card */}
          <div
            onClick={() => navigate(`${prefix}/inventory`)}
            className="group bg-white border border-border/70 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-primary/40 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors font-heading">
                Inventory Management
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Browse, search, and manage residential and commercial properties across all categories.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600 group-hover:text-emerald-700">
              <span>Open Inventory</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Leads Card */}
          <div
            onClick={() => navigate(`${prefix}/leads`)}
            className="group bg-white border border-border/70 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-primary/40 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors font-heading">
                Leads & Clients
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Track buyer and tenant inquiries, follow-up stages, and executive assignments.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-700">
              <span>View Leads</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Admin: Approvals / Review */}
          {isAdmin ? (
            <div
              onClick={() => navigate("/admin/approved")}
              className="group bg-white border border-border/70 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-primary/40 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-2xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors font-heading">
                  Approvals & Review
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Review property listings submitted by executives and approve them for publication.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-600 group-hover:text-amber-700">
                <span>Pending Reviews</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ) : (
            /* Executive: Reports */
            <div
              onClick={() => navigate(`${prefix}/reports`)}
              className="group bg-white border border-border/70 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-primary/40 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-purple/10 border border-purple/20 flex items-center justify-center text-purple shadow-2xs">
                  <History className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors font-heading">
                  Reports & Analytics
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Operational performance reports, conversion rates, and sales activity summaries.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple group-hover:text-purple/80">
                <span>View Reports</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
