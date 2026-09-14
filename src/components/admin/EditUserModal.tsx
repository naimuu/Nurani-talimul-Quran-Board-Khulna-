"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Phone, Lock, Building2, CheckCircle2, ShieldCheck, Search, KeyRound, AlertCircle, Link2, Unlink } from "lucide-react";

export interface EditUserModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedUser: any) => void;
  madrasas: any[];
  onOpenCreateMadrasa?: () => void;
}

export default function EditUserModal({
  user,
  isOpen,
  onClose,
  onSuccess,
  madrasas,
  onOpenCreateMadrasa,
}: EditUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("GENERAL");
  const [selectedMadrasaId, setSelectedMadrasaId] = useState<string>("");
  const [customMadrasaName, setCustomMadrasaName] = useState("");
  const [madrasaSearch, setMadrasaSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Initialize form when user changes
  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone === "-" ? "" : user.phone || "");
      setPassword("");
      setRole((user.role || "GENERAL").toUpperCase());
      
      const mId = user.madrasaId?._id || user.madrasaId || "";
      setSelectedMadrasaId(typeof mId === "string" ? mId : mId?.toString?.() || "");
      setCustomMadrasaName(user.madrasaName || user.instituteName || "");
      setMadrasaSearch("");
      setErrorMessage("");
    }
  }, [user, isOpen]);

  // Currently linked madrasa object
  const currentLinkedMadrasa = useMemo(() => {
    if (!selectedMadrasaId) return null;
    return madrasas.find((m) => (m._id || m.id) === selectedMadrasaId) || null;
  }, [selectedMadrasaId, madrasas]);

  // Filtered madrasas list for selection
  const filteredMadrasas = useMemo(() => {
    if (!madrasaSearch.trim()) return madrasas.slice(0, 50);
    const q = madrasaSearch.toLowerCase().trim();
    return madrasas.filter((m) => {
      const name = (m.name || "").toLowerCase();
      const code = (m.code || m.trackingId || "").toLowerCase();
      const dist = (m.district || "").toLowerCase();
      const upz = (m.upazila || "").toLowerCase();
      return name.includes(q) || code.includes(q) || dist.includes(q) || upz.includes(q);
    }).slice(0, 50);
  }, [madrasas, madrasaSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage("ইমেইল ঠিকানা আবশ্যক");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const payload: any = {
        userId: user._id,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        role: role.toUpperCase(),
      };

      if (password && password.trim().length > 0) {
        payload.password = password.trim();
      }

      if (selectedMadrasaId) {
        payload.madrasaId = selectedMadrasaId;
        if (currentLinkedMadrasa) {
          payload.madrasaName = currentLinkedMadrasa.name;
        }
      } else {
        payload.madrasaId = "";
        payload.madrasaName = customMadrasaName.trim() || "";
      }

      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ইউজার আপডেট করতে ব্যর্থ হয়েছে");
      }

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "একটি ত্রুটি ঘটেছে");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !user) return null;

  const isMasterAdmin = user._id === "master_admin_id";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative z-10 flex flex-col max-h-[92vh] overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base sm:text-lg flex items-center gap-2">
                  <span>ইউজারের তথ্য ও ইলহাক সম্পাদনা</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {user.name || "ইউজার"}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  প্রোফাইল তথ্য, রোল এবং মাদরাসা ও ইলহাক কোড সংযুক্ত বা পরিবর্তন করুন
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                মৌলিক তথ্য
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    পূর্ণ নাম <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="ইউজারের নাম"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 bg-slate-50 focus:bg-white transition-all font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ইমেইল ঠিকানা <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isMasterAdmin}
                      placeholder="example@mail.com"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 bg-slate-50 focus:bg-white transition-all font-mono text-slate-800 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ফোন নম্বর
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 bg-slate-50 focus:bg-white transition-all font-mono text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    নতুন পাসওয়ার্ড (ঐচ্ছিক)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="অপরিবর্তিত রাখতে খালি রাখুন"
                      className="w-full pl-9 pr-14 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 bg-slate-50 focus:bg-white transition-all font-mono text-slate-800"
                    />
                    {password && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        {showPassword ? "লুকান" : "দেখুন"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Role Assignment */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                ইউজারের ধরন ও রোল (ROLE)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "GENERAL", label: "সাধারণ / পেন্ডিং", desc: "সীমিত এক্সেস" },
                  { id: "MADRASA", label: "মাদরাসা", desc: "মাদরাসা প্যানেল" },
                  { id: "MUALLIM", label: "মুয়াল্লিম", desc: "শিক্ষক প্যানেল" },
                  { id: "TRAINER", label: "প্রশিক্ষক", desc: "প্রশিক্ষণ কোর্স" },
                  { id: "VISITOR", label: "পরিদর্শক", desc: "রিপোর্ট ও পরিদর্শন" },
                  { id: "ADMIN", label: "অ্যাডমিন", desc: "প্রশাসনিক এক্সেস" },
                ].map((r) => (
                  <label
                    key={r.id}
                    className={`flex flex-col p-2.5 rounded-xl border cursor-pointer transition-all ${
                      role === r.id
                        ? "bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200 shadow-2xs"
                        : "bg-white hover:bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">{r.label}</span>
                      <input
                        type="radio"
                        name="userRole"
                        value={r.id}
                        checked={role === r.id}
                        onChange={(e) => setRole(e.target.value)}
                        disabled={isMasterAdmin && r.id !== "ADMIN"}
                        className="text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500">{r.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Ilhak / Madrasa Affiliation */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-700" />
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    মাদরাসা ও ইলহাক সংযুক্তি (Ilhak Affiliation)
                  </h4>
                </div>
                {onOpenCreateMadrasa && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCreateMadrasa();
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
                  >
                    + নতুন ইলহাক ফরম পূরণ করুন
                  </button>
                )}
              </div>

              {/* Current Connected Status Card */}
              {selectedMadrasaId && currentLinkedMadrasa ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-extrabold text-emerald-950 truncate">
                          {currentLinkedMadrasa.name}
                        </span>
                        {currentLinkedMadrasa.code && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-200/80 text-emerald-900 border border-emerald-300">
                            ইলহাক কোড: {currentLinkedMadrasa.code}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-emerald-700 truncate mt-0.5">
                        {[currentLinkedMadrasa.upazila, currentLinkedMadrasa.district].filter(Boolean).join(", ") || "ঠিকানা অন্তর্ভুক্ত"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMadrasaId("");
                    }}
                    className="px-2.5 py-1 text-[11px] font-bold text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border border-red-200 rounded-lg shrink-0 transition-colors flex items-center gap-1"
                    title="ইলহাক সংযোগ বিচ্ছিন্ন করুন"
                  >
                    <Unlink className="w-3 h-3" />
                    <span>মুছে ফেলুন</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-500 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>বর্তমানে কোনো নির্দিষ্ট ইলহাক কোড বা অনুমোদিত মাদরাসা সংযুক্ত নেই। নিচে থেকে নির্বাচন করুন:</span>
                </div>
              )}

              {/* Madrasa Search & Selection */}
              <div className="space-y-2 bg-slate-50/70 p-3 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700">
                  নিবন্ধিত মাদরাসা তালিকা থেকে যুক্ত করুন:
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="মাদরাসার নাম, কোড বা জেলা দিয়ে খুঁজুন..."
                    value={madrasaSearch}
                    onChange={(e) => setMadrasaSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-600 transition-all font-medium"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 bg-white rounded-xl border border-slate-200 shadow-inner">
                  {filteredMadrasas.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400">
                      কোনো মাদরাসা পাওয়া যায়নি
                    </div>
                  ) : (
                    filteredMadrasas.map((m) => {
                      const mId = m._id || m.id;
                      const isSelected = selectedMadrasaId === mId;
                      return (
                        <button
                          type="button"
                          key={mId}
                          onClick={() => {
                            setSelectedMadrasaId(mId);
                            setCustomMadrasaName(m.name);
                            if (role === "GENERAL") {
                              setRole("MADRASA");
                            }
                          }}
                          className={`w-full text-left p-2.5 text-xs flex items-center justify-between gap-2 transition-colors ${
                            isSelected
                              ? "bg-emerald-50 text-emerald-900 font-bold"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="block truncate font-bold text-slate-800">{m.name}</span>
                            <span className="text-[10.5px] text-slate-500 font-medium">
                              {[m.upazila, m.district].filter(Boolean).join(", ")}
                            </span>
                          </div>
                          {m.code && (
                            <span className="shrink-0 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {m.code}
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>সংরক্ষণ হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✓ তথ্য ও ইলহাক সংরক্ষণ করুন</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
