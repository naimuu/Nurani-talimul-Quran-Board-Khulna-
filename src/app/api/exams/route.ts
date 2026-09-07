import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ExamSession from "@/lib/models/ExamQuestion";

export async function GET() {
  try {
    await connectDB();
    const sessions = await ExamSession.find({ status: "ACTIVE" }).sort({ sessionYear: -1 }).lean();
    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error("Public fetch exams error:", error);
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 });
  }
}
