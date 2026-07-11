import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Madrasa from "@/lib/models/Madrasa";
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

export async function GET() {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const madrasas = await Madrasa.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ madrasas });
  } catch (error) {
    console.error("Error fetching madrasas:", error);
    return NextResponse.json({ error: "Failed to fetch madrasas" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { madrasaId, isApproved } = await request.json();
    if (!madrasaId || typeof isApproved !== "boolean") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();
    const updated = await Madrasa.findByIdAndUpdate(
      madrasaId,
      { isApproved },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Madrasa not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Madrasa status updated", madrasa: updated });
  } catch (error) {
    console.error("Error updating madrasa:", error);
    return NextResponse.json({ error: "Failed to update madrasa" }, { status: 500 });
  }
}
