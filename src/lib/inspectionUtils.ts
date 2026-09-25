import crypto from "crypto";

export interface InspectionTypeOption {
  id: string; // Unique English ID handler
  label: string;
  badge: string;
  defaultFee: number;
  description: string;
}

export const INSPECTION_TYPES: InspectionTypeOption[] = [
  {
    id: "new_elhak",
    label: "নতুন মাদরাসা পরিদর্শন (নতুন এলহাক)",
    badge: "নতুন এলহাক",
    defaultFee: 3000,
    description: "প্রাথমিক পাঠদানের অনুমতি, প্রাতিষ্ঠানিক স্বীকৃতি ও স্থায়ী অন্তর্ভুক্তি।",
  },
  {
    id: "regular_annual",
    label: "নিয়মিত বার্ষিক পরিদর্শন",
    badge: "বার্ষিক নিরীক্ষা",
    defaultFee: 1500,
    description: "গুণগত মান অক্ষুণ্ণ রাখা ও বার্ষিক নবায়ন নিশ্চিতকরণ।",
  },
  {
    id: "re_inspection",
    label: "পুনঃপরিদর্শন",
    badge: "পুনঃপরিদর্শন",
    defaultFee: 1000,
    description: "চিহ্নিত ত্রুটি নিরসন ও পূর্ববর্তী শর্ত পূরণের অগ্রগতি যাচাই।",
  },
  {
    id: "code_allocation",
    label: "নিবন্ধন ও কোড বরাদ্দ",
    badge: "কোড বরাদ্দ",
    defaultFee: 2000,
    description: "স্থায়ী ইলহাক কোড বরাদ্দ ও কেন্দ্রীয় ডাটাবেজ অন্তর্ভুক্তি।",
  },
  {
    id: "exam_center",
    label: "পরীক্ষাকেন্দ্র পরিদর্শন",
    badge: "পরীক্ষাকেন্দ্র",
    defaultFee: 2500,
    description: "কেন্দ্রীয় ৩য় ও ৫ম শ্রেণির পরীক্ষা কেন্দ্র পরিচালনার উপযোগিতা যাচাই।",
  },
  {
    id: "training_center",
    label: "মুয়াল্লিম প্রশিক্ষণ কেন্দ্র পরিদর্শন",
    badge: "প্রশিক্ষণ কেন্দ্র",
    defaultFee: 3000,
    description: "মুয়াল্লিম প্রশিক্ষণ ব্যাচ ও আবাসিক মেস সুবিধা নিশ্চিতকরণ।",
  },
  {
    id: "special_investigation",
    label: "বিশেষ পরিদর্শন ও তদন্ত",
    badge: "বিশেষ তদন্ত",
    defaultFee: 0,
    description: "অভিযোগ নিষ্পত্তি, অসদুপায় বা সীমানা দ্বন্দ্ব সরেজমিন নিরসন।",
  },
];

export interface GeneralChecklistItem {
  id: string; // Unique English ID handler
  sl: string;
  label: string;
  type: "yes_no_partial" | "good_moderate_weak" | "numeric" | "custom_select";
  options?: { value: string; label: string; points: number }[];
}

