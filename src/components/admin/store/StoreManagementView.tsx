"use client";
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, CreditCard, ClipboardList, Layers, FileText } from 'lucide-react';
import SaleTab from './SaleTab';
import StockTab from './StockTab';
import PaymentTab from './PaymentTab';
import OrderTab from './OrderTab';
import ReceiptTab from './ReceiptTab';

export type StoreCategory = 'all' | 'stationary' | 'question';

export default function StoreManagementView() {
  const [activeTab, setActiveTab] = useState<'sale' | 'stock' | 'payment' | 'order' | 'receipt'>('sale');
  const [storeCategory, setStoreCategory] = useState<StoreCategory>('all');

  useEffect(() => {
    const savedTab = localStorage.getItem('store_active_tab');
    if (savedTab === 'sale' || savedTab === 'stock' || savedTab === 'payment' || savedTab === 'order' || savedTab === 'receipt') {
      setActiveTab(savedTab);
    }
    const savedCat = localStorage.getItem('store_category_filter');
    if (savedCat === 'all' || savedCat === 'stationary' || savedCat === 'question') {
      setStoreCategory(savedCat as StoreCategory);
    }
  }, []);

  const handleTabChange = (tab: 'sale' | 'stock' | 'payment' | 'order' | 'receipt') => {
    setActiveTab(tab);
    localStorage.setItem('store_active_tab', tab);
  };

  const handleCategoryChange = (cat: StoreCategory) => {
    setStoreCategory(cat);
    localStorage.setItem('store_category_filter', cat);
  };

  const handleTabClick = (e: React.MouseEvent<HTMLButtonElement>, tab: 'sale' | 'stock' | 'payment' | 'order' | 'receipt') => {
    handleTabChange(tab);
    e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  return (
    <div className="bg-transparent md:bg-white md:rounded-2xl md:shadow-sm md:border md:border-slate-100 overflow-visible min-h-[600px] flex flex-col -mx-3 md:mx-0">
      {/* Header & Tabs */}
      <div className="border-b border-slate-200 md:bg-slate-50/50 pt-2 md:pt-6 px-3 md:px-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4 md:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">স্টোর পরিচালনা</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              বই, স্টেশনারি ও পরীক্ষার প্রশ্নপত্রের স্টক, বিক্রয়, অর্ডার ও পেমেন্ট পরিচালনা করুন।
            </p>
          </div>

          {/* Global Category Filter Bar */}
          <div className="inline-flex p-0.5 sm:p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs self-start lg:self-auto shrink-0">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                storeCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>সকল</span>
            </button>

            <button
              onClick={() => handleCategoryChange('stationary')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                storeCategory === 'stationary'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>বই/স্টেশনারি</span>
            </button>

            <button
              onClick={() => handleCategoryChange('question')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                storeCategory === 'question'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>প্রশ্নপত্র</span>
            </button>
          </div>
        </div>
        
        <div className="flex gap-4 sm:gap-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] text-xs sm:text-sm">
          <button
            onClick={(e) => handleTabClick(e, 'sale')}
            className={`flex items-center gap-1.5 pb-3 px-1 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'sale' 
                ? 'border-primary text-primary font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 font-medium'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>বিক্রয়</span>
          </button>

          <button
            onClick={(e) => handleTabClick(e, 'order')}
            className={`flex items-center gap-1.5 pb-3 px-1 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'order' 
                ? 'border-amber-600 text-amber-600 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 font-medium'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>অর্ডার</span>
          </button>
          
          <button
            onClick={(e) => handleTabClick(e, 'stock')}
            className={`flex items-center gap-1.5 pb-3 px-1 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'stock' 
                ? 'border-blue-600 text-blue-600 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 font-medium'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>স্টক</span>
          </button>

          <button
            onClick={(e) => handleTabClick(e, 'payment')}
            className={`flex items-center gap-1.5 pb-3 px-1 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'payment' 
                ? 'border-purple-600 text-purple-600 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 font-medium'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>পেমেন্ট</span>
          </button>

          <button
            onClick={(e) => handleTabClick(e, 'receipt')}
            className={`flex items-center gap-1.5 pb-3 px-1 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'receipt' 
                ? 'border-emerald-600 text-emerald-600 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 font-medium'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>রিসিট</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 px-3 py-4 md:p-6 bg-transparent md:bg-white overflow-visible">
        {activeTab === 'sale' && <SaleTab storeCategory={storeCategory} onCategoryChange={handleCategoryChange} />}
        {activeTab === 'order' && <OrderTab initialCategory={storeCategory} onCategoryChange={handleCategoryChange} />}
        {activeTab === 'stock' && <StockTab storeCategory={storeCategory} onCategoryChange={handleCategoryChange} />}
        {activeTab === 'payment' && <PaymentTab storeCategory={storeCategory} onCategoryChange={handleCategoryChange} />}
        {activeTab === 'receipt' && <ReceiptTab storeCategory={storeCategory} onCategoryChange={handleCategoryChange} />}
      </div>
    </div>
  );
}
