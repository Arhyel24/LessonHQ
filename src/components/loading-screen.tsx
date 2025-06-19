"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const LoadingScreen = ({
  message = "Loading...",
  className,
  size = "md",
}: LoadingScreenProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={cn(
        "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center",
        className
      )}
    >
      <div className="flex flex-col items-center space-y-4">
        <Loader2
          className={cn("animate-spin text-primary", sizeClasses[size])}
        />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

// Hook for managing loading state
export const useLoading = () => {
  const [isLoading, setIsLoading] = useState(false);

  const showLoading = () => setIsLoading(true);
  const hideLoading = () => setIsLoading(false);

  return { isLoading, showLoading, hideLoading };
};
