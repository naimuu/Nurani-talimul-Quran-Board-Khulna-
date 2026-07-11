import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
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
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">যোগাযোগ</h4>
            <ul className="space-y-2 text-gray-400">
              <li>খুলনা, বাংলাদেশ</li>
              <li>ইমেইল: info@khulnanuraniboard.com</li>
              <li>ফোন: +880 1234 567 890</li>
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
