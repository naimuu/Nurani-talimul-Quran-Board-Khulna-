import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Madrasa from "@/lib/models/Madrasa";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "nurani_board_khulna_secret_key_2024"
);

// Role to panel URL mapping
const ROLE_REDIRECT: Record<string, string> = {
  ADMIN: "/admin",
  MUHTAMIM: "/madrasa",
  MADRASA: "/madrasa",
  MUALLIM: "/muallim",
  GENERAL: "/",
  CUSTOMER: "/store",
  TRAINER: "/trainer",
  VISITOR: "/visitor",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "আইডি/ইমেইল/ফোন এবং পাসওয়ার্ড প্রদান করুন" },
        { status: 400 }
      );
    }

    const cleanIdentifier = String(identifier).trim();
    const cleanLower = cleanIdentifier.toLowerCase();
    const cleanPassword = String(password).trim();

    // 1. Check Master Admin Credentials (from .env or defaults)
    const adminEmail = process.env.ADMIN_EMAIL || "admin@nuraniboard.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin";

    if (
      cleanLower === adminEmail.toLowerCase() ||
      cleanLower === "admin" ||
      cleanLower === "superadmin"
    ) {
      if (cleanPassword === adminPassword) {
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
          message: "Login successful (Master Admin)",
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
      }
    }

    await connectDB();

    // 2. Build search variations for phone / digits
    const digitsOnly = cleanIdentifier.replace(/\D/g, "");
    const phoneCandidates = [cleanIdentifier];
    if (digitsOnly.length >= 10) {
      phoneCandidates.push(digitsOnly);
      if (digitsOnly.startsWith("8801")) {
        phoneCandidates.push("0" + digitsOnly.slice(4));
      }
      if (digitsOnly.startsWith("01")) {
        phoneCandidates.push(digitsOnly);
        phoneCandidates.push("+88" + digitsOnly);
      }
    }

    // Escape regex string for literal string match
    const escapedIdentifier = cleanIdentifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // 3. Find User directly in DB by email, phone, or name
    let user = await User.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${escapedIdentifier}$`, "i") } },
        { phone: { $in: phoneCandidates } },
        { name: { $regex: new RegExp(`^${escapedIdentifier}$`, "i") } },
      ],
    });

    // 4. If not found, check if identifier is a Madrasa code / trackingId / ilhak
    if (!user) {
      const madrasa = await Madrasa.findOne({
        $or: [
          { code: cleanIdentifier },
          { trackingId: cleanIdentifier },
          ...(digitsOnly ? [{ code: digitsOnly }, { trackingId: digitsOnly }] : []),
          { phone1: { $in: phoneCandidates } },
          { phone2: { $in: phoneCandidates } },
          { email: { $regex: new RegExp(`^${escapedIdentifier}$`, "i") } },
        ],
      });

      if (madrasa) {
        const madrasaPhones = [madrasa.phone1, madrasa.phone2].filter(Boolean) as string[];
        user = await User.findOne({
          $or: [
            { madrasaId: madrasa._id },
            ...(madrasa.email ? [{ email: madrasa.email.toLowerCase() }] : []),
            ...(madrasaPhones.length > 0 ? [{ phone: { $in: madrasaPhones } }] : []),
          ],
        });
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "এই তথ্য দিয়ে কোনো অ্যাকাউন্ট খুঁজে পাওয়া যায়নি। সঠিক ইলহাক, ফোন বা ইমেইল দিন।" },
        { status: 404 }
      );
    }

    // 5. Verify Password
    let isPasswordValid = false;
    if (user.password && (user.password.startsWith("$2a$") || user.password.startsWith("$2b$"))) {
      isPasswordValid = await bcrypt.compare(cleanPassword, user.password);
    } else {
      isPasswordValid = cleanPassword === user.password;
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "পাসওয়ার্ড সঠিক নয়। পুনরায় সঠিক পাসওয়ার্ড দিন।" },
        { status: 401 }
      );
    }

    // 6. Determine Role and Dashboard Destination
    const normalizedRole = (user.role || "GENERAL").toUpperCase();
    let redirectUrl = ROLE_REDIRECT[normalizedRole] || "/";

    // If user is GENERAL or not explicitly mapped, but belongs to a Madrasa -> go to /madrasa
    if (
      (normalizedRole === "GENERAL" || !ROLE_REDIRECT[normalizedRole]) &&
      (user.madrasaId || user.madrasaName)
    ) {
      redirectUrl = "/madrasa";
    }

    // 7. Create JWT token
    const token = await new SignJWT({
      userId: user._id.toString(),
      role: normalizedRole,
      name: user.name || "ব্যবহারকারী",
      email: user.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    // 8. Return response with redirectUrl and set cookie
    const response = NextResponse.json({
      message: "Login successful",
      role: normalizedRole,
      name: user.name || "ব্যবহারকারী",
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
    return NextResponse.json(
      { error: "সার্ভারে সমস্যা হয়েছে, কিছুক্ষণ পর চেষ্টা করুন" },
      { status: 500 }
    );
  }
}

