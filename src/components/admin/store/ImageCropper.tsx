"use client";
import React, { useState, useRef, useEffect } from "react";
import { Crop, Upload, X, ZoomIn, Maximize2, Minimize2 } from "lucide-react";

function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(",");
  const mimeMatch = parts[0]?.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const binary = atob(parts[1] || "");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export default function ImageCropper({
  initialFile,
  onCropComplete,
  onCancel,
}: {
  initialFile?: File | null;
  onCropComplete: (file: Blob, previewUrl: string, sizeKb: number) => void;
  onCancel: () => void;
}) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [fitMode, setFitMode] = useState<"contain" | "cover">("contain");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileSize, setFileSize] = useState(0);

  const loadSelectedFile = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      setImg(image);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
    image.src = objectUrl;
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadSelectedFile(file);
  };

  useEffect(() => {
    if (initialFile) {
      loadSelectedFile(initialFile);
    }
  }, [initialFile]);

  useEffect(() => {
    if (img && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 600x600 crisp product image matching preview 1:1
      canvas.width = 600;
      canvas.height = 600;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const scaleX = canvas.width / img.width;
      const scaleY = canvas.height / img.height;
      const baseScale =
        fitMode === "contain"
          ? Math.min(scaleX, scaleY)
          : Math.max(scaleX, scaleY);
      const scale = baseScale * zoom;

      const drawW = img.width * scale;
      const drawH = img.height * scale;

      const drawX = (canvas.width - drawW) / 2 + pan.x;
      const drawY = (canvas.height - drawH) / 2 + pan.y;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setFileSize(Math.round((dataUrl.length * 0.75) / 1024));
    }
  }, [img, zoom, pan, fitMode]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
  };
  const handlePointerUp = () => setIsDragging(false);

  const handleConfirm = () => {
    if (!canvasRef.current) return;
    let quality = 0.88;
    let dataUrl = canvasRef.current.toDataURL("image/jpeg", quality);
    while (dataUrl.length * 0.75 > 450 * 1024 && quality > 0.2) {
      quality -= 0.1;
      dataUrl = canvasRef.current.toDataURL("image/jpeg", quality);
    }

    const blob = dataUrlToBlob(dataUrl);
    onCropComplete(blob, dataUrl, Math.round(blob.size / 1024));
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Crop className="w-5 h-5 text-blue-600" /> পণ্যের ছবি সংযোজন ও ক্রপ
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {!img ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="bg-blue-100 p-4 rounded-full text-blue-600">
                <Upload className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-700">ক্লিক করে পণ্যের ছবি নির্বাচন করুন</p>
                <p className="text-xs text-slate-500 mt-1">JPG, PNG অথবা WEBP ফরম্যাট সমর্থিত</p>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFile}
              />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFitMode("contain");
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-colors ${
                    fitMode === "contain"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Minimize2 className="w-3.5 h-3.5" /> সম্পূর্ণ ছবি ফিট
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFitMode("cover");
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-colors ${
                    fitMode === "cover"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Maximize2 className="w-3.5 h-3.5" /> পুরো বক্স জুড়ে ক্রপ
                </button>
              </div>

              <div
                className="w-full max-w-[300px] mx-auto aspect-square bg-white rounded-xl overflow-hidden cursor-move touch-none border-2 border-slate-200 relative shadow-inner"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                <canvas ref={canvasRef} className="w-full h-full block" />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3">
                  <ZoomIn className="w-5 h-5 text-slate-400" />
                  <input
                    type="range"
                    min="0.6"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-blue-600"
                  />
                </div>
                <p className="text-center text-xs text-slate-500">
                  ছবি টেনে পজিশন ঠিক করুন • সাইজ: ~{fileSize} KB
                </p>
              </div>
            </>
          )}
        </div>

        {img && (
          <div className="p-4 border-t border-slate-100 flex gap-3">
            <button
              type="button"
              onClick={() => setImg(null)}
              className="flex-1 py-2.5 text-slate-600 bg-slate-100 font-bold rounded-xl hover:bg-slate-200"
            >
              অন্য ছবি নিন
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-2.5 text-white bg-blue-600 font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200"
            >
              ছবি যুক্ত করুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
