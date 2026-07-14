import { Pin, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function NoticeBoard() {
  let notices = [];
  try {
    notices = await (prisma as any).notice.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  } catch (error) {
    console.error("Failed to load notices for sidebar:", error);
  }

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-slate-100 overflow-hidden h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center text-primary font-bold">
          <Pin className="w-5 h-5 mr-2" />
          <span>নোটিশ</span>
        </div>
        <Link href="/notices" className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors flex items-center group">
          সকল নোটিশ <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
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
