import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Edge-safe base config (no Prisma adapter / node-only modules at import time).
// The DB is imported lazily inside `authorize` so it only loads in the Node runtime.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        // Lazy import keeps this module Edge-safe (middleware never calls authorize).
        const { db } = await import("@/lib/db");
        const user = await db.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role?: "GUEST" | "CUSTOMER" | "ADMIN" | "SUPER_ADMIN" }).role ?? "CUSTOMER";
      }
      // Always refresh the role from the DB so admin grants/revocations take
      // effect immediately (without forcing the user to log out and back in).
      if (token.id) {
        try {
          const { db } = await import("@/lib/db");
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: { role: true },
          });
          if (dbUser) token.role = dbUser.role;
        } catch {
          // Keep the existing token role if the DB lookup fails.
        }
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
} satisfies NextAuthConfig;
