import NoticeBoard from "@/components/home/NoticeBoard";
import Image from "next/image";
import Link from "next/link";

export default function OurActivitiesPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12 h-full">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-slate-800 mb-2">
              আমাদের কার্যক্রম
            </h1>
            <div className="flex justify-center mb-8">
              <div className="h-1 w-24 bg-red-600 rounded"></div>
            </div>

            <div className="space-y-6 text-slate-700 leading-relaxed text-justify font-medium">
              <p className="font-bold text-slate-800">কার্যক্রম:</p>
              
              <div className="space-y-2">
                <p><strong>* কার্যক্ষেত্র:</strong> কার্যক্রম সমগ্র বাংলাদেশ।</p>
                <p><strong>* প্রতিষ্ঠা সন:</strong> জানুয়ারী ১৯৯৫ সন হতে শুরু।</p>
              </div>

              <div className="space-y-3">
                <p className="font-bold text-slate-800">* লক্ষ্য ও উদ্দেশ্য:</p>
                <ul className="space-y-2 pl-4">
                  <li>০১। প্রত্যেক মুসলমান এবং তাদের সন্তানদেরকে বিশুদ্ধ কুরআন, ইসলামী দ্বীনি তায়মীম, তামাদ্দুন সম্পর্কে শিক্ষা দেওয়া।</li>
                  <li>০২। সঠিক আকীদা এবং দ্বীনি শিক্ষার প্রচার ও প্রসার করা।</li>
                  <li>০৩। কুরআন-হাদীস, মাসায়েল এবং যুগোপযোগী বাংলা, গণিত, ইংরেজী শিক্ষার ব্যবস্থা করা।</li>
                </ul>
              </div>

              <div className="space-y-3 pt-4">
                <p className="font-bold text-slate-800">* কর্মসূচী:</p>
                <ul className="space-y-2 pl-4">
                  <li>০১। সমগ্র বাংলাদেশের প্রতি তিন মাইল অন্তর বা জরুরী স্থানে "নূরানী তালীমুল কুরআন মাদরাসা" প্রতিষ্ঠা করা।</li>
                  <li>০২। প্রত্যেকটি নূরানী মাদরাসায় পাঠ্যসূচী মোতাবেক শিক্ষার ব্যবস্থা করা।</li>
                  <li>০৩। পাঠদানের জন্য পাঠ্য বিষয় নির্ধারন এবং মূল্যায়নের ব্যবস্থা করা।</li>
                  <li>০৪। প্রতিটি নূরানী মাদরাসার শিক্ষা ব্যবস্থা পরিদর্শন পূর্বক রিপোর্ট প্রদান এবং সমস্যা নিরসনে জরুরী পদক্ষেপ গ্রহণ করা।</li>
                  <li>০৫। প্রতিটি নূরানী মাদরাসায় শিক্ষক নিয়োগ বিশেষ প্রয়োজনে শিক্ষক পরিবর্তন বা অপসারনের ব্যবস্থা করা।</li>
                  <li>০৬। প্রতিটি নূরানী মাদরাসায় পাঠ্যপুস্তক সরবরাহের ব্যবস্থা করা।</li>
                  <li>০৭। কেন্দ্রীয়ভাবে পরীক্ষা গ্রহনের ব্যবস্থা করা।</li>
                  <li>০৮। যোগ্য মুয়াল্লিম তৈরির উদ্দেশ্যে প্রশিক্ষণ বা জোড়ের ব্যবস্থা করা।</li>
                  <li>০৯। বিভিন্ন সময়ে আরবী, বাংলা ও ইংরেজি বিষয়ে বিশেষ বিশেষ প্রশিক্ষণের ব্যবস্থা করা।</li>
                  <li>১০। জেলা বা অঞ্চল ভিত্তিক মুয়াল্লিম জোড়ের ব্যবস্থা করা।</li>
                  <li>১১। বিভিন্ন সময়ে নূরানী মাদরাসার পরিচালকদের জোড়ের ব্যবস্থা করা।</li>
                  <li>১২। পরীক্ষায় কৃতিত্ব অর্জনকারী ছাত্র-ছাত্রীদের উৎসাহ-উদ্দীপনার উদ্দেশ্যে বিশেষ পুরস্কারের ব্যবস্থা করা।</li>
                  <li>১৩। প্রশিক্ষণে এবং বিভিন্ন মাদরাসায় পাঠদানের কৃতিত্ব অর্জনকারী মুয়াল্লিমদেরকে উৎসাহ-উদ্দীপনার উদ্দেশ্যে বিশেষ পুরস্কারের ব্যবস্থা করা।</li>
                </ul>
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-100">
                <p className="font-bold text-slate-800">প্রতিষ্ঠানের লক্ষ্য:</p>
                <ul className="space-y-4 pl-4">
                  <li>(ক) সমগ্র বাংলাদেশ ব্যাপী প্রতি দুই মাইল অন্তর অন্তর বা প্রয়োজনীয় স্থানে নূরানী তালীমুল কুরআন মাদরাসা প্রতিষ্ঠা করা, যাতে করে প্রত্যেক অঞ্চলের প্রত্যেক মুসলমান তাঁর সন্তানকে দ্বীন ও কুরআনের শিক্ষা দিতে পারে।</li>
                  <li>(খ) প্রতিষ্ঠিত মাদরাসাগুলোর শিক্ষার উন্নতি ও মাদরাসার কার্যক্রম সুষ্ঠুভাবে পরিচালনার জন্য বোর্ডের নিয়ম অনুযায়ী পরিদর্শন/পড়াশোনা দেখাশুনা করা ও সু-পরামর্শ করা।</li>
                  <li>(গ) বিভিন্ন মাদরাসায় শিক্ষক নিয়োগ, অপসারণসহ যে কোন সমস্যা ও দুর্যোগে মাদরাসা কর্তৃপক্ষকে পরামর্শসহ বিভিন্ন বিষয়ে সহযোগিতা করা।</li>
                  <li>(ঘ) সঠিক আকিদা ভিত্তিক দ্বীনি ও সাধারণ শিক্ষার প্রচার ও প্রসার ঘটানো</li>
                </ul>
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
            <div className="flex items-start gap-4 mb-4">
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
            <p className="text-sm text-slate-600 mb-6 leading-relaxed text-justify">
              বিসমিল্লাহির রহমানির রহিম নূরানী তালীমুল কুরআন বোর্ড চট্টগ্রাম বাংলাদেশ এর সার্বিক কার্যক্রম বিস্তৃতির লক্ষ্যে নতুন ওয়েবসাইট খোলা হচ্ছে জেনে প্রথমত আমি মহান আল্লাহ তায়ালার দরবারে শুকরিয়া আদায় করছি এবং বোর্ডের সকল কর্মকর্তা-কর্মচারী সহ সংশ্লিষ্ট সকলকে আন্তরিক মোবারকবাদ ও অভিনন্দন জানাচ্ছি। বর্তমান যুগ আধুনিক তথ্য প্রযুক্তির যুগ। বিজ্ঞানের উন্নতির এ...
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
