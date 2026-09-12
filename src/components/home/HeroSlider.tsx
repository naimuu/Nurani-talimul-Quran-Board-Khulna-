"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  },
  {
    id: "default-2",
    title: "ইসলামি শিক্ষায় শ্রেষ্ঠত্ব",
    description: "আজই আমাদের মাদরাসার বিশাল নেটওয়ার্কে যুক্ত হোন এবং জ্ঞান অর্জনে নিবেদিত একটি ক্রমবর্ধমান সম্প্রদায়ের অংশ হন।",
    imageUrl: "/images/hero/slide2.jpg",
  },
  {
    id: "default-3",
    title: "আপনার মাদরাসা এখনই নিবন্ধন করুন",
    description: "নতুন মাদরাসাগুলির জন্য সহজ নিবন্ধন প্রক্রিয়া। অনুমোদন পান এবং আমাদের নির্দেশিকায় কাজ শুরু করুন।",
    imageUrl: "/images/hero/slide3.jpg",
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

  // Safe slide index clamping if slides length changes
  useEffect(() => {
    if (currentSlide >= slides.length) {
      setCurrentSlide(0);
    }
  }, [slides.length, currentSlide]);

  // Auto-slide timer (pauses when hovered)
  useEffect(() => {
    if (slides.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length, isHovered]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const activeSlide = slides[currentSlide] || slides[0] || defaultSlides[0];

  return (
    <div
      className="relative w-full h-[210px] sm:h-[230px] md:h-[250px] overflow-hidden shadow-lg bg-gray-950 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={`bg-${activeSlide.id || currentSlide}`}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: formatBgUrl(activeSlide.imageUrl) }}
        >
          {/* Rich Multilayer Overlay for Readability & Depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
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
          {activeSlide.buttonText && activeSlide.buttonLink ? (
            <Link
              href={activeSlide.buttonLink}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-1.5 rounded-full font-bold transition-all shadow-lg text-xs md:text-sm hover:scale-105 active:scale-95"
            >
              {activeSlide.buttonText}
            </Link>
          ) : (
            <>
              {!isMadrasa && (
                <Link
                  href="/register"
                  className="bg-white hover:bg-emerald-50 text-emerald-800 px-4 py-1.5 rounded-full font-bold transition-all shadow-lg text-xs md:text-sm hover:scale-105 active:scale-95"
                >
                  মাদরাসা নিবন্ধন করুন
                </Link>
              )}
              <Link
                href="/about"
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-full font-bold transition-all shadow-md text-xs md:text-sm backdrop-blur-md border border-white/30 hover:scale-105 active:scale-95"
              >
                আরও জানুন
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Manual Left/Right Nav Chevrons (visible on hover or mobile touch) */}
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
  );
}
