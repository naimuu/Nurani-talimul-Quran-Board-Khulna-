import NoticeBoard from "@/components/home/NoticeBoard";
import Image from "next/image";
import Link from "next/link";
import EditableContent from "@/components/EditableContent";
import ProfileCard from "@/components/sidebar/ProfileCard";

export default function ChairmanPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12 h-full">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-2">
              চেয়ারম্যানের বাণী
            </h1>
            <p className="text-center font-bold text-slate-800 text-lg mb-4">
              চেয়ারম্যান
            </p>
            <div className="flex justify-center mb-8">
              <div className="h-1 w-32 bg-red-600 rounded"></div>
            </div>

            <EditableContent
              slug="chairman"
              defaultContent={`
                <div class="float-left mr-6 mb-4 rounded-xl overflow-hidden shadow-md">
                  <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=300&auto=format&fit=crop" alt="Chairman" width="220" height="280" class="object-cover" />
                </div>
                <p class="mb-4 font-bold text-lg text-emerald-800">
                  বিসমিল্লাহির রাহমানির রাহিম
                </p>
                <p class="mb-4">
                  নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ-এর নিজস্ব ওয়েবসাইটে আপনাকে স্বাগতম।
                </p>
                <p class="mb-4">
                  কুরআনুল কারীমের সহীহ তেলাওয়াত বিস্তার এবং শিশু মনে দ্বীনি শিক্ষার মৌলিক ভিত্তি তৈরিতে আমাদের এই অনলাইন প্ল্যাটফর্ম এক নতুন সংযোজন। আধুনিক তথ্যপ্রযুক্তির সুফল কাজে লাগিয়ে শিক্ষা প্রতিষ্ঠান, শিক্ষক, শিক্ষার্থী ও অভিভাবকদের মধ্যে একটি সুদৃঢ় মেলবন্ধন তৈরি করাই আমাদের প্রত্যাশা।
                </p>
                <p class="mb-4">
                  আসুন, প্রযুক্তির সঠিক ব্যবহারের মাধ্যমে আমরা আল-কুরআনের হেদায়েত ও নূর সবার মাঝে ছড়িয়ে দিই।
                </p>
                <div class="mt-8 font-bold text-slate-800 clear-both">
                  <p>বিনীত -</p>
                  <p class="mt-2 text-lg">চেয়ারম্যান</p>
                  <p class="text-slate-600 text-sm font-normal">নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ</p>
                </div>
              `}
            />
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="h-[400px]">
            <NoticeBoard />
          </div>
          
          {/* Secretary Profile Card */}
          <ProfileCard
            slug="secretary"
            name="মুফতি জসিম উদ্দীন সাহেব"
            title="মহাসচিব"
            imageSrc="https://images.unsplash.com/photo-1585036156171-384164a8c675?q=80&w=200&auto=format&fit=crop"
            link="/about/secretary"
            defaultExcerpt="বর্তমান যুগ আধুনিক তথ্য প্রযুক্তির যুগ। বিজ্ঞানের উন্নতির এই চরম উৎকর্ষতার যুগে নূরানী তালীমুল কুরআন বোর্ড পিছিয়ে থাকতে পারে না। তাই বোর্ডের যাবতীয় কার্যক্রমকে আধুনিক ও যুগোপযোগী করার লক্ষ্যে নতুন এই ওয়েবসাইট তৈরি করা হয়েছে। আমাদের লক্ষ্য হলো আ..."
          />

        </div>

      </div>
    </div>
  );
}
