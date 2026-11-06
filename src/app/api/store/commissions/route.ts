import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";

export const dynamic = "force-dynamic";

const COMMISSION_SLUG = "store-commission-settings-v2";

export interface CustomAgent {
  id: string;
  name: string;
  phone: string;
  code?: string;
  bookCommissionPercent: number;
  questionCommissionPercent?: number;
  isActive: boolean;
  notes?: string;
}

export interface CommissionSettingsData {
  bookRetailCommissionPercent: number; // খুচরা ক্রেতা কমিশন (%)
  bookMadrasaCommissionPercent: number; // মাদরাসা কমিশন (%)
  bookDefaultAgentCommissionPercent: number; // সাধারণ জিম্মাদার/এজেন্ট কমিশন (%)
  questionCommissionPercent: number; // প্রশ্নপত্র জিম্মাদার কমিশন (%)
  questionCommissionEnabled: boolean;
  customAgents: CustomAgent[];
}

const DEFAULT_COMMISSION_SETTINGS: CommissionSettingsData = {
  bookRetailCommissionPercent: 0,
  bookMadrasaCommissionPercent: 10,
  bookDefaultAgentCommissionPercent: 15,
  questionCommissionPercent: 15,
  questionCommissionEnabled: true,
  customAgents: [
    {
      id: "agent_demo_1",
      name: "মাওলানা মোস্তাফিজুর রহমান",
      phone: "01711000001",
      code: "AG-101",
      bookCommissionPercent: 20,
      questionCommissionPercent: 15,
      isActive: true,
      notes: "খুলনা সদর প্রধান জিম্মাদার",
    },
    {
      id: "agent_demo_2",
      name: "মাওলানা মোহাম্মদ নাঈম",
      phone: "01711000002",
      code: "AG-102",
      bookCommissionPercent: 18,
      questionCommissionPercent: 15,
      isActive: true,
      notes: "যশোর জেলা প্রতিনিধি",
    },
  ],
};

