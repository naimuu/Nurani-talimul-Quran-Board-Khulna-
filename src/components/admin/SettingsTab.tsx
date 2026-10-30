"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit2, Save, X, Image as ImageIcon, Briefcase, Users, Phone, Building2, Upload, Link as LinkIcon, Globe, RefreshCw, ExternalLink, Layers, Sidebar as SidebarIcon, CreditCard, Truck, QrCode, ArrowUp, ArrowDown, CheckCircle, Eye, EyeOff } from "lucide-react";
import SliderMediaSidebar from "@/components/admin/SliderMediaSidebar";
import toast from "react-hot-toast";
import { PaymentMethodsManager, DeliveryOptionsManager } from "@/components/admin/PaymentAndDeliverySettings";

interface ContactInfo {
  id?: string;
  type: string;
  value: string;
}

interface PaymentMethod {
  id?: string;
  type: string; // 'mobile' | 'bank'
  provider: string; // e.g. bKash, Nagad, Rocket, Islami Bank
  name?: string; // Display name
  logo?: string;
  accountName?: string;
  accountNumber: string;
  accountType?: string; // পার্সোনাল / মার্চেন্ট / এজেন্ট
  branch?: string;
  routingNo?: string;
  qrCodeImage?: string;
  instructions?: string;
  sortOrder?: number;
  isActive?: boolean;
}

interface DeliveryOption {
  id?: string;
  name: string;
  type: string;
  charge: number;
  requiresName: boolean;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface HeroSlide {
  id: string;
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
}

interface BoardSettings {
  id?: string;
  name?: string;
  address?: string;
  logoUrl?: string;
  coverUrl?: string;
  showCoverAboveNavbar?: boolean;
  showCoverInPageHeader?: boolean;
  scrollingNotice?: string;
  showScrollingNotice?: boolean;
  heroSlides?: HeroSlide[];
  zimadarCommissionPercent?: number;
  zimadarMinMadrasas?: number;
  zimadarMinOrderAmount?: number;
  zimadarCommissionEnabled?: boolean;
  contacts: ContactInfo[];
  payments: PaymentMethod[];
}

interface Position {
  id: string;
  name: string;
  order: number;
}

interface BoardMember {
  id: string;
  name: string;
  positionId: string;
  photoUrl?: string;
  phone?: string;
  type: string;
  position?: Position;
}

export default function SettingsTab() {
  const [activeTab, setActiveTab] = useState("general");
  
  // Data States
  const [settings, setSettings] = useState<BoardSettings | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleTabClick = (tabId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    setActiveTab(tabId);
    const container = scrollContainerRef.current;
    const button = e.currentTarget;
    if (container && button) {
      const scrollLeft = button.offsetLeft - (container.offsetWidth / 2) + (button.offsetWidth / 2);
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [settingsRes, posRes, memRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/positions'),
        fetch('/api/members')
      ]);
      
      const settingsData = await settingsRes.json();
      setSettings(settingsData);
      setPositions(await posRes.json());
      setMembers(await memRes.json());
    } catch (error) {
      toast.error("ডাটা লোড করতে ব্যর্থ হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "general", label: "সাধারণ তথ্য", icon: Building2 },
    { id: "contacts", label: "যোগাযোগের তথ্য", icon: Phone },
    { id: "payments", label: "পেমেন্ট মাধ্যম", icon: CreditCard },
    { id: "delivery", label: "ডেলিভারি ও চার্জ", icon: Truck },
    { id: "positions", label: "পদবী", icon: Briefcase },
    { id: "members", label: "সদস্য ও স্টাফ", icon: Users },
  ];

  if (isLoading) {
    return <div className="flex justify-center items-center py-20 text-slate-500">লোড হচ্ছে...</div>;
  }

  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">বোর্ড তথ্য সেটআপ</h2>
        <p className="text-slate-500 text-sm mt-1">বোর্ডের অফিসিয়াল বিবরণ, পদবী এবং স্টাফ পরিচালনা করুন।</p>
      </div>

      {/* Tabs */}
      <div 
        ref={scrollContainerRef}
        className="flex space-x-1 bg-white border border-slate-200 p-1 rounded-xl mb-8 overflow-x-auto shadow-sm scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={(e) => handleTabClick(tab.id, e)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                isActive 
                  ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content Areas */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[500px]">
        {activeTab === "general" && <GeneralTab settings={settings} onSave={fetchData} />}
        {activeTab === "contacts" && <ContactsTab settings={settings} onSave={fetchData} />}
        {activeTab === "payments" && <PaymentMethodsManager initialPayments={settings?.payments} onSaved={fetchData} />}
        {activeTab === "delivery" && <DeliveryOptionsManager onSaved={fetchData} />}
        {activeTab === "positions" && <PositionsTab positions={positions} onSave={fetchData} />}
        {activeTab === "members" && <MembersTab members={members} positions={positions} onSave={fetchData} />}
      </div>
    </div>
  );
}

// ==============================
// 1. General Tab Component
// ==============================
const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: "slide-default-1",
    imageUrl: "/images/hero/slide1.jpg",
    title: "নূরানী বোর্ড খুলনায় স্বাগতম",
    subtitle: "আধুনিক পদ্ধতির সাথে বিশুদ্ধ কোরআনি শিক্ষায় নতুন প্রজন্মকে ক্ষমতায়ন করা।",
    description: "আধুনিক পদ্ধতির সাথে বিশুদ্ধ কোরআনি শিক্ষায় নতুন প্রজন্মকে ক্ষমতায়ন করা।",
    buttonText: "আরও জানুন",
    buttonLink: "/about"
  },
  {
    id: "slide-default-2",
    imageUrl: "/images/hero/slide2.jpg",
    title: "আপনার মাদরাসা এখনই নিবন্ধন করুন",
    subtitle: "আজই আমাদের মাদরাসার বিশাল নেটওয়ার্কে যুক্ত হোন এবং জ্ঞান অর্জনে নিবেদিত একটি ক্রমবর্ধমান সম্প্রদায়ের অংশ হন।",
    description: "আজই আমাদের মাদরাসার বিশাল নেটওয়ার্কে যুক্ত হোন এবং জ্ঞান অর্জনে নিবেদিত একটি ক্রমবর্ধমান সম্প্রদায়ের অংশ হন।",
    buttonText: "মাদরাসা নিবন্ধন করুন",
    buttonLink: "/register"
  },
  {
    id: "slide-default-3",
    imageUrl: "/images/hero/slide3.jpg",
    title: "সহজ ও দ্রুত প্রকাশনা ও প্রশ্নপত্র সেবা",
    subtitle: "অনলাইনে বই ও প্রশ্নপত্র সেটের অর্ডার দিন এবং দ্রুত ডেলিভারি গ্রহণ করুন।",
    description: "অনলাইনে বই ও প্রশ্নপত্র সেটের অর্ডার দিন এবং দ্রুত ডেলিভারি গ্রহণ করুন।",
    buttonText: "প্রশ্নপত্র অর্ডার করুন",
    buttonLink: "/academic/question-order"
  }
];

