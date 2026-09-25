import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import InspectionReport from "@/lib/models/InspectionReport";
import InspectionApplication from "@/lib/models/InspectionApplication";
import Madrasa from "@/lib/models/Madrasa";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { reportId, action, adminRemarks, customMadrasahCode } = body;

    if (!reportId || !action) {
      return NextResponse.json({ error: "রিপোর্ট আইডি এবং অ্যাকশন আবশ্যক" }, { status: 400 });
    }

    const report = await InspectionReport.findById(reportId);
    if (!report) {
      return NextResponse.json({ error: "রিপোর্টটি পাওয়া যায়নি" }, { status: 404 });
    }

    const application = await InspectionApplication.findById(report.applicationId);
    if (!application) {
      return NextResponse.json({ error: "সংশ্লিষ্ট আবেদনটি পাওয়া যায়নি" }, { status: 404 });
    }

    if (action === "APPROVE") {
      // 1. Generate or assign Madrasa Code
      let assignedCode = customMadrasahCode?.trim() || application.mCode || application.madrasahCode;
      
      if (!assignedCode) {
        // Generate new code: e.g. "NK-KHU-" + random 3-4 digits or sequential
        const randomNum = Math.floor(100 + Math.random() * 900);
        assignedCode = `NK-KHU-${randomNum}`;
      }

      report.adminReviewStatus = "APPROVED";
      report.adminRemarks = adminRemarks || "বোর্ড কর্তৃক অনুমোদিত";
      report.issuedMadrasahCode = assignedCode;
      await report.save();

      application.status = "APPROVED";
      application.mCode = assignedCode;
      application.madrasahCode = assignedCode;
      await application.save();

      // 2. Activate or Create Madrasa in Central Database
      let targetMadrasa = null;
      if (application.madrasaId) {
        targetMadrasa = await Madrasa.findById(application.madrasaId);
      }
      if (!targetMadrasa) {
        targetMadrasa = await Madrasa.findOne({
          $or: [{ code: assignedCode }, { trackingId: application.trackingNo }],
        });
      }

      if (targetMadrasa) {
        targetMadrasa.status = "APPROVED";
        targetMadrasa.code = assignedCode;
        await targetMadrasa.save();
      } else {
        await Madrasa.create({
          name: application.madrasahName,
          code: assignedCode,
          trackingId: application.trackingNo,
          division: application.division,
          district: application.district,
          upazila: application.upazila,
          postOffice: application.postOffice,
          village: application.village,
          managerName: application.directorName,
          phone1: application.directorMobile,
          phone2: application.headTeacherMobile,
          status: "APPROVED",
          teachers: [],
        });
      }

      return NextResponse.json({
        success: true,
        message: "পরিদর্শন সফলভাবে অনুমোদিত হয়েছে এবং মাদরাসা কোড জারি করা হয়েছে",
        issuedMadrasahCode: assignedCode,
      });
    } else if (action === "REVISION_REQUIRED") {
      report.adminReviewStatus = "REVISION_REQUIRED";
      report.adminRemarks = adminRemarks || "ত্রুটি সংশোধনের নির্দেশ দেওয়া হলো";
      report.isLocked = false; // Allow inspector/madrasah to update
      await report.save();

      application.status = "REVISION_REQUIRED";
      await application.save();

      return NextResponse.json({
        success: true,
        message: "সংশোধন নোটিশ জারি করা হয়েছে",
      });
    } else if (action === "REJECT") {
      report.adminReviewStatus = "REJECTED";
      report.adminRemarks = adminRemarks || "পরিদর্শন অযোগ্য বিবেচিত হয়েছে";
      await report.save();

      application.status = "REJECTED";
      await application.save();

      return NextResponse.json({
        success: true,
        message: "আবেদন বাতিল করা হয়েছে",
      });
    }

    return NextResponse.json({ error: "অবৈধ অ্যাকশন" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin review error:", error);
    return NextResponse.json({ error: error.message || "রিভিউ সম্পন্ন করা যায়নি" }, { status: 500 });
  }
}
