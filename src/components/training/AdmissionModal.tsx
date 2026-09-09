"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Upload, 
  Printer, 
  Copy, 
  AlertCircle, 
  Loader2, 
  Check, 
  BookOpen, 
  X,
  Info,
  Sparkles
} from "lucide-react";
import GeoAddressSelector from "@/components/common/GeoAddressSelector";

export interface BatchOption {
  id: string;
  _id?: string;
  medium: "bangla" | "arabic";
  title: string;
  subtitle: string;
  badge?: string;
  durationDays: string;
  price: string;
  location: string;
  date: string;
  batch: string;
  phone: string;
  link?: string;
  regLink?: string;
  coverImage?: string;
}

interface AdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId?: string;
  medium?: "bangla" | "arabic" | string;
}

const getPaymentDetailsConfig = (method: string) => {
  switch (method) {
    case "বিকাশ":
      return {
        trxLabel: "বিকাশ ট্রানজেকশন আইডি (TrxID)",
        trxPlaceholder: "উদাঃ 9H87G6F5",
        phoneLabel: "প্রেরক বিকাশ নম্বর",
        phonePlaceholder: "যে বিকাশ নম্বর থেকে টাকা পাঠানো হয়েছে",
        note: "* বোর্ডের বিকাশ নম্বরে কোর্স ফি পাঠিয়ে প্রাপ্ত ট্রানজেকশন আইডি (TrxID) ও প্রেরক নম্বর লিখুন।"
      };
    case "নগদ":
      return {
        trxLabel: "নগদ ট্রানজেকশন আইডি (TrxID)",
        trxPlaceholder: "উদাঃ 9H87G6F5",
        phoneLabel: "প্রেরক নগদ নম্বর",
        phonePlaceholder: "যে নগদ নম্বর থেকে টাকা পাঠানো হয়েছে",
        note: "* বোর্ডের নগদ নম্বরে কোর্স ফি পাঠিয়ে প্রাপ্ত ট্রানজেকশন আইডি (TrxID) ও প্রেরক নম্বর লিখুন।"
      };
    case "রকেট":
      return {
        trxLabel: "রকেট ট্রানজেকশন আইডি (TrxID)",
        trxPlaceholder: "উদাঃ 9H87G6F5",
        phoneLabel: "প্রেরক রকেট নম্বর",
        phonePlaceholder: "যে রকেট নম্বর থেকে টাকা পাঠানো হয়েছে",
        note: "* বোর্ডের রকেট নম্বরে কোর্স ফি পাঠিয়ে মেসেজে প্রাপ্ত ট্রানজেকশন আইডি (TrxID) ও প্রেরক নম্বর লিখুন।"
      };
    case "ব্যাংক":
      return {
        trxLabel: "ব্যাংক ডিপোজিট স্লিপ নং / রেফারেন্স নং",
        trxPlaceholder: "উদাঃ ডিপোজিট স্লিপ নং বা রেফারেন্স আইডি",
        phoneLabel: "প্রেরক / হিসাবধারীর মোবাইল নম্বর",
        phonePlaceholder: "ব্যাংক জমাকারীর যোগাযোগের মোবাইল নম্বর",
        note: "* ব্যাংকে নির্ধারিত একাউন্টে কোর্স ফি জমা দিয়ে ডিপোজিট স্লিপ নম্বর ও হিসাবধারীর মোবাইল নম্বর দিন।"
      };
    case "অফিসে নগদ জমা":
    default:
      return {
        trxLabel: "রশিদ নং / মানি রিসিট নং (যদি থাকে)",
        trxPlaceholder: "উদাঃ রশিদ নম্বর বা ভাউচার নং",
        phoneLabel: "যোগাযোগের মোবাইল নম্বর",
        phonePlaceholder: "আবেদনকারীর যোগাযোগের মোবাইল নম্বর",
        note: "* অফিসে সরাসরি নগদ পরিশোধ করতে চাইলে অফিসে উপস্থিত হয়ে ফি জমা দিয়ে মানি রিসিট সংগ্রহ করুন।"
      };
  }
};

