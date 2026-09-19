"use client";
import React, { useState, useEffect } from 'react';
import { 
  Search, X, Package, CheckCircle2, Clock, Truck, Printer, Copy, 
  Camera, QrCode, Sparkles, AlertCircle, UserCheck, ShieldCheck, 
  CheckCircle, ArrowRight, User, Calendar, MessageSquare, Check, ThumbsUp
} from 'lucide-react';
import { QRScannerModal } from './QRScannerModal';
import { generateQRCodeDataUrl, generateBarcodeSVG } from '@/lib/qrHelper';
import { formatBanglaDateTime, TimelineEvent, cleanAddressNotes, parseQuestionItemsFromNotes } from '@/lib/orderTimeline';
import { printOrderInvoice } from '@/lib/orderPrint';

function parseTrackingInfo(notes?: string | null, courierName?: string | null) {
  let trackingId = '';
  if (notes) {
    const match = notes.match(/\[(?:Tracking|ট্র্যাকিং|Consignment):\s*([^\]]+)\]/i);
    if (match) trackingId = match[1].trim();
  }
  return {
    trackingId,
    courier: courierName || 'পাঠাও কুরিয়ার'
  };
}

function getOrderStepNumber(status: string): number {
  const s = (status || '').trim().toLowerCase();
  if (s === 'pending order') return 1;
  if (s === 'confirmed' || s === 'accepted') return 2;
  if (s === 'packaging') return 3;
  if (s === 'shipped' || s === 'courier' || s === 'in courier') return 4;
  if (s === 'delivered' || s === 'completed') return 5;
  if (s === 'rejected' || s === 'cancelled') return -1;
  // Counter sales or fallback
  if (s === 'paid' || s === 'partial' || s === 'pending') return 2;
  return 1;
}

const TRACKING_STEPS = [
  { step: 1, stepKey: 'pending', label: "অর্ডার গৃহীত", desc: "সিস্টেমে সফলভাবে গৃহীত", icon: Clock },
  { step: 2, stepKey: 'confirmed', label: "অনুমোদিত ও নিশ্চিত", desc: "বোর্ড কর্তৃক যাচাই সম্পন্ন", icon: UserCheck },
  { step: 3, stepKey: 'packaging', label: "প্যাকেজিং প্রস্তুত", desc: "প্যাকিং ও ডেলিভারি প্রস্তুত", icon: Package },
  { step: 4, stepKey: 'shipped', label: "কুরিয়ারে হস্তান্তর", desc: "কুরিয়ার সার্ভিসে প্রেরিত", icon: Truck },
  { step: 5, stepKey: 'delivered', label: "ডেলিভারি সম্পন্ন", desc: "গ্রাহকের ঠিকানায় পৌঁছেছে", icon: CheckCircle2 },
];

