import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { TL, T, r, mix, pop, EIO, EO } from "./lib";
import { PhoneScreen, SW, SH, FONT, AppIcon, Sparkle } from "./components";

const PW = 700, PH = 1442, BZ = 14;

// ---------- iPhone frame ----------
const Phone: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: PW, height: PH, borderRadius: 112,
    background: "linear-gradient(145deg, #4A4A50 0%, #26262A 30%, #3A3A40 60%, #1E1E22 100%)",
    boxShadow: "0 60px 120px rgba(0,0,0,0.65), 0 0 0 1.5px rgba(255,255,255,0.10), 0 0 140px rgba(10,132,255,0.16)" }}>
    <div style={{ position: "absolute", inset: 5, borderRadius: 107, background: "#0A0A0C" }} />
    <div style={{ position: "absolute", left: BZ, top: BZ, width: SW, height: SH, borderRadius: 98, overflow: "hidden", background: "#000" }}>
      <PhoneScreen t={t} />
      {/* Dynamic Island: static hardware cut-out, never animated */}
      <div style={{ position: "absolute", left: SW / 2 - 64, top: 18, width: 128, height: 38, borderRadius: 20, background: "#000" }} />
      {/* subtle glass reflection */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(125deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 32%)", pointerEvents: "none" }} />
    </div>
    {/* side buttons */}
    <div style={{ position: "absolute", left: -5, top: 300, width: 5, height: 70, borderRadius: 3, background: "#3A3A40" }} />
    <div style={{ position: "absolute", left: -5, top: 400, width: 5, height: 110, borderRadius: 3, background: "#3A3A40" }} />
    <div style={{ position: "absolute", right: -5, top: 420, width: 5, height: 160, borderRadius: 3, background: "#3A3A40" }} />
  </div>
);

// ---------- camera ----------
const camera = (t: number) => {
  // [scale, top]
  const A = [1.04, 300], B = [1.13, 40], C = [1.06, 215];
  const kIn = r(t, T.camInA, T.camInB, EIO), kOut = r(t, T.camOutA, T.camOutB, EIO);
  let s = mix(A[0], B[0], kIn), top = mix(A[1], B[1], kIn);
  s = mix(s, C[0], kOut); top = mix(top, C[1], kOut);
  const ex = r(t, T.exitA, T.exitB, EIO);
  s *= 1 - 0.08 * ex; top += 340 * ex;
  // breathing float
  top += Math.sin(t * 0.8) * 3;
  return { s, top, opacity: 1 - r(t, T.exitA + 0.2, T.exitB), blur: 10 * ex };
};

// ---------- captions ----------
const KEYS: Record<number, string[]> = { 1: ["staring"], 3: ["sound", "right."], 4: ["ReplyRight"], 5: ["Copy"], 6: ["vibe,"],
  7: ["sounds", "like", "you."], 8: ["One", "tap,"], 9: ["switching", "apps"], 11: ["REPLY."] };
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const c = TL.vo.find((v) => t >= v.capIn && t < v.capOut + 0.15);
  if (!c) return null;
  const a = r(t, c.capIn, c.capIn + 0.15) * (1 - r(t, c.capOut, c.capOut + 0.15));
  const keys = KEYS[c.i] || [];
  return (
    <div style={{ position: "absolute", top: 118, left: 0, width: 1080, display: "flex", justifyContent: "center", opacity: a }}>
      <div style={{ maxWidth: 900, padding: "20px 34px", borderRadius: 30, background: "rgba(14,14,17,0.66)", backdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.06)", textAlign: "center", fontFamily: FONT, fontSize: 47, lineHeight: 1.26, fontWeight: 600,
        color: "#fff", letterSpacing: -0.4, transform: `translateY(${(1 - a) * 8}px)` }}>
        {c.caption.split(" ").map((w, i) => (
          <span key={i} style={{ color: keys.includes(w) ? "#7CC0FF" : "#fff" }}>{w}{" "}</span>
        ))}
      </div>
    </div>
  );
};

