import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/constants";
import { isCloudinaryConfigured, uploadImage } from "@/lib/cloudinary";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  const session = await auth();
  if (!hasRole(session?.user?.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isCloudinaryConfigured) {
    return NextResponse.json(
      { error: "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET." },
      { status: 500 },
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const url = await uploadImage(buffer, file.name || "product");
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
