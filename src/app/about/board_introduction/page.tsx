import NoticeBoard from "@/components/home/NoticeBoard";
import EditableContent from "@/components/EditableContent";

export default function BoardIntroductionPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10 h-full">
            <h1 className="text-2xl md:text-3xl font-extrabold text-center text-slate-800 mb-2">
              বোর্ড পরিচিতি
            </h1>
            <div className="flex justify-center mb-6">
              <div className="h-1 w-20 bg-emerald-600 rounded-full"></div>
            </div>

            <EditableContent
              slug="board_introduction"
              defaultContent={`
                <p>সর্ব প্রথম মহান আল্লাহ রাব্বুল আলামিনের দরবারে শুকরিয়া আদায় করি, যিনি মানব জাঁতিকে সৃষ্টির শ্রেষ্ঠ হিসেবে দুনিয়াতে প্রেরণ করেছেন। আরো শুকরিয়া আদায় করি ঐ মহান করুনাময়ের নিকট যিনি আমাদেরকে শ্রেষ্ঠ নবীর উম্মত হিসেবে দুনিয়াতে পাঠিয়েছেন।</p>
                <p>পৃথিবী সৃষ্টির পর থেকেই মানুষ সামাজিকভাবে জীবন-যাপন করে আসছে। যুগে যুগে সমাজকে আম্বিয়া (আঃ) ও তার উত্তরসূরী ওলামায়ে কেরাম ও শিক্ষিত সমাজ ইসলামী শিক্ষা সহ আধুনিক শিক্ষায় শিক্ষিত করে উন্নতশীল সমাজ ব্যবস্থা গঠনের লক্ষে সর্বাত্নক প্রচেষ্টা চালিয়ে যাচ্ছে। সেই প্রচেষ্টাকে সামনে রেখেই বিশিষ্ট ওলামায়ে কেরাম ও শিক্ষাবিদদের উদ্যোগে "নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ" গঠিত হয়।</p>
                <ul class="list-disc pl-6 space-y-4 pt-4">
                  <li class="font-bold text-slate-800"><span class="text-slate-700 font-medium">প্রধান কার্যালয় : মুহাম্মাদনগর বড় মাদরাসা, মাদরাসা সড়ক, জলমা - ৯২৬০, লবণচরা, খুলনা।</span></li>
                </ul>
              `}
            />
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="sticky top-20">
            <NoticeBoard />
          </div>
        </div>

      </div>
    </div>
  );
}