function cleanEmojis(str?: string): string {
  if (!str) return "";
  return str
    .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]|[\uFE00-\uFE0F]/g, "")
    .trim();
}

function sanitizeHeroSlides(slides?: HeroSlide[]): HeroSlide[] {
  if (!Array.isArray(slides)) return [];
  return slides.map((s) => ({
    ...s,
    title: cleanEmojis(s.title),
    subtitle: cleanEmojis(s.subtitle),
    description: cleanEmojis(s.description),
  }));
}

function GeneralTab({ settings, onSave }: { settings: BoardSettings | null; onSave: () => void }) {
  const [formData, setFormData] = useState({
    name: settings?.name || "",
    address: settings?.address || "",
    logoUrl: settings?.logoUrl || "",
    coverUrl: settings?.coverUrl || "",
    showCoverAboveNavbar: settings?.showCoverAboveNavbar ?? false,
    showCoverInPageHeader: settings?.showCoverInPageHeader ?? false,
    heroSlides: (settings?.heroSlides || []) as HeroSlide[],
    zimadarCommissionPercent: settings?.zimadarCommissionPercent ?? 15,
    zimadarMinMadrasas: settings?.zimadarMinMadrasas ?? 5,
    zimadarMinOrderAmount: settings?.zimadarMinOrderAmount ?? 5000,
    zimadarCommissionEnabled: settings?.zimadarCommissionEnabled ?? true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [uploadingSlide, setUploadingSlide] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlSlideForm, setUrlSlideForm] = useState({
    imageUrl: "",
    title: "",
    description: "",
    buttonText: "",
    buttonLink: ""
  });
  
  const slideFileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  // Load draft on mount
  useEffect(() => {
    const saved = localStorage.getItem('boardSettingsGeneralDraft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) {
          const slides = Array.isArray(parsed.heroSlides) && parsed.heroSlides.length > 0
            ? sanitizeHeroSlides(parsed.heroSlides)
            : (settings?.heroSlides && settings.heroSlides.length > 0 ? sanitizeHeroSlides(settings.heroSlides) : DEFAULT_HERO_SLIDES);
          setFormData({
            ...parsed,
            name: cleanEmojis(parsed.name),
            heroSlides: slides,
            zimadarCommissionPercent: parsed.zimadarCommissionPercent ?? settings?.zimadarCommissionPercent ?? 15,
            zimadarMinMadrasas: parsed.zimadarMinMadrasas ?? settings?.zimadarMinMadrasas ?? 5,
            zimadarMinOrderAmount: parsed.zimadarMinOrderAmount ?? settings?.zimadarMinOrderAmount ?? 5000,
            zimadarCommissionEnabled: parsed.zimadarCommissionEnabled ?? settings?.zimadarCommissionEnabled ?? true,
          });
        }
      } catch (e) {}
    } else if (settings) {
      const slides = Array.isArray(settings.heroSlides) && settings.heroSlides.length > 0
        ? sanitizeHeroSlides(settings.heroSlides)
        : DEFAULT_HERO_SLIDES;
      setFormData({
        name: cleanEmojis(settings.name || ""),
        address: settings.address || "",
        logoUrl: settings.logoUrl || "",
        coverUrl: settings.coverUrl || "",
        showCoverAboveNavbar: settings.showCoverAboveNavbar ?? false,
        showCoverInPageHeader: settings.showCoverInPageHeader ?? false,
        heroSlides: slides,
        zimadarCommissionPercent: settings.zimadarCommissionPercent ?? 15,
        zimadarMinMadrasas: settings.zimadarMinMadrasas ?? 5,
        zimadarMinOrderAmount: settings.zimadarMinOrderAmount ?? 5000,
        zimadarCommissionEnabled: settings.zimadarCommissionEnabled ?? true,
      });
    }
  }, [settings]);

  // Save draft on change
  useEffect(() => {
    localStorage.setItem('boardSettingsGeneralDraft', JSON.stringify(formData));
  }, [formData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          heroSlides: formData.heroSlides,
          zimadarCommissionPercent: Number(formData.zimadarCommissionPercent),
          zimadarMinMadrasas: Number(formData.zimadarMinMadrasas),
          zimadarMinOrderAmount: Number(formData.zimadarMinOrderAmount),
          zimadarCommissionEnabled: Boolean(formData.zimadarCommissionEnabled),
          scrollingNotice: settings?.scrollingNotice,
          showScrollingNotice: settings?.showScrollingNotice,
        }),
      });
      if (res.ok) {
        toast.success("সফলভাবে সংরক্ষিত হয়েছে!");
        localStorage.removeItem('boardSettingsGeneralDraft');
        window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: formData }));
        onSave();
      } else throw new Error();
    } catch (error) {
      toast.error("সংরক্ষণ করতে ব্যর্থ হয়েছে");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'coverUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fData = new FormData();
    fData.append('file', file);

    const toastId = toast.loading('ছবি আপলোড হচ্ছে...');
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      
      setFormData(prev => ({ ...prev, [field]: data.url }));
      toast.success('আপলোড সম্পন্ন হয়েছে', { id: toastId });
    } catch (error) {
      toast.error('আপলোড ব্যর্থ হয়েছে', { id: toastId });
    }
  };

  const handleSlideUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fData = new FormData();
    fData.append('file', file);

    setUploadingSlide(true);
    const toastId = toast.loading('স্লাইডার ছবি আপলোড হচ্ছে...');
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      
      if (data.url) {
        const newSlide: HeroSlide = {
          id: `slide-${Date.now()}`,
          imageUrl: data.url,
          title: "",
          subtitle: "",
          description: "",
          buttonText: "",
          buttonLink: ""
        };
        setFormData(prev => ({
          ...prev,
          heroSlides: [...(prev.heroSlides || []), newSlide]
        }));
        toast.success('স্লাইডার ছবি যুক্ত হয়েছে!', { id: toastId });
      }
    } catch (error) {
      toast.error('ছবি আপলোড ব্যর্থ হয়েছে', { id: toastId });
    } finally {
      setUploadingSlide(false);
      if (slideFileInputRef.current) slideFileInputRef.current.value = '';
    }
  };

  // Replace existing slide image via file upload
  const handleReplaceSlideUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replacingIndex === null) return;

    const fData = new FormData();
    fData.append('file', file);

    const toastId = toast.loading('নতুন ছবি আপলোড হচ্ছে...');
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      
      if (data.url) {
        updateSlideField(replacingIndex, 'imageUrl', data.url);
        toast.success('ছবি পরিবর্তন সম্পন্ন হয়েছে!', { id: toastId });
      }
    } catch (error) {
      toast.error('ছবি পরিবর্তন ব্যর্থ হয়েছে', { id: toastId });
    } finally {
      setReplacingIndex(null);
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
    }
  };

  // Add slide via direct URL / Link
  const handleAddUrlSlide = () => {
    if (!urlSlideForm.imageUrl.trim()) {
      toast.error('অনুগ্রহ করে ছবির লিংক (Image URL) প্রদান করুন');
      return;
    }
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      imageUrl: urlSlideForm.imageUrl.trim(),
      title: urlSlideForm.title.trim(),
      subtitle: urlSlideForm.description.trim(),
      description: urlSlideForm.description.trim(),
      buttonText: urlSlideForm.buttonText.trim(),
      buttonLink: urlSlideForm.buttonLink.trim()
    };
    setFormData(prev => ({
      ...prev,
      heroSlides: [...(prev.heroSlides || []), newSlide]
    }));
    setUrlSlideForm({
      imageUrl: "",
      title: "",
      description: "",
      buttonText: "",
      buttonLink: ""
    });
    setShowUrlModal(false);
    toast.success('লিংক থেকে স্লাইড যুক্ত করা হয়েছে!');
  };

  // Load default 3 built-in slides
  const loadDefaultSlides = () => {
    setFormData(prev => ({
      ...prev,
      heroSlides: [...DEFAULT_HERO_SLIDES]
    }));
    toast.success('ডিফল্ট ৩টি স্লাইডার ছবি লোড করা হয়েছে!');
  };

  const removeSlide = (index: number) => {
    setFormData(prev => ({
      ...prev,
      heroSlides: (prev.heroSlides || []).filter((_, i) => i !== index)
    }));
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const slides = [...(formData.heroSlides || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const temp = slides[index];
    slides[index] = slides[targetIndex];
    slides[targetIndex] = temp;
    setFormData(prev => ({ ...prev, heroSlides: slides }));
  };

  const updateSlideField = (index: number, field: keyof HeroSlide, value: string) => {
    const slides = [...(formData.heroSlides || [])];
    slides[index] = { ...slides[index], [field]: value };
    setFormData(prev => ({ ...prev, heroSlides: slides }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h3 className="text-lg font-bold text-slate-800 border-b pb-2">সাধারণ তথ্য</h3>
      
      <div className="grid gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">বোর্ডের নাম</label>
          <input 
            type="text" 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="বোর্ডের অফিসিয়াল নাম লিখুন"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">অফিসিয়াল ঠিকানা</label>
          <textarea 
            value={formData.address}
            onChange={e => setFormData({...formData, address: e.target.value})}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
            placeholder="সম্পূর্ণ ঠিকানা লিখুন"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">লোগো</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 relative group">
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <span className="text-slate-400 text-xs font-medium">Logo</span>
                )}
              </div>
              <div>
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-300 inline-block">
                  লোগো আপলোড
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={e => handleFileUpload(e, 'logoUrl')}
                  />
                </label>
                <p className="text-[11px] text-slate-400 mt-1">PNG, JPG বা SVG (সর্বোচ্চ ২MB)</p>
              </div>
            </div>
          </div>

          {/* Cover Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">কভার ছবি</label>
            <div className="flex items-center gap-4">
              <div className="w-40 h-24 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 relative group">
                {formData.coverUrl ? (
                  <img src={formData.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-400 text-xs font-medium">Cover Photo</span>
                )}
              </div>
              <div>
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-300 inline-block">
                  কভার ছবি আপলোড
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={e => handleFileUpload(e, 'coverUrl')}
                  />
                </label>
                <p className="text-[11px] text-slate-400 mt-1">হোমপেজ ও হেডার ব্যানারের জন্য</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cover Display Options */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            কভার ছবি প্রদর্শন বিকল্প
          </label>
          
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.showCoverAboveNavbar}
              onChange={e => setFormData(prev => ({ ...prev, showCoverAboveNavbar: e.target.checked }))}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <div>
              <span className="text-sm font-semibold text-slate-800">ওয়েবসাইট নেভবারের উপরে কভার দেখান</span>
              <p className="text-xs text-slate-500">হোম পেজ নেভবারের ঠিক উপরে একটি ব্যানার হিসেবে কভার ছবি প্রদর্শিত হবে।</p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.showCoverInPageHeader}
              onChange={e => setFormData(prev => ({ ...prev, showCoverInPageHeader: e.target.checked }))}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <div>
              <span className="text-sm font-semibold text-slate-800">সকল পেজের হেডারে স্লাইডিং ব্যানার হিসেবে দেখান</span>
              <p className="text-xs text-slate-500">সকল ডকুমেন্ট ও তথ্য পেজের শীর্ষে একটি প্রফেশনাল স্লাইডিং ব্যানার হিসেবে কভার ছবি দেখাবে।</p>
            </div>
          </label>
        </div>

        {/* Hero Slider Images Management & Sidebar */}
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-700" />
                <span>হোমপেজ টপ ব্যানার স্লাইডার (Hero Slider Images & Media List)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                হোমপেজে ব্যবহৃত সকল ছবির লিঙ্ক, আপলোড ফাইল, অপসারণ এবং নতুন ইমেজ কন্ট্রোল করুন।
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-xs cursor-pointer shrink-0"
                title="পূর্ণ সাইডবার প্যানেল ওপেন করুন"
              >
                <SidebarIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>📋 সাইডবার ড্রয়ার ভিউ</span>
              </button>
            </div>
          </div>

          {/* Embedded Slider Media Sidebar List & Controls */}
          <div className="w-full">
            <SliderMediaSidebar
              slides={formData.heroSlides || []}
              onUpdateSlides={(newSlides) => setFormData((prev) => ({ ...prev, heroSlides: newSlides }))}
            />
          </div>

          {/* Slide-out Drawer Panel (when triggered via button) */}
          <SliderMediaSidebar
            isDrawer={true}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            slides={formData.heroSlides || []}
            onUpdateSlides={(newSlides) => setFormData((prev) => ({ ...prev, heroSlides: newSlides }))}
          />
        </div>

        {/* 6. কেন্দ্র জিম্মাদার কমিশন সেটিংস (ডায়নামিক) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <span className="p-1 rounded bg-amber-50 text-amber-600 border border-amber-200 text-xs">কমিশন</span>
                কেন্দ্র জিম্মাদার কমিশন নীতিমালা সেটিংস
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                কেন্দ্র জিম্মাদারদের জন্য প্রযোজ্য কমিশন শতকরা হার, নূন্যতম মাদরাসা ও নূন্যতম অর্ডারের টাকার সীমা নির্ধারণ করুন।
              </p>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                checked={formData.zimadarCommissionEnabled}
                onChange={(e) => setFormData((prev) => ({ ...prev, zimadarCommissionEnabled: e.target.checked }))}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>কমিশন সুবিধা সক্রিয়</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                কমিশন হার (%) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={formData.zimadarCommissionPercent}
                  onChange={(e) => setFormData((prev) => ({ ...prev, zimadarCommissionPercent: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-emerald-600 font-bold bg-white"
                  placeholder="15"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
              </div>
              <p className="text-[11px] text-slate-400">ডিফল্ট: ১৫% কমিশন</p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                নূন্যতম মাদরাসা সংখ্যা (টি) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.zimadarMinMadrasas}
                onChange={(e) => setFormData((prev) => ({ ...prev, zimadarMinMadrasas: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-emerald-600 font-bold bg-white"
                placeholder="5"
              />
              <p className="text-[11px] text-slate-400">ডিফল্ট: কমপক্ষে ৫টি মাদরাসা বিল</p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                নূন্যতম অর্ডার মূল্য (টাকা) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.zimadarMinOrderAmount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, zimadarMinOrderAmount: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-emerald-600 font-bold bg-white"
                  placeholder="5000"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">৳</span>
              </div>
              <p className="text-[11px] text-slate-400">ডিফল্ট: ৫,০০০ টাকার বেশি</p>
            </div>
          </div>
        </div>

      </div>

      <div className="pt-6 border-t mt-8">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "সংরক্ষণ হচ্ছে..." : "সাধারণ তথ্য সংরক্ষণ করুন"}
        </button>
      </div>
    </div>
  );
}

// ==============================
// 2. Contacts & Payments Tab
// ==============================
// ==============================
// 2. Contacts Tab
// ==============================
function ContactsTab({ settings, onSave }: { settings: BoardSettings | null; onSave: () => void }) {
  const [contacts, setContacts] = useState<ContactInfo[]>(settings?.contacts || []);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings?.contacts) setContacts(settings.contacts);
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts })
      });
      if (res.ok) {
        toast.success("যোগাযোগের তথ্য সংরক্ষিত হয়েছে!");
        onSave();
      } else throw new Error();
    } catch (error) {
      toast.error("সংরক্ষণ করতে ব্যর্থ হয়েছে");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between pb-3 border-b">
        <div>
          <h3 className="text-lg font-bold text-slate-800">যোগাযোগের তথ্য</h3>
          <p className="text-xs text-slate-500">ওয়েবসাইট ও ইনভয়েসে প্রদর্শিত যোগাযোগের ফোন ও ইমেইল</p>
        </div>
        <button 
          onClick={() => setContacts([...contacts, { type: 'MOBILE', value: '' }])}
          className="flex items-center gap-1 text-sm text-emerald-700 font-medium hover:bg-emerald-100 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200 transition-colors"
        >
          <Plus className="w-4 h-4" /> মাধ্যম যুক্ত করুন
        </button>
      </div>

      <div className="space-y-3">
        {contacts.map((contact, i) => (
          <div key={i} className="flex gap-4 items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
            <select 
              value={contact.type}
              onChange={e => {
                const newC = [...contacts];
                newC[i].type = e.target.value;
                setContacts(newC);
              }}
              className="w-40 px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium text-sm"
            >
              <option value="MOBILE">মোবাইল</option>
              <option value="TELEPHONE">টেলিফোন</option>
              <option value="WHATSAPP">হোয়াটসঅ্যাপ</option>
              <option value="EMAIL">ইমেইল</option>
            </select>
            <input 
              type="text" 
              value={contact.value}
              onChange={e => {
                const newC = [...contacts];
                newC[i].value = e.target.value;
                setContacts(newC);
              }}
              placeholder="নম্বর বা ইমেইল লিখুন"
              className="flex-1 px-4 py-2 rounded-md border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium text-sm"
            />
            <button onClick={() => setContacts(contacts.filter((_, idx) => idx !== i))} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
        {contacts.length === 0 && <p className="text-slate-400 italic py-4 text-center">কোনো যোগাযোগের মাধ্যম যুক্ত করা হয়নি।</p>}
      </div>

      <div className="pt-6 border-t flex justify-end">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
        </button>
      </div>
    </div>
  );
}

// ==============================
// 3. Payments Tab (Dynamic Methods)
// ==============================
function PaymentsTab({ settings, onSave }: { settings: BoardSettings | null; onSave: () => void }) {
  const [payments, setPayments] = useState<PaymentMethod[]>(settings?.payments || []);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  useEffect(() => {
    if (settings?.payments) setPayments(settings.payments);
  }, [settings]);

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newPayments = [...payments];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newPayments.length) return;
    const temp = newPayments[index];
    newPayments[index] = newPayments[targetIdx];
    newPayments[targetIdx] = temp;
    newPayments.forEach((p, idx) => { p.sortOrder = idx + 1; });
    setPayments(newPayments);
  };

  const handleFileUpload = async (file: File, index: number, field: 'qrCodeImage' | 'logo') => {
    setUploadingIdx(index);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "payments");
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        const newPayments = [...payments];
        newPayments[index][field] = data.url;
        setPayments(newPayments);
        toast.success(field === 'qrCodeImage' ? "কিউআর কোড আপলোড হয়েছে!" : "লোগো আপলোড হয়েছে!");
      } else {
        toast.error(data.error || "আপলোড ব্যর্থ হয়েছে");
      }
    } catch (err) {
      toast.error("ছবি আপলোড করতে ব্যর্থ হয়েছে");
    } finally {
      setUploadingIdx(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payments: payments.map((p, idx) => ({ ...p, sortOrder: idx + 1 })) })
      });
      if (res.ok) {
        toast.success("পেমেন্ট মাধ্যমসমূহ সফলভাবে সংরক্ষিত হয়েছে!");
        onSave();
      } else throw new Error();
    } catch (error) {
      toast.error("সংরক্ষণ করতে ব্যর্থ হয়েছে");
    } finally {
      setIsSaving(false);
    }
  };

  const addMethod = (type: 'mobile' | 'bank') => {
    const isMobile = type === 'mobile';
    setPayments([
      ...payments,
      {
        type,
        provider: isMobile ? 'বিকাশ' : 'ইসলামী ব্যাংক',
        name: isMobile ? 'বিকাশ' : 'ইসলামী ব্যাংক বাংলাদেশ লিমিটেড',
        accountNumber: '',
        accountName: isMobile ? '' : 'নূরানী তালিমুল কুরআন বোর্ড খুলনা',
        accountType: isMobile ? 'পার্সোনাল' : undefined,
        branch: isMobile ? undefined : 'খুলনা শাখা',
        routingNo: isMobile ? undefined : '',
        instructions: isMobile ? 'Send Money করে TrxID প্রদান করুন।' : 'ব্যাংক ডিপোজিট করে স্লিপ নম্বর প্রদান করুন।',
        isActive: true,
        sortOrder: payments.length + 1,
      }
    ]);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b">
        <div>
          <h3 className="text-lg font-bold text-slate-800">ডায়নামিক পেমেন্ট মেথড ব্যবস্থাপনা</h3>
          <p className="text-xs text-slate-500">
            অর্ডারের সময় কাস্টমার কেবল সচল (Active) মেথডগুলো দেখতে পাবেন। QR কোড আপলোড করলে গ্রাহক স্ক্যান করে পেমেন্ট করতে পারবে।
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button 
            type="button"
            onClick={() => addMethod('mobile')}
            className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> + মোবাইল ব্যাংকিং
          </button>
          <button 
            type="button"
            onClick={() => addMethod('bank')}
            className="flex items-center gap-1.5 text-xs text-blue-800 font-bold bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl border border-blue-200 transition-colors cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5" /> + ব্যাংক অ্যাকাউন্ট
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {payments.map((payment, i) => {
          const isMobile = payment.type === 'mobile' || payment.type === 'MOBILE_BANKING';
          const isActive = payment.isActive !== false;

          return (
            <div 
              key={i} 
              className={`p-5 rounded-2xl border transition-all ${
                isActive ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              {/* Header row */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={i === 0}
                      onClick={() => handleMove(i, 'up')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100"
                      title="উপরে নিন"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={i === payments.length - 1}
                      onClick={() => handleMove(i, 'down')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100"
                      title="নিচে নিন"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isMobile ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {isMobile ? '📱 মোবাইল ব্যাংকিং' : '🏦 ব্যাংক অ্যাকাউন্ট'}
                  </span>

                  <span className="font-extrabold text-sm text-slate-800">
                    {payment.name || payment.provider || 'নতুন পেমেন্ট মাধ্যম'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newP = [...payments];
                      newP[i].isActive = !isActive;
                      setPayments(newP);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{isActive ? 'সচল (Active)' : 'বন্ধ (Inactive)'}</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setPayments(payments.filter((_, idx) => idx !== i))} 
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">প্রোভাইডার / ব্যাংকের নাম <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={payment.provider}
                    onChange={e => {
                      const newP = [...payments];
                      newP[i].provider = e.target.value;
                      if (!newP[i].name) newP[i].name = e.target.value;
                      setPayments(newP);
                    }}
                    placeholder="যেমন: বিকাশ / ইসলামী ব্যাংক"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">অ্যাকাউন্ট নম্বর <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={payment.accountNumber}
                    onChange={e => {
                      const newP = [...payments];
                      newP[i].accountNumber = e.target.value;
                      setPayments(newP);
                    }}
                    placeholder="নম্বর লিখুন"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">অ্যাকাউন্টের ধরন / টাইপ</label>
                  <input 
                    type="text" 
                    value={payment.accountType || ''}
                    onChange={e => {
                      const newP = [...payments];
                      newP[i].accountType = e.target.value;
                      setPayments(newP);
                    }}
                    placeholder="যেমন: পার্সোনাল / মার্চেন্ট / এজেন্ট"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">অ্যাকাউন্টধারীর নাম (Account Name)</label>
                  <input 
                    type="text" 
                    value={payment.accountName || ''}
                    onChange={e => {
                      const newP = [...payments];
                      newP[i].accountName = e.target.value;
                      setPayments(newP);
                    }}
                    placeholder="নূরানী তালিমুল কুরআন বোর্ড খুলনা"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>

                {!isMobile && (
                  <>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">শাখার নাম (Branch)</label>
                      <input 
                        type="text" 
                        value={payment.branch || ''}
                        onChange={e => {
                          const newP = [...payments];
                          newP[i].branch = e.target.value;
                          setPayments(newP);
                        }}
                        placeholder="খুলনা প্রধান শাখা"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">রাউটিং নম্বর (Routing No)</label>
                      <input 
                        type="text" 
                        value={payment.routingNo || ''}
                        onChange={e => {
                          const newP = [...payments];
                          newP[i].routingNo = e.target.value;
                          setPayments(newP);
                        }}
                        placeholder="125271822"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                      />
                    </div>
                  </>
                )}

                <div className="col-span-1 md:col-span-3">
                  <label className="block font-bold text-slate-700 mb-1">পেমেন্ট নির্দেশনা (গ্রাহকের জন্য)</label>
                  <input 
                    type="text" 
                    value={payment.instructions || ''}
                    onChange={e => {
                      const newP = [...payments];
                      newP[i].instructions = e.target.value;
                      setPayments(newP);
                    }}
                    placeholder="যেমন: বিকাশ Send Money করুন এবং TrxID ও প্রেরক নম্বর লিখুন।"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium text-xs"
                  />
                </div>

                {/* QR Code and Logo Upload Area */}
                <div className="col-span-1 md:col-span-3 flex flex-wrap gap-6 pt-3 border-t border-slate-100">
                  {/* QR Code Upload */}
                  <div className="flex items-center gap-3">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-emerald-700" />
                      <span>কিউআর কোড (QR Code):</span>
                    </label>
                    {payment.qrCodeImage ? (
                      <div className="flex items-center gap-2">
                        <img src={payment.qrCodeImage} alt="QR" className="w-12 h-12 object-contain border rounded-lg p-0.5 bg-white shadow-2xs" />
                        <button
                          type="button"
                          onClick={() => {
                            const newP = [...payments];
                            newP[i].qrCodeImage = '';
                            setPayments(newP);
                          }}
                          className="text-red-500 hover:text-red-700 font-bold text-xs"
                        >
                          মুছুন
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingIdx === i ? 'আপলোড হচ্ছে...' : 'QR ছবি আপলোড'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, i, 'qrCodeImage');
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* Logo Upload */}
                  <div className="flex items-center gap-3">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-blue-700" />
                      <span>লোগো (Logo):</span>
                    </label>
                    {payment.logo ? (
                      <div className="flex items-center gap-2">
                        <img src={payment.logo} alt="Logo" className="w-10 h-10 object-contain border rounded-lg p-0.5 bg-white shadow-2xs" />
                        <button
                          type="button"
                          onClick={() => {
                            const newP = [...payments];
                            newP[i].logo = '';
                            setPayments(newP);
                          }}
                          className="text-red-500 hover:text-red-700 font-bold text-xs"
                        >
                          মুছুন
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingIdx === i ? 'আপলোড হচ্ছে...' : 'লোগো আপলোড'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, i, 'logo');
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {payments.length === 0 && (
          <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl">
            <p className="text-slate-400 italic">কোনো পেমেন্ট মাধ্যম পাওয়া যায়নি। উপরে বাটন চাপুন।</p>
          </div>
        )}
      </div>

      <div className="pt-6 border-t flex justify-end">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "সংরক্ষণ হচ্ছে..." : "পেমেন্ট মাধ্যমসমূহ সংরক্ষণ করুন"}
        </button>
      </div>
    </div>
  );
}

// ==============================
// 4. Delivery Options Tab
// ==============================
function DeliveryTab() {
  const [options, setOptions] = useState<DeliveryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/delivery-options');
      const data = await res.json();
      if (Array.isArray(data)) {
        setOptions(data);
      }
    } catch (e) {
      toast.error("ডেলিভারি অপশন লোড করতে ব্যর্থ হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/delivery-options', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });
      if (res.ok) {
        toast.success("ডেলিভারি অপশন ও চার্জ সংরক্ষিত হয়েছে!");
        fetchOptions();
      } else throw new Error();
    } catch (error) {
      toast.error("সংরক্ষণ করতে ব্যর্থ হয়েছে");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-slate-500 text-sm">ডেলিভারি তথ্য লোড হচ্ছে...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-3 border-b">
        <h3 className="text-lg font-bold text-slate-800">ডেলিভারি অপশন ও চার্জ ব্যবস্থাপনা</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          অর্ডার চেকআউটের সময় গ্রাহক এই অপশনগুলো থেকে নির্বাচন করবেন। কুরিয়ার বা ট্রান্সপোর্টের নাম ইনপুট বাধ্যতামূলক করতে চেকবক্স অন রাখুন।
        </p>
      </div>

      <div className="space-y-4">
        {options.map((opt, i) => (
          <div key={opt.type || i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-700" />
                <span className="font-extrabold text-sm text-slate-800">{opt.name}</span>
                <span className="text-[11px] font-mono text-slate-400">({opt.type})</span>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  const newO = [...options];
                  newO[i].isActive = !newO[i].isActive;
                  setOptions(newO);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  opt.isActive !== false 
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                {opt.isActive !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{opt.isActive !== false ? 'সচল (Active)' : 'বন্ধ (Inactive)'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">প্রদর্শিত নাম (Display Name)</label>
                <input
                  type="text"
                  value={opt.name}
                  onChange={(e) => {
                    const newO = [...options];
                    newO[i].name = e.target.value;
                    setOptions(newO);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ডেলিভারি চার্জ (টাকা ৳)</label>
                <input
                  type="number"
                  min={0}
                  value={opt.charge}
                  onChange={(e) => {
                    const newO = [...options];
                    newO[i].charge = Number(e.target.value) || 0;
                    setOptions(newO);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(opt.requiresName)}
                    onChange={(e) => {
                      const newO = [...options];
                      newO[i].requiresName = e.target.checked;
                      setOptions(newO);
                    }}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="font-bold text-slate-700 text-xs">নির্দিষ্ট নাম ইনপুট আবশ্যক?</span>
                </label>
              </div>

              <div className="col-span-1 md:col-span-3">
                <label className="block font-bold text-slate-700 mb-1">বিবরণ / নির্দেশনা (Description)</label>
                <input
                  type="text"
                  value={opt.description || ''}
                  onChange={(e) => {
                    const newO = [...options];
                    newO[i].description = e.target.value;
                    setOptions(newO);
                  }}
                  placeholder="যেমন: সুন্দরবন, এস এ পরিবহন, করতোয়া ইত্যাদি"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t flex justify-end">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "সংরক্ষণ হচ্ছে..." : "ডেলিভারি অপশন সংরক্ষণ করুন"}
        </button>
      </div>
    </div>
  );
}

// ==============================
// 3. Positions Tab
// ==============================
function PositionsTab({ positions, onSave }: { positions: Position[]; onSave: () => void }) {
  const [newPosName, setNewPosName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async () => {
    if(!newPosName.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPosName, order: positions.length + 1 })
      });
      if(res.ok) {
        setNewPosName("");
        toast.success("পদবী তৈরি করা হয়েছে");
        onSave();
      } else throw new Error();
    } catch(e) {
      toast.error("পদবী তৈরি করতে ব্যর্থ হয়েছে");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("আপনি কি নিশ্চিত?")) return;
    try {
      const res = await fetch(`/api/positions/${id}`, { method: 'DELETE' });
      if(res.ok) {
        toast.success("সফলভাবে ডিলিট হয়েছে");
        onSave();
      } else {
        const data = await res.json();
        toast.error(data.error || "ডিলিট করতে ব্যর্থ হয়েছে");
      }
    } catch(e) {
      toast.error("ডিলিট করতে ব্যর্থ হয়েছে");
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6 pb-2 border-b">
        <h3 className="text-lg font-bold text-slate-800">পদবী পরিচালনা</h3>
      </div>

      <div className="flex gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <input 
          type="text" 
          value={newPosName}
          onChange={e => setNewPosName(e.target.value)}
          placeholder="নতুন পদবীর নাম (যেমন: সভাপতি)"
          className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500"
        />
        <button 
          onClick={handleCreate}
          disabled={isSaving || !newPosName.trim()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium whitespace-nowrap transition-colors disabled:opacity-50"
        >
          পদবী যুক্ত করুন
        </button>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="py-3 px-5 text-sm font-bold text-slate-600">পদবীর নাম</th>
              <th className="py-3 px-5 text-sm font-bold text-slate-600 w-24 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {positions.map((pos) => (
              <tr key={pos.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-5 font-medium text-slate-800">{pos.name}</td>
                <td className="py-3 px-5 text-right">
                  <button onClick={() => handleDelete(pos.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {positions.length === 0 && (
              <tr>
                <td colSpan={2} className="py-8 text-center text-slate-400 italic">কোনো পদবী তৈরি করা হয়নি।</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==============================
// 4. Members Tab
// ==============================
function MembersTab({ members, positions, onSave }: { members: BoardMember[]; positions: Position[]; onSave: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<BoardMember>>({ type: 'COMMITTEE' });
  const [isSaving, setIsSaving] = useState(false);

  // Load draft
  useEffect(() => {
    const saved = localStorage.getItem('boardSettingsMemberDraft');
    if (saved) {
      try { 
        setFormData(JSON.parse(saved)); 
        setIsModalOpen(true);
      } catch (e) {}
    }
  }, []);

  // Save draft
  useEffect(() => {
    if (isModalOpen && !formData.id && (formData.name || formData.phone || formData.positionId)) {
      localStorage.setItem('boardSettingsMemberDraft', JSON.stringify(formData));
    } else if (!isModalOpen) {
      localStorage.removeItem('boardSettingsMemberDraft');
    }
  }, [formData, isModalOpen]);

  const handleSave = async () => {
    if(!formData.name || !formData.positionId) return toast.error("নাম ও পদবী আবশ্যক");
    setIsSaving(true);
    try {
      const url = formData.id ? `/api/members/${formData.id}` : '/api/members';
      const method = formData.id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if(res.ok) {
        toast.success("সফলভাবে সংরক্ষিত হয়েছে");
        setIsModalOpen(false);
        setFormData({ type: 'COMMITTEE' });
        localStorage.removeItem('boardSettingsMemberDraft');
        onSave();
      } else throw new Error();
    } catch(e) {
      toast.error("সংরক্ষণ করতে ব্যর্থ হয়েছে");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("এই সদস্যকে ডিলিট করতে চান?")) return;
    try {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
      if(res.ok) {
        toast.success("ডিলিট হয়েছে");
        onSave();
      }
    } catch(e) {
      toast.error("ডিলিট করতে ব্যর্থ হয়েছে");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const toastId = toast.loading('আপলোড হচ্ছে...');
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFormData(prev => ({ ...prev, photoUrl: data.url }));
      toast.success('আপলোড সম্পন্ন', { id: toastId });
    } catch (error) {
      toast.error('আপলোড ব্যর্থ', { id: toastId });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 pb-2 border-b">
        <h3 className="text-lg font-bold text-slate-800">সদস্য ও স্টাফ তালিকা</h3>
        <button 
          onClick={() => { setFormData({ type: 'COMMITTEE' }); setIsModalOpen(true); }}
          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> সদস্য যুক্ত করুন
        </button>
      </div>

      {positions.length === 0 ? (
        <div className="text-center py-12 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-amber-800 font-medium">সদস্য যুক্ত করার আগে অনুগ্রহ করে 'পদবী' ট্যাব থেকে পদবী তৈরি করুন!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map(member => (
            <div key={member.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-4 relative group hover:shadow-md transition-all">
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button onClick={() => { setFormData(member); setIsModalOpen(true); }} className="p-1.5 bg-white text-blue-500 hover:bg-blue-50 rounded-md shadow-sm border border-slate-100"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(member.id)} className="p-1.5 bg-white text-red-500 hover:bg-red-50 rounded-md shadow-sm border border-slate-100"><Trash2 className="w-4 h-4" /></button>
              </div>
              
              {member.photoUrl ? (
                <img src={member.photoUrl} alt={member.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl shrink-0 border-2 border-white shadow-sm">
                  {member.name.charAt(0)}
                </div>
              )}
              <div className="pr-12">
                <h4 className="font-bold text-slate-800 text-lg leading-tight mb-1">{member.name}</h4>
                <p className="text-sm text-emerald-600 font-bold mb-2">{member.position?.name}</p>
                <div className="flex flex-col gap-1 text-xs text-slate-500 font-medium">
                  <span className="bg-white border border-slate-200 px-2 py-1 rounded-md w-max">
                    {member.type === 'COMMITTEE' ? 'কমিটির সদস্য' : 'অফিস স্টাফ'}
                  </span>
                  {member.phone && <span className="flex items-center gap-1 mt-1"><Phone className="w-3 h-3"/> {member.phone}</span>}
                </div>
              </div>
            </div>
          ))}
          {members.length === 0 && <div className="col-span-full text-center py-12 text-slate-400">কোনো সদস্য যুক্ত করা হয়নি।</div>}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100"
            >
              <div className="flex items-center justify-between p-5 border-b bg-slate-50">
                <h3 className="font-bold text-lg text-slate-800">{formData.id ? 'সদস্য আপডেট করুন' : 'নতুন সদস্য যুক্ত করুন'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-md shadow-sm border border-slate-200"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-center mb-6">
                  <div className="relative group cursor-pointer w-28 h-28 rounded-full border-2 border-dashed border-slate-300 hover:border-emerald-500 overflow-hidden bg-slate-50">
                    {formData.photoUrl ? (
                      <img src={formData.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                        <Upload className="w-6 h-6 mb-1" />
                        <span className="text-xs font-medium">ছবি আপলোড</span>
                      </div>
                    )}
                    <input type="file" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">পূর্ণ নাম <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="সদস্যের নাম লিখুন" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">সদস্যের ধরন</label>
                    <select value={formData.type || ''} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option value="COMMITTEE">কমিটির সদস্য</option>
                      <option value="EMPLOYEE">অফিস স্টাফ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">পদবী <span className="text-red-500">*</span></label>
                    <select value={formData.positionId || ''} onChange={e => setFormData({...formData, positionId: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option value="">নির্বাচন করুন...</option>
                      {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ফোন নম্বর (ঐচ্ছিক)</label>
                  <input type="text" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="মোবাইল নম্বর" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono" />
                </div>

                <button 
                  onClick={handleSave}
                  disabled={isSaving || !formData.name || !formData.positionId}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold text-lg transition-colors mt-4 disabled:opacity-50"
                >
                  {isSaving ? "সংরক্ষণ হচ্ছে..." : "সদস্য সংরক্ষণ করুন"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
