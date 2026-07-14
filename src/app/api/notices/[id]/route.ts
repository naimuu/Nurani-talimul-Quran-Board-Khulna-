import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import * as jose from "jose";

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = cookies().get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "nurani_board_khulna_secret_key_2024");
      const { payload } = await jose.jwtVerify(token, secret);
      if (payload.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { title, content } = await request.json();
    if (!title || !content) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const notice = await (prisma as any).notice.update({
      where: { id: params.id },
      data: { title, content },
    });

    return NextResponse.json(notice);
  } catch (error) {
    console.error("Update notice error:", error);
    return NextResponse.json({ error: "Failed to update notice" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = cookies().get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "nurani_board_khulna_secret_key_2024");
      const { payload } = await jose.jwtVerify(token, secret);
      if (payload.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await (prisma as any).notice.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete notice error:", error);
    return NextResponse.json({ error: "Failed to delete notice" }, { status: 500 });
  }
}
