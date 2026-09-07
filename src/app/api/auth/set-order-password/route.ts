import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST(req: Request) {
  try {
    const { userId, phone, email, newPassword } = await req.json();

    if (!newPassword || newPassword.trim().length < 4) {
      return NextResponse.json(
        { error: "পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে" },
        { status: 400 }
      );
    }

    await connectDB();

    let user = null;
    if (userId) {
      user = await User.findById(userId);
    }

    if (!user && (phone || email)) {
      const orConditions: any[] = [];
      if (phone) orConditions.push({ phone: phone.trim() });
      if (email) orConditions.push({ email: email.trim().toLowerCase() });
      if (orConditions.length > 0) {
        user = await User.findOne({ $or: orConditions });
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "ইউজার অ্যাকাউন্ট পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!",
      user: {
        id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Error setting order password:", error);
    return NextResponse.json(
      { error: "পাসওয়ার্ড সংরক্ষণে সমস্যা হয়েছে: " + (error?.message || "") },
      { status: 500 }
    );
  }
}
