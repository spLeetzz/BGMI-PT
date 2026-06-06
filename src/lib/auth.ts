import { cookies } from "next/headers";
import { db } from "@/db";
import { tournaments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function checkIsAdmin(slug: string): Promise<boolean> {
  try {
    const [tournament] = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.slug, slug))
      .limit(1);

    if (!tournament) return false;
    // If the tournament has no admin token set in DB, allow management (backward compatibility)
    if (!tournament.adminToken) return true;

    const cookieStore = await cookies();
    const cookieToken = cookieStore.get(`admin_token_${slug}`)?.value;

    return cookieToken === tournament.adminToken;
  } catch (e) {
    console.error("Auth check failed", e);
    return false;
  }
}
