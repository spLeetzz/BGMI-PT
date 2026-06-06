"use client";

export default function TournamentError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <p className="font-semibold" style={{ color: "#f87171" }}>Failed to load tournament</p>
      <p className="text-sm" style={{ color: "var(--muted)" }}>{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded text-sm"
        style={{ background: "var(--accent)", color: "#fff" }}
      >
        Retry
      </button>
    </div>
  );
}
