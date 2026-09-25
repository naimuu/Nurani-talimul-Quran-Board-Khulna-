import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import InspectionApplication from "@/lib/models/InspectionApplication";
import Madrasa from "@/lib/models/Madrasa";
import User from "@/lib/models/User";
import { INSPECTION_TYPES } from "@/lib/inspectionUtils";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status");
    const inspectorId = searchParams.get("inspectorId");
    const district = searchParams.get("district");
    const inspectionType = searchParams.get("inspectionType");
    const trackingNo = searchParams.get("trackingNo");

    const query: any = {};

    if (trackingNo) {
      query.trackingNo = trackingNo;
    }
    if (status && status !== "ALL") {
      query.status = status;
    }
    if (inspectorId) {
      query.assignedInspectorId = inspectorId;
    }
    if (district && district !== "ALL") {
      query.district = district;
    }
    if (inspectionType && inspectionType !== "ALL") {
      query.inspectionType = inspectionType;
    }
    if (search) {
      query.$or = [
        { trackingNo: { $regex: search, $options: "i" } },
        { madrasahName: { $regex: search, $options: "i" } },
        { madrasahCode: { $regex: search, $options: "i" } },
        { mCode: { $regex: search, $options: "i" } },
        { aCode: { $regex: search, $options: "i" } },
        { directorMobile: { $regex: search, $options: "i" } },
        { upazila: { $regex: search, $options: "i" } },
        { district: { $regex: search, $options: "i" } },
      ];
    }

    const applications = await InspectionApplication.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, applications });
  } catch (error: any) {
    console.error("Fetch inspection applications error:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const {
      madrasahName,
      madrasahCode,
      aCode,
      mCode,
      division = "খুলনা",
      district,
      upazila,
      postOffice,
      village,
      directorName,
      directorMobile,
      headTeacherName,
      headTeacherMobile,
      academicYearCe = "2026",
      academicYearHijri,
      inspectionType = "new_elhak",
      targetDate,
      registeredLat,
      registeredLng,
      feeAmount,
      applicantUserId,
      assignedInspectorId,
    } = body;

    if (!madrasahName || !district || !upazila || !directorName || !directorMobile) {
      return NextResponse.json(
        { error: "মাদরাসার নাম, জেলা, উপজেলা এবং পরিচালকের নাম ও মোবাইল নম্বর আবশ্যক" },
        { status: 400 }
      );
    }

    // Determine default fee if not specified
    const typeConfig = INSPECTION_TYPES.find((t) => t.id === inspectionType);
    const finalFee = feeAmount !== undefined ? Number(feeAmount) : typeConfig?.defaultFee || 1500;

    // Generate non-collisional tracking ID: INV-2026-XXXXX
    const year = academicYearCe || new Date().getFullYear().toString();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const trackingNo = `INV-${year}-${randomSuffix}`;

    // Try linking with existing Madrasa if mCode or madrasahCode provided
    let linkedMadrasaId = null;
    const searchCode = mCode || madrasahCode;
    if (searchCode) {
      const existingMadrasa = await Madrasa.findOne({
        $or: [{ code: searchCode }, { trackingId: searchCode }],
      }).lean();
      if (existingMadrasa) {
        linkedMadrasaId = (existingMadrasa as any)._id;
      }
    }

    // If inspector assigned, lookup their name and phone
    let inspectorName = "";
    let inspectorPhone = "";
    if (assignedInspectorId) {
      const inspectorUser = await User.findById(assignedInspectorId).lean();
      if (inspectorUser) {
        inspectorName = (inspectorUser as any).name || "";
        inspectorPhone = (inspectorUser as any).phone || "";
      }
    }

    const newApp = await InspectionApplication.create({
      trackingNo,
      madrasaId: linkedMadrasaId,
      applicantUserId: applicantUserId || null,
      madrasahName: madrasahName.trim(),
      madrasahCode: (mCode || madrasahCode || "").trim(),
      aCode: (aCode || "").trim(),
      mCode: (mCode || madrasahCode || "").trim(),
      division,
      district: district.trim(),
      upazila: upazila.trim(),
      postOffice: (postOffice || "").trim(),
      village: (village || "").trim(),
      directorName: directorName.trim(),
      directorMobile: directorMobile.trim(),
      headTeacherName: (headTeacherName || "").trim(),
      headTeacherMobile: (headTeacherMobile || "").trim(),
      academicYearCe,
      academicYearHijri: academicYearHijri || "",
      inspectionType,
      status: assignedInspectorId ? "ASSIGNED" : "SUBMITTED",
      targetDate: targetDate ? new Date(targetDate) : null,
      registeredLat: registeredLat ? Number(registeredLat) : null,
      registeredLng: registeredLng ? Number(registeredLng) : null,
      feeAmount: finalFee,
      paymentStatus: "PENDING",
      assignedInspectorId: assignedInspectorId || null,
      assignedInspectorName: inspectorName,
      assignedInspectorPhone: inspectorPhone,
    });

    return NextResponse.json({ success: true, application: newApp }, { status: 201 });
  } catch (error: any) {
    console.error("Create inspection application error:", error);
    return NextResponse.json({ error: error.message || "আবেদন তৈরিতে সমস্যা হয়েছে" }, { status: 500 });
  }
}
