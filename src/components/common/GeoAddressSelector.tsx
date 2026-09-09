"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Building2, Truck, ChevronDown, Check } from "lucide-react";

export type GeoAddressData = {
  division: string;
  district: string;
  upazila: string;
  union: string;
  village: string;
  fullAddress: string;
};

interface GeoAddressSelectorProps {
  // Main Address
  value: GeoAddressData;
  onChange: (data: GeoAddressData) => void;
  title?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  
  // Delivery Address
  hasSeparateDelivery?: boolean;
  onSeparateDeliveryChange?: (hasSeparate: boolean) => void;
  deliveryValue?: GeoAddressData;
  onDeliveryChange?: (data: GeoAddressData) => void;
}

type LocationItem = {
  _id: string;
  name: string;
  bn_name: string;
  type: string;
  parentId: string | null;
};

const DEFAULT_DIVISIONS = [
  { _id: "6aa1e9117ca55e95b01d0a01", name: "Khulna", bn_name: "খুলনা", type: "DIVISION", parentId: null },
  { _id: "6aa1e9117ca55e95b01d0a02", name: "Dhaka", bn_name: "ঢাকা", type: "DIVISION", parentId: null },
  { _id: "6aa1e9117ca55e95b01d0a03", name: "Chittagong", bn_name: "চট্টগ্রাম", type: "DIVISION", parentId: null },
  { _id: "6aa1e9117ca55e95b01d0a04", name: "Rajshahi", bn_name: "রাজশাহী", type: "DIVISION", parentId: null },
  { _id: "6aa1e9117ca55e95b01d0a05", name: "Rangpur", bn_name: "রংপুর", type: "DIVISION", parentId: null },
  { _id: "6aa1e9117ca55e95b01d0a06", name: "Barisal", bn_name: "বরিশাল", type: "DIVISION", parentId: null },
  { _id: "6aa1e9117ca55e95b01d0a07", name: "Sylhet", bn_name: "সিলেট", type: "DIVISION", parentId: null },
  { _id: "6aa1e9117ca55e95b01d0a08", name: "Mymensingh", bn_name: "ময়মনসিংহ", type: "DIVISION", parentId: null },
];