// ---------- end cards ----------
const EndCards: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.wordmark - 0.1) return null;
  const a = r(t, T.wordmark, T.wordmark + 0.8);
  const tg = r(t, T.tagline, T.tagline + 0.7);
  const s6 = r(t, T.s6, T.s6 + 0.9, EIO);
  const cta = r(t, T.cta, T.cta + 0.6);
  const disc = r(t, T.disclaimer, T.disclaimer + 0.6);
  const pulse = t > T.cta + 0.6 ? 0.5 + 0.5 * Math.sin((t - T.cta) * 2.4) : 0;
  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: "#fff" }}>
      <div style={{ position: "absolute", left: 0, width: 1080, top: mix(640, 520, s6), display: "flex", flexDirection: "column", alignItems: "center",
        opacity: a, transform: `translateY(${(1 - a) * 30}px) scale(${mix(1, 0.86, s6)})` }}>
        <div style={{ transform: `scale(${0.85 + 0.15 * pop(t, T.wordmark, 0.7)})` }}><AppIcon size={168} /></div>
        <div style={{ marginTop: 40, fontSize: 112, fontWeight: 700, letterSpacing: -3, fontFamily: "Inter Display, Inter" }}>ReplyRight</div>
        <div style={{ marginTop: 18, fontSize: 54, fontWeight: 500, letterSpacing: -0.8, opacity: tg * (1 - s6), color: "rgba(255,255,255,0.86)",
          transform: `translateY(${(1 - tg) * 12}px)`, height: 70 }}>
          Your words. <span style={{ background: "linear-gradient(90deg,#6CB8FF,#8E8CFF)", WebkitBackgroundClip: "text", color: "transparent" }}>Just better.</span>
        </div>
      </div>
      {/* coming soon */}
      <div style={{ position: "absolute", top: 1004, width: 1080, textAlign: "center", opacity: s6, transform: `translateY(${(1 - s6) * 16}px)`,
        fontSize: 38, fontWeight: 600, letterSpacing: 9, color: "rgba(255,255,255,0.72)" }}>
        — COMING SOON —
      </div>
      {/* CTA */}
      <div style={{ position: "absolute", top: 1110, width: 1080, display: "flex", justifyContent: "center", opacity: cta,
        transform: `translateY(${(1 - cta) * 24}px) scale(${0.94 + 0.06 * pop(t, T.cta, 0.6)})` }}>
        <div style={{ padding: "34px 64px", borderRadius: 44, textAlign: "center",
          background: "linear-gradient(135deg, #0A84FF 0%, #3D6BFF 55%, #5E5CE6 100%)",
          boxShadow: `0 20px 60px rgba(10,132,255,${0.35 + 0.25 * pulse}), 0 0 0 ${2 + 6 * pulse}px rgba(108,184,255,${0.18 * pulse})` }}>
          <div style={{ fontSize: 60, fontWeight: 800, letterSpacing: 1 }}>COMMENT “REPLY”</div>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: 6, marginTop: 6, opacity: 0.92 }}>FOR EARLY ACCESS</div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 1420, width: 1080, textAlign: "center", opacity: disc * 0.9, fontSize: 25, fontWeight: 500, color: "rgba(255,255,255,0.5)" }}>
        Concept preview of an upcoming app. Not yet available.
      </div>
    </AbsoluteFill>
  );
};

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = camera(t);
  const glowX = 540 + Math.sin(t * 0.35) * 120, glowY = 1000 + Math.cos(t * 0.3) * 120;
  return (
    <AbsoluteFill style={{ background: "#0B0B0E", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(900px 900px at ${glowX}px ${glowY}px, rgba(10,132,255,0.16), rgba(10,132,255,0) 70%),
        radial-gradient(700px 700px at 140px 260px, rgba(94,92,230,0.12), rgba(94,92,230,0) 70%),
        linear-gradient(180deg, #17171B 0%, #0B0B0E 100%)` }} />
      {cam.opacity > 0.001 && (
        <div style={{ position: "absolute", left: 540 - (PW * cam.s) / 2, top: cam.top, width: PW, height: PH, transformOrigin: "0 0",
          transform: `scale(${cam.s})`, opacity: cam.opacity, filter: cam.blur > 0.05 ? `blur(${cam.blur}px)` : undefined }}>
          <Phone t={t} />
        </div>
      )}
      <EndCards t={t} />
      {/* soft vignette behind captions for legibility */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 380, background: "linear-gradient(180deg, rgba(8,8,10,0.55), rgba(8,8,10,0))" }} />
      <Captions t={t} />
    </AbsoluteFill>
  );
};
