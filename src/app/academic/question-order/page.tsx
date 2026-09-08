"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FileQuestion,
  Search,
  ShoppingCart,
  CheckCircle,
  Printer,
  X,
  Plus,
  Minus,
  Copy,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Trash2,
  ArrowRight,
  ArrowLeft,
  LayoutGrid,
  Table as TableIcon,
  Info,
  Layers,
  ShieldCheck,
  PackageCheck,
  BookOpen,
  Calendar,
  Clock
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getExamStatusByDate } from "@/components/admin/ExamQuestionManagementView";
import GeoAddressSelector, { GeoAddressData } from "@/components/common/GeoAddressSelector";

type QuestionItem = {
  id: string;
  name: string;
  category: string;
  className: string;
  examTerm: string;
  pricePerSet: number;
  description: string;
  dbProductId?: string;
};

const DEFAULT_QUESTION_SETS: QuestionItem[] = [
  // ১ম শ্রেণী
  {
    id: "q_class1_term1",
    name: "১ম সাময়িক পরীক্ষা — নূরানী ১ম শ্রেণী",
    category: "প্রশ্নপত্র",
    className: "১ম শ্রেণী",
    examTerm: "১ম সাময়িক",
    pricePerSet: 15,
    description: "কুরআন মাজীদ, তাজবীদ, বাংলা, ইংরেজি ও গণিত প্রশ্নপত্র সেট"
  },
  {
    id: "q_class1_term2",
    name: "২য় সাময়িক পরীক্ষা — নূরানী ১ম শ্রেণী",
    category: "প্রশ্নপত্র",
    className: "১ম শ্রেণী",
    examTerm: "২য় সাময়িক",
    pricePerSet: 15,
    description: "কুরআন মাজীদ, তাজবীদ, বাংলা, ইংরেজি ও গণিত প্রশ্নপত্র সেট"
  },
  {
    id: "q_class1_annual",
    name: "বার্ষিক পরীক্ষা — নূরানী ১ম শ্রেণী",
    category: "প্রশ্নপত্র",
    className: "১ম শ্রেণী",
    examTerm: "বার্ষিক পরীক্ষা",
    pricePerSet: 18,
    description: "কেন্দ্রীয় বার্ষিক সমাপনী পরীক্ষার পূর্ণাঙ্গ প্রশ্নপত্র সেট"
  },

  // ২য় শ্রেণী
  {
    id: "q_class2_term1",
    name: "১ম সাময়িক পরীক্ষা — নূরানী ২য় শ্রেণী",
    category: "প্রশ্নপত্র",
    className: "২য় শ্রেণী",
    examTerm: "১ম সাময়িক",
    pricePerSet: 18,
    description: "কুরআন, আকাইদ ও মাসায়েল, বাংলা, ইংরেজি, অংক ও আরবি"
  },
  {
    id: "q_class2_term2",
    name: "২য় সাময়িক পরীক্ষা — নূরানী ২য় শ্রেণী",
    category: "প্রশ্নপত্র",
    className: "২য় শ্রেণী",
    examTerm: "২য় সাময়িক",
    pricePerSet: 18,
    description: "কুরআন, আকাইদ ও মাসায়েল, বাংলা, ইংরেজি, অংক ও আরবি"
  },
  {
    id: "q_class2_annual",
    name: "বার্ষিক পরীক্ষা — নূরানী ২য় শ্রেণী",
    category: "প্রশ্নপত্র",
    className: "২য় শ্রেণী",
    examTerm: "বার্ষিক পরীক্ষা",
    pricePerSet: 20,
    description: "কেন্দ্রীয় বার্ষিক মূল্যায়ন পরীক্ষার পূর্ণাঙ্গ প্রশ্নপত্র সেট"
  },

  // ৩য় শ্রেণী
  {
    id: "q_class3_term1",
    name: "১ম সাময়িক পরীক্ষা — নূরানী ৩য় শ্রেণী",
    category: "প্রশ্নপত্র",
    className: "৩য় শ্রেণী",
    examTerm: "১ম সাময়িক",
    pricePerSet: 20,
    description: "তাজবীদসহ কুরআন, ফারসি/উর্দু, বাংলা, ইংরেজি, অংক ও সাধারণ জ্ঞান"
  },
  {
    id: "q_class3_term2",
    name: "২য় সাময়িক পরীক্ষা — নূরানী ৩য় শ্রেণী",
    category: "প্রশ্নপত্র",
    className: "৩য় শ্রেণী",
    examTerm: "২য় সাময়িক",
    pricePerSet: 20,
    description: "তাজবীদসহ কুরআন, ফারসি/উর্দু, বাংলা, ইংরেজি, অংক ও সাধারণ জ্ঞান"
  },
  {
    id: "q_class3_annual",
    name: "বার্ষিক পরীক্ষা — নূরানী ৩য় শ্রেণী",
    category: "প্রশ্নপত্র",
    className: "৩য় শ্রেণী",
    examTerm: "বার্ষিক পরীক্ষা",
    pricePerSet: 22,
    description: "নূরানী ৩য় শ্রেণী কেন্দ্রীয় বার্ষিক পরীক্ষার প্রশ্নপত্র সেট"
  },
  {
    id: "q_class3_board",
    name: "বোর্ড সমাপনী পরীক্ষা — নূরানী ৩য় শ্রেণী",
    category: "প্রশ্নপত্র",
    className: "৩য় শ্রেণী",
    examTerm: "বোর্ড সমাপনী",
    pricePerSet: 25,
    description: "কেন্দ্রীয় নূরানী বোর্ড সমাপনী পরীক্ষার সকল বিষয়ের প্রশ্ন সেট"
  },

  // শিশু / প্লে ও অন্যান্য
  {
    id: "q_play_term1",
    name: "১ম সাময়িক পরীক্ষা — শিশু শ্রেণী (প্লে)",
    category: "প্রশ্নপত্র",
    className: "শিশু / প্লে",
    examTerm: "১ম সাময়িক",
    pricePerSet: 12,
    description: "শিশু শ্রেণীর প্রাথমিক কায়েদা, সংখ্যা ও বর্ণমালা মূল্যায়ন"
  },
  {
    id: "q_play_annual",
    name: "বার্ষিক পরীক্ষা — শিশু শ্রেণী (প্লে)",
    category: "প্রশ্নপত্র",
    className: "শিশু / প্লে",
    examTerm: "বার্ষিক পরীক্ষা",
    pricePerSet: 15,
    description: "শিশু শ্রেণীর বার্ষিক সমাপনী মূল্যায়ন প্রশ্নপত্র"
  },
  {
    id: "q_hifz_exam",
    name: "হিফযুল কুরআন মূল্যায়ন পরীক্ষা",
    category: "প্রশ্নপত্র",
    className: "হিফয বিভাগ",
    examTerm: "হিফয পরীক্ষা",
    pricePerSet: 20,
    description: "হিফজুল কুরআন শোনানো ও তাজবীদ যাচাই মূল্যায়ন পত্র"
  },
  {
    id: "q_moallem_exam",
    name: "মুয়াল্লিম প্রশিক্ষণ সমাপনী পরীক্ষা",
    category: "প্রশ্নপত্র",
    className: "মুয়াল্লিম কোর্স",
    examTerm: "মুয়াল্লিম পরীক্ষা",
    pricePerSet: 30,
    description: "মুয়াল্লিম প্রশিক্ষণ কোর্স সমাপনী পরীক্ষার বিষয়ভিত্তিক প্রশ্ন সেট"
  }
];

