"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { Edit2, Save, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// Dynamically import react-quill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface EditableContentProps {
  slug: string;
  defaultContent: string;
  editableHeader?: boolean;
  initialTitle?: string;
  initialSubtitle?: string;
}

export default function EditableContent({ 
  slug, 
  defaultContent,
  editableHeader = false,
  initialTitle = "",
  initialSubtitle = ""
}: EditableContentProps) {
  const router = useRouter();
  const [content, setContent] = useState(defaultContent);
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Check auth and fetch content
  useEffect(() => {
    const init = async () => {
      try {
        // Fetch current content from DB
        const contentRes = await fetch(`/api/pages/${slug}`);
        if (contentRes.ok) {
          const data = await contentRes.json();
          if (data && data.content) {
            try {
              // Try parsing if stored as structured JSON
              const parsed = JSON.parse(data.content);
              if (parsed && typeof parsed === "object") {
                if (parsed.html !== undefined || parsed.content !== undefined) {
                  setContent(parsed.html || parsed.content || "");
                }
                if (parsed.title !== undefined) {
                  setTitle(parsed.title);
                }
                if (parsed.subtitle !== undefined) {
                  setSubtitle(parsed.subtitle);
                }
              } else {
                setContent(data.content);
              }
            } catch {
              // Plain HTML string
              setContent(data.content);
            }
          }
        }

        // Check if user is admin
        const checkAuthRes = await fetch("/api/auth/me");
        if (checkAuthRes.ok) {
          const user = await checkAuthRes.json();
          if (user.role === "ADMIN" || user.role === "admin") {
            setIsAdmin(true);
          }
        }
      } catch (error) {
        console.error("Error initializing EditableContent:", error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [slug]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let payloadContent = content;
      if (editableHeader) {
        payloadContent = JSON.stringify({
          title,
          subtitle,
          html: content
        });
      }

      const res = await fetch(`/api/pages/${slug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: payloadContent }),
      });

      if (res.ok) {
        toast.success("পৃষ্ঠা সফলভাবে সংরক্ষিত হয়েছে!");
        setIsEditing(false);
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || "সংরক্ষণ করতে সমস্যা হয়েছে");
      }
    } catch (error) {
      toast.error("An error occurred while saving.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse h-32 bg-slate-100 rounded-xl"></div>;
  }

  return (
    <div className="relative group">
      {isAdmin && !isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute -top-3 -right-3 bg-emerald-700 text-white p-2.5 rounded-full shadow-lg opacity-80 hover:opacity-100 transition-opacity z-20 hover:bg-emerald-800 flex items-center gap-1.5 text-xs font-bold"
          title="সম্পাদনা করুন (Edit Header & Content)"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">সম্পাদনা</span>
        </button>
      )}

      {editableHeader && !isEditing && (
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            {title || initialTitle}
          </h1>
          {(subtitle || initialSubtitle) && (
            <p className="font-bold text-slate-700 text-lg mb-4">
              {subtitle || initialSubtitle}
            </p>
          )}
          <div className="flex justify-center mb-8">
            <div className="h-1 w-28 bg-emerald-600 rounded"></div>
          </div>
        </div>
      )}

      {isEditing ? (
        <div className="bg-white p-5 rounded-2xl shadow-xl border-2 border-emerald-600/30 z-20 relative">
          <div className="mb-4 pb-3 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-base">পৃষ্ঠা ও শিরোনাম সম্পাদনা</h3>
              <p className="text-xs text-slate-400">Slug: {slug}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
                disabled={isSaving}
              >
                <X className="w-3.5 h-3.5" /> বাতিল
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1 px-4 py-1.5 text-xs font-bold bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-colors disabled:opacity-50 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" /> {isSaving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
              </button>
            </div>
          </div>

          {editableHeader && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  প্রধান শিরোনাম (Title):
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="যেমন: চেয়ারম্যানের বাণী"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  উপ-শিরোনাম / পদবী (Subtitle / Designation):
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="যেমন: চেয়ারম্যান"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>
          )}
          
          <div className="min-h-[320px]">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              মূল বিষয়বস্তু / বার্তা (Body Content):
            </label>
            <ReactQuill 
              theme="snow" 
              value={content} 
              onChange={setContent} 
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'color': [] }, { 'background': [] }],
                  [{ 'align': [] }],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['link', 'image'],
                  ['clean']
                ],
              }}
              formats={[
                'header',
                'bold', 'italic', 'underline', 'strike',
                'color', 'background',
                'align',
                'list', 'bullet',
                'link', 'image'
              ]}
              className="h-[240px] mb-12"
            />
          </div>
        </div>
      ) : (
        <div 
          className="prose max-w-none prose-p:my-1 prose-headings:my-2 text-slate-700 leading-relaxed text-justify font-medium ql-editor px-0"
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      )}
    </div>
  );
}
