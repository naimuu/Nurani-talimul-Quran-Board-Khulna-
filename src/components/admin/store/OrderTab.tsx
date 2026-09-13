"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, FileText, CheckCircle, Trash2, Edit, X, Package, Truck, 
  Clock, CheckCircle2, AlertCircle, Copy, Printer, ArrowRight, 
  RefreshCw, Send, ChevronRight, Eye, ShieldCheck, UserCheck, Phone, Plus,
  User, Calendar, ThumbsUp, BookOpen, Layers, ClipboardList
} from 'lucide-react';
import { toBanglaDigits } from './BanglaDatePicker';
import { formatBanglaDateTime, TimelineEvent, cleanAddressNotes } from '@/lib/orderTimeline';
import { printOrderInvoice } from '@/lib/orderPrint';

const toEnglishDigits = (str: string) => {
  const bnToEn: Record<string, string> = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
  return String(str || '').replace(/[০-৯]/g, match => bnToEn[match]);
};

const cleanNumberInput = (str: string) => {
  const en = toEnglishDigits(str).trim();
  if (!en) return '';
  // If user starts typing e.g. "05" or "00", strip leading zeros unless it's "0." or "0"
  if (en.length > 1 && en.startsWith('0') && en[1] !== '.') {
    return en.replace(/^0+/, '') || '0';
  }
  return en;
};

export type OrderCategory = 'all' | 'stationary' | 'question';

export function isQuestionOrder(sale: Sale | any): boolean {
  if (!sale) return false;
  if (sale.orderType === 'QUESTION' || sale.orderType === 'EXAM_QUESTION') return true;
  
  const notes = String(sale.notes || '');
  if (
    notes.includes('[প্রশ্নের অর্ডার]') ||
    notes.includes('প্রশ্নপত্র') ||
    notes.includes('প্রশ্ন অর্ডার') ||
    notes.includes('প্রশ্নপত্র সেট')
  ) {
    return true;
  }

  if (Array.isArray(sale.items) && sale.items.length > 0) {
    const hasQuestion = sale.items.some((item: any) => {
      const pName = String(item.product?.name || item.name || '').toLowerCase();
      const pCat = String(item.product?.category || item.category || '').toLowerCase();
      return (
        pName.includes('প্রশ্ন') ||
        pName.includes('প্রশ্নপত্র') ||
        pCat.includes('question') ||
        pCat.includes('প্রশ্ন')
      );
    });
    if (hasQuestion) return true;
  }

  return false;
}

export type OrderStep = 'pending' | 'confirmed' | 'packaging' | 'shipped' | 'delivered' | 'cancelled';

export function getOrderStep(status: string): OrderStep {
  const s = (status || '').trim().toLowerCase();
  if (s === 'pending order') return 'pending';
  if (s === 'rejected' || s === 'cancelled') return 'cancelled';
  if (s === 'packaging') return 'packaging';
  if (s === 'shipped' || s === 'courier' || s === 'in courier') return 'shipped';
  if (s === 'delivered' || s === 'completed') return 'delivered';
  if (s === 'confirmed' || s === 'accepted') return 'confirmed';
  // Fallbacks for counter sales
  if (s === 'paid' || s === 'partial' || s === 'pending') return 'confirmed';
  return 'pending';
}

export function parseTrackingInfo(notes?: string | null, courierName?: string | null) {
  let trackingId = '';
  if (notes) {
    const match = notes.match(/\[(?:Tracking|ট্র্যাকিং|Consignment):\s*([^\]]+)\]/i);
    if (match) trackingId = match[1].trim();
  }
  return {
    trackingId,
    courier: courierName || 'পাঠাও কুরিয়ার'
  };
}

export const ORDER_STEP_CONFIG: Record<OrderStep, {
  label: string;
  shortLabel: string;
  badgeClass: string;
  pillClass: string;
  icon: React.ElementType;
}> = {
  pending: {
    label: 'নতুন / অপেক্ষমাণ',
    shortLabel: 'অপেক্ষমাণ',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    pillClass: 'border-amber-500 text-amber-600 bg-amber-50',
    icon: Clock,
  },
  confirmed: {
    label: 'অনুমোদিত ও নিশ্চিত',
    shortLabel: 'অনুমোদিত',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    pillClass: 'border-blue-500 text-blue-600 bg-blue-50',
    icon: CheckCircle,
  },
  packaging: {
    label: 'প্যাকেজিং চলছে / প্রস্তুত',
    shortLabel: 'প্যাকেজিং',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    pillClass: 'border-purple-500 text-purple-600 bg-purple-50',
    icon: Package,
  },
  shipped: {
    label: 'কুরিয়ারে হস্তান্তরকৃত',
    shortLabel: 'কুরিয়ারে',
    badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    pillClass: 'border-cyan-500 text-cyan-600 bg-cyan-50',
    icon: Truck,
  },
  delivered: {
    label: 'ডেলিভারি সম্পন্ন',
    shortLabel: 'ডেলিভার্ড',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    pillClass: 'border-emerald-500 text-emerald-600 bg-emerald-50',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'বাতিলকৃত অর্ডার',
    shortLabel: 'বাতিল',
    badgeClass: 'bg-red-100 text-red-800 border-red-200',
    pillClass: 'border-red-500 text-red-600 bg-red-50',
    icon: Trash2,
  },
};

type SaleItem = { 
  id: string; 
  productId: string; 
  quantity: number; 
  unitPrice: number; 
  product: { id: string, name: string, className?: string | null, stock: number, price: number } 
};

type Sale = {
  id: string; 
  invoiceId: string; 
  customerName: string; 
  customerPhone?: string | null; 
  instituteId?: string | null; 
  totalAmount: number;
  paidAmount: number; 
  status: string; 
  createdAt: string; 
  updatedAt?: string;
  items: SaleItem[];
  previousDue?: number; 
  previousDueList?: any[]; 
  discount?: number;
  deliveryCharge?: number; 
  courierName?: string; 
  totalWeight?: number; 
  notes?: string;
  timeline?: TimelineEvent[];
  confirmedByCustomer?: boolean;
  receivedAt?: string;
  receivedBy?: string;
  deliveredAt?: string;
  deliveredBy?: string;
};

