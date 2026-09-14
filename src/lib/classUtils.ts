export interface ClassInfo {
  id: string; // Unique English ID handler e.g. "cls_shishu", "cls_1"
  name: string;
  order?: number;
}

export const DEFAULT_PRESET_CLASSES: ClassInfo[] = [
  { id: "cls_shishu", name: "শিশু / নার্সারি", order: 1 },
  { id: "cls_1", name: "১ম শ্রেণি", order: 2 },
  { id: "cls_2", name: "২য় শ্রেণি", order: 3 },
  { id: "cls_3", name: "৩য় শ্রেণি", order: 4 },
  { id: "cls_4", name: "৪র্থ শ্রেণি", order: 5 },
  { id: "cls_5", name: "৫ম শ্রেণি", order: 6 },
  { id: "cls_hifz", name: "হিফজুল কুরআন", order: 7 },
  { id: "cls_tajweed", name: "তাজবীদ ও কিরাত", order: 8 },
  { id: "cls_muallim", name: "মুয়াল্লিম প্রশিক্ষণ", order: 9 },
];

/**
 * Canonical dictionary mapping aliases, numbers, and Bengali strings to unique English ID handlers
 */
export const CLASS_CANONICAL_PRESETS: Record<string, string> = {
  // Shishu / Nursery / Play / KG
  "shishu": "cls_shishu",
  "nursery": "cls_nursery",
  "play": "cls_play",
  "kg": "cls_kg",
  "কেজি": "cls_kg",
  "শিশু": "cls_shishu",
  "শিশু শ্রেণি": "cls_shishu",
  "শিশু / নার্সারি": "cls_shishu",
  "শিশু ও নার্সারি": "cls_shishu",
  "নার্সারি": "cls_nursery",
  "প্লে": "cls_play",

  // Class 1
  "1": "cls_1",
  "class 1": "cls_1",
  "class_1": "cls_1",
  "one": "cls_1",
  "১ম": "cls_1",
  "১ম শ্রেণি": "cls_1",
  "১ম শ্রেণী": "cls_1",
  "প্রথম শ্রেণি": "cls_1",
  "প্রথম শ্রেণী": "cls_1",

  // Class 2
  "2": "cls_2",
  "class 2": "cls_2",
  "class_2": "cls_2",
  "two": "cls_2",
  "২য়": "cls_2",
  "২য় শ্রেণি": "cls_2",
  "২য় শ্রেণী": "cls_2",
  "দ্বিতীয় শ্রেণি": "cls_2",
  "দ্বিতীয় শ্রেণী": "cls_2",

  // Class 3
  "3": "cls_3",
  "class 3": "cls_3",
  "class_3": "cls_3",
  "three": "cls_3",
  "৩য়": "cls_3",
  "৩য় শ্রেণি": "cls_3",
  "৩য় শ্রেণী": "cls_3",
  "তৃতীয় শ্রেণি": "cls_3",
  "তৃতীয় শ্রেণী": "cls_3",

  // Class 4
  "4": "cls_4",
  "class 4": "cls_4",
  "class_4": "cls_4",
  "four": "cls_4",
  "৪র্থ": "cls_4",
  "৪র্থ শ্রেণি": "cls_4",
  "৪র্থ শ্রেণী": "cls_4",
  "চতুর্থ শ্রেণি": "cls_4",
  "চতুর্থ শ্রেণী": "cls_4",

  // Class 5
  "5": "cls_5",
  "class 5": "cls_5",
  "class_5": "cls_5",
  "five": "cls_5",
  "৫ম": "cls_5",
  "৫ম শ্রেণি": "cls_5",
  "৫ম শ্রেণী": "cls_5",
  "পঞ্চম শ্রেণি": "cls_5",
  "পঞ্চম শ্রেণী": "cls_5",

  // Specialized
  "hifz": "cls_hifz",
  "হিফজুল কুরআন": "cls_hifz",
  "হিফজ": "cls_hifz",
  "হিফয": "cls_hifz",
  "tajweed": "cls_tajweed",
  "তাজবীদ ও কিরাত": "cls_tajweed",
  "তাজবীদ": "cls_tajweed",
  "কিরাত": "cls_tajweed",
  "muallim": "cls_muallim",
  "মুয়াল্লিম প্রশিক্ষণ": "cls_muallim",
  "মুয়াল্লিম": "cls_muallim",
  "মুয়াল্লিমা": "cls_muallima",
};

/**
 * Returns a stable, guaranteed unique English ID handler for a class.
 * Ensures questions and classes stay permanently connected even if class titles/names are updated or renamed.
 */
