import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth.config";

// Middleware runs on the Edge runtime, so it must stay free of Prisma / Node-only
// modules. We reuse the edge-safe `authConfig` (no DB imports) and add a
// Credentials provider definition with NO `authorize` body — the actual DB-backed
// authorize lives in `auth.ts` (Node runtime). This keeps the provider metadata
// available for token parsing without pulling Prisma into the edge bundle.
const { auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
    }),
  ],
});

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
