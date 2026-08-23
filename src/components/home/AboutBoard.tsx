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
          ধর্ম প্রধান মহান আল্লাহর রাসূলুল্লাহ (সাঃ)-এর দাওয়াতের বদৌলতে ওলামায়ে কেরাম কওমি মাদরাসা প্রতিষ্ঠা করে দ্বীনের প্রসার ঘটাচ্ছেন। এরই ধারাবাহিকতায় নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ একটি গুরুত্বপূর্ণ ভূমিকা পালন করছে। অত্র অঞ্চলের বিভিন্ন প্রান্তে দ্বীনি শিক্ষা ছড়িয়ে দিতে এই বোর্ড কাজ করে যাচ্ছে...
        </p>

        <div className="space-y-3 mb-6 flex-1">
          <div className="flex items-start">
            <MapPin className="w-4 h-4 text-primary mt-0.5 mr-2.5 flex-shrink-0" />
            <p className="text-xs text-slate-700 leading-relaxed"><strong>প্রধান কার্যালয়:</strong> মুহাম্মাদনগর বড় মাদরাসা, মাদরাসা সড়ক, জলমা - ৯২৬০, লবণচরা, খুলনা।</p>
          </div>
          <div className="flex items-start">
            <Phone className="w-4 h-4 text-primary mt-0.5 mr-2.5 flex-shrink-0" />
            <p className="text-xs text-slate-700"><strong>পরীক্ষা ও সনদ:</strong> 01820-58 05 60 | <strong>হিসাব:</strong> 01893-43 23 13</p>
          </div>
          <div className="flex items-start">
            <Phone className="w-4 h-4 text-primary mt-0.5 mr-2.5 flex-shrink-0" />
            <p className="text-xs text-slate-700"><strong>বই ও স্টেশনারি:</strong> 01312-13 58 62</p>
          </div>
          <div className="flex items-start">
            <Phone className="w-4 h-4 text-primary mt-0.5 mr-2.5 flex-shrink-0" />
            <p className="text-xs text-slate-700"><strong>প্রশিক্ষণ:</strong> 01966-93 58 32, 01988-97 72 09</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/about/board_introduction"
            className="inline-flex justify-center items-center px-5 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl transition-colors"
          >
            বোর্ড পরিচিতি
          </Link>
          <Link 
            href="/contact"
            className="inline-flex justify-center items-center px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            সকল যোগাযোগ
          </Link>
        </div>
      </div>
    </div>
  );
}
