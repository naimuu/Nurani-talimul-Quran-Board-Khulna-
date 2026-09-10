"use client";
import React, { useState, useEffect } from 'react';
import { Plus, X, Search, FileText, ChevronDown, ChevronUp, Clock, Receipt } from 'lucide-react';

type ReceiptUsage = { id: string; invoiceId: string; usedAmount: number; createdAt: string };
type Receipt = { id: string; receiptNumber: string; amount: number; usedAmount: number; status: string; createdBy: string; createdAt: string; usages: ReceiptUsage[]; customerPhone?: string };

export default function ReceiptTab() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/store/receipts');
      if (res.ok) {
        const data = await res.json();
        setReceipts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReceipts(); }, []);

  const handleCreate = async () => {
    setErrorMsg('');
    if (!receiptNumber || !amount) { setErrorMsg('সব তথ্য দিন'); return; }
    try {
      const res = await fetch('/api/store/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiptNumber, amount: Number(amount), customerPhone: customerPhone || undefined })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setReceiptNumber('');
        setAmount('');
        setCustomerPhone('');
        fetchReceipts();
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Failed to create');
      }
    } catch (e) {
      setErrorMsg('Error creating receipt');
    }
  };

  const filtered = receipts.filter(r =>
    r.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
    (r.customerPhone || '').includes(search)
  );

  const toggleExpand = (id: string) => setExpandedId(prev => prev === id ? null : id);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-72">
          <input
            type="text"
            placeholder="রিসিট নম্বর বা মোবাইল খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-bold"
        >
          <Plus className="w-5 h-5" />
          নতুন মানি রিসিট
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-auto max-h-[calc(100vh-310px)] min-h-[300px]">
        <table className="w-full text-left">
          <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600 border-b border-slate-200 shadow-2xs">
            <tr className="bg-slate-50/95 backdrop-blur-xs">
              <th className="p-4 font-semibold">তারিখ</th>
              <th className="p-4 font-semibold">রিসিট নম্বর</th>
              <th className="p-4 font-semibold">মোবাইল</th>
              <th className="p-4 font-semibold">মোট</th>
              <th className="p-4 font-semibold">ব্যবহার</th>
              <th className="p-4 font-semibold">অবশিষ্ট</th>
              <th className="p-4 font-semibold">স্ট্যাটাস</th>
              <th className="p-4 font-semibold">ইতিহাস</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={8} className="p-8 text-center text-slate-500">লোড হচ্ছে...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-slate-500">কোন রিসিট পাওয়া যায়নি</td></tr>
            ) : (
              filtered.map(r => (
                <React.Fragment key={r.id}>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm text-slate-500">{new Date(r.createdAt).toLocaleDateString('bn-BD')}</td>
                    <td className="p-4 font-bold text-slate-700">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        {r.receiptNumber}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{r.customerPhone || '—'}</td>
                    <td className="p-4 font-bold">৳{r.amount.toFixed(2)}</td>
                    <td className="p-4 text-rose-500 font-bold">৳{r.usedAmount.toFixed(2)}</td>
                    <td className="p-4 text-emerald-600 font-bold">৳{(r.amount - r.usedAmount).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        r.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {r.status === 'Active' ? 'সক্রিয়' : 'ব্যবহার হয়েছে'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleExpand(r.id)}
                        className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                          expandedId === r.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {r.usages?.length || 0} বার
                        {expandedId === r.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </td>
                  </tr>
                  {expandedId === r.id && (
                    <tr>
                      <td colSpan={8} className="bg-slate-50 p-0">
                        <div className="p-4 border-t border-slate-200">
                          <p className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            রিসিট ব্যবহারের ইতিহাস — {r.receiptNumber}
                          </p>
                          {!r.usages || r.usages.length === 0 ? (
                            <p className="text-sm text-slate-400 italic">এখনও কোন ব্যবহার হয়নি</p>
                          ) : (
                            <div className="space-y-2">
                              {r.usages.map((u) => (
                                <div key={u.id} className="flex items-center justify-between bg-white rounded-lg border border-slate-200 px-4 py-2.5">
                                  <div className="flex items-center gap-3">
                                    <Receipt className="w-4 h-4 text-rose-400 flex-shrink-0" />
                                    <div>
                                      <p className="text-sm font-bold text-slate-700">Invoice: {u.invoiceId}</p>
                                      <p className="text-xs text-slate-400">{new Date(u.createdAt).toLocaleString('bn-BD')}</p>
                                    </div>
                                  </div>
                                  <span className="text-rose-500 font-black text-base">-৳{u.usedAmount.toFixed(2)}</span>
                                </div>
                              ))}
                              <div className="flex justify-end pt-1">
                                <span className="text-xs text-slate-500">মোট ব্যবহার: <strong className="text-rose-600">৳{r.usedAmount.toFixed(2)}</strong> | অবশিষ্ট: <strong className="text-emerald-600">৳{(r.amount - r.usedAmount).toFixed(2)}</strong></span>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">নতুন মানি রিসিট যোগ করুন</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            {errorMsg && <p className="text-red-500 text-sm mb-4">{errorMsg}</p>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">রিসিট নম্বর</label>
                <input
                  type="text"
                  value={receiptNumber}
                  onChange={e => setReceiptNumber(e.target.value)}
                  className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="যেমন: MR-123456"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">পরিমাণ (টাকা)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="যেমন: 5000"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">গ্রাহকের মোবাইল নম্বর <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span></label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="01XXXXXXXXX"
                />
              </div>
              <button
                onClick={handleCreate}
                className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700"
              >
                সেভ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
