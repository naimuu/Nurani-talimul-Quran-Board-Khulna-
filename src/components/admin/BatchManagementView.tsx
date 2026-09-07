"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  ExternalLink, 
  Sparkles, 
  BookOpen, 
  Filter, 
  Layers,
  ArrowRight,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  Image as ImageIcon,
  Upload,
  X,
  Loader2,
  Users
} from "lucide-react";
import { useDialog } from "@/components/ui/DialogProvider";
import AdmissionRequestsTab from "./training/AdmissionRequestsTab";

export interface BatchItem {
  id?: string;
  _id?: string;
  medium: "bangla" | "arabic";
  title: string;
  subtitle: string;
  badge?: string;
  durationDays: string;
  durationText?: string;
  price: string;
  location: string;
  date: string;
  batch: string;
  phone: string;
  link?: string;
  regLink?: string;
  coverImage?: string;
  isActive: boolean;
  order?: number;
  createdAt?: string;
}

const emptyForm: BatchItem = {
  medium: "bangla",
  title: "",
  subtitle: "",
  badge: "",
  durationDays: "",
  durationText: "দিন মেয়াদী প্রশিক্ষণ",
  price: "",
  location: "খুলনা বিভাগীয় কার্যালয় ও জেলা কেন্দ্র",
  date: "চলমান / নতুন সেশন",
  batch: "",
  phone: "",
  link: "/training/moallem-bangla",
  regLink: "/register",
  coverImage: "",
  isActive: true,
  order: 0
};

