import Link from "next/link";

export default function TournamentNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>Tournament not found</p>
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        This slug does not exist or was deleted.
      </p>
      <Link href="/" className="text-sm underline" style={{ color: "var(--accent)" }}>
        Go home
      </Link>
    </div>
  );
}
