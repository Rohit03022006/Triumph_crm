import React from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const LandingNavbar = ({ user }) => {
  return (
    <header className="absolute left-0 right-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-5 pt-5 lg:px-8">
        <div className="flex h-16 items-center rounded-xl border border-border bg-card px-5 shadow-sm">
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <img
              src="/logo_main.png"
              alt="Triumph Estates"
              className="h-9 w-auto object-contain"
            />
          </Link>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <Link to="/dashboard">
                <Button className="rounded-lg bg-primary px-5 text-primary-foreground hover:bg-brand-dark">
                  Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button className="rounded-lg bg-primary px-5 text-primary-foreground hover:bg-brand-dark">
                    Log in
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingNavbar;
