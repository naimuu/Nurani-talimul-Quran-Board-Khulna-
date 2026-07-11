import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "nurani_board_khulna_secret_key_2024"
);

export async function getUserSession() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  const originalAdminToken = cookieStore.get("original_admin_token")?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      ...(payload as { id: string; email: string; name: string; role: string; phone?: string }),
      isImpersonating: !!originalAdminToken
    };
  } catch (error) {
    return null;
  }
}
