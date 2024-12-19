import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return null;
    }

    return session.user;
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
} 


