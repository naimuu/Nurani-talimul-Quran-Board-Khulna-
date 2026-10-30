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
  const [options, setOptions] = useState<DynamicDeliveryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/delivery-options?t=${Date.now()}`, { cache: "no-store" });
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
      const res = await fetch("/api/delivery-options", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });
      if (res.ok) {
        toast.success("ডেলিভারি অপশন ও চার্জ সফলভাবে সংরক্ষিত হয়েছে!");
        await fetchOptions();
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

  if (isLoading) {
    return <div className="py-12 text-center text-slate-500 text-sm">ডেলিভারি তথ্য লোড হচ্ছে...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-3 border-b border-slate-200">
        <h3 className="text-base sm:text-lg font-bold text-slate-800">ডেলিভারি অপশন ও চার্জ ব্যবস্থাপনা</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          অর্ডার চেকআউটের সময় গ্রাহক এই ৪টি বাটন (পাঠাও, স্টিডফাস্ট, অন্যান্য কুরিয়ার, ট্রান্সপোর্ট) দেখতে পাবেন এবং চার্জ ডায়নামিকভাবে বিলের সাথে যুক্ত হবে।
        </p>
      </div>

      <div className="space-y-4">
        {options.map((opt, i) => (
          <div key={opt.type || i} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-700" />
                <span className="font-extrabold text-sm text-slate-800">{opt.name}</span>
                <span className="text-[11px] font-mono text-slate-400">({opt.type})</span>
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
                <label className="block font-bold text-slate-700 mb-1">যুক্ত বিল / চার্জ (টাকা ৳)</label>
                <input
                  type="number"
                  min={0}
                  value={opt.charge}
                  onChange={(e) => {
                    const newO = [...options];
                    newO[i] = { ...newO[i], charge: Math.max(0, Number(e.target.value) || 0) };
                    setOptions(newO);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(opt.requiresName)}
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
        ))}
      </div>

      <div className="pt-4 border-t border-slate-200 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "সংরক্ষণ হচ্ছে..." : "ডেলিভারি অপশন সংরক্ষণ করুন"}
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
  defaultTab?: "payments" | "delivery";
}) {
  const [tab, setTab] = useState<"payments" | "delivery">(defaultTab);

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
              <h3 className="font-bold text-sm sm:text-base">অর্ডার পেমেন্ট ও ডেলিভারি সেটিংস</h3>
              <p className="text-[11px] text-emerald-100">
                বিকাশ, নগদ, রকেট, ৩টি ব্যাংক অ্যাকাউন্ট, QR কোড এবং ডেলিভারি চার্জ ডায়নামিকভাবে নিয়ন্ত্রণ করুন
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

        <div className="px-4 sm:px-6 pt-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setTab("payments")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
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
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              tab === "delivery"
                ? "bg-white text-[#095738] border-[#095738]"
                : "text-slate-600 border-transparent hover:text-slate-900"
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>ডেলিভারি অপশন ও চার্জ</span>
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {tab === "payments" ? <PaymentMethodsManager /> : <DeliveryOptionsManager />}
        </div>
      </div>
    </div>
  );
}

