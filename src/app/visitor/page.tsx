"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, ClipboardList, Building2, Settings, LogOut, UserCircle, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VisitorDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(urlTab || "dashboard");

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.replace(`?tab=${tabId}`, { scroll: false });
  };

  const handleLogout = () => {
    router.push("/login");
  };

  const renderDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: "মোট পরিদর্শন", value: "৪৫" },
          { label: "অপেক্ষমান রিপোর্ট", value: "১২" },
          { label: "অনুমোদিত রিপোর্ট", value: "৩৩" },
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
              <span className="text-4xl font-bold text-blue-600">{stat.value}</span>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-96 flex items-center justify-center">
        <p className="text-slate-400">মূল কন্টেন্ট এরিয়া (রিপোর্ট তালিকা / গ্রাফ)</p>
      </div>
    </>
  );

  const renderReports = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-800">পরিদর্শন রিপোর্ট</h2>
        <button className="flex items-center gap-2 text-sm bg-blue-600 text-white px-4 py-2 rounded-full shadow hover:bg-blue-700 transition-colors">
          + নতুন রিপোর্ট
        </button>
      </div>
      <div className="p-8 text-center text-slate-500">
        <ClipboardList className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <p>এখনো কোনো রিপোর্ট জমা দেওয়া হয়নি।</p>
      </div>
    </div>
  );

  const renderMadrasas = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800">বরাদ্দকৃত মাদরাসা তালিকা</h2>
      </div>
      <div className="p-8 text-center text-slate-500">
        <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <p>আপনাকে এখনো কোনো মাদরাসা পরিদর্শনের জন্য বরাদ্দ করা হয়নি।</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 min-h-screen p-4 flex flex-col">
        <div className="mb-8 p-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
            পরিদর্শক প্যানেল
          </h2>
        </div>
        
        <nav className="flex-1 space-y-2">
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "ড্যাশবোর্ড" },
            { id: "reports", icon: ClipboardList, label: "পরিদর্শন রিপোর্ট" },
            { id: "madrasas", icon: Building2, label: "মাদরাসা তালিকা" },
            { id: "settings", icon: Settings, label: "সেটিংস" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
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
        {activeTab === 'dashboard' && (
          <header className="mb-8 flex justify-between items-center relative z-40">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">স্বাগতম, পরিদর্শক!</h1>
              <p className="text-slate-500">আপনার পরিদর্শন কার্যক্রম এখান থেকে পরিচালনা করুন।</p>
            </div>
          </header>
        )}

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'madrasas' && renderMadrasas()}
        {activeTab === 'settings' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-500">সেটিংস প্যানেল শীঘ্রই আসছে...</p>
          </div>
        )}
      </main>
    </div>
  );
}
