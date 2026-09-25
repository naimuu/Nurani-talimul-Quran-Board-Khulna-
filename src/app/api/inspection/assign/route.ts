import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import InspectionApplication from "@/lib/models/InspectionApplication";
import User from "@/lib/models/User";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { applicationId, inspectorId, scheduledDate } = body;

    if (!applicationId || !inspectorId) {
      return NextResponse.json({ error: "আবেদন আইডি এবং পরিদর্শক নির্বাচন আবশ্যক" }, { status: 400 });
    }

    const application = await InspectionApplication.findById(applicationId);
    if (!application) {
      return NextResponse.json({ error: "আবেদনটি পাওয়া যায়নি" }, { status: 404 });
    }

    const inspector = await User.findById(inspectorId);
    if (!inspector) {
      return NextResponse.json({ error: "নির্বাচিত পরিদর্শক পাওয়া যায়নি" }, { status: 404 });
    }

    application.assignedInspectorId = inspector._id;
    application.assignedInspectorName = inspector.name || "মাঠ পরিদর্শক";
    application.assignedInspectorPhone = inspector.phone || "";
    application.status = "ASSIGNED";
    if (scheduledDate) {
      application.targetDate = new Date(scheduledDate);
      application.status = "SCHEDULED";
    }

    await application.save();

    return NextResponse.json({
      success: true,
      message: "পরিদর্শক সফলভাবে নিযুক্ত করা হয়েছে",
      application,
    });
  } catch (error: any) {
    console.error("Assign inspector error:", error);
    return NextResponse.json({ error: error.message || "পরিদর্শক নিযুক্তি ব্যর্থ হয়েছে" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await connectDB();
    // Get all available inspectors (User role: VISITOR) with their current assigned workload
    const inspectors = await User.find({
      role: { $in: ["VISITOR", "visitor", "Visitor"] },
    })
      .select("_id name phone email")
      .lean();

    // Get workload count per inspector
    const workloadPromises = inspectors.map(async (insp) => {
      const activeCount = await InspectionApplication.countDocuments({
        assignedInspectorId: insp._id,
        status: { $in: ["ASSIGNED", "SCHEDULED"] },
      });
      const completedCount = await InspectionApplication.countDocuments({
        assignedInspectorId: insp._id,
        status: { $in: ["INSPECTED", "APPROVED"] },
      });
      return {
        ...insp,
        activeWorkload: activeCount,
        completedWorkload: completedCount,
      };
    });

    const enrichedInspectors = await Promise.all(workloadPromises);

    return NextResponse.json({ success: true, inspectors: enrichedInspectors });
  } catch (error: any) {
    console.error("Fetch inspectors error:", error);
    return NextResponse.json({ error: "পরিদর্শক তালিকা আনতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
