import HeroSlider from "@/components/home/HeroSlider";
import NoticeBoard from "@/components/home/NoticeBoard";
import HomeSidebarTOC from "@/components/home/HomeSidebarTOC";
import AboutBoard from "@/components/home/AboutBoard";
import TrainingSchedule from "@/components/home/TrainingSchedule";
import AuthorMessages from "@/components/home/AuthorMessages";
import HomeMobileNavModals from "@/components/home/HomeMobileNavModals";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ShoppingBag, BookOpen, FileQuestion, ArrowRight } from "lucide-react";

export default async function Home() {
  const user = await getUserSession();
  const isMadrasa = user?.role === "MADRASA";

  const record = await prisma.pageContent.findUnique({ where: { slug: 'cover-display-flags' } });
  let scrollingNotice = "";
  let showScrollingNotice = false;
  
  if (record) {
    try {
      const parsed = JSON.parse(record.content);
      scrollingNotice = parsed.scrollingNotice || "";
      showScrollingNotice = parsed.showScrollingNotice ?? false;
    } catch {}
  }

  // Fetch notices for mobile modal popup & desktop
  let notices: any[] = [];
  try {
    notices = await prisma.notice.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      select: {
        id: true,
        title: true,
        createdAt: true,
      }
    });
  } catch {}

  return (
    <div className="flex flex-col min-h-screen pb-16 bg-slate-50">
      
      {/* Top Section: Hero Slider (Parallax Sticky) */}
      <section className="w-full sticky top-[60px] md:top-[68px] z-0">
        <HeroSlider isMadrasa={isMadrasa} />
      </section>

      {/* Content wrapper with solid background to scroll over the sticky hero */}
      <div className="bg-slate-50 flex-1 relative z-10 shadow-[0_-8px_20px_rgb(0,0,0,0.08)]">
        
        {/* Scrolling Notice Ticker */}
        {showScrollingNotice && scrollingNotice && (
          <div className="bg-emerald-700 text-white py-2 overflow-hidden flex items-center shadow-sm">
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 2xl:px-10 flex items-center">
              <span className="font-bold whitespace-nowrap bg-emerald-800 px-3 py-1 rounded-md mr-4 text-sm z-10 shrink-0">জরুরী নোটিশ:</span>
              <div className="flex-1 overflow-hidden relative">
                {/* @ts-ignore - marquee is deprecated but works reliably for simple tickers without custom css */}
                <marquee className="text-sm font-medium pt-1">{scrollingNotice}</marquee>
              </div>
            </div>
          </div>
        )}

        {/* ─── ৬ নং: বই ও প্রশ্ন অর্ডার Showcase Bar ─────────────────────────────── */}
        <div className="w-full max-w-[1850px] mx-auto px-2.5 sm:px-4 md:px-6 lg:px-8 pt-4 pb-1">
          <div className="bg-gradient-to-r from-[#052e23] via-emerald-900 to-[#0a4233] rounded-2xl p-3.5 sm:p-4 text-white shadow-md border border-emerald-700/60 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold shrink-0 border border-amber-400/30 shadow-xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                  <span>বই ও প্রশ্নপত্র সরাসরি অর্ডার</span>
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full shadow-2xs">সরাসরি</span>
                </h3>
                <p className="text-xs text-emerald-200">সারাদেশের নূরানী মাদরাসার জন্য কেন্দ্রীয় পরীক্ষার প্রশ্ন ও সাজানো পাঠ্যবই অর্ডার</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
              {/* প্রশ্ন অর্ডার -> /academic/question-order */}
              <Link
                href="/academic/question-order"
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                <FileQuestion className="w-4 h-4 text-amber-300" />
                <span>প্রশ্ন অর্ডার</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {/* বই অর্ডার -> /store */}
              <Link
                href="/store"
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 text-xs sm:text-sm font-black rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                <BookOpen className="w-4 h-4" />
                <span>বই অর্ডার করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Middle Section: 
            - Desktop (lg+): 3-Column Layout [TOC Left (Sticky)] + [Training Middle (Expanded)] + [Notice Right (Sticky)]
            - Mobile (< lg): Top Scrollable Quick Bar (Click to open Popup Modal) + Training Cards (Clean & Focused)
        */}
        <section className="w-full max-w-[1850px] mx-auto px-2.5 sm:px-4 md:px-6 lg:px-8 py-3 md:py-5">
          {/* Desktop 3-Column Layout */}
          <div className="hidden lg:flex flex-row gap-3.5 sm:gap-4 lg:gap-4 xl:gap-5 items-start justify-between">
            {/* Left Column: Table of Contents */}
            <div className="w-auto shrink-0 sticky top-[76px] self-start transition-all duration-300">
              <HomeSidebarTOC />
            </div>

            {/* Middle Column: Training Cards */}
            <div className="flex-1 min-w-0">
              <TrainingSchedule />
            </div>

            {/* Right Column: Notice Board */}
            <div className="w-auto shrink-0 sticky top-[76px] self-start transition-all duration-300">
              <NoticeBoard />
            </div>
          </div>

          {/* Mobile Optimized Layout (No long cluttered cards below) */}
          <div className="flex lg:hidden flex-col gap-3.5">
            {/* Top Horizontally Scrollable Quick Bar with Popup Modal Triggers */}
            <HomeMobileNavModals notices={notices} />

            {/* Training Schedule Cards on Mobile */}
            <div className="w-full">
              <TrainingSchedule />
            </div>
          </div>
        </section>

        {/* Bottom Section: Board Introduction & Chairman/Secretary Messages (Centered Below) */}
        <section className="w-full px-2.5 sm:px-4 md:px-6 lg:px-8 py-3 md:py-4">
          <div className="max-w-[1780px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-stretch">
              <div className="flex flex-col">
                <AboutBoard />
              </div>
              <div className="flex flex-col">
                <AuthorMessages />
              </div>
            </div>
          </div>
        </section>
      </div>

    </div>
  );
}
