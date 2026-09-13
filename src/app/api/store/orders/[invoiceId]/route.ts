import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getEnrichedTimeline, createTimelineEvent } from "@/lib/orderTimeline";
import { repairQuestionOrderSaleIfNeeded } from "@/lib/orderRepair";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { invoiceId: string } }) {
  try {
    const { invoiceId } = params;

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

    const enrichedTimeline = getEnrichedTimeline(sale);

    return NextResponse.json({ 
      ...sale, 
      timeline: enrichedTimeline,
      currentDueList, 
      currentTotalDue 
    });
  } catch (error) {
    console.error("Failed to track order:", error);
    return NextResponse.json({ error: "Failed to track order" }, { status: 500 });
  }
}

// User confirms product received directly on tracking page
export async function POST(request: Request, { params }: { params: { invoiceId: string } }) {
  try {
    const { invoiceId } = params;
    const body = await request.json().catch(() => ({}));

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

    if (sale.status === 'Rejected' || sale.status === 'Cancelled') {
      return NextResponse.json({ error: "বাতিলকৃত অর্ডারের রিসিভ নিশ্চিত করা সম্ভব নয়" }, { status: 400 });
    }

    const now = new Date();
    const existingTimeline = getEnrichedTimeline(sale);
    const customerReceiverName = body.receiverName || sale.customerName || "ক্রেতা";

    const receiveEvent = createTimelineEvent({
      step: 'delivered',
      status: 'Delivered',
      title: 'পণ্য রিসিভ ও ডেলিভারি নিশ্চিত (ক্রেতা নিজে)',
      actorName: `${customerReceiverName.trim()} (ক্রেতা নিজে)`,
      actorRole: 'CUSTOMER',
      actorPhone: sale.customerPhone || undefined,
      confirmedByCustomer: true,
      timestamp: now.toISOString(),
      notes: body.notes || 'ক্রেতা ট্র্যাকিং পেজ থেকে পণ্য প্রাপ্তি নিশ্চিত করেছেন',
    });

    // Remove any previous delivered step if updating
    const updatedTimeline = [
      ...existingTimeline.filter(e => e.step !== 'delivered' && e.status !== 'Delivered'),
      receiveEvent
    ];

    // Update with direct database fallback for custom mongo fields
    try {
      await connectDB();
      if (mongoose.connection.db) {
        await mongoose.connection.db.collection('StoreSale').updateOne(
          { invoiceId: invoiceId },
          {
            $set: {
              status: 'Delivered',
              deliveredAt: now,
              deliveredBy: `${customerReceiverName.trim()} (ক্রেতা নিজে)`,
              receivedAt: now,
              receivedBy: `${customerReceiverName.trim()} (ক্রেতা নিজে)`,
              confirmedByCustomer: true,
              timeline: updatedTimeline,
              updatedAt: now,
            }
          }
        );
      }
    } catch (mErr) {
      console.warn("Direct mongo update note:", mErr);
    }

    let updatedSale;
    try {
      updatedSale = await (prisma as any).storeSale.update({
        where: { invoiceId: invoiceId },
        data: {
          status: 'Delivered',
          timeline: updatedTimeline,
        },
        include: { items: { include: { product: true } }, payments: true },
      });
    } catch (pErr) {
      updatedSale = await (prisma as any).storeSale.update({
        where: { invoiceId: invoiceId },
        data: {
          status: 'Delivered',
        },
        include: { items: { include: { product: true } }, payments: true },
      });
    }

    return NextResponse.json({
      ...updatedSale,
      status: 'Delivered',
      confirmedByCustomer: true,
      receivedAt: now.toISOString(),
      receivedBy: `${customerReceiverName.trim()} (ক্রেতা নিজে)`,
      deliveredAt: now.toISOString(),
      deliveredBy: `${customerReceiverName.trim()} (ক্রেতা নিজে)`,
      timeline: updatedTimeline,
      success: true,
      message: 'পণ্য রিসিভ সফলভাবে নিশ্চিত হয়েছে।'
    });
  } catch (error: any) {
    console.error("Failed to confirm received by user:", error);
    return NextResponse.json({ error: "পণ্য রিসিভ নিশ্চিত করতে সমস্যা হয়েছে: " + error?.message }, { status: 500 });
  }
}
