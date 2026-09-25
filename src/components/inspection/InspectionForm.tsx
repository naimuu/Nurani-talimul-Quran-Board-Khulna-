"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import toast from "react-hot-toast";
import SignaturePad from "./SignaturePad";
import {
  GENERAL_CHECKLIST_ITEMS,
  STANDARD_INSPECTION_SUBJECTS,
  STANDARD_INSPECTION_CLASSES,
  calculateInspectionScore,
  haversineDistance,
} from "@/lib/inspectionUtils";

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

// Single Cycle/Toggle Button Component for touch-friendly card evaluation
function CycleToggleButton({
  currentValue,
  options,
  onChange,
  className = "",
}: {
  currentValue: string;
  options: {
    value: string;
    label: string;
    colorClass: string;
    bgClass: string;
    borderClass: string;
    icon?: React.ReactNode;
  }[];
  onChange: (nextValue: string) => void;
  className?: string;
}) {
  const currentIndex = options.findIndex((opt) => opt.value === currentValue);
  const activeOpt = currentIndex !== -1 ? options[currentIndex] : options[0];

  const handleNext = () => {
    // Optional haptic tap on mobile
    if (typeof window !== "undefined" && window.navigator && "vibrate" in window.navigator) {
      try {
        window.navigator.vibrate(12);
      } catch (e) {}
    }
    const nextIndex = (currentIndex + 1) % options.length;
    onChange(options[nextIndex].value);
  };

  return (
    <button
      type="button"
      onClick={handleNext}
      className={`inline-flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer select-none border ${activeOpt.bgClass} ${activeOpt.colorClass} ${activeOpt.borderClass} ${className}`}
      title="ক্লিক করে মান পরিবর্তন করুন"
    >
      <span className="flex items-center gap-1">
        {activeOpt.icon}
        <span>{activeOpt.label}</span>
      </span>
      <span className="text-[10px] opacity-75 font-mono">➔</span>
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
  const [village, setVillage] = useState(initialApplication?.village || "");
  const [postOffice, setPostOffice] = useState(initialApplication?.postOffice || "");
  const [upazila, setUpazila] = useState(initialApplication?.upazila || "");
  const [district, setDistrict] = useState(initialApplication?.district || "");
  const [academicYearCe, setAcademicYearCe] = useState(initialApplication?.academicYearCe || "2026");
  const [academicYearHijri, setAcademicYearHijri] = useState(initialApplication?.academicYearHijri || "১৪৪৭-৪৮");
  const [directorName, setDirectorName] = useState(initialApplication?.directorName || "");
  const [directorMobile, setDirectorMobile] = useState(initialApplication?.directorMobile || "");
  const [headTeacherName, setHeadTeacherName] = useState(initialApplication?.headTeacherName || "");
  const [headTeacherMobile, setHeadTeacherMobile] = useState(initialApplication?.headTeacherMobile || "");
  const [inspectionPhase, setInspectionPhase] = useState<"phase_1" | "phase_2" | "phase_3">("phase_1");
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split("T")[0]);

  // Section 1: 11 General Checklist Points
  const [checklist, setChecklist] = useState<Record<string, any>>({
    syllabus_compliance: "yes",
    trained_teachers_method: "yes",
    classroom_environment: "yes",
    teachers_weekly_meeting: "yes",
    director_monthly_meeting: "yes",
    talim_quality: "good",
    tarbiyat_quality: "good",
    handwriting_quality: "good",
    cleanliness_sanitation: "yes",
    previous_advice_implemented: "yes",
    moallem_jore_attendance: 4,
  });

  // Section 2: Subject × Class Matrix
  const [subjectMatrix, setSubjectMatrix] = useState<Record<string, Record<string, string>>>(() => {
    const initial: Record<string, Record<string, string>> = {};
    STANDARD_INSPECTION_CLASSES.forEach((cls) => {
      initial[cls.id] = {};
      STANDARD_INSPECTION_SUBJECTS.forEach((sub) => {
        initial[cls.id][sub.id] = "good";
      });
    });
    return initial;
  });

  // Active Class Tab for Card View
  const [activeClassId, setActiveClassId] = useState<string>(STANDARD_INSPECTION_CLASSES[0]?.id || "cls_play");
  // Toggle between dynamic Card View and Full Table Matrix
  const [matrixViewMode, setMatrixViewMode] = useState<"card" | "table">("card");

  // Section 3: Teachers Stats
  const [teacherStats, setTeacherStats] = useState({
    total: 4,
    present: 4,
  });

  // Section 4: Students Stats
  const [studentStats, setStudentStats] = useState<Record<string, number>>({
    play: 7,
    nursery: 18,
    class_1: 19,
    class_2: 16,
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
      setVillage(initialApplication.village || "");
      setPostOffice(initialApplication.postOffice || "");
      setUpazila(initialApplication.upazila || "");
      setDistrict(initialApplication.district || "");
      setDirectorName(initialApplication.directorName || "");
      setDirectorMobile(initialApplication.directorMobile || "");
      setHeadTeacherName(initialApplication.headTeacherName || "");
      setHeadTeacherMobile(initialApplication.headTeacherMobile || "");
    }
  }, [initialApplication]);

  // Live Score & Grade calculation
  const liveScore = calculateInspectionScore(checklist, subjectMatrix);

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
        setVillage(m.village || m.address || "");
        setPostOffice(m.postOffice || "");
        setUpazila(m.upazila || m.thana || "");
        setDistrict(m.district || "");
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

  // GPS Geolocation Capture
  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      toast.error("আপনার ব্রাউজারে জিপিএস সুবিধা সমর্থিত নয়");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSubmissionGps({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGpsLoading(false);
        toast.success("সরেজমিন জিপিএস স্থানাঙ্ক সফলভাবে সংগৃহীত হয়েছে");
      },
      (err) => {
        console.error(err);
        setGpsLoading(false);
        toast.error("জিপিএস লোকেশন সংগ্রহ করতে অনুমতি দিন");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

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

  // Batch action: Set all subjects of active class to 'good' or 'moderate'
  const handleBatchClassRating = (classId: string, rating: string) => {
    setSubjectMatrix((prev) => {
      const updatedClass = { ...(prev[classId] || {}) };
      STANDARD_INSPECTION_SUBJECTS.forEach((sub) => {
        updatedClass[sub.id] = rating;
      });
      return {
        ...prev,
        [classId]: updatedClass,
      };
    });
    toast.success(
      `${STANDARD_INSPECTION_CLASSES.find((c) => c.id === classId)?.name}-এর সকল বিষয় "${rating === "good" ? "ভাল" : "মধ্যম"}" করা হয়েছে`
    );
  };

  // Batch action: Set all checklist items to 'yes'
  const handleSetAllChecklistYes = () => {
    setChecklist((prev) => ({
      ...prev,
      syllabus_compliance: "yes",
      trained_teachers_method: "yes",
      classroom_environment: "yes",
      teachers_weekly_meeting: "yes",
      director_monthly_meeting: "yes",
      talim_quality: "good",
      tarbiyat_quality: "good",
      handwriting_quality: "good",
      cleanliness_sanitation: "yes",
      previous_advice_implemented: "yes",
    }));
    toast.success("সকল নিরীক্ষা মানদণ্ড ইতিবাচক ('হ্যাঁ/ভাল') সেট করা হয়েছে");
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
        village,
        postOffice,
        upazila,
        district,
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
      <div className="bg-slate-900 text-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                অফিস কপি
              </span>
              <span className="text-[11px] text-slate-400">নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-400" />
              মাদরাসা পরিদর্শন রিপোর্ট (ডিজিটাল এন্ট্রি)
            </h1>
          </div>

          {/* Live Score Pill Badge */}
          <div className="flex items-center gap-3 bg-slate-800/90 border border-slate-700/80 px-4 py-2 rounded-2xl">
            <Award className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">লাইভ স্কোর ও গ্রেড</div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className="text-emerald-400">{liveScore.totalScore}%</span>
                <span className="text-xs font-semibold text-slate-300">({liveScore.gradeLabel})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Single Input Bar */}
        <div className="mt-4 pt-3.5 border-t border-slate-800">
          <label className="text-xs text-slate-300 mb-1.5 block font-medium">
            সিঙ্গেল ইনপুট অটো-ফেচ: মাদরাসা কোড (M কোড) বা মোবাইল নম্বর দিয়ে স্বয়ংক্রিয় তথ্য আনুন
          </label>
          <div className="flex gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="যেমন: ৭৫০ বা ০১৯৮২৮২১৯৫৫"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSingleInputSearch()}
                className="w-full pl-9 pr-4 py-2 bg-slate-800/90 border border-slate-700 rounded-full text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="button"
              onClick={handleSingleInputSearch}
              disabled={isSearching}
              className="px-4 sm:px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-sm shadow-emerald-600/20"
            >
              {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "তথ্য লোড করুন"}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section: মাদরাসার সাধারণ বিবরণী */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 mb-3.5 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            মাদরাসার সাধারণ ও প্রাতিষ্ঠানিক তথ্য
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="text-slate-700 mb-1 block font-semibold">মাদরাসার পূর্ণ নাম *</label>
              <input
                type="text"
                value={madrasahName}
                onChange={(e) => setMadrasahName(e.target.value)}
                placeholder="যেমন: তাহফিজুল উম্মাহ মডেল মাদরাসা"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-700 mb-1 block font-semibold">M কোড (মাদরাসা কোড)</label>
              <input
                type="text"
                value={mCode}
                onChange={(e) => setMCode(e.target.value)}
                placeholder="যেমন: ৭৫০"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-700 mb-1 block font-semibold">A কোড (বোর্ড কোড)</label>
              <input
                type="text"
                value={aCode}
                onChange={(e) => setACode(e.target.value)}
                placeholder="ঐচ্ছিক"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-700 mb-1 block font-semibold">গ্রাম</label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="গ্রামের নাম"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-700 mb-1 block font-semibold">ডাকঘর</label>
              <input
                type="text"
                value={postOffice}
                onChange={(e) => setPostOffice(e.target.value)}
                placeholder="পৌরসভা / ডাকঘর"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-700 mb-1 block font-semibold">থানা/উপজেলা *</label>
              <input
                type="text"
                value={upazila}
                onChange={(e) => setUpazila(e.target.value)}
                placeholder="যেমন: মোড়েলগঞ্জ"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-700 mb-1 block font-semibold">জেলা *</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="যেমন: বাগেরহাট"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-700 mb-1 block font-semibold">শিক্ষাবর্ষ (খ্রিস্টীয়)</label>
              <input
                type="text"
                value={academicYearCe}
                onChange={(e) => setAcademicYearCe(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-700 mb-1 block font-semibold">শিক্ষাবর্ষ (হিজরী)</label>
              <input
                type="text"
                value={academicYearHijri}
                onChange={(e) => setAcademicYearHijri(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-700 mb-1 block font-semibold">পরিচালক/সভাপতির নাম *</label>
              <input
                type="text"
                value={directorName}
                onChange={(e) => setDirectorName(e.target.value)}
                placeholder="পরিচালকের নাম"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-700 mb-1 block font-semibold">পরিচালকের মোবাইল *</label>
              <input
                type="text"
                value={directorMobile}
                onChange={(e) => setDirectorMobile(e.target.value)}
                placeholder="০১৭১১-XXXXXX"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-700 mb-1.5 block font-semibold">পরিদর্শন পর্যায় নির্বাচন করুন</label>
              <div className="flex gap-2">
                {(["phase_1", "phase_2", "phase_3"] as const).map((p, idx) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setInspectionPhase(p)}
                    className={`flex-1 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                      inspectionPhase === p
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {idx === 0 ? "১ম পরিদর্শন" : idx === 1 ? "২য় পরিদর্শন" : "৩য় পরিদর্শন"}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-700 mb-1 block font-semibold">পরিদর্শনের তারিখ</label>
              <input
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 1: ১১টি সার্বিক রিপোর্টের বিবরণী (Dynamic Card Style with Single Toggle Buttons) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                টেবিল ০১: সার্বিক রিপোর্টের বিবরণী (১১টি প্রধান নিরীক্ষা মানদণ্ড)
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                প্রতিটি কার্ডের টগল বাটনে একবার চাপ দিয়ে মান পরিবর্তন করুন (যেমন: হ্যাঁ ➔ আংশিক ➔ না)
              </p>
            </div>

            <button
              type="button"
              onClick={handleSetAllChecklistYes}
              className="px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 flex items-center gap-1 transition shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>সবগুলো 'হ্যাঁ/ভাল' করুন</span>
            </button>
          </div>

          {/* Cards List for 11 Questions */}
          <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {GENERAL_CHECKLIST_ITEMS.map((item) => {
              const currentVal = checklist[item.id];

              return (
                <div
                  key={item.id}
                  className="bg-slate-50/70 hover:bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-[11px] shrink-0 shadow-2xs">
                      {item.sl}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 leading-snug">
                        {item.label}
                      </p>
                    </div>
                  </div>

                  {/* Single Toggle Button or Numeric Input */}
                  <div className="shrink-0">
                    {item.type === "yes_no_partial" ? (
                      <CycleToggleButton
                        currentValue={currentVal || "yes"}
                        options={[
                          {
                            value: "yes",
                            label: "হ্যাঁ",
                            bgClass: "bg-emerald-600 hover:bg-emerald-700",
                            colorClass: "text-white",
                            borderClass: "border-emerald-600",
                            icon: <CheckCircle2 className="w-3.5 h-3.5 text-white" />,
                          },
                          {
                            value: "partial",
                            label: "আংশিক",
                            bgClass: "bg-amber-500 hover:bg-amber-600",
                            colorClass: "text-white",
                            borderClass: "border-amber-500",
                            icon: <MinusCircle className="w-3.5 h-3.5 text-white" />,
                          },
                          {
                            value: "no",
                            label: "না",
                            bgClass: "bg-rose-600 hover:bg-rose-700",
                            colorClass: "text-white",
                            borderClass: "border-rose-600",
                            icon: <XCircle className="w-3.5 h-3.5 text-white" />,
                          },
                        ]}
                        onChange={(nextVal) => setChecklist((prev) => ({ ...prev, [item.id]: nextVal }))}
                      />
                    ) : item.type === "good_moderate_weak" ? (
                      <CycleToggleButton
                        currentValue={currentVal || "good"}
                        options={[
                          {
                            value: "good",
                            label: "ভাল",
                            bgClass: "bg-emerald-600 hover:bg-emerald-700",
                            colorClass: "text-white",
                            borderClass: "border-emerald-600",
                            icon: <CheckCircle2 className="w-3.5 h-3.5 text-white" />,
                          },
                          {
                            value: "moderate",
                            label: "মধ্যম",
                            bgClass: "bg-blue-600 hover:bg-blue-700",
                            colorClass: "text-white",
                            borderClass: "border-blue-600",
                            icon: <MinusCircle className="w-3.5 h-3.5 text-white" />,
                          },
                          {
                            value: "weak",
                            label: "দুর্বল",
                            bgClass: "bg-rose-600 hover:bg-rose-700",
                            colorClass: "text-white",
                            borderClass: "border-rose-600",
                            icon: <AlertTriangle className="w-3.5 h-3.5 text-white" />,
                          },
                        ]}
                        onChange={(nextVal) => setChecklist((prev) => ({ ...prev, [item.id]: nextVal }))}
                      />
                    ) : (
                      // Numeric Stepper for moallem_jore_attendance
                      <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-full p-0.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={() =>
                            setChecklist((prev) => ({
                              ...prev,
                              [item.id]: Math.max(0, (Number(prev[item.id]) || 0) - 1),
                            }))
                          }
                          className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-bold text-xs text-slate-900">
                          {checklist[item.id] || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setChecklist((prev) => ({
                              ...prev,
                              [item.id]: (Number(prev[item.id]) || 0) + 1,
                            }))
                          }
                          className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <span className="text-[10px] text-slate-500 pr-2 font-medium">জন</span>
                      </div>
                    )}
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
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                টেবিল ০২: বিষয়ভিত্তিক ও শ্রেণিভিত্তিক মূল্যায়ন (ক থেকে ড)
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                শ্রেণি নির্বাচন করে প্রতিটি বিষয়ের বাটনে ট্যাপ করে মান নির্ধারণ করুন: ভাল ➔ মধ্যম ➔ দুর্বল
              </p>
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
                  কার্ড ভিউ (মোবাইল)
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
                  ম্যাট্রিক্স টেবিল
                </button>
              </div>
            </div>
          </div>

          {/* If Card View (Mobile Responsive & Default) */}
          {matrixViewMode === "card" ? (
            <div className="p-3 sm:p-4 space-y-4">
              {/* Class Selector Tab Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {STANDARD_INSPECTION_CLASSES.map((cls) => {
                  const isActive = activeClassId === cls.id;
                  return (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => setActiveClassId(cls.id)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      <span>{cls.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Class Subheader & Quick Batch Action Bar */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  {STANDARD_INSPECTION_CLASSES.find((c) => c.id === activeClassId)?.name}-এর ১৩টি বিষয়ের মূল্যায়ন
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleBatchClassRating(activeClassId, "good")}
                    className="px-3 py-1 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold transition cursor-pointer"
                  >
                    সবগুলো 'ভাল' করুন
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBatchClassRating(activeClassId, "moderate")}
                    className="px-3 py-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-800 text-[11px] font-bold transition cursor-pointer"
                  >
                    সবগুলো 'মধ্যম' করুন
                  </button>
                </div>
              </div>

              {/* 13 Subject Cards for Active Class */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {STANDARD_INSPECTION_SUBJECTS.map((subj) => {
                  const currentRating = subjectMatrix[activeClassId]?.[subj.id] || "good";

                  return (
                    <div
                      key={subj.id}
                      className="bg-slate-50/70 hover:bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                          {subj.sl}
                        </span>
                        <span className="text-xs font-semibold text-slate-800 truncate">
                          {subj.name}
                        </span>
                      </div>

                      {/* Single Cycle Toggle Button for Subject Rating */}
                      <CycleToggleButton
                        currentValue={currentRating}
                        options={[
                          {
                            value: "good",
                            label: "ভাল",
                            bgClass: "bg-emerald-600 hover:bg-emerald-700",
                            colorClass: "text-white",
                            borderClass: "border-emerald-600",
                            icon: <CheckCircle2 className="w-3.5 h-3.5 text-white" />,
                          },
                          {
                            value: "moderate",
                            label: "মধ্যম",
                            bgClass: "bg-blue-600 hover:bg-blue-700",
                            colorClass: "text-white",
                            borderClass: "border-blue-600",
                            icon: <MinusCircle className="w-3.5 h-3.5 text-white" />,
                          },
                          {
                            value: "weak",
                            label: "দুর্বল",
                            bgClass: "bg-rose-600 hover:bg-rose-700",
                            colorClass: "text-white",
                            borderClass: "border-rose-600",
                            icon: <AlertTriangle className="w-3.5 h-3.5 text-white" />,
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
                    {STANDARD_INSPECTION_CLASSES.map((cls) => (
                      <th key={cls.id} className="p-2 font-semibold text-center min-w-[90px]">
                        {cls.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {STANDARD_INSPECTION_SUBJECTS.map((subj) => (
                    <tr key={subj.id} className="hover:bg-slate-50/50">
                      <td className="p-2 font-medium text-slate-800 sticky left-0 bg-white">
                        <span className="font-bold text-slate-400 mr-1.5">{subj.sl}.</span>
                        {subj.name}
                      </td>
                      {STANDARD_INSPECTION_CLASSES.map((cls) => {
                        const currentVal = subjectMatrix[cls.id]?.[subj.id] || "good";
                        return (
                          <td key={cls.id} className="p-1.5 text-center">
                            <CycleToggleButton
                              currentValue={currentVal}
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

        {/* Section 3 & 4: শিক্ষক ও ছাত্র-ছাত্রী পরিসংখ্যান */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Teacher Stats */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              নূরানী বিভাগের শিক্ষকদের সংখ্যা ও উপস্থিতি
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-600 block font-medium">মোট শিক্ষক সংখ্যা</label>
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setTeacherStats((p) => ({ ...p, total: Math.max(0, p.total - 1) }))}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={teacherStats.total}
                    onChange={(e) => setTeacherStats((prev) => ({ ...prev, total: Number(e.target.value) }))}
                    className="w-full text-center font-bold text-slate-800 bg-transparent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setTeacherStats((p) => ({ ...p, total: p.total + 1 }))}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 block font-medium">উপস্থিত শিক্ষক সংখ্যা</label>
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setTeacherStats((p) => ({ ...p, present: Math.max(0, p.present - 1) }))}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={teacherStats.present}
                    onChange={(e) => setTeacherStats((prev) => ({ ...prev, present: Number(e.target.value) }))}
                    className="w-full text-center font-bold text-slate-800 bg-transparent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setTeacherStats((p) => ({ ...p, present: p.present + 1 }))}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Student Stats */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                শ্রেণিভিত্তিক ছাত্র-ছাত্রীর সংখ্যা
              </h3>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                মোট: {totalStudents} জন
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-xs">
              {[
                { key: "play", label: "প্লে" },
                { key: "nursery", label: "নার্সারী" },
                { key: "class_1", label: "১ম" },
                { key: "class_2", label: "২য়" },
                { key: "class_3", label: "৩য়" },
                { key: "class_4", label: "৪র্থ" },
                { key: "class_5", label: "৫ম" },
              ].map((s) => (
                <div key={s.key} className="bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-center">
                  <label className="text-slate-500 mb-0.5 block text-[10px] font-semibold">{s.label}</label>
                  <input
                    type="number"
                    min="0"
                    value={studentStats[s.key] || 0}
                    onChange={(e) =>
                      setStudentStats((prev) => ({
                        ...prev,
                        [s.key]: Number(e.target.value),
                      }))
                    }
                    className="w-full py-0.5 bg-white border border-slate-200 rounded-md text-center font-bold text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 5: Anti-fraud & GPS Verification */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-emerald-600" />
            সরেজমিন সত্যতা যাচাই (লাইভ জিপিএস ও ছবি আপলোড)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* GPS Capture */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">ডিভাইস লাইভ জিপিএস:</span>
                <button
                  type="button"
                  onClick={handleCaptureGps}
                  disabled={gpsLoading}
                  className="px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center gap-1 hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                >
                  {gpsLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                  {submissionGps ? "পুনরায় সংগ্রহ" : "জিপিএস সংগ্রহ"}
                </button>
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
              <div className="flex gap-2">
                <label className="flex-1 cursor-pointer bg-white hover:bg-slate-100 py-2 rounded-xl text-center text-slate-700 text-xs font-semibold border border-slate-300 border-dashed flex items-center justify-center gap-1.5 transition">
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  ছবি তুলুন / ফাইল নির্বাচন
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e, "front_view")}
                  />
                </label>
              </div>
              {photos.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pt-1 no-scrollbar">
                  {photos.map((p, idx) => (
                    <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                      <img src={p.url} alt="inspection" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 6: পরিদর্শকের মন্তব্য ও ডিজিটাল স্বাক্ষর */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <label className="text-xs font-bold text-slate-900 mb-2 block">
              পরিদর্শক/পরিদর্শকদের অন্যান্য মন্তব্য (যদি থাকে)
            </label>
            <textarea
              rows={4}
              value={inspectorRemarks}
              onChange={(e) => setInspectorRemarks(e.target.value)}
              placeholder="মাদরাসার সার্বিক পরিবেশ ও মানোন্নয়ন সংক্রান্ত বিশেষ পরামর্শ..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <label className="text-xs font-bold text-slate-900 mb-2 block">
              পরিদর্শকের ডিজিটাল স্বাক্ষর *
            </label>
            <SignaturePad value={signatureUrl} onChange={setSignatureUrl} />
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
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
                  রিপোর্ট দাখিল ও সংরক্ষণ করুন
                </>
              )}
            </button>
          </div>
        </div>
      </form>
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
          {/* Modal Header */}
          <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold tracking-wide">
                পরিদর্শন ফর্ম পপআপ
              </span>
              <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
                {madrasahName ? `${madrasahName} — পরিদর্শন এন্ট্রি` : "নতুন মাদরাসা পরিদর্শন প্রতিবেদন"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-emerald-400 font-bold hidden sm:inline-block">
                স্কোর: {liveScore.totalScore}% ({liveScore.gradeLabel})
              </span>
              <button
                type="button"
                onClick={onClose || onCancel}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                title="বন্ধ করুন (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="overflow-y-auto flex-1 p-3 sm:p-6 bg-slate-100/70">
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
