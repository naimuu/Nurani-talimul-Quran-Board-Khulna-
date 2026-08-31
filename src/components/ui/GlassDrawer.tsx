"use client";
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface GlassDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  widthPercentage?: number; // default 80
  className?: string;
}

export function GlassDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  widthPercentage = 80,
  className = "",
}: GlassDrawerProps) {
  // Lock background body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div 
      className={`fixed inset-0 z-[60] flex transition-all duration-300 ${
        isOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
      }`}
    >
      {/* Frosted Glass Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-950/50 backdrop-blur-md transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`} 
        onClick={onClose}
      />

      {/* 80% Screen Width Glassmorphic Container */}
      <div 
        style={{ width: `${widthPercentage}vw`, maxWidth: `${widthPercentage}vw` }}
        className={`relative bg-white/85 backdrop-blur-2xl h-full shadow-[20px_0_50px_rgba(0,0,0,0.3)] border-r border-white/60 flex flex-col overflow-hidden transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${className}`}
      >
        {/* Header */}
        {(title || icon) && (
          <div className="sticky top-0 z-10 px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between border-b border-white/10 bg-[#052e23]/95 backdrop-blur-md text-white flex-shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              {icon && <div className="flex-shrink-0">{icon}</div>}
              <div className="flex flex-col min-w-0">
                {title && <span className="font-bold text-sm sm:text-base leading-tight truncate">{title}</span>}
                {subtitle && <span className="text-[10px] sm:text-[11px] text-emerald-200 truncate">{subtitle}</span>}
              </div>
            </div>
            <button 
              className="text-white hover:text-amber-300 p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
              onClick={onClose}
              aria-label="Close Drawer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Scrollable Content Body with Momentum Touch */}
        <div 
          className="flex-1 min-h-0 drawer-scroll p-4 pb-28 touch-pan-y"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default GlassDrawer;
