import Link from "next/link";
import { 
  ShoppingBag, 
  GraduationCap, 
  Award, 
  Users, 
  FileSpreadsheet, 
  CreditCard,
  ArrowUpRight
} from "lucide-react";

interface MainServiceCard {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  link: string;
  ctaText: string;
  badge?: string;
  badgeColor: string;
  iconBg: string;
  iconColor: string;
  hoverBorder: string;
}

const mainServices: MainServiceCard[] = [
  {
    id: 1,
    title: "বই ও স্টেশনারি",
    subtitle: "বোর্ডের সকল পাঠ্যবই ও স্টেশনারি অনলাইন অর্ডার ও ট্র্যাক করুন",
    icon: <ShoppingBag className="w-6 h-6" />,
    link: "/store",
    ctaText: "অর্ডার করুন",
    badge: "অনলাইন শপ",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
    hoverBorder: "hover:border-emerald-200"
  },
  {
    id: 2,
    title: "মাদরাসা নিবন্ধন",
    subtitle: "নতুন মাদরাসার অনলাইন নিবন্ধন, অন্তর্ভুক্তি ও কোড নম্বর আবেদন",
    icon: <GraduationCap className="w-6 h-6" />,
    link: "/register",
    ctaText: "আবেদন করুন",
    badge: "নিবন্ধন উন্মুক্ত",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200/60",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600",
    hoverBorder: "hover:border-blue-200"
  },
  {
    id: 3,
    title: "পরীক্ষার ফলাফল",
    subtitle: "কেন্দ্রীয় সনদ পরীক্ষা ও সাময়িক পরীক্ষার মেধা তালিকা ও রেজাল্ট",
    icon: <Award className="w-6 h-6" />,
    link: "/results?type=student",
    ctaText: "ফলাফল দেখুন",
    badge: "অনলাইন রেজাল্ট",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200/60",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600",
    hoverBorder: "hover:border-purple-200"
  },
  {
    id: 4,
    title: "মুয়াল্লিম প্রশিক্ষণ",
    subtitle: "৫০ দিন ও ৩০ দিন মেয়াদী আরবী এবং বাংলা শিক্ষক প্রশিক্ষণ কোর্স",
    icon: <Users className="w-6 h-6" />,
    link: "/training/moallem-arabic",
    ctaText: "প্রশিক্ষণ তথ্য",
    badge: "কোর্স ভর্তি",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200/60",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600",
    hoverBorder: "hover:border-amber-200"
  },
  {
    id: 5,
    title: "প্রবেশপত্র ও রুটিন",
    subtitle: "কেন্দ্রীয় পরীক্ষার রোল নম্বরযুক্ত প্রবেশপত্র ও সময়সূচি ডাউনলোড",
    icon: <FileSpreadsheet className="w-6 h-6" />,
    link: "/academic/admit-card",
    ctaText: "ডাউনলোড",
    badge: "পরীক্ষা সংক্রান্ত",
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200/60",
    iconBg: "bg-teal-500/10",
    iconColor: "text-teal-600",
    hoverBorder: "hover:border-teal-200"
  },
  {
    id: 6,
    title: "ফি ও বিল পরিশোধ",
    subtitle: "বোর্ড বাৎসরিক নবায়ন ফি, পরীক্ষার ফি ও অনলাইন পেমেন্ট গেটওয়ে",
    icon: <CreditCard className="w-6 h-6" />,
    link: "/payment/board_fee",
    ctaText: "ফি পরিশোধ",
    badge: "পেমেন্ট গেটওয়ে",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200/60",
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-600",
    hoverBorder: "hover:border-rose-200"
  }
];

export default function ShortcutCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
      {mainServices.map((card) => (
        <Link 
          key={card.id} 
          href={card.link}
          className={`bg-white p-5 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100/90 ${card.hoverBorder} hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden`}
        >
          {/* Subtle top decoration bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-100 to-transparent group-hover:via-primary/30 transition-all" />

          <div>
            {/* Header: Icon + Badge */}
            <div className="flex items-start justify-between gap-3 mb-3.5">
              <div className={`w-12 h-12 rounded-2xl ${card.iconBg} ${card.iconColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                {card.icon}
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>

            {/* Title & Subtitle */}
            <h3 className="text-base font-bold text-slate-800 group-hover:text-primary transition-colors leading-snug mb-1.5">
              {card.title}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
              {card.subtitle}
            </p>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100/80">
            <span className="text-xs font-semibold text-slate-700 group-hover:text-primary transition-colors flex items-center gap-1">
              {card.ctaText}
            </span>
            <div className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-primary group-hover:text-white text-slate-400 flex items-center justify-center transition-all duration-300 shadow-sm">
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
