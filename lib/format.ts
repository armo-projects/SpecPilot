export function formatDateTime(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(value);
}

export function formatRelativeTime(value: Date): string {
  const now = Date.now();
  const diffMs = value.getTime() - now;
  const absMs = Math.abs(diffMs);

  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (absMs < hour) {
    const minutes = Math.round(diffMs / minute);
    return rtf.format(minutes, "minute");
  }
  if (absMs < day) {
    const hours = Math.round(diffMs / hour);
    return rtf.format(hours, "hour");
  }

  const days = Math.round(diffMs / day);
  return rtf.format(days, "day");
}
