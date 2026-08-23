import NoticeBoard from "@/components/home/NoticeBoard";
import Image from "next/image";
import Link from "next/link";
import EditableContent from "@/components/EditableContent";
import ProfileCard from "@/components/sidebar/ProfileCard";

export default function BoardIntroductionPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12 h-full">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-slate-800 mb-2">
              বোর্ড পরিচিতি
            </h1>
            <div className="flex justify-center mb-8">
              <div className="h-1 w-24 bg-red-600 rounded"></div>
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
          <div className="h-[400px]">
            <NoticeBoard />
          </div>
          
          {/* Chairman Profile Card */}
          <ProfileCard
            slug="chairman"
            name="চেয়ারম্যান"
            title="চেয়ারম্যান"
            imageSrc="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=200&auto=format&fit=crop"
            link="/about/chairman"
            defaultExcerpt="বিসমিল্লাহির রাহমানির রাহিম। নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ-এর নিজস্ব ওয়েবসাইটে আপনাকে স্বাগতম। কুরআনুল কারীমের সহীহ তেলাওয়াত বিস্তার এবং শিশু মনে দ্বীনি শিক্ষার মৌলিক ভিত্তি তৈরিতে আমাদের এই অনলাইন প্ল্যাটফর্ম এক নতুন সংযোজন। আধুনিক তথ্যপ্রযুক্তির সুফল কাজে লাগিয়ে..."
          />

        </div>

      </div>
    </div>
  );
}
