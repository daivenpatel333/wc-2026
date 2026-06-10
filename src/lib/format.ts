/** Shared display formatting for points, dates, and names. */

export function formatPoints(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function formatSignedPoints(value: number): string {
  const formatted = formatPoints(Math.abs(value));
  return value < 0 ? `-${formatted}` : `+${formatted}`;
}

/**
 * Deterministic UTC formatting: server-rendered and client-hydrated output
 * must match regardless of host timezone/locale, so the locale and zone are
 * pinned instead of using the runtime defaults.
 */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  const formatted = date.toLocaleString("en-GB", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${formatted} UTC`;
}

export function formatCountdown(lockAtIso: string, now: Date = new Date()): string | null {
  const remaining = Date.parse(lockAtIso) - now.getTime();
  if (Number.isNaN(remaining) || remaining <= 0) {
    return null;
  }
  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/** Compact surname-ish label for pitch tokens: "K. Mbappé". */
export function shortPlayerName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0];
  }
  const last = parts.slice(1).join(" ");
  return `${parts[0][0]}. ${last}`;
}
