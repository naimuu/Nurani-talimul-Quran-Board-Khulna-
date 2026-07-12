import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import * as jose from "jose";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const page = await (prisma as any).pageContent.findUnique({
      where: { slug: params.slug },
    });

    if (!page) {
      return NextResponse.json({ content: null }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Failed to fetch page content:", error);
    return NextResponse.json(
      { error: "Failed to fetch page content" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
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

    // 2. Parse request body
    const { content } = await request.json();

    if (typeof content !== "string") {
      return NextResponse.json({ error: "Content must be a string" }, { status: 400 });
    }

    // 3. Upsert content
    const updatedPage = await (prisma as any).pageContent.upsert({
      where: { slug: params.slug },
      update: { content },
      create: { slug: params.slug, content },
    });

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error("Failed to update page content:", error);
    return NextResponse.json(
      { error: "Failed to update page content" },
      { status: 500 }
    );
  }
}
