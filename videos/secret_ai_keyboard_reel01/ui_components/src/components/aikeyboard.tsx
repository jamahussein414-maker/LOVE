// Generic "AI Writing" custom keyboard extension (concept prototype, unbranded).
// Points on a 402 pt wide keyboard, 307 pt tall. v2: larger controls + highlighted key moments.
import React from "react";
import { T, r, mix, REPLY, INCOMING } from "../lib";
import { C, SF, Rich, GlobeMicRow } from "./ios";

/** neutral sparkle glyph: no product logo */
export const AIIcon: React.FC<{ s: number }> = ({ s }) => (
  <div style={{ width: s, height: s, borderRadius: s * 0.27, background: "rgb(58,58,62)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <svg width={s * 0.62} height={s * 0.62} viewBox="0 0 24 24"><path fill="#fff" d="M12 2c.5 4.6 2.5 7.4 7.3 8.6.6.2.6.6 0 .8-4.8 1.2-6.8 4-7.3 8.6-.1.6-.5.6-.6 0-.5-4.6-2.5-7.4-7.3-8.6-.6-.2-.6-.6 0-.8C9.2 9.4 11.2 6.6 11.7 2c.1-.6.5-.6.6 0z" /><circle cx="19" cy="4.5" r="1.6" fill="#fff" /></svg>
  </div>
);

const TONES = ["Flirty", "Warm", "Funny", "Confident"];
const surface = "rgb(46,46,49)";
export const KBL = { toneY0: 100, toneY1: 76, toneH: 36, genY: 146, genH: 44, panelY: 120, panelH: 76, useY: 202, useH: 42 };

const Spinner: React.FC<{ t: number }> = ({ t }) => (
  <svg width="18" height="18" viewBox="0 0 16 16" style={{ transform: `rotate(${(t * 360 * 1.3) % 360}deg)` }}>
    {Array.from({ length: 8 }).map((_, i) => (
      <rect key={i} x="7.2" y="1" width="1.6" height="4" rx="0.8" fill="#fff" opacity={0.25 + (i / 8) * 0.75} transform={`rotate(${i * 45} 8 8)`} />
    ))}
  </svg>
);

const back = (x: number) => { const c = 1.6; x = Math.min(1, Math.max(0, x)); return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };

/** words of the reply appear one by one, like a streamed answer */
export const StreamedText: React.FC<{ text: string; k: number; size: number }> = ({ text, k, size }) => {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => {
        const a = Math.min(1, Math.max(0, k * words.length - i));
        return <span key={i} style={{ opacity: a, filter: `blur(${(1 - a) * 3}px)` }}><Rich text={w} size={size} />{i < words.length - 1 ? " " : ""}</span>;
      })}
    </>
  );
};

