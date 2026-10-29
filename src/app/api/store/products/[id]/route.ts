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

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await (prisma as any).storeProduct.findUnique({
      where: { id: params.id },
    });
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(cleanStoreProduct(product));
  } catch (error: any) {
    console.error("GET Product Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const data: Record<string, unknown> = {};

    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.category !== undefined) data.category = String(body.category).trim();

    if (body.price !== undefined) {
      const parsedPrice = Number(body.price);
      if (isNaN(parsedPrice)) {
        return NextResponse.json(
          { error: "সঠিক মূল্য প্রদান করুন" },
          { status: 400 }
        );
      }
      data.price = parsedPrice;
    }

    if (body.stock !== undefined) {
      data.stock = Number(body.stock) || 0;
    }

    if (body.unit !== undefined) data.unit = body.unit ? String(body.unit).trim() : "টি";

    if (body.imageUrl !== undefined) {
      data.imageUrl =
        typeof body.imageUrl === "string" && body.imageUrl.trim()
          ? body.imageUrl.trim()
          : null;
    }

    if (body.barcode !== undefined) {
      const trimmedBarcode =
        body.barcode !== null ? String(body.barcode).trim() : "";
      const hasCustomBarcode =
        trimmedBarcode.length > 0 && !trimmedBarcode.startsWith("__NO_BARCODE_");

      if (hasCustomBarcode) {
        const existingList = await (prisma as any).storeProduct.findMany({
          where: {
            barcode: trimmedBarcode,
            id: { not: params.id },
          },
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
        data.barcode = trimmedBarcode;
      } else {
        data.barcode = `__NO_BARCODE_${Date.now()}_${Math.random()}__`;
      }
    }

    if (body.className !== undefined) {
      data.className = body.className ? String(body.className).trim() : null;
    }
    if (body.description !== undefined) {
      data.description = body.description ? String(body.description).trim() : null;
    }
    if (body.weight !== undefined) {
      data.weight =
        body.weight !== null && !isNaN(Number(body.weight))
          ? Number(body.weight)
          : 0.25;
    }

    const product = await (prisma as any).storeProduct.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(cleanStoreProduct(product));
  } catch (error: any) {
    console.error("PUT Product Error:", error);
    return NextResponse.json(
      { error: "পণ্য আপডেট করতে সমস্যা হয়েছে", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    const saleItemCount = await (prisma as any).storeSaleItem.count({
      where: { productId: params.id },
    });

    if (saleItemCount > 0 && !force) {
      // Soft-delete/archive to preserve referential integrity for invoices,
      // while freeing up its barcode/product ID for reuse.
      await (prisma as any).storeProduct.update({
        where: { id: params.id },
        data: {
          visibility: "archived",
          stock: 0,
          barcode: `__NO_BARCODE_archived_${Date.now()}_${Math.random()}__`,
        },
      });
      return NextResponse.json({
        success: true,
        message: "পণ্যটি সফলভাবে মুছে ফেলা হয়েছে",
      });
    }

    if (saleItemCount > 0 && force) {
      await (prisma as any).storeSaleItem.deleteMany({
        where: { productId: params.id },
      });
    }

    await (prisma as any).stockHistory.deleteMany({
      where: { productId: params.id },
    });

    await (prisma as any).storeProduct.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "পণ্যটি সফলভাবে মুছে ফেলা হয়েছে",
    });
  } catch (error: any) {
    console.error("DELETE Product Error:", error);
    return NextResponse.json(
      { error: "পণ্যটি মুছতে ব্যর্থ হয়েছে", details: error.message },
      { status: 500 }
    );
  }
}
