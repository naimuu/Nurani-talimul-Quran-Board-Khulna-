import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "গোপনীয়তা নীতি | খুলনা নূরানী বোর্ড",
  description: "নূরানী তালীমুল কুরআন বোর্ড খুলনা বাংলাদেশ গোপনীয়তা নীতি",
};

export default function PrivacyPolicyPage() {
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
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">গোপনীয়তা নীতি (Privacy Policy)</h1>
              <p className="text-xs text-slate-500 mt-0.5">নূরানী তালীমুল কুরআন বোর্ড খুলনা বাংলাদেশ</p>
            </div>
          </div>

          <div className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed">
            <h2 className="text-lg font-bold text-slate-800">১. তথ্য সংগ্রহ ও ব্যবহার</h2>
            <p>
              খুলনা নূরানী বোর্ড মাদরাসা নিবন্ধন, ছাত্র-ছাত্রীদের কেন্দ্রীয় পরীক্ষা, শিক্ষক প্রশিক্ষণ ও সনদ প্রদানের প্রয়োজনে প্রয়োজনীয় তথ্য (যেমন: মাদরাসার নাম, ঠিকানা, দায়িত্বশীলদের ফোন নম্বর, শিক্ষার্থীদের রোল/রেজিস্ট্রেশন নম্বর) সংগ্রহ ও সংরক্ষণ করে।
            </p>

            <h2 className="text-lg font-bold text-slate-800">২. তথ্যের নিরাপত্তা</h2>
            <p>
              বোর্ড ব্যবহারকারীদের সকল ব্যক্তিগত ও প্রাতিষ্ঠানিক তথ্যের গোপনীয়তা রক্ষা করতে অঙ্গীকারবদ্ধ। সংরক্ষিত কোনো তথ্য তৃতীয় পক্ষের কাছে বিক্রি বা অননুমোদিতভাবে হস্তান্তর করা হয় না।
            </p>

            <h2 className="text-lg font-bold text-slate-800">৩. যোগাযোগের জন্য</h2>
            <p>
              গোপনীয়তা নীতি সম্পর্কিত যেকোনো তথ্যের জন্য আমাদের কেন্দ্রীয় কার্যালয় অথবা ওয়েবসাইটের <Link href="/contact" className="text-emerald-700 font-bold hover:underline">যোগাযোগ পাতায়</Link> দেওয়া নম্বরে যোগাযোগ করতে পারেন।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
