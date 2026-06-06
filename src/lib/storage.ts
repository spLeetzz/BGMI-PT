const KEY = "bgmi_tournaments";
const TOKENS_KEY = "bgmi_admin_tokens";

export function getTournaments(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getAdminToken(slug: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    const dict = raw ? JSON.parse(raw) : {};
    return dict[slug] || null;
  } catch {
    return null;
  }
}

export function saveAdminToken(slug: string, token: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    const dict = raw ? JSON.parse(raw) : {};
    dict[slug] = token;
    localStorage.setItem(TOKENS_KEY, JSON.stringify(dict));

    // Also set a document cookie so server-side renders can read it
    document.cookie = `admin_token_${slug}=${token}; path=/; max-age=31536000; SameSite=Lax`;
  } catch (e) {
    console.error("Failed to save admin token", e);
  }
}

export function addTournament(slug: string, token?: string): void {
  if (typeof window === "undefined") return;
  const existing = getTournaments();
  if (!existing.includes(slug)) {
    localStorage.setItem(KEY, JSON.stringify([slug, ...existing]));
  }
  if (token) {
    saveAdminToken(slug, token);
  }
}

export function removeTournament(slug: string): void {
  if (typeof window === "undefined") return;
  const updated = getTournaments().filter((s) => s !== slug);
  localStorage.setItem(KEY, JSON.stringify(updated));

  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    const dict = raw ? JSON.parse(raw) : {};
    delete dict[slug];
    localStorage.setItem(TOKENS_KEY, JSON.stringify(dict));
  } catch {}

  // Delete cookie
  document.cookie = `admin_token_${slug}=; path=/; max-age=0; SameSite=Lax`;
}
