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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const product = await (prisma as any).storeProduct.findUnique({ where: { id: params.id } });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("GET Product Error:", error);
    return NextResponse.json({ error: "Failed to fetch product", details: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.category !== undefined) data.category = body.category;
    
    if (body.price !== undefined) {
      const parsedPrice = Number(body.price);
      if (isNaN(parsedPrice)) return NextResponse.json({ error: "Valid price is required" }, { status: 400 });
      data.price = parsedPrice;
    }
    
    if (body.stock !== undefined) {
      data.stock = Number(body.stock) || 0;
    }
    
    if (body.unit !== undefined) data.unit = body.unit;
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl;
    if (body.barcode !== undefined) {
      data.barcode = body.barcode?.trim() ? body.barcode.trim() : `__NO_BARCODE_${Date.now()}_${Math.random()}__`;
    }
    if (body.className !== undefined) data.className = body.className;
    if (body.description !== undefined) data.description = body.description;
    if (body.weight !== undefined) {
      data.weight = body.weight !== null && !isNaN(Number(body.weight)) ? Number(body.weight) : 0.25;
    }
    const product = await (prisma as any).storeProduct.update({ where: { id: params.id }, data });
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("PUT Product Error:", error);
    require('fs').writeFileSync('prisma_error.txt', String(error) + '\n' + (error.stack || '') + '\n' + JSON.stringify(error));
    return NextResponse.json({ error: "Failed to update product", details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    const saleItemCount = await (prisma as any).storeSaleItem.count({
      where: { productId: params.id },
    });

    if (saleItemCount > 0 && !force) {
      // Product has existing sales/invoices history.
      // Soft-delete/archive it to preserve referential integrity for invoices and history.
      await (prisma as any).storeProduct.update({
        where: { id: params.id },
        data: { visibility: "archived", stock: 0 },
      });
      return NextResponse.json({ success: true, message: "পণ্যটি সফলভাবে মুছে ফেলা হয়েছে" });
    }

    // If force is requested and sale items exist, remove them first
    if (saleItemCount > 0 && force) {
      await (prisma as any).storeSaleItem.deleteMany({
        where: { productId: params.id },
      });
    }

    // Delete associated stock history
    await (prisma as any).stockHistory.deleteMany({
      where: { productId: params.id },
    });

    // Delete the product
    await (prisma as any).storeProduct.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "পণ্যটি সফলভাবে মুছে ফেলা হয়েছে" });
  } catch (error: any) {
    console.error("DELETE Product Error:", error);
    return NextResponse.json({ error: "পণ্যটি মুছতে ব্যর্থ হয়েছে", details: error.message }, { status: 500 });
  }
}

