"use server";

import { db } from "@/db";
import { pointsSystems } from "@/db/schema";

export async function createPointsSystem(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const killPoints = parseInt(formData.get("kill_points") as string);
  const rulesRaw = formData.get("rules") as string;

  if (!name) return { success: false, error: "Name required." };
  if (isNaN(killPoints) || killPoints < 0) return { success: false, error: "Invalid kill points." };

  let rules: { position: number; points: number }[];
  try {
    rules = JSON.parse(rulesRaw);
    if (!Array.isArray(rules) || rules.length === 0) throw new Error();
  } catch {
    return { success: false, error: "Invalid rules format." };
  }

  try {
    const [row] = await db
      .insert(pointsSystems)
      .values({ name, rules, killPoints, isDefault: false })
      .returning({ id: pointsSystems.id });
    return { success: true, id: row.id };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to create points system." };
  }
}
