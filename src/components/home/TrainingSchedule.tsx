import { MapPin, Calendar, Clock, Phone, GraduationCap, ArrowRight, Sparkles, BookOpen, CheckCircle2, Award } from "lucide-react";
import Link from "next/link";

interface TrainingCardData {
  id: number;
  medium: "bangla" | "arabic";
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  durationDays: string;
  durationText: string;
  price: string;
  priceTagBg: string;
  location: string;
  date: string;
  batch: string;
  phone: string;
  link: string;
  // Whole Card Glorious Palette
  cardBg: string;
  cardBorder: string;
  cardBorderHover: string;
  cardGlow: string;
  titleColor: string;
  durationBadgeBg: string;
  iconBg: string;
  iconColor: string;
  btnPrimary: string;
  btnSecondary: string;
}

const trainingData: TrainingCardData[] = [
  {
    id: 1,
    medium: "bangla",
    title: "মুয়াল্লিম প্রশিক্ষণ (বাংলা)",
    subtitle: "৩০ দিন ব্যাপী বিশেষ শিক্ষক প্রশিক্ষণ কোর্স",
    badge: "বাংলা মাধ্যম",
    badgeColor: "bg-emerald-100/80 text-emerald-900 border-emerald-300/60",
    durationDays: "৩০",
    durationText: "দিন মেয়াদী প্রশিক্ষণ",
    price: "৳ ৫,৫০০",
    priceTagBg: "bg-emerald-900 text-amber-300 border border-emerald-800",
    location: "খুলনা বিভাগীয় কার্যালয় ও জেলা কেন্দ্র",
    date: "চলমান / নতুন সেশন",
    batch: "ব্যাচ নং: ১২৪ (বাংলা)",
    phone: "01966-935832, 01988-977209",
    link: "/training/moallem-bangla",
    // Whole Card Glorious Emerald Theme
    cardBg: "bg-gradient-to-b from-emerald-50/70 via-white to-teal-50/40",
    cardBorder: "border-emerald-200/90",
    cardBorderHover: "hover:border-emerald-400 hover:shadow-[0_12px_30px_rgb(16,185,129,0.12)]",
    cardGlow: "from-emerald-500/10 to-teal-500/0",
    titleColor: "text-emerald-950 group-hover:text-emerald-800",
    durationBadgeBg: "bg-gradient-to-br from-[#052e23] via-emerald-800 to-emerald-700 text-white shadow-md shadow-emerald-950/20",
    iconBg: "bg-emerald-100/70 text-emerald-800",
    iconColor: "text-emerald-700",
    btnPrimary: "bg-gradient-to-r from-[#052e23] to-[#047857] hover:from-emerald-900 hover:to-emerald-700 text-white shadow-sm hover:shadow-emerald-900/20",
    btnSecondary: "bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300/80 shadow-2xs",
  },
  {
    id: 2,
    medium: "arabic",
    title: "মুয়াল্লিম প্রশিক্ষণ (আরবী)",
    subtitle: "৫০ দিন ব্যাপী উচ্চতর আরবী শিক্ষক প্রশিক্ষণ",
    badge: "আরবি মাধ্যম",
    badgeColor: "bg-amber-100/80 text-amber-950 border-amber-300/60",
    durationDays: "৫০",
    durationText: "দিন মেয়াদী প্রশিক্ষণ",
    price: "৳ ৭,৫০০",
    priceTagBg: "bg-slate-900 text-amber-300 border border-slate-800",
    location: "খুলনা কেন্দ্রীয় কেন্দ্র ও সারাদেশের শাখাসমূহ",
    date: "চলমান / কেন্দ্রীয় ব্যাচ",
    batch: "ব্যাচ নং: ৮৫৪ (আরবী)",
    phone: "01966-935832, 01939-895290",
    link: "/training/moallem-arabic",
    // Whole Card Glorious Golden-Amber / Indigo Theme
    cardBg: "bg-gradient-to-b from-amber-50/60 via-white to-orange-50/30",
    cardBorder: "border-amber-200/90",
    cardBorderHover: "hover:border-amber-400 hover:shadow-[0_12px_30px_rgb(245,158,11,0.14)]",
    cardGlow: "from-amber-500/10 to-orange-500/0",
    titleColor: "text-slate-900 group-hover:text-amber-900",
    durationBadgeBg: "bg-gradient-to-br from-[#1e1b4b] via-[#1e3a8a] to-[#052e23] text-white shadow-md shadow-slate-950/20",
    iconBg: "bg-amber-100/70 text-amber-900",
    iconColor: "text-amber-700",
    btnPrimary: "bg-gradient-to-r from-[#1e1b4b] to-[#1e3a8a] hover:from-slate-950 hover:to-indigo-950 text-white shadow-sm hover:shadow-indigo-950/20",
    btnSecondary: "bg-white hover:bg-amber-50 text-amber-950 border border-amber-300/80 shadow-2xs",
  }
];

