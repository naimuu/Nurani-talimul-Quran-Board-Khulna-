import { Pin, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function NoticeBoard() {
  let notices = [];
  try {
    notices = await (prisma as any).notice.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
    });
  } catch (error) {
    console.error("Failed to load notices for sidebar:", error);
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-slate-100/90 overflow-hidden max-h-[500px] lg:max-h-[calc(100vh-105px)] flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/70 via-slate-50/60 to-transparent shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-700 flex items-center justify-center font-bold">
            <Pin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm leading-tight">নোটিশ বোর্ড</h3>
            <p className="text-[11px] text-slate-500 font-medium">বোর্ডের সাম্প্রতিক বিজ্ঞপ্তি</p>
          </div>
        </div>
        <Link href="/notices" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center group bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg">
          সকল নোটিশ <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {notices.length === 0 ? (
          <div className="text-center text-slate-400 py-8 text-sm">
            কোন নোটিশ পাওয়া যায়নি
          </div>
        ) : (
          notices.map((notice: any) => {
            const dateStr = new Date(notice.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric"
            });
            const parts = dateStr.split(" ");
            const day = parts[0];
            const month = parts[1];
            const year = parts[2];

            return (
              <Link href={`/notices/${notice.id}`} key={notice.id}>
                <div className="flex gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer group">
                  <div className="flex-shrink-0 text-center w-14 border-r-2 border-primary/30 pr-3 flex flex-col justify-center">
                    <span className="text-lg font-bold text-slate-800 leading-none">{day}</span>
                    <span className="text-xs font-medium text-slate-500 uppercase mt-1">{month}</span>
                    <span className="text-[10px] text-slate-400">{year}</span>
                  </div>
                  <div className="flex-1 flex items-center">
                    <p className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors line-clamp-2">
                      {notice.title}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
