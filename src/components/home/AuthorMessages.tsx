"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Quote, Plus, Edit2, Trash2, X, Save, UserCheck, ShieldAlert, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";

export interface AuthorPerson {
  id: string;
  name: string;
  designation: string;
  board: string;
  desc: string;
  image: string;
  link: string;
}

const defaultAuthors: AuthorPerson[] = [
  {
    id: "chairman-default",
    name: "চেয়ারম্যানের বাণী",
    designation: "মাননীয় চেয়ারম্যান",
    board: "নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ",
    desc: "বিসমিল্লাহির রাহমানির রাহিম। নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ-এর নিজস্ব ওয়েবসাইটে আপনাকে স্বাগতম। কুরআনুল কারীমের সহীহ তেলাওয়াত বিস্তার এবং শিশু মনে দ্বীনি শিক্ষার মৌলিক ভিত্তি তৈরিতে আমাদের এই অনলাইন প্ল্যাটফর্ম এক নতুন সংযোজন। আধুনিক তথ্যপ্রযুক্তির সুফল কাজে লাগিয়ে শিক্ষা প্রতিষ্ঠান, শিক্ষক, শিক্ষার্থী ও অভিভাবকদের মধ্যে একটি সুদৃঢ় মেলবন্ধন তৈরি করাই আমাদের প্রত্যাশা। আসুন, প্রযুক্তির সঠিক ব্যবহারের মাধ্যমে আমরা আল-কুরআনের হেদায়েত ও নূর সবার মাঝে ছড়িয়ে দিই।",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=200&auto=format&fit=crop",
    link: "/about/chairman"
  }
];

