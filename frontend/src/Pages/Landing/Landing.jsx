import React from "react";
import { useQuery } from "@tanstack/react-query";

import LandingNavbar from "@/components/Landing/LandingNavbar";
import HeroSection from "@/components/Landing/HeroSection";
import DashboardPreview from "@/components/Landing/DashboardPreview";
import LandingFooter from "@/components/Landing/LandingFooter";

const fetchMe = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }

  const json = await response.json();

  return json.data;
};

const Landing = () => {
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    retry: false,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNavbar user={user} />

      <main>
        <HeroSection user={user} />

        <DashboardPreview />
      </main>

      <LandingFooter />
    </div>
  );
};

export default Landing;
