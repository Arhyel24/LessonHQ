import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    console.log("token:", token)
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
    const isVerificationPage = req.nextUrl.pathname === "/email-verification";

    // Allow access to auth pages only if not authenticated
    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return null;
    }

    // Protect admin routes
    if (isAdminRoute) {
      if (!isAuth || token.role !== "admin") {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }
      return null;
    }

    // Protect dashboard and other protected routes
    const protectedRoutes = [
      "/dashboard",
      "/courses",
      "/profile",
      "/referrals",
      "/earnings",
      "/support",
    ];
    const isProtectedRoute = protectedRoutes.some((route) =>
      req.nextUrl.pathname.startsWith(route)
    );

    if (isProtectedRoute) {
      if (!isAuth) {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }

      if (token.emailVerified === false && !isVerificationPage) {
        return NextResponse.redirect(new URL("/email-verification", req.url));
      }
    }

    return null;
  },
  {
    callbacks: {
      authorized: ({ req }) => {
        // Allow all API routes to be handled by individual route handlers
        if (req.nextUrl.pathname.startsWith("/api")) {
          return true;
        }

        // Let middleware handle auth logic
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public|$|^$).*)"],
};
