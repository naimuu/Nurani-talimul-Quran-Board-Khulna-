"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  Link as LinkIcon,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Sparkles,
  Plus,
  RefreshCw,
  Eye,
  Layers,
  ArrowRight,
  Info
} from "lucide-react";
import toast from "react-hot-toast";

export interface HeroSlide {
  id: string;
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
}

interface SliderMediaSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  slides: HeroSlide[];
  onUpdateSlides: (newSlides: HeroSlide[]) => void;
  isDrawer?: boolean;
}

const PRESET_GALLERY = [
  {
    title: "নূরানী বোর্ড খুলনা ব্যানার ১",
    imageUrl: "/images/hero/slide1.jpg",
    description: "আধুনিক পদ্ধতির সাথে বিশুদ্ধ কোরআনি শিক্ষায় নতুন প্রজন্মকে ক্ষমতায়ন করা।",
    buttonText: "মাদরাসা নিবন্ধন করুন",
    buttonLink: "/register",
    tag: "ডিফল্ট ব্যানার ১"
  },
  {
    title: "ইসলামি শিক্ষায় শ্রেষ্ঠত্ব ব্যানার ২",
    imageUrl: "/images/hero/slide2.jpg",
    description: "আজই আমাদের মাদরাসার বিশাল নেটওয়ার্কে যুক্ত হোন এবং জ্ঞান অর্জনে নিবেদিত একটি ক্রমবর্ধমান সম্প্রদায়ের অংশ হন।",
    buttonText: "আরও জানুন",
    buttonLink: "/about",
    tag: "ডিফল্ট ব্যানার ২"
  },
  {
    title: "মাদরাসা নিবন্ধন ব্যানার ৩",
    imageUrl: "/images/hero/slide3.jpg",
    description: "নতুন মাদরাসাগুলির জন্য সহজ নিবন্ধন প্রক্রিয়া। অনুমোদন পান এবং আমাদের নির্দেশিকায় কাজ শুরু করুন।",
    buttonText: "মাদরাসা নিবন্ধন করুন",
    buttonLink: "/register",
    tag: "ডিফল্ট ব্যানার ৩"
  },
  {
    title: "কুরআন পাঠ ও তিলাওয়াত (অনলাইন ব্যানার)",
    imageUrl: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1200&q=80",
    description: "পবিত্র কুরআন তিলাওয়াত ও তাফসীরের আলোয় আলোকিত জীবন গড়ুন।",
    buttonText: "আমাদের পরিচিতি",
    buttonLink: "/about",
    tag: "অনলাইন ব্যানার"
  },
  {
    title: "মসজিদ ও ইসলামিক স্থাপত্য ব্যানার",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
    description: "জ্ঞান ও আদর্শের সমন্বয়ে একটি আলোকিত সমাজ গঠনে আমাদের প্রয়াস।",
    buttonText: "যোগাযোগ করুন",
    buttonLink: "/contact",
    tag: "অনলাইন ব্যানার"
  }
];

