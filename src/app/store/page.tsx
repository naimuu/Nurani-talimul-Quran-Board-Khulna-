"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search, ShoppingBag, Package, Heart, Star, LayoutGrid, List,
  SlidersHorizontal, X, ChevronRight, ChevronLeft, ShoppingCart, Eye, Filter, ArrowLeft, CheckCircle, Copy, Building2, UserCheck, KeyRound, ShieldCheck, Truck, Smartphone, QrCode, CreditCard, RotateCcw, AlertCircle, ArrowRight, Users, BookOpen, Maximize2
} from "lucide-react";
import Link from "next/link";
import GeoAddressSelector, { GeoAddressData } from "@/components/common/GeoAddressSelector";
import { EditableQtyInput } from "@/components/common/EditableQtyInput";

import { TrackOrderModal } from "@/components/shared/TrackOrderModal";
import DynamicPaymentSelector, {
  getPaymentMethodUniqueKey,
  resolveSelectedPaymentMethod,
} from "@/components/shared/DynamicPaymentSelector";

type Product = {
  id: string; name: string; category: string; price: number;
  stock: number; unit: string; rating?: number; reviews?: number;
  imageUrl?: string | null; samplePages?: string[]; barcode?: string | null; className?: string | null; subject?: string | null; description?: string | null;
  weight?: number | null; createdAt?: string;
};

const bnToEnDigits = (str: string) => {
  const map: Record<string, string> = {
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
    "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
  };
  return str.replace(/[০-৯]/g, (m) => map[m] || m);
};

function getCleanProductCode(product?: { barcode?: string | null } | null): string {
  if (!product?.barcode) return "";
  const trimmed = String(product.barcode).trim();
  return trimmed.startsWith("__NO_BARCODE_") ? "" : trimmed;
}

function compareProductsByCode(a: Product, b: Product): number {
  const codeA = bnToEnDigits(getCleanProductCode(a));
  const codeB = bnToEnDigits(getCleanProductCode(b));

  const hasA = codeA.length > 0;
  const hasB = codeB.length > 0;

  if (hasA && !hasB) return -1;
  if (!hasA && hasB) return 1;

  if (hasA && hasB) {
    const cmp = codeA.localeCompare(codeB, undefined, {
      numeric: true,
      sensitivity: "base",
    });
    if (cmp !== 0) return cmp;
  }

  const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  return timeA - timeB;
}

const scrollTabToCenter = (el: HTMLElement | null) => {
  if (!el || !el.parentElement) return;
  const container = el.parentElement;
  const elLeft = el.offsetLeft;
  const elWidth = el.offsetWidth;
  const containerWidth = container.offsetWidth;
  const targetScrollLeft = elLeft - (containerWidth / 2) + (elWidth / 2);
  container.scrollTo({
    left: targetScrollLeft,
    behavior: "smooth"
  });
};

function ProductImage({
  src,
  alt,
  imgClassName = "w-full h-full object-cover",
  iconClassName = "w-5 h-5 text-slate-300",
}: {
  src?: string | null;
  alt: string;
  imgClassName?: string;
  iconClassName?: string;
}) {
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    setImgErr(false);
  }, [src]);

  if (src && !imgErr) {
    return (
      <img
        src={src}
        alt={alt}
        className={imgClassName}
        onError={() => setImgErr(true)}
      />
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-50">
      <Package className={iconClassName} />
    </div>
  );
}

function isQuestionProduct(item: { name?: string; category?: string }): boolean {
  const cat = (item.category || "").trim().toLowerCase();
  const name = (item.name || "").trim().toLowerCase();
  return cat.includes("প্রশ্ন") || name.includes("প্রশ্ন") || cat.includes("question") || name.includes("question");
}

interface ProductColorTheme {
  cardBg: string;
  cardBorder: string;
  cardHoverBorder: string;
  cardShadow: string;
  coverBg: string;
  coverBorder: string;
  detailsBg: string;
  tagBg: string;
  priceColor: string;
  btnGradient: string;
}

function getProductColorTheme(product: {
  id?: string | null;
  name?: string | null;
  category?: string | null;
  className?: string | null;
  subject?: string | null;
  imageUrl?: string | null;
}): ProductColorTheme {
  const text = `${product.name || ""} ${product.subject || ""} ${product.category || ""} ${product.className || ""}`.toLowerCase();

  // Pure white book cover background so the book photo blends cleanly on pure white
  const CLEAN_COVER_BG = "bg-white";
  const CLEAN_COVER_BORDER = "border-b border-slate-100";

  // 1. Urdu / উর্দু
  if (text.includes("উর্দু") || text.includes("urdu")) {
    return {
      cardBg: "bg-white",
      cardBorder: "border-rose-200/90",
      cardHoverBorder: "hover:border-rose-400 hover:shadow-rose-900/10",
      cardShadow: "shadow-[0_4px_20px_rgba(225,29,72,0.07)]",
      coverBg: CLEAN_COVER_BG,
      coverBorder: CLEAN_COVER_BORDER,
      detailsBg: "bg-gradient-to-b from-rose-50/80 via-red-50/30 to-white",
      tagBg: "bg-rose-100/90 text-rose-900 border-rose-200/80",
      priceColor: "text-rose-950",
      btnGradient: "from-rose-700 to-red-800 hover:from-rose-800 hover:to-red-900",
    };
  }

  // 2. Science / Bigyan / Computer / বিজ্ঞান / কম্পিউটার
  if (text.includes("বিজ্ঞান") || text.includes("কম্পিউটার") || text.includes("science")) {
    return {
      cardBg: "bg-white",
      cardBorder: "border-indigo-200/90",
      cardHoverBorder: "hover:border-indigo-400 hover:shadow-indigo-900/10",
      cardShadow: "shadow-[0_4px_20px_rgba(79,70,229,0.07)]",
      coverBg: CLEAN_COVER_BG,
      coverBorder: CLEAN_COVER_BORDER,
      detailsBg: "bg-gradient-to-b from-indigo-50/80 via-blue-50/30 to-white",
      tagBg: "bg-indigo-100/90 text-indigo-900 border-indigo-200/80",
      priceColor: "text-indigo-950",
      btnGradient: "from-indigo-700 to-blue-700 hover:from-indigo-800 hover:to-blue-800",
    };
  }

  // 3. Samaj / সমাজ / পরিবেশ
  if (text.includes("সমাজ") || text.includes("পরিবেশ") || text.includes("নৈতিক")) {
    return {
      cardBg: "bg-white",
      cardBorder: "border-amber-200/90",
      cardHoverBorder: "hover:border-amber-400 hover:shadow-amber-900/10",
      cardShadow: "shadow-[0_4px_20px_rgba(217,119,6,0.07)]",
      coverBg: CLEAN_COVER_BG,
      coverBorder: CLEAN_COVER_BORDER,
      detailsBg: "bg-gradient-to-b from-amber-50/80 via-stone-50/30 to-white",
      tagBg: "bg-amber-100/90 text-amber-950 border-amber-200/80",
      priceColor: "text-amber-950",
      btnGradient: "from-amber-700 to-yellow-800 hover:from-amber-800 hover:to-yellow-900",
    };
  }

  // 4. Arabi Bhasha / আরবি ভাষা
  if (text.includes("আরবি ভাষা") || text.includes("আরবী ভাষা")) {
    return {
      cardBg: "bg-white",
      cardBorder: "border-sky-200/90",
      cardHoverBorder: "hover:border-sky-400 hover:shadow-sky-900/10",
      cardShadow: "shadow-[0_4px_20px_rgba(2,132,199,0.07)]",
      coverBg: CLEAN_COVER_BG,
      coverBorder: CLEAN_COVER_BORDER,
      detailsBg: "bg-gradient-to-b from-sky-50/80 via-blue-50/30 to-white",
      tagBg: "bg-sky-100/90 text-sky-900 border-sky-200/80",
      priceColor: "text-sky-950",
      btnGradient: "from-sky-700 to-blue-700 hover:from-sky-800 hover:to-blue-800",
    };
  }

  // 5. Islam / Arabic / Quran / Tajweed / Qaidah
  if (
    text.includes("ইসলাম") || text.includes("আরবি") || text.includes("আরবী") ||
    text.includes("কুরআন") || text.includes("কোরআন") || text.includes("কায়দা") ||
    text.includes("আমপারা") || text.includes("তাজবীদ") || text.includes("দ্বীন") ||
    text.includes("কালেমা") || text.includes("মাসায়েল")
  ) {
    // Khata Arbi (Blue cover)
    if (text.includes("খাতা") && (text.includes("আরবি") || text.includes("আরবী"))) {
      return {
        cardBg: "bg-white",
        cardBorder: "border-blue-200/90",
        cardHoverBorder: "hover:border-blue-400 hover:shadow-blue-900/10",
        cardShadow: "shadow-[0_4px_20px_rgba(37,99,235,0.07)]",
        coverBg: CLEAN_COVER_BG,
        coverBorder: CLEAN_COVER_BORDER,
        detailsBg: "bg-gradient-to-b from-blue-50/80 via-sky-50/30 to-white",
        tagBg: "bg-blue-100/90 text-blue-900 border-blue-200/80",
        priceColor: "text-blue-950",
        btnGradient: "from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800",
      };
    }
    return {
      cardBg: "bg-white",
      cardBorder: "border-emerald-200/90",
      cardHoverBorder: "hover:border-emerald-400 hover:shadow-emerald-900/10",
      cardShadow: "shadow-[0_4px_20px_rgba(5,150,105,0.07)]",
      coverBg: CLEAN_COVER_BG,
      coverBorder: CLEAN_COVER_BORDER,
      detailsBg: "bg-gradient-to-b from-emerald-50/80 via-teal-50/30 to-white",
      tagBg: "bg-emerald-100/90 text-emerald-900 border-emerald-200/80",
      priceColor: "text-emerald-950",
      btnGradient: "from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800",
    };
  }

  // 6. English / ইংরেজি
  if (text.includes("ইংরেজি") || text.includes("ইংরেজী") || text.includes("english")) {
    if (text.includes("খাতা")) {
      return {
        cardBg: "bg-white",
        cardBorder: "border-purple-200/90",
        cardHoverBorder: "hover:border-purple-400 hover:shadow-purple-900/10",
        cardShadow: "shadow-[0_4px_20px_rgba(147,51,234,0.07)]",
        coverBg: CLEAN_COVER_BG,
        coverBorder: CLEAN_COVER_BORDER,
        detailsBg: "bg-gradient-to-b from-purple-50/80 via-fuchsia-50/30 to-white",
        tagBg: "bg-purple-100/90 text-purple-900 border-purple-200/80",
        priceColor: "text-purple-950",
        btnGradient: "from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800",
      };
    }
    // Nursery English (Bright yellow/gold cover)
    if (text.includes("নার্সারি") || text.includes("নার্সারী")) {
      return {
        cardBg: "bg-white",
        cardBorder: "border-amber-200/90",
        cardHoverBorder: "hover:border-amber-400 hover:shadow-amber-900/10",
        cardShadow: "shadow-[0_4px_20px_rgba(217,119,6,0.07)]",
        coverBg: CLEAN_COVER_BG,
        coverBorder: CLEAN_COVER_BORDER,
        detailsBg: "bg-gradient-to-b from-amber-50/80 via-yellow-50/30 to-white",
        tagBg: "bg-amber-100/90 text-amber-950 border-amber-200/80",
        priceColor: "text-amber-950",
        btnGradient: "from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800",
      };
    }
    // Play English / Class 4 English (Red/coral cover)
    return {
      cardBg: "bg-white",
      cardBorder: "border-rose-200/90",
      cardHoverBorder: "hover:border-rose-400 hover:shadow-rose-900/10",
      cardShadow: "shadow-[0_4px_20px_rgba(225,29,72,0.07)]",
      coverBg: CLEAN_COVER_BG,
      coverBorder: CLEAN_COVER_BORDER,
      detailsBg: "bg-gradient-to-b from-rose-50/80 via-red-50/30 to-white",
      tagBg: "bg-rose-100/90 text-rose-900 border-rose-200/80",
      priceColor: "text-rose-950",
      btnGradient: "from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800",
    };
  }

  // 7. Math / গণিত / অংক
  if (text.includes("গণিত") || text.includes("গনিত") || text.includes("অংক") || text.includes("math")) {
    if (text.includes("খাতা")) {
      return {
        cardBg: "bg-white",
        cardBorder: "border-orange-200/90",
        cardHoverBorder: "hover:border-orange-400 hover:shadow-orange-900/10",
        cardShadow: "shadow-[0_4px_20px_rgba(234,88,12,0.07)]",
        coverBg: CLEAN_COVER_BG,
        coverBorder: CLEAN_COVER_BORDER,
        detailsBg: "bg-gradient-to-b from-orange-50/80 via-amber-50/30 to-white",
        tagBg: "bg-orange-100/90 text-orange-950 border-orange-200/80",
        priceColor: "text-orange-950",
        btnGradient: "from-orange-600 to-amber-700 hover:from-orange-700 hover:to-amber-800",
      };
    }
    // Nursery Math (Red/Crimson & teal cover)
    if (text.includes("নার্সারি") || text.includes("নার্সারী")) {
      return {
        cardBg: "bg-white",
        cardBorder: "border-red-200/90",
        cardHoverBorder: "hover:border-red-400 hover:shadow-red-900/10",
        cardShadow: "shadow-[0_4px_20px_rgba(220,38,38,0.07)]",
        coverBg: CLEAN_COVER_BG,
        coverBorder: CLEAN_COVER_BORDER,
        detailsBg: "bg-gradient-to-b from-red-50/80 via-rose-50/30 to-white",
        tagBg: "bg-red-100/90 text-red-900 border-red-200/80",
        priceColor: "text-red-950",
        btnGradient: "from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800",
      };
    }
    // Play Math / Class 4 Math (Blue cover)
    return {
      cardBg: "bg-white",
      cardBorder: "border-blue-200/90",
      cardHoverBorder: "hover:border-blue-400 hover:shadow-blue-900/10",
      cardShadow: "shadow-[0_4px_20px_rgba(37,99,235,0.07)]",
      coverBg: CLEAN_COVER_BG,
      coverBorder: CLEAN_COVER_BORDER,
      detailsBg: "bg-gradient-to-b from-blue-50/80 via-sky-50/30 to-white",
      tagBg: "bg-blue-100/90 text-blue-900 border-blue-200/80",
      priceColor: "text-blue-950",
      btnGradient: "from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800",
    };
  }

  // 8. Bangla / বাংলা
  if (text.includes("বাংলা") || text.includes("সাহিত্য")) {
    return {
      cardBg: "bg-white",
      cardBorder: "border-lime-200/90",
      cardHoverBorder: "hover:border-lime-400 hover:shadow-lime-900/10",
      cardShadow: "shadow-[0_4px_20px_rgba(101,163,13,0.07)]",
      coverBg: CLEAN_COVER_BG,
      coverBorder: CLEAN_COVER_BORDER,
      detailsBg: "bg-gradient-to-b from-lime-50/80 via-emerald-50/30 to-white",
      tagBg: "bg-lime-100/90 text-lime-900 border-lime-200/80",
      priceColor: "text-emerald-950",
      btnGradient: "from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800",
    };
  }

  // 9. Syllabus / সিলেবাস / রুটিন
  if (text.includes("সিলেবাস") || text.includes("রুটিন") || text.includes("ফরম")) {
    if (text.includes("নার্সারি") || text.includes("নার্সারী")) {
      return {
        cardBg: "bg-white",
        cardBorder: "border-yellow-200/90",
        cardHoverBorder: "hover:border-yellow-400 hover:shadow-yellow-900/10",
        cardShadow: "shadow-[0_4px_20px_rgba(202,138,4,0.07)]",
        coverBg: CLEAN_COVER_BG,
        coverBorder: CLEAN_COVER_BORDER,
        detailsBg: "bg-gradient-to-b from-yellow-50/80 via-amber-50/30 to-white",
        tagBg: "bg-yellow-100/90 text-yellow-950 border-yellow-200/80",
        priceColor: "text-amber-950",
        btnGradient: "from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700",
      };
    }
    return {
      cardBg: "bg-white",
      cardBorder: "border-teal-200/90",
      cardHoverBorder: "hover:border-teal-400 hover:shadow-teal-900/10",
      cardShadow: "shadow-[0_4px_20px_rgba(13,148,136,0.07)]",
      coverBg: CLEAN_COVER_BG,
      coverBorder: CLEAN_COVER_BORDER,
      detailsBg: "bg-gradient-to-b from-teal-50/80 via-cyan-50/30 to-white",
      tagBg: "bg-teal-100/90 text-teal-900 border-teal-200/80",
      priceColor: "text-teal-950",
      btnGradient: "from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800",
    };
  }

  // 10. Set / প্যাকেজ
  if (text.includes("সেট") || text.includes("প্যাকেজ")) {
    return {
      cardBg: "bg-white",
      cardBorder: "border-indigo-200/90",
      cardHoverBorder: "hover:border-indigo-400 hover:shadow-indigo-900/10",
      cardShadow: "shadow-[0_4px_20px_rgba(79,70,229,0.07)]",
      coverBg: CLEAN_COVER_BG,
      coverBorder: CLEAN_COVER_BORDER,
      detailsBg: "bg-gradient-to-b from-indigo-50/80 via-purple-50/30 to-white",
      tagBg: "bg-indigo-100/90 text-indigo-900 border-indigo-200/80",
      priceColor: "text-indigo-950",
      btnGradient: "from-indigo-700 to-purple-700 hover:from-indigo-800 hover:to-purple-800",
    };
  }

  // 11. Stationary / স্টেশনারি
  if (text.includes("স্টেশনারি") || text.includes("চক") || text.includes("ডাস্টার") || text.includes("কলম")) {
    return {
      cardBg: "bg-white",
      cardBorder: "border-amber-200/90",
      cardHoverBorder: "hover:border-amber-400 hover:shadow-amber-900/10",
      cardShadow: "shadow-[0_4px_20px_rgba(217,119,6,0.07)]",
      coverBg: CLEAN_COVER_BG,
      coverBorder: CLEAN_COVER_BORDER,
      detailsBg: "bg-gradient-to-b from-amber-50/80 via-orange-50/30 to-white",
      tagBg: "bg-amber-100/90 text-amber-950 border-amber-200/80",
      priceColor: "text-amber-950",
      btnGradient: "from-amber-600 to-emerald-700 hover:from-amber-700 hover:to-emerald-800",
    };
  }

  // 12. Deterministic Hash Fallback
  const palettes: ProductColorTheme[] = [
    {
      cardBg: "bg-white",
      cardBorder: "border-emerald-200/90",
      cardHoverBorder: "hover:border-emerald-400 hover:shadow-emerald-900/10",
      cardShadow: "shadow-[0_4px_20px_rgba(5,150,105,0.07)]",
      coverBg: CLEAN_COVER_BG,
      coverBorder: CLEAN_COVER_BORDER,
      detailsBg: "bg-gradient-to-b from-emerald-50/80 via-teal-50/30 to-white",
      tagBg: "bg-emerald-100/90 text-emerald-900 border-emerald-200/80",
      priceColor: "text-emerald-950",
      btnGradient: "from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800",
    },
    {
      cardBg: "bg-white",
      cardBorder: "border-sky-200/90",
      cardHoverBorder: "hover:border-sky-400 hover:shadow-sky-900/10",
      cardShadow: "shadow-[0_4px_20px_rgba(2,132,199,0.07)]",
      coverBg: CLEAN_COVER_BG,
      coverBorder: CLEAN_COVER_BORDER,
      detailsBg: "bg-gradient-to-b from-sky-50/80 via-cyan-50/30 to-white",
      tagBg: "bg-sky-100/90 text-sky-900 border-sky-200/80",
      priceColor: "text-sky-950",
      btnGradient: "from-sky-700 to-blue-700 hover:from-sky-800 hover:to-blue-800",
    },
    {
      cardBg: "bg-white",
      cardBorder: "border-amber-200/90",
      cardHoverBorder: "hover:border-amber-400 hover:shadow-amber-900/10",
      cardShadow: "shadow-[0_4px_20px_rgba(217,119,6,0.07)]",
      coverBg: CLEAN_COVER_BG,
      coverBorder: CLEAN_COVER_BORDER,
      detailsBg: "bg-gradient-to-b from-amber-50/80 via-yellow-50/30 to-white",
      tagBg: "bg-amber-100/90 text-amber-950 border-amber-200/80",
      priceColor: "text-amber-950",
      btnGradient: "from-amber-600 to-emerald-700 hover:from-amber-700 hover:to-emerald-800",
    },
    {
      cardBg: "bg-white",
      cardBorder: "border-rose-200/90",
      cardHoverBorder: "hover:border-rose-400 hover:shadow-rose-900/10",
      cardShadow: "shadow-[0_4px_20px_rgba(225,29,72,0.07)]",
      coverBg: CLEAN_COVER_BG,
      coverBorder: CLEAN_COVER_BORDER,
      detailsBg: "bg-gradient-to-b from-rose-50/80 via-orange-50/30 to-white",
      tagBg: "bg-rose-100/90 text-rose-900 border-rose-200/80",
      priceColor: "text-rose-950",
      btnGradient: "from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800",
    },
    {
      cardBg: "bg-white",
      cardBorder: "border-purple-200/90",
      cardHoverBorder: "hover:border-purple-400 hover:shadow-purple-900/10",
      cardShadow: "shadow-[0_4px_20px_rgba(147,51,234,0.07)]",
      coverBg: CLEAN_COVER_BG,
      coverBorder: CLEAN_COVER_BORDER,
      detailsBg: "bg-gradient-to-b from-purple-50/80 via-indigo-50/30 to-white",
      tagBg: "bg-purple-100/90 text-purple-900 border-purple-200/80",
      priceColor: "text-purple-950",
      btnGradient: "from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800",
    },
  ];

  let hash = 0;
  const str = product.id || product.name || "default";
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % palettes.length;
  return palettes[idx];
}

