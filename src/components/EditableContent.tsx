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
}

export default function EditableContent({ slug, defaultContent }: EditableContentProps) {
  const router = useRouter();
  const [content, setContent] = useState(defaultContent);
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
            setContent(data.content);
          }
        }

        // Check if user is admin (you can adjust this logic based on your auth setup)
        // One simple way is to check the API which will fail if not admin
        const checkAuthRes = await fetch("/api/auth/me");
        if (checkAuthRes.ok) {
          const user = await checkAuthRes.json();
          if (user.role === "ADMIN") {
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
      const res = await fetch(`/api/pages/${slug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        toast.success("Page updated successfully!");
        setIsEditing(false);
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update page");
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
          className="absolute -top-4 -right-4 bg-primary text-white p-2 rounded-full shadow-lg opacity-50 group-hover:opacity-100 transition-opacity z-10 hover:bg-primary/90"
          title="Edit Content"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )}

      {isEditing ? (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-primary/20 z-20 relative">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Editing: {slug}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                disabled={isSaving}
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
          
          <div className="min-h-[300px]">
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
               className="h-[250px] mb-12"
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
