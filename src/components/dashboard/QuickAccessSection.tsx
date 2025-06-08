"use client";

import { Button } from "@/components/ui/button";
import { BookOpen, User, Headphones, Settings } from "lucide-react";
import Link from "next/link";

export const QuickAccessSection = () => {
  const quickActions = [
    {
      icon: BookOpen,
      label: "All Courses",
      description: "Browse available courses",
      color: "bg-primary/10 text-primary",
      href: "/courses",
    },
    {
      icon: User,
      label: "Profile",
      description: "Manage your account",
      color: "bg-green-100 text-green-600",
      href: "/profile",
    },
    {
      icon: Headphones,
      label: "Support",
      description: "Get help & contact us",
      color: "bg-purple-100 text-purple-600",
      href: "/support",
    },
    {
      icon: Settings,
      label: "Settings",
      description: "Customize your experience",
      color: "bg-gray-100 text-gray-600",
      href: "/settings",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="font-poppins font-semibold text-xl text-gray-900 mb-6">
        Quick Access
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link key={action.label} href={action.href}>
            <Button
              type="button"
              variant="outline"
              className="h-auto p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow w-full"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${action.color}`}
              >
                <action.icon className="w-6 h-6" />
              </div>
              <span className="font-inter font-medium text-gray-900 text-sm mb-1 break-words">
                {action.label}
              </span>
              <span className="font-nunito text-xs text-gray-500 text-center leading-tight">
                {action.description}
              </span>
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
};
