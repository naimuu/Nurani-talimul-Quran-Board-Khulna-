import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PAYMENT_V3_QUESTION_SLUG = "payment-methods-v3-question";
const PAYMENT_V3_BOOK_SLUG = "payment-methods-v3-book";

export interface PaymentMethodItem {
  id?: string;
  type: string; // 'mobile' | 'bank'
  provider: string;
  name?: string;
  logo?: string;
  accountName?: string;
  accountNumber: string;
  accountType?: string;
  branch?: string;
  routingNo?: string;
  qrCodeImage?: string;
  instructions?: string;
  sortOrder?: number;
  isActive?: boolean;
  chargePercent?: number; // e.g. 1 for 1% extra bank/payment fee
  chargeFixed?: number;
}

const DEFAULT_BOOK_PAYMENTS: PaymentMethodItem[] = [
  {
    type: "mobile",
    provider: "বিকাশ",
    name: "বিকাশ (পার্সোনাল)",
    accountNumber: "01820580560",
    accountType: "পার্সোনাল",
    instructions: "Send Money করে প্রেরক নম্বর ও TrxID প্রদান করুন।",
    isActive: true,
    sortOrder: 1,
    chargePercent: 0,
  },
  {
    type: "mobile",
    provider: "নগদ",
    name: "নগদ (মার্চেন্ট)",
    accountNumber: "01711000000",
    accountType: "মার্চেন্ট",
    instructions: "Make Payment করে TrxID প্রদান করুন।",
    isActive: true,
    sortOrder: 2,
    chargePercent: 0,
  },
  {
    type: "bank",
    provider: "ইসলামী ব্যাংক",
    name: "ইসলামী ব্যাংক বাংলাদেশ লিঃ",
    accountName: "নূরানী তালিমুল কুরআন বোর্ড খুলনা",
    accountNumber: "20501234567890",
    accountType: "চলতি হিসাব",
    branch: "খুলনা শাখা",
    routingNo: "125471234",
    instructions: "ব্যাংক ডিপোজিট বা অনলাইন ফান্ড ট্রান্সফার করে স্লিপ বা ট্রানজেকশন নম্বর প্রদান করুন।",
    isActive: true,
    sortOrder: 3,
    chargePercent: 1, // 1% default bank fee
  },
];

export const DEFAULT_QUESTION_PAYMENTS: PaymentMethodItem[] = [
  {
    type: "bank",
    provider: "ইসলামী ব্যাংক",
    name: "ইসলামী ব্যাংক বাংলাদেশ লিঃ (পরীক্ষা ও প্রশ্নপত্র তহবিল)",
    accountName: "নূরানী তালিমুল কুরআন বোর্ড খুলনা",
    accountNumber: "20509876543210",
    accountType: "চলতি হিসাব",
    branch: "খুলনা প্রধান শাখা",
    routingNo: "125471234",
    instructions: "ইসলামী ব্যাংক সেলফিন/অ্যাপ অথবা যেকোনো ব্যাংক অ্যাপ বা শাখা থেকে কিউআর কোড স্ক্যান করে অথবা সরাসরি একাউন্টে ট্রান্সফার করে ট্রানজেকশন আইডি (TrxID) বা স্লিপ নম্বর দিন।",
    qrCodeImage: "",
    isActive: true,
    sortOrder: 1,
    chargePercent: 0,
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = (searchParams.get("category") || "book").toLowerCase();
    const isQuestion = category === "question";
    const slug = isQuestion ? PAYMENT_V3_QUESTION_SLUG : PAYMENT_V3_BOOK_SLUG;

    const record = await prisma.pageContent.findUnique({
      where: { slug },
    });

    if (record) {
      const parsed = JSON.parse(record.content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return NextResponse.json(
          { payments: parsed, category: isQuestion ? "question" : "book" },
          { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
        );
      }
    }

    // Fallback: load existing payments for books from BoardSettings, or default question payment
    let initialList = isQuestion ? DEFAULT_QUESTION_PAYMENTS : DEFAULT_BOOK_PAYMENTS;
    if (!isQuestion) {
      try {
        const settings = await prisma.boardSettings.findFirst({
          include: { payments: { orderBy: { sortOrder: "asc" } } },
        });
        if (settings?.payments && settings.payments.length > 0) {
          initialList = settings.payments.map((p: any) => ({
            id: p.id,
            type: p.type,
            provider: p.provider,
            name: p.name || p.provider,
            logo: p.logo,
            accountName: p.accountName,
            accountNumber: p.accountNumber,
            accountType: p.accountType,
            branch: p.branch,
            routingNo: p.routingNo,
            qrCodeImage: p.qrCodeImage,
            instructions: p.instructions,
            sortOrder: p.sortOrder,
            isActive: p.isActive !== false,
          }));
        }
      } catch {}
    }

    // Seed the slug
    await prisma.pageContent
      .create({
        data: {
          slug,
          content: JSON.stringify(initialList),
        },
      })
      .catch(() => {});

    return NextResponse.json(
      { payments: initialList, category: isQuestion ? "question" : "book" },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (error: any) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      { payments: DEFAULT_BOOK_PAYMENTS, category: "book" },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const body = await request.json();
    const category = (body.category || searchParams.get("category") || "book").toLowerCase();
    const isQuestion = category === "question";
    const slug = isQuestion ? PAYMENT_V3_QUESTION_SLUG : PAYMENT_V3_BOOK_SLUG;

    const rawPayments = Array.isArray(body) ? body : body.payments || [];
    const sanitized = rawPayments.map((p: any, idx: number) => ({
      id: p.id || `pm_${Date.now()}_${idx}`,
      type: p.type || "mobile",
      provider: (p.provider || p.name || "").trim(),
      name: (p.name || p.provider || "").trim(),
      logo: p.logo || "",
      accountName: p.accountName || "",
      accountNumber: (p.accountNumber || "").trim(),
      accountType: p.accountType || "",
      branch: p.branch || "",
      routingNo: p.routingNo || "",
      qrCodeImage: p.qrCodeImage || "",
      instructions: p.instructions || "",
      sortOrder: idx + 1,
      isActive: p.isActive !== false,
      chargePercent: typeof p.chargePercent === "number" ? Math.max(0, p.chargePercent) : (parseFloat(p.chargePercent) || 0),
      chargeFixed: typeof p.chargeFixed === "number" ? Math.max(0, p.chargeFixed) : (parseFloat(p.chargeFixed) || 0),
    }));

    await prisma.pageContent.upsert({
      where: { slug },
      update: { content: JSON.stringify(sanitized) },
      create: { slug, content: JSON.stringify(sanitized) },
    });

    return NextResponse.json({
      success: true,
      category: isQuestion ? "question" : "book",
      payments: sanitized,
    });
  } catch (error: any) {
    console.error("Error saving payment methods:", error);
    return NextResponse.json({ error: "Failed to save payment methods" }, { status: 500 });
  }
}
