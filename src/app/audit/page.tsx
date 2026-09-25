import React from "react";
import Link from "next/link";
import {
  FileCheck,
  ShieldCheck,
  Building2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ClipboardList,
  GraduationCap,
  Users,
} from "lucide-react";
import NoticeBoard from "@/components/home/NoticeBoard";
import { INSPECTION_TYPES } from "@/lib/inspectionUtils";

export default function AuditPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            
            {/* Header */}
            <div className="border-b border-slate-100 pb-5 mb-6 text-center sm:text-left">
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 inline-block mb-2">
                কওমি-নূরানী এলহাক ও পরিদর্শন নির্দেশিকা
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-2">
                মাদরাসা পরিদর্শন ও কেন্দ্রীয় অডিট
              </h1>
              <div className="h-1 w-16 bg-emerald-600 rounded-full mb-3"></div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ — প্রাতিষ্ঠানিক মানদণ্ড, এলহাক নীতিমালা ও পরিদর্শন কাঠামো
              </p>

              {/* Quick Action Buttons */}
              <div className="mt-4 flex flex-wrap gap-2.5 justify-center sm:justify-start">
                <Link
                  href="/madrasa/inspection"
                  className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition"
                >
                  <FileCheck className="w-4 h-4" />
                  অনলাইনে পরিদর্শন আবেদন করুন
                </Link>
                <Link
                  href="/verify/inspection"
                  className="px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  সনদ যাচাইকরণ (QR)
                </Link>
                <Link
                  href="/login/visitor"
                  className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Users className="w-4 h-4" />
                  পরিদর্শক লগইন
                </Link>
              </div>
            </div>

            {/* Institutional Overview */}
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                প্রাতিষ্ঠানিক পটভূমি ও কওমি-নূরানী এলহাক নীতিমালা
              </h2>
              <p>
                নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ একটি আঞ্চলিক ও জাতীয় পর্যায়ের স্বতন্ত্র কওমি ধারার প্রাথমিক ও বুনিয়াদি দ্বীনি শিক্ষা বোর্ড, যার কেন্দ্রীয় প্রশাসনিক কার্যালয় মুহাম্মাদনগর বড় মাদরাসা, মাদরাসা সড়ক, জলমা, লবণচরা, খুলনায় অবস্থিত। বোর্ডটি নূরানী কায়দা, আমপারা, নাজেরা, হিফজুল কুরআন এবং ১ম থেকে ৫ম শ্রেণি পর্যন্ত সাধারণ বিষয়াবলি সমন্বিত পাঠ্যক্রম তদারকি, কেন্দ্রীয় সনদ পরীক্ষা নিয়ন্ত্রণ ও মুয়াল্লিম প্রশিক্ষণ পরিচালনা করে থাকে।
              </p>
              <p>
                কওমি ও নূরানী ধারার শিক্ষাব্যবস্থায় মাদরাসা অন্তর্ভুক্তিকরণ (যাকে ঐতিহ্যগতভাবে ‘এলহাক’ বলা হয়) এবং বার্ষিক অনুমোদন মূলত সরেজমিন নিরপেক্ষ পরিদর্শনের ওপর সরাসরি নির্ভরশীল। একটি নতুন মাদরাসাকে বোর্ডের অধিভুক্ত করতে হলে নির্দিষ্ট অবকাঠামোগত, একাডেমিক ও প্রশাসনিক পূর্বশর্ত পূরণ করতে হয়। এর মধ্যে অন্যতম হলো আবেদনের পূর্বে মাদরাসার বয়স কমপক্ষে এক বছর হওয়া, পরিচালনা কমিটির শুরা রেজুলেশন থাকা, উপযুক্ত দূরত্ব বজায় রাখা এবং নিজস্ব বা স্থায়ী বন্দোবস্তকৃত ভূমিতে পাঠদান পরিচালনা করা।
              </p>
            </div>

            {/* Inspection Types Table */}
            <div className="mt-8 space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-emerald-600" />
                বোর্ডের ৭টি পরিদর্শন পর্যায় ও ফি কাঠামো
              </h2>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-800">
                      <th className="p-3 font-semibold">পরিদর্শনের ধরণ</th>
                      <th className="p-3 font-semibold">প্রাথমিক উদ্দেশ্য</th>
                      <th className="p-3 font-semibold">আবশ্যিক যাচাই মানদণ্ড</th>
                      <th className="p-3 font-semibold text-right">নির্ধারিত ফি</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {INSPECTION_TYPES.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-900">
                          {t.label}
                        </td>
                        <td className="p-3 text-slate-600">{t.description}</td>
                        <td className="p-3 text-slate-500">
                          {t.id === "new_elhak" && "ভূমির দলিল, অবকাঠামো, প্রশিক্ষণপ্রাপ্ত শিক্ষক ও শুরা রেজুলেশন।"}
                          {t.id === "regular_annual" && "হাজিরা খাতা, সিলেবাস সমাপ্তির হার ও বাৎসরিক হিসাব।"}
                          {t.id === "re_inspection" && "পূর্ববর্তী পরিদর্শনের চিহ্নিত ত্রুটি নিরসন।"}
                          {t.id === "code_allocation" && "বোর্ডের কেন্দ্রীয় নিয়মনীতির শতভাগ পরিপালন।"}
                          {t.id === "exam_center" && "ধারণক্ষমতা, সিসিটিভি/নিরাপত্তা ও প্রশাসনিক নিরপেক্ষতা।"}
                          {t.id === "training_center" && "মুয়াল্লিম ব্যাচের মেস ও মিলনায়তন সুবিধা।"}
                          {t.id === "special_investigation" && "অভিযোগ নিষ্পত্তি ও সরেজমিন সত্যতা নিরূপণ।"}
                        </td>
                        <td className="p-3 font-bold text-emerald-700 text-right">
                          ৳ {t.defaultFee}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Evaluation Criteria Overview */}
            <div className="mt-8 space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                মূল্যায়ন কাঠামো ও গ্রেডিং স্কেল
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center">
                  <span className="font-bold text-emerald-800 text-sm block">গ্রেড 'এ'</span>
                  <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">৮০% বা তদূর্ধ্ব</span>
                  <span className="text-[10px] text-slate-500 mt-1 block">উন্নত মান ও সন্তোষজনক</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-center">
                  <span className="font-bold text-blue-800 text-sm block">গ্রেড 'বি'</span>
                  <span className="text-[11px] text-blue-600 font-semibold block mt-0.5">৬৫% হতে ৭৯%</span>
                  <span className="text-[10px] text-slate-500 mt-1 block">গ্রহণযোগ্য মান</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-center">
                  <span className="font-bold text-amber-800 text-sm block">গ্রেড 'সি'</span>
                  <span className="text-[11px] text-amber-600 font-semibold block mt-0.5">৫০% হতে ৬৪%</span>
                  <span className="text-[10px] text-slate-500 mt-1 block">শর্তসাপেক্ষ উন্নয়নযোগ্য</span>
                </div>
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-center">
                  <span className="font-bold text-rose-800 text-sm block">অননুমোদিত</span>
                  <span className="text-[11px] text-rose-600 font-semibold block mt-0.5">৫০%-এর নিচে</span>
                  <span className="text-[10px] text-slate-500 mt-1 block">বাতিল বা সংশোধন নোটিশ</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Sidebar Area */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="sticky top-20 space-y-4">
            {/* Quick Links Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                জরুরি পরিদর্শন লিংকসমূহ
              </h3>
              <div className="space-y-2 text-xs">
                <Link
                  href="/madrasa/inspection"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/60 hover:text-emerald-700 transition"
                >
                  <span className="font-semibold">অনলাইন পরিদর্শন আবেদন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/verify/inspection"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/60 hover:text-emerald-700 transition"
                >
                  <span className="font-semibold">ডিজিটাল সনদ সত্যতা যাচাই</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/login/visitor"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/60 hover:text-emerald-700 transition"
                >
                  <span className="font-semibold">মাঠ পরিদর্শক ড্যাশবোর্ড</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <NoticeBoard />
          </div>
        </div>

      </div>
    </div>
  );
}
