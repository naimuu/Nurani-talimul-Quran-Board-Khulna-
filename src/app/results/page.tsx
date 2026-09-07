"use client";
import { useSearchParams } from 'next/navigation';
import { Award, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  
  const title = type === 'moallem' ? 'মুয়াল্লিম প্রশিক্ষণ পরীক্ষার ফলাফল' : 'কেন্দ্রীয় সমাপনী সনদ পরীক্ষার ফলাফল';

  return (
    <div className="min-h-[calc(100vh-320px)] bg-slate-50 py-5 sm:py-6">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 space-y-4">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-5 sm:p-7 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-block px-2.5 py-0.5 bg-emerald-700/80 border border-emerald-500/50 rounded-full text-[11px] font-semibold tracking-wider uppercase mb-2 text-emerald-200">
              পরীক্ষা নিয়ন্ত্রণ বিভাগ
            </span>
            <h1 className="text-xl sm:text-2xl font-bold mb-1.5">
              {title}
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
              রোল নম্বর অথবা মাদরাসা কোড দিয়ে কেন্দ্রীয় পরীক্ষার ফলাফল ও গ্রেড শিট অনুসন্ধান করুন।
            </p>
          </div>
        </div>

        {/* Results Search Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">ফলাফল অনুসন্ধান</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">নির্ধারিত তথ্য প্রদান করে ফলাফল দেখুন</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">পরীক্ষার সন / বছর</label>
                <select className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600">
                  <option>২০২৬ শিক্ষাবর্ষ</option>
                  <option>২০২৫ শিক্ষাবর্ষ</option>
                  <option>২০২৪ শিক্ষাবর্ষ</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">পরীক্ষার ধরন</label>
                <select className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600">
                  <option>কেন্দ্রীয় সমাপনী সনদ পরীক্ষা</option>
                  <option>মুয়াল্লিম প্রশিক্ষণ সমাপনী</option>
                  <option>১ম / ২য় সাময়িক পরীক্ষা</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">রোল নম্বর / মাদরাসা কোড</label>
                <input
                  type="text"
                  placeholder="যেমন: ১২৩৪০৫"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-xs active:scale-95"
              >
                <Search className="w-3.5 h-3.5" />
                <span>ফলাফল অনুসন্ধান</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs sm:text-sm mb-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>গুরুত্বপূর্ণ তথ্য ও নোটিশ</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                ফলাফল সংক্রান্ত যেকোনো আপত্তি বা উত্তরপত্র পুনঃনিরীক্ষণের জন্য ফলাফল প্রকাশের ১৫ দিনের মধ্যে আবেদন করতে হবে।
              </p>
              <Link
                href="/forms/exam-review"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                <span>উত্তরপত্র পুনঃনিরীক্ষণ আবেদন</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
              হেল্পলাইন: <span className="font-mono font-bold text-slate-700">01820-580560</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
