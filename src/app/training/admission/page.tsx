"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AdmissionModal from "@/components/training/AdmissionModal";

function AdmissionPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const batchId = searchParams.get("batchId") || undefined;
  const medium = searchParams.get("medium") || undefined;

  const handleClose = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/training/moallem-bangla");
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <AdmissionModal
        isOpen={true}
        onClose={handleClose}
        batchId={batchId}
        medium={medium}
      />
    </div>
  );
}

export default function AdmissionPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400 font-bold">লোড হচ্ছে...</div>}>
      <AdmissionPageContent />
    </Suspense>
  );
}
