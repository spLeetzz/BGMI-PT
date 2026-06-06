"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Match = { id: number; name: string };
type Props = { matches: Match[]; slug: string };

export default function MatchSidebar({ matches, slug }: Props) {
  const pathname = usePathname();

  if (matches.length === 0) return null;

  return (
    <div className="px-3 pb-3">
      <p className="text-[10px] font-bold px-3 mb-2 uppercase tracking-widest text-muted">
        Select Match
      </p>
      <div className="flex flex-col gap-0.5 max-h-[30vh] overflow-y-auto pr-1">
        {matches.map((m) => {
          const href = `/tournament/${slug}/matches/${m.id}`;
          const active = pathname === href;
          return (
            <Link
              key={m.id}
              href={href}
              className={`block px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                active
                  ? "bg-primary text-white shadow-md shadow-primary-dim"
                  : "text-muted hover:text-foreground hover:bg-white/5"
              }`}
            >
              🎮 {m.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
