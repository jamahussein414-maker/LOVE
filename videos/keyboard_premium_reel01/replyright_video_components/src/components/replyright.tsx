// ReplyRight custom keyboard extension (concept). Points on a 402 pt wide keyboard, 307 pt tall.
import React from "react";
import { T, r, mix, REPLY } from "../lib";
import { C, SF, Rich, GlobeMicRow } from "./ios";

export const RRIcon: React.FC<{ s: number }> = ({ s }) => (
  <div style={{ width: s, height: s, borderRadius: s * 0.27, background: C.blue, display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: SF, fontWeight: 800, fontSize: s * 0.6, color: "#fff", flexShrink: 0 }}>R</div>
);

const SOURCE = "So when are you taking me out? 😉";
const TONES = ["Flirty", "Warm", "Funny", "Confident"];
const surface = "rgb(44,44,46)";

const Spinner: React.FC<{ t: number }> = ({ t }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" style={{ transform: `rotate(${(t * 360 * 1.3) % 360}deg)` }}>
    {Array.from({ length: 8 }).map((_, i) => (
      <rect key={i} x="7.2" y="1" width="1.6" height="4" rx="0.8" fill="#fff" opacity={0.25 + (i / 8) * 0.75} transform={`rotate(${i * 45} 8 8)`} />
    ))}
  </svg>
);

/** ToneSelector: four pills, one selected */
const ToneSelector: React.FC<{ y: number; sel: number; pressed: boolean }> = ({ y, sel, pressed }) => (
  <div style={{ position: "absolute", left: 10, top: y, width: 382, height: 32, display: "flex", gap: 7 }}>
    {TONES.map((n, i) => {
      const on = i === 0 ? sel : 0;
      return (
        <div key={n} style={{ flex: 1, height: 32, borderRadius: 16, position: "relative", background: surface, overflow: "hidden",
          transform: `scale(${i === 0 && pressed ? 0.94 : 1})`, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: SF, fontSize: 15, fontWeight: 600, letterSpacing: -0.2, color: "#fff" }}>
          <div style={{ position: "absolute", inset: 0, background: C.blue, opacity: on }} />
          <span style={{ position: "relative" }}>{n}</span>
        </div>
      );
    })}
  </div>
);

