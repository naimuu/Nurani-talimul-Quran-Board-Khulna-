"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Save,
  X,
  Image as ImageIcon,
  Building2,
  Upload,
  CreditCard,
  Truck,
  QrCode,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Smartphone,
  Percent,
  Users,
  BookOpen,
  FileQuestion,
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export interface DynamicPaymentMethod {
  id?: string;
  type: string; // 'mobile' | 'bank'
  provider: string;
  name?: string;
  logo?: string;
  accountName?: string;
  accountNumber: string;
  accountType?: string;
  branch?: string;
  routingNo?: string;
  qrCodeImage?: string;
  instructions?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface DynamicDeliveryOption {
  id?: string;
  name: string;
  type: string;
  charge: number;
  requiresName: boolean;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

const MOBILE_PRESETS = ["বিকাশ", "নগদ", "রকেট", "উপায়"];
const BANK_PRESETS = ["ইসলামী ব্যাংক", "ডাচ-বাংলা ব্যাংক", "সোনালী ব্যাংক", "জনতা ব্যাংক"];

export function PaymentMethodsManager({
  initialPayments,
  onSaved,
}: {
  initialPayments?: DynamicPaymentMethod[];
  onSaved?: () => void;
}) {
  const [payments, setPayments] = useState<DynamicPaymentMethod[]>(initialPayments || []);
  const [isLoading, setIsLoading] = useState(!initialPayments);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  useEffect(() => {
    if (initialPayments) {
      setPayments(initialPayments);
      setIsLoading(false);
    } else {
      fetchPayments();
    }
  }, [initialPayments]);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/settings?t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data?.payments)) {
        setPayments(data.payments);
      }
    } catch {
      toast.error("পেমেন্ট মাধ্যম লোড করতে ব্যর্থ হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const newPayments = [...payments];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newPayments.length) return;
    const temp = newPayments[index];
    newPayments[index] = newPayments[targetIdx];
    newPayments[targetIdx] = temp;
    newPayments.forEach((p, idx) => {
      p.sortOrder = idx + 1;
    });
    setPayments(newPayments);
  };

  const handleFileUpload = async (file: File, index: number, field: "qrCodeImage" | "logo") => {
    const key = `${index}_${field}`;
    setUploadingKey(key);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "payments");
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setPayments((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], [field]: data.url };
          return next;
        });
        toast.success(field === "qrCodeImage" ? "কিউআর কোড (QR Code) আপলোড হয়েছে! নিচে সংরক্ষণ বাটনে ক্লিক করুন।" : "লোগো আপলোড হয়েছে!");
      } else {
        toast.error(data.error || "আপলোড ব্যর্থ হয়েছে");
      }
    } catch {
      toast.error("ছবি আপলোড করতে ব্যর্থ হয়েছে");
    } finally {
      setUploadingKey(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = payments.map((p, idx) => {
        const displayName = (p.name || p.provider || "").trim();
        return {
          ...p,
          provider: displayName || p.provider,
          name: displayName || p.provider,
          sortOrder: idx + 1,
        };
      });
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payments: payload }),
      });
      if (res.ok) {
        const updated = await res.json();
        if (Array.isArray(updated?.payments)) {
          setPayments(updated.payments);
        }
        toast.success("পেমেন্ট মাধ্যম ও কিউআর কোড সফলভাবে সংরক্ষিত হয়েছে!");
        onSaved?.();
      } else {
        throw new Error();
      }
    } catch {
      toast.error("সংরক্ষণ করতে ব্যর্থ হয়েছে");
    } finally {
      setIsSaving(false);
    }
  };

  const addMethod = (type: "mobile" | "bank", presetName?: string) => {
    const isMobile = type === "mobile";
    const defaultName = presetName || (isMobile ? "বিকাশ" : "ইসলামী ব্যাংক");
    setPayments((prev) => [
      ...prev,
      {
        type,
        provider: defaultName,
        name: defaultName,
        accountNumber: "",
        accountName: isMobile ? "" : "নূরানী তালিমুল কুরআন বোর্ড খুলনা",
        accountType: isMobile ? "পার্সোনাল" : "চলতি হিসাব",
        branch: isMobile ? undefined : "খুলনা শাখা",
        routingNo: isMobile ? undefined : "",
        qrCodeImage: "",
        instructions: isMobile
          ? "Send Money করে প্রেরক নম্বর ও TrxID প্রদান করুন।"
          : "ব্যাংক অ্যাকাউন্ট ডিপোজিট বা অনলাইন ট্রান্সফার করে স্লিপ বা রেফারেন্স নম্বর প্রদান করুন।",
        isActive: true,
        sortOrder: prev.length + 1,
      },
    ]);
  };

  if (isLoading) {
    return <div className="py-12 text-center text-slate-500 text-sm">পেমেন্ট মাধ্যম লোড হচ্ছে...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">ডায়নামিক পেমেন্ট মেথড ও QR কোড ব্যবস্থাপনা</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            বিকাশ, নগদ, রকেট এবং ব্যাংকসমূহ (ইসলামী ব্যাংক, ডাচ-বাংলা ব্যাংক ইত্যাদি) যেকোনো সময় পরিবর্তন, চালু/বন্ধ এবং QR কোডের ছবি আপলোড করতে পারবেন।
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={() => addMethod("mobile")}
            className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" /> + মোবাইল ব্যাংকিং
          </button>
          <button
            type="button"
            onClick={() => addMethod("bank")}
            className="flex items-center gap-1.5 text-xs text-blue-800 font-bold bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl border border-blue-200 transition-colors cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5" /> + ব্যাংক অ্যাকাউন্ট
          </button>
        </div>
      </div>

      {/* Quick Add Bank / Mobile Chips */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
        <span className="font-bold text-slate-600 mr-1">দ্রুত যুক্ত করুন:</span>
        {MOBILE_PRESETS.map((preset) => (
          <button
            key={`mob_${preset}`}
            type="button"
            onClick={() => addMethod("mobile", preset)}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-pink-50 text-pink-800 border border-pink-200 font-bold transition-colors cursor-pointer"
          >
            + {preset}
          </button>
        ))}
        {BANK_PRESETS.map((preset) => (
          <button
            key={`bank_${preset}`}
            type="button"
            onClick={() => addMethod("bank", preset)}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-blue-800 border border-blue-200 font-bold transition-colors cursor-pointer"
          >
            + {preset}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {payments.map((payment, i) => {
          const isMobile = payment.type === "mobile" || payment.type === "MOBILE_BANKING";
          const isActive = payment.isActive !== false;
          const displayName = payment.name ?? payment.provider ?? "";

          return (
            <div
              key={payment.id || i}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isActive ? "bg-white border-slate-200 shadow-xs" : "bg-slate-50 border-slate-200 opacity-65"
              }`}
            >
              {/* Header row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={i === 0}
                      onClick={() => handleMove(i, "up")}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100 cursor-pointer"
                      title="উপরে নিন"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={i === payments.length - 1}
                      onClick={() => handleMove(i, "down")}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100 cursor-pointer"
                      title="নিচে নিন"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <select
                    value={isMobile ? "mobile" : "bank"}
                    onChange={(e) => {
                      const nextType = e.target.value;
                      const newP = [...payments];
                      newP[i] = { ...newP[i], type: nextType };
                      setPayments(newP);
                    }}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border-0 cursor-pointer focus:outline-none ${
                      isMobile ? "bg-pink-100 text-pink-800" : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    <option value="mobile">মোবাইল ব্যাংকিং</option>
                    <option value="bank">ব্যাংক অ্যাকাউন্ট</option>
                  </select>

                  <span className="font-extrabold text-sm text-slate-800">
                    {displayName || "নতুন পেমেন্ট মাধ্যম"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newP = [...payments];
                      newP[i] = { ...newP[i], isActive: !isActive };
                      setPayments(newP);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                      isActive
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    }`}
                  >
                    {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{isActive ? "সচল (Active)" : "বন্ধ (Inactive)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayments(payments.filter((_, idx) => idx !== i))}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isMobile ? "মোবাইল ব্যাংকিংয়ের নাম" : "ব্যাংকের নাম"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => {
                      const val = e.target.value;
                      const newP = [...payments];
                      newP[i] = { ...newP[i], name: val, provider: val };
                      setPayments(newP);
                    }}
                    placeholder={isMobile ? "যেমন: বিকাশ / নগদ / রকেট" : "যেমন: ইসলামী ব্যাংক / ডাচ-বাংলা ব্যাংক"}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isMobile ? "মোবাইল নম্বর" : "ব্যাংক অ্যাকাউন্ট নম্বর"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={payment.accountNumber}
                    onChange={(e) => {
                      const newP = [...payments];
                      newP[i] = { ...newP[i], accountNumber: e.target.value };
                      setPayments(newP);
                    }}
                    placeholder={isMobile ? "017XXXXXXXX" : "2050XXXXXXXXXXXXX"}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">অ্যাকাউন্টের ধরন / টাইপ</label>
                  <input
                    type="text"
                    value={payment.accountType || ""}
                    onChange={(e) => {
                      const newP = [...payments];
                      newP[i] = { ...newP[i], accountType: e.target.value };
                      setPayments(newP);
                    }}
                    placeholder={isMobile ? "পার্সোনাল / মার্চেন্ট / এজেন্ট" : "চলতি হিসাব / সঞ্চয়ী হিসাব"}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">অ্যাকাউন্টধারীর নাম (Account Name)</label>
                  <input
                    type="text"
                    value={payment.accountName || ""}
                    onChange={(e) => {
                      const newP = [...payments];
                      newP[i] = { ...newP[i], accountName: e.target.value };
                      setPayments(newP);
                    }}
                    placeholder="নূরানী তালিমুল কুরআন বোর্ড খুলনা"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>

                {!isMobile && (
                  <>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">শাখার নাম (Branch)</label>
                      <input
                        type="text"
                        value={payment.branch || ""}
                        onChange={(e) => {
                          const newP = [...payments];
                          newP[i] = { ...newP[i], branch: e.target.value };
                          setPayments(newP);
                        }}
                        placeholder="খুলনা প্রধান শাখা"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">রাউটিং নম্বর (Routing No)</label>
                      <input
                        type="text"
                        value={payment.routingNo || ""}
                        onChange={(e) => {
                          const newP = [...payments];
                          newP[i] = { ...newP[i], routingNo: e.target.value };
                          setPayments(newP);
                        }}
                        placeholder="125271822"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                      />
                    </div>
                  </>
                )}

                <div className="col-span-1 md:col-span-3">
                  <label className="block font-bold text-slate-700 mb-1">পেমেন্ট নির্দেশনা (গ্রাহকের জন্য)</label>
                  <input
                    type="text"
                    value={payment.instructions || ""}
                    onChange={(e) => {
                      const newP = [...payments];
                      newP[i] = { ...newP[i], instructions: e.target.value };
                      setPayments(newP);
                    }}
                    placeholder="যেমন: Send Money করুন এবং TrxID ও প্রেরক নম্বর লিখুন।"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium text-xs"
                  />
                </div>

                {/* Prominent QR Code & Logo Upload Section */}
                <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                  {/* QR Code Upload Card */}
                  <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80 flex items-center gap-3.5">
                    <div className="w-20 h-20 rounded-xl border border-emerald-200 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                      {payment.qrCodeImage ? (
                        <img
                          src={payment.qrCodeImage}
                          alt="QR Code"
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <QrCode className="w-8 h-8 text-emerald-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <p className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                        <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                        <span>কিউআর কোড (QR Code) ছবি</span>
                      </p>
                      <p className="text-[10.5px] text-slate-500 leading-snug">
                        গ্রাহক স্ক্যান করে সরাসরি পেমেন্ট করতে পারবেন।
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <label className="cursor-pointer bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg font-bold text-[11px] inline-flex items-center gap-1.5 transition-colors">
                          <Upload className="w-3 h-3" />
                          <span>
                            {uploadingKey === `${i}_qrCodeImage`
                              ? "আপলোড হচ্ছে..."
                              : payment.qrCodeImage
                              ? "QR পরিবর্তন"
                              : "QR ছবি আপলোড"}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingKey === `${i}_qrCodeImage`}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, i, "qrCodeImage");
                              e.target.value = "";
                            }}
                          />
                        </label>
                        {payment.qrCodeImage && (
                          <button
                            type="button"
                            onClick={() => {
                              const newP = [...payments];
                              newP[i] = { ...newP[i], qrCodeImage: "" };
                              setPayments(newP);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[11px] cursor-pointer"
                          >
                            মুছুন
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Logo Upload Card */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3.5">
                    <div className="w-16 h-16 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                      {payment.logo ? (
                        <img
                          src={payment.logo}
                          alt="Logo"
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <p className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                        <ImageIcon className="w-3.5 h-3.5 text-blue-700" />
                        <span>লোগো / আইকন ছবি (ঐচ্ছিক)</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <label className="cursor-pointer bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg font-bold text-[11px] inline-flex items-center gap-1.5 transition-colors">
                          <Upload className="w-3 h-3" />
                          <span>
                            {uploadingKey === `${i}_logo`
                              ? "আপলোড হচ্ছে..."
                              : payment.logo
                              ? "লোগো পরিবর্তন"
                              : "লোগো আপলোড"}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingKey === `${i}_logo`}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, i, "logo");
                              e.target.value = "";
                            }}
                          />
                        </label>
                        {payment.logo && (
                          <button
                            type="button"
                            onClick={() => {
                              const newP = [...payments];
                              newP[i] = { ...newP[i], logo: "" };
                              setPayments(newP);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[11px] cursor-pointer"
                          >
                            মুছুন
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {payments.length === 0 && (
          <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl">
            <p className="text-slate-400 italic text-sm">কোনো পেমেন্ট মাধ্যম পাওয়া যায়নি। উপরে বাটন চাপুন।</p>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-200 flex justify-end sticky bottom-0 bg-white/95 backdrop-blur-xs py-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "সংরক্ষণ হচ্ছে..." : "পেমেন্ট মাধ্যমসমূহ সংরক্ষণ করুন"}
        </button>
      </div>
    </div>
  );
}

export function DeliveryOptionsManager({ onSaved }: { onSaved?: () => void }) {
  const [category, setCategory] = useState<"book" | "question">("book");
  const [options, setOptions] = useState<DynamicDeliveryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchOptions(category);
  }, [category]);

  const fetchOptions = async (cat: "book" | "question") => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/delivery-options?category=${cat}&t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setOptions(data);
      }
    } catch {
      toast.error("ডেলিভারি অপশন লোড করতে ব্যর্থ হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/delivery-options?category=${category}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });
      if (res.ok) {
        toast.success(
          category === "book"
            ? "বই ও স্টেশনারি ডেলিভারি অপশন সফলভাবে সংরক্ষিত হয়েছে!"
            : "প্রশ্নপত্র ডেলিভারি অপশন সফলভাবে সংরক্ষিত হয়েছে!"
        );
        await fetchOptions(category);
        onSaved?.();
      } else {
        throw new Error();
      }
    } catch {
      toast.error("সংরক্ষণ করতে ব্যর্থ হয়েছে");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-3 border-b border-slate-200">
        <h3 className="text-base sm:text-lg font-bold text-slate-800">ডেলিভারি অপশন ও চার্জ ব্যবস্থাপনা</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          বই এবং প্রশ্নপত্র অর্ডারের জন্য পৃথক ডেলিভারি চার্জ ও মাধ্যম (পাঠাও, স্টীডফাস্ট, নিজে, অন্যান্য কুরিয়ার, ট্রান্সপোর্ট) কনফিগার করুন।
        </p>
      </div>

      {/* Category Toggle: বই বনাম প্রশ্ন বাটন */}
      <div className="flex items-center gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => setCategory("book")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            category === "book"
              ? "bg-[#095738] text-white shadow-md"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>১। বই ও স্টেশনারি ডেলিভারি চার্জ</span>
        </button>

        <button
          type="button"
          onClick={() => setCategory("question")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            category === "question"
              ? "bg-[#095738] text-white shadow-md"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <FileQuestion className="w-4 h-4" />
          <span>২। প্রশ্নপত্র ডেলিভারি চার্জ</span>
        </button>
      </div>

      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
        <p className="font-bold flex items-center gap-1.5">
          <span>📌</span>
          <span>
            বর্তমান সক্রিয় অপশন:{" "}
            {category === "book" ? "বই ও স্টেশনারি ডেলিভারি" : "প্রশ্নপত্র ডেলিভারি"} (মোট ৫টি মাধ্যম)
          </span>
        </p>
        <p className="text-[11px] text-amber-800">
          • <strong>পাঠাও</strong> ও <strong>স্টীডফাস্ট</strong>: বিলে <em>"চার্জ কুরিয়ার বাহককে"</em> প্রদর্শিত হবে (অনলাইন বিলে ডেলিভারি চার্জ ৳০)।
          <br />
          • <strong>নিজে</strong>: বিলে <em>"চার্জ নাই"</em> প্রদর্শিত হবে (চার্জ ৳০)।
          <br />
          • <strong>অন্যান্য কুরিয়ার</strong> ও <strong>ট্রান্সপোর্ট</strong>: নির্দিষ্ট চার্জ বিলের সাথে যোগ হবে এবং গ্রাহক নির্দিষ্ট সার্ভিসের নাম লিখবেন।
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-500 text-sm">ডেলিভারি তথ্য লোড হচ্ছে...</div>
      ) : (
        <div className="space-y-4">
          {options.map((opt, i) => {
            const isPathaoOrSteadfast = opt.type === "pathao" || opt.type === "steadfast";
            const isSelf = opt.type === "self";

            return (
              <div
                key={opt.type || i}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-700" />
                    <span className="font-extrabold text-sm text-slate-800">{opt.name}</span>
                    <span className="text-[11px] font-mono text-slate-400">({opt.type})</span>
                    {isPathaoOrSteadfast && (
                      <span className="text-[10.5px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-200">
                        বিলে: "চার্জ কুরিয়ার বাহককে"
                      </span>
                    )}
                    {isSelf && (
                      <span className="text-[10.5px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-bold border border-blue-200">
                        বিলে: "চার্জ নাই"
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newO = [...options];
                      newO[i] = { ...newO[i], isActive: opt.isActive === false ? true : false };
                      setOptions(newO);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                      opt.isActive !== false
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    }`}
                  >
                    {opt.isActive !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{opt.isActive !== false ? "সচল (Active)" : "বন্ধ (Inactive)"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">বাটনের নাম (Display Name)</label>
                    <input
                      type="text"
                      value={opt.name}
                      onChange={(e) => {
                        const newO = [...options];
                        newO[i] = { ...newO[i], name: e.target.value };
                        setOptions(newO);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      যুক্ত বিল / চার্জ (টাকা ৳)
                      {isPathaoOrSteadfast && (
                        <span className="text-[10px] text-slate-400 font-normal ml-1">
                          (কুরিয়ার বাহক সরাসরি নেবে)
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={opt.charge}
                      disabled={isPathaoOrSteadfast || isSelf}
                      onChange={(e) => {
                        const newO = [...options];
                        newO[i] = { ...newO[i], charge: Math.max(0, Number(e.target.value) || 0) };
                        setOptions(newO);
                      }}
                      className={`w-full px-3 py-2 rounded-xl border font-mono font-bold ${
                        isPathaoOrSteadfast || isSelf
                          ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                          : "border-slate-200 focus:outline-none focus:border-emerald-500"
                      }`}
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={Boolean(opt.requiresName)}
                        disabled={isPathaoOrSteadfast || isSelf}
                        onChange={(e) => {
                          const newO = [...options];
                          newO[i] = { ...newO[i], requiresName: e.target.checked };
                          setOptions(newO);
                        }}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="font-bold text-slate-700 text-xs">কুরিয়ার/ট্রান্সপোর্টের নাম লেখা বাধ্যতামূলক?</span>
                    </label>
                  </div>

                  <div className="col-span-1 md:col-span-3">
                    <label className="block font-bold text-slate-700 mb-1">বিবরণ / প্লেসহোল্ডার নির্দেশনা</label>
                    <input
                      type="text"
                      value={opt.description || ""}
                      onChange={(e) => {
                        const newO = [...options];
                        newO[i] = { ...newO[i], description: e.target.value };
                        setOptions(newO);
                      }}
                      placeholder="যেমন: সুন্দরবন, এস এ পরিবহন ইত্যাদি"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-4 border-t border-slate-200 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "সংরক্ষণ হচ্ছে..." : `${category === "book" ? "বইয়ের" : "প্রশ্নের"} ডেলিভারি অপশন সংরক্ষণ করুন`}
        </button>
      </div>
    </div>
  );
}

export function CommissionsManager({ onSaved }: { onSaved?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bookRetailPercent, setBookRetailPercent] = useState<number>(0);
  const [bookMadrasaPercent, setBookMadrasaPercent] = useState<number>(10);
  const [bookDefaultAgentPercent, setBookDefaultAgentPercent] = useState<number>(15);
  const [questionPercent, setQuestionPercent] = useState<number>(15);
  const [questionEnabled, setQuestionEnabled] = useState<boolean>(true);
  const [customAgents, setCustomAgents] = useState<any[]>([]);

  // Add agent form state
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentPhone, setNewAgentPhone] = useState("");
  const [newAgentCode, setNewAgentCode] = useState("");
  const [newAgentBookPercent, setNewAgentBookPercent] = useState<number>(20);
  const [newAgentQuestionPercent, setNewAgentQuestionPercent] = useState<number>(15);
  const [newAgentNotes, setNewAgentNotes] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/store/commissions?t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      if (data) {
        setBookRetailPercent(data.bookRetailCommissionPercent ?? 0);
        setBookMadrasaPercent(data.bookMadrasaCommissionPercent ?? 10);
        setBookDefaultAgentPercent(data.bookDefaultAgentCommissionPercent ?? 15);
        setQuestionPercent(data.questionCommissionPercent ?? 15);
        setQuestionEnabled(data.questionCommissionEnabled ?? true);
        setCustomAgents(Array.isArray(data.customAgents) ? data.customAgents : []);
      }
    } catch {
      toast.error("কমিশন তথ্য লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/store/commissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookRetailCommissionPercent: bookRetailPercent,
          bookMadrasaCommissionPercent: bookMadrasaPercent,
          bookDefaultAgentCommissionPercent: bookDefaultAgentPercent,
          questionCommissionPercent: questionPercent,
          questionCommissionEnabled: questionEnabled,
          customAgents,
        }),
      });
      if (res.ok) {
        toast.success("কমিশন নীতিমালা ও জিম্মাদার তালিকা সফলভাবে সংরক্ষিত হয়েছে!");
        await fetchCommissions();
        onSaved?.();
      } else {
        throw new Error();
      }
    } catch {
      toast.error("সংরক্ষণ ব্যর্থ হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  const handleAddAgent = () => {
    if (!newAgentName.trim()) {
      toast.error("জিম্মাদার/এজেন্টের নাম লিখুন");
      return;
    }
    if (!newAgentPhone.trim()) {
      toast.error("মোবাইল নম্বর লিখুন");
      return;
    }

    const newAgent = {
      id: `agent_${Date.now()}`,
      name: newAgentName.trim(),
      phone: newAgentPhone.trim(),
      code: newAgentCode.trim() || undefined,
      bookCommissionPercent: Number(newAgentBookPercent) || 0,
      questionCommissionPercent: Number(newAgentQuestionPercent) || 0,
      isActive: true,
      notes: newAgentNotes.trim() || undefined,
    };

    setCustomAgents((prev) => [newAgent, ...prev]);
    setNewAgentName("");
    setNewAgentPhone("");
    setNewAgentCode("");
    setNewAgentBookPercent(20);
    setNewAgentQuestionPercent(15);
    setNewAgentNotes("");
    setShowAddForm(false);
    toast.success("নতুন জিম্মাদার যোগ করা হয়েছে! সংরক্ষণ বাটনে চাপুন।");
  };

  const handleRemoveAgent = (id: string) => {
    setCustomAgents((prev) => prev.filter((a) => a.id !== id));
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-500 text-sm">কমিশন তথ্য লোড হচ্ছে...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-3 border-b border-slate-200">
        <h3 className="text-base sm:text-lg font-bold text-slate-800">কমিশন নীতিমালা ও জিম্মাদার তালিকা ব্যবস্থাপনা</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          বই ও প্রশ্ন অর্ডারের ক্ষেত্রে জিম্মাদার/এজেন্ট, মাদরাসা এবং খুচরা ক্রেতাদের জন্য পৃথক ও পরিবর্তনশীল কমিশন হার নির্ধারণ করুন।
        </p>
      </div>

      {/* 1. বই এর কমিশন নীতিমালা */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
          <BookOpen className="w-4 h-4 text-emerald-700" />
          <h4 className="font-extrabold text-sm text-slate-800">১। বই ও স্টেশনারি কমিশন হার</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <label className="block font-bold text-slate-700">
              খুচরা ক্রেতা কমিশন (%) <span className="text-slate-400 font-normal">(সাধারণ ক্রেতা)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={bookRetailPercent}
                onChange={(e) => setBookRetailPercent(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-emerald-600 font-bold bg-white"
                placeholder="0"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
            </div>
            <p className="text-[10.5px] text-slate-500">ডিফল্ট: ০% (প্রয়োজনে ছাড় দিতে পারবেন)</p>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-1.5">
            <label className="block font-bold text-blue-950">
              মাদরাসা কমিশন (%) <span className="text-blue-700 font-normal">(মাদরাসা গ্রাহক)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={bookMadrasaPercent}
                onChange={(e) => setBookMadrasaPercent(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-emerald-600 font-bold bg-white"
                placeholder="10"
              />
              <span className="absolute right-3 top-2.5 text-xs text-blue-400 font-bold">%</span>
            </div>
            <p className="text-[10.5px] text-blue-700">মাদরাসা ইলহাক কোড বা নামে অর্ডার করলে প্রযোজ্য</p>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1.5">
            <label className="block font-bold text-amber-950">
              ডিফল্ট জিম্মাদার কমিশন (%) <span className="text-amber-700 font-normal">(এজেন্ট)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={bookDefaultAgentPercent}
                onChange={(e) => setBookDefaultAgentPercent(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-amber-200 rounded-lg focus:outline-emerald-600 font-bold bg-white"
                placeholder="15"
              />
              <span className="absolute right-3 top-2.5 text-xs text-amber-500 font-bold">%</span>
            </div>
            <p className="text-[10.5px] text-amber-800">যাদের ব্যক্তিগত বিশেষ হার নেই তাদের জন্য</p>
          </div>
        </div>
      </div>

      {/* 2. প্রশ্নপত্র কমিশন নীতিমালা */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileQuestion className="w-4 h-4 text-emerald-700" />
            <h4 className="font-extrabold text-sm text-slate-800">২। প্রশ্নপত্র কমিশন হার (শুধু জিম্মাদার)</h4>
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <input
              type="checkbox"
              checked={questionEnabled}
              onChange={(e) => setQuestionEnabled(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <span>প্রশ্নপত্র কমিশন সুবিধা সক্রিয়</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">
              প্রশ্নপত্র কমিশন হার (%) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={questionPercent}
                onChange={(e) => setQuestionPercent(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-emerald-600 font-bold bg-white"
                placeholder="15"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
            </div>
            <p className="text-[10.5px] text-slate-500">
              প্রশ্নের অর্ডারে যে জিম্মাদারের আইডি/মোবাইল রেফারেন্স ব্যবহার করা হবে, তিনি এই হারে কমিশন পাবেন।
            </p>
          </div>

          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex flex-col justify-center">
            <span className="font-bold flex items-center gap-1.5">
              <span>💡</span>
              <span>তাশকিল ও রেফারেল নিয়ম:</span>
            </span>
            <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
              কেন্দ্র জিম্মাদার নিজে একাধিক মাদরাসার প্রশ্ন একসাথে না নিয়ে, মাদরাসাগুলোকে সরাসরি অর্ডার করতে তাশকিল করবেন। মাদরাসা অর্ডার করার সময় জিম্মাদারের আইডি বা মোবাইল নম্বর দিলে জিম্মাদার স্বয়ংক্রিয়ভাবে কমিশন পাবেন।
            </p>
          </div>
        </div>
      </div>

      {/* 3. স্বতন্ত্র জিম্মাদার / এজেন্ট তালিকা ও কাস্টম কমিশন হার */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-700" />
            <div>
              <h4 className="font-extrabold text-sm text-slate-800">
                ৩। স্বতন্ত্র জিম্মাদার / এজেন্ট তালিকা ও বিশেষ কমিশন হার
              </h4>
              <p className="text-[11px] text-slate-500">
                সব জিম্মাদারকে সমান হারে না দিয়ে কারো জন্য কম-বেশি কমিশন সেট করুন।
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#095738] hover:bg-[#07472d] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? "ফর্ম বন্ধ করুন" : "নতুন জিম্মাদার যোগ করুন"}</span>
          </button>
        </div>

        {/* Add Agent Form */}
        {showAddForm && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in">
            <h5 className="font-bold text-xs text-slate-800">নতুন কেন্দ্র জিম্মাদার / এজেন্ট নিবন্ধন</h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  জিম্মাদারের নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="যেমন: মাওলানা আবদুর রহমান"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  মোবাইল নম্বর <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={newAgentPhone}
                  onChange={(e) => setNewAgentPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">এজেন্ট আইডি / কোড (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={newAgentCode}
                  onChange={(e) => setNewAgentCode(e.target.value)}
                  placeholder="যেমন: AG-105"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">বই কমিশন হার (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={newAgentBookPercent}
                  onChange={(e) => setNewAgentBookPercent(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-bold focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">প্রশ্ন কমিশন হার (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={newAgentQuestionPercent}
                  onChange={(e) => setNewAgentQuestionPercent(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-bold focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">নোট / এলাকা (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={newAgentNotes}
                  onChange={(e) => setNewAgentNotes(e.target.value)}
                  placeholder="যেমন: খুলনা জিলা কেন্দ্র"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-emerald-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleAddAgent}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                যোগ করুন
              </button>
            </div>
          </div>
        )}

        {/* Custom Agents Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3">জিম্মাদারের নাম</th>
                <th className="py-2.5 px-3">মোবাইল ও কোড</th>
                <th className="py-2.5 px-3 text-center">বই কমিশন (%)</th>
                <th className="py-2.5 px-3 text-center">প্রশ্ন কমিশন (%)</th>
                <th className="py-2.5 px-3">এলাকা / নোট</th>
                <th className="py-2.5 px-3 text-center">স্ট্যাটাস</th>
                <th className="py-2.5 px-3 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customAgents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400 italic">
                    কোনো স্বতন্ত্র জিম্মাদার তালিকাভুক্ত নেই। সাধারণ জিম্মাদার কমিশন প্রযোজ্য হবে।
                  </td>
                </tr>
              ) : (
                customAgents.map((agent, idx) => (
                  <tr key={agent.id || idx} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-bold text-slate-800">{agent.name}</td>
                    <td className="py-2.5 px-3 font-mono">
                      <div>{agent.phone}</div>
                      {agent.code && <span className="text-[10px] text-slate-400 font-semibold">{agent.code}</span>}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={agent.bookCommissionPercent}
                        onChange={(e) => {
                          const updated = [...customAgents];
                          updated[idx] = {
                            ...updated[idx],
                            bookCommissionPercent: Number(e.target.value) || 0,
                          };
                          setCustomAgents(updated);
                        }}
                        className="w-16 px-1.5 py-1 border border-slate-200 rounded text-center font-bold text-emerald-700 bg-white"
                      />
                      <span className="ml-0.5 text-slate-400 font-bold">%</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={agent.questionCommissionPercent ?? questionPercent}
                        onChange={(e) => {
                          const updated = [...customAgents];
                          updated[idx] = {
                            ...updated[idx],
                            questionCommissionPercent: Number(e.target.value) || 0,
                          };
                          setCustomAgents(updated);
                        }}
                        className="w-16 px-1.5 py-1 border border-slate-200 rounded text-center font-bold text-blue-700 bg-white"
                      />
                      <span className="ml-0.5 text-slate-400 font-bold">%</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{agent.notes || "—"}</td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...customAgents];
                          updated[idx] = { ...updated[idx], isActive: !updated[idx].isActive };
                          setCustomAgents(updated);
                        }}
                        className={`px-2 py-0.5 rounded text-[10.5px] font-bold cursor-pointer ${
                          agent.isActive !== false
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {agent.isActive !== false ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveAgent(agent.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                        title="মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {saving ? "সংরক্ষণ হচ্ছে..." : "কমিশন নীতিমালা সংরক্ষণ করুন"}
        </button>
      </div>
    </div>
  );
}

export function PaymentDeliverySettingsModal({
  open,
  onClose,
  defaultTab = "payments",
}: {
  open: boolean;
  onClose: () => void;
  defaultTab?: "payments" | "delivery" | "commissions";
}) {
  const [tab, setTab] = useState<"payments" | "delivery" | "commissions">(defaultTab);

  useEffect(() => {
    if (open) setTab(defaultTab);
  }, [open, defaultTab]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 sm:px-6 py-3.5 bg-[#095738] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">অর্ডার পেমেন্ট, ডেলিভারি ও কমিশন সেটিংস</h3>
              <p className="text-[11px] text-emerald-100">
                পেমেন্ট অ্যাকাউন্ট, কিউআর কোড, বই ও প্রশ্নপত্রের ৫টি ডেলিভারি মাধ্যম এবং জিম্মাদার কমিশন নীতিমালা
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 sm:px-6 pt-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setTab("payments")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              tab === "payments"
                ? "bg-white text-[#095738] border-[#095738]"
                : "text-slate-600 border-transparent hover:text-slate-900"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>পেমেন্ট মাধ্যম ও QR কোড</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("delivery")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              tab === "delivery"
                ? "bg-white text-[#095738] border-[#095738]"
                : "text-slate-600 border-transparent hover:text-slate-900"
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>ডেলিভারি মাধ্যম ও চার্জ (বই ও প্রশ্ন)</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("commissions")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              tab === "commissions"
                ? "bg-white text-[#095738] border-[#095738]"
                : "text-slate-600 border-transparent hover:text-slate-900"
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>কমিশন নীতিমালা ও জিম্মাদার তালিকা</span>
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {tab === "payments" && <PaymentMethodsManager />}
          {tab === "delivery" && <DeliveryOptionsManager />}
          {tab === "commissions" && <CommissionsManager />}
        </div>
      </div>
    </div>
  );
}

