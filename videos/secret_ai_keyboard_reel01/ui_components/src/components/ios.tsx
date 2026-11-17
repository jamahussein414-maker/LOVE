// Reusable iOS 26 (dark) building blocks. All sizes are in points on a 402 x 874 pt screen.
import React from "react";
import { Img, staticFile } from "remotion";
import { EMOJI, KB_H, PT, BUBBLE_H, INCOMING } from "../lib";

export const SF = "Inter, -apple-system, system-ui, sans-serif";
export const C = {
  bg: "#000", incoming: "rgb(38,38,41)", outgoing: "rgb(12,146,255)", glass: "rgb(24,24,24)",
  glassLine: "rgba(255,255,255,0.10)", kbBg: "rgb(22,22,23)", key: "rgb(60,60,60)", keyPop: "rgb(86,86,88)",
  label2: "rgb(142,142,147)", placeholder: "rgb(110,110,115)", blue: "rgb(10,132,255)",
};

export const Rich: React.FC<{ text: string; size: number }> = ({ text, size }) => (
  <>
    {Array.from(text).map((c, i) =>
      EMOJI[c] ? (
        <Img key={i} src={staticFile(`emoji/${EMOJI[c]}.png`)} style={{ width: size * 1.1, height: size * 1.1, verticalAlign: "-0.2em" }} />
      ) : (
        <React.Fragment key={i}>{c}</React.Fragment>
      )
    )}
  </>
);

// ---------- Region A: status bar + Dynamic Island ----------
export const DynamicIsland: React.FC = () => (
  <div style={{ position: "absolute", left: 138, top: 11, width: 126, height: 37, borderRadius: 19, background: "#000" }} />
);

export const IOSStatusBar: React.FC = () => (
  <div style={{ position: "absolute", left: 0, top: 0, width: PT.W, height: 54, fontFamily: SF, color: "#fff" }}>
    <div style={{ position: "absolute", left: 48, top: 20, fontSize: 17, fontWeight: 600, letterSpacing: -0.2 }}>9:41</div>
    <div style={{ position: "absolute", right: 30, top: 23, display: "flex", gap: 6, alignItems: "center" }}>
      <svg width="19" height="12" viewBox="0 0 19 12">{[0, 1, 2, 3].map((i) => <rect key={i} x={i * 5} y={9 - i * 3} width="3.2" height={3 + i * 3} rx="0.9" fill="#fff" />)}</svg>
      <svg width="17" height="12" viewBox="0 0 17 12"><path fill="#fff" d="M8.5 11.6l2.3-2.6a3.3 3.3 0 0 0-4.6 0zM3 6.3a7.8 7.8 0 0 1 11 0l-1.5 1.6a5.6 5.6 0 0 0-8 0zM.3 3.5a11.7 11.7 0 0 1 16.4 0l-1.5 1.6a9.5 9.5 0 0 0-13.4 0z" /></svg>
      <svg width="27" height="13" viewBox="0 0 27 13"><rect x="0.5" y="0.5" width="23" height="12" rx="3.6" fill="none" stroke="rgba(255,255,255,0.4)" /><rect x="2" y="2" width="20" height="9" rx="2.2" fill="#fff" /><rect x="24.6" y="4.2" width="1.6" height="4.6" rx="0.8" fill="rgba(255,255,255,0.4)" /></svg>
    </div>
  </div>
);

