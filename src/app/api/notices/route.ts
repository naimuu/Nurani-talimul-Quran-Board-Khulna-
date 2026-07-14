import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import * as jose from "jose";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const notices = await (prisma as any).notice.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(notices);
  } catch (error) {
    console.error("Failed to fetch notices:", error);
    return NextResponse.json({ error: "Failed to fetch notices" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 1. Verify Authentication (Must be ADMIN)
    const token = cookies().get("auth_token")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "nurani_board_khulna_secret_key_2024");
      const { payload } = await jose.jwtVerify(token, secret);
      
      if (payload.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
      }
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 2. Extract Data
    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    // 3. Create Notice
    const notice = await (prisma as any).notice.create({
      data: {
        title,
        content,
        isPublic: true,
      },
    });

    return NextResponse.json(notice);
  } catch (error) {
    console.error("Failed to create notice:", error);
    return NextResponse.json({ error: "Failed to create notice" }, { status: 500 });
  }
}
