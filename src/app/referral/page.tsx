"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Copy,
  Check,
  Share2,
  DollarSign,
  TrendingUp,
  Receipt,
  CreditCard,
  AlertCircle,
  FileText,
  BookOpen,
  ArrowLeft,
  RefreshCw,
  Phone,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface PayoutRecord {
  id: string;
  jimmadarPhone: string;
  jimmadarName: string;
  amount: number;
  paymentMethod: string;
  trxId?: string;
  notes?: string;
  date: string;
}

interface ReferredOrder {
  invoiceId: string;
  date: string;
  customerName: string;
  customerPhone?: string | null;
  instituteId?: string | null;
  totalAmount: number;
  paidAmount: number;
  status: string;
  commission: number;
  commissionPercent: number;
  type: "book" | "question" | "general";
  notes?: string;
}

interface JimmadarProfile {
  id: string;
  name: string;
  phone: string;
  code?: string;
  bookCommissionPercent: number;
  questionCommissionPercent: number;
  totalOrders: number;
  totalSales: number;
  totalEarned: number;
  totalPaid: number;
  currentBalance: number;
  referredOrders: ReferredOrder[];
  payouts: PayoutRecord[];
}

export default function JimmadarReferralPortalPage() {
  const [inputPhone, setInputPhone] = useState("");
  const [profile, setProfile] = useState<JimmadarProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "payouts">("orders");

  // Load saved phone if exists
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nbk_jimmadar_portal_phone");
      if (saved) {
        setInputPhone(saved);
        fetchAgentData(saved);
      }
    } catch {}
  }, []);

  const fetchAgentData = async (phoneOrCode: string) => {
    const trimmed = phoneOrCode.trim();
    if (!trimmed) {
      toast.error("অনুগ্রহ করে আপনার মোবাইল নম্বর বা জিম্মাদার কোড লিখুন");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/referrals?phone=${encodeURIComponent(trimmed)}&code=${encodeURIComponent(trimmed)}&t=${Date.now()}`);
      const data = await res.json();
      if (data.found && data.profile) {
        setProfile(data.profile);
        try {
          localStorage.setItem("nbk_jimmadar_portal_phone", trimmed);
        } catch {}
      } else {
        setProfile(null);
        toast.error(data.message || "এই নম্বরে কোনো জিম্মাদার তথ্য পাওয়া যায়নি");
      }
    } catch {
      toast.error("সার্ভার থেকে তথ্য লোড করতে সমস্যা হয়েছে");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAgentData(inputPhone);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("লিংক সফলভাবে কপি হয়েছে!");
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const originUrl = typeof window !== "undefined" ? window.location.origin : "";
  const refCodeOrPhone = profile ? profile.code || profile.phone : "";
  const questionOrderLink = `${originUrl}/academic/question-order?ref=${encodeURIComponent(refCodeOrPhone)}`;
  const storeOrderLink = `${originUrl}/store?ref=${encodeURIComponent(refCodeOrPhone)}`;

  return (
    <div className="min-h-screen bg-slate-50/70 font-sans py-6 sm:py-10 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Top Back Navigation */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-[#095738] bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-[#095738]" />
            <span>হোমে ফিরুন</span>
          </Link>
          <div className="text-xs text-slate-500 font-medium">
            নূরানী তা'লীমুল কুরআন বোর্ড খুলনা
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-gradient-to-br from-[#095738] via-[#0d734b] to-[#063f28] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden mb-6">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-100 mb-3 border border-white/20">
              <Users className="w-3.5 h-3.5 text-emerald-200" />
              <span>কেন্দ্র জিম্মাদার রেফারেল প্রোগ্রাম</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
              আপনার রেফারেল ড্যাশবোর্ড ও কমিশন হিসাব
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm mt-2 leading-relaxed">
              আপনার নিজস্ব রেফারেল লিংক শেয়ার করে যেকোনো মাদরাসাকে প্রশ্নপত্র ও বইয়ের অর্ডার করতে উৎসাহিত করুন। প্রতি অর্ডারে নির্ধারিত কমিশন স্বয়ংক্রিয়ভাবে আপনার ব্যালেন্সে জমা হবে।
            </p>

            {/* Search Input Box */}
            <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row items-stretch gap-2 max-w-lg">
              <div className="relative flex-1">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={inputPhone}
                  onChange={(e) => setInputPhone(e.target.value)}
                  placeholder="আপনার ১১ ডিজিটের মোবাইল নম্বর দিন..."
                  className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 rounded-2xl text-xs sm:text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 shadow-lg"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>হিসাব দেখুন</span>
              </button>
            </form>
          </div>
        </div>

        {/* When profile is loaded */}
        {profile ? (
          <div className="space-y-6">
            {/* Jimmadar Info Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#095738] font-black text-lg flex items-center justify-center shadow-xs">
                  {profile.name.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">{profile.name}</h2>
                    {profile.code && (
                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono font-bold">
                        {profile.code}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    মোবাইল: {profile.phone} | কমিশন রেট: বই {profile.bookCommissionPercent}%, প্রশ্ন {profile.questionCommissionPercent}%
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fetchAgentData(profile.phone)}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors self-start sm:self-auto cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>রিফ্রেশ করুন</span>
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="text-xs text-slate-500 font-bold flex items-center justify-between mb-1">
                  <span>মোট রেফারেল অর্ডার</span>
                  <Receipt className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">
                  {profile.totalOrders.toLocaleString("bn-BD")} টি
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  রেফারকৃত মোট সফল অর্ডার
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-xs">
                <div className="text-xs text-emerald-800 font-bold flex items-center justify-between mb-1">
                  <span>সর্বমোট অর্জিত কমিশন</span>
                  <DollarSign className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-800 font-mono">
                  ৳{Math.round(profile.totalEarned).toLocaleString("bn-BD")}
                </div>
                <div className="text-[11px] text-emerald-600 mt-1">
                  মোট বিক্রয়: ৳{Math.round(profile.totalSales).toLocaleString("bn-BD")}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/30 shadow-xs">
                <div className="text-xs text-blue-800 font-bold flex items-center justify-between mb-1">
                  <span>উত্তোলিত / পরিশোধিত</span>
                  <CreditCard className="w-4 h-4 text-blue-700" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-blue-800 font-mono">
                  ৳{Math.round(profile.totalPaid).toLocaleString("bn-BD")}
                </div>
                <div className="text-[11px] text-blue-600 mt-1">
                  বোর্ড থেকে পরিশোধকৃত
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-xs">
                <div className="text-xs text-amber-900 font-bold flex items-center justify-between mb-1">
                  <span>বর্তমান বকেয়া ব্যালেন্স</span>
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-900 font-mono">
                  ৳{Math.round(profile.currentBalance).toLocaleString("bn-BD")}
                </div>
                <div className="text-[11px] text-amber-700 mt-1">
                  বোর্ড থেকে প্রাপ্য টাকা
                </div>
              </div>
            </div>

            {/* Shareable Links Section */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Share2 className="w-4 h-4 text-[#095738]" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  আপনার পার্সোনাল রেফারেল লিংকসমূহ
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Question Order Link */}
                <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      প্রশ্নপত্র অর্ডার লিংক ({profile.questionCommissionPercent}% কমিশন)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={questionOrderLink}
                      className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-xl text-xs font-mono select-all text-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(questionOrderLink, "q_link")}
                      className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                    >
                      {copiedKey === "q_link" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "q_link" ? "কপি হয়েছে" : "কপি"}</span>
                    </button>
                  </div>
                </div>

                {/* Store Order Link */}
                <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      বই ও স্টেশনারি লিংক ({profile.bookCommissionPercent}% কমিশন)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={storeOrderLink}
                      className="w-full px-2.5 py-1.5 bg-white border border-blue-200 rounded-xl text-xs font-mono select-all text-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(storeOrderLink, "b_link")}
                      className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                    >
                      {copiedKey === "b_link" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "b_link" ? "কপি হয়েছে" : "কপি"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Share Button */}
              <div className="pt-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `আসসালামু আলাইকুম, নূরানী তা'লীমুল কুরআন বোর্ড খুলনা-এর প্রশ্নপত্র ও বই অর্ডার করার লিংক:\nপ্রশ্ন অর্ডার: ${questionOrderLink}\nবই অর্ডার: ${storeOrderLink}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Share2 className="w-4 h-4" />
                  <span>সরাসরি হোয়াটসঅ্যাপে (WhatsApp) শেয়ার করুন</span>
                </a>
              </div>
            </div>

            {/* Sub Tabs: Orders & Payouts */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="flex items-center gap-4 px-4 sm:px-5 pt-3 border-b border-slate-200 text-xs sm:text-sm font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab("orders")}
                  className={`pb-3 px-1 border-b-2 transition-all cursor-pointer ${
                    activeTab === "orders"
                      ? "border-[#095738] text-[#095738]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  কার কাছ থেকে কমিশন এসেছে ({profile.referredOrders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("payouts")}
                  className={`pb-3 px-1 border-b-2 transition-all cursor-pointer ${
                    activeTab === "payouts"
                      ? "border-[#095738] text-[#095738]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  পরিশোধিত পে-আউট হিস্ট্রি ({profile.payouts.length})
                </button>
              </div>

              {/* Tab 1: Orders */}
              {activeTab === "orders" && (
                <div className="p-4 sm:p-5">
                  {profile.referredOrders.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs sm:text-sm">
                      এখনও কোনো মাদরাসা বা গ্রাহক আপনার লিংক ব্যবহার করে অর্ডার সম্পন্ন করেনি।
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold">
                            <th className="py-2.5 px-3">ইনভয়েস নং</th>
                            <th className="py-2.5 px-3">তারিখ</th>
                            <th className="py-2.5 px-3">মাদরাসা / গ্রাহক</th>
                            <th className="py-2.5 px-2 text-center">ধরন</th>
                            <th className="py-2.5 px-3 text-right">মোট বিল</th>
                            <th className="py-2.5 px-3 text-right text-emerald-800 font-black">আপনার কমিশন</th>
                            <th className="py-2.5 px-3 text-center">স্ট্যাটাস</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {profile.referredOrders.map((ord, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                                {ord.invoiceId}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                                {new Date(ord.date).toLocaleDateString("bn-BD", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-bold text-slate-900">{ord.customerName}</div>
                                {ord.instituteId && (
                                  <div className="text-[11px] text-slate-500">{ord.instituteId}</div>
                                )}
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    ord.type === "question"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {ord.type === "question" ? "প্রশ্ন" : "বই"}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                                ৳{ord.totalAmount.toLocaleString("bn-BD")}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-700 text-sm">
                                ৳{ord.commission.toLocaleString("bn-BD")}
                                <span className="text-[10px] text-slate-400 font-normal ml-1">
                                  ({ord.commissionPercent}%)
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-700">
                                  {ord.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Payouts */}
              {activeTab === "payouts" && (
                <div className="p-4 sm:p-5">
                  {profile.payouts.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs sm:text-sm">
                      এখনও কোনো পে-আউট উত্তোলন করা হয়নি।
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold">
                            <th className="py-2.5 px-3">তারিখ</th>
                            <th className="py-2.5 px-3 text-right">টাকার পরিমাণ</th>
                            <th className="py-2.5 px-3 text-center">পেমেন্ট মাধ্যম</th>
                            <th className="py-2.5 px-3">ট্রানজেকশন আইডি (TrxID)</th>
                            <th className="py-2.5 px-4">মন্তব্য</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {profile.payouts.map((pay) => (
                            <tr key={pay.id} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                                {new Date(pay.date).toLocaleDateString("bn-BD", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-800 text-sm">
                                ৳{pay.amount.toLocaleString("bn-BD")}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
                                  {pay.paymentMethod}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-600">
                                {pay.trxId || "—"}
                              </td>
                              <td className="py-2.5 px-4 text-slate-500">
                                {pay.notes || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : hasSearched && !loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800 text-base">জিম্মাদার তথ্য মেলেনি</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              অনুগ্রহ করে বোর্ডে নিবন্ধিত সঠিক মোবাইল নম্বর বা জিম্মাদার কোড দিন। সহায়তার জন্য বোর্ডের সাথে যোগাযোগ করুন।
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

