"use client";

import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { Printer, X, ShieldCheck, Download, Check, Eye, Info, AlertTriangle, User } from "lucide-react";
import {
  GENERAL_CHECKLIST_ITEMS,
  STANDARD_INSPECTION_SUBJECTS,
  STANDARD_INSPECTION_CLASSES,
} from "@/lib/inspectionUtils";

// Custom SVG: Triangle outline (no background fill) with letter 'i' inside for Moderate rating
function TriangleInfoIcon({ className = "w-4 h-4 text-black" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Triangle Outline with No Background Fill */}
      <path
        d="M13.73 3.51a2 2 0 0 0-3.46 0l-8.2 14.35A2 2 0 0 0 3.8 21h16.4a2 2 0 0 0 1.73-3.14l-8.2-14.35Z"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inside Letter 'i' Dot */}
      <circle cx="12" cy="9.5" r="1.1" fill="currentColor" stroke="none" />
      {/* Inside Letter 'i' Stem */}
      <line x1="12" y1="13" x2="12" y2="17.5" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

// Helper to extract strictly a clean single label (no long sentences, no point numbers)
function getSingleLabel(rawLabel: string, value: string): string {
  const clean = (rawLabel || "").trim();
  const stripped = clean
    .replace(/\s*\([+-]?[0-9০-৯]+\)/g, "")
    .replace(/\s*[+-]?[0-9০-৯]+/g, "")
    .trim();

  if (
    value === "yes" ||
    value === "good" ||
    value === "full_uniform" ||
    stripped.includes("হ্যাঁ") ||
    stripped.includes("ভাল") ||
    stripped.includes("পরিপূর্ণ")
  ) {
    return stripped.includes("ভাল") ? "ভাল" : "হ্যাঁ";
  }
  if (
    value === "partial" ||
    value === "moderate" ||
    value === "partial_uniform" ||
    stripped.includes("আংশিক") ||
    stripped.includes("মধ্যম")
  ) {
    return stripped.includes("মধ্যম") ? "মধ্যম" : "আংশিক";
  }
  if (
    value === "no" ||
    value === "weak" ||
    value === "gross_violation" ||
    stripped.includes("না") ||
    stripped.includes("দুর্বল") ||
    stripped.includes("ঘাটতি") ||
    stripped.includes("লঙ্ঘন") ||
    stripped.includes("পরিপন্থী")
  ) {
    return stripped.includes("দুর্বল") ? "দুর্বল" : "না";
  }

  const firstWord = stripped.split(/[\s,–—]+/)[0] || stripped;
  return firstWord.replace(/[0-9০-৯()+-]/g, "").trim() || stripped;
}

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

  // Immutable historical snapshot rendering: render the exact criteria present when report was saved
  const checklistItems =
    Array.isArray(report?.checklistSnapshot) && report.checklistSnapshot.length > 0
      ? report.checklistSnapshot
      : GENERAL_CHECKLIST_ITEMS;
  const subjectsToRender =
    Array.isArray(report?.subjectSnapshot) && report.subjectSnapshot.length > 0
      ? report.subjectSnapshot
      : STANDARD_INSPECTION_SUBJECTS;
  const classesToRender =
    Array.isArray(report?.classesSnapshot) && report.classesSnapshot.length > 0
      ? report.classesSnapshot
      : STANDARD_INSPECTION_CLASSES;

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
  // Pure High-Fidelity Print Handler:
  // Prints the exact preview DOM element directly using current page styles & assets
  const handlePrintOnlyForm = () => {
    const printElement = printContentRef.current;
    if (!printElement) {
      window.print();
      return;
    }

    // Clean up any stale print mount
    const existing = document.getElementById("inspection-print-mount");
    if (existing) existing.remove();

    // Create mount at body root in the SAME document context
    const mount = document.createElement("div");
    mount.id = "inspection-print-mount";

    // Clone the exact preview DOM element (all classes, SVGs, QR code image, signatures)
    const clone = printElement.cloneNode(true) as HTMLElement;
    clone.id = "inspection-print-clone";
    mount.appendChild(clone);
    document.body.appendChild(mount);

    // Add printing state class to body
    document.body.classList.add("printing-inspection-report");

    // Clean up after print dialog closes
    const handleAfterPrint = () => {
      document.body.classList.remove("printing-inspection-report");
      if (document.body.contains(mount)) {
        document.body.removeChild(mount);
      }
      window.removeEventListener("afterprint", handleAfterPrint);
    };

    window.addEventListener("afterprint", handleAfterPrint);

    // Ensure all images (monogram logo, QR, signatures) in the clone are decoded before opening print
    const imgs = Array.from(clone.querySelectorAll("img"));
    const imgPromises = imgs.map((img) => {
      if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    });

    Promise.all(imgPromises).then(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          window.print();
        }, 60);
      });
    });

    // Safe timeout fallback in case afterprint is delayed
    setTimeout(handleAfterPrint, 3500);
  };

  return (
    <div
      className="inspection-modal-overlay fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      {/* Global Print Styles to keep print 100% identical to preview */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 5mm 6mm 5mm 6mm;
          }

          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Hide entire web app when printing from the mount */
          body.printing-inspection-report > *:not(#inspection-print-mount) {
            display: none !important;
          }

          body.printing-inspection-report > #inspection-print-mount {
            display: block !important;
            position: static !important;
            width: 100% !important;
            max-width: 780px !important;
            margin: 0 auto !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }

          body.printing-inspection-report > #inspection-print-mount * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          #inspection-print-clone {
            box-shadow: none !important;
            border: 1px solid #000000 !important;
            padding: 16px 20px !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 780px !important;
            background: #ffffff !important;
            color: #000000 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          /* Fallback when Ctrl+P is pressed directly without clicking button */
          body:not(.printing-inspection-report) header,
          body:not(.printing-inspection-report) aside,
          body:not(.printing-inspection-report) nav,
          body:not(.printing-inspection-report) footer,
          body:not(.printing-inspection-report) .inspection-modal-header {
            display: none !important;
          }

          body:not(.printing-inspection-report) .inspection-modal-overlay {
            position: static !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            display: block !important;
          }

          body:not(.printing-inspection-report) .inspection-modal-dialog {
            position: static !important;
            border: none !important;
            box-shadow: none !important;
            max-width: 100% !important;
            max-height: none !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
          }

          body:not(.printing-inspection-report) .inspection-modal-body {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            display: block !important;
          }

          body:not(.printing-inspection-report) #printable-inspection-sheet {
            box-shadow: none !important;
            border: 1px solid #000000 !important;
            padding: 16px 20px !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 780px !important;
            background: #ffffff !important;
            color: #000000 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Modal Dialog Window - Standard Slate/White Card */}
      <div className="inspection-modal-dialog relative bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[94vh] overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        
        {/* Modal Top Action Bar (Hidden during print) */}
        <div className="inspection-modal-header bg-slate-900 text-white px-4 sm:px-8 py-3 sm:py-4 min-h-[64px] sm:min-h-[72px] flex items-center justify-between shrink-0 border-b border-slate-800 shadow-lg print:hidden">
          <div className="flex flex-col min-w-0 pr-3">
            <h2 className="text-base sm:text-lg md:text-xl font-bold sm:font-black text-white truncate tracking-tight flex items-center">
              মাদরাসা পরিদর্শন রিপোর্ট— 
              <span className="ml-2 text-emerald-400 font-mono">{report.trackingNo || app.trackingNo || "INV"}</span>
            </h2>
            <div className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
              <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-slate-400">দাখিলকারী পরিদর্শক:</span>
              <strong className="text-emerald-300 font-bold">{report.inspectorName || "মাঠ পরিদর্শক"}</strong>
              {report.inspectionDate && (
                <span className="text-slate-400 ml-1">
                  • তারিখ: {new Date(report.inspectionDate).toLocaleDateString("bn-BD")}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Simple Print Button: Only Icon on Mobile, Icon + Text on Desktop */}
            <button
              onClick={handlePrintOnlyForm}
              title="প্রিন্ট করুন"
              className="px-3.5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-5 h-5 shrink-0" />
              <span className="hidden sm:inline">প্রিন্ট করুন</span>
            </button>

            {/* Increased Close Button */}
            <button
              onClick={onClose}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center justify-center transition cursor-pointer shadow-sm active:scale-95 shrink-0"
              title="বন্ধ করুন (Esc)"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body: Standard Light Canvas (Slate-100) Showcasing the 100% B&W Report Sheet */}
        <div className="inspection-modal-body p-3 sm:p-6 overflow-y-auto bg-slate-100 flex-1">
          <div
            ref={printContentRef}
            id="printable-inspection-sheet"
            className="max-w-[780px] mx-auto bg-white p-5 sm:p-7 border border-black text-[11px] leading-snug text-black shadow-lg print:shadow-none"
          >
            {/* Header: Board Monogram, Authentic Bengali Title, Office Copy & Badge */}
            <div className="border-b-2 border-black pb-2 mb-2 relative text-center">
              
              <div className="flex items-center justify-between mb-1">
                {/* Official Board Logo */}
                <div className="w-14 sm:w-16 h-14 sm:h-16 shrink-0 flex items-center justify-start">
                  <img
                    src="/images/logo.jpeg"
                    alt="Board Monogram"
                    className="w-12 sm:w-14 h-12 sm:h-14 object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/images/logo.png";
                    }}
                  />
                </div>

                {/* Authentically Styled Board Name Header */}
                <div className="flex-1 px-2 text-center">
                  <h1
                    className="board-title text-base sm:text-2xl md:text-[27px] font-black text-black tracking-tight leading-tight"
                    style={{
                      fontFamily: "'SolaimanLipi', 'Hind Siliguri', sans-serif",
                      fontWeight: 900,
                      WebkitTextStroke: "0.65px #000000",
                      textShadow: "0 0 0.5px #000000",
                    }}
                  >
                    নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ
                  </h1>
                  <p className="text-[10px] text-black mt-0.5 font-semibold leading-tight">
                    অস্থায়ী কার্যালয়: জামি'আ উমর বিন খাত্তাব রা. (মুহাম্মাদনগর মাদরাসা), মাদরাসা সড়ক, মুহাম্মাদনগর, জলমা-৯২৬০, বটিয়াঘাটা, খুলনা।
                  </p>
                  <p className="text-[10px] text-black font-semibold mt-0.5">
                    যোগাযোগ # ০১৭১৪-৯০৮৩৮১, ০১৩১২-১৩৫৮৮২, ০১৮৯৩-৪৩২৩১৩
                  </p>
                </div>

                {/* Office Copy Box */}
                <div className="w-16 shrink-0 flex justify-end items-start">
                  <span className="text-[10px] border-2 border-black px-2 py-0.5 rounded font-black text-black tracking-wider bg-white">
                    অফিস কপি
                  </span>
                </div>
              </div>

              {/* Inspection Report Badge */}
              <div className="pt-2 pb-1.5 flex justify-center">
                <div
                  className="badge-report-pill badge-pill-black inline-flex items-center justify-center bg-black text-white px-8 py-1.5 rounded-full text-xs sm:text-[13px] font-black tracking-wide"
                  style={{
                    fontFamily: "'SolaimanLipi', 'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
                    letterSpacing: "0.04em",
                  }}
                >
                  ❖ পরিদর্শন রিপোর্ট ❖
                </div>
              </div>
            </div>

            {/* General Info Box */}
            <div className="border border-black rounded p-2 mb-2 text-[10.5px] space-y-1 text-black bg-white">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <div className="flex-1 min-w-[220px]">
                  <span className="font-bold">মাদরাসার নাম:-</span>{" "}
                  <span className="border-b-2 border-dotted border-black px-2 font-bold text-black">
                    {app.madrasahName || "তাহফিজুল উম্মাহ মডেল মাদরাসা"}
                  </span>
                </div>
                <div>
                  <span className="font-bold">A কোড:</span>{" "}
                  <span className="border-b-2 border-dotted border-black px-1.5 text-black">{app.aCode || "—"}</span>
                </div>
                <div>
                  <span className="font-bold">M কোড:</span>{" "}
                  <span className="border-b-2 border-dotted border-black px-2 font-bold text-black">
                    {report.issuedMadrasahCode || app.mCode || app.madrasahCode || "৭৫০"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-1">
                <div>
                  <span className="font-bold">বিভাগ:-</span>{" "}
                  <span className="border-b-2 border-dotted border-black px-2 font-semibold text-black">{app.division || "—"}</span>
                </div>
                <div>
                  <span className="font-bold">জেলা:-</span>{" "}
                  <span className="border-b-2 border-dotted border-black px-2 font-semibold text-black">{app.district || "—"}</span>
                </div>
                <div>
                  <span className="font-bold">থানা/উপজেলা:-</span>{" "}
                  <span className="border-b-2 border-dotted border-black px-2 font-semibold text-black">{app.upazila || "—"}</span>
                </div>
                {app.union ? (
                  <div>
                    <span className="font-bold">ইউনিয়ন:-</span>{" "}
                    <span className="border-b-2 border-dotted border-black px-2 font-medium text-black">{app.union}</span>
                  </div>
                ) : null}
                <div>
                  <span className="font-bold">গ্রাম:-</span>{" "}
                  <span className="border-b-2 border-dotted border-black px-1.5 text-black">{app.village || "—"}</span>
                </div>
                <div>
                  <span className="font-bold">ডাকঘর:-</span>{" "}
                  <span className="border-b-2 border-dotted border-black px-2 font-medium text-black">{app.postOffice || "—"}</span>
                </div>
                <div>
                  <span className="font-bold">শিক্ষাবর্ষ:-</span>{" "}
                  <span className="border-b-2 border-dotted border-black px-1 font-semibold text-black">{app.academicYearCe || "২০২৬"} সাল</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-1">
                <div>
                  <span className="font-bold">পরিচালক/সভাপতির নাম:</span>{" "}
                  <span className="border-b-2 border-dotted border-black px-2 text-black">{app.directorName || "—"}</span>
                </div>
                <div>
                  <span className="font-bold">মোবাইল:</span>{" "}
                  <span className="border-b-2 border-dotted border-black px-2 text-black">{app.directorMobile || "০১৯৮২৮২১৯৫৫"}</span>
                </div>
                <div>
                  <span className="font-bold">নূরানী প্রধানের নাম:</span>{" "}
                  <span className="border-b-2 border-dotted border-black px-2 text-black">{app.headTeacherName || "—"}</span>
                </div>
              </div>
            </div>

            {/* Inspection Phase Header */}
            <div className="text-[10px] font-bold text-center mb-1.5 text-black">
              নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ কর্তৃক পরিচালিত প্রতিষ্ঠান সমূহের{" "}
              <span className="underline px-1 text-black">{app.academicYearCe || "২০২৬"}</span> সালের{" "}
              <span className={`px-2 py-0.5 rounded border border-black ${report.phase === "phase_1" ? "bg-black text-white font-bold" : "bg-white text-black font-semibold"}`}>১ম</span> /{" "}
              <span className={`px-2 py-0.5 rounded border border-black ${report.phase === "phase_2" ? "bg-black text-white font-bold" : "bg-white text-black font-semibold"}`}>২য়</span> /{" "}
              <span className={`px-2 py-0.5 rounded border border-black ${report.phase === "phase_3" ? "bg-black text-white font-bold" : "bg-white text-black font-semibold"}`}>৩য়</span> পরিদর্শন
              (তারিখ: {new Date(report.inspectionDate || Date.now()).toLocaleDateString("bn-BD")})
              {report.inspectorName && (
                <span className="ml-2 font-normal text-black">
                  • পরিদর্শক: <strong className="font-bold underline">{report.inspectorName}</strong>
                </span>
              )}
            </div>

            {/* Table 1: ১১টি সার্বিক রিপোর্টের বিবরণ */}
            <table className="w-full border-collapse border border-black text-[9.5px] mb-2 text-black bg-white">
              <thead>
                <tr className="bg-white text-center font-bold border-b border-black text-black">
                  <th className="border border-black p-1 w-8 text-black font-bold">ক্রমিক</th>
                  <th className="border border-black px-2 py-1 text-left text-black font-bold">রিপোর্টের বিবরণ</th>
                  <th className="border border-black p-1 w-24 text-black font-bold">প্রথম পরিদর্শন</th>
                  <th className="border border-black p-1 w-24 text-black font-bold">দ্বিতীয় পরিদর্শন</th>
                  <th className="border border-black p-1 w-24 text-black font-bold">তৃতীয় পরিদর্শন</th>
                </tr>
              </thead>
              <tbody>
                {checklistItems.map((item: any) => {
                  const val = checklist[item.id];
                  const selectedOpt = item.options?.find((opt: any) => opt.value === val);

                  const renderAnswerBadge = () => {
                    if (item.options) {
                      if (!selectedOpt) return <span className="text-black font-bold">—</span>;

                      const isGood = selectedOpt.value === "yes" || selectedOpt.value === "good" || selectedOpt.value === "full_uniform";
                      const isWeak = selectedOpt.value === "no" || selectedOpt.value === "weak" || selectedOpt.value === "gross_violation";
                      const isModerate = selectedOpt.value === "partial" || selectedOpt.value === "moderate" || selectedOpt.value === "partial_uniform";
                      const shortLabel = getSingleLabel(selectedOpt.label, selectedOpt.value);

                      return (
                        <span className="font-bold text-black text-[9.5px] inline-flex items-center justify-center gap-1 whitespace-nowrap">
                          {isGood && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                          {isModerate && <TriangleInfoIcon className="w-3.5 h-3.5 text-black" />}
                          {isWeak && <X className="w-3.5 h-3.5 text-black stroke-[3]" />}
                          <span>{shortLabel}</span>
                        </span>
                      );
                    }
                    return <span className="font-bold text-black text-[9.5px]">{val !== undefined ? `${val} জন` : "—"}</span>;
                  };

                  const isPhase1 = !report.phase || report.phase === "phase_1";
                  const isPhase2 = report.phase === "phase_2";
                  const isPhase3 = report.phase === "phase_3";

                  return (
                    <tr key={item.id} className="border-b border-black">
                      <td className="border border-black p-0.5 text-center font-bold text-black">{item.sl}</td>
                      <td className="border border-black px-2 py-0.5 text-black font-medium">{item.label}</td>
                      <td className="border border-black p-0.5 text-center text-black">
                        {isPhase1 ? renderAnswerBadge() : <span className="text-black font-bold">—</span>}
                      </td>
                      <td className="border border-black p-0.5 text-center text-black">
                        {isPhase2 ? renderAnswerBadge() : <span className="text-black font-bold">—</span>}
                      </td>
                      <td className="border border-black p-0.5 text-center text-black">
                        {isPhase3 ? renderAnswerBadge() : <span className="text-black font-bold">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Table 2: বিষয়ভিত্তিক ও শ্রেণিভিত্তিক মূল্যায়ন ম্যাট্রিক্স (Checkmark for Good, Triangle with 'i' for Medium, Cross for Bad - No BG, Full Black) */}
            <table className="w-full border-collapse border border-black text-[9px] mb-2 text-black bg-white">
              <thead>
                <tr className="bg-white text-center font-bold border-b border-black text-black">
                  <th className="border border-black px-2 py-1 w-[170px] min-w-[170px] text-left text-black font-bold whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      <span>বিষয়</span>
                      <span className="text-[7.5px] font-normal text-black ml-1 inline-flex items-center gap-1">
                        (✓ ভাল, <TriangleInfoIcon className="w-2.5 h-2.5 inline text-black" /> মধ্যম, ✕ দুর্বল)
                      </span>
                    </span>
                  </th>
                  {classesToRender.map((cls: any) => (
                    <th key={cls.id} className="border border-black p-1 text-center text-black font-bold min-w-[50px]">
                      {cls.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subjectsToRender.map((sub: any) => (
                  <tr key={sub.id} className="border-b border-black">
                    <td className="border border-black px-2 py-0.5 font-semibold text-black whitespace-nowrap text-[9px] sm:text-[9.5px]">
                      {sub.sl}. {sub.name}
                    </td>
                    {classesToRender.map((cls: any) => {
                      const rating = matrix[cls.id]?.[sub.id];

                      // If no rating was selected or evaluated for this class/subject, show pure black dash
                      if (!rating || rating === "none" || rating === "" || rating === "-") {
                        return (
                          <td key={cls.id} className="border border-black p-0.5 text-center text-black">
                            <span className="text-black font-bold text-[9px]">—</span>
                          </td>
                        );
                      }

                      if (rating === "good") {
                        return (
                          <td key={cls.id} className="border border-black p-0.5 text-center text-black" title="ভাল">
                            <div className="flex items-center justify-center py-0.5">
                              <Check className="w-4 h-4 text-black stroke-[3]" />
                            </div>
                          </td>
                        );
                      }

                      if (rating === "moderate") {
                        return (
                          <td key={cls.id} className="border border-black p-0.5 text-center text-black" title="মধ্যম">
                            <div className="flex items-center justify-center py-0.5">
                              <TriangleInfoIcon className="w-4 h-4 text-black" />
                            </div>
                          </td>
                        );
                      }

                      if (rating === "weak") {
                        return (
                          <td key={cls.id} className="border border-black p-0.5 text-center text-black" title="দুর্বল">
                            <div className="flex items-center justify-center py-0.5">
                              <X className="w-4 h-4 text-black stroke-[3]" />
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td key={cls.id} className="border border-black p-0.5 text-center text-black">
                          <span className="text-black font-bold text-[9px]">—</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Teachers & Students Summary */}
            <div className="border border-black rounded p-1.5 mb-2 text-[10px] space-y-0.5 text-black bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold">নূরানী বিভাগের শিক্ষকদের সংখ্যা ও উপস্থিতি:</span>{" "}
                  সংখ্যা: <span className="font-bold underline px-1">{teachers.total || 0}</span> উপস্থিত:{" "}
                  <span className="font-bold underline px-1">{teachers.present || 0}</span>
                </div>
              </div>

              <div className="border-t border-black pt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 text-black">
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
            <div className="border border-black rounded p-2 text-[10px] flex justify-between items-end gap-3 text-black bg-white">
              <div className="flex-1 space-y-1.5">
                <div>
                  <span className="font-bold">পরিদর্শক/পরিদর্শকদের অন্যান্য মন্তব্য (যদি থাকে):</span>
                  <p className="border-b-2 border-dotted border-black min-h-[28px] pt-0.5 text-black italic">
                    {report.inspectorRemarks || "পরিদর্শন সন্তোষজনক এবং বোর্ডের নীতিমালা অনুযায়ী পাঠদান সচল রয়েছে।"}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-6">
                  {report.signatureUrl && !report.signatureUrl.includes("iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB") ? (
                    <div>
                      <img src={report.signatureUrl} alt="Signature" className="h-8 max-w-[140px] object-contain" />
                      <div className="text-[9px] text-black border-t border-black pt-0.5 font-bold">
                        পরিদর্শকের স্বাক্ষর ({report.inspectorName})
                      </div>
                    </div>
                  ) : (
                    <div className="text-center pt-5 border-t border-black min-w-[120px] text-[9px] font-bold text-black">
                      পরিদর্শকের স্বাক্ষর {report.inspectorName ? `(${report.inspectorName})` : ""}
                    </div>
                  )}

                  <div className="text-center pt-5 border-t border-black min-w-[120px] text-[9px] font-bold text-black">
                    বোর্ড চেয়ারম্যান / সচিব
                  </div>
                </div>
              </div>

              {/* Cryptographic QR Code */}
              <div className="text-center shrink-0 border border-black p-1.5 rounded bg-white text-black">
                {qrDataUrl && (
                  <img src={qrDataUrl} alt="Verification QR" className="w-16 h-16 mx-auto" />
                )}
                <div className="text-[8px] text-black font-bold mt-0.5">ভেরিফিকেশন QR</div>
                <div className="text-[7.5px] text-black font-mono font-bold">
                  {report.trackingNo}
                </div>
              </div>
            </div>

            {/* Official Seal / Grade Footer */}
            <div className="mt-2 pt-1 border-t border-black flex justify-between items-center text-[9px] text-black">
              <div>
                বোর্ড ট্র্যাকিং: <strong className="text-black">{report.trackingNo}</strong>
                {report.inspectorName && (
                  <span className="ml-3 font-medium">
                    পরিদর্শক: <strong className="text-black font-bold">{report.inspectorName}</strong>
                  </span>
                )}
              </div>
              <div className="font-bold text-black">
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
