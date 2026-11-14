"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search, ShoppingBag, Package, Heart, Star, LayoutGrid, List,
  SlidersHorizontal, X, ChevronRight, ShoppingCart, Eye, Filter, ArrowLeft, CheckCircle, Copy, Building2, UserCheck, KeyRound, ShieldCheck, Truck, Smartphone, QrCode
} from "lucide-react";
import Link from "next/link";
import GeoAddressSelector, { GeoAddressData } from "@/components/common/GeoAddressSelector";

import { TrackOrderModal } from "@/components/shared/TrackOrderModal";
import DynamicPaymentSelector, {
  getPaymentMethodUniqueKey,
  resolveSelectedPaymentMethod,
} from "@/components/shared/DynamicPaymentSelector";

type Product = {
  id: string; name: string; category: string; price: number;
  stock: number; unit: string; rating?: number; reviews?: number;
  imageUrl?: string | null; barcode?: string | null; className?: string | null; subject?: string | null; description?: string | null;
  weight?: number | null; createdAt?: string;
};

const bnToEnDigits = (str: string) => {
  const map: Record<string, string> = {
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
    "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
  };
  return str.replace(/[০-৯]/g, (m) => map[m] || m);
};

function getCleanProductCode(product?: { barcode?: string | null } | null): string {
  if (!product?.barcode) return "";
  const trimmed = String(product.barcode).trim();
  return trimmed.startsWith("__NO_BARCODE_") ? "" : trimmed;
}

function compareProductsByCode(a: Product, b: Product): number {
  const codeA = bnToEnDigits(getCleanProductCode(a));
  const codeB = bnToEnDigits(getCleanProductCode(b));

  const hasA = codeA.length > 0;
  const hasB = codeB.length > 0;

  if (hasA && !hasB) return -1;
  if (!hasA && hasB) return 1;

  if (hasA && hasB) {
    const cmp = codeA.localeCompare(codeB, undefined, {
      numeric: true,
      sensitivity: "base",
    });
    if (cmp !== 0) return cmp;
  }

  const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  return timeA - timeB;
}

function ProductImage({
  src,
  alt,
  imgClassName = "w-full h-full object-cover",
  iconClassName = "w-5 h-5 text-slate-300",
}: {
  src?: string | null;
  alt: string;
  imgClassName?: string;
  iconClassName?: string;
}) {
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    setImgErr(false);
  }, [src]);

  if (src && !imgErr) {
    return (
      <img
        src={src}
        alt={alt}
        className={imgClassName}
        onError={() => setImgErr(true)}
      />
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-50">
      <Package className={iconClassName} />
    </div>
  );
}

function isQuestionProduct(item: { name?: string; category?: string }): boolean {
  const cat = (item.category || "").trim().toLowerCase();
  const name = (item.name || "").trim().toLowerCase();
  return cat.includes("প্রশ্ন") || name.includes("প্রশ্ন") || cat.includes("question") || name.includes("question");
}

const STAR_RATINGS: Record<string, { rating: number; reviews: number }> = {};

function StarDisplay({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
      ))}
      <span className="text-xs text-slate-400 ml-1">({reviews})</span>
    </div>
  );
}

