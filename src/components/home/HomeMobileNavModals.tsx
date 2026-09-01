"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ListOrdered, 
  Pin, 
  X, 
  ChevronRight, 
  ArrowRight, 
  Calendar, 
  Bell, 
  Building2, 
  Store, 
  UserCheck, 
  Users, 
  GraduationCap, 
  CalendarDays, 
  BookOpenCheck, 
  BookOpen,
  FileText 
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
    subtitle: "বোর্ডের প্রধান ও স্থায়ী কার্যালয়",
    icon: <Building2 className="w-4 h-4 text-emerald-600" />,
    link: "/about/board_introduction",
    badge: "তালিকা"
  },
  {
    id: 2,
    title: "বই বিক্রয় কেন্দ্র",
    subtitle: "সকল বিভাগীয় বিক্রয় কেন্দ্রসমূহ",
    icon: <Store className="w-4 h-4 text-blue-600" />,
    link: "/store",
    badge: "তালিকা"
  },
  {
    id: 3,
    title: "অফিস কর্মকর্তা তালিকা",
    subtitle: "বোর্ডের দায়িত্বশীল কর্মকর্তাবৃন্দ",
    icon: <UserCheck className="w-4 h-4 text-indigo-600" />,
    link: "/member/office-staff",
    badge: "তালিকা"
  },
  {
    id: 4,
    title: "প্রশিক্ষক ও পরিদর্শক",
    subtitle: "কেন্দ্রীয় পরিদর্শক ও প্রশিক্ষক প্যানেল",
    icon: <Users className="w-4 h-4 text-amber-600" />,
    link: "/member/trainer-inspector",
    badge: "তালিকা"
  },
  {
    id: 5,
    title: "স্থায়ী প্রশিক্ষণ কেন্দ্রসমূহ",
    subtitle: "সারাদেশের স্থায়ী প্রশিক্ষণ কেন্দ্র",
    icon: <GraduationCap className="w-4 h-4 text-purple-600" />,
    link: "/training/permanent-center-list",
    badge: "তালিকা"
  },
  {
    id: 6,
    title: "বাৎসরিক প্রশিক্ষণ কেন্দ্র",
    subtitle: "ব্যাচভিত্তিক চলমান প্রশিক্ষণ তালিকা",
    icon: <BookOpenCheck className="w-4 h-4 text-teal-600" />,
    link: "/training/batchwise-center-list",
    badge: "তালিকা"
  },
  {
    id: 7,
    title: "বাৎসরিক ক্যালেন্ডার",
    subtitle: "২০২৬ সালের বাৎসরিক ছুটির তালিকা",
    icon: <CalendarDays className="w-4 h-4 text-rose-600" />,
    link: "/training/rules",
    badge: "২০২৬"
  },
  {
    id: 8,
    title: "মজলিশে আমেলা ও শুরা",
    subtitle: "কার্যকরী পরিষদ ও নীতিনির্ধারণী কমিটি",
    icon: <FileText className="w-4 h-4 text-sky-600" />,
    link: "/member/amela",
    badge: "পরিষদ"
  }
];

