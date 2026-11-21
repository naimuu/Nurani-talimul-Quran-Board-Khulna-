"use client";
import React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  FileCheck,
  Building2,
  GraduationCap,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface ServiceCardItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  badge: string;
  icon: React.ElementType;
  gradient: string;
  badgeStyle: string;
  iconBg: string;
  borderColor: string;
}

const serviceCards: ServiceCardItem[] = [
  {
    id: "books",
    title: "বই ও স্টেশনারি অর্ডার",
    subtitle: "পাঠ্যবই, খাতা ও শিক্ষা উপকরণ",
    href: "/store",
    badge: "অনলাইন শপ",
    icon: ShoppingBag,
    gradient: "from-[#053224] via-[#095738] to-[#0c6b46]",
    badgeStyle: "bg-amber-400 text-slate-950",
    iconBg: "bg-amber-400 text-slate-950",
    borderColor: "border-emerald-500/30 hover:border-amber-400/60"
  },
  {
    id: "questions",
    title: "প্রশ্নপত্র অর্ডার",
    subtitle: "সাময়িক ও বার্ষিক পরীক্ষার প্রশ্ন",
    href: "/academic/question-order",
    badge: "পরীক্ষা ২০২৬",
    icon: FileCheck,
    gradient: "from-[#082f49] via-[#0c4a6e] to-[#075985]",
    badgeStyle: "bg-sky-400 text-slate-950",
    iconBg: "bg-sky-400 text-slate-950",
    borderColor: "border-sky-400/30 hover:border-sky-300/60"
  },
  {
    id: "madrasa",
    title: "মাদরাসা রেজিস্ট্রেশন",
    subtitle: "নতুন ইলহাক আবেদন ও অন্তর্ভুক্তি",
    href: "/register",
    badge: "ইলহাক ফরম",
    icon: Building2,
    gradient: "from-[#3d2204] via-[#5c3408] to-[#78350f]",
    badgeStyle: "bg-amber-300 text-slate-950",
    iconBg: "bg-amber-300 text-slate-950",
    borderColor: "border-amber-400/30 hover:border-amber-300/60"
  },
  {
    id: "moallem",
    title: "মুয়াল্লিম রেজিস্ট্রেশন",
    subtitle: "বাংলা ও আরবী শিক্ষক প্রশিক্ষণ",
    href: "/training/moallem-arabic",
    badge: "কোর্স ভর্তি",
    icon: GraduationCap,
    gradient: "from-[#2e1065] via-[#3b0764] to-[#4c1d95]",
    badgeStyle: "bg-purple-300 text-slate-950",
    iconBg: "bg-purple-300 text-slate-950",
    borderColor: "border-purple-400/30 hover:border-purple-300/60"
  }
];

export default function HomeServiceShortcutCards() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3 w-full">
      {serviceCards.map((card) => {
        const IconComponent = card.icon;
        return (
          <Link
            key={card.id}
            href={card.href}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-3 sm:p-3.5 text-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] border ${card.borderColor} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] flex flex-col justify-between`}
          >
            {/* Top decorative glow */}
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform pointer-events-none" />

            <div>
              {/* Header: Badge & Icon */}
              <div className="flex items-center justify-between gap-1.5 mb-2">
                <span className={`text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-2xs ${card.badgeStyle}`}>
                  {card.badge}
                </span>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${card.iconBg} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-4 h-4" />
                </div>
              </div>

              {/* Title & Subtitle */}
              <h4 className="font-black text-xs sm:text-sm leading-snug text-white group-hover:text-amber-200 transition-colors line-clamp-1">
                {card.title}
              </h4>
              <p className="text-[10.5px] sm:text-[11px] text-white/75 mt-0.5 line-clamp-1">
                {card.subtitle}
              </p>
            </div>

            {/* Bottom link indicator */}
            <div className="mt-2.5 pt-2 border-t border-white/15 flex items-center justify-between text-[11px] font-bold text-white/90 group-hover:text-white">
              <span>আবেদন / অর্ডার</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-300 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
