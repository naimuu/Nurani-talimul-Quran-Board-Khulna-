"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Clock,
  Building2,
  Download,
  Truck,
  Smartphone,
  QrCode
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getExamStatusByDate } from "@/components/admin/ExamQuestionManagementView";
import GeoAddressSelector, { GeoAddressData } from "@/components/common/GeoAddressSelector";
import { generateClassId, getCanonicalClassId, generateExamCode, generateItemCode } from "@/lib/classUtils";
import { TrackOrderModal } from "@/components/shared/TrackOrderModal";
import { printOrderInvoice, downloadOrderPdf } from "@/lib/orderPrint";
import { generateQRCodeDataUrl, generateBarcodeSVG } from "@/lib/qrHelper";
import { cleanAddressNotes, parseQuestionItemsFromNotes } from "@/lib/orderTimeline";

type QuestionItem = {
  id: string;
  itemCode?: string;
  name: string;
  category: string;
  classId: string;
  className: string;
  examId?: string;
  examCode?: string;
  examTerm: string;
  pricePerSet: number;
  description: string;
  dbProductId?: string;
  sessionId?: string;
  sessionYear?: string;
  sessionName?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  subjects?: string[];
  instructions?: string;
  weightKg?: number;
};

export default function QuestionOrderPage() {
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>("all");
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "card">("card");

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
  const [autoFilledFields, setAutoFilledFields] = useState<{
    instituteName?: boolean;
    ownerName?: boolean;
    contactNo?: boolean;
    address?: boolean;
  }>({});

  // Delivery Options State
  const [deliveryOptions, setDeliveryOptions] = useState<any[]>([]);
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<string>("pathao");
  const [courierOrTransportName, setCourierOrTransportName] = useState<string>("");

  // Payment States (Strictly dynamic methods & money receipt, NO pay later)
  const [paymentStep, setPaymentStep] = useState(false);
  const [paymentOption, setPaymentOption] = useState<"pay_now" | "money_receipt">("pay_now");
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentTab, setSelectedPaymentTab] = useState<"mobile" | "bank">("mobile");
  const [selectedMethodId, setSelectedMethodId] = useState<string>("");
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [receiptVerifyStatus, setReceiptVerifyStatus] = useState<"idle" | "verifying" | "valid" | "invalid">("idle");
  const [receiptVerifyMsg, setReceiptVerifyMsg] = useState("");
  const [receiptBalance, setReceiptBalance] = useState(0);
  const [copied, setCopied] = useState(false);
  const [remainingOption, setRemainingOption] = useState<"pay_now" | "skip_receipt">("pay_now");
  const [remainingSenderNumber, setRemainingSenderNumber] = useState("");
  const [remainingTrxId, setRemainingTrxId] = useState("");
  const [remainingCopied, setRemainingCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Kendro Zimadar Commission Settings & State
  const [zimadarConfig, setZimadarConfig] = useState({
    percent: 15,
    minMadrasas: 5,
    minOrderAmount: 5000,
    enabled: true,
  });
  const [isZimadar, setIsZimadar] = useState(false);
  const [zimadarName, setZimadarName] = useState("");
  const [zimadarPhone, setZimadarPhone] = useState("");
  const [zimadarMadrasasList, setZimadarMadrasasList] = useState<string[]>([""]);

  // Fetch dynamic settings, payment methods and delivery options
  useEffect(() => {
    fetch(`/api/settings?t=${Date.now()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data.zimadarCommissionPercent === "number") {
          setZimadarConfig({
            percent: data.zimadarCommissionPercent,
            minMadrasas: data.zimadarMinMadrasas ?? 5,
            minOrderAmount: data.zimadarMinOrderAmount ?? 5000,
            enabled: data.zimadarCommissionEnabled ?? true,
          });
        }
        if (Array.isArray(data?.payments)) {
          const active = data.payments.filter((p: any) => p.isActive !== false);
          setPaymentMethods(active);
          if (active.length > 0) {
            const firstMob = active.find((p: any) => p.type === "mobile" || p.type === "MOBILE_BANKING") || active[0];
            setSelectedMethodId(firstMob.id || firstMob.provider);
          }
        }
      })
      .catch(() => {});

    fetch(`/api/delivery-options?t=${Date.now()}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDeliveryOptions(data);
          const firstActive = data.find((d: any) => d.isActive !== false);
          if (firstActive) setSelectedDeliveryType(firstActive.type);
        }
      })
      .catch(() => {});
  }, []);

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
          const cleaned: Record<string, any> = {};
          Object.entries(parsed).forEach(([key, val]: [string, any]) => {
            if (
              !key.startsWith("q_class") &&
              !key.startsWith("q_play") &&
              !key.startsWith("q_hifz") &&
              !key.startsWith("q_moallem")
            ) {
              cleaned[key] = val;
            }
          });
          setCart(cleaned);
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
  const [selectedSessionId, setSelectedSessionId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const isFirstFetch = React.useRef(true);

  // Shared fetch function — silent background refresh after first load
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const cacheBust = `?t=${Date.now()}`;
      const [productsRes, examsRes] = await Promise.allSettled([
        fetch(`/api/store/products${cacheBust}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
        }).then((r) => r.json()),
        fetch(`/api/exams${cacheBust}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
        }).then((r) => r.json()),
      ]);

      if (productsRes.status === "fulfilled" && Array.isArray(productsRes.value)) {
        const questionProds = productsRes.value.filter((p: any) => {
          const cat = (p.category || "").toLowerCase();
          const name = (p.name || "").toLowerCase();
          return cat.includes("প্রশ্ন") || cat.includes("question") || name.includes("প্রশ্ন");
        });
        setDbProducts(questionProds);
      }

      if (examsRes.status === "fulfilled" && Array.isArray(examsRes.value?.sessions)) {
        const sessions = examsRes.value.sessions;
        setExamSessions(sessions);
        if (sessions.length > 0) {
          setSelectedSessionId((prev) => {
            // Preserve previously selected session if it still exists
            if (prev !== "all" && sessions.some((s: any) => String(s._id) === String(prev))) {
              return prev;
            }
            const def = sessions.find((s: any) => s.isDefault) || sessions[0];
            return def ? String(def._id) : "all";
          });
        }
      }

      setLastSynced(new Date());
    } catch (e) {
      console.error("Failed to sync exam data", e);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchData(false);
    isFirstFetch.current = false;
  }, [fetchData]);

  // Poll every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(true); // silent background refresh
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Refresh when user returns to this tab (visibility change)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchData(true); // silent refresh on tab focus
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchData]);

  // Helper to dynamically resolve session name by ID so that name edits never mismatch
  const getSessionDisplayNameById = useCallback(
    (sessionId?: string, fallbackName?: string) => {
      if (!sessionId) return fallbackName || "";
      const match = examSessions.find((s) => String(s._id) === String(sessionId));
      if (match) {
        return (match.title?.trim() || match.sessionYear?.trim() || "").trim();
      }
      return fallbackName || "";
    },
    [examSessions]
  );

  const allQuestionItems = useMemo<QuestionItem[]>(() => {
    const list: QuestionItem[] = [];

    const sessionsToScan =
      selectedSessionId === "all"
        ? examSessions
        : examSessions.filter((s) => String(s._id) === String(selectedSessionId));

    // Merge session exams question sets added from admin
    sessionsToScan.forEach((session) => {
      session.exams?.forEach((exam: any) => {
        const exCode = exam.code || generateExamCode(exam.name, exam.examTerm);
        const exId = String(exam._id || exCode);

        exam.questionSets?.forEach((qs: any) => {
          if (qs.isActive === false) return;
          const cId = getCanonicalClassId(qs.classId || qs.className);
          const itemCode = qs.itemCode || generateItemCode(cId, exCode, qs.setName);
          // GUARANTEED IMMUTABLE ID:
          const itemId = qs._id ? String(qs._id) : itemCode;
          const subjectsText = Array.isArray(qs.subjects) && qs.subjects.length > 0 ? qs.subjects.join(", ") : "";
          const effectiveDesc = subjectsText || qs.details || "প্রশ্নপত্র সেট";

          list.push({
            id: itemId,
            itemCode,
            examId: exId,
            examCode: exCode,
            name: qs.setName || `${qs.className} — ${exam.name}`,
            category: "প্রশ্নপত্র",
            classId: cId,
            className: qs.className || "সাধারণ",
            examTerm: exam.name || exam.examTerm || "সাধারণ",
            pricePerSet: Number(qs.pricePerSet) || 0,
            description: effectiveDesc,
            sessionId: String(session._id),
            sessionYear: session.sessionYear,
            sessionName: (session.title || session.sessionYear || "").trim(),
            attachmentUrl: qs.attachmentUrl,
            attachmentName: qs.attachmentName,
            subjects: Array.isArray(qs.subjects) ? qs.subjects : [],
            instructions: qs.instructions,
          });
        });
      });
    });

    dbProducts.forEach((p) => {
      // Exclude auto-created sales bookkeeping products
      if (p.visibility === "academic" || p.visibility === "archived") return;
      const alreadyExists = list.some(item => item.name === p.name);
      if (alreadyExists) return;

      const cId = getCanonicalClassId(p.classId || p.className || "অন্যান্য");
      list.push({
        id: `db_${p.id}`,
        itemCode: `PROD_${p.id}`,
        name: p.name,
        category: p.category || "প্রশ্নপত্র",
        classId: cId,
        className: p.className || "অন্যান্য",
        examTerm: p.subject || "সাধারণ",
        pricePerSet: p.price || 0,
        description: p.description || "কেন্দ্রীয় পরীক্ষার প্রশ্নপত্র",
        dbProductId: p.id,
      });
    });

    return list;
  }, [examSessions, selectedSessionId, dbProducts]);

  const examTerms = useMemo(() => {
    const sessionsToScan =
      selectedSessionId === "all"
        ? examSessions
        : examSessions.filter((s) => String(s._id) === String(selectedSessionId));

    const termSet = new Set<string>();
    sessionsToScan.forEach((session) => {
      session.exams?.forEach((exam: any) => {
        if (exam.name) termSet.add(exam.name);
      });
    });

    allQuestionItems.forEach((item) => {
      if (item.examTerm && item.examTerm !== "সাধারণ") {
        termSet.add(item.examTerm);
      }
    });

    return Array.from(termSet);
  }, [examSessions, selectedSessionId, allQuestionItems]);

  const availableClasses = useMemo<{ id: string; name: string }[]>(() => {
    // Only classes present in actual question items for this session/exam
    const relevantItems =
      selectedTerm === "all"
        ? allQuestionItems
        : allQuestionItems.filter(
            (i) =>
              i.examCode === selectedTerm ||
              i.examId === selectedTerm ||
              i.examTerm === selectedTerm
          );

    const classMap = new Map<string, string>();
    relevantItems.forEach((item) => {
      if (item.classId && !classMap.has(item.classId)) {
        classMap.set(item.classId, item.className);
      }
    });

    return Array.from(classMap.entries()).map(([id, name]) => ({ id, name }));
  }, [allQuestionItems, selectedTerm]);

  // Auto-reset filters if current selection is no longer available in the active session
  useEffect(() => {
    if (selectedTerm !== "all" && !examTerms.includes(selectedTerm)) {
      setSelectedTerm("all");
    }
  }, [examTerms, selectedTerm]);

  useEffect(() => {
    if (selectedClassId !== "all" && !availableClasses.some((c) => c.id === selectedClassId)) {
      setSelectedClassId("all");
    }
  }, [availableClasses, selectedClassId]);

  const getExamInfo = (termNameOrId: string) => {
    if (!termNameOrId || termNameOrId === "all") return null;
    for (const session of examSessions) {
      if (Array.isArray(session.exams)) {
        const found = session.exams.find(
          (e: any) =>
            e.code === termNameOrId ||
            e.examId === termNameOrId ||
            String(e._id) === termNameOrId ||
            e.name === termNameOrId ||
            e.name?.includes(termNameOrId) ||
            termNameOrId.includes(e.name)
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
        (item.itemCode && item.itemCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.classId && item.classId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchTerm =
        selectedTerm === "all" ||
        item.examCode === selectedTerm ||
        item.examId === selectedTerm ||
        item.examTerm === selectedTerm;

      const matchClass =
        selectedClassId === "all" ||
        item.classId === selectedClassId ||
        getCanonicalClassId(item.className) === selectedClassId;

      return matchSearch && matchTerm && matchClass;
    });
  }, [allQuestionItems, searchQuery, selectedTerm, selectedClassId]);

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

  // Kendro Zimadar Commission Calculation & Helpers
  const validMadrasasCount = useMemo(() => {
    return zimadarMadrasasList.map((m) => m.trim()).filter(Boolean).length;
  }, [zimadarMadrasasList]);

  const isCommissionQualified = useMemo(() => {
    if (!isZimadar || !zimadarConfig.enabled) return false;
    return validMadrasasCount >= zimadarConfig.minMadrasas && totalAmount > zimadarConfig.minOrderAmount;
  }, [isZimadar, zimadarConfig, validMadrasasCount, totalAmount]);

  const commissionDiscount = useMemo(() => {
    if (!isCommissionQualified) return 0;
    return Math.round(totalAmount * (zimadarConfig.percent / 100));
  }, [isCommissionQualified, totalAmount, zimadarConfig.percent]);

  const selectedDeliveryOption = useMemo(() => {
    return deliveryOptions.find((d) => d.type === selectedDeliveryType) || {
      name: "পাঠাও কুরিয়ার",
      type: "pathao",
      charge: 0,
      requiresName: false,
    };
  }, [deliveryOptions, selectedDeliveryType]);

  const deliveryCharge = Number(selectedDeliveryOption.charge) || 0;

  const finalPayableAmount = useMemo(() => {
    return Math.max(0, totalAmount - commissionDiscount + deliveryCharge);
  }, [totalAmount, commissionDiscount, deliveryCharge]);

  const activeMethods = useMemo(() => {
    return paymentMethods.filter((p) => p.isActive !== false);
  }, [paymentMethods]);

  const mobileMethods = useMemo(() => {
    return activeMethods.filter((p) => p.type === "mobile" || p.type === "MOBILE_BANKING");
  }, [activeMethods]);

  const bankMethods = useMemo(() => {
    return activeMethods.filter((p) => p.type === "bank" || p.type === "BANK");
  }, [activeMethods]);

  const selectedMethod = useMemo(() => {
    if (selectedMethodId) {
      const found = activeMethods.find((p) => (p.id ? String(p.id) === String(selectedMethodId) : p.provider === selectedMethodId));
      if (found) return found;
    }
    const currentList = selectedPaymentTab === "mobile" ? mobileMethods : bankMethods;
    return currentList[0] || activeMethods[0] || null;
  }, [selectedMethodId, selectedPaymentTab, activeMethods, mobileMethods, bankMethods]);

  const addZimadarMadrasa = () => {
    setZimadarMadrasasList((prev) => [...prev, ""]);
  };

  const updateZimadarMadrasa = (idx: number, val: string) => {
    setZimadarMadrasasList((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const removeZimadarMadrasa = (idx: number) => {
    setZimadarMadrasasList((prev) => prev.filter((_, i) => i !== idx));
  };

  // Pathao-style Madrasa & Customer auto lookup by Ilhak or Mobile number
  const lookupMadrasaInfo = async (queryCode?: string, isPhoneAuto = false) => {
    const codeToSearch = (queryCode || ilhak || "").trim();
    if (!codeToSearch) return;

    if (!isPhoneAuto) {
      setSearchStatus("loading");
      setAutoFilledFields({});
    }

    try {
      const res = await fetch(`/api/madrasa/by-code?code=${encodeURIComponent(codeToSearch)}`);
      if (res.ok) {
        const data = await res.json();
        const autoFilled: {
          instituteName?: boolean;
          ownerName?: boolean;
          contactNo?: boolean;
          address?: boolean;
        } = {};

        if (data.name?.trim()) {
          setInstituteName(data.name.trim());
          autoFilled.instituteName = true;
          // Also set first zimadar madrasa if empty
          setZimadarMadrasasList((prev) => {
            if (prev.length === 0 || (prev.length === 1 && !prev[0])) {
              return [data.name.trim()];
            }
            return prev;
          });
        }
        if (data.ownerName?.trim()) {
          setOwnerName(data.ownerName.trim());
          autoFilled.ownerName = true;
        }
        if (data.contactNo?.trim()) {
          setContactNo(data.contactNo.trim());
          autoFilled.contactNo = true;
        }
        if (data.ilhak?.trim()) {
          setIlhak(data.ilhak.trim());
        }

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

        setAutoFilledFields(autoFilled);
        setSearchStatus("found");

        if (isPhoneAuto) {
          toast.success("পাঠাও স্টাইলে পূর্ববর্তী ঠিকানা ও মাদরাসার তথ্য লোড হয়েছে!");
        } else {
          const missingFields = [];
          if (!data.name?.trim()) missingFields.push("মাদরাসার নাম");
          if (!data.ownerName?.trim()) missingFields.push("মুহতামিমের নাম");
          if (!data.contactNo?.trim()) missingFields.push("মোবাইল নম্বর");
          if (!newGeo.division || !newGeo.district) missingFields.push("ঠিকানা");

          if (missingFields.length > 0) {
            toast.success(`মাদরাসা পাওয়া গেছে! অনুগ্রহ করে অনুপস্থিত (${missingFields.join(", ")}) পূরণ করুন।`, { duration: 4000 });
          } else {
            toast.success("মাদরাসার সকল তথ্য স্বয়ংক্রিয়ভাবে যুক্ত হয়েছে!");
          }
        }
      } else {
        if (!isPhoneAuto) {
          setSearchStatus("not_found");
          setAutoFilledFields({});
          toast.error("ইলহাক বা নম্বর পাওয়া যায়নি, অনুগ্রহ করে তথ্য ম্যানুয়ালি লিখুন");
        }
      }
    } catch {
      if (!isPhoneAuto) {
        setSearchStatus("error");
        setAutoFilledFields({});
      }
    }
  };

  const searchIlhak = () => lookupMadrasaInfo();

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

  const handleCopyText = (text: string, isRemaining: boolean = false) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (isRemaining) {
      setRemainingCopied(true);
      setTimeout(() => setRemainingCopied(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const validateAndProceedToPayment = () => {
    setErrorMsg("");
    const effectiveAddress = geoAddress.fullAddress || address;
    if (!instituteName.trim()) {
      setErrorMsg("মাদরাসা বা প্রতিষ্ঠানের নাম পূরণ করুন");
      toast.error("মাদরাসা বা প্রতিষ্ঠানের নাম পূরণ করুন");
      return;
    }
    if (!ownerName.trim()) {
      setErrorMsg("মুহতামিম / আবেদনকারীর নাম পূরণ করুন");
      toast.error("মুহতামিম / আবেদনকারীর নাম পূরণ করুন");
      return;
    }
    if (!contactNo.trim()) {
      setErrorMsg("মোবাইল নম্বর পূরণ করুন");
      toast.error("মোবাইল নম্বর পূরণ করুন");
      return;
    }
    if (!effectiveAddress.trim() || !geoAddress.division || !geoAddress.district) {
      setErrorMsg("মাদরাসার বিভাগ, জেলা ও পূর্ণাঙ্গ ঠিকানা প্রদান করুন");
      toast.error("মাদরাসার বিভাগ, জেলা ও পূর্ণাঙ্গ ঠিকানা প্রদান করুন");
      return;
    }
    if (totalItemCount === 0) {
      setErrorMsg("অনুগ্রহ করে অন্তত একটি প্রশ্নপত্র সেটের পরিমাণ নির্বাচন করুন");
      toast.error("অনুগ্রহ করে অন্তত একটি প্রশ্নপত্র সেটের পরিমাণ নির্বাচন করুন");
      return;
    }
    if (selectedDeliveryOption?.requiresName && !courierOrTransportName.trim()) {
      setErrorMsg(`অনুগ্রহ করে ${selectedDeliveryOption.name}-এর নাম উল্লেখ করুন`);
      toast.error(`অনুগ্রহ করে ${selectedDeliveryOption.name}-এর নাম উল্লেখ করুন`);
      return;
    }
    setPaymentStep(true);
  };

  const handleSubmitOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    const effectiveAddress = geoAddress.fullAddress || address;
    if (!ownerName.trim() || !instituteName.trim() || !contactNo.trim() || !effectiveAddress.trim()) {
      setErrorMsg("অনুগ্রহ করে নাম, প্রতিষ্ঠান, মোবাইল নম্বর ও ঠিকানা পূরণ করুন");
      toast.error("অনুগ্রহ করে নাম, প্রতিষ্ঠান, মোবাইল নম্বর ও ঠিকানা পূরণ করুন");
      return;
    }

    if (totalItemCount === 0) {
      setErrorMsg("অনুগ্রহ করে অন্তত একটি প্রশ্নপত্র সেটের পরিমাণ নির্বাচন করুন");
      toast.error("অনুগ্রহ করে অন্তত একটি প্রশ্নপত্র সেটের পরিমাণ নির্বাচন করুন");
      return;
    }

    if (selectedDeliveryOption?.requiresName && !courierOrTransportName.trim()) {
      setErrorMsg(`অনুগ্রহ করে ${selectedDeliveryOption.name}-এর নাম উল্লেখ করুন`);
      toast.error(`অনুগ্রহ করে ${selectedDeliveryOption.name}-এর নাম উল্লেখ করুন`);
      return;
    }

    const isPartialReceipt = paymentOption === "money_receipt" && receiptVerifyStatus === "valid" && receiptBalance < finalPayableAmount;

    if (paymentOption === "pay_now") {
      if (!senderNumber.trim()) {
        setErrorMsg("যে নম্বর বা অ্যাকাউন্ট থেকে পেমেন্ট পাঠিয়েছেন তা লিখুন");
        toast.error("যে নম্বর বা অ্যাকাউন্ট থেকে পেমেন্ট পাঠিয়েছেন তা লিখুন");
        return;
      }
      if (!trxId.trim()) {
        setErrorMsg("পেমেন্ট ট্রানজেকশন আইডি (TrxID) প্রদান করুন");
        toast.error("পেমেন্ট ট্রানজেকশন আইডি (TrxID) প্রদান করুন");
        return;
      }
    }

    if (paymentOption === "money_receipt") {
      if (receiptVerifyStatus !== "valid" && remainingOption !== "skip_receipt") {
        setErrorMsg("মানি রিসিট নম্বর সঠিক নয় বা যাচাই করা হয়নি");
        toast.error("মানি রিসিট নম্বর সঠিক নয় বা যাচাই করা হয়নি");
        return;
      }
      if (isPartialReceipt && remainingOption === "pay_now") {
        if (!remainingSenderNumber.trim()) {
          setErrorMsg("বাকি টাকার প্রেরক নম্বর বা অ্যাকাউন্ট লিখুন");
          toast.error("বাকি টাকার প্রেরক নম্বর বা অ্যাকাউন্ট লিখুন");
          return;
        }
        if (!remainingTrxId.trim()) {
          setErrorMsg("বাকি টাকার ট্রানজেকশন আইডি (TrxID) প্রদান করুন");
          toast.error("বাকি টাকার ট্রানজেকশন আইডি (TrxID) প্রদান করুন");
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const orderItems = [];
      for (const entry of Object.values(cart)) {
        const sName = getSessionDisplayNameById(entry.item.sessionId, entry.item.sessionName);
        const sLabel = sName ? ` (${sName})` : "";
        const itemFullName = `${entry.item.name}${sLabel}`;
        
        orderItems.push({
          productId: entry.item.dbProductId || undefined,
          name: itemFullName,
          className: entry.item.className || undefined,
          classId: entry.item.classId || undefined,
          itemCode: entry.item.itemCode || undefined,
          quantity: entry.qty,
          unitPrice: Number(entry.item.pricePerSet) || 0,
          weight: Number(entry.item.weightKg) || 0.25,
        });
      }

      const ilhakNote = ilhak.trim() ? ` (ইলহাক: ${ilhak.trim()})` : "";
      const deliveryNote = hasSeparateDelivery && deliveryAddress.fullAddress ? ` | ডেলিভারি ঠিকানা: ${deliveryAddress.fullAddress}` : "";
      const questionOrderDetails = Object.values(cart)
        .map((c) => {
          const sName = getSessionDisplayNameById(c.item.sessionId, c.item.sessionName);
          const sLabel = sName ? ` (${sName})` : "";
          const codeTag = c.item.itemCode ? ` {${c.item.itemCode}}` : "";
          return `[${c.item.name}${sLabel}${codeTag}: ${c.qty} সেট]`;
        })
        .join(", ");

      const zimadarNote = isZimadar
        ? ` | [কেন্দ্র জিম্মাদার: ${zimadarName.trim() || ownerName.trim()} (ফোন: ${zimadarPhone.trim() || contactNo.trim()}) | মাদরাসা তালিকা (${validMadrasasCount}টি): ${zimadarMadrasasList.map((m) => m.trim()).filter(Boolean).join(", ")}${isCommissionQualified ? ` | কমিশন: ৳${commissionDiscount} (${zimadarConfig.percent}%)` : ""}]`
        : "";

      const courierNote = selectedDeliveryOption?.requiresName && courierOrTransportName.trim()
        ? ` | [${selectedDeliveryOption.name}: ${courierOrTransportName.trim()}]`
        : ` | [ডেলিভারি মাধ্যম: ${selectedDeliveryOption?.name || selectedDeliveryType}]`;

      const fullNotes = `[প্রশ্নের অর্ডার]: ${questionOrderDetails} | ${effectiveAddress}${deliveryNote}${ilhakNote}${zimadarNote}${courierNote}`;

      const effectiveSenderNumber = paymentOption === "pay_now" ? senderNumber.trim() : (isPartialReceipt && remainingOption === "pay_now" ? remainingSenderNumber.trim() : undefined);
      const effectiveTrxId = paymentOption === "pay_now" ? trxId.trim() : (isPartialReceipt && remainingOption === "pay_now" ? remainingTrxId.trim() : undefined);
      const effectiveMethodName = selectedMethod?.name || selectedMethod?.provider || "Direct Payment";

      const res = await fetch("/api/store/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: ownerName.trim(),
          customerPhone: contactNo.trim(),
          instituteId: instituteName.trim(),
          items: orderItems,
          notes: fullNotes,
          paymentOption: paymentOption === "money_receipt" && remainingOption !== "skip_receipt" ? "money_receipt" : "pay_now",
          paymentProvider: effectiveMethodName,
          paymentMethod: effectiveMethodName,
          senderNumber: effectiveSenderNumber,
          trxId: effectiveTrxId,
          receiptNumber: paymentOption === "money_receipt" && remainingOption !== "skip_receipt" ? receiptNumber.trim() : undefined,
          discount: isCommissionQualified ? commissionDiscount : 0,
          deliveryOptionType: selectedDeliveryType,
          courierOrTransportName: courierOrTransportName.trim() || undefined,
          deliveryCharge: deliveryCharge,
          totalAmount: finalPayableAmount,
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "অর্ডার সম্পন্ন করতে সমস্যা হয়েছে");

      setOrderSuccessData(data);
      setCart({});
      setIsCheckoutOpen(false);
      setPaymentStep(false);
      toast.success("প্রশ্নের অর্ডার সফলভাবে গ্রহণ করা হয়েছে!");
    } catch (err: any) {
      toast.error(err.message || "অর্ডার সম্পন্ন করতে সমস্যা হয়েছে");
    } finally {
      setIsSubmitting(false);
    }
  };

  const printInvoice = async (order = orderSuccessData) => {
    if (!order) return;
    await printOrderInvoice(order, { mode: "customer" });
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-4 sm:py-6 pb-28 sm:pb-16 font-sans">
      <div className="max-w-[1540px] mx-auto px-3.5 sm:px-6 md:px-8">

        {/* ─── BACK BUTTON + SYNC STATUS ────────────────────────────── */}
        <div className="mb-2.5 sm:mb-3 flex items-center justify-between gap-2">
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

          {/* Realtime sync indicator */}
          <div className="flex items-center gap-2">
            {lastSynced && !isLoading && (
              <span className="hidden sm:inline text-[10px] text-slate-400 font-medium">
                সর্বশেষ আপডেট:{" "}
                {lastSynced.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
            <button
              type="button"
              title="ডেটা রিফ্রেশ করুন"
              onClick={() => fetchData(false)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-3.5 h-3.5 transition-transform ${isLoading ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">{isLoading ? "লোড হচ্ছে..." : "রিফ্রেশ"}</span>
            </button>
          </div>
        </div>

        {/* ─── 2. FILTER CONTROL BAR ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xs mb-3 space-y-2.5">

          {/* ROW 1 — SESSION DROPDOWN + SEARCH + VIEW TOGGLE */}
          <div className="flex items-center gap-2">
            {/* SESSION DROPDOWN */}
            {examSessions.length > 0 && (
              <select
                value={String(selectedSessionId)}
                onChange={(e) => {
                  setSelectedSessionId(e.target.value);
                  setSelectedTerm("all");
                  setSelectedClassId("all");
                }}
                className="shrink-0 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-emerald-600 focus:bg-white transition-colors cursor-pointer max-w-[150px] sm:max-w-[200px]"
              >
                {examSessions.length > 1 && <option value="all">সকল সেশন</option>}
                {examSessions.map((session) => {
                  const exactName = (session.title || session.sessionYear || "").trim();
                  return (
                    <option key={String(session._id)} value={String(session._id)}>
                      {exactName}
                    </option>
                  );
                })}
              </select>
            )}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="প্রশ্ন বা বিষয় খুঁজুন (যেমন: কুরআন, বাংলা...)"
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

          {/* ROW 2 — EXAM TABS */}

          {/* EXAM STATUS PILLS WITH LIVE COUNTDOWN BADGES */}
          {examTerms.length > 0 && (
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <button
                type="button"
                onClick={() => {
                  setSelectedTerm("all");
                  setSelectedClassId("all");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                  selectedTerm === "all"
                    ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                সকল পরীক্ষা
              </button>
              {examTerms.map((term) => {
                const isSelected = selectedTerm === term;
                return (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSelectedTerm(term);
                      setSelectedClassId("all");
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-[#095738] text-white border-[#095738] shadow-xs"
                        : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span>{term}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* CLASS NAME AS TABS (WITH GENEROUS MOBILE PADDING & SMOOTH AUTO-CENTERING) */}
          {availableClasses.length > 0 && (
            <div className="pt-2.5 border-t border-slate-100">
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <button
                  onClick={(e) => {
                    setSelectedClassId("all");
                    e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                  }}
                  className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 active:scale-95 border ${
                    selectedClassId === "all"
                      ? "bg-amber-400 text-slate-950 border-amber-500 font-black shadow-xs ring-2 ring-amber-400/40"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  সকল শ্রেণি
                </button>
                {availableClasses.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={(e) => {
                      setSelectedClassId(cls.id);
                      e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                    }}
                    className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 active:scale-95 border ${
                      selectedClassId === cls.id
                        ? "bg-amber-400 text-slate-950 border-amber-500 font-black shadow-xs ring-2 ring-amber-400/40"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    {cls.name}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ─── 4. DEFAULT CLEAN TABLE OR CARD VIEW ──────────────────────────── */}
        {isLoading ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs my-4 space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs sm:text-sm text-slate-500 font-semibold">প্রশ্নপত্র লোড হচ্ছে...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white p-10 sm:p-14 text-center rounded-2xl border border-slate-200 shadow-xs my-4 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-[#095738]">
              <FileQuestion className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">কোনো প্রশ্নপত্র পাওয়া যায়নি</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              {allQuestionItems.length === 0
                ? "অ্যাডমিন প্যানেল থেকে এই শিক্ষাবর্ষে এখনও কোনো প্রশ্নপত্র যুক্ত করা হয়নি। অ্যাডমিন কর্তৃক প্রশ্নপত্র যুক্ত করা হলে তা এখানে প্রদর্শিত হবে।"
                : "নির্বাচিত ফিল্টারের সাথে মিলে এমন কোনো প্রশ্নপত্র পাওয়া যায়নি। অনুগ্রহ করে উপরের ফিল্টার পরিবর্তন করুন।"}
            </p>
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
                              <h4 className="text-xs sm:text-sm flex items-center gap-1.5">
                                <span className="text-[#095738] font-black">{item.className}</span>
                                <span className="text-slate-300 font-normal">—</span>
                                <span className="text-slate-900 font-black">{item.examTerm.includes("পরীক্ষা") ? item.examTerm : `${item.examTerm} পরীক্ষা`}</span>
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
                      {(() => {
                        const sName = getSessionDisplayNameById(item.sessionId, item.sessionName);
                        return sName ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {sName}
                          </span>
                        ) : null;
                      })()}
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
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {(() => {
                            const sName = getSessionDisplayNameById(item.sessionId, item.sessionName);
                            return sName ? (
                              <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.2 rounded font-bold">
                                {sName}
                              </span>
                            ) : null;
                          })()}
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
                      setPaymentStep(false);
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
                    setPaymentStep(false);
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
                  {(() => {
                    const sName = getSessionDisplayNameById(selectedDetailItem.sessionId, selectedDetailItem.sessionName);
                    return sName ? (
                      <span className="text-[11px] px-2.5 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {sName}
                      </span>
                    ) : null;
                  })()}
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
            {/* Modal Header */}
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-[#095738] text-white">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <FileQuestion className="w-4 h-4 text-amber-300" />
                <span>
                  {paymentStep ? "প্রশ্নের অর্ডার ফরম (ধাপ ২/২: পেমেন্ট পদ্ধতি)" : "প্রশ্নের অর্ডার ফরম (ধাপ ১/২: ঠিকানা ও তথ্য)"}
                </span>
              </h3>
              <button onClick={() => setIsCheckoutOpen(false)} className="p-1 text-white/80 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              {!paymentStep ? (
                <>
                  {/* Step 1: Customer & Address Information */}
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
                          if (searchStatus !== "idle") {
                            setSearchStatus("idle");
                            setAutoFilledFields({});
                          }
                        }}
                        placeholder="যেমন: 1234 বা 01XXXXXXXXX"
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 font-semibold focus:outline-emerald-600 bg-slate-50"
                      />
                      <button
                        type="button"
                        onClick={searchIlhak}
                        disabled={searchStatus === "loading" || !ilhak.trim()}
                        className="px-3 py-1.5 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 disabled:opacity-50 cursor-pointer"
                      >
                        {searchStatus === "loading" ? "খুঁজছি..." : "খুঁজুন"}
                      </button>
                    </div>
                    {searchStatus === "found" && (
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[10.5px] text-emerald-600 font-bold">✓ মাদরাসার তথ্য পাওয়া গেছে!</p>
                        <button
                          type="button"
                          onClick={() => setAutoFilledFields({})}
                          className="text-[10px] text-slate-500 hover:text-emerald-700 underline font-semibold cursor-pointer"
                          title="ম্যানুয়ালি এডিট করতে ক্লিক করুন"
                        >
                          তথ্য পরিবর্তন বা আনলক করুন
                        </button>
                      </div>
                    )}
                    {searchStatus === "not_found" && <p className="text-[10.5px] text-amber-600 mt-0.5 font-medium">⚠ পাওয়া যায়নি। ম্যানুয়ালি লিখুন।</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block font-bold text-slate-700">
                          মাদরাসা বা প্রতিষ্ঠানের নাম <span className="text-red-500 font-bold">*</span>
                        </label>
                        {autoFilledFields.instituteName && (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            নিবন্ধিত (লক)
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        value={instituteName}
                        onChange={(e) => setInstituteName(e.target.value)}
                        readOnly={!!autoFilledFields.instituteName}
                        disabled={!!autoFilledFields.instituteName}
                        placeholder="যেমন: মুহাম্মাদনগর নূরানী ক্যাডেট মাদরাসা"
                        className={`w-full px-3 py-1.5 border rounded-lg font-semibold transition-all ${
                          autoFilledFields.instituteName
                            ? "bg-slate-100/90 text-slate-700 border-slate-200 cursor-not-allowed select-none"
                            : "border-slate-200 bg-white focus:outline-emerald-600"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block font-bold text-slate-700">
                          মুহতামিম / আবেদনকারীর নাম <span className="text-red-500 font-bold">*</span>
                        </label>
                        {autoFilledFields.ownerName && (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            নিবন্ধিত (লক)
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        readOnly={!!autoFilledFields.ownerName}
                        disabled={!!autoFilledFields.ownerName}
                        placeholder="যেমন: মাওলানা মো: আবদুল্লাহ"
                        className={`w-full px-3 py-1.5 border rounded-lg font-semibold transition-all ${
                          autoFilledFields.ownerName
                            ? "bg-slate-100/90 text-slate-700 border-slate-200 cursor-not-allowed select-none"
                            : "border-slate-200 bg-white focus:outline-emerald-600"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block font-bold text-slate-700">
                          মোবাইল নম্বর <span className="text-red-500 font-bold">*</span>
                        </label>
                        {autoFilledFields.contactNo && (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            নিবন্ধিত (লক)
                          </span>
                        )}
                      </div>
                      <input
                        type="tel"
                        required
                        value={contactNo}
                        onChange={(e) => {
                          const val = e.target.value;
                          setContactNo(val);
                          const clean = val.replace(/\D/g, "");
                          if (clean.length === 11 && clean.startsWith("01")) {
                            lookupMadrasaInfo(clean, true);
                          }
                        }}
                        onBlur={() => {
                          const clean = contactNo.replace(/\D/g, "");
                          if (clean.length === 11 && clean.startsWith("01")) {
                            lookupMadrasaInfo(clean, true);
                          }
                        }}
                        readOnly={!!autoFilledFields.contactNo}
                        disabled={!!autoFilledFields.contactNo}
                        placeholder="01XXXXXXXXX"
                        className={`w-full px-3 py-1.5 border rounded-lg font-semibold transition-all ${
                          autoFilledFields.contactNo
                            ? "bg-slate-100/90 text-slate-700 border-slate-200 cursor-not-allowed select-none"
                            : "border-slate-200 bg-white focus:outline-emerald-600"
                        }`}
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

                  {/* ─── KENDRO ZIMADAR SECTION ────────────────────────────── */}
                  <div className="pt-3 border-t border-slate-200 space-y-2.5">
                    <label className="flex items-start gap-2.5 p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl cursor-pointer hover:bg-emerald-100/60 transition-colors">
                      <input
                        type="checkbox"
                        checked={isZimadar}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setIsZimadar(checked);
                          if (checked) {
                            if (!zimadarName) setZimadarName(ownerName);
                            if (!zimadarPhone) setZimadarPhone(contactNo);
                            if (zimadarMadrasasList.length === 0 || (zimadarMadrasasList.length === 1 && !zimadarMadrasasList[0])) {
                              setZimadarMadrasasList([instituteName || ""]);
                            }
                          }
                        }}
                        className="mt-0.5 w-4 h-4 text-emerald-700 rounded focus:ring-emerald-600 cursor-pointer"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm block">
                          আমি কেন্দ্র জিম্মাদার (একাধিক মাদরাসার প্রশ্ন একসাথে অর্ডার করছি)
                        </span>
                        <span className="text-[11px] text-emerald-800">
                          কমপক্ষে {zimadarConfig.minMadrasas}টি মাদরাসা এবং ৳{zimadarConfig.minOrderAmount.toLocaleString()}-এর বেশি অর্ডারে {zimadarConfig.percent}% বিশেষ কমিশন সুবিধা
                        </span>
                      </div>
                    </label>

                    {isZimadar && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">কেন্দ্র জিম্মাদারের নাম</label>
                            <input
                              type="text"
                              value={zimadarName}
                              onChange={(e) => setZimadarName(e.target.value)}
                              placeholder={ownerName || "জিম্মাদারের নাম"}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white focus:outline-emerald-600"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">জিম্মাদারের মোবাইল নম্বর</label>
                            <input
                              type="tel"
                              value={zimadarPhone}
                              onChange={(e) => setZimadarPhone(e.target.value)}
                              placeholder={contactNo || "01XXXXXXXXX"}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white focus:outline-emerald-600"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-[11px] font-bold text-slate-700">
                              অন্তর্ভুক্ত মাদরাসার তালিকা ({validMadrasasCount}টি মাদরাসা এন্ট্রি)
                            </label>
                            <button
                              type="button"
                              onClick={addZimadarMadrasa}
                              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-100 hover:bg-emerald-200/80 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              <span>মাদরাসা যোগ করুন</span>
                            </button>
                          </div>

                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {zimadarMadrasasList.map((mName, idx) => (
                              <div key={idx} className="flex items-center gap-1.5">
                                <span className="text-[11px] font-bold text-slate-400 w-5 text-center">{idx + 1}.</span>
                                <input
                                  type="text"
                                  value={mName}
                                  onChange={(e) => updateZimadarMadrasa(idx, e.target.value)}
                                  placeholder={`মাদরাসা ${idx + 1}-এর নাম লিখুন`}
                                  className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white focus:outline-emerald-600"
                                />
                                {zimadarMadrasasList.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeZimadarMadrasa(idx)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                                    title="মুছুন"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Commission status badge */}
                        {isCommissionQualified ? (
                          <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-900 text-xs font-bold flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                              <span>🎉 {zimadarConfig.percent}% কেন্দ্র জিম্মাদার কমিশন প্রযোজ্য!</span>
                            </div>
                            <span className="bg-emerald-800 text-white text-[11px] px-2 py-0.5 rounded-md font-black">
                              -৳{commissionDiscount}
                            </span>
                          </div>
                        ) : (
                          <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] font-medium leading-relaxed">
                            ℹ️ <strong>কমিশন শর্ত:</strong> কমপক্ষে {zimadarConfig.minMadrasas}টি মাদরাসার নাম (বর্তমান: {validMadrasasCount}টি) এবং সর্বমোট বিল ৳{zimadarConfig.minOrderAmount.toLocaleString()}-এর বেশি (বর্তমান: ৳{totalAmount.toLocaleString()}) হলে স্বয়ংক্রিয়ভাবে {zimadarConfig.percent}% কমিশন ছাড় পাবেন।
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Delivery Options Selector */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                    <label className="block text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#095738]" />
                      <span>ডেলিভারি মাধ্যম নির্বাচন করুন <span className="text-red-500">*</span></span>
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      {(deliveryOptions.length > 0 ? deliveryOptions.filter(d => d.isActive !== false) : [
                        { type: "pathao", name: "পাঠাও কুরিয়ার", charge: 0, requiresName: false },
                        { type: "steadfast", name: "স্টিডফাস্ট কুরিয়ার", charge: 0, requiresName: false },
                        { type: "other_courier", name: "অন্যান্য কুরিয়ার", charge: 200, requiresName: true },
                        { type: "transport", name: "পরিবহন / ট্রান্সপোর্ট", charge: 100, requiresName: true },
                      ]).map((d: any) => {
                        const isSelected = selectedDeliveryType === d.type;
                        return (
                          <button
                            key={d.type}
                            type="button"
                            onClick={() => setSelectedDeliveryType(d.type)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? "border-[#095738] bg-emerald-50/70 shadow-xs ring-1 ring-[#095738]"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className={`text-xs font-bold ${isSelected ? "text-[#095738]" : "text-slate-800"}`}>
                                {d.name}
                              </span>
                              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                isSelected ? "border-[#095738] bg-[#095738]" : "border-slate-300"
                              }`}>
                                {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                              </span>
                            </div>
                            <span className={`text-[11px] font-semibold ${Number(d.charge) === 0 ? "text-emerald-700" : "text-amber-700"}`}>
                              {Number(d.charge) === 0 ? "ফ্রি (৳০)" : `চার্জ: +৳${d.charge}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {selectedDeliveryOption?.requiresName && (
                      <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5 animate-in fade-in">
                        <label className="block text-xs font-bold text-amber-950">
                          {selectedDeliveryOption.name}-এর নাম লিখুন <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={courierOrTransportName}
                          onChange={(e) => setCourierOrTransportName(e.target.value)}
                          placeholder="যেমন: সুন্দরবন কুরিয়ার / এসএ পরিবহন / দিগন্ত পরিবহন"
                          className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold focus:outline-emerald-700 placeholder:text-slate-400"
                        />
                        <p className="text-[10px] text-amber-800">
                          📌 আপনার সুবিধাজনক কুরিয়ার সার্ভিস বা বাসের নাম উল্লেখ করুন যাতে আমরা সঠিক মাধ্যমে পার্সেল পাঠাতে পারি।
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Order Bill Summary */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600">
                      <span>মোট নির্বাচিত প্রশ্ন:</span>
                      <span className="font-bold text-slate-800">{totalItemCount} সেট</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600">
                      <span>প্রশ্নপত্রের মূল বিল:</span>
                      <span className="font-bold text-slate-800">৳{totalAmount.toFixed(2)}</span>
                    </div>
                    {isCommissionQualified && (
                      <div className="flex items-center justify-between text-xs sm:text-sm text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                        <span>কেন্দ্র জিম্মাদার কমিশন ({zimadarConfig.percent}%):</span>
                        <span>-৳{commissionDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600">
                      <span>ডেলিভারি চার্জ ({selectedDeliveryOption.name}):</span>
                      <span className={`font-bold ${deliveryCharge === 0 ? "text-emerald-700" : "text-slate-800"}`}>
                        {deliveryCharge === 0 ? "ফ্রি (৳০)" : `+৳${deliveryCharge.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-slate-700 text-sm sm:text-base">সর্বমোট প্রদেয় বিল:</span>
                      <span className="text-xl sm:text-2xl font-black text-[#095738]">৳{finalPayableAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                      <span className="shrink-0 text-sm">⚠️</span>
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCheckoutOpen(false)}
                      className="w-1/2 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all border border-slate-200 cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="button"
                      onClick={validateAndProceedToPayment}
                      className="w-1/2 py-2.5 bg-[#095738] hover:bg-[#07472d] text-white rounded-xl font-bold transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>পেমেন্ট অপশন</span>
                      <ChevronRight className="w-4 h-4 text-amber-300" />
                    </button>
                  </div>
                </>
              ) : (
                /* Step 2: Payment Options */
                <div className="animate-in slide-in-from-right-4 space-y-4">
                  <div className="text-center">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">পেমেন্ট মাধ্যম ও বিবরণ</h3>
                    <p className="text-[11px] text-slate-500">সঠিক তথ্য দিয়ে দ্রুত অর্ডার নিশ্চিত করুন</p>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                      <span className="shrink-0 text-sm">⚠️</span>
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Option 1: Pay Now */}
                    <label className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all ${paymentOption === "pay_now" ? "border-[#095738] bg-emerald-50/50 ring-1 ring-[#095738]" : "border-slate-200 hover:border-[#095738]/50"}`}>
                      <input
                        type="radio"
                        name="payment_opt"
                        checked={paymentOption === "pay_now"}
                        onChange={() => setPaymentOption("pay_now")}
                        className="w-4.5 h-4.5 text-[#095738] focus:ring-[#095738]"
                      />
                      <span className="font-bold text-slate-800 text-sm">সরাসরি পেমেন্ট (Pay Now)</span>
                    </label>

                    {paymentOption === "pay_now" && (
                      <div className="pl-4 sm:pl-6 pr-1 pb-2 animate-in fade-in space-y-3">
                        {/* Payment Type Tabs: Mobile Banking vs Bank */}
                        <div className="flex border border-slate-200 rounded-xl p-1 bg-slate-50 gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPaymentTab("mobile");
                              if (mobileMethods.length > 0) setSelectedMethodId(mobileMethods[0].id || mobileMethods[0].provider);
                            }}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              selectedPaymentTab === "mobile"
                                ? "bg-white text-[#095738] shadow-xs border border-slate-200"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>মোবাইল ব্যাংকিং ({mobileMethods.length})</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPaymentTab("bank");
                              if (bankMethods.length > 0) setSelectedMethodId(bankMethods[0].id || bankMethods[0].provider);
                            }}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              selectedPaymentTab === "bank"
                                ? "bg-white text-[#095738] shadow-xs border border-slate-200"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            <Building2 className="w-3.5 h-3.5" />
                            <span>ব্যাংক অ্যাকাউন্ট ({bankMethods.length})</span>
                          </button>
                        </div>

                        {/* Method Selection Buttons */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {(selectedPaymentTab === "mobile" ? mobileMethods : bankMethods).map((m: any) => {
                            const isCur = selectedMethod && ((m.id && selectedMethod.id === m.id) || selectedMethod.provider === m.provider);
                            return (
                              <button
                                key={m.id || m.provider}
                                type="button"
                                onClick={() => setSelectedMethodId(m.id || m.provider)}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all cursor-pointer ${
                                  isCur ? "border-[#095738] bg-emerald-50 shadow-xs" : "border-slate-100 hover:border-slate-300 bg-white"
                                }`}
                              >
                                <div className="h-8 flex items-center justify-center mb-1">
                                  {m.logo ? (
                                    <img src={m.logo} alt={m.name || m.provider} className="max-h-full max-w-full object-contain" />
                                  ) : (
                                    <Building2 className={`w-6 h-6 ${isCur ? "text-[#095738]" : "text-slate-500"}`} />
                                  )}
                                </div>
                                <span className={`text-[11px] font-bold truncate max-w-full ${isCur ? "text-[#095738]" : "text-slate-700"}`}>
                                  {m.name || m.provider}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Selected Method Details Card */}
                        {selectedMethod && (
                          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-blue-950">{selectedMethod.name || selectedMethod.provider}</span>
                                  {selectedMethod.accountType && (
                                    <span className="text-[10px] bg-blue-200/70 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                                      {selectedMethod.accountType}
                                    </span>
                                  )}
                                </div>
                                {selectedMethod.branch && (
                                  <p className="text-[11px] text-blue-800 mt-0.5 font-medium">
                                    শাখা: {selectedMethod.branch} {selectedMethod.routingNo ? `| রাউটিং: ${selectedMethod.routingNo}` : ""}
                                  </p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyText(selectedMethod.number || selectedMethod.accountNumber)}
                                className="flex items-center gap-1 bg-white border border-blue-300 text-blue-700 hover:bg-blue-100 px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 cursor-pointer transition-colors shadow-2xs"
                                title="নম্বর কপি করুন"
                              >
                                {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copied ? "কপি হয়েছে" : "কপি করুন"}</span>
                              </button>
                            </div>

                            <div className="bg-white p-2.5 rounded-lg border border-blue-100 flex items-center justify-between">
                              <span className="text-xs text-slate-500 font-medium">হিসাব / মোবাইল নম্বর:</span>
                              <span className="text-sm font-black text-blue-950 font-mono tracking-wider select-all">
                                {selectedMethod.number || selectedMethod.accountNumber || "—"}
                              </span>
                            </div>

                            {selectedMethod.qrCodeImage && (
                              <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-blue-100">
                                <img
                                  src={selectedMethod.qrCodeImage}
                                  alt="QR Code"
                                  className="w-16 h-16 object-contain rounded border border-slate-200 bg-white"
                                />
                                <div>
                                  <span className="text-xs font-bold text-slate-800 block flex items-center gap-1">
                                    <QrCode className="w-3.5 h-3.5 text-blue-600" />
                                    <span>QR কোড স্ক্যান করে পেমেন্ট করুন</span>
                                  </span>
                                  <span className="text-[10px] text-slate-500">
                                    অ্যাপ দিয়ে সরাসরি স্ক্যান করে দ্রুত পেমেন্ট সম্পন্ন করতে পারেন।
                                  </span>
                                </div>
                              </div>
                            )}

                            {selectedMethod.instructions && (
                              <p className="text-[11px] text-blue-900 bg-blue-100/60 p-2 rounded-lg leading-relaxed font-medium">
                                💡 {selectedMethod.instructions}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Sender Number & TrxID Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              প্রেরক নম্বর / A/C <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={senderNumber}
                              onChange={(e) => setSenderNumber(e.target.value)}
                              placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন"
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#095738] text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              ট্রানজেকশন আইডি (TrxID) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={trxId}
                              onChange={(e) => setTrxId(e.target.value)}
                              placeholder="TrxID লিখুন (যেমন: 9J4K2L8M1)"
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#095738] text-xs font-semibold"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Option 2: Money Receipt */}
                    <label className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all ${paymentOption === "money_receipt" ? "border-[#095738] bg-emerald-50/50 ring-1 ring-[#095738]" : "border-slate-200 hover:border-[#095738]/50"}`}>
                      <input
                        type="radio"
                        name="payment_opt"
                        checked={paymentOption === "money_receipt"}
                        onChange={() => setPaymentOption("money_receipt")}
                        className="w-4.5 h-4.5 text-[#095738] focus:ring-[#095738]"
                      />
                      <span className="font-bold text-slate-800 text-sm">মানি রিসিট আছে</span>
                    </label>

                    {paymentOption === "money_receipt" && (
                      <div className="pl-4 sm:pl-6 pr-1 pb-2 animate-in fade-in space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            মানি রিসিট নম্বর <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={receiptNumber}
                              onChange={(e) => {
                                setReceiptNumber(e.target.value);
                                if (receiptVerifyStatus !== "idle") {
                                  setReceiptVerifyStatus("idle");
                                  setReceiptVerifyMsg("");
                                  setReceiptBalance(0);
                                }
                              }}
                              placeholder="Receipt Number"
                              className={`flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:border-[#095738] text-xs font-semibold transition-all ${
                                receiptVerifyStatus === "valid" ? "border-emerald-400 bg-emerald-50" : receiptVerifyStatus === "invalid" ? "border-red-400 bg-red-50" : "border-slate-200"
                              }`}
                            />
                            <button
                              type="button"
                              onClick={verifyReceipt}
                              disabled={receiptVerifyStatus === "verifying" || !receiptNumber.trim()}
                              className="px-3 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 text-xs shrink-0 cursor-pointer"
                            >
                              {receiptVerifyStatus === "verifying" ? "যাচাই..." : "যাচাই করুন"}
                            </button>
                          </div>
                          {receiptVerifyMsg && (
                            <p className={`text-xs mt-1.5 font-bold ${receiptVerifyStatus === "valid" ? "text-emerald-700" : "text-red-500"}`}>
                              {receiptVerifyMsg}
                            </p>
                          )}
                        </div>

                        {/* Partial Balance Panel */}
                        {receiptVerifyStatus === "valid" && receiptBalance < finalPayableAmount && (
                          <div className="border border-amber-200 rounded-xl overflow-hidden">
                            <div className="bg-amber-50 p-3 space-y-1.5">
                              <p className="text-xs font-bold text-amber-800">ব্যালান্স বিবরণ:</p>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-600">মোট বিল:</span>
                                <span className="font-bold text-slate-800">৳{finalPayableAmount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-emerald-700">রিসিট ব্যালান্স:</span>
                                <span className="font-bold text-emerald-700">-৳{receiptBalance.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-xs border-t border-amber-200 pt-1.5">
                                <span className="text-red-600 font-bold">বাকি পরিশোধ করতে হবে:</span>
                                <span className="font-black text-red-600">৳{(finalPayableAmount - receiptBalance).toFixed(2)}</span>
                              </div>
                            </div>

                            <div className="bg-white p-3 space-y-2">
                              <p className="text-xs font-bold text-slate-700 mb-2">বাকি টাকা এখনই পরিশোধ করুন:</p>

                              <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-xs ${remainingOption === "pay_now" ? "border-[#095738] bg-emerald-50" : "border-slate-200"}`}>
                                <input type="radio" checked={remainingOption === "pay_now"} onChange={() => setRemainingOption("pay_now")} className="w-4 h-4 text-[#095738]" />
                                <span className="font-bold">এখনই বাকি পেমেন্ট করব</span>
                              </label>

                              {remainingOption === "pay_now" && (
                                <div className="pl-4 space-y-2.5 animate-in fade-in">
                                  {selectedMethod && (
                                    <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                                      <div>
                                        <p className="text-[11px] text-blue-700 font-medium">
                                          বাকি ৳{(finalPayableAmount - receiptBalance).toFixed(2)} পাঠান:
                                        </p>
                                        <p className="text-xs font-black text-blue-900 font-mono">
                                          {selectedMethod.number || selectedMethod.accountNumber} ({selectedMethod.name || selectedMethod.provider})
                                        </p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyText(selectedMethod.number || selectedMethod.accountNumber, true)}
                                        className="bg-white border border-blue-200 text-blue-600 rounded-lg p-1.5 hover:bg-blue-100 cursor-pointer"
                                      >
                                        {remainingCopied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                      </button>
                                    </div>
                                  )}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <input
                                      type="text"
                                      value={remainingSenderNumber}
                                      onChange={(e) => setRemainingSenderNumber(e.target.value)}
                                      placeholder="প্রেরক নম্বর / অ্যাকাউন্ট *"
                                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#095738] text-xs font-semibold"
                                    />
                                    <input
                                      type="text"
                                      value={remainingTrxId}
                                      onChange={(e) => setRemainingTrxId(e.target.value)}
                                      placeholder="বাকি টাকার TrxID *"
                                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#095738] text-xs font-semibold"
                                    />
                                  </div>
                                </div>
                              )}

                              <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-xs ${remainingOption === "skip_receipt" ? "border-amber-400 bg-amber-50" : "border-slate-200"}`}>
                                <input type="radio" checked={remainingOption === "skip_receipt"} onChange={() => setRemainingOption("skip_receipt")} className="w-4 h-4 text-amber-500" />
                                <span className="font-bold text-amber-800">রিসিট অপর্যাপ্ত — এখন ব্যবহার করব না</span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Summary & Submit Buttons in Step 2 */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 block">সর্বমোট প্রদেয় বিল</span>
                      <span className="text-base font-black text-emerald-900">৳{finalPayableAmount.toFixed(2)}</span>
                      {isCommissionQualified && (
                        <span className="text-[10px] text-emerald-700 font-bold block">
                          (কমিশন ছাড়: -৳{commissionDiscount})
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentStep(false)}
                        className="px-4 py-2 font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors"
                      >
                        ফিরে যান
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSubmitOrder()}
                        disabled={isSubmitting}
                        className="px-5 py-2 font-bold text-white bg-[#095738] hover:bg-[#07472d] rounded-xl shadow-md active:scale-95 cursor-pointer disabled:opacity-50 transition-all flex items-center gap-1.5"
                      >
                        {isSubmitting ? "অর্ডার নেওয়া হচ্ছে..." : "অর্ডার নিশ্চিত করুন"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── SUCCESS INVOICE MODAL ─────────────────────────────────── */}
      {orderSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-3 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 text-center border border-slate-200 animate-scale-in">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-2.5">
              <CheckCircle className="w-6 h-6 text-emerald-700" />
            </div>
            <h3 className="text-base font-bold text-slate-800">প্রশ্নের অর্ডার সম্পন্ন হয়েছে!</h3>
            <p className="text-xs text-slate-500 mb-1">
              ইনভয়েস: <strong className="text-emerald-800 font-bold">{orderSuccessData.invoiceId}</strong>
            </p>
            <p className="text-[11px] text-slate-400 mb-3">
              গ্রাহক ইনভয়েসে বাকির কোনো অপশন নেই, সরাসরি পিডিএফ হিসেবে সেভ বা প্রিন্ট করা যাবে।
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => downloadOrderPdf(orderSuccessData, { mode: "customer" })}
                className="w-full py-2.5 bg-[#095738] hover:bg-[#07472d] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" />
                <span>সরাসরি PDF ডাউনলোড</span>
              </button>
              <button
                type="button"
                onClick={() => printInvoice(orderSuccessData)}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>ব্রাউজার প্রিন্ট</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderSuccessData(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-colors"
              >
                ঠিক আছে
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