export const AIKeyboard: React.FC<{ t: number; enter: number }> = ({ t, enter }) => {
  const pasteK = r(t, T.pasted, T.pasted + 0.3);
  const pastePressed = t >= T.pasteTap && t < T.pasteTap + 0.16;
  const pastedBadge = r(t, T.pasted + 0.2, T.pasted + 0.4) * (1 - r(t, T.pasted + 1.6, T.pasted + 1.9));
  const sel = r(t, T.flirtyTap + 0.04, T.flirtyTap + 0.18);
  const selPop = t >= T.flirtyTap ? back((t - T.flirtyTap) / 0.45) : 0;
  const selGlow = sel * (0.55 + 0.45 * Math.max(0, Math.cos((t - T.flirtyTap) * 4)) * (1 - r(t, T.flirtyTap + 0.6, T.flirtyTap + 1.4)));
  const flirtyPressed = t >= T.flirtyTap && t < T.flirtyTap + 0.14;
  const genPressed = t >= T.generateTap && t < T.generateTap + 0.15;
  const generating = t >= T.genA && t < T.genB;
  const res = r(t, T.genB, T.genB + 0.4);
  const streamK = r(t, T.genB + 0.1, T.streamB, (x) => x);
  const usePressed = t >= T.useTap && t < T.useTap + 0.16;
  const ripple = t >= T.useTap && t < T.useTap + 0.6 ? (t - T.useTap) / 0.6 : -1;
  const readyPulse = res * (t < T.useTap ? 0.5 + 0.5 * Math.sin((t - T.streamB) * 4.5) : 0) * r(t, T.streamB, T.streamB + 0.3);

  const srcY = mix(46, 44, res), srcH = mix(44, 26, res);
  const toneY = mix(KBL.toneY0, KBL.toneY1, res);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: enter, transform: `translateY(${(1 - enter) * 8}px)` }}>
      {/* header */}
      <div style={{ position: "absolute", left: 12, top: 11, display: "flex", alignItems: "center", gap: 8, fontFamily: SF, color: "#fff" }}>
        <AIIcon s={24} /><span style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.3 }}>AI Writing</span>
      </div>
      <div style={{ position: "absolute", right: 14, top: 14 }}>
        <svg width="24" height="18" viewBox="0 0 24 18" fill="none" stroke="rgb(160,160,165)" strokeWidth="1.5"><rect x="1" y="1" width="22" height="16" rx="3" /><path d="M5 6h1.5M9 6h1.5M13 6h1.5M17 6h1.5M5 10h1.5M9 10h1.5M13 10h1.5M17 10h1.5M7 13.5h10" strokeLinecap="round" /></svg>
      </div>

      {/* source: paste button -> pasted message -> compact chip */}
      <div style={{ position: "absolute", left: 10, top: srcY, width: 382, height: srcH, borderRadius: mix(13, 9, res), background: pastePressed ? "rgb(70,70,74)" : surface,
        border: `1px solid ${pasteK > 0.5 && res < 0.5 ? "rgba(48,209,88,0.5)" : "transparent"}`, boxSizing: "border-box", overflow: "hidden", fontFamily: SF, color: "#fff" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 9, opacity: 1 - pasteK }}>
          <svg width="17" height="20" viewBox="0 0 16 19" fill="none" stroke={C.blue} strokeWidth="1.8" strokeLinejoin="round"><rect x="1" y="3" width="14" height="15" rx="2.5" /><rect x="4.5" y="1" width="7" height="4" rx="1.3" fill={surface} /></svg>
          <span style={{ fontSize: 17.5, fontWeight: 600, letterSpacing: -0.3 }}>Paste message</span>
        </div>
        <div style={{ position: "absolute", left: 12, right: 10, top: 0, bottom: 0, display: "flex", alignItems: "center", gap: 6, opacity: pasteK * (1 - res),
          transform: `translateY(${(1 - pasteK) * 5}px)` }}>
          <span style={{ fontSize: 15, letterSpacing: -0.35, flex: 1, whiteSpace: "nowrap" }}>“<Rich text={INCOMING} size={15} />”</span>
          <svg width="18" height="18" viewBox="0 0 16 16" style={{ flexShrink: 0, opacity: 0.4 + 0.6 * pastedBadge }}><circle cx="8" cy="8" r="8" fill="rgb(48,209,88)" /><path d="M4.5 8.2l2.3 2.3 4.7-4.8" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div style={{ position: "absolute", left: 12, right: 12, top: 0, bottom: 0, display: "flex", alignItems: "center", opacity: res, fontSize: 13, color: "rgb(160,160,165)", whiteSpace: "nowrap" }}>
          Replying to:&nbsp;<span style={{ color: "rgb(215,215,220)" }}><Rich text={INCOMING} size={13} /></span>
        </div>
      </div>

      {/* tone selector */}
      <div style={{ position: "absolute", left: 10, top: toneY, width: 382, height: KBL.toneH, display: "flex", gap: 7 }}>
        {TONES.map((n, i) => {
          const on = i === 0 ? sel : 0;
          const sc = i === 0 ? (flirtyPressed ? 0.92 : t >= T.flirtyTap ? 0.94 + 0.06 * selPop : 1) : 1;
          return (
            <div key={n} style={{ flex: 1, height: KBL.toneH, borderRadius: KBL.toneH / 2, position: "relative", background: surface, transform: `scale(${sc})`,
              display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SF, fontSize: 17, fontWeight: 600, letterSpacing: -0.3,
              color: i !== 0 && sel > 0.5 ? "rgba(255,255,255,0.6)" : "#fff",
              boxShadow: on ? `0 0 ${16 * selGlow}px ${3 * selGlow}px rgba(10,132,255,${0.65 * selGlow})` : "none" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: KBL.toneH / 2, background: C.blue, opacity: on }} />
              <span style={{ position: "relative" }}>{n}</span>
            </div>
          );
        })}
      </div>

      {/* generate button (before result) */}
      {res < 1 && (
        <div style={{ position: "absolute", left: 10, top: KBL.genY, width: 382, height: KBL.genH, borderRadius: 13, opacity: (sel > 0 ? 1 : 0.38) * (1 - res),
          background: generating ? "rgb(36,64,110)" : C.blue, transform: `scale(${genPressed ? 0.97 : 1})`, display: "flex", alignItems: "center", justifyContent: "center",
          gap: 9, fontFamily: SF, fontSize: 18, fontWeight: 600, color: "#fff", letterSpacing: -0.3 }}>
          {generating ? (<><Spinner t={t} />Writing your reply…</>) : "Write reply"}
        </div>
      )}

      {/* suggested reply + Use Reply */}
      {res > 0 && (
        <>
          <div style={{ position: "absolute", left: 10, top: KBL.panelY + (1 - res) * 10, width: 382, height: KBL.panelH, borderRadius: 15, background: "rgb(30,34,42)",
            border: `1px solid rgba(10,132,255,${0.25 + 0.45 * res})`, boxShadow: `0 0 ${18 * res}px rgba(10,132,255,${0.22 * res})`, boxSizing: "border-box",
            padding: "8px 13px", opacity: res, fontFamily: SF }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, color: "rgb(120,170,255)" }}>SUGGESTED REPLY · FLIRTY</div>
            <div style={{ marginTop: 4, fontSize: 19, lineHeight: "24px", fontWeight: 600, letterSpacing: -0.4, color: "#fff" }}>
              <StreamedText text={REPLY} k={streamK} size={19} />
            </div>
          </div>
          <div style={{ position: "absolute", left: 10, top: KBL.useY + (1 - res) * 10, width: 382, height: KBL.useH, borderRadius: 13,
            background: usePressed ? "rgb(8,104,204)" : C.blue, opacity: res, transform: `scale(${usePressed ? 0.96 : 1 + 0.012 * readyPulse})`,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: SF, fontSize: 19, fontWeight: 700, color: "#fff", letterSpacing: -0.3,
            boxShadow: `0 0 0 ${3 * readyPulse}px rgba(10,132,255,0.35)` }}>
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v5.5H2.5M6 4L2 7.5 6 11" /></svg>
            Use Reply
            {ripple >= 0 && <div style={{ position: "absolute", inset: -2, borderRadius: 15, border: `2px solid rgba(120,180,255,${1 - ripple})`, transform: `scale(${1 + 0.06 * ripple})` }} />}
          </div>
        </>
      )}
      <GlobeMicRow />
    </div>
  );
};
