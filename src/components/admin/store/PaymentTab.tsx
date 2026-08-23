"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, Download, FileText, CheckCircle, MoreVertical, Trash2, Share2, X, Plus, Calendar, Filter, DollarSign, Wallet, Percent, AlertCircle, Phone } from 'lucide-react';

type Payment = { id: string; payer: string; purpose: string; amount: number; method: string; status: string; createdAt: string; sale?: { invoiceId: string; totalAmount: number; paidAmount: number } | null };

function NewPaymentModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ payer: '', purpose: '', amount: '', method: 'Cash', status: 'Completed', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.payer || !form.purpose || !form.amount) { setError('সকল তথ্য পূরণ করুন।'); return; }
    setLoading(true);
    const res = await fetch('/api/store/payments', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    });
    setLoading(false);
    if (res.ok) { onSaved(); onClose(); }
    else { const d = await res.json(); setError(d.error || 'সেভ করতে সমস্যা হয়েছে'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">নতুন পেমেন্ট যোগ করুন</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {[{ label: 'পেমেন্ট প্রদানকারী *', key: 'payer', placeholder: 'Payer full name', inputMode: 'text' },
            { label: 'উদ্দেশ্য *', key: 'purpose', placeholder: 'Purpose (e.g. Book purchase)', inputMode: 'text' },
            { label: 'অ্যামাউন্ট (৳) *', key: 'amount', placeholder: '0', inputMode: 'decimal' }].map(({ label, key, placeholder, inputMode }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
              <input
                type="text"
                inputMode={inputMode as React.HTMLAttributes<HTMLInputElement>['inputMode']}
                value={form[key as keyof typeof form]}
                onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                lang="en"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">পেমেন্ট মাধ্যম</label>
              <select value={form.method} onChange={e => setForm(prev => ({ ...prev, method: e.target.value }))}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                {['Cash', 'bKash', 'Nagad', 'Bank'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">স্ট্যাটাস</label>
              <select value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                <option value="Completed">সম্পন্ন</option>
                <option value="Partial">আংশিক</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">নোট</label>
            <textarea value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={2} placeholder="Additional notes (optional)" lang="en"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none" />
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">বাতিল</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-60">
              {loading ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ActionDropdown({ payment, onUpdate }: { payment: Payment; onUpdate: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const printReceipt = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>Receipt</title>
    <style>body{font-family:sans-serif;padding:24px;max-width:400px;margin:0 auto}h1{font-size:16px;text-align:center}
    .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee}.label{color:#666}.val{font-weight:600}</style>
    </head><body>
    <h1>পেমেন্ট রসিদ</h1><h2 style="text-align:center;font-size:13px;color:#666">নূরানী তালিমুল কুরআন বোর্ড খুলনা</h2>
    <p style="text-align:center;font-size:10px;color:#888;margin:2px 0 10px;">প্রধান কার্যালয়: মুহাম্মাদনগর বড় মাদরাসা, মাদরাসা সড়ক, জলমা - ৯২৬০, লবণচরা, খুলনা।</p>
    <div class="row"><span class="label">তারিখ</span><span class="val">${new Date(payment.createdAt).toLocaleDateString('bn-BD')}</span></div>
    <div class="row"><span class="label">প্রদানকারী</span><span class="val">${payment.payer}</span></div>
    <div class="row"><span class="label">উদ্দেশ্য</span><span class="val">${payment.purpose}</span></div>
    <div class="row"><span class="label">মাধ্যম</span><span class="val">${payment.method}</span></div>
    <div class="row"><span class="label">অ্যামাউন্ট</span><span class="val">${payment.amount} ৳</span></div>
    <div class="row"><span class="label">স্ট্যাটাস</span><span class="val">${payment.status === 'Completed' ? 'সম্পন্ন' : 'আংশিক'}</span></div>
    <script>window.onload=()=>{window.print();}</script></body></html>`);
    w.document.close(); setOpen(false);
  };

  const shareReceipt = () => {
    const text = `পেমেন্ট রসিদ\nপ্রদানকারী: ${payment.payer}\nউদ্দেশ্য: ${payment.purpose}\nঅ্যামাউন্ট: ${payment.amount} ৳\nমাধ্যম: ${payment.method}`;
    if (navigator.share) navigator.share({ title: 'পেমেন্ট রসিদ', text });
    else { navigator.clipboard.writeText(text); alert('রসিদ তথ্য কপি হয়েছে!'); }
    setOpen(false);
  };

  const verifyPayment = async () => {
    await fetch(`/api/store/payments/${payment.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Completed' }),
    });
    onUpdate(); setOpen(false);
  };

  const deletePayment = async () => {
    if (!confirm('এই পেমেন্টটি মুছে দিতে চান?')) return;
    await fetch(`/api/store/payments/${payment.id}`, { method: 'DELETE' });
    onUpdate(); setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white shadow-xl rounded-xl border border-slate-100 z-50 overflow-hidden">
          <button onClick={printReceipt} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
            <FileText className="w-4 h-4 text-blue-500" /> রসিদ প্রিন্ট
          </button>
          <button onClick={shareReceipt} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
            <Share2 className="w-4 h-4 text-green-500" /> শেয়ার করুন
          </button>
          {payment.status !== 'Completed' && (
            <button onClick={verifyPayment} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> যাচাই করুন
            </button>
          )}
          <div className="border-t border-slate-100" />
          <button onClick={deletePayment} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" /> মুছে দিন
          </button>
        </div>
      )}
    </div>
  );
}

function DateFilterModal({ onClose, onApply }: { onClose: () => void; onApply: (start: Date | null, end: Date | null, label: string) => void }) {
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const applyPreset = (days: number, label: string) => {
    const end = new Date();
    const start = new Date();
    if (days > 0) start.setDate(start.getDate() - days);
    else if (days === -1) { start.setDate(1); } // This month
    else if (days === -2) { start.setMonth(0, 1); } // This year
    onApply(start, end, label);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Calendar className="w-5 h-5 text-purple-600"/> তারিখ ফিল্টার</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4 flex flex-col gap-2">
          <button onClick={() => onApply(null, null, 'সব সময়')} className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg text-sm font-medium">সব সময় (All Time)</button>
          <button onClick={() => applyPreset(0, 'আজ')} className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg text-sm font-medium">আজ (Today)</button>
          <button onClick={() => applyPreset(7, 'এই সপ্তাহ')} className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg text-sm font-medium">এই সপ্তাহ (This Week)</button>
          <button onClick={() => applyPreset(-1, 'এই মাস')} className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg text-sm font-medium">এই মাস (This Month)</button>
          <button onClick={() => applyPreset(-2, 'এই বছর')} className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg text-sm font-medium">এই বছর (This Year)</button>
          
          <div className="border-t border-slate-100 my-2 pt-2">
            <p className="text-xs font-bold text-slate-500 mb-2 px-4">কাস্টম তারিখ (Custom Range)</p>
            <div className="flex gap-2 px-4">
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="flex-1 px-2 py-1.5 border border-slate-200 rounded-lg text-sm" />
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="flex-1 px-2 py-1.5 border border-slate-200 rounded-lg text-sm" />
            </div>
            <button 
              onClick={() => { if(customStart && customEnd) onApply(new Date(customStart), new Date(customEnd), `${customStart} থেকে ${customEnd}`); }}
              className="w-full mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700"
            >প্রয়োগ করুন</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentTab() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [dueSales, setDueSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subTab, setSubTab] = useState<'all' | 'completed' | 'partial' | 'followup'>('all');
  const [showModal, setShowModal] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  
  const [dateRange, setDateRange] = useState<{ start: Date | null, end: Date | null, label: string }>({ start: null, end: null, label: 'সব সময়' });
  const [summary, setSummary] = useState({ totalSales: 0, totalReceived: 0, totalDiscount: 0, totalDue: 0 });

  const fetchPayments = async () => {
    setLoading(true);
    try {
      // Fetch summary
      let url = '/api/store/summary';
      if (dateRange.start && dateRange.end) {
        url += `?startDate=${dateRange.start.toISOString()}&endDate=${dateRange.end.toISOString()}`;
      }
      const sumRes = await fetch(url);
      if (sumRes.ok) {
        const sumData = await sumRes.json();
        setSummary(sumData);
      }

      const res = await fetch('/api/store/payments');
      const data = await res.json();
      setPayments(Array.isArray(data) ? data : []);

      const saleRes = await fetch('/api/store/sales');
      if (saleRes.ok) {
        const salesData = await saleRes.json();
        if (Array.isArray(salesData)) {
          setDueSales(salesData.filter(s => s.totalAmount > s.paidAmount).sort((a, b) => {
            if (!a.promiseDate) return 1;
            if (!b.promiseDate) return -1;
            return new Date(a.promiseDate).getTime() - new Date(b.promiseDate).getTime();
          }));
        }
      }
    } catch { setPayments([]); setDueSales([]); }
    setLoading(false);
  };

  useEffect(() => { fetchPayments(); }, [dateRange]);

  const filtered = payments.filter(p => {
    const matchSearch = p.payer.toLowerCase().includes(searchTerm.toLowerCase()) || p.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    const isPartialSale = p.sale && (p.sale.totalAmount > p.sale.paidAmount);
    const isPartial = p.status === 'Partial' || isPartialSale;
    const isCompleted = p.status === 'Completed' && !isPartialSale;
    
    const matchTab = subTab === 'all' || (subTab === 'completed' && isCompleted) || (subTab === 'partial' && isPartial);
    
    let matchDate = true;
    if (dateRange.start && dateRange.end) {
      const pDate = new Date(p.createdAt);
      matchDate = pDate >= dateRange.start && pDate <= dateRange.end;
    }
    
    return matchSearch && matchTab && matchDate;
  });

  const totalAmount = filtered.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {showModal && <NewPaymentModal onClose={() => setShowModal(false)} onSaved={fetchPayments} />}

      {/* Sub-tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit">
        {[{ key: 'all', label: 'সকল' }, { key: 'completed', label: 'সম্পন্ন' }, { key: 'partial', label: 'আংশিক' }, { key: 'followup', label: 'ফলো-আপ' }].map(t => (
          <button key={t.key} onClick={() => setSubTab(t.key as typeof subTab | 'followup')}
            className={`px-5 py-2 text-sm font-bold rounded-lg transition-colors ${subTab === t.key ? 'bg-white text-purple-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Due Follow-ups List (Only shown when Followup tab is active) */}
      {subTab === 'followup' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm mb-2">
          <div className="flex items-center gap-2 mb-3 text-red-700 font-bold">
            <AlertCircle className="w-5 h-5" />
            <h3 className="text-lg">পেমেন্ট ফলো-আপ (Follow-ups)</h3>
          </div>
          
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left bg-white rounded-lg overflow-visible border border-red-100">
              <thead>
                <tr className="bg-red-100/50 text-red-800 text-sm border-b border-red-100">
                  <th className="px-4 py-2 font-semibold">ক্রেতা</th>
                  <th className="px-4 py-2 font-semibold">ইনভয়েস</th>
                  <th className="px-4 py-2 font-semibold">মোবাইল</th>
                  <th className="px-4 py-2 font-semibold">বকেয়া (Due)</th>
                  <th className="px-4 py-2 font-semibold">প্রতিশ্রুতির তারিখ</th>
                  <th className="px-4 py-2 font-semibold">স্ট্যাটাস</th>
                  <th className="px-4 py-2 font-semibold text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-50 text-sm">
                {dueSales.map(sale => {
                  const hasPromiseDate = !!sale.promiseDate;
                  const isOverdue = hasPromiseDate && new Date(sale.promiseDate).getTime() < new Date().getTime();
                  return (
                    <tr key={sale.id} className="hover:bg-red-50/50">
                      <td className="px-4 py-3 font-bold text-slate-800">{sale.customerName}</td>
                      <td className="px-4 py-3 text-slate-600">{sale.invoiceId}</td>
                      <td className="px-4 py-3 text-slate-600">{sale.customerPhone || '-'}</td>
                      <td className="px-4 py-3 font-bold text-red-600">{(sale.totalAmount - sale.paidAmount).toFixed(2)} ৳</td>
                      <td className="px-4 py-3 font-medium text-slate-700">{hasPromiseDate ? new Date(sale.promiseDate).toLocaleDateString('bn-BD') : '-'}</td>
                      <td className="px-4 py-3">
                        {!hasPromiseDate ? (
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded">নির্ধারিত নয়</span>
                        ) : isOverdue ? (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">মেয়াদোত্তীর্ণ</span>
                        ) : (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded">অপেক্ষমান</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {sale.customerPhone && (
                          <a href={`tel:${sale.customerPhone}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 font-bold text-xs rounded-lg transition-colors">
                            <Phone className="w-3.5 h-3.5" /> কল করুন
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-3 mt-3">
            {dueSales.length === 0 ? (
               <div className="text-center p-4 text-sm text-red-400">কোনো বকেয়া নেই</div>
            ) : dueSales.map(sale => {
              const hasPromiseDate = !!sale.promiseDate;
              const isOverdue = hasPromiseDate && new Date(sale.promiseDate).getTime() < new Date().getTime();
              return (
                <div key={sale.id} className="bg-white p-3 rounded-xl border border-red-100 shadow-sm flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-800">{sale.customerName}</p>
                      <p className="text-xs text-slate-500">{sale.invoiceId}</p>
                    </div>
                    <div>
                        {!hasPromiseDate ? (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">নির্ধারিত নয়</span>
                        ) : isOverdue ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded">মেয়াদোত্তীর্ণ</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded">অপেক্ষমান</span>
                        )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm mt-1">
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">বকেয়া (Due)</p>
                      <p className="font-bold text-red-600">{(sale.totalAmount - sale.paidAmount).toFixed(2)} ৳</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 mb-0.5">প্রতিশ্রুতির তারিখ</p>
                      <p className="font-medium text-slate-700">{hasPromiseDate ? new Date(sale.promiseDate).toLocaleDateString('bn-BD') : '-'}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-red-50">
                    <span className="text-xs text-slate-500">{sale.customerPhone || 'মোবাইল নং নেই'}</span>
                    {sale.customerPhone && (
                      <a href={`tel:${sale.customerPhone}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 font-bold text-xs rounded-lg transition-colors">
                        <Phone className="w-3.5 h-3.5" /> কল করুন
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {subTab !== 'followup' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <div className="bg-blue-100 p-1.5 sm:p-3 rounded-md sm:rounded-full text-blue-600"><DollarSign className="w-4 h-4 sm:w-6 sm:h-6"/></div>
                <p className="text-xs sm:text-sm font-bold text-slate-500 leading-tight">মোট বিক্রয়<span className="hidden sm:inline"> (Sales)</span></p>
              </div>
              <p className="text-base sm:text-2xl font-black text-slate-800">{summary.totalSales.toFixed(2)} ৳</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <div className="bg-emerald-100 p-1.5 sm:p-3 rounded-md sm:rounded-full text-emerald-600"><Wallet className="w-4 h-4 sm:w-6 sm:h-6"/></div>
                <p className="text-xs sm:text-sm font-bold text-slate-500 leading-tight">মোট গৃহীত<span className="hidden sm:inline"> (Received)</span></p>
              </div>
              <p className="text-base sm:text-2xl font-black text-slate-800">{summary.totalReceived.toFixed(2)} ৳</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <div className="bg-orange-100 p-1.5 sm:p-3 rounded-md sm:rounded-full text-orange-600"><Percent className="w-4 h-4 sm:w-6 sm:h-6"/></div>
                <p className="text-xs sm:text-sm font-bold text-slate-500 leading-tight">মোট ছাড়<span className="hidden sm:inline"> (Discount)</span></p>
              </div>
              <p className="text-base sm:text-2xl font-black text-slate-800">{summary.totalDiscount.toFixed(2)} ৳</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <div className="bg-red-100 p-1.5 sm:p-3 rounded-md sm:rounded-full text-red-600"><AlertCircle className="w-4 h-4 sm:w-6 sm:h-6"/></div>
                <p className="text-xs sm:text-sm font-bold text-slate-500 leading-tight">মোট বকেয়া<span className="hidden sm:inline"> (Due)</span></p>
              </div>
              <p className="text-base sm:text-2xl font-black text-red-600">{summary.totalDue.toFixed(2)} ৳</p>
            </div>
          </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2 w-full sm:w-auto flex-1">
          <div className="relative flex-1 sm:w-96 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input type="text" placeholder="প্রদানকারী বা উদ্দেশ্য দিয়ে খুঁজুন..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                lang="en"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" />
            </div>
            <button onClick={() => setShowDateFilter(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap hidden sm:flex">
              <Filter className="w-4 h-4 text-purple-600"/> {dateRange.label}
            </button>
          </div>
          <button onClick={() => setShowModal(true)} className="sm:hidden flex-shrink-0 flex items-center justify-center w-10 h-10 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        {showDateFilter && (
          <DateFilterModal 
            onClose={() => setShowDateFilter(false)} 
            onApply={(start, end, label) => { setDateRange({ start, end, label }); setShowDateFilter(false); }} 
          />
        )}
        
        {/* Mobile Date Filter */}
        <div className="sm:hidden w-full">
          <button onClick={() => setShowDateFilter(true)} className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4 text-purple-600"/> {dateRange.label}
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 w-full sm:w-auto">
          <button onClick={() => {
            const csv = ['প্রদানকারী,উদ্দেশ্য,অ্যামাউন্ট,মাধ্যম,স্ট্যাটাস,তারিখ', ...filtered.map(p => `${p.payer},${p.purpose},${p.amount},${p.method},${p.status},${new Date(p.createdAt).toLocaleDateString()}`)].join('\n');
            const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
            a.download = 'payments.csv'; a.click();
          }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" /> এক্সপোর্ট
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> নতুন পেমেন্ট
          </button>
        </div>
      </div>

      <div className="md:border md:border-slate-200 md:rounded-xl md:bg-white min-h-[300px] overflow-visible md:overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto min-w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-4 font-medium">তারিখ</th>
                <th className="px-6 py-4 font-medium">প্রদানকারী</th>
                <th className="px-6 py-4 font-medium">উদ্দেশ্য</th>
                <th className="px-6 py-4 font-medium">অ্যামাউন্ট (৳)</th>
                <th className="px-6 py-4 font-medium">মাধ্যম</th>
                <th className="px-6 py-4 font-medium">স্ট্যাটাস</th>
                <th className="px-6 py-4 font-medium text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">লোড হচ্ছে...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">কোনো পেমেন্ট পাওয়া যায়নি</td></tr>
              ) : filtered.map(payment => (
                <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-600">{new Date(payment.createdAt).toLocaleDateString('bn-BD')}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{payment.payer}</td>
                  <td className="px-6 py-4 text-slate-600">{payment.purpose}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{payment.amount.toFixed(2)} ৳</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${payment.method === 'Cash' ? 'bg-slate-100 text-slate-600' : payment.method === 'bKash' ? 'bg-pink-100 text-pink-700' : payment.method === 'Nagad' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {payment.method}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      const isPartial = payment.status === 'Partial' || (payment.sale && payment.sale.totalAmount > payment.sale.paidAmount);
                      return (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${!isPartial ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {!isPartial ? 'সম্পন্ন' : 'আংশিক'}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-right"><ActionDropdown payment={payment} onUpdate={fetchPayments} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Mobile Cards */}
        <div className="md:hidden flex flex-col gap-3 min-h-[300px]">
          {loading ? (
            <div className="p-8 text-center text-slate-400">লোড হচ্ছে...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-white border border-slate-200 rounded-xl">কোনো পেমেন্ট পাওয়া যায়নি</div>
          ) : filtered.map(payment => {
            const isPartial = payment.status === 'Partial' || (payment.sale && payment.sale.totalAmount > payment.sale.paidAmount);
            return (
              <div key={payment.id} className="p-4 flex flex-col gap-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-800">{payment.payer}</p>
                    <p className="text-sm text-slate-500">{new Date(payment.createdAt).toLocaleDateString('bn-BD')}</p>
                  </div>
                  <ActionDropdown payment={payment} onUpdate={fetchPayments} />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">{payment.purpose}</span>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${payment.method === 'Cash' ? 'bg-slate-100 text-slate-600' : payment.method === 'bKash' ? 'bg-pink-100 text-pink-700' : payment.method === 'Nagad' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                    {payment.method}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-800">অ্যামাউন্ট: {payment.amount.toFixed(2)} ৳</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${!isPartial ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {!isPartial ? 'সম্পন্ন' : 'আংশিক'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
        </>
      )}
    </div>
  );
}