export const GENERAL_CHECKLIST_ITEMS: GeneralChecklistItem[] = [
  {
    id: "syllabus_compliance",
    sl: "০১",
    label: "প্রতিষ্ঠানটি বোর্ডের সিলেবাস পরিপূর্ণ অনুসরণ করে কি-না?",
    type: "yes_no_partial",
    options: [
      { value: "yes", label: "হ্যাঁ", points: 10 },
      { value: "partial", label: "আংশিক", points: 5 },
      { value: "no", label: "না", points: 0 },
    ],
  },
  {
    id: "trained_teachers_method",
    sl: "০২",
    label: "প্রশিক্ষণ প্রাপ্ত শিক্ষক দ্বারা নিয়ম-পদ্ধতি অনুযায়ী পাঠদান হচ্ছে কি-না?",
    type: "yes_no_partial",
    options: [
      { value: "yes", label: "হ্যাঁ", points: 10 },
      { value: "partial", label: "আংশিক", points: 5 },
      { value: "no", label: "না", points: 0 },
    ],
  },
  {
    id: "classroom_environment",
    sl: "০৩",
    label: "শ্রেণি কক্ষের পরিবেশ ঠিক আছে কি-না?",
    type: "yes_no_partial",
    options: [
      { value: "yes", label: "হ্যাঁ", points: 10 },
      { value: "partial", label: "আংশিক", points: 5 },
      { value: "no", label: "না", points: 0 },
    ],
  },
  {
    id: "teachers_weekly_meeting",
    sl: "০৪",
    label: "লেখা-পড়ার মানোন্নয়নে শিক্ষকদের সাপ্তাহিক বৈঠক হয় কি-না?",
    type: "yes_no_partial",
    options: [
      { value: "yes", label: "হ্যাঁ", points: 10 },
      { value: "partial", label: "আংশিক", points: 5 },
      { value: "no", label: "না", points: 0 },
    ],
  },
  {
    id: "director_monthly_meeting",
    sl: "০৫",
    label: "পরিচালকের সঙ্গে মাসিক বৈঠক চালু আছে কি-না?",
    type: "yes_no_partial",
    options: [
      { value: "yes", label: "হ্যাঁ", points: 10 },
      { value: "partial", label: "আংশিক", points: 5 },
      { value: "no", label: "না", points: 0 },
    ],
  },
  {
    id: "talim_quality",
    sl: "০৬",
    label: "তা'লীমের মান কেমন?",
    type: "good_moderate_weak",
    options: [
      { value: "good", label: "ভাল", points: 10 },
      { value: "moderate", label: "মধ্যম", points: 6 },
      { value: "weak", label: "দুর্বল", points: 2 },
    ],
  },
  {
    id: "tarbiyat_quality",
    sl: "০৭",
    label: "তরবিয়াতের মান কেমন?",
    type: "good_moderate_weak",
    options: [
      { value: "good", label: "ভাল", points: 10 },
      { value: "moderate", label: "মধ্যম", points: 6 },
      { value: "weak", label: "দুর্বল", points: 2 },
    ],
  },
  {
    id: "handwriting_quality",
    sl: "০৮",
    label: "হাতের লেখার মান কেমন?",
    type: "good_moderate_weak",
    options: [
      { value: "good", label: "ভাল", points: 10 },
      { value: "moderate", label: "মধ্যম", points: 6 },
      { value: "weak", label: "দুর্বল", points: 2 },
    ],
  },
  {
    id: "cleanliness_sanitation",
    sl: "০৯",
    label: "পরিষ্কার-পরিচ্ছন্নতা কি সন্তোষজনক?",
    type: "yes_no_partial",
    options: [
      { value: "yes", label: "হ্যাঁ", points: 10 },
      { value: "partial", label: "আংশিক", points: 5 },
      { value: "no", label: "না", points: 0 },
    ],
  },
  {
    id: "previous_advice_implemented",
    sl: "১০",
    label: "পরিদর্শকদের দেওয়া পূর্বের পরামর্শ বাস্তবায়ন হয়েছে কি-না?",
    type: "yes_no_partial",
    options: [
      { value: "yes", label: "হ্যাঁ", points: 10 },
      { value: "partial", label: "আংশিক", points: 5 },
      { value: "no", label: "না", points: 0 },
    ],
  },
  {
    id: "moallem_jore_attendance",
    sl: "১১",
    label: "বোর্ড কর্তৃক অনুষ্ঠিত মোয়াল্লিম জোড়ে উপস্থিতি কত?",
    type: "numeric",
  },
];

export interface StandardSubject {
  id: string; // Unique English ID handler e.g. subj_quran_sharif
  sl: string;
  name: string;
}

export const STANDARD_INSPECTION_SUBJECTS: StandardSubject[] = [
  { id: "subj_quran_sharif", sl: "ক", name: "কুরআন শরীফ" },
  { id: "subj_kalima", sl: "খ", name: "কালিমা" },
  { id: "subj_hadith_sharif", sl: "গ", name: "হাদিস শরীফ" },
  { id: "subj_masayil", sl: "ঘ", name: "মাসায়িল" },
  { id: "subj_adiyaye_salat", sl: "ঙ", name: "আদিয়ায়ে সালাত" },
  { id: "subj_adiyaye_masnoona", sl: "চ", name: "আদিয়ায়ে মাসনূনা" },
  { id: "subj_asmaul_husna", sl: "ছ", name: "আসমাউল হুসনা" },
  { id: "subj_arabic_writing", sl: "জ", name: "আরবি লেখা" },
  { id: "subj_bangla", sl: "ঝ", name: "বাংলা" },
  { id: "subj_math", sl: "ঞ", name: "গণিত" },
  { id: "subj_english", sl: "ট", name: "ইংরেজি" },
  { id: "subj_geography_social", sl: "ঠ", name: "ভূগোল ও সমাজ" },
  { id: "subj_urdu_others", sl: "ড", name: "উর্দু ও অন্যান্য" },
];

export interface StandardClass {
  id: string; // Unique English ID handler e.g. cls_play
  name: string;
}

export const STANDARD_INSPECTION_CLASSES: StandardClass[] = [
  { id: "cls_play", name: "প্লে" },
  { id: "cls_nursery", name: "নার্সারী" },
  { id: "cls_1", name: "১ম" },
  { id: "cls_2", name: "২য়" },
  { id: "cls_3", name: "৩য়" },
  { id: "cls_4", name: "৪র্থ" },
  { id: "cls_5", name: "৫ম" },
];

/**
 * Calculates overall inspection score (0 to 100%) and Grade
 */
