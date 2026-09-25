import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";
import InspectionApplication from "@/lib/models/InspectionApplication";
import ExamSession from "@/lib/models/ExamQuestion";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Standard CE to Hijri academic year correlation in Bangladesh Islamic education
const KNOWN_YEAR_PAIRS: Array<{
  ce: string;
  ceBn: string;
  hijri: string;
  hijriFull?: string;
  isCurrent?: boolean;
}> = [
  { ce: "2026", ceBn: "২০২৬", hijri: "১৪৪৭-৪৮", hijriFull: "১৪৪৭-১৪৪৮ হিজরি", isCurrent: true },
  { ce: "2025", ceBn: "২০২৫", hijri: "১৪৪৬-৪৭", hijriFull: "১৪৪৬-১৪৪৭ হিজরি" },
  { ce: "2024", ceBn: "২০২৪", hijri: "১৪৪৫-৪৬", hijriFull: "১৪৪৫-১৪৪৬ হিজরি" },
  { ce: "2027", ceBn: "২০২৭", hijri: "১৪৪৮-৪৯", hijriFull: "১৪৪৮-১৪৪৯ হিজরি" },
  { ce: "2028", ceBn: "২০২৮", hijri: "১৪৪৯-৫০", hijriFull: "১৪৪৯-১৪৫০ হিজরি" },
  { ce: "2029", ceBn: "২০২৯", hijri: "১৪৫০-৫১", hijriFull: "১৪৫০-১৪৫১ হিজরি" },
  { ce: "2023", ceBn: "২০২৩", hijri: "১৪৪৪-৪৫", hijriFull: "১৪৪৪-১৪৪৫ হিজরি" },
];

function toBengaliDigits(str: string): string {
  const bn = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return str.replace(/[0-9]/g, (d) => bn[parseInt(d, 10)] || d);
}

function toEnglishDigits(str: string): string {
  const en: Record<string, string> = {
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
    "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
  };
  return str.replace(/[০-৯]/g, (d) => en[d] || d);
}

export async function GET() {
  try {
    await connectDB();

    // 1. Fetch real academic years from Inspection Applications
    let appCeYears: string[] = [];
    let appHijriYears: string[] = [];
    try {
      appCeYears = (await InspectionApplication.distinct("academicYearCe")).filter(Boolean);
      appHijriYears = (await InspectionApplication.distinct("academicYearHijri")).filter(Boolean);
    } catch (e) {
      console.warn("Could not fetch distinct years from InspectionApplication:", e);
    }

    // 2. Fetch sessions from ExamSession collection
    let examSessionYears: string[] = [];
    try {
      const sessions = await ExamSession.find({}).select("sessionYear title").lean();
      examSessionYears = sessions
        .map((s: any) => s.sessionYear || s.title)
        .filter(Boolean) as string[];
    } catch (e) {
      console.warn("Could not fetch sessions from ExamSession:", e);
    }

    // 3. Fetch from CurriculumExamYear collection if available
    let curriculumYears: string[] = [];
    try {
      const db = mongoose.connection.db;
      if (db) {
        curriculumYears = (await db.collection("CurriculumExamYear").distinct("year")).filter(Boolean);
      }
    } catch (e) {
      console.warn("Could not fetch CurriculumExamYear:", e);
    }

    // 4. Aggregate distinct CE years
    const rawCeSet = new Set<string>();

    // Add DB values
    [...appCeYears, ...examSessionYears, ...curriculumYears].forEach((y) => {
      const str = String(y).trim();
      if (str) {
        const cleanDigits = toEnglishDigits(str).replace(/[^0-9]/g, "");
        if (cleanDigits.length === 4) {
          rawCeSet.add(cleanDigits);
        } else {
          rawCeSet.add(str);
        }
      }
    });

    // Add standard known pairs
    KNOWN_YEAR_PAIRS.forEach((p) => {
      rawCeSet.add(p.ce);
    });

    // Sort CE years: prioritize 2026/current year at the top, then recent/upcoming
    const currentYear = "2026";
    const sortedCeValues = Array.from(rawCeSet).sort((a, b) => {
      const cleanA = toEnglishDigits(a).replace(/[^0-9]/g, "");
      const cleanB = toEnglishDigits(b).replace(/[^0-9]/g, "");
      if (cleanA === currentYear) return -1;
      if (cleanB === currentYear) return 1;
      const numA = parseInt(cleanA, 10) || 0;
      const numB = parseInt(cleanB, 10) || 0;
      return numB - numA;
    });

    // Build CE Options
    const ceYears = sortedCeValues.map((val) => {
      const enDigits = toEnglishDigits(val).replace(/[^0-9]/g, "");
      const bnDigits = enDigits ? toBengaliDigits(enDigits) : val;

      return {
        id: enDigits || val,
        bn_name: enDigits || val,
        name: bnDigits ? `২০${bnDigits.slice(2)}` : bnDigits,
      };
    });

    // 5. Aggregate distinct Hijri years
    const rawHijriSet = new Set<string>();

    appHijriYears.forEach((hy) => {
      const str = String(hy).trim();
      if (str) rawHijriSet.add(str);
    });

    KNOWN_YEAR_PAIRS.forEach((p) => {
      rawHijriSet.add(p.hijri);
    });

    // Sort Hijri years: prioritize 1447-48 at the top, then recent/upcoming
    const sortedHijriValues = Array.from(rawHijriSet).sort((a, b) => {
      if (a === "১৪৪৭-৪৮") return -1;
      if (b === "১৪৪৭-৪৮") return 1;
      const numA = parseInt(toEnglishDigits(a).split("-")[0].replace(/[^0-9]/g, ""), 10) || 0;
      const numB = parseInt(toEnglishDigits(b).split("-")[0].replace(/[^0-9]/g, ""), 10) || 0;
      return numB - numA;
    });

    // Build Hijri Options
    const hijriYears = sortedHijriValues.map((hy) => {
      return {
        id: hy,
        bn_name: hy,
        name: "হিজরী",
      };
    });

    // 6. Build Mapping between CE and Hijri for automatic syncing
    const ceToHijriMap: Record<string, string> = {};
    KNOWN_YEAR_PAIRS.forEach((p) => {
      ceToHijriMap[p.ce] = p.hijri;
      ceToHijriMap[p.ceBn] = p.hijri;
    });

    return NextResponse.json({
      success: true,
      ceYears,
      hijriYears,
      ceToHijriMap,
      defaultCe: "2026",
      defaultHijri: "১৪৪৭-৪৮",
    });
  } catch (error: any) {
    console.error("Fetch academic years error:", error);
    return NextResponse.json(
      {
        error: "শিক্ষাবর্ষ তথ্য লোড করা যায়নি",
        ceYears: KNOWN_YEAR_PAIRS.map((p) => ({
          id: p.ce,
          name: `${p.ceBn} শিক্ষাবর্ষ`,
          bn_name: p.ce,
        })),
        hijriYears: KNOWN_YEAR_PAIRS.map((p) => ({
          id: p.hijri,
          name: `${p.hijri} হিজরী`,
          bn_name: p.hijri,
        })),
        ceToHijriMap: { "2026": "১৪৪৭-৪৮", "২০২৬": "১৪৪৭-৪৮" },
      },
      { status: 500 }
    );
  }
}
