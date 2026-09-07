import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      password,
      instituteId,
      items,
      notes,
      paymentOption,
      paymentProvider,
      trxId,
      receiptNumber,
      remainingOption,
      remainingProvider,
      remainingTrxId,
    } = await request.json();
    
    if (!customerName || !items || items.length === 0) {
      return NextResponse.json({ error: "customerName and items are required" }, { status: 400 });
    }

    // Auto-create or link User Account
    let userAccountInfo: any = null;
    try {
      await connectDB();
      const phoneClean = customerPhone ? String(customerPhone).trim() : "";
      const emailClean = customerEmail ? String(customerEmail).trim().toLowerCase() : "";

      let matchedUser: any = null;
      const orConditions: any[] = [];
      if (phoneClean) orConditions.push({ phone: phoneClean });
      if (emailClean) orConditions.push({ email: emailClean });

      if (orConditions.length > 0) {
        matchedUser = await User.findOne({ $or: orConditions });
      }

      if (matchedUser) {
        userAccountInfo = {
          id: matchedUser._id.toString(),
          name: matchedUser.name || customerName,
          phone: matchedUser.phone || phoneClean,
          email: matchedUser.email || emailClean,
          role: matchedUser.role || "GENERAL",
          isNew: false,
        };
      } else {
        // Create new account
        const rawPassword = (password && String(password).trim().length >= 4)
          ? String(password).trim()
          : (phoneClean && phoneClean.length >= 6 ? phoneClean.slice(-6) : "123456");
        
        const hashedPassword = await bcrypt.hash(rawPassword, 10);
        const finalEmail = emailClean || (phoneClean ? `${phoneClean}@nuraniboard.com` : `user_${Date.now()}@nuraniboard.com`);

        const newUser = await User.create({
          name: customerName.trim(),
          phone: phoneClean || undefined,
          email: finalEmail,
          password: hashedPassword,
          role: "GENERAL",
        });

        userAccountInfo = {
          id: newUser._id.toString(),
          name: newUser.name,
          phone: newUser.phone,
          email: newUser.email,
          role: newUser.role,
          isNew: true,
          initialPassword: password ? undefined : rawPassword,
        };
      }
    } catch (userErr: any) {
      console.warn("User link/create warning in store order:", userErr?.message);
    }

    // Verify Money Receipt before proceeding if selected
    let validReceipt: any = null;
    let paymentAmountFromReceipt = 0;
    if (paymentOption === 'money_receipt') {
      // Dynamic access to support both generated and runtime client
      const receiptModel = (prisma as any).moneyReceipt;
      console.log('[DEBUG] prisma models available:', Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));
      if (!receiptModel) {
        return NextResponse.json({ error: "রিসিট সার্ভিস পাওয়া যাচ্ছে না। সার্ভার রিস্টার্ট করুন।" }, { status: 500 });
      }
      validReceipt = await receiptModel.findUnique({ where: { receiptNumber } });
      if (!validReceipt || validReceipt.status !== 'Active') {
        return NextResponse.json({ error: "অবৈধ বা ব্যবহৃত মানি রিসিট নম্বর!" }, { status: 400 });
      }
      const availableBalance = validReceipt.amount - validReceipt.usedAmount;
      if (availableBalance <= 0) {
        return NextResponse.json({ error: "এই মানি রিসিটে কোন ব্যালেন্স অবশিষ্ট নেই!" }, { status: 400 });
      }
    }

    // Process items
    const itemsToCreate: any[] = [];
    let totalAmount = 0;
    for (const item of items) {
      const product = await (prisma as any).storeProduct.findUnique({ where: { id: item.productId } });
      if (!product) return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 404 });
      itemsToCreate.push({ productId: product.id, quantity: item.quantity, unitPrice: product.price });
      totalAmount += product.price * item.quantity;
    }

    // Generate invoice ID
    const count = await (prisma as any).storeSale.count();
    const invoiceId = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    // Calculate previous due and list if customerPhone exists
    let previousDue = 0;
    const previousDueList: any[] = [];
    if (customerPhone) {
      const pastSales = await (prisma as any).storeSale.findMany({ where: { customerPhone } });
      pastSales.forEach((sale: any) => {
        const due = sale.totalAmount - sale.paidAmount - sale.discount;
        if (due > 0) {
          previousDue += due;
          previousDueList.push({
            invoiceId: sale.invoiceId,
            date: sale.createdAt,
            due: due
          });
        }
      });
    }

    // Determine initial paidAmount
    let paidAmount = 0;

    if (paymentOption === 'money_receipt' && validReceipt) {
      const availableBalance = validReceipt.amount - validReceipt.usedAmount;
      paymentAmountFromReceipt = Math.min(availableBalance, totalAmount + previousDue);
      paidAmount = paymentAmountFromReceipt;
    }

    // Create a StoreSale with status 'Pending Order' (does NOT deduct stock)
    let sale;
    try {
      sale = await (prisma as any).storeSale.create({
        data: {
          invoiceId,
          customerName,
          customerPhone: customerPhone || null,
          instituteId: instituteId || null,
          totalAmount,
          paidAmount,
          discount: 0,
          previousDue,
          previousDueList,
          status: "Pending Order",
          notes: notes || "Online Order",
          items: {
            create: itemsToCreate,
          },
        },
        include: { items: { include: { product: true } }, payments: true },
      });
    } catch (saleErr: any) {
      // If previousDueList field doesn't exist in DB yet, retry without it
      if (saleErr?.message?.includes('previousDue') || saleErr?.code === 'P2009') {
        sale = await (prisma as any).storeSale.create({
          data: {
            invoiceId,
            customerName,
            customerPhone: customerPhone || null,
            instituteId: instituteId || null,
            totalAmount,
            paidAmount,
            discount: 0,
            status: "Pending Order",
            notes: notes || "Online Order",
            items: {
              create: itemsToCreate,
            },
          },
          include: { items: { include: { product: true } }, payments: true },
        });
      } else {
        throw saleErr;
      }
    }

    // Handle Payment Options
    if (paymentOption === 'pay_now') {
      await (prisma as any).storePayment.create({
        data: {
          saleId: sale.id,
          payer: customerName,
          purpose: "Sale Payment",
          amount: totalAmount,
          method: paymentProvider,
          status: "Pending",
          notes: `TrxID: ${trxId}`
        }
      });
    } else if (paymentOption === 'money_receipt' && validReceipt) {
      // 1. Create Payment Record
      await (prisma as any).storePayment.create({
        data: {
          saleId: sale.id,
          payer: customerName,
          purpose: "Sale Payment",
          amount: paymentAmountFromReceipt,
          method: "Money Receipt",
          status: "Completed",
          notes: `Receipt: ${receiptNumber}`
        }
      });

      // 2. Update Receipt Balance
      const newUsedAmount = validReceipt.usedAmount + paymentAmountFromReceipt;
      await (prisma as any).moneyReceipt.update({
        where: { id: validReceipt.id },
        data: {
          usedAmount: newUsedAmount,
          status: newUsedAmount >= validReceipt.amount ? "Fully Used" : "Active"
        }
      });

      // 3. Create Receipt Usage History
      await (prisma as any).receiptUsage.create({
        data: {
          receiptId: validReceipt.id,
          invoiceId: sale.invoiceId,
          usedAmount: paymentAmountFromReceipt
        }
      });
    }

    // Refetch sale to include new payments
    const updatedSale = await (prisma as any).storeSale.findUnique({
      where: { id: sale.id },
      include: { items: { include: { product: true } }, payments: true }
    });

    return NextResponse.json({
      ...updatedSale,
      userAccount: userAccountInfo,
    });
  } catch (error) {
    console.error("Failed to create online order:", error);
    return NextResponse.json({ error: "Failed to create online order: " + (error as any)?.message }, { status: 500 });
  }
}
