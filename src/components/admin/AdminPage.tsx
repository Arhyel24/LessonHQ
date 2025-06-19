"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminDashboardHome } from "@/components/admin/AdminDashboardHome";
import { CoursesManagement } from "@/components/admin/CoursesManagement";
import { UsersManagement } from "@/components/admin/UsersManagement";
import { EnrollmentsManagement } from "@/components/admin/EnrollmentsManagement";
import { StudentProgress } from "@/components/admin/StudentProgress";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AddCoursePage } from "@/components/admin/AddCoursePage";
import { CouponManagement } from "@/components/admin/CouponManagement";

export type AdminSection =
  | "dashboard"
  | "courses"
  | "users"
  | "enrollments"
  | "progress"
  | "analytics"
  | "add-course"
  | "coupons";

const validSections: AdminSection[] = [
  "dashboard",
  "courses",
  "users",
  "enrollments",
  "progress",
  "analytics",
  "add-course",
  "coupons",
];

const AdminPage = () => {
  const searchParams = useSearchParams();

  const sectionFromURL = searchParams.get("section") as AdminSection;
  const isValidSection = validSections.includes(sectionFromURL);
  const initialSection = isValidSection ? sectionFromURL : "dashboard";

  const [activeSection, setActiveSection] =
    useState<AdminSection>(initialSection);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Update URL when section changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("section", activeSection);
    const newURL = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newURL);
  }, [activeSection]);

  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <AdminDashboardHome />;
      case "courses":
        return (
          <CoursesManagement
            onNavigateToAddCourse={() => setActiveSection("add-course")}
          />
        );
      case "add-course":
        return <AddCoursePage onBack={() => setActiveSection("courses")} />;
      case "users":
        return <UsersManagement />;
      case "enrollments":
        return <EnrollmentsManagement />;
      case "progress":
        return <StudentProgress />;
      case "analytics":
        return <AdminAnalytics />;
      case "coupons":
        return <CouponManagement />;
      default:
        return <AdminDashboardHome />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        <AdminHeader
          onMobileMenuToggle={() =>
            setIsMobileSidebarOpen(!isMobileSidebarOpen)
          }
        />
        <main className="flex-1 p-4 md:p-6 mt-16 overflow-auto">
          <div className="max-w-full">{renderActiveSection()}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
