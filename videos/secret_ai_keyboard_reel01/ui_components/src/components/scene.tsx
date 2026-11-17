// One continuous iPhone screen (unbranded concept) driven by a single timeline, plus captions and the final CTA.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { T, TL, r, mix, iosEase, K, PT, SCREEN_X, SCREEN_Y, KB_H, KB_TOP, COMPOSER_GAP, HOME_GAP, BUBBLE_TOP, BUBBLE_H, composerAt, keyboardAt, INCOMING } from "../lib";
import { C, SF, IOSStatusBar, DynamicIsland, MessagesHeader, Bubble, Timestamp, MessageComposer, KeyboardShell, StandardKeyboard, GlobeMicRow,
  MessageContextMenu, KeyboardSwitcher, Touch } from "./ios";
import { AIKeyboard, AIIcon } from "./aikeyboard";

const SWITCHER_TOP = 567 + 248 - 14 - 176;
const composerGeom = (t: number) => {
  const { raised } = keyboardAt(t);
  const c = composerAt(t);
  const h = Array.from(c.text).length > 30 ? 63.5 : 41.5;
  const bottom = mix(PT.H - HOME_GAP, KB_TOP - COMPOSER_GAP, raised);
  return { bottom, top: bottom - h, h };
};
const menuK = (t: number) => r(t, T.menuOpen, T.menuOpen + 0.3) * (1 - r(t, T.menuClose, T.menuClose + 0.25));

const TypingIndicator: React.FC<{ t: number; k: number }> = ({ t, k }) => (
  <div style={{ position: "absolute", left: 16.6, top: BUBBLE_TOP, opacity: k, transform: `scale(${0.7 + 0.3 * k})`, transformOrigin: "left bottom" }}>
    <div style={{ position: "relative", width: 66, height: 40, borderRadius: 20, background: C.incoming, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
      <div style={{ position: "absolute", left: -2, bottom: -2, width: 12, height: 12, borderRadius: 6, background: C.incoming }} />
      <div style={{ position: "absolute", left: -7, bottom: -8, width: 6, height: 6, borderRadius: 3, background: C.incoming }} />
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
  const inK = r(t, T.incoming, T.incoming + 0.32);
  const pop = t >= T.incoming ? 0.82 + 0.18 * (1 - Math.pow(1 - Math.min(1, (t - T.incoming) / 0.32), 3)) : 0;
  const typingK = r(t, 0.35, 0.55) * (1 - r(t, T.incoming - 0.05, T.incoming + 0.05));
  const typingNow = comp.lastTyped > 0 && t - comp.lastTyped < 0.5;
  const cursor = raised > 0.6 && (typingNow || comp.deleting || Math.floor(t * 1.9) % 2 === 0);
  const flash = r(t, T.inserted, T.inserted + 0.15) * (1 - r(t, T.inserted + 0.9, T.inserted + 1.5));
  const kbTop = KB_TOP + (1 - raised) * (KB_H + 40);
  const pressedChar = comp.lastChar && t - comp.lastTyped < 0.1 ? comp.lastChar : null;
  const switcherK = r(t, T.switcherOpen, T.switcherOpen + 0.22) * (1 - r(t, T.globeUp, T.globeUp + 0.15));
  const slide = Math.min(1, Math.max(0, (t - T.slideA) / (T.slideB - T.slideA)));
  const fingerY = mix(KB_TOP + 266.8, SWITCHER_TOP + 110, slide * slide * (3 - 2 * slide));
  const hlRow = t < T.slideA ? -1 : Math.max(-1, Math.min(2, Math.floor((fingerY - SWITCHER_TOP) / 44)));
  const copied = r(t, T.copiedHint, T.copiedHint + 0.15) * (1 - r(t, T.copiedHint + 0.45, T.copiedHint + 0.6));
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: PT.W, height: PT.H, background: C.bg, overflow: "hidden" }}>
      {/* Region C: conversation */}
      <Timestamp top={174} />
      {typingK > 0.01 && <TypingIndicator t={t} k={typingK} />}
      {t >= T.incoming && (
        <div style={{ position: "absolute", left: 16.6, top: BUBBLE_TOP, opacity: inK, transform: `scale(${pop})`, transformOrigin: "left bottom" }}>
          <Bubble text={INCOMING} />
        </div>
      )}
      {/* Region D: composer */}
      <MessageComposer bottom={g.bottom} text={comp.text} cursor={cursor} flash={flash} />
      {/* Region E: keyboard (system and AI keyboard share one shell in the same place) */}
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
      {/* home indicator */}
      <div style={{ position: "absolute", left: PT.W / 2 - 67, top: PT.H - 9, width: 134, height: 5, borderRadius: 3, background: "#fff" }} />
      {/* Region B + A */}
      <MessagesHeader />
      <IOSStatusBar />
      <DynamicIsland />
      {/* overlays */}
      {mk > 0.001 && <MessageContextMenu k={mk} copyPressed={t >= T.copyTap - 0.04 && t < T.menuClose + 0.1} bubbleTop={BUBBLE_TOP} />}
      {copied > 0.01 && (
        <div style={{ position: "absolute", top: BUBBLE_TOP + BUBBLE_H + 12, left: 16.6, opacity: copied, display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
          borderRadius: 14, background: "rgba(58,58,62,0.95)", fontFamily: SF, fontSize: 14, fontWeight: 600, color: "#fff" }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6.8l3 3L11 3.5" /></svg>Copied
        </div>
      )}
      {switcherK > 0.001 && <KeyboardSwitcher k={switcherK} highlight={hlRow} icon={<AIIcon s={22} />} />}
      {/* touches */}
      <Touch t={t} a={T.composerTap1} b={T.composerTap1 + 0.12} x={220} y={PT.H - HOME_GAP - 20.75} />
      <Touch t={t} a={T.dismissTap} b={T.dismissTap + 0.1} x={210} y={400} />
      <Touch t={t} a={T.longPress} b={T.menuOpen + 0.12} x={150} y={BUBBLE_TOP + BUBBLE_H / 2} />
      <Touch t={t} a={T.copyTap - 0.08} b={T.copyTap + 0.08} x={120} y={BUBBLE_TOP + BUBBLE_H + 10 + 44 + 22} />
      <Touch t={t} a={T.composerTap2} b={T.composerTap2 + 0.12} x={220} y={PT.H - HOME_GAP - 20.75} />
      <Touch t={t} a={T.globeDown} b={T.globeUp} x={42} y={KB_TOP + 266.8} x2={110} y2={SWITCHER_TOP + 110} m={[T.slideA, T.slideB]} />
      <Touch t={t} a={T.pasteTap - 0.06} b={T.pasteTap + 0.1} x={215} y={KB_TOP + 68} />
      <Touch t={t} a={T.flirtyTap - 0.06} b={T.flirtyTap + 0.1} x={55} y={KB_TOP + 116} />
      <Touch t={t} a={T.generateTap - 0.06} b={T.generateTap + 0.1} x={215} y={KB_TOP + 164} />
      <Touch t={t} a={T.useTap - 0.06} b={T.useTap + 0.1} x={215} y={KB_TOP + 213} />
    </div>
  );
};

