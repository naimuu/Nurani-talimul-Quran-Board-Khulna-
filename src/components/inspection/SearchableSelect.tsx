"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X, Loader2 } from "lucide-react";

export interface SearchableOption {
  id: string | number;
  name?: string;
  bn_name: string;
}

interface SearchableSelectProps {
  label: string;
  labelRight?: React.ReactNode;
  value: string;
  onChange: (value: string, selectedOption?: SearchableOption) => void;
  options: SearchableOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  loading?: boolean;
  required?: boolean;
  error?: string;
  allowCustom?: boolean;
}

export default function SearchableSelect({
  label,
  labelRight,
  value,
  onChange,
  options = [],
  placeholder = "-- নির্বাচন করুন --",
  searchPlaceholder = "খুঁজুন...",
  disabled = false,
  loading = false,
  required = false,
  error,
  allowCustom = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Filter options strictly based on search term (supports Bengali or English name matching with Unicode normalization)
  const normTerm = searchTerm.normalize("NFC").toLowerCase().trim();
  const normValue = (value || "").normalize("NFC").toLowerCase().trim();

  const filteredOptions = options.filter((opt) => {
    if (!normTerm) return true;
    const bnMatch = (opt.bn_name || "").normalize("NFC").toLowerCase().includes(normTerm);
    const enMatch = (opt.name || "").toLowerCase().includes(normTerm);
    return bnMatch || enMatch;
  });

  const selectedOption = options.find(
    (opt) =>
      (opt.bn_name || "").normalize("NFC").toLowerCase().trim() === normValue ||
      (opt.name && opt.name.toLowerCase().trim() === normValue) ||
      String(opt.id) === String(value)
  );

  const handleSelect = (opt: SearchableOption) => {
    onChange(opt.bn_name, opt);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-slate-700 block font-semibold text-xs sm:text-sm">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {labelRight && <div>{labelRight}</div>}
      </div>

      {/* Select Trigger Button */}
      <div
        onClick={() => {
          if (!disabled && !loading) {
            setIsOpen((prev) => !prev);
          }
        }}
        className={`w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border rounded-xl flex items-center justify-between text-sm transition cursor-pointer select-none ${
          disabled
            ? "opacity-60 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400"
            : isOpen
            ? "bg-white border-emerald-600 ring-2 ring-emerald-600/15"
            : error
            ? "border-rose-400 bg-rose-50/50"
            : "border-slate-300 hover:border-slate-400 focus:bg-white"
        }`}
      >
        <span className={`truncate ${selectedOption || value ? "text-slate-900 font-medium" : "text-slate-400"}`}>
          {loading ? (
            <span className="flex items-center gap-1.5 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>লোড হচ্ছে...</span>
            </span>
          ) : selectedOption ? (
            <span>
              {selectedOption.bn_name}
              {selectedOption.name ? (
                <span className="text-slate-400 font-normal text-[11px] ml-1">({selectedOption.name})</span>
              ) : null}
            </span>
          ) : value ? (
            <span>{value}</span>
          ) : (
            <span>{placeholder}</span>
          )}
        </span>

        <div className="flex items-center gap-1 shrink-0 ml-1.5">
          {!disabled && (value || selectedOption) && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
              title="মুছে ফেলুন"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-emerald-600" : ""
            }`}
          />
        </div>
      </div>

      {/* Floating Searchable Popover Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-300 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Search Box - Strictly for filtering, NOT for adding arbitrary text */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/70">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsOpen(false);
                  }
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* List of matching options - User MUST click to select, cannot type to add custom items */}
          <div className="max-h-52 overflow-y-auto p-1 divide-y divide-slate-50 text-xs">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected =
                  opt.bn_name === value ||
                  (opt.name && opt.name.toLowerCase() === value.toLowerCase()) ||
                  String(opt.id) === String(value);

                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelect(opt)}
                    className={`px-3 py-2 rounded-lg flex items-center justify-between cursor-pointer transition select-none ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-900 font-bold"
                        : "hover:bg-slate-100 text-slate-800"
                    }`}
                  >
                    <div>
                      <span className="font-semibold">{opt.bn_name}</span>
                      {opt.name && (
                        <span className="text-[10px] text-slate-400 ml-1.5 font-normal">({opt.name})</span>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </div>
                );
              })
            ) : allowCustom && searchTerm.trim() ? (
              <div
                onClick={() => {
                  onChange(searchTerm.trim(), { id: `custom_${Date.now()}`, bn_name: searchTerm.trim() });
                  setIsOpen(false);
                  setSearchTerm("");
                }}
                className="p-3 text-center text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg cursor-pointer transition font-bold"
              >
                + &quot;{searchTerm.trim()}&quot; নির্বাচন করুন
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-400">
                <span>কোনো ফলাফল পাওয়া যায়নি</span>
                <p className="text-[10px] text-slate-400 mt-0.5">অনুগ্রহ করে তালিকার নাম দিয়ে অনুসন্ধান করুন</p>
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-[10px] text-rose-500 mt-0.5 font-medium">{error}</p>}
    </div>
  );
}
