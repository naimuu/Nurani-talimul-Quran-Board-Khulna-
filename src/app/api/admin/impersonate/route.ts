import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "nurani_board_khulna_secret_key_2024"
);

const ROLE_REDIRECT: Record<string, string> = {
  ADMIN: "/admin",
  MUHTAMIM: "/madrasa",
  MUALLIM: "/muallim",
  GENERAL: "/",
  TRAINER: "/trainer",
  VISITOR: "/visitor",
};

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

export async function POST(request: Request) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create JWT token for the target user
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

    const redirectUrl = ROLE_REDIRECT[user.role] || "/";

    const response = NextResponse.json({
      message: "Impersonation successful",
      redirectUrl,
    });
    
    const currentToken = cookies().get("auth_token")?.value;

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    
    if (currentToken) {
      response.cookies.set("original_admin_token", currentToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Error impersonating user:", error);
    return NextResponse.json({ error: "Failed to impersonate user" }, { status: 500 });
  }
}
