"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Download, Printer, ExternalLink, FileText, Image as ImageIcon, File } from "lucide-react";
import Link from "next/link";

export interface NoticeModalItem {
  id: string;
  title: string;
  content: string;
  createdAt: string | Date;
}

interface NoticeModalProps {
  notice: NoticeModalItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function getNoticeAttachment(content: string): {
  url: string | null;
  type: 'pdf' | 'image' | 'doc' | 'none';
  label: string;
} {
  if (!content) return { url: null, type: 'none', label: '' };

  // 1. Check for standard document/file links in href
  const docLinkMatch = content.match(
    /href="([^"]*(?:\/uploads\/[^"]+|\.(?:pdf|doc|docx|xls|xlsx|zip|jpg|jpeg|png|webp)[^"]*))"/i
  );
  if (docLinkMatch && docLinkMatch[1]) {
    const url = docLinkMatch[1];
    const isPdf = url.toLowerCase().includes('.pdf');
    const isImg = /\.(jpg|jpeg|png|webp|gif|svg)/i.test(url);
    return {
      url,
      type: isPdf ? 'pdf' : isImg ? 'image' : 'doc',
      label: isPdf ? 'পিডিএফ ফাইল' : isImg ? 'ছবি ফাইল' : 'ডকুমেন্ট',
    };
  }

  // 2. Check for image src (including uploads, base64 data URIs, external)
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/i);
  if (imgMatch && imgMatch[1]) {
    const url = imgMatch[1];
    return {
      url,
      type: 'image',
      label: 'ছবি ফাইল',
    };
  }

  // 3. Check for any general link inside the content
  const anyLinkMatch = content.match(/href="([^"]+)"/i);
  if (anyLinkMatch && anyLinkMatch[1] && !anyLinkMatch[1].startsWith('#')) {
    const url = anyLinkMatch[1];
    const isPdf = url.toLowerCase().includes('.pdf');
    return {
      url,
      type: isPdf ? 'pdf' : 'doc',
      label: isPdf ? 'পিডিএফ ফাইল' : 'সংযুক্ত ফাইল',
    };
  }

  return { url: null, type: 'none', label: '' };
}

export default function NoticeModal({ notice, isOpen, onClose }: NoticeModalProps) {
  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !notice) return null;

  const date = new Date(notice.createdAt).toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Extract attachment using unified helper
  const attachment = getNoticeAttachment(notice.content);
  const downloadUrl = (notice as any).attachmentUrl || attachment.url;
  const isPdf = attachment.type === 'pdf' || downloadUrl?.toLowerCase().includes(".pdf");
  const isImage = attachment.type === 'image' || (downloadUrl && (downloadUrl.startsWith("data:image/") || /\.(jpg|jpeg|png|webp|gif|svg)/i.test(downloadUrl)));

  // Clean raw markup from injected attachment blocks
  let cleanContent = notice.content;
  if (downloadUrl) {
    cleanContent = cleanContent.replace(/<p><strong>📎 Attached Document: <\/strong>.*?<\/p>/gi, "");
    cleanContent = cleanContent.replace(
      /<div style="margin-top: 20px;[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>/gi,
      ""
    );
    cleanContent = cleanContent.replace(
      /<[a-z0-9]+>[^<]*<a href="\/uploads\/[^"]+?".*?>.*?<\/a>.*?<\/[a-z0-9]+>/gi,
      ""
    );
  }

  // Remove empty <p><br></p> tags at the end
  const hasTextBody = cleanContent.replace(/<[^>]*>/g, "").trim().length > 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col z-10 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Emerald Header Strip */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 shrink-0" />

          {/* Modal Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-3 shrink-0 bg-slate-50/50">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full font-mono">
                  <Calendar className="w-3 h-3 text-emerald-700" />
                  <span>{date}</span>
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  খুলনা নূরানী তালীমুল কুরআন বোর্ড
                </span>
              </div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 leading-snug">
                {notice.title}
              </h2>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
                  title="ফাইল ডাউনলোড করুন"
                >
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span>ডাউনলোড</span>
                </a>
              )}

              <button
                type="button"
                onClick={handlePrint}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
                title="নোটিশ প্রিন্ট করুন"
              >
                <Printer className="w-4 h-4" />
              </button>

              <Link
                href={`/notices/${notice.id}`}
                className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
                title="নতুন ট্যাবে বা পূর্ণ পেজে দেখুন"
                target="_blank"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-xl transition-colors ml-1"
                title="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            
            {/* Clean Formatted Text Body */}
            {hasTextBody && (
              <div className="bg-slate-50/70 rounded-2xl p-4 sm:p-6 border border-slate-100">
                <div
                  className="prose prose-sm sm:prose-base max-w-none text-slate-800 leading-relaxed ql-editor px-0 font-normal"
                  dangerouslySetInnerHTML={{ __html: cleanContent }}
                />
              </div>
            )}

            {/* Embedded PDF Viewer */}
            {downloadUrl && isPdf && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-slate-100">
                <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs">
                    <FileText className="w-4 h-4 text-red-600" />
                    <span>সংযুক্ত অফিসিয়াল পিডিএফ ডকুমেন্ট</span>
                  </div>
                  <a
                    href={downloadUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                  >
                    <Download className="w-3 h-3" />
                    <span>পিডিএফ সংরক্ষণ</span>
                  </a>
                </div>

                <iframe
                  src={downloadUrl}
                  className="w-full h-[450px] sm:h-[550px] md:h-[620px] border-none bg-white"
                  title="PDF Notice Document"
                />
              </div>
            )}

            {/* Attached Image Preview */}
            {downloadUrl && isImage && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-slate-900 p-2 text-center">
                <div className="flex justify-between items-center px-2 py-1 mb-2 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>সংযুক্ত নোটিশ ছবি</span>
                  </span>
                  <a
                    href={downloadUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>ছবি ডাউনলোড</span>
                  </a>
                </div>
                <img
                  src={downloadUrl}
                  alt={notice.title}
                  className="max-h-[600px] w-auto mx-auto rounded-xl object-contain shadow-md"
                />
              </div>
            )}

            {/* Other Document File Card */}
            {downloadUrl && !isPdf && !isImage && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <File className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800">সংযুক্ত অফিশিয়াল ফাইল</h4>
                    <p className="text-[11px] text-slate-500">ডাউনলোড করে বিস্তারিত দেখুন</p>
                  </div>
                </div>
                <a
                  href={downloadUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ডাউনলোড করুন</span>
                </a>
              </div>
            )}

          </div>

          {/* Modal Bottom Bar */}
          <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0 text-xs">
            <span className="text-slate-500 hidden sm:inline">
              নূরানী তালীমুল কুরআন বোর্ড খুলনা
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex sm:hidden items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ডাউনলোড</span>
                </a>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
