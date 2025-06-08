"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Courses", href: "/courses" },
  { name: "Earnings", href: "/earnings" },
  { name: "Support", href: "/support" },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const hideHeaderRoutes = ["/auth/signin", "/auth/signup", "/lesson", "/help"];
  const shouldHideHeader = hideHeaderRoutes.some((route) =>
    pathname.includes(route)
  );

  if (shouldHideHeader) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo - Left Side */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
            <span className="font-bold text-primary-foreground">MIC</span>
          </div>
          <span className="hidden font-bold text-xl text-gray-900 md:inline-flex">
            Massive Income Course
          </span>
        </Link>

        {/* Desktop Navigation - Center */}
        <nav className="hidden md:flex items-center gap-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href
                  ? "text-primary"
                  : "text-gray-800"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* User Menu - Right Side */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full border"
              >
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-muted">AD</AvatarFallback>
                </Avatar>
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">Ada</p>
                  <p className="text-xs text-muted-foreground">
                    ada@example.com
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/logout">Log out</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu - Right Side */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open mobile menu"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex flex-col gap-6 pl-4 pr-0 sm:max-w-xs"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2 pt-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
                    <span className="font-bold text-primary-foreground">
                      MIC
                    </span>
                  </div>
                  <span className="font-bold text-lg">
                    MIC
                  </span>
                </div>
              </div>
              <nav className="flex flex-col gap-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "text-base font-medium transition-colors hover:text-primary",
                      pathname === item.href
                        ? "text-primary"
                        : "text-gray-800"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="border-t pt-4 mt-4">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 text-gray-800 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <Link
                    href="/logout"
                    className="flex items-center gap-2 mt-4 text-gray-800 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Log out
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
