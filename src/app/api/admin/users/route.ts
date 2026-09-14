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
    const dbUsers = await User.find({})
      .populate('madrasaId', 'name englishName code district upazila trackingId isApproved status')
      .sort({ createdAt: -1 })
      .lean();
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
    const { name, email, phone, password, role, madrasaName, instituteName } = await request.json();
    if (!email || !password || !role) {
      return NextResponse.json({ error: "প্রয়োজনীয় তথ্য দিন (ইমেইল, পাসওয়ার্ড ও রোল)" }, { status: 400 });
    }

    await connectDB();
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const finalMadrasa = madrasaName || instituteName || undefined;
    
    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role.toUpperCase(),
      madrasaName: finalMadrasa,
      instituteName: finalMadrasa,
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

export async function PUT(request: Request) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const userId = body.userId || body.id || body._id;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (userId === "master_admin_id") {
      return NextResponse.json({ error: "Cannot modify Master Admin" }, { status: 403 });
    }

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return NextResponse.json({ error: "ইউজার পাওয়া যায়নি" }, { status: 404 });
    }

    // Email unique check
    if (body.email && body.email.toLowerCase().trim() !== existingUser.email.toLowerCase()) {
      const emailTaken = await User.findOne({ 
        email: body.email.toLowerCase().trim(), 
        _id: { $ne: userId } 
      });
      if (emailTaken) {
        return NextResponse.json({ error: "এই ইমেইলটি অন্য একটি অ্যাকাউন্টে ব্যবহৃত হচ্ছে" }, { status: 400 });
      }
      existingUser.email = body.email.toLowerCase().trim();
    }

    if (body.name !== undefined) existingUser.name = body.name.trim();
    if (body.phone !== undefined) existingUser.phone = body.phone.trim() || undefined;
    if (body.role !== undefined) existingUser.role = body.role.toUpperCase();

    // Password update
    if (body.password && typeof body.password === "string" && body.password.trim().length > 0) {
      existingUser.password = await bcrypt.hash(body.password.trim(), 10);
    }

    // Madrasa / Ilhak assignment
    if (body.madrasaId !== undefined) {
      if (body.madrasaId === "" || body.madrasaId === null) {
        existingUser.madrasaId = undefined;
        existingUser.madrasaName = undefined;
        existingUser.instituteName = undefined;
      } else {
        existingUser.madrasaId = body.madrasaId;
        const linkedMadrasa = await Madrasa.findById(body.madrasaId);
        if (linkedMadrasa) {
          existingUser.madrasaName = linkedMadrasa.name;
          existingUser.instituteName = linkedMadrasa.name;
        }
      }
    } else if (body.madrasaName !== undefined || body.instituteName !== undefined) {
      const mName = (body.madrasaName ?? body.instituteName)?.trim();
      existingUser.madrasaName = mName || undefined;
      existingUser.instituteName = mName || undefined;
    }

    await existingUser.save();

    const updatedUser = await User.findById(userId)
      .populate('madrasaId', 'name englishName code district upazila trackingId isApproved status')
      .lean();

    return NextResponse.json({
      success: true,
      message: "ইউজারের তথ্য ও ইলহাক সফলভাবে আপডেট করা হয়েছে",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Error updating user:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "ইমেইল বা ফোন নম্বরটি অন্য অ্যাকাউন্টে ব্যবহৃত হচ্ছে" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "ইউজার আপডেট করতে সমস্যা হয়েছে" }, { status: 500 });
  }
}