export const ReplyRightKeyboard: React.FC<{ t: number; enter: number }> = ({ t, enter }) => {
  const pasteK = r(t, T.pasted, T.pasted + 0.32);
  const pastePressed = t >= T.pasteTap && t < T.pasteTap + 0.16;
  const pastedBadge = r(t, T.pasted + 0.25, T.pasted + 0.45) * (1 - r(t, T.pasted + 1.8, T.pasted + 2.1));
  const sel = r(t, T.flirtyTap + 0.04, T.flirtyTap + 0.2);
  const flirtyPressed = t >= T.flirtyTap && t < T.flirtyTap + 0.15;
  const genPressed = t >= T.generateTap && t < T.generateTap + 0.15;
  const generating = t >= T.genA && t < T.genB;
  const res = r(t, T.genB, T.genB + 0.45);
  const usePressed = t >= T.useTap && t < T.useTap + 0.16;
  const usedFlash = r(t, T.useTap + 0.1, T.useTap + 0.25) * (1 - r(t, T.useTap + 0.6, T.useTap + 1.0));

  const srcY = mix(46, 44, res), srcH = mix(44, 26, res);
  const toneY = mix(100, 78, res);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: enter, transform: `translateY(${(1 - enter) * 6}px)` }}>
      {/* header */}
      <div style={{ position: "absolute", left: 12, top: 11, display: "flex", alignItems: "center", gap: 8, fontFamily: SF, color: "#fff" }}>
        <RRIcon s={22} /><span style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: -0.2 }}>ReplyRight</span>
      </div>
      <div style={{ position: "absolute", right: 14, top: 13 }}>
        <svg width="24" height="18" viewBox="0 0 24 18" fill="none" stroke="rgb(160,160,165)" strokeWidth="1.5"><rect x="1" y="1" width="22" height="16" rx="3" /><path d="M5 6h1.5M9 6h1.5M13 6h1.5M17 6h1.5M5 10h1.5M9 10h1.5M13 10h1.5M17 10h1.5M7 13.5h10" strokeLinecap="round" /></svg>
      </div>

      {/* source: paste button -> pasted message -> compact chip */}
      <div style={{ position: "absolute", left: 10, top: srcY, width: 382, height: srcH, borderRadius: mix(12, 9, res), background: pastePressed ? "rgb(66,66,70)" : surface,
        border: `0.8px solid ${pasteK > 0.5 && res < 0.5 ? "rgba(48,209,88,0.45)" : "transparent"}`, boxSizing: "border-box", overflow: "hidden", fontFamily: SF, color: "#fff" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 9, opacity: 1 - pasteK }}>
          <svg width="16" height="19" viewBox="0 0 16 19" fill="none" stroke={C.blue} strokeWidth="1.7" strokeLinejoin="round"><rect x="1" y="3" width="14" height="15" rx="2.5" /><rect x="4.5" y="1" width="7" height="4" rx="1.3" fill={surface} /></svg>
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.2 }}>Paste copied message</span>
        </div>
        <div style={{ position: "absolute", left: 14, right: 12, top: 0, bottom: 0, display: "flex", alignItems: "center", gap: 8, opacity: pasteK * (1 - res),
          transform: `translateY(${(1 - pasteK) * 5}px)` }}>
          <span style={{ fontSize: 15.5, letterSpacing: -0.2, flex: 1, whiteSpace: "nowrap" }}>“<Rich text={SOURCE} size={15.5} />”</span>
          <div style={{ display: "flex", alignItems: "center", gap: 5, opacity: 0.35 + 0.65 * pastedBadge, fontSize: 13, fontWeight: 600, color: "rgb(48,209,88)" }}>
            <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="rgb(48,209,88)" /><path d="M4.5 8.2l2.3 2.3 4.7-4.8" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {pastedBadge > 0.02 ? "Pasted" : ""}
          </div>
        </div>
        <div style={{ position: "absolute", left: 12, right: 12, top: 0, bottom: 0, display: "flex", alignItems: "center", opacity: res, fontSize: 13, color: "rgb(160,160,165)", whiteSpace: "nowrap" }}>
          Replying to:&nbsp;<span style={{ color: "rgb(210,210,215)" }}><Rich text={SOURCE} size={13} /></span>
        </div>
      </div>

      <ToneSelector y={toneY} sel={sel} pressed={flirtyPressed} />

      {/* generate button (before result) */}
      {res < 1 && (
        <div style={{ position: "absolute", left: 10, top: 144, width: 382, height: 40, borderRadius: 12, opacity: (sel > 0 ? 1 : 0.35) * (1 - res),
          background: generating ? "rgb(36,64,110)" : C.blue, transform: `scale(${genPressed ? 0.97 : 1})`, display: "flex", alignItems: "center", justifyContent: "center",
          gap: 8, fontFamily: SF, fontSize: 16, fontWeight: 600, color: "#fff", letterSpacing: -0.2 }}>
          {generating ? (<><Spinner t={t} />Writing your reply…</>) : "Write reply"}
        </div>
      )}

      {/* suggested reply + Use Reply */}
      {res > 0 && (
        <>
          <div style={{ position: "absolute", left: 10, top: 118 + (1 - res) * 8, width: 382, height: 68, borderRadius: 14, background: "rgb(34,34,36)",
            border: "0.6px solid rgba(255,255,255,0.10)", boxSizing: "border-box", padding: "8px 13px", opacity: res, fontFamily: SF }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: 0.4, color: "rgb(150,150,156)" }}>SUGGESTED REPLY</div>
            <div style={{ marginTop: 4, fontSize: 16.5, lineHeight: "21px", fontWeight: 500, letterSpacing: -0.3, color: "#fff" }}><Rich text={REPLY} size={16.5} /></div>
          </div>
          <div style={{ position: "absolute", left: 10, top: 194 + (1 - res) * 8, width: 382, height: 38, borderRadius: 12, background: usePressed ? "rgb(8,104,204)" : C.blue,
            opacity: res, transform: `scale(${usePressed ? 0.97 : 1})`, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            fontFamily: SF, fontSize: 16.5, fontWeight: 600, color: "#fff", letterSpacing: -0.2, boxShadow: usedFlash ? `0 0 0 ${3 * usedFlash}px rgba(10,132,255,0.35)` : "none" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v5.5H2.5M6 4L2 7.5 6 11" /></svg>
            Use Reply
          </div>
        </>
      )}
      <GlobeMicRow />
    </div>
  );
};
