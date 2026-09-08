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
  { _id: "div_khulna", name: "Khulna", bn_name: "খুলনা", type: "DIVISION", parentId: null },
  { _id: "div_dhaka", name: "Dhaka", bn_name: "ঢাকা", type: "DIVISION", parentId: null },
  { _id: "div_chittagong", name: "Chittagong", bn_name: "চট্টগ্রাম", type: "DIVISION", parentId: null },
  { _id: "div_rajshahi", name: "Rajshahi", bn_name: "রাজশাহী", type: "DIVISION", parentId: null },
  { _id: "div_rangpur", name: "Rangpur", bn_name: "রংপুর", type: "DIVISION", parentId: null },
  { _id: "div_sylhet", name: "Sylhet", bn_name: "সিলেট", type: "DIVISION", parentId: null },
  { _id: "div_barisal", name: "Barisal", bn_name: "বরিশাল", type: "DIVISION", parentId: null },
  { _id: "div_mymensingh", name: "Mymensingh", bn_name: "ময়মনসিংহ", type: "DIVISION", parentId: null },
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

  // Delivery Address state
  const [delDivisions, setDelDivisions] = useState<LocationItem[]>([]);
  const [delDistricts, setDelDistricts] = useState<LocationItem[]>([]);
  const [delUpazilas, setDelUpazilas] = useState<LocationItem[]>([]);
  const [delUnions, setDelUnions] = useState<LocationItem[]>([]);

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
      return;
    }
    const selectedDivObj = divisions.find(
      (d) => d.bn_name === value.division || d.name.toLowerCase() === value.division.toLowerCase()
    );
    const parentParam = selectedDivObj ? `&parentId=${selectedDivObj._id}` : "";
    fetch(`/api/admin/locations?type=DISTRICT${parentParam}`)
      .then((res) => res.json())
      .then((data) => {
        setDistricts(Array.isArray(data.locations) ? data.locations : []);
      })
      .catch(() => setDistricts([]));
  }, [value.division, divisions]);

  // 3. Fetch Main Upazilas when District changes
  useEffect(() => {
    if (!value.district) {
      setUpazilas([]);
      return;
    }
    const selectedDistObj = districts.find(
      (d) => d.bn_name === value.district || d.name.toLowerCase() === value.district.toLowerCase()
    );
    const parentParam = selectedDistObj ? `&parentId=${selectedDistObj._id}` : "";
    fetch(`/api/admin/locations?type=UPAZILA${parentParam}`)
      .then((res) => res.json())
      .then((data) => {
        setUpazilas(Array.isArray(data.locations) ? data.locations : []);
      })
      .catch(() => setUpazilas([]));
  }, [value.district, districts]);

  // 4. Fetch Main Unions when Upazila changes
  useEffect(() => {
    if (!value.upazila) {
      setUnions([]);
      return;
    }
    const selectedUpzObj = upazilas.find(
      (u) => u.bn_name === value.upazila || u.name.toLowerCase() === value.upazila.toLowerCase()
    );
    const parentParam = selectedUpzObj ? `&parentId=${selectedUpzObj._id}` : "";
    fetch(`/api/admin/locations?type=UNION${parentParam}`)
      .then((res) => res.json())
      .then((data) => {
        setUnions(Array.isArray(data.locations) ? data.locations : []);
      })
      .catch(() => setUnions([]));
  }, [value.upazila, upazilas]);

  // 5. Fetch Delivery Districts when Delivery Division changes
  useEffect(() => {
    if (!deliveryValue?.division) {
      setDelDistricts([]);
      return;
    }
    const selectedDivObj = delDivisions.find(
      (d) => d.bn_name === deliveryValue.division || d.name.toLowerCase() === deliveryValue.division.toLowerCase()
    );
    const parentParam = selectedDivObj ? `&parentId=${selectedDivObj._id}` : "";
    fetch(`/api/admin/locations?type=DISTRICT${parentParam}`)
      .then((res) => res.json())
      .then((data) => {
        setDelDistricts(Array.isArray(data.locations) ? data.locations : []);
      })
      .catch(() => setDelDistricts([]));
  }, [deliveryValue?.division, delDivisions]);

  // 6. Fetch Delivery Upazilas when Delivery District changes
  useEffect(() => {
    if (!deliveryValue?.district) {
      setDelUpazilas([]);
      return;
    }
    const selectedDistObj = delDistricts.find(
      (d) => d.bn_name === deliveryValue.district || d.name.toLowerCase() === deliveryValue.district.toLowerCase()
    );
    const parentParam = selectedDistObj ? `&parentId=${selectedDistObj._id}` : "";
    fetch(`/api/admin/locations?type=UPAZILA${parentParam}`)
      .then((res) => res.json())
      .then((data) => {
        setDelUpazilas(Array.isArray(data.locations) ? data.locations : []);
      })
      .catch(() => setDelUpazilas([]));
  }, [deliveryValue?.district, delDistricts]);

  // 7. Fetch Delivery Unions when Delivery Upazila changes
  useEffect(() => {
    if (!deliveryValue?.upazila) {
      setDelUnions([]);
      return;
    }
    const selectedUpzObj = delUpazilas.find(
      (u) => u.bn_name === deliveryValue.upazila || u.name.toLowerCase() === deliveryValue.upazila.toLowerCase()
    );
    const parentParam = selectedUpzObj ? `&parentId=${selectedUpzObj._id}` : "";
    fetch(`/api/admin/locations?type=UNION${parentParam}`)
      .then((res) => res.json())
      .then((data) => {
        setDelUnions(Array.isArray(data.locations) ? data.locations : []);
      })
      .catch(() => setDelUnions([]));
  }, [deliveryValue?.upazila, delUpazilas]);

  const updateMainField = (field: keyof GeoAddressData, val: string) => {
    const updated = { ...value, [field]: val };
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

  const updateDeliveryField = (field: keyof GeoAddressData, val: string) => {
    if (!onDeliveryChange || !deliveryValue) return;
    const updated = { ...deliveryValue, [field]: val };
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
    <div className="space-y-3.5">
      {/* ─── MAIN MADRASA ADDRESS ─────────────────────────────────────────── */}
      <div className="p-3.5 sm:p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-800">{displayTitle}</h4>
          </div>
          {required && <span className="text-[11px] text-red-500 font-bold">* বাধ্যতামূলক</span>}
        </div>

        {/* Level 1 & 2: Division & District */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              ১. বিভাগ {required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={value.division || ""}
              onChange={(e) => {
                const newDiv = e.target.value;
                updateMainField("division", newDiv);
                // Reset child levels
                updateMainField("district", "");
                updateMainField("upazila", "");
                updateMainField("union", "");
              }}
              disabled={disabled}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-emerald-600 focus:border-emerald-600 transition-colors cursor-pointer"
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
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              ২. জেলা {required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={value.district || ""}
              onChange={(e) => {
                const newDist = e.target.value;
                updateMainField("district", newDist);
                updateMainField("upazila", "");
                updateMainField("union", "");
              }}
              disabled={disabled || (!value.division && districts.length === 0)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-emerald-600 focus:border-emerald-600 transition-colors cursor-pointer disabled:opacity-60"
            >
              <option value="">-- জেলা নির্বাচন করুন --</option>
              {districts.map((d) => (
                <option key={d._id} value={d.bn_name}>
                  {d.bn_name} {d.name ? `(${d.name})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Level 3 & 4: Upazila & Union */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              ৩. উপজেলা / থানা {required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={value.upazila || ""}
              onChange={(e) => {
                const newUpz = e.target.value;
                updateMainField("upazila", newUpz);
                updateMainField("union", "");
              }}
              disabled={disabled || (!value.district && upazilas.length === 0)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-emerald-600 focus:border-emerald-600 transition-colors cursor-pointer disabled:opacity-60"
            >
              <option value="">-- উপজেলা নির্বাচন করুন --</option>
              {upazilas.map((u) => (
                <option key={u._id} value={u.bn_name}>
                  {u.bn_name} {u.name ? `(${u.name})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              ৪. ইউনিয়ন / পৌরসভা
            </label>
            {unions.length > 0 ? (
              <select
                value={value.union || ""}
                onChange={(e) => updateMainField("union", e.target.value)}
                disabled={disabled}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-emerald-600 focus:border-emerald-600 transition-colors cursor-pointer"
              >
                <option value="">-- ইউনিয়ন নির্বাচন করুন --</option>
                {unions.map((un) => (
                  <option key={un._id} value={un.bn_name}>
                    {un.bn_name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={value.union || ""}
                onChange={(e) => updateMainField("union", e.target.value)}
                placeholder="যেমন: জলমা ইউনিয়ন / পৌরসভা"
                disabled={disabled}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-emerald-600 focus:border-emerald-600 transition-colors"
              />
            )}
          </div>
        </div>

        {/* Level 5: Village / Road / Detailed Address */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            ৫. গ্রাম / মহল্লা / রাস্তা / যাতায়াত ঠিকানা {required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            rows={2}
            value={value.village || ""}
            onChange={(e) => updateMainField("village", e.target.value)}
            placeholder="যেমন: মুহাম্মাদনগর, মাদরাসা সড়ক, বড় মাদরাসার বিপরীতে..."
            disabled={disabled}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-emerald-600 focus:border-emerald-600 transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Address Summary Preview Badge */}
        {value.fullAddress && (
          <div className="p-2 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-900 flex items-center gap-1.5 font-semibold">
            <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate">পূর্ণাঙ্গ ঠিকানা: {value.fullAddress}</span>
          </div>
        )}
      </div>

      {/* ─── OPTIONAL SEPARATE DELIVERY LOCATION TOGGLE ─────────────────────── */}
      {onSeparateDeliveryChange && (
        <div className="space-y-2.5">
          <label className="flex items-center gap-2.5 p-3 bg-white border border-slate-200 hover:border-emerald-400 rounded-xl cursor-pointer transition-all select-none shadow-2xs">
            <input
              type="checkbox"
              checked={hasSeparateDelivery}
              onChange={(e) => onSeparateDeliveryChange(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
            />
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Truck className="w-4 h-4 text-amber-600" />
              <span>ডেলিভারি ঠিকানা মাদরাসার ঠিকানা থেকে আলাদা (ভিন্ন ঠিকানায় পার্সেল যাবে)</span>
            </div>
          </label>

          {/* Expanded Delivery Geo Selector */}
          {hasSeparateDelivery && deliveryValue && onDeliveryChange && (
            <div className="p-3.5 sm:p-4 bg-amber-50/40 rounded-2xl border border-amber-200 space-y-3 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2 border-b border-amber-200/80 pb-2">
                <Truck className="w-4 h-4 text-amber-700" />
                <h4 className="font-bold text-xs sm:text-sm text-slate-800">নির্দিষ্ট ডেলিভারি ঠিকানা</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    ১. ডেলিভারি বিভাগ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={deliveryValue.division || ""}
                    onChange={(e) => {
                      const newDiv = e.target.value;
                      updateDeliveryField("division", newDiv);
                      updateDeliveryField("district", "");
                      updateDeliveryField("upazila", "");
                      updateDeliveryField("union", "");
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-emerald-600 transition-colors cursor-pointer"
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
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    ২. ডেলিভারি জেলা <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={deliveryValue.district || ""}
                    onChange={(e) => {
                      const newDist = e.target.value;
                      updateDeliveryField("district", newDist);
                      updateDeliveryField("upazila", "");
                      updateDeliveryField("union", "");
                    }}
                    disabled={!deliveryValue.division && delDistricts.length === 0}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-emerald-600 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <option value="">-- জেলা নির্বাচন করুন --</option>
                    {delDistricts.map((d) => (
                      <option key={d._id} value={d.bn_name}>
                        {d.bn_name} {d.name ? `(${d.name})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    ৩. ডেলিভারি উপজেলা / থানা <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={deliveryValue.upazila || ""}
                    onChange={(e) => {
                      const newUpz = e.target.value;
                      updateDeliveryField("upazila", newUpz);
                      updateDeliveryField("union", "");
                    }}
                    disabled={!deliveryValue.district && delUpazilas.length === 0}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-emerald-600 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <option value="">-- উপজেলা নির্বাচন করুন --</option>
                    {delUpazilas.map((u) => (
                      <option key={u._id} value={u.bn_name}>
                        {u.bn_name} {u.name ? `(${u.name})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    ৪. ডেলিভারি ইউনিয়ন / পৌরসভা
                  </label>
                  {delUnions.length > 0 ? (
                    <select
                      value={deliveryValue.union || ""}
                      onChange={(e) => updateDeliveryField("union", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-emerald-600 transition-colors cursor-pointer"
                    >
                      <option value="">-- ইউনিয়ন নির্বাচন করুন --</option>
                      {delUnions.map((un) => (
                        <option key={un._id} value={un.bn_name}>
                          {un.bn_name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={deliveryValue.union || ""}
                      onChange={(e) => updateDeliveryField("union", e.target.value)}
                      placeholder="যেমন: ইউনিয়ন / পৌরসভা"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-emerald-600 transition-colors"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  ৫. ডেলিভারি পয়েন্ট / কুরিয়ার বা নির্দিষ্ট ঠিকানা <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={deliveryValue.village || ""}
                  onChange={(e) => updateDeliveryField("village", e.target.value)}
                  placeholder="যেমন: সুন্দরবন কুরিয়ার সার্ভিস শাখা, অথবা নির্দিষ্ট গন্তব্য..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-emerald-600 transition-colors resize-none leading-relaxed"
                />
              </div>

              {deliveryValue.fullAddress && (
                <div className="p-2 bg-amber-100/70 border border-amber-300 rounded-xl text-[11px] text-amber-950 flex items-center gap-1.5 font-semibold">
                  <Truck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
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
