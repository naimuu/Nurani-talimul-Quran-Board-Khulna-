import NoticeBoard from "@/components/home/NoticeBoard";
import Image from "next/image";
import Link from "next/link";
import EditableContent from "@/components/EditableContent";
import ProfileCard from "@/components/sidebar/ProfileCard";

export default function SecretaryPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12 h-full">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-2">
              মুফতি জসিম উদ্দীন সাহেব
            </h1>
            <p className="text-center font-bold text-slate-800 text-lg mb-4">
              মহাসচিব
            </p>
            <div className="flex justify-center mb-8">
              <div className="h-1 w-32 bg-red-600 rounded"></div>
            </div>

            <EditableContent
              slug="secretary"
              defaultContent={`
                <div class="float-left mr-6 mb-4 rounded-xl overflow-hidden shadow-md">
                  <img src="https://images.unsplash.com/photo-1585036156171-384164a8c675?q=80&w=300&auto=format&fit=crop" alt="Secretary" width="250" height="250" class="object-cover" />
                </div>
                <p class="mb-4">
                  বর্তমান যুগ আধুনিক তথ্য প্রযুক্তির যুগ। বিজ্ঞানের উন্নতির এই চরম উৎকর্ষতার যুগে নূরানী তালীমুল কুরআন বোর্ড পিছিয়ে থাকতে পারে না। তাই বোর্ডের যাবতীয় কার্যক্রমকে আধুনিক ও যুগোপযোগী করার লক্ষ্যে নতুন এই ওয়েবসাইট তৈরি করা হয়েছে। 
                </p>
                <p class="mb-4">
                  আমাদের লক্ষ্য হলো আধুনিক তথ্য-প্রযুক্তির সঠিক ব্যবহারের মাধ্যমে কুরআনের শিক্ষাকে আরও সহজলভ্য ও যুগোপযোগী করে তোলা। সারা বাংলাদেশে ছড়িয়ে থাকা নূরানী মাদরাসাগুলোর শিক্ষা ব্যবস্থার উন্নয়ন, সিলেবাস আধুনিকায়ন এবং মুয়াল্লিমদের দক্ষতাকে আরও বৃদ্ধি করার জন্য আমরা নিরলস কাজ করে যাচ্ছি। এই ওয়েবসাইটের মাধ্যমে আমরা নূরানী শিক্ষা ব্যবস্থার সকল তথ্য, নোটিশ, এবং ফলাফল খুব সহজেই সকলের কাছে পৌঁছে দিতে চাই।
                </p>
                <div class="mt-12 font-bold text-slate-800 clear-both">
                  <p>বিনীত -</p>
                  <p class="mt-2 text-lg">মুফতি জসিম উদ্দীন সাহেব</p>
                  <p class="text-sm text-slate-500">মহাসচিব, নূরানী তালীমুল কুরআন বোর্ড চট্টগ্রাম বাংলাদেশ</p>
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
