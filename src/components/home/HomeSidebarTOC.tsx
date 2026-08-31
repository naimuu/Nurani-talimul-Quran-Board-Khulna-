import Link from "next/link";
import { 
  Building2, 
  Store, 
  UserCheck, 
  Users, 
  GraduationCap, 
  CalendarDays, 
  BookOpenCheck, 
  FileText,
  ChevronRight,
  ListOrdered
} from "lucide-react";

interface TOCItem {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  link: string;
  badge?: string;
}

const tocItems: TOCItem[] = [
  {
    id: 1,
    title: "স্থায়ী কার্যালয়",
    subtitle: "বোর্ডের প্রধান ও স্থায়ী কার্যালয়",
    icon: <Building2 className="w-4 h-4 text-emerald-600" />,
    link: "/about/board_introduction",
    badge: "তালিকা"
  },
  {
    id: 2,
    title: "বই বিক্রয় কেন্দ্র",
    subtitle: "সকল বিভাগীয় বিক্রয় কেন্দ্রসমূহ",
    icon: <Store className="w-4 h-4 text-blue-600" />,
    link: "/store",
    badge: "তালিকা"
  },
  {
    id: 3,
    title: "অফিস কর্মকর্তা তালিকা",
    subtitle: "বোর্ডের দায়িত্বশীল কর্মকর্তাবৃন্দ",
    icon: <UserCheck className="w-4 h-4 text-indigo-600" />,
    link: "/member/office-staff",
    badge: "তালিকা"
  },
  {
    id: 4,
    title: "প্রশিক্ষক ও পরিদর্শক",
    subtitle: "কেন্দ্রীয় পরিদর্শক ও প্রশিক্ষক প্যানেল",
    icon: <Users className="w-4 h-4 text-amber-600" />,
    link: "/member/trainer-inspector",
    badge: "তালিকা"
  },
  {
    id: 5,
    title: "স্থায়ী প্রশিক্ষণ কেন্দ্রসমূহ",
    subtitle: "সারাদেশের স্থায়ী প্রশিক্ষণ কেন্দ্র",
    icon: <GraduationCap className="w-4 h-4 text-purple-600" />,
    link: "/training/permanent-center-list",
    badge: "তালিকা"
  },
  {
    id: 6,
    title: "বাৎসরিক প্রশিক্ষণ কেন্দ্র",
    subtitle: "ব্যাচভিত্তিক চলমান প্রশিক্ষণ তালিকা",
    icon: <BookOpenCheck className="w-4 h-4 text-teal-600" />,
    link: "/training/batchwise-center-list",
    badge: "তালিকা"
  },
  {
    id: 7,
    title: "বাৎসরিক ক্যালেন্ডার",
    subtitle: "২০২৬ সালের বাৎসরিক ছুটির তালিকা",
    icon: <CalendarDays className="w-4 h-4 text-rose-600" />,
    link: "/training/rules",
    badge: "২০২৬"
  },
  {
    id: 8,
    title: "মজলিশে আমেলা ও শুরা",
    subtitle: "কার্যকরী পরিষদ ও নীতিনির্ধারণী কমিটি",
    icon: <FileText className="w-4 h-4 text-sky-600" />,
    link: "/member/amela",
    badge: "পরিষদ"
  }
];

export default function HomeSidebarTOC() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-slate-100/90 overflow-hidden flex flex-col max-h-[500px] lg:max-h-[calc(100vh-105px)]">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/70 via-slate-50/60 to-transparent flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-700 flex items-center justify-center font-bold">
            <ListOrdered className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm leading-tight">তালিকা ও সূচিপত্র</h3>
            <p className="text-[11px] text-slate-500 font-medium">জরুরী রেফারেন্স ডিরেক্টরি</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
          ই-ডিরেক্টরি
        </span>
      </div>

      {/* Directory Items List */}
      <div className="divide-y divide-slate-100 flex-1 overflow-y-auto p-2 overscroll-contain">
        {tocItems.map((item) => (
          <Link
            key={item.id}
            href={item.link}
            className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/50 hover:border-emerald-100 transition-all duration-200"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-sm group-hover:scale-105 transition-all">
                {item.icon}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors truncate">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-400 truncate group-hover:text-slate-500 transition-colors">
                  {item.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 pl-2">
              {item.badge && (
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 group-hover:bg-emerald-100 group-hover:text-emerald-700 px-1.5 py-0.5 rounded transition-colors">
                  {item.badge}
                </span>
              )}
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom Footer Callout */}
      <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>সকল নিয়ম ও কার্যক্রম</span>
        <Link 
          href="/about/our_activities" 
          className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-0.5 hover:underline text-[11px]"
        >
          বিস্তারিত দেখুন
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
