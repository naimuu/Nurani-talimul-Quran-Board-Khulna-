"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Building2, MapPin, Users, Phone, Mail, Calendar, CheckCircle2, X } from "lucide-react";

type Location = {
  _id: string;
  name: string;
  bn_name: string;
  type: string;
  parentId: string | null;
};

export default function RegisterMadrasaPage() {
  const [teachers, setTeachers] = useState([{ name: "", phone: "", designation: "প্রধান-শিক্ষক" }, { name: "", phone: "", designation: "সহকারী-শিক্ষক" }]);
  
  // Location states
  const [divisions, setDivisions] = useState<Location[]>([]);
  const [districts, setDistricts] = useState<Location[]>([]);
  const [upazilas, setUpazilas] = useState<Location[]>([]);
  
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedUpazila, setSelectedUpazila] = useState("");

  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [trackingId, setTrackingId] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    englishName: "",
    instituteType: "",
    managedBy: "",
    managerName: "",
    email: "",
    registrationDate: "",
    phone1: "",
    phone2: "",
    village: "",
    postOffice: "",
    postCode: "",
    union: "",
    wardNo: "",
    addressDetails: ""
  });

  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("madrasa_register_form");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.formData) setFormData(parsed.formData);
        if (parsed.teachers) setTeachers(parsed.teachers);
        if (parsed.selectedDivision) setSelectedDivision(parsed.selectedDivision);
        if (parsed.selectedDistrict) setSelectedDistrict(parsed.selectedDistrict);
        if (parsed.selectedUpazila) setSelectedUpazila(parsed.selectedUpazila);
      } catch (e) {
        console.error("Failed to parse local storage data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("madrasa_register_form", JSON.stringify({
        formData,
        teachers,
        selectedDivision,
        selectedDistrict,
        selectedUpazila
      }));
    }
  }, [formData, teachers, selectedDivision, selectedDistrict, selectedUpazila, isLoaded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    // Fetch all divisions on mount (or you could fallback to a hardcoded list if DB is empty)
    const fetchDivisions = async () => {
      try {
        const res = await fetch("/api/admin/locations?type=DIVISION");
        if (res.ok) {
          const data = await res.json();
          // If DB has divisions, use them. Otherwise, you can provide a static list, 
          // but we will rely on the DB as requested.
          setDivisions(data.locations || []);
        }
      } catch (error) {
        console.error("Failed to fetch divisions", error);
      }
    };
    fetchDivisions();
  }, []);

  useEffect(() => {
    // Fetch districts when division changes
    const fetchDistricts = async () => {
      if (!selectedDivision) {
        setDistricts([]);
        return;
      }
      try {
        // If DB doesn't have divisions yet and we're using a fallback, just fetch all districts
        // to prevent the form from completely breaking.
        const url = selectedDivision.includes('_fallback')
          ? '/api/admin/locations?type=DISTRICT'
          : `/api/admin/locations?type=DISTRICT&parentId=${selectedDivision}`;
          
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setDistricts(data.locations || []);
        }
      } catch (error) {
        console.error("Failed to fetch districts", error);
      }
    };
    fetchDistricts();
  }, [selectedDivision]);

  useEffect(() => {
    // Fetch upazilas when district changes
    const fetchUpazilas = async () => {
      if (!selectedDistrict) {
        setUpazilas([]);
        return;
      }
      try {
        const res = await fetch(`/api/admin/locations?type=UPAZILA&parentId=${selectedDistrict}`);
        if (res.ok) {
          const data = await res.json();
          setUpazilas(data.locations || []);
        }
      } catch (error) {
        console.error("Failed to fetch upazilas", error);
      }
    };
    fetchUpazilas();
  }, [selectedDistrict]);

  const handleAddTeacher = () => {
    setTeachers([...teachers, { name: "", phone: "", designation: "" }]);
  };

  const handleTeacherChange = (index: number, field: string, value: string) => {
    const updatedTeachers = [...teachers];
    updatedTeachers[index] = { ...updatedTeachers[index], [field]: value };
    setTeachers(updatedTeachers);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('submitting');
    
    try {
      const payload = {
        ...formData,
        division: divisions.find(d => d._id === selectedDivision)?.bn_name || selectedDivision.replace('_fallback', ''),
        district: districts.find(d => d._id === selectedDistrict)?.bn_name || selectedDistrict,
        upazila: upazilas.find(u => u._id === selectedUpazila)?.bn_name || selectedUpazila,
        teachers: teachers.filter(t => t.name || t.phone)
      };

      const res = await fetch('/api/madrasa/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (res.ok) {
        setTrackingId(data.trackingId);
        localStorage.removeItem("madrasa_register_form");
        setSubmitStatus('success');
        setShowSuccessModal(true);
      } else {
        alert("Error: " + (data.error || "Something went wrong"));
        setSubmitStatus('idle');
      }
    } catch (error) {
      console.error(error);
      alert("Failed to submit application");
      setSubmitStatus('idle');
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 print:bg-white print:p-0">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-10 max-w-4xl w-full mx-auto shadow-2xl border border-emerald-100 print:shadow-none print:border-none print:p-0 print:max-w-full"
        >
          {/* Success Modal (Hidden on Print) */}
          <AnimatePresence>
            {showSuccessModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:hidden">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative text-center"
                >
                  <button 
                    onClick={() => setShowSuccessModal(false)}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                    className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle2 className="w-14 h-14" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-slate-800 mb-4">আবেদন সফল হয়েছে!</h2>
                  <p className="text-slate-600 leading-relaxed mb-8">
                    আপনার প্রতিষ্ঠানের নিবন্ধনের আবেদনটি সফলভাবে গৃহীত হয়েছে। আবেদনটি যাচাই-বাছাই করার পর আপনাকে জানানো হবে।
                  </p>
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl transition-colors text-lg"
                  >
                    রসিদ দেখুন ও প্রিন্ট করুন
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Printable Formal Document Area */}
          <div className="relative bg-white border border-slate-200 rounded-2xl p-8 print:p-4 print:border-none print:rounded-none">
            {/* Watermark for print */}
            <div className="hidden print:flex absolute inset-0 items-center justify-center opacity-[0.03] pointer-events-none">
              <span className="text-[150px] font-bold transform -rotate-45 text-slate-900">নূরানী বোর্ড</span>
            </div>

            {/* Document Header */}
            <div className="text-center border-b-2 border-slate-800 pb-6 mb-8">
              <h1 className="text-4xl font-extrabold text-slate-900 mb-2">খুলনা নূরানী বোর্ড</h1>
              <p className="text-xl text-slate-600 font-semibold mb-4">প্রতিষ্ঠান নিবন্ধন আবেদন রসিদ (অফিস ও আবেদনকারী কপি)</p>
              
              <div className="inline-block border-2 border-slate-800 rounded-lg px-8 py-3 bg-slate-50 print:bg-white">
                <p className="text-slate-600 font-semibold uppercase tracking-widest text-xs mb-1">ট্র্যাকিং নম্বর / ইলহাক নম্বর</p>
                <p className="text-3xl font-mono font-bold tracking-[0.2em] text-slate-900">{trackingId}</p>
              </div>
            </div>

            {/* Application Date */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-slate-700">
                <span className="font-semibold">আবেদনের তারিখ: </span>
                <span>{new Date().toLocaleDateString('bn-BD')}</span>
              </div>
            </div>

            {/* Content Grid */}
            <div className="space-y-8">
              {/* General Information Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-1.5 bg-slate-800 rounded-full"></div>
                  <h3 className="font-bold text-xl text-slate-800 uppercase">সাধারণ তথ্য</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1 border border-slate-200 p-4 rounded-lg bg-slate-50 print:bg-transparent print:border-slate-300">
                    <span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">প্রতিষ্ঠানের নাম (বাংলা)</span>
                    <span className="font-bold text-slate-800 text-lg">{formData.name || 'N/A'}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1 border border-slate-200 p-4 rounded-lg bg-slate-50 print:bg-transparent print:border-slate-300">
                    <span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">প্রতিষ্ঠানের নাম (ইংরেজি)</span>
                    <span className="font-bold text-slate-800 text-lg uppercase">{formData.englishName || 'N/A'}</span>
                  </div>
                  <div className="border border-slate-200 p-4 rounded-lg bg-slate-50 print:bg-transparent print:border-slate-300">
                    <span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">প্রতিষ্ঠানের ধরণ</span>
                    <span className="font-bold text-slate-800">{formData.instituteType || 'N/A'}</span>
                  </div>
                  <div className="border border-slate-200 p-4 rounded-lg bg-slate-50 print:bg-transparent print:border-slate-300">
                    <span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">পরিচালনার দায়িত্বে</span>
                    <span className="font-bold text-slate-800">{formData.managedBy || 'N/A'}</span>
                  </div>
                  <div className="col-span-2 border border-slate-200 p-4 rounded-lg bg-slate-50 print:bg-transparent print:border-slate-300">
                    <span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">দায়িত্বপ্রাপ্ত ব্যক্তির নাম</span>
                    <span className="font-bold text-slate-800">{formData.managerName || 'N/A'}</span>
                  </div>
                </div>
              </section>

              {/* Address & Contact Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-1.5 bg-slate-800 rounded-full"></div>
                  <h3 className="font-bold text-xl text-slate-800 uppercase">ঠিকানা ও যোগাযোগ</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2 border border-slate-200 p-4 rounded-lg bg-slate-50 print:bg-transparent print:border-slate-300">
                    <span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">ইমেইল ঠিকানা</span>
                    <span className="font-bold text-slate-800">{formData.email || 'N/A'}</span>
                  </div>
                  <div className="border border-slate-200 p-4 rounded-lg bg-slate-50 print:bg-transparent print:border-slate-300">
                    <span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">ফোন নম্বর ১</span>
                    <span className="font-bold text-slate-800">{formData.phone1 || 'N/A'}</span>
                  </div>
                  <div className="border border-slate-200 p-4 rounded-lg bg-slate-50 print:bg-transparent print:border-slate-300">
                    <span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">ফোন নম্বর ২</span>
                    <span className="font-bold text-slate-800">{formData.phone2 || 'N/A'}</span>
                  </div>

                  <div className="border border-slate-200 p-3 rounded-lg bg-slate-50 print:bg-transparent print:border-slate-300">
                    <span className="text-slate-500 text-xs block mb-1">বিভাগ</span>
                    <span className="font-bold text-slate-800">{divisions.find(d => d._id === selectedDivision)?.bn_name || selectedDivision.replace('_fallback', '') || 'N/A'}</span>
                  </div>
                  <div className="border border-slate-200 p-3 rounded-lg bg-slate-50 print:bg-transparent print:border-slate-300">
                    <span className="text-slate-500 text-xs block mb-1">জেলা</span>
                    <span className="font-bold text-slate-800">{districts.find(d => d._id === selectedDistrict)?.bn_name || 'N/A'}</span>
                  </div>
                  <div className="border border-slate-200 p-3 rounded-lg bg-slate-50 print:bg-transparent print:border-slate-300">
                    <span className="text-slate-500 text-xs block mb-1">থানা/উপজেলা</span>
                    <span className="font-bold text-slate-800">{upazilas.find(u => u._id === selectedUpazila)?.bn_name || 'N/A'}</span>
                  </div>
                  <div className="border border-slate-200 p-3 rounded-lg bg-slate-50 print:bg-transparent print:border-slate-300">
                    <span className="text-slate-500 text-xs block mb-1">ইউনিয়ন</span>
                    <span className="font-bold text-slate-800">{formData.union || 'N/A'}</span>
                  </div>
                  <div className="border border-slate-200 p-3 rounded-lg bg-slate-50 print:bg-transparent print:border-slate-300">
                    <span className="text-slate-500 text-xs block mb-1">গ্রাম/ওয়ার্ড</span>
                    <span className="font-bold text-slate-800">{formData.village || 'N/A'}</span>
                  </div>
                  <div className="border border-slate-200 p-3 rounded-lg bg-slate-50 print:bg-transparent print:border-slate-300">
                    <span className="text-slate-500 text-xs block mb-1">ওয়ার্ড নং</span>
                    <span className="font-bold text-slate-800">{formData.wardNo || 'N/A'}</span>
                  </div>
                  <div className="border border-slate-200 p-3 rounded-lg bg-slate-50 print:bg-transparent print:border-slate-300">
                    <span className="text-slate-500 text-xs block mb-1">পোস্ট অফিস</span>
                    <span className="font-bold text-slate-800">{formData.postOffice || 'N/A'}</span>
                  </div>
                  <div className="border border-slate-200 p-3 rounded-lg bg-slate-50 print:bg-transparent print:border-slate-300">
                    <span className="text-slate-500 text-xs block mb-1">পোস্ট কোড</span>
                    <span className="font-bold text-slate-800">{formData.postCode || 'N/A'}</span>
                  </div>
                  
                  <div className="col-span-2 md:col-span-4 border border-slate-200 p-4 rounded-lg bg-slate-50 print:bg-transparent print:border-slate-300">
                    <span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">যাতায়াত ঠিকানা (বিস্তারিত)</span>
                    <span className="font-bold text-slate-800">{formData.addressDetails || 'N/A'}</span>
                  </div>
                </div>
              </section>

              {/* Teachers Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-1.5 bg-slate-800 rounded-full"></div>
                  <h3 className="font-bold text-xl text-slate-800 uppercase">শিক্ষক তালিকা</h3>
                </div>
                <div className="overflow-hidden rounded-lg border border-slate-300">
                  <table className="w-full text-left border-collapse bg-white">
                    <thead className="bg-slate-100 print:bg-slate-100">
                      <tr>
                        <th className="py-3 px-4 text-slate-700 font-bold border-b border-slate-300">নাম</th>
                        <th className="py-3 px-4 text-slate-700 font-bold border-b border-slate-300">ফোন</th>
                        <th className="py-3 px-4 text-slate-700 font-bold border-b border-slate-300">পদ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {teachers.filter(t => t.name || t.phone).map((t, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-semibold text-slate-800">{t.name}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{t.phone}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{t.designation}</td>
                        </tr>
                      ))}
                      {teachers.filter(t => t.name || t.phone).length === 0 && (
                        <tr><td colSpan={3} className="py-4 text-center italic text-slate-500">কোনো শিক্ষক যুক্ত করা হয়নি</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {/* Formal Signatures for Print */}
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
            
            {/* Note */}
            <div className="hidden print:block mt-12 text-center text-sm text-slate-500 italic">
              * এই রসিদটি সংরক্ষণ করুন। পরবর্তীতে যেকোনো যোগাযোগের ক্ষেত্রে ট্র্যাকিং নম্বরটি প্রয়োজন হবে।
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-4 print:hidden mt-8 max-w-2xl mx-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.print()}
              className="w-1/2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 px-8 rounded-xl transition-colors text-lg flex items-center justify-center gap-2 shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              আবেদন প্রিন্ট করুন
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setFormData({
                  name: "", englishName: "", instituteType: "", managedBy: "",
                  managerName: "", email: "", registrationDate: "", phone1: "",
                  phone2: "", village: "", postOffice: "", postCode: "",
                  union: "", wardNo: "", addressDetails: ""
                });
                setTeachers([{ name: "", phone: "", designation: "প্রধান-শিক্ষক" }, { name: "", phone: "", designation: "সহকারী-শিক্ষক" }]);
                setSelectedDivision("");
                setSelectedDistrict("");
                setSelectedUpazila("");
                setTrackingId("");
                setSubmitStatus('idle');
              }}
              className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-colors text-lg"
            >
              নতুন আবেদন
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

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
        <form onSubmit={handleFormSubmit} className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100 print:shadow-none print:border-none">
          
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
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" placeholder="বাংলায় ইউনিকোড ব্যবহার করে পূরণ করুন" required />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">প্রতিষ্ঠানের নাম (ইংরেজি) <span className="text-red-500">*</span></label>
                  <input type="text" name="englishName" value={formData.englishName} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" placeholder="Type in english" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">প্রতিষ্ঠানের ধরণ <span className="text-red-500">*</span></label>
                    <select name="instituteType" value={formData.instituteType} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" required>
                      <option value="">নির্বাচন করুন</option>
                      <option value="নূরানী">নূরানী</option>
                      <option value="হিফয">হিফয</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">পরিচালনার দায়িত্বে <span className="text-red-500">*</span></label>
                    <select name="managedBy" value={formData.managedBy} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" required>
                      <option value="">নির্বাচন করুন</option>
                      <option value="পরিচালক">পরিচালক</option>
                      <option value="কমিটি">কমিটি</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">দায়িত্বপ্রাপ্ত ব্যক্তির নাম <span className="text-red-500">*</span></label>
                  <input type="text" name="managerName" value={formData.managerName} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center"><Mail className="w-4 h-4 mr-1 text-slate-400"/> প্রতিষ্ঠানের ইমেইল</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" />
                    <p className="text-xs text-slate-500 mt-1">এই মেইল ঠিকানায় ফলাফল ও প্রশ্নপত্র যাবে।</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center"><Calendar className="w-4 h-4 mr-1 text-slate-400"/> রেজিস্ট্রেশন তারিখ <span className="text-red-500 ml-1">*</span></label>
                    <input type="date" name="registrationDate" value={formData.registrationDate} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center"><Phone className="w-4 h-4 mr-1 text-slate-400"/> ব্যক্তির ফোন নম্বর <span className="text-red-500 ml-1">*</span></label>
                    <input type="text" name="phone1" value={formData.phone1} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" required />
                    <p className="text-xs text-slate-500 mt-1">এসএমএস এবং ওটিপি এই নম্বরে যাবে।</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center"><Phone className="w-4 h-4 mr-1 text-slate-400"/> ব্যক্তির ফোন নম্বর-২</label>
                    <input type="text" name="phone2" value={formData.phone2} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" />
                    <p className="text-xs text-slate-500 mt-1">একাধিক নম্বর কমা দিয়ে যুক্ত করুন</p>
                  </div>
                </div>

              </div>

              {/* Right Column - Location Info */}
              <div className="space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">বিভাগ <span className="text-red-500">*</span></label>
                    <select 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" 
                      required
                      value={selectedDivision}
                      onChange={(e) => {
                        setSelectedDivision(e.target.value);
                        setSelectedDistrict(""); // Reset district when division changes
                        setSelectedUpazila(""); // Reset upazila as well
                      }}
                    >
                      <option value="">নির্বাচন করুন</option>
                      {/* Fallback to hardcoded divisions if DB is empty, ensuring UI doesn't break while waiting for data entry */}
                      {divisions.length > 0 ? (
                        divisions.map((d) => (
                          <option key={d._id} value={d._id}>{d.bn_name}</option>
                        ))
                      ) : (
                        <>
                          <option value="khulna_fallback">খুলনা</option>
                          <option value="dhaka_fallback">ঢাকা</option>
                          <option value="chittagong_fallback">চট্টগ্রাম</option>
                          <option value="rajshahi_fallback">রাজশাহী</option>
                          <option value="barisal_fallback">বরিশাল</option>
                          <option value="sylhet_fallback">সিলেট</option>
                          <option value="rangpur_fallback">রংপুর</option>
                          <option value="mymensingh_fallback">ময়মনসিংহ</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">গ্রাম/ওয়ার্ড <span className="text-red-500">*</span></label>
                    <input type="text" name="village" value={formData.village} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" placeholder="ইউনিকোড ব্যবহার করুন" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">জেলা <span className="text-red-500">*</span></label>
                    <select 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed" 
                      required
                      disabled={!selectedDivision && divisions.length > 0}
                      value={selectedDistrict}
                      onChange={(e) => {
                        setSelectedDistrict(e.target.value);
                        setSelectedUpazila(""); // Reset upazila when district changes
                      }}
                    >
                      <option value="">নির্বাচন করুন</option>
                      {districts.map((d) => (
                        <option key={d._id} value={d._id}>{d.bn_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">পোস্ট অফিস <span className="text-red-500">*</span></label>
                    <input type="text" name="postOffice" value={formData.postOffice} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" placeholder="ইউনিকোড ব্যবহার করুন" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">থানা/উপজেলা <span className="text-red-500">*</span></label>
                    <select 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed" 
                      required
                      disabled={!selectedDistrict || upazilas.length === 0}
                      value={selectedUpazila}
                      onChange={(e) => setSelectedUpazila(e.target.value)}
                    >
                      <option value="">নির্বাচন করুন</option>
                      {upazilas.map((u) => (
                        <option key={u._id} value={u._id}>{u.bn_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">পোস্ট কোড</label>
                    <input type="text" name="postCode" value={formData.postCode} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" placeholder="পোস্ট কোড (যদি থাকে)" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">ইউনিয়ন</label>
                    <input type="text" name="union" value={formData.union} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" placeholder="ইউনিকোড ব্যবহার করুন" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">ওয়ার্ড নং</label>
                    <input type="text" name="wardNo" value={formData.wardNo} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" placeholder="ওয়ার্ড নং (যদি থাকে)" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center"><MapPin className="w-4 h-4 mr-1 text-slate-400"/> পরিদর্শনের জন্য যাতায়াত ঠিকানা</label>
                  <textarea name="addressDetails" value={formData.addressDetails} onChange={handleInputChange} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50" placeholder="খুব সহজে কিভাবে মাদরাসায় পৌঁছানো যায় তার পরিপূর্ণ বর্ণনা"></textarea>
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

            {/* Form Actions */}
            <div className="mt-10 flex gap-4 justify-center print:hidden">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  if (confirm("আপনি কি নিশ্চিত যে ফর্মের সকল তথ্য মুছে ফেলতে চান?")) {
                    localStorage.removeItem("madrasa_register_form");
                    setFormData({
                      name: "", englishName: "", instituteType: "", managedBy: "",
                      managerName: "", email: "", registrationDate: "", phone1: "",
                      phone2: "", village: "", postOffice: "", postCode: "",
                      union: "", wardNo: "", addressDetails: ""
                    });
                    setTeachers([{ name: "", phone: "", designation: "প্রধান-শিক্ষক" }, { name: "", phone: "", designation: "সহকারী-শিক্ষক" }]);
                    setSelectedDivision("");
                    setSelectedDistrict("");
                    setSelectedUpazila("");
                  }
                }}
                className="bg-slate-200 text-slate-700 font-bold py-3.5 px-8 rounded-xl shadow-sm hover:shadow-md hover:bg-slate-300 transition-all duration-200 text-lg"
              >
                তথ্য মুছুন
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitStatus === 'submitting'}
                className="bg-primary text-white font-bold py-3.5 px-12 rounded-xl shadow-lg hover:shadow-xl hover:bg-primary-dark transition-all duration-200 flex items-center justify-center text-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitStatus === 'submitting' ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                )}
                {submitStatus === 'submitting' ? 'সাবমিট হচ্ছে...' : 'সাবমিট'}
              </motion.button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
