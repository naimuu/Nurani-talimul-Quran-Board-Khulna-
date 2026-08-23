import React, { useState, useEffect } from 'react';
import { Search, X, Package, CheckCircle2, Clock, Truck, Printer, Copy } from 'lucide-react';

export function TrackOrderModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [invoiceId, setInvoiceId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [boardSettings, setBoardSettings] = useState<any>(null);
  const [printBW, setPrintBW] = useState(false);

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

  const trackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const idToSearch = invoiceId.trim();
    if (!idToSearch) return;
    
    setLoading(true);
    setError('');
    setOrder(null);
    
    try {
      localStorage.setItem("lastSearchedInvoice", idToSearch);
      const res = await fetch(`/api/store/orders/${idToSearch}`);
      if (!res.ok) {
        throw new Error('অর্ডারটি পাওয়া যায়নি। ইনভয়েস নম্বরটি চেক করুন।');
      }
      const data = await res.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'অর্ডার ট্র্যাক করতে সমস্যা হয়েছে।');
    }
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Completed') return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
    if (status === 'Pending Order' || status === 'Pending') return <Clock className="w-6 h-6 text-amber-500" />;
    return <Truck className="w-6 h-6 text-blue-500" />;
  };

  const getStatusText = (status: string) => {
    if (status === 'Completed') return 'সম্পন্ন হয়েছে';
    if (status === 'Pending Order' || status === 'Pending') return 'অপেক্ষমান';
    return status;
  };

  const printInvoice = () => {
    if (!order) return;
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
              .flex-between { display: flex; justify-content: space-between; }
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
              .footer { text-align: center; padding: 10px 0; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; margin-top: 20px; width: 100%; }
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
              .footer { border-top: 1px solid #000; color: #000; }
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
                    <p><strong>ইনভয়েস নং:</strong> ${order.invoiceId}</p>
                    <p><strong>তারিখ:</strong> ${new Date(order.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[95vh]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50 shrink-0">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" /> অর্ডার ট্র্যাক করুন
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form onSubmit={trackOrder} className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={invoiceId} 
              onChange={(e) => setInvoiceId(e.target.value.toUpperCase())}
              placeholder="ইনভয়েস নম্বর দিন (উদাঃ INV-2026-0004)"
              className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 bg-slate-50 text-slate-800 placeholder-slate-400"
            />
            <button 
              type="submit" 
              disabled={loading || !invoiceId}
              className="px-6 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center gap-2 whitespace-nowrap"
            >
              {loading ? 'খুঁজছে...' : 'ট্র্যাক করুন'}
            </button>
          </form>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 text-center mb-4">
              {error}
            </div>
          )}

          {order && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-bold mb-1">ইনভয়েস নম্বর</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-black text-slate-800">{order.invoiceId}</p>
                    <button 
                      onClick={() => navigator.clipboard.writeText(order.invoiceId)}
                      title="কপি করুন"
                      className="p-1.5 hover:bg-slate-200 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-xs text-slate-500 font-bold mb-1">স্ট্যাটাস</p>
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                    {getStatusIcon(order.status)}
                    <span className="font-bold text-slate-700 text-sm">{getStatusText(order.status)}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 grid grid-cols-2 gap-4 border-b border-slate-100">
                <div>
                  <p className="text-xs text-slate-400 font-bold mb-0.5">ক্রেতার নাম</p>
                  <p className="font-medium text-slate-700">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold mb-0.5">মোবাইল</p>
                  <p className="font-medium text-slate-700">{order.customerPhone || 'N/A'}</p>
                </div>
                {order.instituteId && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-400 font-bold mb-0.5">প্রতিষ্ঠান</p>
                    <p className="font-medium text-slate-700">{order.instituteId}</p>
                  </div>
                )}
                {order.notes && (
                  <div className="col-span-2 border-t border-slate-100 pt-3 mt-1">
                    <p className="text-xs text-slate-400 font-bold mb-0.5">ডেলিভারি ঠিকানা / নোট</p>
                    <p className="font-medium text-slate-700 whitespace-pre-wrap">{order.notes.replace(/\(ইলহাক: 01\d{9}\)/g, '').trim()}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-400 font-bold mb-0.5">অর্ডারের তারিখ</p>
                  <p className="font-medium text-slate-700">{new Date(order.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold mb-0.5">বর্তমান বিল</p>
                  <p className="font-bold text-slate-700">৳{order.totalAmount.toFixed(2)}</p>
                </div>
                
                {order.currentDueList && order.currentDueList.length > 0 ? (
                  <div className="col-span-2 bg-amber-50 rounded-lg p-3 border border-amber-100 mt-2">
                    <p className="text-xs text-amber-600 font-bold mb-2">অন্যান্য বকেয়া তালিকা</p>
                    <div className="flex flex-col gap-1.5">
                      {order.currentDueList.map((dueObj: any) => (
                        <div key={dueObj.invoiceId} className="flex justify-between items-center text-sm">
                          <span className="font-medium text-amber-700">বকেয়া ({dueObj.invoiceId} - {new Date(dueObj.date).toLocaleDateString('bn-BD')})</span>
                          <span className="font-bold text-amber-700">৳{dueObj.due.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  order.currentTotalDue > 0 && (
                    <div className="col-span-2 mt-2">
                      <p className="text-xs text-amber-500 font-bold mb-0.5">অন্যান্য বকেয়া</p>
                      <p className="font-bold text-amber-600">৳{order.currentTotalDue.toFixed(2)}</p>
                    </div>
                  )
                )}

                {order.discount > 0 && (
                  <div>
                    <p className="text-xs text-green-500 font-bold mb-0.5">ছাড়</p>
                    <p className="font-bold text-green-600">-৳{order.discount.toFixed(2)}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-xs text-slate-400 font-bold mb-0.5">সর্বমোট প্রদেয়</p>
                  <p className="font-bold text-slate-700">৳{(order.totalAmount + (order.currentTotalDue || 0) - (order.discount || 0)).toFixed(2)}</p>
                </div>

                <div>
                  <p className="text-xs text-blue-500 font-bold mb-0.5">পরিশোধিত</p>
                  <p className="font-bold text-blue-600">৳{(order.paidAmount || 0).toFixed(2)}</p>
                </div>

                <div>
                  <p className="text-xs text-red-500 font-bold mb-0.5">সর্বমোট বকেয়া</p>
                  <p className="font-black text-red-600">৳{(order.totalAmount + (order.currentTotalDue || 0) - (order.discount || 0) - (order.paidAmount || 0)).toFixed(2)}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 max-h-60 overflow-y-auto">
                <p className="text-xs text-slate-500 font-bold mb-3">অর্ডারের বিবরণ</p>
                <div className="flex flex-col gap-2">
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-50 rounded flex items-center justify-center">
                          <Package className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800">{item.product.name}</p>
                          <p className="text-xs text-slate-500">পরিমাণ: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-bold text-slate-700">৳{(item.quantity * item.unitPrice).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-bold text-slate-700">
                  <input 
                    type="checkbox" 
                    checked={printBW} 
                    onChange={(e) => setPrintBW(e.target.checked)}
                    className="w-4 h-4 text-slate-800 rounded focus:ring-slate-800"
                  />
                  সাদাকালো প্রিন্ট (B&W)
                </label>
                <button 
                  onClick={printInvoice}
                  className="flex items-center gap-2 px-6 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <Printer className="w-4 h-4" /> ইনভয়েস প্রিন্ট করুন
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
