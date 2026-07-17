import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig } from "@/lib/auth.config";
import { db } from "@/lib/db";
import { hasRole } from "@/lib/constants";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
});

/** Convenience: returns the current session user or null. */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** Returns true if the current user meets the required role. */
export async function requireRole(role: Parameters<typeof hasRole>[1]) {
  const user = await getCurrentUser();
  return hasRole(user?.role, role);
}
