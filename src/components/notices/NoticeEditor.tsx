"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { UploadCloud, Save, X, Loader2 } from "lucide-react";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface NoticeEditorProps {
  initialTitle?: string;
  initialContent?: string;
  noticeId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function NoticeEditor({
  initialTitle = "",
  initialContent = "",
  noticeId,
  onSuccess,
  onCancel,
}: NoticeEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      
      // Instead of complex HTML that Quill strips, we insert a clean, simple link.
      // This will look neat inside the editor as "📎 Attached Document: filename.pdf"
      const downloadHtml = `<p><br></p><p><strong>📎 Attached Document: </strong><a href="${data.url}" target="_blank" rel="noopener noreferrer">${file.name}</a></p><p><br></p>`;

      setContent((prev) => prev + downloadHtml);
      toast.success("File attached successfully!");
    } catch (err) {
      toast.error("Failed to upload file");
      console.error(err);
    } finally {
      setIsUploading(false);
      e.target.value = ""; // Reset input
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required!");
      return;
    }

    setIsSaving(true);
    try {
      const url = noticeId ? `/api/notices/${noticeId}` : "/api/notices";
      const method = noticeId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) throw new Error("Failed to save notice");

      toast.success(noticeId ? "Notice updated!" : "Notice created!");
      router.refresh();
      onSuccess();
    } catch (err) {
      toast.error("An error occurred while saving");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 w-full mb-8">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h3 className="text-xl font-bold text-slate-800">
          {noticeId ? "Edit Notice" : "Create New Notice"}
        </h3>
        <button
          onClick={onCancel}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Notice Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter notice title..."
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-bold text-slate-700">Notice Content</label>
            
            <div className="relative">
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                accept=".pdf,.doc,.docx,.jpg,.png"
              />
              <button
                disabled={isUploading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                {isUploading ? "Uploading..." : "Attach Document"}
              </button>
            </div>
          </div>

          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={{
              toolbar: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ color: [] }, { background: [] }],
                [{ align: [] }],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link", "image"],
                ["clean"],
              ],
            }}
            formats={[
              "header",
              "bold",
              "italic",
              "underline",
              "strike",
              "color",
              "background",
              "align",
              "list",
              "bullet",
              "link",
              "image",
            ]}
            className="h-[300px] mb-12"
          />
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors mr-3"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-white bg-primary hover:bg-primary-dark transition-colors disabled:opacity-70"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? "Saving..." : "Save & Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
