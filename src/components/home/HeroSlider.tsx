"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import RegisterMadrasaModal from "@/components/forms/RegisterMadrasaModal";

export interface HeroSlideItem {
  id: string | number;
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
}

const defaultSlides: HeroSlideItem[] = [
  {
    id: "default-1",
    title: "নূরানী বোর্ড খুলনায় স্বাগতম",
    description: "আধুনিক পদ্ধতির সাথে বিশুদ্ধ কোরআনি শিক্ষায় নতুন প্রজন্মকে ক্ষমতায়ন করা।",
    imageUrl: "/images/hero/slide1.jpg",
    buttonText: "আরও জানুন",
    buttonLink: "/about"
  },
  {
    id: "default-2",
    title: "আপনার মাদরাসা এখনই নিবন্ধন করুন",
    description: "আজই আমাদের মাদরাসার বিশাল নেটওয়ার্কে যুক্ত হোন এবং জ্ঞান অর্জনে নিবেদিত একটি ক্রমবর্ধমান সম্প্রদায়ের অংশ হন।",
    imageUrl: "/images/hero/slide2.jpg",
    buttonText: "মাদরাসা নিবন্ধন করুন",
    buttonLink: "/register"
  },
  {
    id: "default-3",
    title: "সহজ ও দ্রুত প্রকাশনা ও প্রশ্নপত্র সেবা",
    description: "অনলাইনে বই ও প্রশ্নপত্র সেটের অর্ডার দিন এবং দ্রুত ডেলিভারি গ্রহণ করুন।",
    imageUrl: "/images/hero/slide3.jpg",
    buttonText: "প্রশ্নপত্র অর্ডার করুন",
    buttonLink: "/academic/question-order"
  },
];

function formatBgUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("url(")) return url;
  return `url('${url}')`;
}

function cleanEmojis(str?: string): string {
  if (!str) return "";
  return str
    .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]|[\uFE00-\uFE0F]/g, "")
    .trim();
}

function sanitizeSlides(items: HeroSlideItem[]): HeroSlideItem[] {
  return items.map((item) => ({
    ...item,
    title: cleanEmojis(item.title),
    subtitle: cleanEmojis(item.subtitle),
    description: cleanEmojis(item.description),
  }));
}

