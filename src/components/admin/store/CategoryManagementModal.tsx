"use client";
import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Edit2, Check, Layers, Tag, BookOpen, AlertCircle, Loader2 } from "lucide-react";

export interface StoreCategoryItem {
  id?: string;
  name: string;
  isClassWise: boolean;
  subTabs: string[];
  createdAt?: string;
}

export default function CategoryManagementModal({
  open,
  onClose,
  onCategoriesUpdated,
}: {
  open: boolean;
  onClose: () => void;
  onCategoriesUpdated?: () => void;
}) {
  const [categories, setCategories] = useState<StoreCategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state for creating / editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [isClassWise, setIsClassWise] = useState(false);
  const [subTabs, setSubTabs] = useState<string[]>([]);
  const [newSubTabInput, setNewSubTabInput] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/store/categories?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch {
      setError("ক্যাটাগরি লোড করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCategories();
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setIsClassWise(false);
    setSubTabs([]);
    setNewSubTabInput("");
    setError(null);
  };

  const startEdit = (cat: StoreCategoryItem) => {
    setEditingId(cat.id || null);
    setName(cat.name);
    setIsClassWise(Boolean(cat.isClassWise));
    setSubTabs(Array.isArray(cat.subTabs) ? [...cat.subTabs] : []);
    setNewSubTabInput("");
    setError(null);
  };

  const handleAddSubTab = () => {
    const trimmed = newSubTabInput.trim();
    if (!trimmed) return;
    if (subTabs.includes(trimmed)) {
      setError("এই সাব-ট্যাবটি ইতিমধ্যে তালিকায় আছে।");
      return;
    }
    setSubTabs(prev => [...prev, trimmed]);
    setNewSubTabInput("");
    setError(null);
  };

  const handleRemoveSubTab = (indexToRemove: number) => {
    setSubTabs(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("ক্যাটাগরির নাম আবশ্যিক।");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingId) {
        // Update existing
        const res = await fetch("/api/store/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            name: name.trim(),
            isClassWise,
            subTabs,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "আপডেট করা যায়নি");
        }
        setSuccess("ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে!");
      } else {
        // Create new
        const res = await fetch("/api/store/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            isClassWise,
            subTabs,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "সংরক্ষণ করা যায়নি");
        }
        setSuccess("নতুন ক্যাটাগরি সফলভাবে তৈরি করা হয়েছে!");
      }

      resetForm();
      await fetchCategories();
      if (onCategoriesUpdated) onCategoriesUpdated();
    } catch (err: any) {
      setError(err.message || "সংরক্ষণ করতে ব্যর্থ হয়েছে।");
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("আপনি কি নিশ্চিত এই ক্যাটাগরি মুছে ফেলতে চান?")) return;

    try {
      const res = await fetch(`/api/store/categories?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== id));
        if (editingId === id) resetForm();
        if (onCategoriesUpdated) onCategoriesUpdated();
      } else {
        setError("মুছে ফেলতে ব্যর্থ হয়েছে।");
      }
    } catch {
      setError("মুছে ফেলতে সমস্যা হয়েছে।");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Layers className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black leading-tight">স্টোর ক্যাটাগরি ও সাব-ট্যাব পরিচালনা</h3>
              <p className="text-[11px] text-blue-200">বই, সিলেবাস, খাতা ও স্টেশনারির ক্যাটাগরি ও সাব-ট্যাব কনফিগার করুন</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSave} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-blue-600" />
                <span>{editingId ? "ক্যাটাগরি সম্পাদনা করুন" : "নতুন ক্যাটাগরি ও সাব-ট্যাব যোগ করুন"}</span>
              </h4>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-[11px] text-slate-500 hover:text-slate-800 font-bold hover:underline"
                >
                  বাতিল / নতুন যোগ
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ক্যাটাগরির নাম *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: বই, সিলেবাস, খাতা, স্টেশনারি"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-blue-600"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 select-none">
                  <input
                    type="checkbox"
                    checked={isClassWise}
                    onChange={(e) => setIsClassWise(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 block">শ্রেণীভিত্তিক সাব-ট্যাব (Class-Wise)</span>
                    <span className="text-[10px] text-slate-500 block">শ্রেণি অনুযায়ী সাব-ট্যাব স্বয়ংক্রিয় তৈরি হবে</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Custom Sub-Tabs Input */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-slate-700">
                কাস্টম সাব-ট্যাবসমূহ (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubTabInput}
                  onChange={(e) => setNewSubTabInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSubTab();
                    }
                  }}
                  placeholder="যেমন: বাংলা খাতা, ইংরেজি খাতা, কলম, ফাইল"
                  className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-blue-600"
                />
                <button
                  type="button"
                  onClick={handleAddSubTab}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>যোগ করুন</span>
                </button>
              </div>

              {/* Sub-Tabs Pills */}
              {subTabs.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {subTabs.map((sub, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-900 font-bold text-xs rounded-lg border border-blue-200"
                    >
                      <span>{sub}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubTab(idx)}
                        className="w-3.5 h-3.5 rounded-full hover:bg-blue-200 text-blue-700 flex items-center justify-center cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{editingId ? "পরিবর্তন সংরক্ষণ করুন" : "ক্যাটাগরি যুক্ত করুন"}</span>
              </button>
            </div>
          </form>

          {/* Existing Categories List */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              বর্তমান ক্যাটাগরি ও সাব-ট্যাব তালিকা ({categories.length} টি)
            </h4>

            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-300" />
                <span>ক্যাটাগরি লোড হচ্ছে...</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500 font-medium">
                কোনো ক্যাটাগরি তৈরি করা হয়নি। উপরের ফরম দিয়ে নতুন ক্যাটাগরি যোগ করুন।
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                {categories.map((cat) => (
                  <div key={cat.id || cat.name} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">{cat.name}</span>
                        {cat.isClassWise && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded-full border border-purple-200 flex items-center gap-1">
                            <BookOpen className="w-2.5 h-2.5" />
                            <span>শ্রেণীভিত্তিক অটো সাব-ট্যাব</span>
                          </span>
                        )}
                      </div>

                      {/* Display sub-tabs */}
                      {Array.isArray(cat.subTabs) && cat.subTabs.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          <span className="text-[10px] text-slate-400 font-bold">সাব-ট্যাব:</span>
                          {cat.subTabs.map((sub, sIdx) => (
                            <span key={sIdx} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-md border border-slate-200">
                              {sub}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400">
                          {cat.isClassWise ? "পণ্যসমূহের ক্লাস থেকে স্বয়ংক্রিয় সাব-ট্যাব তৈরি হবে।" : "কোনো কাস্টম সাব-ট্যাব যোগ করা হয়নি।"}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(cat)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="সম্পাদনা করুন"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>এডিট</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-all cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}
