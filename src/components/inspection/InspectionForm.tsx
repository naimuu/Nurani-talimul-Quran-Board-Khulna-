"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Search,
  MapPin,
  Calendar,
  User,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Navigation,
  FileCheck,
  Send,
  Loader2,
  Award,
  Layers,
  Users,
  GraduationCap,
  X,
  XCircle,
  MinusCircle,
  HelpCircle,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
  Save,
  RefreshCw,
  Lock,
  Printer,
  CheckCheck,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import SignaturePad from "./SignaturePad";
import SearchableSelect, { SearchableOption } from "./SearchableSelect";
import InspectionReportModal from "./PrintableInspectionReport";
import {
  GENERAL_CHECKLIST_ITEMS,
  STANDARD_INSPECTION_SUBJECTS,
  STANDARD_INSPECTION_CLASSES,
  StandardSubject,
  StandardClass,
  calculateInspectionScore,
  haversineDistance,
} from "@/lib/inspectionUtils";

const DEFAULT_BANGLADESH_DIVISIONS: SearchableOption[] = [
  { id: "div_khulna", name: "Khulna", bn_name: "খুলনা" },
  { id: "div_dhaka", name: "Dhaka", bn_name: "ঢাকা" },
  { id: "div_chattogram", name: "Chattogram", bn_name: "চট্টগ্রাম" },
  { id: "div_rajshahi", name: "Rajshahi", bn_name: "রাজশাহী" },
  { id: "div_rangpur", name: "Rangpur", bn_name: "রংপুর" },
  { id: "div_barisal", name: "Barisal", bn_name: "বরিশাল" },
  { id: "div_sylhet", name: "Sylhet", bn_name: "সিলেট" },
  { id: "div_mymensingh", name: "Mymensingh", bn_name: "ময়মনসিংহ" },
];

interface InspectionFormProps {
  initialApplication?: any;
  inspectorUser?: {
    id: string;
    name: string;
    phone?: string;
  };
  isOpen?: boolean;
  isModal?: boolean;
  onSuccess?: (report: any) => void;
  onCancel?: () => void;
  onClose?: () => void;
}

// Helper to extract strictly a clean single label (no point numbers, no long sentences, no icons)
function getSingleLabel(rawLabel: string, value: string): string {
  const clean = (rawLabel || "").trim();
  // Strip any score tags like "(+10)", "(+১০)", "(10)", "+10", "-10", etc.
  const stripped = clean
    .replace(/\s*\([+-]?[0-9০-৯]+\)/g, "")
    .replace(/\s*[+-]?[0-9০-৯]+/g, "")
    .trim();

  if (
    value === "yes" ||
    value === "good" ||
    value === "full_uniform" ||
    stripped.includes("হ্যাঁ") ||
    stripped.includes("ভাল") ||
    stripped.includes("পরিপূর্ণ")
  ) {
    return stripped.includes("ভাল") ? "ভাল" : "হ্যাঁ";
  }
  if (
    value === "partial" ||
    value === "moderate" ||
    value === "partial_uniform" ||
    stripped.includes("আংশিক") ||
    stripped.includes("মধ্যম")
  ) {
    return stripped.includes("মধ্যম") ? "মধ্যম" : "আংশিক";
  }
  if (
    value === "no" ||
    value === "weak" ||
    value === "gross_violation" ||
    stripped.includes("না") ||
    stripped.includes("দুর্বল") ||
    stripped.includes("ঘাটতি") ||
    stripped.includes("লঙ্ঘন")
  ) {
    return stripped.includes("দুর্বল") ? "দুর্বল" : "না";
  }

  // Fallback for custom single word options (remove any remaining numbers)
  const firstWord = stripped.split(/[\s,–—]+/)[0] || stripped;
  return firstWord.replace(/[0-9০-৯()+-]/g, "").trim() || stripped;
}

// Helper to simplify class names (e.g. 'প্লে শ্রেণি' -> 'প্লে', 'প্রথম শ্রেণি' -> '১ম')
function getSimplifiedClassName(name: string): string {
  if (!name) return "";
  const clean = name.trim();
  const stripped = clean.replace(/\s*(শ্রেণি|শ্রেণী)\s*/g, "").trim();

  const map: Record<string, string> = {
    "প্লে": "প্লে",
    "নার্সারী": "নার্সারী",
    "নার্সারি": "নার্সারি",
    "প্রথম": "১ম",
    "দ্বিতীয়": "২য়",
    "দ্বিতীয়": "২য়",
    "তৃতীয়": "৩য়",
    "তৃতীয়": "৩য়",
    "চতুর্থ": "৪র্থ",
    "পঞ্চম": "৫ম",
    "ষষ্ঠ": "৬ষ্ঠ",
    "সপ্তম": "৭ম",
    "অষ্টম": "৮ম",
    "নবম": "৯ম",
    "দশম": "১০ম",
    "১ম": "১ম",
    "২য়": "২য়",
    "৩য়": "৩য়",
    "৪র্থ": "৪র্থ",
    "৫ম": "৫ম",
  };

  return map[stripped] || stripped || clean;
}

// Single Cycle/Toggle Button Component for touch-friendly card evaluation (Balanced fixed size & pure single label)
function CycleToggleButton({
  currentValue,
  options,
  onChange,
  className = "",
  size = "md",
  disabled = false,
}: {
  currentValue?: string;
  options: {
    value: string;
    label: string;
    colorClass: string;
    bgClass: string;
    borderClass: string;
  }[];
  onChange: (nextValue: string) => void;
  className?: string;
  size?: "sm" | "md" | "table";
  disabled?: boolean;
}) {
  const currentIndex = options.findIndex((opt) => opt.value === currentValue);
  const isUnset = !currentValue || currentIndex === -1;
  const activeOpt = !isUnset ? options[currentIndex] : null;

  const handleNext = () => {
    if (disabled) return;
    // Optional haptic tap on mobile
    if (typeof window !== "undefined" && window.navigator && "vibrate" in window.navigator) {
      try {
        window.navigator.vibrate(12);
      } catch (e) {}
    }
    if (isUnset) {
      // First click selects the first positive option (e.g. হ্যাঁ or ভাল)
      onChange(options[0].value);
    } else {
      const nextIndex = (currentIndex + 1) % options.length;
      onChange(options[nextIndex].value);
    }
  };

  // Fixed dimensional sizing to guarantee button maintains exact same size across 1st, 2nd, and 3rd labels
  const sizeClasses =
    size === "sm"
      ? "w-[76px] sm:w-[84px] h-[36px] sm:h-[38px] text-xs sm:text-sm"
      : size === "table"
      ? "w-[68px] sm:w-[74px] h-[30px] sm:h-[32px] text-xs"
      : "w-[82px] sm:w-[90px] h-[38px] sm:h-[42px] text-xs sm:text-sm";

  return (
    <button
      type="button"
      onClick={handleNext}
      disabled={disabled}
      className={`inline-flex items-center justify-center shrink-0 rounded-full font-extrabold transition-all border text-center ${sizeClasses} ${
        isUnset
          ? "bg-slate-50 text-slate-400 border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/50"
          : `${activeOpt?.bgClass} ${activeOpt?.colorClass} ${activeOpt?.borderClass}`
      } ${
        disabled
          ? "cursor-not-allowed opacity-90 shadow-none pointer-events-none"
          : "shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer select-none"
      } ${className}`}
      title={
        disabled
          ? isUnset
            ? "মূল্যায়ন করা হয়নি"
            : `${activeOpt?.label} (সংরক্ষিত ও লকড)`
          : isUnset
          ? "ক্লিক করে সেট করুন"
          : `${activeOpt?.label} — ক্লিক করে মান পরিবর্তন করুন`
      }
    >
      <span className="truncate leading-none">
        {isUnset ? "বাছাই" : activeOpt?.label}
      </span>
    </button>
  );
}