export default function AuthorMessages() {
  const [authors, setAuthors] = useState<AuthorPerson[]>(defaultAuthors);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<AuthorPerson | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states for adding / editing person
  const [formId, setFormId] = useState("");
  const [formName, setFormName] = useState("");
  const [formDesignation, setFormDesignation] = useState("");
  const [formBoard, setFormBoard] = useState("নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ");
  const [formDesc, setFormDesc] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formLink, setFormLink] = useState("/about/chairman");

  useEffect(() => {
    // 1. Fetch saved author messages from DB
    fetch("/api/pages/board_author_messages")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.content) {
          try {
            const parsed = JSON.parse(data.content);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setAuthors(parsed);
            }
          } catch {}
        }
      })
      .catch(() => {});

    // 2. Check if current user is admin
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((user) => {
        if (user && (user.role === "ADMIN" || user.role === "admin")) {
          setIsAdmin(true);
        }
      })
      .catch(() => {});
  }, []);

  const openAddModal = () => {
    setFormId(`person_${Date.now()}`);
    setFormName("");
    setFormDesignation("");
    setFormBoard("নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ");
    setFormDesc("");
    setFormImage("https://images.unsplash.com/photo-1585036156171-384164a8c675?q=80&w=200&auto=format&fit=crop");
    setFormLink("/about/secretary");
    setEditingPerson(null);
    setIsModalOpen(true);
  };

  const openEditModal = (person: AuthorPerson) => {
    setFormId(person.id);
    setFormName(person.name);
    setFormDesignation(person.designation);
    setFormBoard(person.board);
    setFormDesc(person.desc);
    setFormImage(person.image);
    setFormLink(person.link);
    setEditingPerson(person);
    setIsModalOpen(true);
  };

  const handleDeletePerson = async (idToDelete: string) => {
    if (!confirm("আপনি কি নিশ্চিত এই ব্যক্তির বাণীটি মুছে ফেলতে চান?")) return;
    
    const updated = authors.filter((a) => a.id !== idToDelete);
    setAuthors(updated);
    await saveAuthorsToDb(updated);
    toast.success("সফলভাবে মুছে ফেলা হয়েছে!");
  };

  const handleSavePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDesignation.trim()) {
      toast.error("অনুগ্রহ করে নাম এবং পদবী পূরণ করুন");
      return;
    }

    const newPersonData: AuthorPerson = {
      id: formId || `person_${Date.now()}`,
      name: formName.trim(),
      designation: formDesignation.trim(),
      board: formBoard.trim(),
      desc: formDesc.trim(),
      image: formImage.trim() || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=200&auto=format&fit=crop",
      link: formLink.trim() || "/about/chairman"
    };

    let updatedList: AuthorPerson[];
    if (editingPerson) {
      updatedList = authors.map((a) => (a.id === editingPerson.id ? newPersonData : a));
    } else {
      updatedList = [...authors, newPersonData];
    }

    setAuthors(updatedList);
    setIsModalOpen(false);
    await saveAuthorsToDb(updatedList);
    toast.success(editingPerson ? "ব্যক্তির তথ্য আপডেট করা হয়েছে!" : "নতুন ব্যক্তি সফলভাবে যুক্ত হয়েছে!");
  };

  const saveAuthorsToDb = async (list: AuthorPerson[]) => {
    setIsSaving(true);
    try {
      await fetch("/api/pages/board_author_messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: JSON.stringify(list) }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Title Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-[#052e23] text-white rounded-2xl py-3 px-5 sm:px-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Quote className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold">দায়িত্বশীলগণের বাণী</h3>
            <p className="text-[11px] text-emerald-200">বোর্ডের দিকনির্দেশনা ও শুভেচ্ছা বার্তা</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
              title="নতুন ব্যক্তি যোগ করুন"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন ব্যক্তি যোগ</span>
            </button>
          )}
          {!isAdmin && (
            <span className="text-[11px] font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full shadow-xs">
              বাণী
            </span>
          )}
        </div>
      </div>

      {/* Grid of Messages */}
      {authors.length === 0 ? (
        <div className="bg-white/80 border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center flex-1">
          <Quote className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-600 mb-1">কোনো ব্যক্তির বাণী তালিকাভুক্ত নেই</p>
          {isAdmin && (
            <button
              onClick={openAddModal}
              className="mt-3 inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন ব্যক্তি / বাণী যোগ করুন</span>
            </button>
          )}
        </div>
      ) : (
        <div className={`grid grid-cols-1 ${authors.length > 1 ? "md:grid-cols-2" : "grid-cols-1"} gap-4 flex-1`}>
          {authors.map((author) => (
            <div 
              key={author.id} 
              className="bg-white p-5 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between hover:border-emerald-200 transition-colors group relative"
            >
            {/* Admin action buttons */}
            {isAdmin && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10 bg-white/90 backdrop-blur-xs p-1 rounded-xl shadow-xs border border-slate-200">
                <button
                  onClick={() => openEditModal(author)}
                  className="p-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="এডিট করুন"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeletePerson(author.id)}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div>
              <div className="flex items-start gap-3.5 mb-3.5 pr-14">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-500/30 flex-shrink-0 relative shadow-sm group-hover:border-emerald-500 transition-colors">
                  <div className="absolute inset-0 bg-slate-200" />
                  <Image 
                    src={author.image || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=200&auto=format&fit=crop"} 
                    alt={author.name} 
                    fill 
                    className="object-cover relative z-10" 
                    sizes="56px" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-base leading-tight mb-1 truncate">{author.name}</h4>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full inline-block mb-0.5">
                    {author.designation}
                  </span>
                  {author.board && (
                    <p className="text-[10.5px] text-slate-400 truncate">{author.board}</p>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed text-justify line-clamp-5">
                {author.desc}
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">বিস্তারিত দেখুন</span>
              <Link 
                href={author.link || "#"} 
                className="inline-flex items-center justify-center bg-[#052e23] text-white text-xs font-bold px-4 py-1.5 rounded-xl hover:bg-emerald-800 transition-colors shadow-xs"
              >
                সম্পূর্ণ বাণী
              </Link>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Admin Add/Edit Person Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">
                  {editingPerson ? "ব্যক্তির তথ্য ও বাণী সম্পাদনা" : "নতুন ব্যক্তি / বাণী যোগ করুন"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePerson} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    নাম / শিরোনাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="যেমন: মুফতি জসিম উদ্দীন সাহেব"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পদবী <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    placeholder="যেমন: মহাসচিব / সহ-সভাপতি"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    বোর্ড / প্রতিষ্ঠান
                  </label>
                  <input
                    type="text"
                    value={formBoard}
                    onChange={(e) => setFormBoard(e.target.value)}
                    placeholder="নূরানী তা'লীমুল কুরআন বোর্ড খুলনা"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    বিস্তারিত পেজের লিংক
                  </label>
                  <input
                    type="text"
                    value={formLink}
                    onChange={(e) => setFormLink(e.target.value)}
                    placeholder="/about/secretary"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ছবির লিংক (Image URL)
                </label>
                <input
                  type="text"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  সংক্ষিপ্ত বাণী / বার্তা (Speech Message)
                </label>
                <textarea
                  rows={4}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="এখানে ব্যক্তির বক্তব্য বা শুভেচ্ছা বাণী লিখুন..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs leading-relaxed focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {editingPerson ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      handleDeletePerson(editingPerson.id);
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>মুছে ফেলুন</span>
                  </button>
                ) : <div />}
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
