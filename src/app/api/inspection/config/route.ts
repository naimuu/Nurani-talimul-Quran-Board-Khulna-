import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import InspectionConfig from "@/lib/models/InspectionConfig";
import { GENERAL_CHECKLIST_ITEMS, STANDARD_INSPECTION_SUBJECTS } from "@/lib/inspectionUtils";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "nurani-board-khulna-secret-key-2025"
);

async function verifyAdminAuth() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== "admin" && payload.role !== "super_admin") {
      return null;
    }
    return payload;
  } catch (e) {
    return null;
  }
}

// GET: Retrieve the currently active inspection criteria & marks configuration
export async function GET() {
  try {
    await connectDB();

    let config: any = await InspectionConfig.findOne({ isActive: true })
      .sort({ version: -1 })
      .lean();

    // If no config is seeded yet, initialize with default items
    if (!config) {
      config = await InspectionConfig.create({
        version: 1,
        isActive: true,
        checklistItems: JSON.parse(JSON.stringify(GENERAL_CHECKLIST_ITEMS)),
        subjects: JSON.parse(JSON.stringify(STANDARD_INSPECTION_SUBJECTS)),
        notes: "Initial default criteria config",
      });
    }

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    console.error("Fetch inspection config error:", error);
    return NextResponse.json(
      { error: "কনফিগারেশন লোড করতে ব্যর্থ হয়েছে", fallback: GENERAL_CHECKLIST_ITEMS },
      { status: 500 }
    );
  }
}

// POST/PUT: Update inspection criteria, add/remove items, set positive/negative marks (Admin only)
export async function POST(request: Request) {
  try {
    await connectDB();

    // Verify Admin authentication
    const authAdmin = await verifyAdminAuth();
    if (!authAdmin) {
      return NextResponse.json(
        { error: "অননুমোদিত অ্যাক্সেস। শুধুমাত্র বোর্ড অ্যাডমিন এটি পরিবর্তন করতে পারেন।" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { checklistItems, subjects, notes } = body;

    if (!Array.isArray(checklistItems) || checklistItems.length === 0) {
      return NextResponse.json(
        { error: "অন্তত একটি নিরীক্ষা মানদণ্ড অবশ্যই থাকতে হবে।" },
        { status: 400 }
      );
    }

    // Validate that each item has an id, sl, label, and options have valid numbers for points
    const sanitizedItems = checklistItems.map((item, idx) => {
      const sl = item.sl || `০${idx + 1}`;
      const id = item.id || `criteria_${Date.now()}_${idx}`;
      const label = (item.label || "").trim();
      const type = item.type || "yes_no_partial";

      const options = Array.isArray(item.options)
        ? item.options.map((opt: any) => ({
            value: opt.value || "opt",
            label: opt.label || "",
            // Support positive AND negative integer marks (e.g. 10, 5, 0, -2, -5, -10)
            points: Number(opt.points) || 0,
          }))
        : [];

      return {
        id,
        sl,
        label,
        type,
        options,
      };
    });

    // Find the latest version
    const latest = await InspectionConfig.findOne().sort({ version: -1 });
    const nextVersion = (latest?.version || 1) + 1;

    // Deactivate previous configs
    await InspectionConfig.updateMany({}, { isActive: false });

    // Create new active config version
    const newConfig = await InspectionConfig.create({
      version: nextVersion,
      isActive: true,
      checklistItems: sanitizedItems,
      subjects: subjects || STANDARD_INSPECTION_SUBJECTS,
      updatedBy: (authAdmin as any)?.name || (authAdmin as any)?.email || "Admin",
      notes: notes || `সংস্করণ ${nextVersion} হালনাগাদ`,
    });

    return NextResponse.json({
      success: true,
      message: `মানদণ্ড ও মার্কিং কনফিগারেশন সফলভাবে আপডেট হয়েছে (সংস্করণ ${nextVersion})। এই পরিবর্তন কেবল ভবিষ্যৎ নতুন রিপোর্টের ক্ষেত্রে কার্যকর হবে।`,
      config: newConfig,
    });
  } catch (error: any) {
    console.error("Save inspection config error:", error);
    return NextResponse.json(
      { error: error.message || "কনফিগারেশন সংরক্ষণ ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}
