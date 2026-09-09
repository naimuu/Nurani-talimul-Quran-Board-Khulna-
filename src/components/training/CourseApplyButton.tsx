"use client";

import React, { useState } from "react";
import AdmissionModal from "./AdmissionModal";

interface CourseApplyButtonProps {
  batchId?: string;
  medium?: "bangla" | "arabic" | string;
  className?: string;
  children?: React.ReactNode;
}

export default function CourseApplyButton({
  batchId,
  medium,
  className,
  children
}: CourseApplyButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={className || "px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"}
      >
        {children || "আবেদন করুন"}
      </button>

      <AdmissionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        batchId={batchId}
        medium={medium}
      />
    </>
  );
}
