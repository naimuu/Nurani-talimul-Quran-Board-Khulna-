"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone, Monitor } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // 1. Register Service Worker for PWA
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // 2. Check if already installed
    const checkInstalled = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes("android-app://") ||
        localStorage.getItem("nbk_pwa_installed") === "true";
      return isStandalone;
    };

    if (checkInstalled()) {
      setIsInstalled(true);
      return;
    }

    // 3. Detect mobile vs PC
    const ua = navigator.userAgent || "";
    const mobileDetected = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    setIsMobile(mobileDetected);

    // 4. Check dismiss cooldown (24h)
    const dismissedUntil = localStorage.getItem("nbk_pwa_dismissed_until");
    const isCooldown = dismissedUntil && Date.now() < Number(dismissedUntil);

    // 5. Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isCooldown && !checkInstalled()) {
        setTimeout(() => setIsOpen(true), 1200);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 6. Listen for appinstalled
    const handleAppInstalled = () => {
      localStorage.setItem("nbk_pwa_installed", "true");
      setIsInstalled(true);
      setIsOpen(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    // Manual open trigger
    const handleManualOpen = () => {
      setIsOpen(true);
    };
    window.addEventListener("openPwaInstallPrompt", handleManualOpen);

    // Fallback timer if prompt event doesn't fire immediately (e.g. Chrome desktop / Safari)
    if (!isCooldown && !checkInstalled()) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("openPwaInstallPrompt", handleManualOpen);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("openPwaInstallPrompt", handleManualOpen);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          localStorage.setItem("nbk_pwa_installed", "true");
          setIsInstalled(true);
          setIsOpen(false);
        }
      } catch {
        // user or browser handled
      } finally {
        setDeferredPrompt(null);
      }
    } else {
      // Direct action: close and mark prompt attempted
      localStorage.setItem("nbk_pwa_installed", "true");
      setIsInstalled(true);
      setIsOpen(false);
    }
  };

  const handleDismiss = () => {
    // 24 hour cooldown
    localStorage.setItem("nbk_pwa_dismissed_until", (Date.now() + 24 * 60 * 60 * 1000).toString());
    setIsOpen(false);
  };

  // If already installed, never show
  if (isInstalled || !isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden p-6 text-center"
          role="dialog"
          aria-modal="true"
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo with gentle pulse */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 p-2 shadow-inner flex items-center justify-center mb-4">
            <Image
              src="/images/logo.svg"
              alt="নূরানী বোর্ড"
              width={56}
              height={56}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Device Type Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/70 text-emerald-800 mb-2">
            {isMobile ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
            <span>{isMobile ? "মোবাইল অ্যাপ্লিকেশন" : "ডেস্কটপ সফটওয়্যার"}</span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            {isMobile ? "নূরানী বোর্ড অ্যাপ ইনস্টল করুন" : "ডেস্কটপ সফটওয়্যার ইনস্টল করুন"}
          </h3>

          <p className="text-xs text-slate-500 mb-6">
            {isMobile
              ? "ফোনে দ্রুত ও সহজে ব্যবহারের জন্য সরাসরি ইনস্টল করুন"
              : "কম্পিউটারে ১-ক্লিকে ব্যবহারের জন্য সরাসরি ইনস্টল করুন"}
          </p>

          {/* Direct Actions: Install & Later */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleInstall}
              className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:scale-[0.99] text-white font-semibold rounded-2xl shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 transition-all text-sm"
            >
              <Download className="w-4 h-4" />
              <span>{isMobile ? "সরাসরি ইনস্টল করুন" : "ডেস্কটপে ইনস্টল করুন"}</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="w-full py-2.5 px-4 text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-medium rounded-xl transition-colors text-xs"
            >
              পরে
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
