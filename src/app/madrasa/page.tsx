"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  LogOut,
  Search,
  MoreVertical,
  Printer,
  Download,
  Edit3,
  Trash2,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  Building2,
  Phone,
  GraduationCap,
  Calendar,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function MadrasaDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"dashboard" | "students" | "teachers" | "forms">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdown, setOpenDropdown] = useState<{ id: string; type: string } | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!openDropdown) return;
    const handleDocClick = () => setOpenDropdown(null);
    window.addEventListener("click", handleDocClick);
    return () => window.removeEventListener("click", handleDocClick);
  }, [openDropdown]);

  const handleLogout = () => {
    router.push("/login");
  };

  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "ড্যাশবোর্ড" },
    { id: "students", icon: GraduationCap, label: "শিক্ষার্থী" },
    { id: "teachers", icon: Users, label: "মুয়াল্লিম ও শিক্ষক" },
    { id: "forms", icon: FileText, label: "নোটিশ ও আবেদন" },
  ] as const;

  const mockStudents = [
    { id: "std-1", roll: "১০১", name: "মুহাম্মাদ আব্দুল্লাহ", class: "৩য় জামাত", guardian: "মো: রফিকুল ইসলাম", phone: "০১৭১১-XXXXXX", status: "নিয়মিত" },
    { id: "std-2", roll: "১০২", name: "আব্দুর রহমান", class: "৩য় জামাত", guardian: "মাওলানা কায়সার", phone: "০১৭২২-XXXXXX", status: "নিয়মিত" },
    { id: "std-3", roll: "১০৩", name: "হুসাইন আহমেদ", class: "২য় জামাত", guardian: "মো: দেলোয়ার হোসেন", phone: "০১৭৩৩-XXXXXX", status: "অপেক্ষমাণ" },
    { id: "std-4", roll: "১০৪", name: "মুহাম্মাদ আনাস", class: "১ম জামাত", guardian: "মো: ফারুক", phone: "০১৭৪৪-XXXXXX", status: "নিয়মিত" },
  ];

  const mockTeachers = [
    { id: "tch-1", name: "মুফতি আব্দুর রশীদ", designation: "প্রধান শিক্ষক", subject: "কুরআন ও তাজবীদ", phone: "০১৭১২-XXXXXX" },
    { id: "tch-2", name: "মাওলানা উবায়দুল্লাহ", designation: "সহকারী শিক্ষক", subject: "হাদীস ও ফিকহ", phone: "০১৭২৩-XXXXXX" },
    { id: "tch-3", name: "ক্বারী শামসুল হুদা", designation: "মুয়াল্লিম", subject: "নূরানী কায়দা", phone: "০১৭৩৪-XXXXXX" },
  ];

  const filteredStudents = mockStudents.filter(
    (s) => !searchQuery || s.name.includes(searchQuery) || s.roll.includes(searchQuery) || s.class.includes(searchQuery)
  );

  const filteredTeachers = mockTeachers.filter(
    (t) => !searchQuery || t.name.includes(searchQuery) || t.subject.includes(searchQuery) || t.designation.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 min-h-screen p-4 hidden md:flex flex-col shrink-0">
        <div className="mb-6 p-3 bg-slate-900 rounded-2xl text-white">
          <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">
            মাদরাসা পোর্টাল
          </span>
          <h2 className="text-base font-bold text-white mt-0.5">মাদরাসা প্যানেল</h2>
          <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
            মুহতামিম ড্যাশবোর্ড
          </p>
        </div>

        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === item.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <item.icon className="w-4 h-4 text-emerald-500" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-all text-xs font-semibold cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>লগআউট</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-3.5 sm:p-6 md:p-8 w-full max-w-full overflow-y-auto">
        {/* Top Header */}
        <header className="mb-4 sm:mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              {activeTab === "dashboard" && "স্বাগতম, মুহতামিম!"}
              {activeTab === "students" && "শিক্ষার্থী তালিকা"}
              {activeTab === "teachers" && "মুয়াল্লিম ও শিক্ষক তালিকা"}
              {activeTab === "forms" && "নোটিশ ও আবেদন"}
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              মাদরাসা সার্বিক তথ্য ও ব্যবস্থাপনা
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন এন্ট্রি</span>
            </button>
          </div>
        </header>

        {/* Smooth Scrollable Mobile Tab Bar */}
        <div className="md:hidden flex items-center gap-1.5 overflow-x-auto scroll-smooth no-scrollbar pb-1 mb-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === item.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200"
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Minimalist Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 mb-5">
          {[
            { label: "মোট শিক্ষার্থী", value: "৪৫০ জন", icon: GraduationCap, color: "text-slate-900" },
            { label: "শিক্ষক ও মুয়াল্লিম", value: "১৫ জন", icon: Users, color: "text-emerald-700" },
            { label: "অপেক্ষমাণ ফর্ম", value: "৫ টি", icon: Clock, color: "text-amber-700" },
            { label: "বোর্ড স্বীকৃতি", value: "অনুমোদিত", icon: CheckCircle2, color: "text-blue-700" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 block">{stat.label}</span>
                <span className={`text-base sm:text-lg font-bold mt-0.5 block ${stat.color}`}>{stat.value}</span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                <stat.icon className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          ))}
        </div>

        {/* Search & Actions Bar */}
        <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-2xs mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নাম, রোল বা তথ্য খুঁজুন..."
              className="w-full h-9 pl-8 pr-7 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600 transition shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">
              ফলাফল: <b className="text-slate-800">{activeTab === "teachers" ? filteredTeachers.length : filteredStudents.length}</b> টি
            </span>
          </div>
        </div>

        {/* Content Section: Dashboard or Tab Views */}
        {activeTab === "teachers" ? (
          <div className="space-y-3">
            {filteredTeachers.map((tch) => (
              <div
                key={tch.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 p-3.5 sm:p-4 shadow-2xs transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">{tch.name}</h3>
                    <p className="text-[11px] text-slate-500">{tch.designation} • {tch.subject}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${tch.phone}`}
                    className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span className="hidden sm:inline">কল</span>
                  </a>

                  {/* Three Dot Menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(
                          openDropdown?.id === tch.id && openDropdown?.type === "tch" ? null : { id: tch.id, type: "tch" }
                        );
                      }}
                      className="h-8 w-8 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition cursor-pointer"
                      title="অ্যাকশন"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    <AnimatePresence>
                      {openDropdown?.id === tch.id && openDropdown?.type === "tch" && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.1 }}
                          className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden py-1 divide-y divide-slate-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setOpenDropdown(null)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 w-full text-left"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                            <span>এডিট</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setOpenDropdown(null)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 w-full text-left"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>মুছুন</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredStudents.map((std) => (
              <div
                key={std.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 p-3.5 sm:p-4 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0 font-mono mt-0.5 sm:mt-0">
                    {std.roll}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">{std.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {std.class}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      অভিভাবক: {std.guardian} • {std.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    std.status === "নিয়মিত" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    {std.status}
                  </span>

                  {/* Primary Action Button */}
                  <button
                    type="button"
                    className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Eye className="w-3 h-3 text-emerald-400" />
                    <span>বিস্তারিত</span>
                  </button>

                  {/* Three-Dot Menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(
                          openDropdown?.id === std.id && openDropdown?.type === "std" ? null : { id: std.id, type: "std" }
                        );
                      }}
                      className="h-8 w-8 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition cursor-pointer"
                      title="অ্যাকশন"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    <AnimatePresence>
                      {openDropdown?.id === std.id && openDropdown?.type === "std" && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.1 }}
                          className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden py-1 divide-y divide-slate-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setOpenDropdown(null)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 w-full text-left"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                            <span>তথ্য এডিট</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setOpenDropdown(null)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 w-full text-left"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-400" />
                            <span>রশিদ প্রিন্ট</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setOpenDropdown(null)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 w-full text-left"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>মুছুন</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
