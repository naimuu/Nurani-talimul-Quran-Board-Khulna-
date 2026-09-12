import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "সেবার শর্তাবলী | নূরানী বোর্ড খুলনা",
  description: "নূরানী তালীমুল কুরআন বোর্ড খুলনা বাংলাদেশ সেবার শর্তাবলী ও নীতিমালা",
};

export default function TermsPage() {
  return (
    <div className="min-h-[calc(100vh-320px)] bg-slate-50 py-6 md:py-8">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800">
            <ArrowLeft className="w-4 h-4" />
            <span>হোমপেজে ফিরে যান</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">সেবার শর্তাবলী (Terms of Service)</h1>
              <p className="text-xs text-slate-500 mt-0.5">নূরানী তালীমুল কুরআন বোর্ড খুলনা বাংলাদেশ</p>
            </div>
          </div>

          <div className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed">
            <h2 className="text-lg font-bold text-slate-800">১. বোর্ড অন্তর্ভুক্তি ও সেবা গ্রহণ</h2>
            <p>
              বোর্ডের আওতাভুক্ত সকল মাদরাসা ও সংশ্লিষ্ট ব্যক্তিবর্গ বোর্ডের নির্ধারিত নিয়মাবলী ও সিলেবাস অনুসরণ করতে বাধ্য থাকিবেন।
            </p>

            <h2 className="text-lg font-bold text-slate-800">২. অনলাইন সেবা ও আবেদন</h2>
            <p>
              অনলাইনে জমাকৃত সকল মাদরাসা নিবন্ধন ও মুয়াল্লিম ভর্তির তথ্য নির্ভুল হওয়া বাঞ্ছনীয়। ভুল তথ্যের জন্য আবেদন বাতিল বা স্থগিত করার অধিকার বোর্ড সংরক্ষণ করে।
            </p>

            <h2 className="text-lg font-bold text-slate-800">৩. শর্তাবলীর পরিবর্তন</h2>
            <p>
              বোর্ড কর্তৃপক্ষ যেকোনো সময় সেবা ও পরিচালনার শর্তাবলীতে প্রয়োজনীয় পরিবর্তন বা সংশোধন করার অধিকার রাখে।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
