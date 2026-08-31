"use client";
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight, 
  User, 
  LogOut, 
  LayoutDashboard, 
  ShoppingBag, 
  BookOpen, 
  ClipboardList, 
  MapPin, 
  Building2, 
  Users, 
  FileText, 
  Settings, 
  Search,
  Phone,
  CalendarDays,
  Home,
  Info,
  Layers,
  Award,
  UserCheck,
  GraduationCap,
  ShieldCheck,
  Bell,
  FileCheck,
  FilePlus,
  Download,
  Calendar,
  BookMarked,
  CreditCard,
  LogIn,
  FileSpreadsheet,
  Sparkles,
  Calculator,
  Receipt,
  PhoneCall
} from "lucide-react";
import { TrackOrderModal } from '@/components/shared/TrackOrderModal';

type UserPayload = {
  id: string;
  email: string;
  name: string;
  role: string;
  isImpersonating?: boolean;
} | null;

interface BoardSettings {
  name?: string;
  address?: string;
  logoUrl?: string;
  contacts?: { type: string; value: string }[];
}

interface NestedSubItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SubMenuItem {
  title: string;
  subtitle?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: NestedSubItem[];
}

interface NavItem {
  title: string;
  subtitle?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: SubMenuItem[];
}

function QuranIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M6 6h10" />
      <path d="M6 10h10" />
      <circle cx="11" cy="14" r="1.5" fill="currentColor" fillOpacity="0.2" />
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    </svg>
  );
}

