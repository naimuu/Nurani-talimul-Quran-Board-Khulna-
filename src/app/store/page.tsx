"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Search, ShoppingBag, Package, Heart, Star, LayoutGrid, List,
  SlidersHorizontal, X, ChevronRight, ShoppingCart, Eye, Filter, ArrowLeft, CheckCircle, Copy, Building2, UserCheck, KeyRound, ShieldCheck, Truck
} from "lucide-react";
import Link from "next/link";
import GeoAddressSelector, { GeoAddressData } from "@/components/common/GeoAddressSelector";
import { calculateDeliveryCost, DELIVERY_CONSTANTS } from "@/lib/deliveryCost";

type Product = {
  id: string; name: string; category: string; price: number;
  stock: number; unit: string; rating?: number; reviews?: number;
  imageUrl?: string; className?: string; subject?: string; description?: string | null;
  weight?: number | null;
};

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
  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors bg-slate-100/50">
      <td className="p-3 text-center font-bold text-slate-800 hidden sm:table-cell">{String(index + 1).padStart(2, '0')}</td>
      <td className="p-2 hidden sm:table-cell">
        <div className="w-12 h-12 bg-white rounded flex items-center justify-center flex-shrink-0 mx-auto overflow-hidden shadow-sm">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <Package className="w-6 h-6 text-slate-300" />
          )}
        </div>
      </td>
      <td className="p-3 text-center text-sm font-bold text-slate-700 hidden sm:table-cell">{String(index + 1).padStart(2, '0')}</td>
      <td className="p-3">
        <h3 className="font-bold text-slate-800 text-sm cursor-pointer hover:text-primary transition-colors line-clamp-2" onClick={() => setDetailProduct(product)}>{product.name}</h3>
      </td>
      <td className="p-3 text-center text-xs sm:text-sm font-bold text-slate-600">
        {product.className ? `${product.className}${product.subject ? ` - ${product.subject}` : ''}` : '-'}
      </td>
      <td className="p-3 text-center text-xs sm:text-sm font-bold text-slate-600 hidden sm:table-cell">
        {product.category}
      </td>
      <td className="p-3 text-center font-bold text-slate-800">{product.price.toFixed(2)}</td>
      <td className="p-3">
        <div className="flex items-center justify-center gap-1 mx-auto w-fit">
          <button onClick={() => updateCartQty(product, Math.max(0, cartQty - 1))} className="w-7 h-7 bg-slate-400 text-white flex items-center justify-center rounded-sm font-bold text-lg leading-none">-</button>
          <input
            type="number"
            value={cartQty || ""}
            onChange={(e) => updateCartQty(product, parseInt(e.target.value) || 0)}
            onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault(); }}
            className="w-10 sm:w-16 h-7 text-center text-sm font-bold border border-slate-300 rounded-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button onClick={() => updateCartQty(product, cartQty + 1)} className="w-7 h-7 bg-[#2f8c5b] hover:bg-[#2f8c5b]/90 text-white flex items-center justify-center rounded-sm font-bold text-lg leading-none">+</button>
        </div>
      </td>
      <td className="p-3 text-right pr-6 font-bold text-slate-800 hidden sm:table-cell">{(product.price * cartQty).toFixed(2)}</td>
    </tr>
  );
}

