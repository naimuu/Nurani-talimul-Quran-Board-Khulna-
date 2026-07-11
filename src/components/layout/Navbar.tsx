"use client";
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard } from "lucide-react";

type UserPayload = {
  id: string;
  email: string;
  name: string;
  role: string;
  isImpersonating?: boolean;
} | null;

export default function Navbar({ user }: { user?: UserPayload }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"user" | "admin">("admin");

  const navItems = [
    { title: "হোম", href: "/" },
    {
      title: "পরিচিতি",
      href: "#",
      subItems: [
        { title: "বোর্ড পরিচিতি", href: "/about/board_introduction" },
        { title: "আমাদের কার্যক্রম", href: "/about/our_activities" },
        { title: "চেয়ারম্যান", href: "/about/chairman" },
        { title: "মহাসচিব", href: "/about/secretary" },
        { title: "পরিদর্শক প্যানেল", href: "/login/visitor" },
      ]
    },
    {
      title: "সদস্যসমূহ",
      href: "#",
      subItems: [
        { title: "মজলিশে আমেলা(কার্যকরী পরিষদ)", href: "/member/amela" },
        { title: "মজলিশে সূরা", href: "/member/shura" },
        { title: "প্রশিক্ষক ও পরিদর্শক", href: "/member/trainer-inspector" },
        { title: "অফিস কর্মকর্তা", href: "/member/office-staff" },
        { title: "কর্মচারীবৃন্দ", href: "/member/employees" },
      ]
    },
    {
      title: "আবেদন ফরম",
      href: "#",
      subItems: [
        { title: "মাদরাসা নিবন্ধন ফরম", href: "/register" },
        { title: "মুয়াল্লিম ভর্তি ফরম", href: "/forms/moallem-admission" },
        { title: "মুয়াল্লিম সনদ আবেদন ফরম", href: "/forms/moallem-certificate" },
        { title: "উত্তরপত্র পুণঃ নিরীক্ষণের আবেদন", href: "/forms/exam-review" },
        { title: "মুয়াল্লিম চাহিদা", href: "/forms/moallem-demand" },
        { title: "খেদমত চাহিদা", href: "/forms/khedmot-demand" },
      ]
    },
    {
      title: "ফলাফল",
      href: "#",
      subItems: [
        { title: "কেন্দ্রীয় সনদ পরীক্ষা", href: "/results?type=student" },
        { title: "মুয়াল্লিম প্রশিক্ষণ পরীক্ষা", href: "/results?type=moallem" },
      ]
    },
    {
      title: "নোটিশ",
      href: "#",
      subItems: [
        { title: "সকল নোটিশ", href: "/notices" },
        { title: "পরীক্ষা সংক্রান্ত", href: "/notices?type=exam_notice" },
      ]
    },
    {
      title: "প্রশিক্ষণ",
      href: "#",
      subItems: [
        { title: "মুয়াল্লিম প্রশিক্ষণ (আরবী)", href: "/training/moallem-arabic" },
        { title: "মুয়াল্লিম প্রশিক্ষণ (বাংলা)", href: "/training/moallem-bangla" },
        { title: "সহীহ কুরআন শিক্ষা কোর্স", href: "/training/quran-course" },
        { title: "ব্যাচভিত্তিক প্রশিক্ষণ কেন্দ্রের তালিকা", href: "/training/batchwise-center-list" },
        { title: "স্থায়ী প্রশিক্ষণ কেন্দ্রসমূহ", href: "/training/permanent-center-list" },
        { title: "প্রশিক্ষণের নিয়মাবলী", href: "/training/rules" },
        { title: "ফরম ডাউনলোড", href: "/training/download-registration" },
      ]
    },
    {
      title: "পরীক্ষা সংক্রান্ত",
      href: "#",
      subItems: [
        { title: "নোটিশ", href: "/notices" },
        { title: "প্রবেশপত্র", href: "/academic/admit-card" },
        { title: "নম্বরপত্র", href: "/academic/mark-sheet" },
      ]
    },
    {
      title: "ফি পরিশোধ",
      href: "#",
      subItems: [
        { title: "বোর্ড ফি", href: "/payment/board_fee" },
        { title: "পরীক্ষার ফি", href: "/payment/exam_fee" },
        { title: "সনদ ফি", href: "/payment/certificate_fee" },
      ]
    },
  ];

  return (
    <header className="bg-primary text-white shadow-md sticky top-0 z-50">
      <div className="w-full px-4 md:px-8 py-3 flex justify-between items-center">
        {/* Logo / Title */}
        <div className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <button 
            className="xl:hidden text-white hover:text-gray-200 p-1 mr-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition">
            <span className="text-white font-bold">খুলনা</span>
            <span>নূরানী বোর্ড</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex gap-6 2xl:gap-8 font-medium items-center">
          {navItems.map((item, idx) => (
            <div key={idx} className="relative group">
              {item.subItems ? (
                <div className="flex items-center gap-1 cursor-pointer hover:text-gray-200 transition-colors py-2">
                  {item.title} <ChevronDown className="w-4 h-4" />
                </div>
              ) : (
                <Link href={item.href} className="hover:text-gray-200 transition-colors py-2 block">
                  {item.title}
                </Link>
              )}
              
              {/* Dropdown Menu */}
              {item.subItems && (
                <div className="absolute top-full left-0 mt-0 w-56 bg-white text-gray-800 shadow-xl rounded-md overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100">
                  <div className="py-2">
                    {item.subItems.map((sub, sIdx) => (
                      <Link 
                        key={sIdx} 
                        href={sub.href}
                        className="block px-4 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors border-b border-gray-50 last:border-0"
                      >
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Action Button & Mobile Toggle */}
        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <div className="relative group">
              <div className="flex items-center justify-center w-10 h-10 cursor-pointer bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full transition-all">
                <User className="w-5 h-5" />
              </div>
              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100 z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.role}</p>
                    </div>
                    {user.role !== 'GENERAL' && (
                      <Link href={`/${user.role.toLowerCase()}`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> ড্যাশবোর্ড
                      </Link>
                    )}
                    {user.isImpersonating && (
                      <button 
                        onClick={async () => {
                          const res = await fetch('/api/admin/revert-impersonate', { method: 'POST' });
                          const data = await res.json();
                          window.location.href = data.redirectUrl || '/admin';
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 font-bold hover:bg-indigo-50 transition-colors text-left"
                      >
                        অ্যাডমিনে ফিরে যান
                      </button>
                    )}
                    <button 
                      onClick={async () => {
                        await fetch('/api/auth/logout', { method: 'POST' });
                        window.location.href = '/';
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" /> লগআউট
                    </button>
                  </div>
                </div>
              </div>
          ) : (
            <div className="hidden xl:flex items-center gap-3">
              <Link 
                href="/login" 
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2 rounded-lg font-semibold transition-all active:scale-95 text-sm"
              >
                লগইন
              </Link>
              <Link 
                href="/signup" 
                className="bg-white hover:bg-gray-100 text-primary px-5 py-2 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md active:scale-95 text-sm"
              >
                সাইন আপ
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation (App Sidebar Style) */}
      {isMobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 z-[60] flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          {/* Sidebar Drawer */}
          <div className="relative w-72 max-w-[85%] bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-left duration-300">
            <div className="sticky top-0 z-10 p-4 flex items-center justify-between border-b border-slate-100 bg-primary">
              <span className="text-xl font-bold text-white">মেনু</span>
              <button 
                className="text-white hover:text-gray-200 p-1 rounded-lg hover:bg-white/10 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {user?.role === 'ADMIN' && (
              <div className="flex bg-slate-100 p-1 m-4 rounded-xl border border-slate-200">
                <button 
                  onClick={() => setMobileTab("admin")}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${mobileTab === 'admin' ? 'bg-white text-primary shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
                >অ্যাডমিন</button>
                <button 
                  onClick={() => setMobileTab("user")}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${mobileTab === 'user' ? 'bg-white text-primary shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
                >ইউজার</button>
              </div>
            )}
            
            <div className="px-4 pb-4 flex flex-col gap-2 flex-1">
              {user?.role === 'ADMIN' && mobileTab === 'admin' ? (
                <div className="flex flex-col gap-2 mt-2">
                  {[
                    { id: "dashboard", icon: LayoutDashboard, label: "ড্যাশবোর্ড" },
                    { id: "users", icon: User, label: "ইউজার পরিচালনা" },
                    { id: "reports", icon: LayoutDashboard, label: "রিপোর্ট" },
                    { id: "settings", icon: LayoutDashboard, label: "সেটিংস" },
                  ].map((item) => (
                    <Link
                      key={item.id}
                      href={`/admin?tab=${item.id}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 py-3 px-2 border-b border-slate-100 text-slate-700 hover:text-primary transition-colors"
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-bold">{item.label}</span>
                    </Link>
                  ))}
                  <button 
                    onClick={async () => {
                      await fetch('/api/auth/logout', { method: 'POST' });
                      window.location.href = '/';
                    }}
                    className="flex items-center gap-3 py-3 px-2 text-red-500 hover:text-red-600 transition-colors mt-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-bold">লগআউট</span>
                  </button>
                </div>
              ) : (
                <>
                  {navItems.map((item, idx) => (
                    <div key={idx} className="flex flex-col">
                      {item.subItems ? (
                        <div className="flex flex-col gap-2 py-2 border-b border-slate-100 last:border-0">
                          <div className="font-bold text-slate-800 px-2">{item.title}</div>
                          <div className="flex flex-col gap-2 pl-4">
                            {item.subItems.map((sub, sIdx) => (
                              <Link 
                                key={sIdx} 
                                href={sub.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-sm text-slate-500 hover:text-primary py-1 px-2"
                              >
                                - {sub.title}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <Link 
                          href={item.href} 
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="font-bold py-3 px-2 border-b border-slate-100 hover:text-primary transition-colors text-slate-800"
                        >
                          {item.title}
                        </Link>
                      )}
                    </div>
                  ))}
                  
                  <div className="flex flex-col gap-3 mt-6 pb-6">
                    {!user && (
                      <>
                        <Link 
                          href="/login" 
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="bg-slate-100 border border-slate-200 text-center hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-xl font-semibold transition-all shadow-sm"
                        >
                          লগইন (Login)
                        </Link>
                        <Link 
                          href="/signup" 
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="bg-white text-center hover:bg-gray-100 text-primary px-5 py-3 rounded-xl font-semibold transition-all shadow-sm"
                        >
                          সাইন আপ (Sign Up)
                        </Link>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
