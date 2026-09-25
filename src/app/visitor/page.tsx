"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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

  // Selected report for printable view
  const [selectedReportForPrint, setSelectedReportForPrint] = useState<any | null>(null);

  // Selected application to start inspection on
  const [selectedApplicationForForm, setSelectedApplicationForForm] = useState<any | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // Inspector user state (can be fetched from session or default)
  const inspectorUser = {
    id: "64b7f8c12345678901234567",
    name: "মাওলানা মোহাম্মাদ আলী",
    phone: "০১৭১১-XXXXXX",
  };

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

  const handleLogout = () => {
    router.push("/login");
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

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 min-h-screen p-4 flex flex-col shrink-0">
        <div className="mb-6 p-3 bg-slate-900 rounded-2xl text-white">
          <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">
            কেন্দ্রীয় ইআরপি
          </span>
          <h2 className="text-base font-bold text-white mt-0.5">পরিদর্শক প্যানেল</h2>
          <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
            মাঠ পরিদর্শক সক্রিয়
          </p>
        </div>

        <nav className="flex-1 space-y-1.5">
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "ড্যাশবোর্ড" },
            { id: "new_report", icon: PlusCircle, label: "নতুন পরিদর্শন এন্ট্রি" },
            { id: "reports", icon: ClipboardList, label: "পরিদর্শন রিপোর্টসমূহ" },
            { id: "madrasas", icon: Building2, label: "বরাদ্দকৃত মাদরাসা" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-full text-xs font-semibold transition-all ${
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
            className="w-full flex items-center space-x-3 px-4 py-2 rounded-full text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>লগআউট</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        {/* Top Bar */}
        <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {activeTab === "dashboard" && "স্বাগতম, মাওলানা মোহাম্মাদ আলী!"}
              {activeTab === "new_report" && "নতুন সরেজমিন পরিদর্শন প্রতিবেদন"}
              {activeTab === "reports" && "দাখিলকৃত পরিদর্শন রিপোর্ট তালিকা"}
              {activeTab === "madrasas" && "বরাদ্দকৃত মাদরাসা তালিকা"}
            </h1>
            <p className="text-xs text-slate-500">
              নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ — কেন্দ্রীয় মাদরাসা পরিদর্শন ও অডিট সিস্টেম
            </p>
          </div>

            <button
              onClick={() => {
                setSelectedApplicationForForm(null);
                setIsFormModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              নতুন পরিদর্শন শুরু করুন (পপআপ ফর্ম)
            </button>
        </header>

        {/* Tab 1: Dashboard */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* 4 Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "মোট বরাদ্দকৃত", value: totalAssigned, color: "text-slate-800", bg: "bg-white", icon: Building2 },
                { label: "অপেক্ষমান পরিদর্শন", value: pendingInspections, color: "text-amber-700", bg: "bg-white", icon: Clock },
                { label: "সম্পন্ন রিপোর্ট", value: completedInspections, color: "text-emerald-700", bg: "bg-white", icon: CheckCircle2 },
                { label: "গ্রেড 'এ' মাদরাসা", value: gradeACount, color: "text-blue-700", bg: "bg-white", icon: Award },
              ].map((stat, idx) => (
                <div key={idx} className={`${stat.bg} p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between`}>
                  <div>
                    <span className="text-[11px] font-medium text-slate-500 block">{stat.label}</span>
                    <span className={`text-2xl font-bold mt-1 block ${stat.color}`}>{stat.value}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Assigned Madrasas */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  চলমান ও অপেক্ষমান পরিদর্শন তালিকা
                </h2>
                <button
                  onClick={() => setActiveTab("madrasas")}
                  className="text-xs font-semibold text-emerald-600 hover:underline"
                >
                  সবগুলো দেখুন
                </button>
              </div>

              {applications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  কোনো বরাদ্দকৃত মাদরাসা নেই।
                </div>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {applications.slice(0, 5).map((app) => (
                    <div key={app._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{app.madrasahName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            M: {app.mCode || app.madrasahCode || "৭৫০"}
                          </span>
                        </div>
                        <div className="text-slate-500 text-[11px] mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
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

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartInspection(app)}
                          className="px-4 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 transition shadow-xs"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          পরিদর্শন শুরু করুন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Completed Reports */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-emerald-600" />
                  সম্প্রতি দাখিলকৃত পরিদর্শন রিপোর্টসমূহ
                </h2>
                <button
                  onClick={() => setActiveTab("reports")}
                  className="text-xs font-semibold text-emerald-600 hover:underline"
                >
                  সকল রিপোর্ট ({reports.length})
                </button>
              </div>

              {reports.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  এখনো কোনো রিপোর্ট দাখিল করা হয়নি।
                </div>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {reports.slice(0, 5).map((rep) => (
                    <div key={rep._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{rep.applicationId?.madrasahName || "মাদরাসা"}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                            {rep.gradeLabel || rep.grade} ({rep.totalScore}%)
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          তারিখ: {new Date(rep.inspectionDate).toLocaleDateString("bn-BD")} | ট্র্যাকিং: {rep.trackingNo}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedReportForPrint(rep)}
                          className="px-4 py-1.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          প্রিন্ট / ভিউ
                        </button>
                      </div>
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
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-emerald-900">ডিজিটাল পরিদর্শন ফর্ম</h3>
                <p className="text-xs text-emerald-700">আপনি ফুলস্ক্রিন পপআপ ডায়ালগ মোডালেও ফর্মটি পূরণ করতে পারেন।</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(true)}
                className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
              >
                পপআপ মোডালে খুলুন
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-800">দাখিলকৃত সকল পরিদর্শন রিপোর্ট</h2>
              <span className="text-xs text-slate-500 font-medium">মোট: {reports.length} টি</span>
            </div>

            {reports.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                কোনো রিপোর্ট পাওয়া যায়নি।
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {reports.map((rep) => (
                  <div key={rep._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {rep.applicationId?.madrasahName || "মাদরাসা"}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                          {rep.gradeLabel || rep.grade} ({rep.totalScore}%)
                        </span>
                        {rep.adminReviewStatus === "APPROVED" && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                            বোর্ড অনুমোদিত
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 text-[11px] flex flex-wrap gap-x-4">
                        <span>ট্র্যাকিং নং: {rep.trackingNo}</span>
                        <span>M কোড: {rep.issuedMadrasahCode || rep.applicationId?.mCode || "৭৫০"}</span>
                        <span>তারিখ: {new Date(rep.inspectionDate).toLocaleDateString("bn-BD")}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedReportForPrint(rep)}
                        className="px-4 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 transition shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        অফিসিয়াল রিপোর্ট প্রিন্ট
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Assigned Madrasas */}
        {activeTab === "madrasas" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-800">বরাদ্দকৃত মাদরাসা তালিকা</h2>
              <span className="text-xs text-slate-500 font-medium">মোট: {applications.length} টি</span>
            </div>

            {applications.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                আপনাকে এখনো কোনো মাদরাসা পরিদর্শনের জন্য বরাদ্দ করা হয়নি।
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {applications.map((app) => (
                  <div key={app._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{app.madrasahName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          M: {app.mCode || app.madrasahCode || "৭৫০"}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                          {app.status === "ASSIGNED" ? "অ্যাসাইনকৃত" : app.status}
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px] flex flex-wrap gap-x-4">
                        <span>ঠিকানা: {app.upazila}, {app.district}</span>
                        <span>পরিচালক: {app.directorName} ({app.directorMobile})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartInspection(app)}
                        className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition shadow-xs"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        সরেজমিন পরিদর্শন শুরু
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

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

      {/* Modal 2: Inspection Report Preview & Print */}
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
