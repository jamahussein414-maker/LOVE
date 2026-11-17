import React from "react";
import { Img, staticFile } from "remotion";
import { EMOJI, EO, T, r, mix, pop, INCOMING, REPLY, composerAt } from "./lib";

// ---------- screen geometry (px inside the phone screen) ----------
export const SW = 672, SH = 1414, BAR = 90, SYS_KB = 480, RR_KB = 610;
export const FONT = "Inter, system-ui, sans-serif";
const BLUE = "#0A84FF", INDIGO = "#5E5CE6";
const BLUE_GRAD = `linear-gradient(135deg, ${BLUE} 0%, #3D6BFF 55%, ${INDIGO} 100%)`;

export const Rich: React.FC<{ text: string; size: number }> = ({ text, size }) => (
  <>
    {Array.from(text).map((c, i) =>
      EMOJI[c] ? (
        <Img key={i} src={staticFile(`emoji/${EMOJI[c]}.png`)}
          style={{ width: size * 1.12, height: size * 1.12, verticalAlign: "-0.2em", margin: "0 0.03em" }} />
      ) : (
        <React.Fragment key={i}>{c}</React.Fragment>
      )
    )}
  </>
);

// ---------- icons ----------
export const Sparkle: React.FC<{ size: number; color?: string }> = ({ size, color = "#6CB8FF" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path fill={color}
    d="M12 1.5c.5 4.9 2.6 7.9 7.6 9.1.6.2.6.6 0 .8-5 1.2-7.1 4.2-7.6 9.1-.1.6-.5.6-.6 0-.5-4.9-2.6-7.9-7.6-9.1-.6-.2-.6-.6 0-.8 5-1.2 7.1-4.2 7.6-9.1.1-.6.5-.6.6 0z" /></svg>
);
const Globe: React.FC<{ s?: number }> = ({ s = 44 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6">
    <circle cx="12" cy="12" r="9.5" /><ellipse cx="12" cy="12" rx="4.2" ry="9.5" /><path d="M2.5 12h19M4 7h16M4 17h16" /></svg>
);
const Mic: React.FC<{ s?: number }> = ({ s = 44 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round">
    <rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" /></svg>
);
const Clip: React.FC<{ s?: number }> = ({ s = 30 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#9ECBFF" strokeWidth="1.8" strokeLinejoin="round">
    <rect x="5" y="4.5" width="14" height="17" rx="2.5" /><rect x="8.5" y="2.5" width="7" height="4" rx="1.4" fill="#16161B" /></svg>
);
const ArrowUp: React.FC<{ s?: number; c?: string }> = ({ s = 30, c = "#fff" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5M6 11l6-6 6 6" /></svg>
);
const Refresh: React.FC = () => (
  <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
    <path d="M20 12a8 8 0 1 1-2.4-5.7M20 4v5h-5" /></svg>
);
const Check: React.FC<{ s?: number }> = ({ s = 26 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
export const AppIcon: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.23, background: BLUE_GRAD, position: "relative",
    boxShadow: `0 ${size * 0.12}px ${size * 0.4}px rgba(10,132,255,0.45), inset 0 ${size * 0.02}px 0 rgba(255,255,255,0.35)`,
    display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0) 55%)" }} />
    <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: size * 0.56, color: "#fff", letterSpacing: -size * 0.02, position: "relative" }}>R</span>
    <div style={{ position: "absolute", right: size * 0.14, top: size * 0.12 }}><Sparkle size={size * 0.24} color="#fff" /></div>
  </div>
);

// ---------- status bar ----------
const StatusBar: React.FC = () => (
  <div style={{ position: "absolute", top: 0, left: 0, width: SW, height: 60, fontFamily: FONT, color: "#fff" }}>
    <div style={{ position: "absolute", left: 66, top: 20, fontSize: 30, fontWeight: 600, letterSpacing: -0.3 }}>9:41</div>
    <div style={{ position: "absolute", right: 46, top: 24, display: "flex", gap: 10, alignItems: "center" }}>
      <svg width="34" height="22" viewBox="0 0 17 11">{[0, 1, 2, 3].map((i) => <rect key={i} x={i * 4.4} y={8 - i * 2.4} width="3" height={3 + i * 2.4} rx="0.8" fill="#fff" />)}</svg>
      <svg width="30" height="22" viewBox="0 0 15 11"><path d="M7.5 10.3l2-2.3a3 3 0 0 0-4 0z M2.6 5.6a7 7 0 0 1 9.8 0l-1.3 1.4a5 5 0 0 0-7.2 0z M0.2 3.1a10.4 10.4 0 0 1 14.6 0l-1.3 1.4a8.4 8.4 0 0 0-12 0z" fill="#fff" /></svg>
      <svg width="50" height="24" viewBox="0 0 25 12"><rect x="0.5" y="0.5" width="21" height="11" rx="3.2" stroke="rgba(255,255,255,0.45)" fill="none" /><rect x="2" y="2" width="16" height="8" rx="2" fill="#fff" /><rect x="22.6" y="4" width="1.6" height="4" rx="0.8" fill="rgba(255,255,255,0.45)" /></svg>
    </div>
  </div>
);

// ---------- dating app chat ----------
const Avatar: React.FC<{ size: number; dot?: boolean }> = ({ size, dot }) => (
  <div style={{ width: size, height: size, borderRadius: size, position: "relative", flexShrink: 0,
    background: "radial-gradient(circle at 30% 25%, #FFB199 0%, #FF6A88 45%, #B1458F 100%)",
    display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 700, color: "#fff", fontSize: size * 0.42 }}>
    M
    {dot && <div style={{ position: "absolute", right: 0, bottom: 0, width: size * 0.26, height: size * 0.26, borderRadius: 99, background: "#30D158", border: `${size * 0.05}px solid #000` }} />}
  </div>
);

const Header: React.FC = () => (
  <div style={{ position: "absolute", top: 60, left: 0, width: SW, height: 124, display: "flex", alignItems: "center",
    padding: "0 26px", boxSizing: "border-box", borderBottom: "1px solid #1C1C1F", fontFamily: FONT, background: "#000" }}>
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
    <div style={{ marginLeft: 14 }}><Avatar size={74} dot /></div>
    <div style={{ marginLeft: 18, flex: 1 }}>
      <div style={{ color: "#fff", fontSize: 32, fontWeight: 700, letterSpacing: -0.4 }}>Maya</div>
      <div style={{ color: "#8E8E93", fontSize: 21, fontWeight: 500, marginTop: 2 }}>Matched today · Active now</div>
    </div>
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.9"><rect x="2.5" y="6.5" width="13" height="11" rx="2.5" /><path d="M15.5 10.5l6-3.5v10l-6-3.5z" /></svg>
  </div>
);

export const Bubble: React.FC<{ text: string; out?: boolean; style?: React.CSSProperties }> = ({ text, out, style }) => (
  <div style={{ maxWidth: 470, padding: "18px 26px 20px", borderRadius: 34, fontFamily: FONT, fontSize: 32, lineHeight: 1.28,
    fontWeight: 500, color: "#fff", letterSpacing: -0.2,
    background: out ? `linear-gradient(135deg, ${BLUE} 0%, #2F6BFF 100%)` : "#26262A",
    borderBottomLeftRadius: out ? 34 : 10, borderBottomRightRadius: out ? 10 : 34, ...style }}>
    <Rich text={text} size={32} />
  </div>
);

const TypingDots: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ display: "inline-flex", gap: 10, padding: "24px 26px", background: "#26262A", borderRadius: 34, borderBottomLeftRadius: 10 }}>
    {[0, 1, 2].map((i) => {
      const b = 0.5 + 0.5 * Math.max(0, Math.sin(((t * 2.2 - i * 0.18) % 1) * Math.PI));
      return <div key={i} style={{ width: 16, height: 16, borderRadius: 9, background: `rgba(200,200,206,${0.35 + 0.65 * b})`, transform: `translateY(${-4 * b}px)` }} />;
    })}
  </div>
);