const STAR_RATINGS: Record<string, { rating: number; reviews: number }> = {};

function StarDisplay({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
      ))}
      <span className="text-xs text-slate-400 ml-1">({reviews})</span>
    </div>
  );
}

function ListProductRow({
  product, index, cartQty, updateCartQty, setDetailProduct
}: {
  product: Product, index: number, cartQty: number,
  updateCartQty: (p: Product, q: number) => void, setDetailProduct: (p: Product) => void
}) {
  const productCode = getCleanProductCode(product);

  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors bg-white/70">
      <td className="p-2 hidden sm:table-cell">
        <div
          onClick={() => setDetailProduct(product)}
          className="w-11 h-11 bg-white rounded-lg flex items-center justify-center flex-shrink-0 mx-auto overflow-hidden shadow-2xs border border-slate-200 relative cursor-pointer hover:border-primary/40 transition-colors"
        >
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            imgClassName="w-full h-full object-cover"
            iconClassName="w-5 h-5 text-slate-300"
          />
        </div>
      </td>
      <td className="p-2 text-center hidden sm:table-cell">
        {productCode ? (
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-black font-mono">
            {productCode}
          </span>
        ) : (
          <span className="text-xs text-slate-300 font-bold">—</span>
        )}
      </td>
      <td className="p-1.5 sm:p-2.5">
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <div className="min-w-0 flex-1">
            <h3
              className="font-bold text-slate-800 text-xs sm:text-sm cursor-pointer hover:text-primary transition-colors line-clamp-2"
              onClick={() => setDetailProduct(product)}
            >
              {product.name}
            </h3>
            <div className="flex items-center gap-1 flex-wrap text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
              {/* On mobile: display unit price directly under title so it never requires horizontal scrolling */}
              <span className="sm:hidden font-black text-emerald-800 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200/80">
                দর: ৳{product.price.toFixed(2)}
              </span>
              {productCode && (
                <span className="sm:hidden font-mono font-medium text-slate-600">
                  #{productCode}
                </span>
              )}
              {product.className && (
                <span className="font-medium truncate text-slate-500 hidden xs:inline">
                  {product.className}{product.subject ? ` - ${product.subject}` : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="p-2 text-center text-xs font-bold text-slate-600 hidden sm:table-cell">
        <div className="flex flex-wrap items-center justify-center gap-1">
          {(product.category || '').split(',').map(c => c.trim()).filter(Boolean).map(c => (
            <span key={c} className="bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">{c}</span>
          ))}
        </div>
      </td>
      {/* Hide separate 'দর' on mobile as it is neatly integrated under book name */}
      <td className="p-2 sm:p-2.5 text-center font-bold text-xs sm:text-sm text-slate-800 hidden sm:table-cell">
        {product.price.toFixed(2)}
      </td>
      <td className="p-1 sm:p-2.5 w-[85px] sm:w-auto">
        <div className="flex items-center justify-center gap-0.5 sm:gap-1 mx-auto w-fit">
          <button 
            type="button"
            onClick={() => updateCartQty(product, Math.max(0, cartQty - 1))} 
            className="w-5 h-5 sm:w-7 sm:h-7 bg-slate-400 hover:bg-slate-500 text-white flex items-center justify-center rounded-sm font-bold text-sm sm:text-lg leading-none active:scale-95 transition-transform cursor-pointer"
          >−</button>
          <EditableQtyInput
            value={cartQty}
            onChange={(val) => updateCartQty(product, val)}
            onRemove={() => updateCartQty(product, 0)}
            className="w-7 sm:w-14 h-5 sm:h-7 text-center text-xs sm:text-sm font-bold border border-slate-300 rounded-sm outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
          />
          <button 
            type="button"
            onClick={() => updateCartQty(product, cartQty + 1)} 
            className="w-5 h-5 sm:w-7 sm:h-7 bg-[#2f8c5b] hover:bg-[#2f8c5b]/90 text-white flex items-center justify-center rounded-sm font-bold text-sm sm:text-lg leading-none active:scale-95 transition-transform cursor-pointer"
          >+</button>
        </div>
      </td>
      <td className="p-1 sm:p-2.5 text-right pr-1.5 sm:pr-6 font-black text-xs sm:text-sm text-slate-900 whitespace-nowrap w-[62px] sm:w-auto">
        {(product.price * cartQty).toFixed(2)}
      </td>
    </tr>
  );
}

function ProductDetailModal({
  product, onClose, onAddToCart, isFav, onToggleFav, cartQty, onUpdateQty
}: {
  product: Product; onClose: () => void;
  onAddToCart: (p: Product) => void;
  isFav: boolean; onToggleFav: () => void;
  cartQty: number;
  onUpdateQty: (qty: number) => void;
}) {
  const productCode = getCleanProductCode(product);
  const theme = getProductColorTheme(product);

  // Gallery items: Book cover + all sample pages
  const galleryItems = useMemo(() => {
    const list: { url: string; label: string; isCover?: boolean }[] = [];
    if (product.imageUrl) {
      list.push({ url: product.imageUrl, label: "কভার পৃষ্ঠা", isCover: true });
    }
    if (Array.isArray(product.samplePages)) {
      product.samplePages.forEach((url, i) => {
        if (url && typeof url === "string" && url.trim()) {
          list.push({ url: url.trim(), label: `পৃষ্ঠা ${i + 1}` });
        }
      });
    }
    return list;
  }, [product.imageUrl, product.samplePages]);

  // Drag to scroll state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [dragMoved, setDragMoved] = useState(false);

  // Lightbox Big View State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftState(scrollContainerRef.current.scrollLeft);
    setDragMoved(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) {
      setDragMoved(true);
    }
    scrollContainerRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftState(scrollContainerRef.current.scrollLeft);
    setDragMoved(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) {
      setDragMoved(true);
    }
    scrollContainerRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const scrollByAmount = (amount: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  // Lightbox touch swipe
  const [lightboxTouchX, setLightboxTouchX] = useState<number | null>(null);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft" && galleryItems.length > 1) {
        setLightboxIndex(prev => prev === null ? null : (prev - 1 + galleryItems.length) % galleryItems.length);
      }
      if (e.key === "ArrowRight" && galleryItems.length > 1) {
        setLightboxIndex(prev => prev === null ? null : (prev + 1) % galleryItems.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, galleryItems.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[92vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Fixed Close Button at Top-Right */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 p-2 rounded-full shadow-md border border-slate-200/80 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
          title="বন্ধ করুন"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Scrollable Body (Pages Gallery + Info + Details/Syllabus) */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* Top Gallery Area: Horizontal Scrollable / Draggable Cards */}
          {galleryItems.length > 1 ? (
            <div className="relative bg-white border-b border-slate-100 flex flex-col select-none">
              {/* Left Scroll Button */}
              <button
                type="button"
                onClick={() => scrollByAmount(-220)}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md border border-slate-200/80 flex items-center justify-center transition-all cursor-pointer"
                title="বামে স্ক্রোল করুন"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Right Scroll Button */}
              <button
                type="button"
                onClick={() => scrollByAmount(220)}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md border border-slate-200/80 flex items-center justify-center transition-all cursor-pointer"
                title="ডানে স্ক্রোল করুন"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Draggable Track */}
              <div
                ref={scrollContainerRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="flex items-center gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory py-4 px-6 cursor-grab active:cursor-grabbing no-scrollbar touch-pan-x"
                style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
              >
                {galleryItems.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (!dragMoved) setLightboxIndex(idx);
                    }}
                    className="relative shrink-0 snap-center group/card cursor-pointer rounded-2xl border border-slate-200/90 hover:border-emerald-500 bg-white shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col items-center justify-center aspect-[3/4] h-60 sm:h-72"
                  >
                    <img
                      src={item.url}
                      alt={`${product.name} - ${item.label}`}
                      className="h-full w-full object-contain p-2.5 pointer-events-none group-hover/card:scale-102 transition-transform duration-200"
                      draggable={false}
                    />

                    {/* Badge showing page title */}
                    <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                      {item.label}
                    </div>

                    {/* Hover Big View pill */}
                    <div className="absolute bottom-2.5 inset-x-2.5 bg-emerald-700/95 backdrop-blur-xs text-white text-[11px] font-bold py-1.5 px-2 rounded-xl text-center opacity-0 group-hover/card:opacity-100 transition-opacity shadow-md flex items-center justify-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>বড় করে পড়ুন</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status bar under the cards */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50/70 text-[11px] text-slate-500 font-medium">
                <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>কভার ও মোট {galleryItems.length - 1}টি পৃষ্ঠা (টেনে ডানে-বামে পড়ুন)</span>
                </span>
                <span className="text-[10.5px] text-slate-400 hidden sm:inline">
                  পাতায় ক্লিক করে পুরো স্ক্রিনে পড়ুন
                </span>
              </div>
            </div>
          ) : (
            /* Single Image (Cover only) */
            <div
              onClick={() => galleryItems[0] && setLightboxIndex(0)}
              className="bg-white h-56 sm:h-64 flex items-center justify-center overflow-hidden relative border-b border-slate-100 cursor-pointer group"
              title="বড় করে দেখতে ক্লিক করুন"
            >
              <ProductImage
                src={product.imageUrl}
                alt={product.name}
                imgClassName="w-full h-full object-contain p-4 group-hover:scale-102 transition-transform duration-200"
                iconClassName="w-20 h-20 text-slate-300"
              />
              <div className="absolute bottom-2.5 right-2.5 bg-slate-900/75 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <Maximize2 className="w-3 h-3" />
                <span>বড় করে দেখুন</span>
              </div>
            </div>
          )}

          <div className="p-5 sm:p-6 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {(product.category || '').split(',').map(c => c.trim()).filter(Boolean).map(c => (
                <span key={c} className="text-xs font-bold text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 px-3 py-1 rounded-full">{c}</span>
              ))}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">{product.name}</h2>
            <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm text-slate-500 font-medium">
              {productCode && (
                <span className="font-mono text-slate-600">
                  আইডি: {productCode}
                </span>
              )}
              {productCode && product.className && <span className="text-slate-300">•</span>}
              {product.className && (
                <span className="text-slate-500">
                  {product.className}{product.subject ? ` — ${product.subject}` : ''}
                </span>
              )}
            </div>

            {product.description && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">বিবরণ / সূচিপত্র:</h4>
                <div className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                  {product.description}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer: Price & Quantity Stepper / Add to Cart Button */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200/80 shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono">৳{product.price}</span>
              <span className="text-slate-500 text-xs sm:text-sm ml-2">প্রতি {product.unit || 'টি'}</span>
            </div>
            {cartQty > 0 && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                কার্ট মোট: ৳{(product.price * cartQty).toFixed(2)}
              </span>
            )}
          </div>

          {cartQty > 0 ? (
            <div className="flex items-center gap-3 bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => onUpdateQty(cartQty - 1)}
                className="w-11 h-11 bg-slate-50 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-800 font-black text-2xl rounded-xl flex items-center justify-center border border-slate-200 shadow-2xs active:scale-90 transition-all cursor-pointer"
                title="পরিমাণ কমান"
              >
                −
              </button>
              <div className="flex-1 flex flex-col items-center justify-center">
                <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">কার্টে পরিমাণ</span>
                <span className="text-xl font-black text-slate-900 font-mono leading-tight">
                  {cartQty} <span className="text-xs font-bold text-slate-500 font-sans">{product.unit || 'টি'}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateQty(cartQty + 1)}
                className="w-11 h-11 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-2xl rounded-xl flex items-center justify-center shadow-md shadow-emerald-700/25 active:scale-90 transition-all cursor-pointer"
                title="পরিমাণ বাড়ান"
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm sm:text-base shadow-md shadow-emerald-700/25 transition-all active:scale-[0.98] cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>কার্টে যোগ করুন</span>
            </button>
          )}
        </div>
      </div>

      {/* Big View / Lightbox Modal */}
      {lightboxIndex !== null && galleryItems[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-5 select-none animate-in fade-in duration-200"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white w-full max-w-5xl mx-auto z-10 shrink-0 py-2">
            <div>
              <h3 className="font-bold text-sm sm:text-base line-clamp-1">{product.name}</h3>
              <p className="text-xs text-slate-300">
                {galleryItems[lightboxIndex].label} • ({lightboxIndex + 1} / {galleryItems.length})
              </p>
            </div>
            <button
              onClick={() => setLightboxIndex(null)}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
              title="বন্ধ করুন (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Big Image Area with Left/Right Nav */}
          <div
            className="flex-1 flex items-center justify-center relative w-full max-w-5xl mx-auto overflow-hidden my-2"
            onClick={e => e.stopPropagation()}
            onTouchStart={(e) => setLightboxTouchX(e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (lightboxTouchX === null) return;
              const diff = e.changedTouches[0].clientX - lightboxTouchX;
              if (diff > 50 && galleryItems.length > 1) {
                setLightboxIndex((lightboxIndex - 1 + galleryItems.length) % galleryItems.length);
              } else if (diff < -50 && galleryItems.length > 1) {
                setLightboxIndex((lightboxIndex + 1) % galleryItems.length);
              }
              setLightboxTouchX(null);
            }}
          >
            {/* Prev Button */}
            {galleryItems.length > 1 && (
              <button
                type="button"
                onClick={() => setLightboxIndex((lightboxIndex - 1 + galleryItems.length) % galleryItems.length)}
                className="absolute left-2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-black/60 hover:bg-black/90 text-white rounded-full flex items-center justify-center border border-white/20 shadow-xl transition-all active:scale-95 cursor-pointer"
                title="পূর্ববর্তী পাতা (←)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <div className="max-h-[75vh] sm:max-h-[80vh] max-w-full flex items-center justify-center overflow-auto p-2">
              <img
                src={galleryItems[lightboxIndex].url}
                alt={`${product.name} - ${galleryItems[lightboxIndex].label}`}
                className="max-h-[75vh] sm:max-h-[80vh] w-auto max-w-full object-contain rounded-lg shadow-2xl transition-all"
              />
            </div>

            {/* Next Button */}
            {galleryItems.length > 1 && (
              <button
                type="button"
                onClick={() => setLightboxIndex((lightboxIndex + 1) % galleryItems.length)}
                className="absolute right-2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-black/60 hover:bg-black/90 text-white rounded-full flex items-center justify-center border border-white/20 shadow-xl transition-all active:scale-95 cursor-pointer"
                title="পরবর্তী পাতা (→)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {galleryItems.length > 1 && (
            <div
              className="w-full max-w-xl mx-auto flex items-center justify-center gap-2 overflow-x-auto py-2 px-3 bg-white/10 backdrop-blur-md rounded-2xl shrink-0"
              onClick={e => e.stopPropagation()}
            >
              {galleryItems.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  className={`w-12 h-16 rounded-md overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    i === lightboxIndex ? "border-emerald-400 scale-105 shadow-md" : "border-white/20 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DeliveryPolicyAlertModal({
  isOpen,
  onClose,
  onProceedToOrder,
  mode = "first_visit",
  cartTotal = 0,
  initialTab = "delivery"
}: {
  isOpen: boolean;
  onClose: () => void;
  onProceedToOrder?: () => void;
  mode?: "first_visit" | "before_order" | "manual";
  cartTotal?: number;
  initialTab?: "delivery" | "payment" | "return" | "complaint";
}) {
  const [activeTab, setActiveTab] = useState<"delivery" | "payment" | "return" | "complaint">(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const isBeforeOrder = mode === "before_order";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full mx-auto z-10 overflow-hidden flex flex-col border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#052e23] via-emerald-800 to-[#0a4233] text-white relative flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 block w-fit mb-0.5">
                  নূরানী প্রকাশন নীতিমালা ও তথ্যাবলি
                </span>
                <h3 className="text-base sm:text-lg font-black text-white leading-tight truncate">
                  অর্ডার, পেমেন্ট, ডেলিভারি ও ফেরত সেবা
                </h3>
              </div>
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 flex-shrink-0 cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Policy Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3.5 mt-2 border-t border-white/15 [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setActiveTab("delivery")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "delivery"
                  ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                  : "bg-white/10 text-emerald-100 hover:bg-white/20"
                }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>ডেলিভারি চার্জ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("payment")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "payment"
                  ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                  : "bg-white/10 text-emerald-100 hover:bg-white/20"
                }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>পেমেন্ট পদ্ধতি</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("return")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "return"
                  ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                  : "bg-white/10 text-emerald-100 hover:bg-white/20"
                }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>বই ফেরত ও বদল</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("complaint")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "complaint"
                  ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                  : "bg-white/10 text-emerald-100 hover:bg-white/20"
                }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>ভুল সংশোধন</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-3.5 text-xs sm:text-sm text-slate-700 max-h-[65vh] overflow-y-auto">
          {activeTab === "delivery" && (
            <div className="space-y-2.5">
              <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                <span>🚚 উপলব্ধ ডেলিভারি মাধ্যম ও সময়সীমা:</span>
              </h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                  <span className="text-base leading-none">🚚</span>
                  <div>
                    <strong className="text-slate-900">পাঠাও কুরিয়ার:</strong> দ্রুততম সময়ে হোম বা পয়েন্ট ডেলিভারি (চার্জ কুরিয়ার বাহককে পরিশোধযোগ্য)।
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                  <span className="text-base leading-none">📦</span>
                  <div>
                    <strong className="text-slate-900">স্টিডফাস্ট কুরিয়ার:</strong> নির্ভরযোগ্য পার্সেল সার্ভিস (চার্জ কুরিয়ার বাহককে পরিশোধযোগ্য)।
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 shadow-2xs">
                  <span className="text-base leading-none">🏢</span>
                  <div>
                    <strong className="text-emerald-900">বোর্ড কার্যালয় থেকে সংগ্রহ (নিজে):</strong> খুলনা প্রধান কার্যালয় প্রকাশনা সেলস কাউন্টার থেকে সরাসরি বই সংগ্রহ (চার্জ নেই)।
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                  <span className="text-base leading-none">🚛</span>
                  <div>
                    <strong className="text-slate-900">অন্যান্য কুরিয়ার ও ট্রান্সপোর্ট:</strong> সুন্দরবন, এস এ পরিবহন বা দূরপাল্লার বাসের মাধ্যমে সরাসরি প্রেরণ।
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 leading-relaxed">
                  ⏱️ <strong>সময়সীমা:</strong> অর্ডার কনফার্মের ২৪-৪৮ ঘণ্টার মধ্যে পার্সেল বুকিং দেওয়া হয় এবং ট্র্যাকিং কোড এসএমএস/অনলাইনে পাওয়া যায়।
                </p>
              </div>
            </div>
          )}

          {activeTab === "payment" && (
            <div className="space-y-2.5">
              <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                <span>💳 পেমেন্ট পদ্ধতি ও নিয়মাবলী:</span>
              </h4>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="text-emerald-700">📱</span>
                    <span>বিকাশ, নগদ ও রকেট পেমেন্ট</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    অর্ডার ফরমে প্রদর্শিত অফিশিয়াল একাউন্টে সেন্ড মানি বা পেমেন্ট করে ট্রানজেকশন আইডি (TrxID) ও প্রেরক নম্বর দিয়ে নিশ্চিত করুন।
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="text-blue-700">🏦</span>
                    <span>ব্যাংক ট্রান্সফার বা ডিপোজিট</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    বোর্ডের নির্ধারিত ব্যাংক একাউন্টে জমা দিয়ে জমার রসিদ বা স্লিপ আপলোড করে দ্রুত অর্ডার নিশ্চিত করা যায়।
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="text-amber-700">🧾</span>
                    <span>পূর্বের মানি রিসিট দিয়ে সমন্বয়</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    বোর্ড অফিস থেকে পূর্বে প্রাপ্ত অফিশিয়াল মানি রিসিট নম্বর দিয়ে ব্যালেন্স থেকে সরাসরি বিল সমন্বয় করা সম্ভব।
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "return" && (
            <div className="space-y-2.5">
              <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                <span>🔄 বই পরিবর্তন, ফেরত ও ক্ষতিপূরণ নীতিমালা:</span>
              </h4>
              <div className="space-y-2 text-xs leading-relaxed text-slate-700">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <strong className="text-slate-900 block mb-0.5">১. বাঁধাই ও মুদ্রণ ত্রুটি:</strong>
                  বইয়ে কোনো পৃষ্ঠা মিসিং, উল্টো বাঁধাই বা অস্পষ্ট মুদ্রণ থাকলে প্রাপ্তির ৭ দিনের মধ্যে জানালে সম্পূর্ণ বিনামূল্যে পরিবর্তন করে দেওয়া হয়।
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <strong className="text-slate-900 block mb-0.5">২. পার্সেল ড্যামেজ বা ক্ষতিপূরণ:</strong>
                  কুরিয়ার থেকে পার্সেল গ্রহণের সময় প্যাকেট কাটা বা ছেঁড়া থাকলে সাথে সাথে ডেলিভারি ম্যানের সামনে ছবি তুলে রাখুন এবং আমাদের হেল্পলাইনে কল করুন।
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <strong className="text-slate-900 block mb-0.5">৩. মাদরাসার অতিরিক্ত বই ফেরত:</strong>
                  সেশন শুরুতে মাদরাসা কর্তৃক গৃহীত অতিরিক্ত অক্ষত বই বোর্ডের নির্ধারিত সময়সীমার মধ্যে সরাসরি কাউন্টারে জমা দিয়ে হিসাব সমন্বয় করা যায়।
                </div>
              </div>
            </div>
          )}

          {activeTab === "complaint" && (
            <div className="space-y-2.5">
              <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                <span>📝 বইয়ের ভুল সংশোধন ও অভিযোগ:</span>
              </h4>
              <div className="space-y-2 text-xs leading-relaxed text-slate-700">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  বোর্ডের প্রকাশিত কোনো পাঠ্যবই বা প্রকাশনায় কোনো বানান বা তথ্যগত ভুল পরিলক্ষিত হলে বোর্ড সম্পাদনা বিভাগকে জানাতে অনুরোধ করা হচ্ছে।
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="font-bold text-emerald-900 block mb-1">📞 বিক্রয় ও অভিযোগ হটলাইন:</span>
                  <p className="text-xs text-emerald-800">
                    সরাসরি কথা বলুন: <strong>01820-580560</strong> (সকাল ৯টা হতে বিকাল ৫টা)। অথবা বিস্তারিত জানাতে আমাদের যোগাযোগ ফর্মে বার্তা পাঠান।
                  </p>
                  <Link
                    href="/contact"
                    onClick={onClose}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-950 mt-2 bg-white px-3 py-1 rounded-lg border border-emerald-300"
                  >
                    <span>যোগাযোগ পেজ খুলুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            নূরানী তা'লীমুল কুরআন বোর্ড খুলনা প্রকাশনা বিভাগ
          </span>
          <div className="flex items-center gap-2 ml-auto">
            {isBeforeOrder ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  পণ্য দেখুন
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onProceedToOrder) onProceedToOrder();
                  }}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>অর্ডার ফরম খুলুন</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>বুঝেছি, বন্ধ করুন</span>
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderFormModal({ onClose, initialState, total, cart, onSuccess, currentUser, commissionSettings }: { onClose: (state?: any) => void; initialState?: any; total: number; cart: any[]; onSuccess: (data: any) => void; currentUser?: any; commissionSettings?: any }) {
  // Delivery Options State
  const [deliveryOptions, setDeliveryOptions] = useState<any[]>([]);
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<string>("pathao");
  const [courierOrTransportName, setCourierOrTransportName] = useState<string>("");

  // Payment States (Strictly dynamic methods & money receipt; pay_later only for Admin)
  const [paymentOption, setPaymentOption] = useState<"pay_now" | "money_receipt" | "pay_later">("pay_now");
  const [promiseDate, setPromiseDate] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentTab, setSelectedPaymentTab] = useState<"mobile" | "bank">("mobile");
  const [selectedMethodId, setSelectedMethodId] = useState<string>("");
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [receiptVerifyStatus, setReceiptVerifyStatus] = useState<'idle' | 'verifying' | 'valid' | 'invalid'>('idle');
  const [receiptVerifyMsg, setReceiptVerifyMsg] = useState("");
  const [receiptBalance, setReceiptBalance] = useState(0);
  const [remainingSenderNumber, setRemainingSenderNumber] = useState("");
  const [remainingTrxId, setRemainingTrxId] = useState("");

  useEffect(() => {
    fetch(`/api/settings?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.payments)) {
          const active = data.payments.filter((p: any) => p.isActive !== false);
          setPaymentMethods(active);
          if (active.length > 0) {
            const firstMob = active.find((p: any) => p.type === "mobile" || p.type === "MOBILE_BANKING") || active[0];
            setSelectedMethodId(getPaymentMethodUniqueKey(firstMob));
          }
        }
      })
      .catch(() => { });

    fetch(`/api/delivery-options?category=book&t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDeliveryOptions(data);
          const firstActive = data.find((d: any) => d.isActive !== false);
          if (firstActive) setSelectedDeliveryType(firstActive.type);
        }
      })
      .catch(() => { });
  }, []);

  const fallbackDeliveryOptions = useMemo(
    () => [
      { type: "pathao", name: "পাঠাও", charge: 0, requiresName: false },
      { type: "steadfast", name: "স্টিডফাস্ট", charge: 0, requiresName: false },
      { type: "self", name: "নিজে", charge: 0, requiresName: false },
      { type: "other_courier", name: "অন্যান্য কুরিয়ার", charge: 20, requiresName: true },
      { type: "transport", name: "ট্রান্সপোর্ট", charge: 10, requiresName: true },
    ],
    []
  );

  const visibleDeliveryOptions = useMemo(() => {
    const active = deliveryOptions.filter((d) => d.isActive !== false);
    return active.length > 0 ? active : fallbackDeliveryOptions;
  }, [deliveryOptions, fallbackDeliveryOptions]);

  const selectedDeliveryOption = useMemo(() => {
    return (
      visibleDeliveryOptions.find((d) => d.type === selectedDeliveryType) ||
      visibleDeliveryOptions[0] || {
        name: "পাঠাও",
        type: "pathao",
        charge: 0,
        requiresName: false,
      }
    );
  }, [visibleDeliveryOptions, selectedDeliveryType]);

  // Referral / Agent State
  const [referralAgentCode, setReferralAgentCode] = useState<string>(initialState?.referralAgentCode || "");
  const [referralAgentInfo, setReferralAgentInfo] = useState<any>(initialState?.referralAgentInfo || null);
  const [referralCommissionPercent, setReferralCommissionPercent] = useState<number>(initialState?.referralCommissionPercent || 0);

  const lookupReferralAgent = async (codeOrPhone: string) => {
    const trimmed = codeOrPhone.trim();
    if (trimmed.length < 3) {
      setReferralAgentInfo(null);
      setReferralCommissionPercent(0);
      return;
    }
    try {
      const res = await fetch(`/api/store/commissions?lookup=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.found && data.agent) {
          setReferralAgentInfo(data.agent);
          setReferralCommissionPercent(Number(data.bookCommissionPercent) || 0);
          try {
            localStorage.setItem("nbk_referral_code", trimmed);
          } catch { }
        } else {
          setReferralAgentInfo(null);
          setReferralCommissionPercent(0);
        }
      }
    } catch {
      setReferralAgentInfo(null);
      setReferralCommissionPercent(0);
    }
  };

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlRef = urlParams.get("ref") || urlParams.get("referral");
      const storedRef = localStorage.getItem("nbk_referral_code");
      const activeRef = (urlRef || storedRef || "").trim();
      if (activeRef && !referralAgentCode) {
        setReferralAgentCode(activeRef);
        lookupReferralAgent(activeRef);
      }
    } catch { }
  }, []);

  const activeMethods = useMemo(() => {
    return paymentMethods.filter((p) => p.isActive !== false);
  }, [paymentMethods]);

  const mobileMethods = useMemo(() => {
    return activeMethods.filter((p) => p.type === "mobile" || p.type === "MOBILE_BANKING");
  }, [activeMethods]);

  const bankMethods = useMemo(() => {
    return activeMethods.filter((p) => p.type === "bank" || p.type === "BANK");
  }, [activeMethods]);

  const selectedMethod = useMemo(() => {
    return resolveSelectedPaymentMethod(
      selectedMethodId,
      selectedPaymentTab,
      activeMethods,
      mobileMethods,
      bankMethods
    );
  }, [selectedMethodId, selectedPaymentTab, activeMethods, mobileMethods, bankMethods]);

  const activeCommissionPercent = referralAgentInfo && referralCommissionPercent > 0
    ? referralCommissionPercent
    : (referralCommissionPercent > 0 ? referralCommissionPercent : (Number(commissionSettings?.bookMadrasaCommissionPercent) || 20));

  const commissionDiscount = activeCommissionPercent > 0
    ? Math.round(total * (activeCommissionPercent / 100))
    : 0;

  const deliveryCharge = Number(selectedDeliveryOption.charge) || 0;
  const basePayable = Math.max(0, total - commissionDiscount + deliveryCharge);

  // Additional Payment/Bank Processing Fee (Configured by admin, e.g. 1%)
  const paymentFeePercent = (paymentOption === "pay_now" && selectedMethod?.chargePercent)
    ? Number(selectedMethod.chargePercent)
    : 0;
  const paymentFee = paymentFeePercent > 0
    ? Math.round(basePayable * (paymentFeePercent / 100))
    : 0;

  const grandTotal = basePayable + paymentFee;

  const totalWeightKg = useMemo(() => {
    const raw = (cart || []).reduce((w: number, i: any) => {
      const itemWeight = Number(i.product?.weight || (i as any).weight || 0.25);
      return w + itemWeight * (Number(i.qty || i.quantity) || 1);
    }, 0);
    return Math.round(raw * 10) / 10;
  }, [cart]);

  const [ilhak, setIlhak] = useState(initialState?.ilhak || "");
  const [ownerName, setOwnerName] = useState(initialState?.ownerName || "");
  const [instituteName, setInstituteName] = useState(initialState?.instituteName || "");
  const [contactNo, setContactNo] = useState(initialState?.contactNo || "");
  const [customerEmail, setCustomerEmail] = useState(initialState?.customerEmail || "");
  const [customerPassword, setCustomerPassword] = useState(initialState?.customerPassword || "");
  const [address, setAddress] = useState(initialState?.address || "");
  const [geoAddress, setGeoAddress] = useState<GeoAddressData>(initialState?.geoAddress || {
    division: "",
    district: "",
    upazila: "",
    union: "",
    village: "",
    fullAddress: initialState?.address || ""
  });
  const [hasSeparateDelivery, setHasSeparateDelivery] = useState<boolean>(initialState?.hasSeparateDelivery || false);
  const [deliveryAddress, setDeliveryAddress] = useState<GeoAddressData>(initialState?.deliveryAddress || {
    division: "",
    district: "",
    upazila: "",
    union: "",
    village: "",
    fullAddress: ""
  });
  const [missingFieldsNotice, setMissingFieldsNotice] = useState<string>("");
  const [autoFilledFields, setAutoFilledFields] = useState<{
    ownerName?: boolean;
    instituteName?: boolean;
    contactNo?: boolean;
    customerEmail?: boolean;
    address?: boolean;
  }>(initialState?.autoFilledFields || {});

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchStatus, setSearchStatus] = useState<"idle" | "found" | "not_found" | "error">(initialState?.searchStatus || "idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [paymentStep, setPaymentStep] = useState(initialState?.paymentStep || false);
  const modalBodyRef = useRef<HTMLDivElement>(null);

  const verifyReceipt = async () => {
    if (!receiptNumber.trim()) return;
    setReceiptVerifyStatus('verifying');
    setReceiptVerifyMsg('');
    try {
      const params = new URLSearchParams({ number: receiptNumber.trim() });
      if (contactNo.trim()) params.append('phone', contactNo.trim());
      const res = await fetch(`/api/store/receipts/verify?${params}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setReceiptVerifyStatus('valid');
        setReceiptBalance(data.availableBalance);
        setReceiptVerifyMsg(`✓ রিসিট সত্যায়িত! উপলব্ধ ব্যালান্স: ৳${data.availableBalance.toFixed(2)}`);
      } else {
        setReceiptVerifyStatus('invalid');
        setReceiptVerifyMsg(data.error || 'রিসিট যাচাই ব্যর্থ হয়েছে');
      }
    } catch (e) {
      setReceiptVerifyStatus('invalid');
      setReceiptVerifyMsg('সার্ভার ত্রুটি। আবার চেষ্টা করুন।');
    }
  };

  const searchIlhak = async () => {
    if (!ilhak.trim()) return;
    setIsLoading(true);
    setSearchStatus("idle");
    setMissingFieldsNotice("");
    setAutoFilledFields({});
    try {
      const res = await fetch(`/api/madrasa/by-code?code=${encodeURIComponent(ilhak)}`);
      if (res.ok) {
        const data = await res.json();
        const autoFilled: {
          ownerName?: boolean;
          instituteName?: boolean;
          contactNo?: boolean;
          customerEmail?: boolean;
          address?: boolean;
        } = {};

        if (data.name?.trim()) {
          setInstituteName(data.name.trim());
          autoFilled.instituteName = true;
        }
        if (data.ownerName?.trim()) {
          setOwnerName(data.ownerName.trim());
          autoFilled.ownerName = true;
        }
        if (data.contactNo?.trim()) {
          setContactNo(data.contactNo.trim());
          autoFilled.contactNo = true;
        }
        if (data.email?.trim()) {
          setCustomerEmail(data.email.trim());
          autoFilled.customerEmail = true;
        }

        const rawAddr = data.address || "";
        const populatedGeo: GeoAddressData = {
          division: data.division || "",
          district: data.district || "",
          upazila: data.upazila || "",
          union: data.union || "",
          village: data.village || rawAddr,
          fullAddress: rawAddr
        };
        setGeoAddress(populatedGeo);
        setAddress(rawAddr);

        setAutoFilledFields(autoFilled);
        setSearchStatus("found");

        // Check for missing data fields
        const missing: string[] = [];
        if (!data.name?.trim()) missing.push("মাদরাসার নাম");
        if (!data.ownerName?.trim()) missing.push("মুহতামিম/আবেদনকারী");
        if (!data.contactNo?.trim()) missing.push("মোবাইল নম্বর");
        if (!data.division?.trim()) missing.push("বিভাগ");
        if (!data.district?.trim()) missing.push("জেলা");
        if (!data.upazila?.trim()) missing.push("উপজেলা");
        if (!data.village?.trim() && !rawAddr.trim()) missing.push("গ্রাম/যাতায়াত ঠিকানা");

        if (missing.length > 0) {
          setMissingFieldsNotice(`পূর্বের তথ্য পাওয়া গেছে, তবে (${missing.join(", ")}) অনুপস্থিত। অনুগ্রহ করে বাকি তথ্য পূরণ করুন।`);
        }
      } else if (res.status === 404) {
        setSearchStatus("not_found");
        setAutoFilledFields({});
      } else {
        setSearchStatus("error");
        setAutoFilledFields({});
      }
    } catch (e) {
      setSearchStatus("error");
      setAutoFilledFields({});
    } finally {
      setIsLoading(false);
    }
  };

  const validateAndProceed = () => {
    setErrorMsg("");

    const mainParts = [
      geoAddress.village,
      geoAddress.union,
      geoAddress.upazila,
      geoAddress.district,
      geoAddress.division,
    ].filter(Boolean);
    const calculatedMain = mainParts.join(", ");
    const effectiveMainAddress = geoAddress.fullAddress?.trim() || calculatedMain || address.trim();

    const delParts = [
      deliveryAddress.village,
      deliveryAddress.union,
      deliveryAddress.upazila,
      deliveryAddress.district,
      deliveryAddress.division,
    ].filter(Boolean);
    const calculatedDel = delParts.join(", ");
    const effectiveDeliveryAddress = deliveryAddress.fullAddress?.trim() || calculatedDel;

    if (!ownerName.trim()) {
      setErrorMsg("অনুগ্রহ করে মুহতামিম / আবেদনকারীর নাম লিখুন।");
      modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!instituteName.trim()) {
      setErrorMsg("অনুগ্রহ করে মাদরাসা বা প্রতিষ্ঠানের নাম লিখুন।");
      modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!contactNo.trim()) {
      setErrorMsg("অনুগ্রহ করে যোগাযোগ নম্বর (মোবাইল) লিখুন।");
      modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!effectiveMainAddress && !effectiveDeliveryAddress) {
      setErrorMsg("অনুগ্রহ করে মাদরাসা বা ডেলিভারির সম্পূর্ণ ঠিকানা প্রদান করুন।");
      modalBodyRef.current?.scrollTo({ top: 150, behavior: 'smooth' });
      return;
    }
    if (hasSeparateDelivery && !effectiveDeliveryAddress) {
      setErrorMsg("অনুগ্রহ করে ডেলিভারি ঠিকানা (জেলা, উপজেলা বা কুরিয়ার পয়েন্ট) পূরণ করুন।");
      return;
    }
    if (selectedDeliveryOption?.requiresName && !courierOrTransportName.trim()) {
      setErrorMsg(`অনুগ্রহ করে ${selectedDeliveryOption.name}-এর নাম উল্লেখ করুন`);
      modalBodyRef.current?.scrollTo({ top: 400, behavior: 'smooth' });
      return;
    }

    setPaymentStep(true);
    modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitOrder = async () => {
    setIsSubmitting(true);
    setErrorMsg("");
    const isPartialReceipt = paymentOption === 'money_receipt' && receiptVerifyStatus === 'valid' && receiptBalance < grandTotal;
    try {
      if (selectedDeliveryOption?.requiresName && !courierOrTransportName.trim()) {
        throw new Error(`অনুগ্রহ করে ${selectedDeliveryOption.name}-এর নাম উল্লেখ করুন`);
      }
      if (paymentOption === 'pay_now') {
        if (!senderNumber.trim()) throw new Error("যে নম্বর বা অ্যাকাউন্ট থেকে টাকা পাঠিয়েছেন তা লিখুন");
        if (!trxId.trim()) throw new Error("ট্রানজেকশন আইডি (TrxID) প্রদান করুন");
      }
      if (paymentOption === 'money_receipt') {
        if (!receiptNumber.trim()) throw new Error("মানি রিসিট নম্বর প্রদান করুন");
        if (receiptVerifyStatus !== 'valid') throw new Error("অর্ডার দেওয়ার আগে মানি রিসিট যাচাই করুন");
        if (isPartialReceipt) {
          if (!remainingSenderNumber.trim()) throw new Error("বাকি টাকার প্রেরক নম্বর বা অ্যাকাউন্ট লিখুন");
          if (!remainingTrxId.trim()) throw new Error("বাকি টাকার জন্য TrxID প্রদান করুন");
        }
      }

      const isMobileIlhak = ilhak.trim().length === 11 && ilhak.trim().startsWith("01");

      const effectiveAddress = geoAddress.fullAddress || address;
      if (ilhak.trim() && searchStatus !== "found" && !isMobileIlhak) {
        await fetch("/api/madrasa/ilhak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: ilhak,
            name: instituteName,
            ownerName,
            contactNo,
            address: effectiveAddress,
            division: geoAddress.division,
            district: geoAddress.district,
            upazila: geoAddress.upazila,
            union: geoAddress.union,
            village: geoAddress.village,
          }),
        });
      }

      const ilhakText = (ilhak.trim() && !isMobileIlhak) ? ` (ইলহাক: ${ilhak.trim()})` : '';
      const deliveryNote = hasSeparateDelivery && deliveryAddress.fullAddress ? ` | ডেলিভারি ঠিকানা: ${deliveryAddress.fullAddress}` : '';
      const courierNote = selectedDeliveryOption?.requiresName && courierOrTransportName.trim()
        ? ` | [${selectedDeliveryOption.name}: ${courierOrTransportName.trim()}]`
        : ` | [ডেলিভারি মাধ্যম: ${selectedDeliveryOption?.name || selectedDeliveryType}]`;

      const agentTypeLabel = referralAgentInfo?.category === "agent" ? "বই এজেন্ট" : "কেন্দ্র জিম্মাদার";
      const referralNote = referralAgentInfo
        ? ` | [${agentTypeLabel}: ${referralAgentInfo.name} (ফোন: ${referralAgentInfo.phone})${referralAgentInfo.code ? ` (কোড: ${referralAgentInfo.code})` : ""} | কমিশন: ৳${commissionDiscount} (${activeCommissionPercent}%)]`
        : (commissionDiscount > 0 ? ` | [মাদরাসা কমিশন: ৳${commissionDiscount} (${activeCommissionPercent}%)]` : "");

      const items = cart.map(c => ({ productId: c.product.id, quantity: c.qty }));
      const effectiveSenderNumber = paymentOption === "pay_now" ? senderNumber.trim() : (isPartialReceipt ? remainingSenderNumber.trim() : undefined);
      const effectiveTrxId = paymentOption === "pay_now" ? trxId.trim() : (isPartialReceipt ? remainingTrxId.trim() : undefined);
      const effectiveMethodName = selectedMethod?.name || selectedMethod?.provider || "Direct Payment";

      const paymentFeeNote = paymentFee > 0 ? ` | [পেমেন্ট ফি: ${paymentFeePercent}% (+৳${paymentFee})]` : '';

      const res = await fetch("/api/store/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: ownerName,
          customerPhone: contactNo,
          customerEmail: customerEmail.trim() || undefined,
          password: customerPassword.trim() || undefined,
          instituteId: instituteName,
          items,
          notes: `${effectiveAddress}${deliveryNote}${ilhakText}${referralNote}${courierNote}${paymentFeeNote}`,
          paymentOption,
          paymentProvider: paymentOption === "pay_later" ? "বকেয়া (পরে পরিশোধ)" : effectiveMethodName,
          paymentMethod: paymentOption === "pay_later" ? "বকেয়া (পরে পরিশোধ)" : effectiveMethodName,
          promiseDate: paymentOption === "pay_later" ? promiseDate : undefined,
          remainingProvider: isPartialReceipt ? effectiveMethodName : undefined,
          remainingTrxId: isPartialReceipt ? remainingTrxId.trim() : undefined,
          senderNumber: effectiveSenderNumber,
          trxId: effectiveTrxId,
          receiptNumber: paymentOption === "money_receipt" ? receiptNumber.trim() : undefined,
          deliveryOptionType: selectedDeliveryType,
          courierOrTransportName: selectedDeliveryOption?.requiresName ? courierOrTransportName.trim() : undefined,
          deliveryCharge: deliveryCharge,
          discount: commissionDiscount,
          totalAmount: grandTotal,
          totalWeight: totalWeightKg,
          referralAgentCode: referralAgentInfo?.code || referralAgentCode.trim() || undefined,
          referralAgentPhone: referralAgentInfo?.phone || undefined,
          referralCommissionPercent: referralCommissionPercent,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit order");

      onSuccess(data);
      onClose();
    } catch (e: any) {
      setErrorMsg("অর্ডার করতে সমস্যা হয়েছে। " + (e.message || ""));
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg sm:max-w-xl overflow-hidden relative animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col max-h-[92vh]">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
          <div>
            <h2 className="font-bold text-slate-800 text-lg">
              {paymentStep ? "কিভাবে পেমেন্ট করতে চান?" : "অর্ডার নিশ্চিত করুন"}
            </h2>
            <p className="text-xs text-slate-500">
              {paymentStep
                ? "মোবাইল ব্যাংকিং, ব্যাংক অ্যাকাউন্ট অথবা মানি রিসিটের মাধ্যমে পেমেন্ট সম্পন্ন করুন"
                : "মাদরাসা ও ডেলিভারির সঠিক তথ্য প্রদান করুন"}
            </p>
          </div>
          <button onClick={() => onClose({ ilhak, ownerName, instituteName, contactNo, customerEmail, customerPassword, address: geoAddress.fullAddress || address, geoAddress, hasSeparateDelivery, deliveryAddress, searchStatus, paymentStep, autoFilledFields, referralAgentCode, referralAgentInfo, referralCommissionPercent })} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div ref={modalBodyRef} className="p-6 overflow-y-auto flex-1">
          {!paymentStep ? (
            <>
              {errorMsg && <p className="mb-4 text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100 font-bold">{errorMsg}</p>}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">ইলহাক বা মোবাইল নম্বর (পুরাতন তথ্যের জন্য)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ilhak}
                      onChange={(e) => {
                        setIlhak(e.target.value);
                        if (searchStatus !== "idle") {
                          setSearchStatus("idle");
                          setAutoFilledFields({});
                        }
                        if (missingFieldsNotice) setMissingFieldsNotice("");
                      }}
                      placeholder="যেমন: 1234 বা 01XXXXXXXXX"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white text-sm"
                    />
                    <button
                      onClick={searchIlhak}
                      disabled={isLoading || !ilhak.trim()}
                      className="px-4 py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50 flex-shrink-0 text-sm"
                    >
                      {isLoading ? "খুঁজছি..." : "খুঁজুন"}
                    </button>
                  </div>
                  {searchStatus === "found" && (
                    <div className="space-y-1 mt-1.5">
                      <p className="text-xs text-emerald-600 font-medium">✓ {ilhak.trim().length === 11 && ilhak.trim().startsWith("01") ? "মোবাইল নম্বর" : "ইলহাক"} অনুযায়ী পূর্বের তথ্য অটো-ফিল ও সুরক্ষিত (লক) করা হয়েছে!</p>
                      {missingFieldsNotice && (
                        <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium">
                          ⚠️ {missingFieldsNotice}
                        </p>
                      )}
                    </div>
                  )}
                  {searchStatus === "not_found" && <p className="text-xs text-amber-600 mt-1.5 font-medium">⚠ {ilhak.trim().length === 11 && ilhak.trim().startsWith("01") ? "মোবাইল নম্বর" : "ইলহাক"} পাওয়া যায়নি। নতুন তথ্য পূরণ করুন।</p>}
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-slate-700">মুহতামিম / আবেদনকারীর নাম <span className="text-red-500">*</span></label>
                      {autoFilledFields.ownerName && <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">নিবন্ধিত (লক)</span>}
                    </div>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      readOnly={!!autoFilledFields.ownerName}
                      disabled={!!autoFilledFields.ownerName}
                      placeholder="যেমন: মাওলানা মো: আবদুল্লাহ"
                      className={`w-full px-3 py-2 rounded-xl border transition-all text-sm ${autoFilledFields.ownerName
                          ? 'bg-slate-100/90 text-slate-700 border-slate-200 cursor-not-allowed select-none font-medium'
                          : 'bg-slate-50 focus:bg-white border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                        }`}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        মাদরাসা বা প্রতিষ্ঠানের নাম <span className="text-red-500">*</span>
                      </label>
                      {autoFilledFields.instituteName && <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">নিবন্ধিত (লক)</span>}
                    </div>
                    <input
                      type="text"
                      value={instituteName}
                      onChange={(e) => setInstituteName(e.target.value)}
                      readOnly={!!autoFilledFields.instituteName}
                      disabled={!!autoFilledFields.instituteName}
                      placeholder="যেমন: মুহাম্মাদনগর নূরানী ক্যাডেট মাদরাসা"
                      className={`w-full px-3 py-2 rounded-xl border transition-all text-sm font-semibold ${autoFilledFields.instituteName
                          ? 'bg-slate-100/90 text-slate-700 border-slate-200 cursor-not-allowed select-none'
                          : 'bg-slate-50 focus:bg-white border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                        }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-slate-700">মোবাইল নম্বর <span className="text-red-500">*</span></label>
                      {autoFilledFields.contactNo && <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">নিবন্ধিত (লক)</span>}
                    </div>
                    <input
                      type="tel"
                      value={contactNo}
                      onChange={(e) => {
                        const val = e.target.value;
                        setContactNo(val);
                        if (!referralAgentCode && val.replace(/\D/g, '').length >= 10) {
                          lookupReferralAgent(val);
                        }
                      }}
                      onBlur={() => {
                        if (!referralAgentCode && contactNo.replace(/\D/g, '').length >= 10) {
                          lookupReferralAgent(contactNo);
                        }
                      }}
                      readOnly={!!autoFilledFields.contactNo}
                      disabled={!!autoFilledFields.contactNo}
                      placeholder="01XXXXXXXXX"
                      className={`w-full px-3 py-2 rounded-xl border transition-all text-sm ${autoFilledFields.contactNo
                          ? 'bg-slate-100/90 text-slate-700 border-slate-200 cursor-not-allowed select-none font-medium'
                          : 'bg-slate-50 focus:bg-white border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                        }`}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-slate-700">ইমেইল <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span></label>
                      {autoFilledFields.customerEmail && <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">নিবন্ধিত (লক)</span>}
                    </div>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      readOnly={!!autoFilledFields.customerEmail}
                      disabled={!!autoFilledFields.customerEmail}
                      placeholder="user@example.com"
                      className={`w-full px-3 py-2 rounded-xl border transition-all text-sm ${autoFilledFields.customerEmail
                          ? 'bg-slate-100/90 text-slate-700 border-slate-200 cursor-not-allowed select-none'
                          : 'bg-slate-50 focus:bg-white border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                        }`}
                    />
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-primary" />
                    <label className="block text-xs font-bold text-slate-700">
                      অ্যাকাউন্ট পাসওয়ার্ড <span className="text-[11px] text-slate-500 font-normal">(ঐচ্ছিক / লগইনের জন্য)</span>
                    </label>
                  </div>
                  <input
                    type="password"
                    value={customerPassword}
                    onChange={(e) => setCustomerPassword(e.target.value)}
                    placeholder="পাসওয়ার্ড দিন (না দিলে স্বয়ংক্রিয় পাসওয়ার্ড তৈরি হবে)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white text-sm"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    💡 এই তথ্য দিয়ে পরবর্তীতে ওয়েবসাইটে লগইন করে আপনার সব অর্ডার ও তথ্য ট্র্যাক করতে পারবেন।
                  </p>
                </div>

                {/* Geo Cascade Address Selector with Separate Delivery Option (Always Editable) */}
                <div className="pt-2 border-t border-slate-100">
                  <GeoAddressSelector
                    label="মাদরাসার পূর্ণাঙ্গ ঠিকানা *"
                    value={geoAddress}
                    onChange={(newVal) => {
                      setGeoAddress(newVal);
                      setAddress(newVal.fullAddress);
                    }}
                    hasSeparateDelivery={hasSeparateDelivery}
                    onSeparateDeliveryChange={setHasSeparateDelivery}
                    deliveryValue={deliveryAddress}
                    onDeliveryChange={setDeliveryAddress}
                  />
                </div>
              </div>

              {/* ─── KENDRO ZIMADAR / BOOK AGENT REFERRAL SECTION ────────────────── */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-700" />
                      <span>কেন্দ্র জিম্মাদার বা বই এজেন্ট কোড (ঐচ্ছিক)</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-semibold bg-slate-200/70 px-2 py-0.5 rounded">
                      রেফারেন্স
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    কোনো কেন্দ্র জিম্মাদার (K...) বা বই এজেন্ট (A...)-এর মাধ্যমে অর্ডার করলে তাঁর আইডি কোড বা মোবাইল নম্বর লিখুন।
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      value={referralAgentCode}
                      onChange={(e) => {
                        const val = e.target.value;
                        setReferralAgentCode(val);
                        lookupReferralAgent(val);
                      }}
                      placeholder="যেমন: K001, A001 বা মোবাইল নম্বর..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white focus:outline-emerald-600 font-mono"
                    />
                  </div>

                  {referralAgentInfo ? (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in flex-wrap gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>
                          {referralAgentInfo.category === "agent" ? "বই এজেন্ট" : "কেন্দ্র জিম্মাদার"}: {referralAgentInfo.name} ({referralAgentInfo.phone})
                        </span>
                        {referralAgentInfo.code && (
                          <span className="bg-emerald-200/80 text-emerald-950 font-mono text-[10px] px-1.5 py-0.2 rounded font-black">
                            {referralAgentInfo.code}
                          </span>
                        )}
                      </div>
                      <span className="bg-emerald-700 text-white text-[10.5px] px-2 py-0.5 rounded-md font-bold">
                        {referralCommissionPercent}% কমিশন প্রযোজ্য
                      </span>
                    </div>
                  ) : referralAgentCode.trim().length >= 3 ? (
                    <p className="text-[10.5px] text-slate-400">
                      * কোড বা নম্বর মিলিয়ে জিম্মাদার/এজেন্টের নাম স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Delivery Options Selector */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                <label className="block text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  <span>ডেলিভারি মাধ্যম নির্বাচন করুন <span className="text-red-500">*</span></span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {visibleDeliveryOptions.map((d: any) => {
                    const isSelected = selectedDeliveryType === d.type;
                    const isPathaoOrSteadfast = d.type === "pathao" || d.type === "steadfast";
                    const isSelf = d.type === "self";
                    const optCharge = Number(d.charge) || 0;

                    let badgeText = `+৳${optCharge}`;
                    let badgeColor = "text-amber-700 bg-amber-50 border-amber-200";

                    if (isPathaoOrSteadfast) {
                      badgeText = "চার্জ কুরিয়ার বাহককে";
                      badgeColor = "text-emerald-800 bg-emerald-50 border-emerald-200";
                    } else if (isSelf) {
                      badgeText = "চার্জ নাই";
                      badgeColor = "text-blue-800 bg-blue-50 border-blue-200";
                    }

                    return (
                      <button
                        key={d.type}
                        type="button"
                        onClick={() => setSelectedDeliveryType(d.type)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${isSelected
                            ? "border-emerald-700 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-700"
                            : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className={`text-xs font-bold ${isSelected ? "text-emerald-800" : "text-slate-800"}`}>
                            {d.name}
                          </span>
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? "border-emerald-700 bg-emerald-700" : "border-slate-300"
                            }`}>
                            {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </span>
                        </div>
                        <span className={`text-[10.5px] font-bold px-1.5 py-0.5 rounded border inline-block ${badgeColor}`}>
                          {badgeText}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedDeliveryOption?.requiresName && (
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5 animate-in fade-in">
                    <div className="flex items-center justify-between gap-2">
                      <label className="block text-xs font-bold text-amber-950">
                        {selectedDeliveryType === "transport"
                          ? "ট্রান্সপোর্টের নাম উল্লেখ করুন"
                          : selectedDeliveryType === "other_courier"
                            ? "কুরিয়ার সার্ভিসের নাম লিখুন"
                            : `${selectedDeliveryOption.name}-এর নাম লিখুন`}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      {deliveryCharge > 0 && (
                        <span className="text-[10.5px] font-black bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-md">
                          বিলের সাথে +৳{deliveryCharge} যোগ হবে
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={courierOrTransportName}
                      onChange={(e) => setCourierOrTransportName(e.target.value)}
                      placeholder={
                        selectedDeliveryType === "transport"
                          ? "যেমন: দিগন্ত পরিবহন / হানিফ ট্রান্সপোর্ট / সোহাগ পরিবহন"
                          : "যেমন: সুন্দরবন কুরিয়ার / এস এ পরিবহন / করতোয়া কুরিয়ার"
                      }
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-semibold focus:outline-emerald-700 placeholder:text-slate-400"
                    />
                    <p className="text-[10px] text-amber-800">
                      📌 আপনার সুবিধাজনক কুরিয়ার সার্ভিস বা ট্রান্সপোর্টের নাম উল্লেখ করুন যাতে সঠিক মাধ্যমে পার্সেল পাঠানো যায়।
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600">
                  <span>পণ্যের মূল্য (সাবটোটাল):</span>
                  <span className="font-semibold text-slate-800">৳{total.toFixed(2)}</span>
                </div>
                {commissionDiscount > 0 && (
                  <div className="flex items-center justify-between text-xs sm:text-sm text-emerald-800 font-bold bg-emerald-50/80 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                    <span>
                      {referralAgentInfo ? (referralAgentInfo?.category === "agent" ? "বই এজেন্ট" : "কেন্দ্র জিম্মাদার") : "মাদরাসা"} কমিশন ছাড় ({activeCommissionPercent}%):
                    </span>
                    <span>-৳{commissionDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600">
                  <span>
                    ডেলিভারি চার্জ ({selectedDeliveryOption.name}
                    {selectedDeliveryOption.requiresName && courierOrTransportName.trim()
                      ? ` — ${courierOrTransportName.trim()}`
                      : ""}
                    ):
                  </span>
                  <span>
                    {selectedDeliveryOption.type === "pathao" || selectedDeliveryOption.type === "steadfast" ? (
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-200">
                        কুরিয়ার বাহককে দিতে হবে
                      </span>
                    ) : selectedDeliveryOption.type === "self" ? (
                      <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded text-xs border border-blue-200">
                        চার্জ নাই
                      </span>
                    ) : (
                      <span className="font-bold text-amber-700">+৳{deliveryCharge.toFixed(2)}</span>
                    )}
                  </span>
                </div>
                {paymentFee > 0 && (
                  <div className="flex items-center justify-between text-xs sm:text-sm text-amber-950 font-bold bg-amber-50/90 px-2.5 py-1.5 rounded-lg border border-amber-300">
                    <span className="flex items-center gap-1">
                      <span>ব্যাংক/পেমেন্ট প্রসেসিং ফি ({paymentFeePercent}%):</span>
                    </span>
                    <span>+৳{paymentFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-700 text-sm sm:text-base block">সর্বমোট প্রদেয় বিল:</span>
                    <span className="text-[10px] text-slate-400 block">কুরিয়ার ও পার্সেল হিসাবের জন্য</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-black text-emerald-800 font-mono block">৳{grandTotal.toFixed(2)}</span>
                    <span className="text-[11px] font-bold text-slate-500 block -mt-0.5">মোট ওজন: {totalWeightKg} কেজি</span>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
                  <span className="shrink-0 text-base">⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => onClose({ ilhak, ownerName, instituteName, contactNo, customerEmail, customerPassword, address: geoAddress.fullAddress || address, geoAddress, hasSeparateDelivery, deliveryAddress, searchStatus, paymentStep, referralAgentCode, referralAgentInfo, referralCommissionPercent })}
                  className="w-1/2 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all border border-slate-200"
                >
                  আরও পণ্য যোগ করুন
                </button>
                <button
                  type="button"
                  onClick={validateAndProceed}
                  className="w-1/2 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-700/25 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>পেমেন্ট অপশন</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="animate-in slide-in-from-right-4 space-y-4">
              <div className="text-center bg-emerald-50/70 border border-emerald-200/80 rounded-xl py-2.5 px-3">
                <h3 className="font-black text-emerald-950 text-sm sm:text-base">কিভাবে পেমেন্ট করতে চান?</h3>
                <p className="text-[11px] text-emerald-800">পছন্দের মোবাইল ব্যাংকিং, ব্যাংক অ্যাকাউন্ট অথবা মানি রিসিট নির্বাচন করুন</p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <span className="shrink-0 text-sm">⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-3">
                {/* Option 1: Pay Now */}
                <label className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all ${paymentOption === 'pay_now' ? 'border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700' : 'border-slate-200 hover:border-emerald-700/50'}`}>
                  <input
                    type="radio"
                    name="payment_opt"
                    checked={paymentOption === 'pay_now'}
                    onChange={() => setPaymentOption('pay_now')}
                    className="w-4.5 h-4.5 text-emerald-700 focus:ring-emerald-700"
                  />
                  <span className="font-bold text-slate-800 text-sm">সরাসরি পেমেন্ট (মোবাইল ব্যাংকিং / ব্যাংক)</span>
                </label>

                {paymentOption === 'pay_now' && (
                  <div className="pl-2 sm:pl-4 pr-1 pb-2 animate-in fade-in space-y-3">
                    <DynamicPaymentSelector
                      mobileMethods={mobileMethods}
                      bankMethods={bankMethods}
                      selectedPaymentTab={selectedPaymentTab}
                      onSelectTab={setSelectedPaymentTab}
                      selectedMethod={selectedMethod}
                      onSelectMethodId={setSelectedMethodId}
                      payableLabel="সর্বমোট প্রদেয় বিল:"
                      payableAmount={grandTotal}
                    />

                    {/* Sender Number & TrxID Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          প্রেরক নম্বর / A/C <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={senderNumber}
                          onChange={(e) => setSenderNumber(e.target.value)}
                          placeholder="যে নম্বর বা হিসাব থেকে টাকা পাঠিয়েছেন"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-700 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ট্রানজেকশন আইডি (TrxID) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={trxId}
                          onChange={(e) => setTrxId(e.target.value)}
                          placeholder="TrxID / রেফারেন্স নম্বর লিখুন"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-700 text-xs font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Option 2: Money Receipt */}
                <label className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all ${paymentOption === 'money_receipt' ? 'border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700' : 'border-slate-200 hover:border-emerald-700/50'}`}>
                  <input
                    type="radio"
                    name="payment_opt"
                    checked={paymentOption === 'money_receipt'}
                    onChange={() => setPaymentOption('money_receipt')}
                    className="w-4.5 h-4.5 text-emerald-700 focus:ring-emerald-700"
                  />
                  <span className="font-bold text-slate-800 text-sm">মানি রিসিট আছে</span>
                </label>

                {paymentOption === 'money_receipt' && (
                  <div className="pl-2 sm:pl-4 pr-1 pb-2 animate-in fade-in space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        মানি রিসিট নম্বর <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={receiptNumber}
                          onChange={(e) => {
                            setReceiptNumber(e.target.value);
                            if (receiptVerifyStatus !== 'idle') {
                              setReceiptVerifyStatus('idle');
                              setReceiptVerifyMsg('');
                              setReceiptBalance(0);
                            }
                          }}
                          placeholder="Receipt Number"
                          className={`flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:border-emerald-700 text-xs font-semibold transition-all ${receiptVerifyStatus === 'valid' ? 'border-emerald-400 bg-emerald-50' : receiptVerifyStatus === 'invalid' ? 'border-red-400 bg-red-50' : 'border-slate-200'
                            }`}
                        />
                        <button
                          type="button"
                          onClick={verifyReceipt}
                          disabled={receiptVerifyStatus === 'verifying' || !receiptNumber.trim()}
                          className="px-3 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 text-xs shrink-0 cursor-pointer"
                        >
                          {receiptVerifyStatus === 'verifying' ? 'যাচাই...' : 'যাচাই করুন'}
                        </button>
                      </div>
                      {receiptVerifyMsg && (
                        <p className={`text-xs mt-1.5 font-bold ${receiptVerifyStatus === 'valid' ? 'text-emerald-700' : 'text-red-500'}`}>
                          {receiptVerifyMsg}
                        </p>
                      )}
                    </div>

                    {/* Partial Balance Panel — Must Pay Remaining Balance Now */}
                    {receiptVerifyStatus === 'valid' && receiptBalance < grandTotal && (
                      <div className="border border-amber-200 rounded-xl overflow-hidden">
                        <div className="bg-amber-50 p-3 space-y-1.5">
                          <p className="text-xs font-bold text-amber-800">ব্যালান্স বিবরণ:</p>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">মোট বিল:</span>
                            <span className="font-bold text-slate-800">৳{grandTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-emerald-700">রিসিট ব্যালান্স:</span>
                            <span className="font-bold text-emerald-700">-৳{receiptBalance.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs border-t border-amber-200 pt-1.5">
                            <span className="text-red-600 font-bold">বাকি পরিশোধ করতে হবে:</span>
                            <span className="font-black text-red-600">৳{(grandTotal - receiptBalance).toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="bg-white p-3 space-y-3">
                          <p className="text-xs font-bold text-slate-800">
                            বাকি ৳{(grandTotal - receiptBalance).toFixed(2)} পরিশোধের মাধ্যম নির্বাচন করুন:
                          </p>

                          <DynamicPaymentSelector
                            mobileMethods={mobileMethods}
                            bankMethods={bankMethods}
                            selectedPaymentTab={selectedPaymentTab}
                            onSelectTab={setSelectedPaymentTab}
                            selectedMethod={selectedMethod}
                            onSelectMethodId={setSelectedMethodId}
                            payableLabel="বাকি প্রদেয় টাকা:"
                            payableAmount={grandTotal - receiptBalance}
                            compact
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={remainingSenderNumber}
                              onChange={(e) => setRemainingSenderNumber(e.target.value)}
                              placeholder="প্রেরক নম্বর / অ্যাকাউন্ট *"
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-700 text-xs font-semibold"
                            />
                            <input
                              type="text"
                              value={remainingTrxId}
                              onChange={(e) => setRemainingTrxId(e.target.value)}
                              placeholder="বাকি টাকার TrxID *"
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-700 text-xs font-semibold"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => setPaymentOption("pay_now")}
                            className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            মানি রিসিট বাদ দিয়ে সম্পূর্ণ বিল সরাসরি পেমেন্ট করুন
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Option 3: Pay Later (Strictly for Admin only) */}
                {Boolean(currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN')) && (
                  <>
                    <label className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-all ${paymentOption === 'pay_later' ? 'border-amber-600 bg-amber-50/70 ring-1 ring-amber-600' : 'border-slate-200 hover:border-amber-600/50'}`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment_opt"
                          checked={paymentOption === 'pay_later'}
                          onChange={() => setPaymentOption('pay_later')}
                          className="w-4.5 h-4.5 text-amber-600 focus:ring-amber-600"
                        />
                        <div>
                          <span className="font-bold text-slate-800 text-sm">পরে পেমেন্ট করবো (বকেয়া)</span>
                          <p className="text-[11px] text-slate-500">অ্যাডমিন প্রিভিলেজ: কোনো তাৎক্ষণিক TrxID ছাড়াই অর্ডার গ্রহণ করুন</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        শুধুমাত্র অ্যাডমিন
                      </span>
                    </label>

                    {paymentOption === 'pay_later' && (
                      <div className="pl-2 sm:pl-4 pr-1 pb-2 animate-in fade-in space-y-2.5">
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                          <p className="font-bold">⚠️ অ্যাডমিন অনুমোদন প্রযোজ্য:</p>
                          <p className="text-[11px] mt-0.5">এই অর্ডারটি কোনো অগ্রিম টাকা বা TrxID ছাড়াই বকেয়া হিসেবে পেন্ডিং তালিকায় জমা হবে।</p>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            পরিশোধের সম্ভাব্য তারিখ (ঐচ্ছিক)
                          </label>
                          <input
                            type="date"
                            value={promiseDate}
                            onChange={(e) => setPromiseDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-600 text-xs font-semibold"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Summary & Submit Buttons in Step 2 */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">সর্বমোট প্রদেয় বিল</span>
                  <span className="text-base font-black text-emerald-900">৳{grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentStep(false)}
                    className="px-4 py-2 font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors"
                  >
                    ফিরে যান
                  </button>
                  <button
                    type="button"
                    onClick={submitOrder}
                    disabled={isSubmitting}
                    className="px-5 py-2 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md active:scale-95 cursor-pointer disabled:opacity-50 transition-all flex items-center gap-1.5"
                  >
                    {isSubmitting ? "অর্ডার নেওয়া হচ্ছে..." : "অর্ডার সম্পূর্ণ করুন"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [successOrder, setSuccessOrder] = useState<any>(null);
  const [orderFormState, setOrderFormState] = useState<any>(null);
  const [customPasswordInput, setCustomPasswordInput] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaveStatus, setPasswordSaveStatus] = useState<string | null>(null);

  const handleSetPassword = async () => {
    if (!customPasswordInput || customPasswordInput.trim().length < 4) {
      setPasswordSaveStatus("error:পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে");
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await fetch("/api/auth/set-order-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: successOrder?.userAccount?.id,
          phone: successOrder?.userAccount?.phone,
          email: successOrder?.userAccount?.email,
          newPassword: customPasswordInput.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");
      setPasswordSaveStatus("success:পাসওয়ার্ড সফলভাবে সংরক্ষিত হয়েছে!");
      setSuccessOrder((prev: any) => ({
        ...prev,
        userAccount: {
          ...prev.userAccount,
          initialPassword: customPasswordInput.trim(),
        }
      }));
    } catch (err: any) {
      setPasswordSaveStatus(`error:${err.message}`);
    } finally {
      setPasswordSaving(false);
    }
  };

  const printInvoice = (orderToPrint = successOrder) => {
    if (!orderToPrint) return;
    const totalPayable = orderToPrint.totalAmount + (orderToPrint.previousDue || 0);
    const paidAmount = orderToPrint.paidAmount || 0;
    const dueAmount = totalPayable - paidAmount;
    const address = orderToPrint.notes?.replace(/\(ইলহাক:.*?\)/g, '').trim() || '';
    const ilhakMatch = orderToPrint.notes?.match(/\(ইলহাক:\s*([^)]+)\)/);
    const ilhak = ilhakMatch ? ilhakMatch[1].trim() : '';
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <html>
          <head>
            <title>Invoice ${orderToPrint.invoiceId}</title>
            <style>
              body { font-family: sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; color: #1e293b; line-height: 1.5; }
              h1 { color: #16a34a; margin-bottom: 0; }
              .header { border-bottom: 2px solid #16a34a; padding-bottom: 10px; margin-bottom: 20px; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid #16a34a; }
              th { background: #16a34a; color: white; padding: 8px; text-align: left; border: 1px solid #16a34a; }
              td { padding: 8px; border: 1px solid #16a34a; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .info { background: #f8fafc; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
              .totals { width: 300px; margin-left: auto; margin-top: 20px; }
              .totals div { display: flex; justify-content: space-between; padding: 5px 0; }
              .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #16a34a; padding-top: 10px !important; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>নূরানী তালিমুল কুরআন বোর্ড - অনলাইন অর্ডার</h1>
              <p>অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। অনুগ্রহ করে ইনভয়েসটি সংরক্ষণ করুন।</p>
            </div>
            <div class="info">
              <p><strong>ইনভয়েস নং:</strong> ${orderToPrint.invoiceId}</p>
              <p><strong>ক্রেতার নাম:</strong> ${orderToPrint.customerName}</p>
              <p><strong>মোবাইল নাম্বার:</strong> ${orderToPrint.customerPhone || 'N/A'}</p>
              <p><strong>ঠিকানা:</strong> ${orderToPrint.notes?.replace(/\(ইলহাক: 01\d{9}\)/g, '').trim() || 'N/A'}</p>
              <p><strong>তারিখ:</strong> ${new Date(orderToPrint.createdAt).toLocaleDateString('bn-BD')}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th class="text-center" style="width: 45px;">ক্র.নং</th>
                  <th>পণ্যের নাম</th>
                  <th class="text-center" style="width: 75px;">পরিমাণ</th>
                  <th class="text-right" style="width: 95px;">একক মূল্য</th>
                  <th class="text-right" style="width: 105px;">মোট মূল্য</th>
                </tr>
              </thead>
              <tbody>
                ${orderToPrint.items.map((i: any, idx: number) => `
                  <tr>
                    <td class="text-center" style="font-weight: bold; color: #475569;">${String(idx + 1).padStart(2, '0')}</td>
                    <td>${i.product.name}</td>
                    <td class="text-center">${i.quantity}</td>
                    <td class="text-right">${Number(i.unitPrice).toFixed(2)} ৳</td>
                    <td class="text-right">${(i.quantity * i.unitPrice).toFixed(2)} ৳</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="totals">
              <div><span>পণ্যের মোট মূল্য:</span><span>${(orderToPrint.items.reduce((s: number, i: any) => s + (i.quantity * i.unitPrice), 0)).toFixed(2)} ৳</span></div>
              <div style="font-weight: 700;"><span>মোট পার্সেল ওজন:</span><span style="font-weight: 800;">${(orderToPrint.totalWeight || 1.0)} কেজি</span></div>
              <div>
                <span>কুরিয়ার চার্জ (${orderToPrint.courierName || 'পাঠাও কুরিয়ার'}):</span>
                <span>${(orderToPrint.deliveryCharge !== undefined ? orderToPrint.deliveryCharge : Math.max(0, orderToPrint.totalAmount - orderToPrint.items.reduce((s: number, i: any) => s + (i.quantity * i.unitPrice), 0))) > 0 ? `${(orderToPrint.deliveryCharge !== undefined ? orderToPrint.deliveryCharge : Math.max(0, orderToPrint.totalAmount - orderToPrint.items.reduce((s: number, i: any) => s + (i.quantity * i.unitPrice), 0))).toFixed(2)} ৳` : '০.০০ ৳ (ফ্রি)'}</span>
              </div>
              <div style="font-weight:bold; border-top: 1px solid #cbd5e1; padding-top: 6px;"><span>বর্তমান বিল:</span><span>${orderToPrint.totalAmount.toFixed(2)} ৳</span></div>
              ${orderToPrint.previousDue ? `<div><span>পূর্বের বকেয়া:</span><span>${orderToPrint.previousDue.toFixed(2)} ৳</span></div>` : ''}
              <div class="grand-total"><span>সর্বমোট প্রদেয়:</span><span>${(orderToPrint.totalAmount + (orderToPrint.previousDue || 0)).toFixed(2)} ৳</span></div>
            </div>
            <div style="margin-top: 25px; padding: 10px; background: #f0fdf4; border-radius: 6px; border: 1px solid #bbf7d0; font-size: 11px; color: #166534;">
              <strong>🚚 কুরিয়ার ও ডেলিভারি নীতিমালা:</strong> নির্ধারিত ডেলিভারি মাধ্যমে (পাঠাও, স্টীডফাস্ট, নিজস্ব সংগ্রহ, কুরিয়ার বা ট্রান্সপোর্ট) পার্সেল পাঠানো হয়।
            </div>
          </body>
        </html>
      `);
      doc.close();
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => document.body.removeChild(iframe), 2000);
        }, 500);
      };
    }
  };
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubTab, setSelectedSubTab] = useState<string>("");
  const [dbCategories, setDbCategories] = useState<{ id: string; name: string; isClassWise?: boolean; subTabs?: string[] }[]>([]);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "name" | "rating">("default");
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [showOnlyFavourites, setShowOnlyFavourites] = useState(false);
  const [favourites, setFavourites] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Fetch DB Categories for sub-tabs and class-wise configuration
  const fetchDbCategories = React.useCallback(() => {
    fetch(`/api/store/categories?t=${Date.now()}`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setDbCategories(d); })
      .catch(() => { });
  }, []);

  const [commissionSettings, setCommissionSettings] = useState<any>({
    bookRetailCommissionPercent: 0,
    bookMadrasaCommissionPercent: 20,
    bookDefaultAgentCommissionPercent: 20,
  });

  useEffect(() => {
    fetchDbCategories();
    fetch(`/api/store/commissions?t=${Date.now()}`)
      .then(r => r.json())
      .then(d => {
        if (d && typeof d === "object") setCommissionSettings(d);
      })
      .catch(() => {});
  }, [fetchDbCategories]);

  // Current authenticated user
  const [currentUser, setCurrentUser] = useState<{ id?: string; role?: string; email?: string; name?: string; madrasaId?: string } | null>(null);

  // Delivery policy alert modal & banner states
  const [isDeliveryAlertOpen, setIsDeliveryAlertOpen] = useState(false);
  const [deliveryAlertMode, setDeliveryAlertMode] = useState<"first_visit" | "before_order" | "manual">("before_order");
  const [policyTab, setPolicyTab] = useState<"delivery" | "payment" | "return" | "complaint">("delivery");
  const [isDeliveryBannerDismissed, setIsDeliveryBannerDismissed] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  // Read URL query parameters and hash (e.g. ?category=... or ?track=true or #policy-payment)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const catParam = urlParams.get("category");
      if (catParam) {
        setSelectedCategory(catParam);
      }
      const subParam = urlParams.get("sub");
      if (subParam) {
        setSelectedSubTab(subParam);
      }
      if (urlParams.get("track") === "true") {
        setIsTrackModalOpen(true);
      }
      if (urlParams.get("view") === "list") {
        setViewMode("list");
      }

      const hash = (window.location.hash || "").toLowerCase();
      if (hash.includes("payment")) {
        setPolicyTab("payment");
        setDeliveryAlertMode("manual");
        setIsDeliveryAlertOpen(true);
      } else if (hash.includes("return")) {
        setPolicyTab("return");
        setDeliveryAlertMode("manual");
        setIsDeliveryAlertOpen(true);
      } else if (hash.includes("delivery") || hash.includes("policy")) {
        setPolicyTab("delivery");
        setDeliveryAlertMode("manual");
        setIsDeliveryAlertOpen(true);
      } else if (hash.includes("complaint")) {
        setPolicyTab("complaint");
        setDeliveryAlertMode("manual");
        setIsDeliveryAlertOpen(true);
      }
    }
  }, []);

  // Fetch logged in session
  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && !data.error) setCurrentUser(data);
      })
      .catch(() => { });
  }, []);

  const isAgentOrCenter = useMemo(() => {
    if (!currentUser?.id) return false;
    const r = (currentUser.role || "").trim().toUpperCase();
    return r === "AGENT" || r === "CENTER" || r === "EXAM_CENTER" || r === "ADMIN";
  }, [currentUser]);

  const fetchStoreProducts = React.useCallback((silent = false) => {
    if (!silent) setLoading(true);
    fetch(`/api/store/products?t=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
    })
      .then(r => r.json())
      .then(data => {
        const raw = Array.isArray(data) ? data : [];
        const storeOnly = raw.filter((p: Product) => !isQuestionProduct(p));
        setProducts(storeOnly);
        // Sync cached cart product metadata (imageUrl, barcode, price, name, weight)
        setCart(prev => {
          if (prev.length === 0) return prev;
          const byId = new Map(storeOnly.map((p: Product) => [p.id, p]));
          return prev.map(item => {
            const fresh = byId.get(item.product.id);
            return fresh ? { ...item, product: fresh } : item;
          });
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    setIsMounted(true);
    fetchStoreProducts(false);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchStoreProducts(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Load view mode from localStorage (default to card)
    try {
      const savedView = localStorage.getItem("store_view_mode");
      if (savedView === "card" || savedView === "list") {
        setViewMode(savedView);
      } else {
        setViewMode("card");
        localStorage.setItem("store_view_mode", "card");
      }
    } catch { }
    // Load favourites from localStorage
    try {
      const fav = JSON.parse(localStorage.getItem("store_favourites") || "[]");
      setFavourites(new Set(fav));
    } catch { }
    // Load cart from localStorage (filter out any question items)
    try {
      const savedCart = JSON.parse(localStorage.getItem("store_cart") || "[]");
      if (Array.isArray(savedCart) && savedCart.length > 0) {
        const cleanCart = savedCart.filter((i: any) => !isQuestionProduct(i?.product || {}));
        setCart(cleanCart);
      }
    } catch { }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchStoreProducts]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("store_cart", JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  const toggleFav = (id: string) => {
    setFavourites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem("store_favourites", JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const addToCart = (product: Product, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { product, qty }];
    });
  };

  const updateCartQty = (product: Product, qty: number) => {
    setCart(prev => {
      if (qty <= 0) return prev.filter(i => i.product.id !== product.id);
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, qty } : i);
      }
      return [...prev, { product, qty }];
    });
  };

  const handleOpenOrder = () => {
    setIsOrderModalOpen(true);
  };

  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartWeight = cart.reduce((w, i) => {
    const itemWeight = Number(i.product?.weight || (i as any).weight || 0.25);
    return w + itemWeight * (Number(i.qty) || 1);
  }, 0);
  const totalWeightKg = Math.round(cartWeight * 10) / 10;
  const grandTotal = cartTotal;

  const defaultCommissionPercent =
    orderFormState?.referralCommissionPercent ||
    commissionSettings?.bookMadrasaCommissionPercent ||
    20;
  const commissionDiscount = Math.round(cartTotal * (defaultCommissionPercent / 100));
  const totalAfterCommission = Math.max(0, cartTotal - commissionDiscount);

  const allCategories = useMemo(() => {
    const fromProducts = products.flatMap(p =>
      (p.category || "").split(",").map(c => c.trim()).filter(Boolean)
    );
    const fromDb = dbCategories.map(c => c.name.trim()).filter(Boolean);
    const set = new Set([...fromDb, ...fromProducts]);
    const filtered = Array.from(set).filter(cat => !isQuestionProduct({ category: cat }));

    // Priority sorting: 'বই' first, then sort remaining categories based on importance
    const getCategoryPriority = (name: string): number => {
      const n = name.trim().toLowerCase();
      // 1. Pure "বই" (Books) - highest importance
      if (n === "বই" || n === "বইসমূহ" || n === "book" || n === "books") return 1;
      // 2. Book Sets
      if (n === "বই সেট" || n === "বইসেট" || ((n.includes("বই") || n.includes("book")) && n.includes("সেট") && !n.includes("সিলেবাস"))) return 2;
      // 3. Book & Syllabus Set
      if ((n.includes("বই") || n.includes("book")) && (n.includes("সিলেবাস") || n.includes("syllabus"))) return 3;
      // 4. Syllabus
      if (n.includes("সিলেবাস") || n === "syllabus") return 4;
      // 5. Guide / Teacher Guide
      if (n.includes("গাইড") || n.includes("নির্দেশিকা") || n === "guide") return 5;
      // 6. Khata (Exercise Books)
      if (n.includes("খাতা") || n === "khata") return 6;
      // 7. Stationery
      if (n.includes("স্টেশনারি") || n.includes("স্টেশনারী") || n === "stationery") return 7;
      // 8. Posters / Charts
      if (n.includes("পোস্টার") || n.includes("চার্ট")) return 8;
      // 9. Certificates / Forms
      if (n.includes("সনদ") || n.includes("ফরম")) return 9;
      // 10. Cards / ID
      if (n.includes("কার্ড") || n.includes("আইডি")) return 10;
      return 50;
    };

    return filtered.sort((a, b) => {
      const pA = getCategoryPriority(a);
      const pB = getCategoryPriority(b);
      if (pA !== pB) return pA - pB;
      return a.localeCompare(b, "bn");
    });
  }, [products, dbCategories]);

  // Active category configuration from DB
  const activeCategoryConfig = useMemo(() => {
    if (!selectedCategory) return null;
    return dbCategories.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase()) || null;
  }, [selectedCategory, dbCategories]);

  // Products belonging to the selected category (or all products if none selected)
  const categoryScopedProducts = useMemo(() => {
    let list = products.filter(p => !isQuestionProduct(p));
    if (selectedCategory) {
      list = list.filter(p => {
        const productCats = (p.category || "").split(",").map(c => c.trim()).filter(Boolean);
        return productCats.includes(selectedCategory) || (p.category || "").includes(selectedCategory);
      });
    }
    return list;
  }, [products, selectedCategory]);

  // Standard curriculum order rank: প্লে -> নার্সারি -> প্রথম -> দ্বিতীয় -> তৃতীয় -> চতুর্থ -> পঞ্চম ...
  const getClassRank = (rawName: string): number => {
    const text = rawName.trim().toLowerCase();
    if (text.includes("প্লে") || text.includes("play") || text.includes("শিশু")) return 1;
    if (text.includes("নার্সারি") || text.includes("নার্সারী") || text.includes("nursery") || text.includes("কেজি") || text.includes("কে.জি") || text.includes("kg")) return 2;
    if (text.includes("প্রথম") || text.includes("১ম") || text.includes("class 1") || text.includes("class one")) return 3;
    if (text.includes("দ্বিতীয়") || text.includes("দ্বিতীয়") || text.includes("২য়") || text.includes("class 2") || text.includes("class two")) return 4;
    if (text.includes("তৃতীয়") || text.includes("তৃতীয়") || text.includes("৩য়") || text.includes("class 3") || text.includes("class three")) return 5;
    if (text.includes("চতুর্থ") || text.includes("৪র্থ") || text.includes("class 4") || text.includes("class four")) return 6;
    if (text.includes("পঞ্চম") || text.includes("৫ম") || text.includes("class 5") || text.includes("class five")) return 7;
    if (text.includes("মুয়াল্লিম") || text.includes("মুয়াল্লিম")) return 8;
    if (text.includes("হিফয") || text.includes("হিফজ")) return 9;
    return 100;
  };

  // Auto subtabs from classes of products in this category
  const autoClassSubTabs = useMemo(() => {
    const classes = Array.from(
      new Set(
        categoryScopedProducts
          .map(p => (p.className || "").trim())
          .filter(Boolean)
      )
    );

    return classes.sort((a, b) => {
      const rankA = getClassRank(a);
      const rankB = getClassRank(b);
      if (rankA !== rankB) return rankA - rankB;
      return a.localeCompare(b, "bn");
    });
  }, [categoryScopedProducts]);

  // Combined subtabs: Admin custom subtabs + Auto class subtabs
  const availableSubTabs = useMemo(() => {
    const list: string[] = [];
    const seen = new Set<string>();

    // 1. Admin configured custom sub-tabs for this category
    if (activeCategoryConfig?.subTabs && Array.isArray(activeCategoryConfig.subTabs)) {
      activeCategoryConfig.subTabs.forEach(st => {
        const trimmed = String(st).trim();
        if (trimmed && !seen.has(trimmed)) {
          seen.add(trimmed);
          list.push(trimmed);
        }
      });
    }

    // 2. Class subtabs (auto for books or any category with classes or if marked isClassWise)
    autoClassSubTabs.forEach(cls => {
      if (cls && !seen.has(cls)) {
        seen.add(cls);
        list.push(cls);
      }
    });

    // Sort all subtabs according to standard curriculum order (Play -> Nursery -> 1st -> 2nd -> ...)
    return list.sort((a, b) => {
      const rankA = getClassRank(a);
      const rankB = getClassRank(b);
      if (rankA !== rankB) return rankA - rankB;
      return a.localeCompare(b, "bn");
    });
  }, [activeCategoryConfig, autoClassSubTabs]);

  const highestPrice = useMemo(() => products.length > 0 ? Math.max(...products.map(p => p.price)) : 1000, [products]);

  const getProductRating = (id: string) => STAR_RATINGS[id] || { rating: 4 + Math.random(), reviews: Math.floor(Math.random() * 50) + 5 };

  const filtered = useMemo(() => {
    let list = products.filter(p => !isQuestionProduct(p));
    if (search.trim()) {
      const qLower = search.trim().toLowerCase();
      const qEn = bnToEnDigits(qLower);
      list = list.filter(p => {
        const code = getCleanProductCode(p).toLowerCase();
        const codeEn = bnToEnDigits(code);
        return (
          p.name.toLowerCase().includes(qLower) ||
          code.includes(qLower) ||
          codeEn.includes(qEn) ||
          (p.category && p.category.toLowerCase().includes(qLower)) ||
          (p.className && p.className.toLowerCase().includes(qLower))
        );
      });
    }

    // 1. Exclusive Category Filter (Only one active at a time)
    if (selectedCategory) {
      list = list.filter(p => {
        const productCats = (p.category || "").split(",").map(c => c.trim()).filter(Boolean);
        return productCats.includes(selectedCategory) || (p.category || "").includes(selectedCategory);
      });
    }

    // 2. Sub-Tab Filter (Class or Custom Sub-tab)
    if (selectedSubTab) {
      const target = selectedSubTab.trim().toLowerCase();
      const aliases: string[] = [target];
      if (target.includes("১ম") || target.includes("1st")) aliases.push("প্রথম");
      if (target.includes("প্রথম")) aliases.push("১ম");
      if (target.includes("২য়") || target.includes("2nd")) aliases.push("দ্বিতীয়");
      if (target.includes("দ্বিতীয়")) aliases.push("২য়");
      if (target.includes("৩য়") || target.includes("3rd")) aliases.push("তৃতীয়");
      if (target.includes("তৃতীয়")) aliases.push("৩য়");
      if (target.includes("৪র্থ") || target.includes("4th")) aliases.push("চতুর্থ");
      if (target.includes("চতুর্থ")) aliases.push("৪র্থ");
      if (target.includes("৫ম") || target.includes("5th")) aliases.push("পঞ্চম");
      if (target.includes("পঞ্চম")) aliases.push("৫ম");

      list = list.filter(p => {
        const pClass = (p.className || "").trim().toLowerCase();
        const pName = (p.name || "").toLowerCase();
        const pDesc = (p.description || "").toLowerCase();
        const pSubj = (p.subject || "").toLowerCase();
        return aliases.some(alias => (
          pClass === alias ||
          pClass.includes(alias) ||
          pName.includes(alias) ||
          pDesc.includes(alias) ||
          pSubj.includes(alias)
        ));
      });
    }

    if (showOnlyInStock) list = list.filter(p => p.stock > 0);
    if (showOnlyFavourites) list = list.filter(p => favourites.has(p.id));
    if (minPrice) list = list.filter(p => p.price >= parseFloat(minPrice));
    if (maxPrice) list = list.filter(p => p.price <= parseFloat(maxPrice));
    if (ratingFilter > 0) list = list.filter(p => getProductRating(p.id).rating >= ratingFilter);

    if (sortBy === "default") list.sort(compareProductsByCode);
    else if (sortBy === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name, "bn"));
    else if (sortBy === "rating") list.sort((a, b) => getProductRating(b.id).rating - getProductRating(a.id).rating);
    return list;
  }, [products, search, selectedCategory, selectedSubTab, showOnlyInStock, showOnlyFavourites, favourites, minPrice, maxPrice, sortBy, ratingFilter]);

  return (
    <div className="w-full h-screen h-[100dvh] max-h-screen flex flex-col bg-slate-50 overflow-hidden select-none">
      {/* Top Header (Search, Categories & Sub-Tabs) - Pinned Full Width */}
      <div className="bg-white border-b border-slate-200 z-30 shadow-xs shrink-0 flex flex-col">
        <div className="w-full mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-3">
          {/* Back to Home & Title */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2 group cursor-pointer transition-all active:scale-95"
              title="মূল ওয়েবসাইটে ফিরে যান"
            >
              <div className="p-2 sm:p-2.5 bg-emerald-50 group-hover:bg-emerald-100 text-emerald-800 rounded-xl transition-all flex items-center justify-center shrink-0 shadow-2xs border border-emerald-200/80">
                <ArrowLeft className="w-5 h-5 text-emerald-800 group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <h1 className="text-base sm:text-lg md:text-xl font-black text-[#095738] group-hover:text-emerald-900 whitespace-nowrap tracking-tight">
                নূরানী প্রকাশন
              </h1>
            </Link>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="পণ্যের নাম বা আইডি দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>}
            </div>

            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center flex-shrink-0">
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Sort & View Toggle */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 hidden md:block">
              <option value="default">আইডি / ক্রমানুসারে</option>
              <option value="price-asc">মূল্য: কম থেকে বেশি</option>
              <option value="price-desc">মূল্য: বেশি থেকে কম</option>
              <option value="name">নামানুসারে</option>
            </select>

            {/* View Mode Segmented Toggle: কার্ড ভিউ এবং টেবিল ভিউ */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setViewMode("card");
                  try { localStorage.setItem("store_view_mode", "card"); } catch { }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "card"
                    ? "bg-white text-emerald-800 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="কার্ড ভিউ"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>কার্ড ভিউ</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode("list");
                  try { localStorage.setItem("store_view_mode", "list"); } catch { }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white text-emerald-800 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="টেবিল ভিউ"
              >
                <List className="w-4 h-4" />
                <span>টেবিল ভিউ</span>
              </button>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => {
                if (window.innerWidth >= 1024) {
                  setRightSidebarOpen(prev => !prev);
                } else {
                  setCartOpen(true);
                }
              }}
              className="relative p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-xl hover:bg-emerald-100 transition-all flex items-center justify-center flex-shrink-0 active:scale-95 cursor-pointer shadow-2xs"
              title="কার্ট দেখুন"
            >
              <ShoppingCart className="w-5 h-5 text-emerald-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-red-600 text-white font-black text-[11px] rounded-full px-1 flex items-center justify-center shadow-sm animate-scale-in">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Horizontal Category Tabs Row */}
        <div className="w-full mx-auto px-3 sm:px-4 lg:px-6 pb-1.5 overflow-x-auto touch-pan-x overscroll-x-contain scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex items-center gap-1.5 sm:gap-2 w-max px-0.5">
            <button
              type="button"
              onClick={(e) => {
                setSelectedCategory("");
                setSelectedSubTab("");
                scrollTabToCenter(e.currentTarget);
              }}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${!selectedCategory
                  ? 'bg-emerald-700 border-emerald-700 text-white shadow-md scale-102 ring-2 ring-emerald-700/20'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
            >
              সকল
            </button>
            {allCategories.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={(e) => {
                    if (isSelected) {
                      setSelectedCategory("");
                      setSelectedSubTab("");
                    } else {
                      setSelectedCategory(cat);
                      setSelectedSubTab("");
                    }
                    scrollTabToCenter(e.currentTarget);
                  }}
                  className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${isSelected
                      ? 'bg-emerald-700 border-emerald-700 text-white shadow-md scale-102 ring-2 ring-emerald-700/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-Tabs Row (Auto Class-Wise & Admin Sub-Tabs) */}
        {availableSubTabs.length > 0 && (
          <div className="w-full mx-auto px-3 sm:px-4 lg:px-6 pb-2 pt-0.5 overflow-x-auto touch-pan-x overscroll-x-contain scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-center gap-1.5 sm:gap-2 w-max px-0.5">
              <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                <span>সাব-ট্যাব / শ্রেণি:</span>
              </span>
              <button
                type="button"
                onClick={(e) => {
                  setSelectedSubTab("");
                  scrollTabToCenter(e.currentTarget);
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${!selectedSubTab
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-800 hover:bg-slate-50"
                  }`}
              >
                সবগুলো
              </button>
              {availableSubTabs.map(sub => {
                const isSubSelected = selectedSubTab === sub;
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={(e) => {
                      setSelectedSubTab(isSubSelected ? "" : sub);
                      scrollTabToCenter(e.currentTarget);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${isSubSelected
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs ring-1 ring-emerald-600/30"
                        : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-800 hover:bg-slate-50"
                      }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Workspace (Full Screen Fit: Left Items Scroll, Right Cart Fixed) */}
      <div className="w-full flex-1 min-h-0 flex flex-col lg:flex-row bg-slate-50 items-stretch px-2 sm:px-4 lg:px-6 py-2 gap-3 overflow-hidden">

        {/* Main Products Section - Full Height Internal Smooth Scroll */}
        <div className="flex-1 min-w-0 h-full overflow-y-auto drawer-scroll flex flex-col overscroll-contain pr-0.5">
          {/* Notice Banner */}
          {isAgentOrCenter && !isDeliveryBannerDismissed && (
            <div className="mb-3.5 p-3 sm:p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/70 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-sm flex-shrink-0 animate-in fade-in">
              <div className="flex items-start sm:items-center gap-2.5 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <span className="font-bold text-emerald-800">বই ও প্রকাশনা ডেলিভারি:</span> অর্ডার করার সময় আপনার সুবিধাজনক মাধ্যম (<strong className="text-slate-900">পাঠাও, স্টিডফাস্ট, নিজস্ব সংগ্রহ, কুরিয়ার বা ট্রান্সপোর্ট</strong>) নির্বাচন করতে পারবেন।
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => {
                    setDeliveryAlertMode("manual");
                    setIsDeliveryAlertOpen(true);
                  }}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-white/80 hover:bg-white px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs transition-colors"
                >
                  বিস্তারিত
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeliveryBannerDismissed(true)}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-black/5 flex items-center justify-center transition-colors"
                  title="বিজ্ঞপ্তি বন্ধ করুন"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Products Display Area */}
          {viewMode === "card" ? (
            <div className={`w-full ${cart.length > 0 ? "pb-28 lg:pb-16" : "pb-16 lg:pb-10"}`}>
              {!loading && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                  <Package className="w-16 h-16 mb-4 text-slate-200" />
                  <p className="text-lg font-bold">কোনো পণ্য পাওয়া যায়নি</p>
                  <p className="text-sm mt-1">অনুসন্ধান বা ফিল্টার পরিবর্তন করুন</p>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-4.5">
                {loading ? Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse flex flex-col p-3 gap-2.5 shadow-2xs">
                    <div className="w-full aspect-[4/3] bg-slate-100 rounded-xl" />
                    <div className="h-4 bg-slate-100 rounded w-3/4 mt-1" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-8 bg-slate-100 rounded w-full mt-auto" />
                  </div>
                )) : filtered.map(product => {
                  const r = getProductRating(product.id);
                  const isFav = favourites.has(product.id);
                  const cartItem = cart.find(c => c.product.id === product.id);
                  const cartQty = cartItem ? cartItem.qty : 0;
                  const productCode = getCleanProductCode(product);
                  const theme = getProductColorTheme(product);

                  return (
                    <div
                      key={product.id}
                      className={`group ${theme.cardBg} rounded-2xl sm:rounded-3xl border ${theme.cardBorder} ${theme.cardHoverBorder} ${theme.cardShadow} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden relative`}
                    >
                      {/* Image Area - Pure white background */}
                      <div
                        onClick={() => setDetailProduct(product)}
                        className="relative bg-white border-b border-slate-100 w-full aspect-[4/3] sm:aspect-[4/3.2] flex items-center justify-center p-3 sm:p-3.5 overflow-hidden cursor-pointer"
                      >
                        {/* Book Image */}
                        <div className="relative z-10 w-full h-full flex items-center justify-center">
                          <ProductImage
                            src={product.imageUrl}
                            alt={product.name}
                            imgClassName="max-h-full max-w-full object-contain rounded-md group-hover:scale-105 transition-transform duration-300"
                            iconClassName="w-12 h-12 text-slate-300 group-hover:scale-105 transition-transform"
                          />
                        </div>

                        {/* Category pill */}
                        {product.category && (
                          <span className="absolute bottom-2 left-2 text-[9.5px] sm:text-[10px] font-bold text-slate-700 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/80 shadow-2xs z-20 max-w-[calc(100%-16px)] truncate">
                            {product.category}
                          </span>
                        )}

                        {/* Favorite button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFav(product.id);
                          }}
                          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all z-20 cursor-pointer ${isFav
                              ? "bg-red-50 text-red-500 shadow-sm border border-red-200"
                              : "bg-white/90 backdrop-blur-md text-slate-400 hover:text-red-500 hover:bg-white border border-white/80 opacity-0 group-hover:opacity-100 shadow-2xs"
                            }`}
                          title={isFav ? "পছন্দের তালিকা থেকে সরান" : "পছন্দের তালিকায় রাখুন"}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-current" : ""}`} />
                        </button>
                      </div>

                      {/* Content Area - clean bottom details distinct from coverBg */}
                      <div className={`p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-2.5 ${theme.detailsBg}`}>
                        <div className="space-y-1">
                          <h3
                            onClick={() => setDetailProduct(product)}
                            className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors cursor-pointer"
                            title={product.name}
                          >
                            {product.name}
                          </h3>

                          {/* ID below title: simple clean text, no card or border */}
                          <div className="flex items-center gap-1.5 flex-wrap text-[11px] sm:text-xs text-slate-500 font-medium">
                            {productCode && (
                              <span className="font-mono text-slate-500">
                                আইডি: {productCode}
                              </span>
                            )}
                            {productCode && product.className && (
                              <span className="text-slate-300">•</span>
                            )}
                            {product.className && (
                              <span className="text-slate-500 truncate">
                                {product.className}{product.subject ? ` (${product.subject})` : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price & Horizontal Quantity Controls */}
                        <div className="pt-2 border-t border-slate-100/90 space-y-2 mt-auto">
                          <div className="flex items-baseline justify-between">
                            <span className="text-base sm:text-lg font-black text-emerald-800 font-mono tracking-tight">
                              ৳{product.price}
                            </span>
                            {product.unit && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                /{product.unit}
                              </span>
                            )}
                          </div>

                          {/* Horizontal + and - Quantity Stepper */}
                          {cartQty > 0 ? (
                            <div
                              className="flex items-center justify-between w-full bg-slate-50 border border-slate-200/90 rounded-xl p-0.5 shadow-2xs"
                              onClick={e => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => updateCartQty(product, cartQty - 1)}
                                className="w-7 h-7 sm:w-8 sm:h-8 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded-lg font-bold text-sm sm:text-base flex items-center justify-center border border-slate-200/80 shadow-2xs transition-all active:scale-90 cursor-pointer"
                                title="পরিমাণ কমান"
                              >
                                −
                              </button>
                              <EditableQtyInput
                                value={cartQty}
                                onChange={(val) => updateCartQty(product, val)}
                                onRemove={() => updateCartQty(product, 0)}
                                className="w-10 sm:w-12 h-7 sm:h-8 text-center text-xs sm:text-sm font-black text-slate-900 font-mono bg-white border border-slate-200/80 rounded-lg outline-none focus:ring-1 focus:ring-slate-400"
                              />
                              <button
                                type="button"
                                onClick={() => updateCartQty(product, cartQty + 1)}
                                className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-sm sm:text-base flex items-center justify-center shadow-2xs transition-all active:scale-90 cursor-pointer"
                                title="পরিমাণ বাড়ান"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product);
                              }}
                              className="w-full py-1.5 sm:py-2 px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-2xs shadow-emerald-700/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>কার্টে যোগ করুন</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className={`w-full flex-1 flex flex-col ${cart.length > 0 ? "pb-28 lg:pb-16" : "pb-16 lg:pb-10"}`}>
              {/* LIST VIEW */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full flex flex-col">
                {/* Compact Top Header & Action Bar */}
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-b border-emerald-200/80 px-3.5 py-2.5 flex items-center justify-between gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-black text-emerald-800 text-xs sm:text-sm md:text-base truncate">বই ও স্টেশনারি তালিকা</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 justify-end">
                    <div className="flex flex-col items-end bg-white border border-emerald-300/80 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xl shadow-2xs">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] sm:text-xs font-bold text-slate-700">সর্বমোট:</span>
                        <span className="text-xs sm:text-sm md:text-base font-black text-emerald-800 font-mono">৳{cartTotal.toFixed(2)}</span>
                      </div>
                      {cart.length > 0 && (
                        <span className="text-[9.5px] font-bold text-slate-500 leading-tight">মোট ওজন: {totalWeightKg} কেজি</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenOrder}
                      className="px-3.5 py-1.5 bg-[#2d3282] hover:bg-[#232766] text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95 flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>বিলে যুক্ত করুন</span>
                    </button>
                  </div>
                </div>

                {/* Table Area: 100% width on mobile without horizontal scrollbars, full columns fit smoothly */}
                <div className="w-full overflow-x-hidden sm:overflow-x-auto touch-pan-y">
                  <table className="w-full table-fixed sm:table-auto text-left border-collapse">
                    <thead className="bg-[#2f8c5b] text-white">
                      <tr className="bg-[#2f8c5b] text-white text-xs sm:text-sm">
                        <th className="p-2.5 font-bold text-center border-r border-white/20 w-14 sm:w-20 hidden sm:table-cell bg-[#2f8c5b]">ছবি</th>
                        <th className="p-2.5 font-bold text-center border-r border-white/20 w-20 hidden sm:table-cell bg-[#2f8c5b]">আইডি</th>
                        <th className="p-2 sm:p-3 font-bold text-left border-r border-white/20 bg-[#2f8c5b]">পণ্যের নাম ও দর</th>
                        <th className="p-2.5 font-bold text-center border-r border-white/20 w-24 hidden sm:table-cell bg-[#2f8c5b]">ক্যাটাগরি</th>
                        <th className="p-2.5 sm:p-3 font-bold text-center border-r border-white/20 w-20 sm:w-28 hidden sm:table-cell bg-[#2f8c5b]">দর (৳)</th>
                        <th className="p-1 sm:p-3 font-bold text-center border-r border-white/20 w-[85px] sm:w-44 bg-[#2f8c5b]">পরিমাণ</th>
                        <th className="p-1 sm:p-3 font-bold text-right pr-1.5 sm:pr-6 w-[62px] sm:w-32 bg-[#2f8c5b]">মোট (৳)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {!loading && filtered.length === 0 && (
                        <tr>
                          <td colSpan={7}>
                            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                              <Package className="w-16 h-16 mb-4 text-slate-200" />
                              <p className="text-lg font-bold">কোনো পণ্য পাওয়া যায়নি</p>
                              <p className="text-sm mt-1">অনুসন্ধান বা ফিল্টার পরিবর্তন করুন</p>
                            </div>
                          </td>
                        </tr>
                      )}
                      {loading ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b border-slate-100 animate-pulse">
                          <td colSpan={7} className="p-4"><div className="h-8 bg-slate-100 rounded w-full" /></td>
                        </tr>
                      )) : filtered.map((product, index) => {
                        const cartItem = cart.find(c => c.product.id === product.id);
                        return (
                          <ListProductRow
                            key={product.id} product={product} index={index}
                            cartQty={cartItem ? cartItem.qty : 0}
                            updateCartQty={updateCartQty} setDetailProduct={setDetailProduct}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Cart (Full Height Fit on Desktop/Laptops >= 1024px) */}
        <aside className={`
          hidden lg:flex flex-col shrink-0 transition-all duration-300 ease-in-out bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full
          ${rightSidebarOpen ? "w-80 2xl:w-[330px] opacity-100" : "w-0 border-l-0 opacity-0 overflow-hidden"}
        `}>
          <div className="flex flex-col h-full w-80 2xl:w-[330px] shrink-0 min-h-0 overflow-hidden relative">
            {/* Header */}
            <div className="flex-shrink-0 px-3.5 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10">
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-emerald-700" />
                <span>আমার কার্ট</span>
              </h3>
              {cart.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                    {cart.reduce((a, c) => a + c.qty, 0)} টি
                  </span>
                  <button
                    onClick={() => setCart([])}
                    title="কার্ট খালি করুন"
                    className="text-[10.5px] text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    খালি করুন
                  </button>
                </div>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 min-h-0 overflow-y-auto p-2 flex flex-col space-y-1.5 overscroll-contain">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                  <ShoppingBag className="w-8 h-8 mb-1.5 text-slate-200" />
                  <p className="font-medium text-xs">কার্ট খালি আছে</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {cart.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-2 p-1.5 sm:p-2 bg-white border border-slate-200/70 hover:border-emerald-300 rounded-xl shadow-2xs transition-all items-center"
                    >
                      {/* Thumbnail */}
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-100">
                        <ProductImage
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          imgClassName="w-full h-full object-contain p-0.5"
                          iconClassName="w-4 h-4 text-slate-300"
                        />
                      </div>

                      {/* Info & Controls */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-1">
                          <p className="font-bold text-slate-900 text-xs truncate leading-tight">
                            {item.product.name}
                          </p>
                          <button
                            onClick={() => setCart(prev => prev.filter(c => c.product.id !== item.product.id))}
                            className="text-slate-300 hover:text-red-500 transition-colors p-0.5 rounded hover:bg-red-50 shrink-0 cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>

                        <p className="text-[9.5px] text-slate-400 truncate -mt-0.5 mb-1">
                          {item.product.category}
                          {item.product.className && <span className="ml-1 text-slate-500 font-medium">({item.product.className})</span>}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-emerald-800 font-mono">
                            ৳{(item.product.price * item.qty).toFixed(2)}
                          </span>
                          <div className="flex items-center gap-1 bg-slate-100/90 rounded-lg p-0.5 border border-slate-200/80 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.product, Math.max(1, item.qty - 1))}
                              className="w-7 h-7 bg-white hover:bg-slate-200 text-slate-700 rounded-md font-bold text-base flex items-center justify-center border border-slate-200/80 shadow-2xs transition-all active:scale-90 cursor-pointer"
                              title="পরিমাণ কমান"
                            >−</button>
                            <EditableQtyInput
                              value={item.qty}
                              onChange={(val) => updateCartQty(item.product, val)}
                              className="w-10 h-7 text-center text-sm font-black text-slate-900 font-mono bg-white border border-slate-200/80 rounded-md outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.product, item.qty + 1)}
                              className="w-7 h-7 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md font-bold text-base flex items-center justify-center shadow-2xs transition-all active:scale-90 cursor-pointer"
                              title="পরিমাণ বাড়ান"
                            >+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sticky Bottom Footer: Summary & Checkout Button */}
            {cart.length > 0 && (
              <div className="sticky bottom-0 z-20 mt-auto flex-shrink-0 p-2 sm:p-2.5 border-t border-slate-200 bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.08)] space-y-2">
                <div className="space-y-1">
                  {/* Row 1: Bill Total (Large, exactly as it is now) */}
                  <div className="flex justify-between text-slate-800 items-baseline">
                    <div>
                      <span className="font-bold text-xs block text-slate-700">বিলের মোট টাকা</span>
                      <span className="text-[9px] text-slate-400">ডেলিভারি চার্জ ছাড়া</span>
                    </div>
                    <span className="text-base sm:text-lg font-black text-emerald-800 font-mono">৳{cartTotal.toFixed(2)}</span>
                  </div>

                  {/* Row 2: After Commission (Small) */}
                  <div className="flex justify-between items-center text-emerald-700">
                    <span className="text-[10.5px] font-semibold">কমিশন বাদে মোট টাকা ({defaultCommissionPercent}%):</span>
                    <span className="text-xs font-bold font-mono">৳{totalAfterCommission.toFixed(2)}</span>
                  </div>

                  {/* Row 3: Total Weight (Small) */}
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="text-[9.5px] font-medium">মোট পার্সেল ওজন:</span>
                    <span className="text-[10px] font-bold font-mono">{totalWeightKg} কেজি</span>
                  </div>
                </div>

                <button
                  onClick={handleOpenOrder}
                  className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-700/20 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>অর্ডার করুন</span>
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile / Tablet Floating Sticky Bottom Bar (Glassmorphic) */}
      {!cartOpen && cart.length > 0 && (
        <div className="lg:hidden fixed bottom-3 left-3 right-3 sm:left-6 sm:right-6 z-40 animate-in slide-in-from-bottom-4 duration-200">
          <div className="bg-slate-900/65 backdrop-blur-xl saturate-180 text-white rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.35)] border border-white/20 ring-1 ring-white/10 p-2.5 sm:p-3 flex items-center justify-between gap-2.5">
            {/* Left: Cart Info / Click to Open Drawer */}
            <div
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
            >
              <div className="relative w-10 h-10 rounded-xl bg-emerald-600/90 backdrop-blur-md text-white flex items-center justify-center shrink-0 shadow-inner border border-white/20">
                <ShoppingBag className="w-5 h-5 drop-shadow-xs" />
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white font-black text-[10px] rounded-full px-1 flex items-center justify-center border-2 border-slate-900 shadow-sm">
                  {cartCount}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-xs sm:text-sm font-black text-white font-mono leading-tight drop-shadow-xs">
                    ৳{cartTotal.toFixed(2)}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-300">
                    • কমিশন বাদে: ৳{totalAfterCommission.toFixed(2)}
                  </span>
                  <span className="text-[9.5px] font-medium text-slate-300">
                    • {totalWeightKg} কেজি
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-emerald-100/80 truncate">
                  {cart.length} আইটেম ({cartCount} টি) • কার্ট দেখতে চাপুন
                </p>
              </div>
            </div>

            {/* Right: Actions (Cart View + Order Now) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="px-2.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold text-xs backdrop-blur-md transition-all active:scale-95 cursor-pointer hidden sm:flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>কার্ট</span>
              </button>

              <button
                type="button"
                onClick={handleOpenOrder}
                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-xs sm:text-sm transition-all shadow-md shadow-emerald-500/30 backdrop-blur-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>অর্ডার করুন</span>
                <ChevronRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Detail Modal */}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onAddToCart={addToCart}
          isFav={favourites.has(detailProduct.id)}
          onToggleFav={() => toggleFav(detailProduct.id)}
          cartQty={cart.find(c => c.product.id === detailProduct.id)?.qty || 0}
          onUpdateQty={(q) => updateCartQty(detailProduct, q)}
        />
      )}

      {/* Mobile Bottom Sheet Cart Drawer (Opens from below) */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end xl:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
            onClick={() => setCartOpen(false)}
          />

          {/* Bottom Sheet Modal Panel */}
          <div className="relative w-full max-w-xl mx-auto max-h-[85dvh] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 border-t border-slate-200/80 z-10 pb-2">
            {/* Grab Handle */}
            <div className="pt-2.5 pb-1 flex justify-center shrink-0 cursor-grab active:cursor-grabbing" onClick={() => setCartOpen(false)}>
              <div className="w-12 h-1.5 bg-slate-300 hover:bg-slate-400 rounded-full transition-colors" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800 leading-none">আমার কার্ট</h2>
                  {cart.length > 0 && (
                    <span className="text-[10px] text-slate-500 font-medium">
                      {cart.reduce((a, c) => a + c.qty, 0)} টি পণ্য যোগ করা হয়েছে
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    title="কার্ট খালি করুন"
                    className="text-[11px] text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    খালি করুন
                  </button>
                )}
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-full transition-colors"
                  title="বন্ধ করুন"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col space-y-2 overscroll-contain">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <ShoppingBag className="w-12 h-12 mb-2 text-slate-200" />
                  <p className="font-bold text-sm">কার্ট খালি আছে</p>
                  <p className="text-xs text-slate-400 mt-0.5">পণ্য যোগ করতে তালিকায় যান</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-2.5 p-2 bg-white border border-slate-200/80 rounded-2xl shadow-2xs items-center"
                    >
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-slate-100">
                        <ProductImage
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          imgClassName="w-full h-full object-contain p-1"
                          iconClassName="w-5 h-5 text-slate-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-1">
                          <p className="font-bold text-slate-900 text-xs truncate leading-tight">
                            {item.product.name}
                          </p>
                          <button
                            onClick={() => setCart(prev => prev.filter(c => c.product.id !== item.product.id))}
                            className="text-slate-300 hover:text-red-500 transition-colors p-0.5 rounded hover:bg-red-50 shrink-0"
                            title="মুছে ফেলুন"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate -mt-0.5 mb-1">
                          {item.product.category}
                          {item.product.className && <span className="ml-1 text-slate-500 font-medium">({item.product.className})</span>}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-emerald-800 font-mono">
                            ৳{(item.product.price * item.qty).toFixed(2)}
                          </span>
                          <div className="flex items-center gap-1 bg-slate-100/90 rounded-xl p-0.5 border border-slate-200/80 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.product, Math.max(1, item.qty - 1))}
                              className="w-7 h-7 bg-white hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-base flex items-center justify-center border border-slate-200/80 shadow-2xs transition-all active:scale-90"
                              title="পরিমাণ কমান"
                            >−</button>
                            <EditableQtyInput
                              value={item.qty}
                              onChange={(val) => updateCartQty(item.product, val)}
                              className="w-10 h-7 text-center text-sm font-black text-slate-900 font-mono bg-white border border-slate-200/80 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.product, item.qty + 1)}
                              className="w-7 h-7 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-base flex items-center justify-center shadow-2xs transition-all active:scale-90"
                              title="পরিমাণ বাড়ান"
                            >+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Sticky Checkout Footer */}
            {cart.length > 0 && (
              <div className="p-3 sm:p-4 border-t border-slate-200 bg-white/95 backdrop-blur-xs shrink-0 space-y-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
                <div className="space-y-1">
                  {/* Row 1: Bill Total (Large) */}
                  <div className="flex justify-between text-slate-800 items-baseline">
                    <div>
                      <span className="font-bold text-xs block text-slate-700">বিলের মোট টাকা</span>
                      <span className="text-[10px] text-slate-400">ডেলিভারি চার্জ ছাড়া</span>
                    </div>
                    <span className="text-lg font-black text-emerald-800 font-mono">৳{cartTotal.toFixed(2)}</span>
                  </div>

                  {/* Row 2: After Commission (Small) */}
                  <div className="flex justify-between items-center text-emerald-700">
                    <span className="text-[11px] font-semibold">কমিশন বাদে মোট টাকা ({defaultCommissionPercent}%):</span>
                    <span className="text-xs font-bold font-mono">৳{totalAfterCommission.toFixed(2)}</span>
                  </div>

                  {/* Row 3: Total Weight (Small) */}
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="text-[10px] font-medium">মোট পার্সেল ওজন:</span>
                    <span className="text-[10.5px] font-bold font-mono">{totalWeightKg} কেজি</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCartOpen(false);
                    handleOpenOrder();
                  }}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-700/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>অর্ডার করুন</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delivery Policy Alert Modal (First visit, Before order, or Details) */}
      <DeliveryPolicyAlertModal
        isOpen={isDeliveryAlertOpen}
        mode={deliveryAlertMode}
        cartTotal={cartTotal}
        initialTab={policyTab}
        onClose={() => setIsDeliveryAlertOpen(false)}
        onProceedToOrder={() => {
          setIsDeliveryAlertOpen(false);
          setIsOrderModalOpen(true);
        }}
      />

      {/* Standalone Order Tracking Modal triggered from URL or Submenu */}
      <TrackOrderModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
      />

      {isOrderModalOpen && (
        <OrderFormModal
          currentUser={currentUser}
          initialState={orderFormState}
          commissionSettings={commissionSettings}
          onClose={(savedState) => {
            if (savedState) setOrderFormState(savedState);
            setIsOrderModalOpen(false);
          }}
          total={cartTotal}
          cart={cart}
          onSuccess={(data) => {
            setSuccessOrder(data);
            setCart([]);
            setOrderFormState(null); // clear state after success so the next order starts fresh
            setIsOrderModalOpen(false);
            setCartOpen(false);
          }} />
      )}

      {/* Success Invoice & Tracking Modal */}
      {successOrder && (
        <TrackOrderModal
          isOpen={Boolean(successOrder)}
          onClose={() => {
            setSuccessOrder(null);
            setCustomPasswordInput("");
            setPasswordSaveStatus(null);
          }}
          initialInvoiceId={successOrder.invoiceId}
          initialOrder={successOrder}
          isNewOrder={true}
        />
      )}
    </div>
  );
}
