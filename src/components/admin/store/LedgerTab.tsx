"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, FileText, Printer, Download, RefreshCw, Eye, CheckCircle2, 
  AlertCircle, Phone, Building2, MapPin, Calendar, CreditCard, 
  BookOpen, Layers, Check, X, SlidersHorizontal, User
} from 'lucide-react';
import { printOrderInvoice } from '@/lib/orderPrint';
import { cleanAddressNotes } from '@/lib/orderTimeline';
import { isQuestionOrder } from './OrderTab';

interface LedgerItem {
  id: string;
  invoiceId: string;
  customerName: string;
  customerPhone?: string;
  instituteId?: string;
  totalAmount: number;
  paidAmount: number;
  discount: number;
  deliveryCharge?: number;
  status: string;
  notes?: string;
  createdAt: string;
  items?: any[];
  payments?: any[];
  geo?: {
    division?: string;
    district?: string;
    upazila?: string;
  };
}

export default function LedgerTab({ storeCategory, onCategoryChange }: { storeCategory?: string; onCategoryChange?: (c: any) => void }) {
  const [sales, setSales] = useState<LedgerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'question' | 'store' | 'zimadar'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'due' | 'paid'>('all');
  
  // Dynamic Admin Print Modal State
  const [adminPrintModalOpen, setAdminPrintModalOpen] = useState(false);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<LedgerItem | null>(null);
  const [printPaymentMethod, setPrintPaymentMethod] = useState("নগদ");
  const [printPaidAmount, setPrintPaidAmount] = useState<number>(0);
  const [printCustomNotes, setPrintCustomNotes] = useState("");

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/store/sales');
      if (res.ok) {
        const data = await res.json();
        setSales(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch sales for ledger:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // Helper to parse Zimadar details from notes
  const getZimadarInfo = (notes?: string) => {
    if (!notes || !notes.includes('[কেন্দ্র জিম্মাদার:')) return null;
    const match = notes.match(/\[কেন্দ্র জিম্মাদার:\s*([^|\]]+)(?:\|\s*ফোন:\s*([^|\]]+))?(?:\|\s*অন্তর্ভুক্ত মাদরাসা:\s*([^|\]]+))?(?:\|\s*কমিশন:\s*([^|\]]+))?/i);
    if (!match) return null;
    return {
      name: match[1]?.trim() || "",
      phone: match[2]?.trim() || "",
      madrasas: match[3]?.trim() || "",
      commission: match[4]?.trim() || "",
    };
  };

  // Filtered Ledger list
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const isQuestion = isQuestionOrder(sale);
      const isZimadar = Boolean(getZimadarInfo(sale.notes));
      const total = Number(sale.totalAmount || 0);
      const paid = Number(sale.paidAmount || 0);
      const due = Math.max(0, total - paid);

      // Category filter
      if (categoryFilter === 'question' && !isQuestion) return false;
      if (categoryFilter === 'store' && isQuestion) return false;
      if (categoryFilter === 'zimadar' && !isZimadar) return false;

      // Payment filter
      if (paymentFilter === 'due' && due <= 0) return false;
      if (paymentFilter === 'paid' && due > 0) return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const zim = getZimadarInfo(sale.notes);
        const matches =
          sale.invoiceId?.toLowerCase().includes(q) ||
          sale.customerName?.toLowerCase().includes(q) ||
          sale.customerPhone?.toLowerCase().includes(q) ||
          sale.instituteId?.toLowerCase().includes(q) ||
          sale.notes?.toLowerCase().includes(q) ||
          (zim && (zim.name.toLowerCase().includes(q) || zim.phone.toLowerCase().includes(q)));
        if (!matches) return false;
      }

      return true;
    });
  }, [sales, categoryFilter, paymentFilter, searchTerm]);

  // Aggregate KPI metrics
  const metrics = useMemo(() => {
    let totalGross = 0;
    let totalPaid = 0;
    let totalDue = 0;
    let totalDiscount = 0;
    let zimadarOrdersCount = 0;

    filteredSales.forEach((s) => {
      const gross = Number(s.totalAmount || 0);
      const paid = Number(s.paidAmount || 0);
      const disc = Number(s.discount || 0);
      const due = Math.max(0, gross - paid);

      totalGross += gross;
      totalPaid += paid;
      totalDue += due;
      totalDiscount += disc;
      if (getZimadarInfo(s.notes)) {
        zimadarOrdersCount++;
      }
    });

    return {
      count: filteredSales.length,
      totalGross,
      totalPaid,
      totalDue,
      totalDiscount,
      zimadarOrdersCount,
    };
  }, [filteredSales]);

  // Handle opening admin dynamic print modal
  const openAdminPrintModal = (order: LedgerItem) => {
    setSelectedOrderForPrint(order);
    const paid = Number(order.paidAmount || 0);
    const due = Math.max(0, Number(order.totalAmount || 0) - paid);
    setPrintPaidAmount(paid);
    setPrintPaymentMethod(due > 0 ? (paid > 0 ? "নগদ ও বাকি" : "বাকিতে (বকেয়া)") : "নগদ");
    setPrintCustomNotes("");
    setAdminPrintModalOpen(true);
  };

  const handleExecuteAdminPrint = async () => {
    if (!selectedOrderForPrint) return;
    const orderWithOverrides = {
      ...selectedOrderForPrint,
      paidAmount: printPaidAmount,
    };
    await printOrderInvoice(orderWithOverrides, {
      mode: 'admin',
      paymentMethod: printPaymentMethod,
      customNotes: printCustomNotes,
    });
    setAdminPrintModalOpen(false);
  };

  // Handle customer clean PDF print (NO due options)
  const handleCustomerPrint = async (order: LedgerItem) => {
    await printOrderInvoice(order, {
      mode: 'customer',
      paymentMethod: "নগদ / বিকাশ / অনলাইন",
    });
  };

  // Print filtered ledger sheet
  const handlePrintLedgerSummary = () => {
    window.print();
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* ─── Top Filter & KPI Stats ───────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-slate-500">মোট ইনভয়েস</p>
          <p className="text-xl font-black text-slate-800 mt-1">{metrics.count} টি</p>
          <span className="text-[11px] text-indigo-600 font-semibold">{metrics.zimadarOrdersCount} টি জিম্মাদার অর্ডার</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-slate-500">মোট বিল মূল্য</p>
          <p className="text-xl font-black text-slate-800 mt-1">৳{metrics.totalGross.toFixed(2)}</p>
          <span className="text-[11px] text-slate-400 font-semibold">গ্রস বিক্রয়</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-slate-500">মোট আদায়কৃত</p>
          <p className="text-xl font-black text-emerald-600 mt-1">৳{metrics.totalPaid.toFixed(2)}</p>
          <span className="text-[11px] text-emerald-500 font-semibold">নগদ ও ডিজিটাল</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-slate-500">মোট বকেয়া (বাকি)</p>
          <p className="text-xl font-black text-rose-600 mt-1">৳{metrics.totalDue.toFixed(2)}</p>
          <span className="text-[11px] text-rose-500 font-semibold">বাকির হিসাব</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <p className="text-xs font-bold text-slate-500">মোট কমিশন / ছাড়</p>
          <p className="text-xl font-black text-amber-600 mt-1">৳{metrics.totalDiscount.toFixed(2)}</p>
          <span className="text-[11px] text-amber-500 font-semibold">জিম্মাদার ও বিশেষ ছাড়</span>
        </div>
      </div>

      {/* ─── Search & Controls Bar ───────────────────────────────── */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="মোবাইল নম্বর, ইনভয়েস নং, মাদরাসা বা কেন্দ্র জিম্মাদারের নাম দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-emerald-600 bg-slate-50/50"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={fetchSales}
              disabled={loading}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>রিফ্রেশ</span>
            </button>

            <button
              onClick={handlePrintLedgerSummary}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>লেজার প্রিন্ট</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-slate-500 mr-1">অর্ডার ধরন:</span>
            {[
              { id: 'all', label: 'সকল' },
              { id: 'question', label: 'শুধু প্রশ্নপত্র' },
              { id: 'store', label: 'বই ও স্টেশনারি' },
              { id: 'zimadar', label: 'কেন্দ্র জিম্মাদার' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  categoryFilter === tab.id
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-slate-500 mr-1">পেমেন্ট অবস্থা:</span>
            {[
              { id: 'all', label: 'সকল' },
              { id: 'due', label: 'বকেয়াযুক্ত (Due)' },
              { id: 'paid', label: 'পরিশোধিত (Paid)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPaymentFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  paymentFilter === tab.id
                    ? 'bg-slate-800 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Ledger Table ────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-3">ইনভয়েস ও তারিখ</th>
                <th className="py-3 px-3">মাদরাসা / প্রতিষ্ঠান</th>
                <th className="py-3 px-3">অর্ডারকারী ও মোবাইল</th>
                <th className="py-3 px-3">ধরন / জিম্মাদার</th>
                <th className="py-3 px-3 text-right">মোট বিল</th>
                <th className="py-3 px-3 text-right">কমিশন/ছাড়</th>
                <th className="py-3 px-3 text-right">পরিশোধিত</th>
                <th className="py-3 px-3 text-right">বকেয়া</th>
                <th className="py-3 px-3 text-center">স্ট্যাটাস</th>
                <th className="py-3 px-3 text-center">ইনভয়েস প্রিন্ট অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    লেজার লোড হচ্ছে...
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    কোনো ইনভয়েস রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const isQuestion = isQuestionOrder(sale);
                  const zim = getZimadarInfo(sale.notes);
                  const total = Number(sale.totalAmount || 0);
                  const paid = Number(sale.paidAmount || 0);
                  const discount = Number(sale.discount || 0);
                  const due = Math.max(0, total - paid);

                  return (
                    <tr key={sale.id || sale.invoiceId} className="hover:bg-slate-50/80 transition-colors">
                      {/* Invoice & Date */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 font-mono text-[11px]">{sale.invoiceId}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(sale.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </td>

                      {/* Institute / Madrasa */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800 line-clamp-1">
                          {sale.instituteId || "সাধারণ গ্রাহক"}
                        </div>
                        {sale.geo?.district && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>{sale.geo.district}{sale.geo.upazila ? `, ${sale.geo.upazila}` : ''}</span>
                          </div>
                        )}
                      </td>

                      {/* Contact / Phone */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{sale.customerName || "N/A"}</div>
                        <div className="text-[11px] text-emerald-700 font-mono font-semibold flex items-center gap-1 mt-0.5">
                          <Phone className="w-2.5 h-2.5" />
                          <span>{sale.customerPhone || "N/A"}</span>
                        </div>
                      </td>

                      {/* Type & Zimadar */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isQuestion 
                              ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {isQuestion ? 'প্রশ্নপত্র' : 'বই-স্টেশনারি'}
                          </span>
                          {zim && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200" title={`জিম্মাদার: ${zim.name} (${zim.phone})`}>
                              কেন্দ্র জিম্মাদার
                            </span>
                          )}
                        </div>
                        {zim && (
                          <div className="text-[10px] text-amber-800 font-medium mt-1">
                            {zim.name} {zim.madrasas ? `(${zim.madrasas})` : ''}
                          </div>
                        )}
                      </td>

                      {/* Financials */}
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        ৳{total.toFixed(2)}
                      </td>

                      <td className="py-3 px-3 text-right font-medium text-amber-600">
                        {discount > 0 ? `-৳${discount.toFixed(2)}` : '০.০০'}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-emerald-600">
                        ৳{paid.toFixed(2)}
                      </td>

                      <td className="py-3 px-3 text-right font-bold">
                        {due > 0 ? (
                          <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            ৳{due.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-emerald-700">পরিশোধিত</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          due <= 0 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : paid > 0 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {due <= 0 ? 'পরিশোধিত' : (paid > 0 ? 'আংশিক বাকি' : 'সম্পূর্ণ বাকি')}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* 1. Admin Dynamic Print (All payment modes: Cash & Due) */}
                          <button
                            type="button"
                            onClick={() => openAdminPrintModal(sale)}
                            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                            title="এডমিন ইনভয়েস প্রিন্ট (নগদ ও বাকির অপশনসহ)"
                          >
                            <Printer className="w-3 h-3 text-amber-400" />
                            <span>এডমিন প্রিন্ট</span>
                          </button>

                          {/* 2. Customer PDF Print (No due option) */}
                          <button
                            type="button"
                            onClick={() => handleCustomerPrint(sale)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                            title="গ্রাহক কপি ইনভয়েস/PDF (বাকির অপশন ছাড়া)"
                          >
                            <Download className="w-3 h-3 text-white" />
                            <span>গ্রাহক PDF</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── ADMIN DYNAMIC PRINT MODAL ─────────────────────────────── */}
      {adminPrintModalOpen && selectedOrderForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Printer className="w-4 h-4 text-emerald-600" />
                  এডমিন ডায়নামিক ইনভয়েস প্রিন্ট
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">ইনভয়েস: {selectedOrderForPrint.invoiceId}</p>
              </div>
              <button
                onClick={() => setAdminPrintModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  পেমেন্ট অপশন নির্বাচন করুন (নগদে ও বাকিতে):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "নগদে (পরিশোধিত)", label: "নগদে (Cash)" },
                    { id: "বিকাশ / অনলাইন", label: "বিকাশ / অনলাইন" },
                    { id: "ব্যাংক ডিপোজিট", label: "ব্যাংক জমা" },
                    { id: "বাকিতে (বকেয়া)", label: "বাকিতে (Credit/Due)" },
                    { id: "নগদ ও বাকি", label: "নগদ ও বাকি উভয়ই" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPrintPaymentMethod(opt.id)}
                      className={`p-2 rounded-lg border text-left font-bold transition-all cursor-pointer ${
                        printPaymentMethod === opt.id 
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600' 
                          : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">পরিশোধিত টাকা (টাকা):</label>
                  <input
                    type="number"
                    value={printPaidAmount}
                    onChange={(e) => setPrintPaidAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-bold bg-white focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">অবশিষ্ট বকেয়া (স্বয়ংক্রিয়):</label>
                  <div className="px-3 py-1.5 bg-slate-100 rounded-lg font-bold text-rose-600 border border-slate-200">
                    ৳{Math.max(0, Number(selectedOrderForPrint.totalAmount || 0) - printPaidAmount).toFixed(2)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">বিশেষ নোট / মন্তব্য (ঐচ্ছিক):</label>
                <textarea
                  value={printCustomNotes}
                  onChange={(e) => setPrintCustomNotes(e.target.value)}
                  placeholder="যেমন: বাকির টাকা আগামী ১০ তারিখে পরিশোধের প্রতিশ্রুতি..."
                  rows={2}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-medium bg-white focus:outline-emerald-600"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAdminPrintModalOpen(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleExecuteAdminPrint}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট শুরু করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
