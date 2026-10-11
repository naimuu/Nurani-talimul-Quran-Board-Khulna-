"use client";

import React, { useState } from "react";
import {
  Building2,
  Search,
  MapPin,
  Calendar,
  FileCheck,
  Send,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Users,
  BookOpen,
  Clock,
  AlertTriangle,
  Layers,
  HelpCircle,
  Phone,
  Info,
  Check,
  Printer,
  FilePlus,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { INSPECTION_TYPES } from "@/lib/inspectionUtils";
import GeoAddressSelector, { GeoAddressData } from "@/components/common/GeoAddressSelector";

export default function MadrasaInspectionApplicationPage() {
  const [activeTab, setActiveTab] = useState<"apply" | "track">("apply");
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Form Fields
  const [madrasahName, setMadrasahName] = useState("");
  const [mCode, setMCode] = useState("");
  const [establishedYear, setEstablishedYear] = useState("");
  const [madrasaType, setMadrasaType] = useState("নূরানী সাধারণ (বালক ও বালিকা)");

  // Geo Address Cascade
  const [geoAddress, setGeoAddress] = useState<GeoAddressData>({
    division: "খুলনা",
    district: "",
    upazila: "",
    union: "",
    village: "",
    fullAddress: "",
  });
  const [postOffice, setPostOffice] = useState("");

  // Authorities
  const [directorName, setDirectorName] = useState("");
  const [directorMobile, setDirectorMobile] = useState("");
  const [altMobile, setAltMobile] = useState("");
  const [headTeacherName, setHeadTeacherName] = useState("");
  const [headTeacherMobile, setHeadTeacherMobile] = useState("");

  // Academics
  const [totalStudents, setTotalStudents] = useState<number | "">("");
  const [totalTeachers, setTotalTeachers] = useState<number | "">("");
  const [highestClass, setHighestClass] = useState("৩য় শ্রেণি");

  // Inspection Details
  const [academicYearCe, setAcademicYearCe] = useState("2026");
  const [inspectionType, setInspectionType] = useState("new_elhak");
  const [targetDate, setTargetDate] = useState("");
  const [isPreviouslyInspected, setIsPreviouslyInspected] = useState(false);
  const [lastInspectionDate, setLastInspectionDate] = useState("");
  const [inspectionReason, setInspectionReason] = useState("");
  const [applicantRemarks, setApplicantRemarks] = useState("");

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState<"bKash" | "Nagad" | "Bank" | "Challan">("bKash");
  const [paymentTrxId, setPaymentTrxId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<any | null>(null);

  // Tracking Search in Tab 2
  const [trackQuery, setTrackQuery] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackedResult, setTrackedResult] = useState<any | null>(null);

  // Pathao-style Single Input Auto-Fetch
  const handleSingleInputSearch = async (overrideQuery?: string) => {
    const query = (overrideQuery || searchInput || "").trim();
    if (!query) {
      toast.error("অনুগ্রহ করে মাদরাসা কোড বা মোবাইল নম্বর লিখুন");
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/madrasa/by-code?code=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || "মাদরাসার তথ্য খুঁজে পাওয়া যায়নি");
        return;
      }

      setMadrasahName(data.name || madrasahName);
      setMCode(data.ilhak || query);
      setDirectorName(data.ownerName || directorName);
      setDirectorMobile(data.contactNo || directorMobile);

      const newGeo: GeoAddressData = {
        division: data.division || geoAddress.division || "খুলনা",
        district: data.district || geoAddress.district || "",
        upazila: data.upazila || geoAddress.upazila || "",
        union: data.union || geoAddress.union || "",
        village: data.village || geoAddress.village || "",
        fullAddress: data.address || [data.village, data.union, data.upazila, data.district].filter(Boolean).join(", "),
      };
      setGeoAddress(newGeo);

      toast.success("বিদ্যমান ডাটাবেজ থেকে সকল তথ্য স্বয়ংক্রিয়ভাবে যুক্ত হয়েছে!");
    } catch (err) {
      console.error(err);
      toast.error("তথ্য লোড করতে সমস্যা হয়েছে");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!madrasahName.trim()) {
      toast.error("মাদরাসার নাম আবশ্যক");
      return;
    }
    if (!geoAddress.district || !geoAddress.upazila) {
      toast.error("মাদরাসার বিভাগ, জেলা ও উপজেলা নির্বাচন করুন");
      return;
    }
    if (!directorName.trim() || !directorMobile.trim()) {
      toast.error("প্রধান / পরিচালকের নাম ও মোবাইল নম্বর আবশ্যক");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/inspection/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          madrasahName: madrasahName.trim(),
          mCode: mCode.trim(),
          establishedYear: establishedYear.trim(),
          madrasaType,
          division: geoAddress.division || "খুলনা",
          district: geoAddress.district,
          upazila: geoAddress.upazila,
          union: geoAddress.union,
          village: geoAddress.village,
          postOffice: postOffice.trim(),
          fullAddress: geoAddress.fullAddress || [geoAddress.village, geoAddress.union, geoAddress.upazila, geoAddress.district].filter(Boolean).join(", "),
          directorName: directorName.trim(),
          directorMobile: directorMobile.trim(),
          altMobile: altMobile.trim(),
          headTeacherName: headTeacherName.trim(),
          headTeacherMobile: headTeacherMobile.trim(),
          totalStudents: totalStudents ? Number(totalStudents) : 0,
          totalTeachers: totalTeachers ? Number(totalTeachers) : 0,
          highestClass,
          academicYearCe,
          inspectionType,
          targetDate: targetDate ? new Date(targetDate) : undefined,
          isPreviouslyInspected,
          lastInspectionDate: lastInspectionDate ? new Date(lastInspectionDate) : undefined,
          inspectionReason: inspectionReason.trim(),
          applicantRemarks: applicantRemarks.trim(),
          paymentMethod,
          paymentTrxId: paymentTrxId.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "আবেদন জমাদান ব্যর্থ হয়েছে");
      }

      setSubmittedApp(data.application);
      toast.success("আলহামদুলিল্লাহ! আপনার পরিদর্শন আবেদন সফলভাবে গৃহীত হয়েছে।");
    } catch (err: any) {
      toast.error(err.message || "আবেদন জমাদানে ত্রুটি দেখা দিয়েছে");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackSearch = async () => {
    if (!trackQuery.trim()) {
      toast.error("আবেদন ট্র্যাকিং নম্বর বা মোবাইল নম্বর লিখুন");
      return;
    }
    setTrackingLoading(true);
    setTrackedResult(null);
    try {
      const res = await fetch(`/api/inspection/applications?search=${encodeURIComponent(trackQuery.trim())}`);
      const data = await res.json();
      if (res.ok && data.applications && data.applications.length > 0) {
        setTrackedResult(data.applications[0]);
      } else {
        toast.error("কোনো আবেদন রেকর্ড খুঁজে পাওয়া যায়নি");
      }
    } catch {
      toast.error("সার্ভার ত্রুটি। আবার চেষ্টা করুন।");
    } finally {
      setTrackingLoading(false);
    }
  };

  const selectedTypeConfig = INSPECTION_TYPES.find((t) => t.id === inspectionType);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">আবেদন গৃহীত (যাচাইাধীন)</span>;
      case "PAID":
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">ফি পরিশোধিত (যাচাইাধীন)</span>;
      case "ASSIGNED":
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">পরিদর্শক নির্ধারিত</span>;
      case "SCHEDULED":
        return <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-xs">তারিখ নির্ধারিত</span>;
      case "INSPECTED":
        return <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs">পরিদর্শন সম্পন্ন (রিপোর্ট অপেক্ষমাণ)</span>;
      case "APPROVED":
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-xs">অনুমোদিত ও সফল</span>;
      case "REVISION_REQUIRED":
        return <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-xs">সংশোধন প্রয়োজন</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-xs">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10 px-3.5 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ─── HEADER ────────────────────────────────────────────────── */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>মাদরাসা অন্তর্ভুক্তি ও পরিদর্শন ব্যবস্থাপনা</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900">
            নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
            নতুন ইলহাক, বার্ষিক নবায়ন, পুনঃপরিদর্শন ও পরীক্ষাকেন্দ্রের কেন্দ্রীয় অনলাইন আবেদন ও ট্র্যাকিং
          </p>
        </div>

        {/* ─── TABS ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("apply")}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "apply"
                ? "bg-[#095738] text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <FilePlus className="w-4 h-4" />
            <span>পরিদর্শন আবেদন ফরম</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("track")}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "track"
                ? "bg-[#095738] text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Search className="w-4 h-4" />
            <span>আবেদন স্ট্যাটাস ট্র্যাকিং</span>
          </button>
        </div>

        {/* ─── TAB 2: TRACK APPLICATION ──────────────────────────────── */}
        {activeTab === "track" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-7 space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Search className="w-4.5 h-4.5 text-emerald-600" />
                <span>পরিদর্শন আবেদনের অগ্রগতি যাচাই (Live Status)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                আপনার আবেদনের ট্র্যাকিং নম্বর (যেমন: INV-2026-XXXXX) অথবা আবেদনকারীর মোবাইল নম্বর দিন।
              </p>
            </div>

            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTrackSearch()}
                placeholder="INV-2026-XXXXX বা 01XXXXXXXXX"
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-emerald-600 focus:bg-white"
              />
              <button
                type="button"
                onClick={handleTrackSearch}
                disabled={trackingLoading || !trackQuery.trim()}
                className="px-5 py-2 bg-[#095738] hover:bg-[#07472d] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {trackingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "স্ট্যাটাস দেখুন"}
              </button>
            </div>

            {trackedResult && (
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">আবেদন ট্র্যাকিং নম্বর:</span>
                    <span className="font-mono text-sm sm:text-base font-black text-slate-900">{trackedResult.trackingNo}</span>
                  </div>
                  <div>
                    {getStatusBadge(trackedResult.status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">মাদরাসার নাম:</span>
                    <span className="font-bold text-slate-800">{trackedResult.madrasahName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">ঠিকানা:</span>
                    <span className="font-semibold text-slate-700">{[trackedResult.village, trackedResult.upazila, trackedResult.district].filter(Boolean).join(", ")}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">পরিদর্শনের ধরন:</span>
                    <span className="font-bold text-emerald-700">{INSPECTION_TYPES.find(t => t.id === trackedResult.inspectionType)?.badge || trackedResult.inspectionType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">প্রধান/পরিচালক:</span>
                    <span className="font-semibold text-slate-700">{trackedResult.directorName} ({trackedResult.directorMobile})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">নির্ধারিত পরিদর্শক:</span>
                    <span className="font-semibold text-slate-700">
                      {trackedResult.assignedInspectorName ? `${trackedResult.assignedInspectorName} (${trackedResult.assignedInspectorPhone || "নিযুক্ত"})` : "অ্যাসাইন প্রক্রিয়াধীন"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">পরিদর্শনের তারিখ:</span>
                    <span className="font-semibold text-slate-700">
                      {trackedResult.targetDate ? new Date(trackedResult.targetDate).toLocaleDateString("bn-BD") : "নির্ধারিত হয়নি"}
                    </span>
                  </div>
                </div>

                {/* Progress Steps Timeline */}
                <div className="pt-3 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-slate-600 block mb-2">কার্যক্রম অগ্রগতি:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>১. আবেদন গৃহীত</span>
                    </div>
                    <div className={`p-2 rounded-lg border flex items-center gap-1.5 font-bold ${
                      trackedResult.assignedInspectorName ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-white border-slate-200 text-slate-400"
                    }`}>
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>২. পরিদর্শক নির্ধারণ</span>
                    </div>
                    <div className={`p-2 rounded-lg border flex items-center gap-1.5 font-bold ${
                      trackedResult.status === "INSPECTED" || trackedResult.status === "APPROVED" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-white border-slate-200 text-slate-400"
                    }`}>
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>৩. সরেজমিন পরিদর্শন</span>
                    </div>
                    <div className={`p-2 rounded-lg border flex items-center gap-1.5 font-bold ${
                      trackedResult.status === "APPROVED" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-slate-200 text-slate-400"
                    }`}>
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>৪. বোর্ড অনুমোদন</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 1: SUBMISSION SUCCESS SCREEN ──────────────────────── */}
        {activeTab === "apply" && submittedApp && (
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-6 sm:p-8 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">আলহামদুলিল্লাহ! পরিদর্শন আবেদন সফলভাবে গৃহীত হয়েছে</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                আপনার আবেদনটি কেন্দ্রীয় সিস্টেমে সংরক্ষিত হয়েছে। পরিদর্শক নির্ধারণ ও তারিখ শিডিউলের পর এসএমএসের মাধ্যমে জানানো হবে।
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-w-sm mx-auto text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">আবেদন নম্বর (ট্র্যাকিং):</span>
                <span className="font-mono font-bold text-emerald-800 text-sm">{submittedApp.trackingNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">মাদরাসা:</span>
                <span className="font-semibold text-slate-800">{submittedApp.madrasahName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">পরিদর্শনের ধরন:</span>
                <span className="font-semibold text-emerald-700">{selectedTypeConfig?.badge}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">নির্ধারিত পরিদর্শন ফি:</span>
                <span className="font-bold text-slate-900">৳ {submittedApp.feeAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">পেমেন্ট অবস্থা:</span>
                <span className="font-bold text-emerald-700">{submittedApp.paymentStatus === "PAID" ? "পরিশোধিত (PAID)" : "অপেক্ষমাণ"}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setTrackQuery(submittedApp.trackingNo);
                  setActiveTab("track");
                  handleTrackSearch();
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                লাইভ ট্র্যাকিং দেখুন
              </button>
              <button
                type="button"
                onClick={() => setSubmittedApp(null)}
                className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
              >
                আরেকটি নতুন আবেদন করুন
              </button>
            </div>
          </div>
        )}

        {/* ─── TAB 1: APPLICATION FORM ───────────────────────────────── */}
        {activeTab === "apply" && !submittedApp && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

            {/* Smart Auto-fetch Banner */}
            <div className="bg-[#052e23] text-white p-4 sm:p-5 border-b border-[#0d4f3b]">
              <div className="flex items-center gap-2 mb-1.5">
                <Search className="w-4 h-4 text-amber-300" />
                <h2 className="text-xs sm:text-sm font-bold text-white">
                  স্মার্ট অটো-ফিল (মোবাইল নম্বর বা ইলহাক কোড দিয়ে তথ্য লোড)
                </h2>
              </div>
              <p className="text-[11px] text-emerald-200 mb-2">
                পূর্বে নিবন্ধিত মাদরাসা হলে শুধুমাত্র মোবাইল নম্বর বা কোড দিলে পাঠাও স্টাইলে পূর্বের নাম ও ঠিকানা চলে আসবে।
              </p>
              <div className="flex gap-2 max-w-lg">
                <input
                  type="text"
                  placeholder="মাদরাসা কোড বা মোবাইল নম্বর লিখুন (যেমন: 017...)"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSingleInputSearch()}
                  className="w-full px-3.5 py-1.5 bg-[#0a3f31] border border-[#14664f] rounded-xl text-xs text-white placeholder-emerald-300/60 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => handleSingleInputSearch()}
                  disabled={isSearching}
                  className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl text-xs font-bold transition shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "তথ্য লোড"}
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 text-xs">

              {/* 1. INSPECTION TYPE */}
              <div>
                <label className="text-xs font-bold text-slate-800 mb-2 block">
                  ১. পরিদর্শনের ধরন নির্বাচন করুন *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {INSPECTION_TYPES.map((t) => (
                    <label
                      key={t.id}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-2.5 ${
                        inspectionType === t.id
                          ? "border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="inspectionType"
                        checked={inspectionType === t.id}
                        onChange={() => setInspectionType(t.id)}
                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{t.badge}</span>
                          <span className="text-[11px] font-black text-emerald-800">৳ {t.defaultFee}</span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 mt-0.5">{t.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 2. MADRASA BASIC INFO */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>২. মাদরাসার মূল পরিচিতি</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-slate-600 mb-1 block font-semibold">মাদরাসার পূর্ণ নাম *</label>
                    <input
                      type="text"
                      value={madrasahName}
                      onChange={(e) => setMadrasahName(e.target.value)}
                      placeholder="যেমন: মুহাম্মাদনগর নূরানী ক্যাডেট মাদরাসা"
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-600 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 mb-1 block font-semibold">মাদরাসা কোড / ইলহাক (যদি থাকে)</label>
                    <input
                      type="text"
                      value={mCode}
                      onChange={(e) => setMCode(e.target.value)}
                      placeholder="যেমন: ৭৫০"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-600 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 mb-1 block font-semibold">প্রতিষ্ঠার সাল</label>
                    <input
                      type="text"
                      value={establishedYear}
                      onChange={(e) => setEstablishedYear(e.target.value)}
                      placeholder="যেমন: ২০২০"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-600 font-semibold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-slate-600 mb-1 block font-semibold">মাদরাসার ধরন</label>
                    <select
                      value={madrasaType}
                      onChange={(e) => setMadrasaType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-600 font-semibold cursor-pointer"
                    >
                      <option value="নূরানী সাধারণ (বালক ও বালিকা)">নূরানী সাধারণ (বালক ও বালিকা)</option>
                      <option value="নূরানী বালক মাদরাসা">নূরানী বালক মাদরাসা</option>
                      <option value="নূরানী বালিকা মাদরাসা">নূরানী বালিকা মাদরাসা</option>
                      <option value="নূরানী ও হিফজ মাদরাসা">নূরানী ও হিফজ মাদরাসা</option>
                      <option value="সমন্বিত কওমি-নূরানী মাদরাসা">সমন্বিত কওমি-নূরানী মাদরাসা</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. GEO CASCADE ADDRESS */}
              <div className="pt-3 border-t border-slate-100">
                <GeoAddressSelector
                  label="৩. মাদরাসার পূর্ণাঙ্গ ভৌগোলিক ঠিকানা *"
                  value={geoAddress}
                  onChange={setGeoAddress}
                />
              </div>

              {/* 4. AUTHORITIES INFO */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>৪. পরিচালনা ও দায়িত্বশীলগণের তথ্য</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-600 mb-1 block font-semibold">মুহতামিম / পরিচালকের নাম *</label>
                    <input
                      type="text"
                      value={directorName}
                      onChange={(e) => setDirectorName(e.target.value)}
                      placeholder="পরিচালকের নাম"
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-600 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 mb-1 block font-semibold">পরিচালকের মোবাইল নম্বর *</label>
                    <input
                      type="tel"
                      value={directorMobile}
                      onChange={(e) => setDirectorMobile(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-600 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 mb-1 block font-semibold">বিকল্প মোবাইল নম্বর</label>
                    <input
                      type="tel"
                      value={altMobile}
                      onChange={(e) => setAltMobile(e.target.value)}
                      placeholder="জরুরি যোগাযোগের নম্বর"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-600 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 mb-1 block font-semibold">প্রধান শিক্ষকের নাম (যদি থাকে)</label>
                    <input
                      type="text"
                      value={headTeacherName}
                      onChange={(e) => setHeadTeacherName(e.target.value)}
                      placeholder="প্রধান শিক্ষক"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-600 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 mb-1 block font-semibold">প্রধান শিক্ষকের মোবাইল</label>
                    <input
                      type="tel"
                      value={headTeacherMobile}
                      onChange={(e) => setHeadTeacherMobile(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-600 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* 5. ACADEMIC STATS */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>৫. শিক্ষক ও শিক্ষার্থী পরিসংখ্যান</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-600 mb-1 block font-semibold">মোট ছাত্র-ছাত্রী সংখ্যা</label>
                    <input
                      type="number"
                      min="0"
                      value={totalStudents}
                      onChange={(e) => setTotalStudents(e.target.value ? Number(e.target.value) : "")}
                      placeholder="যেমন: ১২০"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-600 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 mb-1 block font-semibold">মোট শিক্ষক সংখ্যা</label>
                    <input
                      type="number"
                      min="0"
                      value={totalTeachers}
                      onChange={(e) => setTotalTeachers(e.target.value ? Number(e.target.value) : "")}
                      placeholder="যেমন: ৫"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-600 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 mb-1 block font-semibold">কোন শ্রেণি পর্যন্ত চালু আছে?</label>
                    <select
                      value={highestClass}
                      onChange={(e) => setHighestClass(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-600 font-semibold cursor-pointer"
                    >
                      <option value="শিশু ও কায়দা">শিশু ও কায়দা</option>
                      <option value="১ম শ্রেণি">১ম শ্রেণি</option>
                      <option value="২য় শ্রেণি">২য় শ্রেণি</option>
                      <option value="৩য় শ্রেণি">৩য় শ্রেণি (কেন্দ্রীয় সমাপনী)</option>
                      <option value="৪র্থ শ্রেণি">৪র্থ শ্রেণি</option>
                      <option value="৫ম শ্রেণি">৫ম শ্রেণি (কেন্দ্রীয় সমাপনী)</option>
                      <option value="হিফজুল কুরআন">হিফজুল কুরআন</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 6. PREVIOUS INSPECTION & REASON */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>৬. পূর্ববর্তী পরিদর্শন ও পরিদর্শনের কারণ</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-600 mb-1 block font-semibold">পূর্বে পরিদর্শন হয়েছে কি?</label>
                    <select
                      value={isPreviouslyInspected ? "yes" : "no"}
                      onChange={(e) => setIsPreviouslyInspected(e.target.value === "yes")}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-600 font-semibold cursor-pointer"
                    >
                      <option value="no">না (প্রথমবার)</option>
                      <option value="yes">হ্যাঁ (পূর্বে পরিদর্শন হয়েছে)</option>
                    </select>
                  </div>
                  {isPreviouslyInspected && (
                    <div>
                      <label className="text-slate-600 mb-1 block font-semibold">সর্বশেষ পরিদর্শনের তারিখ</label>
                      <input
                        type="date"
                        value={lastInspectionDate}
                        onChange={(e) => setLastInspectionDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-600 font-semibold cursor-pointer"
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-slate-600 mb-1 block font-semibold">কাঙ্ক্ষিত পরিদর্শনের তারিখ</label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-600 font-semibold cursor-pointer"
                    />
                  </div>
                  <div className="sm:col-span-2 md:col-span-3">
                    <label className="text-slate-600 mb-1 block font-semibold">পরিদর্শনের কারণ বা আবেদনকারীর মন্তব্য</label>
                    <textarea
                      rows={2}
                      value={inspectionReason}
                      onChange={(e) => setInspectionReason(e.target.value)}
                      placeholder="যেমন: নতুন শিক্ষাবর্ষে এলহাক অনুমোদন ও শিক্ষকগণের পাঠদান মান যাচাইয়ের জন্য অনুরোধ..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-600 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 7. INSPECTION FEE & PAYMENT */}
              <div className="space-y-3 pt-3 border-t border-slate-100 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    <span>৭. পরিদর্শন ফি ও অনলাইন পেমেন্ট</span>
                  </h3>
                  <span className="text-sm font-black text-emerald-800">
                    ফি: ৳ {selectedTypeConfig?.defaultFee || 0}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["bKash", "Nagad", "Bank", "Challan"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        paymentMethod === m
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {m === "bKash" && "বিকাশ (bKash)"}
                      {m === "Nagad" && "নগদ (Nagad)"}
                      {m === "Bank" && "ব্যাংক জমা"}
                      {m === "Challan" && "চালান / রসিদ"}
                    </button>
                  ))}
                </div>

                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-blue-700 font-medium block">ফি প্রদানের নম্বর / হিসাব:</span>
                    <span className="font-mono font-bold text-blue-900 text-sm">
                      {paymentMethod === "Bank" ? "A/C: 123456789, Islami Bank" : "01700000000 (মার্চেন্ট/ব্যক্তিগত)"}
                    </span>
                  </div>
                  <span className="text-[11px] text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200 font-bold">
                    টাকা পাঠিয়ে TrxID দিন
                  </span>
                </div>

                <div>
                  <label className="text-slate-700 mb-1 block font-semibold">
                    ট্রানজেকশন আইডি (TrxID) বা চালান নম্বর (ঐচ্ছিক / পরবর্তীতেও দেওয়া যাবে)
                  </label>
                  <input
                    type="text"
                    value={paymentTrxId}
                    onChange={(e) => setPaymentTrxId(e.target.value)}
                    placeholder="TrxID বা রসিদ নম্বর লিখুন"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-emerald-600 font-semibold"
                  />
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 bg-[#095738] hover:bg-[#07472d] text-white font-bold rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>আবেদন জমা নেওয়া হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>পরিদর্শন আবেদন দাখিল করুন</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