export function calculateInspectionScore(
  generalChecklist: Record<string, any>,
  subjectMatrix: Record<string, Record<string, string>>,
  teacherStats?: { total?: number; present?: number },
  studentStats?: Record<string, number>,
  checklistConfig?: GeneralChecklistItem[]
): {
  totalScore: number;
  grade: "GRADE_A" | "GRADE_B" | "GRADE_C" | "UNAPPROVED";
  gradeLabel: string;
  badgeColor: string;
  generalPoints: number;
  subjectPoints: number;
} {
  // 1. General Checklist Points with Dynamic Config & Negative Marks support
  const items = checklistConfig && checklistConfig.length > 0 ? checklistConfig : GENERAL_CHECKLIST_ITEMS;
  let generalObtained = 0;
  let generalMax = 0;

  for (const item of items) {
    if (item.options && item.options.length > 0) {
      // Find highest positive points possible for denominator
      const maxOpt = Math.max(0, ...item.options.map((o) => Number(o.points) || 0));
      generalMax += maxOpt > 0 ? maxOpt : 10;

      const val = generalChecklist?.[item.id];
      const opt = item.options.find((o) => o.value === val);
      if (opt) {
        // Can be positive (e.g. +10, +5) or negative (e.g. -5, -2, -10 penalty)
        generalObtained += Number(opt.points) || 0;
      }
    }
  }

  // Attendance in Moallem Jore (bonus 10 max if present in criteria)
  const hasJore = items.some((i) => i.id === "moallem_jore_attendance");
  if (hasJore) {
    const joreCount = Number(generalChecklist?.moallem_jore_attendance || 0);
    if (joreCount > 0) {
      generalObtained += Math.min(10, joreCount * 2.5);
      generalMax += 10;
    }
  }

  // Floor at 0 to avoid negative percentage if penalties are severe
  const effectiveGeneralObtained = Math.max(0, generalObtained);
  const generalScorePercent = generalMax > 0 ? Math.min(100, (effectiveGeneralObtained / generalMax) * 100) : 0;

  // 2. Subject Matrix Points (50% weight)
  let subjectObtained = 0;
  let subjectMax = 0;

  if (subjectMatrix && typeof subjectMatrix === "object") {
    for (const classKey of Object.keys(subjectMatrix)) {
      const classSubjects = subjectMatrix[classKey] || {};
      for (const subjKey of Object.keys(classSubjects)) {
        const rating = classSubjects[subjKey];
        if (rating && rating !== "na") {
          subjectMax += 3;
          if (rating === "good") subjectObtained += 3;
          else if (rating === "moderate") subjectObtained += 2;
          else if (rating === "weak") subjectObtained += 1;
        }
      }
    }
  }

  const subjectScorePercent = subjectMax > 0 ? (subjectObtained / subjectMax) * 100 : generalScorePercent;

  // Composite Total Score
  const totalScore = Math.round(generalScorePercent * 0.45 + subjectScorePercent * 0.55);

  let grade: "GRADE_A" | "GRADE_B" | "GRADE_C" | "UNAPPROVED" = "UNAPPROVED";
  let gradeLabel = "অননুমোদিত / সংশোধন আবশ্যক";
  let badgeColor = "bg-rose-50 text-rose-700 border-rose-200";

  if (totalScore >= 80) {
    grade = "GRADE_A";
    gradeLabel = "গ্রেড এ (উন্নত মান)";
    badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (totalScore >= 65) {
    grade = "GRADE_B";
    gradeLabel = "গ্রেড বি (সন্তোষজনক)";
    badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
  } else if (totalScore >= 50) {
    grade = "GRADE_C";
    gradeLabel = "গ্রেড সি (শর্তসাপেক্ষ)";
    badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
  }

  return {
    totalScore,
    grade,
    gradeLabel,
    badgeColor,
    generalPoints: Math.round(generalScorePercent),
    subjectPoints: Math.round(subjectScorePercent),
  };
}

/**
 * Calculates Haversine distance between two coordinates in meters
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

const HMAC_SECRET = process.env.HMAC_SECRET || "nurani_khulna_secret_key_2026";

/**
 * Generates tamper-proof HMAC verification token
 */
export function generateInspectionToken(
  trackingNo: string,
  madrasahCode: string,
  dateStr: string
): string {
  const data = `${trackingNo}:${madrasahCode}:${dateStr}`;
  return crypto.createHmac("sha256", HMAC_SECRET).update(data).digest("hex").substring(0, 32);
}

/**
 * Verifies tamper-proof HMAC token
 */
export function verifyInspectionToken(
  token: string,
  trackingNo: string,
  madrasahCode: string,
  dateStr: string
): boolean {
  if (!token) return false;
  const expected = generateInspectionToken(trackingNo, madrasahCode, dateStr);
  return token.toLowerCase() === expected.toLowerCase();
}
