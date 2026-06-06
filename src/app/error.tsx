"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-lg font-semibold" style={{ color: "#f87171" }}>Something went wrong</p>
      <p className="text-sm" style={{ color: "var(--muted)" }}>{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded text-sm"
        style={{ background: "var(--accent)", color: "#fff" }}
      >
        Try again
      </button>
    </div>
  );
}