export function getCanonicalClassId(
  input?: string,
  existingCurriculumClasses?: { id: string; name: string }[]
): string {
  if (!input || !input.trim()) return "cls_general";
  const raw = input.trim();

  // 1. If already an English class ID handler like "cls_1" or "cls_shishu", return as is
  if (raw.startsWith("cls_")) {
    return raw.toLowerCase();
  }

  // 2. Exact match in canonical presets
  const lower = raw.toLowerCase();
  if (CLASS_CANONICAL_PRESETS[lower]) {
    return CLASS_CANONICAL_PRESETS[lower];
  }
  if (CLASS_CANONICAL_PRESETS[raw]) {
    return CLASS_CANONICAL_PRESETS[raw];
  }

  // 3. Resolve by ID from curriculum classes
  if (existingCurriculumClasses && existingCurriculumClasses.length > 0) {
    const matchById = existingCurriculumClasses.find((c) => String(c.id) === raw);
    if (matchById && matchById.name) {
      return getCanonicalClassId(matchById.name);
    }
  }

  // 4. Substring detection for Bengali class numbers & names
  if (raw.includes("১ম") || raw.includes("প্রথম")) return "cls_1";
  if (raw.includes("২য়") || raw.includes("দ্বিতীয়")) return "cls_2";
  if (raw.includes("৩য়") || raw.includes("তৃতীয়")) return "cls_3";
  if (raw.includes("৪র্থ") || raw.includes("চতুর্থ")) return "cls_4";
  if (raw.includes("৫ম") || raw.includes("পঞ্চম")) return "cls_5";
  if (raw.includes("শিশু") || raw.includes("নার্সারি")) return "cls_shishu";
  if (raw.includes("হিফজ") || raw.includes("হিফয")) return "cls_hifz";
  if (raw.includes("তাজবীদ") || raw.includes("কিরাত")) return "cls_tajweed";
  if (raw.includes("মুয়াল্লিম") || raw.includes("মুয়াল্লিমা")) return "cls_muallim";

  // 5. English slug clean
  const cleanEnglishSlug = raw
    .replace(/[^\w\s-]/gi, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  if (cleanEnglishSlug && cleanEnglishSlug.length >= 2) {
    return `cls_${cleanEnglishSlug}`;
  }

  // 6. Deterministic short hash for arbitrary custom classes
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash).toString(36);
  return `cls_custom_${positiveHash}`;
}

export const generateClassId = getCanonicalClassId;

/**
 * Generates or resolves a unique English ID handler for an exam.
 * E.g. "SEM-1", "SEM-2", "ANNUAL", "SPECIAL"
 */
export function generateExamCode(name?: string, term?: string): string {
  const text = `${term || ""} ${name || ""}`.toLowerCase();
  if (text.includes("১ম") || text.includes("প্রথম") || text.includes("sem-1") || text.includes("sem 1")) {
    return "SEM-1";
  }
  if (text.includes("২য়") || text.includes("দ্বিতীয়") || text.includes("sem-2") || text.includes("sem 2")) {
    return "SEM-2";
  }
  if (text.includes("৩য়") || text.includes("তৃতীয়") || text.includes("sem-3") || text.includes("sem 3")) {
    return "SEM-3";
  }
  if (text.includes("বার্ষিক") || text.includes("annual") || text.includes("সমাপনী")) {
    return "ANNUAL";
  }
  if (text.includes("বৃত্তি") || text.includes("scholarship")) {
    return "SCHOLARSHIP";
  }
  if (text.includes("মডেল") || text.includes("model")) {
    return "MODEL-TEST";
  }
  if (text.includes("বিশেষ") || text.includes("special")) {
    return "SPECIAL-EXAM";
  }

  const clean = (name || term || "")
    .replace(/[^\w\s-]/gi, "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-");

  if (clean && clean.length >= 3) {
    return `EXAM-${clean}`;
  }

  let hash = 0;
  const str = name || term || "exam";
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `EXAM-${Math.abs(hash).toString(36).toUpperCase()}`;
}

/**
 * Resolves canonical unique English ID handler for an exam object.
 */
export function getCanonicalExamId(exam: any): string {
  if (!exam) return "EXAM-DEFAULT";
  if (exam.code && typeof exam.code === "string" && exam.code.trim()) {
    return exam.code.trim();
  }
  if (exam.examId && typeof exam.examId === "string" && exam.examId.trim()) {
    return exam.examId.trim();
  }
  if (exam._id) {
    return String(exam._id);
  }
  return generateExamCode(exam.name, exam.examTerm);
}

/**
 * Generates an immutable, unique English ID handler for each question set item.
 * E.g. "QS-SEM1-CLS1-7F2A"
 */
export function generateItemCode(classId?: string, examCode?: string, setName?: string): string {
  const cleanClass = (classId || "gen").replace(/^cls_/, "").toUpperCase();
  const cleanExam = (examCode || "EX").replace(/^EXAM-/, "").toUpperCase();

  let hash = 0;
  const seed = `${classId || ""}_${examCode || ""}_${setName || ""}`;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const shortRandom = Math.random().toString(36).substring(2, 6).toUpperCase();
  const shortHash = Math.abs(hash).toString(36).substring(0, 4).toUpperCase();

  return `QS-${cleanExam}-${cleanClass}-${shortHash || shortRandom}`;
}
