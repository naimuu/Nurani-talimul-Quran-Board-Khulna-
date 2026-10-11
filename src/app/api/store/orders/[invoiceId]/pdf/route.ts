import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { repairQuestionOrderSaleIfNeeded } from "@/lib/orderRepair";
import { generateInvoiceHTML } from "@/lib/orderPrint";
import { convertHtmlToPdfBuffer } from "@/lib/pdfGenerator";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { invoiceId: string } }
) {
  try {
    const { invoiceId } = params;
    const url = new URL(request.url);
    const mode = (url.searchParams.get("mode") as "admin" | "customer") || "customer";

    if (!invoiceId) {
      return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
    }

    let sale = await (prisma as any).storeSale.findFirst({
      where: { invoiceId: invoiceId },
      include: { items: { include: { product: true } }, payments: true },
    });

    if (!sale) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    sale = await repairQuestionOrderSaleIfNeeded(sale, prisma);

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
          status: { notIn: ["Rejected", "Cancelled"] },
        },
        orderBy: { createdAt: "desc" },
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
            paidAmount: s.paidAmount,
          });
        }
      }
    }

    const orderData = {
      ...sale,
      currentDueList,
      currentTotalDue,
    };

    let boardSettings = null;
    try {
      boardSettings = await (prisma as any).boardSettings.findFirst();
    } catch (_) {}

    // Generate real text / vector HTML
    const html = await generateInvoiceHTML(orderData, { mode }, boardSettings);

    // Convert directly to genuine vector text PDF
    const pdfBuffer = await convertHtmlToPdfBuffer(html);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-${sale.invoiceId}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Failed to generate order PDF:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
