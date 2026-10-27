import { Bell, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const user = queryClient.getQueryData(["me"]);

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      queryClient.clear();
      navigate("/login");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="h-16 border-b bg-card w-full max-w-full min-w-0">
      <div className="flex h-full items-center justify-end px-4 sm:px-6 w-full max-w-full min-w-0">
        {/* Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Add Lead */}
          <Button className="h-9 bg-primary hover:bg-brand-dark text-primary-foreground text-xs sm:text-sm px-3 sm:px-4 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>

          {/* Add Inventory */}
          <Button className="h-9 bg-primary hover:bg-brand-dark text-primary-foreground text-xs sm:text-sm px-3 sm:px-4 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Inventory
          </Button>

          {/* Schedule Visit */}
          <Button className="h-9 bg-primary hover:bg-brand-dark text-primary-foreground text-xs sm:text-sm px-3 sm:px-4 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Schedule Visit
          </Button>

          {/* Notifications */}
          <Button
            variant="outline"
            size="icon"
            className="relative h-9 w-9 rounded-full shrink-0"
          >
            <Bell className="h-4 w-4" />

            {/* Notification Dot */}
            <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
          </Button>

          {/* User Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger className="ml-1 rounded-full outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring ">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.image} alt={user?.name || "User"} />

                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() =>
                    navigate(
                      user?.role === "ADMIN"
                        ? "/admin/profile"
                        : "/executive/profile",
                    )
                  }
                  className="cursor-pointer"
                >
                  Profile
                </DropdownMenuItem>

                {user?.role === "ADMIN" && (
                  <DropdownMenuItem
                    onClick={() => navigate("/admin/settings")}
                    className="cursor-pointer"
                  >
                    Settings
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
