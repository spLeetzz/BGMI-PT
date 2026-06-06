"use client";

import { useState, useEffect, useRef } from "react";

type Player = { id: number; ign: string; slot: number; kills: number };
type Team = { id: number; name: string; teamIdCustom: string | null; slot: number };
type Result = { id: number; position: number; placementPoints: number } | null;

type Props = {
  team: Team;
  players: Player[];
  matchId: number;
  existingResult: Result;
  isAdmin: boolean;
};

export default function TeamCard({ team, players: initialPlayers, matchId, existingResult, isAdmin }: Props) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(existingResult?.position?.toString() ?? "0");
  const [playerKills, setPlayerKills] = useState<Record<number, string>>(
    Object.fromEntries(initialPlayers.map((p) => [p.id, p.kills.toString()]))
  );
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [saved, setSaved] = useState(!!existingResult);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit IGN states
  const [editingPlayer, setEditingPlayer] = useState<number | null>(null);
  const [editIgnValue, setEditIgnValue] = useState("");

  // Add player states
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [newIgn, setNewIgn] = useState("");

  // Refs for tracking changes and initial mount
  const isMounted = useRef(false);

  async function handleSave(currentPos = position, currentKills = playerKills) {
    if (!isAdmin) return;
    if (currentPos === "" || isNaN(parseInt(currentPos))) {
      setError("Enter a valid position.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          match_id: matchId,
          team_id: team.id,
          position: parseInt(currentPos),
          kills_per_player: players.map((p) => ({
            player_id: p.id,
            kills: parseInt(currentKills[p.id] ?? "0") || 0,
          })),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error ?? "Failed to save.");
        return;
      }
      setSaved(true);
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  // Debounced auto-save effect
  useEffect(() => {
    if (!isAdmin) return;
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    setSaved(false);
    const delayDebounceFn = setTimeout(() => {
      handleSave(position, playerKills);
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [position, playerKills, isAdmin]);

  async function handleEditIgnSave(playerId: number) {
    if (!isAdmin || !editIgnValue.trim()) return;
    const res = await fetch(`/api/players/${playerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ign: editIgnValue.trim() }),
    });
    const data = await res.json();
    if (data.success) {
      setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, ign: data.data.ign } : p)));
      setEditingPlayer(null);
    }
  }

  async function handleAddPlayer() {
    if (!isAdmin || !newIgn.trim()) return;
    if (players.length >= 10) {
      setError("Max 10 players per team.");
      return;
    }
    const nextSlot = Math.max(0, ...players.map((p) => p.slot)) + 1;
    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ team_id: team.id, ign: newIgn.trim(), slot: nextSlot }),
    });
    const data = await res.json();
    if (data.success) {
      const newPlayer = { ...data.data, kills: 0 };
      setPlayers((prev) => [...prev, newPlayer]);
      setPlayerKills((prev) => ({ ...prev, [newPlayer.id]: "0" }));
      setNewIgn("");
      setAddingPlayer(false);
    }
  }

  const isChicken = position === "1";

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 shadow-sm overflow-hidden ${saved && position !== "0"
          ? isChicken
            ? "border-yellow-500/50 bg-yellow-500/[0.02] shadow-yellow-500/5"
            : "border-primary/40 bg-primary/[0.01]"
          : "border-border bg-card/60"
        }`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/[0.01]"
      >
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono font-bold tracking-wider text-muted bg-surface border border-border px-2 py-1 rounded-lg">
            Slot {team.slot}
          </span>
          <div>
            <span className="font-bold text-sm text-foreground">{team.name}</span>
            {team.teamIdCustom && (
              <span className="ml-2 text-xs font-mono font-bold text-muted bg-surface/80 border border-border/40 px-1.5 py-0.5 rounded">
                {team.teamIdCustom}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {position !== "0" && (
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${isChicken
                  ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
                  : "bg-primary/10 border-primary/20 text-primary"
                }`}
            >
              {isChicken ? "🍗 Chicken Winner" : `Position #${position}`}
            </span>
          )}
          <span className="text-xs font-bold text-muted group-hover:text-foreground">
            {open ? "▼ Collapse" : "▲ Expand"}
          </span>
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-border/80 bg-background/25 flex flex-col gap-5 pt-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col gap-1.5 w-full sm:max-w-xs">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-muted">
                  Position
                </label>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg font-mono">
                  {position && position !== "0" ? `#${position}` : "Unset (0)"}
                </span>
              </div>
              {isAdmin ? (
                <div className="flex items-center gap-2 mt-1 w-full">
                  <span className="text-xs text-muted/60 font-mono">0</span>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={position}
                    onChange={(e) => {
                      setPosition(e.target.value);
                    }}
                    className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <span className="text-xs text-muted/60 font-mono">30</span>
                </div>
              ) : (
                <span className="text-sm font-mono font-bold text-foreground bg-surface px-3 py-1.5 rounded-lg border border-border w-fit">
                  {position && position !== "0" ? `#${position}` : "Not Played"}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-xs text-muted font-medium">
                Players: <span className="text-foreground font-bold">{players.length}</span> / 10
              </div>

              {isAdmin && (
                <div className="text-xs font-semibold">
                  {saving ? (
                    <span className="text-yellow-500 animate-pulse flex items-center gap-1">⏳ Saving...</span>
                  ) : saved ? (
                    <span className="text-green-500 flex items-center gap-1">✓ Saved</span>
                  ) : (
                    <span className="text-muted/60">Waiting to save...</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              Roster & Finishes
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col gap-2 p-3.5 rounded-xl border border-border bg-background/30 justify-between"
                >
                  {isAdmin && editingPlayer === p.id ? (
                    <div className="flex gap-2 w-full">
                      <input
                        value={editIgnValue}
                        onChange={(e) => setEditIgnValue(e.target.value)}
                        className="flex-1 px-2.5 py-1 rounded-lg border border-border text-xs bg-background"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEditIgnSave(p.id);
                          if (e.key === "Escape") setEditingPlayer(null);
                        }}
                      />
                      <button
                        onClick={() => handleEditIgnSave(p.id)}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-primary text-white"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingPlayer(null)}
                        className="text-[10px] font-bold text-muted hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 max-w-[70%]">
                          <span className="text-xs font-semibold text-foreground truncate" title={p.ign}>
                            {p.ign}
                          </span>
                          {isAdmin && (
                            <button
                              onClick={() => {
                                setEditingPlayer(p.id);
                                setEditIgnValue(p.ign);
                              }}
                              className="text-[10px] text-muted hover:text-primary transition-colors"
                            >
                              ✏️
                            </button>
                          )}
                        </div>
                        <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          {playerKills[p.id] ?? "0"} kill{playerKills[p.id] !== "1" ? "s" : ""}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 w-full mt-1">
                        {isAdmin ? (
                          <>
                            <span className="text-[10px] text-muted/60 font-mono">0</span>
                            <input
                              type="range"
                              min="0"
                              max="30"
                              step="1"
                              value={playerKills[p.id] ?? "0"}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPlayerKills((prev) => ({ ...prev, [p.id]: val }));
                              }}
                              className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <span className="text-[10px] text-muted/60 font-mono">30</span>
                          </>
                        ) : (
                          <span className="text-xs font-mono font-bold text-foreground bg-surface/80 border border-border/40 px-2.5 py-0.5 rounded-lg">
                            {playerKills[p.id] ?? 0} kills
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {isAdmin && players.length < 10 && (
              <div className="mt-1">
                {addingPlayer ? (
                  <div className="flex gap-2 max-w-sm">
                    <input
                      value={newIgn}
                      onChange={(e) => setNewIgn(e.target.value)}
                      placeholder="Player IGN"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-border text-xs bg-background/50"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddPlayer();
                        if (e.key === "Escape") setAddingPlayer(false);
                      }}
                    />
                    <button
                      onClick={handleAddPlayer}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-primary text-white"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setAddingPlayer(false)}
                      className="text-xs font-bold text-muted hover:text-foreground px-2"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingPlayer(true)}
                    className="text-xs font-semibold text-muted hover:text-primary transition-colors"
                  >
                    ➕ Add Player
                  </button>
                )}
              </div>
            )}
          </div>

          {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
        </div>
      )}
    </div>
  );
}
