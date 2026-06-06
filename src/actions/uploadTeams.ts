"use server";

import Papa from "papaparse";
import { db } from "@/db";
import { teams, players } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const EXPECTED_HEADERS = [
  "slot number",
  "team id",
  "team name",
  "player 1 ign",
  "player 2 ign",
  "player 3 ign",
  "player 4 ign",
  "player 5 ign",
];

export async function uploadTeams(formData: FormData) {
  const file = formData.get("csv") as File;
  const tournamentId = parseInt(formData.get("tournament_id") as string);

  if (!file) return { success: false, error: "No file provided." };
  if (isNaN(tournamentId)) return { success: false, error: "Invalid tournament." };

  const text = await file.text();

  const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true });

  if (parsed.errors.length > 0) {
    return { success: false, error: "Could not parse CSV." };
  }

  const rows = parsed.data as string[][];
  if (rows.length < 2) {
    return { success: false, error: "CSV has no data rows." };
  }

  const headerRow = rows[0].map((h) => h.trim().toLowerCase());
  const headersMatch = EXPECTED_HEADERS.every((h, i) => headerRow[i] === h);

  if (!headersMatch) {
    return {
      success: false,
      error: `Invalid headers. Expected: Slot Number, Team ID, Team Name, Player 1 IGN, Player 2 IGN, Player 3 IGN, Player 4 IGN, Player 5 IGN`,
    };
  }

  const errors: string[] = [];
  let inserted = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const slot = parseInt(row[0]);
    const teamIdCustom = row[1]?.trim() || null;
    const name = row[2]?.trim();

    if (isNaN(slot) || !name) {
      errors.push(`Row ${i + 1}: invalid slot or team name.`);
      continue;
    }

    try {
      // upsert team
      const existing = await db
        .select()
        .from(teams)
        .where(and(eq(teams.tournamentId, tournamentId), eq(teams.slot, slot)))
        .limit(1);

      let teamId: number;

      if (existing.length > 0) {
        await db
          .update(teams)
          .set({ name, teamIdCustom })
          .where(eq(teams.id, existing[0].id));
        teamId = existing[0].id;
      } else {
        const [inserted_team] = await db
          .insert(teams)
          .values({ tournamentId, slot, name, teamIdCustom })
          .returning({ id: teams.id });
        teamId = inserted_team.id;
      }

      // upsert players slots 1-5
      for (let p = 1; p <= 5; p++) {
        const ign = row[2 + p]?.trim();
        if (!ign) continue;

        const existingPlayer = await db
          .select()
          .from(players)
          .where(and(eq(players.teamId, teamId), eq(players.slot, p)))
          .limit(1);

        if (existingPlayer.length > 0) {
          await db.update(players).set({ ign }).where(eq(players.id, existingPlayer[0].id));
        } else {
          await db.insert(players).values({ teamId, ign, slot: p });
        }
      }

      inserted++;
    } catch (e) {
      console.error(e);
      errors.push(`Row ${i + 1}: DB error.`);
    }
  }

  return { success: true, inserted, errors };
}
