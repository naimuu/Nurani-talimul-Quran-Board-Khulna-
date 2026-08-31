"use client";
import React from 'react';
import Link from 'next/link';

interface PillButtonProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'glass' | 'white';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export function PillButton({
  children,
  variant = 'emerald',
  size = 'md',
  icon,
  href,
  onClick,
  className = "",
  isActive = false,
  type = 'button',
  disabled = false,
}: PillButtonProps) {
  const sizeStyles = {
    sm: "px-3 py-1 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  };

  const variantStyles = {
    emerald: "bg-[#095738] hover:bg-[#06422b] text-white shadow-md active:scale-95",
    amber: "bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-md active:scale-95",
    glass: "bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white border border-white/15 backdrop-blur-sm active:scale-95",
    white: "bg-white text-[#095738] hover:bg-emerald-50 border border-slate-200 shadow-sm active:scale-95",
  };

  const activeStyle = isActive 
    ? "!bg-amber-400 !text-slate-950 !font-extrabold shadow-md !border-amber-400" 
    : "";

  const combinedClass = `inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 select-none ${sizeStyles[size]} ${variantStyles[variant]} ${activeStyle} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClass}>
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClass}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

export default PillButton;
