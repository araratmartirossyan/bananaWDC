import { NextResponse } from "next/server";
import { getVisibleFilters } from "@/lib/filters-store";

export async function GET() {
  try {
    const filters = await getVisibleFilters();
    return NextResponse.json({ filters });
  } catch (error) {
    console.error("GET /api/filters error:", error);
    return NextResponse.json(
      { error: "Failed to load filters" },
      { status: 500 }
    );
  }
}
