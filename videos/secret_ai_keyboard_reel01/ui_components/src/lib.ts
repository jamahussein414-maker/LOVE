import { Easing, interpolate } from "remotion";
import timeline from "./timeline.json";

export const TL = timeline as {
  end: number;
  vo: { i: number; caption: string; start: number; end: number; capIn: number; capOut: number; file: string }[];
};
export const FPS = 60;
const V = (i: number) => TL.vo[i].start;

// ---------- iPhone geometry, in points (measured from the 402x874 pt reference screenshots) ----------
export const PT = { W: 402, H: 874 };
export const K = 2.16;                 // px per pt in the 1080x1920 frame
export const SCREEN_X = (1080 - PT.W * K) / 2, SCREEN_Y = 16;
export const KB_H = 307;               // keyboard height incl. globe/mic row
export const KB_TOP = PT.H - KB_H;     // 567
export const COMPOSER_H = 41.5, COMPOSER_GAP = 19, HOME_GAP = 34;
export const BUBBLE_TOP = 198;
export const BUBBLE_H = 64;      // two-line incoming bubble

// ---------- easing ----------
export const iosEase = Easing.bezier(0.25, 0.1, 0.25, 1);       // UIKit default curve
export const kbEase = Easing.bezier(0.38, 0.7, 0.125, 1);       // keyboard-like curve
export const r = (t: number, a: number, b: number, ease = iosEase) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------- the single interaction timeline (seconds), anchored to narration ----------
export const T = {
  incoming: 0.08, hookA: 0.25, hookB: 1.85,
  composerTap1: 1.95, kbUp1: 2.05,
  drafts: [
    { text: "haha maybe saturday?", a: 2.45, b: 3.85, hold: 4.35, del: 4.75 },
    { text: "Whenever you want 😂", a: 4.95, b: 6.0, hold: 6.35, del: 6.6 },
  ],
  dismissTap: 6.75, kbDown: 6.85,
  longPress: 7.15, menuOpen: 7.65, copyTap: 8.35, menuClose: 8.5, copiedHint: 8.6,
  composerTap2: 9.05, kbUp2: 9.15,
  globeDown: 9.65, switcherOpen: 9.9, slideA: 10.2, slideB: 10.55, globeUp: 10.8,
  swapA: 10.82, swapB: 11.15,
  pasteTap: 11.8, pasted: 11.85,
  flirtyTap: 14.0,
  generateTap: 14.85, genA: 14.9, genB: 15.85, streamB: 16.75,
  useTap: 20.85, flyA: 20.95, flyB: 21.42, inserted: 21.38,
  endA: 25.3, endB: 25.8,
  less: 25.85, more: 26.95, cta: 28.6, soon: 29.5,
};

export const INCOMING = "So when are you taking me on a date? 😉";
export const REPLY = "I was wondering when you’d ask 😌 Saturday?";

/** human-like typing: uneven per-character timing, spaces slightly longer */
export const charTimes = (text: string, a: number, b: number, seed: number) => {
  const chars = Array.from(text);
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const w = chars.map((c) => (c === " " ? 1.6 : 0.65 + rnd() * 1.0));
  const tot = w.reduce((x, y) => x + y, 0);
  let acc = 0;
  return w.map((v) => ((acc += v), a + ((acc - v * 0.5) / tot) * (b - a)));
};

export type Composer = { text: string; lastTyped: number; lastChar: string | null; deleting: boolean };
export const composerAt = (t: number): Composer => {
  for (let i = 0; i < T.drafts.length; i++) {
    const d = T.drafts[i];
    const nextA = i + 1 < T.drafts.length ? T.drafts[i + 1].a : 1e9;
    if (t >= d.a - 0.01 && t < Math.min(nextA, d.del + 0.05)) {
      const chars = Array.from(d.text);
      if (t < d.hold) {
        const ct = charTimes(d.text, d.a, d.b, i + 5);
        const n = ct.filter((x) => x <= t).length;
        return { text: chars.slice(0, n).join(""), lastTyped: n ? ct[n - 1] : -1, lastChar: n ? chars[n - 1] : null, deleting: false };
      }
      const k = Math.min(1, Math.max(0, (t - d.hold) / (d.del - d.hold)));
      const n = Math.round(chars.length * (1 - k));
      return { text: chars.slice(0, n).join(""), lastTyped: -1, lastChar: null, deleting: n < chars.length && n > 0 };
    }
  }
  if (t >= T.inserted) return { text: REPLY, lastTyped: -1, lastChar: null, deleting: false };
  return { text: "", lastTyped: -1, lastChar: null, deleting: false };
};

/** which keyboard is showing and how far it is raised (0..1) */
export const keyboardAt = (t: number) => {
  const up1 = r(t, T.kbUp1, T.kbUp1 + 0.35, kbEase) * (1 - r(t, T.kbDown, T.kbDown + 0.35, kbEase));
  const up2 = r(t, T.kbUp2, T.kbUp2 + 0.35, kbEase);
  const raised = Math.max(up1, up2);
  const rr = r(t, T.swapA, T.swapB);        // 0 = system keyboard, 1 = AI keyboard
  return { raised, rr };
};

export const EMOJI: Record<string, string> = { "😉": "1f609", "😂": "1f602", "😊": "1f60a", "😌": "1f60c" };
