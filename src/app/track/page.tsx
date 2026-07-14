"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import PrintableReceipt from "@/components/forms/PrintableReceipt";

export default function TrackApplicationPage() {
  const [trackingId, setTrackingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    setLoading(true);
    setError("");
    setApplication(null);

    try {
      const res = await fetch(`/api/madrasa/track?trackingId=${trackingId.trim()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setApplication(data.application);
      } else {
        setError(data.error || "কোনো আবেদন পাওয়া যায়নি।");
      }
    } catch (err) {
      setError("সার্ভারে সংযোগ করা যায়নি। পরে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    PENDING:  { label: "অপেক্ষমান",  icon: Clock,         color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200" },
    APPROVED: { label: "অনুমোদিত",   icon: CheckCircle2,  color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
    REJECTED: { label: "বাতিলকৃত",   icon: XCircle,       color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200" },
  } as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 print:bg-white print:p-0">
      {/* Header (hidden on print) */}
      <div className="print:hidden bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">আবেদনের অবস্থা যাচাই</h1>
              <p className="text-slate-500 text-sm">আপনার ট্র্যাকিং নম্বর দিয়ে আবেদনের অবস্থা দেখুন ও কপি প্রিন্ট করুন</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 print:p-0">
        {/* Search Box (hidden on print) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="print:hidden bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8"
        >
          <h2 className="text-xl font-bold text-slate-800 mb-2">ট্র্যাকিং নম্বর দিয়ে খুঁজুন</h2>
          <p className="text-slate-500 text-sm mb-6">
            আবেদন সম্পন্ন হওয়ার পর আপনার প্রাপ্ত ৮ সংখ্যার ট্র্যাকিং নম্বরটি নিচে লিখুন।
          </p>
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              id="track-tracking-id"
              type="text"
              value={trackingId}
              onChange={e => setTrackingId(e.target.value)}
              placeholder="উদাহরণ: ১২৩৪৫৬৭৮"
              className="flex-1 border-2 border-slate-200 focus:border-emerald-500 rounded-xl px-5 py-3.5 text-lg font-mono tracking-widest outline-none transition-colors"
              maxLength={8}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !trackingId.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold px-8 rounded-xl transition-colors flex items-center gap-2 text-lg"
            >
              {loading ? (
                <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : <Search className="w-5 h-5" />}
              খুঁজুন
            </motion.button>
          </form>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Status Banner */}
        <AnimatePresence>
          {application && (
            <>
              {/* Status Banner (hidden on print) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`print:hidden mb-6 rounded-2xl border-2 p-6 flex items-center gap-4 ${statusConfig[application.status as keyof typeof statusConfig]?.bg} ${statusConfig[application.status as keyof typeof statusConfig]?.border}`}
              >
                {(() => {
                  const cfg = statusConfig[application.status as keyof typeof statusConfig];
                  if (!cfg) return null;
                  const Icon = cfg.icon;
                  return (
                    <>
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${cfg.bg}`}>
                        <Icon className={`w-8 h-8 ${cfg.color}`} />
                      </div>
                      <div>
                        <p className="text-slate-500 text-sm">আপনার আবেদনের বর্তমান অবস্থা</p>
                        <p className={`text-3xl font-extrabold ${cfg.color}`}>{cfg.label}</p>
                        {application.status === 'APPROVED' && application.code && (
                          <p className="text-slate-600 mt-1">নিবন্ধন কোড: <span className="font-bold font-mono text-emerald-700">{application.code}</span></p>
                        )}
                        {application.status === 'PENDING' && (
                          <p className="text-slate-500 text-sm mt-1">আপনার আবেদনটি পর্যালোচনা করা হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন।</p>
                        )}
                      </div>
                    </>
                  );
                })()}
              </motion.div>

              {/* Receipt */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 print:p-0 print:shadow-none print:border-none"
              >
                <PrintableReceipt application={application} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!application && !loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="print:hidden text-center py-20 text-slate-400"
          >
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">আবেদনের অবস্থা দেখতে উপরে ট্র্যাকিং নম্বর লিখুন</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
