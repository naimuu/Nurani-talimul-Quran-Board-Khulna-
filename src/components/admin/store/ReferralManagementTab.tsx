"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Copy,
  CheckCircle,
  ExternalLink,
  CreditCard,
  DollarSign,
  TrendingUp,
  Receipt,
  FileText,
  AlertCircle,
  ArrowUpRight,
  Filter,
  Eye,
  Check,
  Send,
  Trash2,
  Calendar,
  X,
  Share2,
  BookOpen,
  Phone,
  Building2,
  HelpCircle,
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
  recordedBy?: string;
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

export default function ReferralManagementTab() {
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<JimmadarProfile[]>([]);
  const [summary, setSummary] = useState({
    totalAgents: 0,
    activeAgentsWithOrders: 0,
    totalReferredOrders: 0,
    totalReferredSales: 0,
    totalCommissionEarned: 0,
    totalCommissionPaid: 0,
    totalBalanceDue: 0,
  });
  const [recentPayouts, setRecentPayouts] = useState<PayoutRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgentForOrders, setSelectedAgentForOrders] = useState<JimmadarProfile | null>(null);
  const [selectedAgentForPayout, setSelectedAgentForPayout] = useState<JimmadarProfile | null>(null);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedAgentForShare, setSelectedAgentForShare] = useState<JimmadarProfile | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"agents" | "payouts">("agents");

  // Payout Form States
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("bKash");
  const [payoutTrxId, setPayoutTrxId] = useState("");
  const [payoutNote, setPayoutNote] = useState("");
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  // Copied tracking
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchReferralData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/referrals?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents || []);
        setSummary(data.summary || {});
        setRecentPayouts(data.recentPayouts || []);
      }
    } catch (err) {
      console.error("Failed to load referral data:", err);
      toast.error("রেফারেল ডেটা লোড করতে ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("লিংক সফলভাবে কপি হয়েছে!");
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleOpenPayoutModal = (agent: JimmadarProfile) => {
    setSelectedAgentForPayout(agent);
    setPayoutAmount(agent.currentBalance > 0 ? String(agent.currentBalance) : "");
    setPayoutMethod("bKash");
    setPayoutTrxId("");
    setPayoutNote("");
    setIsPayoutModalOpen(true);
  };

  const handleSavePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentForPayout) return;

    const amountNum = parseFloat(payoutAmount);
    if (!amountNum || amountNum <= 0) {
      toast.error("সঠিক টাকার পরিমাণ দিন");
      return;
    }

    setIsSubmittingPayout(true);
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "payout",
          jimmadarPhone: selectedAgentForPayout.phone,
          jimmadarName: selectedAgentForPayout.name,
          amount: amountNum,
          paymentMethod: payoutMethod,
          trxId: payoutTrxId.trim() || undefined,
          notes: payoutNote.trim() || undefined,
          recordedBy: "অ্যাডমিন",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "পে-আউট সম্পন্ন করা যায়নি");

      toast.success("কমিশন পে-আউট সফলভাবে পরিশোধ রেকর্ড করা হয়েছে!");
      setIsPayoutModalOpen(false);
      fetchReferralData();
    } catch (err: any) {
      toast.error(err.message || "সমস্যা হয়েছে");
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  const handleDeletePayout = async (payoutId: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই পে-আউট রেকর্ডটি মুছে ফেলতে চান? এটি মুছে ফেললে ব্যালেন্স পুনরায় বৃদ্ধি পাবে।")) {
      return;
    }

    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_payout",
          payoutId,
        }),
      });
      if (res.ok) {
        toast.success("পে-আউট রেকর্ড মুছে ফেলা হয়েছে");
        fetchReferralData();
      }
    } catch {
      toast.error("মুছে ফেলা সম্ভব হয়নি");
    }
  };

  const filteredAgents = useMemo(() => {
    if (!searchTerm.trim()) return agents;
    const term = searchTerm.toLowerCase().trim();
    return agents.filter((a) => {
      return (
        a.name.toLowerCase().includes(term) ||
        a.phone.toLowerCase().includes(term) ||
        (a.code && a.code.toLowerCase().includes(term))
      );
    });
  }, [agents, searchTerm]);

  const originUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="space-y-6">
      {/* ── Top Header & Actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-[#095738] rounded-xl">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              কেন্দ্র জিম্মাদার রেফারেল ও কমিশন ব্যবস্থাপনা
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            জিম্মাদারদের রেফারেল লিংক, রেফার করা মোট অর্ডার, কার কাছ থেকে কত কমিশন এসেছে এবং পে-আউট ব্যালেন্সের হিসাব।
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchReferralData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>রিফ্রেশ</span>
          </button>
        </div>
      </div>

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">মোট রেফারেল অর্ডার</span>
            <Receipt className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {summary.totalReferredOrders.toLocaleString("bn-BD")} টি
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            সক্রিয় জিম্মাদার: {summary.activeAgentsWithOrders} জন
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">মোট রেফারেল সেলস</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            ৳{Math.round(summary.totalReferredSales).toLocaleString("bn-BD")}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            রেফারকৃত সকল অর্ডারের মোট বিল
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-xs font-bold">সর্বমোট অর্জিত কমিশন</span>
            <DollarSign className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-800">
            ৳{Math.round(summary.totalCommissionEarned).toLocaleString("bn-BD")}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">
            অটো-ক্যালকুলেটেড কমিশন
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/30 shadow-xs">
          <div className="flex items-center justify-between text-blue-800 mb-2">
            <span className="text-xs font-bold">পরিশোধিত পে-আউট</span>
            <CreditCard className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-800">
            ৳{Math.round(summary.totalCommissionPaid).toLocaleString("bn-BD")}
          </div>
          <div className="text-[11px] text-blue-600 mt-1">
            মোট পেইড কমিশন
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-amber-900 mb-2">
            <span className="text-xs font-bold">বর্তমান বকেয়া ব্যালেন্স</span>
            <AlertCircle className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-900">
            ৳{Math.round(summary.totalBalanceDue).toLocaleString("bn-BD")}
          </div>
          <div className="text-[11px] text-amber-700 mt-1">
            জিম্মাদারদের প্রাপ্য অবিতরণকৃত টাকা
          </div>
        </div>
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div className="flex items-center justify-between border-b border-slate-200 gap-4">
        <div className="flex items-center gap-4 text-xs sm:text-sm font-bold">
          <button
            type="button"
            onClick={() => setActiveSubTab("agents")}
            className={`pb-3 px-1 border-b-2 transition-all cursor-pointer ${
              activeSubTab === "agents"
                ? "border-[#095738] text-[#095738]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            জিম্মাদার অ্যাকাউন্ট ও কমিশন খতিয়ান ({agents.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("payouts")}
            className={`pb-3 px-1 border-b-2 transition-all cursor-pointer ${
              activeSubTab === "payouts"
                ? "border-[#095738] text-[#095738]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            পে-আউট পেমেন্ট হিস্ট্রি ({recentPayouts.length})
          </button>
        </div>

        {activeSubTab === "agents" && (
          <div className="relative pb-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="নাম, মোবাইল বা কোড দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-600 transition-colors w-48 sm:w-64"
            />
          </div>
        )}
      </div>

      {/* ── Sub Tab 1: Agents & Balance Ledger ── */}
      {activeSubTab === "agents" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#095738]" />
              রেফারেল হিসাব লোড হচ্ছে...
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              কোনো জিম্মাদারের তথ্য পাওয়া যায়নি।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-3 px-4">জিম্মাদারের বিবরণ</th>
                    <th className="py-3 px-3 text-center">কমিশন রেট</th>
                    <th className="py-3 px-3 text-center">মোট অর্ডার</th>
                    <th className="py-3 px-3 text-right">মোট সেলস</th>
                    <th className="py-3 px-3 text-right text-emerald-800">অর্জিত কমিশন</th>
                    <th className="py-3 px-3 text-right text-blue-700">পরিশোধিত</th>
                    <th className="py-3 px-3 text-right text-amber-900 font-black">বকেয়া ব্যালেন্স</th>
                    <th className="py-3 px-4 text-center">কার্যক্রম</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredAgents.map((agent) => {
                    const hasDue = agent.currentBalance > 0;
                    return (
                      <tr key={agent.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Name & Phone */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#095738] font-bold flex items-center justify-center shrink-0 text-xs">
                              {agent.name.slice(0, 1) || "জ"}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{agent.name}</span>
                                {agent.code && (
                                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                                    {agent.code}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{agent.phone || "নম্বর নেই"}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Commission Rates */}
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="text-[11px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded">
                              বই: {agent.bookCommissionPercent}%
                            </span>
                            <span className="text-[10px] text-purple-700 font-bold mt-0.5">
                              প্রশ্ন: {agent.questionCommissionPercent}%
                            </span>
                          </div>
                        </td>

                        {/* Total Orders */}
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block font-bold px-2 py-0.5 rounded-full text-xs ${
                              agent.totalOrders > 0
                                ? "bg-emerald-50 text-emerald-800"
                                : "text-slate-400 bg-slate-100"
                            }`}
                          >
                            {agent.totalOrders} টি
                          </span>
                        </td>

                        {/* Total Sales */}
                        <td className="py-3 px-3 text-right font-mono text-slate-700">
                          ৳{Math.round(agent.totalSales).toLocaleString("bn-BD")}
                        </td>

                        {/* Total Earned */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                          ৳{Math.round(agent.totalEarned).toLocaleString("bn-BD")}
                        </td>

                        {/* Total Paid */}
                        <td className="py-3 px-3 text-right font-mono text-blue-700">
                          ৳{Math.round(agent.totalPaid).toLocaleString("bn-BD")}
                        </td>

                        {/* Due Balance */}
                        <td className="py-3 px-3 text-right font-mono font-bold">
                          <span
                            className={`px-2 py-0.5 rounded-lg ${
                              hasDue
                                ? "bg-amber-100 text-amber-900 font-black"
                                : agent.currentBalance < 0
                                ? "bg-red-50 text-red-700"
                                : "text-emerald-700"
                            }`}
                          >
                            ৳{Math.round(agent.currentBalance).toLocaleString("bn-BD")}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {/* Payout button */}
                            <button
                              type="button"
                              onClick={() => handleOpenPayoutModal(agent)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                              title="কমিশন পরিশোধ করুন"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>পে-আউট</span>
                            </button>

                            {/* View Orders button */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAgentForOrders(agent);
                                setIsOrdersModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              title="কার কার কাছ থেকে কমিশন এসেছে দেখুন"
                            >
                              <Eye className="w-3 h-3 text-slate-500" />
                              <span>অর্ডার খতিয়ান</span>
                            </button>

                            {/* Share Referral Link button */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAgentForShare(agent);
                                setIsShareModalOpen(true);
                              }}
                              className="p-1 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              title="রেফারেল লিংক শেয়ার বা কপি করুন"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Sub Tab 2: Recent Payouts History ── */}
      {activeSubTab === "payouts" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {recentPayouts.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              এখনও কোনো পে-আউট রেকর্ড করা হয়নি।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-3 px-4">তারিখ</th>
                    <th className="py-3 px-4">জিম্মাদারের বিবরণ</th>
                    <th className="py-3 px-3 text-right">পরিশোধের পরিমাণ</th>
                    <th className="py-3 px-3 text-center">মাধ্যম</th>
                    <th className="py-3 px-3">ট্রানজেকশন আইডি (TrxID)</th>
                    <th className="py-3 px-4">নোট / বিবরণ</th>
                    <th className="py-3 px-3 text-center">মুছে ফেলুন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {recentPayouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                        {new Date(payout.date).toLocaleDateString("bn-BD", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{payout.jimmadarName}</div>
                        <div className="text-xs text-slate-500 font-mono">{payout.jimmadarPhone}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-emerald-800 text-sm">
                        ৳{Number(payout.amount).toLocaleString("bn-BD")}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
                          {payout.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-slate-600">
                        {payout.trxId || "—"}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {payout.notes || "—"}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeletePayout(payout.id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="রেকর্ড মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL 1: PAYOUT RECORDING MODAL ── */}
      {isPayoutModalOpen && selectedAgentForPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">কমিশন পে-আউট প্রদান</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedAgentForPayout.name} ({selectedAgentForPayout.phone})
                </p>
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
              <span>বর্তমান অবিতরণকৃত বকেয়া ব্যালেন্স:</span>
              <span className="font-black text-sm font-mono">
                ৳{Math.round(selectedAgentForPayout.currentBalance).toLocaleString("bn-BD")}
              </span>
            </div>

            <form onSubmit={handleSavePayout} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 font-bold mb-1">পরিশোধকৃত টাকার পরিমাণ (৳) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="যেমন: 500"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-sm focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">পরিশোধের মাধ্যম *</label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-emerald-600"
                >
                  <option value="bKash">বিকাশ (bKash)</option>
                  <option value="Nagad">নগদ (Nagad)</option>
                  <option value="Rocket">রকেট (Rocket)</option>
                  <option value="Bank">ব্যাংক অ্যাকাউন্ট</option>
                  <option value="Cash">নগদ ক্যাশ হ্যান্ডওভার</option>
                  <option value="Other">অন্যান্য</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ট্রানজেকশন আইডি (TrxID) / রেফারেন্স</label>
                <input
                  type="text"
                  value={payoutTrxId}
                  onChange={(e) => setPayoutTrxId(e.target.value)}
                  placeholder="যেমন: 9B47X1K8 (ঐচ্ছিক)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">নোট / মন্তব্য</label>
                <textarea
                  value={payoutNote}
                  onChange={(e) => setPayoutNote(e.target.value)}
                  rows={2}
                  placeholder="যেমন: অক্টোবর মাসের প্রশ্ন কমিশন পরিশোধ"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayout}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingPayout ? "সংরক্ষণ হচ্ছে..." : "পে-আউট নিশ্চিত করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: DETAILED REFERRED ORDERS MODAL ("কার কাছ থেকে কমিশন এলো") ── */}
      {isOrdersModalOpen && selectedAgentForOrders && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-100 text-[#095738] rounded-lg">
                    <FileText className="w-4 h-4" />
                  </span>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                    {selectedAgentForOrders.name}-এর রেফারেল অর্ডার খতিয়ান
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  ফোন: {selectedAgentForOrders.phone} {selectedAgentForOrders.code ? `| কোড: ${selectedAgentForOrders.code}` : ""} |
                  মোট অর্ডার: {selectedAgentForOrders.totalOrders} টি | সর্বমোট অর্জিত কমিশন: ৳{Math.round(selectedAgentForOrders.totalEarned).toLocaleString("bn-BD")}
                </p>
              </div>
              <button
                onClick={() => setIsOrdersModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Table */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {selectedAgentForOrders.referredOrders.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm">
                  এই জিম্মাদারের রেফারেল কোড বা লিংক ব্যবহার করে এখনও কোনো অর্ডার সম্পন্ন হয়নি।
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                        <th className="py-2.5 px-3">ইনভয়েস নং</th>
                        <th className="py-2.5 px-3">তারিখ</th>
                        <th className="py-2.5 px-3">অর্ডারকারী / মাদরাসা</th>
                        <th className="py-2.5 px-3">মোবাইল নম্বর</th>
                        <th className="py-2.5 px-2 text-center">ধরন</th>
                        <th className="py-2.5 px-3 text-right">মোট বিল</th>
                        <th className="py-2.5 px-3 text-right text-emerald-800">অর্জিত কমিশন</th>
                        <th className="py-2.5 px-3 text-center">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {selectedAgentForOrders.referredOrders.map((ord, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                            {ord.invoiceId}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                            {new Date(ord.date).toLocaleDateString("bn-BD", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{ord.customerName}</div>
                            {ord.instituteId && (
                              <div className="text-[11px] text-slate-500">{ord.instituteId}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">
                            {ord.customerPhone || "—"}
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

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-700">
              <div>
                মোট অর্জিত কমিশন:{" "}
                <span className="text-emerald-800 font-black font-mono text-sm">
                  ৳{Math.round(selectedAgentForOrders.totalEarned).toLocaleString("bn-BD")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOrdersModalOpen(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: SHARE & COPY REFERRAL LINKS ── */}
      {isShareModalOpen && selectedAgentForShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">রেফারেল লিংক শেয়ার</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedAgentForShare.name} ({selectedAgentForShare.phone})
                </p>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              এই লিংকটি দিয়ে কোনো মাদরাসা বা ব্যক্তি অর্ডার করলে কমিশন স্বয়ংক্রিয়ভাবে{" "}
              <strong>{selectedAgentForShare.name}</strong>-এর ব্যালেন্সে জমা হবে:
            </p>

            {/* Link 1: Question Order */}
            <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  প্রশ্নপত্র অর্ডার রেফারেল লিংক ({selectedAgentForShare.questionCommissionPercent}% কমিশন)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${originUrl}/academic/question-order?ref=${encodeURIComponent(
                    selectedAgentForShare.code || selectedAgentForShare.phone
                  )}`}
                  className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs font-mono select-all text-slate-700"
                />
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      `${originUrl}/academic/question-order?ref=${encodeURIComponent(
                        selectedAgentForShare.code || selectedAgentForShare.phone
                      )}`,
                      "q_link"
                    )
                  }
                  className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                >
                  {copiedKey === "q_link" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "q_link" ? "কপি হয়েছে" : "কপি"}</span>
                </button>
              </div>
            </div>

            {/* Link 2: Store Order */}
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  বই ও স্টেশনারি স্টোর রেফারেল লিংক ({selectedAgentForShare.bookCommissionPercent}% কমিশন)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${originUrl}/store?ref=${encodeURIComponent(
                    selectedAgentForShare.code || selectedAgentForShare.phone
                  )}`}
                  className="w-full px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-mono select-all text-slate-700"
                />
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      `${originUrl}/store?ref=${encodeURIComponent(
                        selectedAgentForShare.code || selectedAgentForShare.phone
                      )}`,
                      "b_link"
                    )
                  }
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                >
                  {copiedKey === "b_link" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "b_link" ? "কপি হয়েছে" : "কপি"}</span>
                </button>
              </div>
            </div>

            {/* WhatsApp Share helper */}
            <div className="pt-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `আসসালামু আলাইকুম, নূরানী তা'লীমুল কুরআন বোর্ড খুলনা-এর প্রশ্নপত্র ও বই অর্ডার করার লিংক:\nপ্রশ্ন অর্ডার: ${originUrl}/academic/question-order?ref=${encodeURIComponent(
                    selectedAgentForShare.code || selectedAgentForShare.phone
                  )}\nবই অর্ডার: ${originUrl}/store?ref=${encodeURIComponent(
                    selectedAgentForShare.code || selectedAgentForShare.phone
                  )}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>সরাসরি হোয়াটসঅ্যাপে (WhatsApp) শেয়ার করুন</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