export default function QuestionOrderPage() {
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  // Cart state: Record of item id -> quantity
  const [cart, setCart] = useState<Record<string, { item: QuestionItem; qty: number }>>({});

  // Madrasa & Customer Details
  const [ilhak, setIlhak] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [instituteName, setInstituteName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [address, setAddress] = useState("");
  const [geoAddress, setGeoAddress] = useState<GeoAddressData>({
    division: "",
    district: "",
    upazila: "",
    union: "",
    village: "",
    fullAddress: "",
  });
  const [hasSeparateDelivery, setHasSeparateDelivery] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState<GeoAddressData>({
    division: "",
    district: "",
    upazila: "",
    union: "",
    village: "",
    fullAddress: "",
  });
  const [searchStatus, setSearchStatus] = useState<"idle" | "loading" | "found" | "not_found" | "error">("idle");

  // Payment States
  const [paymentOption, setPaymentOption] = useState<"pay_now" | "pay_later" | "money_receipt">("pay_now");
  const [paymentProvider, setPaymentProvider] = useState<"bKash" | "Nagad" | "Rocket" | "Bank">("bKash");
  const [trxId, setTrxId] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [receiptVerifyStatus, setReceiptVerifyStatus] = useState<"idle" | "verifying" | "valid" | "invalid">("idle");
  const [receiptVerifyMsg, setReceiptVerifyMsg] = useState("");
  const [receiptBalance, setReceiptBalance] = useState(0);
  const [copied, setCopied] = useState(false);

  // UI & Submission state
  const [selectedDetailItem, setSelectedDetailItem] = useState<QuestionItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved state from localStorage on initial render
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("nurani_question_order_cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (parsed && typeof parsed === "object") {
          setCart(parsed);
        }
      }

      const savedCustomer = localStorage.getItem("nurani_question_order_customer");
      if (savedCustomer) {
        const data = JSON.parse(savedCustomer);
        if (data.ilhak) setIlhak(data.ilhak);
        if (data.instituteName) setInstituteName(data.instituteName);
        if (data.ownerName) setOwnerName(data.ownerName);
        if (data.contactNo) setContactNo(data.contactNo);
        if (data.address) setAddress(data.address);
        if (data.geoAddress) setGeoAddress(data.geoAddress);
        if (data.hasSeparateDelivery !== undefined) setHasSeparateDelivery(data.hasSeparateDelivery);
        if (data.deliveryAddress) setDeliveryAddress(data.deliveryAddress);
      }

      const savedMode = localStorage.getItem("question_view_mode");
      if (savedMode === "table" || savedMode === "card") setViewMode(savedMode);
    } catch (err) {
      console.error("Error loading question order cache", err);
    }
    setIsHydrated(true);
  }, []);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem("nurani_question_order_cart", JSON.stringify(cart));
    } catch (err) {
      console.error("Error saving question order cart to cache", err);
    }
  }, [cart, isHydrated]);

  // Persist customer/madrasa form details
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(
        "nurani_question_order_customer",
        JSON.stringify({
          ilhak,
          instituteName,
          ownerName,
          contactNo,
          address: geoAddress.fullAddress || address,
          geoAddress,
          hasSeparateDelivery,
          deliveryAddress,
        })
      );
    } catch {}
  }, [ilhak, instituteName, ownerName, contactNo, address, geoAddress, hasSeparateDelivery, deliveryAddress, isHydrated]);

  const changeViewMode = (mode: "table" | "card") => {
    setViewMode(mode);
    try {
      localStorage.setItem("question_view_mode", mode);
    } catch {}
  };

  const [examSessions, setExamSessions] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/store/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const questionProds = data.filter((p: any) => {
            const cat = (p.category || "").toLowerCase();
            const name = (p.name || "").toLowerCase();
            return cat.includes("প্রশ্ন") || cat.includes("question") || name.includes("প্রশ্ন");
          });
          setDbProducts(questionProds);
        }
      })
      .catch(() => {});

    fetch("/api/exams")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.sessions)) {
          setExamSessions(data.sessions);
        }
      })
      .catch(() => {});
  }, []);

  const allQuestionItems = useMemo<QuestionItem[]>(() => {
    const list: QuestionItem[] = [...DEFAULT_QUESTION_SETS];

    // Merge session exams question sets
    examSessions.forEach((session) => {
      session.exams?.forEach((exam: any) => {
        exam.questionSets?.forEach((qs: any) => {
          if (!qs.isActive && qs.isActive !== undefined) return;
          const matchIndex = list.findIndex(
            (d) => d.name === qs.setName || (d.className === qs.className && d.examTerm === exam.name)
          );
          if (matchIndex >= 0) {
            list[matchIndex] = {
              ...list[matchIndex],
              pricePerSet: qs.pricePerSet || list[matchIndex].pricePerSet,
              description: qs.details || list[matchIndex].description,
            };
          } else {
            list.push({
              id: qs._id ? `qs_${qs._id}` : `qs_${exam._id}_${qs.className}`,
              name: qs.setName || `${qs.className} — ${exam.name}`,
              category: "প্রশ্নপত্র",
              className: qs.className || "সাধারণ",
              examTerm: exam.name || "সাধারণ",
              pricePerSet: qs.pricePerSet || 15,
              description: qs.details || (qs.subjects && qs.subjects.length > 0 ? qs.subjects.join(", ") : "প্রশ্নপত্র সেট"),
            });
          }
        });
      });
    });

    dbProducts.forEach((p) => {
      const matchIndex = list.findIndex((d) => d.name === p.name);
      if (matchIndex >= 0) {
        list[matchIndex] = {
          ...list[matchIndex],
          pricePerSet: p.price,
          dbProductId: p.id,
          description: p.description || list[matchIndex].description
        };
      } else {
        list.push({
          id: `db_${p.id}`,
          name: p.name,
          category: p.category || "প্রশ্নপত্র",
          className: p.className || "অন্যান্য",
          examTerm: p.subject || "সাধারণ",
          pricePerSet: p.price,
          description: p.description || "কেন্দ্রীয় পরীক্ষার প্রশ্নপত্র",
          dbProductId: p.id
        });
      }
    });
    return list;
  }, [examSessions, dbProducts]);

  const examTerms = useMemo(() => {
    const defaultTerms = ["১ম সাময়িক", "২য় সাময়িক", "বার্ষিক পরীক্ষা", "বোর্ড সমাপনী"];
    const dynamicTerms = Array.from(new Set(allQuestionItems.map((i) => i.examTerm).filter(Boolean)));
    return Array.from(new Set([...defaultTerms, ...dynamicTerms]));
  }, [allQuestionItems]);

  const classNames = useMemo(() => {
    const defaultClasses = ["১ম শ্রেণী", "২য় শ্রেণী", "৩য় শ্রেণী", "শিশু / প্লে", "হিফয বিভাগ", "মুয়াল্লিম কোর্স"];
    const dynamicClasses = Array.from(new Set(allQuestionItems.map((i) => i.className).filter(Boolean)));
    return Array.from(new Set([...defaultClasses, ...dynamicClasses]));
  }, [allQuestionItems]);

  const getExamInfo = (termName: string) => {
    if (!termName || termName === "all") return null;
    for (const session of examSessions) {
      if (Array.isArray(session.exams)) {
        const found = session.exams.find(
          (e: any) =>
            e.name === termName ||
            e.name?.includes(termName) ||
            termName.includes(e.name)
        );
        if (found) return found;
      }
    }
    return null;
  };

  const filteredItems = useMemo(() => {
    return allQuestionItems.filter((item) => {
      const matchSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.examTerm.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTerm = selectedTerm === "all" || item.examTerm === selectedTerm;
      const matchClass = selectedClass === "all" || item.className === selectedClass;
      return matchSearch && matchTerm && matchClass;
    });
  }, [allQuestionItems, searchQuery, selectedTerm, selectedClass]);

  const updateQty = (item: QuestionItem, delta: number) => {
    setCart((prev) => {
      const current = prev[item.id]?.qty || 0;
      const nextQty = Math.max(0, current + delta);
      if (nextQty === 0) {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      }
      return { ...prev, [item.id]: { item, qty: nextQty } };
    });
  };

  const setDirectQty = (item: QuestionItem, qty: number) => {
    setCart((prev) => {
      const validQty = Math.max(0, isNaN(qty) ? 0 : qty);
      if (validQty === 0) {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      }
      return { ...prev, [item.id]: { item, qty: validQty } };
    });
  };

  const totalItemCount = useMemo(() => {
    return Object.values(cart).reduce((sum, entry) => sum + entry.qty, 0);
  }, [cart]);

  const totalAmount = useMemo(() => {
    return Object.values(cart).reduce((sum, entry) => sum + entry.qty * entry.item.pricePerSet, 0);
  }, [cart]);

  const searchIlhak = async () => {
    if (!ilhak.trim()) return;
    setSearchStatus("loading");
    try {
      const res = await fetch(`/api/madrasa/by-code?code=${encodeURIComponent(ilhak.trim())}`);
      if (res.ok) {
        const data = await res.json();
        if (data.name) setInstituteName(data.name);
        if (data.ownerName) setOwnerName(data.ownerName);
        if (data.contactNo) setContactNo(data.contactNo);
        if (data.ilhak) setIlhak(data.ilhak);

        const newGeo: GeoAddressData = {
          division: data.division || geoAddress.division || "",
          district: data.district || geoAddress.district || "",
          upazila: data.upazila || geoAddress.upazila || "",
          union: data.union || geoAddress.union || "",
          village: data.village || (!data.division && data.address ? data.address : geoAddress.village) || "",
          fullAddress: data.address || [data.village, data.union, data.upazila, data.district, data.division].filter(Boolean).join(", "),
        };
        setGeoAddress(newGeo);
        setAddress(newGeo.fullAddress);

        setSearchStatus("found");
        const missingFields = [];
        if (!data.name) missingFields.push("মাদরাসার নাম");
        if (!data.ownerName) missingFields.push("মুহতামিমের নাম");
        if (!data.contactNo) missingFields.push("মোবাইল নম্বর");
        if (!newGeo.division || !newGeo.district) missingFields.push("ঠিকানা");

        if (missingFields.length > 0) {
          toast.success(`মাদরাসা পাওয়া গেছে! অনুগ্রহ করে অনুপস্থিত (${missingFields.join(", ")}) পূরণ করুন।`, { duration: 4000 });
        } else {
          toast.success("মাদরাসার সকল তথ্য স্বয়ংক্রিয়ভাবে যুক্ত হয়েছে!");
        }
      } else {
        setSearchStatus("not_found");
        toast.error("ইলহাক বা নম্বর পাওয়া যায়নি, অনুগ্রহ করে তথ্য ম্যানুয়ালি লিখুন");
      }
    } catch {
      setSearchStatus("error");
    }
  };

  const verifyReceipt = async () => {
    if (!receiptNumber.trim()) return;
    setReceiptVerifyStatus("verifying");
    setReceiptVerifyMsg("");
    try {
      const params = new URLSearchParams({ number: receiptNumber.trim() });
      if (contactNo.trim()) params.append("phone", contactNo.trim());
      const res = await fetch(`/api/store/receipts/verify?${params}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setReceiptVerifyStatus("valid");
        setReceiptBalance(data.availableBalance);
        setReceiptVerifyMsg(`✓ রিসিট সত্যায়িত! ব্যালান্স: ৳${data.availableBalance.toFixed(2)}`);
      } else {
        setReceiptVerifyStatus("invalid");
        setReceiptVerifyMsg(data.error || "রিসিট যাচাই ব্যর্থ হয়েছে");
      }
    } catch {
      setReceiptVerifyStatus("invalid");
      setReceiptVerifyMsg("সার্ভার ত্রুটি। আবার চেষ্টা করুন।");
    }
  };

  const handleCopyNumber = () => {
    const number = paymentProvider === "Bank" ? "123456789" : "01700000000";
    navigator.clipboard.writeText(number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveAddress = geoAddress.fullAddress || address;
    if (!ownerName.trim() || !instituteName.trim() || !contactNo.trim() || !effectiveAddress.trim()) {
      toast.error("অনুগ্রহ করে নাম, প্রতিষ্ঠান, মোবাইল নম্বর ও ঠিকানা পূরণ করুন");
      return;
    }

    if (totalItemCount === 0) {
      toast.error("অনুগ্রহ করে অন্তত একটি প্রশ্নপত্র সেটের পরিমাণ নির্বাচন করুন");
      return;
    }

    if (paymentOption === "pay_now" && !trxId.trim()) {
      toast.error("পেমেন্ট ট্রানজেকশন আইডি (TrxID) প্রদান করুন");
      return;
    }

    if (paymentOption === "money_receipt" && receiptVerifyStatus !== "valid") {
      toast.error("মানি রিসিট নম্বর সঠিক নয় বা যাচাই করা হয়নি");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems = [];
      for (const entry of Object.values(cart)) {
        let pId = entry.item.dbProductId;
        if (!pId) {
          const pMatch = dbProducts.find((p) => p.name === entry.item.name);
          if (pMatch) {
            pId = pMatch.id;
          } else {
            const resProd = await fetch("/api/store/products");
            const allP = await resProd.json();
            if (Array.isArray(allP) && allP.length > 0) {
              const exact = allP.find((p) => p.name === entry.item.name);
              pId = exact ? exact.id : allP[0].id;
            }
          }
        }
        if (pId) {
          orderItems.push({
            productId: pId,
            quantity: entry.qty,
            unitPrice: entry.item.pricePerSet
          });
        }
      }

      const ilhakNote = ilhak.trim() ? ` (ইলহাক: ${ilhak.trim()})` : "";
      const deliveryNote = hasSeparateDelivery && deliveryAddress.fullAddress ? ` | ডেলিভারি ঠিকানা: ${deliveryAddress.fullAddress}` : "";
      const questionOrderDetails = Object.values(cart)
        .map((c) => `[${c.item.name}: ${c.qty} সেট]`)
        .join(", ");

      const fullNotes = `[প্রশ্নের অর্ডার]: ${questionOrderDetails} | ${effectiveAddress}${deliveryNote}${ilhakNote}`;

      const res = await fetch("/api/store/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: ownerName.trim(),
          customerPhone: contactNo.trim(),
          instituteId: instituteName.trim(),
          items: orderItems,
          notes: fullNotes,
          paymentOption,
          paymentProvider: paymentOption === "pay_now" ? paymentProvider : undefined,
          trxId: paymentOption === "pay_now" ? trxId.trim() : undefined,
          receiptNumber: paymentOption === "money_receipt" ? receiptNumber.trim() : undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "অর্ডার সম্পন্ন করতে সমস্যা হয়েছে");

      setOrderSuccessData(data);
      setCart({});
      setIsCheckoutOpen(false);
      toast.success("প্রশ্নের অর্ডার সফলভাবে গ্রহণ করা হয়েছে!");
    } catch (err: any) {
      toast.error(err.message || "অর্ডার সম্পন্ন করতে সমস্যা হয়েছে");
    } finally {
      setIsSubmitting(false);
    }
  };

  const printInvoice = (order = orderSuccessData) => {
    if (!order) return;
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <html>
          <head>
            <title>Question Order Invoice ${order.invoiceId}</title>
            <style>
              body { font-family: sans-serif; padding: 25px; max-width: 800px; margin: 0 auto; color: #0f172a; line-height: 1.6; }
              .header { border-bottom: 2px solid #052e23; padding-bottom: 12px; margin-bottom: 20px; text-align: center; }
              h1 { color: #052e23; margin: 0 0 4px 0; font-size: 20px; }
              .subtitle { color: #047857; font-weight: bold; margin: 0 0 8px 0; font-size: 13px; }
              .badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 3px 10px; border-radius: 9999px; font-weight: bold; font-size: 11px; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8fafc; padding: 12px; border-radius: 6px; margin-bottom: 16px; border: 1px solid #e2e8f0; font-size: 12px; }
              table { width: 100%; border-collapse: collapse; margin-top: 12px; border: 1px solid #cbd5e1; font-size: 13px; }
              th { background: #052e23; color: white; padding: 8px; text-align: left; }
              td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .totals { width: 300px; margin-left: auto; margin-top: 16px; font-size: 13px; }
              .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
              .grand-total { font-size: 16px; font-weight: bold; border-top: 2px solid #052e23; color: #052e23; padding-top: 6px !important; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ</h1>
              <p class="subtitle">কেন্দ্রীয় পরীক্ষা শাখা — প্রশ্নপত্র অর্ডার রশিদ</p>
              <span class="badge">ইনভয়েস নং: ${order.invoiceId}</span>
            </div>
            <div class="info-grid">
              <div><strong>মাদরাসা:</strong> ${order.instituteId || "N/A"}</div>
              <div><strong>মোবাইল:</strong> ${order.customerPhone || "N/A"}</div>
              <div><strong>মুহতামিম/দায়িত্বশীল:</strong> ${order.customerName}</div>
              <div><strong>তারিখ:</strong> ${new Date(order.createdAt).toLocaleDateString("bn-BD")}</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>ক্রম</th>
                  <th>প্রশ্নপত্র সেটের বিবরণ</th>
                  <th class="text-center">পরিমাণ</th>
                  <th class="text-right">একক মূল্য</th>
                  <th class="text-right">মোট টাকা</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map((i: any, idx: number) => `
                  <tr>
                    <td class="text-center">${idx + 1}</td>
                    <td><strong>${i.product.name}</strong></td>
                    <td class="text-center font-bold">${i.quantity}</td>
                    <td class="text-right">৳${i.unitPrice}</td>
                    <td class="text-right font-bold">৳${(i.quantity * i.unitPrice).toFixed(2)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
            <div class="totals">
              <div><span>মোট প্রশ্ন ফি:</span><span>৳${order.totalAmount.toFixed(2)}</span></div>
              <div class="grand-total"><span>সর্বমোট প্রদেয়:</span><span>৳${order.totalAmount.toFixed(2)}</span></div>
              <div><span>অবস্থা:</span><span style="font-weight:bold; color:#047857;">${order.status}</span></div>
            </div>
          </body>
        </html>
      `);
      doc.close();
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => document.body.removeChild(iframe), 2000);
        }, 500);
      };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-4 sm:py-6 pb-28 sm:pb-16 font-sans">
      <div className="max-w-[1540px] mx-auto px-3.5 sm:px-6 md:px-8">

        {/* ─── BACK BUTTON ────────────────────────────── */}
        <div className="mb-2.5 sm:mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = "/";
              }
            }}
            className="group inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-emerald-800 bg-white hover:bg-slate-50 px-3.5 py-1.5 sm:py-2 rounded-xl border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-700 group-hover:-translate-x-0.5 transition-transform" />
            <span>পেছনে যান</span>
          </button>
        </div>

        {/* ─── 2. EXAM DROPDOWN & SEARCH CONTROL BAR ─────────────────── */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xs mb-3 space-y-2.5">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            
            {/* EXAM AS DROPDOWN */}
            <div className="flex-1 min-w-0 sm:max-w-xs">
              <label className="block text-[11px] font-bold text-slate-500 mb-1">পরীক্ষার নাম নির্বাচন করুন:</label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-emerald-600 focus:bg-white transition-colors cursor-pointer"
              >
                <option value="all">সকল পরীক্ষা (সবগুলো)</option>
                {examTerms.map((term) => {
                  const matchingExam = getExamInfo(term);
                  const status = matchingExam ? getExamStatusByDate(matchingExam.startDate, matchingExam.endDate, matchingExam.status) : null;
                  return (
                    <option key={term} value={term}>
                      {term} {status ? `— ${status.badgeText}` : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* SEARCH INPUT & SINGLE VIEW TOGGLE BUTTON IN SAME ROW */}
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-bold text-slate-500 mb-1">প্রশ্ন বা বিষয় খুঁজুন:</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="যেমন: কুরআন, বাংলা, ১ম সাময়িক..."
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-emerald-600 focus:bg-white transition-colors"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* SINGLE TOGGLE BUTTON RIGHT OF SEARCHBAR */}
                <button
                  type="button"
                  onClick={() => changeViewMode(viewMode === "table" ? "card" : "table")}
                  className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shrink-0 transition-all active:scale-95 shadow-2xs"
                  title={viewMode === "table" ? "কার্ড ভিউতে পরিবর্তন করুন" : "টেবিল ভিউতে পরিবর্তন করুন"}
                >
                  {viewMode === "table" ? (
                    <>
                      <LayoutGrid className="w-4 h-4 text-emerald-700" />
                      <span className="hidden sm:inline">কার্ড ভিউ</span>
                    </>
                  ) : (
                    <>
                      <TableIcon className="w-4 h-4 text-emerald-700" />
                      <span className="hidden sm:inline">টেবিল ভিউ</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* EXAM STATUS PILLS WITH LIVE COUNTDOWN BADGES */}
          {examTerms.length > 0 && (
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <span className="text-[11px] font-bold text-slate-500 shrink-0 mr-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                পরীক্ষা:
              </span>
              <button
                type="button"
                onClick={() => setSelectedTerm("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                  selectedTerm === "all"
                    ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                সকল পরীক্ষা
              </button>
              {examTerms.map((term) => {
                const matchingExam = getExamInfo(term);
                const status = matchingExam ? getExamStatusByDate(matchingExam.startDate, matchingExam.endDate, matchingExam.status) : null;
                const isSelected = selectedTerm === term;
                return (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setSelectedTerm(term)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 shrink-0 ${
                      isSelected
                        ? "bg-[#095738] text-white border-[#095738] shadow-xs"
                        : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span>{term}</span>
                    {status && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                          isSelected
                            ? "bg-white/25 text-white"
                            : status.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : status.status === "UPCOMING"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {status.badgeText}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* CLASS NAME AS TABS (WITH GENEROUS MOBILE PADDING & SMOOTH AUTO-CENTERING) */}
          <div className="pt-2.5 border-t border-slate-100">
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <button
                onClick={(e) => {
                  setSelectedClass("all");
                  e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                }}
                className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 active:scale-95 border ${
                  selectedClass === "all"
                    ? "bg-amber-400 text-slate-950 border-amber-500 font-black shadow-xs ring-2 ring-amber-400/40"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                সকল শ্রেণী
              </button>
              {classNames.map((cls) => (
                <button
                  key={cls}
                  onClick={(e) => {
                    setSelectedClass(cls);
                    e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                  }}
                  className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 active:scale-95 border ${
                    selectedClass === cls
                      ? "bg-amber-400 text-slate-950 border-amber-500 font-black shadow-xs ring-2 ring-amber-400/40"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* ─── 4. DEFAULT CLEAN TABLE OR CARD VIEW ──────────────────────────── */}
        {filteredItems.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-xs text-slate-500">
            কোনো প্রশ্নপত্র পাওয়া যায়নি। উপরের ফিল্টার পরিবর্তন করুন।
          </div>
        ) : viewMode === "table" ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#095738] text-white">
                    <th className="py-2.5 px-3 text-center w-10 font-bold">#</th>
                    <th className="py-2.5 px-3 font-bold min-w-[200px]">প্রশ্নপত্রের নাম ও বিবরণ</th>
                    <th className="py-2.5 px-3 text-right font-bold whitespace-nowrap">মূল্য</th>
                    <th className="py-2.5 px-3 text-center font-bold min-w-[130px]">সেট (সংখ্যা)</th>
                    <th className="py-2.5 px-3 text-right font-bold whitespace-nowrap pr-4">মোট</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item, idx) => {
                    const currentQty = cart[item.id]?.qty || 0;
                    const matchingExam = getExamInfo(item.examTerm);
                    const examStatus = matchingExam ? getExamStatusByDate(matchingExam.startDate, matchingExam.endDate, matchingExam.status) : null;
                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          currentQty > 0 ? "bg-emerald-50/70 font-semibold" : "hover:bg-slate-50/70"
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center text-slate-400 font-bold">
                          {idx + 1}
                        </td>
                        <td 
                          className="py-2.5 px-3 cursor-pointer group"
                          onClick={() => setSelectedDetailItem(item)}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <h4 className="text-xs sm:text-sm flex items-center gap-1.5 flex-wrap">
                                <span className="text-[#095738] font-black">{item.className}</span>
                                <span className="text-slate-300 font-normal">—</span>
                                <span className="text-slate-900 font-black">{item.examTerm.includes("পরীক্ষা") ? item.examTerm : `${item.examTerm} পরীক্ষা`}</span>
                                {examStatus && (
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black border ${examStatus.colorClass}`}>
                                    {examStatus.badgeText}
                                  </span>
                                )}
                              </h4>
                              <p className="text-[10.5px] text-slate-500 font-normal leading-tight mt-0.5">{item.description}</p>
                            </div>
                            <span className="shrink-0 text-[10.5px] text-emerald-700 font-bold hidden sm:inline-flex items-center gap-0.5 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 transition-colors">
                              <Info className="w-3 h-3" />
                              বিস্তারিত
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-800 whitespace-nowrap">
                          ৳{item.pricePerSet}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {currentQty === 0 ? (
                            <button
                              type="button"
                              onClick={() => updateQty(item, 1)}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-[#095738] text-[#095738] hover:text-white border border-emerald-300 hover:border-[#095738] rounded-lg font-bold text-xs flex items-center gap-1 mx-auto transition-all active:scale-95 shadow-2xs cursor-pointer"
                              title="যোগ করুন"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>যোগ</span>
                            </button>
                          ) : (
                            <div className="flex items-center justify-center gap-1 mx-auto w-fit animate-in fade-in duration-150">
                              <button
                                type="button"
                                onClick={() => updateQty(item, -1)}
                                className="w-7 h-7 bg-white border border-slate-200 hover:bg-slate-100 active:scale-95 rounded-lg text-slate-800 font-black text-xs shadow-2xs flex items-center justify-center transition-all cursor-pointer"
                                title="কমান"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="0"
                                value={currentQty || ""}
                                placeholder="0"
                                onChange={(e) => setDirectQty(item, parseInt(e.target.value) || 0)}
                                className="w-12 h-7 text-center font-black bg-white rounded-lg border border-emerald-600 text-xs text-slate-900 focus:outline-emerald-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 shadow-2xs"
                              />
                              <button
                                type="button"
                                onClick={() => updateQty(item, 1)}
                                className="w-7 h-7 bg-[#095738] hover:bg-[#07472d] active:scale-95 text-white rounded-lg font-black text-xs shadow-2xs flex items-center justify-center transition-all border border-[#095738] cursor-pointer"
                                title="বাড়ান"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right pr-4 font-black text-emerald-900 whitespace-nowrap">
                          ৳{(currentQty * item.pricePerSet).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredItems.map((item) => {
              const currentQty = cart[item.id]?.qty || 0;
              const matchingExam = getExamInfo(item.examTerm);
              const examStatus = matchingExam ? getExamStatusByDate(matchingExam.startDate, matchingExam.endDate, matchingExam.status) : null;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedDetailItem(item)}
                  className={`bg-white rounded-2xl p-4 border transition-all flex flex-col justify-between cursor-pointer hover:border-emerald-500 hover:shadow-md active:scale-[0.99] group ${
                    currentQty > 0 ? "border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-500/30 shadow-xs" : "border-slate-200 shadow-xs"
                  }`}
                >
                  <div>
                    {/* Important: First Class Name (Emerald) then Exam Name (Dark Slate) */}
                    <h3 className="text-sm sm:text-base leading-snug flex items-center gap-1.5 flex-wrap">
                      <span className="text-[#095738] font-black">{item.className}</span>
                      <span className="text-slate-300 font-normal">—</span>
                      <span className="text-slate-900 font-black">{item.examTerm.includes("পরীক্ষা") ? item.examTerm : `${item.examTerm} পরীক্ষা`}</span>
                      {examStatus && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-black border ${examStatus.colorClass}`}>
                          {examStatus.badgeText}
                        </span>
                      )}
                    </h3>

                    {/* Less Important: Muted / Subdued Opacity Description */}
                    <p className="text-[11.5px] text-slate-400 font-normal leading-relaxed line-clamp-2 mt-1.5 mb-3.5">
                      {item.description}
                    </p>
                  </div>

                  {/* Bottom Action Area */}
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="text-[10px] text-slate-400 block font-normal leading-none mb-0.5">প্রতি সেট</span>
                      {/* Important: Full Opacity Price */}
                      <span className="text-base font-black text-slate-900 leading-none">৳{item.pricePerSet}</span>
                    </div>

                    {/* Quantity Selector: First only + button, then show count and - */}
                    {currentQty === 0 ? (
                      <button
                        type="button"
                        onClick={() => updateQty(item, 1)}
                        className="h-9 sm:h-10 px-3.5 sm:px-4 bg-emerald-50 hover:bg-[#095738] text-[#095738] hover:text-white border border-emerald-300 hover:border-[#095738] active:scale-95 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-2xs group/btn cursor-pointer"
                        title="তালিকায় যোগ করুন"
                      >
                        <Plus className="w-4 h-4 text-emerald-700 group-hover/btn:text-white transition-colors" />
                        <span>যোগ করুন</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 shrink-0 animate-in fade-in duration-150">
                        <button
                          type="button"
                          onClick={() => updateQty(item, -1)}
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-bold text-base sm:text-lg flex items-center justify-center transition-all border bg-white border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 active:scale-95 shadow-2xs cursor-pointer"
                          title="কমান"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={currentQty || ""}
                          placeholder="0"
                          onChange={(e) => setDirectQty(item, parseInt(e.target.value) || 0)}
                          className="w-14 sm:w-16 h-9 sm:h-10 text-center font-black text-sm sm:text-base bg-white rounded-xl border border-emerald-600 text-slate-950 ring-1 ring-emerald-600/20 focus:outline-emerald-600 focus:border-emerald-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => updateQty(item, 1)}
                          className="w-9 h-9 sm:w-10 sm:h-10 bg-[#095738] hover:bg-[#07472d] active:scale-95 text-white rounded-xl font-bold text-base sm:text-lg flex items-center justify-center transition-all shadow-2xs border border-[#095738] cursor-pointer"
                          title="বাড়ান"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── 5. COMPACT STICKY BOTTOM CHECKOUT BAR (CLICK TO EXPAND) ─── */}
        {totalItemCount > 0 && (
          <>
            {/* Backdrop for expanded drawer */}
            {isCartDrawerOpen && (
              <div 
                onClick={() => setIsCartDrawerOpen(false)}
                className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40 animate-in fade-in duration-200"
              />
            )}

            {/* EXPANDED SELECTED ITEMS DRAWER / BOTTOM SHEET (70% Screen Height Even If Content Less) */}
            {isCartDrawerOpen && (
              <div className="fixed bottom-0 left-0 right-0 sm:bottom-4 sm:left-auto sm:right-6 sm:w-[440px] h-[70vh] max-h-[70vh] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col animate-in slide-in-from-bottom-5 duration-250 overflow-hidden">
                {/* Drawer Header */}
                <div className="p-3.5 sm:p-4 bg-[#052e23] text-white flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base leading-tight">নির্বাচিত প্রশ্নপত্র</h3>
                      <span className="text-[11px] text-amber-300 font-semibold">{totalItemCount} সেট প্রশ্ন যোগ করা হয়েছে</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCart({})}
                      className="px-2.5 py-1 text-[11px] font-bold text-red-300 hover:text-red-100 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      title="সবগুলো মুছুন"
                    >
                      খালি করুন
                    </button>
                    <button
                      onClick={() => setIsCartDrawerOpen(false)}
                      className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="বন্ধ করুন"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Selected Items Scrollable List */}
                <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-2.5 divide-y divide-slate-100">
                  {Object.values(cart).map(({ item, qty }) => (
                    <div key={item.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-2.5">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug line-clamp-1">{item.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10.5px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-bold">{item.className}</span>
                          <span className="text-[10.5px] bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded font-bold">{item.examTerm}</span>
                          <span className="text-[11px] text-slate-500 font-semibold ml-1">
                            {qty} × ৳{item.pricePerSet} = <strong className="text-emerald-800">৳{(qty * item.pricePerSet).toFixed(2)}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Item Stepper & Delete */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center bg-slate-100 border border-slate-200 p-0.5 rounded-lg">
                          <button
                            type="button"
                            onClick={() => updateQty(item, -1)}
                            className="w-6 h-6 bg-white hover:bg-slate-200 rounded text-slate-700 font-bold text-xs flex items-center justify-center transition-colors"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-black text-slate-900">{qty}</span>
                          <button
                            type="button"
                            onClick={() => updateQty(item, 1)}
                            className="w-6 h-6 bg-[#095738] hover:bg-[#07472d] text-white rounded font-bold text-xs flex items-center justify-center transition-colors"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => setDirectQty(item, 0)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Drawer Footer Summary & Checkout Action */}
                <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 space-y-3 shrink-0">
                  <div className="flex justify-between items-center text-xs text-slate-600">
                    <span>মোট নির্বাচিত সেটের সংখ্যা:</span>
                    <span className="font-bold text-slate-800">{totalItemCount} সেট</span>
                  </div>

                  <div className="flex justify-between items-center text-base font-black text-slate-900 border-t border-slate-200/80 pt-2">
                    <span>সর্বমোট বিল:</span>
                    <span className="text-lg font-black text-emerald-900">৳{totalAmount.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={() => {
                      setIsCartDrawerOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full py-3 bg-[#095738] hover:bg-[#07472d] text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>অর্ডার সম্পন্ন করুন (চেকআউট)</span>
                    <ArrowRight className="w-4 h-4 text-amber-300" />
                  </button>
                </div>
              </div>
            )}

            {/* FLOATING COLLAPSED BOTTOM BAR (Whole Card Clickable & Perfect Centered Alignment) */}
            <div className="fixed bottom-2.5 left-2.5 right-2.5 sm:bottom-4 sm:left-auto sm:right-6 sm:w-88 z-40 animate-in slide-in-from-bottom-3 duration-200">
              <div 
                onClick={() => setIsCartDrawerOpen(!isCartDrawerOpen)}
                className="bg-[#052e23] text-white px-3.5 py-2.5 rounded-2xl shadow-2xl border-2 border-amber-400 flex items-center justify-between gap-2.5 cursor-pointer hover:bg-[#07382b] transition-all active:scale-[0.99] select-none"
                title="নির্বাচিত তালিকার বিস্তারিত দেখতে ক্লিক করুন"
              >
                {/* Left Info Area */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
                    {isCartDrawerOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1 truncate">
                      মোট: {totalItemCount} সেট
                    </span>
                    <span className="text-sm sm:text-base font-black text-white leading-tight block">৳{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Right Direct Checkout Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCheckoutOpen(true);
                  }}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm transition-transform active:scale-95 flex items-center justify-center gap-1.5 shrink-0 shadow-md cursor-pointer whitespace-nowrap leading-none"
                >
                  <span className="leading-none pt-0.5">অর্ডার করুন</span>
                  <ArrowRight className="w-4 h-4 text-slate-950 shrink-0" />
                </button>
              </div>
            </div>
          </>
        )}

      </div>

      {/* ─── QUESTION DETAIL MODAL ──────────────────────────────────── */}
      {selectedDetailItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-3 animate-in fade-in duration-200"
          onClick={() => setSelectedDetailItem(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-[#095738] text-white">
              <div className="flex items-center gap-2">
                <FileQuestion className="w-4.5 h-4.5 text-amber-300" />
                <h3 className="font-bold text-sm sm:text-base">প্রশ্নপত্রের বিবরণ</h3>
              </div>
              <button 
                onClick={() => setSelectedDetailItem(null)} 
                className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3.5 text-xs sm:text-sm">
              {/* Question Name & Exam Date Status */}
              <div>
                <h2 className="text-base sm:text-lg leading-snug flex items-center gap-1.5 flex-wrap">
                  <span className="text-[#095738] font-black">{selectedDetailItem.className}</span>
                  <span className="text-slate-300 font-normal">—</span>
                  <span className="text-slate-900 font-black">{selectedDetailItem.examTerm.includes("পরীক্ষা") ? selectedDetailItem.examTerm : `${selectedDetailItem.examTerm} পরীক্ষা`}</span>
                </h2>
                {(() => {
                  const matchingExam = getExamInfo(selectedDetailItem.examTerm);
                  const examStatus = matchingExam ? getExamStatusByDate(matchingExam.startDate, matchingExam.endDate, matchingExam.status) : null;
                  if (!matchingExam && !examStatus) return null;
                  return (
                    <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                        <span>পরীক্ষার তারিখ: {matchingExam?.startDate ? `${matchingExam.startDate}${matchingExam.endDate ? ` হতে ${matchingExam.endDate}` : ""}` : "নির্ধারিত নয়"}</span>
                      </div>
                      {examStatus && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-black border ${examStatus.colorClass}`}>
                          {examStatus.badgeText}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Subjects / Description */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block mb-1">অন্তর্ভুক্ত বিষয়সমূহ:</span>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                  {selectedDetailItem.description}
                </p>
              </div>

              {/* Price & Quantity Selector */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2.5">
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">প্রতি সেট মূল্য</span>
                  <span className="text-base font-black text-slate-900">৳{selectedDetailItem.pricePerSet}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateQty(selectedDetailItem, -1)}
                    disabled={(cart[selectedDetailItem.id]?.qty || 0) === 0}
                    className="w-9 h-9 shrink-0 aspect-square bg-white border border-slate-200 hover:bg-slate-100 active:scale-95 rounded-xl text-slate-800 font-bold text-lg flex items-center justify-center transition-all disabled:opacity-25 shadow-2xs"
                    title="কমান"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={cart[selectedDetailItem.id]?.qty || ""}
                    placeholder="0"
                    onChange={(e) => setDirectQty(selectedDetailItem, parseInt(e.target.value) || 0)}
                    className="w-14 h-9 text-center font-black text-sm sm:text-base bg-white rounded-xl border border-slate-200 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 text-slate-900 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => updateQty(selectedDetailItem, 1)}
                    className="w-9 h-9 shrink-0 aspect-square bg-[#095738] hover:bg-[#07472d] active:scale-95 text-white rounded-xl font-bold text-lg flex items-center justify-center transition-all shadow-2xs border border-[#095738]"
                    title="বাড়ান"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Subtotal Calculation Box */}
              <div className="flex justify-between items-center px-1 text-xs sm:text-sm">
                <span className="text-slate-600 font-semibold">মোট মূল্য:</span>
                <span className="text-base font-black text-emerald-900">
                  ৳{((cart[selectedDetailItem.id]?.qty || 0) * selectedDetailItem.pricePerSet).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedDetailItem(null)}
                className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-colors"
              >
                বন্ধ করুন
              </button>

              <button
                type="button"
                onClick={() => {
                  if ((cart[selectedDetailItem.id]?.qty || 0) === 0) {
                    updateQty(selectedDetailItem, 1);
                  }
                  toast.success("অর্ডার তালিকায় যোগ হয়েছে");
                  setSelectedDetailItem(null);
                }}
                className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#095738] hover:bg-[#07472d] text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <ShoppingCart className="w-4 h-4 text-amber-300" />
                <span>তালিকায় যোগ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── CHECKOUT MODAL ────────────────────────────────────────── */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-3 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-[#095738] text-white">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <FileQuestion className="w-4 h-4 text-amber-300" />
                <span>প্রশ্নের অর্ডার ফরম</span>
              </h3>
              <button onClick={() => setIsCheckoutOpen(false)} className="p-1 text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ইলহাক বা মোবাইল নম্বর (অটো-ফিল)
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={ilhak}
                    onChange={(e) => {
                      setIlhak(e.target.value);
                      if (searchStatus !== "idle") setSearchStatus("idle");
                    }}
                    placeholder="যেমন: 1234 বা 01XXXXXXXXX"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 font-semibold focus:outline-emerald-600 bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={searchIlhak}
                    disabled={searchStatus === "loading" || !ilhak.trim()}
                    className="px-3 py-1.5 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 disabled:opacity-50"
                  >
                    {searchStatus === "loading" ? "খুঁজছি..." : "খুঁজুন"}
                  </button>
                </div>
                {searchStatus === "found" && <p className="text-[10.5px] text-emerald-600 mt-0.5 font-bold">✓ মাদরাসার তথ্য পাওয়া গেছে!</p>}
                {searchStatus === "not_found" && <p className="text-[10.5px] text-amber-600 mt-0.5 font-medium">⚠ পাওয়া যায়নি। ম্যানুয়ালি লিখুন।</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    মাদরাসা বা প্রতিষ্ঠানের নাম <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={instituteName}
                    onChange={(e) => setInstituteName(e.target.value)}
                    placeholder="যেমন: মুহাম্মাদনগর নূরানী ক্যাডেট মাদরাসা"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-semibold focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    মুহতামিম / আবেদনকারীর নাম <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="যেমন: মাওলানা মো: আবদুল্লাহ"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-semibold focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="tel"
                    required
                    value={contactNo}
                    onChange={(e) => setContactNo(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-semibold focus:outline-emerald-600"
                  />
                </div>
              </div>

              {/* Geo Cascade Address Selector with Delivery Option */}
              <div className="pt-2 border-t border-slate-100">
                <GeoAddressSelector
                  label="মাদরাসার পূর্ণাঙ্গ ঠিকানা *"
                  value={geoAddress}
                  onChange={(newVal) => {
                    setGeoAddress(newVal);
                    setAddress(newVal.fullAddress);
                  }}
                  hasSeparateDelivery={hasSeparateDelivery}
                  onSeparateDeliveryChange={setHasSeparateDelivery}
                  deliveryValue={deliveryAddress}
                  onDeliveryChange={setDeliveryAddress}
                />
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="block font-bold text-slate-800">পেমেন্ট পদ্ধতি</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "pay_now", label: "এখনই পেমেন্ট" },
                    { id: "money_receipt", label: "মানি রিসিট" },
                    { id: "pay_later", label: "পরে পেমেন্ট" }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPaymentOption(opt.id as any)}
                      className={`p-2 rounded-lg border text-center font-bold transition-all ${
                        paymentOption === opt.id
                          ? "border-[#095738] bg-emerald-50 text-[#095738] ring-1 ring-emerald-600"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {paymentOption === "pay_now" && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex gap-1.5">
                      {(["bKash", "Nagad", "Rocket", "Bank"] as const).map((prov) => (
                        <button
                          key={prov}
                          type="button"
                          onClick={() => setPaymentProvider(prov)}
                          className={`flex-1 py-1 rounded text-[11px] font-bold border ${
                            paymentProvider === prov ? "bg-[#095738] text-white border-[#095738]" : "bg-white text-slate-600 border-slate-200"
                          }`}
                        >
                          {prov}
                        </button>
                      ))}
                    </div>
                    <div className="p-2 bg-emerald-50 rounded border border-emerald-200 flex items-center justify-between text-[11px]">
                      <span>নম্বর: <strong>{paymentProvider === "Bank" ? "A/C: 123456789 (IBBL)" : "01700000000 (" + paymentProvider + ")"}</strong></span>
                      <button type="button" onClick={handleCopyNumber} className="bg-white border px-1.5 py-0.5 rounded font-bold text-[10px]">
                        {copied ? "কপি হয়েছে" : "কপি"}
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      placeholder="TrxID লিখুন *"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-semibold focus:outline-emerald-600"
                    />
                  </div>
                )}

                {paymentOption === "money_receipt" && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={receiptNumber}
                        onChange={(e) => setReceiptNumber(e.target.value)}
                        placeholder="মানি রিসিট নম্বর *"
                        className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg font-semibold focus:outline-emerald-600"
                      />
                      <button
                        type="button"
                        onClick={verifyReceipt}
                        disabled={receiptVerifyStatus === "verifying" || !receiptNumber.trim()}
                        className="px-3 py-1.5 bg-slate-800 text-white font-bold rounded-lg"
                      >
                        {receiptVerifyStatus === "verifying" ? "..." : "যাচাই"}
                      </button>
                    </div>
                    {receiptVerifyMsg && <p className={`text-[10.5px] font-bold ${receiptVerifyStatus === "valid" ? "text-emerald-600" : "text-red-500"}`}>{receiptVerifyMsg}</p>}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">মোট বিল</span>
                  <span className="text-base font-black text-emerald-900">৳{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => setIsCheckoutOpen(false)} className="px-3 py-1.5 font-bold bg-slate-100 rounded-lg">
                    বাতিল
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-1.5 font-bold text-white bg-[#095738] hover:bg-[#07472d] rounded-lg shadow-xs">
                    {isSubmitting ? "..." : "অর্ডার নিশ্চিত করুন"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── SUCCESS INVOICE MODAL ─────────────────────────────────── */}
      {orderSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-3 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 text-center border border-slate-200">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-2.5">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">প্রশ্নের অর্ডার সম্পন্ন হয়েছে!</h3>
            <p className="text-xs text-slate-500 mb-3">ইনভয়েস: <strong className="text-emerald-800 font-bold">{orderSuccessData.invoiceId}</strong></p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => printInvoice(orderSuccessData)}
                className="w-full py-2 bg-[#095738] hover:bg-[#07472d] text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>ইনভয়েস প্রিন্ট করুন</span>
              </button>
              <button onClick={() => setOrderSuccessData(null)} className="w-full py-1.5 bg-slate-100 text-slate-700 rounded-lg font-bold text-xs">
                ঠিক আছে
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
