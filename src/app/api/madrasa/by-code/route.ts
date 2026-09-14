import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import connectDB from "@/lib/mongodb";
import Madrasa from "@/lib/models/Madrasa";
import User from "@/lib/models/User";

const KNOWN_DIVISIONS = [
  "ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "বরিশাল", "সিলেট", "রংপুর", "ময়মনসিংহ",
  "dhaka", "chittagong", "rajshahi", "khulna", "barisal", "sylhet", "rangpur", "mymensingh"
];

function parseAddressFromNotes(notes?: string | null) {
  if (!notes) return { division: "", district: "", upazila: "", union: "", village: "", fullAddress: "" };

  let cleaned = notes
    .replace(/\[প্রশ্নের অর্ডার\]:[\s\S]*?(?:\|\s*|$)/gi, "")
    .replace(/\[নূরানী বই ও পণ্য অর্ডার\]:[\s\S]*?(?:\|\s*|$)/gi, "")
    .replace(/\[(?:Tracking|ট্র্যাকিং|Consignment):\s*[^\]]+\]/gi, "")
    .replace(/\[(?:কুরিয়ার নোট|Courier Note):\s*[^\]]+\]/gi, "")
    .replace(/\|\s*কুরিয়ার:\s*[^|]+/gi, "")
    .replace(/কুরিয়ার:\s*[^|]+/gi, "")
    .replace(/\(ফ্রি ডেলিভারি[^)]*\)/gi, "")
    .replace(/\(চার্জ:[^)]*\)/gi, "")
    .replace(/ওজন:\s*[\d.]+\s*(?:কেজি|kg)/gi, "")
    .replace(/\(ইলহাক:\s*[^)]+\)/gi, "")
    .replace(/\|\s*প্রতিশ্রুত[^|]+/gi, "")
    .replace(/\|\s*ডেলিভারি ঠিকানা:\s*[^|]+/gi, "")
    .trim();

  cleaned = cleaned.replace(/^[|,\s]+|[|,\s]+$/g, "").trim();

  // If there are multiple pipe sections, find the section containing address details
  if (cleaned.includes("|")) {
    const pipeParts = cleaned.split("|").map((p) => p.trim()).filter(Boolean);
    const addrPart = pipeParts.find((p) => p.includes(",")) || pipeParts[0];
    cleaned = addrPart || cleaned;
  }

  cleaned = cleaned.replace(/^ঠিকানা:\s*/i, "").trim();

  const parts = cleaned.split(",").map((s) => s.trim()).filter(Boolean);

  let village = "";
  let union = "";
  let upazila = "";
  let district = "";
  let division = "";

  if (parts.length === 0) {
    return { division, district, upazila, union, village, fullAddress: cleaned };
  }

  const lastPart = parts[parts.length - 1].toLowerCase();
  const matchedDiv = KNOWN_DIVISIONS.find((d) => lastPart.includes(d.toLowerCase()));

  if (matchedDiv) {
    division = parts[parts.length - 1];
    if (parts.length >= 2) district = parts[parts.length - 2];
    if (parts.length >= 3) upazila = parts[parts.length - 3];
    if (parts.length >= 4) union = parts[parts.length - 4];
    if (parts.length >= 5) village = parts.slice(0, parts.length - 4).join(", ");
  } else {
    if (parts.length >= 5) {
      village = parts.slice(0, parts.length - 4).join(", ");
      union = parts[parts.length - 4];
      upazila = parts[parts.length - 3];
      district = parts[parts.length - 2];
      division = parts[parts.length - 1];
    } else if (parts.length === 4) {
      village = parts[0];
      upazila = parts[1];
      district = parts[2];
      division = parts[3];
    } else if (parts.length === 3) {
      upazila = parts[0];
      district = parts[1];
      division = parts[2];
    } else if (parts.length === 2) {
      district = parts[0];
      division = parts[1];
    } else {
      village = parts[0];
    }
  }

  return { division, district, upazila, union, village, fullAddress: cleaned };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code || !code.trim()) {
      return NextResponse.json({ error: "Code or phone is required" }, { status: 400 });
    }

    const trimmed = code.trim();
    const normalizedCode = trimmed.replace(/[০-৯]/g, (d) => "0123456789"[d.charCodeAt(0) - 2534]);
    const phoneDigits = normalizedCode.replace(/\D/g, "");
    const clean11Phone = phoneDigits.length >= 11 ? phoneDigits.slice(-11) : phoneDigits;

    const result = {
      name: "",
      ownerName: "",
      contactNo: "",
      email: "",
      division: "",
      district: "",
      upazila: "",
      union: "",
      village: "",
      address: "",
      ilhak: "",
      source: "",
    };

    // 1. Check MongoDB Madrasa Collection
    try {
      await connectDB();
      const mongoMadrasa = await Madrasa.findOne({
        $or: [
          { code: normalizedCode },
          { code: trimmed },
          { trackingId: normalizedCode },
          { trackingId: trimmed },
          ...(clean11Phone.length >= 7
            ? [
                { phone1: { $regex: clean11Phone, $options: "i" } },
                { phone2: { $regex: clean11Phone, $options: "i" } },
              ]
            : [
                { phone1: { $regex: normalizedCode, $options: "i" } },
                { phone2: { $regex: normalizedCode, $options: "i" } },
              ]),
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

        result.name = (mongoMadrasa as any).name || "";
        result.ownerName = owner;
        result.contactNo =
          (mongoMadrasa as any).phone1 ||
          (mongoMadrasa as any).phone2 ||
          (mongoMadrasa as any).contactNo ||
          "";
        result.email = (mongoMadrasa as any).email || "";
        result.division = (mongoMadrasa as any).division || "";
        result.district = (mongoMadrasa as any).district || "";
        result.upazila = (mongoMadrasa as any).upazila || "";
        result.union = (mongoMadrasa as any).union || "";
        result.village = (mongoMadrasa as any).village || (mongoMadrasa as any).addressDetails || "";
        result.address = fullAddr;
        result.ilhak = (mongoMadrasa as any).code || (mongoMadrasa as any).trackingId || "";
        result.source = "mongo_madrasa";
      }

      // 2. Check MongoDB User Collection
      const userConditions: any[] = [];
      if (normalizedCode) userConditions.push({ phone: normalizedCode });
      if (trimmed) userConditions.push({ phone: trimmed });
      if (clean11Phone.length >= 7) userConditions.push({ phone: { $regex: clean11Phone, $options: "i" } });
      if (trimmed.includes("@")) userConditions.push({ email: trimmed.toLowerCase() });

      if (userConditions.length > 0) {
        const mongoUser = await User.findOne({ $or: userConditions }).lean();

        if (mongoUser) {
          if (!result.ownerName && (mongoUser as any).name) {
            result.ownerName = (mongoUser as any).name;
          }
          if (!result.contactNo && (mongoUser as any).phone) {
            result.contactNo = (mongoUser as any).phone;
          }
          if (!result.email && (mongoUser as any).email) {
            result.email = (mongoUser as any).email;
          }
          if (!result.name && ((mongoUser as any).madrasaName || (mongoUser as any).instituteName)) {
            result.name = (mongoUser as any).madrasaName || (mongoUser as any).instituteName || "";
          }
          if (!result.source) result.source = "mongo_user";

          // If user found without madrasa, check if linked madrasa exists by user's phone/email
          if (!result.name || !result.division) {
            const userPhoneDigits = ((mongoUser as any).phone || "").replace(/\D/g, "");
            const userClean11 = userPhoneDigits.length >= 11 ? userPhoneDigits.slice(-11) : userPhoneDigits;
            const linkedMadrasa = await Madrasa.findOne({
              $or: [
                ...(userClean11.length >= 7
                  ? [
                      { phone1: { $regex: userClean11, $options: "i" } },
                      { phone2: { $regex: userClean11, $options: "i" } },
                    ]
                  : []),
                ...((mongoUser as any).email ? [{ email: (mongoUser as any).email.toLowerCase() }] : []),
              ],
            }).lean();

            if (linkedMadrasa) {
              if (!result.name && (linkedMadrasa as any).name) result.name = (linkedMadrasa as any).name;
              if (!result.ownerName) {
                result.ownerName =
                  (linkedMadrasa as any).managerName || (linkedMadrasa as any).principalName || "";
              }
              if (!result.division) result.division = (linkedMadrasa as any).division || "";
              if (!result.district) result.district = (linkedMadrasa as any).district || "";
              if (!result.upazila) result.upazila = (linkedMadrasa as any).upazila || "";
              if (!result.union) result.union = (linkedMadrasa as any).union || "";
              if (!result.village) {
                result.village = (linkedMadrasa as any).village || (linkedMadrasa as any).addressDetails || "";
              }
              if (!result.address) {
                result.address =
                  (linkedMadrasa as any).addressDetails || (linkedMadrasa as any).address || "";
              }
              if (!result.ilhak) {
                result.ilhak = (linkedMadrasa as any).code || (linkedMadrasa as any).trackingId || "";
              }
              result.source = "mongo_madrasa";
            }
          }
        }
      }
    } catch (mErr) {
      console.error("MongoDB check error in by-code:", mErr);
    }

    // 3. Check Prisma StoreSale (online/offline orders) to enrich missing details (Madrasa Name, Address, etc.)
    try {
      const salePhoneConditions: any[] = [];
      if (normalizedCode) salePhoneConditions.push({ customerPhone: normalizedCode });
      if (trimmed) salePhoneConditions.push({ customerPhone: trimmed });
      if (clean11Phone.length >= 7) {
        salePhoneConditions.push({ customerPhone: { contains: clean11Phone } });
      }
      if (result.contactNo) {
        const cPhone11 = result.contactNo.replace(/\D/g, "").slice(-11);
        if (cPhone11.length >= 7) {
          salePhoneConditions.push({ customerPhone: { contains: cPhone11 } });
        }
      }

      if (salePhoneConditions.length > 0 || result.name) {
        const sales = await (prisma as any).storeSale.findMany({
          where: {
            OR: [
              ...salePhoneConditions,
              ...(result.name ? [{ instituteId: result.name }] : []),
            ],
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        });

        if (sales && sales.length > 0) {
          for (const sale of sales) {
            if (!result.name && sale.instituteId?.trim()) {
              result.name = sale.instituteId.trim();
            }
            if (!result.ownerName && sale.customerName?.trim()) {
              result.ownerName = sale.customerName.trim();
            }
            if (!result.contactNo && sale.customerPhone?.trim()) {
              result.contactNo = sale.customerPhone.trim();
            }
            if ((!result.division || !result.district || !result.address) && sale.notes) {
              const parsed = parseAddressFromNotes(sale.notes);
              if (!result.division && parsed.division) result.division = parsed.division;
              if (!result.district && parsed.district) result.district = parsed.district;
              if (!result.upazila && parsed.upazila) result.upazila = parsed.upazila;
              if (!result.union && parsed.union) result.union = parsed.union;
              if (!result.village && parsed.village) result.village = parsed.village;
              if (!result.address && parsed.fullAddress) result.address = parsed.fullAddress;
            }
          }
          if (!result.source) result.source = "store_sale";
        }
      }
    } catch (sErr) {
      console.error("Prisma sale check error in by-code:", sErr);
    }

    // 4. Check Prisma Madrasa
    try {
      if (!result.name || !result.address) {
        const prismaMadrasa = await (prisma as any).madrasa.findFirst({
          where: {
            OR: [
              { code: normalizedCode },
              { contactNo: { contains: clean11Phone || normalizedCode } },
              { code: trimmed },
              { contactNo: { contains: trimmed } },
            ],
          },
        });

        if (prismaMadrasa) {
          if (!result.name) result.name = prismaMadrasa.name;
          if (!result.contactNo) result.contactNo = prismaMadrasa.contactNo || "";
          if (!result.address) result.address = prismaMadrasa.address || "";
          if (!result.ilhak) result.ilhak = prismaMadrasa.code || "";
          if (!result.source) result.source = "prisma_madrasa";
        }
      }
    } catch (pErr) {
      console.error("Prisma madrasa check error in by-code:", pErr);
    }

    // If at least one significant field is found
    if (result.name || result.ownerName || result.contactNo || result.address || result.division) {
      if (!result.address && (result.village || result.upazila || result.district || result.division)) {
        result.address = [result.village, result.union, result.upazila, result.district, result.division]
          .filter(Boolean)
          .join(", ");
      }
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "তথ্য পাওয়া যায়নি" }, { status: 404 });
  } catch (error) {
    console.error("Failed to fetch madrasa by code:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
