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

// Initial seed helper when no sessions exist
const DEFAULT_INITIAL_SESSIONS = [
  {
    sessionYear: "২০২৬",
    title: "২০২৬ শিক্ষাবর্ষ (১৪৪৭-১৪৪৮ হিজরি)",
    isDefault: true,
    status: "ACTIVE",
    exams: [
      {
        name: "১ম সাময়িক পরীক্ষা ২০২৬",
        code: "SEM-1",
        examTerm: "১ম সাময়িক",
        status: "ACTIVE",
        questionSets: [
          {
            className: "শিশু ও নার্সারি",
            setName: "শিশু ও নার্সারি পূর্ণাঙ্গ প্রশ্নপত্র সেট",
            pricePerSet: 12,
            centerDiscountPercent: 15,
            effectiveCenterPrice: 10,
            details: "কুরআন পাঠ, আরবি হরফ, বাংলা, ইংরেজি ও মৌখিক প্রশ্নপত্র",
            subjects: ["কুরআন পাঠ", "আরবি হরফ", "বাংলা", "ইংরেজি"],
            instructions: "প্রতি সেটে ২০টি প্রশ্নপত্র থাকবে।",
            isActive: true,
          },
          {
            className: "১ম শ্রেণি",
            setName: "১ম শ্রেণি পূর্ণাঙ্গ প্রশ্নপত্র সেট",
            pricePerSet: 15,
            centerDiscountPercent: 15,
            effectiveCenterPrice: 12.5,
            details: "কুরআন মাজীদ, তাজবীদ, বাংলা, ইংরেজি ও গণিত প্রশ্নপত্র সেট",
            subjects: ["কুরআন মাজীদ", "তাজবীদ", "বাংলা", "ইংরেজি", "গণিত"],
            instructions: "সিলগালা খাম পরীক্ষা শুরুর ৩০ মিনিট আগে খুলবেন।",
            isActive: true,
          },
          {
            className: "২য় শ্রেণি",
            setName: "২য় শ্রেণি পূর্ণাঙ্গ প্রশ্নপত্র সেট",
            pricePerSet: 18,
            centerDiscountPercent: 15,
            effectiveCenterPrice: 15,
            details: "কুরআন, আকাইদ ও মাসায়েল, বাংলা, ইংরেজি, অংক ও আরবি",
            subjects: ["কুরআন", "আকাইদ ও মাসায়েল", "বাংলা", "ইংরেজি", "অংক", "আরবি"],
            instructions: "উত্তরপত্র আলাদা সরবরাহ করতে হবে।",
            isActive: true,
          },
          {
            className: "৩য় শ্রেণি",
            setName: "৩য় শ্রেণি পূর্ণাঙ্গ প্রশ্নপত্র সেট",
            pricePerSet: 20,
            centerDiscountPercent: 15,
            effectiveCenterPrice: 17,
            details: "তাজবীদসহ কুরআন, ফারসি/উর্দু, বাংলা, ইংরেজি, অংক ও সাধারণ জ্ঞান",
            subjects: ["কুরআন ও তাজবীদ", "বাংলা", "ইংরেজি", "গণিত", "সাধারণ জ্ঞান"],
            instructions: "কেন্দ্রীয় নির্দেশনাবলী মেনে পরীক্ষা পরিচালনা করুন।",
            isActive: true,
          },
        ],
      },
      {
        name: "২য় সাময়িক পরীক্ষা ২০২৬",
        code: "SEM-2",
        examTerm: "২য় সাময়িক",
        status: "UPCOMING",
        questionSets: [
          {
            className: "১ম শ্রেণি",
            setName: "১ম শ্রেণি ২য় সাময়িক পূর্ণাঙ্গ সেট",
            pricePerSet: 15,
            centerDiscountPercent: 15,
            effectiveCenterPrice: 12.5,
            details: "কুরআন মাজীদ, তাজবীদ, বাংলা, ইংরেজি ও গণিত প্রশ্নপত্র সেট",
            subjects: ["কুরআন মাজীদ", "তাজবীদ", "বাংলা", "ইংরেজি", "গণিত"],
            isActive: true,
          },
          {
            className: "২য় শ্রেণি",
            setName: "২য় শ্রেণি ২য় সাময়িক পূর্ণাঙ্গ সেট",
            pricePerSet: 18,
            centerDiscountPercent: 15,
            effectiveCenterPrice: 15,
            details: "কুরআন, আকাইদ ও মাসায়েল, বাংলা, ইংরেজি, অংক ও আরবি",
            subjects: ["কুরআন", "আকাইদ", "বাংলা", "ইংরেজি", "গণিত"],
            isActive: true,
          },
        ],
      },
      {
        name: "বার্ষিক ও কেন্দ্রীয় পরীক্ষা ২০২৬",
        code: "ANNUAL",
        examTerm: "বার্ষিক পরীক্ষা",
        status: "UPCOMING",
        questionSets: [
          {
            className: "১ম শ্রেণি",
            setName: "১ম শ্রেণি বার্ষিক সমাপনী পূর্ণাঙ্গ সেট",
            pricePerSet: 18,
            centerDiscountPercent: 20,
            effectiveCenterPrice: 14.5,
            details: "বোর্ডের কেন্দ্রীয় সমাপনী মূল্যায়নের পূর্ণাঙ্গ প্রশ্নপত্র সেট",
            subjects: ["কুরআন", "তাজবীদ", "বাংলা", "ইংরেজি", "গণিত"],
            isActive: true,
          },
          {
            className: "২য় শ্রেণি",
            setName: "২য় শ্রেণি বার্ষিক সমাপনী পূর্ণাঙ্গ সেট",
            pricePerSet: 20,
            centerDiscountPercent: 20,
            effectiveCenterPrice: 16,
            details: "বোর্ডের কেন্দ্রীয় সমাপনী মূল্যায়নের পূর্ণাঙ্গ প্রশ্নপত্র সেট",
            subjects: ["কুরআন", "আকাইদ", "বাংলা", "ইংরেজি", "গণিত", "আরবি"],
            isActive: true,
          },
          {
            className: "৩য় শ্রেণি (কেন্দ্রীয় সমাপনী)",
            setName: "৩য় শ্রেণি কেন্দ্রীয় বৃত্তি ও সমাপনী সেট",
            pricePerSet: 25,
            centerDiscountPercent: 20,
            effectiveCenterPrice: 20,
            details: "কেন্দ্রীয় সনদায়ন ও বৃত্তি সমাপনী পরীক্ষার সিলগালা প্রশ্নপত্র সেট",
            subjects: ["কুরআন ও তাজবীদ", "আকাইদ ও মাসায়েল", "বাংলা", "ইংরেজি", "গণিত", "সাধারণ জ্ঞান"],
            isActive: true,
          },
        ],
      },
    ],
  },
];

