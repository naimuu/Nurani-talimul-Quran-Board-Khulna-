"use client";

import React, { useState } from "react";
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
  CreditCard,
  AlertCircle,
  HelpCircle,
  Phone,
  FileText,
  CheckCircle,
  Download,
  ExternalLink,
  ChevronDown,
  MapPin,
  Compass,
  Award,
  Clock,
  BookOpen,
  DollarSign,
  AlertTriangle,
  Search,
} from "lucide-react";
import NoticeBoard from "@/components/home/NoticeBoard";
import { INSPECTION_TYPES } from "@/lib/inspectionUtils";

export default function AuditPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const inspectionSteps = [
    {
      step: "০১",
      title: "অনলাইন আবেদন ও ফি জমা",
      desc: "বোর্ডের অনলাইন পোর্টালে মাদরাসার মৌলিক তথ্য পূরণ করে নির্ধারিত পরিদর্শন ফি জমা দিয়ে TrxID প্রদান করুন।",
      icon: FileText,
      color: "emerald",
    },
    {
      step: "০২",
      title: "আবেদন যাচাই ও পরিদর্শক নির্ধারণ",
      desc: "বোর্ড কর্তৃপক্ষ আবেদন ও পেমেন্ট যাচাই করে সংশ্লিষ্ট জেলা/উপজেলার উপযুক্ত মাঠ পরিদর্শককে দায়িত্ব অর্পণ করবে।",
      icon: Users,
      color: "blue",
    },
    {
      step: "০৩",
      title: "তারিখ নির্ধারণ ও মাদরাসাকে অবহিতকরণ",
      desc: "পরিদর্শনের সম্ভাব্য তারিখ নির্ধারণ করে মাদরাসা কর্তৃপক্ষ ও পরিদর্শককে এসএমএস ও ফোনে অবহিত করা হবে।",
      icon: Calendar,
      color: "indigo",
    },
    {
      step: "০৪",
      title: "সরেজমিন পরিদর্শন ও তথ্য সংগ্রহ",
      desc: "পরিদর্শক মাদরাসায় উপস্থিত হয়ে জিপিএস লোকেশন ভেরিফিকেশনসহ শ্রেণিকক্ষ, শিক্ষক, ছাত্র ও রেজিস্টার সরেজমিন নিরীক্ষা করবেন।",
      icon: Compass,
      color: "purple",
    },
    {
      step: "০৫",
      title: "পরিদর্শক কর্তৃক পূর্ণাঙ্গ রিপোর্ট দাখিল",
      desc: "পরিদর্শক মাঠপর্যায় থেকে ডিজিটাল চেকলিস্ট ও নম্বর প্রদানপূর্বক বোর্ডের কেন্দ্রীয় সিস্টেমে সরাসরি রিপোর্ট দাখিল করবেন।",
      icon: ClipboardList,
      color: "amber",
    },
    {
      step: "০৬",
      title: "বোর্ডের কেন্দ্রীয় মূল্যায়ন ও সিদ্ধান্ত",
      desc: "বোর্ডের উচ্চপর্যায়ের নিরীক্ষা কমিটি পরিদর্শকের রিপোর্ট যাচাই করে অনুমোদন, শর্তসাপেক্ষ বা পুনর্বিবেচনার সিদ্ধান্ত প্রদান করবে।",
      icon: Award,
      color: "teal",
    },
    {
      step: "০৭",
      title: "মাদরাসা কোড ও এলহাক সনদ প্রদান",
      desc: "অনুমোদিত মাদরাসাকে কেন্দ্রীয় কোড নম্বর এবং কিউআর কোড সম্বলিত অফিসিয়াল ডিজিটাল এলহাক সনদ ও স্মারক প্রদান করা হবে।",
      icon: ShieldCheck,
      color: "emerald",
    },
  ];

  const requiredDocuments = [
    {
      title: "পরিচালনা কমিটির শুরা রেজুলেশন",
      desc: "বোর্ডের অধীনে অন্তর্ভুক্তির সর্বসম্মত সিদ্ধান্ত সংবলিত শুরা কমিটির সভার কার্যবিবরণী ও স্বাক্ষরিত রেজুলেশন কপি।",
      required: true,
    },
    {
      title: "মাদরাসার জায়গার দলিল বা চুক্তিপত্র",
      desc: "মাদরাসা যে ভূমিতে অবস্থিত তার বৈধ মালিকানা দলিল, হেবানামা বা ন্যূনতম ৫ বছরের ভাড়া/লিজ চুক্তিপত্র।",
      required: true,
    },
    {
      title: "শিক্ষক ও মুয়াল্লিম তালিকা",
      desc: "সকল শিক্ষকের নাম, শিক্ষাগত যোগ্যতা, নূরানী মুয়াল্লিম ট্রেনিং সনদপত্র নম্বর ও মোবাইল নম্বরসহ তালিকা।",
      required: true,
    },
    {
      title: "শ্রেণিভিত্তিক ছাত্র-ছাত্রীর তালিকা",
      desc: "নূরানী কায়দা, আমপারা, নাজেরা ও ১ম-৫ম শ্রেণি পর্যন্ত শাখাভিত্তিক মোট শিক্ষার্থী সংখ্যা ও নিয়মিত হাজিরা খাতা।",
      required: true,
    },
    {
      title: "দৈনিক ক্লাসরুটিন ও বার্ষিক ক্যালেন্ডার",
      desc: "বোর্ডের নির্ধারিত সময়সূচি ও পাঠ্যক্রম অনুসারে পরিচালিত মাদরাসার দৈনিক ও সাপ্তাহিক ক্লাস রুটিন।",
      required: true,
    },
    {
      title: "মাদরাসার বাস্তব রঙিন ছবি",
      desc: "মাদরাসার মূল সাইনবোর্ডসহ সম্মুখভাগ, শ্রেণিকক্ষ, অফিসকক্ষ ও ওজুখানা/টয়লেটের পরিষ্কার ছবি।",
      required: true,
    },
    {
      title: "বিগত সমাপনী পরীক্ষার ফলাফল",
      desc: "মাদরাসার পূর্ববর্তী বছরের বার্ষিক সমাপনী পরীক্ষা বা কেন্দ্রীয় পরীক্ষার ফলাফল বিবরণী (প্রযোজ্য ক্ষেত্রে)।",
      required: false,
    },
    {
      title: "পূর্ববর্তী পরিদর্শন রিপোর্ট ও ছাড়পত্র",
      desc: "পূর্বে পরিদর্শন হয়ে থাকলে পরিদর্শকের লিখিত মন্তব্য বা বোর্ডের ছাড়পত্রের কপি (রি-ইন্সপেকশনের ক্ষেত্রে আবশ্যিক)।",
      required: false,
    },
  ];

  const checklistCategories = [
    {
      title: "১. অবকাঠামো ও ভৌত পরিবেশ",
      points: "২৫ নম্বর",
      items: [
        "পর্যাপ্ত আলো-বাতাসযুক্ত প্রশস্ত শ্রেণিকক্ষ",
        "শিক্ষার্থীদের জন্য উপযুক্ত ডেস্ক/রেহাল ও মাদুর/কার্পেট",
        "স্বাস্থ্যসম্মত স্যানিটেশন ও নিরাপদ খাবার পানির ব্যবস্থা",
        "পবিত্র ও পরিচ্ছন্ন ওজুখানা ও নামাজের উপযুক্ত পরিবেশ",
        "স্থায়ী সাইনবোর্ড ও অগ্নিনির্বাপণ/জরুরি নিরাপত্তা ব্যবস্থা",
      ],
    },
    {
      title: "২. শিক্ষক যোগ্যতা ও পাঠদান পদ্ধতি",
      points: "২৫ নম্বর",
      items: [
        "বোর্ড সনদপ্রাপ্ত প্রশিক্ষণপ্রাপ্ত নূরানী মুয়াল্লিম উপস্থিতি",
        "সহীহ মাখরাজ ও তাজবীদ ভিত্তিক তেলাওয়াত শিক্ষাদান",
        "হাতে-কলমে সুন্দর হস্তলিপি (আরবি, বাংলা, ইংরেজি) অনুশীলন",
        "বোর্ডের অনুমোদিত সিলেবাস ও পাঠ্যপুস্তক অনুসরণের হার",
        "শিক্ষক হাজিরা ও সময়ানুবর্তিতা বজায় রাখা",
      ],
    },
    {
      title: "৩. শিক্ষার্থী ও একাডেমিক পারফরম্যান্স",
      points: "২০ নম্বর",
      items: [
        "শিক্ষার্থী-শিক্ষক ভারসাম্যপূর্ণ অনুপাত (১:৩০)",
        "দৈনিক উপস্থিতি ও নিয়মিত ক্লাসে অংশগ্রহণ",
        "আমপারা ও নাজেরা শিক্ষার্থীদের নির্ভুল তেলাওয়াত যাচাই",
        "দৈনন্দিন মাসনুন দোয়া, মাসায়েল ও ইসলামী শিষ্টাচার জ্ঞান",
        "দুর্বল শিক্ষার্থীদের জন্য বিশেষ যত্ন ও তদারকি",
      ],
    },
    {
      title: "৪. হিসাব ও প্রাতিষ্ঠানিক প্রশাসন",
      points: "১৫ নম্বর",
      items: [
        "নিয়মিত আয়-ব্যয়ের স্বচ্ছ ক্যাশবহি ও অডিট রেজিস্টার",
        "শিক্ষার্থী ফি আদায়ের সুনির্দিষ্ট মুদ্রিত রশিদ বই",
        "কার্যকর পরিচালনা কমিটি/শুরা এবং নিয়মিত মাসিক বৈঠক",
        "শিক্ষকদের নিয়মিত মাসিক বেতন-ভাতা প্রদানের প্রমাণাদি",
        "দাপ্তরিক ফাইল ও নথিপত্রের যথাযথ সংরক্ষণ",
      ],
    },
    {
      title: "৫. শৃঙ্খলা ও সার্বিক দ্বীনি পরিবেশ",
      points: "১৫ নম্বর",
      items: [
        "শিক্ষক ও শিক্ষার্থীদের সুন্নতি লেবাস ও মার্জিত পোশাক",
        "মাদরাসা প্রাঙ্গণে পূর্ণাঙ্গ সুন্নতি আদব ও দ্বীনি তারবিয়াত",
        "ধূমপানমুক্ত ও ধূমপানবিরোধী স্বাস্থ্যকর ক্যাম্পাস",
        "স্থানীয় সমাজ ও অভিভাবকদের সাথে সুসম্পর্ক",
        "বোর্ডের সকল কেন্দ্রীয় নির্দেশনা সময়মতো পালনের অঙ্গীকার",
      ],
    },
  ];

  const faqs = [
    {
      q: "মাদরাসা পরিদর্শনের জন্য কখন আবেদন করতে হবে?",
      a: "নতুন মাদরাসা বোর্ডের অধিভুক্ত (এলহাক) করতে চাইলে প্রতিষ্ঠান প্রতিষ্ঠার অন্তত এক বছর পর যেকোনো সময় আবেদন করা যাবে। এছাড়া বার্ষিক নিয়মিত পরিদর্শনের জন্য বোর্ড কর্তৃক নির্ধারিত বাৎসরিক ক্যালেন্ডার অনুযায়ী আবেদন করতে হবে।",
    },
    {
      q: "সরেজমিন পরিদর্শনে পরিদর্শক মহোদয় কী কী বিষয় সরাসরি নিরীক্ষা করেন?",
      a: "পরিদর্শক মহোদয় মূলতঃ পাঁচটি ক্ষেত্রে সরেজমিন যাচাই করেন: (১) অবকাঠামো ও ভৌত পরিবেশ, (২) প্রশিক্ষণপ্রাপ্ত মুয়াল্লিমদের পাঠদান মান ও মাখরাজ, (৩) শিক্ষার্থীদের আমলি অবস্থা, তাজবীদ ও হস্তলিপি, (৪) আয়-ব্যয় ও হিসাব সংরক্ষণ এবং (৫) পরিচালনা কমিটির নিয়মতান্ত্রিক শুরা রেজুলেশন।",
    },
    {
      q: "পরিদর্শনের কত কার্যদিবসের মধ্যে রিপোর্ট ও ফলাফল পাওয়া যায়?",
      a: "পরিদর্শক সরেজমিন পরিদর্শনের সর্বোচ্চ ৩ কার্যদিবসের মধ্যে অনলাইনে রিপোর্ট দাখিল করেন। এরপর বোর্ডের কেন্দ্রীয় কমিটি ৭ থেকে ১০ কার্যদিবসের মধ্যে রিপোর্ট পর্যালোচনা করে চূড়ান্ত অনুমোদন বা মাদরাসা কোড প্রদান করে।",
    },
    {
      q: "পরিদর্শনে অসন্তোষজনক বা শর্তসাপেক্ষ গ্রেড আসলে কী করণীয়?",
      a: "যদি পরিদর্শনে চিহ্নিত কোনো ত্রুটি থাকে, বোর্ড মাদরাসাকে নির্দিষ্ট সময়সীমা (সাধারণতঃ ৩০ থেকে ৬০ দিন) দিয়ে নোটিশ প্রদান করবে। ত্রুটি সংশোধন করে 'পুনরায় পরিদর্শন' (Re-inspection) এর জন্য আবেদন করা যাবে।",
    },
    {
      q: "মাঠ পরিদর্শককে কি কোনো নগদ অর্থ বা উপহার দেওয়া যাবে?",
      a: "না, সম্পূর্ণ কঠোরভাবে নিষিদ্ধ। কোনো অবস্থাতেই পরিদর্শককে নগদ অর্থ প্রদান করা যাবে না। সকল পরিদর্শন ফি শুধুমাত্র বোর্ডের অনলাইন পোর্টাল বা বোর্ডের অফিশিয়াল ব্যাংক একাউন্টে জমা দিয়ে ট্রানজেকশন আইডি (TrxID) দিতে হবে।",
    },
    {
      q: "মাদরাসা কোড ও এলহাক অনুমোদন পেলে বোর্ডের কী কী সুবিধা পাওয়া যায়?",
      a: "বোর্ডের কেন্দ্রীয় সমাপনী পরীক্ষায় অংশগ্রহণের সুযোগ, শিক্ষার্থীদের সরকারি ও আন্তর্জাতিক মানের বোর্ড সার্টিফিকেট, শিক্ষকদের নিয়মিত বিশেষ মুয়াল্লিম প্রশিক্ষণ কোর্স, কেন্দ্রীয় প্রকাশনা ও পাঠ্যক্রম সহায়তা এবং বোর্ডের কেন্দ্রীয় শিক্ষা বৃত্তিতে অংশগ্রহণের অধিকার লাভ হয়।",
    },
    {
      q: "পরিদর্শনের নির্ধারিত তারিখ কি পেছানো বা পরিবর্তন করা সম্ভব?",
      a: "হ্যাঁ, বিশেষ জরুরি প্রয়োজনে পরিদর্শনের নির্ধারিত তারিখের অন্তত ৩ দিন পূর্বে বোর্ডের হেল্পলাইনে যোগাযোগ করে যুক্তিসঙ্গত কারণ উল্লেখপূর্বক তারিখ পরিবর্তনের অনুরোধ করা যাবে।",
    },
    {
      q: "ডিজিটাল এলহাক সনদ কীভাবে অনলাইনে সত্যতা যাচাই করা যায়?",
      a: "বোর্ডের ওয়েবসাইটের 'সনদ যাচাইকরণ' মেনুতে গিয়ে মাদরাসার কোড বা ট্র্যাকিং নম্বর দিয়ে অথবা সনদে মুদ্রিত কিউআর কোড (QR Code) যেকোনো স্মার্টফোন দিয়ে স্ক্যান করে মুহূর্তেই সত্যতা ও কার্যকারিতা যাচাই করা যাবে।",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Top Breadcrumb & Quick Announcement */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Link href="/" className="hover:text-emerald-700">হোম</Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">মাদরাসা পরিদর্শন ও অডিট</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>কেন্দ্রীয় ডিজিটাল এলহাক ডাটাবেজ ভেরিফিকেশন সক্রিয়</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Hero Banner Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="border-b border-slate-100 pb-6 mb-6">
              <span className="text-xs px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 inline-block mb-3">
                কওমি-নূরানী এলহাক ও পরিদর্শন নির্দেশিকা
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                মাদরাসা পরিদর্শন ও কেন্দ্রীয় অডিট
              </h1>
              <div className="h-1.5 w-20 bg-emerald-600 rounded-full mb-4"></div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ — প্রাতিষ্ঠানিক মানদণ্ড, কওমি এলহাক নীতিমালা, পরিদর্শনের নিয়মাবলী ও ডিজিটাল সনদ ব্যবস্থাপনা
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-2.5">
                <Link
                  href="/madrasa/inspection"
                  className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition active:scale-95"
                >
                  <FileCheck className="w-4 h-4" />
                  অনলাইনে পরিদর্শন আবেদন করুন
                </Link>
                <Link
                  href="/madrasa/inspection?tab=status"
                  className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                >
                  <Search className="w-4 h-4" />
                  আবেদন স্ট্যাটাস ট্র্যাকিং
                </Link>
                <Link
                  href="/verify/inspection"
                  className="px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  সনদ যাচাইকরণ (QR)
                </Link>
              </div>

              {/* In-page Anchor Nav Pills */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
                <a href="#process" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-medium transition">
                  পরিদর্শন প্রক্রিয়া
                </a>
                <a href="#types" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-medium transition">
                  ধরন ও ফি
                </a>
                <a href="#documents" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-medium transition">
                  প্রয়োজনীয় কাগজপত্র
                </a>
                <a href="#payment" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-medium transition">
                  ফি ও পেমেন্ট
                </a>
                <a href="#checklist" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-medium transition">
                  মূল্যায়ন চেকলিস্ট
                </a>
                <a href="#faq" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-medium transition">
                  সাধারণ জিজ্ঞাসা
                </a>
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
          </div>

          {/* Section: Inspection Process (#process) */}
          <div id="process" className="scroll-mt-20 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">ওয়ার্কফ্লো ও রোডম্যাপ</span>
                <h2 className="text-lg md:text-xl font-extrabold text-slate-900 flex items-center gap-2 mt-0.5">
                  <Compass className="w-5 h-5 text-emerald-600" />
                  ৭-ধাপের মাদরাসা পরিদর্শন ও অনুমোদন প্রক্রিয়া
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">আবেদন থেকে সনদ প্রাপ্তি পর্যন্ত</span>
            </div>

            <div className="relative border-l-2 border-emerald-100 ml-4 sm:ml-6 space-y-6 pl-6 sm:pl-8 py-2">
              {inspectionSteps.map((s, idx) => {
                const IconComponent = s.icon;
                return (
                  <div key={idx} className="relative group">
                    {/* Step Icon Badge */}
                    <div className="absolute -left-[37px] sm:-left-[45px] top-0.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border-2 border-emerald-600 text-emerald-800 flex items-center justify-center font-bold text-xs shadow-xs group-hover:bg-emerald-600 group-hover:text-white transition">
                      {s.step}
                    </div>

                    <div className="bg-slate-50/70 hover:bg-emerald-50/40 p-4 rounded-2xl border border-slate-200/80 transition space-y-1.5">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4 text-emerald-600" />
                        <h3 className="font-bold text-slate-900 text-sm">{s.title}</h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Inspection Types & Fees (#types) */}
          <div id="types" className="scroll-mt-20 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">নির্ধারিত ফি তালিকা</span>
                <h2 className="text-lg md:text-xl font-extrabold text-slate-900 flex items-center gap-2 mt-0.5">
                  <ClipboardList className="w-5 h-5 text-emerald-600" />
                  বোর্ডের ৭টি পরিদর্শন পর্যায় ও ফি কাঠামো
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">সর্বশেষ অনুমোদিত রেট চার্ট</span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-800">
                      <th className="p-3.5 font-bold">পরিদর্শনের ধরন</th>
                      <th className="p-3.5 font-bold">প্রাথমিক উদ্দেশ্য</th>
                      <th className="p-3.5 font-bold">আবশ্যিক যাচাই মানদণ্ড</th>
                      <th className="p-3.5 font-bold text-right">নির্ধারিত ফি</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {INSPECTION_TYPES.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/60 transition">
                        <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                          {t.label}
                        </td>
                        <td className="p-3.5 text-slate-600">{t.description}</td>
                        <td className="p-3.5 text-slate-500 leading-relaxed">
                          {t.id === "new_elhak" && "ভূমির দলিল, উপযুক্ত ক্লাসরুম, প্রশিক্ষণপ্রাপ্ত মুয়াল্লিম ও শুরা রেজুলেশন।"}
                          {t.id === "regular_annual" && "হাজিরা খাতা, সিলেবাস সমাপ্তির হার ও বাৎসরিক আয়-ব্যয়ের হিসাব।"}
                          {t.id === "re_inspection" && "পূর্ববর্তী পরিদর্শনে চিহ্নিত ত্রুটি বা অপর্যাপ্ততার যথাযথ নিরসন।"}
                          {t.id === "code_allocation" && "বোর্ডের কেন্দ্রীয় পাঠ্যক্রম ও পরীক্ষার পূর্ণাঙ্গ নিয়মনীতি পরিপালন।"}
                          {t.id === "exam_center" && "ধারণক্ষমতা, সিসিটিভি/নিরাপত্তা, পরীক্ষক কক্ষ ও প্রশাসনিক নিরপেক্ষতা।"}
                          {t.id === "training_center" && "মুয়াল্লিম প্রশিক্ষণার্থীদের আবাসিক মেস ও মিলনায়তন সুবিধা।"}
                          {t.id === "special_investigation" && "অভিযোগ নিষ্পত্তি, সীমানা বিরোধ বা সরেজমিন সত্যতা নিরূপণ।"}
                        </td>
                        <td className="p-3.5 font-bold text-emerald-700 text-right whitespace-nowrap text-sm">
                          ৳ {t.defaultFee.toLocaleString("bn-BD")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>দৃষ্টি আকর্ষণ:</strong> পরিদর্শনের আবেদন করার পর বোর্ডের কেন্দ্রীয় ব্যাংক বা মোবাইল একাউন্টে ফি পরিশোধ করতে হবে। কোনো পরিদর্শককে সরাসরি নগদ ফি প্রদান করা যাবে না।
              </p>
            </div>
          </div>

          {/* Section: Required Documents (#documents) */}
          <div id="documents" className="scroll-mt-20 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">চেকলিস্ট ও সংযুক্তি</span>
                <h2 className="text-lg md:text-xl font-extrabold text-slate-900 flex items-center gap-2 mt-0.5">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  আবেদনের জন্য প্রয়োজনীয় কাগজপত্র
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">আবেদনের সময় ও পরিদর্শকের নিকট প্রদর্শনযোগ্য</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requiredDocuments.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-emerald-50/30 transition space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <h3 className="font-bold text-slate-900 text-xs">{doc.title}</h3>
                    </div>
                    {doc.required ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200 shrink-0">
                        আবশ্যক
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium shrink-0">
                        প্রযোজ্য ক্ষেত্রে
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed pl-6">{doc.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="font-bold block">কাগজপত্র প্রস্তুত আছে?</span>
                <span className="text-[11px] text-emerald-700">অনলাইনে সরাসরি আবেদন ফরম পূরণ শুরু করতে পারেন</span>
              </div>
              <Link
                href="/madrasa/inspection"
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition"
              >
                আবেদন ফরমে যান &rarr;
              </Link>
            </div>
          </div>

          {/* Section: Inspection Fee & Payment Guidelines (#payment) */}
          <div id="payment" className="scroll-mt-20 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">অর্থ পরিশোধ নির্দেশিকা</span>
                <h2 className="text-lg md:text-xl font-extrabold text-slate-900 flex items-center gap-2 mt-0.5">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  পরিদর্শন ফি ও পেমেন্ট পদ্ধতি
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">নিরাপদ ডিজিটাল ও ব্যাংক পেমেন্ট</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* bKash / Nagad Cards */}
              <div className="bg-pink-50/50 border border-pink-200 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-pink-900 text-sm">বিকাশ (bKash) পেমেন্ট</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 font-semibold">মার্চেন্ট / পার্সোনাল</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  বিকাশ অ্যাপের ‘Send Money’ অথবা ‘Payment’ অপশন ব্যবহার করে বোর্ডের একাউন্টে ফি প্রদান করুন।
                </p>
                <div className="bg-white p-2.5 rounded-xl border border-pink-100 font-mono text-pink-800 font-bold flex items-center justify-between">
                  <span>০১৯১১-XXXXXX (বোর্ড একাউন্ট)</span>
                  <span className="text-[10px] text-slate-500 font-sans font-normal">TrxID সংরক্ষণ করুন</span>
                </div>
              </div>

              <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 text-sm">নগদ (Nagad) পেমেন্ট</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">মার্চেন্ট / পার্সোনাল</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  নগদ অ্যাপের মাধ্যমে ফি প্রেরণ করুন এবং প্রাপ্ত ট্রানজেকশন আইডি আবেদন ফরমে ইনপুট দিন।
                </p>
                <div className="bg-white p-2.5 rounded-xl border border-amber-100 font-mono text-amber-800 font-bold flex items-center justify-between">
                  <span>০১৮১১-XXXXXX (বোর্ড একাউন্ট)</span>
                  <span className="text-[10px] text-slate-500 font-sans font-normal">TrxID সংরক্ষণ করুন</span>
                </div>
              </div>

              {/* Bank Account Details */}
              <div className="md:col-span-2 bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    কেন্দ্রীয় ব্যাংক একাউন্ট বিবরণী
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">ব্যাংক চালান / ট্রান্সফার</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px]">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">হিসাবের নাম:</span>
                    <span className="font-bold text-slate-800">নূরানী তা'লীমুল কুরআন বোর্ড খুলনা</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">ব্যাংক ও শাখা:</span>
                    <span className="font-bold text-slate-800">ইসলামী ব্যাংক বাংলাদেশ লিঃ, খুলনা শাখা</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">হিসাব নম্বর:</span>
                    <span className="font-bold text-emerald-700 font-mono text-xs">২০৫০XXXXXXXXXXXXX</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Crucial Notice */}
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-rose-900">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-rose-800">কঠোর আর্থিক সতর্কতা:</strong>
                <p className="mt-0.5 text-rose-700 leading-relaxed">
                  বোর্ডের পরিদর্শক মহোদয়কে সরেজমিন পরিদর্শনের সময় কোনো প্রকার নগদ টাকা বা হাদিয়া প্রদান করা বোর্ডের শৃঙ্খলা পরিপন্থী। সকল ফি বোর্ডের অফিশিয়াল বিকাশ, নগদ বা ব্যাংক একাউন্টে জমা দিয়ে প্রাপ্ত TrxID দিয়ে আবেদন ফর্ম সাবমিট করতে হবে।
                </p>
              </div>
            </div>
          </div>

          {/* Section: Inspector Evaluation Checklist (#checklist) */}
          <div id="checklist" className="scroll-mt-20 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">মাঠ অডিট মানদণ্ড</span>
                <h2 className="text-lg md:text-xl font-extrabold text-slate-900 flex items-center gap-2 mt-0.5">
                  <GraduationCap className="w-5 h-5 text-emerald-600" />
                  পরিদর্শন মূল্যায়ন চেকলিস্ট ও গ্রেডিং কাঠামো
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">১০০ নম্বরের পূর্ণাঙ্গ অডিট স্কেল</span>
            </div>

            {/* Grading Scale Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-center">
                <span className="font-extrabold text-emerald-800 text-sm block">গ্রেড 'এ' (A)</span>
                <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">৮০% বা তদূর্ধ্ব</span>
                <span className="text-[10px] text-slate-500 mt-1 block">পূর্ণাঙ্গ অনুমোদন ও সন্তোষজনক</span>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl text-center">
                <span className="font-extrabold text-blue-800 text-sm block">গ্রেড 'বি' (B)</span>
                <span className="text-[11px] text-blue-600 font-bold block mt-0.5">৬৫% হতে ৭৯%</span>
                <span className="text-[10px] text-slate-500 mt-1 block">গ্রহণযোগ্য মান ও শর্তহীন অনুমোদন</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-center">
                <span className="font-extrabold text-amber-800 text-sm block">গ্রেড 'সি' (C)</span>
                <span className="text-[11px] text-amber-600 font-bold block mt-0.5">৫০% হতে ৬৪%</span>
                <span className="text-[10px] text-slate-500 mt-1 block">শর্তসাপেক্ষ উন্নয়নযোগ্য অনুমতি</span>
              </div>
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl text-center">
                <span className="font-extrabold text-rose-800 text-sm block">অননুমোদিত</span>
                <span className="text-[11px] text-rose-600 font-bold block mt-0.5">৫০%-এর নিচে</span>
                <span className="text-[10px] text-slate-500 mt-1 block">বাতিল / পুনর্বিবেচনা নোটিশ</span>
              </div>
            </div>

            {/* 5 Evaluation Categories */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                পরিদর্শকের ৫টি আবশ্যিক মূল্যায়ন ক্ষেত্র:
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {checklistCategories.map((cat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <span className="font-bold text-slate-900 text-xs">{cat.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        {cat.points}
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-slate-600">
                      {cat.items.map((item, iIdx) => (
                        <li key={iIdx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section: FAQs (#faq) */}
          <div id="faq" className="scroll-mt-20 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">সহায়তা ও প্রশ্নোত্তর</span>
                <h2 className="text-lg md:text-xl font-extrabold text-slate-900 flex items-center gap-2 mt-0.5">
                  <HelpCircle className="w-5 h-5 text-emerald-600" />
                  সাধারণ জিজ্ঞাসা (FAQ)
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">বহুল জিজ্ঞাসিত প্রশ্নসমূহ</span>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-2xl overflow-hidden transition"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full text-left p-4 bg-slate-50/60 hover:bg-slate-100/60 flex items-center justify-between gap-3 text-xs font-bold text-slate-800 transition"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span>{faq.q}</span>
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-emerald-600" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Sidebar Area */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="sticky top-20 space-y-6">
            
            {/* Quick Actions Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                জরুরি পরিদর্শন লিংকসমূহ
              </h3>

              <div className="space-y-2 text-xs">
                <Link
                  href="/madrasa/inspection"
                  className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 text-emerald-900 hover:bg-emerald-100 transition font-bold"
                >
                  <span className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-700" />
                    অনলাইন পরিদর্শন আবেদন
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/madrasa/inspection?tab=status"
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-slate-500" />
                    আবেদন স্ট্যাটাস ট্র্যাকিং
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/verify/inspection"
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    ডিজিটাল সনদ সত্যতা যাচাই
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/login/visitor"
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-600" />
                    মাঠ পরিদর্শক ড্যাশবোর্ড
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Helpline Card */}
            <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-5 rounded-3xl shadow-sm space-y-3">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-emerald-100 font-semibold inline-block">
                পরিদর্শন সেল হেল্পডেস্ক
              </span>
              <h4 className="text-sm font-bold">যেকোনো জিজ্ঞাসা বা সহযোগিতায়</h4>
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                পরিদর্শন আবেদন সংক্রান্ত পরামর্শ, ফি নিশ্চিতকরণ বা তারিখ পরিবর্তনের জন্য সরাসরি যোগাযোগ করুন:
              </p>
              <div className="pt-2 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-white font-mono font-bold bg-white/10 px-3 py-2 rounded-xl">
                  <Phone className="w-3.5 h-3.5 text-emerald-300" />
                  <span>০১৭১১-XXXXXX / ০১৭২২-XXXXXX</span>
                </div>
                <div className="text-[11px] text-emerald-200">
                  সময়: সকাল ৯:০০ টা হতে বিকাল ৫:০০ টা (কর্মদিবসে)
                </div>
              </div>
            </div>

            {/* Notice Board */}
            <NoticeBoard />
          </div>
        </div>

      </div>
    </div>
  );
}
