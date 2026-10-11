import HeroSlider from "@/components/home/HeroSlider";
import NoticeBoard from "@/components/home/NoticeBoard";
import HomeSidebarTOC from "@/components/home/HomeSidebarTOC";
import AboutBoard from "@/components/home/AboutBoard";
import TrainingSchedule from "@/components/home/TrainingSchedule";
import AuthorMessages from "@/components/home/AuthorMessages";
import HomeMobileNavModals from "@/components/home/HomeMobileNavModals";
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
          <div className="bg-emerald-700 text-white py-2 overflow-hidden flex items-center shadow-xs">
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 2xl:px-10 flex items-center">
              <span className="font-bold whitespace-nowrap bg-emerald-800 px-3 py-1 rounded-md mr-4 text-xs sm:text-sm z-10 shrink-0">
                জরুরী নোটিশ:
              </span>
              <div className="flex-1 overflow-hidden relative">
                {/* @ts-ignore - marquee for simple ticker */}
                <marquee className="text-xs sm:text-sm font-medium pt-0.5">{scrollingNotice}</marquee>
              </div>
            </div>
          </div>
        )}



        {/* Middle Section: 
            - Desktop (lg+): 3-Column Layout [Plain List TOC Left (Sticky)] + [Training Middle (Expanded)] + [Plain List Notice Right (Sticky)]
            - Mobile (< lg): Top Scrollable Quick Bar + Training Cards
        */}
        <section className="w-full max-w-[1850px] mx-auto px-2.5 sm:px-4 md:px-6 lg:px-8 py-3 md:py-4">
          {/* Desktop 3-Column Layout */}
          <div className="hidden lg:flex flex-row gap-3.5 sm:gap-4 lg:gap-4 xl:gap-5 items-start justify-between">
            {/* Left Column: Plain List Sidebar */}
            <div className="w-auto shrink-0 sticky top-[76px] self-start transition-all duration-300">
              <HomeSidebarTOC />
            </div>

            {/* Middle Column: Training Cards */}
            <div className="flex-1 min-w-0">
              <TrainingSchedule />
            </div>

            {/* Right Column: Plain List Notice Board */}
            <div className="w-auto shrink-0 sticky top-[76px] self-start transition-all duration-300">
              <NoticeBoard />
            </div>
          </div>

          {/* Mobile Optimized Layout */}
          <div className="flex lg:hidden flex-col gap-3.5">
            {/* Top Horizontally Scrollable Quick Bar with Popup Modal Triggers */}
            <HomeMobileNavModals notices={notices} />

            {/* Training Schedule Cards on Mobile */}
            <div className="w-full">
              <TrainingSchedule />
            </div>
          </div>
        </section>

        {/* Bottom Section: Board Introduction & Responsible Person Messages */}
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
