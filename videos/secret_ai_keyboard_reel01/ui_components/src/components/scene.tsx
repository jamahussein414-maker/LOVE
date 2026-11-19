// One continuous iPhone screen (unbranded concept) with a camera that moves in for the key moments.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { T, TL, r, mix, iosEase, K, PT, SCREEN_X, SCREEN_Y, KB_H, KB_TOP, COMPOSER_GAP, HOME_GAP, BUBBLE_TOP, BUBBLE_H, composerAt, keyboardAt, INCOMING, REPLY } from "../lib";
import { C, SF, Rich, IOSStatusBar, DynamicIsland, MessagesHeader, Bubble, Timestamp, MessageComposer, KeyboardShell, StandardKeyboard, GlobeMicRow,
  MessageContextMenu, KeyboardSwitcher, Touch } from "./ios";
import { AIKeyboard, AIIcon, KBL } from "./aikeyboard";

const SWITCHER_TOP = 567 + 248 - 14 - 176;
const composerGeom = (t: number) => {
  const { raised } = keyboardAt(t);
  const c = composerAt(t);
  const h = Array.from(c.text).length > 30 ? 63.5 : 41.5;
  const bottom = mix(PT.H - HOME_GAP, KB_TOP - COMPOSER_GAP, raised);
  return { bottom, top: bottom - h, h };
};
const menuK = (t: number) => r(t, T.menuOpen, T.menuOpen + 0.3) * (1 - r(t, T.menuClose, T.menuClose + 0.25));

// ---------- camera: shots = zoom z, focus point (pt), where that point sits on screen (video y) ----------
type Shot = { z: number; fx: number; fy: number; ty: number };
const HOOK: Shot = { z: 1.5, fx: 170, fy: 232, ty: 690 };
const TYPE: Shot = { z: 1.12, fx: 201, fy: 600, ty: 1040 };
const MENU: Shot = { z: 1.24, fx: 201, fy: 340, ty: 820 };
const SWITCH: Shot = { z: 1.2, fx: 201, fy: 560, ty: 1000 };
const KBS: Shot = { z: 1.24, fx: 201, fy: 536, ty: 965 };
const INSERT: Shot = { z: 1.2, fx: 201, fy: 560, ty: 1000 };
const MOVES: [number, number, Shot][] = [[1.7, 2.3, TYPE], [6.8, 7.35, MENU], [9.2, 9.8, SWITCH], [10.9, 11.5, KBS], [20.95, 21.6, INSERT]];
export const camera = (t: number): Shot => {
  let s = HOOK;
  for (const [a, b, nx] of MOVES) {
    const k = r(t, a, b, iosEase);
    if (k <= 0) break;
    s = { z: mix(s.z, nx.z, k), fx: mix(s.fx, nx.fx, k), fy: mix(s.fy, nx.fy, k), ty: mix(s.ty, nx.ty, k) };
  }
  return s;
};
const toVideo = (t: number, xPt: number, yPt: number) => {
  const c = camera(t);
  return { x: 540 + (xPt - c.fx) * K * c.z, y: c.ty + (yPt - c.fy) * K * c.z };
};

