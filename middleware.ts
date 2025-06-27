import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Allow access to protected routes
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/journal/:path*",
    "/chat/:path*",
    "/insights/:path*",
    "/settings/:path*",
    "/export/:path*",
    "/profile/:path*",
  ],
};
