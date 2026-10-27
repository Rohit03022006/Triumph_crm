import React from "react";
import { Link, useLocation } from "react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import {
  LayoutDashboard,
  Users,
  Building,
  BarChart3,
  UserCog,
  Settings,
  CheckCircle,
  Logs as LogsIcon,
} from "lucide-react";

const getNavItems = (role) => {
  const prefix = role === "ADMIN" ? "/admin" : "/executive";

  if (role === "ADMIN") {
    return [
      {
        title: "Dashboard",
        url: prefix,
        icon: LayoutDashboard,
      },
      {
        title: "Leads",
        url: `${prefix}/leads`,
        icon: Users,
      },
      {
        title: "Inventory",
        url: `${prefix}/inventory`,
        icon: Building,
      },
      {
        title: "Approved",
        url: `${prefix}/approved`,
        icon: CheckCircle,
      },
      {
        title: "Reports",
        url: `${prefix}/reports`,
        icon: BarChart3,
      },
      {
        title: "Users Management",
        url: `${prefix}/users`,
        icon: UserCog,
      },
      {
        title: "Resources",
        url: `${prefix}/resources`,
        icon: Settings,
      },
      {
        title: "Logs",
        url: `${prefix}/logs`,
        icon: LogsIcon,
      },
    ];
  }

  // Executive Nav Items
  return [
    {
      title: "Dashboard",
      url: prefix,
      icon: LayoutDashboard,
    },
    {
      title: "Leads",
      url: `${prefix}/leads`,
      icon: Users,
    },
    {
      title: "Inventory",
      url: `${prefix}/inventory`,
      icon: Building,
    },
    {
      title: "Reports",
      url: `${prefix}/reports`,
      icon: BarChart3,
    },
  ];
};

export function AppSidebar({ role = "EXECUTIVE" }) {
  const location = useLocation();
  const navItems = getNavItems(role);

  const prefix = role === "ADMIN" ? "/admin" : "/executive";

  return (
    <Sidebar collapsible="icon">
      {/* Header */}
      <SidebarHeader className="px-3 py-3">
        <div className="flex min-h-10 items-center justify-between gap-2">
          <Link
            to="/"
            className="flex min-w-0 flex-1 items-center overflow-hidden group-data-[collapsible=icon]:hidden"
          >
            <img
              src="/logo_main.png"
              alt="Triumph Estates"
              className="block h-auto w-full max-w-[180px]  brightness-0  invert object-contain"
            />
          </Link>

          <SidebarTrigger className="shrink-0" />
        </div>
      </SidebarHeader>

      {/* Sidebar Navigation */}
      <SidebarContent className="px-2">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="mb-2 px-3 group-data-[collapsible=icon]:hidden">
            Main Menu
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="gap-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;

                const isActive =
                  location.pathname === item.url ||
                  (item.url !== prefix &&
                    location.pathname.startsWith(`${item.url}/`));

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className="
                        h-12
                        w-full
                        rounded-md
                        px-3
                        text-xl
                        font-semibold

                        group-data-[collapsible=icon]:!size-12
                        group-data-[collapsible=icon]:!min-h-12
                        group-data-[collapsible=icon]:!p-0

                        group-data-[collapsible=icon]:[&>a]:!flex
                        group-data-[collapsible=icon]:[&>a]:!h-full
                        group-data-[collapsible=icon]:[&>a]:!w-full
                        group-data-[collapsible=icon]:[&>a]:!items-center
                        group-data-[collapsible=icon]:[&>a]:!justify-center

                        [&_svg]:!size-6
                        [&_svg]:shrink-0
                      "
                    >
                      <Link
                        to={item.url}
                        className="
                          flex
                          h-full
                          w-full
                          min-w-0
                          items-center
                          gap-3

                          group-data-[collapsible=icon]:!justify-center
                          group-data-[collapsible=icon]:!gap-0
                        "
                      >
                        {/* Navigation Icon */}
                        <Icon className="!size-6 shrink-0" />

                        {/* Navigation Label */}
                        <span className="truncate text-xl font-semibold group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-3 py-3 group-data-[collapsible=icon]:hidden">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Triumph CRM
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
