"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Search, Plus, Filter, Download, FileText, MoreVertical, CheckCircle, 
  Trash2, Share2, X, Scan, Edit, Camera, Calendar, Clock, User, 
  Building, ChevronDown, ChevronUp, AlertTriangle, ArrowUpDown, Layers, ArrowRight, SlidersHorizontal,
  Printer, AlertCircle
} from 'lucide-react';
import BanglaDatePicker, { toBanglaDigits } from './BanglaDatePicker';
import { generateQRCodeDataUrl, generateBarcodeSVG } from '@/lib/qrHelper';
import { calculateDeliveryCost } from '@/lib/deliveryCost';

function formatPromiseDate(dateStr?: string | null) {
  if (!dateStr) return null;
  const pDate = new Date(dateStr);
  const now = new Date();
  const pDateOnly = new Date(pDate.getFullYear(), pDate.getMonth(), pDate.getDate());
  const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((pDateOnly.getTime() - todayOnly.getTime()) / (1000 * 60 * 60 * 24));
  
  let label = '';
  let badgeClass = '';
  if (diffDays < 0) {
    label = `${Math.abs(diffDays)} দিন অতিক্রান্ত`;
    badgeClass = 'bg-red-100 text-red-800 border-red-200';
  } else if (diffDays === 0) {
    label = 'আজকে প্রদেয়!';
    badgeClass = 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold animate-pulse';
  } else if (diffDays === 1) {
    label = 'আগামীকাল';
    badgeClass = 'bg-purple-100 text-purple-800 border-purple-200 font-bold';
  } else {
    label = `${diffDays} দিন বাকি`;
    badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  return {
    formatted: pDate.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' }),
    diffDays,
    label,
    badgeClass,
  };
}

type SaleItem = { id: string; quantity: number; unitPrice: number; product: { name: string, className?: string | null } };
type Sale = {
  id: string; invoiceId: string; customerName: string; customerPhone?: string | null; instituteId?: string | null; totalAmount: number;
  paidAmount: number; status: string; createdAt: string; updatedAt?: string; items: SaleItem[];
  previousDue?: number; previousDueList?: any[]; discount?: number;
  currentDueList?: any[]; currentTotalDue?: number;
  payments?: { payer: string, method: string, amount: number, createdAt: string }[];
  deliveryCharge?: number; courierName?: string; totalWeight?: number;
  promiseDate?: string | null;
  notes?: string;
};

type Product = { id: string; name: string; price: number; stock: number; unit: string; barcode?: string | null; weight?: number | null };

const toEnglishDigits = (str: string) => {
  const bnToEn: Record<string, string> = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
  return str.replace(/[০-৯]/g, match => bnToEn[match]);
};

// Single product search bar for adding to cart
function ProductSearchBar({
  products,
  onAdd,
}: {
  products: Product[];
  onAdd: (product: Product) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [scanMode, setScanMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Barcode scan auto-add
  useEffect(() => {
    if (!query) return;
    const byBarcode = products.find(p => p.barcode && p.barcode === query.trim());
    if (byBarcode) { onAdd(byBarcode); setQuery(''); setOpen(false); setScanMode(false); }
  }, [query, products, onAdd]);

  const filtered = query
    ? products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.barcode && p.barcode.includes(query))
      )
    : products.slice(0, 8);

  return (
    <div className="relative" ref={wrapRef}>
      <div className="flex gap-1">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={scanMode ? '📷 বারকোড স্ক্যান করুন...' : 'পণ্য খুঁজুন বা স্ক্যান করুন...'}
            className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
              scanMode ? 'border-amber-400 focus:ring-amber-300 bg-amber-50' : 'border-slate-200 focus:ring-primary/50 bg-white'
            }`}
          />
        </div>
        <button type="button" onClick={() => { setScanMode(s => !s); setQuery(''); setTimeout(() => inputRef.current?.focus(), 50); }}
          className={`px-3 py-2 rounded-xl border flex items-center transition-colors ${
            scanMode ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-amber-50 hover:border-amber-300'
          }`}>
          <Scan className="w-4 h-4" />
        </button>
      </div>
      {open && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-400 text-center">কোনো পণ্য পাওয়া যায়নি</p>
          ) : filtered.map(p => (
            <button key={p.id} type="button"
              onMouseDown={() => { onAdd(p); setQuery(''); setOpen(false); setScanMode(false); }}
              className="w-full text-left px-4 py-2.5 hover:bg-green-50 flex items-center justify-between gap-2 transition-colors">
              <div>
                <p className="text-sm font-medium text-slate-800">{p.name}</p>
                {p.barcode && <p className="text-xs text-slate-400">{p.barcode}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-blue-600">{p.price} ৳</p>
                <p className="text-xs text-slate-400">মজুদ: {p.stock}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Cart item card
function CartItemCard({
  product,
  quantity,
  onQtyChange,
  onRemove,
}: {
  product: Product;
  quantity: number;
  onQtyChange: (q: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{product.name}</p>
        <p className="text-xs text-slate-500">{product.price} ৳ x {quantity} = <span className="font-bold text-blue-600">{(product.price * quantity).toFixed(2)} ৳</span></p>
      </div>
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={() => onQtyChange(Math.max(1, quantity - 1))}
          className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-sm">−</button>
        <input type="text" inputMode="numeric" value={quantity || ''}
          onChange={e => {
            const val = Math.max(1, parseInt(toEnglishDigits(e.target.value)) || 1);
            onQtyChange(val);
          }}
          onFocus={e => (e.target as HTMLInputElement).select()}
          className="w-10 text-center font-bold text-slate-800 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded" />
        <button type="button" onClick={() => onQtyChange(quantity + 1)}
          className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-sm">+</button>
      </div>
      <button type="button" onClick={onRemove} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function NewSaleModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [pastSales, setPastSales] = useState<Sale[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [instituteId, setInstituteId] = useState('');
  const [pastBuyers, setPastBuyers] = useState<string[]>([]);
  const [buyerOpen, setBuyerOpen] = useState(false);
  const buyerRef = useRef<HTMLDivElement>(null);
  // Invoice search
  const [invoiceQuery, setInvoiceQuery] = useState('');
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [discountType, setDiscountType] = useState<'amount' | 'percentage'>('amount');
  const [discountValue, setDiscountValue] = useState<string>('');
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [promiseDate, setPromiseDate] = useState<string>('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  useEffect(() => { fetch('/api/store/products').then(r => r.json()).then(setProducts); }, []);
  useEffect(() => {
    fetch('/api/store/sales').then(r => r.json()).then((data: Sale[]) => {
      if (Array.isArray(data)) {
        const names = Array.from(new Set(data.map(s => s.customerName).filter(Boolean)));
        setPastBuyers(names);
        setPastSales(data);
      }
    });
  }, []);
  
  // Close buyer dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (buyerRef.current && !buyerRef.current.contains(e.target as Node)) setBuyerOpen(false);
      if (invoiceRef.current && !invoiceRef.current.contains(e.target as Node)) setInvoiceOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const addProductToCart = useCallback((product: Product) => {
    setItems(prev => {
      const existing = prev.findIndex(i => i.productId === product.id);
      if (existing >= 0) {
        return prev.map((item, idx) => idx === existing ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId: product.id, quantity: 1 }];
    });
  }, []);
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateQty = useCallback((i: number, q: number) =>
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, quantity: q } : item)), []);

  const cartItemsForDelivery = useMemo(() => {
    return items.map(item => {
      const p = products.find(prod => prod.id === item.productId);
      return {
        product: { price: p?.price || 0, weight: p?.weight ?? 0.25 },
        quantity: item.quantity
      };
    });
  }, [items, products]);

  const autoDelivery = useMemo(() => calculateDeliveryCost(cartItemsForDelivery), [cartItemsForDelivery]);
  const [deliveryCharge, setDeliveryCharge] = useState<string>('0');
  const [courierName, setCourierName] = useState<string>('পাঠাও কুরিয়ার');
  const [isCustomDelivery, setIsCustomDelivery] = useState<boolean>(false);

  useEffect(() => {
    if (!isCustomDelivery) {
      setDeliveryCharge(autoDelivery.deliveryCharge.toString());
    }
  }, [autoDelivery.deliveryCharge, isCustomDelivery]);

  const subtotal = items.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  const parsedDelivery = parseFloat(toEnglishDigits(deliveryCharge)) || 0;
  const parsedDiscount = parseFloat(toEnglishDigits(discountValue)) || 0;
  const parsedPaid = parseFloat(toEnglishDigits(paidAmount)) || 0;
  const discountAmount = discountType === 'percentage' ? (subtotal * parsedDiscount) / 100 : parsedDiscount;
  const total = Math.max(0, subtotal - discountAmount) + parsedDelivery;
  const due = Math.max(0, total - parsedPaid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!customerName || items.length === 0) {
      setError('ক্রেতার নাম ও কমপক্ষে ১টি পণ্য যোগ করুন।'); return;
    }
    setLoading(true);
    const res = await fetch('/api/store/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName,
        customerPhone: customerPhone || null,
        instituteId: instituteId || null,
        items,
        discount: discountAmount,
        paidAmount: parsedPaid,
        promiseDate: promiseDate || null,
        paymentMethod,
        deliveryCharge: parsedDelivery,
        courierName: courierName || "পাঠাও কুরিয়ার",
        totalWeight: autoDelivery.totalWeightKg,
      }),
    });
    setLoading(false);
    if (res.ok) { onSaved(); onClose(); }
    else { const d = await res.json(); setError(d.error || 'সেভ করতে সমস্যা হয়েছে'); }
  };

  const [sidebarSearch, setSidebarSearch] = useState('');
  const [scanMode, setScanMode] = useState(false);
  const sidebarInputRef = useRef<HTMLInputElement>(null);

  // Barcode scan auto-add
  useEffect(() => {
    if (!sidebarSearch || !scanMode) return;
    const byBarcode = products.find(p => p.barcode && p.barcode === sidebarSearch.trim());
    if (byBarcode) { addProductToCart(byBarcode); setSidebarSearch(''); setScanMode(false); }
  }, [sidebarSearch, products, addProductToCart, scanMode]);

  const sidebarFiltered = sidebarSearch
    ? products.filter(p =>
        p.name.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
        (p.barcode && p.barcode.includes(sidebarSearch))
      )
    : products;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800">নতুন বিক্রয় তৈরি করুন</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 min-h-0 overflow-hidden">
          {/* ═══ LEFT SIDEBAR: Product Browser ═══ */}
          <div className="w-72 flex-shrink-0 border-r border-slate-100 flex flex-col bg-slate-50">
            <div className="p-4 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">পণ্য তালিকা</p>
              <div className="flex gap-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    ref={sidebarInputRef}
                    value={sidebarSearch}
                    onChange={e => setSidebarSearch(e.target.value)}
                    placeholder={scanMode ? '📷 স্ক্যান করুন...' : 'পণ্য খুঁজুন...'}
                    className={`w-full pl-9 pr-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      scanMode ? 'border-amber-400 focus:ring-amber-300 bg-amber-50' : 'border-slate-200 focus:ring-primary/50 bg-white'
                    }`}
                  />
                </div>
                <button type="button" onClick={() => { setScanMode(s => !s); setSidebarSearch(''); setTimeout(() => sidebarInputRef.current?.focus(), 50); }}
                  className={`px-3 py-2 rounded-xl border flex items-center transition-colors ${
                    scanMode ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                  }`}>
                  <Scan className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {sidebarFiltered.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">কোনো পণ্য পাওয়া যায়নি</p>
              )}
              {sidebarFiltered.map(p => {
                const inCart = items.find(i => i.productId === p.id);
                return (
                  <button key={p.id} type="button"
                    onClick={() => addProductToCart(p)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl mb-1 flex items-center justify-between gap-2 transition-colors border ${
                      inCart ? 'bg-green-50 border-green-200' : 'bg-white border-transparent hover:bg-white hover:border-slate-200'
                    }`}>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.price} ৳ · মজুদ: {p.stock}</p>
                    </div>
                    {inCart ? (
                      <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{inCart.quantity}</span>
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                        <Plus className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ═══ RIGHT MAIN AREA: Order / Cart ═══ */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">

              {/* Customer & Invoice row */}
              <div className="grid grid-cols-2 gap-3">
                <div ref={invoiceRef} className="relative">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> পুরনো ইনভয়েস</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <input value={invoiceQuery} onChange={e => { setInvoiceQuery(e.target.value); setInvoiceOpen(true); }} onFocus={() => setInvoiceOpen(true)}
                      placeholder="ইনভয়েস / নাম..."
                      className="w-full pl-8 pr-3 py-2 border border-dashed border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 text-sm" />
                  </div>
                  {invoiceOpen && invoiceQuery && (() => {
                    const filtered = pastSales.filter(s =>
                      s.invoiceId.toLowerCase().includes(invoiceQuery.toLowerCase()) ||
                      s.customerName.toLowerCase().includes(invoiceQuery.toLowerCase()) ||
                      (s.instituteId && s.instituteId.toLowerCase().includes(invoiceQuery.toLowerCase()))
                    ).slice(0, 6);
                    if (filtered.length === 0) return <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-3 text-sm text-slate-400 text-center">পাওয়া যায়নি</div>;
                    return (
                      <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                        {filtered.map(sale => (
                          <button key={sale.id} type="button"
                            onMouseDown={() => { setCustomerName(sale.customerName); setInstituteId(sale.instituteId || ''); setInvoiceQuery(sale.invoiceId); setInvoiceOpen(false); }}
                            className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center justify-between transition-colors">
                            <div>
                              <p className="text-sm font-bold text-blue-700">{sale.invoiceId}</p>
                              <p className="text-xs text-slate-500">{sale.customerName}</p>
                            </div>
                            <span className="text-xs text-slate-400">{new Date(sale.createdAt).toLocaleDateString('bn-BD')}</span>
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">ইলহাক / প্রতিষ্ঠান আইডি</label>
                  <input value={instituteId} onChange={e => setInstituteId(e.target.value)}
                    placeholder="ইলহাক নম্বর..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>

              {/* Buyer name and Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div ref={buyerRef} className="relative">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">ক্রেতার নাম *</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input value={customerName} onChange={e => { setCustomerName(e.target.value); setBuyerOpen(true); }} onFocus={() => setBuyerOpen(true)}
                      placeholder="ক্রেতার নাম লিখুন..." lang="en"
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                  </div>
                  {buyerOpen && (() => {
                    const filtered = pastBuyers.filter(b => !customerName || b.toLowerCase().includes(customerName.toLowerCase()));
                    if (filtered.length === 0) return null;
                    return (
                      <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-40 overflow-y-auto">
                        {filtered.map(buyer => (
                          <button key={buyer} type="button" onMouseDown={() => { setCustomerName(buyer); setBuyerOpen(false); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm text-slate-800 flex items-center gap-2 transition-colors">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">{buyer.charAt(0).toUpperCase()}</span>
                            {buyer}
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">মোবাইল নাম্বার</label>
                  <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} type="tel"
                    placeholder="017..." lang="en"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                </div>
              </div>



              {/* Cart items */}
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  অর্ডার তালিকা {items.length > 0 && <span className="ml-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">{items.length}</span>}
                </label>
                {items.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-100 rounded-xl py-10 text-center text-slate-400 text-sm">
                    <Plus className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    বাম পাশ থেকে পণ্য বেছে নিন
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {items.map((item, i) => {
                      const product = products.find(p => p.id === item.productId);
                      if (!product) return null;
                      return <CartItemCard key={item.productId} product={product} quantity={item.quantity} onQtyChange={q => updateQty(i, q)} onRemove={() => removeItem(i)} />;
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Fixed bottom: Ultra Compact 2-Row Footer */}
            <div className="border-t border-slate-100 p-3 bg-slate-50 flex-shrink-0 flex flex-col gap-3">
              
              {/* Row 0: Courier Delivery Charge & Info */}
              <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-slate-200 text-xs flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-1.5 shrink-0 text-slate-700 font-bold">
                  <span className="text-sm">🚚</span>
                  <span>কুরিয়ার ({courierName}):</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 font-bold rounded border border-amber-200">
                    {autoDelivery.totalWeightKg} কেজি
                  </span>
                  {autoDelivery.isFreeDelivery ? (
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-200">
                      ফ্রি নীতি (≥৫,০০০ ৳)
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">
                      (১৮০৳ + ২৫৳/কেজি)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-auto shrink-0">
                  <span className="text-[11px] font-bold text-slate-500">চার্জ:</span>
                  <div className="relative w-24">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={deliveryCharge}
                      onChange={e => {
                        setIsCustomDelivery(true);
                        setDeliveryCharge(e.target.value);
                      }}
                      className="w-full text-right font-bold text-xs px-2 py-1 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="0.00"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-500">৳</span>
                  {isCustomDelivery && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomDelivery(false);
                        setDeliveryCharge(autoDelivery.deliveryCharge.toString());
                      }}
                      className="text-[10px] text-blue-600 hover:underline px-1 py-0.5 ml-1"
                    >
                      অটো রিসেট
                    </button>
                  )}
                </div>
              </div>

              {/* Row 1: Discount, Due, Total */}
              <div className="flex items-center gap-3">
                {/* Discount */}
                <div className="flex-1 flex items-center bg-white rounded-lg shadow-sm border border-slate-200 p-1">
                  <div className="px-2 text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">ডিসকাউন্ট:</div>
                  <input type="text" inputMode="numeric" value={discountValue}
                    onChange={e => setDiscountValue(e.target.value)}
                    onFocus={e => (e.target as HTMLInputElement).select()}
                    placeholder="0"
                    className="flex-1 w-0 min-w-0 text-center px-1 bg-transparent text-sm font-bold focus:outline-none" lang="en" />
                  <div className="flex gap-1 ml-1">
                    <button type="button" onClick={() => setDiscountType('amount')} className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${discountType === 'amount' ? 'bg-slate-200 text-slate-700' : 'text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}>৳</button>
                    <button type="button" onClick={() => setDiscountType('percentage')} className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${discountType === 'percentage' ? 'bg-slate-200 text-slate-700' : 'text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}>%</button>
                  </div>
                </div>

                {/* Due */}
                <div 
                  onClick={() => {
                    if (due > 0) setDatePickerOpen(true);
                  }}
                  className={`relative flex-1 flex items-center justify-between bg-white rounded-lg shadow-sm border ${due > 0 ? 'border-red-200 cursor-pointer hover:bg-red-50' : 'border-slate-200'} p-1.5 px-3 transition-colors`}>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">বকেয়া:</span>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-red-500 font-black text-sm leading-none">{due > 0 ? `${toBanglaDigits(due.toFixed(2))} ৳` : '০.০০ ৳'}</span>
                    {due > 0 && promiseDate && <span className="text-[9px] font-bold text-red-400 mt-1 leading-none">{new Date(promiseDate).toLocaleDateString('bn-BD')}</span>}
                  </div>
                  {due > 0 && datePickerOpen && (
                    <BanglaDatePicker value={promiseDate} onChange={setPromiseDate} onClose={() => setDatePickerOpen(false)} />
                  )}
                </div>

                {/* Total */}
                <div className="flex-1 flex flex-col justify-center items-end px-2">
                  <div className="text-[10px] text-slate-500 font-medium leading-none mb-1">
                    সাবটোটাল: {subtotal.toFixed(2)} {discountAmount > 0 && <span className="text-red-500">(-{discountAmount.toFixed(2)})</span>} {parsedDelivery > 0 && <span className="text-slate-600">(+{parsedDelivery.toFixed(2)} 🚚)</span>}
                  </div>
                  <div className="flex items-baseline gap-1 leading-none flex-wrap justify-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">সর্বমোট:</span>
                    <span className="text-xl font-black text-slate-900">{total.toFixed(2)} ৳</span>
                  </div>
                </div>
              </div>

              {/* Row 2: Received Amount & Save Button */}
              <div className="flex gap-3">
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-blue-200 flex items-center overflow-hidden h-[44px]">
                  <div className="pl-3 pr-2 text-[10px] font-bold text-blue-800 uppercase whitespace-nowrap bg-blue-50/50 h-full flex flex-col justify-center border-r border-blue-100">
                    <div>জমা প্রদান</div>
                    <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="bg-transparent font-black focus:outline-none cursor-pointer mt-0.5 text-blue-600">
                      <option value="Cash">Cash</option>
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Bank">Bank</option>
                    </select>
                  </div>
                  <div className="relative flex-1 flex items-center h-full px-2">
                    <span className="text-lg font-black text-slate-300 ml-1">৳</span>
                    <input type="text" inputMode="numeric" value={paidAmount}
                      onChange={e => setPaidAmount(e.target.value)}
                      onFocus={e => (e.target as HTMLInputElement).select()}
                      className="w-full h-full px-2 bg-transparent text-xl font-black text-slate-800 focus:outline-none placeholder-slate-200" placeholder="0.00" lang="en" />
                  </div>
                  <button type="button" onClick={() => setPaidAmount(total.toFixed(2))} className="px-3 h-full bg-blue-100 text-blue-700 hover:bg-blue-200 text-[10px] font-bold transition-colors whitespace-nowrap">
                    সম্পূর্ণ বিল
                  </button>
                </div>
                
                <button type="submit" disabled={loading} className="w-1/3 h-[44px] bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-bold text-sm shadow-md shadow-primary/20 disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? 'সেভ হচ্ছে...' : 'বিক্রয় সম্পন্ন করুন'}
                </button>
              </div>

              {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded-lg text-center mt-[-4px]">{error}</p>}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
const generateInvoiceHTML = (sale: Sale, coverUrl: string, qrCodeUrl?: string, barcodeSVG?: string) => {
  const payment = sale.payments?.[0];
  const payer = payment?.payer || sale.customerName;
  const method = payment?.method || 'Cash';
  const subtotal = sale.items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
  const deliveryCharge = Number(sale.deliveryCharge) || 0;
  const courierName = sale.courierName || "পাঠাও কুরিয়ার";
  const discount = Number(sale.discount) || Math.max(0, subtotal + deliveryCharge - sale.totalAmount);
  
  return `
    <html>
      <head>
        <title>Invoice ${sale.invoiceId}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Tiro+Bangla&family=Inter:wght@400;500;600;700&display=swap');
          @page { size: A4; margin: 0; }
          body { font-family: 'Inter', 'Tiro Bangla', sans-serif; padding: 20px; max-width: 210mm; margin: 0 auto; color: #1e293b; background: #fff; line-height: 1.5; box-sizing: border-box; display: flex; flex-direction: column; min-height: 98vh; }
          .header { text-align: center; border-bottom: 2px solid #16a34a; padding-bottom: 20px; margin-bottom: 30px; position: relative; }
          .invoice-badge { position: absolute; bottom: -15px; left: 50%; transform: translateX(-50%); background: #16a34a; color: white; padding: 4px 20px; border-radius: 9999px; font-weight: 600; font-size: 14px; }
          .header h1 { font-size: 26px; color: #16a34a; margin: 0 0 8px 0; font-weight: 700; }
          .header p { margin: 0; color: #64748b; font-size: 14px; }
          .info-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; background: #f8fafc; padding: 16px; border-radius: 4px; border: 1px solid #e2e8f0; }
          .info-box p { margin: 0 0 4px 0; font-size: 13px; color: #0f172a; }
          .info-box p:last-child { margin-bottom: 0; }
          .info-box p strong { color: #64748b; display: inline-block; width: 90px; font-weight: 500; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; border: 1px solid #16a34a; }
          th { background: #16a34a; color: white; font-weight: 600; font-size: 13px; letter-spacing: 0.5px; padding: 4px 12px; text-align: left; border: 1px solid #16a34a; }
          td { padding: 10px 12px; font-size: 13px; border: 1px solid #16a34a; color: #334155; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .totals-section { width: 380px; margin-top: auto; align-self: flex-end; margin-bottom: 20px; }
          .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; color: #475569; }
          .total-row.grand-total { font-size: 16px; font-weight: 700; color: #0f172a; border-top: 2px solid #16a34a; padding-top: 8px; margin-top: 4px; }
          .total-row.paid { color: #16a34a; font-weight: 600; }
          .total-row.due { color: #dc2626; font-weight: 600; }
          .qr-barcode-section { display: flex; justify-content: space-between; align-items: center; border-top: 2px dashed #cbd5e1; padding-top: 14px; margin-top: 15px; width: 100%; }
          @media print {
            body { padding: 5px; max-width: none; }
            .header { margin: -5px -5px 30px -5px; border-bottom-color: #000 !important; }
            .info-section { border: 1px solid #000 !important; padding: 12px; background: transparent; }
            .invoice-badge { background: #000 !important; color: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; border-color: #000 !important; }
            .header h1 { color: #000 !important; }
            table, th, td { border-color: #000 !important; }
            th { background: #000 !important; color: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .total-row.grand-total { border-top-color: #000 !important; }
            .total-row.paid, .total-row.due { color: #000 !important; font-weight: 700; }
            .info-box p strong { color: #000 !important; }
            .qr-barcode-section { border-top-color: #000 !important; }
            img { -webkit-filter: grayscale(100%) brightness(0.6) contrast(2000%); filter: grayscale(100%) brightness(0.6) contrast(2000%); }
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${coverUrl ? `<img src="${coverUrl}" alt="Board Cover" style="width: 100%; display: block; margin: 0; max-height: 120px; object-fit: cover;" />` 
          : `
          <h1>নূরানী তালিমুল কুরআন বোর্ড খুলনা</h1>
          <p>প্রধান কার্যালয়: মুহাম্মাদনগর বড় মাদরাসা, মাদরাসা সড়ক, জলমা - ৯২৬০, লবণচরা, খুলনা।</p>
          `}
          <div class="invoice-badge">ইনভয়েস</div>
        </div>
        
        <div class="info-section">
          <div class="info-box">
            <p><strong>ক্রেতা:</strong> ${sale.customerName}</p>
            <p><strong>প্রদানকারী:</strong> ${payer}</p>
            <p><strong>পেমেন্ট মাধ্যম:</strong> ${method}</p>
          </div>
          <div class="info-box" style="display: flex; align-items: center; gap: 15px;">
            <div>
              <p><strong>ইনভয়েস নং:</strong> <span style="font-family: monospace; font-weight: bold;">${sale.invoiceId}</span></p>
              <p><strong>তারিখ:</strong> ${new Date(sale.createdAt).toLocaleDateString('bn-BD')}</p>
            </div>
            ${qrCodeUrl ? `<img src="${qrCodeUrl}" alt="QR" style="width: 60px; height: 60px; border: 1px solid #cbd5e1; padding: 2px; border-radius: 4px;" />` : ''}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>পণ্যের নাম</th>
              <th class="text-center">পরিমাণ</th>
              <th class="text-right">একক মূল্য</th>
              <th class="text-right">মোট মূল্য</th>
            </tr>
          </thead>
          <tbody>
            ${sale.items.map(i => `
              <tr>
                <td style="font-weight: 500; color: #0f172a;">
                  ${i.product.name}
                  ${i.product.className ? `<span style="font-size: 11px; color: #64748b; font-weight: normal; margin-left: 4px;">(${i.product.className})</span>` : ''}
                </td>
                <td class="text-center">${i.quantity}</td>
                <td class="text-right">${i.unitPrice} ৳</td>
                <td class="text-right" style="font-weight: 600; color: #0f172a;">${(i.quantity * i.unitPrice).toFixed(2)} ৳</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals-section">
          <div class="total-row">
            <span>পণ্যের মূল্য (সাবটোটাল):</span>
            <span>${subtotal.toFixed(2)} ৳</span>
          </div>
          <div class="total-row">
            <span>কুরিয়ার চার্জ (${courierName}):</span>
            <span>${deliveryCharge > 0 ? `${deliveryCharge.toFixed(2)} ৳` : '০.০০ ৳ (ফ্রি ডেলিভারি)'}</span>
          </div>
          ${discount > 0 ? `
          <div class="total-row">
            <span>ছাড়:</span>
            <span>-${discount.toFixed(2)} ৳</span>
          </div>
          ` : ''}
          <div class="total-row" style="font-weight: bold; border-top: 1px solid #cbd5e1; padding-top: 4px;">
            <span>বর্তমান বিল:</span>
            <span>${sale.totalAmount.toFixed(2)} ৳</span>
          </div>
          ${sale.currentDueList && sale.currentDueList.length > 0 
            ? sale.currentDueList.map((dueObj: any) => `
            <div class="total-row" style="font-size: 13px; color: #475569;">
              <span>অন্যান্য বকেয়া (${dueObj.invoiceId} - ${new Date(dueObj.date).toLocaleDateString('bn-BD')}):</span>
              <span>${dueObj.due.toFixed(2)} ৳</span>
            </div>
            `).join('')
            : (sale.currentTotalDue ? `
            <div class="total-row">
              <span>অন্যান্য বকেয়া:</span>
              <span>${sale.currentTotalDue.toFixed(2)} ৳</span>
            </div>
            ` : '')
          }
          <div class="total-row grand-total">
            <span>সর্বমোট প্রদেয় (আজ পর্যন্ত):</span>
            <span>${(sale.totalAmount + (sale.currentTotalDue || 0)).toFixed(2)} ৳</span>
          </div>
          <div class="total-row paid">
            <span>এই বিলের জন্য পরিশোধিত:</span>
            <span>${sale.paidAmount.toFixed(2)} ৳</span>
          </div>
          <div class="total-row due" style="font-weight: bold; color: #dc2626;">
            <span>সর্বমোট বকেয়া:</span>
            <span>${(sale.totalAmount + (sale.currentTotalDue || 0) - sale.paidAmount).toFixed(2)} ৳</span>
          </div>
        </div>

        <div style="margin-top: 15px; padding: 10px; background: #f0fdf4; border-radius: 6px; border: 1px solid #bbf7d0; font-size: 11px; color: #166534; text-align: left;">
          <strong>🚚 কুরিয়ার নীতিমালা:</strong> ৫,০০০ টাকার কম অর্ডারে “পাঠাও কুরিয়ার”-এর মাধ্যমে পাঠানো হয় (প্রথম ২ কেজি ১৮০ ৳, পরের প্রতি কেজি ২৫ ৳, সর্বোচ্চ ১৫ কেজি)। ৫,০০০ ৳ বা তদূর্ধ্ব অর্ডারে ফ্রি ডেলিভারি।
        </div>

        <div class="qr-barcode-section">
          <div style="text-align: left;">
            <p style="margin: 0 0 4px; font-size: 11px; font-weight: bold; color: #475569;">বারকোড:</p>
            ${barcodeSVG || ''}
          </div>
          <div style="text-align: right;">
            <p style="margin: 0 0 4px; font-size: 11px; font-weight: bold; color: #475569;">অনলাইন ট্র্যাক কিউআর:</p>
            ${qrCodeUrl ? `<img src="${qrCodeUrl}" alt="QR" style="width: 60px; height: 60px; display: inline-block;" />` : ''}
          </div>
        </div>
      </body>
    </html>
  `;
};

const generateLedgerHTML = (ent: {
  name: string;
  institute: string;
  sales: Sale[];
  totalAmount: number;
  paidAmount: number;
  totalDue: number;
}, coverUrl: string) => {
  // Sort sales chronologically ascending for ledger balance
  const sortedSales = [...ent.sales].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  let runningDue = 0;
  const rows = sortedSales.map((s, idx) => {
    const sDue = Math.max(0, s.totalAmount - s.paidAmount);
    runningDue += sDue;
    const itemsCount = s.items.reduce((sum, it) => sum + it.quantity, 0);
    const pInfo = formatPromiseDate(s.promiseDate);

    return `
      <tr>
        <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
        <td style="font-family: monospace; font-weight: bold; color: #15803d;">${s.invoiceId}</td>
        <td>
          <div>${new Date(s.createdAt).toLocaleDateString('bn-BD')}</div>
          <div style="font-size: 11px; color: #64748b;">${new Date(s.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
        </td>
        <td style="text-align: center; font-weight: 600; color: #475569;">
          ${itemsCount} টি
        </td>
        <td style="text-align: right; font-weight: 600;">${s.totalAmount.toFixed(2)} ৳</td>
        <td style="text-align: right; color: #16a34a; font-weight: 600;">${s.paidAmount.toFixed(2)} ৳</td>
        <td style="text-align: right; color: ${sDue > 0 ? '#dc2626' : '#16a34a'}; font-weight: bold;">
          ${sDue > 0 ? `${sDue.toFixed(2)} ৳` : '০.০০ ৳'}
        </td>
        <td style="text-align: center;">
          ${s.paidAmount >= s.totalAmount 
            ? '<span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; border: 1px solid #bbf7d0;">পরিশোধিত</span>' 
            : s.paidAmount > 0 
            ? '<span style="background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; border: 1px solid #bfdbfe;">আংশিক</span>' 
            : '<span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; border: 1px solid #fde68a;">বকেয়া</span>'}
          ${pInfo && sDue > 0 ? `<div style="font-size: 10px; color: #b45309; margin-top: 3px; font-weight: 600;">ওয়াদা: ${pInfo.formatted}</div>` : ''}
        </td>
      </tr>
    `;
  }).join('');

  return `
    <html>
      <head>
        <title>Ledger - ${ent.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Tiro+Bangla&family=Inter:wght@400;500;600;700&display=swap');
          @page { size: A4; margin: 10mm; }
          body { font-family: 'Inter', 'Tiro Bangla', sans-serif; padding: 10px; max-width: 210mm; margin: 0 auto; color: #1e293b; background: #fff; line-height: 1.5; }
          .header { text-align: center; border-bottom: 2px solid #16a34a; padding-bottom: 15px; margin-bottom: 20px; position: relative; }
          .ledger-badge { position: absolute; bottom: -13px; left: 50%; transform: translateX(-50%); background: #16a34a; color: white; padding: 3px 18px; border-radius: 9999px; font-weight: 700; font-size: 13px; }
          .header h1 { font-size: 24px; color: #16a34a; margin: 0 0 6px 0; font-weight: 700; }
          .header p { margin: 0; color: #64748b; font-size: 13px; }
          .customer-strip { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; background: #f8fafc; padding: 14px 18px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .customer-info h3 { margin: 0 0 4px 0; font-size: 16px; color: #0f172a; font-weight: 700; }
          .customer-info p { margin: 0; font-size: 13px; color: #059669; font-weight: 600; }
          .summary-boxes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
          .summary-box { padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center; background: #fafafa; }
          .summary-box.bill { border-color: #cbd5e1; background: #f8fafc; }
          .summary-box.paid { border-color: #bbf7d0; background: #f0fdf4; }
          .summary-box.due { border-color: #fecaca; background: #fef2f2; }
          .summary-box .label { font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 4px; }
          .summary-box .amount { font-size: 18px; font-weight: 800; color: #0f172a; }
          .summary-box.paid .amount { color: #16a34a; }
          .summary-box.due .amount { color: #dc2626; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; border: 1px solid #16a34a; font-size: 12px; }
          th { background: #16a34a; color: white; font-weight: 700; font-size: 12px; padding: 8px 10px; text-align: left; border: 1px solid #16a34a; }
          td { padding: 8px 10px; border: 1px solid #cbd5e1; color: #334155; }
          .footer-section { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 35px; padding-top: 20px; }
          .sig-box { text-align: center; width: 160px; border-top: 1px dashed #64748b; padding-top: 6px; font-size: 12px; color: #475569; font-weight: 600; }
          @media print {
            body { padding: 0; max-width: none; }
            .header { border-bottom-color: #000 !important; }
            .ledger-badge { background: #000 !important; color: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            th { background: #000 !important; color: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; border-color: #000 !important; }
            table, td { border-color: #000 !important; }
            .summary-box { border-color: #000 !important; }
            .summary-box.paid .amount, .summary-box.due .amount { color: #000 !important; font-weight: 900; }
            .customer-strip { border-color: #000 !important; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${coverUrl ? `<img src="${coverUrl}" alt="Board Cover" style="width: 100%; display: block; margin: 0; max-height: 110px; object-fit: cover;" />` 
          : `
          <h1>নূরানী তালিমুল কুরআন বোর্ড খুলনা</h1>
          <p>প্রধান কার্যালয়: মুহাম্মাদনগর বড় মাদরাসা, মাদরাসা সড়ক, জলমা - ৯২৬০, লবণচরা, খুলনা।</p>
          `}
          <div class="ledger-badge">গ্রাহক লেজার বিবরণী (Ledger Statement)</div>
        </div>

        <div class="customer-strip">
          <div class="customer-info">
            <h3><strong>গ্রাহক:</strong> ${ent.name}</h3>
            ${ent.institute ? `<p><strong>প্রতিষ্ঠান/মাদ্রাসা:</strong> ${ent.institute}</p>` : ''}
          </div>
          <div style="text-align: right; font-size: 12px; color: #475569;">
            <div><strong>মোট ভাউচার/অর্ডার:</strong> ${ent.sales.length} টি</div>
            <div style="margin-top: 3px;"><strong>রিপোর্ট তারিখ:</strong> ${new Date().toLocaleDateString('bn-BD')} ${new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
          </div>
        </div>

        <div class="summary-boxes">
          <div class="summary-box bill">
            <div class="label">মোট বিল / ক্রয়</div>
            <div class="amount">${ent.totalAmount.toFixed(2)} ৳</div>
          </div>
          <div class="summary-box paid">
            <div class="label">মোট জমা / পরিশোধ</div>
            <div class="amount">${ent.paidAmount.toFixed(2)} ৳</div>
          </div>
          <div class="summary-box due">
            <div class="label">সর্বমোট বকেয়া</div>
            <div class="amount">${ent.totalDue.toFixed(2)} ৳</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="text-align: center; width: 40px;">ক্রমিক</th>
              <th style="width: 130px;">ইনভয়েস নং</th>
              <th style="width: 120px;">তারিখ ও সময়</th>
              <th style="text-align: center; width: 85px;">মোট আইটেম</th>
              <th style="text-align: right; width: 95px;">মোট বিল</th>
              <th style="text-align: right; width: 95px;">পরিশোধ</th>
              <th style="text-align: right; width: 95px;">বকেয়া</th>
              <th style="text-align: center; width: 100px;">অবস্থা</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="footer-section">
          <div class="sig-box">হিসাব রক্ষকের স্বাক্ষর</div>
          <div style="font-size: 11px; color: #64748b; text-align: center;">
            কম্পিউটার জেনারেটেড গ্রাহক লেজার বিবরণী | নূরানী তালিমুল কুরআন বোর্ড খুলনা
          </div>
          <div class="sig-box">অনুমোদনকারীর স্বাক্ষর</div>
        </div>
      </body>
    </html>
  `;
};

const printEntityLedger = async (ent: any) => {
  let coverUrl = '';
  try {
    const res = await fetch('/api/settings');
    const settings = await res.json();
    coverUrl = settings.coverUrl || '';
  } catch (e) {}

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(generateLedgerHTML(ent, coverUrl));
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

function ActionDropdown({ sale, onUpdate }: { sale: Sale; onUpdate: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markPaid = async () => {
    await fetch(`/api/store/sales/${sale.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Paid', paidAmount: sale.totalAmount }),
    });
    onUpdate(); setOpen(false);
  };

  const deleteSale = async () => {
    if (!confirm('এই বিক্রয়টি মুছে দিতে চান?')) return;
    await fetch(`/api/store/sales/${sale.id}`, { method: 'DELETE' });
    onUpdate(); setOpen(false);
  };

  const printInvoice = async () => {
    let coverUrl = '';
    try {
      const res = await fetch('/api/settings');
      const settings = await res.json();
      coverUrl = settings.coverUrl || '';
    } catch (e) {}

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    // Fetch the real-time order data to get current due list
    let printSale = sale;
    try {
      const orderRes = await fetch(`/api/store/orders/${sale.invoiceId}`);
      if (orderRes.ok) {
        printSale = await orderRes.json();
      }
    } catch(e) {}

    // Generate QR code and barcode
    const trackingUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/track?code=${printSale.invoiceId}` 
      : printSale.invoiceId;
    const qrCodeUrl = await generateQRCodeDataUrl(trackingUrl);
    const barcodeSVG = generateBarcodeSVG(printSale.invoiceId);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(generateInvoiceHTML(printSale, coverUrl, qrCodeUrl, barcodeSVG));
      doc.close();
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => document.body.removeChild(iframe), 2000);
        }, 500);
      };
    }
    setOpen(false);
  };

  const shareInvoice = () => {
    const text = `ইনভয়েস: ${sale.invoiceId}\nক্রেতা: ${sale.customerName}\nমোট: ${sale.totalAmount} ৳\nস্ট্যাটাস: ${sale.status}`;
    if (navigator.share) { navigator.share({ title: `Invoice ${sale.invoiceId}`, text }); }
    else { navigator.clipboard.writeText(text); alert('ইনভয়েস তথ্য কপি হয়েছে!'); }
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white shadow-xl rounded-xl border border-slate-100 z-50 overflow-hidden">
          <button onClick={printInvoice} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
            <FileText className="w-4 h-4 text-blue-500" /> প্রিন্ট ইনভয়েস
          </button>
          <button onClick={shareInvoice} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
            <Share2 className="w-4 h-4 text-green-500" /> শেয়ার করুন
          </button>
          <button onClick={() => alert('এডিট অপশনটি শীঘ্রই আসছে!')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
            <Edit className="w-4 h-4 text-amber-500" /> এডিট করুন
          </button>
          {sale.status !== 'Paid' && (
            <button onClick={markPaid} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> পরিশোধিত
            </button>
          )}
          <div className="border-t border-slate-100" />
          <button onClick={deleteSale} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" /> মুছে দিন
          </button>
        </div>
      )}
    </div>
  );
}

function SaleDetailsModal({ sale, allSales = [], onClose }: { sale: Sale; allSales?: Sale[]; onClose: () => void }) {
  const payment = sale.payments?.[0];
  const payer = payment?.payer || sale.customerName;
  const method = payment?.method || 'Cash';

  const [otherDueList, setOtherDueList] = useState<any[]>(() => {
    const custName = (sale.customerName || '').trim().toLowerCase();
    const instId = (sale.instituteId || '').trim().toLowerCase();
    const phone = (sale.customerPhone || '').trim();

    return allSales
      .filter(s => {
        if (s.id === sale.id || s.invoiceId === sale.invoiceId) return false;
        if (s.status === 'Rejected' || s.status === 'Cancelled') return false;
        const sCust = (s.customerName || '').trim().toLowerCase();
        const sInst = (s.instituteId || '').trim().toLowerCase();
        const sPhone = (s.customerPhone || '').trim();

        if (phone && sPhone && phone === sPhone) return true;
        if (instId && sInst && instId === sInst) return true;
        if (custName && sCust && custName === sCust) return true;
        return false;
      })
      .map(s => {
        const due = Math.max(0, s.totalAmount - s.paidAmount);
        return {
          invoiceId: s.invoiceId,
          date: s.createdAt,
          due,
          totalAmount: s.totalAmount,
          paidAmount: s.paidAmount,
        };
      })
      .filter(d => d.due > 0);
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // Real-time sync with database endpoint for other dues
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/store/orders/${sale.invoiceId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.currentDueList)) {
            setOtherDueList(data.currentDueList);
          }
        }
      } catch (e) {}
    })();
    return () => { isMounted = false; };
  }, [sale.invoiceId]);

  const currentVoucherDue = Math.max(0, sale.totalAmount - sale.paidAmount);
  const otherTotalDue = otherDueList.reduce((sum, item) => sum + (Number(item.due) || 0), 0);
  const grandTotalDue = currentVoucherDue + otherTotalDue;

  const printInvoice = async () => {
    let coverUrl = '';
    try {
      const res = await fetch('/api/settings');
      const settings = await res.json();
      coverUrl = settings.coverUrl || '';
    } catch (e) {}

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const trackingUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/track?code=${sale.invoiceId}` 
      : sale.invoiceId;
    const qrCodeUrl = await generateQRCodeDataUrl(trackingUrl);
    const barcodeSVG = generateBarcodeSVG(sale.invoiceId);

    const printSaleData = {
      ...sale,
      currentDueList: otherDueList,
      currentTotalDue: otherTotalDue,
    };

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(generateInvoiceHTML(printSaleData, coverUrl, qrCodeUrl, barcodeSVG));
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800 text-lg">ইনভয়েস বিস্তারিত</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">ইনভয়েস আইডি</p>
              <p className="font-bold text-primary text-lg">{sale.invoiceId}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 mb-1">তারিখ</p>
              <p className="font-medium text-slate-800">{new Date(sale.createdAt).toLocaleDateString('bn-BD')}</p>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100 flex flex-col sm:flex-row gap-4 justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">ক্রেতার নাম</p>
              <p className="font-bold text-slate-800">{sale.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">প্রদানকারী (Paid By)</p>
              <p className="font-medium text-slate-800">{payer}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">পেমেন্ট মাধ্যম</p>
              <p className="font-medium text-slate-800">{method}</p>
            </div>
          </div>

          <h4 className="font-bold text-slate-800 mb-3">পণ্যসমূহ ({sale.items.length})</h4>
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-6 bg-white">
            {/* Desktop Table */}
            <div className="hidden sm:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">পণ্য</th>
                    <th className="px-4 py-3 font-medium text-center">পরিমাণ</th>
                    <th className="px-4 py-3 font-medium text-right">দাম</th>
                    <th className="px-4 py-3 font-medium text-right">মোট</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sale.items.map(item => (
                    <tr key={item.id} className="bg-white">
                      <td className="px-4 py-3 font-medium text-slate-800">{item.product.name}</td>
                      <td className="px-4 py-3 text-center text-slate-600">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{item.unitPrice} ৳</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-800">{(item.quantity * item.unitPrice).toFixed(2)} ৳</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Cards */}
            <div className="sm:hidden flex flex-col divide-y divide-slate-100">
              {sale.items.map(item => (
                <div key={item.id} className="p-3 bg-white flex flex-col gap-1.5">
                  <p className="font-medium text-slate-800 leading-tight">{item.product.name}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">{item.quantity} <span className="text-xs">x</span> {item.unitPrice} ৳</span>
                    <span className="font-bold text-slate-800">{(item.quantity * item.unitPrice).toFixed(2)} ৳</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Breakdown */}
          {(() => {
            const itemsSubtotal = sale.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
            const deliveryCharge = Number(sale.deliveryCharge) || 0;
            return (
              <div className="space-y-1.5 text-right border-t border-slate-100 pt-4 text-xs sm:text-sm">
                <div className="flex justify-end gap-4 text-slate-600">
                  <span>পণ্যের মূল্য (সাবটোটাল):</span>
                  <span className="font-bold text-slate-800 w-32">{itemsSubtotal.toFixed(2)} ৳</span>
                </div>
                <div className="flex justify-end gap-4 text-slate-600">
                  <span>কুরিয়ার ({sale.courierName || 'পাঠাও কুরিয়ার'}):</span>
                  <span className="font-bold text-slate-800 w-32">
                    {deliveryCharge > 0 ? `${deliveryCharge.toFixed(2)} ৳` : '০.০০ ৳ (ফ্রি)'}
                  </span>
                </div>
                {sale.discount ? (
                  <div className="flex justify-end gap-4 text-emerald-600">
                    <span>ছাড়:</span>
                    <span className="font-bold w-32">-{sale.discount.toFixed(2)} ৳</span>
                  </div>
                ) : null}
                <div className="flex justify-end gap-4 text-slate-800 font-bold border-t border-slate-200 pt-1.5">
                  <span>সর্বমোট বিল:</span>
                  <span className="text-primary font-black text-base w-32">{sale.totalAmount.toFixed(2)} ৳</span>
                </div>
                <div className="flex justify-end gap-4 text-emerald-600 font-bold">
                  <span>পরিশোধিত:</span>
                  <span className="w-32">{sale.paidAmount.toFixed(2)} ৳</span>
                </div>
                <div className="flex justify-end gap-4 text-red-600 font-bold">
                  <span>এই ভাউচারের বাকি:</span>
                  <span className="w-32">{currentVoucherDue.toFixed(2)} ৳</span>
                </div>
              </div>
            );
          })()}

          {/* Other Vouchers Due Section */}
          {otherDueList.length > 0 && (
            <div className="mt-4 pt-3 border-t-2 border-dashed border-amber-200 bg-amber-50/70 p-3.5 rounded-xl text-xs sm:text-sm">
              <div className="flex items-center justify-between font-bold text-amber-900 mb-2">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>অন্যান্য ভাউচারের বকেয়া ({otherDueList.length} টি):</span>
                </span>
                <span className="text-red-600 font-black">{otherTotalDue.toFixed(2)} ৳</span>
              </div>

              <div className="space-y-1.5 pl-5 text-[11px] sm:text-xs text-slate-700 max-h-36 overflow-y-auto pr-1">
                {otherDueList.map((ov: any) => (
                  <div key={ov.invoiceId} className="flex justify-between items-center py-0.5 border-b border-amber-100/80 last:border-b-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-800">{ov.invoiceId}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 font-mono text-[10px]">
                        {new Date(ov.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <span className="font-bold text-red-600">{Number(ov.due).toFixed(2)} ৳</span>
                  </div>
                ))}
              </div>

              <div className="mt-2.5 pt-2 border-t border-amber-200 flex justify-between items-center text-xs sm:text-sm font-extrabold text-slate-900">
                <span>গ্রাহকের সর্বমোট বকেয়া (এই ভাউচার + অন্যান্য):</span>
                <span className="text-base text-red-600 font-black">{grandTotalDue.toFixed(2)} ৳</span>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-200 font-medium rounded-lg transition-colors">
            বন্ধ করুন
          </button>
          <button onClick={printInvoice} className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
            <FileText className="w-4 h-4" /> প্রিন্ট ভাউচার
          </button>
        </div>
      </div>
    </div>
  );
}

const scrollIntoCenter = (e: React.MouseEvent<HTMLElement>) => {
  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
};

type ColumnKey = 'invoiceId' | 'date' | 'customer' | 'items' | 'total' | 'paid' | 'duePromise' | 'status' | 'action';

interface ColumnDef {
  key: ColumnKey;
  label: string;
  locked?: boolean;
}

const AVAILABLE_COLUMNS: ColumnDef[] = [
  { key: 'invoiceId', label: 'ইনভয়েস আইডি', locked: true },
  { key: 'date', label: 'তারিখ ও সময়' },
  { key: 'customer', label: 'ক্রেতা ও প্রতিষ্ঠান', locked: true },
  { key: 'total', label: 'মোট বিল' },
  { key: 'duePromise', label: 'বকেয়া ও ওয়াদার তারিখ' },
  { key: 'status', label: 'স্ট্যাটাস' },
  { key: 'items', label: 'আইটেম সংখ্যা' },
  { key: 'paid', label: 'পরিশোধের পরিমাণ' },
  { key: 'action', label: 'অ্যাকশন', locked: true },
];

const DEFAULT_VISIBLE_COLUMNS: Record<ColumnKey, boolean> = {
  invoiceId: true,
  date: true,
  customer: true,
  items: false, // clean view by default
  total: true,
  paid: false,  // clean view by default
  duePromise: true,
  status: true,
  action: true,
};

export default function SaleTab() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Column visibility state with localStorage persistence
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>(DEFAULT_VISIBLE_COLUMNS);
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const columnMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('store_sales_visible_cols_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        setVisibleColumns(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (columnMenuRef.current && !columnMenuRef.current.contains(e.target as Node)) {
        setColumnMenuOpen(false);
      }
    };
    if (columnMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [columnMenuOpen]);

  const toggleColumn = (key: ColumnKey) => {
    setVisibleColumns(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('store_sales_visible_cols_v1', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const resetColumnsToDefault = () => {
    setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
    try {
      localStorage.setItem('store_sales_visible_cols_v1', JSON.stringify(DEFAULT_VISIBLE_COLUMNS));
    } catch (e) {}
  };

  const showAllColumns = () => {
    const allCols: Record<ColumnKey, boolean> = {
      invoiceId: true,
      date: true,
      customer: true,
      items: true,
      total: true,
      paid: true,
      duePromise: true,
      status: true,
      action: true,
    };
    setVisibleColumns(allCols);
    try {
      localStorage.setItem('store_sales_visible_cols_v1', JSON.stringify(allCols));
    } catch (e) {}
  };

  const visibleColumnCount = useMemo(() => {
    return AVAILABLE_COLUMNS.filter(col => visibleColumns[col.key]).length;
  }, [visibleColumns]);

  // Sub Tabs & Filters
  const [subTab, setSubTab] = useState<'all' | 'due' | 'paid' | 'partial' | 'promise'>('all');
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'confirm-desc' | 'promise-near' | 'due-desc' | 'amount-desc'>('confirm-desc');
  const [viewMode, setViewMode] = useState<'invoices' | 'entity'>('invoices');
  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(new Set());

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/store/sales');
      const data = await res.json();
      setSales(Array.isArray(data) ? data : []);
    } catch { setSales([]); }
    setLoading(false);
  };

  useEffect(() => { fetchSales(); }, []);

  // When switching to promise date sub-tab, automatically switch sorting to 'promise-near'
  const handleSubTabChange = (newTab: 'all' | 'due' | 'paid' | 'partial' | 'promise') => {
    setSubTab(newTab);
    if (newTab === 'promise') {
      setSortBy('promise-near');
    } else if (sortBy === 'promise-near') {
      setSortBy('confirm-desc');
    }
  };

  const toggleEntityExpand = (key: string) => {
    setExpandedEntities(prev => {
      if (prev.has(key)) {
        return new Set();
      }
      return new Set([key]);
    });
  };

  // Unique Customer & Madrasa list for dropdown filter
  const entityList = useMemo(() => {
    const map = new Map<string, { key: string; name: string; institute: string }>();
    sales.forEach(s => {
      const name = (s.customerName || '').trim();
      const institute = (s.instituteId || '').trim();
      const key = `${name}|||${institute}`;
      if (!map.has(key)) {
        map.set(key, { key, name, institute });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [sales]);

  // Sub-tab counts
  const subTabCounts = useMemo(() => {
    let dueCount = 0;
    let paidCount = 0;
    let partialCount = 0;
    let promiseCount = 0;

    sales.forEach(s => {
      if (s.status === 'Rejected') return;
      const due = s.totalAmount - s.paidAmount;
      if (due > 0) dueCount++;
      if (s.paidAmount >= s.totalAmount) paidCount++;
      if (s.paidAmount > 0 && s.paidAmount < s.totalAmount) partialCount++;
      if (s.promiseDate) promiseCount++;
    });

    return {
      all: sales.length,
      due: dueCount,
      paid: paidCount,
      partial: partialCount,
      promise: promiseCount,
    };
  }, [sales]);

  // Filtered and sorted sales list
  const filtered = useMemo(() => {
    return sales
      .filter(s => {
        // Search filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = s.customerName.toLowerCase().includes(q);
          const matchInvoice = s.invoiceId.toLowerCase().includes(q);
          const matchInstitute = (s.instituteId || '').toLowerCase().includes(q);
          if (!matchName && !matchInvoice && !matchInstitute) return false;
        }

        // Sub tab filter
        if (subTab === 'due') {
          if (s.status === 'Rejected') return false;
          const due = s.totalAmount - s.paidAmount;
          if (due <= 0) return false;
        } else if (subTab === 'paid') {
          if (s.status === 'Rejected') return false;
          if (s.paidAmount < s.totalAmount) return false;
        } else if (subTab === 'partial') {
          if (s.status === 'Rejected') return false;
          if (s.paidAmount <= 0 || s.paidAmount >= s.totalAmount) return false;
        } else if (subTab === 'promise') {
          if (!s.promiseDate) return false;
        }

        // Person / Madrasa dropdown filter
        if (selectedEntity !== 'all') {
          const entityKey = `${(s.customerName || '').trim()}|||${(s.instituteId || '').trim()}`;
          if (entityKey !== selectedEntity) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'promise-near') {
          const timeA = a.promiseDate ? new Date(a.promiseDate).getTime() : Infinity;
          const timeB = b.promiseDate ? new Date(b.promiseDate).getTime() : Infinity;
          if (timeA !== timeB) return timeA - timeB; // nearer first
        } else if (sortBy === 'due-desc') {
          const dueA = Math.max(0, a.totalAmount - a.paidAmount);
          const dueB = Math.max(0, b.totalAmount - b.paidAmount);
          if (dueA !== dueB) return dueB - dueA;
        } else if (sortBy === 'amount-desc') {
          if (a.totalAmount !== b.totalAmount) return b.totalAmount - a.totalAmount;
        }

        // Default: confirm / updated date descending
        const dateA = new Date(a.updatedAt || a.createdAt).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt).getTime();
        return dateB - dateA;
      });
  }, [sales, searchTerm, subTab, selectedEntity, sortBy]);

  // Person / Madrasa Wise Grouped Data
  const entityGroups = useMemo(() => {
    const map = new Map<string, {
      key: string;
      name: string;
      institute: string;
      sales: Sale[];
      totalAmount: number;
      paidAmount: number;
      totalDue: number;
      nearestPromiseDate: string | null;
    }>();

    filtered.forEach(s => {
      const name = (s.customerName || 'বেনামী').trim();
      const institute = (s.instituteId || '').trim();
      const key = `${name}|||${institute}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          name,
          institute,
          sales: [],
          totalAmount: 0,
          paidAmount: 0,
          totalDue: 0,
          nearestPromiseDate: null,
        });
      }

      const entry = map.get(key)!;
      entry.sales.push(s);
      entry.totalAmount += s.totalAmount;
      entry.paidAmount += s.paidAmount;
      const due = Math.max(0, s.totalAmount - s.paidAmount);
      entry.totalDue += due;

      if (s.promiseDate) {
        if (!entry.nearestPromiseDate) {
          entry.nearestPromiseDate = s.promiseDate;
        } else {
          const existingT = new Date(entry.nearestPromiseDate).getTime();
          const newT = new Date(s.promiseDate).getTime();
          if (newT < existingT) {
            entry.nearestPromiseDate = s.promiseDate;
          }
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      if (sortBy === 'due-desc') return b.totalDue - a.totalDue;
      if (sortBy === 'amount-desc') return b.totalAmount - a.totalAmount;
      if (sortBy === 'promise-near') {
        const timeA = a.nearestPromiseDate ? new Date(a.nearestPromiseDate).getTime() : Infinity;
        const timeB = b.nearestPromiseDate ? new Date(b.nearestPromiseDate).getTime() : Infinity;
        return timeA - timeB;
      }
      return b.totalDue - a.totalDue; // default: highest due first
    });
  }, [filtered, sortBy]);

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      {showModal && <NewSaleModal onClose={() => setShowModal(false)} onSaved={fetchSales} />}
      {selectedSale && <SaleDetailsModal sale={selectedSale} allSales={sales} onClose={() => setSelectedSale(null)} />}

      {/* Top Search, Actions & Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="ইনভয়েস আইডি, ক্রেতা বা মাদ্রাসা দিয়ে খুঁজুন..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            lang="en"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all" 
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button 
            onClick={() => {
              const csv = [
                'ইনভয়েস,ক্রেতা,মাদ্রাসা,তারিখ ও সময়,মোট বিল,পরিশোধ,বকেয়া,ওয়াদার তারিখ,স্ট্যাটাস',
                ...filtered.map(s => `"${s.invoiceId}","${s.customerName}","${s.instituteId || ''}","${new Date(s.updatedAt || s.createdAt).toLocaleString('bn-BD')}",${s.totalAmount},${s.paidAmount},${Math.max(0, s.totalAmount - s.paidAmount)},"${s.promiseDate ? new Date(s.promiseDate).toLocaleDateString('bn-BD') : ''}","${s.status}"`)
              ].join('\n');
              const a = document.createElement('a');
              a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
              a.download = 'sales_report.csv';
              a.click();
            }} 
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>এক্সপোর্ট</span>
          </button>
          <button 
            onClick={() => setShowModal(true)} 
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-primary rounded-xl hover:bg-primary/90 transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন বিক্রয়</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs Bar (সব, বকেয়া, পরিশোধিত, আংশিক, ওয়াদার তারিখ) */}
      <div className="flex items-center gap-1 overflow-x-auto scroll-smooth bg-white p-1 rounded-full border border-slate-200/80 shadow-xs [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {[
          { id: 'all' as const, label: 'সব বিক্রয়', count: subTabCounts.all, icon: null, activeBg: 'bg-slate-900 text-white shadow-xs' },
          { id: 'due' as const, label: 'বকেয়া (Due)', count: subTabCounts.due, icon: Clock, activeBg: 'bg-amber-600 text-white shadow-xs' },
          { id: 'paid' as const, label: 'পরিশোধিত (Paid Full)', count: subTabCounts.paid, icon: CheckCircle, activeBg: 'bg-emerald-600 text-white shadow-xs' },
          { id: 'partial' as const, label: 'আংশিক (Partial)', count: subTabCounts.partial, icon: null, activeBg: 'bg-blue-600 text-white shadow-xs' },
          { id: 'promise' as const, label: 'ওয়াদার তারিখ (Promise Date)', count: subTabCounts.promise, icon: Calendar, activeBg: 'bg-purple-600 text-white shadow-xs' },
        ].map((tab) => {
          const isActive = subTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={(e) => { scrollIntoCenter(e); handleSubTabChange(tab.id); }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? tab.activeBg
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Control Bar: View Switcher, Entity Dropdown, & Sorting */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 shadow-xs text-xs">
        {/* Left: View Mode Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/70 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full sm:w-fit">
          <button
            type="button"
            onClick={(e) => { scrollIntoCenter(e); setViewMode('invoices'); }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              viewMode === 'invoices'
                ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>ইনভয়েস তালিকা ({filtered.length})</span>
          </button>
          <button
            type="button"
            onClick={(e) => { scrollIntoCenter(e); setViewMode('entity'); }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              viewMode === 'entity'
                ? 'bg-white text-primary shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>ব্যক্তি / মাদ্রাসাওয়ারি হিসাব ({entityGroups.length})</span>
          </button>
        </div>

        {/* Right: Person/Madrasa Filter, Sorting & Columns */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          {/* Person / Madrasa Dropdown Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 flex-1 sm:flex-initial">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedEntity}
              onChange={e => setSelectedEntity(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 outline-none w-full sm:w-44 text-xs cursor-pointer"
            >
              <option value="all">সকল ব্যক্তি ও মাদ্রাসা</option>
              {entityList.map(ent => (
                <option key={ent.key} value={ent.key}>
                  {ent.name} {ent.institute ? `(${ent.institute})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 flex-1 sm:flex-initial">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent font-semibold text-slate-700 outline-none w-full sm:w-48 text-xs cursor-pointer"
            >
              <option value="confirm-desc">কনফার্ম তারিখ (নতুন আগে)</option>
              <option value="promise-near">ওয়াদার তারিখ (কাছের আগে)</option>
              <option value="due-desc">বকেয়া পরিমাণ (বেশি আগে)</option>
              <option value="amount-desc">সর্বমোট মূল্য (বেশি আগে)</option>
            </select>
          </div>

          {/* Column Toggle Dropdown Button */}
          {viewMode === 'invoices' && (
            <div className="relative shrink-0" ref={columnMenuRef}>
              <button
                type="button"
                onClick={() => setColumnMenuOpen(!columnMenuOpen)}
                className={`flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  columnMenuOpen 
                    ? 'bg-primary/10 border-primary text-primary shadow-xs' 
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
                title="কলাম নির্বাচন ও লুকান"
              >
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>কলাম</span>
                </div>
                <span className="bg-primary text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {visibleColumnCount}/{AVAILABLE_COLUMNS.length}
                </span>
              </button>

              {columnMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="font-extrabold text-slate-800 text-xs">কলাম প্রদর্শন নির্বাচন</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={resetColumnsToDefault}
                        className="text-[11px] text-primary hover:underline font-bold"
                      >
                        ডিফল্ট
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={showAllColumns}
                        className="text-[11px] text-slate-500 hover:text-slate-800 font-medium"
                      >
                        সব দেখান
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {AVAILABLE_COLUMNS.map(col => (
                      <label
                        key={col.key}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer select-none transition-colors ${
                          visibleColumns[col.key] ? 'bg-primary/5 text-slate-800 font-semibold' : 'text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={!!visibleColumns[col.key]}
                            disabled={col.locked}
                            onChange={() => toggleColumn(col.key)}
                            className="rounded border-slate-300 text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer disabled:opacity-50"
                          />
                          <span>{col.label}</span>
                        </span>
                        {col.locked && (
                          <span className="text-[10px] text-slate-400 font-normal">স্থির</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'invoices' ? (
        /* ================= INVOICES TABLE VIEW ================= */
        <>
          {/* Desktop Table */}
          <div className="hidden md:block border border-slate-200/80 rounded-2xl bg-white shadow-xs overflow-hidden">
            <div className="overflow-auto max-h-[calc(100vh-310px)] min-h-[350px]">
              <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 shadow-2xs">
                <tr className="bg-slate-50/95 backdrop-blur-xs text-slate-600 text-xs uppercase tracking-wider font-bold">
                  {visibleColumns.invoiceId && <th className="px-5 py-3.5 whitespace-nowrap">ইনভয়েস আইডি</th>}
                  {visibleColumns.date && <th className="px-5 py-3.5 whitespace-nowrap">তারিখ ও সময়</th>}
                  {visibleColumns.customer && <th className="px-5 py-3.5 whitespace-nowrap">ক্রেতা ও প্রতিষ্ঠান</th>}
                  {visibleColumns.items && <th className="px-5 py-3.5 text-center whitespace-nowrap">আইটেম</th>}
                  {visibleColumns.total && <th className="px-5 py-3.5 text-right whitespace-nowrap">মোট বিল</th>}
                  {visibleColumns.paid && <th className="px-5 py-3.5 text-right whitespace-nowrap">পরিশোধ</th>}
                  {visibleColumns.duePromise && <th className="px-5 py-3.5 whitespace-nowrap">বকেয়া ও ওয়াদার তারিখ</th>}
                  {visibleColumns.status && <th className="px-5 py-3.5 text-center whitespace-nowrap">স্ট্যাটাস</th>}
                  {visibleColumns.action && <th className="px-5 py-3.5 text-right whitespace-nowrap">অ্যাকশন</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr><td colSpan={visibleColumnCount} className="px-6 py-12 text-center text-slate-400 font-medium">লোড হচ্ছে...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={visibleColumnCount} className="px-6 py-12 text-center text-slate-400">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold text-slate-600">কোনো বিক্রয় পাওয়া যায়নি</p>
                      <p className="text-xs text-slate-400 mt-0.5">অন্যান্য সাব-ট্যাব বা ফিল্টার চেক করুন।</p>
                    </td>
                  </tr>
                ) : filtered.map(sale => {
                  const confirmDate = sale.updatedAt || sale.createdAt;
                  const isDifferent = sale.updatedAt && Math.abs(new Date(sale.updatedAt).getTime() - new Date(sale.createdAt).getTime()) > 60000;
                  const due = Math.max(0, sale.totalAmount - sale.paidAmount);
                  const promiseInfo = formatPromiseDate(sale.promiseDate);

                  return (
                    <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Invoice */}
                      {visibleColumns.invoiceId && (
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="font-mono font-black text-primary text-sm">{sale.invoiceId}</span>
                        </td>
                      )}

                      {/* Confirm Date & Time */}
                      {visibleColumns.date && (
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="font-semibold text-slate-800 text-xs">
                            {new Date(confirmDate).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                            <span>{new Date(confirmDate).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                            {isDifferent && (
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded font-sans font-bold border border-emerald-200">
                                কনফার্মড
                              </span>
                            )}
                          </div>
                        </td>
                      )}

                      {/* Customer & Madrasa */}
                      {visibleColumns.customer && (
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-slate-800 leading-snug">{sale.customerName}</p>
                          {sale.instituteId ? (
                            <p className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded w-fit mt-0.5 font-medium">
                              {sale.instituteId}
                            </p>
                          ) : (
                            <span className="text-xs text-slate-400">ব্যক্তিগত</span>
                          )}
                        </td>
                      )}

                      {/* Items */}
                      {visibleColumns.items && (
                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg text-xs font-bold">
                            {sale.items.reduce((sum, item) => sum + item.quantity, 0)} টি
                          </span>
                        </td>
                      )}

                      {/* Total */}
                      {visibleColumns.total && (
                        <td className="px-5 py-3.5 text-right whitespace-nowrap font-black text-slate-800">
                          <div>{sale.totalAmount.toFixed(2)} ৳</div>
                          {!visibleColumns.paid && sale.paidAmount > 0 && sale.paidAmount < sale.totalAmount && (
                            <div className="text-[11px] font-normal text-emerald-700 mt-0.5">
                              জমা: {sale.paidAmount.toFixed(2)} ৳
                            </div>
                          )}
                        </td>
                      )}

                      {/* Paid */}
                      {visibleColumns.paid && (
                        <td className="px-5 py-3.5 text-right whitespace-nowrap font-bold text-emerald-700">
                          {sale.paidAmount.toFixed(2)} ৳
                        </td>
                      )}

                      {/* Due & Promise Date */}
                      {visibleColumns.duePromise && (
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {due > 0 ? (
                            <div>
                              <span className="font-bold text-red-600 text-xs">
                                {due.toFixed(2)} ৳ বকেয়া
                              </span>
                              {promiseInfo && (
                                <div className="mt-1 flex items-center gap-1">
                                  <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border font-semibold ${promiseInfo.badgeClass}`}>
                                    <Calendar className="w-3 h-3" />
                                    <span>{promiseInfo.formatted} ({promiseInfo.label})</span>
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              বকেয়া নেই
                            </span>
                          )}
                        </td>
                      )}

                      {/* Status */}
                      {visibleColumns.status && (
                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                            sale.status === 'Paid' || sale.paidAmount >= sale.totalAmount
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : sale.status === 'Pending' || sale.paidAmount === 0
                              ? 'bg-amber-50 text-amber-700 border-amber-200' 
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {sale.status === 'Paid' || sale.paidAmount >= sale.totalAmount 
                              ? 'পরিশোধিত' 
                              : sale.status === 'Pending' || sale.paidAmount === 0 
                              ? 'বকেয়া' 
                              : 'আংশিক'}
                          </span>
                        </td>
                      )}

                      {/* Actions */}
                      {visibleColumns.action && (
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <ActionDropdown sale={sale} onUpdate={fetchSales} />
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Invoices Cards */}
        <div className="md:hidden flex flex-col gap-3">
          {loading ? (
            <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="inline-block w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-2" />
              <p className="font-medium text-xs">লোড হচ্ছে...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-600">কোনো বিক্রয় পাওয়া যায়নি</p>
              <p className="text-xs text-slate-400 mt-0.5">অন্যান্য সাব-ট্যাব বা ফিল্টার চেক করুন।</p>
            </div>
          ) : filtered.map(sale => {
            const confirmDate = sale.updatedAt || sale.createdAt;
            const due = Math.max(0, sale.totalAmount - sale.paidAmount);
            const promiseInfo = formatPromiseDate(sale.promiseDate);
            const isPaid = sale.status === 'Paid' || sale.paidAmount >= sale.totalAmount;
            const isPending = sale.status === 'Pending' || sale.paidAmount === 0;
            const totalItems = sale.items.reduce((sum, item) => sum + item.quantity, 0);

            return (
              <div 
                key={sale.id} 
                onClick={() => setSelectedSale(sale)} 
                className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs hover:border-slate-300 transition-all active:bg-slate-50/70 cursor-pointer flex flex-col gap-2"
              >
                {/* Row 1: Invoice ID + Date + Status + Action */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">{sale.invoiceId}</span>
                    <span className="text-slate-300 text-[10px]">•</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {new Date(confirmDate).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      isPaid 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : isPending 
                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {isPaid ? 'পরিশোধিত' : isPending ? 'বকেয়া' : 'আংশিক'}
                    </span>
                    <div onClick={e => e.stopPropagation()}>
                      <ActionDropdown sale={sale} onUpdate={fetchSales} />
                    </div>
                  </div>
                </div>

                {/* Row 2: Customer Name & Direct Madrasa */}
                <div>
                  <h4 className="font-bold text-slate-800 text-sm leading-snug">
                    {sale.customerName}
                  </h4>
                  {sale.instituteId ? (
                    <p className="text-xs text-emerald-700 font-medium mt-0.5">
                      {sale.instituteId}
                    </p>
                  ) : (
                    <span className="text-[11px] text-slate-400">ব্যক্তিগত</span>
                  )}
                </div>

                {/* Row 3: Financial & Meta Info */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {sale.totalAmount.toFixed(2)} ৳
                    </span>
                    {due > 0 && (
                      <span className="text-red-600 font-bold text-[11px] bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                        বকেয়া: {due.toFixed(2)} ৳
                      </span>
                    )}
                  </div>

                  {due > 0 && promiseInfo ? (
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border font-semibold ${promiseInfo.badgeClass}`}>
                      <Calendar className="w-2.5 h-2.5" />
                      <span>ওয়াদা: {promiseInfo.formatted}</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">
                      {totalItems} টি আইটেম
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </>
      ) : (
        /* ================= PERSON / MADRASA WISE GROUPED VIEW ================= */
        <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-310px)] pr-1">
          {entityGroups.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80 text-slate-400">
              <Building className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-600">কোনো ব্যক্তি বা মাদ্রাসার হিসাব পাওয়া যায়নি</p>
            </div>
          ) : (
            entityGroups.map(ent => {
              const isExpanded = expandedEntities.has(ent.key);
              const promiseInfo = formatPromiseDate(ent.nearestPromiseDate);

              return (
                <div 
                  key={ent.key} 
                  className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                    isExpanded 
                      ? 'bg-white border-2 border-emerald-600/60 shadow-md ring-4 ring-emerald-500/10' 
                      : 'bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300'
                  }`}
                >
                  {/* Entity Header Summary Bar */}
                  <div 
                    onClick={() => toggleEntityExpand(ent.key)}
                    className={`p-3 sm:p-4 cursor-pointer transition-colors duration-300 flex flex-col gap-2 ${
                      isExpanded 
                        ? 'bg-emerald-50/80 hover:bg-emerald-50 border-b border-emerald-200/70' 
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* Top Row: User/Madrasa Info & Expand Chevron */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                          ent.totalDue > 0 
                            ? 'bg-amber-100 text-amber-800' 
                            : isExpanded 
                            ? 'bg-emerald-200/80 text-emerald-900 ring-2 ring-emerald-300/60' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {ent.institute ? <Building className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 truncate leading-snug">{ent.name}</h4>
                            <span className={`text-[10px] sm:text-xs px-2 py-0.2 rounded-full font-bold transition-colors duration-300 ${
                              isExpanded 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {ent.sales.length} টি অর্ডার
                            </span>
                          </div>
                          {ent.institute ? (
                            <p className="text-xs text-emerald-700 font-medium truncate mt-0.5">
                              {ent.institute}
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-400 mt-0.5">ব্যক্তিগত কাস্টমার</p>
                          )}
                        </div>
                      </div>

                      {/* Right Actions: Ledger Print & Expand Chevron */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            printEntityLedger(ent);
                          }}
                          title="গ্রাহকের সম্পূর্ণ লেজার / খতিয়ান প্রিন্ট করুন"
                          className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300/80 hover:border-emerald-500 rounded-lg text-xs font-bold shadow-2xs transition-all active:scale-95"
                        >
                          <Printer className="w-3.5 h-3.5 text-emerald-600" />
                          <span>লেজার প্রিন্ট</span>
                        </button>

                        <div className={`w-7 h-7 rounded-lg transition-all duration-300 flex items-center justify-center ${
                          isExpanded 
                            ? 'bg-emerald-600 text-white shadow-2xs rotate-180' 
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 rotate-0'
                        }`}>
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Compact Financial Strip */}
                    <div className={`flex items-center justify-between text-xs pt-2 border-t transition-colors duration-300 ${
                      isExpanded ? 'border-emerald-200/60' : 'border-slate-100'
                    }`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-800 text-xs sm:text-sm">
                          মোট বিল: {ent.totalAmount.toFixed(2)} ৳
                        </span>
                        {ent.totalDue > 0 ? (
                          <span className="bg-red-50 text-red-600 border border-red-200/80 text-[11px] font-bold px-2 py-0.5 rounded-md">
                            বকেয়া: {ent.totalDue.toFixed(2)} ৳
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-bold px-2 py-0.5 rounded-md">
                            পরিশোধিত
                          </span>
                        )}
                      </div>

                      <div>
                        {promiseInfo && ent.totalDue > 0 ? (
                          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border font-semibold ${promiseInfo.badgeClass}`}>
                            <Calendar className="w-2.5 h-2.5" />
                            <span>ওয়াদা: {promiseInfo.formatted}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-medium">
                            জমা: {ent.paidAmount.toFixed(2)} ৳
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Invoices List with Smooth Accordion Transition */}
                  <div 
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                      isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="bg-slate-50/80 p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-2.5">
                          <h5 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                            <span>{ent.name} এর ইনভয়েস বিবরণ ({ent.sales.length} টি)</span>
                          </h5>
                          {ent.sales.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-medium">স্ক্রোল করুন ↕</span>
                          )}
                        </div>

                        {/* Scrollable Container with Max Height */}
                        <div className="max-h-[360px] sm:max-h-[420px] overflow-y-auto pr-1 space-y-2.5 overscroll-contain [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
                          {/* Desktop Table */}
                          <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-xs bg-white rounded-xl border border-slate-200 shadow-2xs">
                          <thead>
                            <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold">
                              <th className="p-3">ইনভয়েস</th>
                              <th className="p-3">তারিখ ও সময়</th>
                              <th className="p-3 text-center">আইটেম</th>
                              <th className="p-3 text-right">মোট বিল</th>
                              <th className="p-3 text-right">পরিশোধ</th>
                              <th className="p-3 text-right">বকেয়া</th>
                              <th className="p-3">ওয়াদার তারিখ</th>
                              <th className="p-3 text-right">অ্যাকশন</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {ent.sales.map(s => {
                              const sDue = Math.max(0, s.totalAmount - s.paidAmount);
                              const pInfo = formatPromiseDate(s.promiseDate);
                              return (
                                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="p-3 font-mono font-bold text-primary">{s.invoiceId}</td>
                                  <td className="p-3 text-slate-600">
                                    {new Date(s.updatedAt || s.createdAt).toLocaleDateString('bn-BD')} {new Date(s.updatedAt || s.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                  </td>
                                  <td className="p-3 text-center font-semibold text-slate-700">
                                    {s.items.reduce((acc, it) => acc + it.quantity, 0)} টি
                                  </td>
                                  <td className="p-3 text-right font-bold text-slate-800">{s.totalAmount.toFixed(2)} ৳</td>
                                  <td className="p-3 text-right font-bold text-emerald-700">{s.paidAmount.toFixed(2)} ৳</td>
                                  <td className="p-3 text-right font-bold text-red-600">{sDue > 0 ? `${sDue.toFixed(2)} ৳` : '০.০০ ৳'}</td>
                                  <td className="p-3">
                                    {pInfo ? (
                                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${pInfo.badgeClass}`}>
                                        {pInfo.formatted} ({pInfo.label})
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 text-[11px]">-</span>
                                    )}
                                  </td>
                                  <td className="p-3 text-right">
                                    <button
                                      onClick={() => setSelectedSale(s)}
                                      className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-bold text-[11px] transition-colors"
                                    >
                                      বিস্তারিত
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards View */}
                      <div className="md:hidden flex flex-col gap-2.5">
                        {ent.sales.map(s => {
                          const sDue = Math.max(0, s.totalAmount - s.paidAmount);
                          const pInfo = formatPromiseDate(s.promiseDate);
                          const sItems = s.items.reduce((acc, it) => acc + it.quantity, 0);
                          const sPaid = s.status === 'Paid' || s.paidAmount >= s.totalAmount;
                          const sPending = s.status === 'Pending' || s.paidAmount === 0;

                          return (
                            <div
                              key={s.id}
                              onClick={() => setSelectedSale(s)}
                              className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs hover:border-slate-300 active:bg-slate-50 transition-all cursor-pointer flex flex-col gap-2"
                            >
                              {/* Row 1: Invoice ID + Date + Status */}
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-primary">{s.invoiceId}</span>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-slate-400 font-mono text-[11px]">
                                    {new Date(s.updatedAt || s.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                    sPaid 
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                      : sPending 
                                      ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                      : 'bg-blue-50 text-blue-700 border-blue-200'
                                  }`}>
                                    {sPaid ? 'পরিশোধিত' : sPending ? 'বকেয়া' : 'আংশিক'}
                                  </span>
                                  <span className="text-primary text-xs font-bold">›</span>
                                </div>
                              </div>

                              {/* Row 2: Financials & Meta */}
                              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-slate-800 text-sm">
                                    {s.totalAmount.toFixed(2)} ৳
                                  </span>
                                  {sDue > 0 ? (
                                    <span className="text-red-600 font-bold text-[11px] bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                                      বকেয়া: {sDue.toFixed(2)} ৳
                                    </span>
                                  ) : (
                                    <span className="text-emerald-700 text-[11px] font-medium">
                                      পরিশোধ: {s.paidAmount.toFixed(2)} ৳
                                    </span>
                                  )}
                                </div>

                                <div>
                                  {pInfo && sDue > 0 ? (
                                    <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border font-semibold ${pInfo.badgeClass}`}>
                                      <Calendar className="w-2.5 h-2.5" />
                                      <span>ওয়াদা: {pInfo.formatted}</span>
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-[11px]">
                                      {sItems} টি আইটেম
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