export default function InspectionForm({
  initialApplication,
  inspectorUser,
  isOpen = true,
  isModal = false,
  onSuccess,
  onCancel,
  onClose,
}: InspectionFormProps) {
  // ESC key listener for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && (onClose || onCancel)) {
        (onClose || onCancel)?.();
      }
    };
    if (isModal && isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isModal, isOpen, onClose, onCancel]);

  // Single input auto-fetch state
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Form General Details
  const [applicationId, setApplicationId] = useState(initialApplication?._id || "");
  const [trackingNo, setTrackingNo] = useState(initialApplication?.trackingNo || "");
  const [madrasahName, setMadrasahName] = useState(initialApplication?.madrasahName || "");
  const [aCode, setACode] = useState(initialApplication?.aCode || "");
  const [mCode, setMCode] = useState(initialApplication?.mCode || initialApplication?.madrasahCode || "");
  const [division, setDivision] = useState(initialApplication?.division || "");
  const [district, setDistrict] = useState(initialApplication?.district || "");
  const [upazila, setUpazila] = useState(initialApplication?.upazila || "");
  const [union, setUnion] = useState(initialApplication?.union || "");
  const [village, setVillage] = useState(initialApplication?.village || "");
  const [postOffice, setPostOffice] = useState(initialApplication?.postOffice || "");
  const [academicYearCe, setAcademicYearCe] = useState(initialApplication?.academicYearCe || "2026");
  const [academicYearHijri, setAcademicYearHijri] = useState(initialApplication?.academicYearHijri || "১৪৪৭-৪৮");
  const [directorName, setDirectorName] = useState(initialApplication?.directorName || "");
  const [directorMobile, setDirectorMobile] = useState(initialApplication?.directorMobile || "");
  const [headTeacherName, setHeadTeacherName] = useState(initialApplication?.headTeacherName || "");
  const [headTeacherMobile, setHeadTeacherMobile] = useState(initialApplication?.headTeacherMobile || "");
  const [inspectionPhase, setInspectionPhase] = useState<"phase_1" | "phase_2" | "phase_3">("phase_1");
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split("T")[0]);

  // Existing Reports by Phase & Read-Only Lock State
  const [phaseReports, setPhaseReports] = useState<Record<string, any>>({});
  const [loadingPhaseReports, setLoadingPhaseReports] = useState(false);
  const [isViewingExistingReport, setIsViewingExistingReport] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [showPrintReportModal, setShowPrintReportModal] = useState(false);

  // Locations state for searchable dropdowns
  const [divisionList, setDivisionList] = useState<SearchableOption[]>([]);
  const [districtList, setDistrictList] = useState<SearchableOption[]>([]);
  const [upazilaList, setUpazilaList] = useState<SearchableOption[]>([]);
  const [unionList, setUnionList] = useState<SearchableOption[]>([]);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingUpazilas, setLoadingUpazilas] = useState(false);
  const [loadingUnions, setLoadingUnions] = useState(false);

  // Real Academic Year Dropdown States (Loaded from Database)
  const [ceYearOptions, setCeYearOptions] = useState<SearchableOption[]>([]);
  const [hijriYearOptions, setHijriYearOptions] = useState<SearchableOption[]>([]);
  const [ceToHijriMap, setCeToHijriMap] = useState<Record<string, string>>({});
  const [loadingAcademicYears, setLoadingAcademicYears] = useState(false);

  // Live Geolocation / Auto-fill State
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoStatus, setGeoStatus] = useState<"idle" | "detecting" | "success" | "denied" | "unsupported">("idle");
  const [detectedAddressInfo, setDetectedAddressInfo] = useState<string | null>(null);

  // Section 1: 11 General Checklist Points (Blank by default on fresh form)
  const [checklist, setChecklist] = useState<Record<string, any>>({});

  // Dynamic Curriculum Classes & Inspection Subjects
  const [curriculumClasses, setCurriculumClasses] = useState<{ id: string; name: string }[]>(STANDARD_INSPECTION_CLASSES);
  const [inspectionSubjects, setInspectionSubjects] = useState<StandardSubject[]>(STANDARD_INSPECTION_SUBJECTS);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);

  // Section 2: Subject × Class Matrix (Blank by default on fresh form)
  const [subjectMatrix, setSubjectMatrix] = useState<Record<string, Record<string, string>>>({});

  // Active Class Tab for Card View
  const [activeClassId, setActiveClassId] = useState<string>(STANDARD_INSPECTION_CLASSES[0]?.id || "cls_play");
  // Toggle between dynamic Card View and Full Table Matrix
  const [matrixViewMode, setMatrixViewMode] = useState<"card" | "table">("card");

  // Section 3: Teachers Stats (0 by default on fresh form)
  const [teacherStats, setTeacherStats] = useState({
    total: 0,
    present: 0,
  });

  // Section 4: Students Stats (0 by default on fresh form)
  const [studentStats, setStudentStats] = useState<Record<string, number>>({
    play: 0,
    nursery: 0,
    class_1: 0,
    class_2: 0,
    class_3: 0,
    class_4: 0,
    class_5: 0,
  });

  // Section 5: Observations, GPS & Signature
  const [inspectorRemarks, setInspectorRemarks] = useState("");
  const [submissionGps, setSubmissionGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [geofenceBreachReason, setGeofenceBreachReason] = useState("");
  const [photos, setPhotos] = useState<{ url: string; caption?: string }[]>([]);
  const [signatureUrl, setSignatureUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize from initialApplication prop if present
  useEffect(() => {
    if (initialApplication) {
      setApplicationId(initialApplication._id || "");
      setTrackingNo(initialApplication.trackingNo || "");
      setMadrasahName(initialApplication.madrasahName || "");
      setACode(initialApplication.aCode || "");
      setMCode(initialApplication.mCode || initialApplication.madrasahCode || "");
      if (initialApplication.division) setDivision(initialApplication.division);
      if (initialApplication.district) setDistrict(initialApplication.district);
      if (initialApplication.upazila) setUpazila(initialApplication.upazila);
      if (initialApplication.union) setUnion(initialApplication.union);
      setVillage(initialApplication.village || "");
      setPostOffice(initialApplication.postOffice || "");
      setDirectorName(initialApplication.directorName || "");
      setDirectorMobile(initialApplication.directorMobile || "");
      setHeadTeacherName(initialApplication.headTeacherName || "");
      setHeadTeacherMobile(initialApplication.headTeacherMobile || "");
      if (initialApplication.academicYearCe) setAcademicYearCe(initialApplication.academicYearCe);
      if (initialApplication.academicYearHijri) setAcademicYearHijri(initialApplication.academicYearHijri);
    }
  }, [initialApplication]);

  // Helper to load an existing report's data into the form and lock it
  const loadExistingReportData = useCallback((report: any) => {
    if (!report) return;
    setIsViewingExistingReport(true);
    setSelectedReport(report);

    if (report.generalChecklist && typeof report.generalChecklist === "object") {
      setChecklist(report.generalChecklist);
    }
    if (report.subjectMatrix && typeof report.subjectMatrix === "object") {
      setSubjectMatrix(report.subjectMatrix);
    }
    if (report.teacherStats && typeof report.teacherStats === "object") {
      setTeacherStats({
        total: Number(report.teacherStats.total) || 0,
        present: Number(report.teacherStats.present) || 0,
      });
    }
    if (report.studentStats && typeof report.studentStats === "object") {
      setStudentStats(report.studentStats);
    }
    if (report.inspectorRemarks !== undefined) {
      setInspectorRemarks(report.inspectorRemarks || "");
    }
    if (report.signatureUrl !== undefined) {
      setSignatureUrl(report.signatureUrl || "");
    }
    if (report.inspectionDate) {
      try {
        setInspectionDate(new Date(report.inspectionDate).toISOString().split("T")[0]);
      } catch (e) {}
    }
    if (Array.isArray(report.photos)) {
      setPhotos(report.photos);
    }
    if (Array.isArray(report.classesSnapshot) && report.classesSnapshot.length > 0) {
      setCurriculumClasses(report.classesSnapshot);
      setActiveClassId(report.classesSnapshot[0]?.id || "cls_play");
    }
    if (Array.isArray(report.subjectSnapshot) && report.subjectSnapshot.length > 0) {
      setInspectionSubjects(report.subjectSnapshot);
    }
    if (report.academicYearCe || report.applicationId?.academicYearCe) {
      setAcademicYearCe(report.academicYearCe || report.applicationId?.academicYearCe);
    }
    if (report.academicYearHijri || report.applicationId?.academicYearHijri) {
      setAcademicYearHijri(report.academicYearHijri || report.applicationId?.academicYearHijri);
    }
  }, []);

  // Fetch existing reports for this application/madrasah whenever ID or code changes
  useEffect(() => {
    let isMounted = true;
    async function fetchExistingReports() {
      const activeAppId = applicationId || initialApplication?._id;
      const activeTrack = trackingNo || initialApplication?.trackingNo;
      const activeMCode = mCode || initialApplication?.mCode || initialApplication?.madrasahCode;

      if (!activeAppId && !activeTrack && !activeMCode) {
        setPhaseReports({});
        setIsViewingExistingReport(false);
        setSelectedReport(null);
        return;
      }

      setLoadingPhaseReports(true);
      try {
        const params = new URLSearchParams();
        if (activeAppId) params.set("applicationId", activeAppId);
        if (activeTrack) params.set("trackingNo", activeTrack);
        if (activeMCode) params.set("mCode", activeMCode);

        const res = await fetch(`/api/inspection/reports?${params.toString()}`);
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.reports)) {
          const map: Record<string, any> = {};
          data.reports.forEach((rep: any) => {
            const ph = rep.phase || "phase_1";
            if (!map[ph]) {
              map[ph] = rep;
            }
          });
          setPhaseReports(map);

          // If current phase has an existing report, immediately load it!
          if (map[inspectionPhase]) {
            loadExistingReportData(map[inspectionPhase]);
          } else {
            setIsViewingExistingReport(false);
            setSelectedReport(null);
          }
        }
      } catch (err) {
        console.error("Error fetching phase reports:", err);
      } finally {
        if (isMounted) setLoadingPhaseReports(false);
      }
    }

    fetchExistingReports();
    return () => {
      isMounted = false;
    };
  }, [applicationId, trackingNo, mCode, initialApplication, inspectionPhase, loadExistingReportData]);

  // Handle phase change: switch to existing report (locked) or fresh entry mode
  const handleSelectPhase = (p: "phase_1" | "phase_2" | "phase_3") => {
    setInspectionPhase(p);
    const existingRep = phaseReports[p];
    if (existingRep) {
      loadExistingReportData(existingRep);
      toast.success(
        `${p === "phase_1" ? "১ম" : p === "phase_2" ? "২য়" : "৩য়"} পরিদর্শনের সংরক্ষিত রিপোর্ট লোড হয়েছে (লকড)`
      );
    } else {
      setIsViewingExistingReport(false);
      setSelectedReport(null);
      setInspectorRemarks("");
      setSignatureUrl("");
      setPhotos([]);
      setInspectionDate(new Date().toISOString().split("T")[0]);

      // Keep checklist, matrix and stats completely blank on fresh new entry
      setChecklist({});
      setSubjectMatrix({});
      setTeacherStats({ total: 0, present: 0 });
      setStudentStats({
        play: 0,
        nursery: 0,
        class_1: 0,
        class_2: 0,
        class_3: 0,
        class_4: 0,
        class_5: 0,
      });

      toast.success(
        `${p === "phase_1" ? "১ম" : p === "phase_2" ? "২য়" : "৩য়"} নতুন পরিদর্শনের জন্য এন্ট্রি মোড সক্রিয় হয়েছে`
      );
    }
  };

  // Dynamic Criteria Config State (loaded from Admin Settings)
  const [configItems, setConfigItems] = useState<any[]>(GENERAL_CHECKLIST_ITEMS);
  const [configVersion, setConfigVersion] = useState<number>(1);

  // Fetch active criteria config on mount
  useEffect(() => {
    async function loadActiveCriteriaConfig() {
      try {
        const res = await fetch("/api/inspection/config");
        const data = await res.json();
        if (data.success && data.config) {
          if (data.config.checklistItems?.length) {
            setConfigItems(data.config.checklistItems);
            setConfigVersion(data.config.version || 1);
          }
          if (Array.isArray(data.config.subjects) && data.config.subjects.length > 0) {
            setInspectionSubjects(data.config.subjects);
          }
        }
      } catch (e) {
        console.error("Failed to load active inspection config:", e);
      }
    }
    loadActiveCriteriaConfig();
  }, []);

  // Fetch real curriculum classes directly from /api/curriculum/classes
  useEffect(() => {
    let isMounted = true;
    async function loadCurriculumClasses() {
      setLoadingCurriculum(true);
      try {
        const res = await fetch("/api/curriculum/classes");
        const data = await res.json();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const mapped = data.map((c: any) => ({
            id: c.id,
            name: c.name,
          }));
          setCurriculumClasses(mapped);
          setActiveClassId((prev) => {
            return mapped.some((m: any) => m.id === prev) ? prev : mapped[0]?.id;
          });
        }
      } catch (e) {
        console.error("Failed to load curriculum classes:", e);
      } finally {
        if (isMounted) setLoadingCurriculum(false);
      }
    }
    loadCurriculumClasses();
    return () => {
      isMounted = false;
    };
  }, []);



  // Fetch real academic years from database
  useEffect(() => {
    let isMounted = true;
    async function loadAcademicYears() {
      setLoadingAcademicYears(true);
      try {
        const res = await fetch("/api/inspection/academic-years");
        const data = await res.json();
        if (isMounted && data.success) {
          if (Array.isArray(data.ceYears)) setCeYearOptions(data.ceYears);
          if (Array.isArray(data.hijriYears)) setHijriYearOptions(data.hijriYears);
          if (data.ceToHijriMap) setCeToHijriMap(data.ceToHijriMap);
        }
      } catch (e) {
        console.error("Failed to load academic years:", e);
      } finally {
        if (isMounted) setLoadingAcademicYears(false);
      }
    }
    loadAcademicYears();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch divisions on mount
  useEffect(() => {
    let isMounted = true;
    async function loadDivisions() {
      setLoadingDivisions(true);
      try {
        const res = await fetch("/api/locations?type=DIVISION");
        const data = await res.json();
        if (isMounted && Array.isArray(data.locations) && data.locations.length > 0) {
          setDivisionList(
            data.locations.map((loc: any) => ({
              id: loc.id || loc._id || loc.code,
              name: loc.name || "",
              bn_name: loc.bn_name || loc.name,
            }))
          );
        } else if (isMounted) {
          setDivisionList(DEFAULT_BANGLADESH_DIVISIONS);
        }
      } catch (err) {
        console.error("Failed to load divisions:", err);
        if (isMounted) setDivisionList(DEFAULT_BANGLADESH_DIVISIONS);
      } finally {
        if (isMounted) setLoadingDivisions(false);
      }
    }
    loadDivisions();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch districts whenever division changes (or load all if none selected)
  useEffect(() => {
    let isMounted = true;
    async function loadDistricts() {
      setLoadingDistricts(true);
      try {
        const url = division && division.trim()
          ? `/api/locations?type=DISTRICT&division=${encodeURIComponent(division.trim())}`
          : `/api/locations?type=DISTRICT`;
        const res = await fetch(url);
        const data = await res.json();
        if (isMounted && Array.isArray(data.locations)) {
          const formatted: SearchableOption[] = data.locations.map((loc: any) => ({
            id: loc.id || loc._id || loc.code,
            name: loc.name || "",
            bn_name: loc.bn_name || loc.name,
          }));
          setDistrictList(formatted);
        }
      } catch (err) {
        console.error("Failed to load districts:", err);
      } finally {
        if (isMounted) setLoadingDistricts(false);
      }
    }
    loadDistricts();
    return () => {
      isMounted = false;
    };
  }, [division]);

  // Fetch upazilas whenever district is set or changes
  useEffect(() => {
    let isMounted = true;
    if (!district || !district.trim()) {
      setUpazilaList([]);
      return;
    }

    async function loadUpazilas() {
      setLoadingUpazilas(true);
      try {
        const res = await fetch(`/api/locations?district=${encodeURIComponent(district.trim())}`);
        const data = await res.json();
        if (isMounted && Array.isArray(data.locations)) {
          const formatted: SearchableOption[] = data.locations.map((loc: any) => ({
            id: loc.id || loc._id || loc.code,
            name: loc.name || "",
            bn_name: loc.bn_name || loc.name,
          }));
          setUpazilaList(formatted);
        } else if (isMounted) {
          setUpazilaList([]);
        }
      } catch (err) {
        console.error("Failed to load upazilas:", err);
        if (isMounted) setUpazilaList([]);
      } finally {
        if (isMounted) setLoadingUpazilas(false);
      }
    }

    loadUpazilas();
    return () => {
      isMounted = false;
    };
  }, [district]);

  // Fetch unions whenever upazila is set or changes
  useEffect(() => {
    let isMounted = true;
    if (!upazila || !upazila.trim()) {
      setUnionList([]);
      return;
    }

    async function loadUnions() {
      setLoadingUnions(true);
      try {
        const res = await fetch(`/api/locations?upazila=${encodeURIComponent(upazila.trim())}`);
        const data = await res.json();
        if (isMounted && Array.isArray(data.locations)) {
          const formatted: SearchableOption[] = data.locations.map((loc: any) => ({
            id: loc.id || loc._id || loc.code,
            name: loc.name || "",
            bn_name: loc.bn_name || loc.name,
          }));
          setUnionList(formatted);
        } else if (isMounted) {
          setUnionList([]);
        }
      } catch (err) {
        console.error("Failed to load unions:", err);
        if (isMounted) setUnionList([]);
      } finally {
        if (isMounted) setLoadingUnions(false);
      }
    }

    loadUnions();
    return () => {
      isMounted = false;
    };
  }, [upazila]);

  // Live Score & Grade calculation using active criteria config and option point weights (including negative marks)
  const liveScore = calculateInspectionScore(
    checklist,
    subjectMatrix,
    teacherStats,
    studentStats,
    configItems
  );

  // Total students sum
  const totalStudents = Object.values(studentStats).reduce((a, b) => a + (Number(b) || 0), 0);

  // Single-Input Auto-Fetch
  const handleSingleInputSearch = async () => {
    const query = searchInput.trim();
    if (!query) {
      toast.error("অনুগ্রহ করে একটি M কোড বা মোবাইল নম্বর লিখুন");
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/madrasa/by-code?code=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok || !data.madrasa) {
        toast.error(data.error || "মাদরাসাটি খুঁজে পাওয়া যায়নি");
      } else {
        const m = data.madrasa;
        setMadrasahName(m.name || "");
        setMCode(m.code || m.mCode || query);
        if (m.division) setDivision(m.division);
        if (m.district) setDistrict(m.district);
        if (m.upazila || m.thana) setUpazila(m.upazila || m.thana);
        if (m.union) setUnion(m.union);
        setVillage(m.village || m.address || "");
        setPostOffice(m.postOffice || "");
        setDirectorName(m.presidentName || m.mutawalliName || m.directorName || "");
        setDirectorMobile(m.presidentMobile || m.mobile || m.phone || "");
        setHeadTeacherName(m.principalName || m.headmasterName || "");
        setHeadTeacherMobile(m.principalMobile || "");
        toast.success(`"${m.name}" এর তথ্য স্বয়ংক্রিয়ভাবে লোড হয়েছে`);
      }
    } catch (err) {
      console.error(err);
      toast.error("তথ্য লোড করতে নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setIsSearching(false);
    }
  };

  // Geolocation Detection & Reverse-Geocode Auto-Fill
  const detectAndAutoFillLocation = useCallback((isInitialMount = false) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGeoStatus("unsupported");
      if (!isInitialMount) toast.error("আপনার ব্রাউজারে জিপিএস সুবিধা সমর্থিত নয়");
      return;
    }

    setGeoLoading(true);
    setGpsLoading(true);
    setGeoStatus("detecting");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Set submission GPS coordinates for anti-fraud live verification
        setSubmissionGps({ lat, lng });
        setGpsLoading(false);

        try {
          const res = await fetch(`/api/locations/reverse-geocode?lat=${lat}&lng=${lng}`);
          const data = await res.json();

          if (data.success) {
            let appliedDivision = "";
            let appliedDistrict = "";
            let appliedUpazila = "";
            let appliedUnion = "";

            if (data.division) {
              setDivision(data.division);
              appliedDivision = data.division;
            }

            if (data.district) {
              setDistrict(data.district);
              appliedDistrict = data.district;
            }

            if (data.upazila) {
              setUpazila(data.upazila);
              appliedUpazila = data.upazila;
            }

            if (data.union) {
              setUnion(data.union);
              appliedUnion = data.union;
            }

            // CRITICAL: Manual text inputs (village, postOffice) are KEPT BLANK / protected from demo or wrong set fill!
            // Do NOT overwrite village or postOffice with raw postcodes or GPS coordinates!

            const info = [appliedUnion, appliedUpazila, appliedDistrict, appliedDivision].filter(Boolean).join(", ");
            setDetectedAddressInfo(info || "বর্তমান অবস্থান সফলভাবে শনাক্তকৃত");
            setGeoStatus("success");
            toast.success(
              info
                ? `📍 জিপিএস অবস্থান অনুযায়ী "${info}" নির্বাচন করা হয়েছে`
                : "📍 বর্তমান অবস্থান অনুযায়ী ঠিকানা নির্বাচন হয়েছে"
            );
          } else {
            setGeoStatus("idle");
            if (!isInitialMount) {
              toast.error(data.error || "লোকেশন থেকে প্রশাসনিক এলাকা শনাক্ত করা সম্ভব হয়নি");
            }
          }
        } catch (fetchErr) {
          console.error("Reverse geocoding error:", fetchErr);
          setGeoStatus("idle");
          if (!isInitialMount) toast.error("ঠিকানা স্বয়ংক্রিয়ভাবে পেতে সমস্যা হয়েছে");
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        console.warn("Geolocation access not active/granted:", err);
        setGeoLoading(false);
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoStatus("denied");
          if (!isInitialMount) {
            toast.error("ব্রাউজারে লোকেশন অনুমতি দেওয়া হয়নি। অনুগ্রহ করে অনুমতি সক্রিয় করুন।");
          }
        } else {
          setGeoStatus("idle");
          if (!isInitialMount) {
            toast.error("ডিভাইসের জিপিএস বা লোকেশন সক্রিয় নেই।");
          }
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  }, []);

  // GPS Geolocation Capture (triggers GPS capture and auto-fill)
  const handleCaptureGps = () => {
    detectAndAutoFillLocation(false);
  };

  // Auto-detect and auto-fill address on mount using Geo Maps location if not already filled
  useEffect(() => {
    if (!initialApplication?.district && !district) {
      detectAndAutoFillLocation(true);
    }
  }, [detectAndAutoFillLocation, initialApplication]);

  // Photo Upload Simulation / Base64
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, caption: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setPhotos((prev) => [...prev, { url: reader.result as string, caption }]);
        toast.success("ছবি সফলভাবে যুক্ত হয়েছে");
      }
    };
    reader.readAsDataURL(file);
  };

  // Section 1 Checklist Selection State & Toggle Handler
  const isChecklistAllSelected =
    configItems.length > 0 &&
    configItems.every((it: any) => Boolean(checklist[it.id]));

  const handleToggleAllChecklist = () => {
    const isAll =
      configItems.length > 0 &&
      configItems.every((it: any) => Boolean(checklist[it.id]));

    setChecklist((prev) => {
      const next = { ...prev };
      configItems.forEach((it: any) => {
        if (isAll) {
          next[it.id] = it.type === "numeric" ? 0 : "";
        } else {
          if (it.type === "yes_no_partial") {
            next[it.id] = "yes";
          } else if (it.type === "good_moderate_weak") {
            next[it.id] = "good";
          } else if (it.options && it.options.length > 0) {
            const best = [...it.options].sort((a: any, b: any) => (Number(b.points) || 0) - (Number(a.points) || 0))[0];
            next[it.id] = best.value;
          }
        }
      });
      return next;
    });

    if (isAll) {
      toast.success("সকল মানদণ্ড ডি-সিলেক্ট করা হয়েছে");
    } else {
      toast.success("সকল মানদণ্ড ইতিবাচক নির্বাচন করা হয়েছে");
    }
  };

  // Section 2 Active Class Selection State & Toggle Handler (Select All / Deselect All)
  const isClassAllSelected =
    inspectionSubjects.length > 0 &&
    inspectionSubjects.every(
      (sub) => Boolean(subjectMatrix[activeClassId]?.[sub.id])
    );

  const handleToggleClassSelection = (classId: string) => {
    const isAll =
      inspectionSubjects.length > 0 &&
      inspectionSubjects.every(
        (sub) => Boolean(subjectMatrix[classId]?.[sub.id])
      );

    const targetClass = curriculumClasses.find((c) => c.id === classId);
    const clsName = targetClass ? getSimplifiedClassName(targetClass.name) : "শ্রেণি";

    setSubjectMatrix((prev) => {
      const updatedClass = { ...(prev[classId] || {}) };
      inspectionSubjects.forEach((sub) => {
        // If already all selected -> deselect all (reset to empty string ""), else set to "good"
        updatedClass[sub.id] = isAll ? "" : "good";
      });
      return {
        ...prev,
        [classId]: updatedClass,
      };
    });

    if (isAll) {
      toast.success(`${clsName}: সকল বিষয় ডি-সিলেক্ট করা হয়েছে`);
    } else {
      toast.success(`${clsName}: সকল বিষয় নির্বাচন করা হয়েছে`);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!madrasahName.trim()) {
      toast.error("অনুগ্রহ করে মাদরাসার নাম লিখুন");
      return;
    }
    if (!signatureUrl) {
      toast.error("অনুগ্রহ করে পরিদর্শকের ডিজিটাল স্বাক্ষর প্রদান করুন");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        applicationId: applicationId || undefined,
        madrasahName,
        mCode,
        aCode,
        division,
        district,
        upazila,
        union,
        village,
        postOffice,
        academicYearCe,
        academicYearHijri,
        directorName,
        directorMobile,
        headTeacherName,
        headTeacherMobile,
        inspectorId: inspectorUser?.id || "default_inspector",
        inspectorName: inspectorUser?.name || "মাওলানা মোহাম্মাদ আলী",
        phase: inspectionPhase,
        inspectionDate,
        generalChecklist: checklist,
        subjectMatrix,
        classesSnapshot: curriculumClasses,
        subjectSnapshot: inspectionSubjects,
        teacherStats,
        studentStats: { ...studentStats, total: totalStudents },
        inspectorRemarks,
        signatureUrl,
        submissionGps,
        geofenceBreachReason,
        photos,
      };

      const res = await fetch("/api/inspection/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "রিপোর্ট সংরক্ষণ ব্যর্থ হয়েছে");
      }

      toast.success("মাদরাসা পরিদর্শন রিপোর্ট সফলভাবে দাখিল ও লক করা হয়েছে!");
      if (onSuccess) {
        onSuccess(data.report);
      }
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "ত্রুটি দেখা দিয়েছে");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Main Form Inner Content
  const formContent = (
    <div className="space-y-6">
      {/* Top Banner with Live Score & Auto-Fetch */}
      {/* Top Banner / Auto-Fetch Section (Compact & Clean on mobile) */}
      <div className="bg-slate-900 text-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-800 shadow-sm">
        {!isModal ? (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  অফিস কপি
                </span>
                <span className="text-[11px] text-slate-400">নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ</span>
              </div>
              <h1 className="text-base sm:text-xl font-black text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                মাদরাসা পরিদর্শন রিপোর্ট (ডিজিটাল এন্ট্রি)
              </h1>
            </div>

            {/* Live Score Pill Badge */}
            <div className="flex items-center gap-2.5 bg-slate-800/90 border border-slate-700/80 px-3.5 py-1.5 rounded-xl">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">লাইভ স্কোর ও গ্রেড</div>
                <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <span className="text-emerald-400">{liveScore.totalScore}%</span>
                  <span className="text-xs font-semibold text-slate-300">
                    ({Object.keys(checklist).length === 0 && Object.keys(subjectMatrix).length === 0 ? "অমূল্যায়িত" : liveScore.gradeLabel})
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Smart Single Input Bar */}
        <div className={!isModal ? "pt-2.5 border-t border-slate-800" : ""}>
        
          <div className="flex gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="যেমন: ৭৫০ বা ০১৯৮২৮২১৯৫৫"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSingleInputSearch()}
                className="w-full pl-9 pr-3.5 py-2.5 sm:py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="button"
              onClick={handleSingleInputSearch}
              disabled={isSearching}
              className="px-4 sm:px-5 py-2.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-sm shrink-0"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "তথ্য লোড করুন"}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-5">
        {/* Section: মাদরাসার সাধারণ বিবরণী */}
        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            মাদরাসার সাধারণ ও প্রাতিষ্ঠানিক তথ্য
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 text-xs sm:text-sm">
            <div className="sm:col-span-2">
              <label className="text-slate-700 mb-1.5 block font-semibold text-xs sm:text-sm">মাদরাসার পূর্ণ নাম *</label>
              <input
                type="text"
                value={madrasahName}
                onChange={(e) => setMadrasahName(e.target.value)}
                placeholder="যেমন: তাহফিজুল উম্মাহ মডেল মাদরাসা"
                required
                disabled={isViewingExistingReport}
                className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-emerald-600 focus:outline-none transition disabled:bg-slate-100 disabled:text-slate-700 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-slate-700 mb-1.5 block font-semibold text-xs sm:text-sm">M কোড (মাদরাসা কোড)</label>
              <input
                type="text"
                value={mCode}
                onChange={(e) => setMCode(e.target.value)}
                placeholder="যেমন: ৭৫০"
                disabled={isViewingExistingReport}
                className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-emerald-600 focus:outline-none transition disabled:bg-slate-100 disabled:text-slate-700 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-slate-700 mb-1.5 block font-semibold text-xs sm:text-sm">A কোড (বোর্ড কোড)</label>
              <input
                type="text"
                value={aCode}
                onChange={(e) => setACode(e.target.value)}
                placeholder="ঐচ্ছিক"
                disabled={isViewingExistingReport}
                className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-emerald-600 focus:outline-none transition disabled:bg-slate-100 disabled:text-slate-700 disabled:cursor-not-allowed"
              />
            </div>

            {/* ১. বিভাগ (Searchable Dropdown with Compact GPS Icon on top/right) */}
            <SearchableSelect
              label="বিভাগ"
              labelRight={
                <button
                  type="button"
                  onClick={() => detectAndAutoFillLocation(false)}
                  disabled={geoLoading || isViewingExistingReport}
                  title={
                    isViewingExistingReport
                      ? "রিপোর্ট লক থাকায় অবস্থান পরিবর্তন নিষ্ক্রিয়"
                      : geoLoading
                      ? "লাইভ জিপিএস অবস্থান নেওয়া হচ্ছে..."
                      : detectedAddressInfo
                      ? `শনাক্তকৃত অবস্থান: ${detectedAddressInfo} (পুনরায় রিফ্রেশ করতে ক্লিক করুন)`
                      : "লাইভ জিপিএস অবস্থান থেকে বিভাগ, জেলা ও উপজেলা অটো-সিলেক্ট করুন"
                  }
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition cursor-pointer active:scale-95 shadow-2xs ${
                    isViewingExistingReport
                      ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed pointer-events-none"
                      : geoLoading
                      ? "bg-amber-50 text-amber-700 border-amber-300 animate-pulse"
                      : geoStatus === "success"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                      : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                  }`}
                >
                  {geoLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                  ) : (
                    <Navigation
                      className={`w-3 h-3 ${
                        geoStatus === "success"
                          ? "text-emerald-600 fill-emerald-600/30"
                          : "text-slate-500"
                      }`}
                    />
                  )}
                  <span>
                    {geoLoading
                      ? "শনাক্ত হচ্ছে..."
                      : geoStatus === "success"
                      ? "GPS সক্রিয়"
                      : "GPS অটো-শনাক্ত"}
                  </span>
                </button>
              }
              value={division}
              options={divisionList}
              loading={loadingDivisions}
              placeholder="-- বিভাগ নির্বাচন করুন --"
              searchPlaceholder="বিভাগের নাম খুঁজুন..."
              required
              disabled={isViewingExistingReport}
              onChange={(newDivision) => {
                setDivision(newDivision);
                setDistrict("");
                setUpazila("");
                setUnion("");
              }}
            />

            {/* ২. জেলা (Searchable Dropdown, filtered by Division) */}
            <SearchableSelect
              label="জেলা"
              value={district}
              options={districtList}
              loading={loadingDistricts}
              placeholder={division ? "-- জেলা নির্বাচন করুন --" : "-- জেলা নির্বাচন করুন --"}
              searchPlaceholder="জেলার নাম খুঁজুন..."
              required
              disabled={isViewingExistingReport || !division}
              onChange={(newDistrict) => {
                setDistrict(newDistrict);
                setUpazila("");
                setUnion("");
              }}
            />

            {/* ৩. থানা/উপজেলা (Searchable Dropdown, filtered by selected District) */}
            <SearchableSelect
              label="থানা/উপজেলা"
              value={upazila}
              options={upazilaList}
              loading={loadingUpazilas}
              placeholder={district ? "-- থানা/উপজেলা নির্বাচন করুন --" : "-- প্রথমে জেলা নির্বাচন করুন --"}
              searchPlaceholder="থানা/উপজেলার নাম খুঁজুন..."
              disabled={isViewingExistingReport || !district}
              required
              onChange={(newUpazila) => {
                setUpazila(newUpazila);
                setUnion("");
              }}
            />

            {/* ৪. ইউনিয়ন/পৌরসভা (Searchable Dropdown with allowCustom) */}
            <SearchableSelect
              label="ইউনিয়ন/পৌরসভা"
              value={union}
              options={unionList}
              loading={loadingUnions}
              placeholder={upazila ? "-- ইউনিয়ন/পৌরসভা নির্বাচন করুন --" : "-- প্রথমে উপজেলা নির্বাচন করুন --"}
              searchPlaceholder="ইউনিয়ন বা পৌরসভার নাম খুঁজুন..."
              disabled={isViewingExistingReport || !upazila}
              allowCustom={true}
              onChange={(newUnion) => {
                setUnion(newUnion);
              }}
            />

            {/* ৫. গ্রাম/মহল্লা (Manual Text Input - Protected, Blank) */}
            <div>
              <label className="text-slate-700 mb-1.5 block font-semibold text-xs sm:text-sm">গ্রাম/মহল্লা</label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="যেমন: আলিয়া মাদরাসা রোড বা গ্রাম"
                disabled={isViewingExistingReport}
                className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-emerald-600 focus:outline-none transition disabled:bg-slate-100 disabled:text-slate-700 disabled:cursor-not-allowed"
              />
            </div>

            {/* ৬. ডাকঘর (Manual Text Input - Protected, Blank) */}
            <div>
              <label className="text-slate-700 mb-1.5 block font-semibold text-xs sm:text-sm">ডাকঘর</label>
              <input
                type="text"
                value={postOffice}
                onChange={(e) => setPostOffice(e.target.value)}
                placeholder="যেমন: দৌলতপুর বা চকবাজার"
                disabled={isViewingExistingReport}
                className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-emerald-600 focus:outline-none transition disabled:bg-slate-100 disabled:text-slate-700 disabled:cursor-not-allowed"
              />
            </div>

            {/* শিক্ষাবর্ষ (খ্রিস্টীয়) Dropdown from Real Data */}
            <SearchableSelect
              label="শিক্ষাবর্ষ (খ্রিস্টীয়)"
              value={academicYearCe}
              options={ceYearOptions}
              loading={loadingAcademicYears}
              placeholder="-- শিক্ষাবর্ষ নির্বাচন করুন --"
              searchPlaceholder="সাল খুঁজুন (যেমন: 2026 বা ২০২৬)..."
              disabled={isViewingExistingReport}
              allowCustom={true}
              onChange={(newVal, opt) => {
                const finalCe = opt?.bn_name || newVal;
                setAcademicYearCe(finalCe);
                // Automatically set corresponding Hijri year if available in mapping
                const cleanDigits = finalCe.replace(/[^0-9]/g, "");
                if (ceToHijriMap[finalCe]) {
                  setAcademicYearHijri(ceToHijriMap[finalCe]);
                } else if (cleanDigits && ceToHijriMap[cleanDigits]) {
                  setAcademicYearHijri(ceToHijriMap[cleanDigits]);
                }
              }}
            />

            {/* শিক্ষাবর্ষ (হিজরী) Dropdown from Real Data */}
            <SearchableSelect
              label="শিক্ষাবর্ষ (হিজরী)"
              value={academicYearHijri}
              options={hijriYearOptions}
              loading={loadingAcademicYears}
              placeholder="-- হিজরী বর্ষ নির্বাচন করুন --"
              searchPlaceholder="হিজরী সাল খুঁজুন (যেমন: ১৪৪৭-৪৮)..."
              disabled={isViewingExistingReport}
              allowCustom={true}
              onChange={(newVal, opt) => {
                const finalHijri = opt?.bn_name || newVal;
                setAcademicYearHijri(finalHijri);
              }}
            />
            <div>
              <label className="text-slate-700 mb-1.5 block font-semibold text-xs sm:text-sm">পরিচালক/সভাপতির নাম *</label>
              <input
                type="text"
                value={directorName}
                onChange={(e) => setDirectorName(e.target.value)}
                placeholder="পরিচালকের নাম"
                required
                disabled={isViewingExistingReport}
                className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-emerald-600 focus:outline-none transition disabled:bg-slate-100 disabled:text-slate-700 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-slate-700 mb-1.5 block font-semibold text-xs sm:text-sm">পরিচালকের মোবাইল *</label>
              <input
                type="text"
                value={directorMobile}
                onChange={(e) => setDirectorMobile(e.target.value)}
                placeholder="০১৭১১-XXXXXX"
                required
                disabled={isViewingExistingReport}
                className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-emerald-600 focus:outline-none transition disabled:bg-slate-100 disabled:text-slate-700 disabled:cursor-not-allowed"
              />
            </div>

            {/* পরিদর্শন পর্যায় নির্বাচন (১ম, ২য়, ৩য় - সম্পন্ন হলে ভিজিটেড কালার এবং ক্লিক করলে ডাটা প্রদর্শন) */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-700 font-semibold text-xs sm:text-sm">
                  পরিদর্শন পর্যায় নির্বাচন করুন
                </label>
                {loadingPhaseReports && (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-normal">
                    <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                    পূর্ববর্তী রিপোর্ট যাচাই হচ্ছে...
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["phase_1", "phase_2", "phase_3"] as const).map((p, idx) => {
                  const existingRep = phaseReports[p];
                  const isVisited = !!existingRep;
                  const isSelected = inspectionPhase === p;
                  const phaseLabel = idx === 0 ? "১ম পরিদর্শন" : idx === 1 ? "২য় পরিদর্শন" : "৩য় পরিদর্শন";

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleSelectPhase(p)}
                      className={`py-2.5 sm:py-2 px-3 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none ${
                        isVisited
                          ? isSelected
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/35 ring-2 ring-emerald-500 font-extrabold"
                            : "bg-emerald-50 text-emerald-800 border-2 border-emerald-500/80 hover:bg-emerald-100"
                          : isSelected
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/35 ring-2 ring-emerald-500 font-extrabold"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                      }`}
                    >
                      {isVisited && (
                        <CheckCircle2
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected ? "text-white" : "text-emerald-600"
                          }`}
                        />
                      )}
                      <span>{phaseLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-700 mb-1.5 block font-semibold text-xs sm:text-sm">পরিদর্শনের তারিখ</label>
              <input
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                disabled={isViewingExistingReport}
                className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-emerald-600 focus:outline-none transition font-medium disabled:bg-slate-100 disabled:text-slate-700 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* If viewing an already visited report: Locked Info & Inspector Banner */}
        {isViewingExistingReport && selectedReport && (
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-400/90 rounded-2xl p-3.5 sm:p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xs sm:text-sm font-black text-emerald-950">
                      {inspectionPhase === "phase_1" ? "১ম" : inspectionPhase === "phase_2" ? "২য়" : "৩য়"} পরিদর্শন প্রতিবেদন (সংরক্ষিত ও লকড)
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                      ✓ পরিদর্শন সম্পন্ন
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-emerald-800 border border-emerald-300">
                      সম্পাদনা বন্ধ
                    </span>
                  </div>

                  <div className="text-[11px] sm:text-xs text-emerald-900 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>পরিদর্শনকারী:</span>
                      <strong className="font-extrabold text-emerald-950">
                        {selectedReport.inspectorName || "মাঠ পরিদর্শক"}
                      </strong>
                      {selectedReport.inspectorPhone && (
                        <span className="text-emerald-700">({selectedReport.inspectorPhone})</span>
                      )}
                    </span>

                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>তারিখ:</span>
                      <strong className="font-bold text-emerald-950">
                        {selectedReport.inspectionDate
                          ? new Date(selectedReport.inspectionDate).toLocaleDateString("bn-BD")
                          : "—"}
                      </strong>
                    </span>

                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>প্রাপ্ত স্কোর:</span>
                      <strong className="font-extrabold text-emerald-950">
                        {selectedReport.totalScore}% ({selectedReport.gradeLabel || "মূল্যায়িত"})
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPrintReportModal(true)}
                className="px-4 py-2 rounded-full bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-400 font-bold text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer self-end sm:self-auto shrink-0"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-700" />
                <span>রিপোর্ট প্রিন্ট ভিউ</span>
              </button>
            </div>
          </div>
        )}

        {/* Section 1: ১১টি সার্বিক রিপোর্টের বিবরণী (Clean Card Style with Single Toggle Buttons) */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50/80 px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                সার্বিক রিপোর্টের বিবরণী
              </h2>
            
            </div>

            {!isViewingExistingReport && (
              <button
                type="button"
                onClick={handleToggleAllChecklist}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 transition shrink-0 cursor-pointer active:scale-95 ${
                  isChecklistAllSelected
                    ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300"
                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300"
                }`}
              >
                {isChecklistAllSelected ? (
                  <>
                    <RotateCcw className="w-3 h-3 text-rose-600" />
                    <span>সবগুলো বাতিল</span>
                  </>
                ) : (
                  <>
                    <CheckCheck className="w-3 h-3 text-emerald-600" />
                    <span>সবগুলো নির্বাচন</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Clean List for Active Questions (No extra badge on numbers) */}
          <div className="p-2.5 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
            {configItems.map((item: any) => {
              const currentVal = checklist[item.id];

              // Build options dynamically from configured points (pure single label, no long sentences, no icons)
              const hasOptions = Array.isArray(item.options) && item.options.length > 0;
              const dynamicOptions = hasOptions
                ? item.options.map((opt: any) => {
                    const points = Number(opt.points) || 0;
                    const isNegative = points < 0;
                    let bgClass = "bg-blue-600 hover:bg-blue-700";
                    let borderClass = "border-blue-600";

                    if (opt.value === "yes" || opt.value === "good" || opt.value === "full_uniform" || points >= 10) {
                      bgClass = "bg-emerald-600 hover:bg-emerald-700";
                      borderClass = "border-emerald-600";
                    } else if (opt.value === "partial" || opt.value === "moderate" || opt.value === "partial_uniform" || (points > 0 && points < 10)) {
                      bgClass = "bg-amber-500 hover:bg-amber-600";
                      borderClass = "border-amber-500";
                    } else if (opt.value === "no" || opt.value === "weak" || opt.value === "gross_violation" || isNegative || points <= 0) {
                      bgClass = isNegative ? "bg-rose-700 hover:bg-rose-800" : "bg-rose-600 hover:bg-rose-700";
                      borderClass = isNegative ? "border-rose-700" : "border-rose-600";
                    }

                    // Extract strictly a clean single label (e.g. হ্যাঁ, না, আংশিক, ভাল, মধ্যম, দুর্বল)
                    const cleanLabel = getSingleLabel(opt.label, opt.value);

                    return {
                      value: opt.value,
                      label: cleanLabel,
                      bgClass,
                      colorClass: "text-white",
                      borderClass,
                    };
                  })
                : [];

              return (
                <div
                  key={item.id}
                  className="bg-white hover:bg-slate-50/60 p-2.5 sm:p-3.5 rounded-xl border border-slate-200 transition-all flex items-center justify-between gap-2.5 sm:gap-3"
                >
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <span className="font-bold text-slate-500 text-xs sm:text-sm shrink-0 min-w-[20px] pt-0.5">
                      {item.sl}।
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                        {item.label}
                      </p>
                    </div>
                  </div>

                  {/* Single Toggle Button or Numeric Stepper */}
                  <div className="shrink-0">
                    {item.type === "numeric" ? (
                      isViewingExistingReport ? (
                        <div className="bg-slate-100 border border-slate-200 rounded-full px-4 py-1.5 text-center font-extrabold text-xs sm:text-sm text-slate-800 shadow-2xs">
                          {checklist[item.id] || 0} <span className="text-[10px] font-normal text-slate-500">জন</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-1 bg-white border border-slate-300 rounded-full px-1.5 py-0.5 shadow-2xs w-[112px] sm:w-[120px] h-[38px] sm:h-[42px]">
                          <button
                            type="button"
                            onClick={() =>
                              setChecklist((prev) => ({
                                ...prev,
                                [item.id]: Math.max(0, (Number(prev[item.id]) || 0) - 1),
                              }))
                            }
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs sm:text-sm cursor-pointer active:scale-95 transition shrink-0"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-center font-extrabold text-xs sm:text-sm text-slate-900 flex-1 truncate">
                            {checklist[item.id] || 0} <span className="text-[10px] sm:text-[11px] font-normal text-slate-500">জন</span>
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setChecklist((prev) => ({
                                ...prev,
                                [item.id]: (Number(prev[item.id]) || 0) + 1,
                              }))
                            }
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs sm:text-sm cursor-pointer active:scale-95 transition shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )
                    ) : dynamicOptions.length > 0 ? (
                      <CycleToggleButton
                        currentValue={currentVal || ""}
                        options={dynamicOptions}
                        size="md"
                        disabled={isViewingExistingReport}
                        onChange={(nextVal) => setChecklist((prev) => ({ ...prev, [item.id]: nextVal }))}
                      />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: বিষয়ভিত্তিক ও শ্রেণিভিত্তিক মূল্যায়ন (Mobile Card Style & Single Toggle Buttons) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="bg-slate-50 px-4 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                বিষয়ভিত্তিক ও শ্রেণিভিত্তিক মূল্যায়ন 
              </h2>
            
            </div>

            {/* View Mode Toggle (Card vs Full Matrix Table) */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-slate-200/80 p-0.5 rounded-full flex text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setMatrixViewMode("card")}
                  className={`px-3 py-1 rounded-full transition flex items-center gap-1 cursor-pointer ${
                    matrixViewMode === "card"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <LayoutGrid className="w-3 h-3 text-emerald-600" />
                  কার্ড  
                </button>
                <button
                  type="button"
                  onClick={() => setMatrixViewMode("table")}
                  className={`px-3 py-1 rounded-full transition flex items-center gap-1 cursor-pointer ${
                    matrixViewMode === "table"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <TableIcon className="w-3 h-3 text-emerald-600" />
                 টেবিল
                </button>
              </div>
            </div>
          </div>

          {/* If Card View (Mobile Responsive & Default) */}
          {matrixViewMode === "card" ? (
            <div className="p-3 sm:p-5 space-y-4">
              {/* Class Selector Tab Bar (Horizontally scrollable over screen with increased button size) */}
              <div className="relative">
                <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto scroll-smooth py-2 px-0.5 touch-pan-x no-scrollbar">
                  {curriculumClasses.map((cls) => {
                    const isActive = activeClassId === cls.id;
                    const simpleLabel = getSimplifiedClassName(cls.name);
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => setActiveClassId(cls.id)}
                        className={`min-w-[65px] sm:min-w-[85px] min-h-[42px] sm:min-h-[46px] px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-extrabold transition-all shrink-0 cursor-pointer flex items-center justify-center text-center select-none active:scale-95 ${
                          isActive
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/35 ring-2 ring-emerald-500/20"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/90"
                        }`}
                        title={cls.name}
                      >
                        <span className="whitespace-nowrap">{simpleLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Class Subheader & Single Selection Toggle Button (Select All / Deselect All) */}
              <div className="bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  {getSimplifiedClassName(curriculumClasses.find((c) => c.id === activeClassId)?.name || "")} মূল্যায়ন
                </span>

                {!isViewingExistingReport && (
                  <button
                    type="button"
                    onClick={() => handleToggleClassSelection(activeClassId)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 ${
                      isClassAllSelected
                        ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300"
                        : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300"
                    }`}
                  >
                    {isClassAllSelected ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                        <span>সবগুলো বাতিল</span>
                      </>
                    ) : (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>সবগুলো নির্বাচন</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Dynamic Subject Cards for Active Class */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {inspectionSubjects.map((subj) => {
                  const currentRating = subjectMatrix[activeClassId]?.[subj.id] || "";

                  return (
                    <div
                      key={subj.id}
                      className="bg-white hover:bg-slate-50/60 p-2.5 sm:p-3 rounded-xl border border-slate-200 transition flex items-center justify-between gap-2.5"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="font-bold text-slate-500 text-xs sm:text-sm shrink-0 min-w-[18px]">
                          {subj.sl}।
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                          {subj.name}
                        </span>
                      </div>

                      {/* Single Cycle Toggle Button for Subject Rating (Balanced Size) */}
                      <CycleToggleButton
                        currentValue={currentRating}
                        size="sm"
                        disabled={isViewingExistingReport}
                        options={[
                          {
                            value: "good",
                            label: "ভাল",
                            bgClass: "bg-emerald-600 hover:bg-emerald-700",
                            colorClass: "text-white",
                            borderClass: "border-emerald-600",
                          },
                          {
                            value: "moderate",
                            label: "মধ্যম",
                            bgClass: "bg-blue-600 hover:bg-blue-700",
                            colorClass: "text-white",
                            borderClass: "border-blue-600",
                          },
                          {
                            value: "weak",
                            label: "দুর্বল",
                            bgClass: "bg-rose-600 hover:bg-rose-700",
                            colorClass: "text-white",
                            borderClass: "border-rose-600",
                          },
                        ]}
                        onChange={(nextRating) =>
                          setSubjectMatrix((prev) => ({
                            ...prev,
                            [activeClassId]: {
                              ...(prev[activeClassId] || {}),
                              [subj.id]: nextRating,
                            },
                          }))
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // Full Matrix Table View (for wide screen desktops)
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <th className="p-2.5 font-semibold w-40 sticky left-0 bg-slate-50">বিষয়</th>
                    {curriculumClasses.map((cls) => (
                      <th key={cls.id} className="p-2 font-semibold text-center min-w-[70px]" title={cls.name}>
                        {getSimplifiedClassName(cls.name)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inspectionSubjects.map((subj) => (
                    <tr key={subj.id} className="hover:bg-slate-50/50">
                      <td className="p-2 font-medium text-slate-800 sticky left-0 bg-white">
                        <span className="font-bold text-slate-400 mr-1.5">{subj.sl}.</span>
                        {subj.name}
                      </td>
                      {curriculumClasses.map((cls) => {
                        const currentVal = subjectMatrix[cls.id]?.[subj.id] || "";
                        return (
                          <td key={cls.id} className="p-1.5 text-center">
                            <CycleToggleButton
                              currentValue={currentVal}
                              size="table"
                              disabled={isViewingExistingReport}
                              options={[
                                {
                                  value: "good",
                                  label: "ভাল",
                                  bgClass: "bg-emerald-600",
                                  colorClass: "text-white",
                                  borderClass: "border-emerald-600",
                                },
                                {
                                  value: "moderate",
                                  label: "মধ্যম",
                                  bgClass: "bg-blue-600",
                                  colorClass: "text-white",
                                  borderClass: "border-blue-600",
                                },
                                {
                                  value: "weak",
                                  label: "দুর্বল",
                                  bgClass: "bg-rose-600",
                                  colorClass: "text-white",
                                  borderClass: "border-rose-600",
                                },
                              ]}
                              onChange={(nextVal) =>
                                setSubjectMatrix((prev) => ({
                                  ...prev,
                                  [cls.id]: {
                                    ...(prev[cls.id] || {}),
                                    [subj.id]: nextVal,
                                  },
                                }))
                              }
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 3: নূরানী বিভাগের শিক্ষকদের সংখ্যা ও উপস্থিতি */}
        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-3.5 pb-2.5 border-b border-slate-100">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              নূরানী বিভাগের শিক্ষকদের সংখ্যা ও উপস্থিতি
            </h3>
            <span className="text-[11px] sm:text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              উপস্থিতির হার:{" "}
              <strong className="text-emerald-700 font-extrabold">
                {teacherStats.total > 0
                  ? `${Math.round((Math.min(teacherStats.present, teacherStats.total) / teacherStats.total) * 100)}%`
                  : "০%"}
              </strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            {/* মোট শিক্ষক সংখ্যা */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <label className="text-slate-800 font-bold block text-xs sm:text-sm">মোট শিক্ষক সংখ্যা</label>
                <span className="text-[11px] text-slate-400 font-medium">নিযুক্ত মোট শিক্ষক</span>
              </div>
              <div className="flex items-center bg-white border border-slate-300 rounded-xl overflow-hidden shadow-2xs focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/15">
                {!isViewingExistingReport && (
                  <button
                    type="button"
                    onClick={() => setTeacherStats((p) => ({ ...p, total: Math.max(0, p.total - 1) }))}
                    className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center font-bold text-xs transition cursor-pointer active:scale-95 border-r border-slate-200 shrink-0"
                    title="১ জন কমান"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                )}
                <input
                  type="number"
                  min="0"
                  value={teacherStats.total || 0}
                  disabled={isViewingExistingReport}
                  onChange={(e) => setTeacherStats((prev) => ({ ...prev, total: Math.max(0, Number(e.target.value) || 0) }))}
                  className="w-14 sm:w-16 py-1 text-center font-black text-sm sm:text-base text-slate-900 bg-transparent focus:outline-none disabled:text-slate-700"
                />
                {!isViewingExistingReport && (
                  <button
                    type="button"
                    onClick={() => setTeacherStats((p) => ({ ...p, total: p.total + 1 }))}
                    className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center font-bold text-xs transition cursor-pointer active:scale-95 border-l border-slate-200 shrink-0"
                    title="১ জন বাড়ান"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* উপস্থিত শিক্ষক সংখ্যা */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <label className="text-slate-800 font-bold block text-xs sm:text-sm">উপস্থিত শিক্ষক সংখ্যা</label>
                <span className="text-[11px] text-slate-400 font-medium">পরিদর্শনকালীন উপস্থিত</span>
              </div>
              <div className="flex items-center bg-white border border-slate-300 rounded-xl overflow-hidden shadow-2xs focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/15">
                {!isViewingExistingReport && (
                  <button
                    type="button"
                    onClick={() => setTeacherStats((p) => ({ ...p, present: Math.max(0, p.present - 1) }))}
                    className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center font-bold text-xs transition cursor-pointer active:scale-95 border-r border-slate-200 shrink-0"
                    title="১ জন কমান"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                )}
                <input
                  type="number"
                  min="0"
                  value={teacherStats.present || 0}
                  disabled={isViewingExistingReport}
                  onChange={(e) => setTeacherStats((prev) => ({ ...prev, present: Math.max(0, Number(e.target.value) || 0) }))}
                  className="w-14 sm:w-16 py-1 text-center font-black text-sm sm:text-base text-slate-900 bg-transparent focus:outline-none disabled:text-slate-700"
                />
                {!isViewingExistingReport && (
                  <button
                    type="button"
                    onClick={() => setTeacherStats((p) => ({ ...p, present: p.present + 1 }))}
                    className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center font-bold text-xs transition cursor-pointer active:scale-95 border-l border-slate-200 shrink-0"
                    title="১ জন বাড়ান"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: শ্রেণিভিত্তিক ছাত্র-ছাত্রীর সংখ্যা (Full-Width Responsive Cards & Touch Inputs) */}
        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
            <div>
              <h3 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                শ্রেণিভিত্তিক ছাত্র-ছাত্রীর সংখ্যা
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                নূরানী বিভাগের প্রতিটি শ্রেণিতে অধ্যয়নরত শিক্ষার্থীর সংখ্যা নির্ধারণ করুন
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-emerald-900 bg-emerald-50 px-3.5 py-1.5 rounded-full border-2 border-emerald-400/90 shadow-2xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>মোট শিক্ষার্থী:</span>
                <strong className="text-emerald-700 text-sm sm:text-base font-black">{totalStudents} জন</strong>
              </span>
            </div>
          </div>

          {/* Standard Wide Class Cards Grid: 1 col on mobile, 2 on tablet, 3 on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
            {curriculumClasses.map((cls) => {
              const currentCount = studentStats[cls.id] || 0;
              const simplified = getSimplifiedClassName(cls.name);
              const displayName = simplified.includes("শ্রেণি") || simplified.includes("শ্রেণী")
                ? simplified
                : `${simplified} শ্রেণি`;

              return (
                <div
                  key={cls.id}
                  className="bg-slate-50 hover:bg-slate-100/80 p-3 sm:p-3.5 rounded-xl border border-slate-200 transition flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate" title={cls.name}>
                      {displayName}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                      অধ্যয়নরত শিক্ষার্থী
                    </span>
                  </div>

                  {/* Standard Wide Stepper Input */}
                  {isViewingExistingReport ? (
                    <div className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-1.5 text-center font-extrabold text-xs sm:text-sm text-slate-800 shadow-2xs shrink-0">
                      {currentCount} <span className="text-[10px] font-normal text-slate-500">জন</span>
                    </div>
                  ) : (
                    <div className="flex items-center bg-white border border-slate-300 hover:border-slate-400 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/15 rounded-xl overflow-hidden shadow-2xs transition shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setStudentStats((prev) => ({
                            ...prev,
                            [cls.id]: Math.max(0, (Number(prev[cls.id]) || 0) - 1),
                          }))
                        }
                        className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center font-bold text-xs transition cursor-pointer active:scale-95 border-r border-slate-200 shrink-0"
                        title="১ জন কমান"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={currentCount}
                        onChange={(e) =>
                          setStudentStats((prev) => ({
                            ...prev,
                            [cls.id]: Math.max(0, parseInt(e.target.value) || 0),
                          }))
                        }
                        className="w-14 sm:w-16 py-1 text-center font-black text-sm sm:text-base text-slate-900 bg-transparent focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setStudentStats((prev) => ({
                            ...prev,
                            [cls.id]: (Number(prev[cls.id]) || 0) + 1,
                          }))
                        }
                        className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center font-bold text-xs transition cursor-pointer active:scale-95 border-l border-slate-200 shrink-0"
                        title="১ জন বাড়ান"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 5: Anti-fraud & GPS Verification */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-emerald-600" />
             সত্যতা যাচাই 
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* GPS Capture */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700"> লাইভ জিপিএস:</span>
                {!isViewingExistingReport && (
                  <button
                    type="button"
                    onClick={handleCaptureGps}
                    disabled={gpsLoading}
                    className="px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center gap-1 hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                  >
                    {gpsLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                    {submissionGps ? "পুনরায় সংগ্রহ" : "জিপিএস সংগ্রহ"}
                  </button>
                )}
              </div>

              {submissionGps ? (
                <div className="bg-emerald-50 text-emerald-800 p-2 rounded-lg text-[11px] border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-mono">
                    অক্ষাংশ: {submissionGps.lat.toFixed(6)}, দ্রাঘিমাংশ: {submissionGps.lng.toFixed(6)}
                  </span>
                </div>
              ) : (
                <p className="text-slate-400 text-[11px]">এখনো জিপিএস স্থানাঙ্ক সংগ্রহ করা হয়নি।</p>
              )}
            </div>

            {/* Photos */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <span className="font-semibold text-slate-700 block">সরেজমিন অবকাঠামোর ছবি:</span>
              {!isViewingExistingReport && (
                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer bg-white hover:bg-slate-100 py-2 rounded-xl text-center text-slate-700 text-xs font-semibold border border-slate-300 border-dashed flex items-center justify-center gap-1.5 transition">
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                    ছবি তুলুন
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handlePhotoUpload(e, "front_view")}
                    />
                  </label>
                </div>
              )}
              {photos.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto pt-1 no-scrollbar">
                  {photos.map((p, idx) => (
                    <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                      <img src={p.url} alt="inspection" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : isViewingExistingReport ? (
                <p className="text-slate-400 text-[11px]">কোনো ছবি সংরক্ষিত নেই।</p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Section 6: পরিদর্শকের মন্তব্য ও ডিজিটাল স্বাক্ষর */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <label className="text-xs sm:text-sm font-bold text-slate-900 mb-2 block">
              পরিদর্শক/পরিদর্শকদের অন্যান্য মন্তব্য (যদি থাকে)
            </label>
            <textarea
              rows={4}
              value={inspectorRemarks}
              onChange={(e) => setInspectorRemarks(e.target.value)}
              readOnly={isViewingExistingReport}
              placeholder="মাদরাসার সার্বিক পরিবেশ ও মানোন্নয়ন সংক্রান্ত বিশেষ পরামর্শ..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600 read-only:bg-slate-100 read-only:text-slate-800 read-only:cursor-not-allowed"
            />
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-center">
            {isViewingExistingReport && signatureUrl && !signatureUrl.includes("iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB") ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center min-h-[150px]">
                <img src={signatureUrl} alt="পরিদর্শকের ডিজিটাল স্বাক্ষর" className="max-h-24 object-contain" />
                <span className="text-[11px] text-slate-500 font-semibold mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  পরিদর্শকের সংরক্ষিত ডিজিটাল স্বাক্ষর (লকড)
                </span>
              </div>
            ) : isViewingExistingReport ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center min-h-[150px] text-slate-500 text-xs">
                <span>কোন ডিজিটাল স্বাক্ষর সংরক্ষিত নেই</span>
              </div>
            ) : (
              <SignaturePad value={signatureUrl} onChange={setSignatureUrl} />
            )}
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="pt-4 border-t border-slate-200">
          {isViewingExistingReport ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-400/90 shadow-2xs">
              <div className="flex items-center gap-2.5 text-xs text-emerald-950 font-bold">
                <Lock className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span>
                    এই {inspectionPhase === "phase_1" ? "১ম" : inspectionPhase === "phase_2" ? "২য়" : "৩য়"} পরিদর্শন প্রতিবেদনটি ইতিমধ্যে দাখিল ও চূড়ান্তভাবে লক করা হয়েছে (সম্পাদনা বন্ধ)।
                  </span>
                  <p className="text-[11px] font-medium text-emerald-800">
                    পরিদর্শনকারী: <strong>{selectedReport?.inspectorName || "মাঠ পরিদর্শক"}</strong> • তারিখ:{" "}
                    {selectedReport?.inspectionDate ? new Date(selectedReport.inspectionDate).toLocaleDateString("bn-BD") : "—"} • প্রাপ্ত স্কোর: <strong>{selectedReport?.totalScore}%</strong>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPrintReportModal(true)}
                  className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  অফিসিয়াল রিপোর্ট প্রিন্ট করুন
                </button>
                {(onCancel || onClose) && (
                  <button
                    type="button"
                    onClick={onCancel || onClose}
                    className="px-5 py-2.5 rounded-full border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
                  >
                    বন্ধ করুন
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                * রিপোর্ট জমা দেওয়ার পর এটি লক হয়ে যাবে এবং পর্যালোচনার জন্য বোর্ডে সংরক্ষিত হবে।
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                {(onCancel || onClose) && (
                  <button
                    type="button"
                    onClick={onCancel || onClose}
                    className="px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
                  >
                    বাতিল করুন
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial px-8 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      সংরক্ষণ হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {inspectionPhase === "phase_1" ? "১ম" : inspectionPhase === "phase_2" ? "২য়" : "৩য়"} পরিদর্শন রিপোর্ট দাখিল ও সংরক্ষণ করুন
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Official Printable Inspection Report Modal */}
      {selectedReport && (
        <InspectionReportModal
          report={selectedReport}
          isOpen={showPrintReportModal}
          onClose={() => setShowPrintReportModal(false)}
        />
      )}
    </div>
  );

  // Return inside a Popup Window Modal if isModal is true
  if (isModal) {
    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
        onClick={(e) => {
          if (e.target === e.currentTarget && (onClose || onCancel)) {
            (onClose || onCancel)?.();
          }
        }}
      >
        <div className="relative bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-300 flex flex-col max-h-[94vh] overflow-hidden my-auto animate-in zoom-in-95 duration-150">
          {/* Modal Header (Standard Mobile & Desktop Size) */}
          <div className="bg-slate-900 text-white px-4 sm:px-8 py-3.5 sm:py-5 min-h-[64px] sm:min-h-[76px] flex items-center justify-between shrink-0 border-b border-slate-800 shadow-md">
            <div className="flex items-center gap-2.5 sm:gap-4 flex-1 min-w-0 pr-2">
              <h2 className="text-base sm:text-lg md:text-xl font-bold sm:font-black text-white truncate tracking-tight flex-1">
                {madrasahName ? `${madrasahName} — পরিদর্শন এন্ট্রি` : "নতুন মাদরাসা পরিদর্শন প্রতিবেদন"}
              </h2>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <span className="text-xs sm:text-sm text-emerald-400 font-bold px-3 py-1 sm:px-4 sm:py-1.5 bg-emerald-500/15 rounded-full border border-emerald-500/30 hidden sm:inline-block shadow-2xs">
                স্কোর: {liveScore.totalScore}% (
                {Object.keys(checklist).length === 0 && Object.keys(subjectMatrix).length === 0
                  ? "অমূল্যায়িত"
                  : liveScore.gradeLabel}
                )
              </span>
              <button
                type="button"
                onClick={onClose || onCancel}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center justify-center transition cursor-pointer shadow-sm active:scale-95 shrink-0"
                title="বন্ধ করুন (Esc)"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Body (Reduced mobile padding) */}
          <div className="overflow-y-auto flex-1 p-2 sm:p-5 bg-slate-100/60">
            {formContent}
          </div>
        </div>
      </div>
    );
  }

  // Otherwise render inline container
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6">
      {formContent}
    </div>
  );
}

// Export modal wrapper for direct usage
export function InspectionFormModal(props: InspectionFormProps) {
  return <InspectionForm {...props} isModal={true} />;
}
