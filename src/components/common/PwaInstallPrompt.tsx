"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone, Monitor } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const MAX_SHOW_COUNT = 3;
const DISMISS_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days (72 hours)

export default function PwaInstallPrompt() {
  // PWA install prompt is disabled
  return null;

  // eslint-disable-next-line no-unreachable
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Close modal immediately whenever route/page changes
  useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
    }
  }, [pathname]);

  // Initial app load: check installation and evaluate one-time prompt
  useEffect(() => {
    // 1. Register Service Worker for PWA
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // 2. Check if already installed
    const checkInstalled = () => {
      try {
        const isStandalone =
          window.matchMedia("(display-mode: standalone)").matches ||
          (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
          document.referrer.includes("android-app://") ||
          localStorage.getItem("nbk_pwa_installed") === "true";
        return isStandalone;
      } catch {
        return false;
      }
    };

    if (checkInstalled()) {
      setIsInstalled(true);
      return;
    }

    // 3. Detect mobile vs PC
    const ua = navigator.userAgent || "";
    const mobileDetected = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    setIsMobile(mobileDetected);

    // 4. Check prompt limits: Max 3 times ever, each after 3 days, max 1 time per session, never on admin/login/register/store
    const getShowCount = () => {
      try {
        const val = localStorage.getItem("nbk_pwa_show_count");
        return val ? parseInt(val, 10) : 0;
      } catch {
        return 0;
      }
    };

    const isCooldownActive = () => {
      try {
        const dismissedUntil = localStorage.getItem("nbk_pwa_dismissed_until");
        return !!(dismissedUntil && Date.now() < Number(dismissedUntil));
      } catch {
        return false;
      }
    };

    const canAutoShow = () => {
      if (typeof window === "undefined") return false;
      
      const currentPath = window.location.pathname || "";
      // Only auto-show on the home/landing page, never on admin or other internal pages
      if (currentPath !== "/") return false;
      if (currentPath.startsWith("/admin") || currentPath.startsWith("/login") || currentPath.startsWith("/register") || currentPath.startsWith("/store")) return false;
      if (checkInstalled()) return false;
      
      // Do not show more than once in the same browser session across page navigations
      try {
        if (sessionStorage.getItem("nbk_pwa_session_shown") === "true") return false;
      } catch {}

      if (getShowCount() >= MAX_SHOW_COUNT) return false;
      if (isCooldownActive()) return false;
      return true;
    };

    let hasTriggered = false;
    const triggerAutoOpen = () => {
      if (hasTriggered || !canAutoShow()) return;
      hasTriggered = true;

      try {
        sessionStorage.setItem("nbk_pwa_session_shown", "true");
        const currentCount = getShowCount();
        localStorage.setItem("nbk_pwa_show_count", (currentCount + 1).toString());
        localStorage.setItem("nbk_pwa_dismissed_until", (Date.now() + DISMISS_COOLDOWN_MS).toString());
      } catch {}

      setIsOpen(true);
    };

    // 5. Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (canAutoShow()) {
        setTimeout(() => {
          triggerAutoOpen();
        }, 2000);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 6. Listen for appinstalled
    const handleAppInstalled = () => {
      try {
        localStorage.setItem("nbk_pwa_installed", "true");
      } catch {}
      setIsInstalled(true);
      setIsOpen(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    // Manual open trigger (e.g. if user clicks an install button in footer or menu)
    const handleManualOpen = () => {
      setIsOpen(true);
    };
    window.addEventListener("openPwaInstallPrompt", handleManualOpen);

    // Fallback timer for browsers where beforeinstallprompt doesn't fire immediately (e.g. iOS or desktop Chrome with PWA already cached)
    let fallbackTimer: NodeJS.Timeout | null = null;
    if (canAutoShow()) {
      fallbackTimer = setTimeout(() => {
        triggerAutoOpen();
      }, 4000);
    }

    return () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("openPwaInstallPrompt", handleManualOpen);
    };
  }, []); // Run only once on initial app mount

  const handleDismiss = () => {
    // 3 days cooldown (72 hours) and lock current session
    try {
      sessionStorage.setItem("nbk_pwa_session_shown", "true");
      localStorage.setItem("nbk_pwa_dismissed_until", (Date.now() + DISMISS_COOLDOWN_MS).toString());
    } catch {}
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          localStorage.setItem("nbk_pwa_installed", "true");
          setIsInstalled(true);
          setIsOpen(false);
        } else {
          // User dismissed browser native prompt, set 3 days cooldown
          handleDismiss();
        }
      } catch {
        handleDismiss();
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

  // Never render on admin or auth pages, or if already installed, or if modal is not open
  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register") ||
    pathname?.startsWith("/store") ||
    isInstalled ||
    !isOpen
  ) {
    return null;
  }

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm"
        onClick={handleDismiss}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
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
