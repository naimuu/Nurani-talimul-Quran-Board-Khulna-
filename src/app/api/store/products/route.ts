import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import * as jose from "jose";

async function verifyAdmin() {
  const token = cookies().get("auth_token")?.value;
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "nurani_board_khulna_secret_key_2024"
    );
    const { payload } = await jose.jwtVerify(token, secret);
    return String(payload.role || "").toUpperCase() === "ADMIN";
  } catch {
    return false;
  }
}

const bnToEnDigits = (str: string) => {
  const map: Record<string, string> = {
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
    "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
  };
  return str.replace(/[০-৯]/g, (m) => map[m] || m);
};

function cleanStoreProduct(p: any) {
  if (!p) return p;
  const rawBarcode = p.barcode ? String(p.barcode).trim() : "";
  const cleanBarcode = rawBarcode.startsWith("__NO_BARCODE_") ? "" : rawBarcode;
  const cleanImage = p.imageUrl && String(p.imageUrl).trim() ? String(p.imageUrl).trim() : null;
  return {
    ...p,
    barcode: cleanBarcode,
    imageUrl: cleanImage,
  };
}

function compareProductsByCode(a: any, b: any): number {
  const codeA = a.barcode ? bnToEnDigits(String(a.barcode).trim()) : "";
  const codeB = b.barcode ? bnToEnDigits(String(b.barcode).trim()) : "";

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

  // Fallback: stable chronological order
  const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  return timeA - timeB;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const products = await (prisma as any).storeProduct.findMany({
      orderBy: { createdAt: "asc" },
    });

    const cleanedProducts = products
      .filter((p: any) => p.visibility !== "archived" && p.visibility !== "academic")
      .map(cleanStoreProduct)
      .sort(compareProductsByCode);

    return NextResponse.json(cleanedProducts, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const {
      name,
      category,
      price,
      stock,
      unit,
      imageUrl,
      barcode,
      className,
      description,
      weight,
    } = body;

    const parsedPrice = Number(price);
    const parsedStock = Number(stock) || 0;
    const parsedWeight =
      weight !== undefined && weight !== null && !isNaN(Number(weight))
        ? Number(weight)
        : 0.25;

    if (!name || !category || isNaN(parsedPrice)) {
      return NextResponse.json(
        { error: "পণ্যের সঠিক নাম, ক্যাটাগরি এবং মূল্য প্রদান করুন" },
        { status: 400 }
      );
    }

    const trimmedBarcode =
      barcode !== undefined && barcode !== null ? String(barcode).trim() : "";
    const hasCustomBarcode =
      trimmedBarcode.length > 0 && !trimmedBarcode.startsWith("__NO_BARCODE_");

    if (hasCustomBarcode) {
      const existingList = await (prisma as any).storeProduct.findMany({
        where: { barcode: trimmedBarcode },
      });

      for (const existing of existingList) {
        if (existing.visibility === "archived" || existing.visibility === "academic") {
          await (prisma as any).storeProduct.update({
            where: { id: existing.id },
            data: {
              barcode: `__NO_BARCODE_archived_${Date.now()}_${Math.random()}__`,
            },
          });
        } else {
          return NextResponse.json(
            {
              error: `প্রোডাক্ট আইডি "${trimmedBarcode}" ইতিমধ্যে "${existing.name}" পণ্যে ব্যবহৃত হয়েছে। অনুগ্রহ করে ভিন্ন আইডি দিন।`,
            },
            { status: 400 }
          );
        }
      }
    }

    const cleanImageUrl =
      typeof imageUrl === "string" && imageUrl.trim() ? imageUrl.trim() : null;

    const product = await (prisma as any).storeProduct.create({
      data: {
        name: String(name).trim(),
        category: String(category).trim(),
        price: parsedPrice,
        stock: parsedStock,
        unit: unit ? String(unit).trim() : "টি",
        imageUrl: cleanImageUrl,
        barcode: hasCustomBarcode
          ? trimmedBarcode
          : `__NO_BARCODE_${Date.now()}_${Math.random()}__`,
        className: className ? String(className).trim() : null,
        description: description ? String(description).trim() : null,
        weight: parsedWeight,
      },
    });

    return NextResponse.json(cleanStoreProduct(product));
  } catch (error: any) {
    console.error("Failed to create product:", error);
    return NextResponse.json(
      { error: error.message || "পণ্য সংরক্ষণ করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
