"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, Upload, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (result: string) => void;
}

export function QRScannerModal({ isOpen, onClose, onScanSuccess }: QRScannerModalProps) {
  const [scannerError, setScannerError] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedCode, setScannedCode] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = "qr-reader-container";

  // Clean raw or URL encoded QR code string to get tracking / invoice ID
  const parseTrackingId = (rawText: string): string => {
    let text = rawText.trim();
    try {
      if (text.includes("?") || text.startsWith("http")) {
        const url = new URL(text);
        const codeParam = url.searchParams.get("code") || url.searchParams.get("invoice") || url.searchParams.get("id") || url.searchParams.get("trackingId");
        if (codeParam) return codeParam.trim();
        const segments = url.pathname.split("/").filter(Boolean);
        if (segments.length > 0) return segments[segments.length - 1];
      }
    } catch {
      // Not a valid URL, use raw string
    }
    return text;
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      } finally {
        scannerRef.current = null;
        setIsScanning(false);
      }
    }
  };

  const handleScanMatch = (decodedText: string) => {
    const parsedId = parseTrackingId(decodedText);
    setScannedCode(parsedId);
    
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(100);
    }

    stopScanner();
    setTimeout(() => {
      onScanSuccess(parsedId);
      onClose();
    }, 450);
  };

  useEffect(() => {
    if (isOpen) {
      setScannerError('');
      setScannedCode('');
      
      const startScanner = async () => {
        try {
          await stopScanner();
          const html5QrCode = new Html5Qrcode(readerElementId);
          scannerRef.current = html5QrCode;

          const config = {
            fps: 20,
            qrbox: { width: 240, height: 240 },
            aspectRatio: 1.0,
          };

          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              handleScanMatch(decodedText);
            },
            () => {}
          );
          setIsScanning(true);
        } catch (err: any) {
          console.error("Camera scan error:", err);
          setIsScanning(false);
          setScannerError(
            err?.message?.includes("NotAllowedError") || err?.name === "NotAllowedError"
              ? "ক্যামেরা ব্যবহারের অনুমতি দেওয়া হয়নি। ব্রাউজার সেটিংসে ক্যামেরার পারমিশন দিন।"
              : "ক্যামেরা চালু করা সম্ভব হয়নি। ছবি আপলোড করেও স্ক্যান করতে পারেন।"
          );
        }
      };

      const timer = setTimeout(startScanner, 150);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        await stopScanner();
        const html5QrCode = new Html5Qrcode(readerElementId);
        scannerRef.current = html5QrCode;
        const result = await html5QrCode.scanFile(file, true);
        handleScanMatch(result);
      } catch (err) {
        setScannerError("ছবিটি থেকে কিউআর কোড পড়া যায়নি। অনুগ্রহ করে স্পষ্ট ছবি দিন।");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Frosted Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-lg transition-opacity duration-300 animate-in fade-in"
        onClick={() => {
          stopScanner();
          onClose();
        }}
      />

      {/* Glassmorphic Scanner Card */}
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.35)] overflow-hidden z-10 border border-white/80 animate-scale-in">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#04281f]/95 via-[#06422b]/95 to-[#085236]/95 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base leading-tight">স্মার্ট কিউআর স্ক্যানার</h3>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <p className="text-[11px] text-emerald-200">ইনভয়েস বা রিসিটের কিউআর কোড স্ক্যান করুন</p>
            </div>
          </div>
          <button 
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors active:scale-95"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Section */}
        <div className="p-6 flex flex-col items-center">
          <div className="relative w-full max-w-[280px] aspect-square rounded-3xl overflow-hidden bg-slate-950 border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)] flex items-center justify-center group">
            {/* Html5Qrcode video container */}
            <div id={readerElementId} className="w-full h-full object-cover" />

            {/* Futuristic Viewfinder Corners */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-3 border-l-3 border-amber-400 rounded-tl-lg pointer-events-none z-10" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-3 border-r-3 border-amber-400 rounded-tr-lg pointer-events-none z-10" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-3 border-l-3 border-amber-400 rounded-bl-lg pointer-events-none z-10" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-3 border-r-3 border-amber-400 rounded-br-lg pointer-events-none z-10" />

            {/* Glowing Laser Scan Line */}
            {isScanning && (
              <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-[smoothSlideDown_2s_ease-in-out_infinite] pointer-events-none z-10" />
            )}

            {/* Success State Overlay */}
            {scannedCode && (
              <div className="absolute inset-0 bg-[#06422b]/95 backdrop-blur-sm flex flex-col items-center justify-center text-white p-5 z-20 animate-scale-in">
                <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mb-3 shadow-lg animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <p className="font-extrabold text-base text-emerald-100">কিউআর কোড পাওয়া গেছে!</p>
                <p className="font-mono text-sm font-bold text-amber-300 mt-1 bg-black/30 px-3 py-1 rounded-full border border-amber-400/40">{scannedCode}</p>
              </div>
            )}
          </div>

          {/* Scanner Guide Text */}
          <p className="text-xs text-slate-500 font-bold mt-4 text-center">
            ক্যামেরার সামনে কিউআর কোডটি সোজাভাবে রাখুন
          </p>

          {/* Error Banner */}
          {scannerError && (
            <div className="mt-4 w-full p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed font-semibold">{scannerError}</p>
            </div>
          )}

          {/* Upload Fallback Pill */}
          <div className="mt-5 pt-4 border-t border-slate-200/80 w-full flex items-center justify-between gap-2.5">
            <label className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs border border-slate-200/60">
              <Upload className="w-4 h-4 text-emerald-700" />
              <span>ছবি আপলোড করে স্ক্যান</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
            </label>

            <button
              onClick={() => {
                setScannerError('');
                setIsScanning(false);
                setTimeout(() => {
                  const html5QrCode = new Html5Qrcode(readerElementId);
                  scannerRef.current = html5QrCode;
                  html5QrCode.start(
                    { facingMode: "environment" },
                    { fps: 20, qrbox: { width: 240, height: 240 } },
                    handleScanMatch,
                    () => {}
                  ).then(() => setIsScanning(true)).catch((e) => setScannerError(e.message));
                }, 100);
              }}
              className="p-2.5 rounded-2xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 transition-all active:scale-95 border border-slate-200/60 shadow-xs"
              title="রিস্টার্ট ক্যামেরা"
            >
              <RefreshCw className="w-4 h-4 text-emerald-700" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QRScannerModal;
