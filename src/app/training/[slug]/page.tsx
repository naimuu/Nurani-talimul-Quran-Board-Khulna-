import NoticeBoard from "@/components/home/NoticeBoard";
import EditableContent from "@/components/EditableContent";
import Link from "next/link";
import connectDB from "@/lib/mongodb";
import TrainingBatch from "@/lib/models/TrainingBatch";
import { 
  GraduationCap, 
  Calendar, 
  MapPin, 
  Clock, 
  Phone, 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  ShieldCheck, 
  FileText,
  DollarSign
} from "lucide-react";

export default async function TrainingPage({ params }: { params: { slug: string } }) {
  const isBangla = params.slug === 'moallem-bangla';
  const isArabic = params.slug === 'moallem-arabic';
  const isBatchCourse = isBangla || isArabic;

  const titleMap: Record<string, string> = {
    'moallem-arabic': 'মুয়াল্লিম প্রশিক্ষণ (আরবী)',
    'moallem-bangla': 'মুয়াল্লিম প্রশিক্ষণ (বাংলা)',
    'quran-course': 'সহীহ কুরআন শিক্ষা কোর্স',
    'batchwise-center-list': 'ব্যাচভিত্তিক প্রশিক্ষণ কেন্দ্রের তালিকা',
    'permanent-center-list': 'স্থায়ী প্রশিক্ষণ কেন্দ্রসমূহ',
    'rules': 'প্রশিক্ষণের নিয়মাবলী',
    'download-registration': 'ফরম ডাউনলোড',
  };

  const title = titleMap[params.slug] || 'মুয়াল্লিম প্রশিক্ষণ';

  // Fetch active batches from MongoDB for this specific medium
  let activeBatches: any[] = [];
  if (isBatchCourse) {
    try {
      await connectDB();
      const medium = isBangla ? 'bangla' : 'arabic';
      activeBatches = await TrainingBatch.find({ medium, isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .lean();
    } catch (err) {
      console.error("Error fetching batches for training page:", err);
    }
  }

  // Fallback default batch if none exists in DB
  const primaryBatch = activeBatches[0] || (isBangla ? {
    medium: 'bangla',
    title: 'মুয়াল্লিম প্রশিক্ষণ (বাংলা)',
    subtitle: '৩০ দিন ব্যাপী বিশেষ শিক্ষক প্রশিক্ষণ কোর্স',
    badge: 'বাংলা মাধ্যম',
    durationDays: '৩০',
    durationText: 'দিন মেয়াদী প্রশিক্ষণ',
    price: '৳ ৫,৫০০',
    location: 'খুলনা বিভাগীয় কার্যালয় ও জেলা কেন্দ্র',
    date: 'চলমান / নতুন সেশন',
    batch: 'ব্যাচ নং: ১২৪ (বাংলা)',
    phone: '01966-935832, 01988-977209',
    regLink: '/register'
  } : isArabic ? {
    medium: 'arabic',
    title: 'মুয়াল্লিম প্রশিক্ষণ (আরবী)',
    subtitle: '৫০ দিন ব্যাপী উচ্চতর আরবী শিক্ষক প্রশিক্ষণ',
    badge: 'আরবি মাধ্যম',
    durationDays: '৫০',
    durationText: 'দিন মেয়াদী প্রশিক্ষণ',
    price: '৳ ৭,৫০০',
    location: 'খুলনা কেন্দ্রীয় কেন্দ্র ও সারাদেশের শাখাসমূহ',
    date: 'চলমান / কেন্দ্রীয় ব্যাচ',
    batch: 'ব্যাচ নং: ৮৫৪ (আরবী)',
    phone: '01966-935832, 01939-895290',
    regLink: '/register'
  } : null);

  const themeColors = isBangla ? {
    badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    headerBg: 'from-[#052e23] via-emerald-800 to-[#0a4233]',
    accent: 'text-emerald-700',
    pillBg: 'bg-emerald-50/80 border-emerald-200/80',
    btn: 'bg-gradient-to-r from-[#052e23] to-[#047857] hover:from-emerald-900 hover:to-emerald-700'
  } : {
    badge: 'bg-amber-100 text-amber-950 border-amber-300',
    headerBg: 'from-[#1e1b4b] via-[#1e3a8a] to-[#052e23]',
    accent: 'text-amber-800',
    pillBg: 'bg-amber-50/70 border-amber-200/80',
    btn: 'bg-gradient-to-r from-[#1e1b4b] to-[#1e3a8a] hover:from-slate-950 hover:to-indigo-950'
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Top Course Banner Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
            {/* Header Banner */}
            <div className={`p-6 sm:p-8 bg-gradient-to-r ${themeColors.headerBg} text-white relative overflow-hidden`}>
              {/* Faded Background Cover Image */}
              {primaryBatch?.coverImage && (
                <div
                  className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-20 filter brightness-110 contrast-125"
                  style={{ backgroundImage: `url(${primaryBatch.coverImage})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/30" />
                </div>
              )}

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border mb-2 bg-white/20 text-white border-white/30 backdrop-blur-xs`}>
                    {isBangla ? 'বাংলা মাধ্যম কোর্স' : isArabic ? 'আরবি মাধ্যম কোর্স' : 'প্রশিক্ষণ কোর্স'}
                  </span>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
                    {title}
                  </h1>
                  <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 font-medium">
                    {primaryBatch?.subtitle || 'নূরানী তা\'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ'}
                  </p>
                </div>

                {primaryBatch?.durationDays && (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15 border border-white/30 backdrop-blur-xs flex flex-col items-center justify-center font-bold text-white shrink-0 shadow-md">
                    <span className="text-2xl sm:text-3xl font-black leading-none">{primaryBatch.durationDays}</span>
                    <span className="text-[10px] sm:text-xs uppercase text-amber-300 mt-0.5">দিন মেয়াদী</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Short-Labeled Overview Grid */}
            {primaryBatch && (
              <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  
                  {/* সময়কাল */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>সময়কাল</span>
                    </span>
                    <p className="font-black text-sm sm:text-base text-slate-900 mt-1">
                      {primaryBatch.durationDays} দিন
                    </p>
                  </div>

                  {/* কোর্স ফি */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>কোর্স ফি</span>
                    </span>
                    <p className="font-black text-sm sm:text-base text-emerald-800 mt-1">
                      {primaryBatch.price}
                    </p>
                  </div>

                  {/* চলমান সেশন */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      <span>সেশন / তারিখ</span>
                    </span>
                    <p className="font-bold text-xs sm:text-sm text-slate-800 mt-1 truncate">
                      {primaryBatch.date}
                    </p>
                  </div>

                  {/* প্রধান স্থান */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-600" />
                      <span>প্রশিক্ষণ কেন্দ্র</span>
                    </span>
                    <p className="font-bold text-xs text-slate-800 mt-1 truncate">
                      {primaryBatch.location}
                    </p>
                  </div>

                </div>

                {/* Helpline Numbers Box */}
                {primaryBatch.phone && (
                  <div className="mt-4 p-3.5 bg-white rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <Phone className="w-4 h-4 text-red-500 shrink-0" />
                      <span>যোগাযোগ ও হেল্পলাইন:</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {primaryBatch.phone.split(',').map((ph: string, idx: number) => {
                        const cleanPhone = ph.trim().replace(/[^0-9+]/g, '');
                        return (
                          <a
                            key={idx}
                            href={`tel:${cleanPhone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-900 border border-red-200 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-2xs"
                            title={`কল করুন: ${ph.trim()}`}
                          >
                            <Phone className="w-3 h-3 text-red-500" />
                            <span>{ph.trim()}</span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Main Details Body */}
            <div className="p-5 sm:p-8 space-y-6">
              
              {/* Active Batches List (if multiple batches exist) */}
              {activeBatches.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-emerald-700" />
                    <span>চলমান ও নতুন ব্যাচসমূহ</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {activeBatches.map((b: any, bIdx: number) => (
                      <div
                        key={b._id || bIdx}
                        className={`p-4 rounded-2xl border ${themeColors.pillBg} flex flex-col justify-between gap-3 shadow-2xs relative overflow-hidden`}
                      >
                        {b.coverImage && (
                          <div
                            className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-10"
                            style={{ backgroundImage: `url(${b.coverImage})` }}
                          />
                        )}
                        <div className="relative z-10 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-black text-xs text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs">
                              {b.batch}
                            </span>
                            <span className="font-black text-xs text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                              ফি: {b.price}
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5 pt-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{b.date}</span>
                          </p>

                          <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{b.location}</span>
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-500 font-semibold">{b.durationDays} দিন মেয়াদ</span>
                          <Link
                            href={b.regLink && b.regLink !== '/register' ? b.regLink : `/training/admission?batchId=${b._id || b.id}&medium=${b.medium || (isBangla ? 'bangla' : 'arabic')}`}
                            className={`px-3.5 py-1.5 rounded-xl ${themeColors.btn} text-white font-bold text-xs shadow-2xs transition-all hover:scale-105 active:scale-95`}
                          >
                            আবেদন করুন
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Course Features & Benefits (Clean Short Labels) */}
              <div className="space-y-3 pt-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  <span>কোর্সের প্রধান বৈশিষ্ট্য ও সুবিধা</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700 font-medium">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>সহীহ কুরআন তেলাওয়াত ও মাখরাজ-সিফাত প্রশিক্ষণ</span>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <BookOpen className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>নূরানী বোর্ডের পাঠ্যবই ও শিক্ষক পাঠদান পদ্ধতি</span>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>বোর্ড কর্তৃক স্বীকৃত মুয়াল্লিম সনদপত্র প্রদান</span>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>সারাদেশে নূরানী মাদরাসায় শিক্ষকতার সুযোগ</span>
                  </div>
                </div>
              </div>

              {/* Direct Registration CTA Box */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">
                    অনলাইনে ভর্তি ফরম পূরণ করুন
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    চলমান বা আসন্ন ব্যাচে অংশ নিতে সরাসরি অনলাইনে আবেদন সম্পন্ন করুন।
                  </p>
                </div>

                <Link
                  href="/register"
                  className="px-6 py-2.5 rounded-xl bg-[#052e23] hover:bg-emerald-800 text-white font-black text-xs sm:text-sm shadow-sm transition-all hover:scale-105 active:scale-95 shrink-0 inline-flex items-center gap-2"
                >
                  <span>অনলাইন আবেদন</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </Link>
              </div>

              {/* Editable Content block for custom admin notes/updates */}
              <div className="pt-4 border-t border-slate-100">
                <EditableContent 
                  slug={`training_${params.slug}`}
                  defaultContent={`<p class="text-xs text-slate-500 italic">প্রশিক্ষণ সংক্রান্ত বিস্তারিত নীতিমালা বা অতিরিক্ত কোনো নোটিশ থাকলে এখানে যুক্ত করা যাবে।</p>`}
                />
              </div>

            </div>
          </div>
        </div>

        {/* Sidebar Area: Clean Notice Board */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="sticky top-20">
            <NoticeBoard />
          </div>
        </div>

      </div>
    </div>
  );
}
