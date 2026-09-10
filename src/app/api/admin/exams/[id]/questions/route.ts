import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ExamSession from "@/lib/models/ExamQuestion";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { generateClassId } from "@/lib/classUtils";

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

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params; // sessionId
    const body = await request.json();
    const {
      examId,
      classId,
      className,
      setName,
      pricePerSet,
      centerDiscountPercent,
      centerDiscountAmount,
      attachmentUrl,
      attachmentName,
      attachmentSize,
      details,
      subjects,
      instructions,
      isActive,
    } = body;

    if (!examId || !className || !setName) {
      return NextResponse.json({ error: "পরীক্ষা, শ্রেণির নাম ও প্রশ্ন সেটের নাম আবশ্যক" }, { status: 400 });
    }

    await connectDB();
    const session = await ExamSession.findById(id);
    if (!session) {
      return NextResponse.json({ error: "সেশন পাওয়া যায়নি" }, { status: 404 });
    }

    const exam = session.exams.find((e: any) => e._id.toString() === examId);
    if (!exam) {
      return NextResponse.json({ error: "পরীক্ষা পাওয়া যায়নি" }, { status: 404 });
    }

    const price = Number(pricePerSet) || 0;
    const discountPct = Number(centerDiscountPercent) || 0;
    const discountAmt = Number(centerDiscountAmount) || 0;

    let effectiveCenterPrice = price;
    if (discountPct > 0) {
      effectiveCenterPrice = Math.max(0, price - (price * discountPct) / 100);
    } else if (discountAmt > 0) {
      effectiveCenterPrice = Math.max(0, price - discountAmt);
    }

    const finalClassId = (classId || generateClassId(className)).trim();
    const newQuestionSet: any = {
      classId: finalClassId,
      className: className.trim(),
      setName: setName.trim(),
      pricePerSet: price,
      centerDiscountPercent: discountPct,
      centerDiscountAmount: discountAmt,
      effectiveCenterPrice,
      attachmentUrl: attachmentUrl || "",
      attachmentName: attachmentName || "",
      attachmentSize: attachmentSize || "",
      details: details || "",
      subjects: Array.isArray(subjects) ? subjects : (subjects ? String(subjects).split(',').map(s => s.trim()).filter(Boolean) : []),
      instructions: instructions || "",
      isActive: isActive !== undefined ? isActive : true,
      orderCount: 0,
    };

    exam.questionSets.push(newQuestionSet);
    await session.save();

    return NextResponse.json({ success: true, session, questionSet: newQuestionSet });
  } catch (error: any) {
    console.error("Error adding question set:", error);
    return NextResponse.json({ error: "প্রশ্নপত্র সেট সংরক্ষণে সমস্যা: " + error?.message }, { status: 500 });
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
    const { id } = params; // sessionId
    const body = await request.json();
    const {
      examId,
      questionSetId,
      classId,
      className,
      setName,
      pricePerSet,
      centerDiscountPercent,
      centerDiscountAmount,
      attachmentUrl,
      attachmentName,
      attachmentSize,
      details,
      subjects,
      instructions,
      isActive,
    } = body;

    if (!examId || !questionSetId) {
      return NextResponse.json({ error: "Exam ID and Question Set ID required" }, { status: 400 });
    }

    await connectDB();
    const session = await ExamSession.findById(id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const exam = session.exams.find((e: any) => e._id.toString() === examId);
    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const qSet = exam.questionSets.find((q: any) => q._id.toString() === questionSetId);
    if (!qSet) {
      return NextResponse.json({ error: "Question set not found" }, { status: 404 });
    }

    if (classId !== undefined) {
      qSet.classId = classId.trim();
    } else if (className !== undefined && !qSet.classId) {
      qSet.classId = generateClassId(className).trim();
    }
    if (className !== undefined) qSet.className = className.trim();
    if (setName !== undefined) qSet.setName = setName.trim();
    if (pricePerSet !== undefined) qSet.pricePerSet = Number(pricePerSet) || 0;
    if (centerDiscountPercent !== undefined) qSet.centerDiscountPercent = Number(centerDiscountPercent) || 0;
    if (centerDiscountAmount !== undefined) qSet.centerDiscountAmount = Number(centerDiscountAmount) || 0;

    const price = qSet.pricePerSet;
    const discountPct = qSet.centerDiscountPercent || 0;
    const discountAmt = qSet.centerDiscountAmount || 0;

    let effectiveCenterPrice = price;
    if (discountPct > 0) {
      effectiveCenterPrice = Math.max(0, price - (price * discountPct) / 100);
    } else if (discountAmt > 0) {
      effectiveCenterPrice = Math.max(0, price - discountAmt);
    }
    qSet.effectiveCenterPrice = effectiveCenterPrice;

    if (attachmentUrl !== undefined) qSet.attachmentUrl = attachmentUrl;
    if (attachmentName !== undefined) qSet.attachmentName = attachmentName;
    if (attachmentSize !== undefined) qSet.attachmentSize = attachmentSize;
    if (details !== undefined) qSet.details = details;
    if (subjects !== undefined) {
      qSet.subjects = Array.isArray(subjects) ? subjects : String(subjects).split(',').map(s => s.trim()).filter(Boolean);
    }
    if (instructions !== undefined) qSet.instructions = instructions;
    if (isActive !== undefined) qSet.isActive = isActive;

    await session.save();
    return NextResponse.json({ success: true, session, questionSet: qSet });
  } catch (error: any) {
    console.error("Error updating question set:", error);
    return NextResponse.json({ error: "প্রশ্নপত্র সেট আপডেটে সমস্যা: " + error?.message }, { status: 500 });
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
    const { id } = params; // sessionId
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get("examId");
    const questionSetId = searchParams.get("questionSetId");

    if (!examId || !questionSetId) {
      return NextResponse.json({ error: "examId and questionSetId query params are required" }, { status: 400 });
    }

    await connectDB();
    const session = await ExamSession.findById(id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const exam = session.exams.find((e: any) => e._id.toString() === examId);
    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    exam.questionSets = exam.questionSets.filter((q: any) => q._id.toString() !== questionSetId);
    await session.save();

    return NextResponse.json({ success: true, message: "Question set removed successfully" });
  } catch (error: any) {
    console.error("Error deleting question set:", error);
    return NextResponse.json({ error: "প্রশ্নপত্র সেট মুছে ফেলতে সমস্যা: " + error?.message }, { status: 500 });
  }
}