export async function getCommissionSettings(): Promise<CommissionSettingsData> {
  try {
    const record = await prisma.pageContent.findUnique({
      where: { slug: COMMISSION_SLUG },
    });

    if (!record) {
      await prisma.pageContent
        .create({
          data: {
            slug: COMMISSION_SLUG,
            content: JSON.stringify(DEFAULT_COMMISSION_SETTINGS),
          },
        })
        .catch(() => {});
      return DEFAULT_COMMISSION_SETTINGS;
    }

    const parsed = JSON.parse(record.content);
    return {
      bookRetailCommissionPercent:
        typeof parsed.bookRetailCommissionPercent === "number"
          ? parsed.bookRetailCommissionPercent
          : DEFAULT_COMMISSION_SETTINGS.bookRetailCommissionPercent,
      bookMadrasaCommissionPercent:
        typeof parsed.bookMadrasaCommissionPercent === "number"
          ? parsed.bookMadrasaCommissionPercent
          : DEFAULT_COMMISSION_SETTINGS.bookMadrasaCommissionPercent,
      bookDefaultAgentCommissionPercent:
        typeof parsed.bookDefaultAgentCommissionPercent === "number"
          ? parsed.bookDefaultAgentCommissionPercent
          : DEFAULT_COMMISSION_SETTINGS.bookDefaultAgentCommissionPercent,
      questionCommissionPercent:
        typeof parsed.questionCommissionPercent === "number"
          ? parsed.questionCommissionPercent
          : DEFAULT_COMMISSION_SETTINGS.questionCommissionPercent,
      questionCommissionEnabled:
        parsed.questionCommissionEnabled !== undefined
          ? Boolean(parsed.questionCommissionEnabled)
          : DEFAULT_COMMISSION_SETTINGS.questionCommissionEnabled,
      customAgents: Array.isArray(parsed.customAgents)
        ? parsed.customAgents
        : DEFAULT_COMMISSION_SETTINGS.customAgents,
    };
  } catch (err) {
    console.error("Error reading commission settings:", err);
    return DEFAULT_COMMISSION_SETTINGS;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lookup = searchParams.get("lookup")?.trim();

    const settings = await getCommissionSettings();

    // If looking up a specific agent by phone or ID
    if (lookup) {
      const cleanLookup = lookup.replace(/\D/g, "");
      const matchedCustomAgent = settings.customAgents.find((a) => {
        if (!a.isActive) return false;
        if (a.phone && a.phone.replace(/\D/g, "") === cleanLookup) return true;
        if (a.code && a.code.toLowerCase() === lookup.toLowerCase()) return true;
        if (a.name && a.name.toLowerCase().includes(lookup.toLowerCase())) return true;
        return false;
      });

      if (matchedCustomAgent) {
        return NextResponse.json({
          found: true,
          agent: matchedCustomAgent,
          bookCommissionPercent: matchedCustomAgent.bookCommissionPercent,
          questionCommissionPercent:
            matchedCustomAgent.questionCommissionPercent ?? settings.questionCommissionPercent,
          isCustom: true,
        });
      }

      // Check DB User table if registered as agent/jimmadar
      try {
        await connectDB();
        const user = await User.findOne({
          $or: [
            { phone: lookup },
            { phone: cleanLookup },
            { email: lookup.toLowerCase() },
          ],
        }).lean();

        if (user) {
          return NextResponse.json({
            found: true,
            agent: {
              id: (user as any)._id?.toString() || "db_user",
              name: (user as any).name || "নিবন্ধিত জিম্মাদার",
              phone: (user as any).phone || lookup,
              code: (user as any).code || lookup,
              bookCommissionPercent: settings.bookDefaultAgentCommissionPercent,
              questionCommissionPercent: settings.questionCommissionPercent,
              isActive: true,
            },
            bookCommissionPercent: settings.bookDefaultAgentCommissionPercent,
            questionCommissionPercent: settings.questionCommissionPercent,
            isCustom: false,
          });
        }
      } catch (userDbErr) {
        console.warn("DB user lookup warning in commissions API:", userDbErr);
      }

      return NextResponse.json({ found: false, message: "জিম্মাদার পাওয়া যায়নি" });
    }

    return NextResponse.json(settings, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (error: any) {
    console.error("Error in commissions API GET:", error);
    return NextResponse.json(DEFAULT_COMMISSION_SETTINGS, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const current = await getCommissionSettings();

    const updated: CommissionSettingsData = {
      bookRetailCommissionPercent:
        body.bookRetailCommissionPercent !== undefined
          ? Math.max(0, Math.min(100, Number(body.bookRetailCommissionPercent) || 0))
          : current.bookRetailCommissionPercent,
      bookMadrasaCommissionPercent:
        body.bookMadrasaCommissionPercent !== undefined
          ? Math.max(0, Math.min(100, Number(body.bookMadrasaCommissionPercent) || 0))
          : current.bookMadrasaCommissionPercent,
      bookDefaultAgentCommissionPercent:
        body.bookDefaultAgentCommissionPercent !== undefined
          ? Math.max(0, Math.min(100, Number(body.bookDefaultAgentCommissionPercent) || 0))
          : current.bookDefaultAgentCommissionPercent,
      questionCommissionPercent:
        body.questionCommissionPercent !== undefined
          ? Math.max(0, Math.min(100, Number(body.questionCommissionPercent) || 0))
          : current.questionCommissionPercent,
      questionCommissionEnabled:
        body.questionCommissionEnabled !== undefined
          ? Boolean(body.questionCommissionEnabled)
          : current.questionCommissionEnabled,
      customAgents: Array.isArray(body.customAgents) ? body.customAgents : current.customAgents,
    };

    await prisma.pageContent.upsert({
      where: { slug: COMMISSION_SLUG },
      update: { content: JSON.stringify(updated) },
      create: { slug: COMMISSION_SLUG, content: JSON.stringify(updated) },
    });

    // Also sync with flags slug so question-order can read questionCommissionPercent seamlessly
    try {
      const flagsRecord = await prisma.pageContent.findUnique({ where: { slug: "cover-display-flags" } });
      if (flagsRecord) {
        const parsedFlags = JSON.parse(flagsRecord.content);
        parsedFlags.zimadarCommissionPercent = updated.questionCommissionPercent;
        parsedFlags.zimadarCommissionEnabled = updated.questionCommissionEnabled;
        await prisma.pageContent.update({
          where: { slug: "cover-display-flags" },
          data: { content: JSON.stringify(parsedFlags) },
        });
      }
    } catch {}

    return NextResponse.json(updated, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (error: any) {
    console.error("Error in commissions API PUT:", error);
    return NextResponse.json({ error: "Failed to update commission settings" }, { status: 500 });
  }
}