function ListProductRow({
  product, index, cartQty, updateCartQty, setDetailProduct
}: {
  product: Product, index: number, cartQty: number,
  updateCartQty: (p: Product, q: number) => void, setDetailProduct: (p: Product) => void
}) {
  const productCode = getCleanProductCode(product);

  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors bg-white/70">
      <td className="p-2 hidden sm:table-cell">
        <div
          onClick={() => setDetailProduct(product)}
          className="w-11 h-11 bg-white rounded-lg flex items-center justify-center flex-shrink-0 mx-auto overflow-hidden shadow-2xs border border-slate-200 relative cursor-pointer hover:border-primary/40 transition-colors"
        >
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            imgClassName="w-full h-full object-cover"
            iconClassName="w-5 h-5 text-slate-300"
          />
        </div>
      </td>
      <td className="p-2 text-center hidden sm:table-cell">
        {productCode ? (
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-black font-mono">
            {productCode}
          </span>
        ) : (
          <span className="text-xs text-slate-300 font-bold">—</span>
        )}
      </td>
      <td className="p-2 sm:p-2.5">
        <div className="flex items-center gap-2.5">
          {/* Mobile thumbnail */}
          <div
            onClick={() => setDetailProduct(product)}
            className="w-10 h-10 bg-white rounded-lg flex sm:hidden items-center justify-center flex-shrink-0 overflow-hidden border border-slate-200 cursor-pointer"
          >
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              imgClassName="w-full h-full object-cover"
              iconClassName="w-4 h-4 text-slate-300"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3
              className="font-bold text-slate-800 text-xs sm:text-sm cursor-pointer hover:text-primary transition-colors line-clamp-2"
              onClick={() => setDetailProduct(product)}
            >
              {product.name}
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500 mt-0.5">
              {productCode && (
                <span className="sm:hidden font-mono font-medium">
                  আইডি: {productCode}
                </span>
              )}
              {productCode && product.className && (
                <span className="sm:hidden text-slate-300">•</span>
              )}
              {product.className && (
                <span className="font-medium truncate">
                  {product.className}{product.subject ? ` - ${product.subject}` : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="p-2 text-center text-xs font-bold text-slate-600 hidden sm:table-cell">
        <div className="flex flex-wrap items-center justify-center gap-1">
          {(product.category || '').split(',').map(c => c.trim()).filter(Boolean).map(c => (
            <span key={c} className="bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">{c}</span>
          ))}
        </div>
      </td>
      <td className="p-2 sm:p-2.5 text-center font-bold text-xs sm:text-sm text-slate-800">{product.price.toFixed(2)}</td>
      <td className="p-2 sm:p-2.5">
        <div className="flex items-center justify-center gap-1 mx-auto w-fit">
          <button onClick={() => updateCartQty(product, Math.max(0, cartQty - 1))} className="w-6 h-6 sm:w-7 sm:h-7 bg-slate-400 text-white flex items-center justify-center rounded-sm font-bold text-base sm:text-lg leading-none active:scale-95 transition-transform">-</button>
          <input
            type="number"
            value={cartQty || ""}
            onChange={(e) => updateCartQty(product, parseInt(e.target.value) || 0)}
            onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault(); }}
            className="w-9 sm:w-14 h-6 sm:h-7 text-center text-xs sm:text-sm font-bold border border-slate-300 rounded-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button onClick={() => updateCartQty(product, cartQty + 1)} className="w-6 h-6 sm:w-7 sm:h-7 bg-[#2f8c5b] hover:bg-[#2f8c5b]/90 text-white flex items-center justify-center rounded-sm font-bold text-base sm:text-lg leading-none active:scale-95 transition-transform">+</button>
        </div>
      </td>
      <td className="p-2 sm:p-2.5 text-right pr-3 sm:pr-6 font-bold text-xs sm:text-sm text-slate-800">{(product.price * cartQty).toFixed(2)}</td>
    </tr>
  );
}

function ProductDetailModal({
  product, onClose, onAddToCart, isFav, onToggleFav, cartQty, onUpdateQty
}: {
  product: Product; onClose: () => void;
  onAddToCart: (p: Product) => void;
  isFav: boolean; onToggleFav: () => void;
  cartQty: number;
  onUpdateQty: (qty: number) => void;
}) {
  const productCode = getCleanProductCode(product);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-slate-100" 
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Fixed Close Button at Top-Right (Remains visible even when scrolling body) */}
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 z-30 bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 p-2 rounded-full shadow-md border border-slate-200/80 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
          title="বন্ধ করুন"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Scrollable Body (Image + Info + Details/Syllabus) */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 h-56 sm:h-64 flex items-center justify-center overflow-hidden relative border-b border-slate-100">
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              imgClassName="w-full h-full object-contain p-4"
              iconClassName="w-20 h-20 text-slate-300"
            />
          </div>

          <div className="p-5 sm:p-6 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {(product.category || '').split(',').map(c => c.trim()).filter(Boolean).map(c => (
                <span key={c} className="text-xs font-bold text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 px-3 py-1 rounded-full">{c}</span>
              ))}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">{product.name}</h2>
            <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm text-slate-500 font-medium">
              {productCode && (
                <span className="font-mono text-slate-600">
                  আইডি: {productCode}
                </span>
              )}
              {productCode && product.className && <span className="text-slate-300">•</span>}
              {product.className && (
                <span className="text-slate-500">
                  {product.className}{product.subject ? ` — ${product.subject}` : ''}
                </span>
              )}
            </div>

            {product.description && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">বিবরণ / সূচিপত্র:</h4>
                <div className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                  {product.description}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer: Price & Quantity Stepper / Add to Cart Button */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200/80 shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono">৳{product.price}</span>
              <span className="text-slate-500 text-xs sm:text-sm ml-2">প্রতি {product.unit || 'টি'}</span>
            </div>
            {cartQty > 0 && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                কার্ট মোট: ৳{(product.price * cartQty).toFixed(2)}
              </span>
            )}
          </div>

          {cartQty > 0 ? (
            <div className="flex items-center gap-3 bg-emerald-50/90 rounded-2xl p-1.5 border border-emerald-300">
              <button
                type="button"
                onClick={() => onUpdateQty(cartQty - 1)}
                className="w-11 h-11 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-800 font-black text-2xl rounded-xl flex items-center justify-center border border-emerald-200 shadow-2xs active:scale-90 transition-all cursor-pointer"
                title="পরিমাণ কমান"
              >
                −
              </button>
              <div className="flex-1 flex flex-col items-center justify-center">
                <span className="text-[10.5px] font-bold text-emerald-800 uppercase tracking-wider">কার্টে পরিমাণ</span>
                <span className="text-xl font-black text-emerald-950 font-mono leading-tight">
                  {cartQty} <span className="text-xs font-bold text-slate-600 font-sans">{product.unit || 'টি'}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateQty(cartQty + 1)}
                className="w-11 h-11 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-2xl rounded-xl flex items-center justify-center shadow-md shadow-emerald-700/25 active:scale-90 transition-all cursor-pointer"
                title="পরিমাণ বাড়ান"
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm sm:text-base shadow-md shadow-emerald-700/25 transition-all active:scale-[0.98] cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>কার্টে যোগ করুন</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DeliveryPolicyAlertModal({
  isOpen,
  onClose,
  onProceedToOrder,
  mode = "first_visit",
  cartTotal = 0
}: {
  isOpen: boolean;
  onClose: () => void;
  onProceedToOrder?: () => void;
  mode?: "first_visit" | "before_order" | "manual";
  cartTotal?: number;
}) {
  if (!isOpen) return null;

  const isBeforeOrder = mode === "before_order";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div 
        className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-auto z-10 overflow-hidden flex flex-col border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#052e23] via-emerald-800 to-[#0a4233] text-white relative flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 shadow-sm">
                <Truck className="w-5 h-5 text-amber-300" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 block w-fit mb-0.5">
                  {isBeforeOrder ? "অর্ডার সতর্কতা ও কুরিয়ার তথ্য" : "গুরুত্বপূর্ণ ডেলিভারি বিজ্ঞপ্তি"}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white leading-tight truncate">
                  এজেন্ট ও কেন্দ্রের ডেলিভারি নীতিমালা
                </h3>
              </div>
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 flex-shrink-0"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-700 max-h-[75vh] overflow-y-auto">
          {/* Delivery Policy Breakdown */}
          <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
              <span>📋 উপলব্ধ ডেলিভারি মাধ্যমসমূহ:</span>
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs">
                <span className="text-base leading-none">🚚</span>
                <div>
                  <strong className="text-slate-900">পাঠাও কুরিয়ার:</strong> দ্রুততম সময়ে হোম বা পয়েন্ট ডেলিভারি (চার্জ কুরিয়ার বাহককে পরিশোধযোগ্য)।
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs">
                <span className="text-base leading-none">📦</span>
                <div>
                  <strong className="text-slate-900">স্টিডফাস্ট কুরিয়ার:</strong> নির্ভরযোগ্য পার্সেল সার্ভিস (চার্জ কুরিয়ার বাহককে পরিশোধযোগ্য)।
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 shadow-2xs">
                <span className="text-base leading-none">🏢</span>
                <div>
                  <strong className="text-emerald-900">বোর্ড কার্যালয় থেকে সংগ্রহ (নিজে):</strong> বোর্ড প্রকাশনা সেলস কাউন্টার থেকে সরাসরি বই সংগ্রহ (চার্জ নেই)।
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs">
                <span className="text-base leading-none">🚛</span>
                <div>
                  <strong className="text-slate-900">অন্যান্য কুরিয়ার ও ট্রান্সপোর্ট:</strong> সুন্দরবন, এস এ পরিবহন বা বাস/ট্রান্সপোর্টের মাধ্যমে ডেলিভারি সুবিধা রয়েছে।
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-end gap-2.5">
          {isBeforeOrder ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold transition-all"
              >
                আরও পণ্য যোগ করুন
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onProceedToOrder) onProceedToOrder();
                }}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-black shadow-md hover:scale-102 active:scale-98 transition-all flex items-center gap-1.5"
              >
                <span>অর্ডার ফরম খুলুন</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-black shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>বুঝেছি, কেনাকাটা করুন</span>
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderFormModal({ onClose, initialState, total, cart, onSuccess }: { onClose: (state?: any) => void; initialState?: any; total: number; cart: any[]; onSuccess: (data: any) => void }) {
  // Delivery Options State
  const [deliveryOptions, setDeliveryOptions] = useState<any[]>([]);
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<string>("pathao");
  const [courierOrTransportName, setCourierOrTransportName] = useState<string>("");

  // Payment States (Strictly dynamic methods & money receipt, NO pay later)
  const [paymentOption, setPaymentOption] = useState<"pay_now" | "money_receipt">("pay_now");
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentTab, setSelectedPaymentTab] = useState<"mobile" | "bank">("mobile");
  const [selectedMethodId, setSelectedMethodId] = useState<string>("");
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [receiptVerifyStatus, setReceiptVerifyStatus] = useState<'idle' | 'verifying' | 'valid' | 'invalid'>('idle');
  const [receiptVerifyMsg, setReceiptVerifyMsg] = useState("");
  const [receiptBalance, setReceiptBalance] = useState(0);
  const [remainingSenderNumber, setRemainingSenderNumber] = useState("");
  const [remainingTrxId, setRemainingTrxId] = useState("");

  useEffect(() => {
    fetch(`/api/settings?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.payments)) {
          const active = data.payments.filter((p: any) => p.isActive !== false);
          setPaymentMethods(active);
          if (active.length > 0) {
            const firstMob = active.find((p: any) => p.type === "mobile" || p.type === "MOBILE_BANKING") || active[0];
            setSelectedMethodId(getPaymentMethodUniqueKey(firstMob));
          }
        }
      })
      .catch(() => {});

    fetch(`/api/delivery-options?category=book&t=${Date.now()}`, { cache: "no-store" })
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

  const fallbackDeliveryOptions = useMemo(
    () => [
      { type: "pathao", name: "পাঠাও", charge: 0, requiresName: false },
      { type: "steadfast", name: "স্টিডফাস্ট", charge: 0, requiresName: false },
      { type: "self", name: "নিজে", charge: 0, requiresName: false },
      { type: "other_courier", name: "অন্যান্য কুরিয়ার", charge: 20, requiresName: true },
      { type: "transport", name: "ট্রান্সপোর্ট", charge: 10, requiresName: true },
    ],
    []
  );

  const visibleDeliveryOptions = useMemo(() => {
    const active = deliveryOptions.filter((d) => d.isActive !== false);
    return active.length > 0 ? active : fallbackDeliveryOptions;
  }, [deliveryOptions, fallbackDeliveryOptions]);

  const selectedDeliveryOption = useMemo(() => {
    return (
      visibleDeliveryOptions.find((d) => d.type === selectedDeliveryType) ||
      visibleDeliveryOptions[0] || {
        name: "পাঠাও",
        type: "pathao",
        charge: 0,
        requiresName: false,
      }
    );
  }, [visibleDeliveryOptions, selectedDeliveryType]);

  const deliveryCharge = Number(selectedDeliveryOption.charge) || 0;
  const grandTotal = total + deliveryCharge;

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
    return resolveSelectedPaymentMethod(
      selectedMethodId,
      selectedPaymentTab,
      activeMethods,
      mobileMethods,
      bankMethods
    );
  }, [selectedMethodId, selectedPaymentTab, activeMethods, mobileMethods, bankMethods]);

  const [ilhak, setIlhak] = useState(initialState?.ilhak || "");
  const [ownerName, setOwnerName] = useState(initialState?.ownerName || "");
  const [instituteName, setInstituteName] = useState(initialState?.instituteName || "");
  const [contactNo, setContactNo] = useState(initialState?.contactNo || "");
  const [customerEmail, setCustomerEmail] = useState(initialState?.customerEmail || "");
  const [customerPassword, setCustomerPassword] = useState(initialState?.customerPassword || "");
  const [address, setAddress] = useState(initialState?.address || "");
  const [geoAddress, setGeoAddress] = useState<GeoAddressData>(initialState?.geoAddress || {
    division: "",
    district: "",
    upazila: "",
    union: "",
    village: "",
    fullAddress: initialState?.address || ""
  });
  const [hasSeparateDelivery, setHasSeparateDelivery] = useState<boolean>(initialState?.hasSeparateDelivery || false);
  const [deliveryAddress, setDeliveryAddress] = useState<GeoAddressData>(initialState?.deliveryAddress || {
    division: "",
    district: "",
    upazila: "",
    union: "",
    village: "",
    fullAddress: ""
  });
  const [missingFieldsNotice, setMissingFieldsNotice] = useState<string>("");
  const [autoFilledFields, setAutoFilledFields] = useState<{
    ownerName?: boolean;
    instituteName?: boolean;
    contactNo?: boolean;
    customerEmail?: boolean;
    address?: boolean;
  }>(initialState?.autoFilledFields || {});

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchStatus, setSearchStatus] = useState<"idle" | "found" | "not_found" | "error">(initialState?.searchStatus || "idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [paymentStep, setPaymentStep] = useState(initialState?.paymentStep || false);
  const modalBodyRef = useRef<HTMLDivElement>(null);

  const verifyReceipt = async () => {
    if (!receiptNumber.trim()) return;
    setReceiptVerifyStatus('verifying');
    setReceiptVerifyMsg('');
    try {
      const params = new URLSearchParams({ number: receiptNumber.trim() });
      if (contactNo.trim()) params.append('phone', contactNo.trim());
      const res = await fetch(`/api/store/receipts/verify?${params}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setReceiptVerifyStatus('valid');
        setReceiptBalance(data.availableBalance);
        setReceiptVerifyMsg(`✓ রিসিট সত্যায়িত! উপলব্ধ ব্যালান্স: ৳${data.availableBalance.toFixed(2)}`);
      } else {
        setReceiptVerifyStatus('invalid');
        setReceiptVerifyMsg(data.error || 'রিসিট যাচাই ব্যর্থ হয়েছে');
      }
    } catch (e) {
      setReceiptVerifyStatus('invalid');
      setReceiptVerifyMsg('সার্ভার ত্রুটি। আবার চেষ্টা করুন।');
    }
  };

  const searchIlhak = async () => {
    if (!ilhak.trim()) return;
    setIsLoading(true);
    setSearchStatus("idle");
    setMissingFieldsNotice("");
    setAutoFilledFields({});
    try {
      const res = await fetch(`/api/madrasa/by-code?code=${encodeURIComponent(ilhak)}`);
      if (res.ok) {
        const data = await res.json();
        const autoFilled: {
          ownerName?: boolean;
          instituteName?: boolean;
          contactNo?: boolean;
          customerEmail?: boolean;
          address?: boolean;
        } = {};

        if (data.name?.trim()) {
          setInstituteName(data.name.trim());
          autoFilled.instituteName = true;
        }
        if (data.ownerName?.trim()) {
          setOwnerName(data.ownerName.trim());
          autoFilled.ownerName = true;
        }
        if (data.contactNo?.trim()) {
          setContactNo(data.contactNo.trim());
          autoFilled.contactNo = true;
        }
        if (data.email?.trim()) {
          setCustomerEmail(data.email.trim());
          autoFilled.customerEmail = true;
        }

        const rawAddr = data.address || "";
        const populatedGeo: GeoAddressData = {
          division: data.division || "",
          district: data.district || "",
          upazila: data.upazila || "",
          union: data.union || "",
          village: data.village || rawAddr,
          fullAddress: rawAddr
        };
        setGeoAddress(populatedGeo);
        setAddress(rawAddr);

        setAutoFilledFields(autoFilled);
        setSearchStatus("found");

        // Check for missing data fields
        const missing: string[] = [];
        if (!data.name?.trim()) missing.push("মাদরাসার নাম");
        if (!data.ownerName?.trim()) missing.push("মুহতামিম/আবেদনকারী");
        if (!data.contactNo?.trim()) missing.push("মোবাইল নম্বর");
        if (!data.division?.trim()) missing.push("বিভাগ");
        if (!data.district?.trim()) missing.push("জেলা");
        if (!data.upazila?.trim()) missing.push("উপজেলা");
        if (!data.village?.trim() && !rawAddr.trim()) missing.push("গ্রাম/যাতায়াত ঠিকানা");

        if (missing.length > 0) {
          setMissingFieldsNotice(`পূর্বের তথ্য পাওয়া গেছে, তবে (${missing.join(", ")}) অনুপস্থিত। অনুগ্রহ করে বাকি তথ্য পূরণ করুন।`);
        }
      } else if (res.status === 404) {
        setSearchStatus("not_found");
        setAutoFilledFields({});
      } else {
        setSearchStatus("error");
        setAutoFilledFields({});
      }
    } catch (e) {
      setSearchStatus("error");
      setAutoFilledFields({});
    } finally {
      setIsLoading(false);
    }
  };

  const validateAndProceed = () => {
    setErrorMsg("");

    const mainParts = [
      geoAddress.village,
      geoAddress.union,
      geoAddress.upazila,
      geoAddress.district,
      geoAddress.division,
    ].filter(Boolean);
    const calculatedMain = mainParts.join(", ");
    const effectiveMainAddress = geoAddress.fullAddress?.trim() || calculatedMain || address.trim();

    const delParts = [
      deliveryAddress.village,
      deliveryAddress.union,
      deliveryAddress.upazila,
      deliveryAddress.district,
      deliveryAddress.division,
    ].filter(Boolean);
    const calculatedDel = delParts.join(", ");
    const effectiveDeliveryAddress = deliveryAddress.fullAddress?.trim() || calculatedDel;

    if (!ownerName.trim()) {
      setErrorMsg("অনুগ্রহ করে মুহতামিম / আবেদনকারীর নাম লিখুন।");
      modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!instituteName.trim()) {
      setErrorMsg("অনুগ্রহ করে মাদরাসা বা প্রতিষ্ঠানের নাম লিখুন।");
      modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!contactNo.trim()) {
      setErrorMsg("অনুগ্রহ করে যোগাযোগ নম্বর (মোবাইল) লিখুন।");
      modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!effectiveMainAddress && !effectiveDeliveryAddress) {
      setErrorMsg("অনুগ্রহ করে মাদরাসা বা ডেলিভারির সম্পূর্ণ ঠিকানা প্রদান করুন।");
      modalBodyRef.current?.scrollTo({ top: 150, behavior: 'smooth' });
      return;
    }
    if (hasSeparateDelivery && !effectiveDeliveryAddress) {
      setErrorMsg("অনুগ্রহ করে ডেলিভারি ঠিকানা (জেলা, উপজেলা বা কুরিয়ার পয়েন্ট) পূরণ করুন।");
      return;
    }
    if (selectedDeliveryOption?.requiresName && !courierOrTransportName.trim()) {
      setErrorMsg(`অনুগ্রহ করে ${selectedDeliveryOption.name}-এর নাম উল্লেখ করুন`);
      modalBodyRef.current?.scrollTo({ top: 400, behavior: 'smooth' });
      return;
    }

    setPaymentStep(true);
    modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitOrder = async () => {
    setIsSubmitting(true);
    setErrorMsg("");
    const isPartialReceipt = paymentOption === 'money_receipt' && receiptVerifyStatus === 'valid' && receiptBalance < grandTotal;
    try {
      if (selectedDeliveryOption?.requiresName && !courierOrTransportName.trim()) {
        throw new Error(`অনুগ্রহ করে ${selectedDeliveryOption.name}-এর নাম উল্লেখ করুন`);
      }
      if (paymentOption === 'pay_now') {
        if (!senderNumber.trim()) throw new Error("যে নম্বর বা অ্যাকাউন্ট থেকে টাকা পাঠিয়েছেন তা লিখুন");
        if (!trxId.trim()) throw new Error("ট্রানজেকশন আইডি (TrxID) প্রদান করুন");
      }
      if (paymentOption === 'money_receipt') {
        if (!receiptNumber.trim()) throw new Error("মানি রিসিট নম্বর প্রদান করুন");
        if (receiptVerifyStatus !== 'valid') throw new Error("অর্ডার দেওয়ার আগে মানি রিসিট যাচাই করুন");
        if (isPartialReceipt) {
          if (!remainingSenderNumber.trim()) throw new Error("বাকি টাকার প্রেরক নম্বর বা অ্যাকাউন্ট লিখুন");
          if (!remainingTrxId.trim()) throw new Error("বাকি টাকার জন্য TrxID প্রদান করুন");
        }
      }

      const isMobileIlhak = ilhak.trim().length === 11 && ilhak.trim().startsWith("01");

      const effectiveAddress = geoAddress.fullAddress || address;
      if (ilhak.trim() && searchStatus !== "found" && !isMobileIlhak) {
        await fetch("/api/madrasa/ilhak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: ilhak,
            name: instituteName,
            ownerName,
            contactNo,
            address: effectiveAddress,
            division: geoAddress.division,
            district: geoAddress.district,
            upazila: geoAddress.upazila,
            union: geoAddress.union,
            village: geoAddress.village,
          }),
        });
      }

      const ilhakText = (ilhak.trim() && !isMobileIlhak) ? ` (ইলহাক: ${ilhak.trim()})` : '';
      const deliveryNote = hasSeparateDelivery && deliveryAddress.fullAddress ? ` | ডেলিভারি ঠিকানা: ${deliveryAddress.fullAddress}` : '';
      const courierNote = selectedDeliveryOption?.requiresName && courierOrTransportName.trim()
        ? ` | [${selectedDeliveryOption.name}: ${courierOrTransportName.trim()}]`
        : ` | [ডেলিভারি মাধ্যম: ${selectedDeliveryOption?.name || selectedDeliveryType}]`;

      const items = cart.map(c => ({ productId: c.product.id, quantity: c.qty }));
      const effectiveSenderNumber = paymentOption === "pay_now" ? senderNumber.trim() : (isPartialReceipt ? remainingSenderNumber.trim() : undefined);
      const effectiveTrxId = paymentOption === "pay_now" ? trxId.trim() : (isPartialReceipt ? remainingTrxId.trim() : undefined);
      const effectiveMethodName = selectedMethod?.name || selectedMethod?.provider || "Direct Payment";

      const res = await fetch("/api/store/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: ownerName,
          customerPhone: contactNo,
          customerEmail: customerEmail.trim() || undefined,
          password: customerPassword.trim() || undefined,
          instituteId: instituteName,
          items,
          notes: `${effectiveAddress}${deliveryNote}${ilhakText}${courierNote}`,
          paymentOption,
          paymentProvider: effectiveMethodName,
          paymentMethod: effectiveMethodName,
          remainingProvider: isPartialReceipt ? effectiveMethodName : undefined,
          remainingTrxId: isPartialReceipt ? remainingTrxId.trim() : undefined,
          senderNumber: effectiveSenderNumber,
          trxId: effectiveTrxId,
          receiptNumber: paymentOption === "money_receipt" ? receiptNumber.trim() : undefined,
          deliveryOptionType: selectedDeliveryType,
          courierOrTransportName: selectedDeliveryOption?.requiresName ? courierOrTransportName.trim() : undefined,
          deliveryCharge: deliveryCharge,
          totalAmount: grandTotal,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit order");

      onSuccess(data);
      onClose();
    } catch (e: any) {
      setErrorMsg("অর্ডার করতে সমস্যা হয়েছে। " + (e.message || ""));
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg sm:max-w-xl overflow-hidden relative animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col max-h-[92vh]">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
          <div>
            <h2 className="font-bold text-slate-800 text-lg">
              {paymentStep ? "কিভাবে পেমেন্ট করতে চান?" : "অর্ডার নিশ্চিত করুন"}
            </h2>
            <p className="text-xs text-slate-500">
              {paymentStep
                ? "মোবাইল ব্যাংকিং, ব্যাংক অ্যাকাউন্ট অথবা মানি রিসিটের মাধ্যমে পেমেন্ট সম্পন্ন করুন"
                : "মাদরাসা ও ডেলিভারির সঠিক তথ্য প্রদান করুন"}
            </p>
          </div>
          <button onClick={() => onClose({ ilhak, ownerName, instituteName, contactNo, customerEmail, customerPassword, address: geoAddress.fullAddress || address, geoAddress, hasSeparateDelivery, deliveryAddress, searchStatus, paymentStep, autoFilledFields })} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div ref={modalBodyRef} className="p-6 overflow-y-auto flex-1">
          {!paymentStep ? (
            <>
              {errorMsg && <p className="mb-4 text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100 font-bold">{errorMsg}</p>}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">ইলহাক বা মোবাইল নম্বর (পুরাতন তথ্যের জন্য)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ilhak}
                      onChange={(e) => {
                        setIlhak(e.target.value);
                        if (searchStatus !== "idle") {
                          setSearchStatus("idle");
                          setAutoFilledFields({});
                        }
                        if (missingFieldsNotice) setMissingFieldsNotice("");
                      }}
                      placeholder="যেমন: 1234 বা 01XXXXXXXXX"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white text-sm"
                    />
                    <button
                      onClick={searchIlhak}
                      disabled={isLoading || !ilhak.trim()}
                      className="px-4 py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50 flex-shrink-0 text-sm"
                    >
                      {isLoading ? "খুঁজছি..." : "খুঁজুন"}
                    </button>
                  </div>
                  {searchStatus === "found" && (
                    <div className="space-y-1 mt-1.5">
                      <p className="text-xs text-emerald-600 font-medium">✓ {ilhak.trim().length === 11 && ilhak.trim().startsWith("01") ? "মোবাইল নম্বর" : "ইলহাক"} অনুযায়ী পূর্বের তথ্য অটো-ফিল ও সুরক্ষিত (লক) করা হয়েছে!</p>
                      {missingFieldsNotice && (
                        <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium">
                          ⚠️ {missingFieldsNotice}
                        </p>
                      )}
                    </div>
                  )}
                  {searchStatus === "not_found" && <p className="text-xs text-amber-600 mt-1.5 font-medium">⚠ {ilhak.trim().length === 11 && ilhak.trim().startsWith("01") ? "মোবাইল নম্বর" : "ইলহাক"} পাওয়া যায়নি। নতুন তথ্য পূরণ করুন।</p>}
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-slate-700">মুহতামিম / আবেদনকারীর নাম <span className="text-red-500">*</span></label>
                      {autoFilledFields.ownerName && <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">নিবন্ধিত (লক)</span>}
                    </div>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      readOnly={!!autoFilledFields.ownerName}
                      disabled={!!autoFilledFields.ownerName}
                      placeholder="যেমন: মাওলানা মো: আবদুল্লাহ"
                      className={`w-full px-3 py-2 rounded-xl border transition-all text-sm ${
                        autoFilledFields.ownerName
                          ? 'bg-slate-100/90 text-slate-700 border-slate-200 cursor-not-allowed select-none font-medium'
                          : 'bg-slate-50 focus:bg-white border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        মাদরাসা বা প্রতিষ্ঠানের নাম <span className="text-red-500">*</span>
                      </label>
                      {autoFilledFields.instituteName && <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">নিবন্ধিত (লক)</span>}
                    </div>
                    <input
                      type="text"
                      value={instituteName}
                      onChange={(e) => setInstituteName(e.target.value)}
                      readOnly={!!autoFilledFields.instituteName}
                      disabled={!!autoFilledFields.instituteName}
                      placeholder="যেমন: মুহাম্মাদনগর নূরানী ক্যাডেট মাদরাসা"
                      className={`w-full px-3 py-2 rounded-xl border transition-all text-sm font-semibold ${
                        autoFilledFields.instituteName
                          ? 'bg-slate-100/90 text-slate-700 border-slate-200 cursor-not-allowed select-none'
                          : 'bg-slate-50 focus:bg-white border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-slate-700">মোবাইল নম্বর <span className="text-red-500">*</span></label>
                      {autoFilledFields.contactNo && <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">নিবন্ধিত (লক)</span>}
                    </div>
                    <input
                      type="tel"
                      value={contactNo}
                      onChange={(e) => setContactNo(e.target.value)}
                      readOnly={!!autoFilledFields.contactNo}
                      disabled={!!autoFilledFields.contactNo}
                      placeholder="01XXXXXXXXX"
                      className={`w-full px-3 py-2 rounded-xl border transition-all text-sm ${
                        autoFilledFields.contactNo
                          ? 'bg-slate-100/90 text-slate-700 border-slate-200 cursor-not-allowed select-none font-medium'
                          : 'bg-slate-50 focus:bg-white border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-slate-700">ইমেইল <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span></label>
                      {autoFilledFields.customerEmail && <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">নিবন্ধিত (লক)</span>}
                    </div>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      readOnly={!!autoFilledFields.customerEmail}
                      disabled={!!autoFilledFields.customerEmail}
                      placeholder="user@example.com"
                      className={`w-full px-3 py-2 rounded-xl border transition-all text-sm ${
                        autoFilledFields.customerEmail
                          ? 'bg-slate-100/90 text-slate-700 border-slate-200 cursor-not-allowed select-none'
                          : 'bg-slate-50 focus:bg-white border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                      }`}
                    />
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-primary" />
                    <label className="block text-xs font-bold text-slate-700">
                      অ্যাকাউন্ট পাসওয়ার্ড <span className="text-[11px] text-slate-500 font-normal">(ঐচ্ছিক / লগইনের জন্য)</span>
                    </label>
                  </div>
                  <input
                    type="password"
                    value={customerPassword}
                    onChange={(e) => setCustomerPassword(e.target.value)}
                    placeholder="পাসওয়ার্ড দিন (না দিলে স্বয়ংক্রিয় পাসওয়ার্ড তৈরি হবে)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white text-sm"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    💡 এই তথ্য দিয়ে পরবর্তীতে ওয়েবসাইটে লগইন করে আপনার সব অর্ডার ও তথ্য ট্র্যাক করতে পারবেন।
                  </p>
                </div>

                {/* Geo Cascade Address Selector with Separate Delivery Option (Always Editable) */}
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
              </div>

              {/* Delivery Options Selector */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                <label className="block text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  <span>ডেলিভারি মাধ্যম নির্বাচন করুন <span className="text-red-500">*</span></span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {visibleDeliveryOptions.map((d: any) => {
                    const isSelected = selectedDeliveryType === d.type;
                    const isPathaoOrSteadfast = d.type === "pathao" || d.type === "steadfast";
                    const isSelf = d.type === "self";
                    const optCharge = Number(d.charge) || 0;

                    let badgeText = `+৳${optCharge}`;
                    let badgeColor = "text-amber-700 bg-amber-50 border-amber-200";

                    if (isPathaoOrSteadfast) {
                      badgeText = "চার্জ কুরিয়ার বাহককে";
                      badgeColor = "text-emerald-800 bg-emerald-50 border-emerald-200";
                    } else if (isSelf) {
                      badgeText = "চার্জ নাই";
                      badgeColor = "text-blue-800 bg-blue-50 border-blue-200";
                    }

                    return (
                      <button
                        key={d.type}
                        type="button"
                        onClick={() => setSelectedDeliveryType(d.type)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-emerald-700 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-700"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className={`text-xs font-bold ${isSelected ? "text-emerald-800" : "text-slate-800"}`}>
                            {d.name}
                          </span>
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-emerald-700 bg-emerald-700" : "border-slate-300"
                          }`}>
                            {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </span>
                        </div>
                        <span className={`text-[10.5px] font-bold px-1.5 py-0.5 rounded border inline-block ${badgeColor}`}>
                          {badgeText}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedDeliveryOption?.requiresName && (
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5 animate-in fade-in">
                    <div className="flex items-center justify-between gap-2">
                      <label className="block text-xs font-bold text-amber-950">
                        {selectedDeliveryType === "transport"
                          ? "ট্রান্সপোর্টের নাম উল্লেখ করুন"
                          : selectedDeliveryType === "other_courier"
                          ? "কুরিয়ার সার্ভিসের নাম লিখুন"
                          : `${selectedDeliveryOption.name}-এর নাম লিখুন`}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      {deliveryCharge > 0 && (
                        <span className="text-[10.5px] font-black bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-md">
                          বিলের সাথে +৳{deliveryCharge} যোগ হবে
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={courierOrTransportName}
                      onChange={(e) => setCourierOrTransportName(e.target.value)}
                      placeholder={
                        selectedDeliveryType === "transport"
                          ? "যেমন: দিগন্ত পরিবহন / হানিফ ট্রান্সপোর্ট / সোহাগ পরিবহন"
                          : "যেমন: সুন্দরবন কুরিয়ার / এস এ পরিবহন / করতোয়া কুরিয়ার"
                      }
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-semibold focus:outline-emerald-700 placeholder:text-slate-400"
                    />
                    <p className="text-[10px] text-amber-800">
                      📌 আপনার সুবিধাজনক কুরিয়ার সার্ভিস বা ট্রান্সপোর্টের নাম উল্লেখ করুন যাতে সঠিক মাধ্যমে পার্সেল পাঠানো যায়।
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600">
                  <span>পণ্যের মূল্য (সাবটোটাল):</span>
                  <span className="font-semibold text-slate-800">৳{total.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600">
                  <span>
                    ডেলিভারি চার্জ ({selectedDeliveryOption.name}
                    {selectedDeliveryOption.requiresName && courierOrTransportName.trim()
                      ? ` — ${courierOrTransportName.trim()}`
                      : ""}
                    ):
                  </span>
                  <span>
                    {selectedDeliveryOption.type === "pathao" || selectedDeliveryOption.type === "steadfast" ? (
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-200">
                        চার্জ কুরিয়ার বাহককে
                      </span>
                    ) : selectedDeliveryOption.type === "self" ? (
                      <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded text-xs border border-blue-200">
                        চার্জ নাই
                      </span>
                    ) : (
                      <span className="font-bold text-amber-700">+৳{deliveryCharge.toFixed(2)}</span>
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-sm sm:text-base">সর্বমোট প্রদেয় বিল:</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-800">৳{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {errorMsg && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
                  <span className="shrink-0 text-base">⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => onClose({ ilhak, ownerName, instituteName, contactNo, customerEmail, customerPassword, address: geoAddress.fullAddress || address, geoAddress, hasSeparateDelivery, deliveryAddress, searchStatus, paymentStep })}
                  className="w-1/2 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all border border-slate-200"
                >
                  আরও পণ্য যোগ করুন
                </button>
                <button
                  type="button"
                  onClick={validateAndProceed}
                  className="w-1/2 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-700/25 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>পেমেন্ট অপশন</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="animate-in slide-in-from-right-4 space-y-4">
              <div className="text-center bg-emerald-50/70 border border-emerald-200/80 rounded-xl py-2.5 px-3">
                <h3 className="font-black text-emerald-950 text-sm sm:text-base">কিভাবে পেমেন্ট করতে চান?</h3>
                <p className="text-[11px] text-emerald-800">পছন্দের মোবাইল ব্যাংকিং, ব্যাংক অ্যাকাউন্ট অথবা মানি রিসিট নির্বাচন করুন</p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <span className="shrink-0 text-sm">⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-3">
                {/* Option 1: Pay Now */}
                <label className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all ${paymentOption === 'pay_now' ? 'border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700' : 'border-slate-200 hover:border-emerald-700/50'}`}>
                  <input
                    type="radio"
                    name="payment_opt"
                    checked={paymentOption === 'pay_now'}
                    onChange={() => setPaymentOption('pay_now')}
                    className="w-4.5 h-4.5 text-emerald-700 focus:ring-emerald-700"
                  />
                  <span className="font-bold text-slate-800 text-sm">সরাসরি পেমেন্ট (মোবাইল ব্যাংকিং / ব্যাংক)</span>
                </label>

                {paymentOption === 'pay_now' && (
                  <div className="pl-2 sm:pl-4 pr-1 pb-2 animate-in fade-in space-y-3">
                    <DynamicPaymentSelector
                      mobileMethods={mobileMethods}
                      bankMethods={bankMethods}
                      selectedPaymentTab={selectedPaymentTab}
                      onSelectTab={setSelectedPaymentTab}
                      selectedMethod={selectedMethod}
                      onSelectMethodId={setSelectedMethodId}
                      payableLabel="সর্বমোট প্রদেয় বিল:"
                      payableAmount={grandTotal}
                    />

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
                          placeholder="যে নম্বর বা হিসাব থেকে টাকা পাঠিয়েছেন"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-700 text-xs font-semibold"
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
                          placeholder="TrxID / রেফারেন্স নম্বর লিখুন"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-700 text-xs font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Option 2: Money Receipt */}
                <label className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all ${paymentOption === 'money_receipt' ? 'border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700' : 'border-slate-200 hover:border-emerald-700/50'}`}>
                  <input
                    type="radio"
                    name="payment_opt"
                    checked={paymentOption === 'money_receipt'}
                    onChange={() => setPaymentOption('money_receipt')}
                    className="w-4.5 h-4.5 text-emerald-700 focus:ring-emerald-700"
                  />
                  <span className="font-bold text-slate-800 text-sm">মানি রিসিট আছে</span>
                </label>

                {paymentOption === 'money_receipt' && (
                  <div className="pl-2 sm:pl-4 pr-1 pb-2 animate-in fade-in space-y-3">
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
                            if (receiptVerifyStatus !== 'idle') {
                              setReceiptVerifyStatus('idle');
                              setReceiptVerifyMsg('');
                              setReceiptBalance(0);
                            }
                          }}
                          placeholder="Receipt Number"
                          className={`flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:border-emerald-700 text-xs font-semibold transition-all ${
                            receiptVerifyStatus === 'valid' ? 'border-emerald-400 bg-emerald-50' : receiptVerifyStatus === 'invalid' ? 'border-red-400 bg-red-50' : 'border-slate-200'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={verifyReceipt}
                          disabled={receiptVerifyStatus === 'verifying' || !receiptNumber.trim()}
                          className="px-3 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 text-xs shrink-0 cursor-pointer"
                        >
                          {receiptVerifyStatus === 'verifying' ? 'যাচাই...' : 'যাচাই করুন'}
                        </button>
                      </div>
                      {receiptVerifyMsg && (
                        <p className={`text-xs mt-1.5 font-bold ${receiptVerifyStatus === 'valid' ? 'text-emerald-700' : 'text-red-500'}`}>
                          {receiptVerifyMsg}
                        </p>
                      )}
                    </div>

                    {/* Partial Balance Panel — Must Pay Remaining Balance Now */}
                    {receiptVerifyStatus === 'valid' && receiptBalance < grandTotal && (
                      <div className="border border-amber-200 rounded-xl overflow-hidden">
                        <div className="bg-amber-50 p-3 space-y-1.5">
                          <p className="text-xs font-bold text-amber-800">ব্যালান্স বিবরণ:</p>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">মোট বিল:</span>
                            <span className="font-bold text-slate-800">৳{grandTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-emerald-700">রিসিট ব্যালান্স:</span>
                            <span className="font-bold text-emerald-700">-৳{receiptBalance.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs border-t border-amber-200 pt-1.5">
                            <span className="text-red-600 font-bold">বাকি পরিশোধ করতে হবে:</span>
                            <span className="font-black text-red-600">৳{(grandTotal - receiptBalance).toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="bg-white p-3 space-y-3">
                          <p className="text-xs font-bold text-slate-800">
                            বাকি ৳{(grandTotal - receiptBalance).toFixed(2)} পরিশোধের মাধ্যম নির্বাচন করুন:
                          </p>

                          <DynamicPaymentSelector
                            mobileMethods={mobileMethods}
                            bankMethods={bankMethods}
                            selectedPaymentTab={selectedPaymentTab}
                            onSelectTab={setSelectedPaymentTab}
                            selectedMethod={selectedMethod}
                            onSelectMethodId={setSelectedMethodId}
                            payableLabel="বাকি প্রদেয় টাকা:"
                            payableAmount={grandTotal - receiptBalance}
                            compact
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={remainingSenderNumber}
                              onChange={(e) => setRemainingSenderNumber(e.target.value)}
                              placeholder="প্রেরক নম্বর / অ্যাকাউন্ট *"
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-700 text-xs font-semibold"
                            />
                            <input
                              type="text"
                              value={remainingTrxId}
                              onChange={(e) => setRemainingTrxId(e.target.value)}
                              placeholder="বাকি টাকার TrxID *"
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-700 text-xs font-semibold"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => setPaymentOption("pay_now")}
                            className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            মানি রিসিট বাদ দিয়ে সম্পূর্ণ বিল সরাসরি পেমেন্ট করুন
                          </button>
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
                  <span className="text-base font-black text-emerald-900">৳{grandTotal.toFixed(2)}</span>
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
                    onClick={submitOrder}
                    disabled={isSubmitting}
                    className="px-5 py-2 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md active:scale-95 cursor-pointer disabled:opacity-50 transition-all flex items-center gap-1.5"
                  >
                    {isSubmitting ? "অর্ডার নেওয়া হচ্ছে..." : "অর্ডার সম্পূর্ণ করুন"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [successOrder, setSuccessOrder] = useState<any>(null);
  const [orderFormState, setOrderFormState] = useState<any>(null);
  const [customPasswordInput, setCustomPasswordInput] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaveStatus, setPasswordSaveStatus] = useState<string | null>(null);

  const handleSetPassword = async () => {
    if (!customPasswordInput || customPasswordInput.trim().length < 4) {
      setPasswordSaveStatus("error:পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে");
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await fetch("/api/auth/set-order-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: successOrder?.userAccount?.id,
          phone: successOrder?.userAccount?.phone,
          email: successOrder?.userAccount?.email,
          newPassword: customPasswordInput.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");
      setPasswordSaveStatus("success:পাসওয়ার্ড সফলভাবে সংরক্ষিত হয়েছে!");
      setSuccessOrder((prev: any) => ({
        ...prev,
        userAccount: {
          ...prev.userAccount,
          initialPassword: customPasswordInput.trim(),
        }
      }));
    } catch (err: any) {
      setPasswordSaveStatus(`error:${err.message}`);
    } finally {
      setPasswordSaving(false);
    }
  };

  const printInvoice = (orderToPrint = successOrder) => {
    if (!orderToPrint) return;
    const totalPayable = orderToPrint.totalAmount + (orderToPrint.previousDue || 0);
    const paidAmount = orderToPrint.paidAmount || 0;
    const dueAmount = totalPayable - paidAmount;
    const address = orderToPrint.notes?.replace(/\(ইলহাক:.*?\)/g, '').trim() || '';
    const ilhakMatch = orderToPrint.notes?.match(/\(ইলহাক:\s*([^)]+)\)/);
    const ilhak = ilhakMatch ? ilhakMatch[1].trim() : '';
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
      doc.write(`
        <html>
          <head>
            <title>Invoice ${orderToPrint.invoiceId}</title>
            <style>
              body { font-family: sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; color: #1e293b; line-height: 1.5; }
              h1 { color: #16a34a; margin-bottom: 0; }
              .header { border-bottom: 2px solid #16a34a; padding-bottom: 10px; margin-bottom: 20px; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid #16a34a; }
              th { background: #16a34a; color: white; padding: 8px; text-align: left; border: 1px solid #16a34a; }
              td { padding: 8px; border: 1px solid #16a34a; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .info { background: #f8fafc; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
              .totals { width: 300px; margin-left: auto; margin-top: 20px; }
              .totals div { display: flex; justify-content: space-between; padding: 5px 0; }
              .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #16a34a; padding-top: 10px !important; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>নূরানী তালিমুল কুরআন বোর্ড - অনলাইন অর্ডার</h1>
              <p>অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। অনুগ্রহ করে ইনভয়েসটি সংরক্ষণ করুন।</p>
            </div>
            <div class="info">
              <p><strong>ইনভয়েস নং:</strong> ${orderToPrint.invoiceId}</p>
              <p><strong>ক্রেতার নাম:</strong> ${orderToPrint.customerName}</p>
              <p><strong>মোবাইল নাম্বার:</strong> ${orderToPrint.customerPhone || 'N/A'}</p>
              <p><strong>ঠিকানা:</strong> ${orderToPrint.notes?.replace(/\(ইলহাক: 01\d{9}\)/g, '').trim() || 'N/A'}</p>
              <p><strong>তারিখ:</strong> ${new Date(orderToPrint.createdAt).toLocaleDateString('bn-BD')}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th class="text-center" style="width: 45px;">ক্র.নং</th>
                  <th>পণ্যের নাম</th>
                  <th class="text-center" style="width: 75px;">পরিমাণ</th>
                  <th class="text-right" style="width: 95px;">একক মূল্য</th>
                  <th class="text-right" style="width: 105px;">মোট মূল্য</th>
                </tr>
              </thead>
              <tbody>
                ${orderToPrint.items.map((i: any, idx: number) => `
                  <tr>
                    <td class="text-center" style="font-weight: bold; color: #475569;">${String(idx + 1).padStart(2, '0')}</td>
                    <td>${i.product.name}</td>
                    <td class="text-center">${i.quantity}</td>
                    <td class="text-right">${Number(i.unitPrice).toFixed(2)} ৳</td>
                    <td class="text-right">${(i.quantity * i.unitPrice).toFixed(2)} ৳</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="totals">
              <div><span>পণ্যের মোট মূল্য:</span><span>${(orderToPrint.items.reduce((s: number, i: any) => s + (i.quantity * i.unitPrice), 0)).toFixed(2)} ৳</span></div>
              <div>
                <span>কুরিয়ার চার্জ (${orderToPrint.courierName || 'পাঠাও কুরিয়ার'}):</span>
                <span>${(orderToPrint.deliveryCharge !== undefined ? orderToPrint.deliveryCharge : Math.max(0, orderToPrint.totalAmount - orderToPrint.items.reduce((s: number, i: any) => s + (i.quantity * i.unitPrice), 0))) > 0 ? `${(orderToPrint.deliveryCharge !== undefined ? orderToPrint.deliveryCharge : Math.max(0, orderToPrint.totalAmount - orderToPrint.items.reduce((s: number, i: any) => s + (i.quantity * i.unitPrice), 0))).toFixed(2)} ৳` : '০.০০ ৳ (ফ্রি)'}</span>
              </div>
              <div style="font-weight:bold; border-top: 1px solid #cbd5e1; padding-top: 6px;"><span>বর্তমান বিল:</span><span>${orderToPrint.totalAmount.toFixed(2)} ৳</span></div>
              ${orderToPrint.previousDue ? `<div><span>পূর্বের বকেয়া:</span><span>${orderToPrint.previousDue.toFixed(2)} ৳</span></div>` : ''}
              <div class="grand-total"><span>সর্বমোট প্রদেয়:</span><span>${(orderToPrint.totalAmount + (orderToPrint.previousDue || 0)).toFixed(2)} ৳</span></div>
            </div>
            <div style="margin-top: 25px; padding: 10px; background: #f0fdf4; border-radius: 6px; border: 1px solid #bbf7d0; font-size: 11px; color: #166534;">
              <strong>🚚 কুরিয়ার ও ডেলিভারি নীতিমালা:</strong> নির্ধারিত ডেলিভারি মাধ্যমে (পাঠাও, স্টীডফাস্ট, নিজস্ব সংগ্রহ, কুরিয়ার বা ট্রান্সপোর্ট) পার্সেল পাঠানো হয়।
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
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubTab, setSelectedSubTab] = useState<string>("");
  const [dbCategories, setDbCategories] = useState<{ id: string; name: string; isClassWise?: boolean; subTabs?: string[] }[]>([]);
  const [viewMode, setViewMode] = useState<"card" | "list">("list");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "name" | "rating">("default");
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [showOnlyFavourites, setShowOnlyFavourites] = useState(false);
  const [favourites, setFavourites] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Fetch DB Categories for sub-tabs and class-wise configuration
  const fetchDbCategories = React.useCallback(() => {
    fetch(`/api/store/categories?t=${Date.now()}`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setDbCategories(d); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchDbCategories();
  }, [fetchDbCategories]);

  // Current authenticated user
  const [currentUser, setCurrentUser] = useState<{ id?: string; role?: string; email?: string; name?: string; madrasaId?: string } | null>(null);

  // Delivery policy alert modal & banner states
  const [isDeliveryAlertOpen, setIsDeliveryAlertOpen] = useState(false);
  const [deliveryAlertMode, setDeliveryAlertMode] = useState<"first_visit" | "before_order" | "manual">("before_order");
  const [isDeliveryBannerDismissed, setIsDeliveryBannerDismissed] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  // Read URL query parameters (e.g. ?category=... or ?track=true or ?sub=...)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const catParam = urlParams.get("category");
      if (catParam) {
        setSelectedCategory(catParam);
      }
      const subParam = urlParams.get("sub");
      if (subParam) {
        setSelectedSubTab(subParam);
      }
      if (urlParams.get("track") === "true") {
        setIsTrackModalOpen(true);
      }
    }
  }, []);

  // Fetch logged in session
  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && !data.error) setCurrentUser(data);
      })
      .catch(() => {});
  }, []);

  const isAgentOrCenter = useMemo(() => {
    if (!currentUser?.id) return false;
    const r = (currentUser.role || "").trim().toUpperCase();
    return r === "AGENT" || r === "CENTER" || r === "EXAM_CENTER" || r === "ADMIN";
  }, [currentUser]);

  const fetchStoreProducts = React.useCallback((silent = false) => {
    if (!silent) setLoading(true);
    fetch(`/api/store/products?t=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
    })
      .then(r => r.json())
      .then(data => {
        const raw = Array.isArray(data) ? data : [];
        const storeOnly = raw.filter((p: Product) => !isQuestionProduct(p));
        setProducts(storeOnly);
        // Sync cached cart product metadata (imageUrl, barcode, price, name, weight)
        setCart(prev => {
          if (prev.length === 0) return prev;
          const byId = new Map(storeOnly.map((p: Product) => [p.id, p]));
          return prev.map(item => {
            const fresh = byId.get(item.product.id);
            return fresh ? { ...item, product: fresh } : item;
          });
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    setIsMounted(true);
    fetchStoreProducts(false);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchStoreProducts(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Load view mode from localStorage (default to table/list)
    try {
      const savedView = localStorage.getItem("store_view_mode");
      if (savedView === "card" || savedView === "list") {
        setViewMode(savedView);
      } else {
        setViewMode("list");
        localStorage.setItem("store_view_mode", "list");
      }
    } catch { }
    // Load favourites from localStorage
    try {
      const fav = JSON.parse(localStorage.getItem("store_favourites") || "[]");
      setFavourites(new Set(fav));
    } catch { }
    // Load cart from localStorage (filter out any question items)
    try {
      const savedCart = JSON.parse(localStorage.getItem("store_cart") || "[]");
      if (Array.isArray(savedCart) && savedCart.length > 0) {
        const cleanCart = savedCart.filter((i: any) => !isQuestionProduct(i?.product || {}));
        setCart(cleanCart);
      }
    } catch { }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchStoreProducts]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("store_cart", JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  const toggleFav = (id: string) => {
    setFavourites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem("store_favourites", JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const addToCart = (product: Product, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { product, qty }];
    });
  };

  const updateCartQty = (product: Product, qty: number) => {
    setCart(prev => {
      if (qty <= 0) return prev.filter(i => i.product.id !== product.id);
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, qty } : i);
      }
      return [...prev, { product, qty }];
    });
  };

  const handleOpenOrder = () => {
    setIsOrderModalOpen(true);
  };

  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const grandTotal = cartTotal;

  const allCategories = useMemo(() => {
    const fromProducts = products.flatMap(p =>
      (p.category || "").split(",").map(c => c.trim()).filter(Boolean)
    );
    const fromDb = dbCategories.map(c => c.name.trim()).filter(Boolean);
    const set = new Set([...fromDb, ...fromProducts]);
    return Array.from(set).filter(cat => !isQuestionProduct({ category: cat }));
  }, [products, dbCategories]);

  // Active category configuration from DB
  const activeCategoryConfig = useMemo(() => {
    if (!selectedCategory) return null;
    return dbCategories.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase()) || null;
  }, [selectedCategory, dbCategories]);

  // Products belonging to the selected category (or all products if none selected)
  const categoryScopedProducts = useMemo(() => {
    let list = products.filter(p => !isQuestionProduct(p));
    if (selectedCategory) {
      list = list.filter(p => {
        const productCats = (p.category || "").split(",").map(c => c.trim()).filter(Boolean);
        return productCats.includes(selectedCategory) || (p.category || "").includes(selectedCategory);
      });
    }
    return list;
  }, [products, selectedCategory]);

  // Standard curriculum order for class sub-tabs
  const classOrder = [
    "প্লে", "প্লে শ্রেণি", "প্লে শ্রেণী", "শিশু", "শিশু শ্রেণি", "শিশু শ্রেণী",
    "প্রথম", "প্রথম শ্রেণি", "প্রথম শ্রেণী", "১ম শ্রেণি", "১ম শ্রেণী",
    "দ্বিতীয়", "দ্বিতীয় শ্রেণি", "দ্বিতীয় শ্রেণী", "২য় শ্রেণি", "২য় শ্রেণী",
    "তৃতীয়", "তৃতীয় শ্রেণি", "তৃতীয় শ্রেণী", "৩য় শ্রেণি", "৩য় শ্রেণী",
    "চতুর্থ", "চতুর্থ শ্রেণি", "চতুর্থ শ্রেণী", "৪র্থ শ্রেণি", "৪র্থ শ্রেণী",
    "পঞ্চম", "পঞ্চম শ্রেণি", "পঞ্চম শ্রেণী", "৫ম শ্রেণি", "৫ম শ্রেণী",
    "মুয়াল্লিম", "হিফয", "সাধারণ"
  ];

  // Auto subtabs from classes of products in this category
  const autoClassSubTabs = useMemo(() => {
    const classes = Array.from(
      new Set(
        categoryScopedProducts
          .map(p => (p.className || "").trim())
          .filter(Boolean)
      )
    );

    return classes.sort((a, b) => {
      const idxA = classOrder.indexOf(a);
      const idxB = classOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b, "bn");
    });
  }, [categoryScopedProducts]);

  // Combined subtabs: Admin custom subtabs + Auto class subtabs
  const availableSubTabs = useMemo(() => {
    const list: string[] = [];
    const seen = new Set<string>();

    // 1. Admin configured custom sub-tabs for this category
    if (activeCategoryConfig?.subTabs && Array.isArray(activeCategoryConfig.subTabs)) {
      activeCategoryConfig.subTabs.forEach(st => {
        const trimmed = String(st).trim();
        if (trimmed && !seen.has(trimmed)) {
          seen.add(trimmed);
          list.push(trimmed);
        }
      });
    }

    // 2. Class subtabs (auto for books or any category with classes or if marked isClassWise)
    autoClassSubTabs.forEach(cls => {
      if (cls && !seen.has(cls)) {
        seen.add(cls);
        list.push(cls);
      }
    });

    return list;
  }, [activeCategoryConfig, autoClassSubTabs]);

  const highestPrice = useMemo(() => products.length > 0 ? Math.max(...products.map(p => p.price)) : 1000, [products]);

  const getProductRating = (id: string) => STAR_RATINGS[id] || { rating: 4 + Math.random(), reviews: Math.floor(Math.random() * 50) + 5 };

  const filtered = useMemo(() => {
    let list = products.filter(p => !isQuestionProduct(p));
    if (search.trim()) {
      const qLower = search.trim().toLowerCase();
      const qEn = bnToEnDigits(qLower);
      list = list.filter(p => {
        const code = getCleanProductCode(p).toLowerCase();
        const codeEn = bnToEnDigits(code);
        return (
          p.name.toLowerCase().includes(qLower) ||
          code.includes(qLower) ||
          codeEn.includes(qEn) ||
          (p.category && p.category.toLowerCase().includes(qLower)) ||
          (p.className && p.className.toLowerCase().includes(qLower))
        );
      });
    }

    // 1. Exclusive Category Filter (Only one active at a time)
    if (selectedCategory) {
      list = list.filter(p => {
        const productCats = (p.category || "").split(",").map(c => c.trim()).filter(Boolean);
        return productCats.includes(selectedCategory) || (p.category || "").includes(selectedCategory);
      });
    }

    // 2. Sub-Tab Filter (Class or Custom Sub-tab)
    if (selectedSubTab) {
      const target = selectedSubTab.trim().toLowerCase();
      const aliases: string[] = [target];
      if (target.includes("১ম") || target.includes("1st")) aliases.push("প্রথম");
      if (target.includes("প্রথম")) aliases.push("১ম");
      if (target.includes("২য়") || target.includes("2nd")) aliases.push("দ্বিতীয়");
      if (target.includes("দ্বিতীয়")) aliases.push("২য়");
      if (target.includes("৩য়") || target.includes("3rd")) aliases.push("তৃতীয়");
      if (target.includes("তৃতীয়")) aliases.push("৩য়");
      if (target.includes("৪র্থ") || target.includes("4th")) aliases.push("চতুর্থ");
      if (target.includes("চতুর্থ")) aliases.push("৪র্থ");
      if (target.includes("৫ম") || target.includes("5th")) aliases.push("পঞ্চম");
      if (target.includes("পঞ্চম")) aliases.push("৫ম");

      list = list.filter(p => {
        const pClass = (p.className || "").trim().toLowerCase();
        const pName = (p.name || "").toLowerCase();
        const pDesc = (p.description || "").toLowerCase();
        const pSubj = (p.subject || "").toLowerCase();
        return aliases.some(alias => (
          pClass === alias ||
          pClass.includes(alias) ||
          pName.includes(alias) ||
          pDesc.includes(alias) ||
          pSubj.includes(alias)
        ));
      });
    }

    if (showOnlyInStock) list = list.filter(p => p.stock > 0);
    if (showOnlyFavourites) list = list.filter(p => favourites.has(p.id));
    if (minPrice) list = list.filter(p => p.price >= parseFloat(minPrice));
    if (maxPrice) list = list.filter(p => p.price <= parseFloat(maxPrice));
    if (ratingFilter > 0) list = list.filter(p => getProductRating(p.id).rating >= ratingFilter);

    if (sortBy === "default") list.sort(compareProductsByCode);
    else if (sortBy === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name, "bn"));
    else if (sortBy === "rating") list.sort((a, b) => getProductRating(b.id).rating - getProductRating(a.id).rating);
    return list;
  }, [products, search, selectedCategory, selectedSubTab, showOnlyInStock, showOnlyFavourites, favourites, minPrice, maxPrice, sortBy, ratingFilter]);

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 min-h-screen xl:min-h-0 xl:h-[calc(100dvh-6.75rem)] xl:max-h-[calc(100dvh-6.75rem)] xl:overflow-hidden">
      {/* Fixed Top Header (Search, Categories & Sub-Tabs) */}
      <div className="bg-white border-b border-slate-200 z-30 shadow-xs flex-shrink-0 sticky top-0">
        <div className="w-full mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-3">
          <h1 className="text-lg font-black text-slate-800 whitespace-nowrap hidden sm:block">বই ও স্টেশনারি</h1>

          {/* Search & Filters */}
          <div className="flex flex-1 items-center gap-2">
            <Link href="/" className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center flex-shrink-0 lg:hidden">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="পণ্যের নাম বা আইডি দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>}
            </div>

            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center flex-shrink-0">
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Sort & View Toggle */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 hidden md:block">
              <option value="default">আইডি / ক্রমানুসারে</option>
              <option value="price-asc">মূল্য: কম থেকে বেশি</option>
              <option value="price-desc">মূল্য: বেশি থেকে কম</option>
              <option value="name">নামানুসারে</option>
            </select>

            <button
              onClick={() => {
                const newMode = viewMode === "card" ? "list" : "card";
                setViewMode(newMode);
                try { localStorage.setItem("store_view_mode", newMode); } catch { }
              }}
              className="p-2.5 bg-slate-100 text-slate-600 rounded-xl transition-colors hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              title={viewMode === "card" ? "তালিকা ভিউ" : "কার্ড ভিউ"}
            >
              {viewMode === "card" ? <List className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => {
                if (window.innerWidth >= 1280) {
                  setRightSidebarOpen(prev => !prev);
                } else {
                  setCartOpen(true);
                }
              }}
              className="relative p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-xl hover:bg-emerald-100 transition-all flex items-center justify-center flex-shrink-0 active:scale-95 cursor-pointer shadow-2xs"
              title="কার্ট দেখুন"
            >
              <ShoppingCart className="w-5 h-5 text-emerald-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-red-600 text-white font-black text-[11px] rounded-full px-1 flex items-center justify-center shadow-sm animate-scale-in">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Horizontal Category Tabs Row */}
        <div className="w-full mx-auto px-3 sm:px-4 lg:px-6 pb-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex items-center gap-1.5 sm:gap-2 w-max px-0.5">
            <button
              type="button"
              onClick={(e) => {
                setSelectedCategory("");
                setSelectedSubTab("");
                e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
              }}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
                !selectedCategory 
                  ? 'bg-emerald-700 border-emerald-700 text-white shadow-md scale-102 ring-2 ring-emerald-700/20' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              সকল
            </button>
            {allCategories.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={(e) => {
                    if (isSelected) {
                      setSelectedCategory("");
                      setSelectedSubTab("");
                    } else {
                      setSelectedCategory(cat);
                      setSelectedSubTab(""); // Automatically deselect previous sub-tab and other category
                    }
                    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                  }}
                  className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
                    isSelected 
                      ? 'bg-emerald-700 border-emerald-700 text-white shadow-md scale-102 ring-2 ring-emerald-700/20' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-Tabs Row (Auto Class-Wise & Admin Sub-Tabs) */}
        {availableSubTabs.length > 0 && (
          <div className="w-full mx-auto px-3 sm:px-4 lg:px-6 pb-2 pt-0.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-center gap-1.5 sm:gap-2 w-max px-0.5">
              <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                <span>সাব-ট্যাব / শ্রেণি:</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedSubTab("")}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  !selectedSubTab
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                সবগুলো
              </button>
              {availableSubTabs.map(sub => {
                const isSubSelected = selectedSubTab === sub;
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSelectedSubTab(isSubSelected ? "" : sub)}
                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                      isSubSelected
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs ring-1 ring-emerald-600/30"
                        : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-800 hover:bg-slate-50"
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Workspace (Scrollable Products on Left, Fixed Cart on Right) */}
      <div className="w-full flex flex-col xl:flex-row flex-1 min-h-0 bg-slate-50 items-start xl:items-stretch px-2 sm:px-4 lg:px-6 py-2 gap-3 xl:overflow-hidden">

        {/* Main Products Section - THE ONLY PART THAT SCROLLS ON DESKTOP */}
        <div className="flex-1 min-w-0 w-full flex flex-col min-h-0 xl:h-full xl:overflow-y-auto xl:pr-1">
          {/* Notice Banner */}
          {isAgentOrCenter && !isDeliveryBannerDismissed && (
            <div className="mb-3.5 p-3 sm:p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/70 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-sm flex-shrink-0 animate-in fade-in">
              <div className="flex items-start sm:items-center gap-2.5 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <span className="font-bold text-emerald-800">বই ও প্রকাশনা ডেলিভারি:</span> অর্ডার করার সময় আপনার সুবিধাজনক মাধ্যম (<strong className="text-slate-900">পাঠাও, স্টিডফাস্ট, নিজস্ব সংগ্রহ, কুরিয়ার বা ট্রান্সপোর্ট</strong>) নির্বাচন করতে পারবেন।
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => {
                    setDeliveryAlertMode("manual");
                    setIsDeliveryAlertOpen(true);
                  }}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-white/80 hover:bg-white px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs transition-colors"
                >
                  বিস্তারিত
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeliveryBannerDismissed(true)}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-black/5 flex items-center justify-center transition-colors"
                  title="বিজ্ঞপ্তি বন্ধ করুন"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Products Display Area */}
          {viewMode === "card" ? (
            <div className={`w-full ${cart.length > 0 ? "pb-28 lg:pb-16" : "pb-16 lg:pb-10"}`}>
              {!loading && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                  <Package className="w-16 h-16 mb-4 text-slate-200" />
                  <p className="text-lg font-bold">কোনো পণ্য পাওয়া যায়নি</p>
                  <p className="text-sm mt-1">অনুসন্ধান বা ফিল্টার পরিবর্তন করুন</p>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-4.5">
                {loading ? Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse flex flex-col p-3 gap-2.5 shadow-2xs">
                    <div className="w-full aspect-[4/3] bg-slate-100 rounded-xl" />
                    <div className="h-4 bg-slate-100 rounded w-3/4 mt-1" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-8 bg-slate-100 rounded w-full mt-auto" />
                  </div>
                )) : filtered.map(product => {
                  const r = getProductRating(product.id);
                  const isFav = favourites.has(product.id);
                  const cartItem = cart.find(c => c.product.id === product.id);
                  const cartQty = cartItem ? cartItem.qty : 0;
                  const productCode = getCleanProductCode(product);

                  return (
                    <div 
                      key={product.id} 
                      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500/60 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden"
                    >
                      {/* Image Area */}
                      <div 
                        onClick={() => setDetailProduct(product)}
                        className="relative bg-gradient-to-b from-slate-50 to-slate-100/50 w-full aspect-[4/3] flex items-center justify-center p-2.5 sm:p-3 overflow-hidden border-b border-slate-100 cursor-pointer"
                      >
                        <ProductImage
                          src={product.imageUrl}
                          alt={product.name}
                          imgClassName="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-2xs"
                          iconClassName="w-12 h-12 text-slate-300 group-hover:scale-105 transition-transform"
                        />
                        {product.category && (
                          <span className="absolute bottom-2 left-2 text-[9.5px] sm:text-[10px] font-bold text-slate-700 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-md border border-slate-200/80 shadow-2xs z-10 max-w-[calc(100%-16px)] truncate">
                            {product.category}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFav(product.id);
                          }}
                          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all z-10 cursor-pointer ${
                            isFav 
                              ? "bg-red-50 text-red-500 shadow-2xs border border-red-200" 
                              : "bg-white/90 text-slate-400 hover:text-red-500 hover:bg-white border border-slate-200/70 opacity-0 group-hover:opacity-100 shadow-2xs"
                          }`}
                          title={isFav ? "পছন্দের তালিকা থেকে সরান" : "পছন্দের তালিকায় রাখুন"}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-current" : ""}`} />
                        </button>
                      </div>

                      {/* Content Area */}
                      <div className="p-2.5 sm:p-3 flex flex-col flex-1 justify-between gap-2">
                        <div className="space-y-1">
                          <h3 
                            onClick={() => setDetailProduct(product)}
                            className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors cursor-pointer"
                            title={product.name}
                          >
                            {product.name}
                          </h3>

                          {/* ID below title: simple clean text, no card or border */}
                          <div className="flex items-center gap-1.5 flex-wrap text-[11px] sm:text-xs text-slate-500 font-medium">
                            {productCode && (
                              <span className="font-mono text-slate-500">
                                আইডি: {productCode}
                              </span>
                            )}
                            {productCode && product.className && (
                              <span className="text-slate-300">•</span>
                            )}
                            {product.className && (
                              <span className="text-slate-500 truncate">
                                {product.className}{product.subject ? ` (${product.subject})` : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price & Horizontal Quantity Controls */}
                        <div className="pt-1 border-t border-slate-100/80 space-y-2 mt-auto">
                          <div className="flex items-baseline justify-between">
                            <span className="text-base sm:text-lg font-black text-emerald-800 font-mono">
                              ৳{product.price}
                            </span>
                            {product.unit && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                /{product.unit}
                              </span>
                            )}
                          </div>

                          {/* Horizontal + and - Quantity Stepper */}
                          {cartQty > 0 ? (
                            <div 
                              className="flex items-center justify-between w-full bg-emerald-50/90 rounded-xl p-0.5 border border-emerald-300/80 shadow-2xs" 
                              onClick={e => e.stopPropagation()}
                            >
                              <button 
                                type="button"
                                onClick={() => updateCartQty(product, cartQty - 1)}
                                className="w-7 h-7 sm:w-8 sm:h-8 bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 rounded-lg font-bold text-sm sm:text-base flex items-center justify-center border border-emerald-200/80 shadow-2xs transition-all active:scale-90 cursor-pointer"
                                title="পরিমাণ কমান"
                              >
                                −
                              </button>
                              <input
                                type="number"
                                min={1}
                                value={cartQty || ""}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  updateCartQty(product, isNaN(val) ? 0 : Math.max(0, val));
                                }}
                                onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault(); }}
                                className="w-10 sm:w-12 h-7 sm:h-8 text-center text-xs sm:text-sm font-black text-emerald-950 font-mono bg-white border border-emerald-200/80 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <button 
                                type="button"
                                onClick={() => updateCartQty(product, cartQty + 1)}
                                className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-sm sm:text-base flex items-center justify-center shadow-2xs transition-all active:scale-90 cursor-pointer"
                                title="পরিমাণ বাড়ান"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button 
                              type="button"
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                addToCart(product); 
                              }}
                              className="w-full py-1.5 sm:py-2 px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-2xs shadow-emerald-700/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>কার্টে যোগ করুন</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="w-full flex-1 flex flex-col min-h-0 mb-2 xl:mb-0 xl:h-full">
              {/* LIST VIEW */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full flex-1 flex flex-col min-h-0 xl:h-full">
                {/* Compact Top Header & Action Bar */}
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-b border-emerald-200/80 px-3.5 py-2.5 flex items-center justify-between gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-black text-emerald-800 text-xs sm:text-sm md:text-base truncate">বই ও স্টেশনারি তালিকা</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 justify-end">
                    <div className="flex items-center gap-1 bg-white border border-emerald-300/80 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-2xs">
                      <span className="text-[11px] sm:text-xs font-bold text-slate-700">সর্বমোট:</span>
                      <span className="text-xs sm:text-sm md:text-base font-black text-emerald-800">৳{cartTotal.toFixed(2)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenOrder}
                      className="px-3.5 py-1.5 bg-[#2d3282] hover:bg-[#232766] text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95 flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>বিলে যুক্ত করুন</span>
                    </button>
                  </div>
                </div>

                {/* Table Area with internal scroll: only rows scroll behind the thead */}
                <div className="overflow-auto w-full flex-1 min-h-0">
                  <table className="w-full text-left border-collapse min-w-full sm:min-w-[750px]">
                    <thead className="sticky top-0 z-10 bg-[#2f8c5b] shadow-xs">
                      <tr className="bg-[#2f8c5b] text-white text-xs sm:text-sm">
                        <th className="p-2.5 font-bold text-center border-r border-white/20 w-14 sm:w-20 hidden sm:table-cell bg-[#2f8c5b]">ছবি</th>
                        <th className="p-2.5 font-bold text-center border-r border-white/20 w-20 hidden sm:table-cell bg-[#2f8c5b]">আইডি</th>
                        <th className="p-2.5 sm:p-3 font-bold text-left sm:text-center border-r border-white/20 bg-[#2f8c5b]">পণ্যের নাম</th>
                        <th className="p-2.5 font-bold text-center border-r border-white/20 w-24 hidden sm:table-cell bg-[#2f8c5b]">ক্যাটাগরি</th>
                        <th className="p-2.5 sm:p-3 font-bold text-center border-r border-white/20 w-20 sm:w-28 bg-[#2f8c5b]">দর (৳)</th>
                        <th className="p-2.5 sm:p-3 font-bold text-center border-r border-white/20 w-28 sm:w-44 bg-[#2f8c5b]">পরিমাণ</th>
                        <th className="p-2.5 sm:p-3 font-bold text-right pr-3 sm:pr-6 w-20 sm:w-32 bg-[#2f8c5b]">মূল্য (৳)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {!loading && filtered.length === 0 && (
                        <tr>
                          <td colSpan={7}>
                            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                              <Package className="w-16 h-16 mb-4 text-slate-200" />
                              <p className="text-lg font-bold">কোনো পণ্য পাওয়া যায়নি</p>
                              <p className="text-sm mt-1">অনুসন্ধান বা ফিল্টার পরিবর্তন করুন</p>
                            </div>
                          </td>
                        </tr>
                      )}
                      {loading ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b border-slate-100 animate-pulse">
                          <td colSpan={7} className="p-4"><div className="h-8 bg-slate-100 rounded w-full" /></td>
                        </tr>
                      )) : filtered.map((product, index) => {
                        const cartItem = cart.find(c => c.product.id === product.id);
                        return (
                          <ListProductRow
                            key={product.id} product={product} index={index}
                            cartQty={cartItem ? cartItem.qty : 0}
                            updateCartQty={updateCartQty} setDetailProduct={setDetailProduct}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Cart (Fixed & Screen-Fit on Desktop) */}
        <aside className={`
          hidden xl:flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden xl:h-full xl:self-stretch
          ${rightSidebarOpen ? "w-80 2xl:w-[330px] opacity-100" : "w-0 border-l-0 opacity-0 overflow-hidden"}
        `}>
          <div className="flex flex-col h-full w-80 2xl:w-[330px] flex-shrink-0 min-h-0 overflow-hidden relative">
            {/* Header */}
            <div className="flex-shrink-0 px-3.5 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10">
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-emerald-700" />
                <span>আমার কার্ট</span>
              </h3>
              {cart.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                    {cart.reduce((a, c) => a + c.qty, 0)} টি
                  </span>
                  <button
                    onClick={() => setCart([])}
                    title="কার্ট খালি করুন"
                    className="text-[10.5px] text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    খালি করুন
                  </button>
                </div>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 min-h-0 overflow-y-auto p-2 flex flex-col space-y-1.5 overscroll-contain">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                  <ShoppingBag className="w-8 h-8 mb-1.5 text-slate-200" />
                  <p className="font-medium text-xs">কার্ট খালি আছে</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {cart.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-2 p-1.5 sm:p-2 bg-white border border-slate-200/70 hover:border-emerald-300 rounded-xl shadow-2xs transition-all items-center"
                    >
                      {/* Thumbnail */}
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-100">
                        <ProductImage
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          imgClassName="w-full h-full object-contain p-0.5"
                          iconClassName="w-4 h-4 text-slate-300"
                        />
                      </div>

                      {/* Info & Controls */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-1">
                          <p className="font-bold text-slate-900 text-xs truncate leading-tight">
                            {item.product.name}
                          </p>
                          <button
                            onClick={() => setCart(prev => prev.filter(c => c.product.id !== item.product.id))}
                            className="text-slate-300 hover:text-red-500 transition-colors p-0.5 rounded hover:bg-red-50 shrink-0 cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>

                        <p className="text-[9.5px] text-slate-400 truncate -mt-0.5 mb-1">
                          {item.product.category}
                          {item.product.className && <span className="ml-1 text-slate-500 font-medium">({item.product.className})</span>}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-emerald-800 font-mono">
                            ৳{(item.product.price * item.qty).toFixed(2)}
                          </span>
                          <div className="flex items-center gap-1 bg-slate-100/90 rounded-lg p-0.5 border border-slate-200/80 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.product, Math.max(1, item.qty - 1))}
                              className="w-7 h-7 bg-white hover:bg-slate-200 text-slate-700 rounded-md font-bold text-base flex items-center justify-center border border-slate-200/80 shadow-2xs transition-all active:scale-90 cursor-pointer"
                              title="পরিমাণ কমান"
                            >−</button>
                            <input
                              type="number"
                              min={1}
                              value={item.qty || ""}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val) && val > 0) {
                                  updateCartQty(item.product, val);
                                }
                              }}
                              onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault(); }}
                              className="w-10 h-7 text-center text-sm font-black text-slate-900 font-mono bg-white border border-slate-200/80 rounded-md outline-none focus:ring-1 focus:ring-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.product, item.qty + 1)}
                              className="w-7 h-7 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md font-bold text-base flex items-center justify-center shadow-2xs transition-all active:scale-90 cursor-pointer"
                              title="পরিমাণ বাড়ান"
                            >+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sticky Bottom Footer: Summary & Checkout Button */}
            {cart.length > 0 && (
              <div className="sticky bottom-0 z-20 mt-auto flex-shrink-0 p-2 sm:p-2.5 border-t border-slate-200 bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.08)] space-y-1">
                <div className="space-y-0.5 text-[11px] text-slate-600 border-b border-slate-200/70 pb-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">পণ্যের মূল্য:</span>
                    <span className="font-bold text-slate-800 font-mono">৳{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10.5px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3 text-emerald-700" />
                      <span>ডেলিভারি মাধ্যম:</span>
                    </span>
                    <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      চেকআউটে নির্বাচনযোগ্য
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-slate-800 items-baseline pt-0.5">
                  <div>
                    <span className="font-bold text-xs block text-slate-700">সর্বমোট প্রদেয় বিল</span>
                    <span className="text-[9px] text-slate-400">ডেলিভারি চার্জ ছাড়া</span>
                  </div>
                  <span className="text-sm sm:text-base font-black text-emerald-800 font-mono">৳{grandTotal.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleOpenOrder}
                  className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-700/20 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>অর্ডার করুন</span>
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile Floating Sticky Bottom Bar (Glassmorphic) */}
      {!cartOpen && cart.length > 0 && (
        <div className="xl:hidden fixed bottom-3 left-3 right-3 sm:left-6 sm:right-6 z-40 animate-in slide-in-from-bottom-4 duration-200">
          <div className="bg-slate-900/65 backdrop-blur-xl saturate-180 text-white rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.35)] border border-white/20 ring-1 ring-white/10 p-2.5 sm:p-3 flex items-center justify-between gap-2.5">
            {/* Left: Cart Info / Click to Open Drawer */}
            <div
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
            >
              <div className="relative w-10 h-10 rounded-xl bg-emerald-600/90 backdrop-blur-md text-white flex items-center justify-center shrink-0 shadow-inner border border-white/20">
                <ShoppingBag className="w-5 h-5 drop-shadow-xs" />
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white font-black text-[10px] rounded-full px-1 flex items-center justify-center border-2 border-slate-900 shadow-sm">
                  {cartCount}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-black text-white font-mono leading-tight drop-shadow-xs">
                    ৳{grandTotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-emerald-100/80 truncate">
                  {cart.length} আইটেম ({cartCount} টি) • কার্ট দেখতে চাপুন
                </p>
              </div>
            </div>

            {/* Right: Actions (Cart View + Order Now) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="px-2.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold text-xs backdrop-blur-md transition-all active:scale-95 cursor-pointer hidden sm:flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>কার্ট</span>
              </button>

              <button
                type="button"
                onClick={handleOpenOrder}
                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-xs sm:text-sm transition-all shadow-md shadow-emerald-500/30 backdrop-blur-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>অর্ডার করুন</span>
                <ChevronRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Detail Modal */}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onAddToCart={addToCart}
          isFav={favourites.has(detailProduct.id)}
          onToggleFav={() => toggleFav(detailProduct.id)}
          cartQty={cart.find(c => c.product.id === detailProduct.id)?.qty || 0}
          onUpdateQty={(q) => updateCartQty(detailProduct, q)}
        />
      )}

      {/* Mobile Bottom Sheet Cart Drawer (Opens from below) */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end xl:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in" 
            onClick={() => setCartOpen(false)} 
          />

          {/* Bottom Sheet Modal Panel */}
          <div className="relative w-full max-w-xl mx-auto max-h-[85dvh] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 border-t border-slate-200/80 z-10 pb-2">
            {/* Grab Handle */}
            <div className="pt-2.5 pb-1 flex justify-center shrink-0 cursor-grab active:cursor-grabbing" onClick={() => setCartOpen(false)}>
              <div className="w-12 h-1.5 bg-slate-300 hover:bg-slate-400 rounded-full transition-colors" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800 leading-none">আমার কার্ট</h2>
                  {cart.length > 0 && (
                    <span className="text-[10px] text-slate-500 font-medium">
                      {cart.reduce((a, c) => a + c.qty, 0)} টি পণ্য যোগ করা হয়েছে
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    title="কার্ট খালি করুন"
                    className="text-[11px] text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    খালি করুন
                  </button>
                )}
                <button 
                  onClick={() => setCartOpen(false)} 
                  className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-full transition-colors"
                  title="বন্ধ করুন"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col space-y-2 overscroll-contain">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <ShoppingBag className="w-12 h-12 mb-2 text-slate-200" />
                  <p className="font-bold text-sm">কার্ট খালি আছে</p>
                  <p className="text-xs text-slate-400 mt-0.5">পণ্য যোগ করতে তালিকায় যান</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-2.5 p-2 bg-white border border-slate-200/80 rounded-2xl shadow-2xs items-center"
                    >
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-slate-100">
                        <ProductImage
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          imgClassName="w-full h-full object-contain p-1"
                          iconClassName="w-5 h-5 text-slate-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-1">
                          <p className="font-bold text-slate-900 text-xs truncate leading-tight">
                            {item.product.name}
                          </p>
                          <button
                            onClick={() => setCart(prev => prev.filter(c => c.product.id !== item.product.id))}
                            className="text-slate-300 hover:text-red-500 transition-colors p-0.5 rounded hover:bg-red-50 shrink-0"
                            title="মুছে ফেলুন"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate -mt-0.5 mb-1">
                          {item.product.category}
                          {item.product.className && <span className="ml-1 text-slate-500 font-medium">({item.product.className})</span>}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-emerald-800 font-mono">
                            ৳{(item.product.price * item.qty).toFixed(2)}
                          </span>
                          <div className="flex items-center gap-1 bg-slate-100/90 rounded-xl p-0.5 border border-slate-200/80 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.product, Math.max(1, item.qty - 1))}
                              className="w-7 h-7 bg-white hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-base flex items-center justify-center border border-slate-200/80 shadow-2xs transition-all active:scale-90"
                              title="পরিমাণ কমান"
                            >−</button>
                            <input
                              type="number"
                              min={1}
                              value={item.qty || ""}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val) && val > 0) {
                                  updateCartQty(item.product, val);
                                }
                              }}
                              onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault(); }}
                              className="w-10 h-7 text-center text-sm font-black text-slate-900 font-mono bg-white border border-slate-200/80 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.product, item.qty + 1)}
                              className="w-7 h-7 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-base flex items-center justify-center shadow-2xs transition-all active:scale-90"
                              title="পরিমাণ বাড়ান"
                            >+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Sticky Checkout Footer */}
            {cart.length > 0 && (
              <div className="p-3 sm:p-4 border-t border-slate-200 bg-white/95 backdrop-blur-xs shrink-0 space-y-2 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
                <div className="space-y-1 text-xs text-slate-600 border-b border-slate-200/70 pb-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">পণ্যের মূল্য:</span>
                    <span className="font-bold text-slate-800 font-mono">৳{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>ডেলিভারি মাধ্যম:</span>
                    </span>
                    <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      চেকআউটে নির্বাচনযোগ্য
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-slate-800 items-baseline pt-0.5">
                  <div>
                    <span className="font-bold text-xs block text-slate-700">সর্বমোট প্রদেয় বিল</span>
                    <span className="text-[10px] text-slate-400">ডেলিভারি চার্জ ছাড়া</span>
                  </div>
                  <span className="text-lg font-black text-emerald-800 font-mono">৳{grandTotal.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => {
                    setCartOpen(false);
                    handleOpenOrder();
                  }}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-700/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>অর্ডার করুন</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delivery Policy Alert Modal (First visit, Before order, or Details) */}
      <DeliveryPolicyAlertModal
        isOpen={isDeliveryAlertOpen}
        mode={deliveryAlertMode}
        cartTotal={cartTotal}
        onClose={() => setIsDeliveryAlertOpen(false)}
        onProceedToOrder={() => {
          setIsDeliveryAlertOpen(false);
          setIsOrderModalOpen(true);
        }}
      />

      {/* Standalone Order Tracking Modal triggered from URL or Submenu */}
      <TrackOrderModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
      />

      {isOrderModalOpen && (
        <OrderFormModal
          initialState={orderFormState}
          onClose={(savedState) => {
            if (savedState) setOrderFormState(savedState);
            setIsOrderModalOpen(false);
          }}
          total={cartTotal}
          cart={cart}
          onSuccess={(data) => {
            setSuccessOrder(data);
            setCart([]);
            setOrderFormState(null); // clear state after success so the next order starts fresh
            setIsOrderModalOpen(false);
            setCartOpen(false);
          }} />
      )}

      {/* Success Invoice & Tracking Modal */}
      {successOrder && (
        <TrackOrderModal
          isOpen={Boolean(successOrder)}
          onClose={() => {
            setSuccessOrder(null);
            setCustomPasswordInput("");
            setPasswordSaveStatus(null);
          }}
          initialInvoiceId={successOrder.invoiceId}
          initialOrder={successOrder}
          isNewOrder={true}
        />
      )}
    </div>
  );
}
