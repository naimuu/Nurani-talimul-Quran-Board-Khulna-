"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  Award,
  Search,
  Loader2,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function InspectionVerifyPage() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const token = searchParams.get("token");
  const code = searchParams.get("code");

  const [inputRef, setInputRef] = useState(ref || code || "");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchVerification = async (searchRef: string, searchToken?: string) => {
    if (!searchRef.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const url = `/api/inspection/verify?ref=${encodeURIComponent(searchRef.trim())}${
        searchToken ? `&token=${encodeURIComponent(searchToken)}` : ""
      }`;
      const res = await fetch(url);
      const resData = await res.json();
      if (!res.ok || resData.error) {
        setError(resData.error || "সনদ বা পরিদর্শন রেকর্ডটি খুঁজে পাওয়া যায়নি।");
        setData(null);
      } else {
        setData(resData);
      }
    } catch (err) {
      setError("যাচাইকরণ সার্ভারে সংযোগে ত্রুটি দেখা দিয়েছে।");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ref || code) {
      fetchVerification(ref || code || "", token || undefined);
    }
  }, [ref, token, code]);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Board Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <ShieldCheck className="w-4 h-4" />
            ডিজিটাল নিরাপত্তা ও সত্যতা যাচাই পোর্টাল
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
            নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ
          </h1>
          <p className="text-xs text-slate-500">
            মাদরাসা পরিদর্শন রিপোর্ট ও এলহাক সনদের কেন্দ্রীয় ক্রিপ্টোগ্রাফিক যাচাইকরণ
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={inputRef}
              onChange={(e) => setInputRef(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchVerification(inputRef)}
              placeholder="ট্র্যাকিং নং (যেমন: INV-2026-00125) বা M কোড লিখুন"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>
          <button
            onClick={() => fetchVerification(inputRef)}
            disabled={loading}
            className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "যাচাই করুন"}
          </button>
        </div>

        {/* Verification Result Card */}
        {loading && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500">বোর্ডের কেন্দ্রীয় ডাটাবেজে ক্রিপ্টোগ্রাফিক হ্যাশ যাচাই হচ্ছে...</p>
          </div>
        )}

        {error && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-200 text-center space-y-3">
            <XCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">রেকর্ড পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
          </div>
        )}

        {data && (
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 overflow-hidden">
            {/* Status Header */}
            <div className="bg-emerald-600 text-white p-5 text-center space-y-1">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-200" />
              <h2 className="text-base font-bold">বৈধ ও অনুমোদিত পরিদর্শন সনদ</h2>
              <p className="text-[11px] text-emerald-100">
                কেন্দ্রীয় ক্রিপ্টোগ্রাফিক স্বাক্ষর শতভাগ খাঁটি ও অপরিবর্তিত
              </p>
            </div>

            {/* Content Details */}
            <div className="p-6 space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-slate-400 block text-[10px]">প্রতিষ্ঠানের নাম</span>
                <span className="text-base font-bold text-slate-900">{data.madrasahName}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">মাদরাসা কোড (M Code)</span>
                  <span className="font-bold text-slate-800 text-sm">{data.madrasahCode || "৭৫০"}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">ট্র্যাকিং নম্বর</span>
                  <span className="font-bold text-slate-800 text-sm">{data.trackingNo}</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">উপজেলা ও জেলা</span>
                  <span className="font-semibold text-slate-800">{data.upazila}, {data.district}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">পরিদর্শনের তারিখ</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(data.inspectionDate).toLocaleDateString("bn-BD")}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">অর্জিত সামগ্রিক স্কোর</span>
                  <span className="font-bold text-emerald-700 text-sm">{data.totalScore}%</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">মূল্যায়িত প্রাতিষ্ঠানিক গ্রেড</span>
                  <span className="font-bold text-slate-800">{data.gradeLabel || data.grade}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="text-[10px] text-slate-400">দায়িত্বপ্রাপ্ত মাঠ পরিদর্শক</div>
                    <div className="font-bold text-slate-800">{data.inspectorName}</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  বোর্ড অনুমোদিত
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
              <Link
                href="/"
                className="text-xs text-emerald-700 font-semibold hover:underline inline-flex items-center gap-1"
              >
                বোর্ডের প্রধান ওয়েবসাইটে ফিরে যান <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
