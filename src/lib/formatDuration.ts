export function formatDuration(ms: number): string {
  const minutes = Math.max(1, Math.round(ms / 60_000))
  return `${minutes} min`
}
