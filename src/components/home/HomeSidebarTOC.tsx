"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  Store, 
  UserCheck, 
  Users, 
  GraduationCap, 
  CalendarDays, 
  BookOpenCheck, 
  FileText,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ListOrdered,
  FileCheck,
  Award
} from "lucide-react";

interface TOCItem {
  id: number;
  title: string;
  icon: React.ReactNode;
  link: string;
}

const tocItems: TOCItem[] = [
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

export default function HomeSidebarTOC() {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isExpanded) {
    return (
      <div 
        onClick={() => setIsExpanded(true)}
        className="cursor-pointer bg-white hover:bg-emerald-50/70 rounded-2xl shadow-xs border border-slate-200 p-2.5 flex flex-row lg:flex-col items-center justify-between gap-3 transition group w-full lg:w-11 h-auto lg:h-[480px] select-none"
        title="লিংকসমূহ খুলুন"
      >
        <div className="flex items-center gap-2 lg:flex-col">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <ListOrdered className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1 lg:[writing-mode:vertical-lr] lg:rotate-180 font-bold text-xs text-slate-700 group-hover:text-emerald-800 tracking-wider">
            <span>গুরুত্বপূর্ণ লিংক</span>
          </div>
        </div>

        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition shadow-2xs shrink-0">
          <ChevronRight className="w-3.5 h-3.5 hidden lg:block" />
          <ChevronDown className="w-3.5 h-3.5 lg:hidden" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden flex flex-col justify-between w-full lg:w-[240px] xl:w-[260px] 2xl:w-[275px] h-full min-h-[500px] transition-all">
      
      {/* Header */}
      <div className="p-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-600/10 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <ListOrdered className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm truncate">গুরুত্বপূর্ণ লিংক</h3>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="flex items-center gap-0.5 px-2 py-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 text-[11px] font-semibold transition"
          title="লুকান"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">লুকান</span>
        </button>
      </div>

      {/* Plain List: Just Icon and Text Label */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 overscroll-contain">
        {tocItems.map((item) => (
          <Link
            key={item.id}
            href={item.link}
            className="flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/70 transition-colors group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-slate-500 group-hover:text-emerald-600 transition-colors shrink-0">
                {item.icon}
              </span>
              <span className="text-xs font-semibold truncate text-slate-700 group-hover:text-emerald-800 transition-colors">
                {item.title}
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </Link>
        ))}
      </div>

      {/* Minimal Footer Callout */}
      <div className="p-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
        <span className="text-[11px]">সকল কার্যক্রম</span>
        <Link 
          href="/about/our_activities" 
          className="text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center gap-0.5 hover:underline text-[11px]"
        >
          <span>বিস্তারিত</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

    </div>
  );
}