export default function SliderMediaSidebar({
  isOpen = true,
  onClose,
  slides,
  onUpdateSlides,
  isDrawer = false,
}: SliderMediaSidebarProps) {
  const [activeTab, setActiveTab] = useState<"list" | "add-url" | "upload" | "presets">("list");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // New slide URL form
  const [urlForm, setUrlForm] = useState({
    imageUrl: "",
    title: "",
    description: "",
    buttonText: "",
    buttonLink: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

  // Copy URL to clipboard
  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success("লিংক কপি করা হয়েছে!");
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Remove slide
  const handleRemove = (index: number) => {
    const updated = slides.filter((_, i) => i !== index);
    onUpdateSlides(updated);
    toast.success("স্লাইড মুছে ফেলা হয়েছে");
  };

  // Move slide up/down
  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const updated = [...slides];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onUpdateSlides(updated);
  };

  // Direct edit field
  const handleEditField = (index: number, field: keyof HeroSlide, value: string) => {
    const updated = [...slides];
    updated[index] = { ...updated[index], [field]: value };
    onUpdateSlides(updated);
  };

  // Add from URL form
  const handleAddFromUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlForm.imageUrl.trim()) {
      toast.error("অনুগ্রহ করে ছবির লিংক বা URL দিন");
      return;
    }

    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      imageUrl: urlForm.imageUrl.trim(),
      title: urlForm.title.trim(),
      subtitle: urlForm.description.trim(),
      description: urlForm.description.trim(),
      buttonText: urlForm.buttonText.trim(),
      buttonLink: urlForm.buttonLink.trim(),
    };

    onUpdateSlides([...slides, newSlide]);
    setUrlForm({
      imageUrl: "",
      title: "",
      description: "",
      buttonText: "",
      buttonLink: "",
    });
    setActiveTab("list");
    toast.success("নতুন স্লাইডার লিংক যোগ হয়েছে!");
  };

  // Add from preset
  const handleAddPreset = (preset: typeof PRESET_GALLERY[0]) => {
    // Check if already in slides
    const exists = slides.some((s) => s.imageUrl === preset.imageUrl);
    if (exists) {
      toast("এই ছবিটি ইতিমধ্যে তালিকায় আছে", { icon: "ℹ️" });
    }
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      imageUrl: preset.imageUrl,
      title: preset.title,
      subtitle: preset.description,
      description: preset.description,
      buttonText: preset.buttonText,
      buttonLink: preset.buttonLink,
    };
    onUpdateSlides([...slides, newSlide]);
    toast.success(`"${preset.tag}" স্লাইডারে যুক্ত হয়েছে!`);
    setActiveTab("list");
  };

  // Upload file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    const toastId = toast.loading("ছবি আপলোড হচ্ছে...");
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      if (data.url) {
        if (replaceIndex !== null) {
          handleEditField(replaceIndex, "imageUrl", data.url);
          toast.success("ছবি পরিবর্তন করা হয়েছে!", { id: toastId });
          setReplaceIndex(null);
        } else {
          const newSlide: HeroSlide = {
            id: `slide-${Date.now()}`,
            imageUrl: data.url,
            title: "",
            subtitle: "",
            description: "",
            buttonText: "",
            buttonLink: "",
          };
          onUpdateSlides([...slides, newSlide]);
          toast.success("ছবি আপলোড করে স্লাইডারে যুক্ত হয়েছে!", { id: toastId });
          setActiveTab("list");
        }
      }
    } catch (error) {
      toast.error("ছবি আপলোড ব্যর্থ হয়েছে", { id: toastId });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = "";
    }
  };

  const content = (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold leading-tight flex items-center gap-1.5">
              <span>স্লাইডার মিডিয়া ও লিংক কন্ট্রোলার</span>
              <span className="bg-emerald-500/30 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded font-mono">
                {slides.length} টি
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              ব্যবহৃত সকল ছবির সরাসরি লিংক ও ফাইল নিয়ন্ত্রণ
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-slate-200 bg-slate-50 p-1.5 gap-1 shrink-0 overflow-x-auto text-[11px] font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("list")}
          className={`flex-1 py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
            activeTab === "list"
              ? "bg-white text-emerald-800 shadow-2xs font-bold border border-slate-200/80"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          <span>বর্তমান তালিকা ({slides.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`flex-1 py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
            activeTab === "upload"
              ? "bg-white text-emerald-800 shadow-2xs font-bold border border-slate-200/80"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <Upload className="w-3.5 h-3.5 text-emerald-600" />
          <span>+ ফাইল আপলোড</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("add-url")}
          className={`flex-1 py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
            activeTab === "add-url"
              ? "bg-white text-blue-800 shadow-2xs font-bold border border-slate-200/80"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
          <span>+ লিংক যোগ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("presets")}
          className={`flex-1 py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
            activeTab === "presets"
              ? "bg-white text-amber-800 shadow-2xs font-bold border border-slate-200/80"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>গ্যালারি প্রিভিউ</span>
        </button>
      </div>

      {/* Hidden File inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={replaceFileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Body Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 divide-y divide-slate-100">
        
        {/* TAB 1: CURRENT ACTIVE SLIDES LIST */}
        {activeTab === "list" && (
          <div className="space-y-3 pt-1">
            {slides.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-3 px-4">
                <ImageIcon className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                <p className="text-xs font-semibold text-slate-600">
                  বর্তমানে কোনো কাস্টম স্লাইড ছবি যোগ করা নেই
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  নতুন ছবি আপলোড করতে পারেন, সরাসরি লিংক দিতে পারেন অথবা বিল্ট-ইন গ্যালারি থেকে পছন্দের ব্যানার যোগ করতে পারেন।
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("presets")}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-bold border border-emerald-200 inline-flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>গ্যালারি থেকে যোগ করুন</span>
                  </button>
                </div>
              </div>
            ) : (
              slides.map((slide, index) => {
                const isUrl = slide.imageUrl.startsWith("http://") || slide.imageUrl.startsWith("https://");
                const isUpload = slide.imageUrl.startsWith("/uploads/") || slide.imageUrl.startsWith("uploads/");
                const isPreset = slide.imageUrl.startsWith("/images/hero/");

                return (
                  <div
                    key={slide.id || index}
                    className="bg-slate-50 hover:bg-slate-100/80 transition-all rounded-xl p-3 border border-slate-200/90 space-y-2.5 relative group"
                  >
                    {/* Top Row: Thumbnail + Info + Actions */}
                    <div className="flex items-start gap-2.5">
                      {/* Thumbnail with Zoom trigger */}
                      <div
                        className="w-20 h-14 rounded-lg bg-slate-900 overflow-hidden relative shrink-0 border border-slate-200 cursor-pointer group/thumb"
                        onClick={() => setPreviewImage(slide.imageUrl)}
                        title="ক্লিক করে বড় ছবি দেখুন"
                      >
                        <img
                          src={slide.imageUrl}
                          alt={slide.title || `Slide ${index + 1}`}
                          className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
                          onError={(e: any) => {
                            e.currentTarget.src = "/images/hero/slide1.jpg";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-3.5 h-3.5" />
                        </div>
                        <span className="absolute bottom-0.5 right-0.5 bg-black/75 text-white text-[9px] font-bold px-1 rounded font-mono">
                          #{index + 1}
                        </span>
                      </div>

                      {/* Content & Tag */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                              isUrl
                                ? "bg-blue-100 text-blue-800"
                                : isUpload
                                ? "bg-purple-100 text-purple-800"
                                : isPreset
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-200 text-slate-800"
                            }`}
                          >
                            {isUrl
                              ? "🌐 ওয়েব লিংক"
                              : isUpload
                              ? "📁 ফাইল আপলোড"
                              : isPreset
                              ? "⭐ বিল্ট-ইন ব্যানার"
                              : "ছবি"}
                          </span>

                          <span className="text-xs font-bold text-slate-800 truncate block">
                            {slide.title || `স্লাইড #${index + 1}`}
                          </span>
                        </div>

                        {/* Direct Link Preview & Copy */}
                        <div className="mt-1 flex items-center gap-1 bg-white p-1 rounded-md border border-slate-200">
                          <span className="text-[10px] text-slate-500 font-mono truncate flex-1 select-all">
                            {slide.imageUrl}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(slide.imageUrl)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-emerald-700 transition-colors"
                            title="লিংক কপি করুন"
                          >
                            {copiedUrl === slide.imageUrl ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          <a
                            href={slide.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition-colors"
                            title="নতুন ট্যাবে লিংক খুলুন"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                      {/* Order and Delete Controls */}
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleMove(index, "up")}
                            disabled={index === 0}
                            className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-200 disabled:opacity-20"
                            title="উপরে নিন"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(index, "down")}
                            disabled={index === slides.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-200 disabled:opacity-20"
                            title="নিচে নিন"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemove(index)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Inline Quick Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 border-t border-slate-200/60 text-xs">
                      <div>
                        <input
                          type="text"
                          placeholder="শিরোনাম (ঐচ্ছিক)"
                          value={slide.title || ""}
                          onChange={(e) => handleEditField(index, "title", e.target.value)}
                          className="w-full px-2 py-1 text-[11px] rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="বাটন লিংক (যেমন /register)"
                          value={slide.buttonLink || ""}
                          onChange={(e) => handleEditField(index, "buttonLink", e.target.value)}
                          className="w-full px-2 py-1 text-[11px] rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    {/* Replace Image Button */}
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setReplaceIndex(index);
                          replaceFileInputRef.current?.click();
                        }}
                        className="text-[10.5px] font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        <span>ছবি পরিবর্তন (ফাইল)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const newUrl = prompt("নতুন ইমেজ URL প্রদান করুন:", slide.imageUrl);
                          if (newUrl && newUrl.trim()) {
                            handleEditField(index, "imageUrl", newUrl.trim());
                            toast.success("লিংক পরিবর্তন করা হয়েছে!");
                          }
                        }}
                        className="text-[10.5px] font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>লিংক এডিট</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: UPLOAD IMAGE FILE */}
        {activeTab === "upload" && (
          <div className="space-y-4 pt-1">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 group"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-100 group-hover:bg-emerald-200 text-emerald-800 flex items-center justify-center mx-auto transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <h5 className="text-xs sm:text-sm font-bold text-slate-800">
                কম্পিউটার বা মোবাইল থেকে ফাইল আপলোড করুন
              </h5>
              <p className="text-[11px] text-slate-500">
                JPG, PNG, WebP ব্যানার ছবি (প্রস্তাবিত সাইজ: 1920x600px বা 16:9)
              </p>
              <button
                type="button"
                disabled={uploading}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                <span>{uploading ? "আপলোড হচ্ছে..." : "ছবি নির্বাচন করুন"}</span>
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="font-bold flex items-center gap-1 text-slate-800">
                <Info className="w-3.5 h-3.5 text-emerald-600" />
                টিপস:
              </span>
              <p className="text-[11px] text-slate-500">
                ফাইল আপলোড সফল হলে তা স্বয়ংক্রিয়ভাবে <code>/uploads/</code> ফোল্ডারে সংরক্ষিত হবে এবং স্লাইডার তালিকায় যুক্ত হয়ে যাবে।
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: ADD DIRECT URL / LINK */}
        {activeTab === "add-url" && (
          <form onSubmit={handleAddFromUrl} className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                ছবির সরাসরি লিংক / URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="https://... অথবা /images/hero/slide1.jpg"
                value={urlForm.imageUrl}
                onChange={(e) => setUrlForm({ ...urlForm, imageUrl: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-blue-200 focus:outline-none focus:border-blue-600 font-mono bg-white"
              />
            </div>

            {urlForm.imageUrl && (
              <div className="p-2 bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-2.5">
                <div className="w-16 h-10 rounded-lg bg-slate-900 overflow-hidden shrink-0">
                  <img
                    src={urlForm.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e: any) => {
                      e.currentTarget.src = "/images/hero/slide1.jpg";
                    }}
                  />
                </div>
                <span className="text-[11px] text-slate-600 font-medium truncate">
                  লাইভ ছবির প্রিভিউ
                </span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                ব্যানার শিরোনাম (Title - ঐচ্ছিক)
              </label>
              <input
                type="text"
                placeholder="উদাঃ নূরানী বোর্ড খুলনায় স্বাগতম"
                value={urlForm.title}
                onChange={(e) => setUrlForm({ ...urlForm, title: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                বিবরণ / সাবটাইটেল (Description - ঐচ্ছিক)
              </label>
              <textarea
                rows={2}
                placeholder="উদাঃ আধুনিক পদ্ধতির সাথে বিশুদ্ধ কোরআনি শিক্ষা"
                value={urlForm.description}
                onChange={(e) => setUrlForm({ ...urlForm, description: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  বাটন লেখা (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="মাদরাসা নিবন্ধন"
                  value={urlForm.buttonText}
                  onChange={(e) => setUrlForm({ ...urlForm, buttonText: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  বাটন লিংক (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="/register"
                  value={urlForm.buttonLink}
                  onChange={(e) => setUrlForm({ ...urlForm, buttonLink: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ স্লাইডে যুক্ত করুন</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: PRESETS & GALLERY */}
        {activeTab === "presets" && (
          <div className="space-y-3 pt-1">
            <p className="text-[11px] text-slate-500 leading-tight">
              নিচের যেকোনো ব্যানার বা ছবি ১-ক্লিকে স্লাইডার তালিকায় যুক্ত করুন:
            </p>

            <div className="space-y-2.5">
              {PRESET_GALLERY.map((preset, idx) => {
                const isAdded = slides.some((s) => s.imageUrl === preset.imageUrl);
                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border transition-all flex items-center gap-2.5 ${
                      isAdded
                        ? "bg-emerald-50/70 border-emerald-300"
                        : "bg-white hover:bg-slate-50 border-slate-200 shadow-2xs"
                    }`}
                  >
                    <div
                      className="w-16 h-12 rounded-lg bg-slate-900 overflow-hidden shrink-0 cursor-pointer"
                      onClick={() => setPreviewImage(preset.imageUrl)}
                      title="বড় করে দেখুন"
                    >
                      <img
                        src={preset.imageUrl}
                        alt={preset.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {preset.tag}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
                        {preset.title}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate font-mono">
                        {preset.imageUrl}
                      </p>
                    </div>

                    <div>
                      {isAdded ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-1 rounded-md">
                          <Check className="w-3 h-3" />
                          <span>যুক্ত আছে</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddPreset(preset)}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold shadow-2xs inline-flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>যোগ করুন</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Status */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
        <span>মোট সক্রিয় ছবি: <b className="text-slate-800">{slides.length}</b> টি</span>
        <button
          type="button"
          onClick={() => {
            const defaultSlides: HeroSlide[] = PRESET_GALLERY.slice(0, 3).map((p, i) => ({
              id: `slide-default-${i + 1}`,
              imageUrl: p.imageUrl,
              title: p.title,
              subtitle: p.description,
              description: p.description,
              buttonText: p.buttonText,
              buttonLink: p.buttonLink,
            }));
            onUpdateSlides(defaultSlides);
            toast.success("ডিফল্ট ৩টি ব্যানার রিসেট করা হয়েছে!");
          }}
          className="text-emerald-700 hover:text-emerald-900 font-bold inline-flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>ডিফল্ট রিসেট</span>
        </button>
      </div>

      {/* Lightbox Modal for Full Image Zoom Preview */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="max-w-3xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-2 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-black/60 text-white p-1.5 rounded-full hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Full Preview"
              className="w-full max-h-[75vh] object-contain rounded-xl"
            />
            <div className="p-3 text-center text-slate-300 text-xs font-mono select-all">
              {previewImage}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isDrawer) {
    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xs"
            />

            {/* Slide-over Drawer Panel */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-screen max-w-md sm:max-w-lg h-full"
              >
                {content}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  return content;
}