export default function GeoAddressSelector({
  value,
  onChange,
  title,
  label,
  required = true,
  disabled = false,
  hasSeparateDelivery = false,
  onSeparateDeliveryChange,
  deliveryValue,
  onDeliveryChange,
}: GeoAddressSelectorProps) {
  const displayTitle = label || title || "ঠিকানা ও অবস্থান";
  // Main Address state
  const [divisions, setDivisions] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [upazilas, setUpazilas] = useState<LocationItem[]>([]);
  const [unions, setUnions] = useState<LocationItem[]>([]);

  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingUpazilas, setLoadingUpazilas] = useState(false);
  const [loadingUnions, setLoadingUnions] = useState(false);

  // Delivery Address state
  const [delDivisions, setDelDivisions] = useState<LocationItem[]>([]);
  const [delDistricts, setDelDistricts] = useState<LocationItem[]>([]);
  const [delUpazilas, setDelUpazilas] = useState<LocationItem[]>([]);
  const [delUnions, setDelUnions] = useState<LocationItem[]>([]);

  const [loadingDelDistricts, setLoadingDelDistricts] = useState(false);
  const [loadingDelUpazilas, setLoadingDelUpazilas] = useState(false);
  const [loadingDelUnions, setLoadingDelUnions] = useState(false);

  // 1. Fetch Divisions on mount
  useEffect(() => {
    fetch("/api/admin/locations?type=DIVISION")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.locations) && data.locations.length > 0) {
          setDivisions(data.locations);
          setDelDivisions(data.locations);
        } else {
          setDivisions(DEFAULT_DIVISIONS);
          setDelDivisions(DEFAULT_DIVISIONS);
        }
      })
      .catch(() => {
        setDivisions(DEFAULT_DIVISIONS);
        setDelDivisions(DEFAULT_DIVISIONS);
      });
  }, []);

  // 2. Fetch Main Districts when Division changes
  useEffect(() => {
    if (!value.division) {
      setDistricts([]);
      setLoadingDistricts(false);
      return;
    }
    const selectedDivObj = divisions.find(
      (d) => d.bn_name === value.division || d.name?.toLowerCase() === value.division?.toLowerCase() || d._id === value.division
    );
    const parentParam = selectedDivObj ? `&parentId=${selectedDivObj._id}` : `&parentId=${encodeURIComponent(value.division)}`;
    setLoadingDistricts(true);
    fetch(`/api/admin/locations?type=DISTRICT${parentParam}`)
      .then((res) => res.json())
      .then((data) => {
        setDistricts(Array.isArray(data.locations) ? data.locations : []);
      })
      .catch(() => setDistricts([]))
      .finally(() => setLoadingDistricts(false));
  }, [value.division, divisions]);

  // 3. Fetch Main Upazilas when District changes
  useEffect(() => {
    if (!value.district) {
      setUpazilas([]);
      setLoadingUpazilas(false);
      return;
    }
    const selectedDistObj = districts.find(
      (d) => d.bn_name === value.district || d.name?.toLowerCase() === value.district?.toLowerCase() || d._id === value.district
    );
    const parentParam = selectedDistObj ? `&parentId=${selectedDistObj._id}` : `&parentId=${encodeURIComponent(value.district)}`;
    setLoadingUpazilas(true);
    fetch(`/api/admin/locations?type=UPAZILA${parentParam}`)
      .then((res) => res.json())
      .then((data) => {
        setUpazilas(Array.isArray(data.locations) ? data.locations : []);
      })
      .catch(() => setUpazilas([]))
      .finally(() => setLoadingUpazilas(false));
  }, [value.district, districts]);

  // 4. Fetch Main Unions when Upazila changes
  useEffect(() => {
    if (!value.upazila) {
      setUnions([]);
      setLoadingUnions(false);
      return;
    }
    const selectedUpzObj = upazilas.find(
      (u) => u.bn_name === value.upazila || u.name?.toLowerCase() === value.upazila?.toLowerCase() || u._id === value.upazila
    );
    const parentParam = selectedUpzObj ? `&parentId=${selectedUpzObj._id}` : `&parentId=${encodeURIComponent(value.upazila)}`;
    setLoadingUnions(true);
    fetch(`/api/admin/locations?type=UNION${parentParam}`)
      .then((res) => res.json())
      .then((data) => {
        setUnions(Array.isArray(data.locations) ? data.locations : []);
      })
      .catch(() => setUnions([]))
      .finally(() => setLoadingUnions(false));
  }, [value.upazila, upazilas]);

  // 5. Fetch Delivery Districts when Delivery Division changes
  useEffect(() => {
    if (!deliveryValue?.division) {
      setDelDistricts([]);
      setLoadingDelDistricts(false);
      return;
    }
    const selectedDivObj = delDivisions.find(
      (d) => d.bn_name === deliveryValue.division || d.name?.toLowerCase() === deliveryValue.division?.toLowerCase() || d._id === deliveryValue.division
    );
    const parentParam = selectedDivObj ? `&parentId=${selectedDivObj._id}` : `&parentId=${encodeURIComponent(deliveryValue.division)}`;
    setLoadingDelDistricts(true);
    fetch(`/api/admin/locations?type=DISTRICT${parentParam}`)
      .then((res) => res.json())
      .then((data) => {
        setDelDistricts(Array.isArray(data.locations) ? data.locations : []);
      })
      .catch(() => setDelDistricts([]))
      .finally(() => setLoadingDelDistricts(false));
  }, [deliveryValue?.division, delDivisions]);

  // 6. Fetch Delivery Upazilas when Delivery District changes
  useEffect(() => {
    if (!deliveryValue?.district) {
      setDelUpazilas([]);
      setLoadingDelUpazilas(false);
      return;
    }
    const selectedDistObj = delDistricts.find(
      (d) => d.bn_name === deliveryValue.district || d.name?.toLowerCase() === deliveryValue.district?.toLowerCase() || d._id === deliveryValue.district
    );
    const parentParam = selectedDistObj ? `&parentId=${selectedDistObj._id}` : `&parentId=${encodeURIComponent(deliveryValue.district)}`;
    setLoadingDelUpazilas(true);
    fetch(`/api/admin/locations?type=UPAZILA${parentParam}`)
      .then((res) => res.json())
      .then((data) => {
        setDelUpazilas(Array.isArray(data.locations) ? data.locations : []);
      })
      .catch(() => setDelUpazilas([]))
      .finally(() => setLoadingDelUpazilas(false));
  }, [deliveryValue?.district, delDistricts]);

  // 7. Fetch Delivery Unions when Delivery Upazila changes
  useEffect(() => {
    if (!deliveryValue?.upazila) {
      setDelUnions([]);
      setLoadingDelUnions(false);
      return;
    }
    const selectedUpzObj = delUpazilas.find(
      (u) => u.bn_name === deliveryValue.upazila || u.name?.toLowerCase() === deliveryValue.upazila?.toLowerCase() || u._id === deliveryValue.upazila
    );
    const parentParam = selectedUpzObj ? `&parentId=${selectedUpzObj._id}` : `&parentId=${encodeURIComponent(deliveryValue.upazila)}`;
    setLoadingDelUnions(true);
    fetch(`/api/admin/locations?type=UNION${parentParam}`)
      .then((res) => res.json())
      .then((data) => {
        setDelUnions(Array.isArray(data.locations) ? data.locations : []);
      })
      .catch(() => setDelUnions([]))
      .finally(() => setLoadingDelUnions(false));
  }, [deliveryValue?.upazila, delUpazilas]);

  const updateMainFields = (updates: Partial<GeoAddressData>) => {
    const updated = { ...value, ...updates };
    // Auto-calculate formatted full address
    const parts = [
      updated.village,
      updated.union,
      updated.upazila,
      updated.district,
      updated.division,
    ].filter(Boolean);
    updated.fullAddress = parts.join(", ");
    onChange(updated);
  };

  const updateDeliveryFields = (updates: Partial<GeoAddressData>) => {
    if (!onDeliveryChange || !deliveryValue) return;
    const updated = { ...deliveryValue, ...updates };
    const parts = [
      updated.village,
      updated.union,
      updated.upazila,
      updated.district,
      updated.division,
    ].filter(Boolean);
    updated.fullAddress = parts.join(", ");
    onDeliveryChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* ─── MAIN ADDRESS ─────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <h4 className="font-extrabold text-sm sm:text-base text-slate-900">{displayTitle}</h4>
          </div>
          {required && <span className="text-xs text-red-500 font-bold">* বাধ্যতামূলক</span>}
        </div>

        {/* Level 1 & 2: Division & District */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ১. বিভাগ {required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={
                divisions.find(
                  (d) => d.bn_name === value.division || d.name?.toLowerCase() === value.division?.toLowerCase() || d._id === value.division
                )?.bn_name || value.division || ""
              }
              onChange={(e) => {
                const newDiv = e.target.value;
                updateMainFields({
                  division: newDiv,
                  district: "",
                  upazila: "",
                  union: "",
                });
              }}
              disabled={disabled}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">-- বিভাগ নির্বাচন করুন --</option>
              {divisions.map((d) => (
                <option key={d._id} value={d.bn_name}>
                  {d.bn_name} ({d.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ২. জেলা {required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={
                districts.find(
                  (d) => d.bn_name === value.district || d.name?.toLowerCase() === value.district?.toLowerCase() || d._id === value.district
                )?.bn_name || value.district || ""
              }
              onChange={(e) => {
                const newDist = e.target.value;
                updateMainFields({
                  district: newDist,
                  upazila: "",
                  union: "",
                });
              }}
              disabled={disabled || !value.division || loadingDistricts}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {!value.division ? (
                <option value="">-- প্রথমে বিভাগ নির্বাচন করুন --</option>
              ) : loadingDistricts ? (
                <option value="">জেলা লোড হচ্ছে...</option>
              ) : (
                <option value="">-- জেলা নির্বাচন করুন --</option>
              )}
              {districts.map((d) => (
                <option key={d._id} value={d.bn_name}>
                  {d.bn_name} {d.name ? `(${d.name})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Level 3 & 4: Upazila & Union */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ৩. উপজেলা / থানা {required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={
                upazilas.find(
                  (u) => u.bn_name === value.upazila || u.name?.toLowerCase() === value.upazila?.toLowerCase() || u._id === value.upazila
                )?.bn_name || value.upazila || ""
              }
              onChange={(e) => {
                const newUpz = e.target.value;
                updateMainFields({
                  upazila: newUpz,
                  union: "",
                });
              }}
              disabled={disabled || !value.district || loadingUpazilas}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {!value.district ? (
                <option value="">-- প্রথমে জেলা নির্বাচন করুন --</option>
              ) : loadingUpazilas ? (
                <option value="">উপজেলা লোড হচ্ছে...</option>
              ) : (
                <option value="">-- উপজেলা / থানা নির্বাচন করুন --</option>
              )}
              {upazilas.map((u) => (
                <option key={u._id} value={u.bn_name}>
                  {u.bn_name} {u.name ? `(${u.name})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ৪. ইউনিয়ন / পৌরসভা
            </label>
            {!value.upazila ? (
              <select
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-sm font-medium text-slate-400 cursor-not-allowed"
              >
                <option value="">-- প্রথমে উপজেলা নির্বাচন করুন --</option>
              </select>
            ) : loadingUnions ? (
              <select
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-wait"
              >
                <option value="">ইউনিয়ন লোড হচ্ছে...</option>
              </select>
            ) : unions.length > 0 ? (
              <select
                value={value.union || ""}
                onChange={(e) => updateMainFields({ union: e.target.value })}
                disabled={disabled}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all cursor-pointer disabled:opacity-60"
              >
                <option value="">-- ইউনিয়ন নির্বাচন করুন --</option>
                {unions.map((un) => (
                  <option key={un._id} value={un.bn_name}>
                    {un.bn_name} {un.name ? `(${un.name})` : ""}
                  </option>
                ))}
              </select>
            ) : (
              <div>
                <input
                  type="text"
                  value={value.union || ""}
                  onChange={(e) => updateMainFields({ union: e.target.value })}
                  placeholder="উদাঃ ১নং ওয়ার্ড / সোনাডাঙ্গা আবাসিক এলাকা"
                  disabled={disabled}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all"
                />
                <span className="text-[11px] text-amber-700 font-medium block mt-1">
                  * এই থানার কোনো ইউনিয়ন তালিকা নেই (পৌরসভা/সিটি কর্পোরেশন)। আপনার ওয়ার্ড বা এলাকা লিখুন।
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Level 5: Village / Road / Detailed Address (Manual Type) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            ৫. গ্রাম ও সড়ক / বিস্তারিত ঠিকানা (ম্যানুয়ালি লিখুন) {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={value.village || ""}
            onChange={(e) => updateMainFields({ village: e.target.value })}
            placeholder="উদাঃ গ্রাম: মুহাম্মাদনগর, সড়ক: মাদরাসা রোড, ডাকঘর: গল্লামারী"
            disabled={disabled}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all"
          />
        </div>

        {/* Address Summary Preview Badge */}
        {value.fullAddress && (
          <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2 font-semibold">
            <Check className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="truncate">পূর্ণাঙ্গ ঠিকানা: {value.fullAddress}</span>
          </div>
        )}
      </div>

      {/* ─── OPTIONAL SEPARATE DELIVERY LOCATION TOGGLE ─────────────────────── */}
      {onSeparateDeliveryChange && (
        <div className="space-y-3">
          <label className="flex items-center gap-2.5 p-3.5 bg-white border border-slate-200 hover:border-emerald-400 rounded-2xl cursor-pointer transition-all select-none shadow-2xs">
            <input
              type="checkbox"
              checked={hasSeparateDelivery}
              onChange={(e) => onSeparateDeliveryChange(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
            />
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Truck className="w-4 h-4 text-amber-600" />
              <span>ডেলিভারি ঠিকানা মাদরাসার ঠিকানা থেকে আলাদা (ভিন্ন ঠিকানায় পার্সেল যাবে)</span>
            </div>
          </label>

          {/* Expanded Delivery Geo Selector */}
          {hasSeparateDelivery && deliveryValue && onDeliveryChange && (
            <div className="p-4 sm:p-5 bg-amber-50/40 rounded-2xl border border-amber-200 space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2 border-b border-amber-200/80 pb-2.5">
                <Truck className="w-4 h-4 text-amber-700" />
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900">নির্দিষ্ট ডেলিভারি ঠিকানা</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ১. ডেলিভারি বিভাগ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={
                      delDivisions.find(
                        (d) => d.bn_name === deliveryValue.division || d.name?.toLowerCase() === deliveryValue.division?.toLowerCase() || d._id === deliveryValue.division
                      )?.bn_name || deliveryValue.division || ""
                    }
                    onChange={(e) => {
                      const newDiv = e.target.value;
                      updateDeliveryFields({
                        division: newDiv,
                        district: "",
                        upazila: "",
                        union: "",
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all cursor-pointer"
                  >
                    <option value="">-- বিভাগ নির্বাচন করুন --</option>
                    {delDivisions.map((d) => (
                      <option key={d._id} value={d.bn_name}>
                        {d.bn_name} ({d.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ২. ডেলিভারি জেলা <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={
                      delDistricts.find(
                        (d) => d.bn_name === deliveryValue.district || d.name?.toLowerCase() === deliveryValue.district?.toLowerCase() || d._id === deliveryValue.district
                      )?.bn_name || deliveryValue.district || ""
                    }
                    onChange={(e) => {
                      const newDist = e.target.value;
                      updateDeliveryFields({
                        district: newDist,
                        upazila: "",
                        union: "",
                      });
                    }}
                    disabled={!deliveryValue.division || loadingDelDistricts}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all cursor-pointer disabled:opacity-60"
                  >
                    {!deliveryValue.division ? (
                      <option value="">-- প্রথমে বিভাগ নির্বাচন করুন --</option>
                    ) : loadingDelDistricts ? (
                      <option value="">জেলা লোড হচ্ছে...</option>
                    ) : (
                      <option value="">-- জেলা নির্বাচন করুন --</option>
                    )}
                    {delDistricts.map((d) => (
                      <option key={d._id} value={d.bn_name}>
                        {d.bn_name} {d.name ? `(${d.name})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ৩. ডেলিভারি উপজেলা / থানা <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={
                      delUpazilas.find(
                        (u) => u.bn_name === deliveryValue.upazila || u.name?.toLowerCase() === deliveryValue.upazila?.toLowerCase() || u._id === deliveryValue.upazila
                      )?.bn_name || deliveryValue.upazila || ""
                    }
                    onChange={(e) => {
                      const newUpz = e.target.value;
                      updateDeliveryFields({
                        upazila: newUpz,
                        union: "",
                      });
                    }}
                    disabled={!deliveryValue.district || loadingDelUpazilas}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all cursor-pointer disabled:opacity-60"
                  >
                    {!deliveryValue.district ? (
                      <option value="">-- প্রথমে জেলা নির্বাচন করুন --</option>
                    ) : loadingDelUpazilas ? (
                      <option value="">উপজেলা লোড হচ্ছে...</option>
                    ) : (
                      <option value="">-- উপজেলা নির্বাচন করুন --</option>
                    )}
                    {delUpazilas.map((u) => (
                      <option key={u._id} value={u.bn_name}>
                        {u.bn_name} {u.name ? `(${u.name})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ৪. ডেলিভারি ইউনিয়ন / পৌরসভা
                  </label>
                  {!deliveryValue.upazila ? (
                    <select
                      disabled
                      className="w-full px-3.5 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-sm font-medium text-slate-400 cursor-not-allowed"
                    >
                      <option value="">-- প্রথমে উপজেলা নির্বাচন করুন --</option>
                    </select>
                  ) : loadingDelUnions ? (
                    <select
                      disabled
                      className="w-full px-3.5 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-wait"
                    >
                      <option value="">ইউনিয়ন লোড হচ্ছে...</option>
                    </select>
                  ) : delUnions.length > 0 ? (
                    <select
                      value={deliveryValue.union || ""}
                      onChange={(e) => updateDeliveryFields({ union: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all cursor-pointer"
                    >
                      <option value="">-- ইউনিয়ন নির্বাচন করুন --</option>
                      {delUnions.map((un) => (
                        <option key={un._id} value={un.bn_name}>
                          {un.bn_name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div>
                      <input
                        type="text"
                        value={deliveryValue.union || ""}
                        onChange={(e) => updateDeliveryFields({ union: e.target.value })}
                        placeholder="উদাঃ ১নং ওয়ার্ড / পৌরসভা এলাকা"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ৫. ডেলিভারি পয়েন্ট / কুরিয়ার বা নির্দিষ্ট ঠিকানা <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={deliveryValue.village || ""}
                  onChange={(e) => updateDeliveryFields({ village: e.target.value })}
                  placeholder="উদাঃ সুন্দরবন কুরিয়ার সার্ভিস শাখা, অথবা নির্দিষ্ট গন্তব্য..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all"
                />
              </div>

              {deliveryValue.fullAddress && (
                <div className="p-3 bg-amber-100/70 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-center gap-2 font-semibold">
                  <Truck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="truncate">পূর্ণাঙ্গ ডেলিভারি ঠিকানা: {deliveryValue.fullAddress}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
