import NoticeBoard from "@/components/home/NoticeBoard";
import Image from "next/image";
import Link from "next/link";

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

            <div className="text-slate-700 leading-relaxed text-justify font-medium">
              <div className="float-left mr-6 mb-4 rounded-xl overflow-hidden shadow-md">
                <Image 
                  src="https://images.unsplash.com/photo-1585036156171-384164a8c675?q=80&w=300&auto=format&fit=crop" 
                  alt="Secretary" 
                  width={250} 
                  height={250} 
                  className="object-cover" 
                />
              </div>
              
              <p className="mb-4">
                বর্তমান যুগ আধুনিক তথ্য প্রযুক্তির যুগ। বিজ্ঞানের উন্নতির এই চরম উৎকর্ষতার যুগে নূরানী তালীমুল কুরআন বোর্ড পিছিয়ে থাকতে পারে না। তাই বোর্ডের যাবতীয় কার্যক্রমকে আধুনিক ও যুগোপযোগী করার লক্ষ্যে নতুন এই ওয়েবসাইট তৈরি করা হয়েছে। 
              </p>
              <p className="mb-4">
                আমাদের লক্ষ্য হলো আধুনিক তথ্য-প্রযুক্তির সঠিক ব্যবহারের মাধ্যমে কুরআনের শিক্ষাকে আরও সহজলভ্য ও যুগোপযোগী করে তোলা। সারা বাংলাদেশে ছড়িয়ে থাকা নূরানী মাদরাসাগুলোর শিক্ষা ব্যবস্থার উন্নয়ন, সিলেবাস আধুনিকায়ন এবং মুয়াল্লিমদের দক্ষতাকে আরও বৃদ্ধি করার জন্য আমরা নিরলস কাজ করে যাচ্ছি। এই ওয়েবসাইটের মাধ্যমে আমরা নূরানী শিক্ষা ব্যবস্থার সকল তথ্য, নোটিশ, এবং ফলাফল খুব সহজেই সকলের কাছে পৌঁছে দিতে চাই।
              </p>
              
              <div className="mt-12 font-bold text-slate-800 clear-both">
                <p>বিনীত -</p>
                <p className="mt-2 text-lg">মুফতি জসিম উদ্দীন সাহেব</p>
                <p className="text-sm text-slate-500">মহাসচিব, নূরানী তালীমুল কুরআন বোর্ড চট্টগ্রাম বাংলাদেশ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="h-[400px]">
            <NoticeBoard />
          </div>
          
          {/* Chairman Profile Card */}
          <div className="bg-white p-6 rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-200 flex flex-col hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h4 className="font-bold text-blue-900 text-lg leading-tight mb-1">আল্লামা খলিল আহমদ কাসেমী</h4>
                <span className="text-xs font-bold text-red-500">চেয়ারম্যান</span>
              </div>
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 flex-shrink-0 relative">
                <div className="absolute inset-0 bg-slate-200" />
                <Image 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=200&auto=format&fit=crop" 
                  alt="Chairman" 
                  fill 
                  className="object-cover relative z-10" 
                  sizes="64px" 
                />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed text-justify line-clamp-6">
              বিসমিল্লাহির রহমানির রহিম নূরানী তালীমুল কুরআন বোর্ড চট্টগ্রাম বাংলাদেশ এর সার্বিক কার্যক্রম বিস্তৃতির লক্ষ্যে নতুন ওয়েবসাইট খোলা হচ্ছে জেনে প্রথমে আমি মহান আল্লাহ তায়া'লার দরবারে শুকরিয়া আদায় করছি এবং বোর্ডের সকল কর্মকর্তা- কর্মচারী সহ সংশ্লিষ্ট সকলকে আন্তরিক মোবারকবাদ ও অভিনন্দন জানাচ্ছি। বর্তমান যুগ আধুনিক তথ্য প্রযুক্তির যুগ। বিজ্ঞানের উন্নতির এ...
            </p>
            
            <Link href="/about/chairman" className="inline-block bg-blue-800 text-white text-xs font-bold px-6 py-2 rounded-full hover:bg-blue-900 transition-colors w-max mt-auto">
              বিস্তারিত
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