// ---------- device frame + camera ----------
const zoomAt = (t: number) => 1 + 0.1 * r(t, T.zoomA, T.zoomB, iosEase);
const ZOOM_O = { x: 540, y: SCREEN_Y + 480 * K };
const toVideo = (t: number, xPt: number, yPt: number) => {
  const z = zoomAt(t);
  const x = SCREEN_X + xPt * K, y = SCREEN_Y + yPt * K;
  return { x: ZOOM_O.x + (x - ZOOM_O.x) * z, y: ZOOM_O.y + (y - ZOOM_O.y) * z };
};

const Device: React.FC<{ t: number }> = ({ t }) => {
  const z = zoomAt(t);
  const B = 12, R = 55 * K;
  return (
    <div style={{ position: "absolute", inset: 0, transform: `scale(${z})`, transformOrigin: `${ZOOM_O.x}px ${ZOOM_O.y}px` }}>
      <div style={{ position: "absolute", left: SCREEN_X - B, top: SCREEN_Y - B, width: PT.W * K + 2 * B, height: PT.H * K + 2 * B, borderRadius: R + B,
        background: "linear-gradient(160deg, #3b3b3f 0%, #1c1c1f 35%, #2c2c30 70%, #18181a 100%)", boxShadow: "0 0 0 1px rgba(255,255,255,0.07), 0 40px 90px rgba(0,0,0,0.7)" }} />
      <div style={{ position: "absolute", left: SCREEN_X, top: SCREEN_Y, width: PT.W, height: PT.H, transform: `scale(${K})`, transformOrigin: "0 0",
        borderRadius: 55, overflow: "hidden" }}>
        <IPhoneScreen t={t} />
      </div>
    </div>
  );
};