export async function GET(request: Request) {
  try {
    await connectDB();
    const sessions = await ExamSession.find({}).sort({ sessionYear: -1 }).lean();
    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error("Error fetching exams:", error);
    return NextResponse.json({ error: "Failed to fetch exams: " + error?.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, sessionYear, title, sessionId, examName, code, examTerm, startDate, endDate, status } = body;

    await connectDB();

    if (action === "create_session") {
      const customName = sessionYear?.trim();
      if (!customName) {
        return NextResponse.json({ error: "সেশনের নাম আবশ্যক" }, { status: 400 });
      }

      const existing = await ExamSession.findOne({
        $or: [{ sessionYear: customName }, { title: customName }]
      });
      if (existing) {
        return NextResponse.json({ error: "এই নামের সেশন ইতিমধ্যে বিদ্যমান" }, { status: 400 });
      }

      const newSession = await ExamSession.create({
        sessionYear: customName,
        title: title?.trim() || customName,
        status: "ACTIVE",
        exams: [],
      });

      return NextResponse.json({ success: true, session: newSession });
    }

    if (action === "create_exam") {
      if (!sessionId || !examName || !examName.trim()) {
        return NextResponse.json({ error: "সেশন ও পরীক্ষার নাম আবশ্যক" }, { status: 400 });
      }

      const session = await ExamSession.findById(sessionId);
      if (!session) {
        return NextResponse.json({ error: "সেশন পাওয়া যায়নি" }, { status: 404 });
      }

      const newExam: any = {
        name: examName.trim(),
        code: code?.trim() || `EXAM-${Date.now().toString().slice(-4)}`,
        examTerm: examTerm || "১ম সাময়িক",
        startDate: startDate || "",
        endDate: endDate || "",
        status: status || "ACTIVE",
        questionSets: [],
      };

      session.exams.push(newExam);
      await session.save();

      return NextResponse.json({ success: true, session });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error creating session/exam:", error);
    return NextResponse.json({ error: "সংরক্ষণে সমস্যা হয়েছে: " + error?.message }, { status: 500 });
  }
}
