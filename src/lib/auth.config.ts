import type { NextAuthConfig } from "next-auth";

// Edge-safe base config. This module is imported by `middleware.ts`, which runs
// on the Edge runtime where Prisma / Node-only modules (bcrypt, pg) cannot run.
// Therefore it must NOT import `@/lib/db`, `bcryptjs`, or the Credentials
// provider. The DB-backed `authorize` and JWT role-refresh live in `auth.ts`
// (Node runtime only).
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role?: "GUEST" | "CUSTOMER" | "ADMIN" | "SUPER_ADMIN" }).role ?? "CUSTOMER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "GUEST" | "CUSTOMER" | "ADMIN" | "SUPER_ADMIN") ?? "CUSTOMER";
      }
      return session;
    },
  },
} satisfies Omit<NextAuthConfig, "providers">;
