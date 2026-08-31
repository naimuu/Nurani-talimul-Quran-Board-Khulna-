"use client";
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface GlassBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  heightPercentage?: number; // default 80
  className?: string;
}

export function GlassBottomSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  heightPercentage = 80,
  className = "",
}: GlassBottomSheetProps) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col justify-end">
      {/* Frosted Glass Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* 80% Screen Height Glassmorphic Bottom Card */}
      <div 
        style={{ height: `${heightPercentage}vh`, maxHeight: `${heightPercentage}vh` }}
        className={`relative bg-white/80 backdrop-blur-2xl rounded-t-3xl shadow-[0_-15px_50px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col z-10 border-t-2 border-emerald-400/80 animate-slide-up ${className}`}
      >
        {/* Header with Title & Icon */}
        <div className="p-4 bg-gradient-to-r from-[#052e23]/95 via-[#074734]/95 to-[#095738]/95 backdrop-blur-md text-white flex items-center justify-between border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-sm flex-shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-extrabold text-base leading-tight truncate">{title}</h3>
              {subtitle && <p className="text-[11px] text-emerald-200 truncate">{subtitle}</p>}
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors flex-shrink-0"
            aria-label="Close Bottom Sheet"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body with Momentum Touch */}
        <div 
          className="p-4 drawer-scroll flex-1 min-h-0 flex flex-col gap-2 pb-28 touch-pan-y"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default GlassBottomSheet;
