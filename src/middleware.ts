import { withAuth } from "next-auth/middleware";
import { NextRequest } from "next/server";

export const middleware = withAuth(
  function onSuccess(req: NextRequest) {
    return;
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized: ({ token }) => {
        // Only allow if user is authenticated
        return !!token;
      },
    },
  }
);

// Protect these routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/trip/:path*",
    "/profile/:path*",
    "/api/trips/:path*",
    "/create-trip/:path*",
    "/settings/:path*",
    "/notifications/:path*",
    "/onboarding/:path*",
  ],
};
