import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Calendar,
  BookMarked,
  FileText,
  FileSpreadsheet,
  Award,
  Users,
  CreditCard,
  Bell,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  HelpCircle,
  PhoneCall,
  Search,
} from "lucide-react";
import NoticeBoard from "@/components/home/NoticeBoard";

export const metadata = {
  title: "পরীক্ষা ও একাডেমিক কার্যক্রম — নূরানী তা'লীমুল কুরআন বোর্ড খুলনা",
  description: "নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ-এর পরীক্ষা নিয়ন্ত্রণ বিভাগ, পরীক্ষার রুটিন, প্রশ্ন অর্ডার, প্রবেশপত্র ও ফলাফল পোর্টাল।",
};

export default function AcademicHubPage() {
  const examServices = [
    {
      title: "পরীক্ষার রুটিন",
      desc: "কেন্দ্রীয় ও সমাপনী পরীক্ষার বিষয়ভিত্তিক সময়সূচি এবং তারিখ",
      href: "/academic/routine",
      icon: Calendar,
      color: "from-emerald-600 to-teal-700",
      badge: "সময়সূচি",
      popular: true,
    },
    {
      title: "প্রশ্নের অর্ডার",
      desc: "মাদরাসার জন্য বোর্ড অনুমোদিত মানসম্মত পরীক্ষার প্রশ্নপত্র অর্ডার",
      href: "/academic/question-order",
      icon: BookMarked,
      color: "from-blue-600 to-indigo-700",
      badge: "অনলাইন সেবা",
      popular: true,
    },
    {
      title: "প্রবেশপত্র প্রিন্ট (Admit Card)",
      desc: "নিবন্ধনকৃত পরীক্ষার্থীদের ডিজিটাল রোল নম্বরসহ প্রবেশপত্র ডাউনলোড",
      href: "/academic/admit-card",
      icon: FileText,
      color: "from-amber-600 to-orange-700",
      badge: "ডাউনলোড",
      popular: true,
    },
    {
      title: "ব্যক্তিগত রেজাল্ট দেখুন",
      desc: "রোল নম্বর এবং পরীক্ষার বছর দিয়ে তাৎক্ষণিক ফলাফল যাচাই করুন",
      href: "/results?type=student",
      icon: Award,
      color: "from-purple-600 to-indigo-800",
      badge: "ফলাফল",
      popular: true,
    },
    {
      title: "মাদরাসার মার্কশিট ও রেজাল্ট",
      desc: "মাদরাসা কোড দিয়ে সকল শিক্ষার্থীর মেধা তালিকা ও পূর্ণাঙ্গ মার্কশিট",
      href: "/academic/mark-sheet",
      icon: FileSpreadsheet,
      color: "from-teal-600 to-emerald-800",
      badge: "মার্কশিট",
    },
    {
      title: "পরীক্ষার যাবতীয় নোটিশ",
      desc: "পরীক্ষা নিয়ন্ত্রণ বিভাগ কর্তৃক জারিকৃত সকল অফিসিয়াল সার্কুলার",
      href: "/notices?type=exam_notice",
      icon: Bell,
      color: "from-rose-600 to-red-700",
      badge: "বিজ্ঞপ্তি",
    },
    {
      title: "নিবন্ধনের নিয়মাবলী",
      desc: "কেন্দ্রীয় পরীক্ষায় শিক্ষার্থীদের রেজিস্ট্রেশন ও ইলহাক সংক্রান্ত শর্ত",
      href: "/academic/registration-rules",
      icon: ShieldCheck,
      color: "from-slate-700 to-slate-900",
      badge: "নিয়মাবলী",
    },
    {
      title: "পরীক্ষার ফি পেমেন্ট",
      desc: "বিকাশ, নগদ বা ব্যাংক চালানের মাধ্যমে পরীক্ষার ফি জমা দেওয়ার পদ্ধতি",
      href: "/payment/exam_fee",
      icon: CreditCard,
      color: "from-cyan-600 to-blue-700",
      badge: "পেমেন্ট গেটওয়ে",
    },
    {
      title: "নিবন্ধিত পরীক্ষার্থীদের তালিকা",
      desc: "মাদরাসা ভিত্তিক নিবন্ধিত পরীক্ষার্থীদের তথ্য ও সংশোধন পোর্টাল",
      href: "/academic/registered-students",
      icon: Users,
      color: "from-green-700 to-emerald-900",
      badge: "তালিকা",
    },
    {
      title: "জিম্মাদার রেফারেল পোর্টাল",
      desc: "অঞ্চল ও থানা ভিত্তিক জিম্মাদারদের জন্য বিশেষ ড্যাশবোর্ড ও কমিশন",
      href: "/referral",
      icon: Search,
      color: "from-amber-700 to-yellow-800",
      badge: "জিম্মাদার শাখা",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-[#095738] font-bold text-xs sm:text-sm mb-3 shadow-2xs border border-emerald-200">
            <GraduationCap className="w-4 h-4" />
            <span>পরীক্ষা নিয়ন্ত্রণ ও একাডেমিক বিভাগ</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
            পরীক্ষা ও একাডেমিক পোর্টাল
          </h1>

          <div className="flex justify-center mb-4">
            <div className="h-1.5 w-24 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full"></div>
          </div>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ-এর কেন্দ্রীয় পরীক্ষা সংক্রান্ত যাবতীয় সেবা—রুটিন, প্রশ্ন অর্ডার, প্রবেশপত্র, রেজিস্ট্রেশন এবং ফলাফল এক ঠিকানায়।
          </p>
        </div>

        {/* Main Grid: Left Services, Right Noticeboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: 10 Major Service Cards */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {examServices.map((service, idx) => {
                const Icon = service.icon;
                return (
                  <Link
                    key={idx}
                    href={service.href}
                    className="group relative bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between overflow-hidden active:scale-[0.99]"
                  >
                    {/* Top gradient accent line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3.5">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${service.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform flex-shrink-0`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 group-hover:bg-emerald-50 group-hover:text-[#095738] group-hover:border-emerald-200 transition-colors">
                          {service.badge}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-slate-800 text-base sm:text-lg group-hover:text-[#095738] transition-colors mb-1.5 flex items-center gap-1.5">
                        <span>{service.title}</span>
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-500 leading-normal mb-4">
                        {service.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-800 group-hover:text-emerald-900 mt-auto">
                      <span>প্রবেশ করুন</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Helpline Notice Banner */}
            <div className="bg-gradient-to-r from-emerald-800 via-[#095738] to-teal-900 text-white rounded-2xl p-5 sm:p-6 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 text-center sm:text-left">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                  <PhoneCall className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base sm:text-lg text-white">
                    পরীক্ষা সংক্রান্ত জরুরি সহায়তা
                  </h4>
                  <p className="text-emerald-100 text-xs sm:text-sm">
                    প্রশ্নপত্র, রুটিন বা রেজিস্ট্রেশন বিষয়ে সরাসরি পরীক্ষা শাখায় যোগাযোগ করুন
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-mono font-black text-sm sm:text-base bg-white/15 px-4 py-2 rounded-xl border border-white/20 whitespace-nowrap">
                <span>০১৮২০-৫৮০৫৬০</span>
              </div>
            </div>

          </div>

          {/* Right: Noticeboard Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-20 space-y-6">
              
              {/* Exam Noticeboard Component */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                <NoticeBoard />
              </div>

              {/* Quick Instructions Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-3.5">
                <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm sm:text-base border-b border-slate-100 pb-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>জরুরি নির্দেশিকা</span>
                </div>
                
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span>পরীক্ষার অন্তত ১৫ দিন পূর্বে নির্ভুল তথ্যে প্রশ্ন অর্ডার সম্পন্ন করুন।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span>প্রবেশপত্রে শিক্ষার্থীর ছবি ও মাদরাসার সিল নিশ্চিত করুন।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span>কোনো মাদরাসা ফি বকেয়া থাকলে দ্রুত পরীক্ষা শাখায় যোগাযোগ করুন।</span>
                  </li>
                </ul>

                <Link
                  href="/forms/ilhaq-rules"
                  className="w-full mt-2 py-2 px-3 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded-xl font-bold text-xs text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>বোর্ডের পূর্ণাঙ্গ নীতিমালা</span>
                </Link>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
