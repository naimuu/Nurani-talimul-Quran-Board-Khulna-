import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import * as jose from "jose";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";
import { calculateDeliveryCost } from "@/lib/deliveryCost";
import { getEnrichedTimeline, createTimelineEvent, parseTrackingInfo } from "@/lib/orderTimeline";

const prisma = new PrismaClient();

async function getAdminUser() {
  const token = cookies().get("auth_token")?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "nurani_board_khulna_secret_key_2024");
    const { payload } = await jose.jwtVerify(token, secret);
    if (payload.role === "ADMIN") {
      return payload as { name?: string; role?: string; email?: string; userId?: string };
    }
    return null;
  } catch {
    return null;
  }
}

async function verifyAdmin() {
  const admin = await getAdminUser();
  return !!admin;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const sale = await (prisma as any).storeSale.findUnique({
      where: { id: params.id },
      include: { items: { include: { product: true } }, payments: true },
    });
    if (!sale) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const timeline = getEnrichedTimeline(sale);
    return NextResponse.json({ ...sale, timeline });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sale" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const adminUser = await getAdminUser();
  if (!adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const adminName = adminUser.name || "System Admin";

  try {
    const body = await request.json();
    const existingSale = await (prisma as any).storeSale.findUnique({ 
      where: { id: params.id },
      include: { items: true }
    });
    if (!existingSale) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const now = new Date();
    let currentTimeline = getEnrichedTimeline(existingSale);

    // Handle Order Accept / Status Change
    if (body.action === 'acceptOrder' || body.action === 'updateStatus') {
      const newStatus = body.status || 'Confirmed';
      const data: Record<string, unknown> = {
        status: newStatus,
      };
      
      let paymentAmount = 0;
      if (body.paidAmount !== undefined) {
        data.paidAmount = parseFloat(body.paidAmount);
        paymentAmount = (data.paidAmount as number);
      }

      if (body.promiseDate) {
        data.promiseDate = new Date(body.promiseDate);
      }

      if (body.deliveryCharge !== undefined) data.deliveryCharge = Number(body.deliveryCharge);
      if (body.discount !== undefined) data.discount = Number(body.discount);
      if (body.totalAmount !== undefined) data.totalAmount = Number(body.totalAmount);
      if (body.courierName !== undefined) data.courierName = body.courierName;
      if (body.totalWeight !== undefined) data.totalWeight = Number(body.totalWeight);
      if (body.notes !== undefined) data.notes = body.notes;

      // Construct Timeline Events for this status transition
      if (body.action === 'acceptOrder') {
        // Confirmation event
        const confirmEvt = createTimelineEvent({
          step: 'confirmed',
          status: 'Confirmed',
          title: 'বোর্ড কর্তৃক অনুমোদন ও নিশ্চিতকরণ সম্পন্ন',
          actorName: adminName,
          actorRole: 'ADMIN',
          timestamp: now.toISOString(),
          notes: paymentAmount > 0 ? `পরিশোধিত: ৳${paymentAmount}` : 'অর্ডার অনুমোদন করা হয়েছে',
        });
        currentTimeline = [...currentTimeline.filter(e => e.step !== 'confirmed' && e.step !== 'packaging' && e.step !== 'shipped' && e.step !== 'delivered'), confirmEvt];

        if (newStatus === 'Packaging') {
          const pkgEvt = createTimelineEvent({
            step: 'packaging',
            status: 'Packaging',
            title: 'প্যাকেজিং ও পণ্য প্রস্তুতকরণ শুরু',
            actorName: adminName,
            actorRole: 'ADMIN',
            timestamp: new Date(now.getTime() + 1000).toISOString(),
            notes: 'পণ্য প্যাকিং ও ডিসপ্যাচের জন্য প্রস্তুত করা হচ্ছে',
          });
          currentTimeline.push(pkgEvt);
        }
      } else if (body.action === 'updateStatus') {
        const s = newStatus.trim().toLowerCase();
        if (s === 'packaging') {
          const pkgEvt = createTimelineEvent({
            step: 'packaging',
            status: 'Packaging',
            title: 'প্যাকেজিং ও পণ্য প্রস্তুতকরণ শুরু',
            actorName: adminName,
            actorRole: 'ADMIN',
            timestamp: now.toISOString(),
            notes: 'পণ্য প্যাকিং শুরু হয়েছে',
          });
          currentTimeline = [...currentTimeline.filter(e => e.step !== 'packaging' && e.step !== 'shipped' && e.step !== 'delivered'), pkgEvt];
        } else if (s === 'shipped' || s === 'courier') {
          const tracking = parseTrackingInfo(body.notes || existingSale.notes, body.courierName || existingSale.courierName);
          const shipEvt = createTimelineEvent({
            step: 'shipped',
            status: 'Shipped',
            title: 'কুরিয়ারে হস্তান্তর ও ট্র্যাকিং বুকিং সম্পন্ন',
            actorName: adminName,
            actorRole: 'ADMIN',
            courierName: tracking.courier,
            trackingId: tracking.trackingId,
            timestamp: now.toISOString(),
            notes: body.notes ? `কুরিয়ারে পাঠানো হয়েছে` : undefined,
          });
          currentTimeline = [...currentTimeline.filter(e => e.step !== 'shipped' && e.step !== 'delivered'), shipEvt];
        } else if (s === 'delivered' || s === 'completed') {
          const delivEvt = createTimelineEvent({
            step: 'delivered',
            status: 'Delivered',
            title: 'ডেলিভারি সম্পন্ন (অ্যাডমিন কর্তৃক নিশ্চিত)',
            actorName: adminName,
            actorRole: 'ADMIN',
            confirmedByCustomer: false,
            timestamp: now.toISOString(),
            notes: 'অ্যাডমিন প্যানেল থেকে ডেলিভারি সম্পন্ন হিসেবে চিহ্নিত',
          });
          currentTimeline = [...currentTimeline.filter(e => e.step !== 'delivered'), delivEvt];
          data.deliveredAt = now;
          data.deliveredBy = adminName;
          data.confirmedByCustomer = false;
        } else if (s === 'rejected' || s === 'cancelled') {
          const rejEvt = createTimelineEvent({
            step: 'cancelled',
            status: 'Cancelled',
            title: 'অর্ডার বাতিল করা হয়েছে',
            actorName: adminName,
            actorRole: 'ADMIN',
            timestamp: now.toISOString(),
            notes: 'অ্যাডমিন প্যানেল থেকে অর্ডার বাতিল করা হয়েছে',
          });
          currentTimeline.push(rejEvt);
        } else if (s === 'pending order') {
          const reactivateEvt = createTimelineEvent({
            step: 'pending',
            status: 'Pending Order',
            title: 'অর্ডার পুনরায় সক্রিয় করা হয়েছে',
            actorName: adminName,
            actorRole: 'ADMIN',
            timestamp: now.toISOString(),
            notes: 'অর্ডার সক্রিয় অবস্থায় ফিরিয়ে আনা হয়েছে',
          });
          currentTimeline.push(reactivateEvt);
        }
      }

      data.timeline = currentTimeline;

      // Deduct stock only once when transitioning from 'Pending Order'
      if (existingSale.status === 'Pending Order' && newStatus !== 'Rejected') {
        for (const item of existingSale.items) {
          await (prisma as any).storeProduct.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      } else if (newStatus === 'Rejected' && existingSale.status !== 'Pending Order' && existingSale.status !== 'Rejected') {
        // Return stock if previously accepted order is now rejected
        for (const item of existingSale.items) {
          await (prisma as any).storeProduct.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      // Direct MongoDB update for full consistency
      try {
        await connectDB();
        if (mongoose.connection.db) {
          await mongoose.connection.db.collection('StoreSale').updateOne(
            { _id: new mongoose.Types.ObjectId(params.id) },
            { 
              $set: {
                ...data,
                timeline: currentTimeline,
                updatedAt: now,
              }
            }
          );
        }
      } catch (mErr) {
        console.warn("Direct mongo sync note:", mErr);
      }

      let sale;
      try {
        sale = await (prisma as any).storeSale.update({
          where: { id: params.id },
          data,
          include: { items: { include: { product: true } }, payments: true },
        });
      } catch (pErr) {
        const { timeline, ...dataWithoutTimeline } = data;
        sale = await (prisma as any).storeSale.update({
          where: { id: params.id },
          data: dataWithoutTimeline,
          include: { items: { include: { product: true } }, payments: true },
        });
      }

      if (paymentAmount > 0) {
        await (prisma as any).storePayment.create({
          data: {
            saleId: sale.id,
            payer: sale.customerName,
            purpose: `Payment for Invoice ${sale.invoiceId}`,
            amount: paymentAmount,
            method: body.paymentMethod || "Cash",
            status: "Completed",
          },
        });
      }

      return NextResponse.json({ ...sale, timeline: currentTimeline });
    }

    // Handle Order Items Update
    if (body.action === 'updateItems') {
      if (!body.items || !Array.isArray(body.items)) return NextResponse.json({ error: "Items array required" }, { status: 400 });
      
      await (prisma as any).storeSaleItem.deleteMany({ where: { saleId: params.id } });
      
      let subtotal = 0;
      const itemsToCreate = [];
      const itemsForDeliveryCalc = [];
      for (const item of body.items) {
        const product = await (prisma as any).storeProduct.findUnique({ where: { id: item.productId } });
        if (product) {
          subtotal += product.price * item.quantity;
          itemsToCreate.push({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: product.price,
          });
          itemsForDeliveryCalc.push({ product, quantity: item.quantity });
        }
      }

      const deliveryInfo = calculateDeliveryCost(itemsForDeliveryCalc);
      const deliveryCharge = body.deliveryCharge !== undefined ? Number(body.deliveryCharge) : deliveryInfo.deliveryCharge;
      const totalWeight = deliveryInfo.totalWeightKg;
      const courierName = body.courierName || deliveryInfo.courierName;
      const discount = body.discount !== undefined ? Number(body.discount) : (existingSale.discount || 0);
      const totalAmount = Math.max(0, subtotal - discount) + deliveryCharge;
      
      const editEvt = createTimelineEvent({
        step: existingSale.status === 'Pending Order' ? 'pending' : 'confirmed',
        status: existingSale.status,
        title: 'অর্ডারের পণ্য তালিকা ও মূল্য সংশোধন',
        actorName: adminName,
        actorRole: 'ADMIN',
        timestamp: now.toISOString(),
        notes: `আইটেম সংখ্যা: ${itemsToCreate.length} টি, মোট বিল: ৳${totalAmount.toFixed(2)}`,
      });
      currentTimeline.push(editEvt);

      // Direct MongoDB update
      try {
        await connectDB();
        if (mongoose.connection.db) {
          await mongoose.connection.db.collection('StoreSale').updateOne(
            { _id: new mongoose.Types.ObjectId(params.id) },
            { 
              $set: {
                totalAmount,
                deliveryCharge,
                discount,
                courierName,
                totalWeight,
                timeline: currentTimeline,
                updatedAt: now,
              }
            }
          );
        }
      } catch (mErr) {
        console.warn("Direct mongo sync note:", mErr);
      }

      const sale = await (prisma as any).storeSale.update({
        where: { id: params.id },
        data: {
          totalAmount,
          deliveryCharge,
          discount,
          courierName,
          totalWeight,
          items: { create: itemsToCreate }
        },
        include: { items: { include: { product: true } }, payments: true },
      });

      return NextResponse.json({ ...sale, timeline: currentTimeline });
    }

    // Standard update
    const data: Record<string, unknown> = {};
    if (body.status !== undefined) data.status = body.status;
    let paymentAmount = 0;
    if (body.paidAmount !== undefined) {
      data.paidAmount = parseFloat(body.paidAmount);
      paymentAmount = (data.paidAmount as number) - (existingSale.paidAmount || 0);
    }
    if (body.deliveryCharge !== undefined) data.deliveryCharge = Number(body.deliveryCharge);
    if (body.discount !== undefined) data.discount = Number(body.discount);
    if (body.totalAmount !== undefined) data.totalAmount = Number(body.totalAmount);
    if (body.courierName !== undefined) data.courierName = body.courierName;
    if (body.totalWeight !== undefined) data.totalWeight = Number(body.totalWeight);
    if (body.notes !== undefined) data.notes = body.notes;

    const sale = await (prisma as any).storeSale.update({
      where: { id: params.id },
      data,
      include: { items: { include: { product: true } }, payments: true },
    });

    if (paymentAmount > 0) {
      await (prisma as any).storePayment.create({
        data: {
          saleId: sale.id,
          payer: sale.customerName,
          purpose: `Payment for Invoice ${sale.invoiceId}`,
          amount: paymentAmount,
          method: "Cash",
          status: "Completed",
          notes: body.notes || "",
        },
      });
    }

    return NextResponse.json({ ...sale, timeline: currentTimeline });
  } catch (error) {
    console.error("Failed to update sale:", error);
    return NextResponse.json({ error: "Failed to update sale" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await (prisma as any).storeSale.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete sale" }, { status: 500 });
  }
}
