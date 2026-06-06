"use server";

import { db } from "@/db";
import { tournaments } from "@/db/schema";
import { nanoid } from "nanoid";

export async function createTournament(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const pointsSystemId = formData.get("points_system_id") as string;

  if (!name || name.length < 3) {
    return { success: false, error: "Name must be at least 3 characters." };
  }
  if (!pointsSystemId) {
    return { success: false, error: "Select a points system." };
  }

  try {
    const slug = nanoid(8);
    const adminToken = nanoid(12); // Generate a unique token passcode
    await db.insert(tournaments).values({
      slug,
      name,
      pointsSystemId: parseInt(pointsSystemId),
      adminToken,
    });
    return { success: true, slug, adminToken };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to create tournament." };
  }
}
