import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "nurani_board_khulna_secret_key_2024"
);

// Role to panel URL mapping
const ROLE_REDIRECT: Record<string, string> = {
  ADMIN: "/admin",
  MUHTAMIM: "/madrasa",
  MUALLIM: "/muallim",
  GENERAL: "/",
  TRAINER: "/trainer",
  VISITOR: "/visitor",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, password } = body;
    // identifier can be email or phone

    if (!identifier || !password) {
      return NextResponse.json({ error: "Email/Phone and Password are required" }, { status: 400 });
    }

    // Bangladeshi phone number validation: must be 11 digits starting with 01
    const isPhone = /^01[3-9]\d{8}$/.test(identifier);
    if (!isPhone && identifier.startsWith("0")) {
      return NextResponse.json(
        { error: "ফোন নম্বরটি সঠিক নয়। ১১ সংখ্যার বাংলাদেশী নম্বর দিন (যেমন: 01870186441)" },
        { status: 400 }
      );
    }

    // Master Admin Login (Credentials configured in .env file)
    const adminEmail = process.env.ADMIN_EMAIL || "admin@nuraniboard.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin";

    if (identifier.trim().toLowerCase() === adminEmail.toLowerCase()) {
      if (password.trim() === adminPassword) {
        const token = await new SignJWT({
          userId: "master_admin",
          role: "ADMIN",
          name: "System Admin",
          email: adminEmail,
        })
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("7d")
          .sign(JWT_SECRET);

        const response = NextResponse.json({
          message: "Login successful (Admin)",
          role: "ADMIN",
          name: "System Admin",
          redirectUrl: "/admin",
        });

        response.cookies.set("auth_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        });

        return response;
      } else {
        return NextResponse.json({ error: "পাসওয়ার্ড সঠিক নয়" }, { status: 401 });
      }
    }

    await connectDB();

    // Find user by email or phone
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      return NextResponse.json(
        { error: "এই ইমেইল বা ফোন নম্বর দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    // Verify password (support both bcrypt hashes and plain text for manually added dev users)
    let isPasswordValid = false;
    
    // Check if the stored password looks like a bcrypt hash (starts with $2a$ or $2b$)
    if (user.password && (user.password.startsWith("$2a$") || user.password.startsWith("$2b$"))) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Fallback to plain text comparison if they manually added the user in MongoDB Atlas
      isPasswordValid = password === user.password;
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "পাসওয়ার্ড সঠিক নয়" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await new SignJWT({
      userId: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    const redirectUrl = ROLE_REDIRECT[user.role] || "/general";

    // Set cookie and return response
    const response = NextResponse.json({
      message: "Login successful",
      role: user.role,
      name: user.name,
      redirectUrl,
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