// ---------- keyboards ----------
const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
const KW = 56.6, KH = 82, KG = 10, ROW_Y = [74, 170, 266], ROW4 = 362;
export const keyRect = (ch: string) => {
  for (let r_ = 0; r_ < 3; r_++) {
    const row = ROWS[r_]; const i = row.indexOf(ch);
    if (i >= 0) {
      const n = row.length; const x0 = (SW - (n * KW + (n - 1) * KG)) / 2;
      return { x: x0 + i * (KW + KG), y: ROW_Y[r_], w: KW, h: KH };
    }
  }
  if (ch === " ") return { x: 8 + 86 * 2 + 20, y: ROW4, w: SW - 16 - 172 - 20 - 160 - 10, h: KH };
  return null;
};

const Key: React.FC<{ x: number; y: number; w: number; h: number; label?: React.ReactNode; dark?: boolean; pressed?: boolean; size?: number }> =
  ({ x, y, w, h, label, dark, pressed, size = 36 }) => (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 12,
      background: pressed ? (dark ? "#58585D" : "#2E2E31") : dark ? "#3A3A3D" : "#6B6B70",
      boxShadow: "0 2px 0 rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontFamily: FONT, fontSize: size, fontWeight: 400 }}>{label}</div>
  );

export const SystemKeyboard: React.FC<{ t: number }> = ({ t }) => {
  const c = composerAt(t);
  const pressedChar = c.lastChar && t - c.lastTyped < 0.11 ? c.lastChar.toLowerCase() : null;
  const delPressed = c.deleting;
  const globeHeld = t >= T.globePress && t < T.release;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: SW, height: SYS_KB + BAR }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(38,38,41,0.97)", borderTop: "1px solid rgba(255,255,255,0.06)" }} />
      {/* predictive bar */}
      <div style={{ position: "absolute", left: 0, top: 6, width: SW, height: 56, display: "flex", fontFamily: FONT, color: "#fff", fontSize: 28 }}>
        {["I", "Haha", "Yes"].map((w, i) => (
          <div key={w} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", borderLeft: i ? "1px solid rgba(255,255,255,0.14)" : "none", height: 40, marginTop: 8 }}>{w}</div>
        ))}
      </div>
      {ROWS.map((row) => Array.from(row).map((ch) => {
        const k = keyRect(ch)!;
        return <Key key={ch} {...k} label={ch} pressed={pressedChar === ch} />;
      }))}
      <Key x={8} y={ROW_Y[2]} w={78} h={KH} dark label={<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"><path d="M12 4l8 8h-4.5v7h-7v-7H4z" /></svg>} />
      <Key x={SW - 86} y={ROW_Y[2]} w={78} h={KH} dark pressed={delPressed} label={<svg width="38" height="34" viewBox="0 0 26 20" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"><path d="M8 2h15v16H8l-6-8z" /><path d="M12 7l6 6M18 7l-6 6" strokeLinecap="round" /></svg>} />
      <Key x={8} y={ROW4} w={86} h={KH} dark label="123" size={28} />
      <Key x={102} y={ROW4} w={86} h={KH} dark label={<Img src={staticFile("emoji/1f60a.png")} style={{ width: 36, height: 36, filter: "grayscale(1) brightness(2.2)" }} />} />
      <Key {...keyRect(" ")!} label="space" size={28} pressed={!!c.lastChar && c.lastChar === " " && t - c.lastTyped < 0.11} />
      <Key x={SW - 168} y={ROW4} w={160} h={KH} dark label="return" size={28} />
      {/* globe + mic row */}
      <div style={{ position: "absolute", left: 36, top: SYS_KB + 18, opacity: globeHeld ? 0.5 : 1 }}><Globe /></div>
      <div style={{ position: "absolute", right: 36, top: SYS_KB + 18 }}><Mic /></div>
      {/* key popup */}
      {pressedChar && pressedChar !== " " && keyRect(pressedChar) && (() => {
        const k = keyRect(pressedChar)!;
        return (
          <div style={{ position: "absolute", left: k.x - 14, top: k.y - 104, width: k.w + 28, height: k.h + 104, borderRadius: 16,
            background: "#6B6B70", boxShadow: "0 6px 18px rgba(0,0,0,0.5)", display: "flex", justifyContent: "center",
            fontFamily: FONT, fontSize: 56, color: "#fff", paddingTop: 14, boxSizing: "border-box" }}>{pressedChar}</div>
        );
      })()}
    </div>
  );
};

