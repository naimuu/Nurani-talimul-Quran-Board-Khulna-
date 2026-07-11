import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, password } = body;

    // Validate inputs
    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    if (!email && !phone) {
      return NextResponse.json({ error: "Email or Phone is required" }, { status: 400 });
    }

    await connectDB();

    // Build OR conditions for existing user check
    const orConditions: Array<Record<string, string>> = [];
    if (email) orConditions.push({ email });
    if (phone) orConditions.push({ phone });

    // Check if user already exists
    const existingUser = await User.findOne({ $or: orConditions });

    if (existingUser) {
      return NextResponse.json({ error: "User with this email or phone already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      name: name || undefined,
      email: email || `temp_${Date.now()}@example.com`,
      phone: phone || undefined,
      password: hashedPassword,
      role: "GENERAL",
    });

    return NextResponse.json(
      { message: "Account created successfully!", userId: newUser._id.toString() },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
