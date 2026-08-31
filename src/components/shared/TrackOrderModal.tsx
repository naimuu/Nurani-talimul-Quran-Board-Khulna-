"use client";
import React, { useState, useEffect } from 'react';
import { Search, X, Package, CheckCircle2, Clock, Truck, Printer, Copy, Camera, QrCode, Sparkles, AlertCircle } from 'lucide-react';
import { QRScannerModal } from './QRScannerModal';
import { generateQRCodeDataUrl, generateBarcodeSVG } from '@/lib/qrHelper';

export function TrackOrderModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [invoiceId, setInvoiceId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [boardSettings, setBoardSettings] = useState<any>(null);
  const [printBW, setPrintBW] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(setBoardSettings).catch(() => {});
  }, []);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem("lastSearchedInvoice");
      if (saved && !invoiceId) {
        setInvoiceId(saved);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const fetchOrder = async (idToSearch: string) => {
    const cleanId = idToSearch.trim().toUpperCase();
    if (!cleanId) return;
    
    setLoading(true);
    setError('');
    setOrder(null);
    
    try {
      localStorage.setItem("lastSearchedInvoice", cleanId);
      const res = await fetch(`/api/store/orders/${cleanId}`);
      if (!res.ok) {
        throw new Error('অর্ডারটি পাওয়া যায়নি। অনুগ্রহ করে সঠিক ইনভয়েস নম্বরটি চেক করুন।');
      }
      const data = await res.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'অর্ডার ট্র্যাক করতে সমস্যা হয়েছে।');
    }
    setLoading(false);
  };

  const trackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(invoiceId);
  };

  const handleQRScanned = (scannedText: string) => {
    const cleanId = scannedText.trim().toUpperCase();
    setInvoiceId(cleanId);
    fetchOrder(cleanId);
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Completed' || status === 'Delivered') return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    if (status === 'Pending Order' || status === 'Pending') return <Clock className="w-5 h-5 text-amber-500" />;
    return <Truck className="w-5 h-5 text-blue-500" />;
  };

  const getStatusText = (status: string) => {
    if (status === 'Completed' || status === 'Delivered') return 'সম্পন্ন হয়েছে';
    if (status === 'Pending Order' || status === 'Pending') return 'অপেক্ষমান';
    if (status === 'Shipped') return 'ডেলিভারিতে রয়েছে';
    return status;
  };

  const printInvoice = async () => {
    if (!order) return;

    // Generate high-resolution QR code data URL containing the invoice / tracking URL
    const trackingUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/track?code=${order.invoiceId}` 
      : order.invoiceId;
    const qrCodeUrl = await generateQRCodeDataUrl(trackingUrl);
    const barcodeSVG = generateBarcodeSVG(order.invoiceId);

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
            <title>Invoice ${order.invoiceId}</title>
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
            ${printBW ? `
            <style>
              body { color: #000; background: #fff !important; }
              .header { border-bottom: 2px solid #000; }
              .header img { -webkit-filter: grayscale(100%) invert(100%) brightness(200%) invert(100%); filter: grayscale(100%) invert(100%) brightness(200%) invert(100%); }
              .header h2 { color: #000; }
              .header p { color: #000; }
              .info-block { background: #fff; border: 1px solid #000; }
              .info-block p { color: #000; }
              .institute-line { border-top: 1px dashed #000; }
              th { background: #000; border: 1px solid #000; color: #fff; }
              td { border: 1px solid #000; color: #000; }
              .totals { background: #fff; border: 1px solid #000; }
              .totals div { color: #000; }
              .grand-total { border-top: 2px solid #000; color: #000; }
              .qr-barcode-section { border-top: 2px dashed #000; }
              .footer { border-top: none; color: #000; }
            </style>
            ` : ''}
          </head>
          <body>
            <div class="invoice-container">
              <div class="header">
                ${boardSettings?.coverUrl ? '<img src="' + boardSettings.coverUrl + '" alt="Banner" />' : '<h1 style="color: #16a34a; margin-bottom: 0;">নূরানী তালিমুল কুরআন বোর্ড খুলনা</h1>'}
                <h2>কাস্টমার ইনভয়েস</h2>
                <p style="font-size: 11px; margin-top: 2px;">প্রধান কার্যালয়: মুহাম্মাদনগর বড় মাদরাসা, মাদরাসা সড়ক, জলমা - ৯২৬০, লবণচরা, খুলনা।</p>
                <p>অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। অনুগ্রহ করে ইনভয়েসটি সংরক্ষণ করুন।</p>
              </div>
              <div class="content">
                <div class="info-section">
                  <div class="info-block flex-between">
                    <div>
                      <p><strong>ইনভয়েস নং:</strong> <span style="font-family: monospace; font-size: 15px; font-weight: bold;">${order.invoiceId}</span></p>
                      <p><strong>তারিখ:</strong> ${new Date(order.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    ${qrCodeUrl ? `
                      <div style="text-align: right;">
                        <img src="${qrCodeUrl}" alt="Invoice QR" style="width: 68px; height: 68px; border: 1px solid #cbd5e1; padding: 2px; border-radius: 6px;" />
                      </div>
                    ` : ''}
                  </div>
                  <div class="info-block">
                    <div class="flex-between">
                      <p><strong>ক্রেতার নাম:</strong> ${order.customerName}</p>
                      <p><strong>মোবাইল নাম্বার:</strong> ${order.customerPhone || 'N/A'}</p>
                    </div>
                    ${order.instituteId ? `<div class="institute-line"><p><strong>প্রতিষ্ঠান:</strong> ${order.instituteId}</p></div>` : ''}
                    ${order.notes ? `<div class="institute-line"><p><strong>ঠিকানা / নোট:</strong> ${order.notes.replace(/\\(ইলহাক: 01\\d{9}\\)/g, '').trim()}</p></div>` : ''}
                  </div>
                </div>
                <table>
                  <tr><th>পণ্যের নাম</th><th class="text-center">পরিমাণ</th><th class="text-right">একক মূল্য</th><th class="text-right">মোট মূল্য</th></tr>
                  ${order.items.map((i: any) => "<tr><td>" + i.product.name + "</td><td class='text-center'>" + i.quantity + "</td><td class='text-right'>" + i.unitPrice.toFixed(2) + " ৳</td><td class='text-right'>" + (i.quantity * i.unitPrice).toFixed(2) + " ৳</td></tr>").join('')}
                </table>
                <div class="totals-section">
                  <div class="totals">
                    <div><span>বর্তমান বিল:</span><span>${order.totalAmount.toFixed(2)} ৳</span></div>
                    ${order.currentDueList && order.currentDueList.length > 0 
                      ? order.currentDueList.map((dueObj: any) => 
                          `<div style="font-size: 13px; color: #475569;"><span>অন্যান্য বকেয়া (${dueObj.invoiceId} - ${new Date(dueObj.date).toLocaleDateString('bn-BD')}):</span><span>${dueObj.due.toFixed(2)} ৳</span></div>`
                        ).join('')
                      : (order.currentTotalDue ? `<div><span>অন্যান্য বকেয়া:</span><span>${order.currentTotalDue.toFixed(2)} ৳</span></div>` : '')
                    }
                    ${order.discount ? `<div><span>ছাড়:</span><span>-${order.discount.toFixed(2)} ৳</span></div>` : ''}
                    <div class="grand-total"><span>সর্বমোট প্রদেয় (আজ পর্যন্ত):</span><span>${(order.totalAmount + (order.currentTotalDue || 0) - (order.discount || 0)).toFixed(2)} ৳</span></div>
                    <div><span>এই বিলের জন্য পরিশোধিত:</span><span>${(order.paidAmount || 0).toFixed(2)} ৳</span></div>
                    <div style="font-weight: bold; color: #dc2626;"><span>সর্বমোট বকেয়া:</span><span>${(order.totalAmount + (order.currentTotalDue || 0) - (order.discount || 0) - (order.paidAmount || 0)).toFixed(2)} ৳</span></div>
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

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Rich Frosted Backdrop Blur */}
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
          onClick={onClose}
        />

        {/* Modal Card - Glassmorphism */}
        <div 
          className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.35)] max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh] animate-scale-in border border-white/80 z-10" 
          onClick={e => e.stopPropagation()}
        >
          {/* Header with Deep Academic Emerald Gradient */}
          <div className="px-6 py-4.5 bg-gradient-to-r from-[#04281f]/95 via-[#06422b]/95 to-[#085236]/95 text-white flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-extrabold leading-tight">অর্ডার ট্র্যাক করুন</h2>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <p className="text-xs text-emerald-200">ইনভয়েস নম্বর বা কিউআর কোড দিয়ে তাৎক্ষণিক স্ট্যাটাস জানুন</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors active:scale-95"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content Area */}
          <div className="p-5 sm:p-6 overflow-y-auto min-h-0 overscroll-contain">
            {/* Search Input with Integrated Camera Scanner Button */}
            <form onSubmit={trackOrder} className="flex gap-2.5 mb-5">
              <div className="relative flex-1 group">
                <input 
                  type="text" 
                  value={invoiceId} 
                  onChange={(e) => setInvoiceId(e.target.value.toUpperCase())}
                  placeholder="ইনভয়েস নম্বর দিন (উদাঃ INV-2026-0004)"
                  className="w-full border-2 border-slate-200/80 focus:border-[#095738] focus:ring-4 focus:ring-emerald-500/15 rounded-2xl pl-4 pr-13 py-3.5 text-sm font-semibold focus:outline-none bg-slate-50/80 hover:bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  title="ক্যামেরা দিয়ে কিউআর কোড স্ক্যান করুন"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-gradient-to-br from-amber-300 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold transition-all shadow-xs active:scale-90"
                >
                  <Camera className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
              <button 
                type="submit" 
                disabled={loading || !invoiceId}
                className="px-6 sm:px-7 bg-gradient-to-r from-[#06422b] to-[#095738] hover:from-[#053724] hover:to-[#07472e] text-white font-extrabold rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 whitespace-nowrap shadow-md shadow-emerald-950/20 text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>খুঁজছে...</span>
                  </>
                ) : (
                  <span>ট্র্যাক করুন</span>
                )}
              </button>
            </form>

            {/* Error Notice */}
            {error && (
              <div className="bg-red-50/90 text-red-700 p-4 rounded-2xl text-sm font-bold border border-red-200/80 flex items-center gap-3 mb-5 shadow-xs animate-shake">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="leading-tight">{error}</p>
              </div>
            )}

            {/* Order Result Card */}
            {order && (
              <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm animate-scale-in">
                {/* Header Sub-bar */}
                <div className="bg-gradient-to-r from-slate-50 to-emerald-50/40 p-4 sm:p-5 border-b border-slate-200/70 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">ইনভয়েস নম্বর</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg sm:text-xl font-black font-mono text-slate-900">{order.invoiceId}</p>
                      <button 
                        onClick={() => navigator.clipboard.writeText(order.invoiceId)}
                        title="কপি করুন"
                        className="p-1.5 hover:bg-slate-200/80 rounded-lg text-slate-500 hover:text-slate-800 transition-colors active:scale-90"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">বর্তমান স্ট্যাটাস</p>
                    <div className="flex items-center gap-2 bg-white/95 px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs">
                      {getStatusIcon(order.status)}
                      <span className="font-extrabold text-slate-800 text-xs sm:text-sm">{getStatusText(order.status)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Customer Details Grid */}
                <div className="p-4 sm:p-5 grid grid-cols-2 gap-4 border-b border-slate-100 bg-white/50 text-xs sm:text-sm">
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase mb-0.5">ক্রেতার নাম</p>
                    <p className="font-bold text-slate-800">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase mb-0.5">মোবাইল</p>
                    <p className="font-bold text-slate-800">{order.customerPhone || 'N/A'}</p>
                  </div>
                  {order.instituteId && (
                    <div className="col-span-2">
                      <p className="text-[11px] text-slate-400 font-bold uppercase mb-0.5">প্রতিষ্ঠান</p>
                      <p className="font-bold text-slate-800">{order.instituteId}</p>
                    </div>
                  )}
                  {order.notes && (
                    <div className="col-span-2 border-t border-slate-100 pt-2.5 mt-0.5">
                      <p className="text-[11px] text-slate-400 font-bold uppercase mb-0.5">ডেলিভারি ঠিকানা / নোট</p>
                      <p className="font-medium text-slate-700 whitespace-pre-wrap">{order.notes.replace(/\(ইলহাক: 01\d{9}\)/g, '').trim()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase mb-0.5">অর্ডারের তারিখ</p>
                    <p className="font-semibold text-slate-700">{new Date(order.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase mb-0.5">বর্তমান বিল</p>
                    <p className="font-bold text-slate-800">৳{order.totalAmount.toFixed(2)}</p>
                  </div>
                  
                  {order.currentDueList && order.currentDueList.length > 0 ? (
                    <div className="col-span-2 bg-amber-50/80 rounded-2xl p-3 border border-amber-200/70 mt-1">
                      <p className="text-xs text-amber-800 font-bold mb-1.5">অন্যান্য বকেয়া তালিকা</p>
                      <div className="flex flex-col gap-1">
                        {order.currentDueList.map((dueObj: any) => (
                          <div key={dueObj.invoiceId} className="flex justify-between items-center text-xs">
                            <span className="font-medium text-amber-900">বকেয়া ({dueObj.invoiceId} - {new Date(dueObj.date).toLocaleDateString('bn-BD')})</span>
                            <span className="font-bold text-amber-900">৳{dueObj.due.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    order.currentTotalDue > 0 && (
                      <div className="col-span-2 mt-1">
                        <p className="text-[11px] text-amber-600 font-bold uppercase mb-0.5">অন্যান্য বকেয়া</p>
                        <p className="font-bold text-amber-700">৳{order.currentTotalDue.toFixed(2)}</p>
                      </div>
                    )
                  )}

                  {order.discount > 0 && (
                    <div>
                      <p className="text-[11px] text-emerald-600 font-bold uppercase mb-0.5">ছাড়</p>
                      <p className="font-bold text-emerald-700">-৳{order.discount.toFixed(2)}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase mb-0.5">সর্বমোট প্রদেয়</p>
                    <p className="font-extrabold text-slate-900">৳{(order.totalAmount + (order.currentTotalDue || 0) - (order.discount || 0)).toFixed(2)}</p>
                  </div>

                  <div>
                    <p className="text-[11px] text-blue-600 font-bold uppercase mb-0.5">পরিশোধিত</p>
                    <p className="font-bold text-blue-700">৳{(order.paidAmount || 0).toFixed(2)}</p>
                  </div>

                  <div>
                    <p className="text-[11px] text-red-600 font-bold uppercase mb-0.5">সর্বমোট বকেয়া</p>
                    <p className="font-black text-red-600">৳{(order.totalAmount + (order.currentTotalDue || 0) - (order.discount || 0) - (order.paidAmount || 0)).toFixed(2)}</p>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-4 sm:p-5 bg-slate-50/60 max-h-56 overflow-y-auto overscroll-contain">
                  <p className="text-xs text-slate-500 font-extrabold uppercase tracking-wider mb-2.5">অর্ডারের আইটেমসমূহ</p>
                  <div className="flex flex-col gap-2">
                    {order.items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-200/70 shadow-2xs">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-50 text-[#095738] rounded-xl flex items-center justify-center font-bold flex-shrink-0">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-xs sm:text-sm text-slate-800 leading-tight">{item.product.name}</p>
                            <p className="text-[11px] text-slate-500">পরিমাণ: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-extrabold text-xs sm:text-sm text-slate-800">৳{(item.quantity * item.unitPrice).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-slate-100/70 border-t border-slate-200/80 flex flex-wrap justify-between items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-700">
                    <input 
                      type="checkbox" 
                      checked={printBW} 
                      onChange={(e) => setPrintBW(e.target.checked)}
                      className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-600"
                    />
                    সাদাকালো প্রিন্ট (B&W)
                  </label>
                  <button 
                    onClick={printInvoice}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#06422b] to-[#095738] hover:from-[#053724] hover:to-[#07472e] text-white font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-md shadow-emerald-950/20 active:scale-95"
                  >
                    <Printer className="w-4 h-4" /> 
                    <span>ইনভয়েস প্রিন্ট করুন</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <QRScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        onScanSuccess={handleQRScanned} 
      />
    </>
  );
}

export default TrackOrderModal;
