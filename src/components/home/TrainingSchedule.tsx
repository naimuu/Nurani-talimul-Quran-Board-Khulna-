"use client";

import { useState, useEffect, useRef } from "react";
import { 
  MapPin, 
  Calendar, 
  Phone, 
  GraduationCap, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles 
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import AdmissionModal from "@/components/training/AdmissionModal";

export interface BatchData {
  id?: string;
  _id?: string;
  medium: "bangla" | "arabic";
  title: string;
  subtitle: string;
  badge?: string;
  durationDays: string;
  durationText?: string;
  price: string;
  location: string;
  date: string;
  batch: string;
  phone: string;
  link?: string;
  regLink?: string;
  coverImage?: string;
  isActive?: boolean;
}

const fallbackBanglaBatches: BatchData[] = [
  {
    id: "default-bangla-1",
    medium: "bangla",
    title: "মুয়াল্লিম প্রশিক্ষণ (বাংলা)",
    subtitle: "৩০ দিন ব্যাপী বিশেষ শিক্ষক প্রশিক্ষণ কোর্স",
    badge: "বাংলা",
    durationDays: "৩০",
    durationText: "দিন মেয়াদী প্রশিক্ষণ",
    price: "৳ ৫,৫০০",
    location: "খুলনা বিভাগীয় কার্যালয় ও জেলা কেন্দ্র",
    date: "চলমান / নতুন সেশন",
    batch: "ব্যাচ নং: ১২৪ (বাংলা)",
    phone: "01966-935832, 01988-977209",
    link: "/training/moallem-bangla",
    regLink: "/register",
    isActive: true
  }
];

const fallbackArabicBatches: BatchData[] = [
  {
    id: "default-arabic-1",
    medium: "arabic",
    title: "মুয়াল্লিম প্রশিক্ষণ (আরবী)",
    subtitle: "৫০ দিন ব্যাপী উচ্চতর আরবী শিক্ষক প্রশিক্ষণ",
    badge: "আরবি",
    durationDays: "৫০",
    durationText: "দিন মেয়াদী প্রশিক্ষণ",
    price: "৳ ৭,৫০০",
    location: "খুলনা কেন্দ্রীয় কেন্দ্র ও সারাদেশের শাখাসমূহ",
    date: "চলমান / কেন্দ্রীয় ব্যাচ",
    batch: "ব্যাচ নং: ৮৫৪ (আরবী)",
    phone: "01966-935832, 01939-895290",
    link: "/training/moallem-arabic",
    regLink: "/register",
    isActive: true
  }
];

// Reusable Single Sliding Medium Card Component
function MediumTrainingCard({
  batches,
  medium,
  autoSlideInterval = 5500,
  onApply
}: {
  batches: BatchData[];
  medium: "bangla" | "arabic";
  autoSlideInterval?: number;
  onApply?: (batchId: string, medium: string) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isPaused, setIsPaused] = useState(false);

  const isBangla = medium === "bangla";
  const validBatches = batches.length > 0 ? batches : (isBangla ? fallbackBanglaBatches : fallbackArabicBatches);

  // Auto sliding interval
  useEffect(() => {
    if (validBatches.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setDirection("next");
      setCurrentIndex((prev) => (prev + 1) % validBatches.length);
    }, autoSlideInterval);

    return () => clearInterval(timer);
  }, [validBatches.length, isPaused, autoSlideInterval]);

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDirection("next");
    setCurrentIndex((prev) => (prev + 1) % validBatches.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDirection("prev");
    setCurrentIndex((prev) => (prev - 1 + validBatches.length) % validBatches.length);
  };

  const activeBatch = validBatches[currentIndex] || validBatches[0];

  // Theme variables
  const theme = isBangla
    ? {
        cardBg: "bg-gradient-to-b from-emerald-50/70 via-white to-teal-50/40",
        cardBorder: "border-emerald-200/90 hover:border-emerald-400",
        cardShadow: "hover:shadow-[0_12px_30px_rgb(16,185,129,0.12)]",
        glow: "from-emerald-500/10 to-teal-500/0",
        badgeBg: "bg-emerald-100/80 text-emerald-900 border-emerald-300/60",
        priceBg: "bg-emerald-900 text-amber-300 border border-emerald-800",
        durationBadge: "bg-gradient-to-br from-[#052e23] via-emerald-800 to-emerald-700 text-white shadow-md shadow-emerald-950/20",
        durationTextColor: "text-emerald-200",
        titleColor: "text-emerald-950 group-hover:text-emerald-800",
        iconBg: "bg-emerald-100/70 text-emerald-800",
        iconColor: "text-emerald-700",
        btnPrimary: "bg-gradient-to-r from-[#052e23] to-[#047857] hover:from-emerald-900 hover:to-emerald-700 text-white shadow-sm hover:shadow-emerald-900/20",
        btnSecondary: "bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300/80 shadow-2xs",
        dotActive: "bg-emerald-700 w-5",
        dotInactive: "bg-emerald-200 hover:bg-emerald-400 w-1.5"
      }
    : {
        cardBg: "bg-gradient-to-b from-amber-50/60 via-white to-orange-50/30",
        cardBorder: "border-amber-200/90 hover:border-amber-400",
        cardShadow: "hover:shadow-[0_12px_30px_rgb(245,158,11,0.14)]",
        glow: "from-amber-500/10 to-orange-500/0",
        badgeBg: "bg-amber-100/80 text-amber-950 border-amber-300/60",
        priceBg: "bg-slate-900 text-amber-300 border border-slate-800",
        durationBadge: "bg-gradient-to-br from-[#1e1b4b] via-[#1e3a8a] to-[#052e23] text-white shadow-md shadow-slate-950/20",
        durationTextColor: "text-amber-200",
        titleColor: "text-slate-900 group-hover:text-amber-900",
        iconBg: "bg-amber-100/70 text-amber-900",
        iconColor: "text-amber-700",
        btnPrimary: "bg-gradient-to-r from-[#1e1b4b] to-[#1e3a8a] hover:from-slate-950 hover:to-indigo-950 text-white shadow-sm hover:shadow-indigo-950/20",
        btnSecondary: "bg-white hover:bg-amber-50 text-amber-950 border border-amber-300/80 shadow-2xs",
        dotActive: "bg-amber-700 w-5",
        dotInactive: "bg-amber-200 hover:bg-amber-400 w-1.5"
      };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`rounded-3xl border ${theme.cardBorder} ${theme.cardBg} p-4 sm:p-4.5 xl:p-5 flex flex-col justify-between ${theme.cardShadow} transition-all duration-300 min-w-0 relative group shadow-sm overflow-hidden min-h-[380px] sm:min-h-[400px]`}
    >
      {/* Faded Background Cover Image */}
      {activeBatch.coverImage && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-15 filter brightness-105"
          style={{ backgroundImage: `url(${activeBatch.coverImage})` }}
        />
      )}

      {/* Ambient Background Glow */}
      <div className={`absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl ${theme.glow} rounded-full blur-3xl pointer-events-none`}></div>

      {/* Manual Sliding Left/Right Chevrons (Visible on Hover if multiple batches) */}
      {validBatches.length > 1 && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30">
          <button
            type="button"
            onClick={handlePrev}
            className="pointer-events-auto absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 shadow-md border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:scale-110 active:scale-95 transition-all"
            title="পূর্ববর্তী ব্যাচ"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="pointer-events-auto absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 shadow-md border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:scale-110 active:scale-95 transition-all"
            title="পরবর্তী ব্যাচ"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Row: Category Badge, Batch Counter & Course Fee */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${theme.badgeBg}`}>
            {activeBatch.badge && activeBatch.badge !== "বাংলা মাধ্যম" && activeBatch.badge !== "আরবি মাধ্যম"
              ? activeBatch.badge
              : (isBangla ? "বাংলা" : "আরবি")}
          </span>

          {validBatches.length > 1 && (
            <span className="text-[10.5px] font-bold text-slate-500 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200/60 shadow-2xs">
              {currentIndex + 1}/{validBatches.length}
            </span>
          )}
        </div>

        <span className={`text-xs font-black px-2.5 py-1 rounded-xl shadow-2xs ${theme.priceBg}`}>
          ফি: {activeBatch.price}
        </span>
      </div>

      {/* Animated Sliding Content Container */}
      <div className="relative z-10 flex-1 my-3 overflow-hidden flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBatch.id || activeBatch._id || currentIndex}
            initial={{ opacity: 0, x: direction === "next" ? 25 : -25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction === "next" ? -25 : 25 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-3.5"
          >
            {/* Course Title & Duration Showcase (Clickable to Details) */}
            <Link 
              href={activeBatch.link || (isBangla ? "/training/moallem-bangla" : "/training/moallem-arabic")}
              className="flex items-center gap-3 pt-0.5 group/title block"
            >
              <div className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl ${theme.durationBadge} flex flex-col items-center justify-center font-bold shrink-0 border border-white/20 p-1 group-hover/title:scale-105 transition-transform`}>
                <span className="text-lg sm:text-xl font-black leading-none">{activeBatch.durationDays}</span>
                <span className={`text-[9px] uppercase font-bold ${theme.durationTextColor} mt-0.5`}>দিন</span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className={`font-black text-sm sm:text-base xl:text-lg leading-tight transition-colors ${theme.titleColor} group-hover/title:underline`}>
                  {activeBatch.title}
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                  {activeBatch.subtitle}
                </p>
              </div>
            </Link>

            {/* Information Rows in Glorious Glass Card */}
            <div className="space-y-2.5 text-xs text-slate-700 bg-white/95 backdrop-blur-xs p-3 sm:p-3.5 rounded-2xl border border-slate-200/70 shadow-xs">
              <div className="flex items-start gap-2">
                <div className={`w-5.5 h-5.5 rounded-lg ${theme.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-slate-800 leading-snug truncate">{activeBatch.location}</span>
              </div>

              <div className="flex items-center justify-between gap-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 truncate">
                  <Calendar className={`w-3.5 h-3.5 ${theme.iconColor} shrink-0`} />
                  <span className="truncate">{activeBatch.date}</span>
                </div>
                <span className="font-bold text-slate-800 shrink-0 bg-slate-100 px-1.5 py-0.5 rounded-lg border border-slate-200/60 text-[11px]">
                  {activeBatch.batch}
                </span>
              </div>

              {/* Phone Numbers with Separate Clickable Badges */}
              <div className="flex items-start gap-1.5 pt-2 border-t border-slate-100 min-w-0">
                <Phone className="w-3.5 h-3.5 shrink-0 text-red-500 mt-0.5" />
                <div className="flex items-center gap-1.5 truncate flex-wrap">
                  {activeBatch.phone.split(',').map((ph, idx) => {
                    const cleanPhone = ph.trim().replace(/[^0-9+]/g, '');
                    return (
                      <a
                        key={idx}
                        href={`tel:${cleanPhone}`}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-900 border border-red-200 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-2xs"
                        title={`কল করতে ক্লিক করুন: ${ph.trim()}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>{ph.trim()}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sliding Dots Indicators (if more than 1 batch) */}
      {validBatches.length > 1 && (
        <div className="relative z-10 flex items-center justify-center gap-1.5 py-1">
          {validBatches.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              onClick={() => {
                setDirection(dotIdx > currentIndex ? "next" : "prev");
                setCurrentIndex(dotIdx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                dotIdx === currentIndex ? theme.dotActive : theme.dotInactive
              }`}
              title={`ব্যাচ ${dotIdx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Bottom Action Buttons */}
      <div className="pt-3 mt-1 flex items-center gap-2 relative z-10">
        <button
          type="button"
          onClick={() => {
            if (onApply) {
              onApply(activeBatch._id || activeBatch.id || '', activeBatch.medium || medium);
            }
          }}
          className={`flex-1 py-2 px-3 sm:px-4 rounded-xl ${theme.btnPrimary} text-xs sm:text-sm font-bold text-center transition-all duration-200 active:scale-95 cursor-pointer`}
        >
          আবেদন করুন
        </button>
        <Link
          href={activeBatch.link || (isBangla ? "/training/moallem-bangla" : "/training/moallem-arabic")}
          className={`py-2 px-3 sm:px-4 rounded-xl ${theme.btnSecondary} text-xs sm:text-sm font-bold transition-all duration-200 text-center active:scale-95`}
        >
          বিস্তারিত
        </Link>
      </div>
    </div>
  );
}

export default function TrainingSchedule() {
  const [banglaBatches, setBanglaBatches] = useState<BatchData[]>(fallbackBanglaBatches);
  const [arabicBatches, setArabicBatches] = useState<BatchData[]>(fallbackArabicBatches);
  const [admissionModal, setAdmissionModal] = useState<{ isOpen: boolean; batchId?: string; medium?: string }>({ isOpen: false });

  const handleOpenAdmission = (batchId: string, med: string) => {
    setAdmissionModal({ isOpen: true, batchId, medium: med });
  };

  useEffect(() => {
    async function loadBatches() {
      try {
        const res = await fetch("/api/training/batches");
        if (res.ok) {
          const data = await res.json();
          if (data.batches && Array.isArray(data.batches) && data.batches.length > 0) {
            const bangla = data.batches.filter((b: BatchData) => b.medium === "bangla");
            const arabic = data.batches.filter((b: BatchData) => b.medium === "arabic");

            if (bangla.length > 0) setBanglaBatches(bangla);
            if (arabic.length > 0) setArabicBatches(arabic);
          }
        }
      } catch (e) {
        console.error("Could not fetch dynamic training batches:", e);
      }
    }
    loadBatches();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-slate-100/90 overflow-hidden flex flex-col min-h-[520px] sm:min-h-[550px] w-full justify-between">
      
      {/* Top Banner */}
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-[#052e23] via-emerald-800 to-[#0a4233] text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base leading-tight truncate">মুয়াল্লিম প্রশিক্ষণ সময়সূচি</h3>
            <p className="text-xs text-emerald-200 font-medium truncate">বাংলা ও আরবি শিক্ষক প্রশিক্ষণ কোর্সসমূহ</p>
          </div>
        </div>

        <Link 
          href="/training/rules" 
          className="text-xs font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 hover:underline shrink-0 bg-white/10 px-3 py-1.5 rounded-xl transition-colors"
        >
          <span>নিয়মাবলী</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 2-Grid Card Layout for All Devices (1-Grid for Mobile) with Auto-Sliding Batches */}
      <div className="p-3.5 sm:p-4 xl:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 xl:gap-5 flex-1 items-stretch">
        {/* Left Grid: Bangla Batches Slider */}
        <MediumTrainingCard
          batches={banglaBatches}
          medium="bangla"
          autoSlideInterval={5500}
          onApply={handleOpenAdmission}
        />

        {/* Right Grid: Arabic Batches Slider */}
        <MediumTrainingCard
          batches={arabicBatches}
          medium="arabic"
          autoSlideInterval={6500}
          onApply={handleOpenAdmission}
        />
      </div>

      {/* Admission Popup Modal */}
      <AdmissionModal
        isOpen={admissionModal.isOpen}
        onClose={() => setAdmissionModal(prev => ({ ...prev, isOpen: false }))}
        batchId={admissionModal.batchId}
        medium={admissionModal.medium}
      />

      {/* Footer Callout */}
      <div className="p-3 sm:p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
        <span className="text-xs">সারাদেশের স্থায়ী ও বাৎসরিক প্রশিক্ষণ কেন্দ্রসমূহ</span>
        <Link 
          href="/training/permanent-center-list" 
          className="text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center gap-1 hover:underline text-xs"
        >
          <span>কেন্দ্র তালিকা দেখুন</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
