"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit2, Save, X, Image as ImageIcon, Briefcase, Users, Phone, Building2, Upload, Link as LinkIcon, Globe, RefreshCw, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

interface ContactInfo {
  id?: string;
  type: string;
  value: string;
}

interface PaymentMethod {
  id?: string;
  type: string;
  provider: string;
  accountName?: string;
  accountNumber: string;
  branch?: string;
  routingNo?: string;
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
    { id: "contacts", label: "যোগাযোগ ও পেমেন্ট", icon: Phone },
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
    title: "খুলনা নূরানী বোর্ডে স্বাগতম",
    subtitle: "আধুনিক পদ্ধতির সাথে বিশুদ্ধ কোরআনি শিক্ষায় নতুন প্রজন্মকে ক্ষমতায়ন করা।",
    description: "আধুনিক পদ্ধতির সাথে বিশুদ্ধ কোরআনি শিক্ষায় নতুন প্রজন্মকে ক্ষমতায়ন করা।",
    buttonText: "মাদরাসা নিবন্ধন করুন",
    buttonLink: "/register"
  },
  {
    id: "slide-default-2",
    imageUrl: "/images/hero/slide2.jpg",
    title: "ইসলামি শিক্ষায় শ্রেষ্ঠত্ব",
    subtitle: "আজই আমাদের মাদরাসার বিশাল নেটওয়ার্কে যুক্ত হোন এবং জ্ঞান অর্জনে নিবেদিত একটি ক্রমবর্ধমান সম্প্রদায়ের অংশ হন।",
    description: "আজই আমাদের মাদরাসার বিশাল নেটওয়ার্কে যুক্ত হোন এবং জ্ঞান অর্জনে নিবেদিত একটি ক্রমবর্ধমান সম্প্রদায়ের অংশ হন।",
    buttonText: "আরও জানুন",
    buttonLink: "/about"
  },
  {
    id: "slide-default-3",
    imageUrl: "/images/hero/slide3.jpg",
    title: "আপনার মাদরাসা এখনই নিবন্ধন করুন",
    subtitle: "নতুন মাদরাসাগুলির জন্য সহজ নিবন্ধন প্রক্রিয়া। অনুমোদন পান এবং আমাদের নির্দেশিকায় কাজ শুরু করুন।",
    description: "নতুন মাদরাসাগুলির জন্য সহজ নিবন্ধন প্রক্রিয়া। অনুমোদন পান এবং আমাদের নির্দেশিকায় কাজ শুরু করুন।",
    buttonText: "মাদরাসা নিবন্ধন করুন",
    buttonLink: "/register"
  }
];

