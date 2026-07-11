import { MapPin, Calendar, Clock, User2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const schedules = [
  {
    id: 1,
    title: "আরবী",
    subtitle: "প্রশিক্ষণ",
    duration: "৫০ দিন ব্যাপী",
    price: "৭,৫০০.০০",
    location: "পিরোজপুর সদর",
    date: "৩১ জুলাই, ২০২৬",
    batch: "ব্যাচ নং:- ৮৫৩",
    details: "পিরোজপুর কার্যালয়: নূরানী তালীমুল কুরআন বোর্ড চট্টগ্রাম বাংলাদেশ",
    address: "গ্রাম: কলেজ রোড, দুখুরিয়া ডাকঘর: পিরোজপুর সদর, পিরোজপুর",
    phones: "যোগাযোগ: 01322891012, 01322891054",
  },
  {
    id: 2,
    title: "আরবী",
    subtitle: "প্রশিক্ষণ",
    duration: "৫০ দিন ব্যাপী",
    price: "৭,৫০০.০০",
    location: "যশোর সদর",
    date: "৩১ জুলাই, ২০২৬",
    batch: "ব্যাচ নং:- ৮৫৪",
    details: "দারুল সুন্নাহ মাদরাসা",
    address: "গ্রাম: বাহাদুরপুর ডাকঘর: নিজবোর্ড, যশোর সদর, যশোর",
    phones: "যোগাযোগ: 01772656677, 01322891023, 01334922822",
  }
];

const authors = [
  {
    id: 1,
    name: "আল্লামা খলিল আহমদ কাসেমী",
    designation: "চেয়ারম্যান",
    desc: "বিশ্ববিশ্রুত বরেণ্য নূরানী তালীমুল কুরআন বোর্ড চট্টগ্রাম বাংলাদেশ এর সার্বিক কার্যক্রম বিস্তৃতির লক্ষ্যে নতুন ওয়েবসাইট খোলা হচ্ছে জেনে প্রথমত আমি মহান আল্লাহ তায়ালার দরবারে শুকরিয়া আদায় করছি এবং বোর্ডের সকল কর্মকর্তা-কর্মচারী সহ সংশ্লিষ্ট সকলকে আন্তরিক মোবারকবাদ ও অভিনন্দন জানাচ্ছি।",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "মুফতি জসিম উদ্দীন সাহেব",
    designation: "মহাসচিব",
    desc: "বর্তমান যুগ আধুনিক তথ্য প্রযুক্তির যুগ। বিজ্ঞানের উন্নতির এই চরম উৎকর্ষতার যুগে নূরানী তালীমুল কুরআন বোর্ড পিছিয়ে থাকতে পারে না। তাই বোর্ডের যাবতীয় কার্যক্রমকে আধুনিক ও যুগোপযোগী করার লক্ষ্যে নতুন এই ওয়েবসাইট তৈরি করা হয়েছে।",
    image: "https://images.unsplash.com/photo-1585036156171-384164a8c675?q=80&w=200&auto=format&fit=crop"
  }
];

export default function TrainingSchedule() {
  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Training Title Banner */}
      <div className="bg-blue-100 rounded-xl py-3 px-6 text-center shadow-sm">
        <h3 className="text-xl font-bold text-blue-900">মুয়াল্লিম প্রশিক্ষণ সময়সূচি</h3>
      </div>

      {/* Schedules Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="bg-blue-50/50 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-blue-100 overflow-hidden relative group hover:shadow-md transition-shadow">
            
            {/* Price Badge */}
            <div className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg shadow-sm z-10">
              ৳ {schedule.price}
            </div>

            <div className="p-6 text-center border-b border-blue-100/50 relative">
              {/* Duration Background text effect */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] text-7xl font-black pointer-events-none text-blue-900">
                ৫০
              </div>
              <h4 className="text-xl font-extrabold text-blue-600 mb-1 mt-3 flex items-center justify-center gap-2">
                <span className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl">{schedule.duration.substring(0, 2)}</span>
                {schedule.duration.substring(2)}
              </h4>
              <h2 className="text-4xl font-black text-blue-700 my-2">{schedule.title}</h2>
              <p className="text-lg font-bold text-slate-700">{schedule.subtitle}</p>
              <div className="mt-4">
                <Link href="#" className="inline-block bg-blue-800 text-white text-xs font-bold px-4 py-1.5 rounded-full hover:bg-blue-900 transition-colors">
                  আবেদন করুন
                </Link>
              </div>
            </div>

            <div className="p-5 text-sm text-slate-600 space-y-3">
              <p className="flex items-start"><MapPin className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" /> <span className="font-semibold text-slate-800">{schedule.location}</span></p>
              <p className="flex items-start"><Calendar className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" /> {schedule.date}</p>
              <p className="flex items-start"><Clock className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" /> {schedule.batch}</p>
              
              <div className="pt-3 border-t border-blue-100 mt-3">
                <p className="font-semibold text-slate-800 mb-1">{schedule.details}</p>
                <p className="text-xs text-slate-500 mb-2">{schedule.address}</p>
                <p className="text-xs font-medium text-red-500">{schedule.phones}</p>
              </div>
              
              <div className="text-center pt-2">
                <Link href="#" className="inline-block bg-blue-800 text-white text-xs font-bold px-6 py-2 rounded-full hover:bg-blue-900 transition-colors w-full">
                  বিস্তারিত
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Authors Profiles */}
      <div className="grid md:grid-cols-2 gap-6 mt-auto pt-6">
        {authors.map((author) => (
          <div key={author.id} className="bg-white p-5 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col hover:border-blue-200 transition-colors">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-1">
                <h4 className="font-bold text-blue-900 text-lg leading-tight mb-1">{author.name}</h4>
                <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">{author.designation}</span>
              </div>
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-blue-100 flex-shrink-0 relative">
                {/* Using a solid color as fallback if no image to avoid errors, though we have a real placeholder */}
                <div className="absolute inset-0 bg-slate-200" />
                <Image src={author.image} alt={author.name} fill className="object-cover relative z-10" sizes="56px" />
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-4 line-clamp-5 text-justify flex-1">
              {author.desc}
            </p>
            <Link href="#" className="inline-block bg-blue-800 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-blue-900 transition-colors w-max mt-auto">
              বিস্তারিত
            </Link>
          </div>
        ))}
      </div>

    </div>
  );
}
