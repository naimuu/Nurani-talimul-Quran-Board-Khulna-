import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCommissionSettings } from "@/app/api/store/commissions/route";

export const dynamic = "force-dynamic";

const PAYOUTS_LEDGER_SLUG = "referral-payouts-ledger-v1";

export interface PayoutRecord {
  id: string;
  jimmadarPhone: string;
  jimmadarName: string;
  amount: number;
  paymentMethod: string;
  trxId?: string;
  notes?: string;
  date: string;
  recordedBy?: string;
}

export interface ReferredOrder {
  invoiceId: string;
  date: string;
  customerName: string;
  customerPhone?: string | null;
  instituteId?: string | null;
  totalAmount: number;
  paidAmount: number;
  status: string;
  commission: number;
  commissionPercent: number;
  type: "book" | "question" | "general";
  notes?: string;
}

export interface JimmadarReferralProfile {
  id: string;
  name: string;
  phone: string;
  code?: string;
  bookCommissionPercent: number;
  questionCommissionPercent: number;
  totalOrders: number;
  totalSales: number;
  totalEarned: number;
  totalPaid: number;
  currentBalance: number;
  referredOrders: ReferredOrder[];
  payouts: PayoutRecord[];
}

// Robust helper to parse referral details from order notes
export function parseReferralInfo(notes: string | null | undefined): {
  isReferred: boolean;
  name: string;
  phone: string;
  code: string;
  commission: number;
  percent: number;
} {
  if (!notes || typeof notes !== "string") {
    return { isReferred: false, name: "", phone: "", code: "", commission: 0, percent: 0 };
  }

  // Check if any jimmadar / referral indicator is present
  const hasZimadarKeyword =
    notes.includes("জিম্মাদার") ||
    notes.includes("রেফারেল") ||
    notes.includes("তাশকিল");

  if (!hasZimadarKeyword) {
    return { isReferred: false, name: "", phone: "", code: "", commission: 0, percent: 0 };
  }

  let name = "";
  let phone = "";
  let code = "";
  let commission = 0;
  let percent = 0;

  // Extract commission amount: e.g. "কমিশন: ৳500" or "কমিশন: 500"
  const commMatch = notes.match(/কমিশন:\s*৳?\s*([0-9]+(?:\.[0-9]+)?)/);
  if (commMatch) {
    commission = parseFloat(commMatch[1]) || 0;
  }

  // Extract commission percentage: e.g. "(15%)" or "15%"
  const percentMatch = notes.match(/([0-9]+(?:\.[0-9]+)?)\s*%/);
  if (percentMatch) {
    percent = parseFloat(percentMatch[1]) || 0;
  }

  // Extract phone number (standard Bangladeshi 11 digits 01xxxxxxxxx or with +8801)
  const phoneMatch = notes.match(/(?:\+?880|0)?1[3-9]\d{8}/);
  if (phoneMatch) {
    phone = phoneMatch[0].replace(/^\+88/, "");
  }

  // Extract code (e.g. AG-101 or code: xxx)
  const codeMatch = notes.match(/(?:কোড|আইডি|Code|ID):\s*([a-zA-Z0-9\-_]+)/i) || notes.match(/(AG-\d+)/i);
  if (codeMatch) {
    code = codeMatch[1].trim();
  }

  // Extract name: e.g. "[কেন্দ্র জিম্মাদার: মাওলানা রফিক (ফোন: ..." or "| জিম্মাদার: হাফেজ করিম (017...)"
  const bracketNameMatch = notes.match(/\[(?:কেন্দ্র\s*জিম্মাদার|রেফারেল\s*জিম্মাদার|জিম্মাদার|তাশকিলকারী\s*জিম্মাদার):\s*([^|(]+?)(?:\s*\(|\s*\||\])/);
  if (bracketNameMatch && bracketNameMatch[1].trim()) {
    name = bracketNameMatch[1].trim();
  } else {
    const pipeNameMatch = notes.match(/\|\s*(?:কেন্দ্র\s*জিম্মাদার|জিম্মাদার|রেফারেল):\s*([^|(]+?)(?:\s*\(|\s*\|)/);
    if (pipeNameMatch && pipeNameMatch[1].trim()) {
      name = pipeNameMatch[1].trim();
    }
  }

  // Cleanup name if it contains labels
  if (name) {
    name = name.replace(/^(?:মাওলানা|হাফেজ|মুফতি|জনাব)\s+/i, (match) => match); // preserve respectful title
    name = name.trim();
  }

  const isReferred = Boolean(phone || name || commission > 0);
  return {
    isReferred,
    name: name || "জিম্মাদার",
    phone: phone || "",
    code: code || "",
    commission,
    percent,
  };
}

async function getPayoutsLedger(): Promise<PayoutRecord[]> {
  try {
    const record = await prisma.pageContent.findUnique({
      where: { slug: PAYOUTS_LEDGER_SLUG },
    });
    if (!record) return [];
    const parsed = JSON.parse(record.content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Error reading payouts ledger:", err);
    return [];
  }
}

async function savePayoutsLedger(ledger: PayoutRecord[]): Promise<void> {
  await prisma.pageContent.upsert({
    where: { slug: PAYOUTS_LEDGER_SLUG },
    update: { content: JSON.stringify(ledger) },
    create: {
      slug: PAYOUTS_LEDGER_SLUG,
      content: JSON.stringify(ledger),
    },
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterPhone = searchParams.get("phone")?.trim();
    const filterCode = searchParams.get("code")?.trim();

    // 1. Load commission settings (for agents list)
    const settings = await getCommissionSettings();
    const customAgents = settings.customAgents || [];

    // 2. Load all payouts ledger
    const payouts = await getPayoutsLedger();

    // 3. Load all store sales with notes and customer info
    const sales = await (prisma as any).storeSale.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        invoiceId: true,
        createdAt: true,
        customerName: true,
        customerPhone: true,
        instituteId: true,
        totalAmount: true,
        paidAmount: true,
        discount: true,
        status: true,
        notes: true,
      },
    });

    // 4. Map and Aggregate per Jimmadar
    const agentMap = new Map<string, JimmadarReferralProfile>();

    // Seed map with known custom agents from settings
    for (const agent of customAgents) {
      const cleanPhone = (agent.phone || "").replace(/\D/g, "");
      const key = cleanPhone || agent.id || agent.code || agent.name;
      agentMap.set(key, {
        id: agent.id,
        name: agent.name,
        phone: agent.phone || "",
        code: agent.code || "",
        bookCommissionPercent: agent.bookCommissionPercent,
        questionCommissionPercent: agent.questionCommissionPercent ?? settings.questionCommissionPercent,
        totalOrders: 0,
        totalSales: 0,
        totalEarned: 0,
        totalPaid: 0,
        currentBalance: 0,
        referredOrders: [],
        payouts: [],
      });
    }

    // Process all sales to extract referred orders
    for (const sale of sales) {
      const parsed = parseReferralInfo(sale.notes);
      if (!parsed.isReferred) continue;

      const cleanPhone = parsed.phone.replace(/\D/g, "");
      let matchedKey = "";

      // Match with seeded custom agents
      for (const [key, profile] of Array.from(agentMap.entries())) {
        const profPhoneClean = profile.phone.replace(/\D/g, "");
        if (cleanPhone && profPhoneClean && (cleanPhone === profPhoneClean || cleanPhone.endsWith(profPhoneClean) || profPhoneClean.endsWith(cleanPhone))) {
          matchedKey = key;
          break;
        }
        if (parsed.code && profile.code && profile.code.toLowerCase() === parsed.code.toLowerCase()) {
          matchedKey = key;
          break;
        }
        if (parsed.name && profile.name && profile.name.trim() === parsed.name.trim()) {
          matchedKey = key;
          break;
        }
      }

      // If not in seeded map, create an entry for this Jimmadar
      if (!matchedKey) {
        matchedKey = cleanPhone || parsed.code || parsed.name || `jimmadar_${Date.now()}`;
        agentMap.set(matchedKey, {
          id: `agent_${matchedKey}`,
          name: parsed.name || "জিম্মাদার",
          phone: parsed.phone || "",
          code: parsed.code || "",
          bookCommissionPercent: settings.bookDefaultAgentCommissionPercent,
          questionCommissionPercent: settings.questionCommissionPercent,
          totalOrders: 0,
          totalSales: 0,
          totalEarned: 0,
          totalPaid: 0,
          currentBalance: 0,
          referredOrders: [],
          payouts: [],
        });
      }

      const profile = agentMap.get(matchedKey)!;
      if (!profile.phone && parsed.phone) profile.phone = parsed.phone;
      if (!profile.code && parsed.code) profile.code = parsed.code;

      const orderType: "book" | "question" | "general" = sale.notes?.includes("[প্রশ্নের অর্ডার]")
        ? "question"
        : sale.notes?.includes("[বইয়ের অর্ডার]")
        ? "book"
        : "general";

      const orderCommission = parsed.commission > 0
        ? parsed.commission
        : Math.round(Number(sale.totalAmount || 0) * ((parsed.percent || (orderType === "question" ? profile.questionCommissionPercent : profile.bookCommissionPercent)) / 100));

      const referredOrder: ReferredOrder = {
        invoiceId: sale.invoiceId,
        date: new Date(sale.createdAt).toISOString(),
        customerName: sale.customerName,
        customerPhone: sale.customerPhone,
        instituteId: sale.instituteId,
        totalAmount: Number(sale.totalAmount) || 0,
        paidAmount: Number(sale.paidAmount) || 0,
        status: sale.status || "Completed",
        commission: orderCommission,
        commissionPercent: parsed.percent || (orderType === "question" ? profile.questionCommissionPercent : profile.bookCommissionPercent),
        type: orderType,
        notes: sale.notes,
      };

      profile.referredOrders.push(referredOrder);
      profile.totalOrders += 1;
      profile.totalSales += Number(sale.totalAmount) || 0;
      profile.totalEarned += orderCommission;
    }

    // Attach Payouts to respective Jimmadars
    for (const payout of payouts) {
      const pClean = (payout.jimmadarPhone || "").replace(/\D/g, "");
      let found = false;
      for (const [, profile] of Array.from(agentMap.entries())) {
        const profPhoneClean = profile.phone.replace(/\D/g, "");
        if ((pClean && profPhoneClean && (pClean === profPhoneClean || profPhoneClean.endsWith(pClean) || pClean.endsWith(profPhoneClean))) ||
            (profile.name && payout.jimmadarName && profile.name.trim() === payout.jimmadarName.trim())) {
          profile.payouts.push(payout);
          profile.totalPaid += Number(payout.amount) || 0;
          found = true;
          break;
        }
      }

      // If payout exists for a jimmadar not yet in map, create entry
      if (!found && pClean) {
        agentMap.set(pClean, {
          id: `payout_agent_${pClean}`,
          name: payout.jimmadarName || "জিম্মাদার",
          phone: payout.jimmadarPhone || "",
          bookCommissionPercent: settings.bookDefaultAgentCommissionPercent,
          questionCommissionPercent: settings.questionCommissionPercent,
          totalOrders: 0,
          totalSales: 0,
          totalEarned: 0,
          totalPaid: Number(payout.amount) || 0,
          currentBalance: -Number(payout.amount) || 0,
          referredOrders: [],
          payouts: [payout],
        });
      }
    }

    // Compute balances for all
    const allProfiles = Array.from(agentMap.values()).map((p) => {
      p.currentBalance = Math.round((p.totalEarned - p.totalPaid) * 100) / 100;
      // Sort orders descending by date
      p.referredOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      // Sort payouts descending by date
      p.payouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return p;
    });

    // If query by single phone or code
    if (filterPhone || filterCode) {
      const cleanTargetPhone = (filterPhone || "").replace(/\D/g, "");
      const cleanTargetCode = (filterCode || "").toLowerCase();
      const matched = allProfiles.find((p) => {
        const profPhoneClean = p.phone.replace(/\D/g, "");
        if (cleanTargetPhone && profPhoneClean && (profPhoneClean === cleanTargetPhone || profPhoneClean.endsWith(cleanTargetPhone) || cleanTargetPhone.endsWith(profPhoneClean))) {
          return true;
        }
        if (cleanTargetCode && p.code && p.code.toLowerCase() === cleanTargetCode) {
          return true;
        }
        return false;
      });

      if (!matched) {
        return NextResponse.json({
          found: false,
          message: "এই নম্বরে কোনো রেফারেল অ্যাকাউন্ট পাওয়া যায়নি।",
        });
      }

      return NextResponse.json({
        found: true,
        profile: matched,
      });
    }

    // Global summary across all agents
    const globalSummary = {
      totalAgents: allProfiles.length,
      activeAgentsWithOrders: allProfiles.filter((p) => p.totalOrders > 0).length,
      totalReferredOrders: allProfiles.reduce((sum, p) => sum + p.totalOrders, 0),
      totalReferredSales: allProfiles.reduce((sum, p) => sum + p.totalSales, 0),
      totalCommissionEarned: allProfiles.reduce((sum, p) => sum + p.totalEarned, 0),
      totalCommissionPaid: allProfiles.reduce((sum, p) => sum + p.totalPaid, 0),
      totalBalanceDue: allProfiles.reduce((sum, p) => sum + p.currentBalance, 0),
    };

    return NextResponse.json({
      summary: globalSummary,
      agents: allProfiles,
      recentPayouts: payouts.slice(0, 20),
    });
  } catch (error: any) {
    console.error("Error in referrals API GET:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action = "payout", jimmadarPhone, jimmadarName, amount, paymentMethod = "bKash", trxId, notes, recordedBy } = body;

    if (action === "payout") {
      if (!jimmadarPhone || !amount || Number(amount) <= 0) {
        return NextResponse.json(
          { error: "জিম্মাদারের ফোন নম্বর এবং সঠিক টাকার পরিমাণ প্রদান করুন।" },
          { status: 400 }
        );
      }

      const ledger = await getPayoutsLedger();

      const newRecord: PayoutRecord = {
        id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        jimmadarPhone: String(jimmadarPhone).trim(),
        jimmadarName: jimmadarName ? String(jimmadarName).trim() : "জিম্মাদার",
        amount: Math.round(Number(amount) * 100) / 100,
        paymentMethod: paymentMethod || "Cash",
        trxId: trxId ? String(trxId).trim() : undefined,
        notes: notes ? String(notes).trim() : undefined,
        date: new Date().toISOString(),
        recordedBy: recordedBy ? String(recordedBy).trim() : "Admin",
      };

      ledger.unshift(newRecord);
      await savePayoutsLedger(ledger);

      return NextResponse.json({
        success: true,
        message: "কমিশন পে-আউট সফলভাবে রেকর্ড করা হয়েছে।",
        payout: newRecord,
      });
    }

    if (action === "delete_payout") {
      const { payoutId } = body;
      if (!payoutId) {
        return NextResponse.json({ error: "Payout ID is required" }, { status: 400 });
      }

      let ledger = await getPayoutsLedger();
      ledger = ledger.filter((p) => p.id !== payoutId);
      await savePayoutsLedger(ledger);

      return NextResponse.json({
        success: true,
        message: "পে-আউট রেকর্ডটি সফলভাবে মুছে ফেলা হয়েছে।",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in referrals API POST:", error);
    return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 });
  }
}
