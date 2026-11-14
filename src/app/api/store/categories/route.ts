import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import * as jose from "jose";

const prisma = new PrismaClient();

async function verifyAdmin() {
  const token = cookies().get("auth_token")?.value;
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "nurani_board_khulna_secret_key_2024");
    const { payload } = await jose.jwtVerify(token, secret);
    return payload.role === "ADMIN";
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const categories = await (prisma as any).storeCategory.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { name, isClassWise, subTabs } = await request.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    
    // Check if exists
    const existing = await (prisma as any).storeCategory.findUnique({ where: { name } });
    if (existing) return NextResponse.json({ error: "Category already exists" }, { status: 400 });

    const category = await (prisma as any).storeCategory.create({
      data: { 
        name: name.trim(), 
        isClassWise: !!isClassWise,
        subTabs: Array.isArray(subTabs) ? subTabs.map((s: string) => s.trim()).filter(Boolean) : []
      },
    });
    return NextResponse.json(category);
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id, name, isClassWise, subTabs } = await request.json();
    if (!id) return NextResponse.json({ error: "Category ID is required" }, { status: 400 });

    const updateData: any = {};
    if (typeof name === "string" && name.trim()) updateData.name = name.trim();
    if (isClassWise !== undefined) updateData.isClassWise = Boolean(isClassWise);
    if (Array.isArray(subTabs)) {
      updateData.subTabs = subTabs.map((s: string) => String(s).trim()).filter(Boolean);
    }

    const updated = await (prisma as any).storeCategory.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update category:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Category ID is required" }, { status: 400 });

    await (prisma as any).storeCategory.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete category:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