export default function BatchManagementView() {
  const { alert, confirm } = useDialog();
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMedium, setFilterMedium] = useState<"all" | "bangla" | "arabic">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<BatchItem | null>(null);
  const [formData, setFormData] = useState<BatchItem>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
        setIsCreateMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/training/batches?all=true");
      if (res.ok) {
        const data = await res.json();
        setBatches(data.batches || []);
      }
    } catch (error) {
      console.error("Failed to load batches", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert({ title: "সতর্কতা", message: "অনুগ্রহ করে একটি ইমেজ ফাইল নির্বাচন করুন (JPG, PNG, WebP ইত্যাদি)", type: "warning" });
      return;
    }

    try {
      setUploadingImage(true);
      const dataForm = new FormData();
      dataForm.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: dataForm
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData(prev => ({ ...prev, coverImage: data.url }));
        alert({ title: "সফল", message: "কভার ইমেজ আপলোড সম্পন্ন হয়েছে!", type: "success" });
      } else {
        throw new Error(data.error || "আপলোড ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      alert({ title: "ত্রুটি", message: err.message || "ছবি আপলোড করতে সমস্যা হয়েছে", type: "error" });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const openCreateModal = (mediumPref: "bangla" | "arabic" = "bangla") => {
    setEditingBatch(null);
    if (mediumPref === "arabic") {
      setFormData({
        ...emptyForm,
        medium: "arabic",
        title: "মুয়াল্লিম প্রশিক্ষণ (আরবী)",
        subtitle: "উচ্চতর আরবী শিক্ষক প্রশিক্ষণ",
        badge: "আরবি মাধ্যম",
        durationDays: "",
        price: "",
        batch: "",
        phone: "",
        coverImage: "",
        link: "/training/moallem-arabic"
      });
    } else {
      setFormData({
        ...emptyForm,
        medium: "bangla",
        title: "মুয়াল্লিম প্রশিক্ষণ (বাংলা)",
        subtitle: "শিক্ষক প্রশিক্ষণ কোর্স",
        badge: "বাংলা মাধ্যম",
        durationDays: "",
        price: "",
        batch: "",
        phone: "",
        coverImage: "",
        link: "/training/moallem-bangla"
      });
    }
    setModalOpen(true);
  };

  const openEditModal = (batch: BatchItem) => {
    setEditingBatch(batch);
    setFormData({ 
      ...batch,
      coverImage: batch.coverImage || ""
    });
    setModalOpen(true);
  };

  const handleMediumChange = (newMedium: "bangla" | "arabic") => {
    if (editingBatch) {
      setFormData(prev => ({
        ...prev,
        medium: newMedium,
        badge: newMedium === "arabic" ? "আরবি মাধ্যম" : "বাংলা মাধ্যম"
      }));
    } else {
      if (newMedium === "arabic") {
        setFormData(prev => ({
          ...prev,
          medium: "arabic",
          title: "মুয়াল্লিম প্রশিক্ষণ (আরবী)",
          subtitle: "৫০ দিন ব্যাপী উচ্চতর আরবী শিক্ষক প্রশিক্ষণ",
          badge: "আরবি মাধ্যম",
          durationDays: "৫০",
          price: "৳ ৭,৫০০",
          link: "/training/moallem-arabic"
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          medium: "bangla",
          title: "মুয়াল্লিম প্রশিক্ষণ (বাংলা)",
          subtitle: "৩০ দিন ব্যাপী বিশেষ শিক্ষক প্রশিক্ষণ কোর্স",
          badge: "বাংলা মাধ্যম",
          durationDays: "৩০",
          price: "৳ ৫,৫০০",
          link: "/training/moallem-bangla"
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const batchId = editingBatch?.id || editingBatch?._id;
      const url = editingBatch ? `/api/training/batches/${batchId}` : "/api/training/batches";
      const method = editingBatch ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "সংরক্ষণ ব্যর্থ হয়েছে");
      }

      alert({
        title: "সফল!",
        message: editingBatch ? "ব্যাচের তথ্য সফলভাবে আপডেট হয়েছে!" : "নতুন ব্যাচ সফলভাবে যুক্ত হয়েছে!",
        type: "success"
      });

      setModalOpen(false);
      fetchBatches();
    } catch (err: any) {
      alert({
        title: "ত্রুটি!",
        message: err.message || "সংরক্ষণ করতে সমস্যা হয়েছে",
        type: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (batch: BatchItem) => {
    const batchId = batch.id || batch._id;
    if (!batchId) return;

    const confirmed = await confirm({
      title: "মুছে ফেলার নিশ্চিতকরণ",
      message: `আপনি কি নিশ্চিতভাবে "${batch.batch}" মুছে ফেলতে চান?`,
      type: "warning",
      confirmText: "মুছে ফেলুন",
      cancelText: "বাতিল"
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/training/batches/${batchId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "মুছে ফেলা ব্যর্থ হয়েছে");
      }

      alert({
        title: "সফল!",
        message: "ব্যাচ সফলভাবে মুছে ফেলা হয়েছে!",
        type: "success"
      });
      fetchBatches();
    } catch (err: any) {
      alert({
        title: "ত্রুটি!",
        message: err.message || "মুছে ফেলতে সমস্যা হয়েছে",
        type: "error"
      });
    }
  };

  const toggleActiveStatus = async (batch: BatchItem) => {
    const batchId = batch.id || batch._id;
    if (!batchId) return;

    const newStatus = !batch.isActive;

    // Optimistic update
    setBatches(prev => prev.map(b => (b.id === batchId || b._id === batchId) ? { ...b, isActive: newStatus } : b));

    try {
      const res = await fetch(`/api/training/batches/${batchId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus })
      });
      if (!res.ok) throw new Error();
    } catch {
      // Revert on error
      setBatches(prev => prev.map(b => (b.id === batchId || b._id === batchId) ? { ...b, isActive: !newStatus } : b));
      alert({
        title: "ত্রুটি",
        message: "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে",
        type: "error"
      });
    }
  };

  const filteredBatches = batches.filter(b => {
    const matchesFilter = filterMedium === "all" || b.medium === filterMedium;
    const matchesSearch = searchQuery === "" || 
      b.batch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const banglaCount = batches.filter(b => b.medium === "bangla").length;
  const arabicCount = batches.filter(b => b.medium === "arabic").length;

  const [activeMainTab, setActiveMainTab] = useState<"batches" | "requests">("batches");
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);

  useEffect(() => {
    // Initial fetch of pending requests count
    fetch("/api/training/admissions?status=PENDING")
      .then(res => res.json())
      .then(data => {
        if (data.counts && data.counts.pending !== undefined) {
          setPendingRequestsCount(data.counts.pending);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveMainTab("batches")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeMainTab === "batches"
              ? "bg-emerald-900 text-white shadow-sm"
              : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>প্রশিক্ষণ ব্যাচ পরিচালনা</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
            activeMainTab === "batches" ? "bg-emerald-800 text-emerald-200" : "bg-slate-100 text-slate-600"
          }`}>
            {batches.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("requests")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer relative ${
            activeMainTab === "requests"
              ? "bg-emerald-900 text-white shadow-sm"
              : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>ভর্তি আবেদনসমূহ (Requests)</span>
          {pendingRequestsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-500 text-slate-950 shadow-xs">
              {pendingRequestsCount} অপেক্ষমান
            </span>
          )}
        </button>
      </div>

      {activeMainTab === "requests" ? (
        <AdmissionRequestsTab onPendingCountChange={setPendingRequestsCount} />
      ) : (
        <>
          {/* Header with Title & Stats */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
                <GraduationCap className="w-4 h-4" />
                <span>মুয়াল্লিম প্রশিক্ষণ কোর্স ও সেশন পরিচালনা</span>
              </div>
              <h1 className="text-2xl font-black text-slate-800">
                প্রশিক্ষণ ব্যাচ পরিচালনা
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                বাংলা ও আরবি মাধ্যমের চলমান ও নতুন ব্যাচ তৈরি করুন। হোমপেজের ২-কার্ড স্লাইডারে স্বয়ংক্রিয়ভাবে স্লাইড হয়ে প্রদর্শিত হবে।
              </p>
            </div>

            {/* Single Dropdown Button (Opens only on click) */}
            <div 
              ref={createMenuRef}
              className="relative w-full sm:w-auto"
            >
              <button
                type="button"
                onClick={() => setIsCreateMenuOpen((prev) => !prev)}
                className="w-full sm:w-auto inline-flex items-center justify-between gap-3 px-5 py-2.5 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white rounded-xl font-bold text-sm shadow-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>+ নতুন ব্যাচ তৈরি করুন</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCreateMenuOpen ? 'rotate-180 text-amber-300' : 'text-emerald-200'}`} />
              </button>

          <AnimatePresence>
            {isCreateMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-40 space-y-1"
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateMenuOpen(false);
                    openCreateModal("bangla");
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 transition-colors text-left group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-slate-900 group-hover:text-emerald-900">বাংলা মাধ্যম ব্যাচ</span>
                    <span className="text-[10.5px] text-slate-400">নতুন সেশন বা ব্যাচ যুক্ত করুন</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsCreateMenuOpen(false);
                    openCreateModal("arabic");
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50 text-slate-800 hover:text-amber-950 transition-colors text-left group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-100/80 text-amber-800 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-slate-900 group-hover:text-amber-950">আরবি মাধ্যম ব্যাচ</span>
                    <span className="text-[10.5px] text-slate-400">নতুন সেশন বা ব্যাচ যুক্ত করুন</span>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
          <button
            onClick={() => setFilterMedium("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMedium === "all" 
                ? "bg-white text-slate-900 shadow-xs" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            সকল ব্যাচ ({batches.length})
          </button>
          <button
            onClick={() => setFilterMedium("bangla")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterMedium === "bangla" 
                ? "bg-emerald-700 text-white shadow-xs" 
                : "text-emerald-800 hover:bg-emerald-50"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>বাংলা মাধ্যম ({banglaCount})</span>
          </button>
          <button
            onClick={() => setFilterMedium("arabic")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterMedium === "arabic" 
                ? "bg-amber-600 text-white shadow-xs" 
                : "text-amber-800 hover:bg-amber-50"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>আরবি মাধ্যম ({arabicCount})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="ব্যাচ নং, শিরোনাম বা জেলা দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>
      </div>

      {/* Batches Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">ব্যাচের তালিকা লোড হচ্ছে...</p>
        </div>
      ) : filteredBatches.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-base">কোনো ব্যাচ পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500 mt-1">উপরে &quot;নতুন ব্যাচ&quot; বাটনে ক্লিক করে নতুন সেশন ও ব্যাচ যুক্ত করুন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filteredBatches.map((item) => {
            const isBangla = item.medium === "bangla";
            return (
              <motion.div
                key={item.id || item._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-2xl border ${
                  isBangla 
                    ? "border-emerald-200 bg-gradient-to-b from-emerald-50/50 to-white" 
                    : "border-amber-200 bg-gradient-to-b from-amber-50/50 to-white"
                } p-5 shadow-xs flex flex-col justify-between relative group hover:shadow-md transition-all overflow-hidden`}
              >
                {/* Faded Background Cover Image */}
                {item.coverImage && (
                  <div
                    className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-15 filter brightness-105"
                    style={{ backgroundImage: `url(${item.coverImage})` }}
                  />
                )}

                <div className="relative z-10">
                  {/* Top Bar: Medium Badge, Status & Actions */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${
                      isBangla 
                        ? "bg-emerald-100 text-emerald-900 border-emerald-300" 
                        : "bg-amber-100 text-amber-950 border-amber-300"
                    }`}>
                      {item.badge || (isBangla ? "বাংলা মাধ্যম" : "আরবি মাধ্যম")}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleActiveStatus(item)}
                        title={item.isActive ? "সক্রিয় (ক্লিক করে নিষ্ক্রিয় করুন)" : "নিষ্ক্রিয় (ক্লিক করে সক্রিয় করুন)"}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 transition-all ${
                          item.isActive 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                            : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        <span>{item.isActive ? "হোমে দৃশ্যমান" : "লুকানো"}</span>
                      </button>

                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-white transition-colors border border-transparent hover:border-slate-200"
                        title="সম্পাদনা করুন"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Batch Title & Duration */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold shrink-0 text-white shadow-xs ${
                      isBangla 
                        ? "bg-gradient-to-br from-[#052e23] to-emerald-700" 
                        : "bg-gradient-to-br from-[#1e1b4b] to-amber-700"
                    }`}>
                      <span className="text-lg font-black leading-none">{item.durationDays}</span>
                      <span className="text-[9px] uppercase mt-0.5">দিন</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Information Details Card */}
                  <div className="space-y-2 bg-white/90 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-700 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-xs">
                        {item.batch}
                      </span>
                      <span className="font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-xs">
                        ফি: {item.price}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="truncate">{item.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.date}</span>
                    </div>

                    {/* Separate Clickable Mobile Numbers */}
                    <div className="flex items-start gap-2 pt-1.5 border-t border-slate-100">
                      <Phone className="w-3.5 h-3.5 text-red-500 shrink-0 mt-1" />
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.phone.split(',').map((ph, idx) => {
                          const cleanPhone = ph.trim().replace(/[^0-9+]/g, '');
                          return (
                            <a
                              key={idx}
                              href={`tel:${cleanPhone}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-900 border border-red-200 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-2xs"
                              title={`সরাসরি কল করুন: ${ph.trim()}`}
                            >
                              <span>{ph.trim()}</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Meta */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>সিরিয়াল: #{item.order || 0}</span>
                  <span className="text-slate-500">{item.link || "ডিফল্ট লিংক"}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Batch Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !saving && setModalOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 z-10"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-[#052e23] via-emerald-800 to-[#0a4233] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg sm:text-xl">
                      {editingBatch ? "ব্যাচের তথ্য সম্পাদনা" : "নতুন প্রশিক্ষণ ব্যাচ তৈরি"}
                    </h3>
                    <p className="text-xs text-emerald-200 font-medium">
                      প্রশিক্ষণ সময়সূচি ও কোর্সের বিবরণ পূরণ করুন
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Medium Selection Switch */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    প্রশিক্ষণ মাধ্যম (Medium) *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleMediumChange("bangla")}
                      className={`py-3 px-4 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        formData.medium === "bangla"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 text-slate-600"
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                      <span>বাংলা মাধ্যম</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMediumChange("arabic")}
                      className={`py-3 px-4 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        formData.medium === "arabic"
                          ? "border-amber-600 bg-amber-50 text-amber-950 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 text-slate-600"
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full bg-amber-600"></span>
                      <span>আরবি মাধ্যম</span>
                    </button>
                  </div>
                </div>

                {/* Batch Name & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ব্যাচ নম্বর ও নাম *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="উদাঃ ব্যাচ নং: ১২৫ (বাংলা)"
                      value={formData.batch}
                      onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      সময়কাল (দিন) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="উদাঃ ৩০ বা ৫০"
                      value={formData.durationDays}
                      onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    />
                  </div>
                </div>

                {/* Course Title & Subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      কোর্সের শিরোনাম *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="মুয়াল্লিম প্রশিক্ষণ (বাংলা)"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      সাবটাইটেল / বিবরণ
                    </label>
                    <input
                      type="text"
                      placeholder="৩০ দিন ব্যাপী বিশেষ শিক্ষক প্রশিক্ষণ কোর্স"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    />
                  </div>
                </div>

                {/* Course Fee & Date / Session */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      কোর্স ফি *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="উদাঃ ৳ ৫,৫০০"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      সেশন / তারিখ *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="উদাঃ চলমান / নতুন সেশন বা ১ নভেম্বর ২০২৬"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    />
                  </div>
                </div>

                {/* Location & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      স্থান ও কেন্দ্র *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="উদাঃ খুলনা বিভাগীয় কার্যালয় ও জেলা কেন্দ্র"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      যোগাযোগ নম্বরসমূহ (কমা দিয়ে লিখুন) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="01966-935832, 01988-977209"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    />
                  </div>
                </div>

                {/* Links & Visibility */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      বিস্তারিত পেজ লিংক
                    </label>
                    <input
                      type="text"
                      placeholder="/training/moallem-bangla"
                      value={formData.link || ""}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      আবেদন পেজ লিংক
                    </label>
                    <input
                      type="text"
                      placeholder="/register"
                      value={formData.regLink || ""}
                      onChange={(e) => setFormData({ ...formData, regLink: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    />
                  </div>
                </div>

                {/* Cover Image for Batch Card */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold text-slate-800">
                        কার্ড কভার ইমেজ / ব্যাকগ্রাউন্ড ছবি (Cover Image)
                      </label>
                      <p className="text-[11px] text-slate-500">
                        কার্ড ও বিস্তারিত পেজের ব্যানারের ব্যাকগ্রাউন্ডে ঝাপসা (Faded) হয়ে সুন্দরভাবে প্রদর্শিত হবে
                      </p>
                    </div>
                    {formData.coverImage && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, coverImage: "" }))}
                        className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ছবি মুছুন</span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 items-start">
                    {/* Preview / Upload Trigger Box */}
                    <div
                      onClick={() => !uploadingImage && fileInputRef.current?.click()}
                      className={`relative w-full sm:w-44 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden shrink-0 group ${
                        formData.coverImage 
                          ? "border-emerald-500 bg-slate-900" 
                          : "border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/30"
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                      />

                      {formData.coverImage ? (
                        <>
                          <img
                            src={formData.coverImage}
                            alt="Cover preview"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1">
                            <Upload className="w-3.5 h-3.5" />
                            <span>ছবি পরিবর্তন</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center text-center p-2">
                          {uploadingImage ? (
                            <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mb-1" />
                          ) : (
                            <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 mb-1 transition-colors" />
                          )}
                          <span className="text-[11px] font-bold text-slate-600 group-hover:text-emerald-700">
                            {uploadingImage ? "আপলোড হচ্ছে..." : "ছবি আপলোড করুন"}
                          </span>
                          <span className="text-[9px] text-slate-400">JPG, PNG, WebP</span>
                        </div>
                      )}
                    </div>

                    {/* Direct URL Input */}
                    <div className="flex-1 w-full space-y-1.5">
                      <label className="block text-[11px] font-semibold text-slate-600">
                        অথবা সরাসরি ছবির লিংক দিন (Image URL):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="https://... বা /uploads/images/..."
                          value={formData.coverImage || ""}
                          onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                          className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                        />
                        {formData.coverImage && (
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, coverImage: "" }))}
                            className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 border border-slate-200"
                            title="মুছুন"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Mini live banner card simulation preview */}
                      {formData.coverImage && (
                        <div className="mt-2 p-2.5 rounded-xl bg-gradient-to-r from-[#052e23] to-[#047857] text-white relative overflow-hidden text-xs">
                          <div
                            className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none"
                            style={{ backgroundImage: `url(${formData.coverImage})` }}
                          />
                          <div className="relative z-10 flex items-center justify-between">
                            <span className="font-bold text-[11px] opacity-90 truncate">প্রিভিউ: {formData.title || "কোর্সের নাম"}</span>
                            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">Faded Effect</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center gap-3 pt-2">
                  <label className="relative flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-bold text-slate-800">
                      এই ব্যাচটি হোমপেজের স্লাইডারে সক্রিয় (Active) রাখুন
                    </span>
                  </label>
                </div>

                {/* Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors"
                  >
                    বাতিল
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white font-bold text-sm shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    {saving ? "সংরক্ষণ হচ্ছে..." : editingBatch ? "আপডেট করুন" : "ব্যাচ তৈরি করুন"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </>
      )}
    </div>
  );
}
