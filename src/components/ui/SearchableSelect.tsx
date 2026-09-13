"use client";
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function SearchableSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = "নির্বাচন করুন...", 
  searchPlaceholder = "খুঁজুন...",
  className = "",
  disabled = false
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset search when closed
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    const lowerQuery = searchQuery.toLowerCase();
    return options.filter(opt => opt.label.toLowerCase().includes(lowerQuery));
  }, [options, searchQuery]);

  return (
    <div className={`relative ${className} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary hover:bg-slate-100 transition-all ${disabled ? 'pointer-events-none' : ''} ${isOpen ? 'bg-white ring-2 ring-primary/50 border-primary' : ''}`}
      >
        <span className={`block truncate text-sm ${!selectedOption ? 'text-slate-500' : 'text-slate-800'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl py-1 max-h-60 flex flex-col animate-in fade-in slide-in-from-top-2">
          <div className="px-2 py-2 border-b border-slate-100 sticky top-0 bg-white">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 p-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500 text-center">কোনো তথ্য পাওয়া যায়নি</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between transition-colors
                    ${value === option.value ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <span className="truncate">{option.label}</span>
                  {value === option.value && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