function ProductDetailModal({
  product, onClose, onAddToCart, isFav, onToggleFav
}: {
  product: Product; onClose: () => void;
  onAddToCart: (p: Product) => void;
  isFav: boolean; onToggleFav: () => void;
}) {
  const r = STAR_RATINGS[product.id] || { rating: 4.2, reviews: 18 };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="relative">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 h-56 flex items-center justify-center rounded-t-2xl overflow-hidden relative">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-4" />
            ) : (
              <Package className="w-24 h-24 text-slate-300" />
            )}
          </div>
          <button onClick={onClose} className="absolute top-3 right-3 bg-white/80 hover:bg-white p-2 rounded-full shadow transition-colors">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>
        <div className="p-6">
          <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{product.category}</span>
          <h2 className="text-2xl font-black text-slate-800 mt-3 mb-1">{product.name}</h2>
          {product.className && (
            <p className="text-sm font-medium text-slate-500 mb-2">
              {product.className}{product.subject ? ` - ${product.subject}` : ''}
            </p>
          )}
          {product.description && (
            <p className="text-slate-500 mt-3 text-sm leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
            <div>
              <span className="text-3xl font-black text-primary">৳{product.price}</span>
              <span className="text-slate-400 text-sm ml-2">প্রতি {product.unit}</span>
            </div>
          </div>
          <button
            onClick={() => { onAddToCart(product); onClose(); }}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" /> কার্টে যোগ করুন
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderFormModal({ onClose, initialState, total, cart, onSuccess }: { onClose: (state?: any) => void; initialState?: any; total: number; cart: any[]; onSuccess: (data: any) => void }) {
  const deliveryInfo = useMemo(() => calculateDeliveryCost(cart), [cart]);
  const grandTotal = total + deliveryInfo.deliveryCharge;
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

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchStatus, setSearchStatus] = useState<"idle" | "found" | "not_found" | "error">(initialState?.searchStatus || "idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [paymentStep, setPaymentStep] = useState(initialState?.paymentStep || false);
  const [paymentOption, setPaymentOption] = useState<"pay_later" | "pay_now" | "money_receipt">("pay_now");
  const [paymentProvider, setPaymentProvider] = useState<"bKash" | "Nagad" | "Rocket" | "Bank">("bKash");
  const [trxId, setTrxId] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [copied, setCopied] = useState(false);
  const [receiptVerifyStatus, setReceiptVerifyStatus] = useState<'idle' | 'verifying' | 'valid' | 'invalid'>('idle');
  const [receiptVerifyMsg, setReceiptVerifyMsg] = useState("");
  const [receiptBalance, setReceiptBalance] = useState(0);
  // For partial receipt payment
  const [remainingOption, setRemainingOption] = useState<'pay_now' | 'pay_later' | 'skip_receipt'>('pay_later');
  const [remainingProvider, setRemainingProvider] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Bank'>('bKash');
  const [remainingTrxId, setRemainingTrxId] = useState("");
  const [remainingCopied, setRemainingCopied] = useState(false);

  const handleCopy = () => {
    const number = paymentProvider === 'Bank' ? '123456789' : '01700000000';
    navigator.clipboard.writeText(number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
    try {
      const res = await fetch(`/api/madrasa/by-code?code=${encodeURIComponent(ilhak)}`);
      if (res.ok) {
        const data = await res.json();
        setInstituteName(data.name || "");
        setOwnerName(data.ownerName || "");
        setContactNo(data.contactNo || "");
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
      } else {
        setSearchStatus("error");
      }
    } catch (e) {
      setSearchStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const validateAndProceed = () => {
    setErrorMsg("");
    const effectiveAddress = geoAddress.fullAddress || address;
    if (!ownerName.trim() || !instituteName.trim() || !contactNo.trim() || !effectiveAddress.trim()) {
      setErrorMsg("অনুগ্রহ করে মুহতামিম/আবেদনকারী, মাদরাসার নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা প্রদান করুন।");
      return;
    }
    if (hasSeparateDelivery && !deliveryAddress.fullAddress.trim()) {
      setErrorMsg("অনুগ্রহ করে ডেলিভারি ঠিকানা নির্বাচন বা লিখে পূরণ করুন।");
      return;
    }
    setPaymentStep(true);
  };

  const submitOrder = async () => {
    setIsSubmitting(true);
    setErrorMsg("");
    const isPartialReceipt = paymentOption === 'money_receipt' && receiptVerifyStatus === 'valid' && receiptBalance < grandTotal;
    try {
      if (paymentOption === 'pay_now' && !trxId) throw new Error("ট্রানজেকশন আইডি প্রদান করুন");
      if (paymentOption === 'money_receipt' && !receiptNumber) throw new Error("মানি রিসিট নম্বর প্রদান করুন");
      if (paymentOption === 'money_receipt' && receiptVerifyStatus !== 'valid') throw new Error("অর্ডার দেওয়ার আগে মানি রিসিট যাচাই করুন");
      if (isPartialReceipt && remainingOption === 'pay_now' && !remainingTrxId) throw new Error("বাকি টাকার জন্য TrxID প্রদান করুন");

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

      const items = cart.map(c => ({ productId: c.product.id, quantity: c.qty }));
      // Determine what to actually send:
      // If 'skip_receipt' chosen (user ignores verified receipt), treat as pay_later
      const effectivePaymentOption = (paymentOption === 'money_receipt' && remainingOption === 'skip_receipt') ? 'pay_later' : paymentOption;
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
          notes: `${effectiveAddress}${deliveryNote}${ilhakText}`,
          paymentOption: effectivePaymentOption,
          paymentProvider: effectivePaymentOption === 'pay_now' ? paymentProvider : undefined,
          trxId: effectivePaymentOption === 'pay_now' ? trxId : undefined,
          receiptNumber: effectivePaymentOption === 'money_receipt' ? receiptNumber : undefined,
          // Partial receipt extra fields
          remainingOption: isPartialReceipt && remainingOption !== 'skip_receipt' ? remainingOption : undefined,
          remainingProvider: isPartialReceipt && remainingOption === 'pay_now' ? remainingProvider : undefined,
          remainingTrxId: isPartialReceipt && remainingOption === 'pay_now' ? remainingTrxId : undefined,
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
            <h2 className="font-bold text-slate-800 text-lg">অর্ডার নিশ্চিত করুন</h2>
            <p className="text-xs text-slate-500">মাদরাসা ও ডেলিভারির সঠিক তথ্য প্রদান করুন</p>
          </div>
          <button onClick={() => onClose({ ilhak, ownerName, instituteName, contactNo, customerEmail, customerPassword, address: geoAddress.fullAddress || address, geoAddress, hasSeparateDelivery, deliveryAddress, searchStatus, paymentStep })} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {!paymentStep ? (
            <>
              {errorMsg && <p className="mb-4 text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{errorMsg}</p>}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">ইলহাক বা মোবাইল নম্বর (পুরাতন তথ্যের জন্য)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ilhak}
                      onChange={(e) => {
                        setIlhak(e.target.value);
                        if (searchStatus !== "idle") setSearchStatus("idle");
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
                      <p className="text-xs text-emerald-600 font-medium">✓ {ilhak.trim().length === 11 && ilhak.trim().startsWith("01") ? "মোবাইল নম্বর" : "ইলহাক"} অনুযায়ী পূর্বের তথ্য অটো-ফিল করা হয়েছে!</p>
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">মুহতামিম / আবেদনকারীর নাম <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="যেমন: মাওলানা মো: আবদুল্লাহ"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      মাদরাসা বা প্রতিষ্ঠানের নাম <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={instituteName}
                      onChange={(e) => setInstituteName(e.target.value)}
                      placeholder="যেমন: মুহাম্মাদনগর নূরানী ক্যাডেট মাদরাসা"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">মোবাইল নম্বর <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      value={contactNo}
                      onChange={(e) => setContactNo(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ইমেইল <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span></label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white text-sm"
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

                {/* Geo Cascade Address Selector with Separate Delivery Option */}
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

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600">
                  <span>পণ্যের মূল্য (সাবটোটাল):</span>
                  <span className="font-semibold text-slate-800">৳{total.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span>কুরিয়ার চার্জ ({deliveryInfo.courierName}):</span>
                    <span className="text-[10px] sm:text-[11px] px-1.5 py-0.5 bg-amber-50 text-amber-700 font-medium rounded border border-amber-200">
                      {deliveryInfo.totalWeightKg} কেজি
                    </span>
                  </span>
                  {deliveryInfo.isFreeDelivery ? (
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs">ফ্রি ডেলিভারি 🎉</span>
                  ) : (
                    <span className="font-bold text-slate-800">৳{deliveryInfo.deliveryCharge.toFixed(2)}</span>
                  )}
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-sm sm:text-base">সর্বমোট প্রদেয় বিল:</span>
                  <span className="text-xl sm:text-2xl font-black text-primary">৳{grandTotal.toFixed(2)}</span>
                </div>
                <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-start gap-1.5">
                  <span className="shrink-0 text-sm">🚚</span>
                  <span>{deliveryInfo.ruleNotice}</span>
                </p>
                {deliveryInfo.isOverweight && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium">
                    ⚠️ মোট পার্সেলের ওজন ১৫ কেজির বেশি ({deliveryInfo.totalWeightKg} কেজি)। কুরিয়ার বা বিশেষ ট্রান্সপোর্টের ক্ষেত্রে অতিরিক্ত পার্সেল হতে পারে।
                  </p>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => onClose({ ilhak, ownerName, instituteName, contactNo, customerEmail, customerPassword, address: geoAddress.fullAddress || address, geoAddress, hasSeparateDelivery, deliveryAddress, searchStatus, paymentStep })}
                  className="w-1/2 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all border border-slate-200"
                >
                  আরও পণ্য যোগ করুন
                </button>
                <button
                  onClick={validateAndProceed}
                  className="w-1/2 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/25 active:scale-[0.98]"
                >
                  পেমেন্ট অপশন
                </button>
              </div>
            </>
          ) : (
            <div className="animate-in slide-in-from-right-4">
              <h3 className="font-bold text-slate-700 mb-4 text-center">কিভাবে পেমেন্ট করতে চান?</h3>
              {errorMsg && <p className="mb-4 text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{errorMsg}</p>}

              <div className="space-y-3 mb-6">
                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${paymentOption === 'pay_now' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 hover:border-primary/50'}`}>
                  <input type="radio" name="payment_opt" checked={paymentOption === 'pay_now'} onChange={() => setPaymentOption('pay_now')} className="w-5 h-5 text-primary" />
                  <span className="font-bold text-slate-700">এখনই পেমেন্ট করুন</span>
                </label>

                {paymentOption === 'pay_now' && (
                  <div className="pl-12 pr-4 pb-4 animate-in fade-in">
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {[
                        { id: 'bKash', name: 'bKash', logo: 'https://freelogopng.com/images/all_img/1656234745bkash-app-logo-png.png' },
                        { id: 'Nagad', name: 'Nagad', logo: 'https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png' },
                        { id: 'Rocket', name: 'Rocket', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Rocket_mobile_banking_logo.svg/512px-Rocket_mobile_banking_logo.svg.png' },
                        { id: 'Bank', name: 'Bank' }
                      ].map(p => (
                        <button
                          key={p.id}
                          onClick={() => setPaymentProvider(p.id as any)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border-2 ${paymentProvider === p.id ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-300 bg-white'}`}
                        >
                          <div className="h-10 flex items-center justify-center">
                            {p.logo ? (
                              <img src={p.logo} alt={p.name} className="max-h-full max-w-full object-contain" />
                            ) : (
                              <Building2 className={`w-8 h-8 ${paymentProvider === p.id ? 'text-primary' : 'text-slate-600'}`} />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-800 font-medium mb-1">এই নাম্বারে টাকা পাঠিয়ে TrxID দিন:</p>
                        <p className="text-lg font-black text-blue-900 tracking-wider">
                          {paymentProvider === 'bKash' ? '01700000000 (bKash)' :
                            paymentProvider === 'Nagad' ? '01700000000 (Nagad)' :
                              paymentProvider === 'Rocket' ? '01700000000 (Rocket)' : 'A/C: 123456789, Islami Bank'}
                        </p>
                      </div>
                      <button
                        onClick={handleCopy}
                        className="flex flex-col items-center justify-center bg-white border border-blue-200 text-blue-600 rounded-lg w-12 h-12 hover:bg-blue-100 transition-colors flex-shrink-0"
                        title="নম্বর কপি করুন"
                      >
                        {copied ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                        <span className="text-[10px] font-bold mt-1">{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">ট্রানজেকশন আইডি (TrxID) <span className="text-red-500">*</span></label>
                      <input type="text" value={trxId} onChange={e => setTrxId(e.target.value)} placeholder="Enter TrxID" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                )}

                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${paymentOption === 'money_receipt' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 hover:border-primary/50'}`}>
                  <input type="radio" name="payment_opt" checked={paymentOption === 'money_receipt'} onChange={() => setPaymentOption('money_receipt')} className="w-5 h-5 text-primary" />
                  <span className="font-bold text-slate-700">মানি রিসিট আছে</span>
                </label>

                {paymentOption === 'money_receipt' && (
                  <div className="pl-12 pr-4 pb-4 animate-in fade-in space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">মানি রিসিট নম্বর <span className="text-red-500">*</span></label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={receiptNumber}
                          onChange={e => {
                            setReceiptNumber(e.target.value);
                            if (receiptVerifyStatus !== 'idle') {
                              setReceiptVerifyStatus('idle');
                              setReceiptVerifyMsg('');
                              setReceiptBalance(0);
                            }
                          }}
                          placeholder="Receipt Number"
                          className={`flex-1 px-4 py-2.5 rounded-lg border focus:outline-none focus:border-primary transition-all ${receiptVerifyStatus === 'valid' ? 'border-emerald-400 bg-emerald-50' : receiptVerifyStatus === 'invalid' ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                        />
                        <button
                          onClick={verifyReceipt}
                          disabled={receiptVerifyStatus === 'verifying' || !receiptNumber.trim()}
                          className="px-4 py-2.5 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 text-sm flex-shrink-0"
                        >
                          {receiptVerifyStatus === 'verifying' ? 'যাচাই...' : 'যাচাই করুন'}
                        </button>
                      </div>
                      {receiptVerifyMsg && (
                        <p className={`text-xs mt-1.5 font-medium ${receiptVerifyStatus === 'valid' ? 'text-emerald-600' : 'text-red-500'}`}>
                          {receiptVerifyMsg}
                        </p>
                      )}
                    </div>

                    {/* === PARTIAL BALANCE PANEL === */}
                    {receiptVerifyStatus === 'valid' && receiptBalance < grandTotal && (
                      <div className="border border-amber-200 rounded-xl overflow-hidden">
                        {/* Balance breakdown */}
                        <div className="bg-amber-50 p-3 space-y-1.5">
                          <p className="text-xs font-bold text-amber-800">বালান্স বিবরণ:</p>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">মোট বিল:</span>
                            <span className="font-bold text-slate-800">৳{grandTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-emerald-600">রিসিট ব্যালান্স:</span>
                            <span className="font-bold text-emerald-600">-৳{receiptBalance.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm border-t border-amber-200 pt-1.5">
                            <span className="text-red-600 font-bold">বাকি পরিশোধ করতে হবে:</span>
                            <span className="font-black text-red-600">৳{(grandTotal - receiptBalance).toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Options for remaining */}
                        <div className="bg-white p-3 space-y-2">
                          <p className="text-xs font-bold text-slate-700 mb-2">বাকি টাকা কিভাবে দিবেন?</p>

                          {/* Pay now for remaining */}
                          <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-sm ${remainingOption === 'pay_now' ? 'border-primary bg-primary/5' : 'border-slate-200'}`}>
                            <input type="radio" checked={remainingOption === 'pay_now'} onChange={() => setRemainingOption('pay_now')} className="w-4 h-4 text-primary" />
                            <span className="font-bold">এখনই বাকি পেমেন্ট করব</span>
                          </label>

                          {remainingOption === 'pay_now' && (
                            <div className="pl-6 space-y-2 animate-in fade-in">
                              <div className="grid grid-cols-4 gap-1.5">
                                {[
                                  { id: 'bKash', logo: 'https://freelogopng.com/images/all_img/1656234745bkash-app-logo-png.png' },
                                  { id: 'Nagad', logo: 'https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png' },
                                  { id: 'Rocket', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Rocket_mobile_banking_logo.svg/512px-Rocket_mobile_banking_logo.svg.png' },
                                  { id: 'Bank' }
                                ].map(p => (
                                  <button key={p.id} onClick={() => setRemainingProvider(p.id as any)}
                                    className={`flex items-center justify-center p-1.5 rounded-lg border-2 transition-all ${remainingProvider === p.id ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white'}`}
                                  >
                                    {p.logo ? <img src={p.logo} alt={p.id} className="h-7 object-contain" /> : <Building2 className="w-6 h-6 text-slate-500" />}
                                  </button>
                                ))}
                              </div>
                              <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-blue-700 font-medium">বাকি ৳{(total - receiptBalance).toFixed(2)} পাঠান:</p>
                                  <p className="text-sm font-black text-blue-900">
                                    {remainingProvider === 'Bank' ? 'A/C: 123456789' : `01700000000 (${remainingProvider})`}
                                  </p>
                                </div>
                                <button onClick={() => { navigator.clipboard.writeText(remainingProvider === 'Bank' ? '123456789' : '01700000000'); setRemainingCopied(true); setTimeout(() => setRemainingCopied(false), 2000); }}
                                  className="bg-white border border-blue-200 text-blue-600 rounded-lg p-2 hover:bg-blue-100"
                                >
                                  {remainingCopied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                              </div>
                              <input type="text" value={remainingTrxId} onChange={e => setRemainingTrxId(e.target.value)}
                                placeholder="বাকি টাকার TrxID লিখুন"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary text-sm" />
                            </div>
                          )}

                          {/* Pay later for remaining */}
                          <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-sm ${remainingOption === 'pay_later' ? 'border-primary bg-primary/5' : 'border-slate-200'}`}>
                            <input type="radio" checked={remainingOption === 'pay_later'} onChange={() => setRemainingOption('pay_later')} className="w-4 h-4 text-primary" />
                            <span className="font-bold">বাকি পরে দেব (বাকি বাকি থাকবে)</span>
                          </label>

                          {/* Skip — don't use receipt */}
                          <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-sm ${remainingOption === 'skip_receipt' ? 'border-amber-400 bg-amber-50' : 'border-slate-200'}`}>
                            <input type="radio" checked={remainingOption === 'skip_receipt'} onChange={() => setRemainingOption('skip_receipt')} className="w-4 h-4 text-amber-500" />
                            <span className="font-bold text-amber-700">রিসিট অ্যাপর্যায় — এখন ব্যবহার করব না</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${paymentOption === 'pay_later' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 hover:border-primary/50'}`}>
                  <input type="radio" name="payment_opt" checked={paymentOption === 'pay_later'} onChange={() => setPaymentOption('pay_later')} className="w-5 h-5 text-primary" />
                  <span className="font-bold text-slate-700">পরে পেমেন্ট করব</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setPaymentStep(false)} className="px-5 py-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                  ফিরে যান
                </button>
                <button
                  onClick={submitOrder}
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-70"
                >
                  {isSubmitting ? "অপেক্ষা করুন..." : "অর্ডার সম্পূর্ণ করুন"}
                </button>
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
              <tr><th>পণ্যের নাম</th><th class="text-center">পরিমাণ</th><th class="text-right">একক মূল্য</th><th class="text-right">মোট মূল্য</th></tr>
              ${orderToPrint.items.map((i: any) => `<tr><td>${i.product.name}</td><td class="text-center">${i.quantity}</td><td class="text-right">${i.unitPrice} ৳</td><td class="text-right">${(i.quantity * i.unitPrice).toFixed(2)} ৳</td></tr>`).join('')}
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
              <strong>🚚 কুরিয়ার নীতিমালা:</strong> ৫,০০০ টাকার কম অর্ডারে “পাঠাও কুরিয়ার”-এর মাধ্যমে পাঠানো হয় (প্রথম ২ কেজি ১৮০ ৳, পরের প্রতি কেজি ২৫ ৳, সর্বোচ্চ ১৫ কেজি)। ৫,০০০ ৳ বা তদূর্ধ্ব অর্ডারে ফ্রি ডেলিভারি।
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
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
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

  useEffect(() => {
    setIsMounted(true);
    fetch("/api/store/products")
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
    // Load view mode from localStorage
    try {
      const savedView = localStorage.getItem("store_view_mode");
      if (savedView === "card" || savedView === "list") setViewMode(savedView);
    } catch { }
    // Load favourites from localStorage
    try {
      const fav = JSON.parse(localStorage.getItem("store_favourites") || "[]");
      setFavourites(new Set(fav));
    } catch { }
    // Load cart from localStorage
    try {
      const savedCart = JSON.parse(localStorage.getItem("store_cart") || "[]");
      if (Array.isArray(savedCart) && savedCart.length > 0) {
        setCart(savedCart);
      }
    } catch { }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, []);

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
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty } : i);
      return [...prev, { product, qty }];
    });
  };

  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const deliveryInfo = useMemo(() => calculateDeliveryCost(cart), [cart]);
  const grandTotal = cartTotal + deliveryInfo.deliveryCharge;

  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category))), [products]);
  const highestPrice = useMemo(() => products.length > 0 ? Math.max(...products.map(p => p.price)) : 1000, [products]);

  const getProductRating = (id: string) => STAR_RATINGS[id] || { rating: 4 + Math.random(), reviews: Math.floor(Math.random() * 50) + 5 };

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (selectedCategories.size > 0) list = list.filter(p => selectedCategories.has(p.category));
    if (showOnlyInStock) list = list.filter(p => p.stock > 0);
    if (showOnlyFavourites) list = list.filter(p => favourites.has(p.id));
    if (minPrice) list = list.filter(p => p.price >= parseFloat(minPrice));
    if (maxPrice) list = list.filter(p => p.price <= parseFloat(maxPrice));
    if (ratingFilter > 0) list = list.filter(p => getProductRating(p.id).rating >= ratingFilter);
    if (sortBy === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "rating") list.sort((a, b) => getProductRating(b.id).rating - getProductRating(a.id).rating);
    return list;
  }, [products, search, selectedCategories, showOnlyInStock, showOnlyFavourites, favourites, minPrice, maxPrice, sortBy, ratingFilter]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col bg-slate-50 overflow-hidden">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 z-30 shadow-sm flex-shrink-0">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-3 flex items-center justify-between gap-3">
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
                placeholder="পণ্য খুঁজুন..."
                lang="bn"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
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
              className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 hidden md:block">
              <option value="default">ডিফল্ট</option>
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
              className="p-2.5 bg-slate-100 text-slate-600 rounded-xl transition-colors hover:bg-slate-200 flex items-center justify-center"
            >
              {viewMode === "card" ? <List className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col lg:flex-row flex-1 overflow-hidden relative bg-slate-50">

        {/* Main Content */}
        <div className="flex-1 min-w-0 h-full flex flex-col px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          {/* Horizontal Category Tabs (Mobile & Desktop) */}
          <div className="w-full overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex-shrink-0">
            <div className="flex items-center gap-2 w-max">
              <button
                onClick={(e) => {
                  setSelectedCategories(new Set());
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
                className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${selectedCategories.size === 0 ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}
              >
                সকল
              </button>
              {categories.map(cat => {
                const isSelected = selectedCategories.has(cat);
                return (
                  <button
                    key={cat}
                    onClick={(e) => {
                      toggleCategory(cat);
                      e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }}
                    className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${isSelected ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Delivery Policy Announcement Banner */}
          <div className="mb-3.5 p-3 sm:p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/70 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-sm flex-shrink-0">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0">
                <Truck className="w-4 h-4" />
              </div>
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                <span className="font-bold text-emerald-800">এজেন্ট ও কেন্দ্রের ডেলিভারি নীতিমালা:</span> ৫,০০০ টাকার কম অর্ডার হলে <strong className="text-slate-900">“পাঠাও কুরিয়ার”</strong>-এর মাধ্যমে পাঠানো হবে (সর্বোচ্চ ১৫ কেজি পর্যন্ত)। কুরিয়ার খরচ: প্রথম ২ কেজি ১৮০ ৳, পরবর্তী প্রতি কেজি ২৫ ৳। <span className="inline-block font-bold text-emerald-700 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-300 ml-1">৫,০০০ ৳ বা তদূর্ধ্ব অর্ডারে ফ্রি ডেলিভারি!</span>
              </div>
            </div>
          </div>

          {/* Results Bar */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <p className="text-sm text-slate-500 font-medium">
              {loading ? "লোড হচ্ছে..." : <><span className="font-bold text-slate-700">{filtered.length}</span> টি পণ্য পাওয়া গেছে</>}
            </p>
            {/* Mobile sort */}
            <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 md:hidden">
              <option value="default">ডিফল্ট</option>
              <option value="price-asc">মূল্য ↑</option>
              <option value="price-desc">মূল্য ↓</option>
              <option value="name">নাম</option>
            </select>
          </div>

          {/* Scrollable Products Area */}
          <div className="flex-1 overflow-y-auto pr-1 pb-10">

            {/* CARD VIEW */}
            {viewMode === "card" && (
              <>
                {!loading && filtered.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                    <Package className="w-16 h-16 mb-4 text-slate-200" />
                    <p className="text-lg font-bold">কোনো পণ্য পাওয়া যায়নি</p>
                    <p className="text-sm mt-1">অনুসন্ধান বা ফিল্টার পরিবর্তন করুন</p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,240px)] justify-stretch sm:justify-start gap-4 sm:gap-5">
                  {loading ? Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse flex flex-row sm:flex-col">
                      <div className="w-32 sm:w-full aspect-square sm:aspect-[4/3] flex-shrink-0 bg-slate-100" />
                      <div className="p-3 sm:p-4 flex flex-col gap-2 flex-1">
                        <div className="h-4 bg-slate-100 rounded w-3/4" />
                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                        <div className="h-6 bg-slate-100 rounded w-1/3 mt-auto pt-2" />
                      </div>
                    </div>
                  )) : filtered.map(product => {
                    const r = getProductRating(product.id);
                    const isFav = favourites.has(product.id);
                    const cartItem = cart.find(c => c.product.id === product.id);
                    const cartQty = cartItem ? cartItem.qty : 0;

                    return (
                      <div key={product.id} onClick={() => setDetailProduct(product)} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden group flex flex-row sm:flex-col cursor-pointer">
                        <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 w-32 sm:w-full aspect-square sm:aspect-[4/3] flex-shrink-0 flex items-center justify-center overflow-hidden border-r sm:border-r-0 sm:border-b border-slate-100">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 group-hover:scale-105 transition-transform" />
                          )}
                          <span className="absolute bottom-2 left-2 text-[10px] sm:text-xs text-primary font-bold bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm z-10 max-w-[calc(100%-16px)] truncate">
                            {product.category}
                          </span>
                        </div>
                        <div className="flex flex-1 min-w-0">
                          <div className="p-3 flex flex-col flex-1 min-w-0 border-r border-slate-50 border-dashed">
                            <h3 className="font-bold text-slate-800 mb-1 line-clamp-2 sm:line-clamp-1">{product.name}</h3>
                            {product.className && (
                              <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">
                                {product.className}{product.subject ? ` - ${product.subject}` : ''}
                              </p>
                            )}
                            <div className="mt-auto pt-2">
                              <span className="text-xl font-black text-primary">৳{product.price}</span>
                            </div>
                          </div>
                          <div className="w-14 flex flex-col items-center justify-center bg-slate-50/50 p-2">
                            {cartQty > 0 ? (
                              <div className="flex flex-col items-center gap-1 h-full justify-between w-full" onClick={e => e.stopPropagation()}>
                                <button onClick={() => updateCartQty(product, cartQty + 1)}
                                  className="w-full h-8 bg-primary rounded text-white text-xl font-medium flex items-center justify-center hover:bg-primary/90 transition-colors">+</button>
                                <span className="w-full flex-1 flex items-center justify-center text-sm font-black text-slate-800 py-1">{cartQty}</span>
                                <button onClick={() => updateCartQty(product, cartQty - 1)}
                                  className="w-full h-8 bg-slate-200 rounded text-slate-600 text-xl font-medium flex items-center justify-center hover:bg-slate-300 transition-colors">−</button>
                              </div>
                            ) : (
                              <button onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-sm">
                                <ShoppingCart className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* LIST VIEW */}
            {viewMode === "list" && (
              <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden flex-1 mb-4 flex flex-col">
                <div className="bg-[#e8f3ec] text-[#2f8c5b] py-3 text-center font-black text-xl border-b border-slate-200">
                  বই ও স্টেশনারী আইটেম অনলাইন-এ অর্ডার করুন
                </div>
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left border-collapse min-w-full sm:min-w-[800px]">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-[#2f8c5b] text-white text-sm">
                        <th className="p-3 font-bold text-center border-r border-white/20 w-16 hidden sm:table-cell">ক্রম</th>
                        <th className="p-3 font-bold text-center border-r border-white/20 w-16 sm:w-20 hidden sm:table-cell">ছবি</th>
                        <th className="p-3 font-bold text-center border-r border-white/20 w-20 hidden sm:table-cell">কোড</th>
                        <th className="p-3 font-bold text-center border-r border-white/20">পণ্যের নাম</th>
                        <th className="p-3 font-bold text-center border-r border-white/20 w-24">শ্রেণী</th>
                        <th className="p-3 font-bold text-center border-r border-white/20 w-28 hidden sm:table-cell">ক্যাটাগরি</th>
                        <th className="p-3 font-bold text-center border-r border-white/20 w-20 sm:w-32">মূল্য(৳)</th>
                        <th className="p-3 font-bold text-center border-r border-white/20 w-28 sm:w-48">পরিমাণ</th>
                        <th className="p-3 font-bold text-right pr-6 w-36 hidden sm:table-cell">পরিমাণ*মূল্য(৳)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!loading && filtered.length === 0 && (
                        <tr>
                          <td colSpan={8}>
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
                          <td colSpan={8} className="p-4"><div className="h-8 bg-slate-100 rounded w-full" /></td>
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
                    <tfoot className="sticky bottom-0 z-10 bg-white">
                      <tr className="bg-slate-50 font-bold border-t border-slate-200 hidden sm:table-row">
                        <td colSpan={8} className="p-4 text-right text-slate-800">সর্বমোট অর্ডারকৃত পণ্যের মূল্য(৳) =</td>
                        <td className="p-4 text-right pr-6 text-lg text-slate-900">{cartTotal.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="bg-white border-t border-slate-200 p-6 hidden sm:flex flex-col items-center">
                  <p className="text-red-500 font-bold text-lg mb-4 text-center">অর্ডারকৃত পণ্যের পরিমাণ সঠিকভাবে বসানোর পর নিচের "বিলে যুক্ত করুন" বাটনে ক্লিক করুন</p>
                  <button onClick={() => setIsOrderModalOpen(true)} className="px-8 py-3 bg-[#2d3282] hover:bg-[#2d3282]/90 text-white rounded font-bold transition-colors shadow-md">
                    বিলে যুক্ত করুন
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Cart */}
        <aside className={`
          hidden xl:flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out h-full overflow-hidden bg-white
          ${rightSidebarOpen ? "w-96 border-l border-slate-200 opacity-100" : "w-0 border-l-0 opacity-0"}
        `}>
          <div className="flex flex-col h-full w-96 flex-shrink-0">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-800 text-base flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-primary" /> আমার কার্ট</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-5 flex flex-col">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-slate-400">
                  <ShoppingBag className="w-12 h-12 mb-3 text-slate-200" />
                  <p className="font-medium text-sm">কার্ট খালি আছে</p>
                </div>
              ) : (
                <div className="flex flex-col mb-4">
                  {cart.map((item, i) => (
                    <div key={i} className="flex gap-4 p-3 relative group bg-white border border-slate-100 rounded-2xl shadow-sm mb-3 hover:shadow-md transition-all">
                      <div className="w-20 h-20 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-100">
                        {item.product.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-contain p-2" />
                        ) : (
                          <Package className="w-8 h-8 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-slate-900 text-base line-clamp-1 pr-2">{item.product.name}</p>
                          <button onClick={() => setCart(prev => prev.filter(c => c.product.id !== item.product.id))} className="text-slate-300 hover:text-red-500 transition-colors mt-0.5 bg-slate-50 hover:bg-red-50 rounded-full p-1">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {item.product.category}
                          {item.product.className && <span className="ml-1 text-slate-500 font-medium">({item.product.className})</span>}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-bold text-slate-900 text-base">৳{(item.product.price * item.qty).toFixed(2)}</span>
                          <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-1.5 py-1.5 border border-slate-200">
                            <button onClick={() => setCart(prev => prev.map(c => c.product.id === item.product.id ? { ...c, qty: Math.max(1, c.qty - 1) } : c))}
                              className="w-7 h-7 bg-white rounded-md shadow-sm text-slate-600 text-lg font-medium flex items-center justify-center hover:bg-slate-100 transition-colors">−</button>
                            <span className="w-5 text-center text-sm font-bold text-slate-800">{item.qty}</span>
                            <button onClick={() => setCart(prev => prev.map(c => c.product.id === item.product.id ? { ...c, qty: c.qty + 1 } : c))}
                              className="w-7 h-7 bg-primary rounded-md shadow-sm text-white text-lg font-medium flex items-center justify-center hover:bg-primary/90 transition-colors">+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-white z-10 relative space-y-3">
                <div className="space-y-1.5 text-xs sm:text-sm text-slate-600 border-b border-slate-100 pb-2.5">
                  <div className="flex justify-between">
                    <span>পণ্যের মূল্য (সাবটোটাল):</span>
                    <span className="font-bold text-slate-800">৳{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <span>কুরিয়ার ({deliveryInfo.courierName}):</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 font-bold rounded border border-amber-200">
                        {deliveryInfo.totalWeightKg} কেজি
                      </span>
                    </span>
                    {deliveryInfo.isFreeDelivery ? (
                      <span className="font-bold text-emerald-600 text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">ফ্রি ডেলিভারি 🎉</span>
                    ) : (
                      <span className="font-bold text-slate-800">৳{deliveryInfo.deliveryCharge.toFixed(2)}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between text-slate-800 items-end">
                  <div>
                    <span className="font-bold text-sm block">সর্বমোট বিল</span>
                    <span className="text-[10px] text-slate-400">ডেলিভারি সহ</span>
                  </div>
                  <span className="text-xl font-black text-primary">৳{grandTotal.toFixed(2)}</span>
                </div>

                <button onClick={() => setIsOrderModalOpen(true)} className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 active:scale-[0.98]">
                  অর্ডার করুন
                </button>

                <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-start gap-1 leading-tight">
                  <span className="shrink-0 text-xs">🚚</span>
                  <span>{deliveryInfo.ruleNotice}</span>
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Floating Stylish Cart Summary (Mobile/Tablet) */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-sm bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/50 p-4 flex items-center justify-between animate-in slide-in-from-bottom-10 xl:hidden">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              {cartCount} টি পণ্য · {deliveryInfo.isFreeDelivery ? "ফ্রি ডেলিভারি" : `+${deliveryInfo.deliveryCharge} ৳ কুরিয়ার`}
            </span>
            <span className="text-xl font-black text-primary">৳{grandTotal.toFixed(2)}</span>
          </div>
          <button onClick={() => setCartOpen(true)} className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 transition-all flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" /> কার্ট দেখুন
          </button>
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
        />
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-primary" /> আমার কার্ট</h2>
              <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 flex flex-col">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-slate-400">
                  <ShoppingBag className="w-12 h-12 mb-3 text-slate-200" />
                  <p className="font-medium">কার্ট খালি আছে</p>
                </div>
              ) : (
                <div className="flex flex-col mb-4">
                  {cart.map((item, i) => (
                    <div key={i} className="flex gap-4 p-3 relative group bg-white border border-slate-100 rounded-2xl shadow-sm mb-3 hover:shadow-md transition-all">
                      <div className="w-20 h-20 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-100">
                        {item.product.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-contain p-2" />
                        ) : (
                          <Package className="w-8 h-8 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-slate-900 text-base line-clamp-1 pr-2">{item.product.name}</p>
                          <button onClick={() => setCart(prev => prev.filter(c => c.product.id !== item.product.id))} className="text-slate-300 hover:text-red-500 transition-colors mt-0.5 bg-slate-50 hover:bg-red-50 rounded-full p-1">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-sm text-slate-400 mt-0.5">
                          {item.product.category}
                          {item.product.className && <span className="ml-1 text-slate-500 font-medium">({item.product.className})</span>}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-bold text-slate-900 text-lg">৳{(item.product.price * item.qty).toFixed(2)}</span>
                          <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-1.5 py-1.5 border border-slate-200">
                            <button onClick={() => setCart(prev => prev.map(c => c.product.id === item.product.id ? { ...c, qty: Math.max(1, c.qty - 1) } : c))}
                              className="w-7 h-7 bg-white rounded-md shadow-sm text-slate-600 text-lg font-medium flex items-center justify-center hover:bg-slate-100 transition-colors">−</button>
                            <span className="w-5 text-center text-sm font-bold text-slate-800">{item.qty}</span>
                            <button onClick={() => setCart(prev => prev.map(c => c.product.id === item.product.id ? { ...c, qty: c.qty + 1 } : c))}
                              className="w-7 h-7 bg-primary rounded-md shadow-sm text-white text-lg font-medium flex items-center justify-center hover:bg-primary/90 transition-colors">+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-white z-10 relative space-y-3">
                <div className="space-y-1.5 text-xs sm:text-sm text-slate-600 border-b border-slate-100 pb-2.5">
                  <div className="flex justify-between">
                    <span>পণ্যের মূল্য:</span>
                    <span className="font-bold text-slate-800">৳{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <span>কুরিয়ার ({deliveryInfo.courierName}):</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 font-bold rounded border border-amber-200">
                        {deliveryInfo.totalWeightKg} কেজি
                      </span>
                    </span>
                    {deliveryInfo.isFreeDelivery ? (
                      <span className="font-bold text-emerald-600 text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">ফ্রি ডেলিভারি 🎉</span>
                    ) : (
                      <span className="font-bold text-slate-800">৳{deliveryInfo.deliveryCharge.toFixed(2)}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between text-slate-800 items-end">
                  <div>
                    <span className="font-bold text-sm block">সর্বমোট বিল</span>
                    <span className="text-[10px] text-slate-400">ডেলিভারি সহ</span>
                  </div>
                  <span className="text-xl font-black text-primary">৳{grandTotal.toFixed(2)}</span>
                </div>

                <button onClick={() => setIsOrderModalOpen(true)} className="w-full py-3.5 bg-primary text-white rounded-xl font-black text-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 active:scale-[0.98]">
                  অর্ডার করুন
                </button>

                <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-start gap-1 leading-tight">
                  <span className="shrink-0 text-xs">🚚</span>
                  <span>{deliveryInfo.ruleNotice}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

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
            setTimeout(() => printInvoice(data), 500);
          }} />
      )}

      {/* Success Modal */}
      {successOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 flex flex-col items-center text-center max-h-[90vh] overflow-y-auto">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3 flex-shrink-0">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="font-black text-2xl text-slate-800 mb-1">অর্ডার সফল হয়েছে!</h3>
            <p className="text-slate-500 text-sm mb-4">আপনার অর্ডারটি আমাদের সিস্টেমে গ্রহণ করা হয়েছে। আপনার ইনভয়েস আইডি:</p>
            
            <div className="w-full bg-slate-100 text-slate-800 font-black text-lg px-4 py-2.5 rounded-xl mb-4 border border-slate-200 shadow-inner flex items-center justify-between gap-4">
              <span className="tracking-wider">{successOrder.invoiceId}</span>
              <button
                onClick={() => navigator.clipboard.writeText(successOrder.invoiceId)}
                title="কপি করুন"
                className="p-1.5 hover:bg-slate-200 rounded-md text-slate-500 hover:text-slate-700 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            {/* User Account Info Banner */}
            {successOrder.userAccount && (
              <div className="w-full mb-4 text-left bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-2">
                  <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{successOrder.userAccount.isNew ? "🎉 নতুন ইউজার অ্যাকাউন্ট তৈরি হয়েছে!" : "✓ বিদ্যমান অ্যাকাউন্টে অর্ডার সংরক্ষিত হয়েছে"}</span>
                </div>
                <div className="space-y-1 text-xs text-slate-700">
                  <p><strong className="text-slate-500">নাম:</strong> {successOrder.userAccount.name}</p>
                  <p><strong className="text-slate-500">লগইন আইডি / ফোন:</strong> {successOrder.userAccount.phone || successOrder.userAccount.email}</p>
                  {successOrder.userAccount.email && (
                    <p><strong className="text-slate-500">ইমেইল:</strong> {successOrder.userAccount.email}</p>
                  )}
                  
                  {successOrder.userAccount.isNew && (
                    <div className="mt-2 pt-2 border-t border-emerald-200/80">
                      <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-emerald-300/80 mb-2">
                        <span className="text-[11px] text-slate-600 font-medium">লগইন পাসওয়ার্ড:</span>
                        <span className="font-mono font-bold text-emerald-700 text-xs">{successOrder.userAccount.initialPassword || "আপনার সেট করা পাসওয়ার্ড"}</span>
                      </div>
                      
                      {/* Interactive password customize option */}
                      <div className="mt-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          পাসওয়ার্ড পরিবর্তন/সেট করতে চান?
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="password"
                            placeholder="নতুন পাসওয়ার্ড লিখুন..."
                            value={customPasswordInput}
                            onChange={(e) => {
                              setCustomPasswordInput(e.target.value);
                              setPasswordSaveStatus(null);
                            }}
                            className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white"
                          />
                          <button
                            onClick={handleSetPassword}
                            disabled={passwordSaving || !customPasswordInput.trim()}
                            className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 disabled:opacity-50 transition-colors flex-shrink-0"
                          >
                            {passwordSaving ? "..." : "সংরক্ষণ"}
                          </button>
                        </div>
                        {passwordSaveStatus && (
                          <p className={`text-[11px] mt-1 font-medium ${passwordSaveStatus.startsWith("success") ? "text-emerald-700" : "text-red-600"}`}>
                            {passwordSaveStatus.replace(/^(success|error):/, "")}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2.5 w-full">
              <button onClick={() => printInvoice(successOrder)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 text-sm">
                ইনভয়েস প্রিন্ট করুন
              </button>
              <button
                onClick={() => {
                  setSuccessOrder(null);
                  setCustomPasswordInput("");
                  setPasswordSaveStatus(null);
                }}
                className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors text-sm"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
