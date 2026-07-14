import React from 'react';
import { motion } from 'framer-motion';

interface PrintableReceiptProps {
  application: any;
  onNewApplication?: () => void;
}

export default function PrintableReceipt({ application, onNewApplication }: PrintableReceiptProps) {
  const {
    trackingId, name, englishName, instituteType, managedBy, managerName,
    email, phone1, phone2, division, district, upazila, union, village,
    postOffice, postCode, wardNo, addressDetails, teachers, status, createdAt
  } = application;
  
  const applicationDate = createdAt
    ? new Date(createdAt).toLocaleDateString('bn-BD')
    : new Date().toLocaleDateString('bn-BD');

  return (
    <div className="relative bg-white border border-slate-200 rounded-2xl p-8 print:p-4 print:border-none print:rounded-none">
      {/* Watermark for print */}
      <div className="hidden print:flex absolute inset-0 items-center justify-center opacity-[0.03] pointer-events-none">
        <span className="text-[150px] font-bold transform -rotate-45 text-slate-900">নূরানী বোর্ড</span>
      </div>

      {/* Document Header */}
      <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">খুলনা নূরানী তালিমুল কুরআন বোর্ড</h1>
        <p className="text-slate-700 mb-1">খুলনা, বাংলাদেশ</p>
        <p className="text-xl text-slate-900 font-bold mt-2">প্রতিষ্ঠান নিবন্ধন আবেদন রসিদ (অফিস ও আবেদনকারী কপি)</p>
      </div>

      {/* Tracking and Date Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="border-2 border-slate-800 px-6 py-2 bg-slate-50 print:bg-white inline-block">
          <p className="text-slate-700 font-bold uppercase text-xs mb-0.5">ট্র্যাকিং নম্বর / ইলহাক নম্বর</p>
          <p className="text-2xl font-mono font-bold tracking-[0.15em] text-slate-900">{trackingId}</p>
        </div>
        
        <div className="flex flex-col items-start sm:items-end gap-2">
          <div className="text-slate-900 border border-slate-800 px-4 py-1.5 font-semibold text-sm">
            আবেদনের তারিখ: {applicationDate}
          </div>
          {status && (
            <div className="print:hidden">
              <span className={`px-4 py-1 rounded-none border text-sm font-bold ${
                status === 'APPROVED' ? 'bg-emerald-50 border-emerald-600 text-emerald-700' :
                status === 'REJECTED' ? 'bg-red-50 border-red-600 text-red-700' :
                'bg-amber-50 border-amber-600 text-amber-700'
              }`}>
                {status === 'APPROVED' ? '✓ অনুমোদিত' :
                 status === 'REJECTED' ? '✗ বাতিলকৃত' : '⏳ অপেক্ষমান'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content Form Sections - Plain Form Style */}
      <div className="space-y-8 mt-4">
        
        {/* General Info */}
        <div className="mt-6">
          <div className="flex items-center justify-center mb-4">
            <div className="flex-1 border-b border-gray-300"></div>
            <h3 className="font-semibold text-sm text-gray-600 border border-gray-400 rounded-full px-4 py-0.5 whitespace-nowrap mx-4">সাধারণ তথ্য</h3>
            <div className="flex-1 border-b border-gray-300"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
            <div className="flex items-end border-b border-gray-300 border-dotted pb-1 md:col-span-2">
              <div className="w-[180px] text-gray-700 font-semibold shrink-0">প্রতিষ্ঠানের নাম (বাংলা)</div>
              <div className="text-gray-700 font-semibold px-2">:</div>
              <div className="font-bold text-black flex-1">{name || 'N/A'}</div>
            </div>
            <div className="flex items-end border-b border-gray-300 border-dotted pb-1 md:col-span-2">
              <div className="w-[180px] text-gray-700 font-semibold shrink-0">প্রতিষ্ঠানের নাম (ইংরেজি)</div>
              <div className="text-gray-700 font-semibold px-2">:</div>
              <div className="font-bold text-black flex-1 uppercase">{englishName || 'N/A'}</div>
            </div>
            <div className="flex items-end border-b border-gray-300 border-dotted pb-1">
              <div className="w-[180px] text-gray-700 font-semibold shrink-0">প্রতিষ্ঠানের ধরণ</div>
              <div className="text-gray-700 font-semibold px-2">:</div>
              <div className="font-bold text-black flex-1">{instituteType || 'N/A'}</div>
            </div>
            <div className="flex items-end border-b border-gray-300 border-dotted pb-1">
              <div className="w-[180px] text-gray-700 font-semibold shrink-0">পরিচালনার দায়িত্বে</div>
              <div className="text-gray-700 font-semibold px-2">:</div>
              <div className="font-bold text-black flex-1">{managedBy || 'N/A'}</div>
            </div>
            <div className="flex items-end border-b border-gray-300 border-dotted pb-1 md:col-span-2">
              <div className="w-[180px] text-gray-700 font-semibold shrink-0">দায়িত্বপ্রাপ্ত ব্যক্তির নাম</div>
              <div className="text-gray-700 font-semibold px-2">:</div>
              <div className="font-bold text-black flex-1">{managerName || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="mt-6">
          <div className="flex items-center justify-center mb-4">
            <div className="flex-1 border-b border-gray-300"></div>
            <h3 className="font-semibold text-sm text-gray-600 border border-gray-400 rounded-full px-4 py-0.5 whitespace-nowrap mx-4">ঠিকানা ও যোগাযোগ</h3>
            <div className="flex-1 border-b border-gray-300"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
            <div className="flex items-end border-b border-gray-300 border-dotted pb-1 md:col-span-2">
              <div className="w-[180px] text-gray-700 font-semibold shrink-0">ইমেইল ঠিকানা</div>
              <div className="text-gray-700 font-semibold px-2">:</div>
              <div className="font-bold text-black flex-1">{email || 'N/A'}</div>
            </div>
            <div className="flex items-end border-b border-gray-300 border-dotted pb-1">
              <div className="w-[180px] text-gray-700 font-semibold shrink-0">ফোন নম্বর ১</div>
              <div className="text-gray-700 font-semibold px-2">:</div>
              <div className="font-bold text-black flex-1">{phone1 || 'N/A'}</div>
            </div>
            <div className="flex items-end border-b border-gray-300 border-dotted pb-1">
              <div className="w-[180px] text-gray-700 font-semibold shrink-0">ফোন নম্বর ২</div>
              <div className="text-gray-700 font-semibold px-2">:</div>
              <div className="font-bold text-black flex-1">{phone2 || 'N/A'}</div>
            </div>
            {[
              { label: 'বিভাগ', value: division },
              { label: 'জেলা', value: district },
              { label: 'থানা/উপজেলা', value: upazila },
              { label: 'ইউনিয়ন', value: union },
              { label: 'গ্রাম/ওয়ার্ড', value: village },
              { label: 'ওয়ার্ড নং', value: wardNo },
              { label: 'পোস্ট অফিস', value: postOffice },
              { label: 'পোস্ট কোড', value: postCode },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-end border-b border-gray-300 border-dotted pb-1">
                <div className="w-[180px] text-gray-700 font-semibold shrink-0">{label}</div>
                <div className="text-gray-700 font-semibold px-2">:</div>
                <div className="font-bold text-black flex-1">{value || 'N/A'}</div>
              </div>
            ))}
            <div className="flex items-end border-b border-gray-300 border-dotted pb-1 md:col-span-2 mt-2">
              <div className="w-[180px] text-gray-700 font-semibold shrink-0">যাতায়াত ঠিকানা (বিস্তারিত)</div>
              <div className="text-gray-700 font-semibold px-2">:</div>
              <div className="font-bold text-black flex-1">{addressDetails || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Teachers */}
        <div className="mt-6">
          <div className="flex items-center justify-center mb-4">
            <div className="flex-1 border-b border-gray-300"></div>
            <h3 className="font-semibold text-sm text-gray-600 border border-gray-400 rounded-full px-4 py-0.5 whitespace-nowrap mx-4">শিক্ষক তালিকা</h3>
            <div className="flex-1 border-b border-gray-300"></div>
          </div>
          <div className="border border-black">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black bg-gray-100 print:bg-transparent">
                  <th className="py-2 px-4 text-black font-bold border-r border-black">নাম</th>
                  <th className="py-2 px-4 text-black font-bold border-r border-black">ফোন</th>
                  <th className="py-2 px-4 text-black font-bold">পদ</th>
                </tr>
              </thead>
              <tbody>
                {teachers?.filter((t: any) => t.name || t.phone).map((t: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-300 last:border-b-0">
                    <td className="py-2 px-4 text-black border-r border-black">{t.name}</td>
                    <td className="py-2 px-4 text-black border-r border-black">{t.phone}</td>
                    <td className="py-2 px-4 text-black">{t.designation}</td>
                  </tr>
                ))}
                {(!teachers || teachers.filter((t: any) => t.name || t.phone).length === 0) && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-500">কোনো শিক্ষক তালিকাভুক্ত নেই</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Signature lines for print */}
      <div className="hidden print:flex justify-between items-end mt-24 px-8">
        <div className="text-center">
          <div className="w-48 border-t-2 border-slate-800 border-dashed mb-2"></div>
          <p className="font-bold text-slate-800">আবেদনকারীর স্বাক্ষর</p>
          <p className="text-sm text-slate-500">তারিখ: .......................</p>
        </div>
        <div className="text-center">
          <div className="w-48 border-t-2 border-slate-800 border-dashed mb-2"></div>
          <p className="font-bold text-slate-800">কর্তৃপক্ষের স্বাক্ষর ও সীল</p>
          <p className="text-sm text-slate-500">তারিখ: .......................</p>
        </div>
      </div>

      {/* Print note */}
      <div className="hidden print:block mt-12 text-center text-sm text-slate-500 italic">
        * এই রসিদটি সংরক্ষণ করুন। পরবর্তীতে যেকোনো যোগাযোগের ক্ষেত্রে ট্র্যাকিং নম্বরটি প্রয়োজন হবে।
      </div>

      {/* Action Buttons (hidden on print) */}
      <div className="flex gap-4 print:hidden mt-8 max-w-2xl mx-auto">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.print()}
          className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 px-8 rounded-xl transition-colors text-lg flex items-center justify-center gap-2 shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          আবেদন প্রিন্ট করুন
        </motion.button>
        {onNewApplication && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewApplication}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-colors text-lg"
          >
            নতুন আবেদন
          </motion.button>
        )}
      </div>
    </div>
  );
}
