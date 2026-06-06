import { db } from "@/db";
import { tournaments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import UploadForm from "@/components/UploadForm";
import { checkIsAdmin } from "@/lib/auth";
import AdminLogin from "@/components/AdminLogin";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function UploadPage({ params }: Props) {
  const { slug } = await params;

  const [tournament] = await db
    .select()
    .from(tournaments)
    .where(eq(tournaments.slug, slug))
    .limit(1);

  if (!tournament) notFound();

  const isAdmin = await checkIsAdmin(slug);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-8 py-16 flex flex-col gap-6">
        <div className="glass-card rounded-2xl p-6 border border-border shadow-xl text-center">
          <span className="text-4xl mb-4 inline-block">🔒</span>
          <h1 className="text-xl font-bold text-foreground mb-2">
            Access Denied
          </h1>
          <p className="text-sm text-muted mb-6">
            You must be the tournament creator to upload team rosters.
          </p>
          <div className="border-t border-border pt-4 text-left">
            <AdminLogin slug={slug} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-10 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          📥 Upload Team Roster
        </h1>
        <p className="text-sm text-muted">
          Import your squads, players, and slots via CSV files.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-border shadow-lg flex flex-col gap-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          📋 CSV Guidelines & Format
        </h2>
        
        <p className="text-xs text-muted leading-relaxed">
          The first row of your CSV file must contain the exact headers listed below (case-insensitive):
        </p>

        <div className="bg-background/80 border border-border rounded-xl p-4 font-mono text-xs overflow-x-auto text-primary whitespace-nowrap">
          Slot Number, Team ID, Team Name, Player 1 IGN, Player 2 IGN, Player 3 IGN, Player 4 IGN, Player 5 IGN
        </div>

        <ul className="text-xs text-muted list-disc list-inside space-y-1.5 leading-relaxed">
          <li>
            <strong className="text-foreground">Slot Number:</strong> Unique numeric identifier for each team (e.g. 1 to 20).
          </li>
          <li>
            <strong className="text-foreground">Team ID:</strong> Optional unique custom ID/tag for the team (can be left blank).
          </li>
          <li>
            <strong className="text-foreground">Team Name:</strong> The official name of the organization or squad.
          </li>
          <li>
            <strong className="text-foreground">Players 1 to 5:</strong> In-game names (IGN) of the roster. Players 1-4 are required.
          </li>
        </ul>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-border shadow-xl">
        <UploadForm tournamentId={tournament.id} />
      </div>
    </div>
  );
}
