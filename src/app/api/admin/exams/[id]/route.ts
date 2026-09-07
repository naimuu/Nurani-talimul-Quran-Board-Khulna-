import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ExamSession from "@/lib/models/ExamQuestion";
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
    return verified.payload.role === "ADMIN";
  } catch {
    return false;
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { action, sessionYear, title, status, examId, examName, code, examTerm, startDate, endDate, examStatus } = body;

    await connectDB();
    const session = await ExamSession.findById(id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (action === "update_session") {
      if (sessionYear) session.sessionYear = sessionYear.trim();
      if (title !== undefined) session.title = title;
      if (status) session.status = status;
      await session.save();
      return NextResponse.json({ success: true, session });
    }

    if (action === "update_exam" && examId) {
      const exam = session.exams.find((e: any) => e._id.toString() === examId);
      if (!exam) {
        return NextResponse.json({ error: "Exam not found" }, { status: 404 });
      }
      if (examName) exam.name = examName.trim();
      if (code) exam.code = code.trim();
      if (examTerm) exam.examTerm = examTerm;
      if (startDate !== undefined) exam.startDate = startDate;
      if (endDate !== undefined) exam.endDate = endDate;
      if (examStatus) exam.status = examStatus;

      await session.save();
      return NextResponse.json({ success: true, session });
    }

    if (action === "delete_exam" && examId) {
      session.exams = session.exams.filter((e: any) => e._id.toString() !== examId);
      await session.save();
      return NextResponse.json({ success: true, session });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error updating session/exam:", error);
    return NextResponse.json({ error: "আপডেটে সমস্যা হয়েছে: " + error?.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    await connectDB();
    const deleted = await ExamSession.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Session deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting session:", error);
    return NextResponse.json({ error: "মুছে ফেলতে সমস্যা হয়েছে: " + error?.message }, { status: 500 });
  }
}
