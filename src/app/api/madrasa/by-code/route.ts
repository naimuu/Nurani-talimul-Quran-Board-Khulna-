import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import connectDB from "@/lib/mongodb";
import Madrasa from "@/lib/models/Madrasa";
import User from "@/lib/models/User";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code || !code.trim()) {
      return NextResponse.json({ error: "Code or phone is required" }, { status: 400 });
    }

    const trimmed = code.trim();
    const normalizedCode = trimmed.replace(/[০-৯]/g, (d) => "0123456789"[d.charCodeAt(0) - 2534]);

    // 1. Check MongoDB Madrasa Collection
    try {
      await connectDB();
      const mongoMadrasa = await Madrasa.findOne({
        $or: [
          { code: normalizedCode },
          { code: trimmed },
          { trackingId: normalizedCode },
          { trackingId: trimmed },
          { phone1: { $regex: normalizedCode, $options: "i" } },
          { phone2: { $regex: normalizedCode, $options: "i" } },
          { name: { $regex: trimmed, $options: "i" } },
        ],
      }).lean();

      if (mongoMadrasa) {
        const fullAddr =
          (mongoMadrasa as any).addressDetails ||
          (mongoMadrasa as any).address ||
          [
            (mongoMadrasa as any).village,
            (mongoMadrasa as any).union,
            (mongoMadrasa as any).upazila,
            (mongoMadrasa as any).district,
            (mongoMadrasa as any).division,
          ]
            .filter(Boolean)
            .join(", ");

        const owner =
          (mongoMadrasa as any).managerName ||
          (mongoMadrasa as any).principalName ||
          ((mongoMadrasa as any).teachers && (mongoMadrasa as any).teachers[0]?.name) ||
          "";

        return NextResponse.json({
          name: (mongoMadrasa as any).name || "",
          ownerName: owner,
          contactNo: (mongoMadrasa as any).phone1 || (mongoMadrasa as any).phone2 || (mongoMadrasa as any).contactNo || "",
          email: (mongoMadrasa as any).email || "",
          division: (mongoMadrasa as any).division || "",
          district: (mongoMadrasa as any).district || "",
          upazila: (mongoMadrasa as any).upazila || "",
          union: (mongoMadrasa as any).union || "",
          village: (mongoMadrasa as any).village || (mongoMadrasa as any).addressDetails || "",
          address: fullAddr,
          ilhak: (mongoMadrasa as any).code || (mongoMadrasa as any).trackingId || "",
          source: "mongo_madrasa",
        });
      }

      // 2. Check MongoDB User Collection
      const mongoUser = await User.findOne({
        $or: [
          { phone: normalizedCode },
          { phone: trimmed },
          { email: trimmed.toLowerCase() },
        ],
      }).lean();

      if (mongoUser) {
        return NextResponse.json({
          name: (mongoUser as any).madrasaName || (mongoUser as any).instituteName || "",
          ownerName: (mongoUser as any).name || "",
          contactNo: (mongoUser as any).phone || "",
          email: (mongoUser as any).email || "",
          division: "",
          district: "",
          upazila: "",
          union: "",
          village: "",
          address: "",
          source: "mongo_user",
        });
      }
    } catch (mErr) {
      console.error("MongoDB check error in by-code:", mErr);
    }

    // 3. Check Prisma Madrasa
    const prismaMadrasa = await (prisma as any).madrasa.findFirst({
      where: {
        OR: [
          { code: normalizedCode },
          { contactNo: { contains: normalizedCode } },
          { code: trimmed },
          { contactNo: { contains: trimmed } },
        ],
      },
    });

    if (prismaMadrasa) {
      const pastSale = await (prisma as any).storeSale.findFirst({
        where: {
          OR: [{ customerPhone: normalizedCode }, { instituteId: prismaMadrasa.name }],
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        name: prismaMadrasa.name,
        ownerName: pastSale ? pastSale.customerName : "",
        contactNo: prismaMadrasa.contactNo || "",
        address: prismaMadrasa.address || "",
        ilhak: prismaMadrasa.code || "",
        source: "prisma_madrasa",
      });
    }

    // 4. Check Prisma StoreSale for returning customers
    const lastSale = await (prisma as any).storeSale.findFirst({
      where: { customerPhone: normalizedCode },
      orderBy: { createdAt: "desc" },
    });

    if (lastSale) {
      let extractedAddress = "";
      if (lastSale.notes) {
        const match = lastSale.notes.match(/ঠিকানা:\s*([^()]+)/);
        extractedAddress = match ? match[1].trim() : lastSale.notes;
      }

      return NextResponse.json({
        name: lastSale.instituteId || "",
        ownerName: lastSale.customerName || "",
        contactNo: lastSale.customerPhone || "",
        address: extractedAddress,
        source: "prisma_sale",
      });
    }

    return NextResponse.json({ error: "তথ্য পাওয়া যায়নি" }, { status: 404 });
  } catch (error) {
    console.error("Failed to fetch madrasa by code:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
