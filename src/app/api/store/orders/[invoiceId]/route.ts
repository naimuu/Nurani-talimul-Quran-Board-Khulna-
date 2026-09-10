import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { invoiceId: string } }) {
  try {
    const { invoiceId } = params;

    if (!invoiceId) {
      return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
    }

    const sale = await (prisma as any).storeSale.findFirst({
      where: { invoiceId: invoiceId },
      include: { items: { include: { product: true } }, payments: true },
    });

    if (!sale) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let currentDueList: any[] = [];
    let currentTotalDue = 0;

    const conditions: any[] = [];
    if (sale.customerPhone && sale.customerPhone.trim()) {
      conditions.push({ customerPhone: sale.customerPhone.trim() });
    }
    if (sale.instituteId && sale.instituteId.trim()) {
      conditions.push({ instituteId: sale.instituteId.trim() });
    }
    if (sale.customerName && sale.customerName.trim()) {
      conditions.push({ customerName: sale.customerName.trim() });
    }

    if (conditions.length > 0) {
      const allSales = await (prisma as any).storeSale.findMany({
        where: {
          OR: conditions,
          NOT: { invoiceId: sale.invoiceId },
          status: { notIn: ["Rejected", "Cancelled"] }
        },
        orderBy: { createdAt: "desc" }
      });

      const seen = new Set<string>();
      for (const s of allSales) {
        if (seen.has(s.invoiceId)) continue;
        seen.add(s.invoiceId);

        const due = Math.max(0, s.totalAmount - s.paidAmount);
        if (due > 0) {
          currentTotalDue += due;
          currentDueList.push({
            invoiceId: s.invoiceId,
            date: s.createdAt,
            due: due,
            totalAmount: s.totalAmount,
            paidAmount: s.paidAmount
          });
        }
      }
    }

    return NextResponse.json({ ...sale, currentDueList, currentTotalDue });
  } catch (error) {
    console.error("Failed to track order:", error);
    return NextResponse.json({ error: "Failed to track order" }, { status: 500 });
  }
}