// ─── Islamic Icon Logo Fallback Component ─────────────────────────────────────
function IslamicLogoIcon({ className = "w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11" }: { className?: string }) {
  return (
    <div className={`${className} rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 p-0.5 shadow-md flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
      <div className="w-full h-full bg-[#052e23] rounded-[10px] flex items-center justify-center p-1 relative overflow-hidden">
        {/* Subtle decorative Islamic glow */}
        <div className="absolute inset-0 bg-radial from-amber-400/20 to-transparent pointer-events-none" />
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full text-amber-300" xmlns="http://www.w3.org/2000/svg">
          {/* Mosque Dome and Minaret arch */}
          <path d="M32 6C24 14 20 22 20 30C20 30 18 31 18 33C18 35 20 36 20 36V40H44V36C44 36 46 35 46 33C46 31 44 30 44 30C44 22 40 14 32 6Z" fill="#0d4f3b" stroke="#f59e0b" strokeWidth="1.5" />
          {/* Crescent Finial on Dome Top */}
          <path d="M32 2V6M30 4C30 2.9 30.9 2 32 2C33.1 2 34 2.9 34 4C33 3.5 31 3.5 30 4Z" fill="#fbbf24" stroke="#fbbf24" strokeWidth="0.8" />
          {/* Open Holy Quran with Book Spine */}
          <path d="M32 38L18 32C24 30 30 33 32 38Z" fill="#fde047" stroke="#b45309" strokeWidth="0.8" />
          <path d="M32 38L46 32C40 30 34 33 32 38Z" fill="#fef08a" stroke="#b45309" strokeWidth="0.8" />
          <path d="M32 44L16 36C22 34 28 37 32 43L36 37C40 34 46 34 48 36L32 44Z" fill="#f59e0b" />
          {/* Rehal (Book Stand) */}
          <path d="M22 44L42 56M42 44L22 56" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M18 56H26M38 56H46" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

export default function Navbar({ user }: { user?: UserPayload }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"admin" | "user">("admin");
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [settings, setSettings] = useState<BoardSettings | null>(null);
  
  // Mobile Quick Dropdown Bottom-Sheet state
  const [activeMobileDropdown, setActiveMobileDropdown] = useState<NavItem | null>(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [expandedNestedItem, setExpandedNestedItem] = useState<string | null>(null);

  const openMobileDropdown = (item: NavItem) => {
    setActiveMobileDropdown(item);
    setExpandedNestedItem(null);
    setTimeout(() => {
      setIsDropdownVisible(true);
    }, 10);
  };

  const closeMobileDropdown = () => {
    setIsDropdownVisible(false);
    setTimeout(() => {
      setActiveMobileDropdown(null);
      setExpandedNestedItem(null);
    }, 350);
  };

  // Mobile drawer accordion open states
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<number | null>(null);
  const [expandedMobileSubMenu, setExpandedMobileSubMenu] = useState<number | null>(null);

  useEffect(() => {
    try {
      const dateStr = new Date().toLocaleDateString("bn-BD", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      setCurrentDate(dateStr);
    } catch {
      setCurrentDate("");
    }

    // Fetch Board Settings for dynamic Logo & Address
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setSettings(data);
        }
      })
      .catch(() => {});

    // Listen for realtime settings update events from Admin
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<BoardSettings>).detail;
      if (detail) setSettings((prev) => ({ ...prev, ...detail }));
    };
    window.addEventListener("settingsUpdated", handler);
    return () => window.removeEventListener("settingsUpdated", handler);
  }, []);

  // Lock background scroll when drawer or mobile sheet is open
  useEffect(() => {
    if (isMobileMenuOpen || activeMobileDropdown) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen, activeMobileDropdown]);

  // Ref for mobile horizontally scrollable nav
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  const scrollButtonToCenter = (el: HTMLElement | null) => {
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  // Automatically scroll active button to center on route change
  useEffect(() => {
    if (mobileScrollRef.current) {
      setTimeout(() => {
        const activeEl = mobileScrollRef.current?.querySelector('[data-active="true"]') as HTMLElement;
        if (activeEl) {
          activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }
      }, 150);
    }
  }, [pathname]);

  const toggleMobileMenu = (index: number) => {
    setExpandedMobileMenu(expandedMobileMenu === index ? null : index);
    setExpandedMobileSubMenu(null);
  };

  const toggleMobileSubMenu = (index: number) => {
    setExpandedMobileSubMenu(expandedMobileSubMenu === index ? null : index);
  };

  // Structured menu items with rich icons and concise subtitles
  const navItems: NavItem[] = [
    { title: "হোম", subtitle: "বোর্ডের প্রধান পাতা", href: "/", icon: Home },
    {
      title: "পরিচিতি",
      subtitle: "বোর্ড ও দায়িত্বশীলদের তথ্য",
      href: "#",
      icon: Info,
      subItems: [
        { title: "বোর্ডের পরিচিতি", href: "/about/board_introduction", icon: Building2 },
        { title: "আমাদের কার্যক্রম", href: "/about/our_activities", icon: Layers },
        { title: "চেয়ারম্যানের বাণী", href: "/about/chairman", icon: Award },
        { title: "মহাসচিব এর বাণী", href: "/about/secretary", icon: BookOpen },
        { title: "অফিস কর্মকর্তা কর্মচারী", href: "/member/office-staff", icon: Users },
        { title: "পরিদর্শক প্যানেল", href: "/member/trainer-inspector", icon: UserCheck },
        { title: "প্রশিক্ষকদের পরিচিতি", href: "/member/trainer-inspector", icon: GraduationCap },
        { title: "প্রশিক্ষণ কেন্দ্র সমূহ", href: "/training/batchwise-center-list", icon: MapPin },
        { title: "বোর্ডের কার্যনির্বাহী পরিষদ", href: "/member/amela", icon: ShieldCheck },
      ]
    },
    {
      title: "নোটিশ",
      subtitle: "সকল বিজ্ঞপ্তি ও আদেশ",
      href: "/notices",
      icon: Bell,
      subItems: [
        { title: "যাবতীয় নোটিশ এর তালিকা", href: "/notices", icon: FileText },
        { title: "চলমান নোটিশ", href: "/notices?filter=active", icon: Bell },
      ]
    },
    {
      title: "ইলহাক",
      subtitle: "মাদরাসা নিবন্ধন ও ট্র্যাকিং",
      href: "/register",
      icon: FileCheck,
      subItems: [
        { title: "ইলহাক করার নিয়ম", href: "/forms/ilhaq-rules", icon: FileCheck },
        { title: "ইলহাকের আবেদন ফরম", href: "/register", icon: FilePlus },
        { title: "ইলহাকের ফরম দেখার জন্য ট্রাকিং", href: "/track", icon: Search },
        { title: "ইলহাক ফরম ডাউনলোড ও শেয়ার", href: "/forms/ilhaq-download", icon: Download },
      ]
    },
    {
      title: "পরীক্ষা সংক্রান্ত",
      subtitle: "রুটিন, প্রবেশপত্র ও ফলাফল",
      href: "/academic",
      icon: GraduationCap,
      subItems: [
        { title: "পরীক্ষার নোটিশ", href: "/notices?type=exam_notice", icon: Bell },
        { title: "পরীক্ষার রুটিন", href: "/academic/routine", icon: Calendar },
        { 
          title: "বোর্ড পরীক্ষা", 
          subtitle: "নিবন্ধন, ফি ও রেজাল্ট",
          href: "#",
          icon: Award,
          subItems: [
            { title: "নিবন্ধনের নিয়ম", href: "/academic/registration-rules", icon: BookMarked },
            { title: "পেমেন্টের নিয়ম", href: "/payment/exam_fee", icon: CreditCard },
            { title: "নিবন্ধনের জন্য লগইন", href: "/login", icon: LogIn },
            { title: "নিবন্ধনকৃত পরীক্ষার্থীদের তালিকা", href: "/academic/registered-students", icon: Users },
            { title: "ব্যক্তিগত রেজাল্ট দেখা", href: "/results?type=student", icon: Award },
            { title: "মাদ্রাসার নাম্বার সিট দেখা ডাউনলোড ও প্রিন্ট করা", href: "/academic/mark-sheet", icon: FileSpreadsheet },
            { title: "প্রবেশপত্র প্রিন্ট করা", href: "/academic/admit-card", icon: FileText },
          ]
        },
      ]
    },
    { title: "বই ও স্টেশনারী", subtitle: "অনলাইন প্রকাশনা শপ", href: "/store", icon: ShoppingBag },
    {
      title: "প্রশিক্ষণ",
      subtitle: "মুয়াল্লিম ও কুরআন কোর্স",
      href: "/training/moallem-arabic",
      icon: GraduationCap,
      subItems: [
        { title: "মুয়াল্লিম প্রশিক্ষণ (আরবী)", href: "/training/moallem-arabic", icon: BookOpen },
        { title: "মুয়াল্লিম প্রশিক্ষণ (বাংলা)", href: "/training/moallem-bangla", icon: GraduationCap },
        { title: "সহীহ কুরআন শিক্ষা কোর্স", href: "/training/quran-course", icon: QuranIcon },
        { title: "স্থায়ী প্রশিক্ষণ কেন্দ্রসমূহ", href: "/training/permanent-center-list", icon: Building2 },
        { title: "প্রশিক্ষণের নিয়মাবলী", href: "/training/rules", icon: FileCheck },
        { title: "ফরম ডাউনলোড", href: "/training/download-registration", icon: Download },
      ]
    },
    { title: "অডিট", subtitle: "হিসাব ও নিরীক্ষা", href: "/audit", icon: Calculator },
    { title: "একাউন্টিং", subtitle: "আর্থিক হিসাব-নিকাশ", href: "/accounting", icon: Receipt },
    { title: "যোগাযোগ", subtitle: "হেল্পলাইন ও ঠিকানা", href: "/contact", icon: PhoneCall },
  ];

  // Get hotline number from settings or fallback to original
  const hotline = settings?.contacts?.find(c => c.type === 'PHONE' || c.type === 'HOTLINE' || c.type === 'phone')?.value || "01820-580560";

  return (
    <header className="sticky top-0 z-50 shadow-md font-sans w-full">
      
      {/* ─── 1. TOP PROFESSIONAL BAR ────────────────────────────────────── */}
      <div className="bg-[#052e23] text-emerald-100 text-xs sm:text-sm border-b border-[#0d4f3b] relative z-20">
        <div className="w-full max-w-[1780px] mx-auto px-2.5 sm:px-4 md:px-6 lg:px-8 py-1 sm:py-1.5 flex items-center justify-between gap-1.5 sm:gap-2">
          
          {/* Left: Hotline */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-emerald-200 text-[11px] sm:text-xs md:text-sm flex-1 min-w-0">
            <Phone className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="truncate">
              <span className="hidden xs:inline">হটলাইন: </span>
              <a href={`tel:${hotline.replace(/[^0-9+]/g, '')}`} className="text-amber-300 font-bold hover:underline">{hotline}</a>
            </span>
          </div>

          {/* Center: Bismillah (Responsive Centered Pill) */}
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-shrink-0 px-2 sm:px-3 py-0.5 rounded-full bg-[#0a3f31] border border-[#14664f] shadow-sm max-w-[50vw] sm:max-w-none">
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-extrabold text-amber-300 tracking-wide text-[11px] sm:text-xs md:text-[13.5px] truncate drop-shadow-xs">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </span>
            <span className="hidden md:inline text-emerald-200 text-[11px] font-medium border-l border-[#1b795f] pl-1.5">
              (বিসমিল্লাহির রাহমানির রাহিম)
            </span>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          </div>

          {/* Right: Date & Quick Actions */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 flex-1 text-xs min-w-0">
            {currentDate && (
              <div className="hidden lg:flex items-center gap-1.5 text-emerald-100 bg-[#0a3f31] px-2.5 py-0.5 rounded-full border border-[#14664f] text-[11px]">
                <CalendarDays className="w-3.5 h-3.5 text-amber-300" />
                <span className="font-medium">{currentDate}</span>
              </div>
            )}

            <button 
              onClick={() => setIsTrackModalOpen(true)} 
              className="flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-md shadow-sm transition-all active:scale-95 text-[10px] sm:text-xs flex-shrink-0"
              title="অর্ডার ও ইলহাক ট্র্যাক"
            >
              <Search className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-950 stroke-[2.5]" />
              <span>ট্র্যাক</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. MAIN BRANDING & NAVIGATION BAR ─────────────────────────── */}
      <div className="bg-[#095738] text-white border-b-[3px] border-amber-400 shadow-lg relative">
        <div className="w-full max-w-[1780px] mx-auto px-2.5 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-2.5 flex justify-between items-center gap-2 sm:gap-4">
          
          {/* LEFT: BRANDING (Auto-uploaded Logo + Board Name + Address underneath) */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 xl:flex-initial">
            <button 
              className="xl:hidden text-white hover:text-amber-300 p-1 sm:p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 sm:w-7 sm:h-7" /> : <Menu className="w-6 h-6 sm:w-7 sm:h-7" />}
            </button>
            
            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group hover:opacity-95 transition-opacity min-w-0">
              {/* Dynamic Uploaded Logo or Fallback Islamic Icon Logo */}
              {settings?.logoUrl ? (
                <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl bg-white p-0.5 sm:p-1 shadow-md flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden border border-amber-300">
                  <img 
                    src={settings.logoUrl} 
                    alt="বোর্ড লোগো" 
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <IslamicLogoIcon className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 flex-shrink-0" />
              )}

              {/* Full Board Typography Branding & Address */}
              <div className="flex flex-col min-w-0 justify-center">
                <span className="font-extrabold text-[15px] sm:text-[18px] md:text-[20px] 2xl:text-[22px] tracking-tight leading-tight text-white drop-shadow-xs truncate">
                  {settings?.name || "নূরানী তা'লীমুল কুরআন বোর্ড খুলনা"}
                </span>
                <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 text-[10px] sm:text-[11px] md:text-[12px] font-medium text-emerald-100/90 leading-tight">
                  <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300 flex-shrink-0" />
                  <span className="truncate max-w-[150px] xs:max-w-[220px] sm:max-w-[320px] md:max-w-none">
                    {settings?.address || "মুহাম্মাদনগর, লবণচরা, খুলনা"}
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* CENTER / DESKTOP NAVIGATION MENU (Each Dropdown with Crisp Icons) */}
          <nav className="hidden xl:flex items-center gap-0.5 2xl:gap-1.5 font-bold text-[13px] 2xl:text-[15px] flex-shrink-0">
            {navItems.map((item, idx) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              
              return (
                <div key={idx} className="relative group">
                  {item.subItems ? (
                    <div className={`flex items-center gap-1 cursor-pointer px-2 2xl:px-3 py-1.5 2xl:py-2 rounded-lg transition-all duration-200 select-none whitespace-nowrap ${
                      isActive 
                        ? 'bg-black/20 text-amber-300 font-extrabold' 
                        : 'text-white hover:text-amber-200 hover:bg-white/10'
                    }`}>
                      <span>{item.title}</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-75 group-hover:rotate-180 transition-transform duration-200" />
                    </div>
                  ) : (
                    <Link 
                      href={item.href} 
                      className={`px-2 2xl:px-3 py-1.5 2xl:py-2 rounded-lg transition-all duration-200 block whitespace-nowrap ${
                        isActive 
                          ? 'bg-black/20 text-amber-300 font-extrabold' 
                          : 'text-white hover:text-amber-200 hover:bg-white/10'
                      }`}
                    >
                      {item.title}
                    </Link>
                  )}
                  
                  {/* Desktop Dropdown Menu with Glassmorphism & Icons */}
                  {item.subItems && (
                    <div className="absolute top-full left-0 pt-1.5 w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top group-hover:scale-100 scale-95">
                      <div className="bg-white/85 text-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-white/80 p-2 backdrop-blur-2xl">
                        {item.subItems.map((sub, sIdx) => {
                          const SubIcon = sub.icon;
                          
                          return (
                            <div key={sIdx} className="relative group/sub">
                              {sub.subItems ? (
                                <>
                                  <div className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[14px] font-bold text-slate-700 hover:bg-emerald-50/80 hover:text-[#095738] transition-colors cursor-pointer">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-7 h-7 rounded-lg bg-emerald-100/80 text-[#095738] flex items-center justify-center flex-shrink-0">
                                        <SubIcon className="w-4 h-4" />
                                      </div>
                                      <span>{sub.title}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-emerald-600 group-hover/sub:translate-x-1 transition-transform" />
                                  </div>
                                  
                                  {/* Level 2 Nested Flyout Submenu with Glassmorphism */}
                                  <div className="absolute left-full top-0 pl-1.5 w-76 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 z-50">
                                    <div className="bg-white/90 text-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/80 p-2 backdrop-blur-2xl">
                                      <div className="px-3 py-2 mb-1 text-xs font-black text-emerald-900 bg-emerald-50/80 rounded-xl border border-emerald-100/80 flex items-center gap-2">
                                        <Award className="w-4 h-4 text-amber-500" />
                                        <span>{sub.title}</span>
                                      </div>
                                      {sub.subItems.map((nested, nIdx) => {
                                        const NestedIcon = nested.icon;
                                        return (
                                          <Link
                                            key={nIdx}
                                            href={nested.href}
                                            className="flex items-center gap-2.5 px-3 py-2 text-[13.5px] font-medium text-slate-700 hover:bg-emerald-50 hover:text-[#095738] rounded-xl transition-colors"
                                          >
                                            <NestedIcon className="w-4 h-4 text-slate-400 group-hover:text-[#095738]" />
                                            <span>{nested.title}</span>
                                          </Link>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <Link 
                                  href={sub.href}
                                  className="flex items-center gap-2.5 px-3 py-2.5 text-[14px] font-medium text-slate-700 hover:bg-emerald-50 hover:text-[#095738] rounded-xl transition-colors"
                                >
                                  <div className="w-7 h-7 rounded-lg bg-emerald-100/70 text-[#095738] flex items-center justify-center flex-shrink-0">
                                    <SubIcon className="w-4 h-4" />
                                  </div>
                                  <span>{sub.title}</span>
                                </Link>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* RIGHT: USER PROFILE / LOGIN ACTIONS */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {user ? (
              <div className="relative group">
                <div className="flex items-center gap-1.5 cursor-pointer bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full p-1 sm:px-2.5 sm:py-1 transition-all">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-amber-400 text-slate-900 rounded-full flex items-center justify-center font-bold text-xs shadow-xs">
                    {user.name ? user.name.charAt(0) : <User className="w-3.5 h-3.5" />}
                  </div>
                  <span className="hidden md:inline text-xs sm:text-sm font-semibold max-w-[100px] xl:max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className="w-3 h-3 hidden md:inline opacity-70" />
                </div>

                {/* User Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-slate-100 z-50 p-1.5">
                  <div className="px-3.5 py-2.5 border-b border-slate-100 mb-1">
                    <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                    <p className="text-xs text-emerald-700 font-bold uppercase truncate">{user.role}</p>
                  </div>
                  
                  {user.role !== 'GENERAL' && (
                    <Link 
                      href={`/${user.role.toLowerCase()}`} 
                      className="flex items-center gap-2.5 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#095738] rounded-lg transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-600" /> ড্যাশবোর্ড
                    </Link>
                  )}
                  
                  {user.isImpersonating && (
                    <button 
                      onClick={async () => {
                        const res = await fetch('/api/admin/revert-impersonate', { method: 'POST' });
                        const data = await res.json();
                        window.location.href = data.redirectUrl || '/admin';
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-left"
                    >
                      অ্যাডমিনে ফিরে যান
                    </button>
                  )}
                  
                  <button 
                    onClick={async () => {
                      await fetch('/api/auth/logout', { method: 'POST' });
                      window.location.href = '/';
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" /> লগআউট
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link 
                  href="/login" 
                  className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg font-bold transition-all text-xs sm:text-sm"
                >
                  লগইন
                </Link>
                <Link 
                  href="/signup" 
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg font-black transition-all shadow-md active:scale-95 text-xs sm:text-sm hidden xs:inline-block"
                >
                  সাইন আপ
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── 3. MOBILE SCROLLABLE BUTTON BAR (Auto Centers On Click) ─────── */}
      <div className="xl:hidden bg-[#063f29] border-b border-[#0d563a] shadow-inner py-1.5 px-2">
        <div ref={mobileScrollRef} className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth px-1">
          {navItems.map((item, idx) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const ItemIcon = item.icon;
            
            if (item.subItems) {
              return (
                <button
                  key={idx}
                  data-active={isActive}
                  onClick={(e) => {
                    scrollButtonToCenter(e.currentTarget);
                    openMobileDropdown(item);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 active:scale-95 shadow-xs ${
                    activeMobileDropdown?.title === item.title || isActive 
                      ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold' 
                      : 'bg-white/10 text-emerald-100 hover:bg-white/20 hover:text-white border border-white/15'
                  }`}
                >
                  <ItemIcon className="w-3.5 h-3.5 opacity-90" />
                  <span>{item.title}</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>
              );
            }

            return (
              <Link
                key={idx}
                href={item.href}
                data-active={isActive}
                onClick={(e) => {
                  scrollButtonToCenter(e.currentTarget);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 active:scale-95 shadow-xs ${
                  isActive 
                    ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold' 
                    : 'bg-white/10 text-emerald-100 hover:bg-white/20 hover:text-white border border-white/15'
                }`}
              >
                <ItemIcon className="w-3.5 h-3.5 opacity-90" />
                <span>{item.title}</span>
              </Link>
            );
          })}
          
          {/* Quick Track Pill */}
          <button
            onClick={(e) => {
              scrollButtonToCenter(e.currentTarget);
              setIsTrackModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black whitespace-nowrap bg-amber-400 text-slate-950 shadow-sm flex-shrink-0 active:scale-95"
          >
            <Search className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>অর্ডার ট্র্যাক</span>
          </button>
        </div>
      </div>

      {/* ─── 4. SMART TOUCH-FRIENDLY MOBILE DROPDOWN BOTTOM-SHEET MODAL (Smooth Open & Collapse) ─── */}
      <div 
        className={`xl:hidden fixed inset-0 z-[70] flex flex-col justify-end transition-all duration-300 ${
          activeMobileDropdown ? "visible pointer-events-auto" : "invisible pointer-events-none"
        }`}
      >
        {/* Backdrop with rich blur and smooth fade */}
        <div 
          className={`fixed inset-0 bg-slate-950/50 backdrop-blur-md transition-opacity duration-350 ease-out ${
            isDropdownVisible ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMobileDropdown}
        />

        {/* Bottom Sheet Card - Glassmorphic Full 80% Height with Smooth Slide Up & Collapse */}
        <div 
          className={`relative bg-white/80 backdrop-blur-2xl rounded-t-3xl shadow-[0_-15px_50px_rgba(0,0,0,0.25)] h-[80vh] max-h-[80vh] overflow-hidden flex flex-col z-10 border-t-2 border-emerald-400/80 transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isDropdownVisible ? "translate-y-0" : "translate-y-full"
          }`}
        >
          {activeMobileDropdown && (
            <>
              {/* Sheet Handle & Header */}
              <div className="p-4 bg-gradient-to-r from-[#052e23]/95 via-[#074734]/95 to-[#095738]/95 backdrop-blur-md text-white flex items-center justify-between border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-sm">
                    {(() => {
                      const Icon = activeMobileDropdown.icon;
                      return <Icon className="w-4 h-4" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base leading-tight">{activeMobileDropdown.title} মেনু</h3>
                    <p className="text-[11px] text-emerald-200">অপশন নির্বাচন করুন</p>
                  </div>
                </div>

                <button 
                  onClick={closeMobileDropdown}
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* List with Glassmorphism and 50px+ Touch Targets - Smoothly Scrollable with Momentum Touch */}
              <div 
                className="p-3.5 drawer-scroll flex-1 min-h-0 flex flex-col gap-2 pb-28 touch-pan-y"
                style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
              >
                {activeMobileDropdown.subItems?.map((sub, sIdx) => {
                  const SubIcon = sub.icon;
                  const isExpanded = expandedNestedItem === sub.title;

                  if (sub.subItems) {
                    return (
                      <div 
                        key={sIdx} 
                        className={`rounded-2xl border transition-all duration-300 overflow-hidden shadow-xs touch-pan-y ${
                          isExpanded ? 'border-emerald-500/80 bg-white/95 shadow-md ring-2 ring-emerald-500/15' : 'border-white/90 bg-white/70 hover:bg-white/90'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setExpandedNestedItem(prev => (prev === sub.title ? null : sub.title));
                          }}
                          className={`w-full flex items-center justify-between p-3.5 min-h-[52px] text-left transition-all touch-pan-y active:scale-[0.99] ${
                            isExpanded ? 'bg-emerald-50/90 text-emerald-950' : 'hover:bg-white/80 active:bg-emerald-50/60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs transition-colors ${
                              isExpanded ? 'bg-[#095738] text-white shadow-sm' : 'bg-amber-100/90 text-amber-900'
                            }`}>
                              <SubIcon className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-[15px] text-slate-800">{sub.title}</span>
                              <span className="text-[11.5px] text-emerald-700 font-semibold">{sub.subtitle || "নিবন্ধন ও বিস্তারিত"}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">{isExpanded ? 'লুকান' : 'দেখুন'}</span>
                            <ChevronDown className={`w-5 h-5 text-emerald-700 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-emerald-900' : ''}`} />
                          </div>
                        </button>

                        {/* Smooth Animated Nested sub-items */}
                        {isExpanded && (
                          <div className="px-2.5 pb-2.5 flex flex-col gap-1.5 border-t border-emerald-100/80 pt-2 bg-emerald-50/30 backdrop-blur-md touch-pan-y animate-in fade-in slide-in-from-top-2 duration-200">
                            {sub.subItems.map((nested, nIdx) => {
                              const NestedIcon = nested.icon;
                              return (
                                <Link
                                  key={nIdx}
                                  href={nested.href}
                                  onClick={closeMobileDropdown}
                                  className="flex items-center justify-between px-3 py-2.5 min-h-[48px] rounded-xl bg-white hover:bg-emerald-50 active:bg-emerald-100/80 transition-all border border-slate-100/80 shadow-2xs touch-pan-y"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-[#095738] flex items-center justify-center flex-shrink-0">
                                      <NestedIcon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[14px] font-semibold text-slate-800">{nested.title}</span>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-slate-400" />
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={sIdx}
                      href={sub.href}
                      onClick={closeMobileDropdown}
                      className="flex items-center justify-between p-3 min-h-[50px] rounded-2xl border border-white/90 bg-white/70 hover:bg-white/95 backdrop-blur-md active:bg-emerald-50/90 transition-all shadow-xs touch-pan-y"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-[#095738] flex items-center justify-center flex-shrink-0 shadow-xs">
                          <SubIcon className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-[14.5px] text-slate-800">{sub.title}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── 5. FULL MOBILE SIDEBAR DRAWER (Luxury Islamic Frosted Glass) ─── */}
      <div className={`xl:hidden fixed inset-0 z-[60] flex transition-all duration-300 ${isMobileMenuOpen ? "visible" : "invisible pointer-events-none"}`}>
        {/* Backdrop with rich blur */}
        <div 
          className={`fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}`} 
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Sidebar Drawer Container - Luxury Deep Emerald Surface */}
        <div className={`relative w-[85vw] max-w-[340px] bg-gradient-to-b from-[#021d15] via-[#052e23] to-[#01140e] text-white h-full shadow-[25px_0_60px_rgba(0,0,0,0.6)] border-r border-emerald-500/30 flex flex-col overflow-hidden transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          {/* Subtle Islamic Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/3 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Drawer Header with Dynamic Branding */}
          <div className="sticky top-0 z-10 px-4 sm:px-5 py-4 flex items-center justify-between border-b border-white/10 bg-[#021d15]/90 backdrop-blur-xl flex-shrink-0 shadow-md">
            <div className="flex items-center gap-3 min-w-0">
              {settings?.logoUrl ? (
                <div className="w-10 h-10 rounded-2xl bg-white p-0.5 flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-amber-400/60">
                  <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="ring-2 ring-amber-400/60 rounded-xl">
                  <IslamicLogoIcon className="w-9 h-9 flex-shrink-0" />
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="font-black text-sm sm:text-base leading-tight truncate text-amber-300">{settings?.name || "নূরানী বোর্ড খুলনা"}</span>
                <span className="text-[10.5px] text-emerald-200/90 truncate">{settings?.address || "মুহাম্মাদনগর, লবণচরা, খুলনা"}</span>
              </div>
            </div>
            <button 
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-95 flex-shrink-0 border border-white/15"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {user?.role === 'ADMIN' && (
            <div className="flex bg-white/10 backdrop-blur-md p-1 m-3 rounded-2xl border border-white/15 shadow-inner flex-shrink-0">
              <button 
                onClick={() => setMobileTab("admin")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${mobileTab === 'admin' ? 'bg-amber-400 text-slate-950 shadow-md font-black' : 'text-emerald-200 hover:text-white'}`}
              >
                অ্যাডমিন প্যানেল
              </button>
              <button 
                onClick={() => setMobileTab("user")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${mobileTab === 'user' ? 'bg-amber-400 text-slate-950 shadow-md font-black' : 'text-emerald-200 hover:text-white'}`}
              >
                ওয়েবসাইট মেনু
              </button>
            </div>
          )}
          
          {/* Scrollable Menu Items Container */}
          <div 
            className="px-3.5 py-3 flex flex-col gap-2.5 flex-1 min-h-0 drawer-scroll pb-28 touch-pan-y"
            style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
          >
            {user?.role === 'ADMIN' && mobileTab === 'admin' ? (
              <div className="flex flex-col gap-1.5 mt-1">
                {[
                  { id: "dashboard", icon: LayoutDashboard, label: "ড্যাশবোর্ড" },
                  { id: "store", icon: ShoppingBag, label: "স্টোর পরিচালনা" },
                  { id: "curriculum", icon: BookOpen, label: "কারিকুলাম" },
                  { id: "applications", icon: ClipboardList, label: "আবেদন" },
                  { id: "locations", icon: MapPin, label: "লোকেশন পরিচালনা" },
                  { id: "madrasas", icon: Building2, label: "মাদরাসা পরিচালনা" },
                  { id: "users", icon: Users, label: "ইউজার পরিচালনা" },
                  { id: "reports", icon: FileText, label: "রিপোর্ট" },
                  { id: "settings", icon: Settings, label: "সেটিংস" },
                ].map((item) => (
                  <Link
                    key={item.id}
                    href={`/admin?tab=${item.id}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-2xl bg-white/[0.08] hover:bg-emerald-500/20 border border-white/10 text-emerald-100 font-bold text-sm transition-all shadow-xs"
                  >
                    <item.icon className="w-4 h-4 text-amber-300" />
                    <span>{item.label}</span>
                  </Link>
                ))}
                <button 
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.href = '/';
                  }}
                  className="flex items-center gap-3 py-2.5 px-3 bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 rounded-2xl transition-colors mt-3 text-sm font-bold shadow-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>লগআউট</span>
                </button>
              </div>
            ) : (
              <>
                {navItems.map((item, idx) => {
                  const ItemIcon = item.icon;
                  const isExpanded = expandedMobileMenu === idx;
                  const palette = [
                    { iconBg: "bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 shadow-[0_0_12px_rgba(52,211,153,0.35)]" },
                    { iconBg: "bg-gradient-to-br from-teal-400 to-teal-600 text-slate-950 shadow-[0_0_12px_rgba(45,212,191,0.35)]" },
                    { iconBg: "bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.35)]" },
                    { iconBg: "bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-[0_0_12px_rgba(96,165,250,0.35)]" },
                    { iconBg: "bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-[0_0_12px_rgba(192,132,252,0.35)]" },
                    { iconBg: "bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-[0_0_12px_rgba(251,113,133,0.35)]" },
                    { iconBg: "bg-gradient-to-br from-amber-400 via-amber-300 to-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.35)]" },
                    { iconBg: "bg-gradient-to-br from-cyan-400 to-cyan-600 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.35)]" },
                    { iconBg: "bg-gradient-to-br from-emerald-300 to-teal-500 text-slate-950 shadow-[0_0_12px_rgba(110,231,183,0.35)]" },
                    { iconBg: "bg-gradient-to-br from-green-400 to-emerald-600 text-slate-950 shadow-[0_0_12px_rgba(74,222,128,0.35)]" },
                  ][idx % 10];

                  return (
                    <div 
                      key={idx} 
                      className={`shrink-0 rounded-2xl border transition-all duration-300 overflow-hidden touch-pan-y ${
                        isExpanded 
                          ? 'border-amber-400/70 bg-gradient-to-br from-white/[0.14] to-emerald-950/90 ring-1 ring-amber-400/30 shadow-[0_8px_30px_rgba(0,0,0,0.5)]' 
                          : 'border-white/[0.1] bg-white/[0.06] hover:bg-white/[0.1] hover:border-white/[0.2] shadow-sm'
                      }`}
                    >
                      {item.subItems ? (
                        <div>
                          <button
                            type="button"
                            onClick={() => toggleMobileMenu(idx)}
                            className={`w-full flex items-center justify-between p-3 min-h-[54px] text-left font-bold transition-all touch-pan-y active:scale-[0.99] ${
                              isExpanded ? 'bg-white/[0.08] text-white' : 'text-slate-100 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-extrabold ${palette.iconBg}`}>
                                <ItemIcon className="w-4.5 h-4.5 stroke-[2.4]" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[15px] font-black truncate leading-tight tracking-wide">{item.title}</span>
                                <span className="text-[11px] text-emerald-200/60 font-medium tracking-normal truncate">{item.subtitle || "সকল তথ্য"}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <ChevronDown className={`w-4 h-4 text-amber-300 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-amber-400 font-bold' : 'text-emerald-300/70'}`} />
                            </div>
                          </button>
                          
                          {isExpanded && (
                            <div className="px-2.5 pb-2.5 flex flex-col gap-1.5 border-t border-white/10 pt-2 bg-black/25 backdrop-blur-md touch-pan-y animate-in fade-in slide-in-from-top-2 duration-200">
                              {item.subItems.map((sub, sIdx) => {
                                const SubIcon = sub.icon;
                                const isSubExpanded = expandedMobileSubMenu === sIdx;
                                return (
                                  <div key={sIdx} className="touch-pan-y">
                                    {sub.subItems ? (
                                      <div className="rounded-xl border border-emerald-500/40 overflow-hidden bg-white/[0.06] shadow-xs mb-1">
                                        <button
                                          type="button"
                                          onClick={() => toggleMobileSubMenu(sIdx)}
                                          className={`w-full flex items-center justify-between py-2.5 px-3 min-h-[44px] text-xs font-bold transition-colors ${
                                            isSubExpanded ? 'bg-amber-400 text-slate-950 font-black shadow-sm' : 'text-emerald-200 hover:bg-white/[0.08]'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            <SubIcon className="w-3.5 h-3.5" />
                                            <span>{sub.title}</span>
                                          </div>
                                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isSubExpanded ? 'rotate-180' : ''}`} />
                                        </button>
                                        
                                        {isSubExpanded && (
                                          <div className="px-2 py-1.5 flex flex-col gap-1 border-t border-white/10 bg-black/40 animate-in fade-in slide-in-from-top-1 duration-150">
                                            {sub.subItems.map((nested, nIdx) => {
                                              const NestedIcon = nested.icon;
                                              return (
                                                <Link
                                                  key={nIdx}
                                                  href={nested.href}
                                                  onClick={() => setIsMobileMenuOpen(false)}
                                                  className="flex items-center justify-between text-xs text-emerald-100 hover:text-amber-300 py-2 px-2.5 min-h-[40px] font-medium rounded-lg hover:bg-white/[0.08] transition-colors touch-pan-y"
                                                >
                                                  <div className="flex items-center gap-2">
                                                    <NestedIcon className="w-3.5 h-3.5 text-amber-300" />
                                                    <span>{nested.title}</span>
                                                  </div>
                                                  <ChevronRight className="w-3 h-3 text-emerald-400/50" />
                                                </Link>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <Link 
                                        href={sub.href} 
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center justify-between text-xs sm:text-[13px] text-emerald-100 hover:text-white bg-white/[0.06] hover:bg-emerald-500/20 active:bg-emerald-500/30 py-2.5 px-3 min-h-[44px] rounded-xl font-bold transition-all border border-white/[0.08] shadow-2xs touch-pan-y"
                                      >
                                        <div className="flex items-center gap-2.5">
                                          <div className="w-6 h-6 rounded-lg bg-emerald-500/30 text-emerald-200 flex items-center justify-center flex-shrink-0 border border-emerald-400/30">
                                            <SubIcon className="w-3.5 h-3.5" />
                                          </div>
                                          <span>{sub.title}</span>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 text-emerald-400/60" />
                                      </Link>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link 
                          href={item.href} 
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 font-bold p-3 min-h-[54px] text-slate-100 hover:text-white hover:bg-white/[0.08] transition-colors text-[15px] touch-pan-y active:scale-[0.99]"
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-extrabold ${palette.iconBg}`}>
                            <ItemIcon className="w-4.5 h-4.5 stroke-[2.4]" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-black tracking-wide leading-tight">{item.title}</span>
                            {item.subtitle && <span className="text-[11px] text-emerald-200/60 font-medium tracking-normal truncate">{item.subtitle}</span>}
                          </div>
                        </Link>
                      )}
                    </div>
                  );
                })}
                
                {/* Mobile Track and Auth Buttons */}
                <div className="mt-3 pt-3.5 border-t border-white/15 flex flex-col gap-2.5 shrink-0">
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsTrackModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all active:scale-95 border border-amber-200/90"
                  >
                    <Search className="w-4.5 h-4.5 text-slate-950 stroke-[3]" />
                    <span>অর্ডার ও ইলহাক ট্র্যাক করুন</span>
                  </button>

                  {!user && (
                    <div className="grid grid-cols-2 gap-2 mt-0.5 shrink-0">
                      <Link 
                        href="/login" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="bg-white/10 hover:bg-white/20 border border-white/20 text-center text-white py-2.5 rounded-xl font-extrabold transition-all text-xs sm:text-sm active:scale-95 shadow-xs"
                      >
                        লগইন
                      </Link>
                      <Link 
                        href="/signup" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="bg-gradient-to-r from-emerald-500 to-[#095738] hover:from-emerald-400 hover:to-emerald-600 text-center text-white py-2.5 rounded-xl font-extrabold transition-all shadow-md text-xs sm:text-sm active:scale-95 border border-emerald-400/40"
                      >
                        সাইন আপ
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <TrackOrderModal isOpen={isTrackModalOpen} onClose={() => setIsTrackModalOpen(false)} />
    </header>
  );
}
