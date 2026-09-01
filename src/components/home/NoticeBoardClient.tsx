"use client";

import { useState } from "react";
import Link from "next/link";
import { Pin, ArrowRight, Bell, Calendar, ChevronRight, ChevronLeft, ChevronDown } from "lucide-react";

interface NoticeItem {
  id: string;
  title: string;
  createdAt: string | Date;
}

export default function NoticeBoardClient({ notices }: { notices: NoticeItem[] }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isExpanded) {
    return (
      <div 
        onClick={() => setIsExpanded(true)}
        className="cursor-pointer bg-white hover:bg-emerald-50 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-slate-200/90 p-2.5 sm:p-3 flex flex-row lg:flex-col items-center justify-between gap-3 transition-all duration-300 group hover:border-emerald-400 w-full lg:w-12 h-auto lg:h-[480px] select-none"
        title="নোটিশ বোর্ড খুলুন (Click to Expand)"
      >
        <div className="flex items-center gap-2 lg:flex-col">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-700 flex items-center justify-center font-bold shrink-0 group-hover:scale-110 transition-transform">
            <Pin className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5 lg:[writing-mode:vertical-lr] lg:rotate-180 font-bold text-xs text-slate-700 group-hover:text-emerald-800 tracking-wider">
            <span>নোটিশ বোর্ড</span>
            <span className="text-[10px] text-emerald-600 font-normal lg:hidden">(খুলুন)</span>
          </div>
        </div>

        <div className="w-7 h-7 rounded-full bg-emerald-100/80 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-2xs shrink-0">
          <ChevronLeft className="w-4 h-4 hidden lg:block" />
          <ChevronDown className="w-4 h-4 lg:hidden" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-slate-100/90 overflow-hidden h-full min-h-[520px] sm:min-h-[550px] flex flex-col justify-between w-full lg:w-[260px] xl:w-[280px] 2xl:w-[300px] transition-all duration-300">
      {/* Responsive Header with Side Collapse Toggle */}
      <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 via-slate-50/60 to-transparent shrink-0">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <Pin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 text-sm leading-tight truncate">নোটিশ বোর্ড</h3>
            <p className="text-[10.5px] text-slate-500 font-medium truncate">সাম্প্রতিক বিজ্ঞপ্তি</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 pl-1">
          <Link 
            href="/notices" 
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center shrink-0 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg gap-0.5"
            title="সকল নোটিশ"
          >
            <span>সকল</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-white/90 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 text-[11px] font-bold border border-slate-200/80 transition-colors shadow-2xs"
            title="সাইডে সঙ্কুচিত করুন (Collapse to side)"
          >
            <span className="hidden sm:inline">লুকান</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {/* Notice Items List (Touch-Friendly & Full Stretch) */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-2.5 space-y-2 overscroll-contain flex flex-col">
        {notices.length === 0 ? (
          <div className="text-center text-slate-400 py-12 px-4 text-xs sm:text-sm flex flex-col items-center justify-center flex-1 my-auto">
            <Bell className="w-8 h-8 text-slate-300 mb-2" />
            <p>এই মুহূর্তে কোনো নোটিশ প্রকাশিত হয়নি</p>
          </div>
        ) : (
          <div className="space-y-2 flex-1">
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
                <Link href={`/notices/${notice.id}`} key={notice.id} className="block">
                  <div className="flex items-start sm:items-center gap-2 sm:gap-2.5 p-2 rounded-xl hover:bg-emerald-50/60 transition-all border border-slate-100/70 hover:border-emerald-200 cursor-pointer group bg-white shadow-2xs">
                    {/* Date Badge */}
                    <div className="flex-shrink-0 text-center w-11 sm:w-12 bg-slate-50 group-hover:bg-emerald-100/70 rounded-lg p-1 border border-slate-200/70 group-hover:border-emerald-200 transition-colors flex flex-col justify-center">
                      <span className="text-base sm:text-lg font-black text-slate-800 leading-none group-hover:text-emerald-800 transition-colors">
                        {day}
                      </span>
                      <span className="text-[9px] sm:text-[9.5px] font-bold text-slate-500 uppercase mt-0.5 leading-none group-hover:text-emerald-700 transition-colors">
                        {month}
                      </span>
                      <span className="text-[8px] text-slate-400 leading-none mt-0.5">
                        {year}
                      </span>
                    </div>

                    {/* Notice Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-[12.5px] font-semibold text-slate-700 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
                        {notice.title}
                      </p>
                      <div className="flex items-center gap-1 text-[9.5px] text-slate-400 mt-0.5">
                        <Calendar className="w-2.5 h-2.5 text-slate-400" />
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

      {/* Footer link pinned at bottom */}
      <div className="p-2 sm:p-2.5 bg-slate-50 border-t border-slate-100 text-center shrink-0 mt-auto">
        <Link 
          href="/notices" 
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 hover:underline text-[10.5px]"
        >
          <span>আর্কাইভ ও পূর্ববর্তী নোটিশসমূহ</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
