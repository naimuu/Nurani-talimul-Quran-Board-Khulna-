"use client";
import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  className?: string;
  variant?: 'light' | 'emerald' | 'dark' | 'amber';
}

export function GlassCard({
  children,
  hoverable = true,
  className = "",
  variant = 'light',
  ...props
}: GlassCardProps) {
  const variantStyles = {
    light: "bg-white/80 backdrop-blur-xl border border-white/80 text-slate-800 shadow-sm",
    emerald: "bg-[#095738]/85 backdrop-blur-xl border border-white/20 text-white shadow-md",
    dark: "bg-[#052e23]/90 backdrop-blur-xl border border-white/10 text-white shadow-xl",
    amber: "bg-amber-400/90 backdrop-blur-xl border border-amber-300 text-slate-950 shadow-md",
  };

  const hoverStyle = hoverable 
    ? "hover:shadow-xl hover:-translate-y-1 transition-all duration-300 active:scale-[0.99]" 
    : "";

  return (
    <div 
      className={`rounded-2xl p-4 md:p-6 ${variantStyles[variant]} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default GlassCard;
