import { prisma } from "@/lib/prisma";

export const COMMISSION_SLUG = "store-commission-settings-v2";

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

export const DEFAULT_COMMISSION_SETTINGS: CommissionSettingsData = {
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
    name = name.replace(/^(?:মাওলানা|হাফেজ|মুফতি|জনাব)\s+/i, (match) => match);
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