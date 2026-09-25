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
} from "lucide-react";
import toast from "react-hot-toast";
import PrintableInspectionReport from "@/components/inspection/PrintableInspectionReport";
import InspectionForm from "@/components/inspection/InspectionForm";
import { INSPECTION_TYPES } from "@/lib/inspectionUtils";

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
            onClick={() => {
              setSelectedAppForForm(null);
              setIsFormModalOpen(true);
            }}
            className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
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
    </div>
  );
}
