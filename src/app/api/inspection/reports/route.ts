import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import InspectionReport from "@/lib/models/InspectionReport";
import InspectionApplication from "@/lib/models/InspectionApplication";
import {
  calculateInspectionScore,
  haversineDistance,
  generateInspectionToken,
} from "@/lib/inspectionUtils";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("applicationId");
    const reportId = searchParams.get("reportId");
    const trackingNo = searchParams.get("trackingNo");
    const inspectorId = searchParams.get("inspectorId");

    const query: any = {};
    if (reportId) query._id = reportId;
    if (applicationId) query.applicationId = applicationId;
    if (trackingNo) query.trackingNo = trackingNo;
    if (inspectorId) query.inspectorId = inspectorId;

    const reports = await InspectionReport.find(query)
      .populate("applicationId")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, reports });
  } catch (error: any) {
    console.error("Fetch inspection reports error:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const {
      applicationId,
      inspectorId,
      inspectorName,
      inspectorPhone,
      phase = "phase_1",
      inspectionDate = new Date(),
      generalChecklist,
      subjectMatrix,
      teacherStats,
      studentStats,
      inspectorRemarks,
      signatureUrl,
      submissionLat,
      submissionLng,
      geofenceBreachReason,
      photos = [],
    } = body;

    if (!applicationId || !inspectorId || !generalChecklist) {
      return NextResponse.json(
        { error: "আবেদন আইডি, পরিদর্শকের বিবরণ এবং চেকলিস্ট তথ্য আবশ্যক" },
        { status: 400 }
      );
    }

    const application = await InspectionApplication.findById(applicationId);
    if (!application) {
      return NextResponse.json({ error: "সংশ্লিষ্ট আবেদনটি পাওয়া যায়নি" }, { status: 404 });
    }

    // 1. Calculate Score & Grade
    const scoreResult = calculateInspectionScore(
      generalChecklist,
      subjectMatrix || {},
      teacherStats,
      studentStats
    );

    // 2. Geofence distance calculation (< 100 meters verification)
    let gpsDistanceMeters = 0;
    let isGeofenceBreached = false;

    if (
      application.registeredLat &&
      application.registeredLng &&
      submissionLat &&
      submissionLng
    ) {
      gpsDistanceMeters = haversineDistance(
        application.registeredLat,
        application.registeredLng,
        Number(submissionLat),
        Number(submissionLng)
      );
      if (gpsDistanceMeters > 100) {
        isGeofenceBreached = true;
      }
    }

    // 3. Cryptographic Token Generation
    const madrasahCode = application.mCode || application.madrasahCode || application.trackingNo;
    const dateStr = new Date(inspectionDate).toISOString().split("T")[0];
    const verificationHash = generateInspectionToken(application.trackingNo, madrasahCode, dateStr);

    // 4. Save Report
    const newReport = await InspectionReport.create({
      applicationId: application._id,
      trackingNo: application.trackingNo,
      inspectorId,
      inspectorName: inspectorName || application.assignedInspectorName || "মাঠ পরিদর্শক",
      inspectorPhone: inspectorPhone || application.assignedInspectorPhone || "",
      phase,
      inspectionDate: new Date(inspectionDate),
      generalChecklist,
      subjectMatrix: subjectMatrix || {},
      teacherStats: {
        total: Number(teacherStats?.total || 0),
        present: Number(teacherStats?.present || 0),
      },
      studentStats: {
        play: Number(studentStats?.play || 0),
        nursery: Number(studentStats?.nursery || 0),
        class_1: Number(studentStats?.class_1 || 0),
        class_2: Number(studentStats?.class_2 || 0),
        class_3: Number(studentStats?.class_3 || 0),
        class_4: Number(studentStats?.class_4 || 0),
        class_5: Number(studentStats?.class_5 || 0),
        total: Number(studentStats?.total || 0),
      },
      totalScore: scoreResult.totalScore,
      grade: scoreResult.grade,
      gradeLabel: scoreResult.gradeLabel,
      inspectorRemarks: inspectorRemarks || "",
      signatureUrl: signatureUrl || "",
      submissionLat: submissionLat ? Number(submissionLat) : null,
      submissionLng: submissionLng ? Number(submissionLng) : null,
      gpsDistanceMeters,
      isGeofenceBreached,
      geofenceBreachReason: geofenceBreachReason || "",
      photos: Array.isArray(photos) ? photos : [],
      isLocked: true,
      adminReviewStatus: "PENDING",
      verificationHash,
    });

    // 5. Update Application Status to INSPECTED
    application.status = "INSPECTED";
    await application.save();

    return NextResponse.json(
      {
        success: true,
        report: newReport,
        scoreResult,
        verificationHash,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Submit inspection report error:", error);
    return NextResponse.json({ error: error.message || "রিপোর্ট জমাদানে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
