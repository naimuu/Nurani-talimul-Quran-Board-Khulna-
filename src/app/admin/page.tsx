"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Users, FileText, Settings, LogOut, UserCircle, ChevronDown, ShieldAlert, CheckCircle2, Building2, MapPin, ChevronRight, Plus, Trash2, ClipboardList, Clock, XCircle, X, Eye, Phone, MessageCircle, PhoneCall, MoreVertical, LayoutGrid, List, Package, ShoppingCart, CreditCard, ShoppingBag, BookOpen, GraduationCap, Search, Calendar, Filter, RotateCcw, CalendarDays, UserCheck, Printer, SlidersHorizontal, Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useDialog } from "@/components/ui/DialogProvider";
import PrintableReceipt from "@/components/forms/PrintableReceipt";
import SettingsTab from "@/components/admin/SettingsTab";
import StoreManagementView from "@/components/admin/store/StoreManagementView";
import CurriculumManagementView from "@/components/admin/CurriculumManagementView";
import BatchManagementView from "@/components/admin/BatchManagementView";
import ExamQuestionManagementView from "@/components/admin/ExamQuestionManagementView";
import { FileCheck } from "lucide-react";

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
  englishName?: string;
  code: string;
  trackingId?: string;
  address: string;
  village?: string;
  union?: string;
  contactNo?: string;
  phone1?: string;
  phone2?: string;
  principalName?: string;
  managerName?: string;
  district?: string;
  upazila?: string;
  isApproved: boolean;
  createdAt: string;
};

