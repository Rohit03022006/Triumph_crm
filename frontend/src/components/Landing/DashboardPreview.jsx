import React from "react";
import { BarChart3, Users, Building2, TrendingUp } from "lucide-react";

const DashboardPreview = () => {
  const menuItems = [
    ["Dashboard", BarChart3],
    ["Leads", Users],
    ["Properties", Building2],
    ["Deals", TrendingUp],
  ];

  const stats = [
    ["Total Leads", "1,248", "+18.2%"],
    ["Properties", "586", "+12.5%"],
    ["Active Deals", "142", "+8.4%"],
    ["Revenue", "₹524K", "+21.6%"],
  ];

  const chartData = [35, 55, 42, 70, 50, 78, 64, 88, 72, 95, 82, 100];

  return (
    <div className="relative mx-auto mt-16 max-w-6xl pb-24">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        {/* Browser Header */}
        <div className="flex h-11 items-center gap-2 border-b border-border px-4">
          <span className="h-2.5 w-2.5 rounded-full bg-danger" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning" />
          <span className="h-2.5 w-2.5 rounded-full bg-success" />

          <div className="mx-auto hidden h-6 w-64 rounded-md bg-muted sm:block" />
        </div>

        <div className="grid min-h-110 grid-cols-[190px_1fr]">
          {/* Sidebar */}
          <aside className="hidden border-r border-sidebar-border bg-sidebar p-4 md:block">
            <div className="mb-8 flex items-center">
              <img
                src="/logo_main.png"
                alt="Triumph Estates"
                className="h-8 w-auto brightness-0 invert"
              />
            </div>

            <div className="space-y-1.5">
              {menuItems.map(([name, Icon], index) => (
                <div
                  key={name}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs ${
                    index === 0
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {name}
                </div>
              ))}
            </div>
          </aside>

          {/* Dashboard */}
          <main className="bg-muted p-5">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Executive Overview</h3>

                <p className="text-xs text-muted-foreground">
                  Welcome back, here's what's happening today.
                </p>
              </div>

              <div className="hidden rounded-lg border border-border bg-card px-3 py-2 text-xs sm:block">
                Last 30 Days
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {stats.map(([title, value, change]) => (
                <div
                  key={title}
                  className="rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                  <p className="text-[11px] text-muted-foreground">{title}</p>

                  <p className="mt-2 text-xl font-bold text-card-foreground">
                    {value}
                  </p>

                  <p className="mt-1 text-[10px] font-medium text-success">
                    {change}
                  </p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              {/* Sales Performance */}
              <div className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-sm font-semibold">Sales Performance</p>

                  <span className="text-xs text-muted-foreground">2026</span>
                </div>

                <div className="flex h-44 w-full items-end gap-2">
                  {chartData.map((height, index) => (
                    <div
                      key={index}
                      className="flex h-full min-w-0 flex-1 items-end"
                    >
                      <div
                        className="w-full rounded-t-md bg-primary transition-all"
                        style={{
                          height: `${height}%`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Lead Sources */}
              <div className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm">
                <p className="text-sm font-semibold">Lead Sources</p>

                <div className="mt-6 flex items-center justify-center">
                  <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-20 border-brand-soft">
                    <div className="absolute -inset-5 rotate-45 rounded-full border-20 border-primary border-b-transparent border-r-transparent" />

                    <div className="text-center">
                      <p className="text-xl font-bold">68%</p>

                      <p className="text-[10px] text-muted-foreground">
                        Conversion
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;
