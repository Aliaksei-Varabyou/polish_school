// Mors's animations live in one stylesheet, put into <head> once by whichever Mors renders first.
// Everything is a CSS transform on an SVG group, so the drawing stays crisp at any size and the
// browser animates it off the main thread. "prefers-reduced-motion" freezes him into still poses.
import { useInsertionEffect } from "react";

const CSS = `
.mors { overflow: visible; }
.mors g, .mors path, .mors ellipse, .mors circle, .mors rect, .mors text { transform-box: fill-box; }

/* idle: slow breathing, an ear that twitches now and then, eyes that blink */
.mors-body { transform-origin: 50% 100%; animation: mors-breathe 3.2s ease-in-out infinite; }
.mors-head { transform-origin: 50% 90%; transition: transform .35s cubic-bezier(.3,1.6,.5,1); }
.mors-ear-l { transform-origin: 70% 90%; transition: transform .3s ease; }
.mors-ear-r { transform-origin: 30% 90%; transition: transform .3s ease; }
.mors-idle .mors-ear-r, .mors-think .mors-ear-r { animation: mors-twitch 6s ease-in-out infinite; }
.mors-eyes-open { transform-origin: 50% 50%; animation: mors-blink 4.6s infinite; }

@keyframes mors-breathe { 0%,100% { transform: scale(1,1); } 50% { transform: scale(1.015,.985); } }
@keyframes mors-twitch { 0%,90%,100% { transform: rotate(0); } 93% { transform: rotate(12deg); } 96% { transform: rotate(-4deg); } }
@keyframes mors-blink { 0%,94%,100% { transform: scaleY(1); } 96% { transform: scaleY(.1); } }

/* the carrot tail: a lazy wag now and then, a fast one when happy, drooping when sad or asleep */
.mors-tail { transform-origin: 20% 96%; animation: mors-wag-slow 5s ease-in-out infinite; transition: transform .3s ease; }
.mors-happy .mors-tail, .mors-celebrate .mors-tail, .mors-pet .mors-tail { animation: mors-wag .22s ease-in-out infinite; }
.mors-wrong .mors-tail, .mors-sleep .mors-tail { animation: none; transform: rotate(28deg); }
@keyframes mors-wag { 0%,100% { transform: rotate(-16deg); } 50% { transform: rotate(16deg); } }
@keyframes mors-wag-slow { 0%,78%,100% { transform: rotate(0); } 82% { transform: rotate(-14deg); } 86% { transform: rotate(14deg); } 90% { transform: rotate(-12deg); } 94% { transform: rotate(10deg); } }
.mors-run-tail { transform-origin: 80% 95%; animation: mors-wag .18s ease-in-out infinite; }

/* happy: a hop and a wiggle of the whole dog */
.mors-happy .mors-all { transform-origin: 50% 100%; animation: mors-hop .55s cubic-bezier(.3,.7,.4,1) 2; }
.mors-happy .mors-head { transform: rotate(-4deg); }
@keyframes mors-hop {
  0% { transform: translateY(0) scale(1.04,.96); }
  40% { transform: translateY(-16%) scale(.97,1.03) rotate(-3deg); }
  70% { transform: translateY(0) scale(1.06,.94) rotate(2deg); }
  100% { transform: translateY(0) scale(1,1); }
}

/* celebrate: a bigger jump with a full spin, confetti flying out */
.mors-celebrate .mors-all { transform-origin: 50% 60%; animation: mors-spin 1s cubic-bezier(.3,.8,.3,1) 1, mors-hop .5s .95s 2; }
@keyframes mors-spin {
  0% { transform: translateY(0) rotate(0); }
  45% { transform: translateY(-22%) rotate(200deg); }
  100% { transform: translateY(0) rotate(360deg); }
}
.mors-confetti > * { opacity: 0; animation: mors-pop 1.4s ease-out .15s 1; transform-origin: 50% 50%; }
.mors-confetti > *:nth-child(2n) { animation-delay: .3s; }
.mors-confetti > *:nth-child(3n) { animation-delay: .45s; }
@keyframes mors-pop {
  0% { opacity: 0; transform: translate(0,0) scale(.3) rotate(0); }
  15% { opacity: 1; }
  100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(1) rotate(260deg); }
}

/* wrong: the classic puzzled head tilt, ears down a little */
.mors-wrong .mors-head { transform: rotate(-13deg); }
.mors-wrong .mors-ear-l { transform: rotate(-16deg); }
.mors-wrong .mors-ear-r { transform: rotate(10deg); }

/* think: head tilted the other way, a question mark bobbing */
.mors-think .mors-head { transform: rotate(9deg); }
.mors-bob { animation: mors-bob 1.4s ease-in-out infinite; }
@keyframes mors-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14%); } }

/* pet: eyes shut with pleasure, ears flat, hearts floating up */
.mors-pet .mors-ear-l { transform: rotate(-28deg); }
.mors-pet .mors-ear-r { transform: rotate(28deg); }
.mors-pet .mors-head { animation: mors-nuzzle .5s ease-in-out 3; }
@keyframes mors-nuzzle { 0%,100% { transform: rotate(0); } 50% { transform: rotate(7deg); } }
.mors-float > * { opacity: 0; animation: mors-rise 1.8s ease-out infinite; }
.mors-float > *:nth-child(2) { animation-delay: .6s; }
.mors-float > *:nth-child(3) { animation-delay: 1.2s; }
@keyframes mors-rise {
  0% { opacity: 0; transform: translateY(0) scale(.6); }
  20% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-160%) scale(1.1); }
}

/* sleep: slow deep breaths, head down, Zs drifting away */
.mors-sleep .mors-body { animation-duration: 4.5s; }
.mors-sleep .mors-head { transform: translateY(5%) rotate(-6deg); }
.mors-sleep .mors-ear-l { transform: rotate(-22deg); }
.mors-sleep .mors-ear-r { transform: rotate(22deg); }
.mors-zz > * { opacity: 0; animation: mors-zz 3s ease-out infinite; }
.mors-zz > *:nth-child(2) { animation-delay: 1s; }
.mors-zz > *:nth-child(3) { animation-delay: 2s; }
@keyframes mors-zz {
  0% { opacity: 0; transform: translate(0,0) scale(.5); }
  25% { opacity: 1; }
  100% { opacity: 0; transform: translate(60%,-120%) scale(1.2); }
}

/* the running Mors (loading screen) */
.mors-run-body { animation: mors-gallop .36s ease-in-out infinite; transform-origin: 50% 50%; }
@keyframes mors-gallop { 0%,100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-7%) rotate(-2deg); } }
.mors-leg { transform-origin: 50% 8%; animation: mors-leg .36s ease-in-out infinite; }
.mors-leg-b { animation-delay: -.18s; }
@keyframes mors-leg { 0%,100% { transform: rotate(32deg); } 50% { transform: rotate(-32deg); } }
.mors-run-ear { transform-origin: 50% 95%; animation: mors-flap .36s ease-in-out infinite; }
@keyframes mors-flap { 0%,100% { transform: rotate(0); } 50% { transform: rotate(-10deg); } }
.mors-tongue { transform-origin: 50% 0; animation: mors-tongue .36s ease-in-out infinite; }
@keyframes mors-tongue { 0%,100% { transform: rotate(8deg); } 50% { transform: rotate(-14deg); } }
.mors-dust > * { opacity: 0; animation: mors-dust .72s ease-out infinite; }
.mors-dust > *:nth-child(2) { animation-delay: .24s; }
.mors-dust > *:nth-child(3) { animation-delay: .48s; }
@keyframes mors-dust {
  0% { opacity: .8; transform: translateX(0) scale(.4); }
  100% { opacity: 0; transform: translateX(-160%) scale(1.3); }
}

/* the companion's entrance and its speech bubble */
.mors-peek { animation: mors-peek .6s cubic-bezier(.3,1.5,.5,1) both; }
@keyframes mors-peek { from { transform: translateY(110%); } to { transform: translateY(0); } }
.mors-bubble { animation: mors-bubble .28s cubic-bezier(.3,1.5,.5,1) both; transform-origin: 100% 100%; }
@keyframes mors-bubble { from { opacity: 0; transform: scale(.6); } to { opacity: 1; transform: scale(1); } }

@media (prefers-reduced-motion: reduce) {
  .mors *, .mors-peek, .mors-bubble { animation: none !important; transition: none !important; }
  .mors-confetti > *, .mors-float > *, .mors-zz > *, .mors-dust > * { opacity: 1; }
}
`;

let injected = false;

/** Puts the stylesheet into the document once; safe to call from every Mors on the page. */
export function useMorsStyles() {
  useInsertionEffect(() => {
    if (injected || typeof document === "undefined") return;
    injected = true;
    const style = document.createElement("style");
    style.dataset.mors = "";
    style.textContent = CSS;
    document.head.appendChild(style);
  }, []);
}
