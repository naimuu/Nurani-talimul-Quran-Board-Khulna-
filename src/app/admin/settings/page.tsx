"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin?tab=settings");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-slate-500">Redirecting to admin dashboard...</p>
    </div>
  );
}
