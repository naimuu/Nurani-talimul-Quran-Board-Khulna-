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
    const products = await (prisma as any).storeProduct.findMany({
      orderBy: { createdAt: "desc" },
    });
    const cleanedProducts = products
      .filter((p: any) => p.visibility !== "archived")
      .map((p: any) => ({
        ...p,
        barcode: p.barcode?.startsWith('__NO_BARCODE_') ? '' : p.barcode
      }));
    return NextResponse.json(cleanedProducts);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { name, category, price, stock, unit, imageUrl, barcode, className, description, weight } = await request.json();
    
    // Convert to numbers safely
    const parsedPrice = Number(price);
    const parsedStock = Number(stock) || 0;
    const parsedWeight = weight !== undefined && weight !== null && !isNaN(Number(weight)) ? Number(weight) : 0.25;
    
    if (!name || !category || isNaN(parsedPrice)) {
      return NextResponse.json({ error: "Valid name, category, and price are required" }, { status: 400 });
    }
    
    const product = await (prisma as any).storeProduct.create({
      data: { 
        name, 
        category, 
        price: parsedPrice, 
        stock: parsedStock, 
        unit: unit || "টি",
        imageUrl: imageUrl || undefined,
        barcode: barcode?.trim() ? barcode.trim() : `__NO_BARCODE_${Date.now()}_${Math.random()}__`,
        className: className || undefined,
        description: description || undefined,
        weight: parsedWeight,
      },
    });
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}
