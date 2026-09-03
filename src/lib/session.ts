import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getAdminSession() {
  return getServerSession(authOptions);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    const error = new Error("Unauthorized");
    error.name = "UnauthorizedError";
    throw error;
  }
  return session;
}
