export function formatDate(epochMs: number): string {
  return new Date(epochMs).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}
