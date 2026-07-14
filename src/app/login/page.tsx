"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, School, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [regNumber, setRegNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: regNumber, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.error || "লগইন ব্যর্থ হয়েছে";
        alert("ত্রুটি: " + errorMessage);
        setPopupMessage(errorMessage);
        setShowRegisterPopup(true);
        setLoading(false);
        return;
      }

      // Redirect based on role from server
      window.location.href = data.redirectUrl || "/madrasa";
    } catch (err) {
      alert("সার্ভারের সাথে সংযোগ স্থাপনে সমস্যা হয়েছে।");
      setPopupMessage("সার্ভারের সাথে সংযোগ স্থাপনে সমস্যা হয়েছে");
      setShowRegisterPopup(true);
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

      {/* Error Popup Modal */}
      {showRegisterPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center"
          >
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full mx-auto flex items-center justify-center mb-4">
              <School className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">লগইন ত্রুটি!</h2>
            <p className="text-slate-600 mb-6">
              {popupMessage}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setShowRegisterPopup(false)}
                className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors inline-flex justify-center items-center"
              >
                পুনরায় চেষ্টা করুন
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-xl z-10"
      >
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            className="w-20 h-20 bg-gradient-to-tr from-primary to-emerald-400 rounded-full mx-auto flex items-center justify-center shadow-md mb-4"
          >
            <School className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">মাদরাসা লগইন</h1>
          <p className="text-slate-500 text-sm">ড্যাশবোর্ডে প্রবেশ করতে আপনার ইলহাক নম্বর দিন</p>
        </div>

        {/* Login Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">লগইনের ধরন নির্বাচন করুন</label>
          <select
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary cursor-pointer transition-all duration-200 font-medium"
            onChange={(e) => {
              if (e.target.value !== "/login") {
                router.push(e.target.value);
              }
            }}
            defaultValue="/login"
          >
            <option value="/login">মাদরাসা লগইন</option>
            <option value="/login/muallim">মুয়াল্লিম লগইন</option>
            <option value="/login/visitor">ভিজিটর / দর্শনার্থী লগইন</option>
            <option value="/login/admin">অ্যাডমিন লগইন</option>
          </select>
        </div>



        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">

            {/* Registration Number Field */}
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-2">ইলহাক নম্বর / ফোন নম্বর</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <School className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="registrationNumber"
                  required
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  autoComplete="off"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 font-medium font-mono tracking-wider"
                  placeholder="যেমন: 12345678"
                />
              </div>
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
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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
            className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg hover:bg-primary-dark transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                যাচাই করা হচ্ছে...
              </span>
            ) : (
              <>
                <span>প্রবেশ করুন</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500">
          মাদরাসা নিবন্ধিত নয়? <a href="/register" className="text-primary hover:text-primary-dark font-medium transition-colors">মাদরাসা নিবন্ধন করুন</a>
        </p>

      </motion.div>
    </div>
  );
}
