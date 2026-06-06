import { db } from "./index";
import { pointsSystems } from "./schema";

async function seed() {
  console.log("Seeding points systems...");

  await db.insert(pointsSystems).values([
    {
      name: "BGMI Standard",
      rules: [
        { position: 1, points: 10 },
        { position: 2, points: 6 },
        { position: 3, points: 5 },
        { position: 4, points: 4 },
        { position: 5, points: 3 },
        { position: 6, points: 2 },
        { position: 7, points: 1 },
        { position: 8, points: 1 },
      ],
      killPoints: 1,
      isDefault: true,
    },
    {
      name: "Custom Base",
      rules: [
        { position: 1, points: 10 },
        { position: 2, points: 6 },
        { position: 3, points: 3 },
        { position: 4, points: 1 },
      ],
      killPoints: 2,
      isDefault: false,
    },
  ]);

  console.log("Done.");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
