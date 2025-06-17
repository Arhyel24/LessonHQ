import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, LogOut, Menu } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

interface AdminHeaderProps {
  onMobileMenuToggle: () => void;
}

export const AdminHeader = ({ onMobileMenuToggle }: AdminHeaderProps) => {
  const { data: session } = useSession();

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 bg-white border-b shadow-sm z-30">
      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMobileMenuToggle}
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Admin Dashboard
            </h2>
            <p className="text-sm text-gray-600 hidden sm:block">
              Manage your e-learning platform
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Back to home link */}
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Back to home
          </Link>

          {/* Notification button */}
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>

          {/* User profile section */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8 md:h-10 md:w-10">
              <AvatarImage
                src={session?.user?.image || ""}
                alt="User avatar"
              />
              <AvatarFallback>
                {session?.user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "AD"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-gray-900">
                {session?.user?.name || "Admin User"}
              </p>
              <p className="text-xs text-gray-600">
                {session?.user?.email || "admin@example.com"}
              </p>
            </div>
          </div>

          {/* Sign out button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut()}
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
