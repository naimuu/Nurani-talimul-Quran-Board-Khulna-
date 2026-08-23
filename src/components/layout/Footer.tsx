"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  
  if (pathname === '/store') return null;

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 border-t-4 border-primary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & About */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-white">খুলনা</span>
              <span>নূরানী বোর্ড</span>
            </h3>
            <p className="text-gray-400 mb-6 max-w-sm">
              অত্র অঞ্চলে মাদরাসাগুলির জন্য বিশুদ্ধ ইসলামি শিক্ষা এবং প্রশাসন প্রদান করা। জ্ঞান এবং নৈতিকতার মাধ্যমে একটি সুন্দর ভবিষ্যৎ গড়তে নিবেদিত।
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">গুরুত্বপূর্ণ লিংক</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-white transition-colors">আমাদের সম্পর্কে</Link></li>
              <li><Link href="/notices" className="hover:text-white transition-colors">নোটিশ</Link></li>
              <li><Link href="/results" className="hover:text-white transition-colors">পরীক্ষার ফলাফল</Link></li>
              <li><Link href="/forms" className="hover:text-white transition-colors">ফর্ম ডাউনলোড</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors text-emerald-400 font-semibold">তথ্য ও যোগাযোগ</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center justify-between">
              <span>তথ্য ও যোগাযোগ</span>
              <Link href="/contact" className="text-xs text-emerald-400 hover:underline font-normal">বিস্তারিত</Link>
            </h4>
            <ul className="space-y-2 text-gray-300 text-xs">
              <li className="leading-relaxed">
                <strong className="text-white block mb-0.5">প্রধান কার্যালয়:</strong>
                মুহাম্মাদনগর বড় মাদরাসা, মাদরাসা সড়ক, জলমা - ৯২৬০, লবণচরা, খুলনা।
              </li>
              <li className="pt-1 border-t border-gray-800">
                <strong className="text-emerald-400">এলহাক, পরীক্ষা ও সনদ:</strong> <a href="tel:01820580560" className="hover:text-white font-mono">01820-58 05 60</a>
              </li>
              <li>
                <strong className="text-emerald-400">হিসাব বিভাগ:</strong> <a href="tel:01893432313" className="hover:text-white font-mono">01893-43 23 13</a>
              </li>
              <li>
                <strong className="text-emerald-400">বই ও স্টেশনারি:</strong> <a href="tel:01312135862" className="hover:text-white font-mono">01312-13 58 62</a>
              </li>
              <li>
                <strong className="text-emerald-400">আরবি প্রশিক্ষণ:</strong> <span className="font-mono">01966-93 58 32, 01939-89 52 90</span>
              </li>
              <li>
                <strong className="text-emerald-400">বাংলা প্রশিক্ষণ:</strong> <span className="font-mono">01988-97 72 09, 01764-43 45 52</span>
              </li>
              <li className="pt-1.5 border-t border-gray-800 text-[11px] text-emerald-300">
                <strong>অফিস সময়:</strong> শনি–বৃহস্পতি (সকাল ১০:৩০ – বিকাল ৪:০০, নামাজের সময় ব্যতীত)
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {currentYear} খুলনা নূরানী বোর্ড। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="mt-4 md:mt-0 space-x-4">
            <Link href="/privacy" className="hover:text-white transition-colors">গোপনীয়তা নীতি</Link>
            <Link href="/terms" className="hover:text-white transition-colors">সেবার শর্তাবলী</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