// ---------- Region B: Messages header (iOS 26 floating glass controls) ----------
const Glass: React.FC<{ style: React.CSSProperties; children?: React.ReactNode }> = ({ style, children }) => (
  <div style={{ position: "absolute", background: C.glass, border: `0.6px solid ${C.glassLine}`, boxShadow: "inset 0 0.6px 0 rgba(255,255,255,0.08)",
    display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box", ...style }}>{children}</div>
);
export const MessagesHeader: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 0, top: 0, width: PT.W, height: 172, background: "linear-gradient(180deg, #000 72%, rgba(0,0,0,0))" }} />
    <Glass style={{ left: 16.6, top: 62.5, width: 81.7, height: 42.4, borderRadius: 21.2, gap: 9 }}>
      <svg width="12" height="20" viewBox="0 0 12 20" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2L2 10l8 8" /></svg>
      <div style={{ minWidth: 30, height: 21, borderRadius: 11, background: "#fff", color: "#000", fontFamily: SF, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>12</div>
    </Glass>
    <div style={{ position: "absolute", left: 171, top: 61.8, width: 60, height: 60, borderRadius: 30, background: "linear-gradient(180deg, rgb(98,92,122), rgb(66,61,84))",
      display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SF, fontWeight: 600, fontSize: 26, color: "#fff" }}>A</div>
    <Glass style={{ left: 166, top: 117, width: 70, height: 33.6, borderRadius: 16.8, gap: 4, fontFamily: SF, color: "#fff", fontSize: 16, fontWeight: 700 }}>
      Alex<svg width="7" height="12" viewBox="0 0 7 12" fill="none" stroke={C.label2} strokeWidth="1.8" strokeLinecap="round"><path d="M1.5 1.5l4 4.5-4 4.5" /></svg>
    </Glass>
    <Glass style={{ left: 342.6, top: 62.6, width: 42.8, height: 42.8, borderRadius: 21.4 }}>
      <svg width="24" height="16" viewBox="0 0 24 16" fill="none" stroke="#fff" strokeWidth="1.7"><rect x="1" y="1.5" width="15" height="13" rx="3.2" /><path d="M16 6.4l6-3.6v10.4l-6-3.6z" strokeLinejoin="round" /></svg>
    </Glass>
  </>
);

// ---------- Region C: message bubbles ----------
export const Bubble: React.FC<{ text: string; out?: boolean; style?: React.CSSProperties; tailBg?: string }> = ({ text, out, style, tailBg = "#000" }) => {
  const col = out ? C.outgoing : C.incoming;
  return (
    <div style={{ position: "relative", display: "inline-block", maxWidth: 318, whiteSpace: "normal", padding: "9.5px 14px 10px", borderRadius: 20, background: col,
      fontFamily: SF, fontSize: 17, lineHeight: "22px", letterSpacing: -0.35, color: "#fff", ...style }}>
      <div style={{ position: "absolute", bottom: 0, [out ? "right" : "left"]: -6, width: 18, height: 18, background: col,
        [out ? "borderBottomLeftRadius" : "borderBottomRightRadius"]: 15 } as React.CSSProperties} />
      <div style={{ position: "absolute", bottom: 0, [out ? "right" : "left"]: -10, width: 10, height: 20, background: tailBg,
        [out ? "borderBottomLeftRadius" : "borderBottomRightRadius"]: 10 } as React.CSSProperties} />
      <span style={{ position: "relative" }}><Rich text={text} size={17} /></span>
    </div>
  );
};

export const Timestamp: React.FC<{ top: number }> = ({ top }) => (
  <div style={{ position: "absolute", top, width: PT.W, textAlign: "center", fontFamily: SF, fontSize: 12.5, color: C.label2 }}>
    <b style={{ fontWeight: 600 }}>Today</b> 9:39 PM
  </div>
);

// ---------- Region D: composer ----------
export const MessageComposer: React.FC<{ bottom: number; text: string; cursor: boolean; sendPressed?: boolean; flash?: number }> =
  ({ bottom, text, cursor, flash = 0 }) => {
    const two = Array.from(text).length > 30;
    const h = two ? 63.5 : 41.5;
    return (
      <div style={{ position: "absolute", left: 0, top: bottom - h, width: PT.W, height: h }}>
        <Glass style={{ left: 16.6, top: h - 41.5, width: 39, height: 39, borderRadius: 19.5 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M8 1.5v13M1.5 8h13" /></svg>
        </Glass>
        <div style={{ position: "absolute", left: 68.6, top: 0, width: 316.8, height: h, borderRadius: 20.75, background: C.glass,
          border: `0.6px solid ${flash > 0 ? `rgba(10,132,255,${0.25 + 0.75 * flash})` : C.glassLine}`, boxSizing: "border-box",
          boxShadow: flash > 0 ? `0 0 ${14 * flash}px rgba(10,132,255,${0.45 * flash})` : "none",
          padding: "9px 44px 9px 14px", fontFamily: SF, fontSize: 17, lineHeight: "22px", letterSpacing: -0.25, color: "#fff" }}>
          {text ? <Rich text={text} size={17} /> : null}
          {cursor && <span style={{ display: "inline-block", width: 2, height: 21, background: C.blue, verticalAlign: "-4px", marginLeft: 1, borderRadius: 1 }} />}
          {!text && <span style={{ color: C.placeholder, marginLeft: cursor ? 0 : 3 }}>iMessage</span>}
          <div style={{ position: "absolute", right: 5.5, bottom: 5.5, width: 30, height: 30, borderRadius: 15, display: "flex", alignItems: "center", justifyContent: "center",
            background: text ? C.blue : "transparent" }}>
            {text ? (
              <svg width="14" height="16" viewBox="0 0 14 16" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 14.5V2M1.5 7.5L7 2l5.5 5.5" /></svg>
            ) : (
              <svg width="14" height="20" viewBox="0 0 14 20" fill="none" stroke={C.placeholder} strokeWidth="1.7" strokeLinecap="round"><rect x="3.5" y="1" width="7" height="11" rx="3.5" /><path d="M1 9.5a6 6 0 0 0 12 0M7 15.5V19" /></svg>
            )}
          </div>
        </div>
      </div>
    );
  };

// ---------- Region E: standard iOS keyboard ----------
const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
const KW = 33.4, KG = 6.2, KHt = 41.5, ROW_Y = [23.8, 77.5, 131.3, 185.0];
export const keyRect = (ch: string) => {
  for (let ri = 0; ri < 3; ri++) {
    const row = ROWS[ri], i = row.indexOf(ch);
    if (i >= 0) { const n = row.length, x0 = (PT.W - (n * KW + (n - 1) * KG)) / 2; return { x: x0 + i * (KW + KG), y: ROW_Y[ri], w: KW, h: KHt }; }
  }
  if (ch === " ") return { x: 104.9, y: ROW_Y[3], w: 191.4, h: KHt };
  return null;
};
export const KeyboardShell: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: PT.W, height: KB_H + 40, background: C.kbBg, borderTopLeftRadius: 27, borderTopRightRadius: 27,
    boxShadow: "0 -0.6px 0 rgba(255,255,255,0.10)" }}>{children}</div>
);
const Key: React.FC<{ x: number; y: number; w: number; h: number; children?: React.ReactNode; pressed?: boolean; fs?: number }> =
  ({ x, y, w, h, children, pressed, fs = 23 }) => (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 8.5, background: pressed ? "rgb(96,96,98)" : C.key,
      display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SF, fontSize: fs, color: "#fff" }}>{children}</div>
  );
