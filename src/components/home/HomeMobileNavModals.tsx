"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ListOrdered, 
  Pin, 
  X, 
  ChevronRight, 
  ArrowRight, 
  Bell, 
  Building2, 
  Store, 
  UserCheck, 
  Users, 
  GraduationCap, 
  CalendarDays, 
  BookOpenCheck, 
  FileText,
  FileCheck,
  Award
} from "lucide-react";

interface NoticeItem {
  id: string;
  title: string;
  createdAt: string | Date;
}

const tocItems = [
  {
    id: 1,
    title: "স্থায়ী কার্যালয়",
    icon: <Building2 className="w-4 h-4 text-emerald-600" />,
    link: "/about/board_introduction"
  },
  {
    id: 2,
    title: "বই বিক্রয় কেন্দ্র",
    icon: <Store className="w-4 h-4 text-emerald-600" />,
    link: "/store"
  },
  {
    id: 3,
    title: "কর্মকর্তা তালিকা",
    icon: <UserCheck className="w-4 h-4 text-emerald-600" />,
    link: "/member/office-staff"
  },
  {
    id: 4,
    title: "প্রশিক্ষক ও পরিদর্শক",
    icon: <Users className="w-4 h-4 text-emerald-600" />,
    link: "/member/trainer-inspector"
  },
  {
    id: 5,
    title: "স্থায়ী প্রশিক্ষণ কেন্দ্র",
    icon: <GraduationCap className="w-4 h-4 text-emerald-600" />,
    link: "/training/permanent-center-list"
  },
  {
    id: 6,
    title: "চলমান প্রশিক্ষণ ব্যাচ",
    icon: <BookOpenCheck className="w-4 h-4 text-emerald-600" />,
    link: "/training/batchwise-center-list"
  },
  {
    id: 7,
    title: "ছুটির ক্যালেন্ডার",
    icon: <CalendarDays className="w-4 h-4 text-emerald-600" />,
    link: "/training/rules"
  },
  {
    id: 8,
    title: "মজলিশে আমেলা ও শুরা",
    icon: <FileText className="w-4 h-4 text-emerald-600" />,
    link: "/member/amela"
  },
  {
    id: 9,
    title: "মাদরাসা পরিদর্শন ও এলহাক",
    icon: <FileCheck className="w-4 h-4 text-emerald-600" />,
    link: "/audit"
  },
  {
    id: 10,
    title: "কেন্দ্রীয় পরীক্ষার রেজাল্ট",
    icon: <Award className="w-4 h-4 text-emerald-600" />,
    link: "/results"
  }
];

export default function HomeMobileNavModals({ notices = [] }: { notices?: NoticeItem[] }) {
  const [activeModal, setActiveModal] = useState<"toc" | "notice" | null>(null);

  return (
    <>
      {/* ─── Top Fit-Screen Quick Bar on Mobile ────────────────── */}
      <div className="lg:hidden w-full py-1">
        <div className="grid grid-cols-2 gap-2.5 w-full">
          {/* Button 1: গুরুত্বপূর্ণ লিংক */}
          <button
            onClick={() => setActiveModal("toc")}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-slate-800 active:scale-95 transition text-xs sm:text-sm font-bold hover:bg-emerald-50 w-full"
          >
            <ListOrdered className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">গুরুত্বপূর্ণ লিংক</span>
          </button>

          {/* Button 2: নোটিশ বোর্ড */}
          <button
            onClick={() => setActiveModal("notice")}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-slate-800 active:scale-95 transition text-xs sm:text-sm font-bold hover:bg-amber-50 w-full"
          >
            <Pin className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="truncate">নোটিশ বোর্ড ({notices.length})</span>
          </button>
        </div>
      </div>

      {/* ─── TOC Popup Modal on Mobile ────────────────── */}
      {activeModal === "toc" && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-md w-full h-auto max-h-[82vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <ListOrdered className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">গুরুত্বপূর্ণ লিংক</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Plain Items List */}
            <div className="overflow-y-auto p-2 space-y-0.5 overscroll-contain max-h-[60vh]">
              {tocItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.link}
                  onClick={() => setActiveModal(null)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 transition group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-slate-500 group-hover:text-emerald-600 transition shrink-0">
                      {item.icon}
                    </span>
                    <span className="text-xs font-semibold truncate text-slate-800 group-hover:text-emerald-800">
                      {item.title}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition shrink-0" />
                </Link>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <Link 
                href="/about/our_activities" 
                onClick={() => setActiveModal(null)}
                className="text-emerald-700 font-bold inline-flex items-center gap-1 hover:underline text-[11px]"
              >
                সকল কার্যক্রম
                <ArrowRight className="w-3 h-3" />
              </Link>
              <button
                onClick={() => setActiveModal(null)}
                className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-300"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Notice Popup Modal on Mobile ─────────────── */}
      {activeModal === "notice" && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-md w-full h-auto max-h-[82vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Pin className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">নোটিশ বোর্ড</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Plain Notices List */}
            <div className="overflow-y-auto p-2 space-y-0.5 overscroll-contain max-h-[60vh]">
              {notices.length === 0 ? (
                <div className="text-center text-slate-400 py-10 px-4 text-xs flex flex-col items-center justify-center">
                  <Bell className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="font-medium text-slate-600">কোনো নোটিশ নেই</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {notices.map((notice) => {
                    const dateStr = new Date(notice.createdAt).toLocaleDateString("bn-BD", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    });

                    return (
                      <Link 
                        href={`/notices/${notice.id}`} 
                        key={notice.id} 
                        onClick={() => setActiveModal(null)}
                        className="block"
                      >
                        <div className="flex items-start gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 transition group cursor-pointer">
                          <Pin className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 group-hover:text-emerald-800 transition line-clamp-2 leading-snug">
                              {notice.title}
                            </p>
                            <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">
                              {dateStr}
                            </span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition shrink-0 mt-0.5" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <Link 
                href="/notices" 
                onClick={() => setActiveModal(null)}
                className="text-emerald-700 font-bold inline-flex items-center gap-1 hover:underline text-[11px]"
              >
                আর্কাইভ নোটিশসমূহ
                <ArrowRight className="w-3 h-3" />
              </Link>
              <button
                onClick={() => setActiveModal(null)}
                className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-300"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
