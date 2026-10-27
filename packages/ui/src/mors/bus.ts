// A tiny event bus between whatever happens on a page and Mors. Games and pages only announce what
// happened ("right answer", "game finished without mistakes"); they don't know whether Mors is on
// screen, what he says or in which language. With no companion mounted the events simply go nowhere.

export type MorsEventKind =
  /** a lesson or a test has just opened */
  | "greet"
  /** one right step inside a game or a right answer in a test */
  | "right"
  /** a wrong step / answer */
  | "wrong"
  /** a game finished, with mistakes */
  | "done"
  /** a game finished without a single mistake */
  | "perfect"
  /** several right answers in a row (the count is in `n`) */
  | "streak"
  /** the student reached the last section of a lesson */
  | "almost"
  /** the "test yourself" block at the bottom of a lesson came into view */
  | "practice";

export interface MorsEvent {
  kind: MorsEventKind;
  /** a number the line can mention, e.g. the streak length */
  n?: number;
  /** a ready line that replaces the companion's own */
  say?: string;
}

/** Higher wins when two events arrive together (a game's last right step is also its finish; the
 * last section and the test block can scroll into view at once — the test is the better cue). */
export const MORS_PRIORITY: Record<MorsEventKind, number> = {
  greet: 0,
  almost: 0,
  practice: 1,
  right: 1,
  wrong: 2,
  done: 2,
  streak: 3,
  perfect: 3,
};

type Listener = (e: MorsEvent) => void;
const listeners = new Set<Listener>();

export function emitMors(kind: MorsEventKind, extra?: Omit<MorsEvent, "kind">) {
  const event = { kind, ...extra };
  for (const l of listeners) l(event);
}

export function onMors(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
