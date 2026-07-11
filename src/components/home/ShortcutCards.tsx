import { MapPin, ShoppingBag, Building, Award, Users, UserCircle, BookOpen, Calendar } from "lucide-react";
import Link from "next/link";

const shortcuts = [
  { id: 1, title: "স্থায়ী কার্যালয়", subtitle: "স্থায়ী কার্যালয়ের তালিকা", icon: <MapPin className="w-8 h-8" />, link: "#" },
  { id: 2, title: "বিক্রয় কেন্দ্র", subtitle: "বই বিক্রয় কেন্দ্রের তালিকা", icon: <ShoppingBag className="w-8 h-8" />, link: "#" },
  { id: 3, title: "প্রশিক্ষণ কেন্দ্র", subtitle: "মুয়াল্লিম প্রশিক্ষণ কেন্দ্রের তালিকা", icon: <Building className="w-8 h-8" />, link: "#" },
  { id: 4, title: "বাৎসরিক প্রশিক্ষণ কেন্দ্র", subtitle: "বাৎসরিক প্রশিক্ষণ কেন্দ্রের তালিকা", icon: <Award className="w-8 h-8" />, link: "#" },
  { id: 5, title: "প্রশিক্ষক ও পরিদর্শক", subtitle: "প্রশিক্ষক ও পরিদর্শক তালিকা", icon: <Users className="w-8 h-8" />, link: "#" },
  { id: 6, title: "অফিস কর্মকর্তা", subtitle: "অফিস কর্মকর্তাদের তালিকা", icon: <UserCircle className="w-8 h-8" />, link: "#" },
  { id: 7, title: "বই ও স্টেশনারি", subtitle: "অনলাইন অর্ডার করুন", icon: <BookOpen className="w-8 h-8" />, link: "#" },
  { id: 8, title: "বাৎসরিক ক্যালেন্ডার", subtitle: "২০২৬ সালের ক্যালেন্ডার", icon: <Calendar className="w-8 h-8" />, link: "#" },
];

export default function ShortcutCards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 h-full">
      {shortcuts.map((card) => (
        <div key={card.id} className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
            {card.icon}
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">{card.title}</h3>
          <p className="text-sm text-slate-500 mb-6 flex-1">{card.subtitle}</p>
          <Link 
            href={card.link}
            className="inline-flex justify-center items-center px-4 py-2 bg-slate-100 hover:bg-primary text-slate-700 hover:text-white text-sm font-semibold rounded-lg transition-colors w-max"
          >
            তালিকা দেখুন
          </Link>
        </div>
      ))}
    </div>
  );
}