export default function HeroSlider({ isMadrasa = false }: { isMadrasa?: boolean }) {
  const [slides, setSlides] = useState<HeroSlideItem[]>(sanitizeSlides(defaultSlides));
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Fetch configured slides from settings API
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.heroSlides) && data.heroSlides.length > 0) {
            setSlides(sanitizeSlides(data.heroSlides));
          } else {
            setSlides(sanitizeSlides(defaultSlides));
          }
        }
      } catch (err) {
        console.error("Failed to load hero slides:", err);
      }
    }

    loadSettings();

    // Listen for live updates from settings tab
    const handleSettingsUpdated = (e: CustomEvent) => {
      if (e.detail?.heroSlides && Array.isArray(e.detail.heroSlides) && e.detail.heroSlides.length > 0) {
        setSlides(sanitizeSlides(e.detail.heroSlides));
        setCurrentSlide(0);
      }
    };

    window.addEventListener("settingsUpdated" as any, handleSettingsUpdated);
    return () => {
      window.removeEventListener("settingsUpdated" as any, handleSettingsUpdated);
    };
  }, []);

  const totalSlides = slides.length;
  const activeSlide = slides[currentSlide] || slides[0] || defaultSlides[0];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Auto-advance timer (only when not hovering)
  useEffect(() => {
    if (totalSlides <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 6000);
    return () => clearInterval(interval);
  }, [totalSlides, isHovered]);

  return (
    <>
      <div
        className="relative w-full overflow-hidden bg-slate-950 min-h-[170px] sm:min-h-[190px] md:min-h-[220px] lg:min-h-[240px] flex items-center justify-center select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Slide Background Images */}
        <AnimatePresence initial={false}>
          <motion.div
            key={activeSlide.id || currentSlide}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: formatBgUrl(activeSlide.imageUrl || "/images/hero/slide1.jpg"),
            }}
          >
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[0.5px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
          </motion.div>
        </AnimatePresence>

        {/* Content Container */}
        <div className="relative z-10 h-full w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
          <div className="min-h-[75px] sm:min-h-[85px] flex flex-col justify-center items-center mb-2 sm:mb-3 max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${activeSlide.id || currentSlide}`}
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -18, opacity: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="px-2"
              >
                {activeSlide.title && (
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold mb-1.5 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] leading-tight tracking-wide">
                    {activeSlide.title}
                  </h1>
                )}
                {(activeSlide.description || activeSlide.subtitle) && (
                  <p className="text-xs sm:text-sm md:text-base text-gray-200 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] max-w-2xl mx-auto line-clamp-2 leading-relaxed">
                    {activeSlide.description || activeSlide.subtitle}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center items-center gap-2.5 sm:gap-4 flex-wrap z-10">
            {(() => {
              const title = (activeSlide.title || "").toLowerCase();
              const btnText = (activeSlide.buttonText || "").toLowerCase();
              const btnLink = (activeSlide.buttonLink || "").toLowerCase();

              // 1. Registration Slide: title contains 'নিবন্ধন' or 'register', or link contains 'register'
              const isRegister =
                title.includes("নিবন্ধন") ||
                title.includes("register") ||
                btnLink === "/register" ||
                btnLink.includes("register") ||
                btnText.includes("নিবন্ধন");

              // 2. Book Order Slide: title contains 'বই' or 'অর্ডার' or 'অডার', or link has 'store'/'order'
              const isBookOrder =
                title.includes("বই") ||
                title.includes("অর্ডার") ||
                title.includes("অডার") ||
                title.includes("store") ||
                btnLink.includes("store") ||
                btnLink.includes("order") ||
                btnText.includes("বই") ||
                btnText.includes("অর্ডার") ||
                btnText.includes("অডার");

              // Priority 1: Registration slide (title or link)
              if (title.includes("নিবন্ধন") || (isRegister && !isBookOrder && !title.includes("স্বাগতম"))) {
                const displayText =
                  activeSlide.buttonText && activeSlide.buttonText.includes("নিবন্ধন")
                    ? activeSlide.buttonText
                    : "মাদরাসা নিবন্ধন করুন";

                return (
                  <button
                    type="button"
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-full font-bold transition-all shadow-lg text-xs md:text-sm hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{displayText}</span>
                  </button>
                );
              }

              // Priority 2: Book / Order slide (title or link)
              if (title.includes("বই") || title.includes("অর্ডার") || title.includes("অডার") || (isBookOrder && !title.includes("স্বাগতম"))) {
                const displayText =
                  activeSlide.buttonText && (activeSlide.buttonText.includes("বই") || activeSlide.buttonText.includes("অর্ডার") || activeSlide.buttonText.includes("অডার"))
                    ? activeSlide.buttonText
                    : "বই অর্ডার করুন";

                const targetLink =
                  activeSlide.buttonLink && !activeSlide.buttonLink.includes("register")
                    ? activeSlide.buttonLink
                    : "/store";

                return (
                  <Link
                    href={targetLink}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-full font-bold transition-all shadow-lg text-xs md:text-sm hover:scale-105 active:scale-95 flex items-center gap-1.5"
                  >
                    {displayText}
                  </Link>
                );
              }

              // Priority 3: Default / Welcome / Know more slide
              const displayText =
                activeSlide.buttonText && !activeSlide.buttonText.includes("নিবন্ধন") && !activeSlide.buttonText.includes("অর্ডার")
                  ? activeSlide.buttonText
                  : "আরও জানুন";

              const targetLink =
                activeSlide.buttonLink && !activeSlide.buttonLink.includes("register")
                  ? activeSlide.buttonLink
                  : "/about";

              return (
                <Link
                  href={targetLink}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-full font-bold transition-all shadow-lg text-xs md:text-sm hover:scale-105 active:scale-95 flex items-center gap-1.5"
                >
                  {displayText}
                </Link>
              );
            })()}
          </div>
        </div>

        {/* Manual Left/Right Nav Chevrons */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              aria-label="Previous Slide"
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm border border-white/10 opacity-70 hover:opacity-100 transition-all hover:scale-110 active:scale-90"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next Slide"
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm border border-white/10 opacity-70 hover:opacity-100 transition-all hover:scale-110 active:scale-90"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </>
        )}

        {/* Slide Indicators / Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-2.5 left-0 right-0 flex justify-center items-center gap-1.5 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index
                    ? "bg-emerald-400 w-7 shadow-md"
                    : "bg-white/50 hover:bg-white/80 w-2"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <RegisterMadrasaModal 
        isOpen={isRegisterModalOpen} 
        onClose={() => setIsRegisterModalOpen(false)} 
      />
    </>
  );
}
