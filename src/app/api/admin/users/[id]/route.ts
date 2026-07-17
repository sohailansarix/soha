import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/constants";
import type { Role } from "@prisma/client";

const schema = z.object({
  role: z.enum(["GUEST", "CUSTOMER", "ADMIN", "SUPER_ADMIN"]),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  // Only SUPER_ADMIN can change roles (prevents privilege escalation).
  if (!hasRole(session?.user?.role, "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  // Prevent a SUPER_ADMIN from demoting themselves (avoids locking out the last admin).
  if (id === session!.user.id && parsed.data.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "You cannot change your own role" }, { status: 400 });
  }

  const user = await db.user.update({
    where: { id },
    data: { role: parsed.data.role as Role },
  });

  await db.auditLog
    .create({
      data: {
        userId: session!.user.id,
        action: "USER_ROLE_CHANGE",
        entity: "User",
        entityId: user.id,
        metadata: { role: user.role },
      },
    })
    .catch(() => null);

  return NextResponse.json({ ok: true, role: user.role });
}
