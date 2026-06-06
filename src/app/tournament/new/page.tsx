import { db } from "@/db";
import { pointsSystems } from "@/db/schema";
import { createTournament } from "@/actions/createTournament";
import { redirect } from "next/navigation";
import NewTournamentForm from "@/components/NewTournamentForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewTournamentPage() {
  const systems = await db.select().from(pointsSystems);

  async function handleCreate(formData: FormData) {
    "use server";
    return await createTournament(formData);
  }

  return (
    <div className="max-w-md mx-auto px-8 py-16 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          🏆 Create Tournament
        </h1>
        <p className="text-sm text-muted">
          Launch a new leaderboard URL. No login required.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-border shadow-2xl">
        <NewTournamentForm systems={systems} action={handleCreate} />
      </div>
    </div>
  );
}
