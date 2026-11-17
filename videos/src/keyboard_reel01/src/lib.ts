import { Easing, interpolate } from "remotion";
import timeline from "./timeline.json";

export const TL = timeline as {
  end: number;
  vo: { i: number; caption: string; start: number; end: number; capIn: number; capOut: number; file: string }[];
};
export const FPS = 60;

export const EO = Easing.bezier(0.22, 1, 0.36, 1); // smooth ease-out
export const EIO = Easing.bezier(0.65, 0, 0.35, 1); // ease-in-out
export const r = (t: number, a: number, b: number, ease = EO) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;
/** gentle overshoot for UI pops */
export const pop = (t: number, a: number, d = 0.45) => {
  const x = Math.min(1, Math.max(0, (t - a) / d));
  const c = 1.25;
  return x === 0 ? 0 : 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
};

// ---------- master timing (seconds) ----------
export const T = {
  incoming: 0.35,
  drafts: [
    { text: "haha idk maybe saturday", a: 5.6, b: 7.75, hold: 8.75, del: 9.35 },
    { text: "Whenever you want 😂", a: 9.75, b: 11.3, hold: 12.55, del: 13.0 },
  ],
  bubblePress: 13.35, menuOpen: 13.55, copyTap: 14.55, menuClose: 14.7, hudIn: 14.95, hudOut: 15.9,
  globePress: 16.05, switcherOpen: 16.25, dragA: 16.55, dragB: 16.95, release: 17.2,
  swapA: 17.2, swapB: 18.0, camInA: 17.35, camInB: 18.6,
  pasteTap: 21.0, flirtyTap: 22.95, genA: 23.05, genB: 24.05, streamB: 25.5,
  useTap: 28.7, flyA: 28.8, flyB: 29.45, camOutA: 28.9, camOutB: 29.9,
  sendTap: 30.95, sent: 31.05, delivered: 31.65, theirTyping: 32.5,
  exitA: 34.0, exitB: 34.9, wordmark: 34.55, tagline: 35.6,
  s6: 39.3, cta: 41.45, disclaimer: 42.4,
};

export const INCOMING = "So when are you taking me on a date? 😉";
export const REPLY = "That depends. Are you free this Saturday? 😉";

/** deterministic hesitant typing: returns number of characters typed */
export const charTimes = (text: string, a: number, b: number, seed: number) => {
  const chars = Array.from(text);
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const w = chars.map((c) => (c === " " ? 1.7 : 0.6 + rnd() * 1.1));
  const tot = w.reduce((x, y) => x + y, 0);
  let acc = 0;
  return w.map((v) => (acc += v, a + ((acc - v * 0.5) / tot) * (b - a)));
};

export type Draft = { text: string; lastTyped: number; lastChar: string | null; deleting: boolean };
export const composerAt = (t: number): Draft => {
  for (let i = 0; i < T.drafts.length; i++) {
    const d = T.drafts[i];
    const nextA = i + 1 < T.drafts.length ? T.drafts[i + 1].a : 1e9;
    if (t >= d.a - 0.01 && t < Math.min(nextA, d.del + 0.05)) {
      const chars = Array.from(d.text);
      if (t < d.hold) {
        const ct = charTimes(d.text, d.a, d.b, i + 3);
        const n = ct.filter((x) => x <= t).length;
        return { text: chars.slice(0, n).join(""), lastTyped: n ? ct[n - 1] : -1, lastChar: n ? chars[n - 1] : null, deleting: false };
      }
      // backspace held: accelerates
      const k = Math.min(1, Math.max(0, (t - d.hold) / (d.del - d.hold)));
      const n = Math.round(chars.length * (1 - k * k));
      return { text: chars.slice(0, n).join(""), lastTyped: -1, lastChar: null, deleting: n < chars.length };
    }
  }
  if (t >= T.flyB - 0.15 && t < T.sent) return { text: REPLY, lastTyped: -1, lastChar: null, deleting: false };
  return { text: "", lastTyped: -1, lastChar: null, deleting: false };
};

export const EMOJI: Record<string, string> = { "😉": "1f609", "😂": "1f602", "😊": "1f60a" };
