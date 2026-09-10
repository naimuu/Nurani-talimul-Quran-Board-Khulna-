"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import ImageCropper from './ImageCropper';
import { Search, Plus, Download, Edit, Trash2, MoreVertical, X, Package, TrendingUp, Clock, List, Image as ImageIcon, Crop, Upload, Printer, Scan } from 'lucide-react';

type Product = { id: string; name: string; category: string; price: number; stock: number; unit: string; updatedAt: string; imageUrl?: string | null; barcode?: string | null; className?: string | null; description?: string | null; weight?: number | null; };

const toEnglishDigits = (str: string) => {
  const bnToEn: Record<string, string> = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
  return str.replace(/[০-৯]/g, match => bnToEn[match]);
};

function ProductModal({ product, products = [], defaultCategory, defaultClass, onClose, onSaved }: { product?: Product | null; products?: Product[]; defaultCategory?: string; defaultClass?: string; onClose: () => void; onSaved: () => void }) {
  const [activeProduct, setActiveProduct] = useState<Product | null>(product || null);
  const isEdit = !!activeProduct;
  
  const [form, setForm] = useState<{name: string, price: string, stock: string, unit: string, barcode: string, imageUrl: string, className: string, description: string, weight: string}>(() => {
    if (!product && typeof window !== 'undefined') {
      try {
        const draft = localStorage.getItem('store_product_draft');
        if (draft) {
          const parsed = JSON.parse(draft);
          if (parsed.form) return parsed.form;
        }
      } catch (e) {}
    }
    return { 
      name: product?.name || '', 
      price: product?.price?.toString() || '', 
      stock: product?.stock?.toString() || '', 
      unit: product?.unit || 'টি',
      barcode: product?.barcode || '',
      imageUrl: product?.imageUrl || '',
      className: product?.className || defaultClass || '',
      description: product?.description || '',
      weight: product?.weight !== undefined && product?.weight !== null ? product.weight.toString() : '0.25'
    };
  });
  
  const [selectedCats, setSelectedCats] = useState<string[]>(() => {
    if (!product && typeof window !== 'undefined') {
      try {
        const draft = localStorage.getItem('store_product_draft');
        if (draft) {
          const parsed = JSON.parse(draft);
          if (parsed.selectedCats) return parsed.selectedCats;
        }
      } catch (e) {}
    }
    return product?.category ? product.category.split(',').map(s=>s.trim()).filter(Boolean) : (defaultCategory ? [defaultCategory] : []);
  });
  const [formErrors, setFormErrors] = useState<{name?: boolean, price?: boolean, category?: boolean}>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCropper, setShowCropper] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [curriculumClasses, setCurriculumClasses] = useState<{id:string, name:string}[]>([]);
  const uniqueClasses = useMemo(() => {
    const set = new Set(curriculumClasses.map(c => c.name));
    products.forEach(p => { if (p.className) set.add(p.className); });
    return Array.from(set);
  }, [curriculumClasses, products]);
  const [isNewClass, setIsNewClass] = useState(false);
  


  useEffect(() => {
    if (!isEdit) {
      localStorage.setItem('store_product_draft', JSON.stringify({ form, selectedCats }));
    }
  }, [form, selectedCats, isEdit]);

  // Smart Search Logic
  useEffect(() => {
    if (!product && form.barcode && form.barcode.length > 2) {
      const match = products.find(p => p.barcode && p.barcode === form.barcode);
      if (match && !activeProduct) {
        setActiveProduct(match);
        setForm({
          name: match.name, price: match.price.toString(), stock: match.stock.toString(), unit: match.unit || 'টি', barcode: match.barcode || '', imageUrl: match.imageUrl || '', className: match.className || '', description: match.description || '', weight: match.weight !== undefined && match.weight !== null ? match.weight.toString() : '0.25'
        });
        setSelectedCats(match.category ? match.category.split(',').map(s=>s.trim()).filter(Boolean) : []);
      }
    }
  }, [form.barcode, products, product, activeProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = {
      name: !form.name,
      price: !form.price,
      category: selectedCats.length === 0
    };
    setFormErrors(errors);
    
    if (errors.name || errors.price || errors.category) { 
      setError('লাল চিহ্নিত আবশ্যিক তথ্যগুলো পূরণ করুন।'); 
      return; 
    }
    setLoading(true);
    const res = await fetch(isEdit ? `/api/store/products/${activeProduct!.id}` : '/api/store/products', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, category: selectedCats.join(', '), price: parseFloat(form.price), stock: parseInt(form.stock || '0'), weight: parseFloat(form.weight || '0.25') || 0.25 }),
    });
    setLoading(false);
    if (res.ok) { 
      if (!isEdit) localStorage.removeItem('store_product_draft');
      onSaved(); 
      onClose(); 
    }
    else { const d = await res.json(); setError(d.error || 'সেভ করতে সমস্যা হয়েছে'); }
  };

  const [categories, setCategories] = useState<{id:string, name:string, isClassWise?: boolean}[]>([]);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIsClassWise, setNewCategoryIsClassWise] = useState(false);
  
  useEffect(() => {
    fetch('/api/store/categories').then(r => r.json()).then(data => setCategories(Array.isArray(data) ? data : []));
    fetch('/api/curriculum/classes').then(r => r.json()).then(data => setCurriculumClasses(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">{isEdit ? 'পণ্য সম্পাদনা করুন' : 'নতুন পণ্য যোগ করুন'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
        </div>
        {showCropper && (
          <ImageCropper 
            onCancel={() => setShowCropper(false)}
            onCropComplete={async (blob, url, sizeKb) => {
              setShowCropper(false);
              const formData = new FormData();
              formData.append('file', blob, 'product.jpg');
              try {
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                const data = await res.json();
                if (data.url) setForm(prev => ({ ...prev, imageUrl: data.url }));
              } catch(e) { console.error(e); }
            }}
          />
        )}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          <div className="flex gap-4 items-start">
            <div 
              onClick={() => setShowCropper(true)}
              className="w-24 h-24 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors overflow-hidden relative shrink-0"
            >
              {form.imageUrl ? (
                <img src={form.imageUrl} className="w-full h-full object-cover" alt="Product" />
              ) : (
                <>
                  <ImageIcon className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-[10px] font-bold text-slate-500">ছবি দিন</span>
                </>
              )}
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">বারকোড / প্রোডাক্ট আইডি (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="barcode-input"
                    value={form.barcode}
                    onChange={e => setForm(prev => ({ ...prev, barcode: e.target.value }))}
                    placeholder="Scan barcode or type ID"
                    className="flex-1 px-4 py-3 text-lg font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all" 
                  />
                  <button 
                    type="button" 
                    onClick={() => document.getElementById('barcode-input')?.focus()}
                    className="flex items-center justify-center w-14 h-[52px] bg-blue-50 border border-blue-200 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <Scan className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <label className="block text-sm font-bold text-slate-700 mb-2">পণ্যের নাম *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => {
                setForm(prev => ({ ...prev, name: e.target.value }));
                if (!activeProduct) setShowSuggestions(true);
              }}
              onFocus={() => { if(!activeProduct) setShowSuggestions(true); }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Product name (e.g. Noorani Qaida)"
              lang="en"
              className="w-full px-4 py-3 text-lg font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all" 
            />
            {showSuggestions && form.name.length > 0 && !activeProduct && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto">
                {products.filter(p => p.name.toLowerCase().includes(form.name.toLowerCase())).map(match => (
                  <button
                    key={match.id}
                    type="button"
                    onClick={() => {
                      setActiveProduct(match);
                      setForm({
                        name: match.name, price: match.price.toString(), stock: match.stock.toString(), 
                        unit: match.unit || 'টি', barcode: match.barcode || '', imageUrl: match.imageUrl || '',
                        className: match.className || '', description: match.description || '',
                        weight: match.weight !== undefined && match.weight !== null ? match.weight.toString() : '0.25'
                      });
                      setSelectedCats(match.category ? match.category.split(',').map(s=>s.trim()).filter(Boolean) : []);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors"
                  >
                    <div className="font-bold text-slate-800">{match.name}</div>
                    <div className="text-xs text-slate-500">মূল্য: {match.price} ৳ | মজুদ: {match.stock} {match.unit}</div>
                  </button>
                ))}
                {products.filter(p => p.name.toLowerCase().includes(form.name.toLowerCase())).length === 0 && (
                  <div className="px-4 py-3 text-sm text-slate-500">নতুন পণ্য হিসেবে যোগ করা হবে</div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className={`block text-sm font-bold mb-2 ${formErrors.category ? 'text-red-600' : 'text-slate-700'}`}>ক্যাটাগরি * (একাধিক নির্বাচন করা যাবে)</label>
            <div className={`flex flex-wrap gap-2 p-3 bg-slate-50 border rounded-xl min-h-[60px] ${formErrors.category ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'}`}>
              {categories.map(c => {
                const isSelected = selectedCats.includes(c.name);
                return (
                  <button type="button" key={c.id} onClick={() => {
                    setSelectedCats(prev => isSelected ? prev.filter(x => x !== c.name) : [...prev, c.name]);
                  }} className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors flex items-center gap-1.5 ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}>
                    {c.name} {isSelected && <span className="text-white text-xs">✓</span>}
                  </button>
                )
              })}
              {categories.length === 0 && !isNewCategory && <span className="text-sm text-slate-400">কোনো ক্যাটাগরি নেই</span>}
              
              {isNewCategory ? (
                <div className="flex items-center gap-2 mt-1 w-full bg-slate-100 p-2 rounded-lg border border-slate-200">
                  <input 
                    type="text" 
                    value={newCategoryName} 
                    onChange={e => setNewCategoryName(e.target.value)} 
                    placeholder="নতুন ক্যাটাগরির নাম" 
                    className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <label className="flex items-center gap-1 text-xs text-slate-600 font-medium cursor-pointer">
                    <input type="checkbox" checked={newCategoryIsClassWise} onChange={e => setNewCategoryIsClassWise(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                    শ্রেণীভিত্তিক?
                  </label>
                  <button type="button" onClick={async () => {
                    if(!newCategoryName.trim()) { setIsNewCategory(false); return; }
                    setLoading(true);
                    const res = await fetch('/api/store/categories', {
                      method: 'POST', headers:{'Content-Type': 'application/json'},
                      body: JSON.stringify({name: newCategoryName.trim(), isClassWise: newCategoryIsClassWise})
                    });
                    setLoading(false);
                    if (res.ok) {
                      const newCat = await res.json();
                      setCategories(prev => [...prev, newCat]);
                      setSelectedCats(prev => [...prev, newCat.name]);
                      setNewCategoryName('');
                      setNewCategoryIsClassWise(false);
                      setIsNewCategory(false);
                    } else {
                      const d = await res.json();
                      setError(d.error || 'ক্যাটাগরি তৈরি করতে সমস্যা হয়েছে');
                    }
                  }} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors">সংরক্ষণ</button>
                  <button type="button" onClick={() => setIsNewCategory(false)} className="p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 rounded-lg transition-colors"><X className="w-4 h-4"/></button>
                </div>
              ) : (
                <button type="button" onClick={() => setIsNewCategory(true)} className="px-3 py-1.5 rounded-lg text-sm font-bold border border-dashed border-slate-400 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> 
                </button>
              )}
            </div>
          </div>
          
          {selectedCats.some(cat => categories.find(c => c.name === cat)?.isClassWise) && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">শ্রেণী (Class)</label>
              <div className="flex gap-2">
                {isNewClass || uniqueClasses.length === 0 ? (
                  <input
                    type="text"
                    value={form.className}
                    onChange={e => setForm(prev => ({ ...prev, className: e.target.value }))}
                    placeholder="যেমন: নূরানী ১ম শ্রেণী"
                    className="w-full px-4 py-3 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all" />
                ) : (
                  <select
                    value={form.className}
                    onChange={e => setForm(prev => ({ ...prev, className: e.target.value }))}
                    className="w-full px-4 py-3 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all"
                  >
                    <option value="">নির্বাচন করুন</option>
                    {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                )}
                {uniqueClasses.length > 0 && (
                  <button type="button" onClick={() => setIsNewClass(!isNewClass)} className="p-3 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-center">
                    {isNewClass ? <X className="w-5 h-5 text-slate-600"/> : <Plus className="w-5 h-5 text-blue-600"/>}
                  </button>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">বিবরণ (Description) <span className="text-slate-400 font-normal text-xs">(ঐচ্ছিক)</span></label>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="পণ্যের বিস্তারিত বিবরণ..."
              rows={3}
              className="w-full px-4 py-3 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all resize-none" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">মূল্য (৳) *</label>
            <input
              type="text"
              inputMode="decimal"
              value={form.price}
              onChange={e => {
                let val = e.target.value;
                val = toEnglishDigits(val);
                setForm(prev => ({ ...prev, price: val }));
                if (formErrors.price) setFormErrors(prev => ({ ...prev, price: false }));
              }}
              onFocus={(e) => {
                if (e.target.value === '0') {
                  setForm(prev => ({ ...prev, price: '' }));
                }
              }}
              onBlur={(e) => {
                if (e.target.value === '') {
                  setForm(prev => ({ ...prev, price: '0' }));
                }
              }}
              placeholder="0"
              lang="en"
              className={`w-full px-4 py-3 text-lg font-medium bg-slate-50 border ${formErrors.price ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`} 
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-2">মজুদ <span className="text-slate-400 font-normal text-xs">(ঐচ্ছিক)</span></label>
              <input
                type="text"
                inputMode="numeric"
                value={form.stock}
                onChange={e => setForm(prev => ({ ...prev, stock: toEnglishDigits(e.target.value) }))}
                placeholder="0"
                lang="en"
                className="w-full px-4 py-3 text-lg font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            </div>
            <div className="w-1/3">
              <label className="block text-sm font-bold text-slate-700 mb-2">একক</label>
              <select 
                value={form.unit} 
                onChange={e => setForm(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-4 py-3 text-lg font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all cursor-pointer">
                <option value="টি">টি</option>
                <option value="জন">জন</option>
                <option value="ডজন">ডজন</option>
                <option value="পিস">পিস</option>
                <option value="কপি">কপি</option>
                <option value="সেট">সেট</option>
                <option value="বক্স">বক্স</option>
                <option value="প্যাকেট">প্যাকেট</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-2">পণ্যের ওজন (কেজি) <span className="text-slate-400 font-normal text-xs">(ডিফল্ট ০.২৫ কেজি বা ২৫০ গ্রাম)</span></label>
              <input
                type="text"
                inputMode="decimal"
                value={form.weight}
                onChange={e => setForm(prev => ({ ...prev, weight: toEnglishDigits(e.target.value) }))}
                placeholder="0.25"
                lang="en"
                className="w-full px-4 py-3 text-lg font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">বাতিল</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-60">
              {loading ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UpdateStockModal({ product, onClose, onSaved }: { product: Product; onClose: () => void; onSaved: () => void }) {
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || isNaN(Number(quantity))) { setError('সঠিক পরিমাণ দিন।'); return; }
    setLoading(true);
    const res = await fetch(`/api/store/products/${product.id}/stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: Number(quantity), reason }),
    });
    setLoading(false);
    if (res.ok) { onSaved(); onClose(); }
    else { const d = await res.json(); setError(d.error || 'আপডেট করতে সমস্যা হয়েছে'); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">স্টক আপডেট</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-2 text-sm">
            বর্তমান মজুদ: <span className="font-bold text-lg text-slate-800 ml-2">{product.stock}</span> {product.unit}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">যোগ করার পরিমাণ (+/-) *</label>
            <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="+50 অথবা -10"
              className="w-full px-4 py-3 text-lg font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            <p className="text-xs text-slate-500 mt-2">কমানোর জন্য আগে মাইনাস (-) চিহ্ন দিন</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">কারণ / নোট</label>
            <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. নতুন পণ্য এসেছে"
              className="w-full px-4 py-3 text-lg border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">বাতিল</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-60">
              {loading ? 'আপডেট হচ্ছে...' : 'আপডেট করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StockHistoryModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/store/products/${product.id}/stock`)
      .then(r => r.json())
      .then(d => { setHistory(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [product.id]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">স্টক ইতিহাস</h2>
            <p className="text-sm text-slate-500 mt-1">{product.name} (বর্তমান মজুদ: {product.stock})</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <p className="text-center py-10 text-slate-500">লোড হচ্ছে...</p>
          ) : history.length === 0 ? (
            <p className="text-center py-10 text-slate-500">কোনো ইতিহাস পাওয়া যায়নি</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {history.map(h => (
                <div key={h.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{h.reason || 'স্টক আপডেট'}</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(h.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-lg font-bold ${h.quantity > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {h.quantity > 0 ? '+' : ''}{h.quantity}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PrintBarcodeModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [quantity, setQuantity] = useState('12');
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:p-0 print:bg-white print:block print:relative">
      {/* Non-printable modal UI */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden print:hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><Printer className="w-5 h-5 text-blue-600"/> লেবেল প্রিন্ট</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6 overflow-y-auto">
          <div className="flex items-center gap-4 mb-6">
            <label className="font-medium text-slate-700">কপি প্রিন্ট করবেন:</label>
            <input 
              type="number" 
              value={quantity} 
              onChange={e => setQuantity(e.target.value)} 
              className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-center font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          
          <div className="bg-slate-100 p-6 rounded-xl text-center">
             <p className="text-sm text-slate-500 mb-2">প্রিভিউ (১টি লেবেল)</p>
             <div className="bg-white w-[50mm] h-[25mm] mx-auto border border-slate-200 shadow-sm flex flex-col items-center justify-center p-1">
               <p className="text-[10px] font-bold text-slate-800 line-clamp-1 leading-tight text-center">{product.name}</p>
               <img src={`https://barcodeapi.org/api/128/${product.barcode || product.id}`} className="h-6 object-contain my-0.5 grayscale" alt="Barcode" />
               <p className="text-[10px] font-black text-slate-800 leading-tight">৳{product.price}</p>
             </div>
             <p className="text-xs text-slate-500 mt-4">প্রিন্ট বাটনে ক্লিক করলে {quantity} টি লেবেলের একটি গ্রিড প্রিন্ট হবে।</p>
          </div>
        </div>
        <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
          <button onClick={onClose} className="flex-1 py-2.5 text-slate-600 bg-white border border-slate-200 font-bold rounded-xl hover:bg-slate-100 transition-colors">বাতিল</button>
          <button onClick={handlePrint} className="flex-1 py-2.5 text-white bg-blue-600 font-bold rounded-xl hover:bg-blue-700 shadow flex items-center justify-center gap-2 transition-colors">
            <Printer className="w-4 h-4"/> প্রিন্ট করুন
          </button>
        </div>
      </div>

      {/* Printable Area - Only visible when printing */}
      <div className="hidden print:flex print:flex-wrap print:gap-[2mm] print:w-full print:m-0 print:p-0">
        {Array.from({ length: Number(quantity) || 1 }).map((_, i) => (
          <div key={i} className="w-[50mm] h-[25mm] border border-black/20 flex flex-col items-center justify-center p-1 m-0 break-inside-avoid">
             <p className="text-[9px] font-bold text-black line-clamp-1 leading-tight text-center max-w-[48mm] truncate overflow-hidden">{product.name}</p>
             <img src={`https://barcodeapi.org/api/128/${product.barcode || product.id}`} className="h-6 w-[45mm] object-contain my-[1px]" alt="Barcode" />
             <p className="text-[9px] font-black text-black leading-tight">Price: ৳{product.price}</p>
          </div>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body > *:not(.print-wrapper) { display: none !important; }
          .print-wrapper { display: block !important; }
          @page { size: auto; margin: 0mm; }
        }
      `}} />
    </div>
  );
}

function ActionDropdown({ product, onUpdate }: { product: Product; onUpdate: () => void }) {
  const [open, setOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showStockUpdate, setShowStockUpdate] = useState(false);
  const [showStockHistory, setShowStockHistory] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const deleteProduct = async () => {
    if (!confirm(`"${product.name}" মুছে দিতে চান?`)) return;
    try {
      const res = await fetch(`/api/store/products/${product.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || data.details || 'পণ্যটি মুছে ফেলতে সমস্যা হয়েছে');
        return;
      }
      onUpdate();
      setOpen(false);
    } catch (err: any) {
      alert(err.message || 'নেটওয়ার্ক সমস্যা হয়েছে');
    }
  };

  return (
    <div className="relative" ref={ref}>
      {showEdit && <ProductModal product={product} onClose={() => setShowEdit(false)} onSaved={onUpdate} />}
      {showStockUpdate && <UpdateStockModal product={product} onClose={() => setShowStockUpdate(false)} onSaved={onUpdate} />}
      {showStockHistory && <StockHistoryModal product={product} onClose={() => setShowStockHistory(false)} />}
      {showPrint && (
        <div className="print-wrapper fixed inset-0 z-[100] bg-white">
          <PrintBarcodeModal product={product} onClose={() => setShowPrint(false)} />
        </div>
      )}
      <button onClick={() => setOpen(!open)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white shadow-xl rounded-xl border border-slate-100 z-10 overflow-hidden">
          <button onClick={() => { setShowStockUpdate(true); setOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> স্টক আপডেট
          </button>
          <button onClick={() => { setShowStockHistory(true); setOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
            <Clock className="w-4 h-4 text-amber-500" /> স্টক ইতিহাস
          </button>
          <div className="border-t border-slate-100" />
          <button onClick={() => { setShowPrint(true); setOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
            <Printer className="w-4 h-4 text-slate-500" /> লেবেল প্রিন্ট
          </button>
          <div className="border-t border-slate-100" />
          <button onClick={() => { setShowEdit(true); setOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
            <Edit className="w-4 h-4 text-blue-500" /> সম্পাদনা
          </button>
          <div className="border-t border-slate-100" />
          <button onClick={deleteProduct} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" /> মুছে দিন
          </button>
        </div>
      )}
    </div>
  );
}

export default function StockTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categories, setCategories] = useState<{id:string, name:string, isClassWise?:boolean}[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product, direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: keyof Product) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/store/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch { setCategories([]); }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/store/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch { setProducts([]); }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const filtered = products.filter(p =>
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.includes(searchTerm)) &&
    (filterCategory === '' || p.category.includes(filterCategory)) &&
    (filterClass === '' || p.className === filterClass)
  );

  const currentCategoryProducts = filterCategory ? products.filter(p => p.category.includes(filterCategory) && p.className) : [];
  const uniqueClasses = Array.from(new Set(currentCategoryProducts.map(p => p.className).filter(Boolean)));

  const stockStatus = (stock: number) => {
    if (stock === 0) return { label: 'মজুদ শেষ', class: 'bg-red-100 text-red-700' };
    if (stock < 20) return { label: 'মজুদ কম', class: 'bg-amber-100 text-amber-700' };
    return { label: 'মজুদ আছে', class: 'bg-emerald-100 text-emerald-700' };
  };

  const sortedFiltered = [...filtered].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    let aVal: any = a[key] ?? '';
    let bVal: any = b[key] ?? '';
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const sortIcon = (key: keyof Product) => {
    if (sortConfig?.key !== key) return null;
    return <span className="inline-block ml-1 text-blue-600">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {showModal && <ProductModal onClose={() => {setShowModal(false); setEditingProduct(undefined);}} onSaved={fetchProducts} product={editingProduct} products={filtered} defaultCategory={filterCategory} defaultClass={filterClass} />}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2 w-full sm:w-auto flex-1">
          <div className="flex gap-2 flex-1 flex-wrap sm:flex-nowrap">
            <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input type="text" placeholder="পণ্য খুঁজুন..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                lang="en"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
            </div>
          </div>
          <button onClick={() => setShowModal(true)} className="sm:hidden flex-shrink-0 flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="hidden sm:flex items-center gap-3 w-full sm:w-auto">
          <button onClick={() => {
            const csv = ['পণ্য,ক্যাটাগরি,মূল্য,মজুদ', ...filtered.map(p => `${p.name},${p.category},${p.price},${p.stock}`)].join('\n');
            const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
            a.download = 'stock.csv'; a.click();
          }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" /> এক্সপোর্ট
          </button>
          <button onClick={() => setShowCategoryModal(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <List className="w-4 h-4" /> ক্যাটাগরি
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> নতুন পণ্য
          </button>
        </div>
      </div>
      
      {/* Horizontal Category Tabs */}
      <div className="w-full overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex items-center gap-2 w-max px-1">
          <button
            onClick={(e) => {
              setFilterCategory('');
              setFilterClass('');
              e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${filterCategory === '' ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            সকল
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={(e) => {
                setFilterCategory(c.name);
                setFilterClass('');
                e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${filterCategory === c.name ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal Class Tabs */}
      {filterCategory && uniqueClasses.length > 0 && (
        <div className="w-full overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex items-center gap-2 w-max px-1">
            <button
              onClick={(e) => {
                setFilterClass('');
                e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${filterClass === '' ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              সকল ক্লাস
            </button>
            {uniqueClasses.map(cls => (
              <button
                key={cls}
                onClick={(e) => {
                  setFilterClass(cls!);
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${filterClass === cls ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="md:border md:border-slate-200 md:rounded-xl overflow-visible md:overflow-hidden md:bg-white">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-auto max-h-[calc(100vh-310px)] min-h-[350px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 shadow-2xs">
              <tr className="bg-slate-50/95 backdrop-blur-xs text-slate-500 text-sm">
                <th onClick={() => handleSort('name')} className="px-6 py-4 font-medium cursor-pointer hover:bg-slate-200 select-none">পণ্যের নাম {sortIcon('name')}</th>
                <th onClick={() => handleSort('category')} className="px-6 py-4 font-medium cursor-pointer hover:bg-slate-200 select-none">ক্যাটাগরি {sortIcon('category')}</th>
                <th onClick={() => handleSort('price')} className="px-6 py-4 font-medium cursor-pointer hover:bg-slate-200 select-none">মূল্য (৳) {sortIcon('price')}</th>
                <th onClick={() => handleSort('stock')} className="px-6 py-4 font-medium cursor-pointer hover:bg-slate-200 select-none">মজুদ {sortIcon('stock')}</th>
                <th className="px-6 py-4 font-medium">স্ট্যাটাস</th>
                <th className="px-6 py-4 font-medium text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">লোড হচ্ছে...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400">কোনো পণ্য পাওয়া যায়নি।</p>
                    <button onClick={() => setShowModal(true)} className="mt-3 text-sm text-blue-600 hover:underline">+ নতুন পণ্য যোগ করুন</button>
                  </td>
                </tr>
              ) : sortedFiltered.map(product => {
                const status = stockStatus(product.stock);
                return (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {product.name}
                      <span className="text-xs text-slate-400 font-normal ml-1.5">({product.weight ?? 0.25} কেজি)</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{product.category}</td>
                    <td className="px-6 py-4 text-slate-700">{product.price} ৳</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{product.stock} {product.unit}</td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${status.class}`}>{status.label}</span></td>
                    <td className="px-6 py-4 text-right"><ActionDropdown product={product} onUpdate={fetchProducts} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Mobile Cards */}
        <div className="md:hidden flex flex-col gap-3 min-h-[350px]">
          {loading ? (
            <div className="p-8 text-center text-slate-400">লোড হচ্ছে...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-xl">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400">কোনো পণ্য পাওয়া যায়নি।</p>
              <button onClick={() => setShowModal(true)} className="mt-3 text-sm text-blue-600 hover:underline">+ নতুন পণ্য যোগ করুন</button>
            </div>
          ) : sortedFiltered.map(product => {
            const status = stockStatus(product.stock);
            return (
              <div key={product.id} className="p-4 flex flex-col gap-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-slate-800 text-base">{product.name}</p>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${status.class}`}>{status.label}</span>
                    </div>
                    <p className="text-xs text-slate-500">{product.category}</p>
                  </div>
                  <ActionDropdown product={product} onUpdate={fetchProducts} />
                </div>

                <div className="h-px w-full bg-slate-100 my-1" />

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">মূল্য</p>
                    <p className="font-bold text-blue-600 text-lg">{product.price} ৳</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 mb-0.5">বর্তমান মজুদ</p>
                    <p className="font-bold text-slate-700 text-lg">{product.stock} <span className="text-sm font-normal text-slate-500">{product.unit}</span></p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-slate-800">ক্যাটাগরি ম্যানেজমেন্ট</h2>
              <button onClick={() => setShowCategoryModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={async e => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const input = form.elements.namedItem("name") as HTMLInputElement;
                const checkbox = form.elements.namedItem("isClassWise") as HTMLInputElement;
                if(!input.value.trim()) return;
                await fetch('/api/store/categories', {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: input.value.trim(), isClassWise: checkbox.checked })
                });
                input.value = '';
                checkbox.checked = false;
                fetchCategories();
              }} className="mb-6 border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="flex gap-2 mb-3">
                  <input name="name" type="text" placeholder="নতুন ক্যাটাগরি..." className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex-shrink-0">যোগ</button>
                </div>
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="checkbox" name="isClassWise" className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                  <span className="text-sm font-medium text-slate-700">শ্রেণীভিত্তিক (Class Wise)</span>
                </label>
              </form>
              <div className="divide-y divide-slate-100">
                {categories.map(c => (
                  <div key={c.id} className="py-3 flex items-center justify-between group">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-700">{c.name}</span>
                      {c.isClassWise && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full w-fit mt-1">শ্রেণীভিত্তিক</span>}
                    </div>
                    <button onClick={async () => {
                      if(!confirm("মুছে ফেলতে চান?")) return;
                      await fetch(`/api/store/categories/${c.id}`, { method: 'DELETE' });
                      fetchCategories();
                    }} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {categories.length === 0 && <p className="text-center py-4 text-slate-400">কোনো ক্যাটাগরি নেই</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
