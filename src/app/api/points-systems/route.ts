import { db } from "@/db";
import { pointsSystems } from "@/db/schema";
import { apiError, apiResponse } from "@/lib/utils";

export async function GET() {
  try {
    const rows = await db.select().from(pointsSystems);
    return apiResponse(rows);
  } catch (e) {
    console.error(e);
    return apiError("Failed to fetch points systems.");
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, rules, kill_points } = body;

    if (!name || !Array.isArray(rules) || rules.length === 0) {
      return apiError("name and rules required.", 400);
    }

    const [row] = await db
      .insert(pointsSystems)
      .values({
        name: name.trim(),
        rules,
        killPoints: kill_points ?? 1,
        isDefault: false,
      })
      .returning();

    return apiResponse(row, 201);
  } catch (e) {
    console.error(e);
    return apiError("Failed to create points system.");
  }
}
