import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import * as jose from "jose";

export const dynamic = 'force-dynamic';

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
    const sales = await (prisma as any).storeSale.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: true } },
        payments: true,
      },
    });
    return NextResponse.json(sales);
  } catch (error) {
    console.error("Failed to fetch sales:", error);
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { customerName, customerPhone, instituteId, items, notes, discount = 0, paidAmount = 0, promiseDate, paymentMethod = "Cash", deliveryCharge = 0, courierName = "পাঠাও কুরিয়ার", totalWeight = 0 } = await request.json();
    if (!customerName || !items || items.length === 0) {
      return NextResponse.json({ error: "customerName and items are required" }, { status: 400 });
    }

    // Calculate total
    let subtotal = 0;
    for (const item of items) {
      const product = await (prisma as any).storeProduct.findUnique({ where: { id: item.productId } });
      if (!product) return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 404 });
      subtotal += product.price * item.quantity;
    }
    
    const totalAmount = Math.max(0, subtotal - discount) + (Number(deliveryCharge) || 0);
    const status = paidAmount >= totalAmount ? "Paid" : paidAmount > 0 ? "Partial" : "Pending";

    // Generate invoice ID
    const count = await (prisma as any).storeSale.count();
    const invoiceId = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    const sale = await (prisma as any).storeSale.create({
      data: {
        invoiceId,
        customerName,
        customerPhone: customerPhone || null,
        instituteId: instituteId || null,
        totalAmount,
        paidAmount,
        discount,
        deliveryCharge: Number(deliveryCharge) || 0,
        courierName: courierName || "পাঠাও কুরিয়ার",
        totalWeight: Number(totalWeight) || 0,
        status,
        promiseDate: promiseDate ? new Date(promiseDate) : null,
        notes: notes || "",
        items: {
          create: await Promise.all(items.map(async (item: { productId: string; quantity: number }) => {
            const product = await (prisma as any).storeProduct.findUnique({ where: { id: item.productId } });
            // Deduct stock
            await (prisma as any).storeProduct.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            });
            return { productId: item.productId, quantity: item.quantity, unitPrice: product.price };
          })),
        },
      },
      include: { items: { include: { product: true } }, payments: true },
    });

    if (paidAmount > 0) {
      await (prisma as any).storePayment.create({
        data: {
          saleId: sale.id,
          payer: customerName,
          purpose: `Payment for Invoice ${invoiceId}`,
          amount: paidAmount,
          method: paymentMethod,
          status: "Completed",
          notes: notes || "",
        },
      });
    }

    return NextResponse.json(sale);
  } catch (error) {
    console.error("Failed to create sale:", error);
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 });
  }
}
