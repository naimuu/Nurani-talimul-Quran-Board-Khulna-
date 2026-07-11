"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Users, FileText, Settings, LogOut, UserCircle, ChevronDown, ShieldAlert, CheckCircle2, Building2, MapPin, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useDialog } from "@/components/ui/DialogProvider";

type UserType = {
  _id: string;
  name?: string;
  email: string;
  phone?: string;
  role: string;
  status?: string;
  createdAt: string;
};

type MadrasaType = {
  _id: string;
  name: string;
  code: string;
  address: string;
  contactNo?: string;
  principalName?: string;
  district?: string;
  upazila?: string;
  isApproved: boolean;
  createdAt: string;
};

type LocationType = {
  _id: string;
  name: string;
  bn_name: string;
  type: string;
  parentId: string | null;
};

function LocationColumn({ title, type, parentId, locations, selectedId, onSelect, onAdd, onDelete, isDisabled }: any) {
  const [search, setSearch] = useState("");
  
  const filteredLocations = locations.filter((l: any) => l.type === type && (parentId === undefined ? true : l.parentId === parentId));
  const searchedLocations = search 
    ? filteredLocations.filter((l: any) => l.bn_name.includes(search) || l.name.toLowerCase().includes(search.toLowerCase()))
    : filteredLocations;

  const displayLocations = searchedLocations.slice(0, 100);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col h-[32rem] transition-all`}>
      <div className="p-3 border-b border-slate-100 bg-slate-50 rounded-t-xl flex flex-col gap-2">
        <div className="font-bold text-slate-800 text-sm px-1">{title}</div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="সার্চ করুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-0 px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
          />
          <button 
            onClick={onAdd}
            className="p-1.5 shrink-0 rounded-lg transition-colors bg-primary text-white hover:bg-primary/90 shadow-sm flex items-center justify-center"
            title="নতুন যোগ করুন"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 bg-slate-50/30">
        {searchedLocations.length === 0 ? (
          <p className="text-center text-slate-400 p-4 text-sm">{search ? 'কিছু পাওয়া যায়নি' : 'কোনো তথ্য নেই'}</p>
        ) : (
          <ul className="space-y-1">
            {displayLocations.map((loc: any) => (
              <li key={loc._id} className="flex items-center gap-2 group">
                <button 
                  onClick={() => onSelect && onSelect(loc._id)}
                  className={`flex-1 text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedId === loc._id ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-slate-100 text-slate-700'}`}
                >
                  {loc.bn_name} <span className="text-slate-400 text-xs">({loc.name})</span>
                </button>
                <button onClick={() => onDelete(loc._id)} className="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
            {searchedLocations.length > 100 && (
               <li className="text-center text-xs text-slate-400 py-2">
                 আরো {searchedLocations.length - 100} টি ফলাফল আছে। নির্দিষ্ট করে খুঁজতে সার্চ করুন।
               </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab");
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState(urlTab || "dashboard");
  const [users, setUsers] = useState<UserType[]>([]);
  const [madrasas, setMadrasas] = useState<MadrasaType[]>([]);
  const [madrasaCount, setMadrasaCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Location State
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedUpazila, setSelectedUpazila] = useState<string | null>(null);
  const [selectedUnion, setSelectedUnion] = useState<string | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<string | null>(null);
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationBnName, setNewLocationBnName] = useState("");
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  
  // Location Add Modal State
  const [activeAddForm, setActiveAddForm] = useState<{ type: string, title: string, parentId: string | null } | null>(null);
  const [addMode, setAddMode] = useState<'single' | 'bulk'>('single');
  const [bulkInput, setBulkInput] = useState("");

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.replace(`?tab=${tabId}`, { scroll: false });
  };
  
  const { alert, confirm } = useDialog();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', password: '', role: 'GENERAL' });
  const [isCreating, setIsCreating] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("newUserDraft");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed && typeof parsed === 'object') {
          setNewUser(parsed);
        }
      } catch (e) {}
    }
  }, []);

  // Save draft on change
  useEffect(() => {
    if (newUser.name || newUser.email || newUser.phone || newUser.password || newUser.role !== 'GENERAL') {
      localStorage.setItem("newUserDraft", JSON.stringify(newUser));
    }
  }, [newUser]);

  useEffect(() => {
    if (urlTab) setActiveTab(urlTab);
  }, [urlTab]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/admin/users');
        if (res.status === 401) {
          window.location.href = "/login/admin";
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
          setMadrasaCount(data.madrasaCount || 0);
        }

        const mRes = await fetch('/api/admin/madrasas');
        if (mRes.ok) {
          const mData = await mRes.json();
          setMadrasas(mData.madrasas || []);
        }

        const lRes = await fetch('/api/admin/locations');
        if (lRes.ok) {
          const lData = await lRes.json();
          setLocations(lData.locations || []);
        }
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleLogout = () => {
    router.push("/login");
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const previousUsers = [...users];
    
    // Optimistic update
    setUsers(users.map(user => 
      user._id === userId ? { ...user, role: newRole.toUpperCase() } : user
    ));
    
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      alert({ title: "সফল!", message: "ইউজারের ধরন ডাটাবেসে সফলভাবে আপডেট হয়েছে!", type: "success" });
    } catch (err) {
      alert({ title: "ত্রুটি!", message: "ইউজারের ধরন আপডেট ব্যর্থ হয়েছে।", type: "error" });
      setUsers(previousUsers); // Revert on failure
    }
  };

  const handleImpersonate = async (userId: string) => {
    const isConfirmed = await confirm({
      title: "সতর্কতা!",
      message: "আপনি কি এই ইউজারের আইডিতে লগইন করতে চান? আপনার বর্তমান অ্যাডমিন সেশন মুছে যাবে।",
      type: "warning",
      confirmText: "প্রবেশ করুন",
      cancelText: "বাতিল"
    });
    
    if (!isConfirmed) return;
    
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "লগইন করতে ব্যর্থ হয়েছে");
      
      window.location.href = data.redirectUrl;
    } catch (err: any) {
      alert({ title: "ত্রুটি!", message: err.message, type: "error" });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");
      
      alert({ title: "সফল!", message: "নতুন ইউজার সফলভাবে তৈরি হয়েছে!", type: "success" });
      setShowCreateModal(false);
      setUsers([data.user, ...users]); // Optimistically add
      setNewUser({ name: '', email: '', phone: '', password: '', role: 'GENERAL' });
      localStorage.removeItem("newUserDraft");
    } catch (err: any) {
      alert({ title: "ত্রুটি!", message: err.message || "একটি ত্রুটি ঘটেছে", type: "error" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleMadrasaApproval = async (madrasaId: string, currentStatus: boolean) => {
    const isConfirmed = await confirm({
      title: "সতর্কতা!",
      message: `আপনি কি এই মাদরাসাটিকে ${currentStatus ? 'স্থগিত' : 'অনুমোদন'} করতে চান?`,
      type: "warning",
    });
    
    if (!isConfirmed) return;

    try {
      const res = await fetch('/api/admin/madrasas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ madrasaId, isApproved: !currentStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      setMadrasas(madrasas.map(m => 
        m._id === madrasaId ? { ...m, isApproved: !currentStatus } : m
      ));
      alert({ title: "সফল!", message: "মাদরাসার স্ট্যাটাস আপডেট হয়েছে!", type: "success" });
    } catch (error) {
      alert({ title: "ত্রুটি!", message: "স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।", type: "error" });
    }
  };

  const renderDashboard = () => (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
        {[
          { label: "মোট ইউজার", value: users.length.toString(), color: "text-blue-600" },
          { label: "অ্যাডমিন", value: users.filter(u => (u.role || "").trim().toUpperCase() === "ADMIN").length.toString(), color: "text-red-600" },
          { label: "সাধারণ ইউজার", value: users.filter(u => (u.role || "GENERAL").trim().toUpperCase() === "GENERAL").length.toString(), color: "text-slate-600" },
          { label: "মুয়াল্লিম", value: users.filter(u => (u.role || "").trim().toUpperCase() === "MUALLIM").length.toString(), color: "text-emerald-600" },
          { label: "প্রশিক্ষক", value: users.filter(u => (u.role || "").trim().toUpperCase() === "TRAINER").length.toString(), color: "text-orange-600" },
          { label: "পরিদর্শক", value: users.filter(u => (u.role || "").trim().toUpperCase() === "VISITOR").length.toString(), color: "text-teal-600" },
          { label: "মাদরাসা (অ্যাকাউন্ট)", value: users.filter(u => (u.role || "").trim().toUpperCase() === "MADRASA").length.toString(), color: "text-indigo-600" },
          { label: "নিবন্ধিত মাদরাসা", value: madrasaCount.toString(), color: "text-purple-600" },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
          >
            <h3 className="text-slate-500 font-medium mb-2">{stat.label}</h3>
            <div className="flex items-baseline justify-between">
              {loading ? (
                <span className="text-3xl font-bold text-slate-300 animate-pulse">...</span>
              ) : (
                <span className={`text-4xl font-bold ${stat.color}`}>{stat.value}</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 min-h-[400px] flex items-center justify-center">
        <p className="text-slate-400">অ্যাডমিন ড্যাশবোর্ডের মূল চার্ট ও গ্রাফ এখানে প্রদর্শিত হবে।</p>
      </div>
    </>
  );

  const renderUserManagement = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-800">ইউজার ম্যানেজমেন্ট ও রোল সেটিং</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 text-sm bg-primary text-white px-4 py-1.5 rounded-full shadow hover:bg-primary/90 transition-colors"
          >
            + নতুন ইউজার
          </button>
          <span className="flex items-center gap-2 text-sm bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200">
            <ShieldAlert className="w-4 h-4" /> পেন্ডিং ইউজার: {users.filter(u => (u.role || "").trim().toUpperCase() === "GENERAL").length}
          </span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
              <th className="px-6 py-4 font-medium">নাম ও ইমেইল</th>
              <th className="px-6 py-4 font-medium">ফোন নম্বর</th>
              <th className="px-6 py-4 font-medium">স্ট্যাটাস</th>
              <th className="px-6 py-4 font-medium">ইউজারের ধরন (Role)</th>
              <th className="px-6 py-4 font-medium text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex justify-center mb-2">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  ডাটা লোড হচ্ছে...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  কোনো ইউজার পাওয়া যায়নি।
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-800">{user.name || "অজানা নাম"}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{user.phone || "-"}</td>
                  <td className="px-6 py-4">
                    {(user.role || "").trim().toUpperCase() !== "GENERAL" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> অ্যাক্টিভ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        <ShieldAlert className="w-3.5 h-3.5" /> সাধারণ
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user._id === 'master_admin_id' ? (
                       <span className="inline-block font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-sm">সুপার অ্যাডমিন</span>
                    ) : (
                      <select
                        value={(user.role || "").trim().toLowerCase()}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className={`text-sm rounded-lg px-3 py-2 outline-none border focus:ring-2 transition-all cursor-pointer font-medium
                          ${(user.role || "").trim().toUpperCase() === 'GENERAL' ? 'bg-slate-50 border-slate-300 text-slate-700 focus:ring-slate-500/50' : 
                            'bg-blue-50 border-blue-200 text-blue-700 focus:ring-blue-500/50'}`}
                      >
                        <option value="general">সাধারণ ইউজার</option>
                        <option value="madrasa">মাদরাসা</option>
                        <option value="muallim">মুয়াল্লিম</option>
                        <option value="trainer">প্রশিক্ষক</option>
                        <option value="visitor">পরিদর্শক</option>
                        <option value="admin">অ্যাডমিন</option>
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    {user._id !== 'master_admin_id' && (
                      <>
                        <button 
                          onClick={() => handleImpersonate(user._id)}
                          className="text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors"
                        >
                          প্রবেশ করুন
                        </button>
                        <button className="text-sm text-primary hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                          বিস্তারিত
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
          >
            <h2 className="text-xl font-bold mb-4 text-slate-800">নতুন ইউজার তৈরি করুন</h2>
            <form onSubmit={handleCreateUser} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">নাম</label>
                <input required type="text" name="user-name-new" autoComplete="new-password" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ইমেইল</label>
                <input required type="email" name="user-email-new" autoComplete="new-password" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ফোন নম্বর</label>
                <input type="tel" pattern="[0-9]+" title="শুধুমাত্র নম্বর ব্যবহার করুন" name="user-phone-new" autoComplete="new-password" value={newUser.phone} onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setNewUser({...newUser, phone: val});
                }} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">পাসওয়ার্ড</label>
                <input required type="password" name="user-password-new" autoComplete="new-password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ইউজারের ধরন</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="GENERAL">সাধারণ ইউজার</option>
                  <option value="MADRASA">মাদরাসা</option>
                  <option value="MUALLIM">মুয়াল্লিম</option>
                  <option value="TRAINER">প্রশিক্ষক</option>
                  <option value="VISITOR">পরিদর্শক</option>
                  <option value="ADMIN">অ্যাডমিন</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors">বাতিল</button>
                <button type="submit" disabled={isCreating} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-70">
                  {isCreating ? "তৈরি হচ্ছে..." : "সংরক্ষণ করুন"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );

  const renderMadrasaManagement = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-800">মাদরাসা পরিচালনা</h2>
        <div className="flex gap-2">
          <span className="flex items-center gap-2 text-sm bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200">
            <ShieldAlert className="w-4 h-4" /> অপেক্ষমাণ: {madrasas.filter(m => !m.isApproved).length}
          </span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
              <th className="px-6 py-4 font-medium">কোড ও নাম</th>
              <th className="px-6 py-4 font-medium">ঠিকানা ও উপজেলা</th>
              <th className="px-6 py-4 font-medium">মুহতামিম ও যোগাযোগ</th>
              <th className="px-6 py-4 font-medium">স্ট্যাটাস</th>
              <th className="px-6 py-4 font-medium text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">ডাটা লোড হচ্ছে...</td>
              </tr>
            ) : madrasas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">কোনো মাদরাসা পাওয়া যায়নি।</td>
              </tr>
            ) : (
              madrasas.map((madrasa) => (
                <tr key={madrasa._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 text-sm mb-1 bg-slate-100 px-2 py-0.5 rounded inline-block">কোড: {madrasa.code}</p>
                    <p className="font-semibold text-primary">{madrasa.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-700">{madrasa.address}</p>
                    <p className="text-sm text-slate-500">{madrasa.upazila ? `${madrasa.upazila}, ${madrasa.district}` : madrasa.district || "-"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-700">{madrasa.principalName || "-"}</p>
                    <p className="text-sm text-slate-500">{madrasa.contactNo || "-"}</p>
                  </td>
                  <td className="px-6 py-4">
                    {madrasa.isApproved ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> অনুমোদিত
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        <ShieldAlert className="w-3.5 h-3.5" /> অপেক্ষমাণ
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleToggleMadrasaApproval(madrasa._id, madrasa.isApproved)}
                      className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors border ${
                        madrasa.isApproved 
                          ? 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                          : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      {madrasa.isApproved ? 'স্থগিত করুন' : 'অনুমোদন দিন'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const handleAddLocation = async (type: string, parentId: string | null) => {
    setIsAddingLocation(true);
    try {
      let bodyData;
      
      if (addMode === 'single') {
        if (!newLocationName || !newLocationBnName) {
          setIsAddingLocation(false);
          return;
        }
        bodyData = { name: newLocationName, bn_name: newLocationBnName, type, parentId };
      } else {
        if (!bulkInput.trim()) {
          setIsAddingLocation(false);
          return;
        }
        // Parse bulk input: format "Bangla Name, English Name"
        const lines = bulkInput.split('\n').filter(l => l.trim());
        const locs = lines.map(line => {
          const parts = line.split(',').map(p => p.trim());
          return {
            bn_name: parts[0] || "অজানা",
            name: parts[1] || parts[0] || "Unknown"
          };
        });
        bodyData = { locations: locs, type, parentId };
      }

      const res = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      if (res.ok) {
        const data = await res.json();
        if (addMode === 'single') {
          setLocations([...locations, data.location]);
        } else {
          setLocations([...locations, ...data.locations]);
        }
        setNewLocationName("");
        setNewLocationBnName("");
        setBulkInput("");
        setActiveAddForm(null);
        alert({ title: "সফল!", message: "লোকেশন সফলভাবে যোগ করা হয়েছে।", type: "success" });
      } else {
        const error = await res.json();
        alert({ title: "ত্রুটি!", message: error.error || "লোকেশন যোগ করা যায়নি।", type: "error" });
      }
    } catch (e) {
      alert({ title: "ত্রুটি!", message: "লোকেশন যোগ করা যায়নি।", type: "error" });
    } finally {
      setIsAddingLocation(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    const isConfirmed = await confirm({
      title: "সতর্কতা!",
      message: "আপনি কি নিশ্চিত যে এই এলাকাটি মুছে ফেলতে চান?",
      type: "warning"
    });
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/admin/locations?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLocations(locations.filter(l => l._id !== id));
      } else {
        const error = await res.json();
        alert({ title: "ত্রুটি!", message: error.error || "মুছে ফেলা যায়নি।", type: "error" });
      }
    } catch (e) {
      alert({ title: "ত্রুটি!", message: "মুছে ফেলা যায়নি।", type: "error" });
    }
  };

  const handleSelectLocation = (id: string, type: string) => {
    const loc = locations.find(l => l._id === id);
    if (!loc) return;

    if (type === 'VILLAGE') {
      setSelectedVillage(id);
      const union = locations.find(l => l._id === loc.parentId);
      if (union) {
        setSelectedUnion(union._id);
        const upazila = locations.find(l => l._id === union.parentId);
        if (upazila) {
          setSelectedUpazila(upazila._id);
          const district = locations.find(l => l._id === upazila.parentId);
          if (district) setSelectedDistrict(district._id);
        }
      }
    } else if (type === 'UNION') {
      setSelectedUnion(id);
      setSelectedVillage(null);
      const upazila = locations.find(l => l._id === loc.parentId);
      if (upazila) {
        setSelectedUpazila(upazila._id);
        const district = locations.find(l => l._id === upazila.parentId);
        if (district) setSelectedDistrict(district._id);
      }
    } else if (type === 'UPAZILA') {
      setSelectedUpazila(id);
      setSelectedUnion(null);
      setSelectedVillage(null);
      const district = locations.find(l => l._id === loc.parentId);
      if (district) setSelectedDistrict(district._id);
    } else if (type === 'DISTRICT') {
      setSelectedDistrict(id);
      setSelectedUpazila(null);
      setSelectedUnion(null);
      setSelectedVillage(null);
    }
  };

  // Extracted component logic is moved to top level
  
  const renderLocationManagement = () => (
    <>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" /> এলাকা / লোকেশন পরিচালনা
            </h2>
            <p className="text-sm text-slate-500 mt-1">মাদরাসা ও ছাত্রদের ঠিকানার জন্য জেলা, উপজেলা এবং অন্যান্য তথ্য যুক্ত করুন।</p>
          </div>
          {(selectedDistrict || selectedUpazila || selectedUnion || selectedVillage) && (
            <button 
              onClick={() => { setSelectedDistrict(null); setSelectedUpazila(null); setSelectedUnion(null); setSelectedVillage(null); }}
              className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-medium text-sm transition-colors flex items-center gap-2"
              title="সকল সিলেকশন মুছে ফেলুন"
            >
              <Trash2 className="w-4 h-4" /> ক্লিয়ার সিলেকশন
            </button>
          )}
        </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <LocationColumn 
          title="১. জেলা সমূহ" type="DISTRICT" parentId={null} 
          locations={locations} selectedId={selectedDistrict} 
          onSelect={(id: string) => handleSelectLocation(id, "DISTRICT")}
          onAdd={() => setActiveAddForm({ type: "DISTRICT", title: "১. জেলা সমূহ", parentId: null })}
          onDelete={handleDeleteLocation}
        />
        
        <LocationColumn 
          title="২. উপজেলা সমূহ" type="UPAZILA" parentId={selectedDistrict || undefined} 
          locations={locations} selectedId={selectedUpazila}
          onSelect={(id: string) => handleSelectLocation(id, "UPAZILA")}
          onAdd={() => setActiveAddForm({ type: "UPAZILA", title: "২. উপজেলা সমূহ", parentId: selectedDistrict })}
          onDelete={handleDeleteLocation}
        />

        <LocationColumn 
          title="৩. ইউনিয়ন/পৌরসভা" type="UNION" parentId={selectedUpazila || undefined} 
          locations={locations} selectedId={selectedUnion}
          onSelect={(id: string) => handleSelectLocation(id, "UNION")}
          onAdd={() => setActiveAddForm({ type: "UNION", title: "৩. ইউনিয়ন/পৌরসভা", parentId: selectedUpazila })}
          onDelete={handleDeleteLocation}
        />

        <LocationColumn 
          title="৪. গ্রাম/মহল্লা" type="VILLAGE" parentId={selectedUnion || undefined} 
          locations={locations} selectedId={selectedVillage}
          onSelect={(id: string) => handleSelectLocation(id, "VILLAGE")}
          onAdd={() => setActiveAddForm({ type: "VILLAGE", title: "৪. গ্রাম/মহল্লা", parentId: selectedUnion })}
          onDelete={handleDeleteLocation}
        />
      </div>
      </div>

      {/* Modern Add Location Modal */}
      <AnimatePresence>
        {activeAddForm && typeof activeAddForm === 'object' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setActiveAddForm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] p-6 md:p-8 max-w-md w-full shadow-2xl relative z-10 border border-white/20"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">নতুন {activeAddForm.title.replace(/[০-৯. ]/g, '')}</h3>
                  <p className="text-sm text-slate-500 mt-1">সিস্টেমে নতুন লোকেশন যুক্ত করুন</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <MapPin className="w-6 h-6" />
                </div>
              </div>
              
              <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-2xl">
                <button 
                  onClick={() => setAddMode('single')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${addMode === 'single' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  একক (Single)
                </button>
                <button 
                  onClick={() => setAddMode('bulk')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${addMode === 'bulk' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  একাধিক (Bulk)
                </button>
              </div>

              {addMode === 'single' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">বাংলা নাম</label>
                    <input type="text" placeholder="উদাঃ খুলনা" value={newLocationBnName} onChange={e => setNewLocationBnName(e.target.value)} className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 bg-slate-50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">ইংরেজি নাম</label>
                    <input type="text" placeholder="e.g. Khulna" value={newLocationName} onChange={e => setNewLocationName(e.target.value)} className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 bg-slate-50 transition-all" />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-semibold text-slate-700 ml-1">তালিকা পেস্ট করুন</label>
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">বাংলা, ইংরেজি</span>
                  </div>
                  <textarea 
                    rows={6}
                    placeholder={`ডুমুরিয়া, Dumuria\nকয়রা, Koyra`}
                    value={bulkInput}
                    onChange={e => setBulkInput(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 bg-slate-50 transition-all font-mono resize-none leading-relaxed"
                  ></textarea>
                </div>
              )}

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setActiveAddForm(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3.5 rounded-2xl transition-all"
                >
                  বাতিল
                </button>
                <button
                  onClick={() => handleAddLocation(activeAddForm.type, activeAddForm.parentId)}
                  disabled={isAddingLocation || (addMode === 'single' ? (!newLocationName || !newLocationBnName) : !bulkInput.trim())}
                  className="flex-1 text-white font-semibold py-3.5 rounded-2xl transition-all shadow-lg shadow-primary/30 bg-primary hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
                >
                  {isAddingLocation ? 'অপেক্ষা করুন...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 min-h-screen p-4 hidden xl:flex flex-col">
        <div className="mb-8 p-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
            অ্যাডমিন প্যানেল
          </h2>
        </div>
        
        <nav className="flex-1 space-y-2 overflow-y-auto">
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "ড্যাশবোর্ড" },
            { id: "locations", icon: MapPin, label: "লোকেশন পরিচালনা" },
            { id: "madrasas", icon: Building2, label: "মাদরাসা পরিচালনা" },
            { id: "users", icon: Users, label: "ইউজার পরিচালনা" },
            { id: "reports", icon: FileText, label: "রিপোর্ট" },
            { id: "settings", icon: Settings, label: "সেটিংস" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-600 hover:bg-slate-50 hover:text-primary"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <button onClick={handleLogout} className="mt-auto flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">লগআউট</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {activeTab === "dashboard" && (
          <header className="mb-8 flex justify-between items-center relative z-40">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                স্বাগতম, অ্যাডমিন!
              </h1>
              <p className="text-slate-500">
                আজকের সিস্টেমের বর্তমান অবস্থা।
              </p>
            </div>
          </header>
        )}

        {activeTab === "users" && renderUserManagement()}
        {activeTab === "madrasas" && renderMadrasaManagement()}
        {activeTab === "locations" && renderLocationManagement()}
        {activeTab === "dashboard" && renderDashboard()}
        
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">লোড হচ্ছে...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
