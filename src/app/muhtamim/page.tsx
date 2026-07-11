"use client";

import { motion } from "framer-motion";
import { LayoutDashboard, BookOpen, UserCheck, Calendar, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MuhtamimDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 min-h-screen p-4 flex flex-col">
        <div className="mb-8 p-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
            মুহতামিম প্যানেল
          </h2>
        </div>
        
        <nav className="flex-1 space-y-2">
          {[
            { icon: LayoutDashboard, label: "ড্যাশবোর্ড", active: true },
            { icon: BookOpen, label: "ক্লাস ও বিষয়সমূহ" },
            { icon: UserCheck, label: "মুয়াল্লিম তালিকা" },
            { icon: Calendar, label: "একাডেমিক ক্যালেন্ডার" },
          ].map((item, idx) => (
            <button
              key={idx}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                item.active ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-600 hover:bg-slate-50 hover:text-primary"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <button onClick={handleLogout} className="mt-auto flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">লগআউট</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">স্বাগতম, মুহতামিম!</h1>
            <p className="text-slate-500">আপনার মাদ্রাসার কার্যক্রম সুচারুভাবে পরিচালনা করুন।</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "মোট শিক্ষার্থী", value: "৩৪০" },
            { label: "সক্রিয় মুয়াল্লিম", value: "১২" },
            { label: "আসন্ন পরীক্ষা", value: "৩" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
            >
              <h3 className="text-slate-500 font-medium mb-2">{stat.label}</h3>
              <div className="flex items-baseline justify-between">
                <span className="text-4xl font-bold text-primary">{stat.value}</span>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-96 flex items-center justify-center">
          <p className="text-slate-400">মূল কন্টেন্ট এরিয়া (মুহতামিমের বিস্তারিত)</p>
        </div>
      </main>
    </div>
  );
}
