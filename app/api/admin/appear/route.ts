import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  clearAppearPhoto,
  getAppearPhoto,
  setAppearPhoto,
} from "@/lib/appear-store";

const MAX_DATA_URL_LENGTH = 1_500_000;

function requireAuth(request: NextRequest): NextResponse | null {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  const imageUrl = await getAppearPhoto();
  return NextResponse.json({ imageUrl });
}

export async function POST(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl : "";
    if (!imageUrl.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "A photo file is required" },
        { status: 400 }
      );
    }
    if (imageUrl.length > MAX_DATA_URL_LENGTH) {
      return NextResponse.json(
        { error: "Photo is too large. Use a smaller image." },
        { status: 400 }
      );
    }

    await setAppearPhoto(imageUrl);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/admin/appear error:", error);
    return NextResponse.json(
      { error: "Failed to save photo" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  await clearAppearPhoto();
  return NextResponse.json({ ok: true });
}
