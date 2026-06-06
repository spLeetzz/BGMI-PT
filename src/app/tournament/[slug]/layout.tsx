import { db } from "@/db";
import { tournaments, matches } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import MatchSidebar from "@/components/MatchSidebar";
import { checkIsAdmin } from "@/lib/auth";
import AdminLogin from "@/components/AdminLogin";
import AdminStatus from "@/components/AdminStatus";

export const dynamic = "force-dynamic";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function TournamentLayout({ children, params }: Props) {
  const { slug } = await params;

  const [tournament] = await db
    .select()
    .from(tournaments)
    .where(eq(tournaments.slug, slug))
    .limit(1);

  if (!tournament) notFound();

  const isAdmin = await checkIsAdmin(slug);

  const matchList = await db
    .select()
    .from(matches)
    .where(eq(matches.tournamentId, tournament.id))
    .orderBy(matches.order);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background">
      <aside className="w-64 shrink-0 border-r border-border bg-card/40 backdrop-blur-md flex flex-col justify-between">
        <div className="flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 border-b border-border/60">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">
              Active Tournament
            </p>
            <p className="font-semibold text-sm text-foreground truncate" title={tournament.name}>
              {tournament.name}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 p-3">
            <Link
              href={`/tournament/${slug}`}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-muted hover:text-foreground hover:bg-white/5 transition-all duration-200"
            >
              📊 Standings
            </Link>

            {isAdmin && (
              <>
                <Link
                  href={`/tournament/${slug}/upload`}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-muted hover:text-foreground hover:bg-white/5 transition-all duration-200"
                >
                  📥 Upload Roster
                </Link>
                <Link
                  href={`/tournament/${slug}/roster`}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-muted hover:text-foreground hover:bg-white/5 transition-all duration-200"
                >
                  👥 Manage Roster
                </Link>
                <Link
                  href={`/tournament/${slug}/matches`}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-muted hover:text-foreground hover:bg-white/5 transition-all duration-200"
                >
                  ⚙️ Manage Matches
                </Link>
              </>
            )}

            <Link
              href={`/tournament/${slug}/export`}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-muted hover:text-foreground hover:bg-white/5 transition-all duration-200"
            >
              📤 Export
            </Link>
          </nav>

          {/* Matches Sidebar segment */}
          <div className="border-t border-border/40 mt-2 pt-2">
            <MatchSidebar matches={matchList} slug={slug} />
          </div>
        </div>

        {/* Sidebar Footer with Auth Controls */}
        <div className="flex flex-col">
          {isAdmin ? (
            <AdminStatus slug={slug} dbToken={tournament.adminToken} />
          ) : (
            <AdminLogin slug={slug} />
          )}
          <div className="p-4 border-t border-border/40 text-[10px] text-muted font-medium text-center bg-black/10">
            ID: {slug}
          </div>
        </div>
      </aside>

      <div className="flex-1 overflow-auto bg-background/50">
        {children}
      </div>
    </div>
  );
}