export default function OrderTab({
  initialCategory = 'all',
  onCategoryChange,
}: {
  initialCategory?: OrderCategory;
  onCategoryChange?: (cat: OrderCategory) => void;
}) {
  const [orders, setOrders] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentTab, setCurrentTab] = useState<'all' | OrderStep>('pending');
  const [orderCategory, setOrderCategory] = useState<OrderCategory>(initialCategory);

  useEffect(() => {
    if (initialCategory) {
      setOrderCategory(initialCategory);
    }
  }, [initialCategory]);

  const handleCategorySwitch = (cat: OrderCategory) => {
    setOrderCategory(cat);
    if (onCategoryChange) {
      onCategoryChange(cat);
    }
  };
  
  // Modals
  const [selectedOrder, setSelectedOrder] = useState<Sale | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedItems, setEditedItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [confirmMode, setConfirmMode] = useState<'none' | 'partial' | 'unpaid'>('none');
  const [partialPaidAmount, setPartialPaidAmount] = useState('');
  const [promiseDate, setPromiseDate] = useState('');
  const [orderDeliveryCharge, setOrderDeliveryCharge] = useState<string>('0');
  const [includeDeliveryCharge, setIncludeDeliveryCharge] = useState<boolean>(true);
  const [savedDeliveryCharge, setSavedDeliveryCharge] = useState<string>('0');
  const [orderDiscount, setOrderDiscount] = useState<string>('0');
  const [orderDiscountPercent, setOrderDiscountPercent] = useState<string>('0');
  const [orderPaidAmount, setOrderPaidAmount] = useState<string>('0');

  useEffect(() => {
    fetch('/api/store/products')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setAvailableProducts(data);
      })
      .catch(() => {});
  }, []);

  // Courier Handover Modal State
  const [courierModalOrder, setCourierModalOrder] = useState<Sale | null>(null);
  const [courierName, setCourierName] = useState('পাঠাও কুরিয়ার');
  const [courierTrackingId, setCourierTrackingId] = useState('');
  const [courierNote, setCourierNote] = useState('');
  const [isSubmittingCourier, setIsSubmittingCourier] = useState(false);

  // Mark Delivered Confirmation
  const [deliverConfirmOrder, setDeliverConfirmOrder] = useState<Sale | null>(null);
  const [isDelivering, setIsDelivering] = useState(false);

  // Reject Modal
  const [confirmRejectModal, setConfirmRejectModal] = useState<{ isOpen: boolean; orderId: string }>({ isOpen: false, orderId: '' });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/store/sales?t=${Date.now()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (e) {
      console.error("Failed to fetch store orders:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Category-wise total counts
  const categoryCounts = useMemo(() => {
    let stationary = 0;
    let question = 0;
    orders.forEach(o => {
      if (isQuestionOrder(o)) {
        question++;
      } else {
        stationary++;
      }
    });
    return {
      all: orders.length,
      stationary,
      question,
    };
  }, [orders]);

  // Orders filtered by category
  const categoryFilteredOrders = useMemo(() => {
    if (orderCategory === 'question') {
      return orders.filter(o => isQuestionOrder(o));
    }
    if (orderCategory === 'stationary') {
      return orders.filter(o => !isQuestionOrder(o));
    }
    return orders;
  }, [orders, orderCategory]);

  // Counts per step based on current category
  const counts = useMemo(() => {
    const c: Record<'all' | OrderStep, number> = {
      all: categoryFilteredOrders.length,
      pending: 0,
      confirmed: 0,
      packaging: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    categoryFilteredOrders.forEach(o => {
      const step = getOrderStep(o.status);
      if (c[step] !== undefined) {
        c[step]++;
      }
    });
    return c;
  }, [categoryFilteredOrders]);

  // Filtered orders (sorted by confirm/updated date and time descending)
  const filtered = useMemo(() => {
    return categoryFilteredOrders
      .filter(o => {
        const step = getOrderStep(o.status);
        if (currentTab !== 'all' && step !== currentTab) return false;
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          o.invoiceId.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          (o.customerPhone && o.customerPhone.includes(q)) ||
          (o.instituteId && o.instituteId.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
  }, [categoryFilteredOrders, currentTab, search]);

  // Advance to Packaging or Confirmed directly from Review
  const handleAccept = async (
    orderId: string, 
    paidAmount: number, 
    targetStatus: 'Packaging' | 'Confirmed', 
    paymentMethod: string, 
    promiseDateVal?: string
  ) => {
    const deliveryChargeVal = parseFloat(toEnglishDigits(orderDeliveryCharge)) || 0;
    const discountVal = parseFloat(toEnglishDigits(orderDiscount)) || 0;
    const itemsSubtotal = selectedOrder?.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0) || 0;
    const finalTotalAmount = Math.max(0, itemsSubtotal - discountVal) + deliveryChargeVal;

    await fetch(`/api/store/sales/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'acceptOrder',
        paidAmount,
        status: targetStatus,
        paymentMethod,
        promiseDate: promiseDateVal,
        deliveryCharge: deliveryChargeVal,
        discount: discountVal,
        totalAmount: finalTotalAmount,
      }),
    });
    fetchOrders();
  };

  // Quick Advance Status (e.g. Confirmed -> Packaging)
  const handleQuickStatusChange = async (orderId: string, newStatus: string) => {
    await fetch(`/api/store/sales/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateStatus',
        status: newStatus,
      }),
    });
    fetchOrders();
  };

  // Submit Courier Dispatch
  const handleCourierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courierModalOrder) return;
    setIsSubmittingCourier(true);

    try {
      const existingNotes = courierModalOrder.notes || '';
      let updatedNotes = existingNotes;
      if (courierTrackingId.trim()) {
        updatedNotes += `\n[Tracking: ${courierTrackingId.trim()}]`;
      }
      if (courierNote.trim()) {
        updatedNotes += `\n[কুরিয়ার নোট: ${courierNote.trim()}]`;
      }

      await fetch(`/api/store/sales/${courierModalOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateStatus',
          status: 'Shipped',
          courierName: courierName.trim() || 'পাঠাও কুরিয়ার',
          notes: updatedNotes,
        }),
      });

      setCourierModalOrder(null);
      setCourierTrackingId('');
      setCourierNote('');
      fetchOrders();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingCourier(false);
    }
  };

  // Confirm Delivery
  const handleMarkDelivered = async () => {
    if (!deliverConfirmOrder) return;
    setIsDelivering(true);
    try {
      await fetch(`/api/store/sales/${deliverConfirmOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateStatus',
          status: 'Delivered',
        }),
      });
      setDeliverConfirmOrder(null);
      fetchOrders();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDelivering(false);
    }
  };

  // Reject / Cancel
  const handleRejectClick = (orderId: string) => {
    setConfirmRejectModal({ isOpen: true, orderId });
  };

  const confirmReject = async () => {
    const orderId = confirmRejectModal.orderId;
    if (!orderId) return;
    await fetch(`/api/store/sales/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateStatus', status: 'Rejected' }),
    });
    setConfirmRejectModal({ isOpen: false, orderId: '' });
    fetchOrders();
  };

  // Update Items
  const handleUpdateItems = async () => {
    if (!selectedOrder) return;
    const deliveryChargeVal = parseFloat(toEnglishDigits(orderDeliveryCharge)) || 0;
    const discountVal = parseFloat(toEnglishDigits(orderDiscount)) || 0;
    const res = await fetch(`/api/store/sales/${selectedOrder.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateItems',
        items: editedItems,
        deliveryCharge: deliveryChargeVal,
        discount: discountVal,
      }),
    });
    const updatedOrder = await res.json();
    setEditMode(false);
    setShowAddProduct(false);
    setProductSearchQuery('');
    setSelectedOrder(updatedOrder);
    setOrderDeliveryCharge((updatedOrder.deliveryCharge ?? 0).toString());
    setOrderDiscount((updatedOrder.discount ?? 0).toString());
    fetchOrders();
  };

  const openOrderReviewModal = (order: Sale) => {
    setSelectedOrder(order);
    setEditedItems(order.items.map(i => ({ productId: i.productId, quantity: i.quantity })));
    const initDelivery = (order.deliveryCharge ?? 0).toString();
    setOrderDeliveryCharge(initDelivery);
    setSavedDeliveryCharge(parseFloat(initDelivery) > 0 ? initDelivery : '180');
    setIncludeDeliveryCharge(parseFloat(initDelivery) > 0);
    const disc = order.discount ?? 0;
    setOrderDiscount(disc.toString());
    const subtotal = order.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
    if (subtotal > 0 && disc > 0) {
      const pct = (disc / subtotal) * 100;
      setOrderDiscountPercent(Number(pct.toFixed(2)).toString());
    } else {
      setOrderDiscountPercent('0');
    }
    setOrderPaidAmount((order.paidAmount ?? 0).toString());
    setConfirmMode('none');
    setPartialPaidAmount('');
    setPromiseDate('');
    setEditMode(false);
    setShowAddProduct(false);
    setProductSearchQuery('');
  };

  const handleDiscountFixedChange = (valStr: string, subtotal: number) => {
    const cleaned = cleanNumberInput(valStr);
    setOrderDiscount(cleaned);
    const num = parseFloat(cleaned) || 0;
    if (subtotal > 0) {
      const pct = (num / subtotal) * 100;
      setOrderDiscountPercent(num > 0 ? Number(pct.toFixed(2)).toString() : '0');
    } else {
      setOrderDiscountPercent('0');
    }
  };

  const handleDiscountPercentChange = (pctStr: string, subtotal: number) => {
    const cleaned = cleanNumberInput(pctStr);
    setOrderDiscountPercent(cleaned);
    const pct = parseFloat(cleaned) || 0;
    const calcDisc = (subtotal * pct) / 100;
    setOrderDiscount(pct > 0 ? Number(calcDisc.toFixed(2)).toString() : '0');
  };

  const applyDiscountPreset = (pct: number, subtotal: number) => {
    setOrderDiscountPercent(pct.toString());
    const calcDisc = (subtotal * pct) / 100;
    setOrderDiscount(pct > 0 ? Number(calcDisc.toFixed(2)).toString() : '0');
  };

  const handleClearDueAsDiscount = (dueToClear: number, subtotal: number) => {
    if (dueToClear <= 0) return;
    const currentDisc = parseFloat(toEnglishDigits(orderDiscount)) || 0;
    const newDisc = currentDisc + dueToClear;
    setOrderDiscount(Number(newDisc.toFixed(2)).toString());
    if (subtotal > 0) {
      const pct = (newDisc / subtotal) * 100;
      setOrderDiscountPercent(Number(pct.toFixed(2)).toString());
    }
  };

  const openCourierModal = (order: Sale) => {
    setCourierModalOrder(order);
    setCourierName(order.courierName || 'পাঠাও কুরিয়ার');
    const parsed = parseTrackingInfo(order.notes, order.courierName);
    setCourierTrackingId(parsed.trackingId || '');
  };

  const scrollTabToCenter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  // Print Invoice
  const printInvoice = async (order: Sale) => {
    try {
      await printOrderInvoice(order);
    } catch (e) {
      console.error("Failed to print with printOrderInvoice:", e);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Header with Order Type Switcher & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-800 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-emerald-600" />
              <span>অর্ডার ও ডেলিভারি ব্যবস্থাপনা</span>
            </h3>
            <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
              {categoryFilteredOrders.length} টি
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {orderCategory === 'question' 
              ? 'পরীক্ষার প্রশ্নপত্র অর্ডারসমূহ পর্যালোচনা ও কুরিয়ার ট্র্যাকিং ধাপসমূহ।'
              : orderCategory === 'stationary'
              ? 'বই ও স্টেশনারি আইটেম অর্ডারসমূহ পর্যালোচনা ও কুরিয়ার ট্র্যাকিং।'
              : 'বই-স্টেশনারি ও পরীক্ষার প্রশ্নপত্রের অর্ডার তালিকা ও ডেলিভারি ব্যবস্থাপনা।'}
          </p>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ইনভয়েস বা নাম/মোবাইল..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary/30 focus:bg-white focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Step-wise Tabs Bar */}
      <div className="bg-white p-1 rounded-full border border-slate-200/80 shadow-xs overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex items-center gap-1 w-max sm:w-full">
          {[
            { id: 'all' as const, label: 'সকল', count: counts.all, icon: null, activeBg: 'bg-slate-900 text-white shadow-xs' },
            { id: 'pending' as const, label: 'নতুন', count: counts.pending, icon: Clock, activeBg: 'bg-amber-600 text-white shadow-xs' },
            { id: 'confirmed' as const, label: 'অনুমোদিত', count: counts.confirmed, icon: CheckCircle, activeBg: 'bg-blue-600 text-white shadow-xs' },
            { id: 'packaging' as const, label: 'প্যাকেজিং', count: counts.packaging, icon: Package, activeBg: 'bg-purple-600 text-white shadow-xs' },
            { id: 'shipped' as const, label: 'কুরিয়ার', count: counts.shipped, icon: Truck, activeBg: 'bg-cyan-700 text-white shadow-xs' },
            { id: 'delivered' as const, label: 'ডেলিভার্ড', count: counts.delivered, icon: CheckCircle2, activeBg: 'bg-emerald-600 text-white shadow-xs' },
            { id: 'cancelled' as const, label: 'বাতিল', count: counts.cancelled, icon: Trash2, activeBg: 'bg-red-600 text-white shadow-xs' },
          ].map((tab) => {
            const isActive = currentTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={(e) => { scrollTabToCenter(e); setCurrentTab(tab.id); }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? tab.activeBg
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold leading-none ${
                    isActive ? 'bg-white/30 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table (Desktop) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-auto max-h-[calc(100vh-310px)] min-h-[350px]">
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 shadow-2xs">
              <tr className="bg-slate-50/95 backdrop-blur-xs text-slate-600 text-xs uppercase tracking-wider font-bold">
                <th className="p-4">ইনভয়েস ও সময়</th>
                <th className="p-4">ক্রেতার তথ্য</th>
                <th className="p-4 text-center">আইটেম ও ধরণ</th>
                <th className="p-4">কুরিয়ার ও ট্র্যাকিং</th>
                <th className="p-4 text-right">বিল ও পেমেন্ট</th>
                <th className="p-4 text-center">বর্তমান ধাপ</th>
                <th className="p-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-2" />
                    <p className="font-medium text-xs">অর্ডার লোড হচ্ছে...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-600">এই ধাপে কোনো অর্ডার পাওয়া যায়নি</p>
                    <p className="text-xs text-slate-400 mt-0.5">অন্যান্য ট্যাব বা ফিল্টার চেক করুন।</p>
                  </td>
                </tr>
              ) : (
                filtered.map(order => {
                  const step = getOrderStep(order.status);
                  const config = ORDER_STEP_CONFIG[step];
                  const tracking = parseTrackingInfo(order.notes, order.courierName);
                  const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);
                  const isPaid = order.paidAmount >= order.totalAmount;
                  const isPartial = order.paidAmount > 0 && !isPaid;
                  const isQuestion = isQuestionOrder(order);

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Invoice & Date */}
                      <td className="p-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono font-black text-primary text-sm">{order.invoiceId}</span>
                          {isQuestion ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded-full">
                              <FileText className="w-2.5 h-2.5" />
                              <span>প্রশ্নপত্র</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded-full">
                              <Package className="w-2.5 h-2.5" />
                              <span>স্টেশনারি</span>
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-slate-800 mt-0.5">
                          {new Date(order.updatedAt || order.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                          <span>{new Date(order.updatedAt || order.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                          {order.updatedAt && Math.abs(new Date(order.updatedAt).getTime() - new Date(order.createdAt).getTime()) > 60000 && (
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-sans font-bold border border-emerald-200">কনফার্মড</span>
                          )}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="p-4">
                        <p className="font-bold text-slate-800 leading-snug">{order.customerName}</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{order.customerPhone || 'নাম্বার নেই'}</p>
                        {order.instituteId && (
                          <p className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded w-fit mt-1 line-clamp-1">
                            {order.instituteId}
                          </p>
                        )}
                      </td>

                      {/* Items */}
                      <td className="p-4 text-center">
                        <span className="inline-block bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg font-bold text-xs">
                          {totalItems} টি আইটেম
                        </span>
                      </td>

                      {/* Courier & Tracking */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{tracking.courier}</span>
                        </div>
                        {tracking.trackingId ? (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="bg-cyan-50 text-cyan-900 border border-cyan-200 px-2 py-0.5 rounded text-[11px] font-mono font-bold">
                              {tracking.trackingId}
                            </span>
                            <button
                              onClick={() => navigator.clipboard.writeText(tracking.trackingId)}
                              title="কপি করুন"
                              className="text-slate-400 hover:text-slate-600 p-0.5"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {step === 'pending' || step === 'confirmed' ? 'বুকিং অপেক্ষমাণ' : 'ট্র্যাকিং কোড নেই'}
                          </span>
                        )}
                      </td>

                      {/* Bill & Payment */}
                      <td className="p-4 text-right">
                        <div className="font-black text-slate-900 text-sm">
                          {order.totalAmount.toFixed(2)} ৳
                        </div>
                        <div className="mt-1 flex justify-end">
                          {isPaid ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                              পরিশোধিত
                            </span>
                          ) : isPartial ? (
                            <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
                              আংশিক: {order.paidAmount.toFixed(0)} ৳
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
                              ক্যাশ অন ডেলিভারি
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Current Step Badge & Details */}
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${config.badgeClass}`}>
                            <config.icon className="w-3.5 h-3.5" />
                            {config.shortLabel}
                          </span>
                          {step === 'delivered' && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 mt-0.5 ${
                              order.confirmedByCustomer 
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{order.confirmedByCustomer ? 'ক্রেতা নিজে রিসিভড' : 'অ্যাডমিন ডেলিভার্ড'}</span>
                            </span>
                          )}
                          {(() => {
                            const lastEvt = order.timeline && order.timeline.length > 0 
                              ? order.timeline[order.timeline.length - 1] 
                              : null;
                            if (lastEvt && lastEvt.actorName && step !== 'pending') {
                              return (
                                <span className="text-[10px] text-slate-500 font-medium">
                                  {lastEvt.actorRole === 'CUSTOMER' ? 'ক্রেতা:' : 'অ্যাডমিন:'} <strong className="text-slate-700">{lastEvt.actorName}</strong>
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </td>

                      {/* Contextual Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Step Specific Action */}
                          {step === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setEditedItems(order.items.map(i => ({ productId: i.productId, quantity: i.quantity })));
                                  setOrderDeliveryCharge((order.deliveryCharge ?? 0).toString());
                                  setOrderDiscount((order.discount ?? 0).toString());
                                  setConfirmMode('none');
                                  setPartialPaidAmount('');
                                  setPromiseDate('');
                                }}
                                className="px-3 py-1.5 bg-primary text-white rounded-xl text-xs font-extrabold hover:bg-primary/90 shadow-2xs transition-all active:scale-95"
                              >
                                রিভিউ ও অনুমোদন
                              </button>
                              <button
                                onClick={() => handleRejectClick(order.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="বাতিল করুন"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {step === 'confirmed' && (
                            <>
                              <button
                                onClick={() => handleQuickStatusChange(order.id, 'Packaging')}
                                className="px-3 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-extrabold hover:bg-purple-700 shadow-2xs transition-all flex items-center gap-1 active:scale-95"
                              >
                                <Package className="w-3.5 h-3.5" />
                                <span>প্যাকেজিং শুরু</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setEditedItems(order.items.map(i => ({ productId: i.productId, quantity: i.quantity })));
                                  setOrderDeliveryCharge((order.deliveryCharge ?? 0).toString());
                                  setOrderDiscount((order.discount ?? 0).toString());
                                  setConfirmMode('none');
                                }}
                                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="বিস্তারিত / এডিট"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {step === 'packaging' && (
                            <>
                              <button
                                onClick={() => {
                                  setCourierModalOrder(order);
                                  setCourierName(order.courierName || 'পাঠাও কুরিয়ার');
                                  const parsed = parseTrackingInfo(order.notes, order.courierName);
                                  setCourierTrackingId(parsed.trackingId || '');
                                }}
                                className="px-3 py-1.5 bg-cyan-700 text-white rounded-xl text-xs font-extrabold hover:bg-cyan-800 shadow-2xs transition-all flex items-center gap-1 active:scale-95"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>কুরিয়ারে পাঠান</span>
                              </button>
                              <button
                                onClick={() => printInvoice(order)}
                                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="চালান প্রিন্ট করুন"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {step === 'shipped' && (
                            <>
                              <button
                                onClick={() => setDeliverConfirmOrder(order)}
                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-extrabold hover:bg-emerald-700 shadow-2xs transition-all flex items-center gap-1 active:scale-95"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>ডেলিভার্ড</span>
                              </button>
                              <button
                                onClick={() => {
                                  setCourierModalOrder(order);
                                  setCourierName(order.courierName || 'পাঠাও কুরিয়ার');
                                  const parsed = parseTrackingInfo(order.notes, order.courierName);
                                  setCourierTrackingId(parsed.trackingId || '');
                                }}
                                className="p-1.5 text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors"
                                title="কুরিয়ার ট্র্যাকিং এডিট"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => printInvoice(order)}
                                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="চালান প্রিন্ট করুন"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {step === 'delivered' && (
                            <button
                              onClick={() => printInvoice(order)}
                              className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>চালান প্রিন্ট</span>
                            </button>
                          )}

                          {step === 'cancelled' && (
                            <button
                              onClick={() => handleQuickStatusChange(order.id, 'Pending Order')}
                              className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>সক্রিয় করুন</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Orders Cards List */}
      <div className="md:hidden flex flex-col gap-2.5">
        {loading ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="inline-block w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-2" />
            <p className="font-medium text-xs">অর্ডার লোড হচ্ছে...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-600">এই ধাপে কোনো অর্ডার পাওয়া যায়নি</p>
            <p className="text-xs text-slate-400 mt-0.5">অন্যান্য ট্যাব বা ফিল্টার চেক করুন।</p>
          </div>
        ) : (
          filtered.map(order => {
            const step = getOrderStep(order.status);
            const config = ORDER_STEP_CONFIG[step];
            const tracking = parseTrackingInfo(order.notes, order.courierName);
            const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);
            const isPaid = order.paidAmount >= order.totalAmount;
            const isPartial = order.paidAmount > 0 && !isPaid;
            const due = Math.max(0, order.totalAmount - order.paidAmount);

            return (
              <div
                key={order.id}
                onClick={() => openOrderReviewModal(order)}
                className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs hover:border-slate-300 transition-all active:bg-slate-50/70 cursor-pointer flex flex-col gap-2.5"
              >
                {/* Row 1: Invoice ID + Date + Step Badge */}
                <div className="flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono font-black text-primary text-sm">{order.invoiceId}</span>
                    {isQuestionOrder(order) ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded-full">
                        <FileText className="w-2.5 h-2.5" />
                        <span>প্রশ্নপত্র</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded-full">
                        <Package className="w-2.5 h-2.5" />
                        <span>স্টেশনারি</span>
                      </span>
                    )}
                    <span className="text-slate-300 text-[10px]">•</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {new Date(order.updatedAt || order.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}
                    </span>
                    {order.updatedAt && Math.abs(new Date(order.updatedAt).getTime() - new Date(order.createdAt).getTime()) > 60000 && (
                      <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-sans font-bold border border-emerald-200">
                        কনফার্মড
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border shrink-0 ${config.badgeClass}`}>
                      <config.icon className="w-3 h-3" />
                      <span>{config.shortLabel}</span>
                    </span>
                    {step === 'delivered' && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border flex items-center gap-1 ${
                        order.confirmedByCustomer 
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        <span>{order.confirmedByCustomer ? 'ক্রেতা রিসিভড' : 'অ্যাডমিন'}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Row 2: Customer Name, Phone & Direct Madrasa */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-slate-800 text-sm leading-snug">
                      {order.customerName}
                    </h4>
                    {order.customerPhone && (
                      <a
                        href={`tel:${order.customerPhone}`}
                        onClick={e => e.stopPropagation()}
                        className="text-[11px] font-mono text-slate-600 hover:text-primary flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/70 shrink-0"
                      >
                        <Phone className="w-2.5 h-2.5 text-slate-400" />
                        <span>{order.customerPhone}</span>
                      </a>
                    )}
                  </div>
                  {order.instituteId ? (
                    <p className="text-xs text-emerald-700 font-medium mt-0.5 line-clamp-1">
                      {order.instituteId}
                    </p>
                  ) : (
                    <span className="text-[10px] text-slate-400 mt-0.5 block">ব্যক্তিগত অর্ডার</span>
                  )}
                </div>

                {/* Row 3: Financial & Meta Info (Bill, Payment status, Items count, Weight) */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 flex-wrap gap-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-slate-900 text-sm">
                      {order.totalAmount.toFixed(2)} ৳
                    </span>
                    {isPaid ? (
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                        পরিশোধিত
                      </span>
                    ) : isPartial ? (
                      <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200">
                        আংশিক: {order.paidAmount.toFixed(0)} ৳
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                        ক্যাশ অন ডেলিভারি
                      </span>
                    )}
                    {due > 0 && !isPartial && (
                      <span className="text-red-600 font-bold text-[10px]">
                        (বকেয়া {due.toFixed(0)} ৳)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-[11px]">
                      {totalItems} টি আইটেম
                    </span>
                  </div>
                </div>

                {/* Courier / Tracking row if exists */}
                {(tracking.courier || tracking.trackingId) && (
                  <div className="flex items-center justify-between text-[11px] bg-slate-50/80 px-2.5 py-1 rounded-md border border-slate-100">
                    <div className="flex items-center gap-1 text-slate-600 font-medium truncate">
                      <Truck className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{tracking.courier}</span>
                    </div>
                    {tracking.trackingId ? (
                      <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                        <span className="font-mono font-bold text-cyan-900 bg-cyan-50 border border-cyan-200 px-1.5 py-0.2 rounded text-[10px]">
                          {tracking.trackingId}
                        </span>
                        <button
                          onClick={() => navigator.clipboard.writeText(tracking.trackingId)}
                          title="কপি করুন"
                          className="text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        {step === 'pending' || step === 'confirmed' ? 'বুকিং অপেক্ষমাণ' : 'ট্র্যাকিং নেই'}
                      </span>
                    )}
                  </div>
                )}

                {/* Row 4: Contextual Actions */}
                <div 
                  className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100 flex-wrap"
                  onClick={e => e.stopPropagation()}
                >
                  {step === 'pending' && (
                    <>
                      <button
                        onClick={() => openOrderReviewModal(order)}
                        className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 shadow-2xs transition-all active:scale-95 flex items-center gap-1"
                      >
                        <span>রিভিউ ও অনুমোদন</span>
                      </button>
                      <button
                        onClick={() => handleRejectClick(order.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                        title="বাতিল করুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {step === 'confirmed' && (
                    <>
                      <button
                        onClick={() => handleQuickStatusChange(order.id, 'Packaging')}
                        className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 shadow-2xs transition-all flex items-center gap-1 active:scale-95"
                      >
                        <Package className="w-3 h-3" />
                        <span>প্যাকেজিং শুরু</span>
                      </button>
                      <button
                        onClick={() => openOrderReviewModal(order)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                        title="বিস্তারিত / এডিট"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {step === 'packaging' && (
                    <>
                      <button
                        onClick={() => openCourierModal(order)}
                        className="px-3 py-1.5 bg-cyan-700 text-white rounded-lg text-xs font-bold hover:bg-cyan-800 shadow-2xs transition-all flex items-center gap-1 active:scale-95"
                      >
                        <Truck className="w-3 h-3" />
                        <span>কুরিয়ারে পাঠান</span>
                      </button>
                      <button
                        onClick={() => printInvoice(order)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                        title="চালান প্রিন্ট করুন"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {step === 'shipped' && (
                    <>
                      <button
                        onClick={() => setDeliverConfirmOrder(order)}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-2xs transition-all flex items-center gap-1 active:scale-95"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>ডেলিভার্ড</span>
                      </button>
                      <button
                        onClick={() => openCourierModal(order)}
                        className="p-1.5 text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors border border-cyan-200"
                        title="কুরিয়ার ট্র্যাকিং এডিট"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => printInvoice(order)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                        title="চালান প্রিন্ট করুন"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {step === 'delivered' && (
                    <button
                      onClick={() => printInvoice(order)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>চালান প্রিন্ট</span>
                    </button>
                  )}

                  {step === 'cancelled' && (
                    <button
                      onClick={() => handleQuickStatusChange(order.id, 'Pending Order')}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>সক্রিয় করুন</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review & Confirm Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-5 border-b border-slate-100 bg-slate-50/80">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-lg text-slate-800">অর্ডার পর্যালোচনা</h3>
                  <span className="font-mono font-bold bg-primary/10 text-primary text-xs px-2.5 py-0.5 rounded-full">
                    {selectedOrder.invoiceId}
                  </span>
                </div>
                <div className="mt-1.5 text-xs text-slate-600 flex flex-col gap-0.5">
                  <span className="font-bold text-slate-700">
                    {selectedOrder.customerName} {selectedOrder.customerPhone && `• ${selectedOrder.customerPhone}`}
                  </span>
                  {selectedOrder.notes && (
                    <span className="text-slate-600 bg-white/90 p-2.5 rounded-xl border border-slate-200/80 mt-1.5 leading-relaxed">
                      <strong>ঠিকানা / নোট:</strong> {cleanAddressNotes(selectedOrder.notes) || selectedOrder.notes}
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => { setSelectedOrder(null); setEditMode(false); }} 
                className="p-2 hover:bg-slate-200 rounded-full shrink-0 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 bg-slate-50/50">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-slate-800 text-sm">আইটেম তালিকা</h4>
                  {!editMode ? (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => { setEditMode(true); setShowAddProduct(true); }} 
                        className="text-emerald-700 hover:text-emerald-800 text-xs font-bold flex items-center gap-1 hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" /> পণ্য যোগ করুন
                      </button>
                      <span className="text-slate-300">|</span>
                      <button 
                        onClick={() => setEditMode(true)} 
                        className="text-primary text-xs font-bold flex items-center gap-1 hover:underline"
                      >
                        <Edit className="w-3.5 h-3.5" /> আইটেম পরিবর্তন
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => setShowAddProduct(prev => !prev)} 
                      className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> পণ্য যোগ করুন
                    </button>
                  )}
                </div>

                {/* Add Product Selector Box */}
                {editMode && showAddProduct && (
                  <div className="mb-3 p-3 bg-emerald-50/70 border border-emerald-200/90 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> অর্ডারে নতুন পণ্য যোগ করুন
                      </span>
                      <button 
                        type="button" 
                        onClick={() => { setShowAddProduct(false); setProductSearchQuery(''); }}
                        className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-emerald-100"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="নাম দিয়ে ফিল্টার..."
                        value={productSearchQuery}
                        onChange={(e) => setProductSearchQuery(e.target.value)}
                        className="sm:w-44 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                      />
                      <select
                        className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white font-medium outline-none focus:ring-1 focus:ring-emerald-500"
                        onChange={(e) => {
                          const prodId = e.target.value;
                          if (!prodId) return;
                          setEditedItems(prev => {
                            const existing = prev.find(i => i.productId === prodId);
                            if (existing) {
                              return prev.map(i => i.productId === prodId ? { ...i, quantity: i.quantity + 1 } : i);
                            }
                            return [...prev, { productId: prodId, quantity: 1 }];
                          });
                          setShowAddProduct(false);
                          setProductSearchQuery('');
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>পণ্য নির্বাচন করুন (ক্লিক করলে যোগ হবে)...</option>
                        {availableProducts
                          .filter(p => !productSearchQuery || p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) || (p.className && p.className.toLowerCase().includes(productSearchQuery.toLowerCase())))
                          .map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} {p.className ? `(${p.className})` : ''} — ৳{p.price} [মজুদ: {p.stock}]
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                )}
                
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 font-bold">
                      <th className="py-2">পণ্য</th>
                      <th className="py-2 text-center">মজুদ</th>
                      <th className="py-2 text-center">পরিমাণ</th>
                      <th className="py-2 text-right">মূল্য</th>
                      {editMode && <th className="py-2 text-right w-8"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(editMode ? editedItems : selectedOrder.items).map((item, idx) => {
                      const product = availableProducts.find(p => p.id === item.productId)
                        || selectedOrder.items.find(i => i.productId === item.productId)?.product;
                      if (!product) return null;
                      const unitPrice = ('unitPrice' in item && typeof (item as any).unitPrice === 'number') 
                        ? (item as any).unitPrice 
                        : (product.price || 0);
                      const lineTotal = unitPrice * item.quantity;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 font-medium text-slate-800">
                            <div>
                              <span className="font-bold">{product.name}</span>
                              {product.className && <span className="text-[11px] text-slate-500 ml-1">({product.className})</span>}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">দর: {unitPrice.toFixed(2)} ৳</div>
                          </td>
                          <td className="py-2.5 text-center text-xs text-slate-500 font-mono">{product.stock}</td>
                          <td className="py-2.5 text-center">
                            {editMode ? (
                              <input 
                                type="number" 
                                min={1}
                                value={item.quantity} 
                                onFocus={(e) => e.target.select()}
                                onClick={(e) => e.currentTarget.select()}
                                onChange={e => {
                                  const newQty = Math.max(1, parseInt(e.target.value) || 1);
                                  setEditedItems(prev => prev.map((it, i) => i === idx ? { ...it, quantity: newQty } : it));
                                }}
                                className="w-16 border border-slate-300 rounded-lg text-center py-1 font-bold text-sm outline-none focus:border-primary"
                              />
                            ) : (
                              <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{item.quantity} টি</span>
                            )}
                          </td>
                          <td className="py-2.5 text-right font-bold text-slate-800 font-mono">
                            {lineTotal.toFixed(2)} ৳
                          </td>
                          {editMode && (
                            <td className="py-2.5 text-right pl-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (editedItems.length <= 1) {
                                    alert('অর্ডারে অন্তত একটি পণ্য থাকতে হবে');
                                    return;
                                  }
                                  setEditedItems(prev => prev.filter((_, i) => i !== idx));
                                }}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {editMode && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-600">
                      নতুন সাবটোটাল: <span className="text-sm font-extrabold text-primary">
                        {editedItems.reduce((sum, it) => {
                          const p = availableProducts.find(prod => prod.id === it.productId)
                            || selectedOrder.items.find(i => i.productId === it.productId)?.product;
                          return sum + (p ? p.price * it.quantity : 0);
                        }, 0).toFixed(2)} ৳
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { 
                          setEditMode(false); 
                          setShowAddProduct(false);
                          setEditedItems(selectedOrder.items.map(i => ({ productId: i.productId, quantity: i.quantity }))); 
                        }} 
                        className="px-3 py-1.5 border border-slate-200 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-50"
                      >
                        বাতিল
                      </button>
                      <button 
                        onClick={handleUpdateItems} 
                        className="px-4 py-1.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 shadow-xs"
                      >
                        সেভ করুন
                      </button>
                    </div>
                  </div>
                )}

                {/* Full Width Calculation & Payment Area */}
                {!editMode && (() => {
                  const itemsSubtotal = selectedOrder.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
                  const deliveryChargeVal = parseFloat(toEnglishDigits(orderDeliveryCharge)) || 0;
                  const discountVal = parseFloat(toEnglishDigits(orderDiscount)) || 0;
                  const currentBill = Math.max(0, itemsSubtotal - discountVal) + deliveryChargeVal;
                  const previousDueVal = selectedOrder.previousDue || 0;
                  const totalPayable = currentBill + previousDueVal;
                  const paidVal = parseFloat(toEnglishDigits(orderPaidAmount)) || 0;
                  const remainingDue = Math.max(0, totalPayable - paidVal);

                  return (
                    <div className="mt-5 pt-4 border-t border-slate-200/90 w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        {/* Left Column: Delivery, Discount & Paid Controls */}
                        <div className="flex flex-col gap-3">
                          {/* 1. Courier Delivery Control */}
                          <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-2 shadow-2xs">
                            <label className="flex items-center gap-2 text-slate-700 font-bold text-xs cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={includeDeliveryCharge && deliveryChargeVal > 0}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setIncludeDeliveryCharge(checked);
                                  if (!checked) {
                                    setOrderDeliveryCharge('0');
                                  } else {
                                    const restoreVal = savedDeliveryCharge && parseFloat(savedDeliveryCharge) > 0 ? savedDeliveryCharge : '180';
                                    setOrderDeliveryCharge(restoreVal);
                                  }
                                }}
                                className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-600 cursor-pointer"
                              />
                              <span className="text-sm">🚚</span>
                              <span>কুরিয়ার চার্জ ({selectedOrder.courierName || 'পাঠাও কুরিয়ার'}):</span>
                            </label>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={orderDeliveryCharge}
                                onFocus={(e) => e.target.select()}
                                onClick={(e) => e.currentTarget.select()}
                                onChange={e => {
                                  const val = cleanNumberInput(e.target.value);
                                  setOrderDeliveryCharge(val);
                                  const num = parseFloat(val) || 0;
                                  if (num > 0) {
                                    setIncludeDeliveryCharge(true);
                                    setSavedDeliveryCharge(val);
                                  } else {
                                    setIncludeDeliveryCharge(false);
                                  }
                                }}
                                className="w-20 px-2 py-1 text-right font-bold text-xs border border-slate-300 rounded-lg bg-white font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
                              />
                              <span className="text-xs font-bold text-slate-600">৳</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setIncludeDeliveryCharge(false);
                                  setOrderDeliveryCharge('0');
                                }}
                                title="ফ্রি ডেলিভারি / চার্জ বাদ দিন"
                                className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-1 rounded-lg font-bold hover:bg-emerald-200 transition-colors"
                              >
                                ফ্রি
                              </button>
                            </div>
                          </div>

                          {/* 2. Discount Box (Fixed ৳ and Percentage %) */}
                          <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-200 space-y-2 shadow-2xs">
                            <div className="flex justify-between items-center">
                              <span className="text-emerald-950 font-bold text-xs flex items-center gap-1">
                                <span>🏷️ ছাড় (ডিসকাউন্ট):</span>
                              </span>
                              <div className="flex items-center gap-1">
                                {[0, 5, 10, 15, 20].map(pct => (
                                  <button
                                    key={pct}
                                    type="button"
                                    onClick={() => applyDiscountPreset(pct, itemsSubtotal)}
                                    className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-colors ${
                                      orderDiscountPercent === pct.toString()
                                        ? 'bg-emerald-700 text-white'
                                        : 'bg-emerald-100/70 hover:bg-emerald-200 text-emerald-800'
                                    }`}
                                  >
                                    {pct === 0 ? '০%' : `${pct}%`}
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-emerald-200">
                                <span className="text-[11px] font-bold text-slate-500 shrink-0">টাকা:</span>
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={orderDiscount}
                                  onFocus={(e) => e.target.select()}
                                  onClick={(e) => e.currentTarget.select()}
                                  onChange={e => handleDiscountFixedChange(e.target.value, itemsSubtotal)}
                                  placeholder="0.00"
                                  className="w-full text-right font-bold text-xs text-emerald-700 outline-none bg-transparent font-mono"
                                />
                                <span className="text-xs font-bold text-emerald-700">৳</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-emerald-200">
                                <span className="text-[11px] font-bold text-slate-500 shrink-0">শতকরা:</span>
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={orderDiscountPercent}
                                  onFocus={(e) => e.target.select()}
                                  onClick={(e) => e.currentTarget.select()}
                                  onChange={e => handleDiscountPercentChange(e.target.value, itemsSubtotal)}
                                  placeholder="0"
                                  className="w-full text-right font-bold text-xs text-emerald-700 outline-none bg-transparent font-mono"
                                />
                                <span className="text-xs font-bold text-emerald-700">%</span>
                              </div>
                            </div>
                          </div>

                          {/* 3. Paid Amount Input */}
                          <div className="bg-blue-50/60 p-3.5 rounded-2xl border border-blue-200 space-y-2 shadow-2xs">
                            <div className="flex justify-between items-center">
                              <span className="text-blue-950 font-bold text-xs flex items-center gap-1">
                                <span>💳 পরিশোধিত / পেইড (Paid Amount):</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setOrderPaidAmount(totalPayable.toFixed(2))}
                                className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-0.5 rounded-md font-bold transition-colors shadow-2xs"
                              >
                                সম্পূর্ণ পরিশোধ (Full)
                              </button>
                            </div>
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-blue-200">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={orderPaidAmount}
                                onFocus={(e) => e.target.select()}
                                onClick={(e) => e.currentTarget.select()}
                                onChange={e => setOrderPaidAmount(cleanNumberInput(e.target.value))}
                                placeholder="0.00"
                                className="w-full text-right font-black text-sm text-blue-900 outline-none bg-transparent font-mono"
                              />
                              <span className="text-xs font-bold text-blue-900">৳</span>
                            </div>
                          </div>
                        </div>

                        {/* Right Column: Live Calculated Bill Summary & Due Card */}
                        <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-2xs">
                          <div className="space-y-2 text-xs sm:text-sm">
                            <div className="flex justify-between items-center text-slate-600 font-bold">
                              <span>পণ্যের মোট মূল্য (সাবটোটাল):</span>
                              <span className="font-mono text-slate-800">{itemsSubtotal.toFixed(2)} ৳</span>
                            </div>

                            <div className="flex justify-between items-center text-slate-600 font-bold">
                              <span>কুরিয়ার চার্জ:</span>
                              <span className={`font-mono ${deliveryChargeVal > 0 ? 'text-slate-800' : 'text-emerald-700'}`}>
                                {deliveryChargeVal > 0 ? `+ ${deliveryChargeVal.toFixed(2)} ৳` : '০.০০ ৳ (ফ্রি)'}
                              </span>
                            </div>

                            {discountVal > 0 && (
                              <div className="flex justify-between items-center text-emerald-700 font-bold">
                                <span>ছাড় (ডিসকাউন্ট {orderDiscountPercent ? `· ${orderDiscountPercent}%` : ''}):</span>
                                <span className="font-mono">- {discountVal.toFixed(2)} ৳</span>
                              </div>
                            )}

                            <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-slate-700 font-bold">
                              <span>বর্তমান বিল:</span>
                              <span className="font-black text-slate-900 font-mono">{currentBill.toFixed(2)} ৳</span>
                            </div>

                            {previousDueVal > 0 && (
                              <div className="flex justify-between items-center text-amber-700 font-bold text-xs">
                                <span>পূর্বের বকেয়া:</span>
                                <span className="font-black font-mono">+ {previousDueVal.toFixed(2)} ৳</span>
                              </div>
                            )}

                            <div className="flex justify-between items-center pt-2 border-t-2 border-primary/20">
                              <span className="text-slate-900 font-extrabold text-sm">সর্বমোট প্রদেয়:</span>
                              <span className="font-black text-primary text-base font-mono">{totalPayable.toFixed(2)} ৳</span>
                            </div>

                            <div className="flex justify-between items-center text-blue-800 font-bold text-xs">
                              <span>পরিশোধের পরিমাণ:</span>
                              <span className="font-black font-mono">{paidVal.toFixed(2)} ৳</span>
                            </div>
                          </div>

                          {/* Real-time Due & Clear Due Action */}
                          <div className={`mt-3 p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                            remainingDue > 0 ? 'bg-amber-50 border-amber-300' : 'bg-emerald-50 border-emerald-300'
                          }`}>
                            <div>
                              <span className="block text-[11px] font-bold text-slate-600">অবশিষ্ট বকেয়া (Due):</span>
                              <span className={`font-black text-base font-mono ${remainingDue > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                                {remainingDue.toFixed(2)} ৳
                              </span>
                            </div>
                            {remainingDue > 0 ? (
                              <button
                                type="button"
                                onClick={() => handleClearDueAsDiscount(remainingDue, itemsSubtotal)}
                                title="বকেয়া সম্পূর্ণ মওকুফ করে ডিসকাউন্টে রূপান্তর করুন"
                                className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1"
                              >
                                <span>বকেয়া মওকুফ (ডিসকাউন্ট)</span>
                              </button>
                            ) : (
                              <span className="text-xs font-extrabold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                                বকেয়া মুক্ত ✓
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Order Timeline & Audit Trail */}
              {!editMode && selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs mb-4">
                  <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>অর্ডার টাইমলাইন ও হিস্ট্রি (Audit Trail)</span>
                  </h4>
                  <div className="flex flex-col gap-2">
                    {selectedOrder.timeline.map((evt, idx) => {
                      const isDeliv = evt.step === 'delivered';
                      const isShip = evt.step === 'shipped';
                      const isPkg = evt.step === 'packaging';
                      const isConf = evt.step === 'confirmed';

                      return (
                        <div 
                          key={idx} 
                          className={`p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs ${
                            isDeliv ? 'bg-emerald-50/70 border-emerald-200' :
                            isShip ? 'bg-cyan-50/60 border-cyan-200' :
                            isPkg ? 'bg-purple-50/60 border-purple-200' :
                            isConf ? 'bg-blue-50/60 border-blue-200' : 'bg-slate-50 border-slate-200/80'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-white border text-center font-bold text-[10px] leading-5 text-slate-700 shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="font-bold text-slate-800 leading-tight">{evt.title}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                <span className="font-semibold text-slate-700">{evt.actorRole === 'CUSTOMER' ? 'ক্রেতা:' : 'অ্যাডমিন:'} {evt.actorName}</span>
                                {evt.courierName ? ` • ${evt.courierName}` : ''}
                                {evt.trackingId ? ` (${evt.trackingId})` : ''}
                                {evt.notes ? ` • ${evt.notes}` : ''}
                              </p>
                            </div>
                          </div>
                          <span className="font-mono text-[10px] text-slate-500 shrink-0 self-end sm:self-center bg-white px-2 py-0.5 rounded border border-slate-200/70">
                            {formatBanglaDateTime(evt.timestamp)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Order Confirmation Step Actions */}
              {!editMode && (() => {
                const itemsSubtotal = selectedOrder.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
                const deliveryChargeVal = parseFloat(toEnglishDigits(orderDeliveryCharge)) || 0;
                const discountVal = parseFloat(toEnglishDigits(orderDiscount)) || 0;
                const currentBill = Math.max(0, itemsSubtotal - discountVal) + deliveryChargeVal;
                const totalPayable = currentBill + (selectedOrder.previousDue || 0);
                const paidVal = parseFloat(toEnglishDigits(orderPaidAmount)) || 0;

                return (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <h4 className="font-extrabold text-slate-800 text-sm mb-3">
                      ধাপ অনুযায়ী অর্ডার নিশ্চিত করুন
                    </h4>

                    {confirmMode === 'partial' ? (
                      <div className="flex flex-col gap-3 bg-blue-50/60 p-4 rounded-2xl border border-blue-200/80 mb-4">
                        <div>
                          <label className="block text-xs font-bold text-blue-900 mb-1">প্রদানকৃত পরিমাণ (৳)</label>
                          <input 
                            type="text" 
                            inputMode="decimal"
                            value={orderPaidAmount}
                            onChange={e => setOrderPaidAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full border border-blue-200 rounded-xl py-2 px-3 focus:ring-2 focus:ring-blue-400 outline-none bg-white text-sm font-bold font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-blue-900 mb-1">পরবর্তী পেমেন্টের তারিখ (Promise Date)</label>
                          <input 
                            type="date" 
                            value={promiseDate}
                            onChange={e => setPromiseDate(e.target.value)}
                            className="w-full border border-blue-200 rounded-xl py-2 px-3 focus:ring-2 focus:ring-blue-400 outline-none bg-white text-sm"
                          />
                        </div>
                        <div className="flex gap-2 justify-end mt-2">
                          <button 
                            onClick={() => setConfirmMode('none')} 
                            className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-300"
                          >
                            ফিরে যান
                          </button>
                          <button 
                            onClick={() => { 
                              handleAccept(selectedOrder.id, paidVal, 'Packaging', 'Cash', promiseDate);
                              setSelectedOrder(null); 
                              setConfirmMode('none'); 
                            }} 
                            className="px-4 py-2 bg-emerald-700 text-white font-bold text-xs rounded-xl hover:bg-emerald-800 flex items-center gap-1.5 shadow-xs"
                          >
                            <Package className="w-4 h-4" />
                            <span>আংশিক পেমেন্টসহ প্যাকেজিংয়ে পাঠান</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {/* Option A: Direct to Packaging */}
                          <button 
                            onClick={() => { 
                              handleAccept(selectedOrder.id, paidVal, 'Packaging', 'Cash', promiseDate); 
                              setSelectedOrder(null); 
                            }} 
                            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition-all active:scale-98 shadow-xs"
                          >
                            <Package className="w-4 h-4" />
                            <span>প্যাকেজিং এর জন্য পাঠান</span>
                          </button>

                          {/* Option B: Just Confirmed */}
                          <button 
                            onClick={() => { 
                              handleAccept(selectedOrder.id, paidVal, 'Confirmed', 'Cash', promiseDate); 
                              setSelectedOrder(null); 
                            }} 
                            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold rounded-xl text-sm transition-all active:scale-98"
                          >
                            <CheckCircle className="w-4 h-4 text-slate-500" />
                            <span>শুধু অনুমোদন (Confirmed)</span>
                          </button>
                        </div>

                        {/* Quick payment options */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <span className="text-slate-500 font-medium">
                            পেমেন্ট: <strong className="text-blue-900 font-mono">{paidVal.toFixed(2)} ৳</strong> 
                            {totalPayable - paidVal > 0 ? ` (বকেয়া: ${(totalPayable - paidVal).toFixed(2)} ৳)` : ' (পরিশোধিত)'}
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmMode('partial');
                              }}
                              className="px-3 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-lg font-semibold transition-colors"
                            >
                              পেমেন্ট তারিখ / বিস্তারিত
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Courier Handover Modal */}
      {courierModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-cyan-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-sm">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">কুরিয়ারে হস্তান্তর নিশ্চিত করুন</h3>
                  <p className="text-xs text-slate-500 font-mono">ইনভয়েস: {courierModalOrder.invoiceId}</p>
                </div>
              </div>
              <button
                onClick={() => setCourierModalOrder(null)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCourierSubmit} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  কুরিয়ার সার্ভিস
                </label>
                <select
                  value={courierName}
                  onChange={e => setCourierName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 outline-none"
                >
                  <option value="পাঠাও কুরিয়ার">পাঠাও কুরিয়ার (Pathao Courier)</option>
                  <option value="সুন্দরবন কুরিয়ার">সুন্দরবন কুরিয়ার সার্ভিস (Sundarban)</option>
                  <option value="এস.এ পরিবহন">এস.এ পরিবহন (SA Paribahan)</option>
                  <option value="করতোয়া কুরিয়ার">করতোয়া কুরিয়ার (Korotoa)</option>
                  <option value="রেডএক্স">রেডএক্স (REDX)</option>
                  <option value="অন্যান্য / লোকাল ডেলিভারি">অন্যান্য / সরাসরি ডেলিভারি</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ট্র্যাকিং / কনসাইনমেন্ট নম্বর (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: PT-2026-9812 বা CN-5541"
                  value={courierTrackingId}
                  onChange={e => setCourierTrackingId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm font-mono font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 outline-none placeholder:font-sans placeholder:font-normal"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  এই নম্বরটি দিয়ে গ্রাহক স্বয়ংক্রিয়ভাবে পার্সেল ট্র্যাক করতে পারবেন।
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  অতিরিক্ত নোট (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: খুলনা সদর ব্রাঞ্চ থেকে ডিসপ্যাচ"
                  value={courierNote}
                  onChange={e => setCourierNote(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 outline-none"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-600 flex flex-col gap-1">
                <div className="flex justify-between font-medium">
                  <span>প্রাপক:</span>
                  <strong className="text-slate-800">{courierModalOrder.customerName}</strong>
                </div>
                <div className="flex justify-between font-medium">
                  <span>ফোন:</span>
                  <span className="font-mono">{courierModalOrder.customerPhone || 'N/A'}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>মোট বিল:</span>
                  <strong className="text-primary">{courierModalOrder.totalAmount.toFixed(2)} ৳</strong>
                </div>
              </div>

              <div className="flex gap-2.5 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setCourierModalOrder(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCourier}
                  className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingCourier ? 'হস্তান্তর হচ্ছে...' : 'কুরিয়ারে হস্তান্তর নিশ্চিত করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark Delivered Confirmation Modal */}
      {deliverConfirmOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl border border-slate-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3.5 shadow-xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-800 mb-1">ডেলিভারি সম্পন্ন নিশ্চিতকরণ</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              আপনি কি নিশ্চিত যে ইনভয়েস <strong className="font-mono text-slate-800">{deliverConfirmOrder.invoiceId}</strong> সফলভাবে ক্রেতার নিকট পৌঁছে দেওয়া হয়েছে?
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setDeliverConfirmOrder(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                না, ফিরে যান
              </button>
              <button
                onClick={handleMarkDelivered}
                disabled={isDelivering}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-colors shadow-sm disabled:opacity-50"
              >
                {isDelivering ? 'আপডেট হচ্ছে...' : 'হ্যাঁ, ডেলিভার্ড'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {confirmRejectModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center border border-slate-200">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3.5 shadow-xs">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-800 mb-1">অর্ডার বাতিল নিশ্চিত করুন</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              আপনি কি নিশ্চিত যে আপনি এই অর্ডারটি বাতিল করতে চান? প্রয়োজনে পরবর্তীতে আবার সক্রিয় করা যাবে।
            </p>
            <div className="flex gap-2.5">
              <button 
                onClick={() => setConfirmRejectModal({ isOpen: false, orderId: '' })} 
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                না, ফিরে যান
              </button>
              <button 
                onClick={confirmReject} 
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-extrabold hover:bg-red-700 transition-colors shadow-sm"
              >
                হ্যাঁ, বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
