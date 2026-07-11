import { MapPin, Phone, MessageSquare } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AboutBoard() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden h-full flex flex-col">
      <div className="relative h-64 w-full bg-slate-200">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585036156171-384164a8c675?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <span className="text-sm font-medium text-emerald-300 mb-1 block">আমাদের সম্পর্কে</span>
          <h2 className="text-2xl font-bold">বোর্ড পরিচিতি</h2>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <p className="text-sm text-slate-600 mb-6 leading-relaxed text-justify">
          ধর্ম প্রধান মহান আল্লাহর রাসূলুল্লাগ (সাঃ)-এর দাওয়াতের বদৌলতে ওলামায়ে কেরাম কওমি মাদরাসা প্রতিষ্ঠা করে দ্বীনের প্রসার ঘটাচ্ছেন। এরই ধারাবাহিকতায় নূরানী তালীমুল কুরআন বোর্ড চট্টগ্রাম বাংলাদেশ একটি গুরুত্বপূর্ণ ভূমিকা পালন করছে। দেশের বিভিন্ন প্রান্তে দ্বীনি শিক্ষা ছড়িয়ে দিতে এই বোর্ড কাজ করে যাচ্ছে...
        </p>

        <div className="space-y-4 mb-8 flex-1">
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-slate-700"><strong>প্রধান কার্যালয়:</strong> আল জামিয়াতুল আহলিয়া দারুল উলুম মুঈনুল ইসলাম হাটহাজারী।</p>
          </div>
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-slate-700"><strong>কেন্দ্রীয় কার্যালয়:</strong> নূরানী তালীমুল কুরআন বোর্ড চট্টগ্রাম বাংলাদেশ। রেল স্টেশন রোড, হাটহাজারী-৪৩৩০, চট্টগ্রাম বাংলাদেশ</p>
          </div>
          <div className="flex items-center">
            <Phone className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
            <p className="text-sm text-slate-700"><strong>অফিস:</strong> 01777-666030, 01831-291039,40</p>
          </div>
          <div className="flex items-center">
            <MessageSquare className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
            <p className="text-sm text-slate-700"><strong>বই কেনা:</strong> 01831-291035</p>
          </div>
        </div>

        <Link 
          href="/about"
          className="inline-flex justify-center items-center px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors w-max"
        >
          বিস্তারিত
        </Link>
      </div>
    </div>
  );
}
