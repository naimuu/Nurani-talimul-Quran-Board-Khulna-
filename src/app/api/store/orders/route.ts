import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import { calculateDeliveryCost } from "@/lib/deliveryCost";

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
      discount = 0,
      paymentOption,
      paymentProvider,
      paymentMethod,
      senderNumber,
      trxId,
      receiptNumber,
      remainingOption,
      remainingProvider,
      remainingTrxId,
      promiseDate,
      deliveryOptionType = "pathao",
      courierOrTransportName,
    } = await request.json();

    if (!customerName || !items || items.length === 0) {
      return NextResponse.json({ error: "customerName and items are required" }, { status: 400 });
    }

    // STRICT RULE: Reject "pay_later" or missing payment option completely from backend
    if (!paymentOption || paymentOption === "pay_later" || (paymentOption !== "pay_now" && paymentOption !== "money_receipt")) {
      return NextResponse.json(
        { error: "'পরে পেমেন্ট করব' অপশনটি অনুমোদিত নয়। অনুগ্রহ করে সরাসরি পেমেন্ট অথবা মানি রিসিটের মাধ্যমে পেমেন্ট সম্পন্ন করুন।" },
        { status: 400 }
      );
    }

    if (paymentOption === "pay_now") {
      if (!senderNumber || !String(senderNumber).trim() || !trxId || !String(trxId).trim()) {
        return NextResponse.json(
          { error: "পেমেন্টের প্রেরক নম্বর এবং ট্রানজেকশন আইডি (TrxID) প্রদান করা আবশ্যক।" },
          { status: 400 }
        );
      }
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

        if (instituteId && instituteId.trim() && (!matchedUser.madrasaName || !matchedUser.instituteName)) {
          await User.findByIdAndUpdate(matchedUser._id, {
            madrasaName: matchedUser.madrasaName || instituteId.trim(),
            instituteName: matchedUser.instituteName || instituteId.trim(),
          });
        }
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
          madrasaName: instituteId?.trim() || undefined,
          instituteName: instituteId?.trim() || undefined,
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
    if (paymentOption === "money_receipt") {
      // Dynamic access to support both generated and runtime client
      const receiptModel = (prisma as any).moneyReceipt;
      if (!receiptModel) {
        return NextResponse.json({ error: "রিসিট সার্ভিস পাওয়া যাচ্ছে না। সার্ভার রিস্টার্ট করুন।" }, { status: 500 });
      }
      validReceipt = await receiptModel.findUnique({ where: { receiptNumber } });
      if (!validReceipt || validReceipt.status !== "Active") {
        return NextResponse.json({ error: "অবৈধ বা ব্যবহৃত মানি রিসিট নম্বর!" }, { status: 400 });
      }
      const availableBalance = validReceipt.amount - validReceipt.usedAmount;
      if (availableBalance <= 0) {
        return NextResponse.json({ error: "এই মানি রিসিটে কোন ব্যালেন্স অবশিষ্ট নেই!" }, { status: 400 });
      }
    }

    // Process items
    const itemsToCreate: any[] = [];
    const itemsForDeliveryCalc: any[] = [];
    let subtotal = 0;
    for (const item of items) {
      let product: any = null;
      if (item.productId) {
        product = await (prisma as any).storeProduct.findUnique({ where: { id: item.productId } });
      }
      if (!product && item.name) {
        product = await (prisma as any).storeProduct.findFirst({ where: { name: item.name } });
      }
      if (!product && item.name) {
        product = await (prisma as any).storeProduct.create({
          data: {
            name: item.name,
            category: "প্রশ্নপত্র",
            price: Number(item.unitPrice) || 0,
            stock: 9999,
            weight: Number(item.weight) || 0.25,
            className: item.className || null,
            visibility: "academic",
            barcode: `__NO_BARCODE_auto_${Date.now()}_${Math.random()}__`,
          },
        });
      }
      if (!product) {
        product = await (prisma as any).storeProduct.create({
          data: {
            name: item.name || "অর্ডারকৃত পণ্য",
            category: "অন্যান্য",
            price: Number(item.unitPrice) || 0,
            stock: 9999,
            weight: Number(item.weight) || 0.25,
            visibility: "academic",
            barcode: `__NO_BARCODE_auto_${Date.now()}_${Math.random()}__`,
          },
        });
      }
      const finalUnitPrice = item.unitPrice !== undefined ? Number(item.unitPrice) : product.price;
      itemsToCreate.push({ productId: product.id, quantity: item.quantity, unitPrice: finalUnitPrice });
      itemsForDeliveryCalc.push({
        product: { ...product, price: finalUnitPrice, weight: Number(item.weight) || product.weight || 0.25 },
        quantity: item.quantity,
      });
      subtotal += finalUnitPrice * item.quantity;
    }

    // Resolve Delivery Option & Charge from Database/Defaults
    const selectedDeliveryType = (deliveryOptionType || "pathao").toLowerCase();
    let deliveryCharge = 0;
    let courierName = "পাঠাও";

    const dbDeliveryOption = await (prisma as any).deliveryOption.findUnique({
      where: { type: selectedDeliveryType },
    });

    if (dbDeliveryOption) {
      deliveryCharge = Number(dbDeliveryOption.charge) || 0;
      courierName = dbDeliveryOption.name;
    } else {
      if (selectedDeliveryType === "steadfast") {
        deliveryCharge = 0;
        courierName = "স্টিডফাস্ট";
      } else if (selectedDeliveryType === "other_courier") {
        deliveryCharge = 20;
        courierName = "অন্যান্য কুরিয়ার";
      } else if (selectedDeliveryType === "transport") {
        deliveryCharge = 10;
        courierName = "ট্রান্সপোর্ট";
      } else {
        deliveryCharge = 0;
        courierName = "পাঠাও";
      }
    }

    const needsCustomName =
      Boolean(dbDeliveryOption?.requiresName) ||
      selectedDeliveryType === "other_courier" ||
      selectedDeliveryType === "transport";

    // Require custom name for other_courier and transport
    if (needsCustomName && (!courierOrTransportName || !courierOrTransportName.trim())) {
      return NextResponse.json(
        { error: `অনুগ্রহ করে নির্দিষ্ট ${courierName}-এর নাম লিখুন` },
        { status: 400 }
      );
    }

    const totalWeight = Math.round(itemsForDeliveryCalc.reduce((w, i) => w + (i.product?.weight || 0.25) * i.quantity, 0) * 10) / 10;
    const finalDiscount = Number(discount) || 0;
    const totalAmount = Math.max(0, subtotal - finalDiscount + deliveryCharge);

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
            due: due,
          });
        }
      });
    }

    // Determine initial paidAmount
    let paidAmount = 0;

    if (paymentOption === "money_receipt" && validReceipt) {
      const availableBalance = validReceipt.amount - validReceipt.usedAmount;
      paymentAmountFromReceipt = Math.min(availableBalance, totalAmount + previousDue);
      paidAmount = paymentAmountFromReceipt;

      if (paymentAmountFromReceipt < totalAmount) {
        const remTrx = remainingTrxId || trxId;
        if (!senderNumber || !String(senderNumber).trim() || !remTrx || !String(remTrx).trim()) {
          return NextResponse.json(
            { error: "মানি রিসিটের ব্যালেন্স অপর্যাপ্ত। অনুগ্রহ করে বাকি টাকার প্রেরক নম্বর ও ট্রানজেকশন আইডি (TrxID) দিন।" },
            { status: 400 }
          );
        }
      }
    }

    const cleanCustomCourier = needsCustomName && courierOrTransportName ? courierOrTransportName.trim() : null;
    const courierDetailName = cleanCustomCourier ? ` (${cleanCustomCourier})` : "";
    const deliveryNoteSummary = deliveryCharge > 0
      ? ` | ডেলিভারি: ${courierName}${courierDetailName} (চার্জ: ${deliveryCharge} ৳, ওজন: ${totalWeight} কেজি)`
      : ` | ডেলিভারি: ${courierName}${courierDetailName} (ফ্রি ডেলিভারি, ওজন: ${totalWeight} কেজি)`;
    const finalNotes = (notes || "Online Order") + deliveryNoteSummary;

    const initialTimeline = [
      {
        step: "pending",
        status: "Pending Order",
        title: "নতুন অনলাইন অর্ডার গৃহীত",
        actorName: `${customerName.trim()} (ক্রেতা)`,
        actorRole: "CUSTOMER",
        actorPhone: customerPhone || null,
        timestamp: new Date().toISOString(),
        notes: "অর্ডারটি সফলভাবে সিস্টেমে গ্রহণ করা হয়েছে",
      },
    ];

    // Create a StoreSale with status 'Pending Order'
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
          discount: finalDiscount,
          previousDue,
          previousDueList,
          deliveryCharge,
          courierName,
          deliveryOptionType: selectedDeliveryType,
          courierOrTransportName: cleanCustomCourier,
          paymentMethod: paymentMethod || paymentProvider || "Online",
          senderNumber: senderNumber ? String(senderNumber).trim() : null,
          trxId: (trxId || remainingTrxId) ? String(trxId || remainingTrxId).trim() : null,
          totalWeight,
          status: "Pending Order",
          notes: finalNotes,
          timeline: initialTimeline,
          items: {
            create: itemsToCreate,
          },
        },
        include: { items: { include: { product: true } }, payments: true },
      });
    } catch (saleErr: any) {
      sale = await (prisma as any).storeSale.create({
        data: {
          invoiceId,
          customerName,
          customerPhone: customerPhone || null,
          instituteId: instituteId || null,
          totalAmount,
          paidAmount,
          discount: finalDiscount,
          deliveryCharge,
          courierName,
          deliveryOptionType: selectedDeliveryType,
          courierOrTransportName: cleanCustomCourier,
          paymentMethod: paymentMethod || paymentProvider || "Online",
          senderNumber: senderNumber ? String(senderNumber).trim() : null,
          trxId: (trxId || remainingTrxId) ? String(trxId || remainingTrxId).trim() : null,
          totalWeight,
          status: "Pending Order",
          notes: finalNotes,
          timeline: initialTimeline,
          items: {
            create: itemsToCreate,
          },
        },
        include: { items: { include: { product: true } }, payments: true },
      });
    }

    // Handle Payment Options
    if (paymentOption === "pay_now") {
      await (prisma as any).storePayment.create({
        data: {
          saleId: sale.id,
          payer: customerName,
          purpose: "Sale Payment",
          amount: totalAmount,
          method: paymentMethod || paymentProvider || "Online",
          status: "Pending",
          senderNumber: senderNumber ? String(senderNumber).trim() : null,
          trxId: trxId ? String(trxId).trim() : null,
          notes: `Sender: ${senderNumber || "N/A"}, TrxID: ${trxId}`,
        },
      });
    } else if (paymentOption === "money_receipt" && validReceipt) {
      // 1. Create Payment Record
      await (prisma as any).storePayment.create({
        data: {
          saleId: sale.id,
          payer: customerName,
          purpose: "Sale Payment",
          amount: paymentAmountFromReceipt,
          method: "Money Receipt",
          status: "Completed",
          notes: `Receipt: ${receiptNumber}`,
        },
      });

      // 2. Update Receipt Balance
      const newUsedAmount = validReceipt.usedAmount + paymentAmountFromReceipt;
      await (prisma as any).moneyReceipt.update({
        where: { id: validReceipt.id },
        data: {
          usedAmount: newUsedAmount,
          status: newUsedAmount >= validReceipt.amount ? "Fully Used" : "Active",
        },
      });

      // 3. Create Receipt Usage History
      await (prisma as any).receiptUsage.create({
        data: {
          receiptId: validReceipt.id,
          invoiceId: sale.invoiceId,
          usedAmount: paymentAmountFromReceipt,
        },
      });

      // 4. If partial receipt, record the remaining immediate payment too
      const remainingDue = Math.max(0, totalAmount - paymentAmountFromReceipt);
      const remTrx = remainingTrxId || trxId;
      if (remainingDue > 0 && remTrx) {
        await (prisma as any).storePayment.create({
          data: {
            saleId: sale.id,
            payer: customerName,
            purpose: "Sale Payment (Remaining)",
            amount: remainingDue,
            method: remainingProvider || paymentMethod || paymentProvider || "Online",
            status: "Pending",
            senderNumber: senderNumber ? String(senderNumber).trim() : null,
            trxId: String(remTrx).trim(),
            notes: `Remaining after Receipt ${receiptNumber} | Sender: ${senderNumber || "N/A"}, TrxID: ${remTrx}`,
          },
        });
      }
    }

    // Refetch sale to include new payments
    const updatedSale = await (prisma as any).storeSale.findUnique({
      where: { id: sale.id },
      include: { items: { include: { product: true } }, payments: true },
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