type ApplicationType = {
  _id: string;
  name: string;
  englishName?: string;
  instituteType?: string;
  managerName?: string;
  phone1?: string;
  email?: string;
  district?: string;
  upazila?: string;
  division?: string;
  trackingId?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  code?: string;
  teachers?: { name: string; phone: string; designation: string }[];
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<string>('calc(100vh - 95px)');

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const top = containerRef.current.getBoundingClientRect().top;
        if (top >= 0) {
          setContentHeight(`calc(100vh - ${top}px)`);
        }
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    window.addEventListener('scroll', updateHeight);
    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('scroll', updateHeight);
    };
  }, []);
  const [users, setUsers] = useState<UserType[]>([]);
  const [madrasas, setMadrasas] = useState<MadrasaType[]>([]);
  const [madrasaCount, setMadrasaCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<ApplicationType[]>([]);
  const [appLoading, setAppLoading] = useState(false);
  const [appFilter, setAppFilter] = useState<'ALL'|'PENDING'|'APPROVED'|'REJECTED'>('PENDING');
  const [viewMode, setViewMode] = useState<'card'|'table'>('card');
  const [previewApplication, setPreviewApplication] = useState<ApplicationType | null>(null);
  const [openDropdown, setOpenDropdown] = useState<{id: string, type: 'action' | 'call'} | null>(null);

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
  const [newUser, setNewUser] = useState({ name: '', madrasaName: '', email: '', phone: '', password: '', role: 'GENERAL' });
  const [isCreating, setIsCreating] = useState(false);

  // User Management Search and Filter States
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState<"ALL" | "PENDING" | "ACTIVE">("ALL");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [userDateMode, setUserDateMode] = useState<"ALL" | "TODAY" | "SPECIFIC" | "RANGE">("ALL");
  const [userSpecificDate, setUserSpecificDate] = useState("");
  const [userStartDate, setUserStartDate] = useState("");
  const [userEndDate, setUserEndDate] = useState("");
  const [selectedUserDetails, setSelectedUserDetails] = useState<UserType | null>(null);
  const [approvingUser, setApprovingUser] = useState<UserType | null>(null);
  const [approvalRole, setApprovalRole] = useState("MADRASA");

  // Madrasa Management Search, Filter & Print States
  const [madrasaSearchQuery, setMadrasaSearchQuery] = useState("");
  const [madrasaStatusFilter, setMadrasaStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED">("ALL");
  const [madrasaDistrictFilter, setMadrasaDistrictFilter] = useState("");
  const [madrasaUpazilaFilter, setMadrasaUpazilaFilter] = useState("");
  const [madrasaDateMode, setMadrasaDateMode] = useState<"ALL" | "TODAY" | "THIS_MONTH" | "THIS_YEAR" | "SPECIFIC" | "RANGE">("ALL");
  const [madrasaSpecificDate, setMadrasaSpecificDate] = useState("");
  const [madrasaStartDate, setMadrasaStartDate] = useState("");
  const [madrasaEndDate, setMadrasaEndDate] = useState("");
  const [showPrintColumnsModal, setShowPrintColumnsModal] = useState(false);
  const [printColumns, setPrintColumns] = useState({
    sl: true,
    name: true,
    code: true,
    manager: true,
    phone: true,
    address: true,
    status: true,
    date: false,
  });

  const availableDistricts = useMemo(() => {
    const set = new Set<string>();
    madrasas.forEach((m) => {
      if (m.district && m.district.trim()) set.add(m.district.trim());
    });
    return Array.from(set).sort();
  }, [madrasas]);

  const availableUpazilas = useMemo(() => {
    const set = new Set<string>();
    madrasas.forEach((m) => {
      if (madrasaDistrictFilter && m.district !== madrasaDistrictFilter) return;
      if (m.upazila && m.upazila.trim()) set.add(m.upazila.trim());
    });
    return Array.from(set).sort();
  }, [madrasas, madrasaDistrictFilter]);

  const filteredMadrasas = useMemo(() => {
    return madrasas.filter((m) => {
      // 1. Status Filter
      if (madrasaStatusFilter === "PENDING" && m.isApproved) return false;
      if (madrasaStatusFilter === "APPROVED" && !m.isApproved) return false;

      // 2. District Filter
      if (madrasaDistrictFilter && m.district !== madrasaDistrictFilter) return false;

      // 3. Upazila Filter
      if (madrasaUpazilaFilter && m.upazila !== madrasaUpazilaFilter) return false;

      // 4. Date Filter
      if (madrasaDateMode !== "ALL" && m.createdAt) {
        const itemDate = new Date(m.createdAt);
        const today = new Date();

        if (madrasaDateMode === "TODAY") {
          if (
            itemDate.getFullYear() !== today.getFullYear() ||
            itemDate.getMonth() !== today.getMonth() ||
            itemDate.getDate() !== today.getDate()
          ) {
            return false;
          }
        } else if (madrasaDateMode === "THIS_MONTH") {
          if (
            itemDate.getFullYear() !== today.getFullYear() ||
            itemDate.getMonth() !== today.getMonth()
          ) {
            return false;
          }
        } else if (madrasaDateMode === "THIS_YEAR") {
          if (itemDate.getFullYear() !== today.getFullYear()) {
            return false;
          }
        } else if (madrasaDateMode === "SPECIFIC" && madrasaSpecificDate) {
          const spec = new Date(madrasaSpecificDate);
          if (
            itemDate.getFullYear() !== spec.getFullYear() ||
            itemDate.getMonth() !== spec.getMonth() ||
            itemDate.getDate() !== spec.getDate()
          ) {
            return false;
          }
        } else if (madrasaDateMode === "RANGE") {
          if (madrasaStartDate) {
            const start = new Date(madrasaStartDate);
            start.setHours(0, 0, 0, 0);
            if (itemDate < start) return false;
          }
          if (madrasaEndDate) {
            const end = new Date(madrasaEndDate);
            end.setHours(23, 59, 59, 999);
            if (itemDate > end) return false;
          }
        }
      }

      // 5. Search Text Filter
      if (madrasaSearchQuery.trim()) {
        const q = madrasaSearchQuery.toLowerCase().trim();
        const name = (m.name || "").toLowerCase();
        const code = (m.code || "").toLowerCase();
        const manager = (m.principalName || m.managerName || "").toLowerCase();
        const phone = (m.contactNo || "").toLowerCase();
        const address = (m.address || "").toLowerCase();
        const dist = (m.district || "").toLowerCase();
        const upz = (m.upazila || "").toLowerCase();

        const match =
          name.includes(q) ||
          code.includes(q) ||
          manager.includes(q) ||
          phone.includes(q) ||
          address.includes(q) ||
          dist.includes(q) ||
          upz.includes(q);

        if (!match) return false;
      }

      return true;
    });
  }, [
    madrasas,
    madrasaStatusFilter,
    madrasaDistrictFilter,
    madrasaUpazilaFilter,
    madrasaDateMode,
    madrasaSpecificDate,
    madrasaStartDate,
    madrasaEndDate,
    madrasaSearchQuery,
  ]);

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

        const aRes = await fetch('/api/admin/applications');
        if (aRes.ok) {
          const aData = await aRes.json();
          setApplications(aData.applications || []);
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
      setNewUser({ name: '', madrasaName: '', email: '', phone: '', password: '', role: 'GENERAL' });
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

  const handleApplicationAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    const label = action === 'APPROVE' ? 'অনুমোদন' : 'বাতিল';
    const isConfirmed = await confirm({
      title: `আবেদন ${label}`,
      message: `আপনি কি এই আবেদনটি ${label} করতে চান?`,
      type: action === 'APPROVE' ? 'warning' : 'error',
      confirmText: label + ' করুন',
      cancelText: 'না'
    });
    if (!isConfirmed) return;

    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setApplications(prev => prev.map(a => a._id === id ? { ...a, ...data.application } : a));
      alert({ title: 'সফল!', message: `আবেদনটি ${label} করা হয়েছে${action === 'APPROVE' ? '. কোড: ' + data.application?.code : ''}.`, type: 'success' });
    } catch (err: any) {
      alert({ title: 'ত্রুটি!', message: err.message || 'একটি ত্রুটি ঘটেছে', type: 'error' });
    }
  };

  const filteredApplications = appFilter === 'ALL'
    ? applications
    : applications.filter(a => a.status === appFilter);

  const renderApplicationManagement = () => (
    <div>
      {/* Global overlay for closing dropdowns */}
      {openDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
      )}

      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">আবেদন পরিচালনা</h2>
          <p className="text-slate-500 text-sm mt-1">নতুন মাদরাসা নিবন্ধন আবেদনগুলো এখানে দেখুন ও অনুমোদন করুন।</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-slate-100 p-1 rounded-full mr-2">
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-full transition-colors ${viewMode === 'card' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              title="কার্ড ভিউ"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-full transition-colors ${viewMode === 'table' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              title="টেবিল ভিউ"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          {(['ALL','PENDING','APPROVED','REJECTED'] as const).map(f => (
            <button
              key={f}
              onClick={() => setAppFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                appFilter === f
                  ? (f === 'PENDING' ? 'bg-amber-500 text-white' : f === 'APPROVED' ? 'bg-emerald-600 text-white' : f === 'REJECTED' ? 'bg-red-500 text-white' : 'bg-slate-800 text-white')
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'ALL' ? `সব (${applications.length})` : f === 'PENDING' ? `অপেক্ষমান (${applications.filter(a=>a.status==='PENDING').length})` : f === 'APPROVED' ? `অনুমোদিত (${applications.filter(a=>a.status==='APPROVED').length})` : `বাতিলকৃত (${applications.filter(a=>a.status==='REJECTED').length})`}
            </button>
          ))}
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <ClipboardList className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-400">এই ফিল্টারে কোনো আবেদন নেই।</p>
        </div>
      ) : (
        <div className={viewMode === 'card' ? "space-y-4" : "bg-white rounded-2xl border border-slate-200 shadow-sm"}>
          {viewMode === 'table' ? (
            <div className="">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 text-slate-500 font-bold text-sm">প্রতিষ্ঠানের নাম</th>
                    <th className="py-3 px-4 text-slate-500 font-bold text-sm">ধরন</th>
                    <th className="py-3 px-4 text-slate-500 font-bold text-sm">ঠিকানা</th>
                    <th className="py-3 px-4 text-slate-500 font-bold text-sm">যোগাযোগ</th>
                    <th className="py-3 px-4 text-slate-500 font-bold text-sm">স্ট্যাটাস</th>
                    <th className="py-3 px-4 text-slate-500 font-bold text-sm text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApplications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => setPreviewApplication(app)}>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 group-hover:text-primary transition-colors">{app.name}</div>
                        {app.englishName && <div className="text-xs text-slate-400">{app.englishName}</div>}
                        {app.code && <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-600">{app.code}</span>}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">{app.instituteType || '—'}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        <div>{app.upazila}</div>
                        <div className="text-xs text-slate-400">{app.district}</div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <span>{app.phone1 || '—'}</span>
                          {app.phone1 && (
                            <div className="relative">
                              <button
                                onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown?.id === app._id && openDropdown.type === 'call' ? null : {id: app._id, type: 'call'}); }}
                                className="p-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 rounded-full transition-colors flex items-center justify-center"
                              >
                                <PhoneCall className="w-4 h-4" />
                              </button>
                              
                              <AnimatePresence>
                                {openDropdown?.id === app._id && openDropdown?.type === 'call' && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                    className="absolute left-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden"
                                  >
                                    <a 
                                      href={`tel:${app.phone1}`} 
                                      onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); }}
                                      className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors text-slate-700 w-full text-left"
                                    >
                                      <div className="bg-blue-50 p-1.5 rounded-full text-blue-600"><PhoneCall className="w-3.5 h-3.5" /></div>
                                      <span className="font-medium text-sm">সরাসরি কল</span>
                                    </a>
                                    <div className="h-px bg-slate-100 w-full" />
                                    <a 
                                      href={`https://wa.me/${app.phone1.replace(/[^0-9]/g, '')}`} 
                                      target="_blank" rel="noopener noreferrer"
                                      onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); }}
                                      className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors text-slate-700 w-full text-left"
                                    >
                                      <div className="bg-emerald-50 p-1.5 rounded-full text-emerald-600"><MessageCircle className="w-3.5 h-3.5" /></div>
                                      <span className="font-medium text-sm">হোয়াটসঅ্যাপ</span>
                                    </a>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          app.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          app.status === 'REJECTED' ? 'bg-red-50 text-red-600 border border-red-100' :
                          'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {app.status === 'APPROVED' ? '✓ অনুমোদিত' : app.status === 'REJECTED' ? '✗ বাতিলকৃত' : '⏳ অপেক্ষমান'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown?.id === app._id && openDropdown.type === 'action' ? null : {id: app._id, type: 'action'}); }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          <AnimatePresence>
                            {openDropdown?.id === app._id && openDropdown?.type === 'action' && (
                              <motion.div
                                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden py-1"
                              >
                                <button
                                  onClick={(e) => { e.stopPropagation(); setPreviewApplication(app); setOpenDropdown(null); }}
                                  className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors text-slate-700 w-full text-left"
                                >
                                  <Eye className="w-4 h-4 text-slate-400" />
                                  <span className="font-medium text-sm">বিস্তারিত দেখুন</span>
                                </button>
                                
                                {app.status === 'PENDING' && (
                                  <>
                                    <div className="h-px bg-slate-100 w-full my-1" />
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleApplicationAction(app._id, 'APPROVE'); setOpenDropdown(null); }}
                                      className="flex items-center gap-3 px-4 py-2 hover:bg-emerald-50 transition-colors text-emerald-700 w-full text-left"
                                    >
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                      <span className="font-medium text-sm">অনুমোদন</span>
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleApplicationAction(app._id, 'REJECT'); setOpenDropdown(null); }}
                                      className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition-colors text-red-700 w-full text-left"
                                    >
                                      <XCircle className="w-4 h-4 text-red-600" />
                                      <span className="font-medium text-sm">বাতিল</span>
                                    </button>
                                  </>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            filteredApplications.map((app) => (
              <motion.div
                key={app._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm"
              >
                <div className="p-6 flex flex-wrap gap-4 justify-between items-start">
                  <div 
                    className="flex-1 min-w-0 cursor-pointer group"
                    onClick={() => setPreviewApplication(app)}
                  >
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-bold text-slate-800 text-lg group-hover:text-primary transition-colors">{app.name}</h3>
                      {app.englishName && <span className="text-slate-400 text-sm">({app.englishName})</span>}
                      <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                        app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {app.status === 'APPROVED' ? '✓ অনুমোদিত' : app.status === 'REJECTED' ? '✗ বাতিলকৃত' : '⏳ অপেক্ষমান'}
                      </span>
                      {app.code && <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-100 text-blue-700">{app.code}</span>}
                    </div>
                    
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-slate-400" /> <span>{app.instituteType || '—'}</span></div>
                      <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> <span>{app.upazila}, {app.district}</span></div>
                      <div className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-400" /> <span>{app.phone1 || '—'}</span></div>
                    </div>
                  </div>
  
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100 text-slate-500">
                        <ClipboardList className="w-4 h-4" /> 
                        <span className="font-mono text-xs font-semibold tracking-wider">{app.trackingId || '—'}</span>
                      </div>
                      
                      {app.phone1 && (
                        <div className="relative">
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown?.id === app._id && openDropdown.type === 'call' ? null : {id: app._id, type: 'call'}); }}
                            className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-full transition-colors flex items-center justify-center shadow-sm border border-emerald-100"
                            title="কল করুন"
                          >
                            <PhoneCall className="w-5 h-5" />
                          </button>
                          
                          <AnimatePresence>
                            {openDropdown?.id === app._id && openDropdown?.type === 'call' && (
                              <motion.div
                                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden"
                              >
                                <a 
                                  href={`tel:${app.phone1}`} 
                                  onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); }}
                                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-slate-700 w-full text-left"
                                >
                                  <div className="bg-blue-50 p-2 rounded-full text-blue-600"><PhoneCall className="w-4 h-4" /></div>
                                  <span className="font-medium text-sm">সরাসরি কল</span>
                                </a>
                                <div className="h-px bg-slate-100 w-full" />
                                <a 
                                  href={`https://wa.me/${app.phone1.replace(/[^0-9]/g, '')}`} 
                                  target="_blank" rel="noopener noreferrer"
                                  onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); }}
                                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-slate-700 w-full text-left"
                                >
                                  <div className="bg-emerald-50 p-2 rounded-full text-emerald-600"><MessageCircle className="w-4 h-4" /></div>
                                  <span className="font-medium text-sm">হোয়াটসঅ্যাপ</span>
                                </a>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                    
                    <div className="w-px h-12 bg-slate-100 hidden sm:block mx-1"></div>

                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown?.id === app._id && openDropdown.type === 'action' ? null : {id: app._id, type: 'action'}); }}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
  
                    <AnimatePresence>
                      {openDropdown?.id === app._id && openDropdown?.type === 'action' && (
                        <motion.div
                          initial={{ opacity: 0, y: -5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -5, scale: 0.95 }}
                          className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden py-1"
                        >
                          <button
                            onClick={(e) => { e.stopPropagation(); setPreviewApplication(app); setOpenDropdown(null); }}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-slate-700 w-full text-left"
                          >
                            <Eye className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-sm">বিস্তারিত দেখুন</span>
                          </button>
                          
                          {app.status === 'PENDING' && (
                            <>
                              <div className="h-px bg-slate-100 w-full my-1" />
                              <button
                                onClick={(e) => { e.stopPropagation(); handleApplicationAction(app._id, 'APPROVE'); setOpenDropdown(null); }}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 transition-colors text-emerald-700 w-full text-left"
                              >
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span className="font-medium text-sm">অনুমোদন করুন</span>
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleApplicationAction(app._id, 'REJECT'); setOpenDropdown(null); }}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-red-700 w-full text-left"
                              >
                                <XCircle className="w-4 h-4 text-red-600" />
                                <span className="font-medium text-sm">বাতিল করুন</span>
                              </button>
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Application Preview Modal */}
      <AnimatePresence>
        {previewApplication && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:bg-white print:p-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] print:max-h-full print:shadow-none print:border-none"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50 print:hidden">
                <h3 className="text-xl font-bold text-slate-800">আবেদনের বিস্তারিত</h3>
                <div className="flex items-center gap-2">
                  {previewApplication.status === 'PENDING' && (
                    <>
                      <button onClick={() => { handleApplicationAction(previewApplication._id, 'APPROVE'); setPreviewApplication(null); }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors">
                        <CheckCircle2 className="w-4 h-4" /> অনুমোদন
                      </button>
                      <button onClick={() => { handleApplicationAction(previewApplication._id, 'REJECT'); setPreviewApplication(null); }} className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors">
                        <XCircle className="w-4 h-4" /> বাতিল
                      </button>
                    </>
                  )}
                  <button onClick={() => window.print()} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ml-2">
                    প্রিন্ট
                  </button>
                  <button onClick={() => setPreviewApplication(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors ml-2">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-2 print:p-0">
                <PrintableReceipt application={previewApplication} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

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

  const renderUserManagement = () => {
    const totalUsers = users.length;
    const pendingUsersCount = users.filter(u => (u.role || "").trim().toUpperCase() === "GENERAL").length;
    const activeUsersCount = users.filter(u => (u.role || "").trim().toUpperCase() !== "GENERAL").length;

    // Filter users based on query, status, role, and date
    const filteredUsers = users.filter((user) => {
      // 1. Search Query
      if (userSearchQuery.trim()) {
        const q = userSearchQuery.toLowerCase();
        const matchName = (user.name || "").toLowerCase().includes(q);
        const matchEmail = (user.email || "").toLowerCase().includes(q);
        const matchPhone = (user.phone || "").toLowerCase().includes(q);
        const matchRole = (user.role || "").toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchRole) return false;
      }

      // 2. Status Filter
      const isPending = (user.role || "").trim().toUpperCase() === "GENERAL";
      if (userStatusFilter === "PENDING" && !isPending) return false;
      if (userStatusFilter === "ACTIVE" && isPending) return false;

      // 3. Role Filter
      if (userRoleFilter !== "ALL") {
        if ((user.role || "").trim().toUpperCase() !== userRoleFilter.toUpperCase()) {
          return false;
        }
      }

      // 4. Date Filter
      if (user.createdAt && userDateMode !== "ALL") {
        const userDate = new Date(user.createdAt);
        if (!isNaN(userDate.getTime())) {
          const userDateStr = userDate.toISOString().split("T")[0]; // YYYY-MM-DD
          const todayStr = new Date().toISOString().split("T")[0];

          if (userDateMode === "TODAY") {
            if (userDateStr !== todayStr) return false;
          } else if (userDateMode === "SPECIFIC" && userSpecificDate) {
            if (userDateStr !== userSpecificDate) return false;
          } else if (userDateMode === "RANGE") {
            if (userStartDate && userDateStr < userStartDate) return false;
            if (userEndDate && userDateStr > userEndDate) return false;
          }
        }
      }

      return true;
    });

    const isFiltered = Boolean(
      userSearchQuery.trim() ||
      userStatusFilter !== "ALL" ||
      userRoleFilter !== "ALL" ||
      userDateMode !== "ALL" ||
      userSpecificDate ||
      userStartDate ||
      userEndDate
    );

    const resetFilters = () => {
      setUserSearchQuery("");
      setUserStatusFilter("ALL");
      setUserRoleFilter("ALL");
      setUserDateMode("ALL");
      setUserSpecificDate("");
      setUserStartDate("");
      setUserEndDate("");
    };

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden space-y-0">
        
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-700" />
              <span>ইউজার ম্যানেজমেন্ট ও রোল সেটিং</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              সকল নিবন্ধিত ইউজার, রোল অ্যাসাইনমেন্ট, পেন্ডিং অ্যাকাউন্ট এবং তারিখ ফিল্টারিং পরিচালনা করুন।
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Clickable Pending Users Filter Badge */}
            <button
              onClick={() => setUserStatusFilter(userStatusFilter === 'PENDING' ? 'ALL' : 'PENDING')}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                userStatusFilter === 'PENDING'
                  ? 'bg-amber-600 text-white border-amber-600 ring-2 ring-amber-300'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
              title="পেন্ডিং ইউজারদের তালিকা ফিল্টার করতে ক্লিক করুন"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>পেন্ডিং ইউজার: {pendingUsersCount}</span>
            </button>

            <button 
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-700 text-white px-4 py-1.5 rounded-xl shadow-xs hover:bg-emerald-800 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ নতুন ইউজার</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-100 space-y-3.5">
          
          {/* Row 1: Status Tabs + Search Input + Role Select */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            
            {/* Status Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 overflow-x-auto text-xs font-semibold shrink-0">
              <button
                type="button"
                onClick={() => setUserStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  userStatusFilter === "ALL"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                সব ইউজার ({totalUsers})
              </button>
              <button
                type="button"
                onClick={() => setUserStatusFilter("PENDING")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 whitespace-nowrap ${
                  userStatusFilter === "PENDING"
                    ? "bg-amber-500 text-white shadow-2xs font-bold"
                    : "text-amber-800 hover:bg-amber-100/60"
                }`}
              >
                <ShieldAlert className="w-3 h-3" />
                <span>পেন্ডিং / সাধারণ ({pendingUsersCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setUserStatusFilter("ACTIVE")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 whitespace-nowrap ${
                  userStatusFilter === "ACTIVE"
                    ? "bg-emerald-700 text-white shadow-2xs font-bold"
                    : "text-emerald-800 hover:bg-emerald-100/60"
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>অ্যাক্টিভ ({activeUsersCount})</span>
              </button>
            </div>

            {/* Search and Role Filter */}
            <div className="flex items-center gap-2.5 flex-1 max-w-2xl flex-wrap sm:flex-nowrap">
              {/* Search Box */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="নাম, ইমেইল, ফোন বা রোল দিয়ে খুঁজুন..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors"
                />
                {userSearchQuery && (
                  <button
                    onClick={() => setUserSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Role Dropdown Filter */}
              <div className="w-full sm:w-48 shrink-0">
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 font-medium text-slate-700 cursor-pointer"
                >
                  <option value="ALL">সকল রোল (All Roles)</option>
                  <option value="GENERAL">সাধারণ ইউজার (পেন্ডিং)</option>
                  <option value="MADRASA">মাদরাসা (MADRASA)</option>
                  <option value="MUALLIM">মুয়াল্লিম (MUALLIM)</option>
                  <option value="TRAINER">প্রশিক্ষক (TRAINER)</option>
                  <option value="VISITOR">পরিদর্শক (VISITOR)</option>
                  <option value="ADMIN">অ্যাডমিন (ADMIN)</option>
                  <option value="SUPER_ADMIN">সুপার অ্যাডমিন</option>
                </select>
              </div>
            </div>
          </div>

          {/* Row 2: Date Filtering (Specific Date & Date Range) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>তৈরির তারিখ ফিল্টার:</span>
              </span>

              {/* Date Filter Mode Selection */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setUserDateMode("ALL")}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    userDateMode === "ALL" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600"
                  }`}
                >
                  সকল সময়
                </button>
                <button
                  type="button"
                  onClick={() => setUserDateMode("TODAY")}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    userDateMode === "TODAY" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600"
                  }`}
                >
                  আজকের নিবন্ধন
                </button>
                <button
                  type="button"
                  onClick={() => setUserDateMode("SPECIFIC")}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    userDateMode === "SPECIFIC" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600"
                  }`}
                >
                  নির্দিষ্ট তারিখ
                </button>
                <button
                  type="button"
                  onClick={() => setUserDateMode("RANGE")}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    userDateMode === "RANGE" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600"
                  }`}
                >
                  তারিখের রেঞ্জ
                </button>
              </div>

              {/* Specific Date Picker */}
              {userDateMode === "SPECIFIC" && (
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={userSpecificDate}
                    onChange={(e) => setUserSpecificDate(e.target.value)}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-emerald-600"
                  />
                  {userSpecificDate && (
                    <button
                      onClick={() => setUserSpecificDate("")}
                      className="p-1 text-slate-400 hover:text-slate-600 text-xs"
                      title="তারিখ মুছুন"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Date Range Pickers (Start - End) */}
              {userDateMode === "RANGE" && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <input
                    type="date"
                    value={userStartDate}
                    onChange={(e) => setUserStartDate(e.target.value)}
                    className="px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-emerald-600"
                    placeholder="শুরুর তারিখ"
                  />
                  <span className="text-slate-400 text-xs">থেকে</span>
                  <input
                    type="date"
                    value={userEndDate}
                    onChange={(e) => setUserEndDate(e.target.value)}
                    className="px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-emerald-600"
                    placeholder="শেষ তারিখ"
                  />
                </div>
              )}
            </div>

            {/* Reset Filters */}
            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors border border-red-200 shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                <span>ফিল্টার রিসেট</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Count Summary */}
        <div className="px-6 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>
            প্রদর্শিত হচ্ছে: <b className="text-slate-800">{filteredUsers.length}</b> টি ইউজার
            {isFiltered && ` (মোট ${totalUsers} টি থেকে ফিল্টারকৃত)`}
          </span>
        </div>
        
        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-bold border-b border-slate-200 uppercase tracking-wider">
                <th className="px-6 py-3.5">নাম ও ইমেইল</th>
                <th className="px-6 py-3.5">ফোন নম্বর</th>
                <th className="px-6 py-3.5">তৈরির তারিখ</th>
                <th className="px-6 py-3.5">স্ট্যাটাস</th>
                <th className="px-6 py-3.5">ইউজারের ধরন (Role)</th>
                <th className="px-6 py-3.5 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    ডাটা লোড হচ্ছে...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-slate-400 space-y-2">
                    <Users className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                    <p className="font-semibold text-slate-600">কোনো ইউজার পাওয়া যায়নি।</p>
                    {isFiltered && (
                      <button
                        onClick={resetFilters}
                        className="text-xs text-emerald-700 hover:underline font-bold"
                      >
                        ফিল্টার পরিষ্কার করে সকল ইউজার দেখুন
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isPending = (user.role || "").trim().toUpperCase() === "GENERAL";
                  const createdDate = user.createdAt ? new Date(user.createdAt) : null;
                  const formattedDate = createdDate && !isNaN(createdDate.getTime())
                    ? createdDate.toLocaleDateString("bn-BD", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })
                    : "—";

                  return (
                    <tr key={user._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-3.5">
                        <p className="font-bold text-xs sm:text-sm text-slate-800">{user.name || "অজানা নাম"}</p>
                        <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-slate-600 font-mono">{user.phone || "—"}</td>
                      <td className="px-6 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{formattedDate}</span>
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        {!isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> অ্যাক্টিভ
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setApprovingUser(user);
                              setApprovalRole("MADRASA");
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-colors cursor-pointer"
                            title="ক্লিক করে এই ইউজারকে অনুমোদন দিন"
                          >
                            <ShieldAlert className="w-3 h-3" />
                            <span>সাধারণ / পেন্ডিং</span>
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        {user._id === 'master_admin_id' ? (
                          <span className="inline-block font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
                            সুপার অ্যাডমিন
                          </span>
                        ) : (
                          <select
                            value={(user.role || "").trim().toLowerCase()}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            className={`text-xs rounded-lg px-2.5 py-1.5 outline-none border focus:ring-2 transition-all cursor-pointer font-bold
                              ${isPending
                                ? 'bg-amber-50/60 border-amber-300 text-amber-900 focus:ring-amber-500/50' 
                                : 'bg-blue-50 border-blue-200 text-blue-700 focus:ring-blue-500/50'}`}
                          >
                            <option value="general">সাধারণ ইউজার (পেন্ডিং)</option>
                            <option value="madrasa">মাদরাসা</option>
                            <option value="muallim">মুয়াল্লিম</option>
                            <option value="trainer">প্রশিক্ষক</option>
                            <option value="visitor">পরিদর্শক</option>
                            <option value="admin">অ্যাডমিন</option>
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex justify-end gap-1.5 items-center">
                          {/* Quick Approve Button for Pending users */}
                          {isPending && user._id !== 'master_admin_id' && (
                            <button
                              type="button"
                              onClick={() => {
                                setApprovingUser(user);
                                setApprovalRole("MADRASA");
                              }}
                              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg shadow-2xs transition-all active:scale-95 inline-flex items-center gap-1"
                              title="ইউজার অ্যাকাউন্ট অনুমোদন দিন"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>অনুমোদন দিন</span>
                            </button>
                          )}

                          {user._id !== 'master_admin_id' && (
                            <button 
                              onClick={() => handleImpersonate(user._id)}
                              className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors"
                              title="এই ইউজারের প্রোফাইলে প্রবেশ করুন"
                            >
                              প্রবেশ করুন
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedUserDetails(user)}
                            className="text-xs text-slate-700 hover:text-slate-900 font-bold px-2.5 py-1 rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors"
                          >
                            বিস্তারিত
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Quick Approve Modal */}
        {approvingUser && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4"
            onClick={() => setApprovingUser(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">ইউজার অনুমোদন ও রোল নির্ধারণ</h3>
                    <p className="text-[11px] text-slate-500">অনুমোদনের পর ইউজার তার ড্যাশবোর্ডে প্রবেশ করতে পারবে</p>
                  </div>
                </div>
                <button
                  onClick={() => setApprovingUser(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-200/80 text-xs">
                <p className="text-slate-500 font-medium">আবেদনকারীর নাম: <b className="text-slate-900">{approvingUser.name || "অজানা"}</b></p>
                <p className="text-slate-500 font-medium">ইমেইল: <b className="text-slate-900 font-mono">{approvingUser.email}</b></p>
                <p className="text-slate-500 font-medium">ফোন: <b className="text-slate-900 font-mono">{approvingUser.phone || "—"}</b></p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ইউজারের অনুমোদিত রোল (Role) নির্বাচন করুন:
                </label>
                <div className="space-y-1.5">
                  {[
                    { id: "MADRASA", label: "মাদরাসা (MADRASA)", desc: "মাদরাসা প্রোফাইল ও শিক্ষার্থী পরিচালনা" },
                    { id: "MUALLIM", label: "মুয়াল্লিম (MUALLIM)", desc: "শিক্ষক ও মুয়াল্লিম প্যানেল" },
                    { id: "TRAINER", label: "প্রশিক্ষক (TRAINER)", desc: "প্রশিক্ষণ কোর্স ও ব্যাচ পরিচালনা" },
                    { id: "VISITOR", label: "পরিদর্শক (VISITOR)", desc: "পরিদর্শন ও রিপোর্ট তৈরি" },
                    { id: "ADMIN", label: "অ্যাডমিন (ADMIN)", desc: "পূর্ণ প্রশাসনিক এক্সেস" },
                  ].map((r) => (
                    <label
                      key={r.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        approvalRole === r.id
                          ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-200"
                          : "bg-white hover:bg-slate-50 border-slate-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="approvalRoleRadio"
                        value={r.id}
                        checked={approvalRole === r.id}
                        onChange={(e) => setApprovalRole(e.target.value)}
                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{r.label}</span>
                        <span className="text-[10.5px] text-slate-500">{r.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setApprovingUser(null)}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await handleRoleChange(approvingUser._id, approvalRole);
                    setApprovingUser(null);
                  }}
                  className="flex-1 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>✓ অনুমোদন নিশ্চিত করুন</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* User Details Modal */}
        {selectedUserDetails && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4"
            onClick={() => setSelectedUserDetails(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">ইউজারের বিস্তারিত তথ্য</h3>
                </div>
                <button
                  onClick={() => setSelectedUserDetails(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-200/80">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">নাম:</span>
                    <span className="font-bold text-slate-900">{selectedUserDetails.name || "অজানা"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">ইমেইল:</span>
                    <span className="font-mono text-slate-900 font-semibold">{selectedUserDetails.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">ফোন নম্বর:</span>
                    <span className="font-mono text-slate-900 font-semibold">{selectedUserDetails.phone || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">ইউজারের রোল:</span>
                    <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {selectedUserDetails.role}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">স্ট্যাটাস:</span>
                    <span className={`font-bold px-2 py-0.5 rounded ${
                      (selectedUserDetails.role || "").trim().toUpperCase() === "GENERAL"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {(selectedUserDetails.role || "").trim().toUpperCase() === "GENERAL" ? "পেন্ডিং / সাধারণ" : "অ্যাক্টিভ"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">অ্যাকাউন্ট তৈরির তারিখ:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedUserDetails.createdAt
                        ? new Date(selectedUserDetails.createdAt).toLocaleString("bn-BD", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">ইউজার আইডি:</span>
                    <span className="font-mono text-[10px] text-slate-400 select-all">{selectedUserDetails._id}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {/* If pending, allow approving directly from details modal */}
                {(selectedUserDetails.role || "").trim().toUpperCase() === "GENERAL" && (
                  <button
                    onClick={() => {
                      const u = selectedUserDetails;
                      setSelectedUserDetails(null);
                      setApprovingUser(u);
                      setApprovalRole("MADRASA");
                    }}
                    className="flex-1 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>✓ অনুমোদন দিন</span>
                  </button>
                )}
                {selectedUserDetails._id !== 'master_admin_id' && (
                  <button
                    onClick={() => {
                      handleImpersonate(selectedUserDetails._id);
                      setSelectedUserDetails(null);
                    }}
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    এই আইডিতে প্রবেশ করুন
                  </button>
                )}
                <button
                  onClick={() => setSelectedUserDetails(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4 text-slate-800">নতুন ইউজার তৈরি করুন</h2>
              <form onSubmit={handleCreateUser} className="space-y-4" autoComplete="off">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">পুরো নাম</label>
                  <input required type="text" name="user-name-new" autoComplete="new-password" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/50" placeholder="ব্যবহারকারীর নাম" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    মাদরাসা বা প্রতিষ্ঠানের নাম <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input required type="text" name="user-madrasa-new" autoComplete="new-password" value={newUser.madrasaName} onChange={e => setNewUser({...newUser, madrasaName: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/50 font-semibold" placeholder="যেমন: মুহাম্মাদনগর নূরানী ক্যাডেট মাদরাসা" />
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
  };

  const handlePrintMadrasas = () => {
    if (filteredMadrasas.length === 0) {
      alert({ title: "সতর্কতা", message: "প্রিন্ট করার মতো কোনো মাদরাসার তথ্য পাওয়া যায়নি।", type: "warning" });
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    const filterSummary: string[] = [];
    if (madrasaStatusFilter === "PENDING") filterSummary.push("স্ট্যাটাস: অপেক্ষমাণ");
    else if (madrasaStatusFilter === "APPROVED") filterSummary.push("স্ট্যাটাস: অনুমোদিত");
    else filterSummary.push("স্ট্যাটাস: সকল মাদরাসা");

    if (madrasaDistrictFilter) filterSummary.push(`জেলা: ${madrasaDistrictFilter}`);
    if (madrasaUpazilaFilter) filterSummary.push(`উপজেলা: ${madrasaUpazilaFilter}`);
    if (madrasaSearchQuery.trim()) filterSummary.push(`অনুসন্ধান: "${madrasaSearchQuery.trim()}"`);
    if (madrasaDateMode === "TODAY") filterSummary.push("তারিখ: আজকের নিবন্ধন");
    else if (madrasaDateMode === "THIS_MONTH") filterSummary.push("তারিখ: এই মাস");
    else if (madrasaDateMode === "THIS_YEAR") filterSummary.push("তারিখ: এই বছর");
    else if (madrasaDateMode === "SPECIFIC" && madrasaSpecificDate) filterSummary.push(`তারিখ: ${madrasaSpecificDate}`);
    else if (madrasaDateMode === "RANGE" && (madrasaStartDate || madrasaEndDate)) filterSummary.push(`রেঞ্জ: ${madrasaStartDate || 'শুরু'} হতে ${madrasaEndDate || 'আজ'}`);

    const activeCols = printColumns;

    const tableHeaderHtml = `
      <tr>
        ${activeCols.sl ? '<th style="width: 32px; text-align: center;">ক্র.</th>' : ''}
        ${activeCols.name ? '<th style="text-align: left;">মাদরাসার নাম</th>' : ''}
        ${activeCols.code ? '<th style="width: 75px; text-align: center;">কোড/ইলহাক</th>' : ''}
        ${activeCols.manager ? '<th style="text-align: left;">মুহতামিম / সভাপতি</th>' : ''}
        ${activeCols.phone ? '<th style="width: 95px; text-align: center;">মোবাইল নম্বর</th>' : ''}
        ${activeCols.address ? '<th style="text-align: left;">ঠিকানা ও অবস্থান</th>' : ''}
        ${activeCols.status ? '<th style="width: 65px; text-align: center;">স্ট্যাটাস</th>' : ''}
        ${activeCols.date ? '<th style="width: 75px; text-align: center;">নিবন্ধন তারিখ</th>' : ''}
      </tr>
    `;

    const tableRowsHtml = filteredMadrasas.map((m, idx) => `
      <tr>
        ${activeCols.sl ? `<td style="text-align: center; font-weight: bold; color: #475569;">${idx + 1}</td>` : ''}
        ${activeCols.name ? `<td style="font-weight: 600; color: #0f172a;">${m.name}</td>` : ''}
        ${activeCols.code ? `<td style="text-align: center; font-family: monospace; font-size: 10px; font-weight: bold;">${m.code || m.trackingId || '-'}</td>` : ''}
        ${activeCols.manager ? `<td>${m.principalName || m.managerName || '-'}</td>` : ''}
        ${activeCols.phone ? `<td style="text-align: center; font-family: monospace; font-size: 10px;">${m.contactNo || m.phone1 || '-'}</td>` : ''}
        ${activeCols.address ? `<td>${m.address || ((m.upazila ? m.upazila + ', ' : '') + (m.district || '')) || '-'}</td>` : ''}
        ${activeCols.status ? `<td style="text-align: center; font-weight: bold; color: ${m.isApproved ? '#15803d' : '#b45309'};">${m.isApproved ? 'অনুমোদিত' : 'অপেক্ষমাণ'}</td>` : ''}
        ${activeCols.date ? `<td style="text-align: center; font-size: 9.5px; color: #64748b;">${m.createdAt ? new Date(m.createdAt).toLocaleDateString('bn-BD') : '-'}</td>` : ''}
      </tr>
    `).join('');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>মাদরাসা তালিকা - নূরানী তালীমুল কুরআন বোর্ড খুলনা</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm 7mm 8mm 7mm;
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: var(--font-solaiman-lipi, 'SolaimanLipi'), sans-serif, system-ui;
              margin: 0;
              padding: 0;
              color: #1e293b;
              font-size: 10px;
              line-height: 1.25;
              background: #fff;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #16a34a;
              padding-bottom: 4px;
              margin-bottom: 6px;
            }
            .header h1 {
              font-size: 15px;
              font-weight: 800;
              color: #15803d;
              margin: 0 0 2px 0;
            }
            .header h2 {
              font-size: 11.5px;
              font-weight: 700;
              color: #334155;
              margin: 0 0 2px 0;
            }
            .header-meta {
              display: flex;
              justify-content: space-between;
              font-size: 9px;
              color: #64748b;
              margin-top: 2px;
              border-top: 1px dashed #cbd5e1;
              padding-top: 2px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 4px;
              table-layout: auto;
            }
            th {
              background-color: #15803d;
              color: #ffffff;
              font-size: 9.5px;
              font-weight: 700;
              padding: 3px 4px;
              border: 1px solid #15803d;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            td {
              padding: 2.5px 4px;
              border: 1px solid #cbd5e1;
              font-size: 9.5px;
              vertical-align: middle;
              word-break: break-word;
            }
            tr:nth-child(even) td {
              background-color: #f8fafc;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .footer {
              margin-top: 15px;
              display: flex;
              justify-content: space-between;
              font-size: 8.5px;
              color: #64748b;
              padding-top: 6px;
            }
            .sign-box {
              text-align: center;
              border-top: 1px dotted #94a3b8;
              width: 130px;
              padding-top: 2px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>নূরানী তালীমুল কুরআন বোর্ড খুলনা বাংলাদেশ</h1>
            <h2>মাদরাসা রেজিস্টার ও বিবরণী তালিকা</h2>
            <div class="header-meta">
              <div><strong>ফিল্টার:</strong> ${filterSummary.join(' | ')}</div>
              <div><strong>মোট মাদরাসা:</strong> ${filteredMadrasas.length} টি | <strong>প্রিন্ট তারিখ:</strong> ${new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>

          <table>
            <thead>
              ${tableHeaderHtml}
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <div class="sign-box">সফটওয়্যার অ্যাডমিন</div>
            <div class="sign-box">পরীক্ষা নিয়ন্ত্রক / পরিদর্শক</div>
            <div class="sign-box">মুহতামিম / মহাসচিব স্বাক্ষর</div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 2000);
    }, 400);
  };

  const renderMadrasaManagement = () => {
    const pendingCount = madrasas.filter(m => !m.isApproved).length;
    const approvedCount = madrasas.filter(m => m.isApproved).length;

    const hasActiveFilters =
      madrasaSearchQuery.trim() !== "" ||
      madrasaStatusFilter !== "ALL" ||
      madrasaDistrictFilter !== "" ||
      madrasaUpazilaFilter !== "" ||
      madrasaDateMode !== "ALL" ||
      madrasaSpecificDate !== "" ||
      madrasaStartDate !== "" ||
      madrasaEndDate !== "";

    const resetFilters = () => {
      setMadrasaSearchQuery("");
      setMadrasaStatusFilter("ALL");
      setMadrasaDistrictFilter("");
      setMadrasaUpazilaFilter("");
      setMadrasaDateMode("ALL");
      setMadrasaSpecificDate("");
      setMadrasaStartDate("");
      setMadrasaEndDate("");
    };

    return (
      <div className="space-y-4">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold text-slate-800">মাদরাসা পরিচালনা ও ডাটাবেজ</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                সকল নিবন্ধিত মাদরাসা, মুহতামিম, মোবাইল, ঠিকানা এবং অনুমোদন ও এ৪ প্রিন্ট ব্যবস্থাপনা।
              </p>
            </div>
            
            <div className="flex items-center flex-wrap gap-2">
              <button
                onClick={() => setShowPrintColumnsModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-xl border border-slate-200 transition-colors shadow-sm"
                title="প্রিন্ট কলাম নির্বাচন করুন"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
                <span>কলাম নির্বাচন</span>
              </button>

              <button
                onClick={handlePrintMadrasas}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/20 transition-all active:scale-[0.98]"
              >
                <Printer className="w-4 h-4" />
                <span>এ৪ প্রিন্ট করুন</span>
              </button>
            </div>
          </div>

          {/* Search and Filters Toolbar */}
          <div className="p-4 bg-white border-b border-slate-100 space-y-3">
            {/* Top Row: Status Tabs + Search bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 flex-wrap">
                <button
                  onClick={() => setMadrasaStatusFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    madrasaStatusFilter === "ALL"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  সব মাদরাসা ({madrasas.length})
                </button>
                <button
                  onClick={() => setMadrasaStatusFilter("PENDING")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    madrasaStatusFilter === "PENDING"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-amber-700 hover:bg-amber-100/50"
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>অপেক্ষমাণ ({pendingCount})</span>
                </button>
                <button
                  onClick={() => setMadrasaStatusFilter("APPROVED")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    madrasaStatusFilter === "APPROVED"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-emerald-700 hover:bg-emerald-100/50"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>অনুমোদিত ({approvedCount})</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="মাদরাসার নাম, কোড, মুহতামিম, ফোন বা ঠিকানা খুঁজুন..."
                  value={madrasaSearchQuery}
                  onChange={(e) => setMadrasaSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50 focus:bg-white transition-all shadow-inner"
                />
                {madrasaSearchQuery && (
                  <button
                    onClick={() => setMadrasaSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Second Row: Multi-layer Geographic Filters & Date Filters */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 text-xs">
              {/* District Filter */}
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={madrasaDistrictFilter}
                  onChange={(e) => {
                    setMadrasaDistrictFilter(e.target.value);
                    setMadrasaUpazilaFilter(""); // reset upazila when district changes
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-emerald-600"
                >
                  <option value="">সব জেলা (All Districts)</option>
                  {availableDistricts.map((dist) => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>

              {/* Upazila Filter */}
              <div className="flex items-center gap-1.5">
                <select
                  value={madrasaUpazilaFilter}
                  onChange={(e) => setMadrasaUpazilaFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-emerald-600"
                  disabled={availableUpazilas.length === 0}
                >
                  <option value="">সব উপজেলা (All Upazilas)</option>
                  {availableUpazilas.map((upz) => (
                    <option key={upz} value={upz}>{upz}</option>
                  ))}
                </select>
              </div>

              {/* Date Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex-wrap">
                <button
                  onClick={() => setMadrasaDateMode("ALL")}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${madrasaDateMode === "ALL" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600"}`}
                >
                  সকল সময়
                </button>
                <button
                  onClick={() => setMadrasaDateMode("TODAY")}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${madrasaDateMode === "TODAY" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600"}`}
                >
                  আজকের নিবন্ধন
                </button>
                <button
                  onClick={() => setMadrasaDateMode("THIS_MONTH")}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${madrasaDateMode === "THIS_MONTH" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600"}`}
                >
                  এই মাস
                </button>
                <button
                  onClick={() => setMadrasaDateMode("THIS_YEAR")}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${madrasaDateMode === "THIS_YEAR" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600"}`}
                >
                  এই বছর
                </button>
                <button
                  onClick={() => setMadrasaDateMode("SPECIFIC")}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${madrasaDateMode === "SPECIFIC" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600"}`}
                >
                  নির্দিষ্ট তারিখ
                </button>
                <button
                  onClick={() => setMadrasaDateMode("RANGE")}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${madrasaDateMode === "RANGE" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600"}`}
                >
                  তারিখের রেঞ্জ
                </button>
              </div>

              {/* Specific Date input */}
              {madrasaDateMode === "SPECIFIC" && (
                <div className="flex items-center gap-1 animate-in fade-in">
                  <input
                    type="date"
                    value={madrasaSpecificDate}
                    onChange={(e) => setMadrasaSpecificDate(e.target.value)}
                    className="px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              )}

              {/* Date Range inputs */}
              {madrasaDateMode === "RANGE" && (
                <div className="flex items-center gap-1.5 animate-in fade-in">
                  <input
                    type="date"
                    value={madrasaStartDate}
                    onChange={(e) => setMadrasaStartDate(e.target.value)}
                    className="px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                    placeholder="হতে"
                  />
                  <span className="text-slate-400">থেকে</span>
                  <input
                    type="date"
                    value={madrasaEndDate}
                    onChange={(e) => setMadrasaEndDate(e.target.value)}
                    className="px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                    placeholder="পর্যন্ত"
                  />
                </div>
              )}

              {/* Reset Filters */}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 px-2.5 py-1.5 rounded-lg border border-red-200 transition-colors ml-auto"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>ফিল্টার রিসেট</span>
                </button>
              )}
            </div>

            {/* Filter result counts */}
            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
              <span>
                প্রদর্শিত হচ্ছে: <strong className="text-slate-800">{filteredMadrasas.length}</strong> টি (মোট {madrasas.length} টি থেকে ফিল্টারকৃত)
              </span>
              {hasActiveFilters && (
                <span className="text-emerald-700 font-medium">ফিল্টার সক্রিয় রয়েছে</span>
              )}
            </div>
          </div>
          
          {/* Madrasa List Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs border-b border-slate-200 font-bold">
                  <th className="px-5 py-3 w-12 text-center">ক্র.</th>
                  <th className="px-5 py-3 min-w-[220px]">মাদরাসার নাম</th>
                  <th className="px-5 py-3 w-36">কোড ও ইলহাক</th>
                  <th className="px-5 py-3 min-w-[180px]">মুহতামিম ও যোগাযোগ</th>
                  <th className="px-5 py-3 min-w-[220px]">ঠিকানা ও অবস্থান</th>
                  <th className="px-5 py-3 w-32 text-center">স্ট্যাটাস</th>
                  <th className="px-5 py-3 w-32 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">ডাটা লোড হচ্ছে...</td>
                  </tr>
                ) : filteredMadrasas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      কোনো মাদরাসা পাওয়া যায়নি। ফিল্টার পরিবর্তন করে চেষ্টা করুন।
                    </td>
                  </tr>
                ) : (
                  filteredMadrasas.map((madrasa, idx) => (
                    <tr key={madrasa._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Serial */}
                      <td className="px-5 py-3.5 text-center text-xs font-bold text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Madrasa Name Column (Clean: only institute name) */}
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="font-bold text-slate-900 text-sm hover:text-emerald-700 transition-colors">
                            {madrasa.name}
                          </p>
                          {madrasa.englishName && (
                            <p className="text-[11px] text-slate-400 uppercase font-medium mt-0.5">
                              {madrasa.englishName}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Code */}
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200 inline-block shadow-sm">
                          {madrasa.code || madrasa.trackingId || "-"}
                        </span>
                      </td>

                      {/* Principal & Phone */}
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-800 text-xs">{madrasa.principalName || madrasa.managerName || "তথ্য নেই"}</p>
                        <p className="text-xs font-mono font-semibold text-slate-600 mt-0.5">{madrasa.contactNo || madrasa.phone1 || "তথ্য নেই"}</p>
                      </td>

                      {/* Address & Location Column (Address ONLY shown here) */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-start gap-1.5 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-slate-800 leading-snug">
                              {madrasa.address || [madrasa.village, madrasa.union, madrasa.upazila, madrasa.district].filter(Boolean).join(", ") || "ঠিকানা দেওয়া নেই"}
                            </p>
                            {(madrasa.upazila || madrasa.district) && (
                              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                                {[madrasa.upazila, madrasa.district].filter(Boolean).join(", ")}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 text-center">
                        {madrasa.isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> অনুমোদিত
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <ShieldAlert className="w-3.5 h-3.5" /> অপেক্ষমাণ
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <button 
                          onClick={() => handleToggleMadrasaApproval(madrasa._id, madrasa.isApproved)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border shadow-sm ${
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

        {/* Print Columns Selection Modal */}
        {showPrintColumnsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100">
              <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/80">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-bold text-sm text-slate-800">এ৪ প্রিন্ট কলাম কাস্টমাইজেশন</h3>
                </div>
                <button onClick={() => setShowPrintColumnsModal(false)} className="p-1 hover:bg-slate-200 rounded-full text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-xs text-slate-600">
                  এ৪ পেপারে প্রিন্ট করার সময় কোন কোন কলাম অন্তর্ভুক্ত করতে চান তা টিক দিন:
                </p>

                <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {[
                    { key: 'sl', label: '১. ক্রমিক নম্বর (SL)' },
                    { key: 'name', label: '২. মাদরাসার নাম' },
                    { key: 'code', label: '৩. কোড / ইলহাক' },
                    { key: 'manager', label: '৪. মুহতামিম / সভাপতি' },
                    { key: 'phone', label: '৫. মোবাইল নম্বর' },
                    { key: 'address', label: '৬. সম্পূর্ণ ঠিকানা' },
                    { key: 'status', label: '৭. অনুমোদনের স্ট্যাটাস' },
                    { key: 'date', label: '৮. নিবন্ধনের তারিখ' },
                  ].map((col) => (
                    <label key={col.key} className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-white text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={(printColumns as any)[col.key]}
                        onChange={(e) => setPrintColumns({ ...printColumns, [col.key]: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span>{col.label}</span>
                    </label>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPrintColumns({ sl: true, name: true, code: true, manager: true, phone: true, address: true, status: true, date: true })}
                      className="text-[11px] text-emerald-700 hover:underline font-bold"
                    >
                      সব নির্বাচন
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setPrintColumns({ sl: true, name: true, code: true, manager: true, phone: true, address: true, status: true, date: false })}
                      className="text-[11px] text-slate-500 hover:underline"
                    >
                      ডিফল্ট রিস্টোর
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPrintColumnsModal(false)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                    >
                      সম্পন্ন
                    </button>
                    <button
                      onClick={() => {
                        setShowPrintColumnsModal(false);
                        handlePrintMadrasas();
                      }}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg flex items-center gap-1 shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>প্রিন্ট করুন</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

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

  const renderStoreManagement = () => (
    <StoreManagementView />
  );

  return (
    <div
      ref={containerRef}
      style={{ height: contentHeight }}
      className="bg-slate-50 flex overflow-hidden w-full"
    >
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 h-full p-4 hidden xl:flex flex-col flex-shrink-0">
        <div className="mb-6 p-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
            অ্যাডমিন প্যানেল
          </h2>
        </div>
        
        <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "ড্যাশবোর্ড" },
            { id: "exams", icon: FileCheck, label: "পরীক্ষা ও প্রশ্নপত্র" },
            { id: "batches", icon: GraduationCap, label: "প্রশিক্ষণ ব্যাচ" },
            { id: "store", icon: ShoppingBag, label: "স্টোর পরিচালনা" },
            { id: "curriculum", icon: BookOpen, label: "কারিকুলাম" },
            { id: "applications", icon: ClipboardList, label: "আবেদন", badge: applications.filter(a=>a.status==='PENDING').length },
            { id: "locations", icon: MapPin, label: "লোকেশন পরিচালনা" },
            { id: "madrasas", icon: Building2, label: "মাদরাসা পরিচালনা" },
            { id: "users", icon: Users, label: "ইউজার পরিচালনা" },
            { id: "reports", icon: FileText, label: "রিপোর্ট" },
            { id: "settings", icon: Settings, label: "সেটিংস" },
          ].map((item: any) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-600 hover:bg-slate-50 hover:text-primary"
              }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  activeTab === item.id ? 'bg-white text-primary' : 'bg-amber-500 text-white'
                }`}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <button onClick={handleLogout} className="mt-auto pt-3 flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all flex-shrink-0">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">লগআউট</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto p-3 md:p-8 w-full max-w-full overflow-x-hidden">
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
        {activeTab === "applications" && renderApplicationManagement()}
        {activeTab === "exams" && <ExamQuestionManagementView />}
        {activeTab === "batches" && <BatchManagementView />}
        {activeTab === "store" && renderStoreManagement()}
        {activeTab === "curriculum" && <CurriculumManagementView />}
        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "settings" && <SettingsTab />}
        
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
