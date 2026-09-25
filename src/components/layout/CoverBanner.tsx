"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface Settings {
  coverUrl?: string;
  showCoverAboveNavbar?: boolean;
  showCoverInPageHeader?: boolean;
}

// ─── Shared hook ─────────────────────────────────────────────────────────────
function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => {});

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Settings>).detail;
      if (detail) setSettings((prev) => ({ ...prev, ...detail }));
    };
    window.addEventListener("settingsUpdated", handler);
    return () => window.removeEventListener("settingsUpdated", handler);
  }, []);

  return settings;
}

// ─── Cover height ─────────────────────────────────────────────────────────────
const COVER_H = 100; // px

// ─── 1. Cover bar — hides on scroll, reappears at top ────────────────────────
export function CoverTopBar() {
  const pathname = usePathname();
  const settings = useSettings();
  const [scrollY, setScrollY] = useState(0);

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    
    // Auto collapse after 3 seconds
    const timer = setTimeout(() => {
      setCollapsed(true);
    }, 3000);
    
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/visitor')) return null;

  // Un-collapse if the user pulls down (overscroll)
  useEffect(() => {
    if (scrollY < 0 && collapsed) {
      setCollapsed(false);
    }
  }, [scrollY, collapsed]);

  if (!settings?.coverUrl || !settings?.showCoverAboveNavbar) return null;

  // When scrollY < 0 (overscroll at top), we increase the height/scale of the image.
  const isOverscrolling = scrollY < 0;
  const overscrollAmount = isOverscrolling ? Math.abs(scrollY) : 0;
  
  // Dampen the overscroll for a "magnetic" resistance feel
  const dampenedOverscroll = Math.pow(overscrollAmount, 0.85);
  
  const scale = isOverscrolling ? 1 + dampenedOverscroll / 100 : 1;
  const translateY = isOverscrolling ? dampenedOverscroll / 2 : 0;
  
  // Gradually reveal the hidden top/bottom borders (from -2% to 0%) when expanded
  const marginReveal = isOverscrolling ? Math.min(0, -2 + (dampenedOverscroll / 20)) : -2;

  // We want the grid transition to be smooth when collapsing, but instant when pulling (overscrolling)
  // so it doesn't fight the magnetic drag.
  const gridTransition = isOverscrolling ? "none" : "grid-template-rows 0.8s cubic-bezier(0.4, 0, 0.2, 1)";

  return (
    <div
      className="bg-primary flex justify-center items-end"
      style={{
        width: "100%",
        position: "relative",
        display: "grid",
        gridTemplateRows: (collapsed && !isOverscrolling) ? "0fr" : "1fr",
        transition: gridTransition,
      }}
    >
      <div style={{ width: "100%", position: "relative", overflow: isOverscrolling ? "visible" : "hidden" }}>
        <img
          src={settings.coverUrl}
          alt="Board Cover"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            objectFit: "contain",
            transform: `scale(${scale}) translateY(${translateY}px)`,
            transformOrigin: "bottom center",
            willChange: "transform, margin",
            marginTop: `${marginReveal}%`, 
            marginBottom: `${marginReveal}%`, 
          }}
        />
      </div>
    </div>
  );
}

// ─── 2. Horizontally scrolling sliding banner for page headers ───────────────
export function PageCoverHeader() {
  const pathname = usePathname();
  const settings = useSettings();

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/visitor')) return null;
  if (!settings?.coverUrl || !settings?.showCoverInPageHeader) return null;

  return (
    <div className="w-full overflow-hidden bg-green-900 relative" style={{ height: "80px" }}>
      <div className="flex h-full" style={{ animation: "slideLoop 25s linear infinite" }}>
        <img
          src={settings.coverUrl}
          alt="Board Cover"
          className="h-full object-cover flex-shrink-0"
          style={{ minWidth: "100vw", objectPosition: "50% -20px" }}
        />
        <img
          src={settings.coverUrl}
          alt="Board Cover"
          aria-hidden
          className="h-full object-cover flex-shrink-0"
          style={{ minWidth: "100vw", objectPosition: "50% -20px" }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none" />
      <style>{`
        @keyframes slideLoop {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
