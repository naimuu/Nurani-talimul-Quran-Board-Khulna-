import Link from "next/link";
import { Building2, Layers, Award, BookOpen, Users, ShieldCheck, MapPin, ArrowRight } from "lucide-react";

export const metadata = {
  title: "আমাদের সম্পর্কে | খুলনা নূরানী বোর্ড",
  description: "নূরানী তালীমুল কুরআন বোর্ড খুলনা বাংলাদেশ পরিচিতি ও কার্যক্রম",
};

export default function AboutPage() {
  const sections = [
    {
      title: "বোর্ড পরিচিতি",
      description: "খুলনা নূরানী বোর্ডের ইতিহাস, লক্ষ্য, উদ্দেশ্য এবং প্রশাসনিক কাঠামো সম্পর্কিত বিস্তারিত তথ্য।",
      href: "/about/board_introduction",
      icon: Building2,
      badge: "মূল পরিচিতি",
      badgeColor: "bg-emerald-100 text-emerald-800",
    },
    {
      title: "আমাদের কার্যক্রম",
      description: "কুরআনি শিক্ষা বিস্তার, শিক্ষক প্রশিক্ষণ, কেন্দ্রীয় পরীক্ষা নিয়ন্ত্রণ ও মাদরাসা পরিচালনা বিষয়ক কার্যক্রম।",
      href: "/about/our_activities",
      icon: Layers,
      badge: "কার্যক্রম",
      badgeColor: "bg-blue-100 text-blue-800",
    },
    {
      title: "চেয়ারম্যানের বাণী",
      description: "বোর্ড চেয়ারম্যান মহোদয়ের দিকনির্দেশনামূলক মূল্যবান বক্তব্য ও ভবিষ্যৎ কর্মপরিকল্পনা।",
      href: "/about/chairman",
      icon: Award,
      badge: "বাণী",
      badgeColor: "bg-amber-100 text-amber-800",
    },
    {
      title: "মহাসচিবের বাণী",
      description: "বোর্ডের সার্বিক অগ্রগতি, সাংগঠনিক দিক ও মাদরাসা সংশ্লিষ্টদের প্রতি মহাসচিব মহোদয়ের বার্তা।",
      href: "/about/secretary",
      icon: BookOpen,
      badge: "বাণী",
      badgeColor: "bg-purple-100 text-purple-800",
    },
    {
      title: "বোর্ডের কার্যনির্বাহী পরিষদ (মজলিসে আমেলা)",
      description: "বোর্ডের নীতি নির্ধারণ ও পরিচালনায় নিয়োজিত শীর্ষ আলেম ও পরিচালনা পর্ষদ।",
      href: "/member/amela",
      icon: ShieldCheck,
      badge: "পরিচালনা পর্ষদ",
      badgeColor: "bg-indigo-100 text-indigo-800",
    },
    {
      title: "অফিস কর্মকর্তা ও কর্মচারী",
      description: "বোর্ডের কেন্দ্রীয় প্রশাসনিক কার্যালয়ের দায়িত্বশীল কর্মকর্তা ও কর্মচারীবৃন্দ।",
      href: "/member/office-staff",
      icon: Users,
      badge: "কর্মকর্তা তালিকা",
      badgeColor: "bg-teal-100 text-teal-800",
    },
    {
      title: "প্রশিক্ষক ও পরিদর্শক প্যানেল",
      description: "দক্ষ মুয়াল্লিম গড়ার কারিগর কেন্দ্রীয় প্রশিক্ষক এবং মাদরাসা পরিদর্শন প্যানেল।",
      href: "/member/trainer-inspector",
      icon: Users,
      badge: "প্যানেল",
      badgeColor: "bg-rose-100 text-rose-800",
    },
    {
      title: "প্রশিক্ষণ কেন্দ্র সমূহ",
      description: "দেশব্যাপী বোর্ডের শাখা ও প্রশিক্ষণ কেন্দ্রের তালিকা এবং যোগাযোগের ঠিকানা।",
      href: "/training/batchwise-center-list",
      icon: MapPin,
      badge: "কেন্দ্র তালিকা",
      badgeColor: "bg-sky-100 text-sky-800",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-320px)] bg-slate-50 py-6 md:py-8">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 space-y-6">
        
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-5 sm:p-7 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-block px-2.5 py-0.5 bg-emerald-700/80 border border-emerald-500/50 rounded-full text-[11px] font-semibold tracking-wider uppercase mb-2 text-emerald-200">
              পরিচিতি ও কার্যক্রম
            </span>
            <h1 className="text-xl sm:text-2xl font-bold mb-1.5">
              খুলনা নূরানী তালীমুল কুরআন বোর্ড
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
              বিশুদ্ধ কুরআনি শিক্ষা বিস্তার, আদর্শ শিক্ষক তৈরি ও দক্ষ মাদরাসা প্রশাসন গঠনে নিবেদিত শীর্ষ নূরানী শিক্ষা বোর্ড।
            </p>
          </div>
        </div>

        {/* Section Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-sm hover:border-emerald-500 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center text-[11px] font-bold text-emerald-700 group-hover:text-emerald-800">
                  <span>বিস্তারিত দেখুন</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
