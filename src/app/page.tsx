import HeroSlider from "@/components/home/HeroSlider";
import NoticeBoard from "@/components/home/NoticeBoard";
import ShortcutCards from "@/components/home/ShortcutCards";
import HomeSidebarTOC from "@/components/home/HomeSidebarTOC";
import AboutBoard from "@/components/home/AboutBoard";
import TrainingSchedule from "@/components/home/TrainingSchedule";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
        
        {/* Middle Section: TOC Sidebar (Left Corner) + Important Cards Grid (Middle) + Notice Board (Right Corner) */}
        <section className="w-full px-3 sm:px-4 md:px-6 lg:px-8 2xl:px-10 py-6 md:py-8">
          <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 xl:gap-8 items-start justify-between">
            {/* Left Column: Table of Contents / Directory List (Pushed to Left Corner & Sticky) */}
            <div className="w-full lg:w-[280px] xl:w-[320px] 2xl:w-[350px] shrink-0 order-2 lg:order-1 lg:sticky lg:top-[76px] self-start">
              <HomeSidebarTOC />
            </div>

            {/* Middle Column: Main Important Service Cards Grid (Centered in Middle) */}
            <div className="w-full flex-1 max-w-4xl mx-auto order-1 lg:order-2">
              <ShortcutCards />
            </div>

            {/* Right Column: Notice Board (Pushed to Right Corner & Sticky) */}
            <div className="w-full lg:w-[280px] xl:w-[320px] 2xl:w-[350px] shrink-0 order-3 lg:order-3 lg:sticky lg:top-[76px] self-start">
              <NoticeBoard />
            </div>
          </div>
        </section>

        {/* Bottom Section: Split Board & Training */}
        <section className="w-full px-3 sm:px-4 md:px-6 lg:px-8 2xl:px-10 py-4 md:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10 items-stretch">
            <div className="lg:col-span-5 flex flex-col">
              <AboutBoard />
            </div>
            <div className="lg:col-span-7 flex flex-col">
              <TrainingSchedule />
            </div>
          </div>
        </section>
      </div>

    </div>
  );
}
