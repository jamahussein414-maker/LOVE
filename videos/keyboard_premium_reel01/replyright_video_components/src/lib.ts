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

// ---------- easing ----------
export const iosEase = Easing.bezier(0.25, 0.1, 0.25, 1);       // UIKit default curve
export const kbEase = Easing.bezier(0.38, 0.7, 0.125, 1);       // keyboard-like curve
export const r = (t: number, a: number, b: number, ease = iosEase) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------- the single interaction timeline (seconds), anchored to narration ----------
export const T = {
  incoming: 1.3,
  composerTap1: 5.6, kbUp1: 5.7,
  drafts: [
    { text: "haha maybe saturday?", a: 6.5, b: 8.6, hold: 9.3, del: 9.85 },
    { text: "whenever you want 😂", a: 10.2, b: 12.0, hold: 12.7, del: 13.15 },
  ],
  dismissTap: 18.45, kbDown: 18.55,
  longPress: V(5) + 3.6,          // finger goes down on the bubble
  menuOpen: V(5) + 4.15,          // context menu after a long-press
  copyTap: V(6) + 0.45, menuClose: V(6) + 0.6, copiedHint: V(6) + 0.7,
  composerTap2: 25.9, kbUp2: 26.0,
  globeDown: V(7) + 0.1, switcherOpen: V(7) + 0.35, slideA: V(7) + 0.75, slideB: V(7) + 1.15, globeUp: V(7) + 1.4,
  swapA: V(7) + 1.42, swapB: V(7) + 1.77,
  pasteTap: V(8) + 0.5, pasted: V(8) + 0.55,
  flirtyTap: V(10) + 1.05,
  generateTap: V(10) + 2.1, genA: V(10) + 2.15, genB: V(10) + 3.3,
  useTap: V(13) + 0.5, inserted: V(13) + 0.62,
  zoomA: V(14) - 0.5, zoomB: V(14) + 3.2,
  endA: V(15) - 1.2, endB: V(15) - 0.6,
};

export const INCOMING = "So when are you taking me out? 😉";
export const REPLY = "That depends. Are you free this Saturday? 😉";

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
  const rr = r(t, T.swapA, T.swapB);        // 0 = system keyboard, 1 = ReplyRight
  return { raised, rr };
};

export const EMOJI: Record<string, string> = { "😉": "1f609", "😂": "1f602", "😊": "1f60a" };