export default function TrainingSchedule() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-slate-100/90 overflow-hidden flex flex-col min-h-[520px] sm:min-h-[550px] w-full @container justify-between">
      
      {/* Top Banner */}
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-[#052e23] via-emerald-800 to-[#0a4233] text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base leading-tight truncate">মুয়াল্লিম প্রশিক্ষণ সময়সূচি</h3>
            <p className="text-xs text-emerald-200 font-medium truncate">বাংলা ও আরবি শিক্ষক প্রশিক্ষণ কোর্সসমূহ</p>
          </div>
        </div>

        <Link 
          href="/training/rules" 
          className="text-xs font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 hover:underline shrink-0 bg-white/10 px-3 py-1.5 rounded-xl transition-colors"
        >
          <span>নিয়মাবলী</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Whole Unified Glorious Cards Grid */}
      <div className="p-3.5 sm:p-5 grid grid-cols-1 @[540px]:grid-cols-2 gap-4 sm:gap-5 flex-1 items-stretch">
        {trainingData.map((item) => (
          <div 
            key={item.id} 
            className={`rounded-3xl border ${item.cardBorder} ${item.cardBg} p-5 sm:p-6 flex flex-col justify-between ${item.cardBorderHover} transition-all duration-300 min-w-[260px] relative group shadow-sm overflow-hidden`}
          >
            {/* Ambient Background Glow */}
            <div className={`absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl ${item.cardGlow} rounded-full blur-3xl pointer-events-none`}></div>

            <div className="relative z-10 space-y-4">
              
              {/* Top Row: Category Badge & Course Fee */}
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${item.badgeColor}`}>
                  {item.badge}
                </span>
                <span className={`text-xs font-black px-3 py-1 rounded-xl ${item.priceTagBg}`}>
                  ফি: {item.price}
                </span>
              </div>

              {/* Course Title & Duration Showcase */}
              <div className="flex items-center gap-3.5 pt-1">
                <div className={`w-14 h-14 rounded-2xl ${item.durationBadgeBg} flex flex-col items-center justify-center font-bold shrink-0 border border-white/20 p-1`}>
                  <span className="text-xl font-black leading-none">{item.durationDays}</span>
                  <span className="text-[9px] uppercase font-bold text-emerald-200 mt-0.5">দিন</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className={`font-black text-base sm:text-lg leading-tight transition-colors ${item.titleColor}`}>
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-1 truncate">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              {/* Information Rows in Glorious Glass Card */}
              <div className="space-y-2.5 text-xs sm:text-[13px] text-slate-700 bg-white/95 backdrop-blur-xs p-3.5 sm:p-4 rounded-2xl border border-slate-200/70 shadow-xs">
                <div className="flex items-start gap-2.5">
                  <div className={`w-6 h-6 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-slate-800 leading-snug">{item.location}</span>
                </div>

                <div className="flex items-center justify-between gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 truncate">
                    <Calendar className={`w-3.5 h-3.5 ${item.iconColor} shrink-0`} />
                    <span className="truncate">{item.date}</span>
                  </div>
                  <span className="font-bold text-slate-800 shrink-0 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/60">
                    {item.batch}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-red-600 font-bold pt-2 border-t border-slate-100">
                  <Phone className="w-3.5 h-3.5 shrink-0 text-red-500" />
                  <span className="truncate">{item.phone}</span>
                </div>
              </div>

            </div>

            {/* Bottom Action Buttons */}
            <div className="pt-5 mt-2 flex items-center gap-2.5 relative z-10">
              <Link
                href="/register"
                className={`flex-1 py-2.5 px-4 rounded-xl ${item.btnPrimary} text-xs sm:text-sm font-bold text-center transition-all duration-200 active:scale-95`}
              >
                আবেদন করুন
              </Link>
              <Link
                href={item.link}
                className={`py-2.5 px-4 rounded-xl ${item.btnSecondary} text-xs sm:text-sm font-bold transition-all duration-200 text-center active:scale-95`}
              >
                বিস্তারিত
              </Link>
            </div>

          </div>
        ))}
      </div>

      {/* Footer Callout */}
      <div className="p-3 sm:p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
        <span className="text-xs">সারাদেশের স্থায়ী ও বাৎসরিক প্রশিক্ষণ কেন্দ্রসমূহ</span>
        <Link 
          href="/training/permanent-center-list" 
          className="text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center gap-1 hover:underline text-xs"
        >
          <span>কেন্দ্র তালিকা দেখুন</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
