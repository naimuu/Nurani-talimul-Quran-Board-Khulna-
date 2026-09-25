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
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { INSPECTION_TYPES } from "@/lib/inspectionUtils";

export default function MadrasaInspectionApplicationPage() {
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Form Fields
  const [madrasahName, setMadrasahName] = useState("");
  const [mCode, setMCode] = useState("");
  const [aCode, setACode] = useState("");
  const [district, setDistrict] = useState("");
  const [upazila, setUpazila] = useState("");
  const [postOffice, setPostOffice] = useState("");
  const [village, setVillage] = useState("");
  const [directorName, setDirectorName] = useState("");
  const [directorMobile, setDirectorMobile] = useState("");
  const [headTeacherName, setHeadTeacherName] = useState("");
  const [headTeacherMobile, setHeadTeacherMobile] = useState("");
  const [academicYearCe, setAcademicYearCe] = useState("2026");
  const [inspectionType, setInspectionType] = useState("new_elhak");
  const [targetDate, setTargetDate] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<any | null>(null);

  // Single Input Auto-Fetch
  const handleSingleInputSearch = async () => {
    if (!searchInput.trim()) {
      toast.error("অনুগ্রহ করে মাদরাসা কোড বা মোবাইল নম্বর লিখুন");
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/madrasa/by-code?code=${encodeURIComponent(searchInput.trim())}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || "মাদরাসার তথ্য খুঁজে পাওয়া যায়নি");
        return;
      }

      setMadrasahName(data.name || madrasahName);
      setMCode(data.ilhak || searchInput.trim());
      setVillage(data.village || village);
      setPostOffice(data.postOffice || postOffice);
      setUpazila(data.upazila || upazila);
      setDistrict(data.district || district);
      setDirectorName(data.ownerName || directorName);
      setDirectorMobile(data.contactNo || directorMobile);

      toast.success("বিদ্যমান ডাটাবেজ থেকে তথ্য লোড হয়েছে!");
    } catch (err) {
      console.error(err);
      toast.error("তথ্য লোড করতে সমস্যা হয়েছে");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!madrasahName.trim() || !district.trim() || !upazila.trim() || !directorName.trim() || !directorMobile.trim()) {
      toast.error("মাদরাসার নাম, জেলা, উপজেলা এবং পরিচালকের তথ্য আবশ্যক");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/inspection/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          madrasahName,
          mCode,
          aCode,
          district,
          upazila,
          village,
          postOffice,
          directorName,
          directorMobile,
          headTeacherName,
          headTeacherMobile,
          academicYearCe,
          inspectionType,
          targetDate: targetDate ? new Date(targetDate) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "আবেদন জমাদান ব্যর্থ হয়েছে");
      }

      setSubmittedApp(data.application);
      toast.success("আলহামদুলিল্লাহ! আপনার আবেদন সফলভাবে গৃহীত হয়েছে।");
    } catch (err: any) {
      toast.error(err.message || "আবেদন জমাদানে ত্রুটি দেখা দিয়েছে");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTypeConfig = INSPECTION_TYPES.find((t) => t.id === inspectionType);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <Building2 className="w-3.5 h-3.5" />
            মাদরাসা অন্তর্ভুক্তি ও বার্ষিক পরিদর্শন
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
            নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ
          </h1>
          <p className="text-xs text-slate-500">
            নতুন এলহাক, বার্ষিক নবায়ন, পুনঃপরিদর্শন ও পরীক্ষাকেন্দ্র পরিদর্শনের কেন্দ্রীয় অনলাইন আবেদন
          </p>
        </div>

        {/* If Submitted Success Card */}
        {submittedApp ? (
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">আবেদন সফলভাবে গৃহীত হয়েছে!</h2>
              <p className="text-xs text-slate-500 mt-1">
                আপনার প্রতিষ্ঠানের আবেদনটি বোর্ডের যাচাই তালিকায় অন্তর্ভুক্ত করা হয়েছে।
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-w-sm mx-auto text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">ট্র্যাকিং নম্বর:</span>
                <span className="font-mono font-bold text-slate-900">{submittedApp.trackingNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">মাদরাসা:</span>
                <span className="font-semibold text-slate-800">{submittedApp.madrasahName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">পরিদর্শনের ধরণ:</span>
                <span className="font-semibold text-emerald-700">{selectedTypeConfig?.badge}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">নির্ধারিত পরিদর্শন ফি:</span>
                <span className="font-bold text-slate-900">৳ {submittedApp.feeAmount}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link
                href={`/track?trackingId=${submittedApp.trackingNo}`}
                className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
              >
                লাইভ ট্র্যাকিং দেখুন
              </Link>
              <button
                onClick={() => setSubmittedApp(null)}
                className="px-6 py-2.5 rounded-full border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
              >
                আরেকটি আবেদন করুন
              </button>
            </div>
          </div>
        ) : (
          /* Application Form Card */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            
            {/* Smart Auto-fetch Banner */}
            <div className="bg-slate-900 text-white p-5 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-emerald-400" />
                সিঙ্গেল ইনপুট অটো-ফেচ (পূর্ববর্তী মাদরাসার ক্ষেত্রে)
              </h2>
              <div className="flex gap-2 max-w-lg">
                <input
                  type="text"
                  placeholder="মাদরাসা কোড (M কোড) বা পরিচালকের মোবাইল নম্বর লিখুন..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSingleInputSearch()}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleSingleInputSearch}
                  disabled={isSearching}
                  className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shrink-0 disabled:opacity-50"
                >
                  {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "তথ্য লোড"}
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Inspection Type Selector */}
              <div>
                <label className="text-xs font-bold text-slate-800 mb-2 block">
                  পরিদর্শনের ধরণ নির্বাচন করুন *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {INSPECTION_TYPES.map((t) => (
                    <label
                      key={t.id}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-2.5 ${
                        inspectionType === t.id
                          ? "border-emerald-600 bg-emerald-50/50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="inspectionType"
                        checked={inspectionType === t.id}
                        onChange={() => setInspectionType(t.id)}
                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{t.badge}</span>
                          <span className="text-[11px] font-bold text-emerald-700">৳ {t.defaultFee}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{t.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Madrasah Info */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  মাদরাসার বিবরণ ও ঠিকানা
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="text-slate-600 mb-1 block font-medium">মাদরাসার পূর্ণ নাম *</label>
                    <input
                      type="text"
                      value={madrasahName}
                      onChange={(e) => setMadrasahName(e.target.value)}
                      placeholder="যেমন: তাহফিজুল উম্মাহ মডেল মাদরাসা"
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 mb-1 block font-medium">M কোড (যদি থাকে)</label>
                    <input
                      type="text"
                      value={mCode}
                      onChange={(e) => setMCode(e.target.value)}
                      placeholder="যেমন: ৭৫০"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 mb-1 block font-medium">জেলা *</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="যেমন: বাগেরহাট"
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 mb-1 block font-medium">উপজেলা/থানা *</label>
                    <input
                      type="text"
                      value={upazila}
                      onChange={(e) => setUpazila(e.target.value)}
                      placeholder="যেমন: মোড়েলগঞ্জ"
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 mb-1 block font-medium">ডাকঘর</label>
                    <input
                      type="text"
                      value={postOffice}
                      onChange={(e) => setPostOffice(e.target.value)}
                      placeholder="ডাকঘর"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Authority Contact */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  পরিচালনা ও দায়িত্বশীলগণের বিবরণ
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-600 mb-1 block font-medium">পরিচালক/মুহতামিমের নাম *</label>
                    <input
                      type="text"
                      value={directorName}
                      onChange={(e) => setDirectorName(e.target.value)}
                      placeholder="পরিচালকের পূর্ণ নাম"
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 mb-1 block font-medium">পরিচালকের মোবাইল নম্বর *</label>
                    <input
                      type="text"
                      value={directorMobile}
                      onChange={(e) => setDirectorMobile(e.target.value)}
                      placeholder="০১৯৮২-XXXXXX"
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 mb-1 block font-medium">নূরানী প্রধানের নাম</label>
                    <input
                      type="text"
                      value={headTeacherName}
                      onChange={(e) => setHeadTeacherName(e.target.value)}
                      placeholder="প্রধান শিক্ষকের নাম (যদি থাকে)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 mb-1 block font-medium">কাঙ্ক্ষিত পরিদর্শনের সম্ভাব্য তারিখ</label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  নির্ধারিত ফি: <strong className="text-slate-900">৳ {selectedTypeConfig?.defaultFee || 1500}</strong> প্রদেয়
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      দাখিল হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      আবেদন দাখিল করুন
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