const TypingIndicator: React.FC<{ t: number; k: number }> = ({ t, k }) => (
  <div style={{ position: "absolute", left: 16.6, top: BUBBLE_TOP, opacity: k, transform: `scale(${0.7 + 0.3 * k})`, transformOrigin: "left bottom" }}>
    <div style={{ position: "relative", width: 66, height: 40, borderRadius: 20, background: C.incoming, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
      {[0, 1, 2].map((i) => {
        const b = 0.5 + 0.5 * Math.max(0, Math.sin(((t * 2.4 - i * 0.18) % 1) * Math.PI));
        return <div key={i} style={{ width: 8.5, height: 8.5, borderRadius: 5, background: `rgba(160,160,166,${0.4 + 0.6 * b})` }} />;
      })}
    </div>
  </div>
);

export const IPhoneScreen: React.FC<{ t: number }> = ({ t }) => {
  const { raised, rr } = keyboardAt(t);
  const comp = composerAt(t);
  const g = composerGeom(t);
  const mk = menuK(t);
  const inK = r(t, T.incoming, T.incoming + 0.3);
  const pop = t >= T.incoming ? 0.8 + 0.2 * (1 - Math.pow(1 - Math.min(1, (t - T.incoming) / 0.32), 3)) : 0;
  const typingNow = comp.lastTyped > 0 && t - comp.lastTyped < 0.5;
  const cursor = raised > 0.6 && (typingNow || comp.deleting || Math.floor(t * 1.9) % 2 === 0);
  const flash = r(t, T.inserted, T.inserted + 0.15) * (1 - r(t, T.inserted + 1.2, T.inserted + 1.9));
  const kbTop = KB_TOP + (1 - raised) * (KB_H + 40);
  const pressedChar = comp.lastChar && t - comp.lastTyped < 0.1 ? comp.lastChar : null;
  const switcherK = r(t, T.switcherOpen, T.switcherOpen + 0.2) * (1 - r(t, T.globeUp, T.globeUp + 0.15));
  const slide = Math.min(1, Math.max(0, (t - T.slideA) / (T.slideB - T.slideA)));
  const fingerY = mix(KB_TOP + 266.8, SWITCHER_TOP + 110, slide * slide * (3 - 2 * slide));
  const hlRow = t < T.slideA ? -1 : Math.max(-1, Math.min(2, Math.floor((fingerY - SWITCHER_TOP) / 44)));
  const copied = r(t, T.copiedHint, T.copiedHint + 0.15) * (1 - r(t, T.copiedHint + 0.45, T.copiedHint + 0.6));
  // reply text travelling from the keyboard's suggestion panel up into the message box
  const fly = r(t, T.flyA, T.flyB, iosEase);
  const fromY = KB_TOP + KBL.panelY + 26, toY = g.bottom - 63.5 + 9;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: PT.W, height: PT.H, background: C.bg, overflow: "hidden" }}>
      <Timestamp top={174} />
      {t < T.incoming + 0.05 && <TypingIndicator t={t} k={1 - r(t, T.incoming - 0.04, T.incoming + 0.04)} />}
      {t >= T.incoming && (
        <div style={{ position: "absolute", left: 16.6, top: BUBBLE_TOP, opacity: inK, transform: `scale(${pop})`, transformOrigin: "left bottom" }}>
          <Bubble text={INCOMING} />
        </div>
      )}
      <MessageComposer bottom={g.bottom} text={comp.text || (t >= T.flyA && t < T.inserted ? " " : "")} cursor={cursor} flash={flash} />
      {raised > 0.001 && (
        <div style={{ position: "absolute", left: 0, top: kbTop, width: PT.W, height: KB_H + 40 }}>
          <KeyboardShell>
            {rr < 1 && (
              <div style={{ position: "absolute", inset: 0, opacity: 1 - rr }}>
                <StandardKeyboard pressedChar={pressedChar} deleting={comp.deleting} spacePressed={pressedChar === " "} />
                <GlobeMicRow globeHeld={t >= T.globeDown && t < T.globeUp} />
              </div>
            )}
            {rr > 0 && <AIKeyboard t={t} enter={rr} />}
          </KeyboardShell>
        </div>
      )}
      {t >= T.flyA && t < T.flyB + 0.06 && (
        <div style={{ position: "absolute", left: mix(23, 82.6, fly), top: mix(fromY, toY, fly), width: mix(356, 290, fly), fontFamily: SF,
          fontSize: mix(19, 17, fly), lineHeight: `${mix(24, 22, fly)}px`, fontWeight: mix(600, 400, fly) as any, letterSpacing: -0.35, color: "#fff",
          opacity: 1 - r(t, T.flyB - 0.08, T.flyB + 0.05), textShadow: `0 0 ${12 * (1 - fly)}px rgba(10,132,255,0.9)` }}>
          <Rich text={REPLY} size={mix(19, 17, fly)} />
        </div>
      )}
      <div style={{ position: "absolute", left: PT.W / 2 - 67, top: PT.H - 9, width: 134, height: 5, borderRadius: 3, background: "#fff" }} />
      <MessagesHeader />
      <IOSStatusBar />
      <DynamicIsland />
      {mk > 0.001 && <MessageContextMenu k={mk} copyPressed={t >= T.copyTap - 0.04 && t < T.menuClose + 0.1} bubbleTop={BUBBLE_TOP} />}
      {copied > 0.01 && (
        <div style={{ position: "absolute", top: BUBBLE_TOP + BUBBLE_H + 12, left: 16.6, opacity: copied, display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
          borderRadius: 14, background: "rgba(58,58,62,0.95)", fontFamily: SF, fontSize: 15, fontWeight: 600, color: "#fff" }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6.8l3 3L11 3.5" /></svg>Copied
        </div>
      )}
      {switcherK > 0.001 && <KeyboardSwitcher k={switcherK} highlight={hlRow} icon={<AIIcon s={22} />} />}
      <Touch t={t} a={T.composerTap1} b={T.composerTap1 + 0.12} x={220} y={PT.H - HOME_GAP - 20.75} />
      <Touch t={t} a={T.dismissTap} b={T.dismissTap + 0.1} x={210} y={400} />
      <Touch t={t} a={T.longPress} b={T.menuOpen + 0.12} x={150} y={BUBBLE_TOP + BUBBLE_H / 2} />
      <Touch t={t} a={T.copyTap - 0.08} b={T.copyTap + 0.08} x={120} y={BUBBLE_TOP + BUBBLE_H + 10 + 44 + 22} />
      <Touch t={t} a={T.composerTap2} b={T.composerTap2 + 0.12} x={220} y={PT.H - HOME_GAP - 20.75} />
      <Touch t={t} a={T.globeDown} b={T.globeUp} x={42} y={KB_TOP + 266.8} x2={110} y2={SWITCHER_TOP + 110} m={[T.slideA, T.slideB]} />
      <Touch t={t} a={T.pasteTap - 0.06} b={T.pasteTap + 0.1} x={215} y={KB_TOP + 68} />
      <Touch t={t} a={T.flirtyTap - 0.06} b={T.flirtyTap + 0.1} x={57} y={KB_TOP + KBL.toneY0 + KBL.toneH / 2} />
      <Touch t={t} a={T.generateTap - 0.06} b={T.generateTap + 0.1} x={215} y={KB_TOP + KBL.genY + KBL.genH / 2} />
      <Touch t={t} a={T.useTap - 0.06} b={T.useTap + 0.12} x={215} y={KB_TOP + KBL.useY + KBL.useH / 2} />
    </div>
  );
};

