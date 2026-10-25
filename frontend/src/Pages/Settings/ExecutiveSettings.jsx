import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router";
import SettingsHeader from "@/components/Settings_Management/SettingsHeader";
import ChangePasswordForm from "@/components/Settings_Management/ChangePasswordForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, User } from "lucide-react";

const fetchMe = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch user");
  return (await res.json()).data;
};

const ExecutiveSettings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user, isLoading } = useQuery({ queryKey: ["me"], queryFn: fetchMe });

  const isExecutive = user?.role === "EXECUTIVE" || location.pathname.startsWith("/executive");

  return (
    <div className="space-y-6">
      <SettingsHeader />

      {isExecutive ? (
        <Card className="border-border/60 shadow-sm max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Password Settings Restricted</CardTitle>
                <CardDescription>
                  Executive account security is managed by system administrators.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/40 p-4 rounded-lg border border-border/50 text-sm text-muted-foreground leading-relaxed">
              Executives are not permitted to change password settings. Only system administrators can change or reset passwords for executive accounts. If you require a password change, please contact your CRM administrator.
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Button
                onClick={() => navigate("/executive/profile")}
                className="bg-primary hover:bg-brand-dark text-primary-foreground flex items-center gap-2"
              >
                <User className="w-4 h-4" /> Go to My Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ChangePasswordForm />
      )}
    </div>
  );
};

export default ExecutiveSettings;