export default function HomeMobileNavModals({ notices = [] }: { notices?: NoticeItem[] }) {
  const [activeModal, setActiveModal] = useState<"toc" | "notice" | null>(null);

  return (
    <>
      {/* ─── Top Horizontally Scrollable Quick Bar on Mobile ────────────────── */}
      <div className="lg:hidden w-full overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-2.5 min-w-max">
          {/* Button 1: গুরুত্বপূর্ণ লিংকসমূহ */}
          <button
            onClick={() => setActiveModal("toc")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-emerald-200 shadow-sm text-slate-800 active:scale-95 transition-all text-xs font-bold hover:bg-emerald-50"
          >
            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <ListOrdered className="w-4 h-4" />
            </div>
            <span>গুরুত্বপূর্ণ লিংকসমূহ</span>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              ৮টি লিংক
            </span>
          </button>

          {/* Button 2: নোটিশ বোর্ড */}
          <button
            onClick={() => setActiveModal("notice")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-amber-200 shadow-sm text-slate-800 active:scale-95 transition-all text-xs font-bold hover:bg-amber-50"
          >
            <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Pin className="w-4 h-4" />
            </div>
            <span>নোটিশ বোর্ড</span>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              বিজ্ঞপ্তি ({notices.length})
            </span>
          </button>

          {/* Button 3: প্রশ্ন অর্ডার */}
          <Link
            href="/academic/question-order"
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 shadow-sm text-white active:scale-95 transition-all text-xs font-bold shrink-0"
          >
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            <span>প্রশ্ন অর্ডার</span>
          </Link>

          {/* Button 4: বই অর্ডার */}
          <Link
            href="/store"
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 shadow-sm text-slate-950 active:scale-95 transition-all text-xs font-black shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>বই অর্ডার</span>
          </Link>
        </div>
      </div>

      {/* ─── TOC Popup Modal on Mobile (Full Height Drawer) ────────────────── */}
      {activeModal === "toc" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-lg w-full h-[85vh] max-h-[90vh] flex flex-col justify-between overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-slate-50 to-transparent flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center font-bold">
                  <ListOrdered className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base leading-tight">গুরুত্বপূর্ণ লিংকসমূহ</h3>
                  <p className="text-xs text-slate-500">বোর্ডের সকল প্রয়োজনীয় ও জরুরী রেফারেন্স লিংক</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Items List */}
            <div className="divide-y divide-slate-100 flex-1 overflow-y-auto p-2 sm:p-3 overscroll-contain">
              {tocItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.link}
                  onClick={() => setActiveModal(null)}
                  className="group flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-emerald-800 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    {item.badge && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <Link 
                href="/about/our_activities" 
                onClick={() => setActiveModal(null)}
                className="text-emerald-700 font-bold inline-flex items-center gap-1 hover:underline"
              >
                সকল নিয়ম ও কার্যক্রম দেখুন
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-300"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Notice Popup Modal on Mobile (Full Height Drawer) ─────────────── */}
      {activeModal === "notice" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-lg w-full h-[85vh] max-h-[90vh] flex flex-col justify-between overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-amber-50 via-slate-50 to-transparent flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-600/10 text-amber-700 flex items-center justify-center font-bold">
                  <Pin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base leading-tight">নোটিশ বোর্ড</h3>
                  <p className="text-xs text-slate-500">বোর্ডের সকল সাম্প্রতিক বিজ্ঞপ্তি</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Notices List (Stretches Full Height) */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 overscroll-contain flex flex-col justify-start">
              {notices.length === 0 ? (
                <div className="text-center text-slate-400 py-16 px-4 text-xs sm:text-sm flex flex-col items-center justify-center flex-1 my-auto">
                  <Bell className="w-10 h-10 text-slate-300 mb-3" />
                  <p className="font-semibold text-slate-600">এই মুহূর্তে কোনো নতুন নোটিশ প্রকাশিত হয়নি</p>
                  <p className="text-[11px] text-slate-400 mt-1">পূর্বের নোটিশগুলো দেখতে নিচের আর্কাইভ বাটনে ক্লিক করুন</p>
                </div>
              ) : (
                <div className="space-y-2.5 flex-1">
                  {notices.map((notice) => {
                    const dateStr = new Date(notice.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    });
                    const parts = dateStr.split(" ");
                    const day = parts[0] || "";
                    const month = parts[1] || "";
                    const year = parts[2] || "";

                    return (
                      <Link 
                        href={`/notices/${notice.id}`} 
                        key={notice.id} 
                        onClick={() => setActiveModal(null)}
                        className="block"
                      >
                        <div className="flex items-start gap-3 p-3 rounded-2xl hover:bg-emerald-50/60 transition-all border border-slate-200/80 group bg-white shadow-2xs">
                          {/* Date Badge */}
                          <div className="flex-shrink-0 text-center w-12 bg-slate-50 group-hover:bg-emerald-100/70 rounded-xl p-1.5 border border-slate-200 flex flex-col justify-center">
                            <span className="text-base font-black text-slate-800 leading-none group-hover:text-emerald-800">
                              {day}
                            </span>
                            <span className="text-[9.5px] font-bold text-slate-500 uppercase mt-0.5 leading-none">
                              {month}
                            </span>
                            <span className="text-[8.5px] text-slate-400 leading-none mt-0.5">
                              {year}
                            </span>
                          </div>

                          {/* Notice Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
                              {notice.title}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 mt-1.5">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{dateStr}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer (Pinned at Bottom) */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <Link 
                href="/notices" 
                onClick={() => setActiveModal(null)}
                className="text-emerald-700 font-bold inline-flex items-center gap-1 hover:underline text-xs"
              >
                সকল নোটিশ আর্কাইভ দেখুন
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-300"
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
