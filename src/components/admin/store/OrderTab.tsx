"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, MoreVertical, CheckCircle, Trash2, Edit, X } from 'lucide-react';
import { toBanglaDigits } from './BanglaDatePicker';

const toEnglishDigits = (str: string) => {
  const bnToEn: Record<string, string> = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
  return String(str || '').replace(/[০-৯]/g, match => bnToEn[match]);
};

type SaleItem = { id: string; productId: string; quantity: number; unitPrice: number; product: { id: string, name: string, className?: string | null, stock: number, price: number } };
type Sale = {
  id: string; invoiceId: string; customerName: string; customerPhone?: string | null; instituteId?: string | null; totalAmount: number;
  paidAmount: number; status: string; createdAt: string; items: SaleItem[];
  previousDue?: number; previousDueList?: any[]; discount?: number;
  deliveryCharge?: number; courierName?: string; totalWeight?: number; notes?: string;
};

export default function OrderTab() {
  const [orders, setOrders] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Sale | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedItems, setEditedItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [confirmMode, setConfirmMode] = useState<'none' | 'partial' | 'unpaid'>('none');
  const [partialPaidAmount, setPartialPaidAmount] = useState('');
  const [promiseDate, setPromiseDate] = useState('');
  const [orderDeliveryCharge, setOrderDeliveryCharge] = useState<string>('0');
  const [orderDiscount, setOrderDiscount] = useState<string>('0');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/store/sales?t=${Date.now()}`);
      const data = await res.json();
      setOrders(data.filter((s: Sale) => s.status === 'Pending Order'));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAccept = async (orderId: string, paidAmount: number, status: string, paymentMethod: string, promiseDate?: string) => {
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
        status,
        paymentMethod,
        promiseDate,
        deliveryCharge: deliveryChargeVal,
        discount: discountVal,
        totalAmount: finalTotalAmount,
      }),
    });
    fetchOrders();
  };

  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, orderId: string}>({isOpen: false, orderId: ''});

  const handleRejectClick = (orderId: string) => {
    setConfirmModal({isOpen: true, orderId});
  };

  const confirmReject = async () => {
    const orderId = confirmModal.orderId;
    if (!orderId) return;
    await fetch(`/api/store/sales/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Rejected' }),
    });
    setConfirmModal({isOpen: false, orderId: ''});
    fetchOrders();
  };

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
    setSelectedOrder(updatedOrder);
    setOrderDeliveryCharge((updatedOrder.deliveryCharge ?? 0).toString());
    setOrderDiscount((updatedOrder.discount ?? 0).toString());
    fetchOrders();
  };

  const filtered = orders.filter(o => 
    o.invoiceId.toLowerCase().includes(search.toLowerCase()) || 
    o.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
        <h3 className="font-bold text-lg text-slate-800">অপেক্ষমাণ অর্ডারসমূহ</h3>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ইনভয়েস বা নাম দিয়ে খুঁজুন..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <th className="p-4 font-bold">ইনভয়েস</th>
              <th className="p-4 font-bold">ক্রেতার নাম</th>
              <th className="p-4 font-bold text-center">আইটেম সংখ্যা</th>
              <th className="p-4 font-bold text-right">মোট মূল্য</th>
              <th className="p-4 font-bold text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10 text-slate-400">লোড হচ্ছে...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-slate-400">কোনো অপেক্ষমাণ অর্ডার নেই</td></tr>
            ) : filtered.map(order => (
              <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="p-4 font-bold text-primary">{order.invoiceId}</td>
                <td className="p-4">
                  <p className="font-medium text-slate-800">{order.customerName}</p>
                  <p className="text-xs text-slate-500">{order.customerPhone || 'নাম্বার নেই'}</p>
                </td>
                <td className="p-4 text-center">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold text-xs">
                    {order.items.reduce((s, i) => s + i.quantity, 0)} টি
                  </span>
                </td>
                <td className="p-4 text-right font-bold text-slate-800">{order.totalAmount.toFixed(2)} ৳</td>
                <td className="p-4 text-right">
                  <button onClick={() => {
                    setSelectedOrder(order);
                    setEditedItems(order.items.map(i => ({ productId: i.productId, quantity: i.quantity })));
                    setOrderDeliveryCharge((order.deliveryCharge ?? 0).toString());
                    setOrderDiscount((order.discount ?? 0).toString());
                    setConfirmMode('none');
                    setPartialPaidAmount('');
                    setPromiseDate('');
                  }} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 mr-2">রিভিউ</button>
                  <button onClick={() => handleRejectClick(order.id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100">বাতিল</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between p-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-800">অর্ডার রিভিউ: {selectedOrder.invoiceId}</h3>
                <div className="mt-1 text-sm text-slate-600 flex flex-col">
                  <span className="font-medium text-slate-700">{selectedOrder.customerName} {selectedOrder.customerPhone && `- ${selectedOrder.customerPhone}`}</span>
                  {selectedOrder.instituteId && <span className="text-xs text-slate-500">{selectedOrder.instituteId}</span>}
                  {selectedOrder.notes && (
                    <span className="text-xs text-slate-500 mt-0.5">
                      <strong>নোট / ঠিকানা:</strong> {selectedOrder.notes}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => { setSelectedOrder(null); setEditMode(false); }} className="p-2 hover:bg-slate-200 rounded-full shrink-0 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 bg-slate-50">
              <div className="bg-white p-4 rounded-xl border border-slate-200 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-slate-700">আইটেম তালিকা</h4>
                  {!editMode && (
                    <button onClick={() => setEditMode(true)} className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline"><Edit className="w-4 h-4" /> এডিট করুন</button>
                  )}
                </div>
                
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500">
                      <th className="py-2">পণ্য</th>
                      <th className="py-2 text-center">মজুদ</th>
                      <th className="py-2 text-center">পরিমাণ</th>
                      <th className="py-2 text-right">মূল্য</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(editMode ? editedItems : selectedOrder.items).map((item, idx) => {
                      const product = selectedOrder.items.find(i => i.productId === item.productId)?.product;
                      if (!product) return null;
                      return (
                        <tr key={idx} className="border-b border-slate-50">
                          <td className="py-2 font-medium">{product.name}</td>
                          <td className="py-2 text-center text-xs text-slate-500">{product.stock}</td>
                          <td className="py-2 text-center">
                            {editMode ? (
                              <input 
                                type="number" 
                                value={item.quantity} 
                                onChange={e => {
                                  const newQty = Math.max(1, parseInt(e.target.value) || 1);
                                  setEditedItems(prev => prev.map((it, i) => i === idx ? { ...it, quantity: newQty } : it));
                                }}
                                className="w-16 border rounded text-center py-1"
                              />
                            ) : item.quantity}
                          </td>
                          <td className="py-2 text-right">{(product.price * item.quantity).toFixed(2)} ৳</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {editMode && (
                  <div className="mt-4 flex justify-end gap-2">
                    <button onClick={() => { setEditMode(false); setEditedItems(selectedOrder.items.map(i => ({ productId: i.productId, quantity: i.quantity }))); }} className="px-4 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-bold hover:bg-slate-50">বাতিল</button>
                    <button onClick={handleUpdateItems} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">সেভ করুন</button>
                  </div>
                )}

                {!editMode && (() => {
                  const itemsSubtotal = selectedOrder.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
                  const deliveryChargeVal = parseFloat(toEnglishDigits(orderDeliveryCharge)) || 0;
                  const discountVal = parseFloat(toEnglishDigits(orderDiscount)) || 0;
                  const currentBill = Math.max(0, itemsSubtotal - discountVal) + deliveryChargeVal;
                  const totalPayable = currentBill + (selectedOrder.previousDue || 0);

                  return (
                    <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col items-end gap-2 text-sm">
                      <div className="flex justify-between w-72">
                        <span className="text-slate-500 font-bold">পণ্যের মূল্য (সাবটোটাল):</span>
                        <span className="font-bold text-slate-800">{itemsSubtotal.toFixed(2)} ৳</span>
                      </div>

                      {/* Delivery Charge row with adjustment */}
                      <div className="flex justify-between items-center w-72 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <div className="flex flex-col">
                          <span className="text-slate-600 font-bold text-xs flex items-center gap-1">
                            <span>🚚 {selectedOrder.courierName || 'পাঠাও কুরিয়ার'}:</span>
                          </span>
                          <span className="text-[10px] text-amber-700 font-medium">
                            ওজন: {selectedOrder.totalWeight || 0} কেজি
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={orderDeliveryCharge}
                            onChange={e => setOrderDeliveryCharge(e.target.value)}
                            className="w-16 px-1.5 py-0.5 text-right font-bold text-xs border border-slate-300 rounded bg-white"
                          />
                          <span className="text-xs font-bold">৳</span>
                          <button
                            type="button"
                            onClick={() => setOrderDeliveryCharge('0')}
                            title="ফ্রি ডেলিভারি"
                            className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold hover:bg-emerald-200 transition-colors"
                          >
                            ফ্রি
                          </button>
                        </div>
                      </div>

                      {/* Discount row with adjustment */}
                      <div className="flex justify-between items-center w-72 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-600 font-bold text-xs">ছাড় (ডিসকাউন্ট):</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={orderDiscount}
                            onChange={e => setOrderDiscount(e.target.value)}
                            className="w-16 px-1.5 py-0.5 text-right font-bold text-xs border border-slate-300 rounded bg-white text-emerald-600"
                          />
                          <span className="text-xs font-bold text-emerald-600">৳</span>
                        </div>
                      </div>

                      <div className="flex justify-between w-72 pt-1 border-t border-slate-200">
                        <span className="text-slate-700 font-bold">বর্তমান বিল:</span>
                        <span className="font-bold text-slate-800">{currentBill.toFixed(2)} ৳</span>
                      </div>

                      {selectedOrder.previousDueList && selectedOrder.previousDueList.length > 0 ? (
                        selectedOrder.previousDueList.map((dueObj: any) => (
                          <div key={dueObj.invoiceId} className="flex justify-between w-72">
                            <span className="text-amber-500 font-bold">বকেয়া ({dueObj.invoiceId}):</span>
                            <span className="font-bold text-amber-600">{(dueObj.due || 0).toFixed(2)} ৳</span>
                          </div>
                        ))
                      ) : (
                        (selectedOrder.previousDue || 0) > 0 && (
                          <div className="flex justify-between w-72">
                            <span className="text-amber-500 font-bold">অন্যান্য বকেয়া:</span>
                            <span className="font-bold text-amber-600">{(selectedOrder.previousDue || 0).toFixed(2)} ৳</span>
                          </div>
                        )
                      )}

                      <div className="flex justify-between w-72 pt-2 mt-1 border-t border-slate-200">
                        <span className="text-slate-700 font-bold">সর্বমোট প্রদেয়:</span>
                        <span className="font-black text-primary text-base">{totalPayable.toFixed(2)} ৳</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              {!editMode && (() => {
                const itemsSubtotal = selectedOrder.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
                const deliveryChargeVal = parseFloat(toEnglishDigits(orderDeliveryCharge)) || 0;
                const discountVal = parseFloat(toEnglishDigits(orderDiscount)) || 0;
                const currentBill = Math.max(0, itemsSubtotal - discountVal) + deliveryChargeVal;

                return (
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-700 mb-4">অর্ডার কনফার্ম করুন</h4>
                    
                    {confirmMode === 'partial' || confirmMode === 'unpaid' ? (
                      <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-xl mb-4 border border-slate-200">
                        {confirmMode === 'partial' && (
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">প্রদানকৃত পরিমাণ (৳)</label>
                            <input 
                              type="number" 
                              value={partialPaidAmount}
                              onChange={e => setPartialPaidAmount(e.target.value)}
                              placeholder="0.00"
                              className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:ring-2 focus:ring-primary/40 outline-none bg-white"
                            />
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">পরবর্তী পেমেন্টের তারিখ (Promise Date)</label>
                          <input 
                            type="date" 
                            value={promiseDate}
                            onChange={e => setPromiseDate(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:ring-2 focus:ring-primary/40 outline-none bg-white"
                          />
                          <p className="text-[10px] text-slate-500 mt-1">ঐচ্ছিক (Optional): কাস্টমার কবে বকেয়া পরিশোধ করতে চেয়েছে তার তারিখ</p>
                        </div>
                        <div className="flex gap-2 justify-end mt-2">
                          <button onClick={() => setConfirmMode('none')} className="px-4 py-2 bg-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-300">
                            বাতিল
                          </button>
                          <button onClick={() => { 
                            if (confirmMode === 'partial') {
                              handleAccept(selectedOrder.id, Number(partialPaidAmount), 'Partial', 'Cash', promiseDate);
                            } else {
                              handleAccept(selectedOrder.id, 0, 'Pending', 'Cash', promiseDate);
                            }
                            setSelectedOrder(null); 
                            setConfirmMode('none'); 
                          }} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90">
                            কনফার্ম করুন
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => { handleAccept(selectedOrder.id, currentBill, 'Paid', 'Cash'); setSelectedOrder(null); }} className="bg-emerald-100 text-emerald-700 font-bold py-3 px-2 rounded-xl hover:bg-emerald-200 flex flex-col items-center justify-center text-sm text-center">
                          <CheckCircle className="w-5 h-5 mb-1" />
                          Full Paid (কনফার্ম)
                        </button>
                        <button onClick={() => { setConfirmMode('partial'); setPartialPaidAmount(currentBill.toFixed(2)); }} className="bg-blue-100 text-blue-700 font-bold py-3 px-2 rounded-xl hover:bg-blue-200 flex flex-col items-center justify-center text-sm text-center">
                          <CheckCircle className="w-5 h-5 mb-1" />
                          Partial Paid (কনফার্ম)
                        </button>
                        <button onClick={() => setConfirmMode('unpaid')} className="bg-amber-100 text-amber-700 font-bold py-3 px-2 rounded-xl hover:bg-amber-200 flex flex-col items-center justify-center text-sm text-center">
                          <CheckCircle className="w-5 h-5 mb-1" />
                          প্যাকেজিং এর জন্য (Unpaid)
                        </button>
                      </div>
                    )}
                    
                    <p className="text-xs text-slate-500 mt-4 text-center">কনফার্ম করলে স্টক থেকে পণ্য কমে যাবে এবং এটি সেলস ট্যাবে যুক্ত হবে।</p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-xl text-slate-800 mb-2">বাতিল নিশ্চিত করুন</h3>
            <p className="text-slate-500 mb-6">আপনি কি নিশ্চিত যে আপনি এই অর্ডারটি বাতিল করতে চান? এই কাজ পরিবর্তনযোগ্য নয়।</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({isOpen: false, orderId: ''})} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">না, ফিরে যান</button>
              <button onClick={confirmReject} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors">হ্যাঁ, বাতিল করুন</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
