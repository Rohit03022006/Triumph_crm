import React from "react";
import { Link } from "react-router";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = ({ user }) => {
  return (
    <section id="home" className="relative overflow-hidden bg-background pt-36">
      {/* Background Decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-40 h-96 w-96 rounded-full bg-brand-soft/40 blur-3xl" />

        <div className="absolute -right-32 top-20 h-96 w-96 rounded-full bg-brand-soft/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        {/* Hero Content */}
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-heading text-5xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Manage your real estate
            <br />
            business with <span className="text-primary">clarity.</span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Manage leads, properties, clients and deals from one powerful
            platform. Everything your real estate team needs to grow faster.
          </p>

          {/* CTA */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to={user ? "/dashboard" : "/login"}>
              <Button
                size="lg"
                className="h-12 rounded-lg bg-primary px-7 text-base text-primary-foreground shadow-sm hover:bg-brand-dark"
              >
                {user ? "Go to Dashboard" : "Get Started Now"}

                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <button
              type="button"
              className="flex h-12 items-center gap-2 rounded-lg px-5 text-sm font-medium border border-muted-2  transition-colors bg-muted  text-foreground"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card">
                <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
              </span>
              Watch Overview
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
