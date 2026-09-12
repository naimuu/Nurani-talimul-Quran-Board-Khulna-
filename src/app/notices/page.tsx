"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, FileText, Trash2, Edit, MoreVertical, Search, Calendar, Download, ChevronRight, X, Bell } from "lucide-react";
import NoticeEditor from "@/components/notices/NoticeEditor";
import NoticeModal, { getNoticeAttachment } from "@/components/notices/NoticeModal";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function NoticesPage() {
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchNotices = async () => {
    try {
      const res = await fetch("/api/notices");
      if (res.ok) {
        const data = await res.json();
        setNotices(data);
      }
    } catch (error) {
      console.error("Failed to fetch notices", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchNotices();
      
      try {
        const authRes = await fetch("/api/auth/me");
        if (authRes.ok) {
          const user = await authRes.json();
          if (user.role === "ADMIN") setIsAdmin(true);
        }
      } catch (error) {
        console.error("Auth check failed", error);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই নোটিশটি মুছে ফেলতে চান?")) return;
    
    try {
      const res = await fetch(`/api/notices/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("নোটিশ মুছে ফেলা হয়েছে");
        fetchNotices();
      } else {
        toast.error("নোটিশ মুছতে ব্যর্থ হয়েছে");
      }
    } catch (err) {
      toast.error("ত্রুটি ঘটেছে");
    }
  };

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingNotice(null);
  };

  // Filter notices by search query
  const filteredNotices = notices.filter((notice) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return notice.title.toLowerCase().includes(q) || notice.content.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-[calc(100vh-320px)] bg-slate-50 py-5 sm:py-6">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 space-y-4">
        
        {/* Header Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-xs shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                  সকল নোটিশ
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
                  {notices.length} টি নোটিশ
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                নূরানী বোর্ড খুলনার সাম্প্রতিক ঘোষণা, আদেশ ও নোটিশসমূহ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search Box */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="নোটিশ খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {isAdmin && !showEditor && (
              <button
                onClick={() => setShowEditor(true)}
                className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all shadow-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-amber-300" />
                <span>+ নোটিশ যোগ করুন</span>
              </button>
            )}
          </div>
        </div>

        {/* Editor Modal / Container */}
        {showEditor && (
          <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-md">
            <NoticeEditor
              noticeId={editingNotice?.id}
              initialTitle={editingNotice?.title}
              initialContent={editingNotice?.content}
              onSuccess={() => {
                closeEditor();
                fetchNotices();
              }}
              onCancel={closeEditor}
            />
          </div>
        )}

        {/* Content Section */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-xs">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
            <p className="text-xs font-semibold text-slate-600">নোটিশ লোড হচ্ছে...</p>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center flex flex-col items-center justify-center shadow-xs">
            <FileText className="w-10 h-10 text-slate-300 mb-2" />
            <h3 className="text-sm font-bold text-slate-700 mb-0.5">
              {searchQuery ? "কোনো মিল পাওয়া যায়নি" : "বর্তমানে কোনো নোটিশ নেই"}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm">
              {searchQuery
                ? `"${searchQuery}" এর সাথে সম্পর্কিত কোনো নোটিশ খুঁজে পাওয়া যায়নি।`
                : "এই মুহূর্তে প্রদর্শনের জন্য কোনো সক্রিয় নোটিশ নেই।"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-3 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                সার্চ রিসেট করুন
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            
            {/* Table Header (Desktop) */}
            <div className={`hidden md:grid ${isAdmin ? 'grid-cols-[50px_120px_1fr_110px_80px_50px]' : 'grid-cols-[50px_120px_1fr_110px_80px]'} items-center gap-3 px-5 py-2.5 bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider`}>
              <span className="text-center">#</span>
              <span>তারিখ</span>
              <span>নোটিশের শিরোনাম</span>
              <span className="text-center">সংযুক্ত ফাইল</span>
              <span className="text-center">বিস্তারিত</span>
              {isAdmin && <span className="text-center">অ্যাকশন</span>}
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-100">
              {filteredNotices.map((notice, index) => {
                const dateShort = new Date(notice.createdAt).toLocaleDateString("bn-BD", {
                  day: "numeric",
                  month: "short",
                });
                const dateFull = new Date(notice.createdAt).toLocaleDateString("bn-BD", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                const attachment = getNoticeAttachment(notice.content);
                const downloadUrl = (notice as any).attachmentUrl || attachment.url;

                return (
                  <div
                    key={notice.id}
                    className="hover:bg-emerald-50/40 transition-colors group cursor-pointer"
                    onClick={() => {
                      setSelectedNotice(notice);
                      setIsModalOpen(true);
                    }}
                  >
                    {/* Desktop Row */}
                    <div className={`hidden md:grid ${isAdmin ? 'grid-cols-[50px_120px_1fr_120px_80px_50px]' : 'grid-cols-[50px_120px_1fr_120px_80px]'} items-center gap-3 px-5 py-2.5`}>
                      
                      {/* Serial */}
                      <span className="text-center text-[11px] font-bold text-slate-400 bg-slate-100 rounded-md w-6 h-6 flex items-center justify-center mx-auto group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors font-mono">
                        {index + 1}
                      </span>

                      {/* Date */}
                      <span className="text-xs font-medium text-slate-600 whitespace-nowrap flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{dateFull}</span>
                      </span>

                      {/* Title */}
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors truncate">
                          {notice.title}
                        </p>
                      </div>

                      {/* File Download */}
                      <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                        {downloadUrl ? (
                          <a
                            href={downloadUrl}
                            download={attachment.type === 'image' ? `notice-${notice.id}.png` : `notice-${notice.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-50 hover:bg-emerald-700 text-emerald-800 hover:text-white px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all inline-flex items-center gap-1 border border-emerald-200/90 hover:border-emerald-700 shadow-2xs group/btn"
                            title="ফাইল ডাউনলোড করুন"
                          >
                            <Download className="w-3 h-3 text-emerald-600 group-hover/btn:text-white" />
                            <span>{attachment.label || "ডাউনলোড"}</span>
                          </a>
                        ) : (
                          <span className="text-[10.5px] text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-100/80">
                            টেক্সট নোটিশ
                          </span>
                        )}
                      </div>

                      {/* View Link */}
                      <div className="flex justify-center">
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-700 group-hover:text-emerald-800 group-hover:translate-x-0.5 transition-transform">
                          <span>দেখুন</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>

                      {/* Admin Action */}
                      {isAdmin && (
                        <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === notice.id ? null : notice.id);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                              title="বিকল্প"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                            {openMenuId === notice.id && (
                              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden py-1 text-xs">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(notice);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                >
                                  <Edit className="w-3 h-3" />
                                  সম্পাদনা
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(notice.id);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  মুছে ফেলুন
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden p-3.5 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-mono">
                            #{index + 1}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-emerald-600" />
                            {dateShort}
                          </span>
                        </div>
                        {isAdmin && (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleEdit(notice)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(notice.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <h3 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {notice.title}
                      </h3>

                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[11px]">
                        {downloadUrl ? (
                          <div onClick={(e) => e.stopPropagation()}>
                            <a
                              href={downloadUrl}
                              download={attachment.type === 'image' ? `notice-${notice.id}.png` : `notice-${notice.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-800 hover:text-emerald-950 font-bold inline-flex items-center gap-1 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200"
                            >
                              <Download className="w-3 h-3 text-emerald-700" />
                              <span>{attachment.label || "ডাউনলোড"}</span>
                            </a>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">টেক্সট নোটিশ</span>
                        )}

                        <span className="text-emerald-700 font-bold inline-flex items-center gap-0.5">
                          <span>বিস্তারিত</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Table Footer */}
            <div className="px-5 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
              <span>মোট {filteredNotices.length} টি নোটিশ</span>
              <span className="text-emerald-700 font-semibold">নূরানী বোর্ড খুলনা</span>
            </div>

          </div>
        )}

        {/* Notice Full Popup Modal */}
        <NoticeModal
          notice={selectedNotice}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedNotice(null);
          }}
        />

      </div>
    </div>
  );
}
