import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPlacementPoints(
  position: number,
  rules: { position: number; points: number }[]
): number {
  const rule = rules.find((r) => r.position === position);
  return rule?.points ?? 0;
}

export function apiResponse<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 500) {
  return Response.json({ success: false, error: message }, { status });
}
