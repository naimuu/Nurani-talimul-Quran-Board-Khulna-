import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Madrasa from "@/lib/models/Madrasa";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "nurani_board_khulna_secret_key_2024"
);

async function checkAdmin() {
  const token = cookies().get("auth_token")?.value;
  if (!token) return false;

  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    if (verified.payload.role !== "ADMIN") return false;
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const rawMadrasas = await Madrasa.find({}).sort({ createdAt: -1 }).lean();
    const madrasas = rawMadrasas.map((m: any) => {
      const isApproved = m.isApproved === true || m.status === "APPROVED";
      const contactNo = m.contactNo || m.phone1 || m.phone2 || (m.teachers && m.teachers[0]?.phone) || "";
      const managerName = m.managerName || m.principalName || m.managedBy || (m.teachers && m.teachers[0]?.name) || "";
      const fullAddress = m.address || [m.village, m.union, m.upazila, m.district].filter(Boolean).join(", ") || m.addressDetails || "";
      return {
        ...m,
        _id: m._id ? m._id.toString() : m.id,
        isApproved,
        contactNo,
        principalName: managerName,
        managerName,
        address: fullAddress,
        district: m.district || "",
        upazila: m.upazila || "",
        createdAt: m.createdAt || m.registrationDate || new Date().toISOString(),
      };
    });
    return NextResponse.json({ madrasas });
  } catch (error) {
    console.error("Error fetching madrasas:", error);
    return NextResponse.json({ error: "Failed to fetch madrasas" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { madrasaId, isApproved } = await request.json();
    if (!madrasaId || typeof isApproved !== "boolean") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();
    const updateData: any = { isApproved, status: isApproved ? "APPROVED" : "PENDING" };

    if (isApproved) {
      const existing = await Madrasa.findById(madrasaId);
      if (existing && !existing.code) {
        const allWithCode = await Madrasa.find({ code: { $regex: /^KNB-\d+$/ } }).select("code").lean();
        let maxNum = 0;
        for (const m of allWithCode) {
          const num = parseInt(m.code?.replace("KNB-", "") || "0", 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
        updateData.code = `KNB-${String(maxNum + 1).padStart(4, "0")}`;
      }
    }

    const updated = await Madrasa.findByIdAndUpdate(
      madrasaId,
      updateData,
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Madrasa not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Madrasa status updated", madrasa: updated });
  } catch (error) {
    console.error("Error updating madrasa:", error);
    return NextResponse.json({ error: "Failed to update madrasa" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "মাদরাসার নাম প্রয়োজন" }, { status: 400 });
    }

    const trackingId = Math.floor(10000000 + Math.random() * 90000000).toString();
    const shouldApprove = body.autoApprove !== false;
    let code = body.code?.trim() || undefined;

    if (shouldApprove && !code) {
      const allWithCode = await Madrasa.find({ code: { $regex: /^KNB-\d+$/ } }).select("code").lean();
      let maxNum = 0;
      for (const m of allWithCode) {
        const num = parseInt(m.code?.replace("KNB-", "") || "0", 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
      code = `KNB-${String(maxNum + 1).padStart(4, "0")}`;
    }

    const madrasa = new Madrasa({
      ...body,
      trackingId,
      status: shouldApprove ? "APPROVED" : "PENDING",
      isApproved: shouldApprove,
      code: code || undefined,
    });

    await madrasa.save();

    return NextResponse.json({
      success: true,
      message: "মাদরাসা সফলভাবে তৈরি করা হয়েছে",
      madrasa,
      trackingId,
      code: madrasa.code,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating madrasa by admin:", error);
    return NextResponse.json({ error: error.message || "Failed to create madrasa" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const madrasaId = body.id || body._id;

    if (!madrasaId) {
      return NextResponse.json({ error: "Madrasa ID is required" }, { status: 400 });
    }

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "মাদরাসার নাম প্রয়োজন" }, { status: 400 });
    }

    const existing = await Madrasa.findById(madrasaId);
    if (!existing) {
      return NextResponse.json({ error: "মাদরাসা পাওয়া যায়নি" }, { status: 404 });
    }

    const updateData: any = {
      name: body.name.trim(),
      englishName: body.englishName,
      instituteType: body.instituteType,
      managedBy: body.managedBy,
      managerName: body.managerName,
      email: body.email,
      registrationDate: body.registrationDate,
      phone1: body.phone1,
      phone2: body.phone2,
      division: body.division,
      district: body.district,
      upazila: body.upazila,
      union: body.union,
      village: body.village,
      postOffice: body.postOffice,
      postCode: body.postCode,
      wardNo: body.wardNo,
      addressDetails: body.addressDetails,
      teachers: Array.isArray(body.teachers) ? body.teachers : existing.teachers,
    };

    if (body.autoApprove !== undefined) {
      updateData.isApproved = body.autoApprove;
      updateData.status = body.autoApprove ? "APPROVED" : "PENDING";
    } else if (body.status) {
      updateData.status = body.status;
      updateData.isApproved = body.status === "APPROVED";
    } else if (body.isApproved !== undefined) {
      updateData.isApproved = body.isApproved;
      updateData.status = body.isApproved ? "APPROVED" : "PENDING";
    }

    // Code handling
    if (body.code !== undefined) {
      updateData.code = body.code?.trim() || undefined;
    }

    // If approved and no code exists, generate one
    if ((updateData.isApproved || updateData.status === "APPROVED") && !updateData.code && !existing.code) {
      const allWithCode = await Madrasa.find({ code: { $regex: /^KNB-\d+$/ } }).select("code").lean();
      let maxNum = 0;
      for (const m of allWithCode) {
        const num = parseInt(m.code?.replace("KNB-", "") || "0", 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
      updateData.code = `KNB-${String(maxNum + 1).padStart(4, "0")}`;
    }

    const updated = await Madrasa.findByIdAndUpdate(
      madrasaId,
      updateData,
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "মাদরাসার তথ্য সফলভাবে আপডেট করা হয়েছে",
      madrasa: updated,
    });
  } catch (error: any) {
    console.error("Error updating madrasa:", error);
    return NextResponse.json({ error: error.message || "Failed to update madrasa" }, { status: 500 });
  }
}