const Device: React.FC<{ t: number }> = ({ t }) => {
  const c = camera(t);
  const B = 12, R = 55 * K;
  const px = SCREEN_X + c.fx * K, py = SCREEN_Y + c.fy * K;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0",
      transform: `translate(${540 - c.z * px}px, ${c.ty - c.z * py}px) scale(${c.z})` }}>
      <div style={{ position: "absolute", left: SCREEN_X - B, top: SCREEN_Y - B, width: PT.W * K + 2 * B, height: PT.H * K + 2 * B, borderRadius: R + B,
        background: "linear-gradient(160deg, #3b3b3f 0%, #1c1c1f 35%, #2c2c30 70%, #18181a 100%)", boxShadow: "0 0 0 1px rgba(255,255,255,0.07), 0 40px 90px rgba(0,0,0,0.7)" }} />
      <div style={{ position: "absolute", left: SCREEN_X, top: SCREEN_Y, width: PT.W, height: PT.H, transform: `scale(${K})`, transformOrigin: "0 0", borderRadius: 55, overflow: "hidden" }}>
        <IPhoneScreen t={t} />
      </div>
    </div>
  );
};

// ---------- captions: in the free space between the conversation and the message box ----------
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const c = TL.vo.find((v) => t >= v.capIn && t < v.capOut + 0.12);
  if (!c) return null;
  const a = r(t, c.capIn, c.capIn + 0.12) * (1 - r(t, c.capOut, c.capOut + 0.12));
  let y: number;
  if (t >= T.endA) y = 1560;
  else if (t < 2.0) y = 1500;
  else {
    const mk = menuK(t);
    const cb = Math.max(150, toVideo(t, 0, mk > 0.01 ? BUBBLE_TOP + BUBBLE_H + 10 + 176 : BUBBLE_TOP + BUBBLE_H + 4).y + 30);
    const ct = toVideo(t, 0, composerGeom(t).top).y - 30;
    y = Math.min(1560, (cb + ct) / 2);
  }
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: 1080, display: "flex", justifyContent: "center", transform: "translateY(-50%)", opacity: a }}>
      <div style={{ maxWidth: 820, padding: "16px 30px", borderRadius: 26, background: "rgba(28,28,31,0.88)", border: "1px solid rgba(255,255,255,0.09)",
        textAlign: "center", fontFamily: SF, fontSize: 44, lineHeight: 1.25, fontWeight: 700, letterSpacing: -0.6, color: "#fff" }}>
        <Rich text={c.caption} size={44} />
      </div>
    </div>
  );
};

