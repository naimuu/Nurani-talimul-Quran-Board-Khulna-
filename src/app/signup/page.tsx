"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, UserCircle2, ArrowRight, User } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("পাসওয়ার্ড দুটি মিলছে না!");
      return;
    }

    // Validate phone number if provided
    if (phone && !/^01[3-9]\d{8}$/.test(phone)) {
      setError("ফোন নম্বরটি সঠিক নয়। ১১ সংখ্যার বাংলাদেশী নম্বর দিন (যেমন: 01870186441)");
      return;
    }

    if (!email && !phone) {
      setError("ইমেইল অথবা ফোন নম্বর দিন");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: email || undefined, phone: phone || undefined, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "অ্যাকাউন্ট তৈরি ব্যর্থ হয়েছে");
        setLoading(false);
        return;
      }
      // Redirect to login after successful registration
      router.push("/login/general?registered=true");
    } catch {
      setError("সার্ভারের সাথে সংযোগে সমস্যা");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Background blobs for aesthetics */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-xl z-10 my-8"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            className="w-20 h-20 bg-gradient-to-tr from-primary to-emerald-400 rounded-full mx-auto flex items-center justify-center shadow-md mb-4"
          >
            <UserCircle2 className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">নতুন অ্যাকাউন্ট</h1>
          <p className="text-slate-500 text-sm">সিস্টেমে যুক্ত হতে আপনার তথ্য দিন</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-8 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5" autoComplete="off">
          <div className="space-y-4">


            {/* Name Field */}
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-2">পুরো নাম</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  placeholder="আপনার নাম লিখুন"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-2">ইমেইল অ্যাড্রেস <span className="text-slate-400 font-normal text-xs">(নির্বাচনমূলক)</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  name="signupEmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  placeholder="আপনার ইমেইল লিখুন"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-2">মোবাইল নম্বর <span className="text-slate-400 font-normal text-xs">(নির্বাচনমূলক)</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 text-sm font-medium">📱</span>
                </div>
                <input
                  type="tel"
                  name="signupPhone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="off"
                  maxLength={11}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  placeholder="যেমন: 01870186441"
                />
              </div>
              {phone && !/^01[3-9]\d{8}$/.test(phone) && phone.length > 0 && (
                <p className="text-xs text-amber-600 mt-1">১১ সংখ্যার বাংলাদেশী নম্বর দিন (01XXXXXXXXX)</p>
              )}
            </div>

            {/* Password Field */}
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-2">পাসওয়ার্ড</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  name="signupPassword"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            {/* Confirm Password Field */}
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-2">পাসওয়ার্ড নিশ্চিত করুন</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  name="signupConfirmPassword"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg hover:bg-primary-dark transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                অ্যাকাউন্ট তৈরি হচ্ছে...
              </span>
            ) : (
              <>
                <span>অ্যাকাউন্ট তৈরি করুন</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500">
          ইতিমধ্যেই অ্যাকাউন্ট আছে? <Link href="/login" className="text-primary hover:text-primary-dark font-medium transition-colors">লগইন করুন</Link>
        </p>
      </motion.div>
    </div>
  );
}
