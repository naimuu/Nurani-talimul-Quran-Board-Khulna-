"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, MapPin, Clock, ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  
  if (pathname === '/store' || pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-slate-950 text-slate-300 pt-12 pb-8 border-t-4 border-emerald-600 relative overflow-hidden">
      {/* Subtle background glow effect */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-950/20 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Col 1: Brand & Office Address (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <h3 className="text-2xl font-black text-white flex items-center gap-2">
                <span>নূরানী বোর্ড</span>
                <span className="text-emerald-400">খুলনা</span>
              </h3>
              <p className="text-xs text-emerald-400/90 font-medium tracking-wide mt-0.5">
                নূরানী তালীমুল কুরআন বোর্ড খুলনা বাংলাদেশ
              </p>
            </div>
            
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              অত্র অঞ্চলে মাদরাসাগুলির জন্য বিশুদ্ধ ইসলামি শিক্ষা ও সুষ্ঠু প্রশাসনিক সেবা প্রদান। জ্ঞান এবং আদর্শের সমন্বয়ে একটি সুন্দর আগামী গড়তে নিবেদিত।
            </p>

            {/* Office Address Card */}
            <div className="bg-slate-900/40 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold mb-0.5">প্রধান কার্যালয়:</strong>
                  <span className="text-slate-400 leading-normal">মুহাম্মাদনগর বড় মাদরাসা, মাদরাসা সড়ক, জলমা - ৯২৬০, লবণচরা, খুলনা।</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-300 pt-2 border-t border-slate-800/40">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold mb-0.5">অফিস সময়:</strong>
                  <span className="text-emerald-300/90 text-[11.5px] leading-tight block">
                    শনি – বৃহস্পতি: সকাল ১০:৩০ – বিকাল ৪:০০ <span className="text-slate-400">(নামাজের সময় ব্যতীত)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-base font-bold text-white tracking-wide border-b border-slate-800/60 pb-2.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              গুরুত্বপূর্ণ লিংক
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 group">
                  <span className="text-emerald-500 text-xs transition-transform group-hover:translate-x-1">›</span>
                  আমাদের সম্পর্কে
                </Link>
              </li>
              <li>
                <Link href="/notices" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 group">
                  <span className="text-emerald-500 text-xs transition-transform group-hover:translate-x-1">›</span>
                  নোটিশ বোর্ড
                </Link>
              </li>
              <li>
                <Link href="/results" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 group">
                  <span className="text-emerald-500 text-xs transition-transform group-hover:translate-x-1">›</span>
                  পরীক্ষার ফলাফল
                </Link>
              </li>
              <li>
                <Link href="/forms" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 group">
                  <span className="text-emerald-500 text-xs transition-transform group-hover:translate-x-1">›</span>
                  ফর্ম ডাউনলোড
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 group">
                  <span className="text-emerald-500 text-xs transition-transform group-hover:translate-x-1">›</span>
                  মাদরাসা নিবন্ধন
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center gap-1.5 group">
                  <span className="text-emerald-400 text-xs transition-transform group-hover:translate-x-1">›</span>
                  যোগাযোগ ও দিকনির্দেশনা
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Department Direct Hotlines (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
              <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                জরুরি বিভাগীয় হটলাইন ও যোগাযোগ
              </h4>
              <Link 
                href="/contact" 
                className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline inline-flex items-center gap-1 font-medium transition-colors"
              >
                <span>সকল নম্বর</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Structured Department Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Card 1: ইলহাক, পরীক্ষা ও সনদ */}
              <div className="bg-slate-900/40 hover:bg-slate-900/70 rounded-xl p-3 transition-colors">
                <span className="text-xs font-medium text-slate-400 block mb-1.5">
                  ইলহাক, পরীক্ষা ও সনদ:
                </span>
                <a
                  href="tel:01820580560"
                  className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-300 transition-colors py-0.5"
                  title="কল করতে ক্লিক করুন"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>01820-580560</span>
                </a>
              </div>

              {/* Card 2: হিসাব বিভাগ */}
              <div className="bg-slate-900/40 hover:bg-slate-900/70 rounded-xl p-3 transition-colors">
                <span className="text-xs font-medium text-slate-400 block mb-1.5">
                  হিসাব বিভাগ:
                </span>
                <a
                  href="tel:01893432313"
                  className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-300 transition-colors py-0.5"
                  title="কল করতে ক্লিক করুন"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>01893-432313</span>
                </a>
              </div>

              {/* Card 3: বই ও স্টেশনারি */}
              <div className="bg-slate-900/40 hover:bg-slate-900/70 rounded-xl p-3 transition-colors">
                <span className="text-xs font-medium text-slate-400 block mb-1.5">
                  বই ও স্টেশনারি বিভাগ:
                </span>
                <a
                  href="tel:01312135862"
                  className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-300 transition-colors py-0.5"
                  title="কল করতে ক্লিক করুন"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>01312-135862</span>
                </a>
              </div>

              {/* Card 4: আরবি প্রশিক্ষণ */}
              <div className="bg-slate-900/40 hover:bg-slate-900/70 rounded-xl p-3 transition-colors">
                <span className="text-xs font-medium text-slate-400 block mb-1.5">
                  আরবি প্রশিক্ষণ বিভাগ:
                </span>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <a
                    href="tel:01966935832"
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-300 transition-colors py-0.5"
                    title="কল করতে ক্লিক করুন"
                  >
                    <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>01966-935832</span>
                  </a>
                  <span className="text-slate-600 text-xs hidden sm:inline">•</span>
                  <a
                    href="tel:01939895290"
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-300 transition-colors py-0.5"
                    title="কল করতে ক্লিক করুন"
                  >
                    <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>01939-895290</span>
                  </a>
                </div>
              </div>

              {/* Card 5: বাংলা প্রশিক্ষণ */}
              <div className="bg-slate-900/40 hover:bg-slate-900/70 rounded-xl p-3 transition-colors sm:col-span-2">
                <span className="text-xs font-medium text-slate-400 block mb-1.5">
                  বাংলা প্রশিক্ষণ বিভাগ:
                </span>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                  <a
                    href="tel:01988977209"
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-300 transition-colors py-0.5"
                    title="কল করতে ক্লিক করুন"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>01988-977209</span>
                  </a>
                  <span className="text-slate-600 text-xs hidden sm:inline">•</span>
                  <a
                    href="tel:01764434552"
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-300 transition-colors py-0.5"
                    title="কল করতে ক্লিক করুন"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>01764-434552</span>
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="border-t border-slate-800/90 mt-12 pt-6 text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="flex items-center gap-1.5">
            <span>&copy; {currentYear}</span>
            <strong className="text-slate-300 font-medium">নূরানী বোর্ড খুলনা</strong>
            <span>— সর্বস্বত্ব সংরক্ষিত।</span>
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-emerald-400 transition-colors">গোপনীয়তা নীতি</Link>
            <span className="text-slate-700">•</span>
            <Link href="/terms" className="hover:text-emerald-400 transition-colors">সেবার শর্তাবলী</Link>
            <span className="text-slate-700">•</span>
            <Link href="/contact" className="hover:text-emerald-400 transition-colors">যোগাযোগ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
