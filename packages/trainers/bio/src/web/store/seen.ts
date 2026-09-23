// The student's recently served tasks, oldest first. Sent as `excludeIds` so the pool prefers what
// they have not seen; once a paragraph is used up the server repeats from it anyway, so this list
// decides what comes first, never what can come at all.

/** How many ids the browser keeps — enough for weeks of sessions, small enough for a request body. */
export const SEEN_LIMIT = 1000;

/** Adds a session's tasks as the most recent ones. A repeat moves to the end rather than piling up. */
export function rememberSeen(seen: readonly string[], ids: readonly string[]): string[] {
  const fresh = new Set(ids);
  return [...seen.filter((id) => !fresh.has(id)), ...ids].slice(-SEEN_LIMIT);
}

/** How many of a session's tasks the student had already been given. */
export function countRepeats(seen: readonly string[], ids: readonly string[]): number {
  const before = new Set(seen);
  return ids.filter((id) => before.has(id)).length;
}
