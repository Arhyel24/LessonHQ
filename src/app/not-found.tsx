"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, LayoutDashboard, ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const NotFound = () => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      pathname
    );
  }, [pathname]);

  const handleGoHome = () => {
    router.push("/");
  };

  const handleGoDashboard = () => {
    router.push("/dashboard");
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Animated 404 Text */}
        <div className="relative mb-8">
          <h1 className="text-9xl md:text-[12rem] font-bold text-gray-200 animate-fade-in select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-primary/10 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="animate-slide-in space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Oops! Page not found
            </h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved to another location.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button
              onClick={handleGoHome}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Button>

            <Button
              onClick={handleGoDashboard}
              variant="outline"
              className="w-full sm:w-auto border-2 border-primary text-primary hover:bg-primary hover:text-white px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>

            <Button
              onClick={handleGoBack}
              variant="ghost"
              className="w-full sm:w-auto text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 animate-fade-in"
              style={{ animationDelay: "0.6s" }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-accent rounded-full animate-ping"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/4 w-3 h-3 bg-primary/30 rounded-full animate-ping"
          style={{ animationDelay: "1.5s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-accent/50 rounded-full animate-ping"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>
    </div>
  );
};

export default NotFound;
