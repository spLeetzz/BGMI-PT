import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-4xl font-bold" style={{ color: "var(--accent)" }}>404</p>
      <p className="text-sm" style={{ color: "var(--muted)" }}>Page not found.</p>
      <Link href="/" className="text-sm underline" style={{ color: "var(--accent)" }}>
        Go home
      </Link>
    </div>
  );
}
