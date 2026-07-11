"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Info, Building2, MapPin, Users, Phone, Mail, Calendar, CheckCircle2 } from "lucide-react";

export default function RegisterMadrasaPage() {
  const [teachers, setTeachers] = useState([{ name: "", phone: "", designation: "প্রধান-শিক্ষক" }, { name: "", phone: "", designation: "সহকারী-শিক্ষক" }]);

  const handleAddTeacher = () => {
    setTeachers([...teachers, { name: "", phone: "", designation: "" }]);
  };

  const handleTeacherChange = (index: number, field: string, value: string) => {
    const updatedTeachers = [...teachers];
    updatedTeachers[index] = { ...updatedTeachers[index], [field]: value };
    setTeachers(updatedTeachers);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0">
      
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-10 print:mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2 border-b-2 border-primary inline-block pb-2 print:text-2xl">
            নতুন প্রতিষ্ঠান নিবন্ধন ফরম
          </h1>
        </div>

        {/* Info Alerts */}
        <div className="mb-8 space-y-4 print:hidden">
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-xl flex items-center justify-center text-center shadow-sm">
            <Info className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="font-medium">সকল তথ্য বাংলায় ইউনিকোড ব্যবহার করে পূরণ করুন।</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-xl text-center shadow-sm text-sm">
            <p className="font-semibold mb-1">আপনার প্রতিষ্ঠান নিবন্ধনের আবেদন পূর্বে করা হয়ে থাকলে পুনরায় করা হতে বিরত থাকুন।</p>
            <p>আপনার প্রতিষ্ঠানের নিবন্ধন পূর্বে হয়েছে কিনা, প্রতিষ্ঠান কোড অথবা প্রতিষ্ঠান সম্পর্কিত যাবতীয় সকল তথ্যের জন্য হেল্পলাইন নম্বরে যোগাযোগ করুন।</p>
            <p className="mt-2 font-bold text-emerald-900 bg-emerald-100 inline-block px-3 py-1 rounded-lg">হেল্পলাইন নম্বর: ০৯৬৪৭-৪৭৬৯৯০ (১০.০০am - ৮.০০pm)</p>
          </div>
        </div>

        {/* Main Form Container */}
        <form className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100 print:shadow-none print:border-none">
          
          <div className="bg-primary/5 border-b border-slate-100 px-8 py-5 flex items-center">
            <Building2 className="w-6 h-6 text-primary mr-3" />
            <h2 className="text-xl font-bold text-slate-800">আবেদনকারীর তথ্য</h2>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
              
              {/* Left Column - Institute Info */}
              <div className="space-y-6">
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">প্রতিষ্ঠানের নাম <span className="text-red-500">*</span></label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" placeholder="বাংলায় ইউনিকোড ব্যবহার করে পূরণ করুন" required />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">প্রতিষ্ঠানের নাম (ইংরেজি) <span className="text-red-500">*</span></label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" placeholder="Type in english" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">প্রতিষ্ঠানের ধরণ <span className="text-red-500">*</span></label>
                    <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" required>
                      <option value="">নির্বাচন করুন</option>
                      <option value="নূরানী">নূরানী</option>
                      <option value="হিফয">হিফয</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">পরিচালনার দায়িত্বে <span className="text-red-500">*</span></label>
                    <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" required>
                      <option value="">নির্বাচন করুন</option>
                      <option value="পরিচালক">পরিচালক</option>
                      <option value="কমিটি">কমিটি</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">দায়িত্বপ্রাপ্ত ব্যক্তির নাম <span className="text-red-500">*</span></label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center"><Mail className="w-4 h-4 mr-1 text-slate-400"/> প্রতিষ্ঠানের ইমেইল</label>
                    <input type="email" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" />
                    <p className="text-xs text-slate-500 mt-1">এই মেইল ঠিকানায় ফলাফল ও প্রশ্নপত্র যাবে।</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center"><Calendar className="w-4 h-4 mr-1 text-slate-400"/> রেজিস্ট্রেশন তারিখ <span className="text-red-500 ml-1">*</span></label>
                    <input type="date" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center"><Phone className="w-4 h-4 mr-1 text-slate-400"/> ব্যক্তির ফোন নম্বর <span className="text-red-500 ml-1">*</span></label>
                    <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" required />
                    <p className="text-xs text-slate-500 mt-1">এসএমএস এবং ওটিপি এই নম্বরে যাবে।</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center"><Phone className="w-4 h-4 mr-1 text-slate-400"/> ব্যক্তির ফোন নম্বর-২</label>
                    <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" />
                    <p className="text-xs text-slate-500 mt-1">একাধিক নম্বর কমা দিয়ে যুক্ত করুন</p>
                  </div>
                </div>

              </div>

              {/* Right Column - Location Info */}
              <div className="space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">বিভাগ <span className="text-red-500">*</span></label>
                    <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" required>
                      <option value="">নির্বাচন করুন</option>
                      <option value="খুলনা">খুলনা</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">গ্রাম/ওয়ার্ড <span className="text-red-500">*</span></label>
                    <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" placeholder="ইউনিকোড ব্যবহার করুন" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">জেলা <span className="text-red-500">*</span></label>
                    <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" required>
                      <option value="">নির্বাচন করুন</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">পোস্ট অফিস <span className="text-red-500">*</span></label>
                    <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" placeholder="ইউনিকোড ব্যবহার করুন" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">থানা/উপজেলা <span className="text-red-500">*</span></label>
                    <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" required>
                      <option value="">নির্বাচন করুন</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">পোস্ট কোড</label>
                    <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" placeholder="পোস্ট কোড (যদি থাকে)" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">ইউনিয়ন</label>
                    <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" placeholder="ইউনিকোড ব্যবহার করুন" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">ওয়ার্ড নং</label>
                    <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" placeholder="ওয়ার্ড নং (যদি থাকে)" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center"><MapPin className="w-4 h-4 mr-1 text-slate-400"/> পরিদর্শনের জন্য যাতায়াত ঠিকানা</label>
                  <textarea rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" placeholder="খুব সহজে কিভাবে মাদরাসায় পৌঁছানো যায় তার পরিপূর্ণ বর্ণনা"></textarea>
                </div>

              </div>

            </div>

            {/* Teachers Section */}
            <div className="mt-12">
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-t-xl px-6 py-4 flex items-center">
                <Users className="w-5 h-5 text-emerald-700 mr-2" />
                <h3 className="text-lg font-bold text-emerald-900">প্রতিষ্ঠানের শিক্ষক</h3>
              </div>
              <div className="border-x border-b border-slate-200 rounded-b-xl p-6 bg-white overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="text-left text-sm font-bold text-slate-600 border-b border-slate-200">
                      <th className="pb-3 w-5/12">নাম</th>
                      <th className="pb-3 w-4/12 px-4">ফোন</th>
                      <th className="pb-3 w-3/12">পদ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teachers.map((teacher, idx) => (
                      <tr key={idx}>
                        <td className="py-3">
                          <input 
                            type="text" 
                            value={teacher.name}
                            onChange={(e) => handleTeacherChange(idx, 'name', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                            placeholder="শিক্ষকের নাম"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input 
                            type="text" 
                            value={teacher.phone}
                            onChange={(e) => handleTeacherChange(idx, 'phone', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                            placeholder="ফোন নম্বর"
                          />
                        </td>
                        <td className="py-3">
                          <input 
                            type="text" 
                            value={teacher.designation}
                            onChange={(e) => handleTeacherChange(idx, 'designation', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                            placeholder="যেমন: প্রধান-শিক্ষক"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 print:hidden">
                  <button type="button" onClick={handleAddTeacher} className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors flex items-center">
                    + আরও শিক্ষক যুক্ত করুন
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-10 text-center print:hidden">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="bg-primary text-white font-bold py-3.5 px-12 rounded-xl shadow-lg hover:shadow-xl hover:bg-primary-dark transition-all duration-200 flex items-center justify-center mx-auto text-lg"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                সাবমিট
              </motion.button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