export default function AdmissionModal({
  isOpen,
  onClose,
  batchId,
  medium
}: AdmissionModalProps) {
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [selectedBatchId, setSelectedBatchId] = useState<string>(batchId || "");

  const [formData, setFormData] = useState({
    applicantName: "",
    applicantNameEn: "",
    fatherName: "",
    motherName: "",
    phone: "",
    emergencyPhone: "",
    nidOrBirthCert: "",
    dateOfBirth: "",
    bloodGroup: "",
    gender: "পুরুষ",
    education: "দাওরায়ে হাদীস (মাস্টার্স সমমান)",
    currentMadrasa: "",
    division: "খুলনা",
    district: "",
    upazila: "",
    union: "",
    village: "",
    postOffice: "",
    paymentMethod: "বিকাশ",
    transactionId: "",
    paymentAmount: "",
    paymentPhone: "",
    photoUrl: ""
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch batches when modal opens
  useEffect(() => {
    if (!isOpen) return;

    async function loadBatches() {
      try {
        setLoadingBatches(true);
        const res = await fetch("/api/training/batches");
        if (res.ok) {
          const data = await res.json();
          const activeList = (data.batches || []).filter((b: any) => b.isActive !== false);
          setBatches(activeList);

          if (batchId) {
            const found = activeList.find((b: any) => (b.id === batchId || b._id === batchId));
            if (found) {
              setSelectedBatchId(found.id || found._id);
              setFormData(prev => ({ ...prev, paymentAmount: found.price }));
              return;
            }
          }

          if (medium) {
            const foundByMedium = activeList.find((b: any) => b.medium === medium);
            if (foundByMedium) {
              setSelectedBatchId(foundByMedium.id || foundByMedium._id);
              setFormData(prev => ({ ...prev, paymentAmount: foundByMedium.price }));
              return;
            }
          }

          if (activeList.length > 0 && !selectedBatchId) {
            setSelectedBatchId(activeList[0].id || activeList[0]._id);
            setFormData(prev => ({ ...prev, paymentAmount: activeList[0].price }));
          }
        }
      } catch (err) {
        console.error("Failed to load batches:", err);
      } finally {
        setLoadingBatches(false);
      }
    }

    loadBatches();
  }, [isOpen, batchId, medium]);

  const selectedBatch = batches.find(b => (b.id === selectedBatchId || b._id === selectedBatchId)) || batches[0];

  const handleSelectBatch = (bId?: string) => {
    if (!bId) return;
    setSelectedBatchId(bId);
    const chosen = batches.find(b => (b.id === bId || b._id === bId));
    if (chosen) {
      setFormData(prev => ({ ...prev, paymentAmount: chosen.price }));
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("ছবির সাইজ সর্বোচ্চ 2MB হতে পারবে");
      return;
    }

    try {
      setUploadingPhoto(true);
      setErrorMsg("");
      const fData = new FormData();
      fData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData(prev => ({ ...prev, photoUrl: data.url }));
      } else {
        throw new Error(data.error || "ছবি আপলোড ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "ছবি আপলোড করা যায়নি");
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.applicantName.trim()) {
      setErrorMsg("অনুগ্রহ করে আবেদনকারীর নাম লিখুন");
      return;
    }
    if (!formData.fatherName.trim()) {
      setErrorMsg("অনুগ্রহ করে পিতার নাম লিখুন");
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg("অনুগ্রহ করে মোবাইল নম্বর লিখুন");
      return;
    }
    if (!selectedBatch) {
      setErrorMsg("অনুগ্রহ করে একটি ব্যাচ নির্বাচন করুন");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        batchId: selectedBatch.id || selectedBatch._id,
        batchName: selectedBatch.batch,
        medium: selectedBatch.medium,
        courseTitle: selectedBatch.title
      };

      const res = await fetch("/api/training/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessData(data);
      } else {
        throw new Error(data.error || "আবেদন জমা দেওয়া সম্ভব হয়নি");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "কোনো একটি ত্রুটি ঘটেছে, আবার চেষ্টা করুন");
    } finally {
      setSubmitting(false);
    }
  };

  const copyTrackingId = () => {
    if (successData?.trackingId) {
      navigator.clipboard.writeText(successData.trackingId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleResetAndClose = () => {
    setSuccessData(null);
    setErrorMsg("");
    onClose();
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={handleResetAndClose}
      />

      {/* Modal Dialog Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full mx-auto z-10 overflow-hidden flex flex-col max-h-[90vh] border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#052e23] via-emerald-800 to-[#0a4233] text-white relative flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 pr-2">
              <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border mb-1.5 bg-white/20 text-white border-white/30 backdrop-blur-xs">
                মুয়াল্লিম প্রশিক্ষণ কোর্স ২০২৬
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                অনলাইন ভর্তি আবেদন ফরম
              </h2>
              <p className="text-xs text-emerald-100/90 mt-0.5 truncate font-medium">
                সঠিক তথ্য দিয়ে ফরমটি পূরণ করে আবেদন সম্পন্ন করুন
              </p>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 flex-shrink-0"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-6">
          {successData ? (
            /* Success View */
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-emerald-950">ভর্তি আবেদন সফলভাবে গৃহীত হয়েছে!</h3>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  আপনার প্রাথমিক আবেদন জমা নেওয়া হয়েছে। বোর্ড কর্তৃপক্ষ তথ্য যাচাই করে যোগাযোগ করবে।
                </p>

                <div className="inline-flex items-center gap-2.5 bg-white px-4 py-2 rounded-2xl border border-emerald-300 shadow-2xs">
                  <span className="text-xs font-bold text-slate-600">ট্র্যাকিং নম্বর:</span>
                  <span className="font-mono font-black text-emerald-800 text-base">{successData.trackingId}</span>
                  <button
                    type="button"
                    onClick={copyTrackingId}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                    title="কপি করুন"
                  >
                    {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Applicant Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-500 uppercase block mb-1">কোর্স ও ব্যাচ</span>
                  <p className="font-black text-slate-900">{successData.admission?.courseTitle}</p>
                  <p className="text-emerald-800 font-bold mt-0.5">{successData.admission?.batchName}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-500 uppercase block mb-1">আবেদনকারী</span>
                  <p className="font-black text-slate-900">{successData.admission?.applicantName}</p>
                  <p className="text-slate-600 font-mono mt-0.5">মোবাইল: {successData.admission?.phone}</p>
                  {successData.admission?.division && (
                    <p className="text-slate-600 mt-0.5 truncate">
                      ঠিকানা: {[successData.admission?.village, successData.admission?.union, successData.admission?.upazila, successData.admission?.district].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-500 uppercase block mb-1">পেমেন্ট</span>
                  <p className="font-black text-emerald-800">ফি: {successData.admission?.paymentAmount || "নির্ধারিত"}</p>
                  <p className="text-slate-600 mt-0.5">মাধ্যম: {successData.admission?.paymentMethod || "বিকাশ"}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>স্লিপ প্রিন্ট করুন</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          ) : (
            /* Form View */
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Section 1: Course and Batch Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base border-b border-slate-100 pb-2">
                  <GraduationCap className="w-5 h-5 text-emerald-700" />
                  <span>১. কোর্স ও ব্যাচ নির্বাচন করুন *</span>
                </div>

                {loadingBatches ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-emerald-600" />
                    ব্যাচ তথ্য লোড হচ্ছে...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {batches.map((b) => {
                      const isSelected = selectedBatchId === (b.id || b._id);
                      return (
                        <div
                          key={b.id || b._id}
                          onClick={() => handleSelectBatch(b.id || b._id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between gap-2.5 ${
                            isSelected
                              ? "border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20"
                              : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              b.medium === "bangla" ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"
                            }`}>
                              {b.medium === "bangla" ? "বাংলা মাধ্যম" : "আরবি মাধ্যম"}
                            </span>
                            <span className="font-black text-xs text-emerald-800">{b.price}</span>
                          </div>

                          <div>
                            <h4 className="font-black text-xs sm:text-sm text-slate-900 leading-tight">
                              {b.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                              ব্যাচ নং: {b.batch}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                            <span>{b.durationDays} দিন মেয়াদ</span>
                            <span className="truncate">{b.date}</span>
                          </div>

                          {isSelected && (
                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section 2: Personal Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base border-b border-slate-100 pb-2">
                  <User className="w-5 h-5 text-emerald-700" />
                  <span>২. আবেদনকারীর ব্যক্তিগত তথ্য</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      আবেদনকারীর পূর্ণ নাম (বাংলায়) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="উদাঃ হাফেজ মাওলানা আব্দুল্লাহ"
                      value={formData.applicantName}
                      onChange={e => setFormData({ ...formData, applicantName: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      পূর্ণ নাম (ইংরেজি বড় হাতের অক্ষরে)
                    </label>
                    <input
                      type="text"
                      placeholder="MD. ABDULLAH"
                      value={formData.applicantNameEn}
                      onChange={e => setFormData({ ...formData, applicantNameEn: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      পিতার নাম *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="উদাঃ মাওলানা আব্দুর রহমান"
                      value={formData.fatherName}
                      onChange={e => setFormData({ ...formData, fatherName: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      মাতার নাম
                    </label>
                    <input
                      type="text"
                      placeholder="উদাঃ খাদিজা বেগম"
                      value={formData.motherName}
                      onChange={e => setFormData({ ...formData, motherName: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      মোবাইল নম্বর *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="017xxxxxxxx"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      অভিভাবকের / বিকল্প মোবাইল নম্বর
                    </label>
                    <input
                      type="tel"
                      placeholder="018xxxxxxxx"
                      value={formData.emergencyPhone}
                      onChange={e => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      জাতীয় পরিচয়পত্র / জন্ম নিবন্ধন নম্বর
                    </label>
                    <input
                      type="text"
                      placeholder="NID বা জন্ম নিবন্ধন নম্বর"
                      value={formData.nidOrBirthCert}
                      onChange={e => setFormData({ ...formData, nidOrBirthCert: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      জন্ম তারিখ
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      রক্তের গ্রুপ
                    </label>
                    <select
                      value={formData.bloodGroup}
                      onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 bg-white font-medium"
                    >
                      <option value="">নির্বাচন করুন</option>
                      <option value="A+">A+ (পজিটিভ)</option>
                      <option value="A-">A- (নেগেটিভ)</option>
                      <option value="B+">B+ (পজিটিভ)</option>
                      <option value="B-">B- (নেগেটিভ)</option>
                      <option value="O+">O+ (পজিটিভ)</option>
                      <option value="O-">O- (নেগেটিভ)</option>
                      <option value="AB+">AB+ (পজিটিভ)</option>
                      <option value="AB-">AB- (নেগেটিভ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      লিঙ্গ
                    </label>
                    <select
                      value={formData.gender}
                      onChange={e => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 bg-white font-medium"
                    >
                      <option value="পুরুষ">পুরুষ</option>
                      <option value="মহিলা">মহিলা</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Educational Qualification */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base border-b border-slate-100 pb-2">
                  <BookOpen className="w-5 h-5 text-emerald-700" />
                  <span>৩. শিক্ষাগত যোগ্যতা ও বর্তমান প্রতিষ্ঠান</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      সর্বোচ্চ শিক্ষাগত যোগ্যতা *
                    </label>
                    <select
                      required
                      value={formData.education}
                      onChange={e => setFormData({ ...formData, education: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 bg-white font-medium"
                    >
                      <option value="দাওরায়ে হাদীস (মাস্টার্স সমমান)">দাওরায়ে হাদীস (মাস্টার্স সমমান)</option>
                      <option value="হিফজুল কুরআন সম্পন্ন">হিফজুল কুরআন সম্পন্ন</option>
                      <option value="ফযীলত (স্নাতক সমমান)">ফযীলত (স্নাতক সমমান)</option>
                      <option value="সানাবিয়া / আলিম / এইচএসসি">সানাবিয়া / আলিম / এইচএসসি</option>
                      <option value="দাখিল / এসএসসি">দাখিল / এসএসসি</option>
                      <option value="অন্যান্য">অন্যান্য</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      বর্তমান মাদরাসা / পেশা ও প্রতিষ্ঠানের নাম
                    </label>
                    <input
                      type="text"
                      placeholder="উদাঃ জামিয়া ইসলামিয়া খুলনা / শিক্ষকতা"
                      value={formData.currentMadrasa}
                      onChange={e => setFormData({ ...formData, currentMadrasa: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 bg-white font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Cascading Address Details */}
              <div className="space-y-3">
                <GeoAddressSelector
                  title="৪. স্থায়ী ও বর্তমান ঠিকানা"
                  value={{
                    division: formData.division,
                    district: formData.district,
                    upazila: formData.upazila,
                    union: formData.union,
                    village: formData.village,
                    fullAddress: ""
                  }}
                  onChange={(geo) => {
                    setFormData(prev => ({
                      ...prev,
                      division: geo.division,
                      district: geo.district,
                      upazila: geo.upazila,
                      union: geo.union,
                      village: geo.village
                    }));
                  }}
                  required={true}
                />
              </div>

              {/* Section 5: Course Fee & Payment Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base border-b border-slate-100 pb-2">
                  <DollarSign className="w-5 h-5 text-emerald-700" />
                  <span>৫. কোর্স ফি ও পেমেন্ট বিবরণ</span>
                </div>

                {(() => {
                  const config = getPaymentDetailsConfig(formData.paymentMethod);
                  return (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">পেমেন্ট মাধ্যম</label>
                          <select
                            value={formData.paymentMethod}
                            onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                          >
                            <option value="বিকাশ">বিকাশ (bKash)</option>
                            <option value="নগদ">নগদ (Nagad)</option>
                            <option value="রকেট">রকেট (Rocket)</option>
                            <option value="ব্যাংক">ব্যাংক একাউন্ট</option>
                            <option value="অফিসে নগদ জমা">অফিসে সরাসরি নগদ প্রদান</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">কোর্স ফি পরিমাণ</label>
                          <input
                            type="text"
                            placeholder="৳ ৫,৫০০"
                            value={formData.paymentAmount}
                            onChange={e => setFormData({ ...formData, paymentAmount: e.target.value })}
                            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {config.trxLabel}
                          </label>
                          <input
                            type="text"
                            placeholder={config.trxPlaceholder}
                            value={formData.transactionId}
                            onChange={e => setFormData({ ...formData, transactionId: e.target.value })}
                            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {config.phoneLabel}
                          </label>
                          <input
                            type="tel"
                            placeholder={config.phonePlaceholder}
                            value={formData.paymentPhone}
                            onChange={e => setFormData({ ...formData, paymentPhone: e.target.value })}
                            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                          />
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 font-medium">
                        {config.note}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Section 6: Photo Upload (Optional) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base border-b border-slate-100 pb-2">
                  <Upload className="w-5 h-5 text-emerald-700" />
                  <span>৬. আবেদনকারীর ছবি (ঐচ্ছিক)</span>
                </div>

                <div className="flex items-center gap-4">
                  <div
                    onClick={() => !uploadingPhoto && photoInputRef.current?.click()}
                    className="w-20 h-24 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/20 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden shrink-0"
                  >
                    <input
                      type="file"
                      ref={photoInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    {formData.photoUrl ? (
                      <img
                        src={formData.photoUrl}
                        alt="Applicant Photo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-2">
                        {uploadingPhoto ? (
                          <Loader2 className="w-5 h-5 text-emerald-600 animate-spin mx-auto mb-1" />
                        ) : (
                          <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                        )}
                        <span className="text-[9px] font-bold text-slate-600 block">
                          {uploadingPhoto ? "আপলোড..." : "ছবি দিন"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 space-y-1">
                    <p className="font-bold text-slate-700">পাসপোর্ট সাইজের স্পষ্ট ছবি</p>
                    <p>ফরম্যাটে JPG, PNG সমর্থন করে। সর্বোচ্চ 2MB সাইজ।</p>
                    {formData.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, photoUrl: "" }))}
                        className="text-red-600 hover:underline font-bold text-xs pt-0.5 block"
                      >
                        ছবি সরান
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-slate-500 font-medium text-center sm:text-left">
                  আমি অঙ্গীকার করছি যে উপরে প্রদত্ত সকল তথ্য সঠিক ও নির্ভুল।
                </p>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
                  >
                    বাতিল
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 sm:flex-initial px-7 py-3 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>প্রক্রিয়াধীন...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-amber-300" />
                        <span>ভর্তি আবেদন জমা দিন</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
