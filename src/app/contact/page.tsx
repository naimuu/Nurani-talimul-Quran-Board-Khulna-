import React from "react";
import { Phone, MapPin, Clock, Mail, BookOpen, GraduationCap, Award, Calculator, Calendar, MessageSquare, Building2, ChevronRight } from "lucide-react";
import Link from "next/link";
import NoticeBoard from "@/components/home/NoticeBoard";

export const metadata = {
  title: "তথ্য ও যোগাযোগ | খুলনা নূরানী তালিমুল কুরআন বোর্ড",
  description: "নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ-এর অফিসিয়াল যোগাযোগের নম্বর ও বিস্তারিত তথ্য।",
};

export default function ContactPage() {
  const contactDepartments = [
    {
      title: "এলহাক, পরীক্ষা ও সনদ",
      subtitle: "মাদরাসা নিবন্ধন, কেন্দ্রীয় পরীক্ষা ও সনদ সংক্রান্ত তথ্য",
      icon: <Award className="w-6 h-6 text-emerald-600" />,
      badge: "পরীক্ষা ও সনদ",
      color: "emerald",
      numbers: ["01820-58 05 60"],
    },
    {
      title: "হিসাব বিভাগ",
      subtitle: "বোর্ড ফি, পরীক্ষা ফি ও যাবতীয় আর্থিক লেনদেন",
      icon: <Calculator className="w-6 h-6 text-blue-600" />,
      badge: "হিসাব",
      color: "blue",
      numbers: ["01893-43 23 13"],
    },
    {
      title: "বই ও স্টেশনারি",
      subtitle: "পাঠ্যবই, খাতা, স্টেশনারি অর্ডার ও ডেলিভারি তথ্য",
      icon: <BookOpen className="w-6 h-6 text-purple-600" />,
      badge: "বিক্রয় কেন্দ্র",
      color: "purple",
      numbers: ["01312-13 58 62"],
      link: "/store",
      linkText: "অনলাইন স্টোর দেখুন",
    },
    {
      title: "আরবি প্রশিক্ষণ",
      subtitle: "মুয়াল্লিম প্রশিক্ষণ (আরবি) কোর্স ও ব্যাচ সংক্রান্ত তথ্য",
      icon: <GraduationCap className="w-6 h-6 text-amber-600" />,
      badge: "প্রশিক্ষণ",
      color: "amber",
      numbers: ["01966-93 58 32", "01939-89 52 90"],
    },
    {
      title: "বাংলা প্রশিক্ষণ",
      subtitle: "মুয়াল্লিম প্রশিক্ষণ (বাংলা) কোর্স ও ব্যাচ সংক্রান্ত তথ্য",
      icon: <GraduationCap className="w-6 h-6 text-rose-600" />,
      badge: "প্রশিক্ষণ",
      color: "rose",
      numbers: ["01988-97 72 09", "01764-43 45 52"],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white py-12 px-4 shadow-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-block bg-white/15 backdrop-blur-sm text-emerald-100 text-xs font-bold px-3 py-1 rounded-full mb-3 border border-white/20">
                হেড অফিস ও হেল্পলাইন
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">তথ্য ও যোগাযোগ</h1>
              <p className="text-emerald-100 text-sm md:text-base mt-2 max-w-xl">
                নূরানী তা&apos;লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ-এর সংশ্লিষ্ট যেকোনো তথ্যের জন্য সরাসরি নির্দিষ্ট বিভাগে যোগাযোগ করুন।
              </p>
            </div>

            {/* Office Time Box */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 md:p-5 rounded-2xl flex items-start gap-3.5 max-w-md">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/30 flex items-center justify-center shrink-0 border border-emerald-300/30">
                <Clock className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">অফিস সময় ও যোগাযোগের কার্যকাল</h4>
                <p className="text-emerald-100 font-semibold text-sm mt-0.5">
                  শনিবার – বৃহস্পতিবার: সকাল ১০:৩০ – বিকাল ৪:০০
                </p>
                <p className="text-emerald-200 text-xs mt-1 italic font-medium">
                  (নামাজের সময় ব্যতীত)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Department Contacts & Address */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Address Banner Card */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-700">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                    প্রধান কার্যালয়
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1.5">
                    মুহাম্মাদনগর বড় মাদরাসা, খুলনা
                  </h3>
                  <p className="text-slate-600 text-sm mt-1 flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>মাদরাসা সড়ক, জলমা - ৯২৬০, লবণচরা, খুলনা।</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Department Contacts Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-emerald-600" />
                  বিভাগভিত্তিক হেল্পলাইন নম্বরসমূহ
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contactDepartments.map((dept, idx) => (
                  <div 
                    key={idx}
                    className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-200 flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          {dept.icon}
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {dept.badge}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-800 text-base mb-1">
                        {dept.title}
                      </h4>
                      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                        {dept.subtitle}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      {dept.numbers.map((num, nIdx) => {
                        const cleanNum = num.replace(/[\s-]/g, "");
                        return (
                          <a
                            key={nIdx}
                            href={`tel:${cleanNum}`}
                            className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-100 text-emerald-900 font-bold text-sm transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-emerald-600" />
                              {num}
                            </span>
                            <span className="text-[11px] font-semibold text-emerald-700 bg-white/80 px-2 py-0.5 rounded-md shadow-xs">
                              কল করুন
                            </span>
                          </a>
                        );
                      })}
                      
                      {dept.link && (
                        <Link
                          href={dept.link}
                          className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900 hover:underline pt-1 block"
                        >
                          {dept.linkText} <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instruction Notice */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 text-amber-900">
              <h4 className="font-bold text-sm flex items-center gap-2 mb-1.5 text-amber-950">
                <Clock className="w-4 h-4 text-amber-700" />
                জরুরী নির্দেশনা:
              </h4>
              <p className="text-xs leading-relaxed text-amber-900">
                ফোন করার পূর্বে অনুগ্রহ করে আপনার প্রয়োজনীয় প্রশ্ন বা মাদরাসার ইলহাক নম্বর সাথে রাখুন। অফিস সময়ের মধ্যে (সকাল ১০:৩০ হতে বিকাল ৪:০০) ফোন করার অনুরোধ করা হলো। নামাজের ওয়াক্তে ফোন সাময়িক বন্ধ থাকতে পারে।
              </p>
            </div>

          </div>

          {/* Right Column: Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Quick Summary Card */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-200">
              <h3 className="font-bold text-slate-800 text-base mb-4 border-b pb-2">
                এক নজরে যোগাযোগের তথ্য
              </h3>
              
              <ul className="space-y-3.5 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-800 block text-xs">কার্যালয়:</strong>
                    <span className="text-slate-600 text-xs">মুহাম্মাদনগর বড় মাদরাসা, মাদরাসা সড়ক, জলমা - ৯২৬০, লবণচরা, খুলনা।</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-800 block text-xs">অফিস কার্যকাল:</strong>
                    <span className="text-slate-600 text-xs">শনি–বৃহস্পতি (সকাল ১০:৩০ – বিকাল ৪:০০)</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-800 block text-xs">অফিসিয়াল ইমেইল:</strong>
                    <span className="text-slate-600 text-xs font-mono">info@khulnanuraniboard.com</span>
                  </div>
                </li>
              </ul>

              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  href="/register"
                  className="w-full text-center bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors"
                >
                  মাদরাসা নিবন্ধন ফরম
                </Link>
                <Link
                  href="/store"
                  className="w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors"
                >
                  বই ও স্টেশনারি অর্ডার
                </Link>
              </div>
            </div>

            {/* Notice Board Widget */}
            <div className="h-[420px]">
              <NoticeBoard />
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
