import { Easing, interpolate } from "remotion";
import timeline from "./timeline.json";

export type Line = { id: string; who: "A" | "B"; caption: string; start: number; end: number; env: number[]; words: { w: string; t: number }[] };
export const TL = timeline as { end: number; lines: Line[] };
export const FPS = 60;
export const L = (id: string) => TL.lines.find((l) => l.id === id)!;

export const ease = Easing.bezier(0.33, 0, 0.2, 1);
export const r = (t: number, a: number, b: number, e = ease) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

/** Face / pose parameters shared by both character rigs */
export type Pose = {
  browL: number; browR: number;      // raise (-1..1.2)
  browAng: number;                    // + = worried (inner ends up), - = angry
  eyeOpen: number;                    // 0 closed .. 1 open
  eyeScale: number;                   // 1 normal, >1 wide
  lookX: number; lookY: number;       // -1..1
  mouth: number;                      // extra open amount (0..1), lip-sync is added on top
  smile: number;                      // -1 frown .. 1 smile
  smirk: number;                      // 0..1 asymmetric
  tilt: number;                       // head tilt degrees
  turn: number;                       // -1..1 face turn (features shift)
  lean: number;                       // body lean forward 0..1.3
  phoneY: number;                     // A: 0 = held up, 1 = lowered
  glasses: number;                    // B: 0 = normal, 1 = slid down the nose
  blush: number;
};
export const BASE: Pose = { browL: 0, browR: 0, browAng: 0, eyeOpen: 1, eyeScale: 1, lookX: 0, lookY: 0, mouth: 0, smile: 0, smirk: 0,
  tilt: 0, turn: 0, lean: 0, phoneY: 0, glasses: 0, blush: 0 };

/** keyframed pose: list of [time, partial pose]; values ease between keys and hold after the last one */
export type Key = [number, Partial<Pose>, number?];
export const poseAt = (t: number, keys: Key[], dur = 0.35): Pose => {
  let p: Pose = { ...BASE };
  for (const [kt, kp, d] of keys) {
    const k = r(t, kt, kt + (d ?? dur));
    if (k <= 0) break;
    const n = { ...p, ...kp } as Pose;
    (Object.keys(p) as (keyof Pose)[]).forEach((key) => { p = { ...p, [key]: mix(p[key], n[key], k) }; });
  }
  return p;
};

/** lip-sync: mouth openness from the line's 60 fps loudness envelope */
export const talk = (t: number, who: "A" | "B") => {
  for (const l of TL.lines) {
    if (l.who !== who || t < l.start || t > l.end + 0.05) continue;
    const i = Math.floor((t - l.start) * FPS);
    const a = l.env[Math.max(0, Math.min(l.env.length - 1, i))] ?? 0;
    const b = l.env[Math.max(0, Math.min(l.env.length - 1, i - 2))] ?? 0;
    return clamp((a * 0.7 + b * 0.3) * 1.1, 0, 1);
  }
  return 0;
};

/** natural blinking: deterministic schedule per character, plus forced blinks */
export const blinkAt = (t: number, seed: number, extra: number[] = []) => {
  const times: number[] = [...extra];
  let x = 0.6 + seed * 0.37;
  let s = seed * 9301 + 49297;
  while (x < 40) { times.push(x); s = (s * 9301 + 49297) % 233280; x += 2.2 + (s / 233280) * 2.6; }
  for (const b of times) {
    const d = t - b;
    if (d >= 0 && d < 0.16) return d < 0.07 ? 1 - d / 0.07 : (d - 0.07) / 0.09;
  }
  return 1;
};
