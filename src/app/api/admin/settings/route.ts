import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/constants";
import { SETTING_KEYS } from "@/lib/store-settings";

export async function GET() {
  const rows = await db.setting.findMany({ where: { key: { in: Object.values(SETTING_KEYS) } } });
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return NextResponse.json({
    standardShippingFee: map.get(SETTING_KEYS.standardFee) ?? "",
    expressShippingFee: map.get(SETTING_KEYS.expressFee) ?? "",
    sameDayShippingFee: map.get(SETTING_KEYS.sameDayFee) ?? "",
    taxRate: map.get(SETTING_KEYS.taxRate) ?? "",
  });
}

const schema = z.object({
  standardShippingFee: z.coerce.number().min(0),
  expressShippingFee: z.coerce.number().min(0),
  sameDayShippingFee: z.coerce.number().min(0),
  taxRate: z.coerce.number().min(0).max(1),
});

export async function PUT(req: Request) {
  const session = await auth();
  if (!hasRole(session?.user?.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const values: Record<string, string> = {
    [SETTING_KEYS.standardFee]: String(parsed.data.standardShippingFee),
    [SETTING_KEYS.expressFee]: String(parsed.data.expressShippingFee),
    [SETTING_KEYS.sameDayFee]: String(parsed.data.sameDayShippingFee),
    [SETTING_KEYS.taxRate]: String(parsed.data.taxRate),
  };
  await db.$transaction(
    Object.entries(values).map(([key, value]) =>
      db.setting.upsert({ where: { key }, create: { key, value }, update: { value } }),
    ),
  );
  return NextResponse.json({ ok: true });
}
