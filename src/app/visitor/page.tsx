"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardList,
  Building2,
  Settings,
  LogOut,
  PlusCircle,
  FileCheck,
  CheckCircle2,
  Clock,
  Printer,
  Eye,
  Award,
  Search,
  MapPin,
  Phone,
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
  Plus,
  RefreshCw,
  Copy,
  PhoneCall,
  Calendar,
  Sparkles,
  Filter,
  MoreVertical,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import InspectionForm from "@/components/inspection/InspectionForm";
import PrintableInspectionReport from "@/components/inspection/PrintableInspectionReport";

export default function VisitorDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(urlTab || "dashboard");

  const [applications, setApplications] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [reportSearch, setReportSearch] = useState("");
  const [reportGradeFilter, setReportGradeFilter] = useState("ALL");
  const [madrasaSearch, setMadrasaSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState<{ id: string; type: string } | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!openDropdown) return;
    const handleDocClick = () => setOpenDropdown(null);
    window.addEventListener("click", handleDocClick);
    return () => window.removeEventListener("click", handleDocClick);
  }, [openDropdown]);

  const handleCopyTracking = (tracking: string) => {
    if (typeof window !== "undefined" && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(tracking);
      toast.success(`ট্র্যাকিং নম্বর ${tracking} কপি হয়েছে!`, { id: "copy-tracking" });
    }
  };

  // Selected report for printable view
  const [selectedReportForPrint, setSelectedReportForPrint] = useState<any | null>(null);

  // Selected application to start inspection on
  const [selectedApplicationForForm, setSelectedApplicationForForm] = useState<any | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // Sync activeTab with URL search params (e.g. from top Navbar hamburger menu or pills)
  useEffect(() => {
    if (urlTab) {
      if (urlTab === "new_report") {
        setSelectedApplicationForForm(null);
        setIsFormModalOpen(true);
      } else {
        setActiveTab(urlTab);
        setSelectedReportForPrint(null);
      }
    } else {
      setActiveTab("dashboard");
    }
  }, [urlTab]);

  // Current inspector user state
  const [inspectorUser, setInspectorUser] = useState({
    id: "64b7f8c12345678901234567",
    name: "মাওলানা মোহাম্মাদ আলী",
    phone: "০১৭১১-XXXXXX",
    role: "VISITOR",
  });

  // Strict Authentication & RBAC Check
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.replace("/login/visitor");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        const role = (data.role || "").toUpperCase();
        // If not VISITOR and not ADMIN, redirect away to their respective portal
        if (role !== "VISITOR" && role !== "ADMIN") {
          router.replace("/");
        } else {
          setInspectorUser({
            id: data.id || data.userId || "default_id",
            name: data.name || "মাওলানা মোহাম্মাদ আলী",
            phone: data.phone || "০১৭১১-XXXXXX",
            role: data.role || "VISITOR",
          });
        }
      })
      .catch(() => {
        router.replace("/login/visitor");
      });
  }, [router]);

  const handleTabChange = (tabId: string) => {
    if (tabId === "new_report") {
      setSelectedApplicationForForm(null);
      setIsFormModalOpen(true);
      return;
    }
    setActiveTab(tabId);
    setSelectedReportForPrint(null);
    router.replace(`?tab=${tabId}`, { scroll: false });
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {}
    router.push("/login/visitor");
  };

  // Fetch applications and reports
  const fetchData = async () => {
    setLoading(true);
    try {
      const [appRes, repRes] = await Promise.all([
        fetch("/api/inspection/applications"),
        fetch("/api/inspection/reports"),
      ]);
      const appData = await appRes.json();
      const repData = await repRes.json();

      setApplications(appData.applications || []);
      setReports(repData.reports || []);
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

  const handleStartInspection = (app: any) => {
    setSelectedApplicationForForm(app);
    setIsFormModalOpen(true);
  };

  const handleInspectionSuccess = (newReport: any) => {
    fetchData();
    setIsFormModalOpen(false);
    setSelectedReportForPrint(newReport);
  };

  // Dashboard Stats
  const totalAssigned = applications.length;
  const pendingInspections = applications.filter((a) => a.status === "ASSIGNED" || a.status === "SCHEDULED" || a.status === "SUBMITTED").length;
  const completedInspections = reports.length;
  const gradeACount = reports.filter((r) => r.grade === "GRADE_A").length;

  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "ড্যাশবোর্ড" },
    { id: "new_report", icon: PlusCircle, label: "নতুন পরিদর্শন এন্ট্রি" },
    { id: "reports", icon: ClipboardList, label: "পরিদর্শন রিপোর্টসমূহ" },
    { id: "madrasas", icon: Building2, label: "বরাদ্দকৃত মাদরাসা" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* ─── Desktop Sidebar (Hidden on mobile < md, visible on md+) ─── */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-slate-200 min-h-screen p-4 flex-col shrink-0">
        <div className="mb-6 p-3.5 bg-slate-900 rounded-2xl text-white">
          <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">
            কেন্দ্রীয় ইআরপি
          </span>
          <h2 className="text-base font-bold text-white mt-0.5">পরিদর্শক প্যানেল</h2>
          <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
            মাঠ পরিদর্শক সক্রিয়
          </p>
        </div>

        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === item.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <item.icon className="w-4 h-4 text-emerald-600" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-4 border-t border-slate-100 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 rounded-full text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>লগআউট</span>
          </button>
        </div>
      </aside>

      {/* ─── 4. Main Content Area (Full 100% Width on Mobile) ─── */}
      <main className="flex-1 w-full min-w-0 p-3.5 sm:p-6 md:p-8 pb-8 md:pb-8 overflow-y-auto">
        {/* Top Header */}
        <header className="mb-4 sm:mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              {activeTab === "dashboard" && `স্বাগতম, ${inspectorUser.name}!`}
              {activeTab === "new_report" && "নতুন পরিদর্শন এন্ট্রি"}
              {activeTab === "reports" && "পরিদর্শন রিপোর্টসমূহ"}
              {activeTab === "madrasas" && "বরাদ্দকৃত মাদরাসা"}
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              পরিদর্শন ও অডিট ব্যবস্থাপনা
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedApplicationForForm(null);
              setIsFormModalOpen(true);
            }}
            className="w-full sm:w-auto h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>নতুন পরিদর্শন</span>
          </button>
        </header>

        {/* Mobile Quick Tab Switcher */}
        <div className="md:hidden flex items-center gap-1.5 overflow-x-auto scroll-smooth no-scrollbar pb-1 mb-4">
          <button
            type="button"
            onClick={() => handleTabChange("dashboard")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "dashboard"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>ড্যাশবোর্ড</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("reports")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "reports"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200"
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>রিপোর্ট ({reports.length})</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("madrasas")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "madrasas"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>মাদরাসা ({applications.length})</span>
          </button>
        </div>

        {/* Tab 1: Dashboard */}
        {activeTab === "dashboard" && (
          <div className="space-y-5 sm:space-y-6">
            {/* 4 Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
              {[
                { label: "মোট বরাদ্দকৃত", value: totalAssigned, color: "text-slate-800", bg: "bg-white", icon: Building2 },
                { label: "অপেক্ষমান পরিদর্শন", value: pendingInspections, color: "text-amber-700", bg: "bg-white", icon: Clock },
                { label: "সম্পন্ন রিপোর্ট", value: completedInspections, color: "text-emerald-700", bg: "bg-white", icon: CheckCircle2 },
                { label: "গ্রেড 'এ' মাদরাসা", value: gradeACount, color: "text-blue-700", bg: "bg-white", icon: Award },
              ].map((stat, idx) => (
                <div key={idx} className={`${stat.bg} p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between`}>
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 block">{stat.label}</span>
                    <span className={`text-xl sm:text-2xl font-bold mt-0.5 block ${stat.color}`}>{stat.value}</span>
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                    <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Completed Reports (Organized Cards) */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-emerald-600" />
                  সম্প্রতি দাখিলকৃত পরিদর্শন রিপোর্টসমূহ
                </h2>
                <button
                  onClick={() => setActiveTab("reports")}
                  className="text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
                >
                  সকল রিপোর্ট দেখুন ({reports.length})
                </button>
              </div>

              {reports.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                  এখনো কোনো রিপোর্ট দাখিল করা হয়নি।
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {reports.slice(0, 3).map((rep) => {
                    const madrasahName = rep.applicationId?.madrasahName || "মাদরাসা";
                    const mCode = rep.issuedMadrasahCode || rep.applicationId?.mCode || rep.applicationId?.madrasahCode || "৭৫০";
                    const location = [rep.applicationId?.upazila, rep.applicationId?.district].filter(Boolean).join(", ");
                    const directorMobile = rep.applicationId?.directorMobile;
                    const isGradeA = rep.grade === "GRADE_A";
                    const isGradeB = rep.grade === "GRADE_B";
                    const isGradeC = rep.grade === "GRADE_C";
                    const gradeBadgeClass = isGradeA
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : isGradeB
                      ? "bg-blue-50 text-blue-800 border-blue-300"
                      : isGradeC
                      ? "bg-amber-50 text-amber-800 border-amber-300"
                      : "bg-slate-100 text-slate-800 border-slate-300";

                    return (
                      <div
                        key={rep._id}
                        className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 p-4 sm:p-4.5 shadow-2xs hover:shadow-xs transition-all flex flex-col gap-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                                {madrasahName}
                              </h3>
                              {location && (
                                <p className="text-[10.5px] text-slate-500 flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{location}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-start sm:self-auto">
                            <span className={`inline-flex items-center gap-1 text-[10.5px] px-2.5 py-0.5 rounded-full font-bold border ${gradeBadgeClass}`}>
                              <Award className="w-3 h-3" />
                              <span>{rep.gradeLabel || rep.grade} ({rep.totalScore}%)</span>
                            </span>
                            {rep.adminReviewStatus === "APPROVED" && (
                              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                                <ShieldCheck className="w-3 h-3" />
                                <span>বোর্ড অনুমোদিত</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Supportive Chips */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                          <div>
                            <span className="text-[9.5px] font-medium text-slate-400 block">ট্র্যাকিং নং</span>
                            <button
                              type="button"
                              onClick={() => handleCopyTracking(rep.trackingNo)}
                              className="font-mono font-bold text-slate-800 hover:text-emerald-700 flex items-center gap-1 transition cursor-pointer"
                              title="কপি করতে ক্লিক করুন"
                            >
                              <span className="truncate">{rep.trackingNo}</span>
                              <Copy className="w-2.5 h-2.5 text-slate-400" />
                            </button>
                          </div>
                          <div>
                            <span className="text-[9.5px] font-medium text-slate-400 block">মাদরাসা কোড (M)</span>
                            <span className="font-bold text-slate-800">{mCode}</span>
                          </div>
                          <div>
                            <span className="text-[9.5px] font-medium text-slate-400 block">পরিদর্শন তারিখ</span>
                            <span className="font-semibold text-slate-700">
                              {new Date(rep.inspectionDate).toLocaleDateString("bn-BD")}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9.5px] font-medium text-slate-400 block">পরিচালক</span>
                            {directorMobile ? (
                              <a href={`tel:${directorMobile}`} className="font-semibold text-emerald-700 hover:underline truncate block">
                                {rep.applicationId?.directorName || directorMobile}
                              </a>
                            ) : (
                              <span className="text-slate-600">{rep.applicationId?.directorName || "—"}</span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setSelectedReportForPrint(rep)}
                            className="h-8.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5 text-emerald-400" />
                            <span>রিপোর্ট প্রিন্ট</span>
                          </button>

                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdown(
                                  openDropdown?.id === rep._id && openDropdown?.type === "dash-rep"
                                    ? null
                                    : { id: rep._id, type: "dash-rep" }
                                );
                              }}
                              className={`h-8 w-8 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                                openDropdown?.id === rep._id && openDropdown?.type === "dash-rep"
                                  ? "bg-slate-100 text-slate-800 border-slate-300"
                                  : "bg-white hover:bg-slate-50 text-slate-500 border-slate-200"
                              }`}
                              title="অতিরিক্ত অপশন"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            <AnimatePresence>
                              {openDropdown?.id === rep._id && openDropdown?.type === "dash-rep" && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ duration: 0.1 }}
                                  className="absolute right-0 bottom-full mb-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden py-1 divide-y divide-slate-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenDropdown(null);
                                      handleCopyTracking(rep.trackingNo);
                                    }}
                                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 w-full text-left transition"
                                  >
                                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                                    <span>ট্র্যাকিং কপি</span>
                                  </button>

                                  {directorMobile && (
                                    <a
                                      href={`tel:${directorMobile}`}
                                      onClick={() => setOpenDropdown(null)}
                                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 w-full text-left transition"
                                    >
                                      <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>মুহতামিমকে কল</span>
                                    </a>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Assigned Madrasas */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  চলমান ও অপেক্ষমান পরিদর্শন
                </h2>
                <button
                  onClick={() => setActiveTab("madrasas")}
                  className="text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
                >
                  সবগুলো ({applications.length})
                </button>
              </div>

              {applications.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                  কোনো বরাদ্দকৃত মাদরাসা নেই।
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {applications.slice(0, 3).map((app) => (
                    <div
                      key={app._id}
                      className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">{app.madrasahName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                            M: {app.mCode || app.madrasahCode || "৭৫০"}
                          </span>
                        </div>
                        <div className="text-slate-500 text-[10.5px] flex flex-wrap gap-x-3 gap-y-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {app.upazila}, {app.district}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {app.directorName} ({app.directorMobile})
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStartInspection(app)}
                        className="h-8.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer self-start sm:self-center"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>পরিদর্শন শুরু</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: New Report Form */}
        {activeTab === "new_report" && (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-emerald-900">ডিজিটাল পরিদর্শন ফর্ম</h3>
                <p className="text-xs text-emerald-700 mt-0.5">মোবাইল ফ্রেন্ডলি পরিদর্শন এন্ট্রি ফর্ম</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(true)}
                className="h-8.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer shrink-0"
              >
                পপআপে খুলুন
              </button>
            </div>
            <InspectionForm
              initialApplication={selectedApplicationForForm}
              inspectorUser={inspectorUser}
              onSuccess={handleInspectionSuccess}
              onCancel={() => setActiveTab("dashboard")}
            />
          </div>
        )}

        {/* Tab 3: All Reports */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            {/* Search and Grade Filter Bar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-800">পরিদর্শন রিপোর্টসমূহ</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">মোট: {reports.length} টি</p>
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                    placeholder="মাদরাসা, ট্র্যাকিং বা কোড..."
                    className="w-full h-9 pl-8 pr-7 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600 transition"
                  />
                  {reportSearch && (
                    <button
                      onClick={() => setReportSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Filter Badges */}
              <div className="flex items-center gap-1.5 overflow-x-auto scroll-smooth no-scrollbar pt-1 pb-0.5 text-xs">
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 shrink-0 mr-1">
                  <Filter className="w-3 h-3" />
                  ফিল্টার:
                </span>
                {[
                  { id: "ALL", label: `সকল (${reports.length})` },
                  { id: "GRADE_A", label: `গ্রেড এ (${reports.filter((r) => r.grade === "GRADE_A").length})` },
                  { id: "GRADE_B", label: `গ্রেড বি (${reports.filter((r) => r.grade === "GRADE_B").length})` },
                  { id: "GRADE_C", label: `গ্রেড সি (${reports.filter((r) => r.grade === "GRADE_C").length})` },
                  { id: "APPROVED", label: `অনুমোদিত (${reports.filter((r) => r.adminReviewStatus === "APPROVED").length})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setReportGradeFilter(f.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition shrink-0 cursor-pointer ${
                      reportGradeFilter === f.id
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reports List */}
            {reports.length === 0 ? (
              <div className="bg-white p-12 text-center text-slate-400 text-xs rounded-2xl border border-slate-200">
                কোনো রিপোর্ট পাওয়া যায়নি।
              </div>
            ) : (
              <div className="space-y-3.5">
                {reports
                  .filter((rep) => {
                    const q = reportSearch.toLowerCase().trim();
                    const name = (rep.applicationId?.madrasahName || "").toLowerCase();
                    const tracking = (rep.trackingNo || "").toLowerCase();
                    const m = (rep.issuedMadrasahCode || rep.applicationId?.mCode || rep.applicationId?.madrasahCode || "").toLowerCase();
                    const loc = `${rep.applicationId?.upazila || ""} ${rep.applicationId?.district || ""}`.toLowerCase();
                    const matchesSearch = !q || name.includes(q) || tracking.includes(q) || m.includes(q) || loc.includes(q);
                    if (!matchesSearch) return false;

                    if (reportGradeFilter === "GRADE_A") return rep.grade === "GRADE_A";
                    if (reportGradeFilter === "GRADE_B") return rep.grade === "GRADE_B";
                    if (reportGradeFilter === "GRADE_C") return rep.grade === "GRADE_C";
                    if (reportGradeFilter === "APPROVED") return rep.adminReviewStatus === "APPROVED";
                    return true;
                  })
                  .map((rep) => {
                    const madrasahName = rep.applicationId?.madrasahName || "মাদরাসা";
                    const mCode = rep.issuedMadrasahCode || rep.applicationId?.mCode || rep.applicationId?.madrasahCode || "৭৫০";
                    const location = [rep.applicationId?.upazila, rep.applicationId?.district].filter(Boolean).join(", ");
                    const directorName = rep.applicationId?.directorName;
                    const directorMobile = rep.applicationId?.directorMobile;
                    const phaseLabel = rep.phase === "phase_2" ? "২য় পরিদর্শন" : rep.phase === "phase_3" ? "৩য় পরিদর্শন" : "১ম পরিদর্শন";

                    const isGradeA = rep.grade === "GRADE_A";
                    const isGradeB = rep.grade === "GRADE_B";
                    const isGradeC = rep.grade === "GRADE_C";
                    const gradeBadgeClass = isGradeA
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : isGradeB
                      ? "bg-blue-50 text-blue-800 border-blue-300"
                      : isGradeC
                      ? "bg-amber-50 text-amber-800 border-amber-300"
                      : "bg-slate-100 text-slate-800 border-slate-300";

                    return (
                      <div
                        key={rep._id}
                        className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-400 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col gap-3.5"
                      >
                        {/* Top: Madrasah Name, Phase & Badges */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
                              <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center flex-wrap gap-2">
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                                  {madrasahName}
                                </h3>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                  {phaseLabel}
                                </span>
                              </div>
                              {location && (
                                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{location}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto">
                            <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-bold border ${gradeBadgeClass}`}>
                              <Award className="w-3.5 h-3.5" />
                              <span>{rep.gradeLabel || rep.grade} ({rep.totalScore}%)</span>
                            </span>
                            {rep.adminReviewStatus === "APPROVED" ? (
                              <span className="inline-flex items-center gap-1 text-[10.5px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>অনুমোদিত</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10.5px] px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                                <Clock className="w-3.5 h-3.5" />
                                <span>পর্যালোচনায়</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Middle: Structured Supportive Chips Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50/90 p-3 rounded-xl border border-slate-100 text-xs">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-medium text-slate-400">ট্র্যাকিং</span>
                            <button
                              type="button"
                              onClick={() => handleCopyTracking(rep.trackingNo)}
                              className="font-mono font-bold text-slate-800 text-[11px] hover:text-emerald-700 flex items-center gap-1 text-left transition cursor-pointer group mt-0.5"
                              title="কপি করতে ক্লিক করুন"
                            >
                              <span className="truncate">{rep.trackingNo}</span>
                              <Copy className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                            </button>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-[10px] font-medium text-slate-400">মাদরাসা কোড</span>
                            <span className="font-bold text-slate-800 text-[11px] mt-0.5">
                              {mCode}
                            </span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-[10px] font-medium text-slate-400">পরিদর্শন তারিখ</span>
                            <span className="font-semibold text-slate-700 text-[11px] flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{new Date(rep.inspectionDate).toLocaleDateString("bn-BD")}</span>
                            </span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-[10px] font-medium text-slate-400">মুহতামিম / পরিচালক</span>
                            {directorMobile ? (
                              <a
                                href={`tel:${directorMobile}`}
                                className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 mt-0.5 truncate"
                              >
                                <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>{directorName || directorMobile}</span>
                              </a>
                            ) : (
                              <span className="text-[11px] text-slate-600 mt-0.5">{directorName || "—"}</span>
                            )}
                          </div>
                        </div>

                        {/* Stats summary row */}
                        {(rep.teacherStats?.total > 0 || rep.studentStats?.total > 0) && (
                          <div className="flex items-center flex-wrap gap-3 text-[11px] text-slate-600 px-1">
                            {rep.teacherStats?.total > 0 && (
                              <span>
                                👨‍🏫 শিক্ষক: <strong className="text-slate-800 font-bold">{rep.teacherStats.present}/{rep.teacherStats.total}</strong> উপস্থিত
                              </span>
                            )}
                            {rep.studentStats?.total > 0 && (
                              <span>
                                🎒 শিক্ষার্থী: <strong className="text-slate-800 font-bold">{rep.studentStats.total}</strong> জন
                              </span>
                            )}
                          </div>
                        )}

                        {/* Action Footer: 1 Primary Button + Three-Dot Dropdown */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 mt-0.5">
                          <button
                            type="button"
                            onClick={() => setSelectedReportForPrint(rep)}
                            className="h-8.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5 text-emerald-400" />
                            <span>রিপোর্ট প্রিন্ট</span>
                          </button>

                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdown(
                                  openDropdown?.id === rep._id && openDropdown?.type === "rep"
                                    ? null
                                    : { id: rep._id, type: "rep" }
                                );
                              }}
                              className={`h-8.5 w-8.5 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                                openDropdown?.id === rep._id && openDropdown?.type === "rep"
                                  ? "bg-slate-100 text-slate-800 border-slate-300"
                                  : "bg-white hover:bg-slate-50 text-slate-500 border-slate-200"
                              }`}
                              title="অতিরিক্ত অপশন"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            <AnimatePresence>
                              {openDropdown?.id === rep._id && openDropdown?.type === "rep" && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ duration: 0.1 }}
                                  className="absolute right-0 bottom-full mb-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden py-1 divide-y divide-slate-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenDropdown(null);
                                      setSelectedApplicationForForm(rep.applicationId || { _id: rep.applicationId, trackingNo: rep.trackingNo });
                                      setIsFormModalOpen(true);
                                    }}
                                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 w-full text-left transition"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                                    <span>পূর্ণাঙ্গ বিবরণ</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenDropdown(null);
                                      handleCopyTracking(rep.trackingNo);
                                    }}
                                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 w-full text-left transition"
                                  >
                                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                                    <span>ট্র্যাকিং কপি</span>
                                  </button>

                                  {directorMobile && (
                                    <a
                                      href={`tel:${directorMobile}`}
                                      onClick={() => setOpenDropdown(null)}
                                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 w-full text-left transition"
                                    >
                                      <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>মুহতামিমকে কল</span>
                                    </a>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Assigned Madrasas */}
        {activeTab === "madrasas" && (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-slate-800">বরাদ্দকৃত মাদরাসা</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">মোট: {applications.length} টি</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={madrasaSearch}
                  onChange={(e) => setMadrasaSearch(e.target.value)}
                  placeholder="মাদরাসার নাম বা উপজেলা..."
                  className="w-full h-9 pl-8 pr-7 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600 transition"
                />
                {madrasaSearch && (
                  <button
                    onClick={() => setMadrasaSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {applications.length === 0 ? (
              <div className="bg-white p-12 text-center text-slate-400 text-xs rounded-2xl border border-slate-200">
                কোনো বরাদ্দকৃত মাদরাসা নেই।
              </div>
            ) : (
              <div className="space-y-3.5">
                {applications
                  .filter((app) => {
                    const q = madrasaSearch.toLowerCase().trim();
                    const name = (app.madrasahName || "").toLowerCase();
                    const tracking = (app.trackingNo || "").toLowerCase();
                    const m = (app.mCode || app.madrasahCode || "").toLowerCase();
                    const loc = `${app.upazila || ""} ${app.district || ""}`.toLowerCase();
                    return !q || name.includes(q) || tracking.includes(q) || m.includes(q) || loc.includes(q);
                  })
                  .map((app) => {
                    const mCode = app.mCode || app.madrasahCode || "—";
                    const location = [app.upazila, app.district].filter(Boolean).join(", ");

                    return (
                      <div
                        key={app._id}
                        className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-400 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col gap-3.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
                              <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center flex-wrap gap-2">
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                                  {app.madrasahName}
                                </h3>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                  M: {mCode}
                                </span>
                              </div>
                              {location && (
                                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{location}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          <span className="inline-flex items-center gap-1 text-[10.5px] px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-semibold border border-amber-200 self-start sm:self-auto">
                            <Clock className="w-3 h-3" />
                            <span>বরাদ্দকৃত</span>
                          </span>
                        </div>

                        {/* Supportive Info Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50/90 p-3 rounded-xl border border-slate-100 text-xs">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-medium text-slate-400">ট্র্যাকিং</span>
                            <span className="font-mono font-bold text-slate-800 text-[11px] mt-0.5">
                              {app.trackingNo}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-medium text-slate-400">মুহতামিম</span>
                            <span className="font-semibold text-slate-800 text-[11px] mt-0.5">
                              {app.directorName || "—"}
                            </span>
                          </div>
                          <div className="flex flex-col col-span-2 sm:col-span-1">
                            <span className="text-[10px] font-medium text-slate-400">মোবাইল</span>
                            {app.directorMobile ? (
                              <a
                                href={`tel:${app.directorMobile}`}
                                className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>{app.directorMobile}</span>
                              </a>
                            ) : (
                              <span className="text-[11px] text-slate-600 mt-0.5">—</span>
                            )}
                          </div>
                        </div>

                        {/* Action Footer: 1 Primary Button + Three-Dot Dropdown */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleStartInspection(app)}
                            className="h-8.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>পরিদর্শন শুরু</span>
                          </button>

                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdown(
                                  openDropdown?.id === app._id && openDropdown?.type === "app"
                                    ? null
                                    : { id: app._id, type: "app" }
                                );
                              }}
                              className={`h-8.5 w-8.5 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                                openDropdown?.id === app._id && openDropdown?.type === "app"
                                  ? "bg-slate-100 text-slate-800 border-slate-300"
                                  : "bg-white hover:bg-slate-50 text-slate-500 border-slate-200"
                              }`}
                              title="অতিরিক্ত অপশন"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            <AnimatePresence>
                              {openDropdown?.id === app._id && openDropdown?.type === "app" && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ duration: 0.1 }}
                                  className="absolute right-0 bottom-full mb-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden py-1 divide-y divide-slate-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {app.trackingNo && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenDropdown(null);
                                        handleCopyTracking(app.trackingNo);
                                      }}
                                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 w-full text-left transition"
                                    >
                                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                                      <span>ট্র্যাকিং কপি</span>
                                    </button>
                                  )}

                                  {app.directorMobile && (
                                    <a
                                      href={`tel:${app.directorMobile}`}
                                      onClick={() => setOpenDropdown(null)}
                                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 w-full text-left transition"
                                    >
                                      <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>মুহতামিমকে কল</span>
                                    </a>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─── 6. Popups & Modals ─── */}
      {/* Modal 1: Inspection Entry Form Popup Modal */}
      {isFormModalOpen && (
        <InspectionForm
          isModal={true}
          isOpen={isFormModalOpen}
          initialApplication={selectedApplicationForForm}
          inspectorUser={inspectorUser}
          onSuccess={handleInspectionSuccess}
          onClose={() => setIsFormModalOpen(false)}
          onCancel={() => setIsFormModalOpen(false)}
        />
      )}

      {/* Modal 2: Inspection Report Preview & Print Modal */}
      {selectedReportForPrint && (
        <PrintableInspectionReport
          report={selectedReportForPrint}
          isOpen={Boolean(selectedReportForPrint)}
          onClose={() => setSelectedReportForPrint(null)}
        />
      )}
    </div>
  );
}