export const GlobeMicRow: React.FC<{ globeHeld?: boolean }> = ({ globeHeld }) => (
  <>
    <div style={{ position: "absolute", left: 28, top: 252.8, opacity: globeHeld ? 0.45 : 1 }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><ellipse cx="12" cy="12" rx="4.3" ry="10" /><path d="M2 12h20M3.5 7h17M3.5 17h17" /></svg>
    </div>
    <div style={{ position: "absolute", left: 346, top: 252.8 }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"><rect x="8.5" y="2.5" width="7" height="12" rx="3.5" /><path d="M5 11.5a7 7 0 0 0 14 0M12 18.5V22M8.5 22h7" /></svg>
    </div>
  </>
);
export const StandardKeyboard: React.FC<{ pressedChar: string | null; deleting: boolean; spacePressed: boolean }> = ({ pressedChar, deleting, spacePressed }) => (
  <>
    {ROWS.map((row) => Array.from(row).map((ch) => <Key key={ch} {...keyRect(ch)!} pressed={pressedChar === ch}>{ch}</Key>))}
    <Key x={6.1} y={ROW_Y[2]} w={43.7} h={KHt}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round"><path d="M10 2.5l7.5 7.8h-4v6.7h-7v-6.7h-4z" /></svg>
    </Key>
    <Key x={PT.W - 6.1 - 43.7} y={ROW_Y[2]} w={43.7} h={KHt} pressed={deleting}>
      <svg width="24" height="18" viewBox="0 0 24 18" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round"><path d="M7.5 1.5h14.5v15H7.5L1.5 9z" /><path d="M11.5 5.5l6.5 7M18 5.5l-6.5 7" strokeLinecap="round" /></svg>
    </Key>
    <Key x={7.9} y={ROW_Y[3]} w={42.4} h={KHt} fs={17}>123</Key>
    <Key x={56.8} y={ROW_Y[3]} w={42.4} h={KHt}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M7.5 14a5.5 5.5 0 0 0 9 0" /><circle cx="9" cy="9.5" r="0.9" fill="#fff" /><circle cx="15" cy="9.5" r="0.9" fill="#fff" /></svg>
    </Key>
    <Key {...keyRect(" ")!} pressed={spacePressed} fs={16}>space</Key>
    <Key x={302.4} y={ROW_Y[3]} w={91.8} h={KHt}>
      <svg width="22" height="16" viewBox="0 0 22 16" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 2v6.5H3M7.5 4L2.5 8.5l5 4.5" /></svg>
    </Key>
    {pressedChar && pressedChar !== " " && keyRect(pressedChar) && (() => {
      const k = keyRect(pressedChar)!;
      return (
        <div style={{ position: "absolute", left: k.x - 8, top: k.y - 52, width: k.w + 16, height: k.h + 52, borderRadius: 11, background: C.keyPop,
          boxShadow: "0 3px 10px rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", paddingTop: 6, boxSizing: "border-box",
          fontFamily: SF, fontSize: 33, color: "#fff" }}>{pressedChar}</div>
      );
    })()}
  </>
);

// ---------- context menu (long-press on a message) ----------
const TAPBACKS = ["2764-fe0f", "1f44d", "1f44e", "1f602", "203c-fe0f", "2753"];
export const MessageContextMenu: React.FC<{ k: number; copyPressed: boolean; bubbleTop: number }> = ({ k, copyPressed, bubbleTop }) => {
  const rows: [string, React.ReactNode][] = [
    ["Reply", <svg key="r" width="20" height="18" viewBox="0 0 20 18" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round"><path d="M8 2L1.5 8 8 14V10.5c5 0 8.5 1.5 10.5 5.5-.5-6-4-9.5-10.5-10z" /></svg>],
    ["Copy", <svg key="c" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.6"><rect x="6.5" y="6.5" width="11" height="11" rx="2.5" /><path d="M13.5 6.5V4.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" /></svg>],
    ["Translate", <svg key="t" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.6"><rect x="1.5" y="2.5" width="17" height="13" rx="4" /><path d="M6 15.5l-1 3 4-3" /><path d="M5.5 6.5h5M8 6.5c0 3-1.5 5-3 5.5M7 9c1 1.5 2.5 2.5 4 2.5" strokeLinecap="round" /></svg>],
    ["More…", <svg key="m" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.6"><circle cx="10" cy="10" r="8.5" /><circle cx="6" cy="10" r="0.8" fill="#fff" /><circle cx="10" cy="10" r="0.8" fill="#fff" /><circle cx="14" cy="10" r="0.8" fill="#fff" /></svg>],
  ];
  return (
    <>
      <div style={{ position: "absolute", inset: 0, backdropFilter: `blur(${18 * k}px)`, background: `rgba(0,0,0,${0.45 * k})` }} />
      {/* tapback bar */}
      <div style={{ position: "absolute", left: 16.6, top: bubbleTop - 56, height: 46, padding: "0 12px", borderRadius: 23, display: "flex", gap: 13, alignItems: "center",
        background: "rgba(48,48,51,0.96)", opacity: k, transform: `scale(${0.85 + 0.15 * k})`, transformOrigin: "left bottom" }}>
        {TAPBACKS.map((e) => <Img key={e} src={staticFile(`emoji/${e}.png`)} style={{ width: 24, height: 24 }} />)}
      </div>
      {/* lifted bubble */}
      <div style={{ position: "absolute", left: 16.6, top: bubbleTop, transform: `scale(${1 + 0.03 * k})`, transformOrigin: "left center",
        filter: `drop-shadow(0 10px 18px rgba(0,0,0,${0.55 * k}))` }}>
        <Bubble text={INCOMING} tailBg="transparent" />
      </div>
      <div style={{ position: "absolute", left: 16.6, top: bubbleTop + BUBBLE_H + 10, width: 252, borderRadius: 20, overflow: "hidden", background: "rgba(45,45,48,0.97)",
        opacity: k, transform: `scale(${0.8 + 0.2 * k})`, transformOrigin: "left top", fontFamily: SF }}>
        {rows.map(([label, icon], i) => (
          <div key={label} style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", fontSize: 17, color: "#fff",
            letterSpacing: -0.3, background: label === "Copy" && copyPressed ? "rgba(255,255,255,0.16)" : "transparent", borderTop: i ? "0.6px solid rgba(255,255,255,0.1)" : "none" }}>
            {label}{icon}
          </div>
        ))}
      </div>
    </>
  );
};

// ---------- keyboard switcher (long-press globe) ----------
export const KeyboardSwitcher: React.FC<{ k: number; highlight: number; icon: React.ReactNode }> = ({ k, highlight, icon }) => (
  <div style={{ position: "absolute", left: 12, top: 567 + 248 - 14 - 176, width: 236, borderRadius: 16, overflow: "hidden", background: "rgba(66,66,70,0.98)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.6)", opacity: k, transform: `scale(${0.9 + 0.1 * k})`, transformOrigin: "left bottom", fontFamily: SF, color: "#fff" }}>
    {["English (US)", "Emoji", "AI Writing"].map((m, i) => (
      <div key={m} style={{ height: 44, display: "flex", alignItems: "center", gap: 10, padding: "0 14px", fontSize: 17, letterSpacing: -0.3,
        background: highlight === i ? C.blue : "transparent", borderTop: i ? "0.6px solid rgba(255,255,255,0.10)" : "none" }}>
        {m === "AI Writing" && icon}{m}
      </div>
    ))}
    <div style={{ height: 44, display: "flex", alignItems: "center", padding: "0 14px", fontSize: 15, color: "rgba(255,255,255,0.6)", borderTop: "0.6px solid rgba(255,255,255,0.18)" }}>Keyboard Settings…</div>
  </div>
);

// ---------- touch indicator ----------
export const Touch: React.FC<{ t: number; a: number; b: number; x: number; y: number; x2?: number; y2?: number; m?: [number, number] }> = ({ t, a, b, x, y, x2, y2, m }) => {
  if (t < a - 0.05 || t > b + 0.25) return null;
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  const inK = clamp((t - a + 0.05) / 0.1), outK = clamp((t - b) / 0.2);
  const mk = m ? clamp((t - m[0]) / (m[1] - m[0])) : 0;
  const e = mk * mk * (3 - 2 * mk);
  const cx = x2 !== undefined ? x + (x2 - x) * e : x, cy = y2 !== undefined ? y + (y2 - y) * e : y;
  const s = 0.85 + 0.15 * inK + 0.2 * outK;
  return (
    <div style={{ position: "absolute", left: cx - 19, top: cy - 19, width: 38, height: 38, borderRadius: 19, transform: `scale(${s})`,
      background: "rgba(255,255,255,0.30)", border: "1.2px solid rgba(255,255,255,0.6)", boxSizing: "border-box", opacity: inK * (1 - outK) }} />
  );
};
