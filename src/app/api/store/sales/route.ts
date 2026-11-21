import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import * as jose from "jose";

export const dynamic = 'force-dynamic';

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

import connectDB from "@/lib/mongodb";
import Madrasa from "@/lib/models/Madrasa";
import { getEnrichedTimeline } from "@/lib/orderTimeline";
import { repairQuestionOrderSaleIfNeeded } from "@/lib/orderRepair";
import { generateUniqueInvoiceId } from "@/lib/invoiceHelper";

export async function GET() {
  try {
    let sales = await (prisma as any).storeSale.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: true } },
        payments: true,
      },
    });

    if (!Array.isArray(sales)) {
      return NextResponse.json([]);
    }

    try {
      await connectDB();
      const madrasas = await Madrasa.find({}, 'code name phone1 phone2 division district upazila union village addressDetails address').lean();
      
      const madrasaMap = new Map<string, any>();
      for (const m of madrasas) {
        if (m.code) madrasaMap.set(String(m.code).trim().toLowerCase(), m);
        if (m.name) madrasaMap.set(String(m.name).trim().toLowerCase(), m);
      }

      const repairedSales = await Promise.all(sales.map(async (sale: any) => {
        try {
          if (!sale.items || sale.items.length === 0 || sale.items.some((i: any) => !i.product?.name || i.product?.name === 'অর্ডারকৃত পণ্য')) {
            return await repairQuestionOrderSaleIfNeeded(sale, prisma);
          }
          return sale;
        } catch (repErr) {
          console.warn("Error during question order sale repair:", repErr);
          return sale;
        }
      }));

      const enrichedSales = repairedSales.map((sale: any) => {
        let geo: any = null;
        let phone = sale.customerPhone || "";
        if (sale.instituteId) {
          const matched = madrasaMap.get(String(sale.instituteId).trim().toLowerCase());
          if (matched) {
            geo = {
              division: matched.division || "",
              district: matched.district || "",
              upazila: matched.upazila || "",
              union: matched.union || "",
              village: matched.village || "",
              fullAddress: matched.addressDetails || matched.address || "",
            };
            if (!phone) {
              phone = matched.phone1 || matched.phone2 || "";
            }
          }
        }
        const timeline = getEnrichedTimeline(sale);
        return { ...sale, customerPhone: phone, geoAddress: geo, timeline };
      });
      return NextResponse.json(enrichedSales);
    } catch (mErr) {
      console.warn("Could not enrich sales with madrasa geo:", mErr);
      const enriched = sales.map((s: any) => ({ ...s, timeline: getEnrichedTimeline(s) }));
      return NextResponse.json(enriched);
    }
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

    // Generate guaranteed unique invoice ID (collision-proof against deleted orders)
    let invoiceId = await generateUniqueInvoiceId(prisma);

    const saleItemsData = await Promise.all(items.map(async (item: { productId: string; quantity: number }) => {
      const product = await (prisma as any).storeProduct.findUnique({ where: { id: item.productId } });
      // Deduct stock
      await (prisma as any).storeProduct.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
      return { productId: item.productId, quantity: item.quantity, unitPrice: product.price };
    }));

    let sale;
    let attempts = 0;
    while (!sale && attempts < 5) {
      attempts++;
      if (attempts > 1) {
        invoiceId = await generateUniqueInvoiceId(prisma);
      }
      try {
        sale = await (prisma as any).storeSale.create({
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
              create: saleItemsData,
            },
          },
          include: { items: { include: { product: true } }, payments: true },
        });
      } catch (saleErr: any) {
        if (attempts >= 5) throw saleErr;
      }
    }

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
