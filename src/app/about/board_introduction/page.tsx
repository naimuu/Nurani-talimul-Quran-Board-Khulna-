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
                <p>পৃথিবী সৃষ্টির পর থেকেই মানুষ সামাজিকভাবে জীবন-যাপন করে আসছে। যুগে যুগে সমাজকে আম্বিয়া (আঃ) ও তার উত্তরসূরী ওলামায়ে কেরাম ও শিক্ষিত সমাজ ইসলামী শিক্ষা সহ আধুনিক শিক্ষায় শিক্ষিত করে উন্নতশীল সমাজ ব্যবস্থা গঠনের লক্ষে সর্বাত্নক প্রচেষ্টা চালিয়ে যাচ্ছে। সেই প্রচেষ্টাকে সামনে রেখেই বৃহত্তর চট্টগ্রামের বিশিষ্ট্য উলামায়ে কেরাম ও শিক্ষিত সমাজ ১৯৯৫সনে "নূরানী তা'লীমুল কুরআন বোর্ড চট্টগ্রাম বাংলাদেশ" নামে একটি বোর্ড গঠন করে।</p>
                <ul class="list-disc pl-6 space-y-4 pt-4">
                  <li class="font-bold text-slate-800"><span class="text-slate-700 font-medium">প্রধান কার্যালয় : আল জামিয়াতুল আহলিয়া দারুল উলুম মুঈনুল ইসলাম হাটহাজারী।</span></li>
                  <li class="font-bold text-slate-800"><span class="text-slate-700 font-medium">কেন্দ্রীয় কার্যালয় : নূরানী তালীমুল কুরআন বোর্ড চট্টগ্রাম বাংলাদেশ। রেল স্টেশন রোড, হাটহাজারী-৪৩৩০, চট্টগ্রাম বাংলাদেশ</span></li>
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
            name="আল্লামা খলিল আহমদ কাসেমী"
            title="চেয়ারম্যান"
            imageSrc="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=200&auto=format&fit=crop"
            link="/about/chairman"
            defaultExcerpt="বিসমিল্লাহির রহমানির রহিম নূরানী তালীমুল কুরআন বোর্ড চট্টগ্রাম বাংলাদেশ এর সার্বিক কার্যক্রম বিস্তৃতির লক্ষ্যে নতুন ওয়েবসাইট খোলা হচ্ছে জেনে প্রথমত আমি মহান আল্লাহ তায়ালার দরবারে শুকরিয়া আদায় করছি এবং বোর্ডের সকল কর্মকর্তা-কর্মচারী সহ সংশ্লিষ্ট সকলকে আন্তরিক মোবারকবাদ ও অভিনন্দন জানাচ্ছি। বর্তমান যুগ আধুনিক তথ্য প্রযুক্তির যুগ। বিজ্ঞানের উন্নতির এ..."
          />

        </div>

      </div>
    </div>
  );
}
