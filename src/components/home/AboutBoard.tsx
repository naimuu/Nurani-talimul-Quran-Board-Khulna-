import { MapPin, Phone, Building2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AboutBoard() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden h-full flex flex-col justify-between group hover:border-emerald-200 transition-colors">
      <div>
        {/* Banner with Gradient Overlay */}
        <div className="relative h-48 sm:h-52 w-full bg-slate-800 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/hero/slide2.jpg')] bg-cover bg-center group-hover:scale-105 transition-transform duration-500"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#052e23] via-[#052e23]/60 to-transparent"></div>
          <div className="absolute bottom-4 left-5 right-5 text-white flex items-end justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-300 mb-0.5 block">আমাদের সম্পর্কে</span>
              <h2 className="text-xl sm:text-2xl font-black text-white">বোর্ড পরিচিতি ও কার্যালয়</h2>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-amber-300">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
        </div>
        
        {/* Description & Contact Details */}
        <div className="p-5 sm:p-6 space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed text-justify">
            ধর্ম প্রধান মহান আল্লাহর রাসূলুল্লাহ (সাঃ)-এর দাওয়াতের বদৌলতে ওলামায়ে কেরাম কওমি মাদরাসা প্রতিষ্ঠা করে দ্বীনের প্রসার ঘটাচ্ছেন। এরই ধারাবাহিকতায় নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ একটি গুরুত্বপূর্ণ ভূমিকা পালন করছে। অত্র অঞ্চলের বিভিন্ন প্রান্তে দ্বীনি শিক্ষা ছড়িয়ে দিতে এই বোর্ড কাজ করে যাচ্ছে...
          </p>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-start">
              <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-xs text-slate-700 leading-relaxed">
                <strong>প্রধান কার্যালয়:</strong> মুহাম্মাদনগর বড় মাদরাসা, মাদরাসা সড়ক, জলমা - ৯২৬০, লবণচরা, খুলনা।
              </p>
            </div>
            <div className="flex items-start">
              <Phone className="w-4 h-4 text-emerald-600 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-xs text-slate-700">
                <strong>পরীক্ষা ও সনদ:</strong> 01820-58 05 60 | <strong>হিসাব:</strong> 01893-43 23 13
              </p>
            </div>
            <div className="flex items-start">
              <Phone className="w-4 h-4 text-emerald-600 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-xs text-slate-700">
                <strong>বই ও স্টেশনারি:</strong> 01312-13 58 62 | <strong>প্রশিক্ষণ:</strong> 01966-93 58 32
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="p-5 sm:p-6 pt-0 flex items-center gap-3">
        <Link 
          href="/about/board_introduction"
          className="inline-flex justify-center items-center gap-1.5 px-5 py-2 bg-[#052e23] hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
        >
          <span>বোর্ড পরিচিতি</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link 
          href="/contact"
          className="inline-flex justify-center items-center px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
        >
          সকল যোগাযোগ
        </Link>
      </div>
    </div>
  );
}
