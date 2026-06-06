"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken, removeTournament } from "@/lib/storage";

type Props = { slug: string; dbToken: string | null };

export default function AdminStatus({ slug, dbToken }: Props) {
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const localToken = getAdminToken(slug);
    if (localToken && localToken === dbToken) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [slug, dbToken]);

  function handleLogout() {
    removeTournament(slug);
    setIsAdmin(false);
    router.refresh();
  }

  if (!isAdmin) return null;

  return (
    <div className="p-4 border-t border-border/40 flex items-center justify-between text-xs">
      <span className="font-bold text-green-500 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        Admin Mode
      </span>
      <button
        onClick={handleLogout}
        className="text-[10px] text-muted hover:text-red-500 font-semibold transition-colors"
      >
        Exit
      </button>
    </div>
  );
}
