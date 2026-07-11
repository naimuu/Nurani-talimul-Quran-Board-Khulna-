"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const slides = [
  {
    id: 1,
    title: "খুলনা নূরানী বোর্ডে স্বাগতম",
    description: "আধুনিক পদ্ধতির সাথে বিশুদ্ধ কোরআনি শিক্ষায় নতুন প্রজন্মকে ক্ষমতায়ন করা।",
    bgImage: "url('https://images.unsplash.com/photo-1585036156171-384164a8c675?q=80&w=2000&auto=format&fit=crop')",
  },
  {
    id: 2,
    title: "ইসলামি শিক্ষায় শ্রেষ্ঠত্ব",
    description: "আজই আমাদের মাদরাসার বিশাল নেটওয়ার্কে যুক্ত হোন এবং জ্ঞান অর্জনে নিবেদিত একটি ক্রমবর্ধমান সম্প্রদায়ের অংশ হন।",
    bgImage: "url('https://images.unsplash.com/photo-1577901529141-8f3521d96078?q=80&w=2000&auto=format&fit=crop')",
  },
  {
    id: 3,
    title: "আপনার মাদরাসা এখনই নিবন্ধন করুন",
    description: "নতুন মাদরাসাগুলির জন্য সহজ নিবন্ধন প্রক্রিয়া। অনুমোদন পান এবং আমাদের নির্দেশিকায় কাজ শুরু করুন।",
    bgImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2000&auto=format&fit=crop')",
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[200px] overflow-hidden shadow-lg bg-gray-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: slides[currentSlide].bgImage }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 bg-gradient-to-r from-primary-dark/80 to-black/50" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full container mx-auto px-4 flex flex-col justify-center items-center text-center">
        <div className="h-[80px] flex flex-col justify-center mb-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${currentSlide}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="max-w-3xl"
            >
              <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold mb-1 text-white drop-shadow-lg leading-tight">
                {slides[currentSlide].title}
              </h1>
              <p className="text-sm md:text-base text-gray-200 drop-shadow-md hidden md:block">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Static Buttons */}
        <div className="flex justify-center gap-4 flex-wrap">
          <Link 
            href="/register" 
            className="bg-white hover:bg-gray-100 text-primary px-4 py-1.5 rounded-full font-bold transition-all shadow-md text-xs md:text-sm hover:scale-105"
          >
            মাদরাসা নিবন্ধন করুন
          </Link>
          <Link 
            href="/about" 
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-full font-bold transition-all shadow-md text-xs md:text-sm backdrop-blur-md border border-white/30 hover:scale-105"
          >
            আরও জানুন
          </Link>
        </div>
      </div>
      
      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              currentSlide === index ? "bg-white scale-125 w-8" : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
