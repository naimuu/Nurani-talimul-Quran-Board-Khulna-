"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Upload, 
  ArrowLeft, 
  Printer, 
  Copy, 
  AlertCircle, 
  Loader2, 
  Check, 
  BookOpen, 
  ShieldCheck, 
  Sparkles,
  Info
} from "lucide-react";

interface BatchOption {
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

function AdmissionFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const queryBatchId = searchParams.get("batchId");
  const queryMedium = searchParams.get("medium");

  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [selectedBatchId, setSelectedBatchId] = useState<string>(queryBatchId || "");

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

  // Fetch batches
  useEffect(() => {
    async function loadBatches() {
      try {
        setLoadingBatches(true);
        const res = await fetch("/api/training/batches");
        if (res.ok) {
          const data = await res.json();
          const activeList = (data.batches || []).filter((b: any) => b.isActive !== false);
          setBatches(activeList);

          if (queryBatchId) {
            const found = activeList.find((b: any) => (b.id === queryBatchId || b._id === queryBatchId));
            if (found) {
              setSelectedBatchId(found.id || found._id);
              setFormData(prev => ({ ...prev, paymentAmount: found.price }));
              return;
            }
          }

          if (queryMedium) {
            const found = activeList.find((b: any) => b.medium === queryMedium);
            if (found) {
              setSelectedBatchId(found.id || found._id);
              setFormData(prev => ({ ...prev, paymentAmount: found.price }));
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
  }, [queryBatchId, queryMedium]);

  const selectedBatch = batches.find(b => (b.id === selectedBatchId || b._id === selectedBatchId));

  const handleBatchSelect = (batch: BatchOption) => {
    const id = batch.id || batch._id || "";
    setSelectedBatchId(id);
    setFormData(prev => ({ ...prev, paymentAmount: batch.price }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("অনুগ্রহ করে একটি ছবি ফাইল আপলোড করুন (JPG, PNG)");
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
      if (!res.ok || !data.success) {
        throw new Error(data.error || "আবেদন প্রক্রিয়া সম্পন্ন করা যায়নি");
      }

      setSuccessData(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setErrorMsg(err.message || "ত্রুটি ঘটেছে, অনুগ্রহ করে আবার চেষ্টা করুন");
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

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-10 max-w-5xl">
      
      {/* Top Breadcrumb & Return */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={selectedBatch?.link || "/training/moallem-bangla"}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-emerald-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>প্রশিক্ষণ পেজে ফিরুন</span>
        </Link>
        <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
          নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ
        </span>
      </div>

      {/* Success Modal / Printable Slip View */}
      {successData ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
        >
          {/* Success Banner */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-[#052e23] via-emerald-800 to-[#0a4233] text-white text-center">
            <div className="w-16 h-16 bg-white/15 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-amber-300/80 shadow-md">
              <CheckCircle2 className="w-10 h-10 text-amber-300" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">ভর্তি আবেদন সফলভাবে গৃহীত হয়েছে!</h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-lg mx-auto">
              মুয়াল্লিম প্রশিক্ষণ কোর্সে আপনার প্রাথমিক আবেদন জমা নেওয়া হয়েছে। বোর্ড কর্তৃপক্ষ যাচাই করে আপনার সাথে যোগাযোগ করবে।
            </p>

            {/* Tracking ID Badge */}
            <div className="mt-5 inline-flex items-center gap-3 bg-slate-950/50 backdrop-blur-xs px-5 py-2.5 rounded-2xl border border-white/20">
              <span className="text-xs font-bold text-emerald-300 uppercase">ট্র্যাকিং নম্বর:</span>
              <span className="font-mono font-black text-lg text-amber-300 tracking-wider">
                {successData.trackingId}
              </span>
              <button
                type="button"
                onClick={copyTrackingId}
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-200 transition-colors"
                title="কপি করুন"
              >
                {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Printable Slip Content */}
          <div className="p-6 sm:p-8 space-y-6 print:p-0" id="admission-slip">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-lg sm:text-xl text-slate-900">
                  আবেদনপত্রের সংক্ষিপ্ত বিবরণ (Admission Slip)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  তারিখ: {new Date().toLocaleDateString('bn-BD')}
                </p>
              </div>

              <div className="flex items-center gap-3 no-print">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all hover:scale-105 active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>স্লিপ প্রিন্ট করুন</span>
                </button>
                <Link
                  href="/training/moallem-bangla"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  হোমে ফিরুন
                </Link>
              </div>
            </div>

            {/* Applicant & Batch Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">কোর্স ও ব্যাচ</span>
                <p className="font-extrabold text-sm text-slate-900">{successData.admission?.courseTitle}</p>
                <p className="text-xs text-emerald-800 font-bold mt-0.5">{successData.admission?.batchName}</p>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 bg-white rounded-md border border-slate-200 text-slate-700">
                  {successData.admission?.medium === 'bangla' ? 'বাংলা মাধ্যম' : 'আরবি মাধ্যম'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">আবেদনকারীর তথ্য</span>
                <p className="font-extrabold text-sm text-slate-900">{successData.admission?.applicantName}</p>
                <p className="text-xs text-slate-600 mt-0.5">পিতা: {successData.admission?.fatherName}</p>
                <p className="text-xs text-slate-600 font-mono mt-0.5">মোবাইল: {successData.admission?.phone}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">পেমেন্ট ও স্ট্যাটাস</span>
                <p className="font-extrabold text-sm text-emerald-800">ফি: {successData.admission?.paymentAmount || "নির্ধারিত"}</p>
                <p className="text-xs text-slate-600 mt-0.5">মাধ্যম: {successData.admission?.paymentMethod || "বিকাশ"}</p>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md border border-amber-300">
                  স্ট্যাটাস: অপেক্ষমান (Pending)
                </span>
              </div>
            </div>

            {/* Next Steps Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-2">
              <h4 className="font-bold flex items-center gap-1.5 text-sm text-emerald-900">
                <Info className="w-4 h-4 text-emerald-700" />
                <span>পরবর্তী করণীয় ও গুরুত্বপূর্ণ নির্দেশনাবলী:</span>
              </h4>
              <ul className="list-disc list-inside space-y-1 text-emerald-900/90 pl-1">
                <li>আপনার ট্র্যাকিং নম্বরটি (<strong className="font-mono">{successData.trackingId}</strong>) সংরক্ষণ করুন।</li>
                <li>বোর্ড কর্তৃপক্ষ আপনার তথ্য যাচাই করে ফোন বা মেসেজের মাধ্যমে ক্লাসের সময়সূচি ও কেন্দ্র নিশ্চিত করবে।</li>
                <li>প্রশিক্ষণ শুরুর দিন প্রয়োজনীয় কাগজপত্র ও জাতীয় পরিচয়পত্র/জন্মনিবন্ধনের কপি সাথে আনবেন।</li>
              </ul>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Main Admission Form */
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden">
          
          {/* Form Header */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-[#052e23] via-emerald-800 to-[#0a4233] text-white relative overflow-hidden">
            {selectedBatch?.coverImage && (
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-20 filter contrast-125"
                style={{ backgroundImage: `url(${selectedBatch.coverImage})` }}
              />
            )}
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="inline-block text-xs font-bold px-3 py-1 rounded-full border mb-2 bg-white/20 text-white border-white/30 backdrop-blur-xs">
                  মুয়াল্লিম প্রশিক্ষণ কোর্স ২০২৬
                </span>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  অনলাইন ভর্তি আবেদন ফরম
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 font-medium">
                  সঠিক তথ্য দিয়ে নিচের ফরমটি পূরণ করে আবেদন সম্পন্ন করুন
                </p>
              </div>

              {selectedBatch?.durationDays && (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15 border border-white/30 backdrop-blur-xs flex flex-col items-center justify-center font-bold text-white shrink-0 shadow-md">
                  <span className="text-2xl sm:text-3xl font-black leading-none">{selectedBatch.durationDays}</span>
                  <span className="text-[10px] sm:text-xs uppercase text-amber-300 mt-0.5">দিন মেয়াদী</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-8">
            
            {/* Error Message if any */}
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Section 1: Batch Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base border-b border-slate-100 pb-2">
                <GraduationCap className="w-5 h-5 text-emerald-700" />
                <span>১. কোর্স ও ব্যাচ নির্বাচন করুন *</span>
              </div>

              {loadingBatches ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                  ব্যাচের তালিকা লোড হচ্ছে...
                </div>
              ) : batches.length === 0 ? (
                <div className="p-4 rounded-2xl bg-amber-50 text-amber-900 text-xs font-medium border border-amber-200">
                  বর্তমানে কোনো সক্রিয় ব্যাচ পাওয়া যায়নি। অনুগ্রহ করে পরবর্তীতে চেষ্টা করুন।
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
                  {batches.map((b) => {
                    const isSelected = (b.id === selectedBatchId || b._id === selectedBatchId);
                    const isBangla = b.medium === "bangla";
                    return (
                      <div
                        key={b.id || b._id}
                        onClick={() => handleBatchSelect(b)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? isBangla 
                              ? "border-emerald-600 bg-emerald-50/60 shadow-sm" 
                              : "border-amber-600 bg-amber-50/60 shadow-sm"
                            : "border-slate-200/90 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                              isBangla 
                                ? "bg-emerald-100 text-emerald-900 border-emerald-300" 
                                : "bg-amber-100 text-amber-950 border-amber-300"
                            }`}>
                              {b.badge || (isBangla ? "বাংলা মাধ্যম" : "আরবি মাধ্যম")}
                            </span>

                            <span className="text-xs font-black text-emerald-800">
                              {b.price}
                            </span>
                          </div>

                          <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                            {b.title}
                          </h4>
                          <p className="text-xs font-bold text-slate-600 mt-1">
                            {b.batch}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                          <span>{b.durationDays} দিন মেয়াদ</span>
                          <span className="truncate max-w-[120px]">{b.date}</span>
                        </div>

                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 2: Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base border-b border-slate-100 pb-2">
                <User className="w-5 h-5 text-emerald-700" />
                <span>২. আবেদনকারীর ব্যক্তিগত তথ্য</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Applicant Name */}
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
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>

                {/* English Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পূর্ণ নাম (ইংরেজি বড় হাতের অক্ষরে)
                  </label>
                  <input
                    type="text"
                    placeholder="MD. ABDULLAH"
                    value={formData.applicantNameEn}
                    onChange={e => setFormData({ ...formData, applicantNameEn: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>

                {/* Father's Name */}
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
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>

                {/* Mother's Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    মাতার নাম
                  </label>
                  <input
                    type="text"
                    placeholder="উদাঃ খাদিজা বেগম"
                    value={formData.motherName}
                    onChange={e => setFormData({ ...formData, motherName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    মোবাইল নম্বর *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="017XXXXXXXX"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>

                {/* Emergency Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    অভিভাবকের / বিকল্প মোবাইল নম্বর
                  </label>
                  <input
                    type="tel"
                    placeholder="019XXXXXXXX"
                    value={formData.emergencyPhone}
                    onChange={e => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    জন্ম তারিখ
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>

                {/* NID / Birth Certificate */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    জাতীয় পরিচয়পত্র / জন্ম নিবন্ধন নং
                  </label>
                  <input
                    type="text"
                    placeholder="NID বা জন্ম নিবন্ধন নম্বর"
                    value={formData.nidOrBirthCert}
                    onChange={e => setFormData({ ...formData, nidOrBirthCert: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>

                {/* Blood Group */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    রক্তের গ্রুপ
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 bg-white"
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

              </div>
            </div>

            {/* Section 3: Educational Background */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base border-b border-slate-100 pb-2">
                <BookOpen className="w-5 h-5 text-emerald-700" />
                <span>৩. শিক্ষাগত যোগ্যতা ও বর্তমান প্রতিষ্ঠান</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    সর্বোচ্চ শিক্ষাগত যোগ্যতা *
                  </label>
                  <select
                    required
                    value={formData.education}
                    onChange={e => setFormData({ ...formData, education: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 bg-white"
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
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Address Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base border-b border-slate-100 pb-2">
                <MapPin className="w-5 h-5 text-emerald-700" />
                <span>৪. স্থায়ী ও বর্তমান ঠিকানা</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">বিভাগ</label>
                  <input
                    type="text"
                    placeholder="খুলনা"
                    value={formData.division}
                    onChange={e => setFormData({ ...formData, division: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">জেলা *</label>
                  <input
                    type="text"
                    required
                    placeholder="উদাঃ খুলনা, বাগেরহাট, যশোর"
                    value={formData.district}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">উপজেলা / থানা *</label>
                  <input
                    type="text"
                    required
                    placeholder="উদাঃ সোনাডাঙ্গা"
                    value={formData.upazila}
                    onChange={e => setFormData({ ...formData, upazila: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">গ্রাম / মহল্লা / ডাকঘর</label>
                  <input
                    type="text"
                    placeholder="গ্রাম ও পোস্ট অফিস"
                    value={formData.village}
                    onChange={e => setFormData({ ...formData, village: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Course Fee & Payment Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base border-b border-slate-100 pb-2">
                <DollarSign className="w-5 h-5 text-emerald-700" />
                <span>৫. কোর্স ফি ও পেমেন্ট বিবরণ</span>
              </div>

              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">পেমেন্ট মাধ্যম</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
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
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ট্রানজেকশন আইডি (TrxID)</label>
                    <input
                      type="text"
                      placeholder="উদাঃ 9H87G6F5"
                      value={formData.transactionId}
                      onChange={e => setFormData({ ...formData, transactionId: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">প্রেরক মোবাইল নম্বর</label>
                    <input
                      type="tel"
                      placeholder="যে নম্বর থেকে টাকা পাঠানো হয়েছে"
                      value={formData.paymentPhone}
                      onChange={e => setFormData({ ...formData, paymentPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 font-medium">
                  * অফিসে সরাসরি নগদ পরিশোধ করতে চাইলে পেমেন্ট মাধ্যমে "অফিসে সরাসরি নগদ প্রদান" নির্বাচন করুন।
                </p>
              </div>
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
                  className="w-24 h-28 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/20 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden shrink-0"
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
                        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-1" />
                      ) : (
                        <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                      )}
                      <span className="text-[10px] font-bold text-slate-600 block">
                        {uploadingPhoto ? "আপলোড হচ্ছে..." : "ছবি আপলোড"}
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
                      className="text-red-600 hover:underline font-bold text-xs pt-1 block"
                    >
                      ছবি সরান
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Declaration & Submit Button */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500 font-medium text-center sm:text-left">
                আমি অঙ্গীকার করছি যে উপরে প্রদত্ত সকল তথ্য সঠিক ও নির্ভুল।
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white rounded-2xl font-black text-sm shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>আবেদন প্রক্রিয়াধীন...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-amber-300" />
                    <span>ভর্তি আবেদন জমা দিন</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}

export default function AdmissionPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">লোড হচ্ছে...</div>}>
      <AdmissionFormContent />
    </Suspense>
  );
}
