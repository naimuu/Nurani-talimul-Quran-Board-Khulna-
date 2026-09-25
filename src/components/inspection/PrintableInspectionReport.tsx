"use client";

import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { Printer, X, ShieldCheck, Download, Check, Eye } from "lucide-react";
import {
  GENERAL_CHECKLIST_ITEMS,
  STANDARD_INSPECTION_SUBJECTS,
  STANDARD_INSPECTION_CLASSES,
} from "@/lib/inspectionUtils";

interface InspectionReportModalProps {
  report: any;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function InspectionReportModal({
  report,
  isOpen = true,
  onClose,
}: InspectionReportModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const printContentRef = useRef<HTMLDivElement | null>(null);

  // Close on Escape key & disable background scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !report) return null;

  const app = report?.applicationId || {};
  const checklist = report?.generalChecklist || {};
  const matrix = report?.subjectMatrix || {};
  const teachers = report?.teacherStats || { total: 0, present: 0 };
  const students = report?.studentStats || { total: 0 };

  const verificationUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/inspection?ref=${encodeURIComponent(
          report?.trackingNo || ""
        )}&token=${encodeURIComponent(report?.verificationHash || "")}`
      : `https://nooraniboardkhulna.com/verify/inspection?ref=${report?.trackingNo || ""}`;

  useEffect(() => {
    QRCode.toDataURL(verificationUrl, { width: 140, margin: 1 })
      .then(setQrDataUrl)
      .catch((err) => console.error(err));
  }, [verificationUrl]);

  // Isolated Print Handler: Prints strictly the form sheet, zero outer UI/navbar/sidebar
  const handlePrintOnlyForm = () => {
    const printElement = printContentRef.current;
    if (!printElement) return;

    // Collect all parent stylesheets and styles to preserve full visual fidelity
    const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
      .map((el) => el.outerHTML)
      .join("\n");

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.zIndex = "-9999";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    const clonedContent = printElement.innerHTML;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="bn">
        <head>
          <meta charset="utf-8" />
          <title>পরিদর্শন রিপোর্ট - ${report.trackingNo || ""}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
          ${styles}
          <style>
            @font-face {
              font-family: 'SolaimanLipi';
              src: url('/fonts/SolaimanLipi.ttf') format('truetype');
              font-weight: 100 900;
              font-style: normal;
              font-display: swap;
            }

            @page {
              size: A4 portrait;
              margin: 7mm 8mm 7mm 8mm;
            }

            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #0f172a !important;
              font-family: 'SolaimanLipi', 'Hind Siliguri', 'Noto Sans Bengali', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
              font-size: 10.5px;
              line-height: 1.32;
            }

            .sheet-container {
              width: 100% !important;
              max-width: 780px !important;
              margin: 0 auto !important;
              background: #ffffff !important;
              padding: 0 !important;
              border: none !important;
              box-shadow: none !important;
            }

            /* Authentic Bengali Headline Typography */
            .board-title {
              font-family: 'SolaimanLipi', 'Hind Siliguri', 'Noto Sans Bengali', sans-serif !important;
              font-size: 23px !important;
              font-weight: 900 !important;
              color: #022c22 !important;
              text-align: center !important;
              line-height: 1.15 !important;
              letter-spacing: -0.01em !important;
            }

            table {
              border-collapse: collapse !important;
            }

            th, td {
              border: 1px solid #0f172a !important;
            }

            .badge-report-pill {
              background: #020617 !important;
              color: #ffffff !important;
              -webkit-print-color-adjust: exact !important;
            }
          </style>
        </head>
        <body>
          <div class="sheet-container">
            ${clonedContent}
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Trigger print once iframe resources are ready
    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.error("Print trigger failed:", e);
        }
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 2000);
      }, 300);
    };
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      {/* Modal Dialog Window */}
      <div className="relative bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-300 flex flex-col max-h-[94vh] overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        
        {/* Modal Top Action Bar (Excluded from Print) */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold tracking-wide">
              পপআপ প্রিভিউ
            </span>
            <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
              মাদরাসা পরিদর্শন রিপোর্ট (অফিস কপি) — {report.trackingNo || app.trackingNo || "INV"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintOnlyForm}
              className="px-4 sm:px-5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট করুন (Only Form)</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition text-sm cursor-pointer"
              title="বন্ধ করুন (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable Authentic Sheet */}
        <div className="p-3 sm:p-6 overflow-y-auto bg-slate-100 flex-1">
          <div
            ref={printContentRef}
            className="max-w-[780px] mx-auto bg-white p-5 sm:p-7 border border-slate-300 shadow-sm text-[11px] leading-snug text-slate-900"
          >
            {/* Header: Board Monogram, Authentic Bengali Title, Office Copy & Badge */}
            <div className="border-b-2 border-slate-950 pb-2 mb-2 relative text-center">
              
              <div className="flex items-center justify-between mb-1">
                {/* Official Board Logo */}
                <div className="w-16 h-16 shrink-0 flex items-center justify-start">
                  <img
                    src="/images/logo.png"
                    alt="Board Monogram"
                    className="w-14 h-14 object-contain"
                  />
                </div>

                {/* Authentically Styled Board Name Header */}
                <div className="flex-1 px-2 text-center">
                  <h1
                    className="board-title text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-tight"
                    style={{
                      fontFamily: "'SolaimanLipi', 'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
                      fontWeight: 900,
                    }}
                  >
                    নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ
                  </h1>
                  <p className="text-[10px] text-slate-800 mt-0.5 font-semibold leading-tight">
                    অস্থায়ী কার্যালয়: জামি'আ উমর বিন খাত্তাব রা. (মুহাম্মাদনগর মাদরাসা), মাদরাসা সড়ক, মুহাম্মাদনগর, জলমা-৯২৬০, বটিয়াঘাটা, খুলনা।
                  </p>
                  <p className="text-[10px] text-slate-800 font-semibold mt-0.5">
                    যোগাযোগ # ০১৭১৪-৯০৮৩৮১, ০১৩১২-১৩৫৮৮২, ০১৮৯৩-৪৩২৩১৩
                  </p>
                </div>

                {/* Office Copy Box */}
                <div className="w-16 shrink-0 flex justify-end items-start">
                  <span className="text-[10px] border-2 border-slate-950 px-2 py-0.5 rounded font-black text-slate-950 tracking-wider">
                    অফিস কপি
                  </span>
                </div>
              </div>

              {/* Inspection Report Badge */}
              <div className="badge-report-pill inline-block bg-slate-950 text-white px-6 py-0.5 rounded-full text-xs font-black mt-1 shadow-xs tracking-wider">
                পরিদর্শন রিপোর্ট
              </div>
            </div>

            {/* General Info Box */}
            <div className="border border-slate-900 rounded p-2 mb-2 text-[10.5px] space-y-1">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <div className="flex-1 min-w-[220px]">
                  <span className="font-bold">মাদরাসার নাম:-</span>{" "}
                  <span className="border-b border-dotted border-slate-800 px-2 font-bold">
                    {app.madrasahName || "তাহফিজুল উম্মাহ মডেল মাদরাসা"}
                  </span>
                </div>
                <div>
                  <span className="font-bold">A কোড:</span>{" "}
                  <span className="border-b border-dotted border-slate-800 px-1.5">{app.aCode || "—"}</span>
                </div>
                <div>
                  <span className="font-bold">M কোড:</span>{" "}
                  <span className="border-b border-dotted border-slate-800 px-2 font-bold">
                    {report.issuedMadrasahCode || app.mCode || app.madrasahCode || "৭৫০"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-1">
                <div>
                  <span className="font-bold">গ্রাম:-</span>{" "}
                  <span className="border-b border-dotted border-slate-800 px-1.5">{app.village || "—"}</span>
                </div>
                <div>
                  <span className="font-bold">ডাকঘর:-</span>{" "}
                  <span className="border-b border-dotted border-slate-800 px-2 font-medium">{app.postOffice || "পৌরসভা"}</span>
                </div>
                <div>
                  <span className="font-bold">থানা/উপজেলা:-</span>{" "}
                  <span className="border-b border-dotted border-slate-800 px-2 font-semibold">{app.upazila || "মোড়েলগঞ্জ"}</span>
                </div>
                <div>
                  <span className="font-bold">জেলা:-</span>{" "}
                  <span className="border-b border-dotted border-slate-800 px-2 font-semibold">{app.district || "বাগেরহাট"}</span>
                </div>
                <div>
                  <span className="font-bold">শিক্ষাবর্ষ:-</span>{" "}
                  <span className="border-b border-dotted border-slate-800 px-1 font-semibold">{app.academicYearCe || "২০২৬"} সাল</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-1">
                <div>
                  <span className="font-bold">পরিচালক/সভাপতির নাম:</span>{" "}
                  <span className="border-b border-dotted border-slate-800 px-2">{app.directorName || "হাফেজ গিয়াস উদ্দিন"}</span>
                </div>
                <div>
                  <span className="font-bold">মোবাইল:</span>{" "}
                  <span className="border-b border-dotted border-slate-800 px-2">{app.directorMobile || "০১৯৮২৮২১৯৫৫"}</span>
                </div>
                <div>
                  <span className="font-bold">নূরানী প্রধানের নাম:</span>{" "}
                  <span className="border-b border-dotted border-slate-800 px-2">{app.headTeacherName || "—"}</span>
                </div>
              </div>
            </div>

            {/* Inspection Phase Header */}
            <div className="text-[10px] font-bold text-center mb-1.5">
              নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ কর্তৃক পরিচালিত প্রতিষ্ঠান সমূহের{" "}
              <span className="underline px-1">{app.academicYearCe || "২০২৬"}</span> সালের{" "}
              <span className={`px-1.5 py-0.2 rounded border border-slate-700 ${report.phase === "phase_1" ? "bg-slate-900 text-white font-bold" : ""}`}>১ম</span> /{" "}
              <span className={`px-1.5 py-0.2 rounded border border-slate-700 ${report.phase === "phase_2" ? "bg-slate-900 text-white font-bold" : ""}`}>২য়</span> /{" "}
              <span className={`px-1.5 py-0.2 rounded border border-slate-700 ${report.phase === "phase_3" ? "bg-slate-900 text-white font-bold" : ""}`}>৩য়</span> পরিদর্শন
              (তারিখ: {new Date(report.inspectionDate || Date.now()).toLocaleDateString("bn-BD")})
            </div>

            {/* Table 1: ১১টি সার্বিক রিপোর্টের বিবরণ */}
            <table className="w-full border-collapse border border-slate-900 text-[9.5px] mb-2">
              <thead>
                <tr className="bg-slate-100 text-center font-bold">
                  <th className="border border-slate-900 p-1 w-8">ক্রমিক</th>
                  <th className="border border-slate-900 p-1 text-left">রিপোর্টের বিবরণ</th>
                  <th className="border border-slate-900 p-1 w-24">প্রথম পরিদর্শন</th>
                  <th className="border border-slate-900 p-1 w-20">দ্বিতীয় পরিদর্শন</th>
                  <th className="border border-slate-900 p-1 w-20">তৃতীয় পরিদর্শন</th>
                </tr>
              </thead>
              <tbody>
                {GENERAL_CHECKLIST_ITEMS.map((item) => {
                  const val = checklist[item.id];
                  return (
                    <tr key={item.id} className="border-b border-slate-900">
                      <td className="border border-slate-900 p-0.5 text-center font-bold">{item.sl}</td>
                      <td className="border border-slate-900 p-0.5">{item.label}</td>
                      <td className="border border-slate-900 p-0.5 text-center">
                        {item.options ? (
                          <div className="flex justify-center gap-1">
                            {item.options.map((opt) => (
                              <span
                                key={opt.value}
                                className={`px-1 rounded ${
                                  val === opt.value
                                    ? "bg-slate-950 text-white font-bold"
                                    : "text-slate-400 border border-slate-200"
                                }`}
                              >
                                {opt.label}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="font-bold">{val || 0} জন</span>
                        )}
                      </td>
                      <td className="border border-slate-900 p-0.5 text-center text-slate-300">—</td>
                      <td className="border border-slate-900 p-0.5 text-center text-slate-300">—</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Table 2: বিষয়ভিত্তিক ও শ্রেণিভিত্তিক মূল্যায়ন ম্যাট্রিক্স */}
            <table className="w-full border-collapse border border-slate-900 text-[8.5px] mb-2">
              <thead>
                <tr className="bg-slate-100 text-center font-bold">
                  <th className="border border-slate-900 p-0.5 w-24 text-left">বিষয়</th>
                  {STANDARD_INSPECTION_CLASSES.map((cls) => (
                    <th key={cls.id} className="border border-slate-900 p-0.5">
                      {cls.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STANDARD_INSPECTION_SUBJECTS.map((sub) => (
                  <tr key={sub.id} className="border-b border-slate-900">
                    <td className="border border-slate-900 p-0.5 font-semibold">
                      {sub.sl}. {sub.name}
                    </td>
                    {STANDARD_INSPECTION_CLASSES.map((cls) => {
                      const rating = matrix[cls.id]?.[sub.id] || "good";
                      return (
                        <td key={cls.id} className="border border-slate-900 p-0.5 text-center">
                          <span
                            className={`inline-block px-1 rounded ${
                              rating === "good"
                                ? "bg-slate-950 text-white font-bold"
                                : rating === "moderate"
                                ? "bg-slate-300 text-slate-800"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {rating === "good" ? "ভাল" : rating === "moderate" ? "মধ্যম" : "দুর্বল"}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Teachers & Students Summary */}
            <div className="border border-slate-900 rounded p-1.5 mb-2 text-[10px] space-y-0.5">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold">নূরানী বিভাগের শিক্ষকদের সংখ্যা ও উপস্থিতি:</span>{" "}
                  সংখ্যা: <span className="font-bold underline px-1">{teachers.total || 0}</span> উপস্থিত:{" "}
                  <span className="font-bold underline px-1">{teachers.present || 0}</span>
                </div>
              </div>

              <div className="border-t border-slate-300 pt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                <span className="font-bold">ছাত্র-ছাত্রীর সংখ্যা ➔</span>
                <span>প্লে- <strong className="underline">{students.play || 0}</strong> জন</span>
                <span>নার্সারী- <strong className="underline">{students.nursery || 0}</strong> জন</span>
                <span>১ম- <strong className="underline">{students.class_1 || 0}</strong> জন</span>
                <span>২য়- <strong className="underline">{students.class_2 || 0}</strong> জন</span>
                <span>৩য়- <strong className="underline">{students.class_3 || 0}</strong> জন</span>
                <span>৪র্থ- <strong className="underline">{students.class_4 || 0}</strong> জন</span>
                <span>৫ম- <strong className="underline">{students.class_5 || 0}</strong> জন</span>
                <span className="font-bold">সর্বমোট = <strong className="underline">{students.total || 0}</strong> জন</span>
              </div>
            </div>

            {/* Observations, Signatures & QR */}
            <div className="border border-slate-900 rounded p-2 text-[10px] flex justify-between items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <div>
                  <span className="font-bold">পরিদর্শক/পরিদর্শকদের অন্যান্য মন্তব্য (যদি থাকে):</span>
                  <p className="border-b border-dotted border-slate-800 min-h-[28px] pt-0.5 text-slate-700 italic">
                    {report.inspectorRemarks || "পরিদর্শন সন্তোষজনক এবং বোর্ডের নীতিমালা অনুযায়ী পাঠদান সচল রয়েছে।"}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-6">
                  {report.signatureUrl ? (
                    <div>
                      <img src={report.signatureUrl} alt="Signature" className="h-8 object-contain" />
                      <div className="text-[9px] text-slate-600 border-t border-slate-800 pt-0.5 font-medium">
                        পরিদর্শকের স্বাক্ষর ({report.inspectorName})
                      </div>
                    </div>
                  ) : (
                    <div className="text-center pt-5 border-t border-slate-800 min-w-[120px] text-[9px]">
                      পরিদর্শকের স্বাক্ষর
                    </div>
                  )}

                  <div className="text-center pt-5 border-t border-slate-800 min-w-[120px] text-[9px]">
                    বোর্ড চেয়ারম্যান / সচিব
                  </div>
                </div>
              </div>

              {/* Cryptographic QR Code */}
              <div className="text-center shrink-0 border border-slate-300 p-1.5 rounded bg-slate-50">
                {qrDataUrl && (
                  <img src={qrDataUrl} alt="Verification QR" className="w-16 h-16 mx-auto" />
                )}
                <div className="text-[8px] text-slate-600 font-bold mt-0.5">ভেরিফিকেশন QR</div>
                <div className="text-[7.5px] text-slate-400 font-mono">
                  {report.trackingNo}
                </div>
              </div>
            </div>

            {/* Official Seal / Grade Footer */}
            <div className="mt-2 pt-1 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-500">
              <div>
                বোর্ড ট্র্যাকিং: <strong>{report.trackingNo}</strong>
              </div>
              <div className="font-bold text-slate-800">
                স্কোর: {report.totalScore}% | গ্রেড: {report.gradeLabel || report.grade}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

// Also export as PrintableInspectionReport for backward compatibility
export const PrintableInspectionReport = InspectionReportModal;