// ---------- captions: always in empty space between conversation content and the composer ----------
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const c = TL.vo.find((v) => t >= v.capIn && t < v.capOut + 0.12);
  if (!c) return null;
  const a = r(t, c.capIn, c.capIn + 0.12) * (1 - r(t, c.capOut, c.capOut + 0.12));
  let yPx: number;
  if (t >= T.endA) {
    yPx = 1540;
  } else {
    const mk = menuK(t);
    const contentBottom = mk > 0.01 ? BUBBLE_TOP + BUBBLE_H + 10 + 176 : BUBBLE_TOP + BUBBLE_H + 2;
    const g = composerGeom(t);
    let mid = (contentBottom + g.top) / 2;
    if (t < T.hookB + 0.3) mid = 640;
    yPx = toVideo(t, 0, mid).y;
  }
  return (
    <div style={{ position: "absolute", left: 0, top: yPx, width: 1080, display: "flex", justifyContent: "center", transform: "translateY(-50%)", opacity: a }}>
      <div style={{ maxWidth: 740, padding: "14px 26px", borderRadius: 24, background: "rgba(30,30,33,0.82)", border: "1px solid rgba(255,255,255,0.08)",
        textAlign: "center", fontFamily: SF, fontSize: 38, lineHeight: 1.28, fontWeight: 600, letterSpacing: -0.4, color: "#fff" }}>
        {c.caption}
      </div>
    </div>
  );
};

// ---------- final CTA ----------
const FinalCTA: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.endA) return null;
  const h = r(t, T.headline, T.headline + 0.6);
  const cta = r(t, T.cta, T.cta + 0.5);
  const soon = r(t, T.soon, T.soon + 0.5);
  return (
    <AbsoluteFill style={{ fontFamily: SF, color: "#fff", alignItems: "center" }}>
      <div style={{ position: "absolute", top: 600, width: 1080, textAlign: "center", opacity: h, transform: `translateY(${(1 - h) * 18}px)`,
        fontFamily: "Inter Display, Inter", fontSize: 118, fontWeight: 700, letterSpacing: -2.5, lineHeight: 1.02 }}>
        TEXT WITH<br />CONFIDENCE.
      </div>
      <div style={{ position: "absolute", top: 1010, opacity: cta, transform: `translateY(${(1 - cta) * 14}px) scale(${0.97 + 0.03 * cta})`,
        padding: "30px 50px", borderRadius: 40, background: C.blue, fontSize: 46, fontWeight: 700, letterSpacing: -0.3, textAlign: "center", lineHeight: 1.2 }}>
        COMMENT “TEXT”<br /><span style={{ fontSize: 34, fontWeight: 600, letterSpacing: 1.5 }}>FOR EARLY ACCESS</span>
      </div>
      <div style={{ position: "absolute", top: 1250, opacity: soon * 0.75, fontSize: 34, fontWeight: 500, letterSpacing: 0.5, color: "rgba(255,255,255,0.75)" }}>Coming soon.</div>
    </AbsoluteFill>
  );
};

/** hook headline in the empty conversation space under the incoming message */
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const a = r(t, T.hookA, T.hookA + 0.3) * (1 - r(t, T.hookB, T.hookB + 0.25));
  if (a <= 0.001) return null;
  const y = toVideo(t, 0, 430).y;
  return (
    <div style={{ position: "absolute", top: y, left: 0, width: 1080, textAlign: "center", transform: `translateY(-50%) scale(${0.94 + 0.06 * a})`, opacity: a,
      fontFamily: "Inter Display, Inter", fontWeight: 800, fontSize: 84, lineHeight: 1.04, letterSpacing: -1.5, color: "#fff" }}>
      WHAT WOULD<br />YOU <span style={{ color: "rgb(10,132,255)" }}>REPLY?</span>
    </div>
  );
};

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const deviceA = 1 - r(t, T.endA, T.endB);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(1200px 1600px at 50% 45%, #151517 0%, #0a0a0b 70%)" }}>
      {deviceA > 0.001 && <AbsoluteFill style={{ opacity: deviceA }}><Device t={t} /></AbsoluteFill>}
      <Hook t={t} />
      <FinalCTA t={t} />
      <Captions t={t} />
    </AbsoluteFill>
  );
};