/** first-second hook under the zoomed-in incoming message */
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const a = r(t, T.hookA, T.hookA + 0.25) * (1 - r(t, T.hookB, T.hookB + 0.25));
  if (a <= 0.001) return null;
  return (
    <div style={{ position: "absolute", top: 1060, left: 0, width: 1080, textAlign: "center", transform: `translateY(-50%) scale(${0.9 + 0.1 * a})`, opacity: a,
      fontFamily: "Inter Display, Inter", fontWeight: 800, fontSize: 104, lineHeight: 1.0, letterSpacing: -2.5, color: "#fff", textShadow: "0 8px 30px rgba(0,0,0,0.6)" }}>
      WHAT WOULD<br />YOU <span style={{ color: C.blue }}>REPLY?</span>
    </div>
  );
};

const FinalCTA: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.endA) return null;
  const l = r(t, T.less, T.less + 0.45), m = r(t, T.more, T.more + 0.45);
  const cta = r(t, T.cta, T.cta + 0.45), soon = r(t, T.soon, T.soon + 0.5);
  const pulse = t > T.cta + 0.6 ? 0.5 + 0.5 * Math.sin((t - T.cta) * 3) : 0;
  return (
    <AbsoluteFill style={{ fontFamily: SF, color: "#fff", alignItems: "center" }}>
      <div style={{ position: "absolute", top: 600, width: 1080, textAlign: "center", fontFamily: "Inter Display, Inter", fontWeight: 800, fontSize: 116, letterSpacing: -3, lineHeight: 1.05 }}>
        <div style={{ opacity: l, transform: `translateY(${(1 - l) * 22}px)` }}>Less overthinking.</div>
        <div style={{ opacity: m, transform: `translateY(${(1 - m) * 22}px)`, color: C.blue }}>More confidence.</div>
      </div>
      <div style={{ position: "absolute", top: 1010, opacity: cta, transform: `translateY(${(1 - cta) * 16}px) scale(${0.96 + 0.04 * cta})`, padding: "40px 64px", borderRadius: 48,
        background: "#fff", color: "#000", fontSize: 60, fontWeight: 800, letterSpacing: -0.5, textAlign: "center", lineHeight: 1.12,
        boxShadow: `0 0 ${30 + 30 * pulse}px rgba(10,132,255,${0.35 + 0.25 * pulse})` }}>
        COMMENT <span style={{ color: C.blue }}>TEXT</span><br /><span style={{ fontSize: 44, letterSpacing: 1 }}>FOR EARLY ACCESS.</span>
      </div>
      <div style={{ position: "absolute", top: 1320, opacity: soon * 0.75, fontSize: 36, fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>Coming soon.</div>
    </AbsoluteFill>
  );
};

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const deviceA = 1 - r(t, T.endA, T.endB);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(1200px 1600px at 50% 45%, #18181b 0%, #0b0b0c 70%)" }}>
      {deviceA > 0.001 && <AbsoluteFill style={{ opacity: deviceA, filter: deviceA < 0.999 ? `blur(${(1 - deviceA) * 8}px)` : undefined }}><Device t={t} /></AbsoluteFill>}
      <Hook t={t} />
      <FinalCTA t={t} />
      <Captions t={t} />
    </AbsoluteFill>
  );
};
