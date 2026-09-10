export interface ClassInfo {
  id: string;
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
 * Deterministically generates or resolves a stable classId from a class name or existing curriculum class
 */
export function generateClassId(
  className?: string,
  existingCurriculumClasses?: { id: string; name: string }[]
): string {
  if (!className || !className.trim()) return "cls_general";
  const trimmed = className.trim();

  // 1. Check if it matches existing curriculum class by name
  if (existingCurriculumClasses && existingCurriculumClasses.length > 0) {
    const found = existingCurriculumClasses.find(
      (c) => c.name.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (found?.id) return String(found.id);
  }

  // 2. Standard aliases mapping to stable IDs
  const standardPresets: Record<string, string> = {
    "শিশু": "cls_shishu",
    "শিশু শ্রেণি": "cls_shishu",
    "শিশু / নার্সারি": "cls_shishu",
    "নার্সারি": "cls_nursery",
    "প্লে": "cls_play",
    "১ম": "cls_1",
    "১ম শ্রেণি": "cls_1",
    "প্রথম শ্রেণি": "cls_1",
    "২য়": "cls_2",
    "২য় শ্রেণি": "cls_2",
    "দ্বিতীয় শ্রেণি": "cls_2",
    "৩য়": "cls_3",
    "৩য় শ্রেণি": "cls_3",
    "তৃতীয় শ্রেণি": "cls_3",
    "৪র্থ": "cls_4",
    "৪র্থ শ্রেণি": "cls_4",
    "চতুর্থ শ্রেণি": "cls_4",
    "৫ম": "cls_5",
    "৫ম শ্রেণি": "cls_5",
    "পঞ্চম শ্রেণি": "cls_5",
    "হিফজুল কুরআন": "cls_hifz",
    "হিফজ": "cls_hifz",
    "হিফয": "cls_hifz",
    "তাজবীদ ও কিরাত": "cls_tajweed",
    "তাজবীদ": "cls_tajweed",
    "কিরাত": "cls_tajweed",
    "মুয়াল্লিম প্রশিক্ষণ": "cls_muallim",
    "মুয়াল্লিম": "cls_muallim",
    "মুয়াল্লিমা": "cls_muallima",
  };

  if (standardPresets[trimmed]) {
    return standardPresets[trimmed];
  }

  // 3. Fallback deterministic slug ID
  const clean = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return clean ? `cls_${clean}` : `cls_${Date.now()}`;
}
