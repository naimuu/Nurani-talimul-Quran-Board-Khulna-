"use client";

import React, { useState } from "react";
import {
  Smartphone,
  Building2,
  Copy,
  CheckCircle,
  QrCode,
  Search,
  X,
} from "lucide-react";

export interface DynamicPaymentMethodItem {
  id?: string;
  type?: string;
  provider?: string;
  name?: string;
  accountType?: string;
  accountName?: string;
  number?: string;
  accountNumber?: string;
  branch?: string;
  routingNo?: string;
  logo?: string;
  qrCodeImage?: string;
  instructions?: string;
  isActive?: boolean;
}

interface DynamicPaymentSelectorProps {
  mobileMethods: DynamicPaymentMethodItem[];
  bankMethods: DynamicPaymentMethodItem[];
  selectedPaymentTab: "mobile" | "bank";
  onSelectTab: (tab: "mobile" | "bank") => void;
  selectedMethod: DynamicPaymentMethodItem | null;
  onSelectMethodId: (idOrKey: string) => void;
  payableLabel?: string;
  payableAmount?: number;
  compact?: boolean;
}

export function getPaymentMethodUniqueKey(m: DynamicPaymentMethodItem, idx?: number): string {
  if (m.id) return String(m.id);
  const num = m.number || m.accountNumber || "";
  const name = m.name || m.provider || "method";
  const branch = m.branch || m.accountType || "";
  return `${name}__${branch}__${num}${idx !== undefined ? `__${idx}` : ""}`;
}

export function isSamePaymentMethod(
  a: DynamicPaymentMethodItem | null | undefined,
  b: DynamicPaymentMethodItem | null | undefined
): boolean {
  if (!a || !b) return false;
  if (a.id && b.id) return String(a.id) === String(b.id);
  const aNum = a.number || a.accountNumber || "";
  const bNum = b.number || b.accountNumber || "";
  const aName = a.name || a.provider || "";
  const bName = b.name || b.provider || "";
  return aName === bName && aNum === bNum && (a.accountType || "") === (b.accountType || "");
}

export function resolveSelectedPaymentMethod(
  selectedMethodId: string,
  selectedPaymentTab: "mobile" | "bank",
  activeMethods: DynamicPaymentMethodItem[],
  mobileMethods: DynamicPaymentMethodItem[],
  bankMethods: DynamicPaymentMethodItem[]
): DynamicPaymentMethodItem | null {
  if (selectedMethodId) {
    const found = activeMethods.find(
      (p) => getPaymentMethodUniqueKey(p) === String(selectedMethodId)
    );
    if (found) return found;
  }
  const currentList = selectedPaymentTab === "mobile" ? mobileMethods : bankMethods;
  return currentList[0] || activeMethods[0] || null;
}

