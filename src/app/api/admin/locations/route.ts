import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Location from "@/lib/models/Location";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "nurani_board_khulna_secret_key_2024"
);

async function checkAdmin() {
  const token = cookies().get("auth_token")?.value;
  if (!token) return false;

  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    if (verified.payload.role !== "ADMIN") return false;
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    const type = searchParams.get('type');
    
    const query: any = {};
    if (parentId !== null) {
      query.parentId = parentId === 'null' ? null : parentId;
    }
    if (type) {
      query.type = type;
    }

    await connectDB();
    const locations = await Location.find(query).sort({ name: 1 }).lean();
    return NextResponse.json({ locations });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    await connectDB();

    // Check if bulk insertion
    if (body.locations && Array.isArray(body.locations)) {
      const { type, parentId } = body;
      if (!type) return NextResponse.json({ error: "Missing type for bulk insert" }, { status: 400 });
      
      const toInsert = body.locations.map((loc: any) => ({
        name: loc.name,
        bn_name: loc.bn_name,
        type,
        parentId: parentId || null
      }));

      const newLocations = await Location.insertMany(toInsert);
      return NextResponse.json({ message: "Locations added", locations: newLocations }, { status: 201 });
    }

    // Single insertion
    const { name, bn_name, type, parentId } = body;
    
    if (!name || !bn_name || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newLocation = await Location.create({
      name,
      bn_name,
      type,
      parentId: parentId || null
    });

    return NextResponse.json({ message: "Location added", location: newLocation }, { status: 201 });
  } catch (error) {
    console.error("Error creating location:", error);
    return NextResponse.json({ error: "Failed to add location" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await connectDB();
    // Recursively deleting children could be complex. For safety, just delete one if it has no children.
    const hasChildren = await Location.exists({ parentId: id });
    if (hasChildren) {
      return NextResponse.json({ error: "Cannot delete location with nested sub-locations" }, { status: 400 });
    }

    await Location.findByIdAndDelete(id);
    return NextResponse.json({ message: "Location deleted" });
  } catch (error) {
    console.error("Error deleting location:", error);
    return NextResponse.json({ error: "Failed to delete location" }, { status: 500 });
  }
}
