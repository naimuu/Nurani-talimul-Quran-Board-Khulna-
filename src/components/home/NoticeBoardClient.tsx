"use client";

import { useState } from "react";
import Link from "next/link";
import { Pin, ArrowRight, Bell, ChevronRight, ChevronLeft, ChevronDown } from "lucide-react";

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
        className="cursor-pointer bg-white hover:bg-emerald-50/70 rounded-2xl shadow-xs border border-slate-200 p-2.5 flex flex-row lg:flex-col items-center justify-between gap-3 transition group w-full lg:w-11 h-auto lg:h-[480px] select-none"
        title="নোটিশ বোর্ড খুলুন"
      >
        <div className="flex items-center gap-2 lg:flex-col">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <Pin className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1 lg:[writing-mode:vertical-lr] lg:rotate-180 font-bold text-xs text-slate-700 group-hover:text-emerald-800 tracking-wider">
            <span>নোটিশ বোর্ড</span>
          </div>
        </div>

        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition shadow-2xs shrink-0">
          <ChevronLeft className="w-3.5 h-3.5 hidden lg:block" />
          <ChevronDown className="w-3.5 h-3.5 lg:hidden" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden h-full min-h-[500px] flex flex-col justify-between w-full lg:w-[240px] xl:w-[260px] 2xl:w-[275px] transition-all">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/70 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-600/10 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <Pin className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm truncate">নোটিশ বোর্ড</h3>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link 
            href="/notices" 
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center shrink-0 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md gap-0.5"
            title="সকল নোটিশ"
          >
            <span>সকল</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="flex items-center gap-0.5 px-2 py-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 text-[11px] font-semibold transition"
            title="লুকান"
          >
            <span className="hidden sm:inline">লুকান</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {/* Plain Notice Items List */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 overscroll-contain flex flex-col">
        {notices.length === 0 ? (
          <div className="text-center text-slate-400 py-12 px-4 text-xs flex flex-col items-center justify-center flex-1 my-auto">
            <Bell className="w-7 h-7 text-slate-300 mb-2" />
            <p>কোনো নোটিশ নেই</p>
          </div>
        ) : (
          <div className="space-y-0.5 flex-1">
            {notices.map((notice) => {
              const dateStr = new Date(notice.createdAt).toLocaleDateString("bn-BD", {
                day: "numeric",
                month: "short",
                year: "numeric"
              });

              return (
                <Link href={`/notices/${notice.id}`} key={notice.id} className="block">
                  <div className="flex items-start gap-2 px-2.5 py-2 rounded-lg text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/70 transition-colors group cursor-pointer">
                    <Pin className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
                        {notice.title}
                      </p>
                      <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                        {dateStr}
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform shrink-0 mt-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-slate-50/70 border-t border-slate-100 text-center shrink-0 mt-auto">
        <Link 
          href="/notices" 
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 hover:underline text-[11px]"
        >
          <span>আর্কাইভ নোটিশসমূহ</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
