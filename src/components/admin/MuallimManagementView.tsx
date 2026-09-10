"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck,
  Plus,
  Search,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  BookOpen,
  GraduationCap,
  Award,
  Upload,
  Image as ImageIcon,
  Loader2,
  X,
  Printer,
  SlidersHorizontal,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  FileText,
  BadgeCheck,
  ShieldCheck,
  User,
  Filter
} from "lucide-react";
import { useDialog } from "@/components/ui/DialogProvider";
import GeoAddressSelector, { GeoAddressData } from "@/components/common/GeoAddressSelector";

export interface MuallimItem {
  id: string;
  _id?: string;
  name: string;
  phone: string;
  altPhone?: string;
  email?: string;
  nid?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  designation?: string;
  specialty?: string;
  education?: string;
  trainingDetails?: string;
  experienceYears?: string;
  division?: string;
  district?: string;
  upazila?: string;
  union?: string;
  village?: string;
  address?: string;
  photoUrl?: string;
  status: "ACTIVE" | "INACTIVE" | "ON_LEAVE";
  notes?: string;
  order?: number;
  assignedBatchesCount?: number;
  batches?: any[];
  createdAt?: string;
}

const emptyMuallimForm: Omit<MuallimItem, "id"> = {
  name: "",
  phone: "",
  altPhone: "",
  email: "",
  nid: "",
  gender: "MALE",
  designation: "প্রশিক্ষক",
  specialty: "সহীহ কুরআন ও তাজবীদ",
  education: "দাওরায়ে হাদিস",
  trainingDetails: "নূরানী তালিমুল কুরআন বোর্ড প্রশিক্ষণপ্রাপ্ত",
  experienceYears: "৫",
  division: "খুলনা",
  district: "খুলনা",
  upazila: "",
  union: "",
  village: "",
  address: "",
  photoUrl: "",
  status: "ACTIVE",
  notes: "",
  order: 0
};

