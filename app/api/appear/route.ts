import { NextResponse } from "next/server";
import { getAppearPhoto } from "@/lib/appear-store";

export async function GET() {
  const photo = await getAppearPhoto();
  return NextResponse.json({ configured: Boolean(photo) });
}
