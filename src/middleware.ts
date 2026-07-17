import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export { auth as middleware };

export const config = {
  matcher: [
    // Protect dashboard & admin routes
    "/dashboard/:path*",
    "/admin/:path*",
    // API routes that require auth (except auth callbacks)
    "/api/account/:path*",
    "/api/cart/:path*",
    "/api/wishlist/:path*",
    "/api/orders/:path*",
    "/api/checkout/:path*",
    "/api/admin/:path*",
  ],
};
