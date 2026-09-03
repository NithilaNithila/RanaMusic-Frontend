export function formatDuration(seconds = 0) {
  const s = Number(seconds);
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}
