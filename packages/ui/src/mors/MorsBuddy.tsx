// Mors as a companion in the corner of the screen. He listens to the bus (bus.ts) and reacts: hops at
// a right answer, tilts his head at a wrong one, spins after a flawless game, dozes off when nobody
// has touched the page for a while and enjoys being petted. He speaks only now and then — a word
// after every answer would turn into noise. The student can send him away; he then shrinks to a paw
// button and stays away on the next visit too.
import { useCallback, useEffect, useRef, useState } from "react";
import { emitMors, MORS_PRIORITY, onMors, type MorsEvent, type MorsEventKind } from "./bus.ts";
import { Mors, type MorsMood } from "./Mors.tsx";

export type MorsLines = Partial<Record<MorsEventKind | "pet" | "petMany", readonly string[]>>;

export interface MorsBuddyLabels {
  /** the dog button: "pet Mors" */
  pet: string;
  /** send Mors away */
  hide: string;
  /** bring him back */
  show: string;
}

interface Props {
  lines: MorsLines;
  labels: MorsBuddyLabels;
  /** minutes of silence before he lies down to sleep */
  sleepAfterMs?: number;
}

const HIDDEN_KEY = "mors:hidden";

const MOOD: Record<MorsEventKind, MorsMood> = {
  greet: "happy",
  right: "happy",
  wrong: "wrong",
  done: "happy",
  perfect: "celebrate",
  streak: "celebrate",
  almost: "think",
  practice: "happy",
};

const MOOD_MS: Partial<Record<MorsMood, number>> = { happy: 1300, celebrate: 2600, wrong: 2400, think: 2600, pet: 1900 };

function readHidden(): boolean {
  try {
    return localStorage.getItem(HIDDEN_KEY) === "1";
  } catch {
    return false;
  }
}
function writeHidden(hidden: boolean) {
  try {
    if (hidden) localStorage.setItem(HIDDEN_KEY, "1");
    else localStorage.removeItem(HIDDEN_KEY);
  } catch {
    /* private mode: he just comes back next time */
  }
}

const pick = (list: readonly string[] | undefined): string | null => (list?.length ? list[Math.floor(Math.random() * list.length)]! : null);

export function MorsBuddy({ lines, labels, sleepAfterMs = 75_000 }: Props) {
  const [hidden, setHidden] = useState(readHidden);
  const [mood, setMood] = useState<MorsMood>("idle");
  const [bubble, setBubble] = useState<{ text: string; key: number } | null>(null);

  const moodTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const sleepTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const current = useRef<{ priority: number; at: number }>({ priority: -1, at: 0 });
  const lastSpoke = useRef(0);
  const pets = useRef<number[]>([]);
  const linesRef = useRef(lines);
  linesRef.current = lines;

  const say = useCallback((text: string | null) => {
    if (!text) return;
    clearTimeout(bubbleTimer.current);
    lastSpoke.current = Date.now();
    setBubble({ text, key: Date.now() });
    bubbleTimer.current = setTimeout(() => setBubble(null), Math.min(6500, 2200 + text.length * 45));
  }, []);

  const feel = useCallback((next: MorsMood) => {
    clearTimeout(moodTimer.current);
    setMood(next);
    const ms = MOOD_MS[next];
    if (ms) moodTimer.current = setTimeout(() => setMood("idle"), ms);
  }, []);

  // a hello when he arrives on a screen, unless the page has already said something
  useEffect(() => {
    if (hidden) return;
    const t = setTimeout(() => emitMors("greet"), 900);
    return () => clearTimeout(t);
  }, [hidden]);

  // events from the page
  useEffect(() => {
    if (hidden) return;
    return onMors((e: MorsEvent) => {
      const now = Date.now();
      const priority = MORS_PRIORITY[e.kind];
      // two events in one moment (last right step = game over): the weightier one wins
      if (now - current.current.at < 450 && priority <= current.current.priority) return;
      current.current = { priority, at: now };
      feel(MOOD[e.kind]);

      const quiet = now - lastSpoke.current;
      const talk =
        e.say !== undefined ||
        (e.kind === "right" ? quiet > 12_000 && Math.random() < 0.45 : e.kind === "wrong" ? quiet > 7_000 : true);
      if (talk) say((e.say ?? pick(linesRef.current[e.kind]))?.replace("{n}", String(e.n ?? "")) ?? null);
    });
  }, [hidden, feel, say]);

  // nap when the page has been left alone, wake up at the first sign of life
  useEffect(() => {
    if (hidden) return;
    const arm = () => {
      clearTimeout(sleepTimer.current);
      sleepTimer.current = setTimeout(() => {
        setBubble(null);
        clearTimeout(moodTimer.current);
        setMood("sleep");
      }, sleepAfterMs);
    };
    const wake = () => {
      setMood((m) => (m === "sleep" ? "idle" : m));
      arm();
    };
    const events = ["pointerdown", "keydown", "scroll", "wheel"] as const;
    for (const ev of events) window.addEventListener(ev, wake, { passive: true });
    arm();
    return () => {
      for (const ev of events) window.removeEventListener(ev, wake);
      clearTimeout(sleepTimer.current);
    };
  }, [hidden, sleepAfterMs]);

  useEffect(
    () => () => {
      clearTimeout(moodTimer.current);
      clearTimeout(bubbleTimer.current);
    },
    [],
  );

  const pet = () => {
    const now = Date.now();
    pets.current = [...pets.current.filter((t) => now - t < 5000), now];
    if (pets.current.length >= 5) {
      pets.current = [];
      feel("celebrate");
      say(pick(linesRef.current.petMany));
    } else {
      feel("pet");
      say(pick(linesRef.current.pet));
    }
  };

  const hide = () => {
    writeHidden(true);
    setHidden(true);
    setBubble(null);
  };
  const show = () => {
    writeHidden(false);
    setHidden(false);
    feel("happy");
  };

  if (hidden) {
    return (
      <button
        type="button"
        onClick={show}
        aria-label={labels.show}
        title={labels.show}
        className="fixed right-3 bottom-3 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-md ring-1 ring-slate-200 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-indigo-500 print:hidden"
      >
        🐾
      </button>
    );
  }

  return (
    <div className="pointer-events-none fixed right-1 bottom-0 z-40 flex flex-col items-end sm:right-4 print:hidden" data-mors-buddy="">
      {bubble && (
        <div
          key={bubble.key}
          aria-hidden
          className="mors-bubble relative mr-2 mb-1 max-w-[230px] rounded-2xl bg-white px-3.5 py-2 text-sm leading-snug font-medium text-slate-800 shadow-lg ring-1 ring-slate-200 sm:max-w-[260px]"
        >
          {bubble.text}
          <span className="absolute right-8 -bottom-1.5 h-3 w-3 rotate-45 bg-white ring-1 ring-slate-200 [clip-path:polygon(100%_0,100%_100%,0_100%)]" />
        </div>
      )}
      <div className="group relative mors-peek">
        <button
          type="button"
          onClick={pet}
          aria-label={labels.pet}
          className="pointer-events-auto block cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          <Mors mood={mood} size={104} className="h-auto w-[68px] sm:w-[104px]" />
        </button>
        <button
          type="button"
          onClick={hide}
          aria-label={labels.hide}
          title={labels.hide}
          className="pointer-events-auto absolute -top-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs text-slate-500 shadow ring-1 ring-slate-200 transition-opacity hover:text-slate-800 focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
