"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Loader2, FileText, Trash2, Edit, MoreVertical } from "lucide-react";
import NoticeEditor from "@/components/notices/NoticeEditor";
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
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

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
    if (!confirm("Are you sure you want to delete this notice?")) return;
    
    try {
      const res = await fetch(`/api/notices/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Notice deleted");
        fetchNotices();
      } else {
        toast.error("Failed to delete");
      }
    } catch (err) {
      toast.error("Error deleting notice");
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

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 min-h-[70vh]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10 shadow-inner">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
              সকল নোটিশ
            </h1>
            <p className="text-slate-500 mt-1 font-medium">সাম্প্রতিক ঘোষণা ও আপডেট</p>
          </div>
        </div>
        {isAdmin && !showEditor && (
          <button
            onClick={() => setShowEditor(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-[0_4px_14px_rgba(34,197,94,0.39)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.23)] hover:-translate-y-1 active:translate-y-0"
          >
            <Plus className="w-5 h-5" />
            নোটিশ যোগ করুন
          </button>
        )}
      </div>

      {showEditor && (
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
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : notices.length === 0 ? (
        <div className="bg-slate-50/50 p-16 rounded-3xl border border-dashed border-slate-300 text-center flex flex-col items-center justify-center">
          <FileText className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-600 mb-2">এখনো কোনো নোটিশ নেই</h3>
          <p className="text-slate-400">এই মুহূর্তে প্রদর্শনের জন্য কোনো সক্রিয় নোটিশ নেই।</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm">
          {/* Table Header */}
          <div className={`grid ${isAdmin ? 'grid-cols-[1fr_auto_auto] md:grid-cols-[50px_110px_1fr_120px_50px]' : 'grid-cols-[1fr_auto] md:grid-cols-[50px_110px_1fr_120px]'} items-center gap-3 px-4 md:px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider rounded-t-2xl`}>
            <span className="hidden md:block text-center">#</span>
            <span className="hidden md:block">তারিখ</span>
            <span>নোটিশের শিরোনাম</span>
            <span className="text-center">ফাইল</span>
            {isAdmin && <span className="text-center">অ্যাকশন</span>}
          </div>

          {/* Table Rows */}
          {notices.map((notice, index) => {
            const dateShort = new Date(notice.createdAt).toLocaleDateString("bn-BD", {
              day: "numeric",
              month: "short",
            });
            const dateFull = new Date(notice.createdAt).toLocaleDateString("bn-BD", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            const downloadLinkMatch = notice.content.match(/href="(\/uploads\/[^"]+)"/);
            const downloadUrl = downloadLinkMatch ? downloadLinkMatch[1] : null;

            return (
              <div
                key={notice.id}
                className={`group grid ${isAdmin ? 'grid-cols-[1fr_auto_auto] md:grid-cols-[50px_110px_1fr_120px_50px]' : 'grid-cols-[1fr_auto] md:grid-cols-[50px_110px_1fr_120px]'} items-center gap-3 px-4 md:px-6 py-3.5 md:py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80 transition-colors cursor-pointer`}
                onClick={() => router.push(`/notices/${notice.id}`)}
              >
                {/* Serial — desktop only */}
                <span className="hidden md:flex text-center text-sm font-bold text-slate-400 bg-slate-100 rounded-lg w-8 h-8 items-center justify-center mx-auto group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {index + 1}
                </span>

                {/* Date — desktop only */}
                <span className="hidden md:block text-sm font-semibold text-slate-600 whitespace-nowrap">
                  {dateFull}
                </span>

                {/* Title + date on mobile */}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate group-hover:text-primary transition-colors">
                    {notice.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 md:hidden">{dateShort}</p>
                </div>

                {/* File Download Column */}
                <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                  {downloadUrl ? (
                    <a
                      href={downloadUrl}
                      download
                      target="_blank"
                      className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 border border-blue-100 hover:border-blue-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                      <span>ডাউনলোড</span>
                    </a>
                  ) : <span className="w-9 md:w-auto"></span>}
                </div>

                {/* Action Column */}
                <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                  {isAdmin && (
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === notice.id ? null : notice.id); }}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="আরও বিকল্প"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === notice.id && (
                        <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl border border-slate-200/80 shadow-[0_10px_40px_rgb(0,0,0,0.12)] z-50 overflow-hidden">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(notice); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            সম্পাদনা করুন
                          </button>
                          <div className="h-px bg-slate-100 mx-3"></div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(notice.id); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            মুছে ফেলুন
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
