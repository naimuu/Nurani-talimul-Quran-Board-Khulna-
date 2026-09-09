import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import * as jose from "jose";

import { calculateDeliveryCost } from "@/lib/deliveryCost";

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
    const sale = await (prisma as any).storeSale.findUnique({
      where: { id: params.id },
      include: { items: { include: { product: true } }, payments: true },
    });
    if (!sale) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(sale);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sale" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const existingSale = await (prisma as any).storeSale.findUnique({ 
      where: { id: params.id },
      include: { items: true }
    });
    if (!existingSale) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Handle Order Accept
    if (body.action === 'acceptOrder') {
      const data: Record<string, unknown> = {
        status: body.status || 'Pending',
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

      // Deduct stock for all items
      for (const item of existingSale.items) {
        await (prisma as any).storeProduct.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

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
            method: body.paymentMethod || "Cash",
            status: "Completed",
          },
        });
      }
      return NextResponse.json(sale);
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
      return NextResponse.json(sale);
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

    return NextResponse.json(sale);
  } catch (error) {
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
