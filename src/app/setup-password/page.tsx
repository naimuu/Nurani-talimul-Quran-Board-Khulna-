"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, School, CheckCircle2, Eye, EyeOff, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function SetupPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ilhakParam = searchParams.get("ilhak") || "";
  
  const [ilhakNumber, setIlhakNumber] = useState(ilhakParam);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (ilhakParam) {
      setIlhakNumber(ilhakParam);
    }
  }, [ilhakParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      setErrorMessage("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
      setStatus('error');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage("পাসওয়ার্ড দুটি মিলছে না। পুনরায় চেষ্টা করুন।");
      setStatus('error');
      return;
    }

    setLoading(true);
    setStatus('idle');
    
    // Simulate API call to set the password
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    setStatus('success');
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl border border-emerald-100"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-2">পাসওয়ার্ড সেট সফল!</h2>
          <p className="text-slate-600 mb-8">
            আপনার মাদরাসার অ্যাকাউন্টের পাসওয়ার্ড সফলভাবে সেট করা হয়েছে। এখন আপনি আপনার ইলহাক নম্বর এবং পাসওয়ার্ড ব্যবহার করে লগইন করতে পারবেন।
          </p>
          
          <Link
            href="/login"
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-colors flex items-center justify-center text-lg"
          >
            <Lock className="w-5 h-5 mr-2" />
            লগইন পেইজে যান
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Background blobs for aesthetics */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-xl z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full mx-auto flex items-center justify-center mb-4">
            <School className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">পাসওয়ার্ড সেটআপ</h1>
          <p className="text-slate-500 text-sm">
            প্রথমবার লগইন করার জন্য আপনার মাদরাসার অ্যাকাউন্টের পাসওয়ার্ড সেট করুন।
          </p>
        </div>

        {status === 'error' && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center text-sm">
            <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">ইলহাক নম্বর (লগইন আইডি)</label>
            <input
              type="text"
              value={ilhakNumber}
              onChange={(e) => setIlhakNumber(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono font-bold tracking-wider text-slate-800 bg-slate-50"
              placeholder="যেমন: 12345678"
              required
              readOnly={!!ilhakParam}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">নতুন পাসওয়ার্ড</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="নতুন পাসওয়ার্ড লিখুন"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">অন্তত ৬ অক্ষরের পাসওয়ার্ড দিন।</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">পাসওয়ার্ড নিশ্চিত করুন</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="পাসওয়ার্ডটি আবার লিখুন"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl mt-4 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "পাসওয়ার্ড সেট করুন"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
