import Link from "next/link";
import { FileText, Download, CheckCircle2, ArrowRight, BookOpen, GraduationCap, ClipboardList, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "ফর্ম ও আবেদন সমূহ | খুলনা নূরানী বোর্ড",
  description: "বোর্ডের সকল অফিশিয়াল ফরম, ইলহাক, মুয়াল্লিম ভর্তি ও সনদ আবেদন ফরম ডাউনলোড",
};

export default function FormsHubPage() {
  const formCategories = [
    {
      category: "ইলহাক ও মাদরাসা সংক্রান্ত ফরম",
      forms: [
        {
          title: "ইলহাক করার নিয়মাবলী ও নীতিমালা",
          description: "নতুন মাদরাসা ইলহাক (বোর্ডভুক্তি) করার শর্তাবলী, নিয়মকানুন ও প্রয়োজনীয় কাগজের তালিকা।",
          href: "/forms/ilhaq-rules",
          badge: "নিয়মাবলী",
          badgeColor: "bg-emerald-100 text-emerald-800",
          icon: ShieldCheck,
        },
        {
          title: "মাদরাসা নিবন্ধন ও ইলহাক আবেদন ফরম",
          description: "বোর্ডভুক্তির জন্য নির্ধারিত অফিশিয়াল মাদরাসা তথ্য ফরম ও আবেদনপত্র।",
          href: "/forms/institute-create",
          badge: "আবেদন ফরম",
          badgeColor: "bg-blue-100 text-blue-800",
          icon: ClipboardList,
        },
        {
          title: "ইলহাক ফরম ডাউনলোড ও শেয়ার",
          description: "ইলহাক ফরমের অফলাইন প্রিন্টেবল কপি ডাউনলোড ও প্রিন্ট করার সুবিধা।",
          href: "/forms/ilhaq-download",
          badge: "ডাউনলোড",
          badgeColor: "bg-purple-100 text-purple-800",
          icon: Download,
        },
      ],
    },
    {
      category: "মুয়াল্লিম প্রশিক্ষণ ও সনদ সংক্রান্ত ফরম",
      forms: [
        {
          title: "মুয়াল্লিম প্রশিক্ষণ ভর্তি ফরম",
          description: "বাংলা ও আরবি মুয়াল্লিম শিক্ষক প্রশিক্ষণ কোর্সে ভর্তির আবেদন ফরম।",
          href: "/forms/moallem-admission",
          badge: "ভর্তি ফরম",
          badgeColor: "bg-teal-100 text-teal-800",
          icon: GraduationCap,
        },
        {
          title: "মুয়াল্লিম সনদ আবেদন ফরম",
          description: "মুয়াল্লিম প্রশিক্ষণ সমাপ্তকারী শিক্ষার্থীদের মূল সনদ উত্তোলনের আবেদন।",
          href: "/forms/moallem-certificate",
          badge: "সনদ ফরম",
          badgeColor: "bg-amber-100 text-amber-800",
          icon: BookOpen,
        },
        {
          title: "পরীক্ষার উত্তরপত্র পুনঃনিরীক্ষণ আবেদন",
          description: "বোর্ডের কেন্দ্রীয় সমাপনী বা প্রশিক্ষণ পরীক্ষার খাতা পুনঃনিরীক্ষার আবেদন।",
          href: "/forms/exam-review",
          badge: "পরীক্ষা",
          badgeColor: "bg-rose-100 text-rose-800",
          icon: FileText,
        },
      ],
    },
    {
      category: "খেদমত ও শিক্ষক চাহিদা সংক্রান্ত ফরম",
      forms: [
        {
          title: "মুয়াল্লিম চাহিদা ফরম (মাদরাসার জন্য)",
          description: "মাদরাসায় দক্ষ নূরানী মুয়াল্লিম/মুয়াল্লিমা নিয়োগের জন্য বোর্ডে শিক্ষক চাহিদাপত্র।",
          href: "/forms/moallem-demand",
          badge: "চাহিদাপত্র",
          badgeColor: "bg-sky-100 text-sky-800",
          icon: ClipboardList,
        },
        {
          title: "খেদমত প্রত্যাশী মুয়াল্লিম আবেদন ফরম",
          description: "বোর্ডের প্রশিক্ষণপ্রাপ্ত মুয়াল্লিমদের বিভিন্ন মাদরাসায় খেদমতের জন্য আবেদন।",
          href: "/forms/khedmot-demand",
          badge: "খেদমত",
          badgeColor: "bg-indigo-100 text-indigo-800",
          icon: GraduationCap,
        },
      ],
    },
  ];

  return (
    <div className="min-h-[calc(100vh-320px)] bg-slate-50 py-6 md:py-8">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 space-y-8">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-5 sm:p-7 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-block px-2.5 py-0.5 bg-emerald-700/80 border border-emerald-500/50 rounded-full text-[11px] font-semibold tracking-wider uppercase mb-2 text-emerald-200">
              ডকুমেন্ট ও ফরম সেন্টার
            </span>
            <h1 className="text-xl sm:text-2xl font-bold mb-1.5">
              অফিশিয়াল আবেদন ও ডাউনলোড ফরম
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
              মাদরাসা নিবন্ধন, ইলহাক, মুয়াল্লিম ভর্তি, সনদ আবেদন ও যাবতীয় অফিশিয়াল ফরমের তালিকা।
            </p>
          </div>
        </div>

        {/* Categories & Forms */}
        <div className="space-y-6">
          {formCategories.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-3">
              <h2 className="text-sm sm:text-base font-bold text-slate-800 border-l-4 border-emerald-600 pl-2.5 flex items-center gap-2">
                <span>{group.category}</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.forms.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-sm hover:border-emerald-500 transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white flex items-center justify-center transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors mb-1">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-700 group-hover:text-emerald-800">
                        <span>ফরম দেখুন ও ডাউনলোড</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