function GeneralTab({ settings, onSave }: { settings: BoardSettings | null; onSave: () => void }) {
  const [formData, setFormData] = useState({
    name: settings?.name || "",
    address: settings?.address || "",
    logoUrl: settings?.logoUrl || "",
    coverUrl: settings?.coverUrl || "",
    showCoverAboveNavbar: settings?.showCoverAboveNavbar ?? false,
    showCoverInPageHeader: settings?.showCoverInPageHeader ?? false,
    heroSlides: (settings?.heroSlides || []) as HeroSlide[],
  });
  const [isSaving, setIsSaving] = useState(false);
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
      try { setFormData(JSON.parse(saved)); } catch (e) {}
    } else if (settings) {
      setFormData({
        name: settings.name || "",
        address: settings.address || "",
        logoUrl: settings.logoUrl || "",
        coverUrl: settings.coverUrl || "",
        showCoverAboveNavbar: settings.showCoverAboveNavbar ?? false,
        showCoverInPageHeader: settings.showCoverInPageHeader ?? false,
        heroSlides: settings.heroSlides || [],
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

        {/* Hero Slider Images Management */}
        <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-700" />
                <span>হোমপেজ টপ ব্যানার স্লাইডার (Hero Slider Images)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                হোমপেজের নেভবারের নিচে একের পর এক স্বয়ংক্রিয়ভাবে স্লাইড হওয়া ছবি ও ব্যানারসমূহ ফাইল বা সরাসরি লিংক দিয়ে পরিচালনা করুন।
              </p>
            </div>

            {/* Action Buttons: Upload File, Add Link, Load Defaults */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => slideFileInputRef.current?.click()}
                disabled={uploadingSlide}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-xs cursor-pointer shrink-0 disabled:opacity-50"
                title="সরাসরি কম্পিউটার/মোবাইল থেকে ছবি আপলোড করুন"
              >
                <Upload className="w-3.5 h-3.5 text-amber-300" />
                <span>{uploadingSlide ? "আপলোড হচ্ছে..." : "+ ফাইল আপলোড"}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUrlModal(!showUrlModal)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-xs cursor-pointer shrink-0"
                title="ছবির সরাসরি ওয়েব লিংক বা পাথ দিয়ে যোগ করুন"
              >
                <LinkIcon className="w-3.5 h-3.5 text-blue-200" />
                <span>+ লিংক দিয়ে যোগ করুন</span>
              </button>

              <button
                type="button"
                onClick={loadDefaultSlides}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-xs cursor-pointer shrink-0"
                title="বোর্ডের ৩টি ডিফল্ট স্লাইডার ছবি লোড করুন"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-300" />
                <span>ডিফল্ট স্লাইড লোড</span>
              </button>
            </div>

            {/* Hidden File inputs */}
            <input
              type="file"
              ref={slideFileInputRef}
              onChange={handleSlideUpload}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={replaceFileInputRef}
              onChange={handleReplaceSlideUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Add via Link / URL Card Form */}
          {showUrlModal && (
            <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-600" />
                  ইমেজ লিংক / সরাসরি URL দিয়ে স্লাইড যোগ করুন
                </span>
                <button
                  type="button"
                  onClick={() => setShowUrlModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ছবির সরাসরি লিংক / URL (Image Link/Path) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="উদাঃ https://images.unsplash.com/... অথবা /images/hero/slide1.jpg"
                    value={urlSlideForm.imageUrl}
                    onChange={e => setUrlSlideForm({ ...urlSlideForm, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-blue-200 bg-white focus:outline-none focus:border-blue-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ব্যানার শিরোনাম (Title - ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="উদাঃ খুলনা নূরানী বোর্ডে স্বাগতম"
                    value={urlSlideForm.title}
                    onChange={e => setUrlSlideForm({ ...urlSlideForm, title: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-blue-200 bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    সাবটাইটেল / বিবরণ (Description - ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="উদাঃ আধুনিক পদ্ধতির সাথে বিশুদ্ধ কোরআনি শিক্ষা"
                    value={urlSlideForm.description}
                    onChange={e => setUrlSlideForm({ ...urlSlideForm, description: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-blue-200 bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    বাটন লেখা (Button Text - ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="উদাঃ মাদরাসা নিবন্ধন করুন"
                    value={urlSlideForm.buttonText}
                    onChange={e => setUrlSlideForm({ ...urlSlideForm, buttonText: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-blue-200 bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    বাটন লিংক (Button Link - ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="উদাঃ /register বা /about"
                    value={urlSlideForm.buttonLink}
                    onChange={e => setUrlSlideForm({ ...urlSlideForm, buttonLink: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-blue-200 bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {urlSlideForm.imageUrl && (
                <div className="mt-2 flex items-center gap-3 bg-white p-2 rounded-xl border border-blue-100">
                  <div className="w-20 h-12 rounded-lg bg-slate-900 overflow-hidden shrink-0">
                    <img src={urlSlideForm.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] text-slate-500 truncate">ছবির প্রিভিউ</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowUrlModal(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleAddUrlSlide}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  + স্লাইড যুক্ত করুন
                </button>
              </div>
            </div>
          )}

          {/* Slides List */}
          {(!formData.heroSlides || formData.heroSlides.length === 0) ? (
            <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-400 space-y-3">
              <ImageIcon className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">এখনও কোনো কাস্টম স্লাইডার ছবি যোগ করা হয়নি।</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                বর্তমানে হোমপেজে ডিফল্ট ৩টি ইসলামিক ব্যানার স্বয়ংক্রিয়ভাবে প্রদর্শিত হচ্ছে। আপনি যেকোনো সময় ফাইল আপলোড বা সরাসরি ছবির লিংক দিয়ে নতুন স্লাইড যুক্ত করতে পারেন অথবা নিচের বাটনে ক্লিক করে ডিফল্ট স্লাইডগুলো এডিট করতে পারেন।
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={loadDefaultSlides}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  ডিফল্ট ৩টি স্লাইড লোড ও এডিট করুন
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.heroSlides.map((slide, index) => (
                <div
                  key={slide.id || index}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-start relative group"
                >
                  {/* Thumbnail & Change File Action */}
                  <div className="w-full md:w-52 flex flex-col gap-2 shrink-0">
                    <div className="w-full h-28 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 relative group/thumb">
                      <img
                        src={slide.imageUrl}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e: any) => { e.currentTarget.src = "/images/hero/slide1.jpg"; }}
                      />
                      <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        স্লাইড #{index + 1}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setReplacingIndex(index);
                        replaceFileInputRef.current?.click();
                      }}
                      className="w-full py-1 px-2 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <Upload className="w-3 h-3 text-emerald-600" />
                      <span>ছবি পরিবর্তন (ফাইল)</span>
                    </button>
                  </div>

                  {/* Form Inputs for Image Link & Overlay Text */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                    
                    {/* Direct Image Link / URL Input */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5 flex items-center gap-1">
                        <LinkIcon className="w-3 h-3 text-emerald-600" />
                        <span>ছবির লিংক / সোর্স পাথ (Image URL / Path):</span>
                      </label>
                      <input
                        type="text"
                        placeholder="https://... অথবা /uploads/... অথবা /images/..."
                        value={slide.imageUrl || ""}
                        onChange={e => updateSlideField(index, 'imageUrl', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-mono bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        ব্যানার শিরোনাম (Title - ঐচ্ছিক)
                      </label>
                      <input
                        type="text"
                        placeholder="উদাঃ খুলনা নূরানী বোর্ডে স্বাগতম"
                        value={slide.title || ""}
                        onChange={e => updateSlideField(index, 'title', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        সাবটাইটেল / বিবরণ (Description - ঐচ্ছিক)
                      </label>
                      <input
                        type="text"
                        placeholder="উদাঃ আধুনিক পদ্ধতির সাথে বিশুদ্ধ কোরআনি শিক্ষা"
                        value={slide.description || slide.subtitle || ""}
                        onChange={e => updateSlideField(index, 'description', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        বাটন লেখা (Button Text - ঐচ্ছিক)
                      </label>
                      <input
                        type="text"
                        placeholder="উদাঃ মাদরাসা নিবন্ধন করুন"
                        value={slide.buttonText || ""}
                        onChange={e => updateSlideField(index, 'buttonText', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        বাটন লিংক (Button Link - ঐচ্ছিক)
                      </label>
                      <input
                        type="text"
                        placeholder="উদাঃ /register বা /about"
                        value={slide.buttonLink || ""}
                        onChange={e => updateSlideField(index, 'buttonLink', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  {/* Actions (Reorder, Delete) */}
                  <div className="flex md:flex-col items-center gap-1.5 shrink-0 self-end md:self-center border-t md:border-t-0 md:border-l border-slate-100 pt-2 md:pt-0 md:pl-3 w-full md:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => moveSlide(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 disabled:opacity-30"
                      title="উপরে নিন"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSlide(index, 'down')}
                      disabled={index === (formData.heroSlides?.length || 0) - 1}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 disabled:opacity-30"
                      title="নিচে নিন"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSlide(index)}
                      className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
function ContactsTab({ settings, onSave }: { settings: BoardSettings | null; onSave: () => void }) {
  const [contacts, setContacts] = useState<ContactInfo[]>(settings?.contacts || []);
  const [payments, setPayments] = useState<PaymentMethod[]>(settings?.payments || []);
  const [isSaving, setIsSaving] = useState(false);

  // Load draft
  useEffect(() => {
    const savedContacts = localStorage.getItem('boardSettingsContactsDraft');
    const savedPayments = localStorage.getItem('boardSettingsPaymentsDraft');
    if (savedContacts) try { setContacts(JSON.parse(savedContacts)); } catch (e) {}
    else if (settings?.contacts) setContacts(settings.contacts);
    
    if (savedPayments) try { setPayments(JSON.parse(savedPayments)); } catch (e) {}
    else if (settings?.payments) setPayments(settings.payments);
  }, [settings]);

  // Save draft
  useEffect(() => {
    localStorage.setItem('boardSettingsContactsDraft', JSON.stringify(contacts));
  }, [contacts]);
  useEffect(() => {
    localStorage.setItem('boardSettingsPaymentsDraft', JSON.stringify(payments));
  }, [payments]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts, payments })
      });
      if (res.ok) {
        toast.success("যোগাযোগ ও পেমেন্ট সংরক্ষিত হয়েছে!");
        localStorage.removeItem('boardSettingsContactsDraft');
        localStorage.removeItem('boardSettingsPaymentsDraft');
        onSave();
      } else throw new Error();
    } catch (error) {
      toast.error("সংরক্ষণ করতে ব্যর্থ হয়েছে");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-12 max-w-4xl">
      {/* Contacts Section */}
      <div>
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <h3 className="text-lg font-bold text-slate-800">যোগাযোগের তথ্য</h3>
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
                className="w-40 px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:border-emerald-500"
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
                className="flex-1 px-4 py-2 rounded-md border border-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <button onClick={() => setContacts(contacts.filter((_, idx) => idx !== i))} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          {contacts.length === 0 && <p className="text-slate-400 italic py-4 text-center">কোনো যোগাযোগের মাধ্যম যুক্ত করা হয়নি।</p>}
        </div>
      </div>

      {/* Payments Section */}
      <div>
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <h3 className="text-lg font-bold text-slate-800">পেমেন্ট মাধ্যম</h3>
          <button 
            onClick={() => setPayments([...payments, { type: 'MOBILE_BANKING', provider: '', accountNumber: '' }])}
            className="flex items-center gap-1 text-sm text-emerald-700 font-medium hover:bg-emerald-100 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200 transition-colors"
          >
            <Plus className="w-4 h-4" /> পেমেন্ট মাধ্যম যুক্ত করুন
          </button>
        </div>
        
        <div className="space-y-4">
          {payments.map((payment, i) => (
            <div key={i} className="bg-slate-50 p-5 rounded-xl border border-slate-200 relative">
              <button onClick={() => setPayments(payments.filter((_, idx) => idx !== i))} className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
              
              <div className="grid grid-cols-2 gap-5 mr-12">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ধরন</label>
                  <select 
                    value={payment.type}
                    onChange={e => {
                      const newP = [...payments];
                      newP[i].type = e.target.value;
                      setPayments(newP);
                    }}
                    className="w-full px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="MOBILE_BANKING">মোবাইল ব্যাংকিং</option>
                    <option value="BANK">ব্যাংক অ্যাকাউন্ট</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">প্রোভাইডার/ব্যাংকের নাম</label>
                  <input 
                    type="text" 
                    value={payment.provider}
                    onChange={e => {
                      const newP = [...payments];
                      newP[i].provider = e.target.value;
                      setPayments(newP);
                    }}
                    placeholder="যেমন: bKash, Islami Bank"
                    className="w-full px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">অ্যাকাউন্ট নম্বর</label>
                  <input 
                    type="text" 
                    value={payment.accountNumber}
                    onChange={e => {
                      const newP = [...payments];
                      newP[i].accountNumber = e.target.value;
                      setPayments(newP);
                    }}
                    placeholder="অ্যাকাউন্ট নম্বর লিখুন"
                    className="w-full px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                
                {payment.type === 'BANK' && (
                  <>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">অ্যাকাউন্টের নাম (ঐচ্ছিক)</label>
                      <input 
                        type="text" 
                        value={payment.accountName || ''}
                        onChange={e => {
                          const newP = [...payments];
                          newP[i].accountName = e.target.value;
                          setPayments(newP);
                        }}
                        className="w-full px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">শাখা (ঐচ্ছিক)</label>
                      <input 
                        type="text" 
                        value={payment.branch || ''}
                        onChange={e => {
                          const newP = [...payments];
                          newP[i].branch = e.target.value;
                          setPayments(newP);
                        }}
                        className="w-full px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">রাউটিং নম্বর (ঐচ্ছিক)</label>
                      <input 
                        type="text" 
                        value={payment.routingNo || ''}
                        onChange={e => {
                          const newP = [...payments];
                          newP[i].routingNo = e.target.value;
                          setPayments(newP);
                        }}
                        className="w-full px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
          {payments.length === 0 && <p className="text-slate-400 italic py-4 text-center">কোনো পেমেন্ট মাধ্যম যুক্ত করা হয়নি।</p>}
        </div>
      </div>

      <div className="pt-6 border-t">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "সংরক্ষণ হচ্ছে..." : "যোগাযোগ ও পেমেন্ট সংরক্ষণ করুন"}
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
