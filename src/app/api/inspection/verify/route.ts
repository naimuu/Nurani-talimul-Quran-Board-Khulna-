import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import InspectionReport from "@/lib/models/InspectionReport";
import InspectionApplication from "@/lib/models/InspectionApplication";
import { verifyInspectionToken } from "@/lib/inspectionUtils";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const ref = searchParams.get("ref")?.trim(); // Tracking No e.g. INV-2026-00125
    const token = searchParams.get("token")?.trim(); // Cryptographic token
    const code = searchParams.get("code")?.trim(); // Madrasah Code e.g. 750

    if (!ref && !token && !code) {
      return NextResponse.json({ error: "যাচাই করার রেফারেন্স বা কিউআর কোড আবশ্যক" }, { status: 400 });
    }

    const query: any = {};
    if (ref) query.trackingNo = ref;
    if (token) query.verificationHash = token;

    let report = await InspectionReport.findOne(query).populate("applicationId").lean();

    if (!report && code) {
      // Find by application madrasahCode or issuedMadrasahCode
      const app = await InspectionApplication.findOne({
        $or: [{ mCode: code }, { madrasahCode: code }],
      }).lean();
      if (app) {
        report = await InspectionReport.findOne({ applicationId: (app as any)._id })
          .populate("applicationId")
          .sort({ createdAt: -1 })
          .lean();
      }
    }

    if (!report) {
      return NextResponse.json(
        {
          isVerified: false,
          error: "কোনো বৈধ পরিদর্শন সনদ বা তথ্য খুঁজে পাওয়া যায়নি। নথিটি সঠিক নয় হতে পারে।",
        },
        { status: 404 }
      );
    }

    const app: any = report.applicationId || {};
    const madrasahCode = report.issuedMadrasahCode || app.mCode || app.madrasahCode || report.trackingNo;
    const dateStr = new Date(report.inspectionDate).toISOString().split("T")[0];

    // Cryptographic token verification
    let isCryptoValid = true;
    if (token) {
      isCryptoValid = verifyInspectionToken(token, report.trackingNo, madrasahCode, dateStr);
    }

    return NextResponse.json({
      isVerified: true,
      isCryptoValid,
      trackingNo: report.trackingNo,
      madrasahName: app.madrasahName || "মাদরাসা",
      madrasahCode: madrasahCode,
      aCode: app.aCode || "",
      district: app.district || "",
      upazila: app.upazila || "",
      inspectionType: app.inspectionType || "new_elhak",
      phase: report.phase,
      inspectionDate: report.inspectionDate,
      inspectorName: report.inspectorName,
      totalScore: report.totalScore,
      grade: report.grade,
      gradeLabel: report.gradeLabel,
      adminReviewStatus: report.adminReviewStatus,
      issuedMadrasahCode: report.issuedMadrasahCode,
      verificationHash: report.verificationHash,
    });
  } catch (error: any) {
    console.error("Verification API error:", error);
    return NextResponse.json({ error: "যাচাইকরণে ত্রুটি দেখা দিয়েছে" }, { status: 500 });
  }
}