export default function DynamicPaymentSelector({
  mobileMethods,
  bankMethods,
  selectedPaymentTab,
  onSelectTab,
  selectedMethod,
  onSelectMethodId,
  payableLabel,
  payableAmount,
  compact = false,
}: DynamicPaymentSelectorProps) {
  const [copied, setCopied] = useState(false);
  const [brokenLogos, setBrokenLogos] = useState<Record<string, boolean>>({});
  const [zoomQrUrl, setZoomQrUrl] = useState<string | null>(null);

  const currentList = selectedPaymentTab === "mobile" ? mobileMethods : bankMethods;
  const gridColsClass =
    currentList.length <= 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4";

  const handleCopy = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isBankSelected =
    selectedMethod?.type === "bank" || selectedMethod?.type === "BANK";

  return (
    <div className="space-y-3">
      {/* Payment Type Tabs: Mobile Banking vs Bank Accounts */}
      <div className="flex border border-slate-200 rounded-xl p-1 bg-slate-50 gap-1">
        <button
          type="button"
          onClick={() => {
            onSelectTab("mobile");
            if (mobileMethods.length > 0) {
              onSelectMethodId(getPaymentMethodUniqueKey(mobileMethods[0]));
            }
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            selectedPaymentTab === "mobile"
              ? "bg-white text-[#095738] shadow-xs border border-emerald-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 shrink-0" />
          <span>মোবাইল ব্যাংকিং ({mobileMethods.length})</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onSelectTab("bank");
            if (bankMethods.length > 0) {
              onSelectMethodId(getPaymentMethodUniqueKey(bankMethods[0]));
            }
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            selectedPaymentTab === "bank"
              ? "bg-white text-[#095738] shadow-xs border border-emerald-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          <span>ব্যাংক অ্যাকাউন্ট ({bankMethods.length})</span>
        </button>
      </div>

      {/* Method Selection Buttons */}
      {currentList.length === 0 ? (
        <div className="p-3 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
          এই ক্যাটাগরিতে বর্তমানে কোনো সক্রিয় পেমেন্ট মাধ্যম নেই।
        </div>
      ) : (
        <div className={`grid ${gridColsClass} gap-2`}>
          {currentList.map((m, idx) => {
            const uniqueKey = getPaymentMethodUniqueKey(m, idx);
            const selectKey = getPaymentMethodUniqueKey(m);
            const isCur = isSamePaymentMethod(selectedMethod, m);
            const isBankItem = m.type === "bank" || m.type === "BANK";
            const displayName = m.name || m.provider || "পেমেন্ট";
            const subLabel = isBankItem
              ? m.accountType || m.branch || ""
              : m.accountType || "";
            const hasValidLogo = Boolean(m.logo && !brokenLogos[uniqueKey]);

            return (
              <button
                key={uniqueKey}
                type="button"
                onClick={() => onSelectMethodId(selectKey)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border-2 transition-all cursor-pointer text-center relative ${
                  isCur
                    ? "border-[#095738] bg-emerald-50/80 shadow-xs ring-1 ring-[#095738]/20"
                    : "border-slate-200/80 hover:border-slate-300 bg-white"
                }`}
              >
                {isCur && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#095738]" />
                )}
                <div className="h-8 flex items-center justify-center mb-1">
                  {hasValidLogo ? (
                    <img
                      src={m.logo}
                      alt={displayName}
                      onError={() =>
                        setBrokenLogos((prev) => ({ ...prev, [uniqueKey]: true }))
                      }
                      className="max-h-full max-w-[68px] object-contain"
                    />
                  ) : isBankItem ? (
                    <Building2
                      className={`w-6 h-6 ${
                        isCur ? "text-[#095738]" : "text-slate-500"
                      }`}
                    />
                  ) : (
                    <Smartphone
                      className={`w-6 h-6 ${
                        isCur ? "text-[#095738]" : "text-slate-500"
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`text-[11px] font-bold leading-tight line-clamp-1 max-w-full ${
                    isCur ? "text-[#095738]" : "text-slate-800"
                  }`}
                >
                  {displayName}
                </span>
                {subLabel && (
                  <span
                    className={`text-[9.5px] font-semibold mt-0.5 line-clamp-1 max-w-full ${
                      isCur ? "text-emerald-700" : "text-slate-500"
                    }`}
                  >
                    {subLabel}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Method Details Card */}
      {selectedMethod && (
        <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2.5">
          {typeof payableAmount === "number" && payableAmount > 0 && (
            <div className="flex items-center justify-between bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs">
              <span className="font-semibold">
                {payableLabel || "প্রদেয় টাকার পরিমাণ:"}
              </span>
              <span className="font-black text-sm">
                ৳{payableAmount.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-black text-blue-950">
                  {selectedMethod.name || selectedMethod.provider}
                </span>
                {selectedMethod.accountType && (
                  <span className="text-[10px] bg-blue-200/80 text-blue-900 font-bold px-2 py-0.5 rounded-md">
                    {selectedMethod.accountType}
                  </span>
                )}
              </div>

              {selectedMethod.accountName && (
                <p className="text-xs text-slate-800 font-bold">
                  হিসাবের নাম: <span className="text-blue-950">{selectedMethod.accountName}</span>
                </p>
              )}

              {(selectedMethod.branch || selectedMethod.routingNo) && (
                <p className="text-[11px] text-blue-800 font-medium">
                  {selectedMethod.branch ? `শাখা: ${selectedMethod.branch}` : ""}
                  {selectedMethod.branch && selectedMethod.routingNo ? " | " : ""}
                  {selectedMethod.routingNo ? `রাউটিং নং: ${selectedMethod.routingNo}` : ""}
                </p>
              )}
            </div>

            {(selectedMethod.number || selectedMethod.accountNumber) && (
              <button
                type="button"
                onClick={() =>
                  handleCopy(selectedMethod.number || selectedMethod.accountNumber)
                }
                className="flex items-center gap-1 bg-white border border-blue-300 text-blue-700 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg text-[11px] font-bold shrink-0 cursor-pointer transition-colors shadow-2xs"
                title="নম্বর কপি করুন"
              >
                {copied ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copied ? "কপি হয়েছে" : "কপি করুন"}</span>
              </button>
            )}
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-blue-100 flex items-center justify-between gap-2">
            <span className="text-xs text-slate-600 font-semibold">
              {isBankSelected ? "ব্যাংক হিসাব নম্বর (A/C):" : "মোবাইল নম্বর:"}
            </span>
            <span className="text-sm sm:text-base font-black text-blue-950 font-mono tracking-wider select-all">
              {selectedMethod.number || selectedMethod.accountNumber || "—"}
            </span>
          </div>

          {/* Prominent Scannable QR Code Section */}
          {selectedMethod.qrCodeImage && (
            <div className="bg-white p-3 rounded-xl border border-blue-200 flex flex-col sm:flex-row items-center gap-3.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setZoomQrUrl(selectedMethod.qrCodeImage || null)}
                className="group relative shrink-0 p-1.5 bg-white rounded-xl border-2 border-slate-200 hover:border-[#095738] transition-all cursor-pointer"
                title="বড় করে দেখতে ক্লিক করুন"
              >
                <img
                  src={selectedMethod.qrCodeImage}
                  alt={`${selectedMethod.name || selectedMethod.provider} QR Code`}
                  className={`${
                    compact ? "w-28 h-28" : "w-36 h-36 sm:w-40 sm:h-40"
                  } object-contain rounded-lg bg-white`}
                />
                <span className="mt-1 flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-700 group-hover:underline">
                  <Search className="w-3 h-3" />
                  <span>বড় করে দেখুন</span>
                </span>
              </button>

              <div className="text-center sm:text-left space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-slate-800">
                  <QrCode className="w-4 h-4 text-[#095738]" />
                  <span>QR কোড স্ক্যান করে পেমেন্ট করুন</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  আপনার {selectedMethod.name || selectedMethod.provider} অ্যাপ থেকে সরাসরি উপরের কিউআর কোডটি স্ক্যান করে দ্রুত ও নির্ভুলভাবে পেমেন্ট সম্পন্ন করতে পারেন।
                </p>
              </div>
            </div>
          )}

          {selectedMethod.instructions && (
            <p className="text-[11px] text-blue-900 bg-blue-100/70 p-2.5 rounded-lg leading-relaxed font-medium">
              💡 {selectedMethod.instructions}
            </p>
          )}
        </div>
      )}

      {/* Fullscreen Zoom Modal for QR Code */}
      {zoomQrUrl && (
        <div
          className="fixed inset-0 z-[120] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setZoomQrUrl(null)}
        >
          <div
            className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 text-center space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                <QrCode className="w-4 h-4 text-[#095738]" />
                <span>{selectedMethod?.name || selectedMethod?.provider} — QR কোড</span>
              </div>
              <button
                type="button"
                onClick={() => setZoomQrUrl(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 bg-white border-2 border-slate-200 rounded-xl inline-block mx-auto">
              <img
                src={zoomQrUrl}
                alt="QR Code Full Preview"
                className="w-64 h-64 sm:w-72 sm:h-72 object-contain mx-auto"
              />
            </div>
            {(selectedMethod?.number || selectedMethod?.accountNumber) && (
              <p className="text-xs font-bold text-slate-700">
                নম্বর: <span className="font-mono text-blue-900">{selectedMethod.number || selectedMethod.accountNumber}</span>
              </p>
            )}
            <button
              type="button"
              onClick={() => setZoomQrUrl(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
