"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Search, 
  Filter, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Eye, 
  Trash2, 
  Copy, 
  Check, 
  BookOpen, 
  FileText, 
  Layers, 
  Loader2, 
  X, 
  ShieldCheck, 
  GraduationCap,
  Sparkles,
  Info,
  ChevronDown
} from "lucide-react";
import { useDialog } from "@/components/ui/DialogProvider";

export interface AdmissionItem {
  id: string;
  _id?: string;
  trackingId: string;
  batchId?: string;
  batchName: string;
  medium: string;
  courseTitle: string;
  applicantName: string;
  applicantNameEn?: string;
  fatherName: string;
  motherName?: string;
  phone: string;
  emergencyPhone?: string;
  nidOrBirthCert?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  gender?: string;
  education: string;
  currentMadrasa?: string;
  division?: string;
  district?: string;
  upazila?: string;
  village?: string;
  postOffice?: string;
  paymentMethod?: string;
  transactionId?: string;
  paymentAmount?: string;
  paymentPhone?: string;
  photoUrl?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  adminNote?: string;
  rollNo?: string;
  createdAt: string;
}

interface BatchCount {
  batchName: string;
  batchId: string;
  medium: string;
  total: number;
  accepted: number;
  pending: number;
  rejected: number;
}

interface Counts {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  batchCounts: BatchCount[];
}

