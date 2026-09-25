"use client";

import React, { useState, useEffect } from "react";
import {
  FileCheck,
  Building2,
  Users,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Printer,
  Eye,
  ShieldCheck,
  Filter,
  UserPlus,
  Loader2,
  ArrowRight,
  XCircle,
  Navigation,
  PlusCircle,
  Sliders,
  Trash2,
  Edit3,
  Save,
  RotateCcw,
  Plus,
  X,
  Minus,
  Info,
  Sparkles,
  BookOpen,
  GraduationCap,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import PrintableInspectionReport from "@/components/inspection/PrintableInspectionReport";
import InspectionForm from "@/components/inspection/InspectionForm";
import { INSPECTION_TYPES, GENERAL_CHECKLIST_ITEMS, STANDARD_INSPECTION_SUBJECTS } from "@/lib/inspectionUtils";

export default function AdminInspectionView() {
  const [applications, setApplications] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [inspectors, setInspectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Active View
  const [selectedReportForReview, setSelectedReportForReview] = useState<any | null>(null);
  const [selectedReportForPrint, setSelectedReportForPrint] = useState<any | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedAppForForm, setSelectedAppForForm] = useState<any | null>(null);
  const [assignModalApp, setAssignModalApp] = useState<any | null>(null);
  const [selectedInspectorId, setSelectedInspectorId] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Review Actions
  const [adminRemarks, setAdminRemarks] = useState("");
  const [customMadrasahCode, setCustomMadrasahCode] = useState("");
  const [reviewing, setReviewing] = useState(false);

  // Criteria & Marks Config Manager State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configActiveTab, setConfigActiveTab] = useState<"criteria" | "subjects" | "classes">("criteria");
  const [configLoading, setConfigLoading] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [criteriaConfig, setCriteriaConfig] = useState<any[]>([]);
  const [subjectsConfig, setSubjectsConfig] = useState<any[]>([]);
  const [configVersion, setConfigVersion] = useState<number>(1);
  const [configNotes, setConfigNotes] = useState("");

  // Curriculum Classes Management in Admin Inspection
  const [curriculumClasses, setCurriculumClasses] = useState<any[]>([]);
  const [loadingCurriculumClasses, setLoadingCurriculumClasses] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [isAddingClass, setIsAddingClass] = useState(false);

  // Sub-modal for Add/Edit Criteria Item
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Sub-modal for Add/Edit Subject Item
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<{ id?: string; sl: string; name: string } | null>(null);

  const fetchCriteriaConfig = async () => {
    setConfigLoading(true);
    try {
      const res = await fetch("/api/inspection/config");
      const data = await res.json();
      if (data.success && data.config) {
        setCriteriaConfig(data.config.checklistItems || []);
        setSubjectsConfig(data.config.subjects || STANDARD_INSPECTION_SUBJECTS);
        setConfigVersion(data.config.version || 1);
      }
    } catch (e) {
      console.error(e);
      toast.error("মানদণ্ড কনফিগারেশন লোড করা সম্ভব হয়নি");
    } finally {
      setConfigLoading(false);
    }
  };

  const fetchCurriculumClasses = async () => {
    setLoadingCurriculumClasses(true);
    try {
      const res = await fetch("/api/curriculum/classes");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCurriculumClasses(data);
      }
    } catch (e) {
      console.error("Failed to load curriculum classes:", e);
    } finally {
      setLoadingCurriculumClasses(false);
    }
  };

  const openConfigManager = () => {
    fetchCriteriaConfig();
    fetchCurriculumClasses();
    setIsConfigModalOpen(true);
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      const res = await fetch("/api/inspection/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checklistItems: criteriaConfig,
          subjects: subjectsConfig,
          notes: configNotes || `Admin update v${configVersion + 1}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "সংরক্ষণ ব্যর্থ হয়েছে");
      toast.success(data.message || "কনফিগারেশন সফলভাবে আপডেট হয়েছে");
      setConfigVersion(data.config?.version || configVersion + 1);
      setIsConfigModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "ত্রুটি দেখা দিয়েছে");
    } finally {
      setSavingConfig(false);
    }
  };

  // Class Management Handlers
  const handleAddCurriculumClass = async () => {
    if (!newClassName.trim()) {
      toast.error("শ্রেণির নাম লিখুন");
      return;
    }
    setIsAddingClass(true);
    try {
      const res = await fetch("/api/curriculum/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newClassName.trim(),
          order: curriculumClasses.length + 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "শ্রেণি যোগ করা সম্ভব হয়নি");
      toast.success(`'${newClassName.trim()}' শ্রেণি সফলভাবে যুক্ত হয়েছে!`);
      setNewClassName("");
      fetchCurriculumClasses();
    } catch (err: any) {
      toast.error(err.message || "ত্রুটি দেখা দিয়েছে");
    } finally {
      setIsAddingClass(false);
    }
  };

  const handleDeleteCurriculumClass = async (classId: string, className: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে '${className}' শ্রেণিটি মুছে ফেলতে চান?`)) return;
    try {
      const res = await fetch(`/api/curriculum/classes/${classId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("শ্রেণি মুছে ফেলা যায়নি");
      toast.success(`'${className}' শ্রেণিটি সফলভাবে মুছে ফেলা হয়েছে!`);
      fetchCurriculumClasses();
    } catch (err: any) {
      toast.error(err.message || "ত্রুটি দেখা দিয়েছে");
    }
  };

  // Subjects Management Handlers
  const handleOpenAddSubject = () => {
    const slMap = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ", "ঝ", "ঞ", "ট", "ঠ", "ড", "ঢ", "ণ", "ত", "থ", "দ", "ধ", "ন"];
    const nextSl = slMap[subjectsConfig.length] || `${subjectsConfig.length + 1}`;
    setEditingSubject({
      id: `subj_${Date.now()}`,
      sl: nextSl,
      name: "",
    });
    setIsSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (subj: any) => {
    setEditingSubject({ ...subj });
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = () => {
    if (!editingSubject || !editingSubject.name.trim()) {
      toast.error("বিষয়ের নাম আবশ্যক");
      return;
    }
    const cleanSubj = {
      id: editingSubject.id || `subj_${Date.now()}`,
      sl: editingSubject.sl || `${subjectsConfig.length + 1}`,
      name: editingSubject.name.trim(),
    };
    setSubjectsConfig((prev) => {
      const idx = prev.findIndex((s) => s.id === cleanSubj.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = cleanSubj;
        return next;
      }
      return [...prev, cleanSubj];
    });
    toast.success("বিষয় তালিকায় আপডেট হয়েছে (সংরক্ষণ করে প্রকাশ করুন)");
    setIsSubjectModalOpen(false);
    setEditingSubject(null);
  };

  const handleDeleteSubject = (subjId: string) => {
    if (subjectsConfig.length <= 1) {
      toast.error("অন্তত একটি বিষয় অবশ্যই থাকতে হবে");
      return;
    }
    setSubjectsConfig((prev) => prev.filter((s) => s.id !== subjId));
    toast.success("বিষয়টি তালিকা থেকে সরানো হয়েছে (সংরক্ষণ করে প্রকাশ করুন)");
  };

  const handleDeleteItem = (itemId: string) => {
    if (criteriaConfig.length <= 1) {
      toast.error("অন্তত একটি নিরীক্ষা মানদণ্ড অবশ্যই থাকতে হবে");
      return;
    }
    setCriteriaConfig((prev) => prev.filter((i) => i.id !== itemId));
    toast.success("মানদণ্ডটি তালিকা থেকে সরানো হয়েছে (সংরক্ষণ বাটনে চাপ দিলে নতুন সংস্করণে প্রযোজ্য হবে)");
  };

  const handleOpenAddItem = () => {
    const nextNum = criteriaConfig.length + 1;
    const nextSl = nextNum < 10 ? `০${nextNum}` : `${nextNum}`;
    setEditingItem({
      id: `crit_${Date.now()}`,
      sl: nextSl,
      label: "",
      type: "yes_no_partial",
      options: [
        { value: "yes", label: "হ্যাঁ", points: 10 },
        { value: "partial", label: "আংশিক", points: 5 },
        { value: "no", label: "না", points: 0 },
      ],
    });
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item: any) => {
    setEditingItem(JSON.parse(JSON.stringify(item)));
    setIsItemModalOpen(true);
  };

  const handleSaveItem = () => {
    if (!editingItem || !editingItem.label.trim()) {
      toast.error("অনুগ্রহ করে মানদণ্ড বা প্রশ্নের বিবরণ লিখুন");
      return;
    }
    setCriteriaConfig((prev) => {
      const existingIdx = prev.findIndex((i) => i.id === editingItem.id);
      if (existingIdx !== -1) {
        const next = [...prev];
        next[existingIdx] = editingItem;
        return next;
      } else {
        return [...prev, editingItem];
      }
    });
    setIsItemModalOpen(false);
    setEditingItem(null);
    toast.success("মানদণ্ডটি তালিকায় হালনাগাদ করা হয়েছে");
  };

  const handleResetToDefault = () => {
    if (window.confirm("আপনি কি সকল মানদণ্ড পূর্বনির্ধারিত ১১টি মূল মানদণ্ডে ফিরিয়ে নিতে চান?")) {
      setCriteriaConfig(JSON.parse(JSON.stringify(GENERAL_CHECKLIST_ITEMS)));
      toast.success("ডিফল্ট মানদণ্ড লোড করা হয়েছে");
    }
  };

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [appRes, repRes, inspRes] = await Promise.all([
        fetch("/api/inspection/applications"),
        fetch("/api/inspection/reports"),
        fetch("/api/inspection/assign"),
      ]);
      const appData = await appRes.json();
      const repData = await repRes.json();
      const inspData = await inspRes.json();

      setApplications(appData.applications || []);
      setReports(repData.reports || []);
      setInspectors(inspData.inspectors || []);
    } catch (err) {
      console.error(err);
      toast.error("তথ্য লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Assign Inspector
  const handleAssignInspector = async () => {
    if (!assignModalApp || !selectedInspectorId) {
      toast.error("অনুগ্রহ করে একজন পরিদর্শক নির্বাচন করুন");
      return;
    }
    setAssigning(true);
    try {
      const res = await fetch("/api/inspection/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: assignModalApp._id,
          inspectorId: selectedInspectorId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "নিযুক্তি ব্যর্থ হয়েছে");

      toast.success("পরিদর্শক সফলভাবে নিযুক্ত হয়েছেন!");
      setAssignModalApp(null);
      setSelectedInspectorId("");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "ত্রুটি দেখা দিয়েছে");
    } finally {
      setAssigning(false);
    }
  };

  // Handle Admin Review Action (APPROVE, REVISION_REQUIRED, REJECT)
  const handleReviewAction = async (action: "APPROVE" | "REVISION_REQUIRED" | "REJECT") => {
    if (!selectedReportForReview) return;
    setReviewing(true);
    try {
      const res = await fetch("/api/inspection/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: selectedReportForReview._id,
          action,
          adminRemarks,
          customMadrasahCode: customMadrasahCode.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "অ্যাকশন ব্যর্থ হয়েছে");

      toast.success(data.message || "অ্যাকশন সফলভাবে সম্পন্ন হয়েছে");
      setSelectedReportForReview(null);
      setAdminRemarks("");
      setCustomMadrasahCode("");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "ত্রুটি দেখা দিয়েছে");
    } finally {
      setReviewing(false);
    }
  };

  // Filtered Applications
  const filteredApps = applications.filter((app) => {
    if (statusFilter !== "ALL" && app.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        app.madrasahName?.toLowerCase().includes(q) ||
        app.trackingNo?.toLowerCase().includes(q) ||
        app.mCode?.toLowerCase().includes(q) ||
        app.upazila?.toLowerCase().includes(q) ||
        app.district?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
            কেন্দ্রীয় বোর্ড প্রশাসন
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-1 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-emerald-600" />
            মাদরাসা পরিদর্শন ও এলহাক ব্যবস্থাপনা
          </h1>
          <p className="text-xs text-slate-500">
            মাঠপর্যায়ের পরিদর্শন আবেদন নিরীক্ষা, পরিদর্শক নিযুক্তি, স্কোরিং অডিট ও কোড অনুমোদন
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={openConfigManager}
            className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer active:scale-95"
            title="মানদণ্ড যোগ/বিয়োজন ও পজিটিভ/নেগেটিভ মার্কস নির্ধারণ"
          >
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>মানদণ্ড ও মার্কিং কনফিগারেশন</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedAppForForm(null);
              setIsFormModalOpen(true);
            }}
            className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>নতুন পরিদর্শন এন্ট্রি (পপআপ ফর্ম)</span>
          </button>
          <span className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 font-semibold">
            মোট আবেদন: {applications.length}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
            দাখিলকৃত রিপোর্ট: {reports.length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="মাদরাসার নাম, ট্র্যাকিং নং বা M কোড দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["ALL", "SUBMITTED", "ASSIGNED", "INSPECTED", "APPROVED", "REVISION_REQUIRED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition shrink-0 ${
                statusFilter === st
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st === "ALL" && "সকল আবেদন"}
              {st === "SUBMITTED" && "নতুন জমা"}
              {st === "ASSIGNED" && "অ্যাসাইনকৃত"}
              {st === "INSPECTED" && "রিপোর্ট অপেক্ষমান"}
              {st === "APPROVED" && "অনুমোদিত"}
              {st === "REVISION_REQUIRED" && "সংশোধন নোটিশ"}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            পরিদর্শন আবেদন ও স্ট্যাটাস তালিকা ({filteredApps.length})
          </h2>
        </div>

        {filteredApps.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            কোনো আবেদন খুঁজে পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <th className="p-3 font-semibold">ট্র্যাকিং নং</th>
                  <th className="p-3 font-semibold">মাদরাসার নাম ও কোড</th>
                  <th className="p-3 font-semibold">অবস্থান</th>
                  <th className="p-3 font-semibold">পরিদর্শনের ধরণ</th>
                  <th className="p-3 font-semibold">দায়িত্বপ্রাপ্ত পরিদর্শক</th>
                  <th className="p-3 font-semibold">স্ট্যাটাস</th>
                  <th className="p-3 font-semibold text-right">কার্যক্রম</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => {
                  const linkedReport = reports.find(
                    (r) => String(r.applicationId?._id || r.applicationId) === String(app._id)
                  );

                  return (
                    <tr key={app._id} className="hover:bg-slate-50/60">
                      <td className="p-3 font-mono font-semibold text-slate-700">
                        {app.trackingNo}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{app.madrasahName}</span>
                        <span className="text-[11px] text-slate-400">M কোড: {app.mCode || "—"}</span>
                      </td>
                      <td className="p-3 text-slate-600">
                        {app.upazila}, {app.district}
                      </td>
                      <td className="p-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                          {INSPECTION_TYPES.find((t) => t.id === app.inspectionType)?.badge || app.inspectionType}
                        </span>
                      </td>
                      <td className="p-3">
                        {app.assignedInspectorName ? (
                          <div className="text-slate-800 font-medium">
                            {app.assignedInspectorName}
                            <span className="text-[10px] text-slate-400 block">{app.assignedInspectorPhone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">নিযুক্ত করা হয়নি</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                            app.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : app.status === "INSPECTED"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : app.status === "ASSIGNED"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : app.status === "REVISION_REQUIRED"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            setAssignModalApp(app);
                            setSelectedInspectorId(app.assignedInspectorId || "");
                          }}
                          className="px-3 py-1 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100 text-[11px] font-semibold transition"
                        >
                          {app.assignedInspectorId ? "পরিদর্শক পরিবর্তন" : "পরিদর্শক নিয়োগ"}
                        </button>

                        {linkedReport && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedReportForReview(linkedReport);
                                setCustomMadrasahCode(linkedReport.issuedMadrasahCode || app.mCode || "");
                              }}
                              className="px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition shadow-xs"
                            >
                              রিপোর্ট রিভিউ ({linkedReport.totalScore}%)
                            </button>
                            <button
                              onClick={() => setSelectedReportForPrint(linkedReport)}
                              className="px-3 py-1 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100 text-[11px] font-semibold transition inline-flex items-center gap-1 cursor-pointer"
                              title="রিপোর্ট পপআপ প্রিভিউ ও প্রিন্ট"
                            >
                              <Eye className="w-3 h-3 text-emerald-600" />
                              <span>প্রিভিউ / প্রিন্ট</span>
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Assign Inspector Modal */}
      {assignModalApp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              পরিদর্শক নিয়োগ ও কর্মভার বণ্টন
            </h3>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
              <div className="font-bold text-slate-800">{assignModalApp.madrasahName}</div>
              <div className="text-slate-500">
                অবস্থান: {assignModalApp.upazila}, {assignModalApp.district} | ট্র্যাকিং: {assignModalApp.trackingNo}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                সক্রিয় মাঠ পরিদর্শক নির্বাচন করুন (চলতি কার্যভার সহ):
              </label>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
                {inspectors.map((insp) => (
                  <label
                    key={insp._id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                      selectedInspectorId === insp._id
                        ? "border-emerald-600 bg-emerald-50/50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="inspector"
                        checked={selectedInspectorId === insp._id}
                        onChange={() => setSelectedInspectorId(insp._id)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="font-bold text-slate-800 block">{insp.name}</span>
                        <span className="text-[11px] text-slate-400">{insp.phone || "০১৭১১-XXXXXX"}</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                      চলমান: {insp.activeWorkload || 0} টি
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAssignModalApp(null)}
                className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleAssignInspector}
                disabled={assigning}
                className="px-6 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {assigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "নিযুক্তি নিশ্চিত করুন"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Report Review & Approval Modal */}
      {selectedReportForReview && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  অডিট ও কোড অনুমোদন
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedReportForReview.applicationId?.madrasahName || "মাদরাসা"} — পরিদর্শন প্রতিবেদন রিভিউ
                </h3>
              </div>
              <button
                onClick={() => setSelectedReportForReview(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Score & GPS Alert */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">অর্জিত স্কোর ও গ্রেড</span>
                <span className="text-base font-bold text-emerald-700">
                  {selectedReportForReview.totalScore}% — {selectedReportForReview.gradeLabel || selectedReportForReview.grade}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px]">দায়িত্বপ্রাপ্ত পরিদর্শক</span>
                <span className="text-sm font-bold text-slate-800">
                  {selectedReportForReview.inspectorName}
                </span>
              </div>
            </div>

            {/* Geofence Check */}
            {selectedReportForReview.isGeofenceBreached && (
              <div className="bg-rose-50 text-rose-800 p-3 rounded-xl border border-rose-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <strong>সতর্কতা (জিপিএস ব্যবধান):</strong> পরিদর্শক মাদরাসার মূল স্থানাঙ্ক থেকে ১০০ মিটারের বাইরে রিপোর্ট দাখিল করেছেন।
                  {selectedReportForReview.geofenceBreachReason && (
                    <span className="block mt-0.5 text-slate-600">কারণ: {selectedReportForReview.geofenceBreachReason}</span>
                  )}
                </div>
              </div>
            )}

            {/* Photos Preview */}
            {selectedReportForReview.photos?.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-700 mb-1.5 block">সরেজমিন সংগৃহীত ছবি:</span>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {selectedReportForReview.photos.map((p: any, idx: number) => (
                    <img
                      key={idx}
                      src={p.url}
                      alt="inspection"
                      className="w-20 h-20 object-cover rounded-xl border border-slate-200"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Inspector Remarks */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium block mb-1">পরিদর্শকের মন্তব্য:</span>
              <p className="text-slate-800 italic">
                {selectedReportForReview.inspectorRemarks || "কোনো বিশেষ মন্তব্য প্রদান করা হয়নি।"}
              </p>
            </div>

            {/* Approval Code Input */}
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                অনুমোদিত মাদরাসা কোড (M Code):
              </label>
              <input
                type="text"
                placeholder="যেমন: NK-KHU-402 বা ৭৫০"
                value={customMadrasahCode}
                onChange={(e) => setCustomMadrasahCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
              />
              <p className="text-[10px] text-slate-400">
                * অনুমোদন বাটনে চাপ দিলে স্বয়ংক্রিয়ভাবে মাদরাসাটি কেন্দ্রীয় ইআরপিতে সক্রিয় হবে এবং সনদ ইস্যু হবে।
              </p>
            </div>

            {/* Admin Remarks */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                বোর্ড কর্তৃপক্ষের সিদ্ধান্ত ও মন্তব্য:
              </label>
              <textarea
                rows={2}
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                placeholder="বোর্ডের মন্তব্য বা সংশোধন সংক্রান্ত নির্দেশনা লিখুন..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedReportForPrint(selectedReportForReview)}
                className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                অফিসিয়াল কপি প্রিন্ট
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleReviewAction("REJECT")}
                  disabled={reviewing}
                  className="px-4 py-2 rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewAction("REVISION_REQUIRED")}
                  disabled={reviewing}
                  className="px-4 py-2 rounded-full bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 text-xs font-semibold transition"
                >
                  সংশোধন নির্দেশ
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewAction("APPROVE")}
                  disabled={reviewing}
                  className="px-6 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20"
                >
                  {reviewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "অনুমোদন ও কোড বরাদ্দ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Report Preview & Print Modal */}
      {selectedReportForPrint && (
        <PrintableInspectionReport
          report={selectedReportForPrint}
          isOpen={Boolean(selectedReportForPrint)}
          onClose={() => setSelectedReportForPrint(null)}
        />
      )}

      {/* Modal 4: Inspection Entry Form Modal */}
      {isFormModalOpen && (
        <InspectionForm
          isModal={true}
          isOpen={isFormModalOpen}
          initialApplication={selectedAppForForm}
          onSuccess={() => {
            setIsFormModalOpen(false);
            fetchData();
          }}
          onClose={() => setIsFormModalOpen(false)}
          onCancel={() => setIsFormModalOpen(false)}
        />
      )}

      {/* Modal 5: Inspection Criteria & Negative Marks Manager Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Sliders className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>পরিদর্শন মানদণ্ড ও মার্কিং নিয়ন্ত্রণ প্যানেল</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono font-bold">
                      সংস্করণ: v{configVersion}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    প্রশ্ন সংযোজন, বিয়োজন এবং প্রতিটি অপশনের জন্য ধনাত্মক (+পয়েন্ট) বা ঋণাত্মক (-মার্কস) নির্ধারণ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition text-sm cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Top Navigation Tabs */}
            <div className="bg-slate-800 px-5 pt-2.5 border-b border-slate-700 flex gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setConfigActiveTab("criteria")}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
                  configActiveTab === "criteria"
                    ? "bg-slate-50 text-slate-900 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-500" />
                <span>সার্বিক মানদণ্ড ও মার্কস ({criteriaConfig.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setConfigActiveTab("subjects")}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
                  configActiveTab === "subjects"
                    ? "bg-slate-50 text-slate-900 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>মূল্যায়ন বিষয়সমূহ ({subjectsConfig.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setConfigActiveTab("classes")}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
                  configActiveTab === "classes"
                    ? "bg-slate-50 text-slate-900 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                <span>কারিকুলাম শ্রেণি ব্যবস্থাপনা ({curriculumClasses.length})</span>
              </button>
            </div>

            {/* Immutability & Safety Banner */}
            <div className="bg-emerald-50/90 border-b border-emerald-200/80 px-5 py-2.5 text-xs text-emerald-950 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed text-[11px]">
                <strong className="font-bold text-emerald-900">রিয়েল-টাইম সিঙ্ক ও অপরিবর্তনশীলতা রুল:</strong>{" "}
                কারিকুলামে শ্রেণি যোগ বা মুছে ফেললে তা সরাসরি পরিদর্শন ফর্মে আপডেট হবে। মানদণ্ড ও বিষয়সমূহ পরিবর্তন করে 'সংরক্ষণ' চাপলে নতুন সংস্করণ কার্যকর হবে।
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 bg-slate-50">
              {/* TAB 1: সার্বিক মানদণ্ড ও মার্কস */}
              {configActiveTab === "criteria" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleOpenAddItem}
                        className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>নতুন মানদণ্ড যোগ করুন</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleResetToDefault}
                        className="px-3.5 py-2 rounded-full bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3 text-slate-500" />
                        <span>ডিফল্ট মানদণ্ডে রিসেট</span>
                      </button>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      মোট সক্রিয় মানদণ্ড: <strong className="text-slate-800">{criteriaConfig.length}</strong> টি
                    </div>
                  </div>

                  {configLoading ? (
                    <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                      <span>কনফিগারেশন লোড হচ্ছে...</span>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {criteriaConfig.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs shrink-0">
                              {item.sl}
                            </span>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-slate-900 leading-snug">
                                {item.label}
                              </h4>
                              {/* Option Pills with Positive & Negative Marks */}
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                {item.options && item.options.length > 0 ? (
                                  item.options.map((opt: any) => {
                                    const pts = Number(opt.points) || 0;
                                    const isNeg = pts < 0;
                                    return (
                                      <span
                                        key={opt.value}
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                                          isNeg
                                            ? "bg-rose-50 text-rose-700 border-rose-200 font-bold"
                                            : pts > 0
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold"
                                            : "bg-slate-100 text-slate-600 border-slate-200"
                                        }`}
                                      >
                                        <span>{opt.label}:</span>
                                        <span className="font-mono">
                                          {pts > 0 ? `+${pts}` : pts} মার্কস
                                        </span>
                                      </span>
                                    );
                                  })
                                ) : (
                                  <span className="text-[11px] text-slate-500 italic">
                                    সংখ্যাগত মান (স্টেপার ইনপুট)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleOpenEditItem(item)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                              title="সম্পাদনা করুন"
                            >
                              <Edit3 className="w-3 h-3 text-slate-600" />
                              <span>সম্পাদনা</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: বিষয়ভিত্তিক মূল্যায়ন বিষয়সমূহ */}
              {configActiveTab === "subjects" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleOpenAddSubject}
                      className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>নতুন মূল্যায়ন বিষয় যোগ করুন</span>
                    </button>
                    <div className="text-xs text-slate-500 font-medium">
                      মোট সক্রিয় বিষয়: <strong className="text-slate-800">{subjectsConfig.length}</strong> টি
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {subjectsConfig.map((sub, idx) => (
                      <div
                        key={sub.id || idx}
                        className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center justify-center shrink-0">
                            {sub.sl}
                          </span>
                          <span className="text-xs font-bold text-slate-800 truncate" title={sub.name}>
                            {sub.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditSubject(sub)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                            title="সম্পাদনা"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubject(sub.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: কারিকুলাম ও শ্রেণি ব্যবস্থাপনা */}
              {configActiveTab === "classes" && (
                <div className="space-y-4">
                  {/* Quick Add Class Bar */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      <span>কারিকুলামে নতুন শ্রেণি যোগ করুন</span>
                    </h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="যেমন: প্লে শ্রেণি, ৬ষ্ঠ শ্রেণি বা হিফজুল কুরআন বিভাগ"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddCurriculumClass()}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-emerald-600"
                      />
                      <button
                        type="button"
                        onClick={handleAddCurriculumClass}
                        disabled={isAddingClass || !newClassName.trim()}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shrink-0 shadow-sm"
                      >
                        {isAddingClass ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>শ্রেণি যোগ করুন</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      * এখানে নতুন শ্রেণি যোগ বা মুছে ফেললে তা কারিকুলাম ও পরিদর্শন ফর্মে তাৎক্ষণিকভাবে হালনাগাদ হবে।
                    </p>
                  </div>

                  {/* Classes List */}
                  {loadingCurriculumClasses ? (
                    <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                      <span>শ্রেণির তথ্য লোড হচ্ছে...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {curriculumClasses.map((cls, idx) => (
                        <div
                          key={cls.id || idx}
                          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-slate-900 truncate">{cls.name}</h5>
                              <p className="text-[10px] text-slate-400">{cls.books?.length || 0} টি পাঠ্যবই যুক্ত</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteCurriculumClass(cls.id, cls.name)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title={`${cls.name} মুছে ফেলুন`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-white px-5 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>সংরক্ষণ বাটনে চাপ দিলে একটি নতুন সংস্করণ তৈরি হবে যা ভবিষ্যতের সকল নতুন রিপোর্টে সক্রিয় থাকবে।</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  বন্ধ করুন
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  disabled={savingConfig}
                  className="px-6 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {savingConfig ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>সংরক্ষণ ও নতুন সংস্করণ প্রকাশ (Publish)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Modal: Add / Edit Single Criteria Item */}
      {isItemModalOpen && editingItem && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto my-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-600" />
                <span>মানদণ্ড সম্পাদনা ও মার্কস কনফিগারেশন</span>
              </h4>
              <button
                type="button"
                onClick={() => {
                  setIsItemModalOpen(false);
                  setEditingItem(null);
                }}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-700 font-semibold mb-1 block">ক্রমিক নং *</label>
                  <input
                    type="text"
                    value={editingItem.sl || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, sl: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                    placeholder="যেমন: ১২"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-slate-700 font-semibold mb-1 block">মানদণ্ডের ধরণ *</label>
                  <select
                    value={editingItem.type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      let defaultOptions = editingItem.options;
                      if (newType === "yes_no_partial") {
                        defaultOptions = [
                          { value: "yes", label: "হ্যাঁ", points: 10 },
                          { value: "partial", label: "আংশিক", points: 5 },
                          { value: "no", label: "না", points: 0 },
                        ];
                      } else if (newType === "good_moderate_weak") {
                        defaultOptions = [
                          { value: "good", label: "ভাল", points: 10 },
                          { value: "moderate", label: "মধ্যম", points: 6 },
                          { value: "weak", label: "দুর্বল", points: 2 },
                        ];
                      } else if (newType === "numeric") {
                        defaultOptions = [];
                      } else if (newType === "custom_select" && (!defaultOptions || defaultOptions.length === 0)) {
                        defaultOptions = [
                          { value: "opt_1", label: "সন্তোষজনক", points: 10 },
                          { value: "opt_2", label: "অসন্তোষজনক", points: -5 },
                        ];
                      }
                      setEditingItem({
                        ...editingItem,
                        type: newType,
                        options: defaultOptions,
                      });
                    }}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  >
                    <option value="yes_no_partial">হ্যাঁ / আংশিক / না</option>
                    <option value="good_moderate_weak">ভাল / মধ্যম / দুর্বল</option>
                    <option value="custom_select">কাস্টম অপশন নির্বাচন</option>
                    <option value="numeric">সংখ্যাগত মান (জন / সংখ্যা)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold mb-1 block">
                  মানদণ্ড / প্রশ্নের পূর্ণ বিবরণ *
                </label>
                <textarea
                  rows={2}
                  value={editingItem.label}
                  onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                  placeholder="যেমন: শিক্ষার্থীদের বিশুদ্ধ কুরআন তিলাওয়াতের মান কেমন?"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600 leading-relaxed font-medium"
                />
              </div>

              {/* Option Marks Configurator (Supports Positive +marks & Negative -marks) */}
              {editingItem.type !== "numeric" && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-800 font-bold block">
                      অপশন ও পয়েন্ট কনফিগারেশন (পজিটিভ ও নেগেটিভ মার্কস)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const nextOptIdx = (editingItem.options?.length || 0) + 1;
                        setEditingItem({
                          ...editingItem,
                          options: [
                            ...(editingItem.options || []),
                            {
                              value: `opt_${Date.now()}`,
                              label: `অপশন ${nextOptIdx}`,
                              points: 0,
                            },
                          ],
                        });
                      }}
                      className="px-2 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold border border-emerald-200 flex items-center gap-1 transition cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>অপশন যোগ করুন</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    * নেগেটিভ মার্কিংয়ের ক্ষেত্রে ঋণাত্মক সংখ্যা (যেমন: -৫, -১০) লিখুন।
                  </p>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {(editingItem.options || []).map((opt: any, optIdx: number) => {
                      const pts = Number(opt.points) || 0;
                      return (
                        <div
                          key={optIdx}
                          className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl"
                        >
                          <div className="flex-1">
                            <input
                              type="text"
                              value={opt.label}
                              onChange={(e) => {
                                const newOpts = [...editingItem.options];
                                newOpts[optIdx] = { ...newOpts[optIdx], label: e.target.value };
                                setEditingItem({ ...editingItem, options: newOpts });
                              }}
                              placeholder="অপশনের লেবেল (বাংলা)"
                              className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-600"
                            />
                          </div>

                          <div className="w-28 flex items-center gap-1">
                            <input
                              type="number"
                              value={opt.points}
                              onChange={(e) => {
                                const newOpts = [...editingItem.options];
                                newOpts[optIdx] = {
                                  ...newOpts[optIdx],
                                  points: Number(e.target.value),
                                };
                                setEditingItem({ ...editingItem, options: newOpts });
                              }}
                              placeholder="মার্কস"
                              className={`w-full px-2.5 py-1 bg-white border rounded-lg text-xs font-mono font-bold text-center focus:outline-none ${
                                pts < 0
                                  ? "border-rose-400 text-rose-700 bg-rose-50/50"
                                  : pts > 0
                                  ? "border-emerald-400 text-emerald-700 bg-emerald-50/50"
                                  : "border-slate-200 text-slate-700"
                              }`}
                            />
                            <span className="text-[10px] text-slate-400 font-mono">pts</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if ((editingItem.options || []).length <= 1) {
                                toast.error("কমপক্ষে একটি অপশন থাকতে হবে");
                                return;
                              }
                              const newOpts = editingItem.options.filter((_: any, i: number) => i !== optIdx);
                              setEditingItem({ ...editingItem, options: newOpts });
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="অপশন মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsItemModalOpen(false);
                  setEditingItem(null);
                }}
                className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleSaveItem}
                className="px-6 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                মানদণ্ডে সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subject Edit / Add Modal */}
      {isSubjectModalOpen && editingSubject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70] animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">
                  {editingSubject.id && subjectsConfig.some((s) => s.id === editingSubject.id)
                    ? "বিষয় সম্পাদনা করুন"
                    : "নতুন নিরীক্ষা বিষয় যোগ করুন"}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsSubjectModalOpen(false);
                  setEditingSubject(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-semibold mb-1 block">ক্রমিক প্রতীক বা নম্বর *</label>
                <input
                  type="text"
                  value={editingSubject.sl || ""}
                  onChange={(e) => setEditingSubject({ ...editingSubject, sl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  placeholder="যেমন: ১, ২, বা ক, খ"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold mb-1 block">বিষয়ের নাম (বাংলা) *</label>
                <input
                  type="text"
                  value={editingSubject.name || ""}
                  onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  placeholder="যেমন: কুরআন মাজীদ, নাজেরা, তাজবীদ, হস্তলিপি"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsSubjectModalOpen(false);
                  setEditingSubject(null);
                }}
                className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleSaveSubject}
                className="px-6 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                বিষয় সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
