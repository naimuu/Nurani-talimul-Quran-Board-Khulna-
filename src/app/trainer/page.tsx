"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, BookOpen, Presentation, LogOut, UserCircle, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TrainerDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/login/trainer");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 min-h-screen p-4 flex flex-col">
        <div className="mb-8 p-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            প্রশিক্ষক প্যানেল
          </h2>
        </div>
        
        <nav className="flex-1 space-y-2">
          {[
            { icon: LayoutDashboard, label: "ড্যাশবোর্ড", active: true },
            { icon: Presentation, label: "আমার ব্যাচ" },
            { icon: Users, label: "প্রশিক্ষণার্থী তালিকা" },
            { icon: BookOpen, label: "রিসোর্স ম্যাটেরিয়াল" },
          ].map((item, idx) => (
            <button
              key={idx}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                item.active ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-slate-600 hover:bg-slate-50 hover:text-purple-600"
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
        <header className="mb-8 flex justify-between items-center relative z-40">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">স্বাগতম, প্রশিক্ষক!</h1>
            <p className="text-slate-500">আপনার ক্লাস এবং প্রশিক্ষণার্থীদের আপডেট দেখুন।</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "চলমান ব্যাচ", value: "২" },
            { label: "মোট প্রশিক্ষণার্থী", value: "৮৪" },
            { label: "নতুন রিসোর্স", value: "৫" },
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
                <span className="text-4xl font-bold text-purple-600">{stat.value}</span>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-96 flex items-center justify-center">
          <p className="text-slate-400">মূল কন্টেন্ট এরিয়া (ক্লাস রুটিন / রিসোর্স)</p>
        </div>
      </main>
    </div>
  );
}
