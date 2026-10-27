import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to sign in");
      }

      if (data?.data?.user?.emailVerified === false) {
        throw new Error("Your account is pending admin approval. Please contact the administrator.");
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* LEFT SECTION */}
      <div className="flex min-h-screen items-center justify-center px-8 lg:px-16">
        <div className="w-full max-w-lg">
          {/* Logo */}

          <Link to="/" className="shrink-0">
            <div className="mb-8">
              <img
                src="/logo_main.png"
                alt="Triumph Estates"
                className="h-24 w-auto object-contain"
              />
            </div>
          </Link>

          {/* Main Text */}
          <div className="space-y-5">
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl font-heading text-slate-900">
              Admin & Executive
              <br />
              <span className="text-primary">CRM Portal</span>
            </h1>

            <p className="max-w-md text-base leading-7 text-slate-500">
              Manage your real estate operations, teams, leads, properties and
              business activities from one centralized platform.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION - LOGIN FORM */}
      <div className="flex min-h-screen items-center justify-center px-4 py-8 lg:px-16">
        <div className="w-full max-w-md">
          <Card className="border-border shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-center text-2xl font-semibold tracking-tight">
                Welcome back
              </CardTitle>

              <CardDescription className="text-center">
                Enter your email and password to access your account
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pb-5">
                {/* Error */}
                {error && (
                  <div className="rounded-md bg-destructive/15 p-3 text-center text-sm font-medium text-destructive">
                    {error}
                  </div>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>

                  <Input
                    id="email"
                    type="email"
                    placeholder="name@triumph.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>

                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Password Input + Eye */}
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      placeholder={
                        showPassword ? "Enter your password" : "**********"
                      }
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pr-10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={isLoading}
                      className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Don't have an account? <span className="font-medium text-primary underline">Contact Admin</span>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
