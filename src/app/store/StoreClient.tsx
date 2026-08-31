"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Search, ShoppingBag, Package, Heart, Star, LayoutGrid, List,
  SlidersHorizontal, X, ChevronRight, ShoppingCart, Eye, Filter
} from "lucide-react";
import { generateQRCodeDataUrl, generateBarcodeSVG } from "@/lib/qrHelper";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  imageUrl?: string | null;
  barcode?: string | null;
  className?: string | null;
  subject?: string | null;
  description?: string | null;
  rating?: number;
  reviews?: number;
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
  product, rating, isFav, toggleFav, addToCart, setDetailProduct 
}: { 
  product: Product, rating: any, isFav: boolean, 
  toggleFav: (id:string)=>void, addToCart: (p:Product, q:number)=>void, setDetailProduct: (p:Product)=>void 
}) {
  const [qty, setQty] = useState(1);
  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
       <td className="p-4">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-6 h-6 text-slate-300" />
                )}
             </div>
             <div className="flex flex-col">
                <h3 className="font-bold text-slate-800 text-sm line-clamp-1 cursor-pointer hover:text-primary transition-colors" onClick={() => setDetailProduct(product)}>{product.name}</h3>
                <StarDisplay rating={rating.rating} reviews={rating.reviews} />
             </div>
          </div>
       </td>
       <td className="p-4 text-sm text-slate-600 font-medium">
          <div className="flex flex-wrap gap-1">
            {(product.category || '').split(',').map(c => c.trim()).filter(Boolean).map(c => (
              <span key={c} className="bg-slate-100 px-2 py-0.5 rounded-md text-xs">{c}</span>
            ))}
          </div>
       </td>
       <td className="p-4 text-sm">
          {product.stock > 0 ? (
             <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">ইন স্টক</span>
          ) : (
             <span className="text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100">মজুদ শেষ</span>
          )}
       </td>
       <td className="p-4 font-black text-primary text-lg">৳{product.price}</td>
       <td className="p-4">
          <div className="flex items-center justify-end gap-3">
             <button onClick={() => toggleFav(product.id)} className={`p-1.5 rounded-lg border transition-colors ${isFav ? "border-red-200 bg-red-50 text-red-500" : "border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-400"}`}>
               <Heart className={`w-4 h-4 ${isFav ? "fill-red-500" : ""}`} />
             </button>
             <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden h-9">
                <button disabled={qty<=1} onClick={()=>setQty(q=>q-1)} className="px-2.5 h-full hover:bg-slate-100 text-slate-500 disabled:opacity-50 transition-colors">-</button>
                <span className="text-sm font-bold w-6 text-center text-slate-700">{qty}</span>
                <button onClick={()=>setQty(q=>q+1)} className="px-2.5 h-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors">+</button>
             </div>
             <button onClick={()=>{ addToCart(product, qty); setQty(1); }} className="flex items-center gap-1.5 px-4 h-9 bg-primary text-white rounded-lg transition-colors text-sm font-bold hover:bg-primary/90 whitespace-nowrap">
                <ShoppingCart className="w-4 h-4" /> {product.stock === 0 ? "প্রি-অর্ডার" : "যোগ"}
             </button>
          </div>
       </td>
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
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 h-56 flex items-center justify-center rounded-t-2xl overflow-hidden">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-24 h-24 text-slate-300" />
            )}
          </div>
          <button onClick={onClose} className="absolute top-3 right-3 bg-white/80 hover:bg-white p-2 rounded-full shadow transition-colors">
            <X className="w-4 h-4 text-slate-600" />
          </button>
          <button onClick={onToggleFav} className={`absolute top-3 left-3 bg-white/80 hover:bg-white p-2 rounded-full shadow transition-colors ${isFav ? "text-red-500" : "text-slate-400"}`}>
            <Heart className={`w-4 h-4 ${isFav ? "fill-red-500" : ""}`} />
          </button>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {(product.category || '').split(',').map(c => c.trim()).filter(Boolean).map(c => (
              <span key={c} className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{c}</span>
            ))}
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">{product.name}</h2>
          <StarDisplay rating={r.rating} reviews={r.reviews} />
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
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${product.stock > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
              {product.stock > 0 ? `${product.stock} ${product.unit} মজুদ` : "মজুদ শেষ"}
            </span>
          </div>
          <button
            onClick={() => { onAddToCart(product); onClose(); }}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" /> {product.stock === 0 ? "প্রি-অর্ডার করুন" : "কার্টে যোগ করুন"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StoreClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products] = useState<Product[]>(initialProducts);
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
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [ratingFilter, setRatingFilter] = useState(0);

  // Checkout & Invoice State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [instituteId, setInstituteId] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [successOrder, setSuccessOrder] = useState<any>(null);

  const [boardSettings, setBoardSettings] = useState<any>(null);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(setBoardSettings).catch(() => {});
    try {
      const fav = JSON.parse(localStorage.getItem("store_favourites") || "[]");
      setFavourites(new Set(fav));
    } catch { }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => { 
      document.body.style.overflow = "auto"; 
      document.documentElement.style.overflow = "auto";
    };
  }, []);

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

  const submitOrder = async () => {
    if (!customerName) {
      setOrderError("দয়া করে আপনার নাম লিখুন।");
      return;
    }
    setOrderLoading(true);
    setOrderError("");
    try {
      const items = cart.map(c => ({ productId: c.product.id, quantity: c.qty }));
      const res = await fetch("/api/store/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName, customerPhone, instituteId, items })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit order");
      
      setSuccessOrder(data);
      setCart([]);
      setCheckoutModalOpen(false);
      
      // Instantly trigger print preview
      setTimeout(() => {
        printInvoice(data);
      }, 500);
    } catch (e: any) {
      setOrderError(e.message);
    }
    setOrderLoading(false);
  };

  const printInvoice = async (orderToPrint = successOrder) => {
    if (!orderToPrint) return;

    const trackingUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/track?code=${orderToPrint.invoiceId}` 
      : orderToPrint.invoiceId;
    const qrCodeUrl = await generateQRCodeDataUrl(trackingUrl);
    const barcodeSVG = generateBarcodeSVG(orderToPrint.invoiceId);

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
      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).map(s => s.outerHTML).join('');
      doc.write(`
        <html>
          <head>
            <title>Invoice ${orderToPrint.invoiceId}</title>
            ${styles}
            <style>
              @page { size: auto; margin: 0; }
              body { font-family: var(--font-solaiman-lipi, 'SolaimanLipi'), sans-serif; padding: 15px; max-width: 100%; width: 100%; margin: 0; box-sizing: border-box; color: #1e293b; line-height: 1.4; background: #fff !important; }
              .invoice-container { border: none; overflow: hidden; width: 100%; }
              .header { text-align: center; border-bottom: 2px solid #16a34a; padding-bottom: 10px; margin-bottom: 10px; }
              .header img { max-width: 100%; height: auto; max-height: 70px; object-fit: contain; margin-bottom: 5px; }
              .header h2 { color: #16a34a; margin: 0; font-size: 20px; font-weight: bold; }
              .header p { margin: 2px 0 0; color: #64748b; font-size: 12px; }
              .content { padding: 0; width: 100%; }
              .info-section { display: flex; flex-direction: column; margin-bottom: 15px; width: 100%; gap: 10px; }
              .info-block { background: #f8fafc; padding: 10px; border-radius: 4px; border: 1px solid #e2e8f0; }
              .info-block p { margin: 2px 0; font-size: 13px; }
              .flex-between { display: flex; justify-content: space-between; align-items: center; }
              .institute-line { border-top: 1px dashed #cbd5e1; padding-top: 6px; margin-top: 6px; width: 100%; }
              table { width: 100%; border-collapse: collapse; margin-top: 5px; table-layout: fixed; }
              th { background: #16a34a; color: white; padding: 6px 8px; text-align: left; font-size: 13px; border: 1px solid #15803d; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              td { padding: 6px 8px; border: 1px solid #e2e8f0; font-size: 13px; word-wrap: break-word; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .totals-section { margin-top: 15px; display: flex; justify-content: flex-end; width: 100%; }
              .totals { width: 60%; min-width: 380px; background: #f8fafc; padding: 10px; border-radius: 4px; border: 1px solid #e2e8f0; }
              .totals div { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; }
              .grand-total { font-size: 16px; font-weight: bold; border-top: 2px solid #16a34a; padding-top: 8px !important; margin-top: 4px; color: #16a34a; }
              .qr-barcode-section { display: flex; justify-content: space-between; align-items: center; border-top: 2px dashed #cbd5e1; padding-top: 12px; margin-top: 20px; }
              .footer { text-align: center; padding: 10px 0 0; color: #94a3b8; font-size: 12px; margin-top: 8px; width: 100%; }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              <div class="header">
                ${boardSettings?.coverUrl ? `<img src="${boardSettings.coverUrl}" alt="Banner" />` : `<h2 style="color: #16a34a; margin-bottom: 0;">নূরানী তালিমুল কুরআন বোর্ড - অনলাইন অর্ডার</h2>`}
                <p>অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। অনুগ্রহ করে ইনভয়েসটি সংরক্ষণ করুন।</p>
              </div>
              <div class="content">
                <div class="info-section">
                  <div class="info-block flex-between">
                    <div>
                      <p><strong>ইনভয়েস নং:</strong> <span style="font-family: monospace; font-size: 15px; font-weight: bold;">${orderToPrint.invoiceId}</span></p>
                      <p><strong>তারিখ:</strong> ${new Date(orderToPrint.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    ${qrCodeUrl ? `
                      <div style="text-align: right;">
                        <img src="${qrCodeUrl}" alt="Invoice QR" style="width: 68px; height: 68px; border: 1px solid #cbd5e1; padding: 2px; border-radius: 6px;" />
                      </div>
                    ` : ''}
                  </div>
                  <div class="info-block">
                    <div class="flex-between">
                      <p><strong>ক্রেতার নাম:</strong> ${orderToPrint.customerName}</p>
                      <p><strong>মোবাইল নাম্বার:</strong> ${orderToPrint.customerPhone || 'N/A'}</p>
                    </div>
                    ${orderToPrint.instituteId ? `<div class="institute-line"><p><strong>প্রতিষ্ঠান:</strong> ${orderToPrint.instituteId}</p></div>` : ''}
                  </div>
                </div>
                <table>
                  <tr><th>পণ্যের নাম</th><th class="text-center">পরিমাণ</th><th class="text-right">একক মূল্য</th><th class="text-right">মোট মূল্য</th></tr>
                  ${orderToPrint.items.map((i: any) => `<tr><td>${i.product.name}</td><td class="text-center">${i.quantity}</td><td class="text-right">${i.unitPrice.toFixed(2)} ৳</td><td class="text-right">${(i.quantity * i.unitPrice).toFixed(2)} ৳</td></tr>`).join('')}
                </table>
                <div class="totals-section">
                  <div class="totals">
                    <div><span>বর্তমান বিল:</span><span>${orderToPrint.totalAmount.toFixed(2)} ৳</span></div>
                    ${orderToPrint.previousDueList && orderToPrint.previousDueList.length > 0 
                      ? orderToPrint.previousDueList.map((dueObj: any) => 
                          `<div style="font-size: 13px; color: #475569;"><span>বকেয়া (${dueObj.invoiceId} - ${new Date(dueObj.date).toLocaleDateString('bn-BD')}):</span><span>${dueObj.due.toFixed(2)} ৳</span></div>`
                        ).join('')
                      : (orderToPrint.previousDue ? `<div><span>পূর্বের বকেয়া:</span><span>${orderToPrint.previousDue.toFixed(2)} ৳</span></div>` : '')
                    }
                    ${orderToPrint.discount ? `<div><span>ছাড়:</span><span>-${orderToPrint.discount.toFixed(2)} ৳</span></div>` : ''}
                    <div class="grand-total"><span>সর্বমোট প্রদেয়:</span><span>${(orderToPrint.totalAmount + (orderToPrint.previousDue || 0) - (orderToPrint.discount || 0)).toFixed(2)} ৳</span></div>
                    <div><span>পরিশোধিত:</span><span>${(orderToPrint.paidAmount || 0).toFixed(2)} ৳</span></div>
                    <div style="font-weight: bold; color: #dc2626;"><span>বর্তমান বকেয়া:</span><span>${(orderToPrint.totalAmount + (orderToPrint.previousDue || 0) - (orderToPrint.discount || 0) - (orderToPrint.paidAmount || 0)).toFixed(2)} ৳</span></div>
                  </div>
                </div>
                <div class="qr-barcode-section">
                  <div style="text-align: left;">
                    <p style="margin: 0 0 4px; font-size: 11px; font-weight: bold; color: #475569;">বারকোড ট্র্যাকিং:</p>
                    ${barcodeSVG}
                  </div>
                  <div style="text-align: right;">
                    <p style="margin: 0 0 4px; font-size: 11px; font-weight: bold; color: #475569;">মোবাইল দিয়ে স্ক্যান করুন:</p>
                    ${qrCodeUrl ? `<img src="${qrCodeUrl}" alt="QR" style="width: 64px; height: 64px; display: inline-block;" />` : ''}
                  </div>
                </div>
              </div>
              <div class="footer">
                ধন্যবাদ আমাদের সাথে কেনাকাটা করার জন্য।
              </div>
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

  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const categories = useMemo(() => {
    const cats = products.flatMap(p => (p.category || '').split(',').map(c => c.trim()).filter(Boolean));
    return Array.from(new Set(cats));
  }, [products]);
  
  const highestPrice = useMemo(() => products.length > 0 ? Math.max(...products.map(p => p.price)) : 1000, [products]);

  const getProductRating = (id: string) => STAR_RATINGS[id] || { rating: 4 + Math.random(), reviews: Math.floor(Math.random() * 50) + 5 };

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || (p.barcode && p.barcode.toLowerCase().includes(q)));
    }
    if (selectedCategories.size > 0) {
      list = list.filter(p => {
        const productCats = (p.category || '').split(',').map(c => c.trim()).filter(Boolean);
        return productCats.some(c => selectedCategories.has(c));
      });
    }
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
      <div className="bg-white border-b border-slate-200 z-30 shadow-sm flex-shrink-0">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-1/4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
              <SlidersHorizontal className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-black text-slate-800 whitespace-nowrap hidden sm:block">বই ও স্টেশনারি</h1>
          </div>
          <div className="flex flex-1 justify-center items-center gap-2 max-w-2xl">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="পণ্যের নাম বা বারকোড দিয়ে খুঁজুন..."
                lang="en"
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>}
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 hidden md:block">
              <option value="default">ডিফল্ট</option>
              <option value="price-asc">মূল্য: কম থেকে বেশি</option>
              <option value="price-desc">মূল্য: বেশি থেকে কম</option>
              <option value="name">নামানুসারে</option>
              <option value="rating">রেটিং অনুযায়ী</option>
            </select>
            {/* View Toggle */}
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              <button onClick={() => setViewMode("card")} className={`p-1.5 rounded-lg transition-colors ${viewMode === "card" ? "bg-white text-primary shadow" : "text-slate-400"}`}><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-lg transition-colors ${viewMode === "list" ? "bg-white text-primary shadow" : "text-slate-400"}`}><List className="w-4 h-4" /></button>
            </div>
          </div>
          {/* Cart */}
          <div className="flex items-center justify-end w-1/4">
            <button onClick={() => {
                if (window.innerWidth >= 1280) setRightSidebarOpen(!rightSidebarOpen);
                else setCartOpen(true);
              }} 
              className="relative flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:block">কার্ট</span>
              {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col lg:flex-row flex-1 overflow-hidden relative bg-slate-50">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div className="absolute inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`
          absolute inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-all duration-300 ease-in-out
          lg:relative lg:z-auto lg:shadow-none lg:bg-white
          ${sidebarOpen 
             ? "translate-x-0 lg:ml-0 lg:border-r lg:border-slate-200 lg:w-64 lg:min-w-[240px] lg:opacity-100" 
             : "-translate-x-full lg:ml-0 lg:border-r-0 lg:w-0 lg:min-w-0 lg:opacity-0 lg:overflow-hidden"}
          flex-shrink-0 h-full overflow-hidden
        `}>
          <div className="p-5 lg:p-6 flex flex-col gap-6 h-full overflow-y-auto w-72 lg:w-64">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-800 text-base flex items-center gap-2"><Filter className="w-4 h-4" /> ফিল্টার</h3>
              <div className="flex items-center gap-3">
                <button onClick={() => { setSelectedCategories(new Set()); setShowOnlyInStock(false); setShowOnlyFavourites(false); setMinPrice(""); setMaxPrice(""); setRatingFilter(0); setSearch(""); }}
                  className="text-xs text-red-500 hover:underline font-medium">রিসেট</button>
                <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Categories */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">ক্যাটাগরি</p>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-3 cursor-pointer group select-none">
                  <input type="checkbox" className="hidden" checked={selectedCategories.size === 0} onChange={() => setSelectedCategories(new Set())} />
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${selectedCategories.size === 0 ? "border-primary bg-primary" : "border-slate-300 group-hover:border-primary"}`}>
                     {selectedCategories.size === 0 && <div className="w-2 h-2 rounded-sm bg-white" />}
                  </div>
                  <span className={`text-sm font-medium transition-colors ${selectedCategories.size === 0 ? "text-primary" : "text-slate-600 group-hover:text-slate-900"}`}>সকল</span>
                </label>
                {categories.map(cat => {
                  const isChecked = selectedCategories.has(cat);
                  return (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group select-none">
                      <input type="checkbox" className="hidden" checked={isChecked} onChange={() => toggleCategory(cat)} />
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${isChecked ? "border-primary bg-primary" : "border-slate-300 group-hover:border-primary"}`}>
                         {isChecked && <div className="w-2 h-2 rounded-sm bg-white" />}
                      </div>
                      <span className={`text-sm font-medium transition-colors ${isChecked ? "text-primary" : "text-slate-600 group-hover:text-slate-900"}`}>{cat}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">সর্বোচ্চ মূল্য</p>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">৳{maxPrice || highestPrice}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max={highestPrice} 
                step="10"
                value={maxPrice || highestPrice} 
                onChange={e => setMaxPrice(e.target.value)} 
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" 
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2">
                <span>৳0</span>
                <span>৳{highestPrice}</span>
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">সর্বনিম্ন রেটিং</p>
              <div className="flex gap-1">
                {[0, 3, 4, 5].map(r => (
                  <button key={r} onClick={() => setRatingFilter(r)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors ${ratingFilter === r ? "bg-amber-400 text-white border-amber-400" : "border-slate-200 text-slate-500 hover:border-amber-300"}`}>
                    {r === 0 ? "সকল" : `${r}★+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div onClick={() => setShowOnlyInStock(!showOnlyInStock)}
                  className={`w-10 h-5 rounded-full transition-colors ${showOnlyInStock ? "bg-primary" : "bg-slate-200"} relative flex-shrink-0`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showOnlyInStock ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
                <span className="text-sm text-slate-600 font-medium">শুধু মজুদ আছে</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div onClick={() => setShowOnlyFavourites(!showOnlyFavourites)}
                  className={`w-10 h-5 rounded-full transition-colors ${showOnlyFavourites ? "bg-red-500" : "bg-slate-200"} relative flex-shrink-0`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showOnlyFavourites ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
                <span className="text-sm text-slate-600 font-medium">শুধু পছন্দের পণ্য ❤️</span>
              </label>
            </div>
          </div>
        </aside>

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

          {/* Results Bar */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <p className="text-sm text-slate-500 font-medium">
              <span className="font-bold text-slate-700">{filtered.length}</span> টি পণ্য পাওয়া গেছে
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
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                  <Package className="w-16 h-16 mb-4 text-slate-200" />
                  <p className="text-lg font-bold">কোনো পণ্য পাওয়া যায়নি</p>
                  <p className="text-sm mt-1">অনুসন্ধান বা ফিল্টার পরিবর্তন করুন</p>
                </div>
              )}
              <div className="grid grid-cols-[repeat(auto-fill,240px)] justify-center sm:justify-start gap-5">
              {filtered.map(product => {
                const r = getProductRating(product.id);
                const isFav = favourites.has(product.id);
                return (
                  <div key={product.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden group flex flex-col">
                    <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 aspect-[4/3] w-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-slate-300 group-hover:scale-105 transition-transform" />
                      <button onClick={() => toggleFav(product.id)}
                        className={`absolute top-3 right-3 p-1.5 rounded-full bg-white/80 shadow hover:bg-white transition-colors ${isFav ? "text-red-500" : "text-slate-300"}`}>
                        <Heart className={`w-4 h-4 ${isFav ? "fill-red-500" : ""}`} />
                      </button>
                      {product.stock === 0 && (
                        <span className="absolute bottom-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">মজুদ শেষ</span>
                      )}
                      {product.stock > 0 && product.stock < 20 && (
                        <span className="absolute bottom-3 left-3 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">মজুদ কম</span>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {(product.category || '').split(',').map(c => c.trim()).filter(Boolean).map(c => (
                          <span key={c} className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full w-fit">{c}</span>
                        ))}
                      </div>
                      <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">{product.name}</h3>
                      <StarDisplay rating={r.rating} reviews={r.reviews} />
                      <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-50 mt-3">
                        <span className="text-xl font-black text-primary">৳{product.price}</span>
                        <div className="flex gap-2">
                          <button onClick={() => setDetailProduct(product)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors" title="বিস্তারিত">
                            <Eye className="w-4 h-4 text-slate-600" />
                          </button>
                          <button onClick={() => addToCart(product)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg transition-colors text-sm font-bold hover:bg-primary/90">
                            <ShoppingCart className="w-4 h-4" /> {product.stock === 0 ? "প্রি-অর্ডার" : "যোগ"}
                          </button>
                        </div>
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
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                    <th className="p-4 font-bold rounded-tl-2xl">পণ্য</th>
                    <th className="p-4 font-bold">ক্যাটাগরি</th>
                    <th className="p-4 font-bold">স্টক</th>
                    <th className="p-4 font-bold">মূল্য</th>
                    <th className="p-4 font-bold text-right rounded-tr-2xl">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5}>
                        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                          <Package className="w-16 h-16 mb-4 text-slate-200" />
                          <p className="text-lg font-bold">কোনো পণ্য পাওয়া যায়নি</p>
                          <p className="text-sm mt-1">অনুসন্ধান বা ফিল্টার পরিবর্তন করুন</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {filtered.map(product => {
                    const r = getProductRating(product.id);
                    const isFav = favourites.has(product.id);
                    return (
                      <ListProductRow 
                        key={product.id} product={product} rating={r} isFav={isFav} 
                        toggleFav={toggleFav} addToCart={addToCart} setDetailProduct={setDetailProduct} 
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </div>

        {/* Right Sidebar - Cart */}
        <aside className={`
          hidden xl:flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out h-full overflow-hidden bg-white
          ${rightSidebarOpen ? "w-80 border-l border-slate-200 opacity-100" : "w-0 border-l-0 opacity-0"}
        `}>
          <div className="flex flex-col h-full w-80 flex-shrink-0">
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
                    <div key={i} className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-slate-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-xs line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          ৳{item.product.price} × {item.qty} = <span className="font-bold text-slate-700">৳{(item.product.price * item.qty).toFixed(2)}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setCart(prev => prev.map(c => c.product.id === item.product.id ? { ...c, qty: Math.max(1, c.qty - 1) } : c))}
                          className="w-6 h-6 bg-slate-100 rounded-full text-xs font-bold flex items-center justify-center hover:bg-slate-200">−</button>
                        <span className="w-4 text-center text-xs font-bold">{item.qty}</span>
                        <button onClick={() => setCart(prev => prev.map(c => c.product.id === item.product.id ? { ...c, qty: c.qty + 1 } : c))}
                          className="w-6 h-6 bg-slate-100 rounded-full text-xs font-bold flex items-center justify-center hover:bg-slate-200">+</button>
                        <button onClick={() => setCart(prev => prev.filter(c => c.product.id !== item.product.id))} className="ml-1 text-red-400 hover:text-red-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {cart.length > 0 && (
                <div className="p-5 border border-slate-100 bg-slate-50/50 rounded-2xl mb-16">
                  <div className="flex flex-col gap-2 mb-4 border-b border-slate-200/50 pb-4">
                    <div className="flex justify-between text-slate-500 text-sm">
                      <span>সাবটোটাল ({cartCount} টি আইটেম)</span>
                      <span className="font-bold text-slate-700">৳{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-sm">
                      <span>ডেলিভারি চার্জ</span>
                      <span className="font-medium text-slate-500 text-xs">চেকআউটে যোগ হবে</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-slate-800 mb-4 items-end">
                    <span className="font-bold">সর্বমোট পরিমাণ</span>
                    <span className="text-xl font-black text-primary">৳{cartTotal.toFixed(2)}</span>
                  </div>
                  <button onClick={() => setCheckoutModalOpen(true)} className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors">
                    অর্ডার করুন
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

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
                    <div key={i} className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 text-slate-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-sm line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          ৳{item.product.price} × {item.qty} = <span className="font-bold text-slate-700">৳{(item.product.price * item.qty).toFixed(2)}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setCart(prev => prev.map(c => c.product.id === item.product.id ? { ...c, qty: Math.max(1, c.qty - 1) } : c))}
                          className="w-6 h-6 bg-slate-100 rounded-full text-sm font-bold flex items-center justify-center hover:bg-slate-200">−</button>
                        <span className="w-5 text-center text-sm font-bold">{item.qty}</span>
                        <button onClick={() => setCart(prev => prev.map(c => c.product.id === item.product.id ? { ...c, qty: c.qty + 1 } : c))}
                          className="w-6 h-6 bg-slate-100 rounded-full text-sm font-bold flex items-center justify-center hover:bg-slate-200">+</button>
                        <button onClick={() => setCart(prev => prev.filter(c => c.product.id !== item.product.id))} className="ml-1 text-red-400 hover:text-red-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {cart.length > 0 && (
                <div className="p-5 border border-slate-100 bg-slate-50/50 rounded-2xl mb-16">
                  <div className="flex flex-col gap-2 mb-4 border-b border-slate-200/50 pb-4">
                    <div className="flex justify-between text-slate-500 text-sm">
                      <span>সাবটোটাল ({cartCount} টি আইটেম)</span>
                      <span className="font-bold text-slate-700">৳{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-sm">
                      <span>ডেলিভারি চার্জ</span>
                      <span className="font-medium text-slate-500 text-xs">চেকআউটে যোগ হবে</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-slate-800 mb-4 items-end">
                    <span className="font-bold">সর্বমোট পরিমাণ</span>
                    <span className="text-xl font-black text-primary">৳{cartTotal.toFixed(2)}</span>
                  </div>
                  <button onClick={() => setCheckoutModalOpen(true)} className="w-full py-3 bg-primary text-white rounded-xl font-black text-lg hover:bg-primary/90 transition-colors">
                    অর্ডার করুন
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">অর্ডার নিশ্চিত করুন</h3>
              <button onClick={() => setCheckoutModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              {orderError && <p className="mb-4 text-red-500 text-sm bg-red-50 p-2 rounded">{orderError}</p>}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">আপনার নাম *</label>
                  <input value={customerName} onChange={e => setCustomerName(e.target.value)} type="text" placeholder="নাম লিখুন..." className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">মোবাইল নাম্বার</label>
                  <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} type="text" placeholder="017..." className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">প্রতিষ্ঠানের নাম বা ঠিকানা</label>
                  <input value={instituteId} onChange={e => setInstituteId(e.target.value)} type="text" placeholder="ঠিকানা..." className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary" />
                </div>
              </div>
              
              <button onClick={submitOrder} disabled={orderLoading || !customerName} className="w-full mt-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {orderLoading ? "অপেক্ষা করুন..." : "অর্ডার সাবমিট করুন"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successOrder && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="font-black text-2xl text-slate-800 mb-2">অর্ডার সফল হয়েছে!</h3>
            <p className="text-slate-500 mb-6">আপনার অর্ডারটি আমাদের সিস্টেমে গ্রহণ করা হয়েছে। আপনার ইনভয়েস আইডি:</p>
            <div className="bg-slate-100 text-slate-800 font-black text-xl px-4 py-2 rounded-lg mb-6 border border-slate-200 shadow-inner">
              {successOrder.invoiceId}
            </div>
            <div className="flex flex-col gap-3 w-full">
              <button onClick={printInvoice} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                ইনভয়েস প্রিন্ট করুন
              </button>
              <button onClick={() => setSuccessOrder(null)} className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