const TONES = ["Flirty", "Warm", "Funny", "Confident"];
export const ReplyRightKeyboard: React.FC<{ t: number; enter: number }> = ({ t, enter }) => {
  const pasted = r(t, T.pasteTap + 0.08, T.pasteTap + 0.45);
  const sel = r(t, T.flirtyTap + 0.05, T.flirtyTap + 0.3);
  const gen = t >= T.genA && t < T.genB;
  const words = REPLY.split(" ");
  const streamK = r(t, T.genB, T.streamB, (x) => x);
  const hasReply = t >= T.genB;
  const useReady = r(t, T.streamB - 0.2, T.streamB + 0.3);
  const usePress = t >= T.useTap && t < T.useTap + 0.18;
  const pastePress = t >= T.pasteTap && t < T.pasteTap + 0.18;
  const sweep = r(t, T.swapA + 0.15, T.swapB + 0.5, (x) => x);
  const glass = "rgba(255,255,255,0.06)", line = "rgba(255,255,255,0.10)";
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: SW, height: RR_KB + BAR, overflow: "hidden", fontFamily: FONT, color: "#fff" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #17171D 0%, #0D0D11 100%)" }} />
      <div style={{ position: "absolute", left: -120, top: -220, width: 520, height: 420, borderRadius: 400, background: "radial-gradient(closest-side, rgba(10,132,255,0.30), rgba(10,132,255,0))" }} />
      <div style={{ position: "absolute", right: -160, top: -200, width: 520, height: 420, borderRadius: 400, background: "radial-gradient(closest-side, rgba(94,92,230,0.24), rgba(94,92,230,0))" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: SW, height: 1.5, background: "linear-gradient(90deg, rgba(10,132,255,0), rgba(108,184,255,0.9), rgba(94,92,230,0))", opacity: 0.6 + 0.4 * enter }} />
      {/* entrance light sweep */}
      {sweep > 0 && sweep < 1 && (
        <div style={{ position: "absolute", top: -100, left: mix(-400, SW + 200, sweep), width: 220, height: RR_KB + 300,
          transform: "rotate(18deg)", background: "linear-gradient(90deg, rgba(108,184,255,0), rgba(108,184,255,0.22), rgba(108,184,255,0))" }} />
      )}
      {/* header */}
      <div style={{ position: "absolute", left: 22, top: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <AppIcon size={40} />
        <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: 4.5 }}>REPLYRIGHT</span>
        <Sparkle size={20} />
      </div>
      <div style={{ position: "absolute", right: 22, top: 26, fontSize: 15, fontWeight: 700, letterSpacing: 2.5, color: "rgba(255,255,255,0.55)",
        border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: "5px 12px" }}>CONCEPT</div>
      {/* paste field */}
      <div style={{ position: "absolute", left: 20, top: 82, width: SW - 40, height: 120, borderRadius: 24, background: pastePress ? "rgba(255,255,255,0.12)" : glass,
        border: `1.5px solid ${pasted > 0.5 ? "rgba(108,184,255,0.35)" : line}`, boxSizing: "border-box", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, opacity: 1 - pasted }}>
          <Clip /><span style={{ fontSize: 29, fontWeight: 600 }}>Paste message</span>
        </div>
        <div style={{ position: "absolute", left: 26, top: 18, right: 26, opacity: pasted, transform: `translateY(${(1 - pasted) * 10}px)` }}>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 2.2, color: "#7FA9D9" }}>THEIR MESSAGE</div>
          <div style={{ fontSize: 27, fontWeight: 500, marginTop: 8, lineHeight: 1.25, color: "rgba(255,255,255,0.92)" }}>
            “<Rich text={INCOMING} size={27} />”</div>
        </div>
      </div>
      {/* tone chips */}
      <div style={{ position: "absolute", left: 20, top: 220, width: SW - 40, display: "flex", gap: 10 }}>
        {TONES.map((name, i) => {
          const on = i === 0 ? sel : 0;
          const press = i === 0 && t >= T.flirtyTap && t < T.flirtyTap + 0.15;
          const sc = i === 0 && t >= T.flirtyTap ? 0.94 + 0.06 * pop(t, T.flirtyTap + 0.05, 0.4) : 1;
          return (
            <div key={name} style={{ flex: 1, height: 66, borderRadius: 33, position: "relative", transform: `scale(${press ? 0.94 : sc})`,
              background: glass, border: `1.5px solid ${line}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 25, fontWeight: 600, color: on > 0.5 ? "#fff" : `rgba(255,255,255,${hasReply || sel > 0 ? 0.55 : 0.88})`,
              boxShadow: on ? `0 8px 26px rgba(10,132,255,${0.55 * on})` : "none" }}>
              <div style={{ position: "absolute", inset: -1.5, borderRadius: 33, background: BLUE_GRAD, opacity: on }} />
              <span style={{ position: "relative" }}>{name}</span>
            </div>
          );
        })}
      </div>
      {/* suggestion card */}
      <div style={{ position: "absolute", left: 20, top: 304, width: SW - 40, height: 196, borderRadius: 26, background: glass,
        border: `1.5px solid ${hasReply ? "rgba(108,184,255,0.38)" : line}`, boxSizing: "border-box", padding: "20px 26px",
        boxShadow: hasReply ? "0 0 40px rgba(10,132,255,0.15)" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 700, letterSpacing: 2.2, color: "#7FB8FF" }}>
          <Sparkle size={16} />{sel > 0.5 ? "FLIRTY REPLY" : "SUGGESTED REPLY"}
        </div>
        {!gen && !hasReply && (
          <div style={{ marginTop: 26, fontSize: 25, color: "rgba(255,255,255,0.38)", fontWeight: 500 }}>Pick a vibe to get a reply</div>
        )}
        {gen && [0.92, 0.6].map((w, i) => {
          const ph = ((t - T.genA) * 1.4 + i * 0.2) % 1;
          return <div key={i} style={{ marginTop: i ? 14 : 22, height: 30, width: `${w * 100}%`, borderRadius: 15,
            background: `linear-gradient(90deg, rgba(255,255,255,0.07) ${ph * 100 - 30}%, rgba(108,184,255,0.30) ${ph * 100}%, rgba(255,255,255,0.07) ${ph * 100 + 30}%)` }} />;
        })}
        {hasReply && (
          <div style={{ marginTop: 14, fontSize: 31, lineHeight: 1.32, fontWeight: 600, letterSpacing: -0.3 }}>
            {words.map((w, i) => {
              const k = Math.min(1, Math.max(0, streamK * words.length - i));
              return <span key={i} style={{ opacity: k, filter: `blur(${(1 - k) * 4}px)` }}><Rich text={w} size={31} />{i < words.length - 1 ? " " : ""}</span>;
            })}
          </div>
        )}
      </div>
      {/* actions */}
      <div style={{ position: "absolute", left: 20, top: 516, width: SW - 40 - 92, height: 78, borderRadius: 22, background: BLUE_GRAD,
        opacity: 0.28 + 0.72 * useReady, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontSize: 28, fontWeight: 700,
        transform: `scale(${usePress ? 0.96 : 1})`, boxShadow: useReady ? `0 10px 30px rgba(10,132,255,${0.45 * useReady})` : "none" }}>
        <ArrowUp s={28} />Use this reply
      </div>
      <div style={{ position: "absolute", right: 20, top: 516, width: 78, height: 78, borderRadius: 22, background: glass, border: `1.5px solid ${line}`,
        boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.4 + 0.6 * useReady }}><Refresh /></div>
      {/* globe + mic row */}
      <div style={{ position: "absolute", left: 36, top: RR_KB + 18 }}><Globe /></div>
      <div style={{ position: "absolute", right: 36, top: RR_KB + 18 }}><Mic /></div>
    </div>
  );
};

// ---------- touches ----------
export const Touch: React.FC<{ t: number; a: number; b: number; x: number; y: number; x2?: number; y2?: number; ma?: number; mb?: number }> =
  ({ t, a, b, x, y, x2, y2, ma = 0, mb = 0 }) => {
    if (t < a - 0.02 || t > b + 0.3) return null;
    const inK = r(t, a - 0.02, a + 0.12), outK = r(t, b, b + 0.25);
    const mk = x2 !== undefined ? r(t, ma, mb) : 0;
    const cx = x2 !== undefined ? mix(x, x2, mk) : x, cy = y2 !== undefined ? mix(y, y2!, mk) : y;
    const s = (0.7 + 0.3 * inK) * (1 + 0.25 * outK);
    return (
      <div style={{ position: "absolute", left: cx - 38, top: cy - 38, width: 76, height: 76, borderRadius: 76, transform: `scale(${s})`,
        background: "rgba(255,255,255,0.32)", border: "2px solid rgba(255,255,255,0.65)", opacity: inK * (1 - outK),
        boxShadow: "0 4px 18px rgba(0,0,0,0.35)" }} />
    );
  };

// ---------- full phone screen ----------
export const PhoneScreen: React.FC<{ t: number }> = ({ t }) => {
  const swapK = r(t, T.swapA, T.swapB, EO);
  const kbH = mix(SYS_KB, RR_KB, r(t, T.swapA + 0.1, T.swapB));
  const c = composerAt(t);
  const inK = r(t, T.incoming, T.incoming + 0.45);
  const menuK = r(t, T.menuOpen - 0.15, T.menuOpen + 0.2) * (1 - r(t, T.menuClose, T.menuClose + 0.3));
  const hud = r(t, T.hudIn, T.hudIn + 0.25) * (1 - r(t, T.hudOut - 0.3, T.hudOut));
  const switcher = r(t, T.switcherOpen, T.switcherOpen + 0.18) * (1 - r(t, T.release, T.release + 0.15));
  const flyK = r(t, T.flyA, T.flyB, EO);
  const sentK = r(t, T.sent, T.sent + 0.4);
  const hasText = c.text.length > 0;
  const inputTextOpacity = c.text === REPLY ? r(t, T.flyB - 0.15, T.flyB + 0.1) : 1;
  const blink = t < T.sent && (Math.floor(t * 1.8) % 2 === 0 || (c.lastTyped > 0 && t - c.lastTyped < 0.5) || c.deleting);
  const sendPress = t >= T.sendTap && t < T.sendTap + 0.16;
  const kbBottomTop = SH - BAR - kbH;
  const twoLines = c.text === REPLY;
  const inputH = twoLines ? 136 : 96;
  const inputTop = kbBottomTop - inputH;
  const bubbleY = 236;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#000", overflow: "hidden" }}>
      <StatusBar />
      <Header />
      <div style={{ position: "absolute", top: 202, width: SW, textAlign: "center", fontFamily: FONT, fontSize: 20, fontWeight: 600, color: "#8E8E93" }}>Today 9:41 PM</div>
      {/* incoming */}
      <div style={{ position: "absolute", left: 20, top: bubbleY + 18, display: "flex", alignItems: "flex-end", gap: 12 }}>
        <Avatar size={44} />
        {t < T.incoming ? <TypingDots t={t} /> :
          <div style={{ transform: `translateY(${(1 - inK) * 14}px) scale(${0.92 + 0.08 * pop(t, T.incoming, 0.5)})`, transformOrigin: "left bottom", opacity: inK }}>
            <Bubble text={INCOMING} /></div>}
      </div>
      {/* sent reply */}
      {t >= T.sent && (
        <div style={{ position: "absolute", right: 22, top: bubbleY + 160 + (1 - sentK) * 140, opacity: Math.min(1, sentK * 1.6), display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <Bubble text={REPLY} out />
          <div style={{ fontFamily: FONT, fontSize: 20, fontWeight: 600, color: "#8E8E93", marginTop: 8, opacity: r(t, T.delivered, T.delivered + 0.3) }}>Delivered</div>
        </div>
      )}
      {t >= T.theirTyping && (
        <div style={{ position: "absolute", left: 76, top: bubbleY + 160 + 210, opacity: r(t, T.theirTyping, T.theirTyping + 0.3) }}><TypingDots t={t} /></div>
      )}
      {/* input bar */}
      <div style={{ position: "absolute", left: 0, top: inputTop, width: SW, height: inputH, background: "#000", borderTop: "1px solid #18181B",
        display: "flex", alignItems: "flex-end", padding: "0 18px 14px", boxSizing: "border-box", gap: 14, fontFamily: FONT }}>
        <div style={{ width: 66, height: 66, borderRadius: 33, background: "#1C1C1F", display: "flex", alignItems: "center", justifyContent: "center", color: "#8E8E93", fontSize: 21, fontWeight: 800, letterSpacing: 0.5 }}>GIF</div>
        <div style={{ flex: 1, minHeight: 66, borderRadius: 33, background: "#141417", border: "1.5px solid #2A2A2E", boxSizing: "border-box",
          padding: "13px 22px", fontSize: 30, lineHeight: 1.25, color: "#fff", letterSpacing: -0.2 }}>
          {hasText ? <span style={{ opacity: inputTextOpacity }}><Rich text={c.text} size={30} /></span> :
            <span style={{ color: "#5C5C62" }}>{t < T.sent ? "" : ""}</span>}
          {blink && <span style={{ display: "inline-block", width: 3, height: 34, background: BLUE, verticalAlign: "-6px", marginLeft: 2, borderRadius: 2 }} />}
          {!hasText && <span style={{ color: "#5C5C62", marginLeft: blink ? 0 : 5 }}>Message Maya…</span>}
        </div>
        <div style={{ width: 66, height: 66, borderRadius: 33, background: hasText ? BLUE_GRAD : "#1C1C1F", display: "flex", alignItems: "center", justifyContent: "center",
          transform: `scale(${sendPress ? 0.88 : 1})` }}><ArrowUp s={30} c={hasText ? "#fff" : "#5C5C62"} /></div>
      </div>
      {/* keyboards */}
      <div style={{ position: "absolute", left: 0, top: SH - BAR - SYS_KB + swapK * (SYS_KB + BAR + 40), opacity: 1 - r(t, T.swapA + 0.1, T.swapA + 0.45) }}>
        {swapK < 1 && <SystemKeyboard t={t} />}
      </div>
      {t >= T.swapA && (
        <div style={{ position: "absolute", left: 0, top: mix(SH + 20, SH - BAR - RR_KB, r(t, T.swapA + 0.12, T.swapB, EO)) }}>
          <ReplyRightKeyboard t={t} enter={r(t, T.swapA, T.swapB)} />
        </div>
      )}
      {/* flying reply text: card -> input */}
      {t >= T.flyA && t < T.flyB + 0.05 && (
        <div style={{ position: "absolute", left: mix(46, 118, flyK), top: mix(SH - BAR - RR_KB + 304 + 54, inputTop + 14, flyK), width: 520,
          fontFamily: FONT, fontSize: mix(31, 30, flyK), fontWeight: mix(600, 400, flyK) as any, lineHeight: 1.3, color: "#fff",
          opacity: 1 - r(t, T.flyB - 0.15, T.flyB), textShadow: "0 6px 20px rgba(10,132,255,0.6)" }}>
          <Rich text={REPLY} size={31} />
        </div>
      )}
      {/* context menu (long-press copy) */}
      {menuK > 0.001 && (
        <>
          <div style={{ position: "absolute", inset: 0, backdropFilter: `blur(${16 * menuK}px)`, background: `rgba(0,0,0,${0.4 * menuK})` }} />
          <div style={{ position: "absolute", left: 76, top: bubbleY + 18, transform: `scale(${1 + 0.04 * menuK})`, transformOrigin: "left center",
            filter: `drop-shadow(0 18px 30px rgba(0,0,0,${0.6 * menuK}))` }}><Bubble text={INCOMING} /></div>
          <div style={{ position: "absolute", left: 76, top: bubbleY + 160, width: 380, borderRadius: 26, overflow: "hidden", fontFamily: FONT,
            background: "rgba(44,44,48,0.96)", opacity: menuK, transform: `scale(${0.85 + 0.15 * menuK})`, transformOrigin: "left top" }}>
            {["Reply", "Copy", "Translate", "Report"].map((m, i) => {
              const hl = m === "Copy" && t >= T.copyTap - 0.05;
              return (
                <div key={m} style={{ height: 74, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 26px",
                  fontSize: 29, color: m === "Report" ? "#FF453A" : "#fff", background: hl ? "rgba(255,255,255,0.14)" : "transparent",
                  borderTop: i ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                  {m}
                  {m === "Copy" && <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"><rect x="8" y="8" width="12" height="12" rx="2.5" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>}
                </div>
              );
            })}
          </div>
        </>
      )}
      {/* copied HUD */}
      {hud > 0.001 && (
        <div style={{ position: "absolute", top: 196, left: 0, width: SW, display: "flex", justifyContent: "center", opacity: hud, transform: `translateY(${(1 - hud) * -12}px)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 26px", borderRadius: 30, background: "rgba(60,60,64,0.96)",
            fontFamily: FONT, fontSize: 25, fontWeight: 600, color: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}><Check s={24} />Copied</div>
        </div>
      )}
      {/* keyboard switcher (long-press globe) */}
      {switcher > 0.001 && (() => {
        const items = ["English (US)", "Emoji", "ReplyRight"];
        const hlIdx = t >= T.dragB - 0.05 ? 2 : t >= T.dragA + 0.2 ? 1 : -1;
        return (
          <div style={{ position: "absolute", left: 22, top: SH - BAR - 4 - 3 * 76 - 70, width: 400, borderRadius: 22, overflow: "hidden",
            background: "rgba(58,58,62,0.98)", boxShadow: "0 16px 40px rgba(0,0,0,0.6)", opacity: switcher, transform: `scale(${0.9 + 0.1 * switcher})`,
            transformOrigin: "left bottom", fontFamily: FONT, color: "#fff" }}>
            {items.map((m, i) => (
              <div key={m} style={{ height: 76, display: "flex", alignItems: "center", gap: 14, padding: "0 24px", fontSize: 28, fontWeight: 500,
                background: hlIdx === i ? BLUE : "transparent", borderTop: i ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                {m === "ReplyRight" && <AppIcon size={38} />}{m}
              </div>
            ))}
            <div style={{ height: 70, display: "flex", alignItems: "center", padding: "0 24px", fontSize: 24, color: "rgba(255,255,255,0.6)", borderTop: "1px solid rgba(255,255,255,0.14)" }}>Keyboard Settings…</div>
          </div>
        );
      })()}
      {/* touches */}
      <Touch t={t} a={T.bubblePress} b={T.menuOpen + 0.2} x={290} y={bubbleY + 70} />
      <Touch t={t} a={T.copyTap - 0.1} b={T.copyTap + 0.08} x={250} y={bubbleY + 160 + 74 + 37} />
      <Touch t={t} a={T.globePress} b={T.release} x={58} y={SH - BAR + 40} x2={200} y2={SH - BAR - 4 - 70 - 38} ma={T.dragA} mb={T.dragB} />
      <Touch t={t} a={T.pasteTap - 0.08} b={T.pasteTap + 0.12} x={SW / 2 + 60} y={SH - BAR - RR_KB + 142} />
      <Touch t={t} a={T.flirtyTap - 0.08} b={T.flirtyTap + 0.12} x={95} y={SH - BAR - RR_KB + 253} />
      <Touch t={t} a={T.useTap - 0.08} b={T.useTap + 0.14} x={300} y={SH - BAR - RR_KB + 555} />
      <Touch t={t} a={T.sendTap - 0.08} b={T.sendTap + 0.12} x={SW - 51} y={SH - BAR - RR_KB - 14 - 33} />
    </div>
  );
};
