import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ExamSession from "@/lib/models/ExamQuestion";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();
    const sessions = await ExamSession.find({
      $or: [{ status: "ACTIVE" }, { status: "active" }, { status: { $exists: false } }]
    }).sort({ sessionYear: -1 }).lean();

    return NextResponse.json(
      { sessions },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error: any) {
    console.error("Public fetch exams error:", error);
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 });
  }
}
