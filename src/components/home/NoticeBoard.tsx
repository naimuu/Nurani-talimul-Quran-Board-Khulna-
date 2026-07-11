import { Pin, ArrowRight } from "lucide-react";
import Link from "next/link";

const notices = [
  { id: 1, date: "18 Apr 2026", title: "চতুর্থ শ্রেণির পরীক্ষার রুটিন" },
  { id: 2, date: "07 Apr 2026", title: "প্রি-তৃর্তীয় শ্রেণির ১ম সাময়িক পরীক্ষার রুটিন" },
  { id: 3, date: "06 Apr 2026", title: "৪র্থ শ্রেণির সিলেবাস" },
  { id: 4, date: "25 Mar 2026", title: "কেন্দ্রীয় সনদ পরীক্ষা ২০২৭ হিজরীর ফলাফল প্রকাশ করা হয়েছে।" },
];

export default function NoticeBoard() {
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
        {notices.map((notice) => (
          <div key={notice.id} className="flex gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer group">
            <div className="flex-shrink-0 text-center w-14 border-r-2 border-primary/30 pr-3 flex flex-col justify-center">
              <span className="text-lg font-bold text-slate-800 leading-none">{notice.date.split(" ")[0]}</span>
              <span className="text-xs font-medium text-slate-500 uppercase mt-1">{notice.date.split(" ")[1]}</span>
              <span className="text-[10px] text-slate-400">{notice.date.split(" ")[2]}</span>
            </div>
            <div className="flex-1 flex items-center">
              <p className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors line-clamp-2">
                {notice.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
