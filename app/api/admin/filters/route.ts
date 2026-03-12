import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getFilters,
  setFilters,
  type StoredFilter,
} from "@/lib/filters-store";

function requireAuth(request: NextRequest): NextResponse | null {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  try {
    const filters = await getFilters();
    return NextResponse.json({ filters });
  } catch (error) {
    console.error("GET /api/admin/filters error:", error);
    return NextResponse.json(
      { error: "Failed to load filters" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const id =
      typeof body.id === "string" ? body.id.trim().toLowerCase().replace(/\s+/g, "_") : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const prompt = typeof body.prompt === "string" ? body.prompt : "";
    const visible = typeof body.visible === "boolean" ? body.visible : true;

    if (!id || !name) {
      return NextResponse.json(
        { error: "id and name are required" },
        { status: 400 }
      );
    }

    const filters = await getFilters();
    if (filters.some((f) => f.id === id)) {
      return NextResponse.json(
        { error: "Filter with this id already exists" },
        { status: 400 }
      );
    }

    const newFilter: StoredFilter = {
      id,
      name,
      description: description || name,
      prompt,
      visible,
    };
    filters.push(newFilter);
    await setFilters(filters);
    return NextResponse.json({ filter: newFilter });
  } catch (error) {
    console.error("POST /api/admin/filters error:", error);
    return NextResponse.json(
      { error: "Failed to create filter" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const filters = await getFilters();
    const index = filters.findIndex((f) => f.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: "Filter not found" },
        { status: 404 }
      );
    }

    const current = filters[index];
    if (typeof body.name === "string") current.name = body.name.trim();
    if (typeof body.description === "string") current.description = body.description.trim();
    if (typeof body.prompt === "string") current.prompt = body.prompt;
    if (typeof body.visible === "boolean") current.visible = body.visible;

    await setFilters(filters);
    return NextResponse.json({ filter: current });
  } catch (error) {
    console.error("PATCH /api/admin/filters error:", error);
    return NextResponse.json(
      { error: "Failed to update filter" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }
    if (id === "none") {
      return NextResponse.json(
        { error: "Cannot delete the Original (none) filter" },
        { status: 400 }
      );
    }

    const filters = await getFilters();
    const filtered = filters.filter((f) => f.id !== id);
    if (filtered.length === filters.length) {
      return NextResponse.json(
        { error: "Filter not found" },
        { status: 404 }
      );
    }
    await setFilters(filtered);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/filters error:", error);
    return NextResponse.json(
      { error: "Failed to delete filter" },
      { status: 500 }
    );
  }
}