export default function AdmissionRequestsTab({ 
  onPendingCountChange 
}: { 
  onPendingCountChange?: (count: number) => void 
}) {
  const { alert, confirm } = useDialog();

  const [admissions, setAdmissions] = useState<AdmissionItem[]>([]);
  const [counts, setCounts] = useState<Counts>({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    batchCounts: []
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "ACCEPTED" | "REJECTED">("ALL");
  const [mediumFilter, setMediumFilter] = useState<"ALL" | "bangla" | "arabic">("ALL");
  const [batchFilter, setBatchFilter] = useState<string>("ALL");
  const [allBatches, setAllBatches] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/training/batches?all=true")
      .then(res => res.json())
      .then(data => {
        if (data.batches) setAllBatches(data.batches);
      })
      .catch(err => console.error("Error fetching batches:", err));
  }, []);

  const batchOptions = useMemo(() => {
    const map = new Map<string, string>();
    allBatches.forEach(b => {
      if (b.batch) {
        map.set(b.id || b._id || b.batch, b.batch);
      }
    });
    counts.batchCounts?.forEach(bc => {
      if (bc.batchName) {
        const key = bc.batchId || bc.batchName;
        if (!map.has(key)) {
          map.set(key, bc.batchName);
        }
      }
    });
    return Array.from(map.entries()).map(([val, label]) => ({
      value: val,
      label: label
    }));
  }, [allBatches, counts.batchCounts]);

  // Modals
  const [selectedAdmission, setSelectedAdmission] = useState<AdmissionItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printTargetBatch, setPrintTargetBatch] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Editing state inside detail modal
  const [modalStatus, setModalStatus] = useState<"PENDING" | "ACCEPTED" | "REJECTED">("PENDING");
  const [modalRollNo, setModalRollNo] = useState("");
  const [modalAdminNote, setModalAdminNote] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (mediumFilter !== "ALL") params.append("medium", mediumFilter);
      if (batchFilter !== "ALL") params.append("batchId", batchFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/training/admissions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAdmissions(data.admissions || []);
        if (data.counts) {
          setCounts(data.counts);
          if (onPendingCountChange) {
            onPendingCountChange(data.counts.pending || 0);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load admissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, [statusFilter, mediumFilter, batchFilter, searchQuery]);

  const openDetailModal = (item: AdmissionItem) => {
    setSelectedAdmission(item);
    setModalStatus(item.status);
    setModalRollNo(item.rollNo || "");
    setModalAdminNote(item.adminNote || "");
    setIsDetailModalOpen(true);
  };

  const handleUpdateStatus = async (item: AdmissionItem, newStatus: "PENDING" | "ACCEPTED" | "REJECTED") => {
    const id = item.id || item._id;
    if (!id) return;

    try {
      const res = await fetch(`/api/training/admissions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdmissions(prev => prev.map(a => (a.id === id || a._id === id) ? { ...a, status: newStatus } : a));
        // Refresh counts
        fetchAdmissions();
      } else {
        throw new Error(data.error || "আপডেট ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      alert({ title: "ত্রুটি", message: err.message || "স্ট্যাটাস পরিবর্তন করা যায়নি", type: "error" });
    }
  };

  const handleSaveModalChanges = async () => {
    if (!selectedAdmission) return;
    const id = selectedAdmission.id || selectedAdmission._id;
    if (!id) return;

    try {
      setUpdating(true);
      const res = await fetch(`/api/training/admissions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: modalStatus,
          rollNo: modalRollNo.trim(),
          adminNote: modalAdminNote.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert({ title: "সফল!", message: "আবেদনকারীর তথ্য আপডেট করা হয়েছে!", type: "success" });
        setIsDetailModalOpen(false);
        fetchAdmissions();
      } else {
        throw new Error(data.error || "আপডেট ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      alert({ title: "ত্রুটি", message: err.message || "সংরক্ষণ করা যায়নি", type: "error" });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (item: AdmissionItem) => {
    const id = item.id || item._id;
    if (!id) return;

    const confirmed = await confirm({
      title: "আবেদন মুছে ফেলার নিশ্চিতকরণ",
      message: `আপনি কি "${item.applicantName}" এর ভর্তি আবেদনটি মুছে ফেলতে চান?`,
      type: "warning",
      confirmText: "মুছে ফেলুন",
      cancelText: "বাতিল"
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/training/admissions/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert({ title: "সফল", message: "আবেদন সফলভাবে মুছে ফেলা হয়েছে!", type: "success" });
        fetchAdmissions();
      } else {
        throw new Error(data.error || "মুছে ফেলা ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      alert({ title: "ত্রুটি", message: err.message || "মুছে ফেলতে সমস্যা হয়েছে", type: "error" });
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openBatchPrint = (batchName: string = "ALL") => {
    setPrintTargetBatch(batchName);
    setIsPrintModalOpen(true);
  };

  // Filtered list for printing
  const printableList = admissions.filter(a => {
    if (printTargetBatch === "ALL") return true;
    return a.batchName === printTargetBatch;
  });

  return (
    <div className="space-y-6">
      
      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        
        {/* Total Applications */}
        <div 
          onClick={() => setStatusFilter("ALL")}
          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
            statusFilter === "ALL" 
              ? "bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs" 
              : "bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              statusFilter === "ALL" ? "bg-emerald-700 text-white" : "bg-emerald-50 text-emerald-700"
            }`}>
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-600 block leading-tight truncate">
                সর্বমোট আবেদন
              </span>
              <span className="text-[11px] text-slate-400 font-medium">সকল ব্যাচ</span>
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 shrink-0">
            {counts.total}
          </span>
        </div>

        {/* Pending Requests */}
        <div 
          onClick={() => setStatusFilter("PENDING")}
          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
            statusFilter === "PENDING" 
              ? "bg-amber-50/80 border-amber-600 ring-2 ring-amber-600/20 shadow-xs" 
              : "bg-white border-slate-200/90 hover:border-amber-300 hover:bg-amber-50/30 shadow-2xs"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              statusFilter === "PENDING" ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-600"
            }`}>
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-600 block leading-tight truncate">
                অপেক্ষমান
              </span>
              <span className="text-[11px] text-amber-700 font-medium">যাচাই প্রয়োজন</span>
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-amber-700 shrink-0">
            {counts.pending}
          </span>
        </div>

        {/* Accepted Students */}
        <div 
          onClick={() => setStatusFilter("ACCEPTED")}
          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
            statusFilter === "ACCEPTED" 
              ? "bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs" 
              : "bg-white border-slate-200/90 hover:border-emerald-300 hover:bg-emerald-50/30 shadow-2xs"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              statusFilter === "ACCEPTED" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-600"
            }`}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-600 block leading-tight truncate">
                অনুমোদিত
              </span>
              <span className="text-[11px] text-emerald-700 font-medium">ভর্তি নিশ্চিত</span>
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-emerald-700 shrink-0">
            {counts.accepted}
          </span>
        </div>

        {/* Rejected Requests */}
        <div 
          onClick={() => setStatusFilter("REJECTED")}
          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
            statusFilter === "REJECTED" 
              ? "bg-red-50/80 border-red-600 ring-2 ring-red-600/20 shadow-xs" 
              : "bg-white border-slate-200/90 hover:border-red-300 hover:bg-red-50/30 shadow-2xs"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              statusFilter === "REJECTED" ? "bg-red-600 text-white" : "bg-red-50 text-red-600"
            }`}>
              <XCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-600 block leading-tight truncate">
                বাতিলকৃত
              </span>
              <span className="text-[11px] text-red-600 font-medium">অনুপযুক্ত</span>
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-red-600 shrink-0">
            {counts.rejected}
          </span>
        </div>

      </div>

      {/* Batch-wise Count & Overview Carousel / Grid */}
      {counts.batchCounts && counts.batchCounts.length > 0 && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-700" />
              <span>ব্যাচভিত্তিক শিক্ষার্থী পরিসংখ্যান ও তালিকা প্রিন্ট</span>
            </h3>
            <button
              type="button"
              onClick={() => openBatchPrint("ALL")}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>সকল ব্যাচের তালিকা প্রিন্ট</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {counts.batchCounts.map((bc, idx) => {
              const isSelected = batchFilter === bc.batchId || batchFilter === bc.batchName;
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                    isSelected
                      ? "ring-2 ring-emerald-600 bg-emerald-100/60 border-emerald-400 shadow-sm"
                      : bc.medium === "bangla" 
                        ? "bg-emerald-50/40 border-emerald-200 hover:border-emerald-400" 
                        : "bg-amber-50/40 border-amber-200 hover:border-amber-400"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-extrabold text-xs text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                        {bc.batchName}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        bc.medium === "bangla" ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-950"
                      }`}>
                        {bc.medium === "bangla" ? "বাংলা" : "আরবি"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1.5 font-bold">
                      <span className="text-slate-600">মোট আবেদন: <strong className="text-slate-900">{bc.total}</strong></span>
                      <span className="text-emerald-700">অনুমোদিত: <strong>{bc.accepted}</strong></span>
                      <span className="text-amber-700">অপেক্ষমান: <strong>{bc.pending}</strong></span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setBatchFilter(isSelected ? "ALL" : (bc.batchId || bc.batchName))}
                      className={`text-[11px] font-bold flex items-center gap-1 ${
                        isSelected ? "text-emerald-950 underline font-black" : "text-emerald-800 hover:underline"
                      }`}
                    >
                      <span>{isSelected ? "ফিল্টার সরানো (রিসেট)" : "আবেদন ফিল্টার করুন"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openBatchPrint(bc.batchName)}
                      className="text-[11px] font-bold text-slate-700 hover:text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs hover:bg-slate-50 flex items-center gap-1"
                      title="এই ব্যাচের শিক্ষার্থী তালিকা প্রিন্ট করুন"
                    >
                      <Printer className="w-3 h-3 text-slate-500" />
                      <span>তালিকা প্রিন্ট</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter, Search & Actions Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="নাম, মোবাইল, ট্র্যাকিং আইডি, জেলা বা মাদরাসা দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns & Print Button */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-emerald-600"
          >
            <option value="ALL">সকল স্ট্যাটাস ({counts.total})</option>
            <option value="PENDING">অপেক্ষমান ({counts.pending})</option>
            <option value="ACCEPTED">অনুমোদিত ({counts.accepted})</option>
            <option value="REJECTED">বাতিল ({counts.rejected})</option>
          </select>

          {/* Medium Filter */}
          <select
            value={mediumFilter}
            onChange={e => setMediumFilter(e.target.value as any)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-emerald-600"
          >
            <option value="ALL">সকল মাধ্যম</option>
            <option value="bangla">বাংলা</option>
            <option value="arabic">আরবি</option>
          </select>

          {/* Batch Selector Filter */}
          <select
            value={batchFilter}
            onChange={e => setBatchFilter(e.target.value)}
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
              batchFilter !== "ALL"
                ? "border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20"
                : "border-slate-200 bg-white text-slate-700"
            } focus:outline-none focus:border-emerald-600 max-w-[200px] truncate`}
            title="নির্দিষ্ট ব্যাচ অনুযায়ী ফিল্টার করুন"
          >
            <option value="ALL">সকল ব্যাচ {batchOptions.length > 0 ? `(${batchOptions.length})` : ""}</option>
            {batchOptions.map(b => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>

          {/* Reset button if any filter active */}
          {(statusFilter !== "ALL" || mediumFilter !== "ALL" || batchFilter !== "ALL" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("ALL");
                setMediumFilter("ALL");
                setBatchFilter("ALL");
                setSearchQuery("");
              }}
              className="px-2.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="সকল ফিল্টার রিসেট করুন"
            >
              রিসেট
            </button>
          )}

          {/* Print Button */}
          <button
            type="button"
            onClick={() => {
              const selectedBatchObj = batchOptions.find(b => b.value === batchFilter);
              openBatchPrint(selectedBatchObj ? selectedBatchObj.label : (batchFilter !== "ALL" ? batchFilter : "ALL"));
            }}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>তালিকা প্রিন্ট</span>
          </button>
        </div>

      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">ভর্তি আবেদন লোড হচ্ছে...</p>
          </div>
        ) : admissions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-base">কোনো ভর্তি আবেদন পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 mt-1">নির্বাচিত ফিল্টারে কোনো আবেদন নেই অথবা এখনও কোনো আবেদন জমা পড়েনি।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">ট্র্যাকিং আইডি ও তারিখ</th>
                  <th className="py-3.5 px-4">শিক্ষার্থীর নাম ও পিতা</th>
                  <th className="py-3.5 px-4">মোবাইল ও ঠিকানা</th>
                  <th className="py-3.5 px-4">ব্যাচ ও মাধ্যম</th>
                  <th className="py-3.5 px-4">ফি ও ট্রানজেকশন</th>
                  <th className="py-3.5 px-4">স্ট্যাটাস</th>
                  <th className="py-3.5 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admissions.map((item, index) => {
                  const isBangla = item.medium === "bangla";
                  return (
                    <tr 
                      key={item.id || item._id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => openDetailModal(item)}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-400">
                        {index + 1}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-mono font-bold text-slate-900">
                          <span>{item.trackingId}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(item.trackingId, item.trackingId);
                            }}
                            className="p-1 text-slate-400 hover:text-emerald-700 rounded transition-colors"
                            title="ট্র্যাকিং আইডি কপি করুন"
                          >
                            {copiedId === item.trackingId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {new Date(item.createdAt).toLocaleDateString('bn-BD')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {item.photoUrl ? (
                            <img
                              src={item.photoUrl}
                              alt={item.applicantName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                              {item.applicantName.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-extrabold text-slate-900 block leading-tight">
                              {item.applicantName}
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                              পিতা: {item.fatherName}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <a
                          href={`tel:${item.phone}`}
                          onClick={e => e.stopPropagation()}
                          className="font-bold text-emerald-800 hover:underline flex items-center gap-1 font-mono"
                        >
                          <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{item.phone}</span>
                        </a>
                        <span className="text-[11px] text-slate-500 block mt-0.5 truncate max-w-[150px]">
                          {item.district ? `${item.district}, ${item.upazila || ""}` : "ঠিকানা উল্লেখ নেই"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-slate-900 block">
                          {item.batchName}
                        </span>
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-0.5 ${
                          isBangla 
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                            : "bg-amber-50 text-amber-900 border-amber-200"
                        }`}>
                          {isBangla ? "বাংলা" : "আরবি"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-emerald-800 block">
                          {item.paymentAmount || "নির্ধারিত"}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {item.paymentMethod || "বিকাশ"} {item.transactionId ? `(${item.transactionId})` : ""}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] border ${
                          item.status === "ACCEPTED" 
                            ? "bg-emerald-100 text-emerald-900 border-emerald-300" 
                            : item.status === "REJECTED" 
                              ? "bg-red-100 text-red-900 border-red-300" 
                              : "bg-amber-100 text-amber-950 border-amber-300"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            item.status === "ACCEPTED" ? "bg-emerald-600" : item.status === "REJECTED" ? "bg-red-600" : "bg-amber-600"
                          }`} />
                          <span>
                            {item.status === "ACCEPTED" ? "অনুমোদিত" : item.status === "REJECTED" ? "বাতিল" : "অপেক্ষমান"}
                          </span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => openDetailModal(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
                            title="বিস্তারিত দেখুন"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {item.status === "PENDING" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(item, "ACCEPTED")}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="অনুমোদন করুন"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Modal 1: Detailed Application & Edit Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedAdmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !updating && setIsDetailModalOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 z-10"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-[#052e23] via-emerald-800 to-[#0a4233] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg sm:text-xl">
                      ভর্তি আবেদনের পূর্ণাঙ্গ বিবরণ
                    </h3>
                    <p className="text-xs text-emerald-200 font-mono font-medium">
                      ট্র্যাকিং আইডি: {selectedAdmission.trackingId}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  disabled={updating}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                
                {/* Header Profile Box */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {selectedAdmission.photoUrl ? (
                      <img
                        src={selectedAdmission.photoUrl}
                        alt={selectedAdmission.applicantName}
                        className="w-14 h-16 rounded-xl object-cover border-2 border-emerald-600 shrink-0 shadow-xs"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xl flex items-center justify-center shrink-0">
                        {selectedAdmission.applicantName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900">
                        {selectedAdmission.applicantName}
                      </h4>
                      {selectedAdmission.applicantNameEn && (
                        <p className="text-xs text-slate-500 font-semibold font-mono">
                          {selectedAdmission.applicantNameEn}
                        </p>
                      )}
                      <p className="text-xs text-emerald-800 font-bold mt-0.5">
                        ব্যাচ: {selectedAdmission.batchName} ({selectedAdmission.medium === "bangla" ? "বাংলা" : "আরবি"})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full font-bold text-xs border ${
                      modalStatus === "ACCEPTED" 
                        ? "bg-emerald-100 text-emerald-900 border-emerald-300" 
                        : modalStatus === "REJECTED" 
                          ? "bg-red-100 text-red-900 border-red-300" 
                          : "bg-amber-100 text-amber-950 border-amber-300"
                    }`}>
                      {modalStatus === "ACCEPTED" ? "অনুমোদিত" : modalStatus === "REJECTED" ? "বাতিল" : "অপেক্ষমান"}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-700">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="font-bold text-slate-500 uppercase block mb-0.5 text-[10px]">পিতার নাম</span>
                    <p className="font-bold text-slate-900">{selectedAdmission.fatherName}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="font-bold text-slate-500 uppercase block mb-0.5 text-[10px]">মাতার নাম</span>
                    <p className="font-bold text-slate-900">{selectedAdmission.motherName || "—"}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="font-bold text-slate-500 uppercase block mb-0.5 text-[10px]">মোবাইল নম্বর</span>
                    <p className="font-bold text-emerald-800 font-mono">{selectedAdmission.phone}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="font-bold text-slate-500 uppercase block mb-0.5 text-[10px]">জরুরি ফোন</span>
                    <p className="font-bold text-slate-900 font-mono">{selectedAdmission.emergencyPhone || "—"}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="font-bold text-slate-500 uppercase block mb-0.5 text-[10px]">শিক্ষাগত যোগ্যতা</span>
                    <p className="font-bold text-slate-900">{selectedAdmission.education}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="font-bold text-slate-500 uppercase block mb-0.5 text-[10px]">বর্তমান মাদরাসা / পেশা</span>
                    <p className="font-bold text-slate-900">{selectedAdmission.currentMadrasa || "—"}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="font-bold text-slate-500 uppercase block mb-0.5 text-[10px]">ঠিকানা</span>
                    <p className="font-bold text-slate-900">
                      {selectedAdmission.village ? `${selectedAdmission.village}, ` : ""}
                      {selectedAdmission.upazila ? `${selectedAdmission.upazila}, ` : ""}
                      {selectedAdmission.district || "—"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="font-bold text-slate-500 uppercase block mb-0.5 text-[10px]">NID / জন্ম নিবন্ধন</span>
                    <p className="font-bold text-slate-900 font-mono">{selectedAdmission.nidOrBirthCert || "—"}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="font-bold text-slate-500 uppercase block mb-0.5 text-[10px]">রক্তের গ্রুপ ও জন্ম তারিখ</span>
                    <p className="font-bold text-slate-900">
                      {selectedAdmission.bloodGroup || "—"} {selectedAdmission.dateOfBirth ? `(${selectedAdmission.dateOfBirth})` : ""}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="font-bold text-slate-500 uppercase block mb-0.5 text-[10px]">পেমেন্ট মাধ্যম ও পরিমাণ</span>
                    <p className="font-bold text-emerald-800">
                      {selectedAdmission.paymentMethod || "বিকাশ"} - {selectedAdmission.paymentAmount || "নির্ধারিত"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 sm:col-span-2">
                    <span className="font-bold text-slate-500 uppercase block mb-0.5 text-[10px]">ট্রানজেকশন আইডি ও প্রেরক ফোন</span>
                    <p className="font-bold text-slate-900 font-mono">
                      TrxID: {selectedAdmission.transactionId || "—"} {selectedAdmission.paymentPhone ? `(প্রেরক: ${selectedAdmission.paymentPhone})` : ""}
                    </p>
                  </div>
                </div>

                {/* Admin Status & Notes Section */}
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 space-y-3">
                  <h4 className="font-bold text-xs text-emerald-950 uppercase flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>অ্যাডমিন অনুমোদন ও সিদ্ধান্ত</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ভর্তি স্ট্যাটাস নির্বাচন করুন
                      </label>
                      <select
                        value={modalStatus}
                        onChange={e => setModalStatus(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-600"
                      >
                        <option value="PENDING">অপেক্ষমান (Pending)</option>
                        <option value="ACCEPTED">অনুমোদিত (Accepted)</option>
                        <option value="REJECTED">বাতিল (Rejected)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        রোল নম্বর (যদি নির্ধারণ করতে চান)
                      </label>
                      <input
                        type="text"
                        placeholder="উদাঃ ১০১"
                        value={modalRollNo}
                        onChange={e => setModalRollNo(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      অ্যাডমিন নোট / বিশেষ মন্তব্য
                    </label>
                    <input
                      type="text"
                      placeholder="উদাঃ ফি পরিশোধিত / সরাসরি যোগাযোগ হয়েছে"
                      value={modalAdminNote}
                      onChange={e => setModalAdminNote(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  disabled={updating}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors"
                >
                  বন্ধ করুন
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveModalChanges}
                    disabled={updating}
                    className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>আপডেট সংরক্ষণ করুন</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Official Batch List Print Modal */}
      <AnimatePresence>
        {isPrintModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPrintModalOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs no-print"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 z-10 max-h-[90vh] flex flex-col"
            >
              {/* Header with Print Trigger (no-print) */}
              <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between no-print shrink-0">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-amber-300" />
                  <span className="font-extrabold text-sm sm:text-base">
                    ভর্তিকৃত শিক্ষার্থীদের অফিসিয়াল প্রিন্ট প্রিভিউ
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>এখনই প্রিন্ট করুন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPrintModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-white rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Official Document Body */}
              <div className="p-6 sm:p-10 overflow-y-auto flex-1 bg-white text-slate-900" id="official-student-print-sheet">
                
                {/* Official Board Header */}
                <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    মুহাম্মদনগর বড় মাদরাসা, মাদরাসা সড়ক, গল্লামারী, জিলা-৯২৬০, লবণচরা, খুলনা।
                  </p>
                  <div className="mt-2 inline-block bg-slate-900 text-white px-4 py-1 rounded-full text-xs font-black">
                    মুয়াল্লিম প্রশিক্ষণ কোর্সে ভর্তিকৃত শিক্ষার্থীদের রেজিস্টার / তালিকা
                  </div>
                </div>

                {/* Batch & Filter Meta Box */}
                <div className="flex items-center justify-between text-xs font-bold border border-slate-300 bg-slate-50 p-3 rounded-lg mb-4">
                  <div>
                    <span>ব্যাচ: </span>
                    <span className="text-slate-900">{printTargetBatch === "ALL" ? "সকল ব্যাচ" : printTargetBatch}</span>
                  </div>
                  <div>
                    <span>মোট শিক্ষার্থী: </span>
                    <span className="text-emerald-800">{printableList.length} জন</span>
                  </div>
                  <div>
                    <span>তারিখ: </span>
                    <span>{new Date().toLocaleDateString('bn-BD')}</span>
                  </div>
                </div>

                {/* Print Table */}
                <table className="w-full text-xs border-collapse border border-slate-400">
                  <thead>
                    <tr className="bg-slate-100 text-[11px] font-black text-slate-800">
                      <th className="border border-slate-400 p-2 text-center w-8">ক্রঃ</th>
                      <th className="border border-slate-400 p-2 text-center w-24">ট্র্যাকিং আইডি</th>
                      <th className="border border-slate-400 p-2 text-center w-12">রোল</th>
                      <th className="border border-slate-400 p-2">শিক্ষার্থীর নাম</th>
                      <th className="border border-slate-400 p-2">পিতার নাম</th>
                      <th className="border border-slate-400 p-2 text-center">মোবাইল</th>
                      <th className="border border-slate-400 p-2">জেলা ও মাদরাসা</th>
                      <th className="border border-slate-400 p-2 text-center w-16">স্ট্যাটাস</th>
                      <th className="border border-slate-400 p-2 text-center w-24">শিক্ষার্থীর স্বাক্ষর</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printableList.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="border border-slate-400 p-4 text-center text-slate-500">
                          কোনো শিক্ষার্থীর তথ্য পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      printableList.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="border border-slate-400 p-2 text-center font-bold">{idx + 1}</td>
                          <td className="border border-slate-400 p-2 text-center font-mono font-bold text-[10px]">{item.trackingId}</td>
                          <td className="border border-slate-400 p-2 text-center font-bold">{item.rollNo || "—"}</td>
                          <td className="border border-slate-400 p-2 font-bold">{item.applicantName}</td>
                          <td className="border border-slate-400 p-2">{item.fatherName}</td>
                          <td className="border border-slate-400 p-2 text-center font-mono">{item.phone}</td>
                          <td className="border border-slate-400 p-2 text-[11px]">
                            {item.district ? `${item.district}` : ""} {item.currentMadrasa ? `(${item.currentMadrasa})` : ""}
                          </td>
                          <td className="border border-slate-400 p-2 text-center font-bold text-[10px]">
                            {item.status === "ACCEPTED" ? "অনুমোদিত" : item.status === "REJECTED" ? "বাতিল" : "অপেক্ষমান"}
                          </td>
                          <td className="border border-slate-400 p-2"></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Signatures Footer */}
                <div className="mt-16 pt-8 grid grid-cols-3 gap-4 text-center text-xs font-bold text-slate-700">
                  <div>
                    <div className="border-t border-slate-400 pt-1.5 inline-block min-w-[120px]">
                      প্রস্তুতকারক
                    </div>
                  </div>
                  <div>
                    <div className="border-t border-slate-400 pt-1.5 inline-block min-w-[120px]">
                      প্রশিক্ষণ সচিব
                    </div>
                  </div>
                  <div>
                    <div className="border-t border-slate-400 pt-1.5 inline-block min-w-[120px]">
                      সভাপতি / মহাসচিব
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
