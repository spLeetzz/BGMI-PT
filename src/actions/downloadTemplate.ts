"use server";

import Papa from "papaparse";

export async function downloadTemplate(): Promise<string> {
  const csv = Papa.unparse({
    fields: [
      "Slot Number",
      "Team ID",
      "Team Name",
      "Player 1 IGN",
      "Player 2 IGN",
      "Player 3 IGN",
      "Player 4 IGN",
      "Player 5 IGN",
    ],
    data: [
      ["1", "TID001", "Team Alpha", "Player1", "Player2", "Player3", "Player4", "Player5"],
      ["2", "TID002", "Team Beta", "Player6", "Player7", "Player8", "Player9", "Player10"],
    ],
  });
  return csv;
}