export function TrackOrderModal({ 
  isOpen, 
  onClose,
  initialInvoiceId,
  initialOrder,
  isNewOrder
}: { 
  isOpen: boolean; 
  onClose: () => void;
  initialInvoiceId?: string;
  initialOrder?: any;
  isNewOrder?: boolean;
}) {
  const [invoiceId, setInvoiceId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [boardSettings, setBoardSettings] = useState<any>(null);
  const [printBW, setPrintBW] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const isDirectOrder = Boolean(isNewOrder || initialOrder);
  const [showSearch, setShowSearch] = useState(!isDirectOrder);

  // New user account password change
  const [customPasswordInput, setCustomPasswordInput] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaveStatus, setPasswordSaveStatus] = useState<string | null>(null);

  // User Confirmation State
  const [isConfirming, setIsConfirming] = useState(false);
  const [showConfirmForm, setShowConfirmForm] = useState(false);
  const [customerRemarks, setCustomerRemarks] = useState('');
  const [confirmSuccessMsg, setConfirmSuccessMsg] = useState('');

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(setBoardSettings).catch(() => {});
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (initialOrder) {
        setOrder(initialOrder);
        setInvoiceId(initialOrder.invoiceId || '');
        setShowSearch(false);
        if (initialOrder.invoiceId) {
          fetchOrder(initialOrder.invoiceId);
        }
      } else if (initialInvoiceId) {
        setInvoiceId(initialInvoiceId);
        setShowSearch(false);
        fetchOrder(initialInvoiceId);
      } else {
        setShowSearch(true);
        const saved = localStorage.getItem("lastSearchedInvoice");
        if (saved && !invoiceId) {
          setInvoiceId(saved);
        }
      }
    } else {
      if (!initialInvoiceId && !initialOrder) {
        setOrder(null);
      }
    }
  }, [isOpen, initialInvoiceId, initialOrder, isNewOrder]);

  const handleSetPassword = async () => {
    if (!order?.userAccount || !customPasswordInput.trim()) return;
    setPasswordSaving(true);
    try {
      const res = await fetch("/api/auth/set-order-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: order.userAccount.id,
          phone: order.userAccount.phone,
          email: order.userAccount.email,
          newPassword: customPasswordInput.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");
      setPasswordSaveStatus("success:পাসওয়ার্ড সফলভাবে সংরক্ষিত হয়েছে!");
      setOrder((prev: any) => ({
        ...prev,
        userAccount: {
          ...prev.userAccount,
          initialPassword: customPasswordInput.trim(),
        }
      }));
    } catch (err: any) {
      setPasswordSaveStatus(`error:${err.message}`);
    } finally {
      setPasswordSaving(false);
    }
  };

  if (!isOpen) return null;

  const fetchOrder = async (idToSearch: string) => {
    const cleanId = idToSearch.trim().toUpperCase();
    if (!cleanId) return;
    
    setLoading(true);
    setError('');
    if (!order && !initialOrder) {
      setOrder(null);
    }
    setConfirmSuccessMsg('');
    setShowConfirmForm(false);
    
    try {
      localStorage.setItem("lastSearchedInvoice", cleanId);
      const res = await fetch(`/api/store/orders/${cleanId}`);
      if (!res.ok) {
        throw new Error('অর্ডারটি পাওয়া যায়নি। অনুগ্রহ করে সঠিক ইনভয়েস নম্বরটি চেক করুন।');
      }
      const data = await res.json();
      setOrder((prev: any) => ({
        ...data,
        userAccount: data.userAccount || prev?.userAccount || initialOrder?.userAccount
      }));
    } catch (err: any) {
      setError(err.message || 'অর্ডার ট্র্যাক করতে সমস্যা হয়েছে।');
    }
    setLoading(false);
  };

  const trackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(invoiceId);
  };

  const handleQRScanned = (scannedText: string) => {
    const cleanId = scannedText.trim().toUpperCase();
    setInvoiceId(cleanId);
    fetchOrder(cleanId);
  };

  // User confirms received
  const handleUserConfirmReceived = async () => {
    if (!order) return;
    setIsConfirming(true);
    try {
      const res = await fetch(`/api/store/orders/${order.invoiceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverName: order.customerName,
          notes: customerRemarks.trim() || 'ক্রেতা সরাসরি ট্র্যাকিং পেজ থেকে পণ্য প্রাপ্তি নিশ্চিত করেছেন'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'পণ্য রিসিভ নিশ্চিত করা যায়নি');
      }
      setOrder(data);
      setShowConfirmForm(false);
      setConfirmSuccessMsg('ধন্যবাদ! আপনার পণ্য প্রাপ্তি সফলভাবে নিশ্চিত এবং সংরক্ষণ করা হয়েছে।');
    } catch (err: any) {
      alert(err.message || 'পণ্য রিসিভ নিশ্চিত করতে সমস্যা হয়েছে');
    } finally {
      setIsConfirming(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const s = (status || '').trim().toLowerCase();
    if (s === 'completed' || s === 'delivered') return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    if (s === 'shipped' || s === 'courier') return <Truck className="w-5 h-5 text-cyan-600" />;
    if (s === 'packaging') return <Package className="w-5 h-5 text-purple-600" />;
    if (s === 'confirmed' || s === 'accepted') return <CheckCircle className="w-5 h-5 text-blue-600" />;
    if (s === 'rejected' || s === 'cancelled') return <AlertCircle className="w-5 h-5 text-red-600" />;
    return <Clock className="w-5 h-5 text-amber-500" />;
  };

  const getStatusText = (status: string) => {
    const s = (status || '').trim().toLowerCase();
    if (s === 'completed' || s === 'delivered') return 'ডেলিভারি সম্পন্ন';
    if (s === 'shipped' || s === 'courier') return 'কুরিয়ারে হস্তান্তরকৃত';
    if (s === 'packaging') return 'প্যাকেজিং চলছে';
    if (s === 'confirmed' || s === 'accepted') return 'অনুমোদিত ও নিশ্চিত';
    if (s === 'rejected' || s === 'cancelled') return 'বাতিলকৃত অর্ডার';
    if (s === 'pending order' || s === 'pending') return 'অপেক্ষমান অর্ডার';
    if (s === 'paid') return 'অনুমোদিত (পরিশোধিত)';
    if (s === 'partial') return 'অনুমোদিত (আংশিক)';
    return status;
  };

  const printInvoice = () => {
    if (!order) return;
    printOrderInvoice(order, { printBW });
  };

  const isQuestion = Boolean(
    order?.orderType === 'QUESTION' ||
    order?.orderType === 'EXAM_QUESTION' ||
    (order?.notes && (
      order.notes.includes('[প্রশ্নের অর্ডার]') ||
      order.notes.includes('প্রশ্নপত্র') ||
      order.notes.includes('প্রশ্ন অর্ডার') ||
      order.notes.includes('প্রশ্নপত্র সেট')
    )) ||
    (order?.items && order.items.some((i: any) => {
      const pName = String(i.product?.name || i.name || '').toLowerCase();
      const pCat = String(i.product?.category || i.category || '').toLowerCase();
      return pName.includes('প্রশ্ন') || pCat.includes('প্রশ্ন') || pCat.includes('question');
    }))
  );

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
        {/* Rich Frosted Backdrop Blur */}
        <div 
          className="fixed inset-0 bg-slate-950/65 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
          onClick={onClose}
        />

        {/* Modal Card - Glassmorphism */}
        <div 
          className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.35)] max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh] animate-scale-in border border-white/80 z-10" 
          onClick={e => e.stopPropagation()}
        >
          {/* Header with Deep Academic Emerald Gradient */}
          <div className="px-5 py-4 bg-gradient-to-r from-[#04281f]/95 via-[#06422b]/95 to-[#085236]/95 text-white flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
                {isDirectOrder ? <CheckCircle className="w-5 h-5 text-slate-950" /> : <Search className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold leading-tight">
                    {isDirectOrder ? "অর্ডার ইনভয়েস ও ট্র্যাকিং তথ্য" : "অর্ডার ট্র্যাকিং ও ডেলিভারি তথ্য"}
                  </h2>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <p className="text-xs text-emerald-200">
                  {isDirectOrder ? "অর্ডার সফলভাবে সিস্টেমে যুক্ত হয়েছে • ইনভয়েসটি সংরক্ষণ করুন" : "ইনভয়েস নম্বর দিয়ে লাইভ স্ট্যাটাস, অ্যাডমিন দায়িত্ব ও গ্রহণ নিশ্চিত করুন"}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors active:scale-95"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Content Area */}
          <div className="p-4 sm:p-6 overflow-y-auto min-h-0 overscroll-contain">
            {/* New Order Celebration Banner */}
            {isDirectOrder && order && (
              <div className="bg-gradient-to-r from-emerald-800 via-[#095738] to-[#06422b] text-white p-4 sm:p-5 rounded-3xl mb-5 shadow-lg shadow-emerald-950/20 flex flex-col sm:flex-row items-center justify-between gap-4 border border-emerald-600/30 animate-in fade-in">
                <div className="flex items-center gap-3.5 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20">
                    <CheckCircle className="w-7 h-7 text-emerald-300" />
                  </div>
                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-base sm:text-lg font-black tracking-tight">অর্ডার সফলভাবে সম্পন্ন হয়েছে!</h3>
                      <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">গৃহীত</span>
                    </div>
                    <p className="text-xs text-emerald-100/90 mt-0.5">
                      আপনার ইনভয়েস নম্বর: <span className="font-mono font-bold text-white bg-white/15 px-1.5 py-0.5 rounded">{order.invoiceId}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                  <button
                    type="button"
                    onClick={printInvoice}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs sm:text-sm rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-emerald-700" />
                    <span>ইনভয়েস প্রিন্ট</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(order.invoiceId)}
                    title="কপি করুন"
                    className="px-3 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline">আইডি কপি</span>
                  </button>
                </div>
              </div>
            )}

            {/* User Account Info Banner */}
            {order?.userAccount && (
              <div className="w-full mb-5 text-left bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 shadow-xs animate-in fade-in">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs sm:text-sm mb-2">
                  <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{order.userAccount.isNew ? "🎉 আপনার জন্য একটি নতুন ইউজার অ্যাকাউন্ট তৈরি হয়েছে!" : "✓ বিদ্যমান অ্যাকাউন্টে অর্ডারটি সংরক্ষিত হয়েছে"}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 bg-white/80 p-3 rounded-xl border border-emerald-100 mb-2.5">
                  <p><strong className="text-slate-500">নাম:</strong> {order.userAccount.name}</p>
                  <p><strong className="text-slate-500">লগইন আইডি / মোবাইল:</strong> <span className="font-mono font-bold text-slate-900">{order.userAccount.phone || order.userAccount.email}</span></p>
                  {order.userAccount.email && (
                    <p className="col-span-full"><strong className="text-slate-500">ইমেইল:</strong> {order.userAccount.email}</p>
                  )}
                </div>

                {order.userAccount.isNew && (
                  <div className="pt-2 border-t border-emerald-200/80">
                    <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-emerald-200 mb-2">
                      <span className="text-xs text-slate-600 font-bold">লগইন পাসওয়ার্ড:</span>
                      <span className="font-mono font-black text-emerald-800 text-sm">{order.userAccount.initialPassword || "আপনার সেট করা পাসওয়ার্ড"}</span>
                    </div>
                    
                    <div className="mt-2.5">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        পাসওয়ার্ড পরিবর্তন / কাস্টম করতে চান?
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          placeholder="নতুন পাসওয়ার্ড লিখুন..."
                          value={customPasswordInput}
                          onChange={(e) => {
                            setCustomPasswordInput(e.target.value);
                            setPasswordSaveStatus(null);
                          }}
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white"
                        />
                        <button
                          onClick={handleSetPassword}
                          disabled={passwordSaving || !customPasswordInput.trim()}
                          className="px-4 py-1.5 bg-[#095738] text-white rounded-xl text-xs font-bold hover:bg-[#07472d] disabled:opacity-50 transition-colors shrink-0 cursor-pointer"
                        >
                          {passwordSaving ? "..." : "সংরক্ষণ"}
                        </button>
                      </div>
                      {passwordSaveStatus && (
                        <p className={`text-[11px] mt-1.5 font-semibold ${passwordSaveStatus.startsWith("success") ? "text-emerald-700" : "text-red-600"}`}>
                          {passwordSaveStatus.replace(/^(success|error):/, "")}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Search Input with toggle when isDirectOrder */}
            {isDirectOrder && (
              <div className="mb-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowSearch(!showSearch)}
                  className="text-xs text-slate-500 hover:text-emerald-700 font-semibold underline flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Search className="w-3 h-3" />
                  <span>{showSearch ? "অনুসন্ধান বক্স বন্ধ করুন" : "অন্য কোনো ইনভয়েস ট্র্যাক করতে চান?"}</span>
                </button>
              </div>
            )}

            {showSearch && (
              <form onSubmit={trackOrder} className="flex gap-2 mb-4 sm:mb-5">
                <div className="relative flex-1 group">
                  <input 
                    type="text" 
                    value={invoiceId} 
                    onChange={(e) => setInvoiceId(e.target.value.toUpperCase())}
                    placeholder="ইনভয়েস নম্বর দিন (উদাঃ INV-2026-0004)"
                    className="w-full border-2 border-slate-200/80 focus:border-[#095738] focus:ring-4 focus:ring-emerald-500/15 rounded-2xl pl-4 pr-12 py-3 text-sm font-semibold focus:outline-none bg-slate-50/80 hover:bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    title="ক্যামেরা দিয়ে কিউআর কোড স্ক্যান করুন"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-gradient-to-br from-amber-300 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold transition-all shadow-xs active:scale-90 cursor-pointer"
                  >
                    <Camera className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
                <button 
                  type="submit" 
                  disabled={loading || !invoiceId}
                  className="px-5 sm:px-6 bg-gradient-to-r from-[#06422b] to-[#095738] hover:from-[#053724] hover:to-[#07472e] text-white font-extrabold rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 whitespace-nowrap shadow-md shadow-emerald-950/20 text-sm cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>খুঁজছে...</span>
                    </>
                  ) : (
                    <span>ট্র্যাক করুন</span>
                  )}
                </button>
              </form>
            )}

            {/* Error Notice */}
            {error && (
              <div className="bg-red-50/90 text-red-700 p-4 rounded-2xl text-sm font-bold border border-red-200/80 flex items-center gap-3 mb-5 shadow-xs animate-shake">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="leading-tight">{error}</p>
              </div>
            )}

            {/* Success Message for Customer Receive Confirmation */}
            {confirmSuccessMsg && (
              <div className="bg-emerald-50 text-emerald-900 p-4 rounded-2xl text-xs sm:text-sm font-bold border border-emerald-300 flex items-center gap-3 mb-4 shadow-sm animate-in fade-in">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <p>{confirmSuccessMsg}</p>
                  <p className="text-[11px] text-emerald-700 font-medium mt-0.5">আপনার প্রাপ্তি কনফার্মেশন সিস্টেমে স্থায়ীভাবে যুক্ত হয়েছে।</p>
                </div>
              </div>
            )}

            {/* Order Result Card */}
            {order && (
              <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm animate-scale-in">
                {/* Formal Board Official Header */}
                <div className="bg-white p-4 sm:p-5 border-b border-slate-200 text-center">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-2">
                    {boardSettings?.logoUrl ? (
                      <img src={boardSettings.logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-lg">
                        বোর্ড
                      </div>
                    )}
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-[#095738] leading-tight">
                        {boardSettings?.siteTitle || "নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ"}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {boardSettings?.address || "মুহাম্মাদনগর বড় মাদ্রাসা, মাদরাসা সড়ক, গল্লামারী, খুলনা"} | হেল্পলাইন: {boardSettings?.contactPhone || "01820-580560"}
                      </p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
                    <span>অফিসিয়াল অর্ডার ইনভয়েস / ক্যাশ মেমো</span>
                  </div>
                </div>

                {/* Header Sub-bar */}
                <div className="bg-gradient-to-r from-slate-50 to-emerald-50/40 p-4 sm:p-5 border-b border-slate-200/70 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">ইনভয়েস নম্বর</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg sm:text-xl font-black font-mono text-slate-900">{order.invoiceId}</p>
                      <button 
                        onClick={() => navigator.clipboard.writeText(order.invoiceId)}
                        title="কপি করুন"
                        className="p-1.5 hover:bg-slate-200/80 rounded-lg text-slate-500 hover:text-slate-800 transition-colors active:scale-90"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">বর্তমান স্ট্যাটাস</p>
                    <div className="flex items-center gap-2 bg-white/95 px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs">
                      {getStatusIcon(order.status)}
                      <span className="font-extrabold text-slate-800 text-xs sm:text-sm">{getStatusText(order.status)}</span>
                    </div>
                  </div>
                </div>

                {/* 5-Step Order Lifecycle Stepper & Timeline */}
                {(() => {
                  const stepNumber = getOrderStepNumber(order.status);
                  const trackingInfo = parseTrackingInfo(order.notes, order.courierName);
                  const timelineList: TimelineEvent[] = Array.isArray(order.timeline) ? order.timeline : [];

                  if (stepNumber === -1) {
                    return (
                      <div className="p-4 sm:p-5 bg-red-50 border-b border-red-200/80 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-xs">
                          <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-red-900 text-sm">এই অর্ডারটি বাতিল করা হয়েছে</h4>
                          <p className="text-xs text-red-700 mt-0.5 leading-relaxed">
                            কোনো জিজ্ঞাসা বা সহায়তার জন্য নূরানী বোর্ডের কেন্দ্রীয় হেল্পলাইনে (01820-580560) যোগাযোগ করার জন্য অনুরোধ করা হলো।
                          </p>
                        </div>
                      </div>
                    );
                  }

                  const isDelivered = stepNumber === 5;
                  const canUserConfirmReceived = stepNumber >= 2 && stepNumber <= 4;

                  return (
                    <div className="p-4 sm:p-6 bg-gradient-to-b from-slate-50/90 via-emerald-50/20 to-white border-b border-slate-200/80">
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <span>অর্ডার ট্র্যাকিং অগ্রগতি</span>
                            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-bold">
                              ধাপ {Math.min(stepNumber, 5)} / ৫
                            </span>
                          </span>
                        </div>
                        <span className="text-xs font-extrabold text-emerald-800 bg-white px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
                          {stepNumber === 1 && "নতুন অর্ডার গৃহীত"}
                          {stepNumber === 2 && "অনুমোদন সম্পন্ন"}
                          {stepNumber === 3 && "প্যাকেজিং প্রস্তুত হচ্ছে"}
                          {stepNumber === 4 && "কুরিয়ারে হস্তান্তর সম্পন্ন"}
                          {stepNumber === 5 && (order.confirmedByCustomer ? "ডেলিভারি সম্পন্ন (ক্রেতা কর্তৃক গৃহীত)" : "ডেলিভারি সম্পন্ন")}
                        </span>
                      </div>

                      {/* Horizontal Stepper */}
                      <div className="relative">
                        {/* Connecting line for desktop */}
                        <div className="absolute top-5 left-8 right-8 h-1 bg-slate-200 -translate-y-1/2 z-0 hidden sm:block">
                          <div 
                            className="h-full bg-emerald-600 transition-all duration-700 ease-in-out rounded-full" 
                            style={{ width: `${Math.max(0, Math.min(100, ((stepNumber - 1) / 4) * 100))}%` }}
                          />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-2 relative z-10">
                          {TRACKING_STEPS.map((s) => {
                            const isCompleted = stepNumber > s.step;
                            const isCurrent = stepNumber === s.step;
                            const isUpcoming = stepNumber < s.step;

                            return (
                              <div key={s.step} className="flex flex-col items-center text-center group">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                                  isCompleted
                                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                                    : isCurrent
                                    ? "bg-emerald-600 text-white ring-4 ring-emerald-200 shadow-md animate-pulse"
                                    : "bg-white text-slate-400 border-2 border-slate-200 shadow-2xs"
                                }`}>
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                                  ) : (
                                    <s.icon className="w-5 h-5 stroke-[2]" />
                                  )}
                                </div>
                                <p className={`mt-2 text-xs font-extrabold leading-tight ${
                                  isCurrent ? "text-emerald-800" : isCompleted ? "text-slate-800" : "text-slate-400"
                                }`}>
                                  {s.label}
                                </p>
                                <p className="text-[10px] text-slate-500 mt-0.5 hidden sm:block leading-tight">
                                  {s.desc}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Highlighted Courier Info Card if in Courier (Step 4 or 5) */}
                      {stepNumber >= 4 && (
                        <div className="mt-5 p-3.5 sm:p-4 bg-gradient-to-r from-cyan-50 via-teal-50 to-blue-50 border border-cyan-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                              <Truck className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-extrabold text-cyan-950">
                                কুরিয়ার পার্টনার: <span className="text-cyan-800 font-black">{trackingInfo.courier}</span>
                              </p>
                              {trackingInfo.trackingId ? (
                                <p className="text-xs text-slate-700 font-mono mt-0.5">
                                  ট্র্যাকিং / কনসাইনমেন্ট: <strong className="text-slate-900 bg-white px-2 py-0.5 rounded border border-cyan-300 font-black">{trackingInfo.trackingId}</strong>
                                </p>
                              ) : (
                                <p className="text-[11px] text-slate-600 mt-0.5">আপনার পার্সেলটি কুরিয়ারে হস্তান্তর করা হয়েছে।</p>
                              )}
                            </div>
                          </div>
                          {trackingInfo.trackingId && (
                            <button
                              type="button"
                              onClick={() => navigator.clipboard.writeText(trackingInfo.trackingId)}
                              className="self-end sm:self-center px-3.5 py-1.5 bg-white hover:bg-cyan-100 text-cyan-900 text-xs font-extrabold rounded-xl border border-cyan-300 shadow-2xs transition-colors flex items-center gap-1.5 active:scale-95"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>ট্র্যাকিং কপি</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* USER CONFIRMATION & DELIVERED BANNER SECTION */}
                      {isDelivered ? (
                        <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border-2 border-emerald-300 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-extrabold text-sm text-emerald-950">
                                  {order.confirmedByCustomer 
                                    ? 'পণ্য সফলভাবে রিসিভ করা হয়েছে (ক্রেতা নিজে কনফার্ম করেছেন)' 
                                    : 'পণ্য ডেলিভারি সম্পন্ন হয়েছে'}
                                </h4>
                                <span className="bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                                  ভেরিফায়েড
                                </span>
                              </div>
                              <p className="text-xs text-emerald-800 mt-0.5">
                                <strong>রিসিভার:</strong> {order.receivedBy || order.deliveredBy || order.customerName}
                                {(order.receivedAt || order.deliveredAt) && (
                                  <span className="ml-2 font-mono text-[11px] text-emerald-700">
                                    • {formatBanglaDateTime(order.receivedAt || order.deliveredAt)}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : canUserConfirmReceived ? (
                        <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 via-emerald-50/50 to-teal-50 border-2 border-emerald-300/80 rounded-2xl flex flex-col gap-3 shadow-xs">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                                <ThumbsUp className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-sm text-slate-900">
                                  পণ্য কি হাতে পেয়েছেন? ডেলিভারি নিশ্চিত করুন
                                </h4>
                                <p className="text-xs text-slate-600 mt-0.5">
                                  {isQuestion 
                                    ? "প্রশ্নপত্র ও আনুষঙ্গিক সামগ্রী সঠিকভাবে হাতে পাওয়ার পর নিচের বোতামে ক্লিক করে রিসিভ নিশ্চিত করুন।" 
                                    : "বই ও স্টেশনারি সঠিকভাবে হাতে পাওয়ার পর নিচের বোতামে ক্লিক করে রিসিভ নিশ্চিত করুন।"}
                                </p>
                              </div>
                            </div>

                            {!showConfirmForm && (
                              <button
                                type="button"
                                onClick={() => setShowConfirmForm(true)}
                                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-900/15 flex items-center justify-center gap-2 active:scale-95"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>পণ্য রিসিভ নিশ্চিত করুন</span>
                              </button>
                            )}
                          </div>

                          {showConfirmForm && (
                            <div className="mt-2 pt-3 border-t border-emerald-200/80 flex flex-col gap-3 animate-in fade-in">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                                  <span>মন্তব্য / ফিডব্যাক (ঐচ্ছিক):</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder={isQuestion ? "যেমন: সকল প্রশ্নপত্র সঠিকভাবে হাতে পেয়েছি, ধন্যবাদ।" : "যেমন: সকল বই সঠিকভাবে হাতে পেয়েছি, ধন্যবাদ।"}
                                  value={customerRemarks}
                                  onChange={e => setCustomerRemarks(e.target.value)}
                                  className="w-full border border-emerald-200 rounded-xl px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmForm(false)}
                                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                                >
                                  ফিরে যান
                                </button>
                                <button
                                  type="button"
                                  onClick={handleUserConfirmReceived}
                                  disabled={isConfirming}
                                  className="px-5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 active:scale-95"
                                >
                                  {isConfirming ? (
                                    <>
                                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                      <span>নিশ্চিত হচ্ছে...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                      <span>হ্যাঁ, রিসিভ সম্পন্ন</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : null}

                      {/* DETAILED TIMELINE / STEP AUDIT LOG */}
                      {timelineList.length > 0 && (
                        <div className="mt-5 pt-4 border-t border-slate-200">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>ধাপভিত্তিক অগ্রগতির বিবরণ ও দায়িত্বশীল তথ্য</span>
                          </h4>

                          <div className="flex flex-col gap-2.5">
                            {timelineList.map((evt, idx) => {
                              const isDeliv = evt.step === 'delivered';
                              const isShip = evt.step === 'shipped';
                              const isPkg = evt.step === 'packaging';
                              const isConf = evt.step === 'confirmed';

                              return (
                                <div 
                                  key={idx} 
                                  className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition-all ${
                                    isDeliv 
                                      ? 'bg-emerald-50/70 border-emerald-200' 
                                      : isShip 
                                      ? 'bg-cyan-50/60 border-cyan-200' 
                                      : isPkg 
                                      ? 'bg-purple-50/60 border-purple-200' 
                                      : isConf 
                                      ? 'bg-blue-50/60 border-blue-200' 
                                      : 'bg-slate-50 border-slate-200/80'
                                  }`}
                                >
                                  <div className="flex items-start sm:items-center gap-2.5">
                                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                                      isDeliv ? 'bg-emerald-600 text-white' :
                                      isShip ? 'bg-cyan-600 text-white' :
                                      isPkg ? 'bg-purple-600 text-white' :
                                      isConf ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                                    }`}>
                                      {idx + 1}
                                    </div>
                                    <div>
                                      <p className="font-extrabold text-slate-900 text-xs sm:text-sm leading-tight">
                                        {evt.title}
                                      </p>
                                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-600 flex-wrap">
                                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                                          <User className="w-3 h-3 text-slate-400" />
                                          <span>{evt.actorRole === 'CUSTOMER' ? 'ক্রেতা:' : 'দায়িত্বশীল:'} <strong>{evt.actorName}</strong></span>
                                        </span>
                                        {evt.courierName && (
                                          <span className="text-cyan-800 bg-cyan-100/70 px-1.5 py-0.2 rounded font-medium">
                                            {evt.courierName} {evt.trackingId ? `(${evt.trackingId})` : ''}
                                          </span>
                                        )}
                                        {evt.notes && (
                                          <span className="text-slate-500 italic">
                                            • {evt.notes}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="self-end sm:self-center font-mono text-[11px] text-slate-500 bg-white/80 px-2 py-1 rounded-lg border border-slate-200/70 shrink-0 flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-slate-400" />
                                    <span>{formatBanglaDateTime(evt.timestamp)}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
                
                {/* Customer Details Grid */}
                <div className="p-4 sm:p-5 grid grid-cols-2 gap-4 border-b border-slate-100 bg-white/50 text-xs sm:text-sm">
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase mb-0.5">ক্রেতার নাম</p>
                    <p className="font-bold text-slate-800">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase mb-0.5">মোবাইল</p>
                    <p className="font-bold text-slate-800">{order.customerPhone || 'N/A'}</p>
                  </div>
                  {order.instituteId && (
                    <div className="col-span-2">
                      <p className="text-[11px] text-slate-400 font-bold uppercase mb-0.5">প্রতিষ্ঠান</p>
                      <p className="font-bold text-slate-800">{order.instituteId}</p>
                    </div>
                  )}
                  {order.notes && (
                    <div className="col-span-2 border-t border-slate-100 pt-2.5 mt-0.5">
                      <p className="text-[11px] text-slate-400 font-bold uppercase mb-0.5">ডেলিভারি ঠিকানা / নোট</p>
                      <p className="font-medium text-slate-700 whitespace-pre-wrap">{cleanAddressNotes(order.notes) || order.notes}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase mb-0.5">অর্ডারের তারিখ</p>
                    <p className="font-semibold text-slate-700">{new Date(order.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  {(() => {
                    const itemsSubtotal = order.items.reduce((s: number, i: any) => s + (i.quantity * i.unitPrice), 0);
                    const deliveryCharge = Number(order.deliveryCharge) || 0;
                    return (
                      <>
                        <div>
                          <p className="text-[11px] text-slate-400 font-bold uppercase mb-0.5">পণ্যের মূল্য (সাবটোটাল)</p>
                          <p className="font-bold text-slate-800">৳{itemsSubtotal.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400 font-bold uppercase mb-0.5">
                            কুরিয়ার ({order.courierName || 'পাঠাও কুরিয়ার'})
                          </p>
                          {deliveryCharge > 0 ? (
                            <p className="font-bold text-slate-800">৳{deliveryCharge.toFixed(2)}</p>
                          ) : (
                            <p className="font-bold text-emerald-600">০.০০ ৳ (ফ্রি ডেলিভারি 🎉)</p>
                          )}
                        </div>
                      </>
                    );
                  })()}
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase mb-0.5">বর্তমান বিল</p>
                    <p className="font-bold text-slate-800">৳{order.totalAmount.toFixed(2)}</p>
                  </div>

                  <div className="col-span-2 text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-start gap-1.5 mt-0.5">
                    <span className="shrink-0 text-xs">🚚</span>
                    <span>
                      <strong>কুরিয়ার নীতিমালা:</strong> ৫,০০০ টাকার কম অর্ডারে “পাঠাও কুরিয়ার”-এর মাধ্যমে পাঠানো হয় (প্রথম ২ কেজি ১৮০ ৳, পরের প্রতি কেজি ২৫ ৳, সর্বোচ্চ ১৫ কেজি)। ৫,০০০ ৳ বা তদূর্ধ্ব অর্ডারে ফ্রি ডেলিভারি।
                    </span>
                  </div>
                  
                  {order.currentDueList && order.currentDueList.length > 0 ? (
                    <div className="col-span-2 bg-amber-50/80 rounded-2xl p-3 border border-amber-200/70 mt-1">
                      <p className="text-xs text-amber-800 font-bold mb-1.5">অন্যান্য বকেয়া তালিকা</p>
                      <div className="flex flex-col gap-1">
                        {order.currentDueList.slice(0, 5).map((dueObj: any) => (
                          <div key={dueObj.invoiceId} className="flex justify-between items-center text-xs">
                            <span className="font-medium text-amber-900">বকেয়া ({dueObj.invoiceId} - {new Date(dueObj.date).toLocaleDateString('bn-BD')})</span>
                            <span className="font-bold text-amber-900">৳{dueObj.due.toFixed(2)}</span>
                          </div>
                        ))}
                        {order.currentDueList.length > 5 && (
                          <div className="flex justify-between items-center text-xs pt-1.5 border-t border-amber-200 font-bold text-amber-900">
                            <span>অন্যান্য আরও (+{order.currentDueList.length - 5}টি বকেয়া ইনভয়েস)</span>
                            <span>
                              ৳
                              {order.currentDueList
                                .slice(5)
                                .reduce((s: number, d: any) => s + Number(d.due || 0), 0)
                                .toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    order.currentTotalDue > 0 && (
                      <div className="col-span-2 mt-1">
                        <p className="text-[11px] text-amber-600 font-bold uppercase mb-0.5">অন্যান্য বকেয়া</p>
                        <p className="font-bold text-amber-700">৳{order.currentTotalDue.toFixed(2)}</p>
                      </div>
                    )
                  )}

                  {order.discount > 0 && (
                    <div>
                      <p className="text-[11px] text-emerald-600 font-bold uppercase mb-0.5">ছাড়</p>
                      <p className="font-bold text-emerald-700">-৳{order.discount.toFixed(2)}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase mb-0.5">সর্বমোট প্রদেয়</p>
                    <p className="font-extrabold text-slate-900">৳{(order.totalAmount + (order.currentTotalDue || 0)).toFixed(2)}</p>
                  </div>

                  <div>
                    <p className="text-[11px] text-blue-600 font-bold uppercase mb-0.5">পরিশোধিত</p>
                    <p className="font-bold text-blue-700">৳{(order.paidAmount || 0).toFixed(2)}</p>
                  </div>

                  <div>
                    <p className="text-[11px] text-red-600 font-bold uppercase mb-0.5">সর্বমোট বকেয়া</p>
                    <p className="font-black text-red-600">৳{(order.totalAmount + (order.currentTotalDue || 0) - (order.paidAmount || 0)).toFixed(2)}</p>
                  </div>
                </div>

                {/* Items Table */}
                {(() => {
                  let displayItems = order.items || [];
                  const parsedNotes = parseQuestionItemsFromNotes(order.notes);
                  const hasDuplicateGlitch = displayItems.length > 1 &&
                    displayItems.every((i: any) => i.productId === displayItems[0]?.productId || i.product?.name === displayItems[0]?.product?.name) &&
                    parsedNotes.length > 1;

                  if (hasDuplicateGlitch && parsedNotes.length > 0) {
                    displayItems = parsedNotes.map((p, idx) => ({
                      product: { name: p.name },
                      quantity: p.qty,
                      unitPrice: displayItems[idx]?.unitPrice || (p.name.includes('প্রথম') ? 18 : 20)
                    }));
                  }

                  return (
                    <div className="p-4 sm:p-5 bg-slate-50/60 overflow-hidden border-t border-slate-100">
                      <div className="flex items-center justify-between mb-2.5">
                        <p className="text-xs text-slate-700 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-emerald-700" />
                          <span>{isQuestion ? "অর্ডারকৃত প্রশ্নপত্রের তালিকা (Question List)" : "অর্ডারকৃত পণ্যের তালিকা (Item List)"}</span>
                        </p>
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                          মোট {displayItems.length} টি আইটেম
                        </span>
                      </div>
                      
                      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
                        <table className="w-full text-left text-xs sm:text-sm">
                          <thead>
                            <tr className="bg-slate-50/90 text-slate-500 font-bold border-b border-slate-200/80 text-[11px] uppercase tracking-wider">
                              <th className="py-2.5 px-3 text-center w-10">#</th>
                              <th className="py-2.5 px-3">{isQuestion ? "প্রশ্ন ও বিষয়সমূহ" : "পণ্যের নাম"}</th>
                              <th className="py-2.5 px-3 text-center">পরিমাণ</th>
                              <th className="py-2.5 px-3 text-right">একক মূল্য</th>
                              <th className="py-2.5 px-3 text-right">মোট মূল্য</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {displayItems.map((item: any, i: number) => {
                              const unitPrice = Number(item.unitPrice) || 0;
                              const total = item.quantity * unitPrice;
                              const subjects = item.product?.description && !item.product.description.includes('কেন্দ্রীয়') ? item.product.description : '';
                              return (
                                <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                                  <td className="py-2.5 px-3 text-center text-slate-400 font-bold text-xs">{i + 1}</td>
                                  <td className="py-2.5 px-3 font-bold text-slate-800">
                                    <div>
                                      <span>{item.product?.name || item.name || 'আইটেম'}</span>
                                      {item.product?.className && (
                                        <span className="text-[10px] text-slate-500 font-normal ml-1 bg-slate-100 px-1.5 py-0.5 rounded">
                                          {item.product.className}
                                        </span>
                                      )}
                                    </div>
                                    {subjects && (
                                      <p className="text-[10px] text-slate-500 font-normal mt-0.5 leading-tight">
                                        {subjects}
                                      </p>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-md text-xs">
                                      {item.quantity} টি
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right text-slate-600 font-mono text-xs">
                                    {unitPrice.toFixed(2)} ৳
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-black text-slate-900 font-mono">
                                    {total.toFixed(2)} ৳
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}

                {/* Footer Controls */}
                <div className="p-4 bg-slate-100/70 border-t border-slate-200/80 flex flex-wrap justify-between items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-700">
                    <input 
                      type="checkbox" 
                      checked={printBW} 
                      onChange={(e) => setPrintBW(e.target.checked)}
                      className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-600"
                    />
                    সাদাকালো প্রিন্ট (B&W)
                  </label>
                  <button 
                    onClick={printInvoice}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#06422b] to-[#095738] hover:from-[#053724] hover:to-[#07472e] text-white font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-md shadow-emerald-950/20 active:scale-95"
                  >
                    <Printer className="w-4 h-4" /> 
                    <span>ইনভয়েস প্রিন্ট করুন</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <QRScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        onScanSuccess={handleQRScanned} 
      />
    </>
  );
}

export default TrackOrderModal;
