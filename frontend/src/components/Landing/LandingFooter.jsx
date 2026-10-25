import React from "react";

const LandingFooter = () => {
  return (
    <footer className="border-t border-border ">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div className="flex items-center">
          <img
            src="/logo_main.png"
            alt="Triumph Estates"
            className="h-10 w-auto"
          />
        </div>

        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Triumph Estates. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default LandingFooter;