export default function MuallimManagementView() {
  const { alert, confirm } = useDialog();

  // Tab: 'list' (মুয়াল্লিম তালিকা) | 'report' (মুয়াল্লিমভিত্তিক ব্যাচ রিপোর্ট)
  const [activeTab, setActiveTab] = useState<"list" | "report">("list");
  
  const [muallims, setMuallims] = useState<MuallimItem[]>([]);
  const [allBatches, setAllBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterDesignation, setFilterDesignation] = useState<string>("ALL");
  const [reportSelectedMuallim, setReportSelectedMuallim] = useState<string>("ALL");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMuallim, setEditingMuallim] = useState<MuallimItem | null>(null);
  const [formData, setFormData] = useState<Omit<MuallimItem, "id">>(emptyMuallimForm);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Muallims and Batches
  const loadData = async () => {
    try {
      setLoading(true);
      const [mRes, bRes] = await Promise.all([
        fetch("/api/muallims"),
        fetch("/api/training/batches?all=true")
      ]);

      const mData = await mRes.json();
      const bData = await bRes.json();

      if (mData.success) {
        setMuallims(mData.muallims || []);
      }
      if (bData.success) {
        setAllBatches(bData.batches || []);
      }
    } catch (err: any) {
      console.error("Error loading muallims:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Image Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert({
        title: "সতর্কতা",
        message: "অনুগ্রহ করে একটি ছবি ফাইল নির্বাচন করুন (JPG, PNG, WebP ইত্যাদি)",
        type: "warning"
      });
      return;
    }

    try {
      setUploadingPhoto(true);
      const dataForm = new FormData();
      dataForm.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: dataForm
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData(prev => ({ ...prev, photoUrl: data.url }));
        alert({ title: "সফল", message: "মুয়াল্লিমের ছবি আপলোড সম্পন্ন হয়েছে!", type: "success" });
      } else {
        throw new Error(data.error || "আপলোড ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      alert({ title: "ত্রুটি", message: err.message || "ছবি আপলোড করতে সমস্যা হয়েছে", type: "error" });
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingMuallim(null);
    setFormData(emptyMuallimForm);
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (muallim: MuallimItem) => {
    setEditingMuallim(muallim);
    setFormData({
      name: muallim.name || "",
      phone: muallim.phone || "",
      altPhone: muallim.altPhone || "",
      email: muallim.email || "",
      nid: muallim.nid || "",
      gender: muallim.gender || "MALE",
      designation: muallim.designation || "প্রশিক্ষক",
      specialty: muallim.specialty || "",
      education: muallim.education || "",
      trainingDetails: muallim.trainingDetails || "",
      experienceYears: muallim.experienceYears || "",
      division: muallim.division || "খুলনা",
      district: muallim.district || "খুলনা",
      upazila: muallim.upazila || "",
      union: muallim.union || "",
      village: muallim.village || "",
      address: muallim.address || "",
      photoUrl: muallim.photoUrl || "",
      status: muallim.status || "ACTIVE",
      notes: muallim.notes || "",
      order: muallim.order || 0
    });
    setModalOpen(true);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert({ title: "সতর্কতা", message: "মুয়াল্লিমের পূর্ণ নাম ও মোবাইল নম্বর পূরণ করুন", type: "warning" });
      return;
    }

    setSaving(true);
    try {
      const muallimId = editingMuallim?.id || editingMuallim?._id;
      const url = editingMuallim ? `/api/muallims/${muallimId}` : "/api/muallims";
      const method = editingMuallim ? "PUT" : "POST";

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
        title: "সফল",
        message: editingMuallim ? "মুয়াল্লিমের তথ্য সফলভাবে আপডেট হয়েছে" : "নতুন মুয়াল্লিম সফলভাবে যুক্ত হয়েছে",
        type: "success"
      });

      setModalOpen(false);
      loadData();
    } catch (err: any) {
      alert({ title: "ত্রুটি", message: err.message || "সংরক্ষণ করতে সমস্যা হয়েছে", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Delete Handler
  const handleDelete = async (muallim: MuallimItem) => {
    const isConfirmed = await confirm({
      title: "মুয়াল্লিম মুছে ফেলার নিশ্চিতকরণ",
      message: `আপনি কি নিশ্চিতভাবে "${muallim.name}" মুয়াল্লিমের তথ্য মুছে ফেলতে চান? এতে উনার সাথে অ্যাসাইনকৃত ব্যাচের লিংক বিচ্ছিন্ন হবে।`,
      confirmText: "হ্যাঁ, মুছে ফেলুন",
      cancelText: "বাতিল",
      type: "warning"
    });

    if (!isConfirmed) return;

    try {
      const muallimId = muallim.id || muallim._id;
      const res = await fetch(`/api/muallims/${muallimId}`, {
        method: "DELETE"
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "মুছে ফেলা ব্যর্থ হয়েছে");
      }

      alert({ title: "সফল", message: "মুয়াল্লিম সফলভাবে মুছে ফেলা হয়েছে", type: "success" });
      loadData();
    } catch (err: any) {
      alert({ title: "ত্রুটি", message: err.message || "মুছে ফেলতে সমস্যা হয়েছে", type: "error" });
    }
  };

  // Toggle status
  const toggleStatus = async (muallim: MuallimItem) => {
    const newStatus = muallim.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const muallimId = muallim.id || muallim._id;
      const res = await fetch(`/api/muallims/${muallimId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMuallims(prev =>
          prev.map(m => (m.id === muallimId || m._id === muallimId ? { ...m, status: newStatus } : m))
        );
      }
    } catch (err) {
      console.error("Status toggle error:", err);
    }
  };

  // Filtered Muallims
  const filteredMuallims = useMemo(() => {
    return muallims.filter(m => {
      const matchesSearch =
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.phone?.includes(searchQuery) ||
        m.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.education?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === "ALL" || m.status === filterStatus;
      const matchesDesig = filterDesignation === "ALL" || m.designation === filterDesignation;

      return matchesSearch && matchesStatus && matchesDesig;
    });
  }, [muallims, searchQuery, filterStatus, filterDesignation]);

  // Unique designations for filter
  const uniqueDesignations = useMemo(() => {
    const set = new Set<string>();
    muallims.forEach(m => {
      if (m.designation) set.add(m.designation);
    });
    return Array.from(set);
  }, [muallims]);

  // Statistics
  const stats = useMemo(() => {
    const total = muallims.length;
    const active = muallims.filter(m => m.status === "ACTIVE").length;
    const totalBatchesAssigned = allBatches.filter(b => b.muallimId).length;
    return { total, active, totalBatchesAssigned };
  }, [muallims, allBatches]);

  // Muallim Wise Batch Report Data
  const reportData = useMemo(() => {
    return muallims
      .filter(m => reportSelectedMuallim === "ALL" || m.id === reportSelectedMuallim || m._id === reportSelectedMuallim)
      .map(m => {
        const assigned = allBatches.filter(b => {
          const bMuallimId = b.muallimId ? String(b.muallimId) : "";
          const mId = String(m.id || m._id);
          return bMuallimId === mId || (b.muallimName && b.muallimName.trim() === m.name.trim());
        });
        return {
          muallim: m,
          batches: assigned
        };
      });
  }, [muallims, allBatches, reportSelectedMuallim]);

  // Print Report Handler
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#052e23] via-[#074b39] to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 text-xs font-bold tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>নূরানী তালিমুল কুরআন বোর্ড খুলনা</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              মুয়াল্লিম ও প্রশিক্ষক পরিচালনা
            </h1>
            <p className="text-emerald-100/90 text-sm sm:text-base max-w-2xl font-medium">
              বোর্ডের অভিজ্ঞ শিক্ষক ও প্রশিক্ষকদের পূর্ণাঙ্গ ডাটাবেজ, শিক্ষাগত যোগ্যতা, প্রশিক্ষণ বিবরণ ও ব্যাচভিত্তিক দায়িত্বের সময়সূচি নিয়ন্ত্রণ করুন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg shadow-amber-400/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
              <span>নতুন মুয়াল্লিম যোগ করুন</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 border-t border-emerald-700/50">
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
            <span className="text-xs text-emerald-200 font-medium">সর্বমোট শিক্ষক/মুয়াল্লিম</span>
            <div className="text-2xl font-black text-white mt-1">{stats.total} জন</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
            <span className="text-xs text-emerald-200 font-medium">সক্রিয় প্রশিক্ষক</span>
            <div className="text-2xl font-black text-amber-300 mt-1">{stats.active} জন</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10 col-span-2 sm:col-span-1">
            <span className="text-xs text-emerald-200 font-medium">অ্যাসাইনকৃত ব্যাচ সংখ্যা</span>
            <div className="text-2xl font-black text-white mt-1">{stats.totalBatchesAssigned} টি</div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === "list"
                ? "bg-white text-emerald-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>মুয়াল্লিম তালিকা ({muallims.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("report")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === "report"
                ? "bg-white text-emerald-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4 text-amber-600" />
            <span>মুয়াল্লিমভিত্তিক ব্যাচ রিপোর্ট</span>
          </button>
        </div>

        {activeTab === "report" && (
          <button
            onClick={handlePrintReport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-2xs transition-all"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>রিপোর্ট প্রিন্ট করুন</span>
          </button>
        )}
      </div>

      {/* TAB 1: MUALLIM LIST */}
      {activeTab === "list" && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="নাম, ফোন নম্বর, বিশেষত্ব, শিক্ষাগত যোগ্যতা বা জেলা দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-emerald-600"
              >
                <option value="ALL">সকল স্ট্যাটাস</option>
                <option value="ACTIVE">সক্রিয় (Active)</option>
                <option value="INACTIVE">নিষ্ক্রিয় (Inactive)</option>
                <option value="ON_LEAVE">ছুটিতে (On Leave)</option>
              </select>

              {/* Designation Filter */}
              {uniqueDesignations.length > 0 && (
                <select
                  value={filterDesignation}
                  onChange={e => setFilterDesignation(e.target.value)}
                  className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-emerald-600"
                >
                  <option value="ALL">সকল পদবী</option>
                  {uniqueDesignations.map(d => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              )}

              {(searchQuery || filterStatus !== "ALL" || filterDesignation !== "ALL") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStatus("ALL");
                    setFilterDesignation("ALL");
                  }}
                  className="px-2.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  রিসেট
                </button>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm">মুয়াল্লিমদের তালিকা লোড হচ্ছে...</p>
            </div>
          ) : filteredMuallims.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
              <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 text-base">কোনো মুয়াল্লিম পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-500 mt-1">
                উপরে &quot;নতুন মুয়াল্লিম যোগ করুন&quot; বাটনে ক্লিক করে নতুন শিক্ষক যুক্ত করুন।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {filteredMuallims.map(item => {
                const assignedBatches = allBatches.filter(b => {
                  const bMuallimId = b.muallimId ? String(b.muallimId) : "";
                  const mId = String(item.id || item._id);
                  return bMuallimId === mId || (b.muallimName && b.muallimName.trim() === item.name.trim());
                });

                return (
                  <motion.div
                    key={item.id || item._id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group relative"
                  >
                    <div className="p-5">
                      {/* Top Bar: Designation & Status Toggle & Actions */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <Award className="w-3 h-3 text-emerald-600" />
                          <span>{item.designation || "মুয়াল্লিম"}</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleStatus(item)}
                            title={item.status === "ACTIVE" ? "সক্রিয় (ক্লিক করে নিষ্ক্রিয় করুন)" : "নিষ্ক্রিয় (ক্লিক করে সক্রিয় করুন)"}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 transition-all ${
                              item.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${item.status === "ACTIVE" ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                            <span>{item.status === "ACTIVE" ? "সক্রিয়" : "নিষ্ক্রিয়"}</span>
                          </button>

                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
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

                      {/* Profile Photo & Primary Info */}
                      <div className="flex items-start gap-3.5 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200/80 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                          {item.photoUrl ? (
                            <img
                              src={item.photoUrl}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <User className="w-8 h-8 text-emerald-600" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-black text-slate-900 text-base leading-snug hover:text-emerald-800 transition-colors">
                            {item.name}
                          </h3>
                          {item.specialty && (
                            <p className="text-xs text-amber-800 font-bold mt-0.5 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                              <span className="truncate">{item.specialty}</span>
                            </p>
                          )}
                          {item.education && (
                            <p className="text-xs text-slate-500 mt-0.5 truncate flex items-center gap-1">
                              <GraduationCap className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{item.education}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Contact & Location Details */}
                      <div className="space-y-2 bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-xs text-slate-700">
                        {/* Phone */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>মোবাইল:</span>
                          </span>
                          <a
                            href={`tel:${item.phone}`}
                            className="font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
                          >
                            {item.phone}
                          </a>
                        </div>

                        {/* Location */}
                        {(item.district || item.address) && (
                          <div className="flex items-start justify-between gap-2 border-t border-slate-200/60 pt-1.5">
                            <span className="text-slate-500 flex items-center gap-1 shrink-0">
                              <MapPin className="w-3 h-3 text-red-500" />
                              <span>ঠিকানা:</span>
                            </span>
                            <span className="font-medium text-slate-700 text-right truncate">
                              {item.address ? `${item.address}, ` : ""}{item.upazila ? `${item.upazila}, ` : ""}{item.district || ""}
                            </span>
                          </div>
                        )}

                        {/* Board Training */}
                        {item.trainingDetails && (
                          <div className="flex items-start justify-between gap-2 border-t border-slate-200/60 pt-1.5">
                            <span className="text-slate-500 flex items-center gap-1 shrink-0">
                              <BadgeCheck className="w-3 h-3 text-amber-600" />
                              <span>বোর্ড ট্রেনিং:</span>
                            </span>
                            <span className="font-medium text-slate-700 text-right truncate max-w-[180px]">
                              {item.trainingDetails}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Info: Assigned Batches Badge */}
                    <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-600">দায়িত্বপ্রাপ্ত ব্যাচ:</span>
                        <span className={`px-2 py-0.5 rounded-full font-black text-[11px] ${
                          assignedBatches.length > 0 
                            ? "bg-emerald-600 text-white" 
                            : "bg-slate-200 text-slate-600"
                        }`}>
                          {assignedBatches.length} টি
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setReportSelectedMuallim(item.id || item._id || "ALL");
                          setActiveTab("report");
                        }}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5 hover:underline"
                      >
                        <span>ব্যাচ রিপোর্ট</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MUALLIM-WISE BATCH REPORT */}
      {activeTab === "report" && (
        <div className="space-y-6">
          {/* Report Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                প্রশিক্ষক নির্বাচন করুন:
              </label>
              <select
                value={reportSelectedMuallim}
                onChange={e => setReportSelectedMuallim(e.target.value)}
                className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-emerald-600"
              >
                <option value="ALL">সকল মুয়াল্লিম ({muallims.length} জন)</option>
                {muallims.map(m => (
                  <option key={m.id || m._id} value={m.id || m._id}>
                    {m.name} ({m.designation || "প্রশিক্ষক"})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              সর্বমোট {reportData.length} জন শিক্ষকের ব্যাচ শিডিউল ও বিবরণ
            </div>
          </div>

          {/* Printable Report Container */}
          <div className="space-y-6 print:space-y-8" id="muallim-batch-report">
            {reportData.map(({ muallim, batches }) => (
              <div
                key={muallim.id || muallim._id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden print:border-slate-400 print:shadow-none print:break-inside-avoid"
              >
                {/* Muallim Profile Banner */}
                <div className="p-5 sm:p-6 bg-gradient-to-r from-[#052e23] to-[#0a4837] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 overflow-hidden shrink-0 flex items-center justify-center">
                      {muallim.photoUrl ? (
                        <img
                          src={muallim.photoUrl}
                          alt={muallim.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-7 h-7 text-emerald-200" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg sm:text-xl font-black text-white">
                          {muallim.name}
                        </h2>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                          {muallim.designation || "প্রশিক্ষক"}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-200 mt-1 flex items-center gap-3 flex-wrap">
                        <span>মোবাইল: {muallim.phone}</span>
                        {muallim.specialty && <span>• বিশেষত্ব: {muallim.specialty}</span>}
                        {muallim.district && <span>• জেলা: {muallim.district}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/15 text-white border border-white/20">
                      অ্যাসাইনকৃত ব্যাচ: {batches.length} টি
                    </span>
                  </div>
                </div>

                {/* Assigned Batches Table / List */}
                <div className="p-4 sm:p-6">
                  {batches.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      <GraduationCap className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs font-semibold text-slate-600">
                        এই মুয়াল্লিমের অধীনে বর্তমানে কোনো প্রশিক্ষণ ব্যাচ অ্যাসাইন করা নেই।
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        &quot;প্রশিক্ষণ ব্যাচ&quot; সেকশনে গিয়ে যেকোনো ব্যাচে এই শিক্ষককে নির্বাচিত করতে পারেন।
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/80">
                            <th className="py-3 px-3">ব্যাচ নং ও শিরোনাম</th>
                            <th className="py-3 px-3">মাধ্যম</th>
                            <th className="py-3 px-3">দায়িত্বের সময়সূচী (Timing)</th>
                            <th className="py-3 px-3">সেশন / তারিখ</th>
                            <th className="py-3 px-3">স্থান ও কেন্দ্র</th>
                            <th className="py-3 px-3">কোর্স ফি ও মেয়াদ</th>
                            <th className="py-3 px-3 text-right">স্ট্যাটাস</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {batches.map((b, bIdx) => (
                            <tr key={b.id || b._id || bIdx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-3">
                                <div className="font-bold text-slate-900 text-sm">{b.batch}</div>
                                <div className="text-slate-500 text-[11px]">{b.title}</div>
                              </td>
                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                  b.medium === "arabic"
                                    ? "bg-amber-100 text-amber-900 border border-amber-200"
                                    : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                                }`}>
                                  {b.medium === "arabic" ? "আরবি" : "বাংলা"}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                {b.muallimTiming ? (
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 font-bold border border-emerald-200 text-xs">
                                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>{b.muallimTiming}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic">নির্ধারিত নেই</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-slate-700 font-medium">
                                {b.date || "চলমান সেশন"}
                              </td>
                              <td className="py-3 px-3 text-slate-600 truncate max-w-[160px]">
                                {b.location}
                              </td>
                              <td className="py-3 px-3 text-slate-700 font-medium">
                                <div>{b.durationDays} দিন</div>
                                <div className="text-slate-500 text-[11px] font-bold">{b.price}</div>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                  b.isActive 
                                    ? "bg-emerald-100 text-emerald-800" 
                                    : "bg-slate-100 text-slate-500"
                                }`}>
                                  {b.isActive ? "সক্রিয় ব্যাচ" : "সমাপ্ত/লুকানো"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE / EDIT MUALLIM MODAL */}
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
              className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 z-10"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-[#052e23] via-emerald-800 to-[#0a4233] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg sm:text-xl">
                      {editingMuallim ? "মুয়াল্লিমের তথ্য সম্পাদনা" : "নতুন মুয়াল্লিম যোগ করুন"}
                    </h3>
                    <p className="text-xs text-emerald-200 font-medium">
                      শিক্ষক/প্রশিক্ষকের ব্যক্তিগত, শিক্ষাগত ও ট্রেনিং সংক্রান্ত তথ্য পূরণ করুন
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
              <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                {/* Photo Upload Section */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center gap-4">
                  <div
                    onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
                    className={`relative w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden shrink-0 group ${
                      formData.photoUrl
                        ? "border-emerald-500 bg-slate-900"
                        : "border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/30"
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    {formData.photoUrl ? (
                      <>
                        <img
                          src={formData.photoUrl}
                          alt="Trainer preview"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold gap-1">
                          <Upload className="w-3 h-3" />
                          <span>পরিবর্তন</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-center p-2">
                        {uploadingPhoto ? (
                          <Loader2 className="w-5 h-5 text-emerald-600 animate-spin mb-1" />
                        ) : (
                          <Upload className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 mb-1 transition-colors" />
                        )}
                        <span className="text-[10px] font-bold text-slate-600 group-hover:text-emerald-700">
                          {uploadingPhoto ? "আপলোড হচ্ছে..." : "ছবি আপলোড"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-1.5 text-xs">
                    <label className="block font-bold text-slate-700">
                      মুয়াল্লিমের প্রোফাইল ছবি
                    </label>
                    <p className="text-[11px] text-slate-500">
                      পরিচ্ছন্ন পাসপোর্ট সাইজ ছবি নির্বাচন করুন। অথবা সরাসরি ছবির URL প্রদান করতে পারেন।
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://... বা /uploads/..."
                        value={formData.photoUrl || ""}
                        onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      />
                      {formData.photoUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, photoUrl: "" })}
                          className="px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          মুছুন
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Basic Personal Information */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>প্রাথমিক ও যোগাযোগের তথ্য</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        মুয়াল্লিমের পূর্ণ নাম *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="উদাঃ মাওলানা আব্দুল্লাহ আল মামুন"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        পদবী / ডেসিগনেশন *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="উদাঃ প্রধান প্রশিক্ষক, সহকারী প্রশিক্ষক, ক্বারী সাহেব"
                        value={formData.designation}
                        onChange={e => setFormData({ ...formData, designation: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        মোবাইল নম্বর *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="01712-XXXXXX"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        বিকল্প মোবাইল (অপশনাল)
                      </label>
                      <input
                        type="text"
                        placeholder="01912-XXXXXX"
                        value={formData.altPhone}
                        onChange={e => setFormData({ ...formData, altPhone: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ইমেইল (অপশনাল)
                      </label>
                      <input
                        type="email"
                        placeholder="trainer@gmail.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional & Board Training Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    <span>যোগ্যতা ও বোর্ড প্রশিক্ষণ বিবরণ</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        বিশেষত্ব / ফিল্ড (Specialty)
                      </label>
                      <input
                        type="text"
                        placeholder="সহীহ কুরআন, মাখরাজ ও সিফাত, তাজবীদ, ক্যালিগ্রাফি"
                        value={formData.specialty}
                        onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        শিক্ষাগত যোগ্যতা (Education)
                      </label>
                      <input
                        type="text"
                        placeholder="দাওরায়ে হাদিস, হিফজুল কুরআন, কামিল"
                        value={formData.education}
                        onChange={e => setFormData({ ...formData, education: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        বোর্ড প্রশিক্ষণ ও সনদ বিবরণ
                      </label>
                      <input
                        type="text"
                        placeholder="বোর্ড ট্রেনিং ব্যাচ নং: ৪২, প্রথম বিভাগ, সনদ নং: ১২৪০"
                        value={formData.trainingDetails}
                        onChange={e => setFormData({ ...formData, trainingDetails: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        প্রশিক্ষক হিসেবে অভিজ্ঞতা (বছর)
                      </label>
                      <input
                        type="text"
                        placeholder="উদাঃ ৫ বছর বা ৮ বছর"
                        value={formData.experienceYears}
                        onChange={e => setFormData({ ...formData, experienceYears: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Address & Location using GeoAddressSelector */}
                <GeoAddressSelector
                  label="ঠিকানা ও অবস্থান (ড্রপডাউন নির্বাচন)"
                  required={false}
                  value={{
                    division: formData.division || "খুলনা",
                    district: formData.district || "খুলনা",
                    upazila: formData.upazila || "",
                    union: formData.union || "",
                    village: formData.village || "",
                    fullAddress: formData.address || "",
                  }}
                  onChange={(geo: GeoAddressData) => {
                    setFormData(prev => ({
                      ...prev,
                      division: geo.division,
                      district: geo.district,
                      upazila: geo.upazila,
                      union: geo.union,
                      village: geo.village,
                      address: geo.fullAddress || [geo.village, geo.union, geo.upazila, geo.district, geo.division].filter(Boolean).join(", ")
                    }));
                  }}
                />

                {/* Status & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      সিস্টেম স্ট্যাটাস
                    </label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-bold bg-white"
                    >
                      <option value="ACTIVE">সক্রিয় (Active)</option>
                      <option value="INACTIVE">নিষ্ক্রিয় (Inactive)</option>
                      <option value="ON_LEAVE">ছুটিতে (On Leave)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      অভ্যন্তরীণ নোট (Internal Notes)
                    </label>
                    <input
                      type="text"
                      placeholder="বোর্ড সম্পর্কিত কোনো মন্তব্য বা বিশেষ নোট"
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    />
                  </div>
                </div>

                {/* Modal Footer Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-colors"
                  >
                    বাতিল
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm shadow-md shadow-emerald-700/20 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{editingMuallim ? "আপডেট সম্পন্ন করুন" : "মুয়াল্লিম যুক্ত করুন"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
