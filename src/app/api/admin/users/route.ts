import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Madrasa from "@/lib/models/Madrasa";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "nurani_board_khulna_secret_key_2024"
);

async function checkAdmin() {
  const token = cookies().get("auth_token")?.value;
  if (!token) return false;

  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    if (verified.payload.role !== "ADMIN") return false;
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const dbUsers = await User.find({}).sort({ createdAt: -1 }).lean();
    const madrasaCount = await Madrasa.countDocuments();
    
    const adminEmail = process.env.ADMIN_EMAIL || "admin@nuraniboard.com";
    const masterAdmin = {
      _id: "master_admin_id",
      name: "সুপার অ্যাডমিন (Master)",
      email: adminEmail,
      phone: "-",
      role: "ADMIN",
      createdAt: new Date().toISOString(),
    };
    
    const users = [masterAdmin, ...dbUsers];
    
    return NextResponse.json({ users, madrasaCount });
  } catch (error) {
    console.error("Error fetching admin data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId, role } = await request.json();
    if (!userId || !role) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (userId === "master_admin_id") {
      return NextResponse.json({ error: "Cannot modify Master Admin" }, { status: 403 });
    }

    await connectDB();
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: role.toUpperCase() },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Role updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, email, phone, password, role } = await request.json();
    if (!email || !password || !role) {
      return NextResponse.json({ error: "প্রয়োজনীয় তথ্য দিন (ইমেইল, পাসওয়ার্ড ও রোল)" }, { status: 400 });
    }

    await connectDB();
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role.toUpperCase(),
    });

    return NextResponse.json({ message: "User created successfully", user: newUser }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating user:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "এই ইমেইল বা ফোন নম্বর ইতিমধ্যে ব্যবহৃত হয়েছে" }, { status: 400 });
    }
    return NextResponse.json({ error: "ইউজার তৈরি করতে সার্ভারে সমস্যা হয়েছে" }, { status: 500 });
  }
}

