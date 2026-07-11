import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const originalToken = cookies().get("original_admin_token")?.value;

  if (!originalToken) {
    return NextResponse.json({ error: "No original admin session found" }, { status: 400 });
  }

  const response = NextResponse.json({
    message: "Reverted to admin successfully",
    redirectUrl: "/admin",
  });

  // Restore the original token
  response.cookies.set("auth_token", originalToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  // Delete the backup token
  response.cookies.delete("original_admin_token");

  return response;
}
