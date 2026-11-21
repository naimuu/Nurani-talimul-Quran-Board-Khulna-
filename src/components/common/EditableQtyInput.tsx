"use client";
import React, { useState, useEffect } from "react";

const toEnglishDigits = (str: string) => {
  const map: Record<string, string> = {
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
    "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
  };
  return str.replace(/[০-৯]/g, (m) => map[m] || m);
};

export function EditableQtyInput({
  value,
  onChange,
  onRemove,
  className = "",
  placeholder = "১",
  min = 1,
}: {
  value: number;
  onChange: (qty: number) => void;
  onRemove?: () => void;
  className?: string;
  placeholder?: string;
  min?: number;
}) {
  const [localValue, setLocalValue] = useState<string>(value > 0 ? String(value) : "");
  const [isEditing, setIsEditing] = useState(false);

  // Sync with external value when user is NOT actively typing
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(value > 0 ? String(value) : "");
    }
  }, [value, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = toEnglishDigits(e.target.value).replace(/\D/g, "");
    setLocalValue(raw); // Allows empty string while user is deleting / typing
    if (raw !== "") {
      const num = parseInt(raw, 10);
      if (!isNaN(num) && num >= min) {
        onChange(num);
      }
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (!localValue || localValue.trim() === "") {
      // User left it blank
      if (onRemove) {
        onRemove();
      } else {
        const fallback = Math.max(min, value || min);
        setLocalValue(String(fallback));
        onChange(fallback);
      }
    } else {
      const num = parseInt(localValue, 10);
      if (isNaN(num) || num < min) {
        if (num === 0 && onRemove) {
          onRemove();
        } else {
          setLocalValue(String(min));
          onChange(min);
        }
      } else {
        setLocalValue(String(num));
        onChange(num);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={localValue}
      placeholder={placeholder}
      onFocus={(e) => {
        setIsEditing(true);
        e.target.select();
      }}
      onClick={(e) => e.stopPropagation()}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={className}
    />
  );
}
