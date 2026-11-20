// Reel 02 "He replied like customer support" - shots, sets, captions, phone inserts, end card.
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TL, L, r, mix, clamp, poseAt, talk, blinkAt, Key } from "./lib";
import { Overthinker, Friend } from "./characters";

const W = 1080, H = 1920;
const FONT = "Inter Display, Inter, sans-serif";
const EM: Record<string, string> = { "❤️": "2764-fe0f", "😉": "1f609", "👇": "1f447", "💀": "1f480" };
const Rich: React.FC<{ text: string; size: number }> = ({ text, size }) => {
  const parts: React.ReactNode[] = []; let buf = "";
  const chars = Array.from(text);
  for (let i = 0; i < chars.length; i++) {
    const two = chars[i] + (chars[i + 1] || "");
    const key = EM[two] ? two : EM[chars[i]] ? chars[i] : null;
    if (key) { if (buf) parts.push(buf); buf = ""; parts.push(<Img key={i} src={staticFile(`emoji/${EM[key]}.png`)} style={{ width: size * 1.1, height: size * 1.1, verticalAlign: "-0.18em" }} />); if (key.length > chars[i].length) i++; }
    else buf += chars[i];
  }
  if (buf) parts.push(buf);
  return <>{parts}</>;
};

// ---------------- performance: poses over time ----------------
const A_KEYS: Key[] = [
  [0, { lookY: 0.75, browAng: 6, browL: 0.1, browR: 0.1 }],
  [0.38, { eyeScale: 1.3, browL: 0.75, browR: 0.75, browAng: 10, tilt: -3, lookY: 0.45 }, 0.22],
  [2.8, { eyeScale: 1.12, browL: 0.45, browR: 0.45 }],
  [6.2, { eyeScale: 1, browL: 0.05, browR: 0.05, browAng: -3, tilt: -5, lookY: 0.65, smile: 0.12, eyeOpen: 0.82 }, 0.01],
  [7.6, { lookY: 0.5 }],
  [15.3, { lookX: 0.55, lookY: -0.05, smile: 0, browAng: 0, browL: 0, browR: 0, tilt: 0, eyeOpen: 0.9, eyeScale: 1 }, 0.01],
  [16.0, { lookY: 0.9, lookX: 0.15, browAng: 15, browL: 0.35, browR: 0.35, smile: -0.4, phoneY: 0.25, turn: 0.55, eyeOpen: 1 }, 0.01],
  [17.95, { lookX: 0.75, lookY: 0.05 }, 0.25],
  [23.0, { lookY: -0.25, lookX: 0.35, smile: 0.55, browAng: 9, blush: 0.7, turn: 0.2, phoneY: 0.2 }, 0.01],
];
const B_KEYS: Key[] = [
  [0, { lookX: -0.4 }],
  [3.2, { lean: 0, lookX: -0.4 }, 0.01],
  [3.3, { lean: 1, browR: 0.75, tilt: 5, smirk: 0.5, lookX: -0.5 }, 0.45],
  [9.9, { lean: 0.6, browR: 0.15, browL: 0, tilt: 0, smirk: 0, lookX: -0.15, eyeScale: 1 }, 0.01],
  [10.15, { eyeScale: 1.34 }, 0.9],
  [10.75, { browL: 1.05 }, 0.3],
  [12.0, { eyeScale: 1.4, browL: 1.15, browR: 1.15, browAng: -6, mouth: 0.22, lean: 1.3, tilt: -4, lookX: -0.3 }, 0.12],
  [15.0, { mouth: 0, eyeScale: 1.2, lean: 1.0 }],
  [16.0, { lean: 0.35, eyeScale: 1, eyeOpen: 0.5, browL: -0.3, browR: -0.3, browAng: 0, mouth: 0, smile: -0.15, turn: -0.6, lookX: -0.55, tilt: 0 }, 0.01],
  [17.95, { glasses: 1 }, 0.55],
  [23.0, { eyeOpen: 1, smirk: 0.7, browR: 0.55, browL: 0, glasses: 0, lookX: -0.25, turn: -0.2, lean: 0, smile: 0.1 }, 0.01],
];
const poseA = (t: number) => poseAt(t, A_KEYS);
const poseB = (t: number) => {
  const p = poseAt(t, B_KEYS);
  if (t > 12.02 && t < 12.7) p.tilt += Math.sin((t - 12.02) * 26) * 4 * (1 - (t - 12.02) / 0.7);   // incredulous head shake
  return p;
};
const eyeA = (t: number) => blinkAt(t, 1, [15.6, 17.3]);
const eyeB = (t: number) => (t > 9.9 && t < 11.3) || (t > 12 && t < 15) ? blinkAt(t, 99, [11.35]) : blinkAt(t, 2, [11.35]);

// ---------------- sets ----------------
const Lamp: React.FC<{ x: number; t: number }> = ({ x, t }) => (
  <g>
    <line x1={x} y1={0} x2={x} y2={210} stroke="#5A3A28" strokeWidth={5} />
    <circle cx={x} cy={300} r={170} fill="#FFD9A0" opacity={0.18 + 0.03 * Math.sin(t * 2)} />
    <path d={`M ${x - 80} 290 Q ${x} 170 ${x + 80} 290 Z`} fill="#C8693F" />
    <ellipse cx={x} cy={292} rx={52} ry={12} fill="#FFE6B8" />
  </g>
);
const Table: React.FC<{ cup: number; t: number }> = ({ cup, t }) => (
  <g>
    <rect x={0} y={1690} width={W} height={260} fill="#B5713F" />
    <rect x={0} y={1690} width={W} height={26} fill="#CD8E5A" />
    <rect x={0} y={1716} width={W} height={10} fill="#9C5E33" opacity={0.6} />
    {cup >= 0 && (
      <g transform={`translate(${cup} 1690)`}>
        <ellipse cx={0} cy={0} rx={115} ry={22} fill="#EFE4D3" />
        <path d="M -70 -110 L 70 -110 L 58 -8 Q 0 8 -58 -8 Z" fill="#F6EEE2" stroke="#D8C7AE" strokeWidth={5} />
        <path d="M 66 -88 C 115 -88 112 -34 60 -34" stroke="#F6EEE2" strokeWidth={14} fill="none" />
        <ellipse cx={0} cy={-110} rx={70} ry={15} fill="#A8693F" />
        <path d="M -24 -112 Q 0 -122 24 -112 Q 0 -102 -24 -112" fill="#F3DFC2" />
        {[0, 1].map((i) => (
          <path key={i} d={`M ${-18 + i * 34} -140 C ${-38 + i * 34 + Math.sin(t * 2 + i) * 8} -175 ${2 + i * 34} -195 ${-14 + i * 34 + Math.sin(t * 2.4 + i) * 10} -235`}
            stroke="#FFFFFF" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.45} />
        ))}
      </g>
    )}
  </g>
);
const SetA: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect width={W} height={H} fill="#F4E5CD" />
    <rect y={1380} width={W} height={540} fill="#E7A877" />
    <rect y={1380} width={W} height={16} fill="#D48D5C" />
    <g transform="translate(60 250)">
      <rect width={380} height={560} rx={14} fill="#FBE7CB" stroke="#C7784A" strokeWidth={18} />
      <circle cx={260} cy={170} r={90} fill="#FFE2A8" opacity={0.8} />
      <line x1={190} y1={0} x2={190} y2={560} stroke="#C7784A" strokeWidth={12} />
      <line x1={0} y1={280} x2={380} y2={280} stroke="#C7784A" strokeWidth={12} />
    </g>
    <g transform="translate(870 1150)">
      {[[-60, -160, -30], [0, -200, 0], [60, -160, 30], [-30, -120, -60], [40, -110, 55]].map(([x, y, a], i) => (
        <ellipse key={i} cx={x} cy={y} rx={34} ry={88} fill={i % 2 ? "#6F9A6C" : "#86AE7F"} transform={`rotate(${a + Math.sin(t + i) * 2} ${x} ${y + 60})`} />
      ))}
      <path d="M -70 -60 L 70 -60 L 55 80 L -55 80 Z" fill="#D9774A" />
    </g>
    <Lamp x={790} t={t} />
  </g>
);
const SetB: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect width={W} height={H} fill="#E3925F" />
    <rect y={1380} width={W} height={540} fill="#F1DDC0" />
    <rect y={1380} width={W} height={16} fill="#D9BE98" />
    <g transform="translate(70 270)">
      <rect width={330} height={430} rx={18} fill="#3B302B" stroke="#8A5A3C" strokeWidth={14} />
      <text x={165} y={92} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill="#F4E5CD">MENU</text>
      {[150, 205, 260, 315, 370].map((y, i) => <rect key={i} x={40} y={y} width={i % 2 ? 190 : 240} height={12} rx={6} fill="#F4E5CD" opacity={0.6} />)}
    </g>
    <g transform="translate(640 560)">
      <rect x={0} y={0} width={400} height={18} rx={6} fill="#8A5A3C" />
      {[30, 120, 210, 300].map((x, i) => (
        <g key={i}><rect x={x} y={-80} width={64} height={80} rx={12} fill={i % 2 ? "#F4E5CD" : "#FFF6E8"} /><rect x={x + 60} y={-62} width={18} height={36} rx={9} fill="none" stroke={i % 2 ? "#F4E5CD" : "#FFF6E8"} strokeWidth={8} /></g>
      ))}
    </g>
    <Lamp x={320} t={t + 1} />
  </g>
);

// ---------------- speech-bubble pop-outs from the phone ----------------
const Pop: React.FC<{ t: number; a: number; b: number; children: React.ReactNode; y: number }> = ({ t, a, b, children, y }) => {
  if (t < a || t > b + 0.25) return null;
  const k = clamp((t - a) / 0.3); const c = 1.7;
  const s = k >= 1 ? 1 : 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2);
  const out = r(t, b, b + 0.2);
  return <div style={{ position: "absolute", left: 0, top: y, width: W, display: "flex", justifyContent: "center", transform: `scale(${s * (1 - 0.1 * out)})`, opacity: 1 - out }}>{children}</div>;
};
const ChatCard: React.FC<{ name: string; text: string; out?: boolean; status?: string }> = ({ name, text, out, status }) => (
  <div style={{ width: 800, padding: "20px 28px 24px", borderRadius: 40, background: "#FFFDF8", boxShadow: "0 18px 0 rgba(90,50,25,0.18)", border: "5px solid #4A2A1C",
    fontFamily: "Inter, sans-serif" }}>
    <div style={{ fontSize: 28, fontWeight: 700, color: "#8B6A55", marginBottom: 10 }}>{name}</div>
    <div style={{ display: "flex", justifyContent: out ? "flex-end" : "flex-start" }}>
      <div style={{ maxWidth: 700, padding: "20px 30px", borderRadius: 38, background: out ? "#2E8BFF" : "#ECE5DB", color: out ? "#fff" : "#2A1A12",
        fontSize: 42, fontWeight: 600, lineHeight: 1.2, letterSpacing: -0.5 }}><Rich text={text} size={42} /></div>
    </div>
    {status && <div style={{ textAlign: "right", fontSize: 26, color: "#8B6A55", marginTop: 10, fontWeight: 600 }}>{status}</div>}
  </div>
);

// ---------------- word-by-word captions ----------------
const EMPH: Record<string, string[]> = { a1: ["AMAZING"], b2: ["CUSTOMER", "SUPPORT?!"], a3: ["bad?"] };
const CAP_Y: Record<string, number> = { a1: 1235, b1: 1250, a2: 1235, b2: 1500, a3: 560 };
const groups = (l: (typeof TL.lines)[number]) => {
  const out: { w: string; t: number }[][] = []; let cur: { w: string; t: number }[] = [];
  for (const w of l.words) { cur.push(w); if (cur.length >= (l.id === "b2" ? 3 : 4) || /[.,?!…”]$/.test(w.w)) { out.push(cur); cur = []; } }
  if (cur.length) out.push(cur); return out;
};
const Captions: React.FC<{ t: number }> = ({ t }) => {
  for (const l of TL.lines) {
    if (t < l.start || t > l.end + 0.35) continue;
    const gs = groups(l);
    let gi = gs.findIndex((g, i) => t >= g[0].t - 0.02 && (i + 1 >= gs.length || t < gs[i + 1][0].t - 0.02));
    if (gi < 0) return null;
    const g = gs[gi];
    const big = l.id === "b2";
    return (
      <div style={{ position: "absolute", left: 40, right: 40, top: CAP_Y[l.id], display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 22px",
        transform: "translateY(-50%)", fontFamily: FONT, fontWeight: 900, fontSize: big ? 104 : 84, lineHeight: 1.05, letterSpacing: -1 }}>
        {g.map((w, i) => {
          if (t < w.t - 0.02) return null;
          const k = clamp((t - w.t + 0.02) / 0.12);
          const em = (EMPH[l.id] || []).includes(w.w.replace(/[“”]/g, ""));
          return (
            <span key={i} style={{ color: em ? "#FFC83D" : "#FFFFFF", WebkitTextStroke: `${big ? 14 : 12}px #2A1A12`, paintOrder: "stroke fill",
              transform: `scale(${0.7 + 0.3 * k + (em ? 0.08 * Math.sin(k * Math.PI) : 0)})`, display: "inline-block",
              textShadow: "0 7px 0 rgba(42,26,18,0.55)" }}><Rich text={w.w} size={big ? 104 : 84} /></span>
          );
        })}
      </div>
    );
  }
  return null;
};

// ---------------- shots ----------------
const Cam: React.FC<{ s: number; fx?: number; fy: number; dx?: number; dy?: number; children: React.ReactNode }> = ({ s, fx = 540, fy, dx = 0, dy = 0, children }) => (
  <g transform={`translate(${fx + dx} ${fy + dy}) scale(${s}) translate(${-fx} ${-fy})`}>{children}</g>
);
const ShotA: React.FC<{ t: number; s: number; fy?: number }> = ({ t, s, fy = 900 }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Cam s={s} fy={fy}>
      <SetA t={t} />
      <Overthinker id="A" pose={poseA(t)} talk={talk(t, "A")} eye={eyeA(t)} scale={1.65} x={540} y={1130} />
      <Table cup={880} t={t} />
    </Cam>
  </svg>
);
const ShotB: React.FC<{ t: number; s: number; fy?: number; dx?: number; dy?: number }> = ({ t, s, fy = 900, dx = 0, dy = 0 }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Cam s={s} fy={fy} dx={dx} dy={dy}>
      <SetB t={t} />
      <Friend id="B" pose={poseB(t)} talk={talk(t, "B")} eye={eyeB(t)} scale={1.65} x={540} y={1150} />
      <Table cup={190} t={t} />
    </Cam>
  </svg>
);
const TwoShot: React.FC<{ t: number; s: number }> = ({ t, s }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Cam s={s} fy={1100}>
      <SetA t={t} />
      <Overthinker id="A2" pose={poseA(t)} talk={talk(t, "A")} eye={eyeA(t)} scale={0.95} x={290} y={1330} />
      <Friend id="B2" pose={poseB(t)} talk={talk(t, "B")} eye={eyeB(t)} scale={0.95} x={800} y={1335} />
      <Table cup={545} t={t} />
    </Cam>
  </svg>
);

// ---------------- scene 7: rewriting the text ----------------
const ORIG = "Thank you for your feedback.";
const BETTER = "I had a great time too. When am I seeing you again? 😉";
const PhoneRewrite: React.FC<{ t: number }> = ({ t }) => {
  const t0 = 19.0;
  const strike = r(t, t0 + 0.75, t0 + 1.15);
  const del = r(t, t0 + 1.3, t0 + 1.7, (x) => x);
  const typeK = r(t, t0 + 1.85, t0 + 3.05, (x) => x);
  const sent = r(t, t0 + 3.3, t0 + 3.6);
  const chars = Array.from(BETTER);
  let draft = ORIG.slice(0, Math.round(ORIG.length * (1 - del)));
  if (t >= t0 + 1.7) draft = chars.slice(0, Math.round(chars.length * typeK)).join("");
  if (sent > 0) draft = "";
  const head = r(t, t0 + 0.1, t0 + 0.5);
  const spark = t > t0 + 3.05 && t < t0 + 3.6 ? (t - t0 - 3.05) / 0.55 : -1;
  return (
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", filter: "blur(10px)", transform: "scale(1.08)" }}><SetA t={t} /></svg>
      <AbsoluteFill style={{ background: "rgba(244,229,205,0.35)" }} />
      <div style={{ position: "absolute", top: 210, width: W, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 92, lineHeight: 1.0, letterSpacing: -2,
        color: "#FFFFFF", WebkitTextStroke: "13px #2A1A12", paintOrder: "stroke fill", opacity: head, transform: `scale(${0.85 + 0.15 * head})`, textShadow: "0 7px 0 rgba(42,26,18,0.5)" }}>
        Your texts<br />deserve <span style={{ color: "#FFC83D" }}>better.</span>
      </div>
      {/* cartoon phone */}
      <div style={{ position: "absolute", left: 150, top: 470, width: 780, height: 1250, borderRadius: 90, background: "#1C1C22", border: "6px solid #4A2A1C", boxShadow: "0 24px 0 rgba(90,50,25,0.25)" }}>
        <div style={{ position: "absolute", left: 26, top: 26, right: 26, bottom: 26, borderRadius: 66, background: "#FFFDF8", overflow: "hidden", fontFamily: "Inter, sans-serif" }}>
          <div style={{ height: 150, borderBottom: "3px solid #EADFCF", display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
            <div style={{ width: 74, height: 74, borderRadius: 37, background: "#E3925F", color: "#fff", fontWeight: 800, fontSize: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>E</div>
            <div style={{ fontSize: 40, fontWeight: 800, color: "#2A1A12" }}>Emma</div>
          </div>
          <div style={{ padding: "40px 36px", display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ alignSelf: "flex-start", maxWidth: 560, padding: "22px 30px", borderRadius: 40, background: "#ECE5DB", fontSize: 42, fontWeight: 600, color: "#2A1A12", lineHeight: 1.2 }}>
              <Rich text="I had such a good time last night ❤️" size={42} /></div>
            {sent > 0 && (
              <div style={{ alignSelf: "flex-end", maxWidth: 560, padding: "22px 30px", borderRadius: 40, background: "#2E8BFF", fontSize: 42, fontWeight: 600, color: "#fff", lineHeight: 1.2,
                transform: `translateY(${(1 - sent) * 120}px) scale(${0.9 + 0.1 * sent})`, opacity: sent }}><Rich text={BETTER} size={42} /></div>
            )}
          </div>
          {/* composer */}
          <div style={{ position: "absolute", left: 28, right: 28, bottom: 34, minHeight: 104, borderRadius: 52, border: "4px solid #D9CBB8", background: "#FFF",
            padding: "24px 110px 24px 34px", fontSize: 40, fontWeight: 600, color: "#2A1A12", lineHeight: 1.22, boxSizing: "border-box" }}>
            <span style={{ position: "relative" }}>
              <Rich text={draft || ""} size={40} />
              {t < t0 + 1.3 && <span style={{ position: "absolute", left: 0, top: "52%", height: 6, width: `${strike * 100}%`, background: "#E5484D", borderRadius: 3 }} />}
            </span>
            {!draft && <span style={{ color: "#B9A893" }}>{sent > 0 ? "iMessage" : ""}</span>}
            {sent === 0 && <span style={{ display: "inline-block", width: 4, height: 44, background: "#2E8BFF", verticalAlign: "-8px", marginLeft: 3, opacity: Math.floor(t * 3) % 2 ? 1 : 0.2 }} />}
            <div style={{ position: "absolute", right: 16, bottom: 14, width: 76, height: 76, borderRadius: 38, background: draft ? "#2E8BFF" : "#D9CBB8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="34" height="38" viewBox="0 0 14 16" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 14.5V2M1.5 7.5L7 2l5.5 5.5" /></svg>
            </div>
            {spark >= 0 && [0, 1, 2, 3, 4].map((i) => {
              const a = i * 1.26 + 0.4; const d = 60 + 70 * spark;
              return <div key={i} style={{ position: "absolute", left: 300 + Math.cos(a) * d, top: 40 + Math.sin(a) * d * 0.7, width: 22, height: 22, opacity: 1 - spark,
                background: "#FFC83D", clipPath: "polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%)" }} />;
            })}
          </div>
        </div>
      </div>
      {/* his hands holding the phone */}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute" }}>
        <path d="M -60 2060 C 20 1900 90 1800 150 1770" stroke="#2F5E46" strokeWidth={150} fill="none" strokeLinecap="round" />
        <path d="M 1140 2060 C 1060 1900 990 1800 930 1770" stroke="#2F5E46" strokeWidth={150} fill="none" strokeLinecap="round" />
        <ellipse cx={150} cy={1735} rx={66} ry={80} fill="#F2C49D" stroke="#4A2A1C" strokeWidth={6} />
        <ellipse cx={930} cy={1735} rx={66} ry={80} fill="#F2C49D" stroke="#4A2A1C" strokeWidth={6} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------------- scene 8: end card ----------------
const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const t0 = 23.0;
  const a = r(t, t0 + 0.05, t0 + 0.4), b = r(t, t0 + 0.55, t0 + 0.95), peek = r(t, t0, t0 + 0.6);
  const bounce = t > t0 + 1.2 ? Math.sin((t - t0) * 3.2) * 6 : 0;
  return (
    <AbsoluteFill style={{ background: "#F4E5CD" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute" }}>
        <circle cx={540} cy={820} r={520} fill="#F0CFA8" />
        <Overthinker id="EA" pose={poseA(t)} talk={0} eye={eyeA(t)} scale={1.0} x={290} y={1950 - 380 * peek} />
        <Friend id="EB" pose={poseB(t)} talk={0} eye={eyeB(t)} scale={1.0} x={795} y={1955 - 380 * peek} />
      </svg>
      <div style={{ position: "absolute", top: 430, width: W, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 116, lineHeight: 0.98, letterSpacing: -3, color: "#2A1A12",
        opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>
        OVERTHINKING<br />YOUR REPLIES?
      </div>
      <div style={{ position: "absolute", top: 760, width: W, display: "flex", justifyContent: "center", opacity: b, transform: `scale(${0.85 + 0.15 * b}) translateY(${bounce}px)` }}>
        <div style={{ padding: "30px 64px", borderRadius: 60, background: "#E0743E", border: "6px solid #2A1A12", boxShadow: "0 12px 0 #2A1A12",
          fontFamily: FONT, fontWeight: 900, fontSize: 86, color: "#fff", letterSpacing: -1 }}>COMMENT TEXT <Rich text="👇" size={80} /></div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------- the reel ----------------
export const Reel: React.FC = () => {
  const t = useCurrentFrame() / useVideoConfig().fps;
  let shot: React.ReactNode;
  if (t < 3.2) shot = <ShotA t={t} s={mix(1.0, 1.06, r(t, 0, 3.2, (x) => x))} />;
  else if (t < 6.2) shot = <ShotB t={t} s={mix(1.0, 1.05, r(t, 3.2, 6.2, (x) => x))} />;
  else if (t < 9.9) shot = <ShotA t={t} s={mix(1.04, 1.11, r(t, 6.2, 9.9, (x) => x))} />;
  else if (t < 12.0) shot = <ShotB t={t} s={mix(1.55, 1.7, r(t, 9.9, 12.0, (x) => x))} fy={880} />;
  else if (t < 15.3) {
    const k = r(t, 12.0, 12.25); const shake = t < 12.5 ? (1 - (t - 12) / 0.5) * 10 : 0;
    shot = <ShotB t={t} s={mix(2.0, 1.78, k) + 0.04 * r(t, 12.25, 15.3, (x) => x)} fy={860} dx={Math.sin(t * 90) * shake} dy={Math.cos(t * 70) * shake} />;
  } else if (t < 16.0) shot = <ShotA t={t} s={1.38} fy={860} />;
  else if (t < 19.0) shot = <TwoShot t={t} s={mix(1.0, 1.05, r(t, 16, 19, (x) => x))} />;
  else if (t < 23.0) shot = <PhoneRewrite t={t} />;
  else shot = <EndCard t={t} />;
  const a1 = L("a1"), a2 = L("a2");
  return (
    <AbsoluteFill style={{ background: "#F4E5CD" }}>
      {shot}
      <Pop t={t} a={0.3} b={3.05} y={185}><ChatCard name="Emma" text="I had such a good time last night ❤️" /></Pop>
      <Pop t={t} a={a2.start + 0.1} b={9.75} y={185}><ChatCard name="You" text="Thank you for your feedback. We appreciate your time." out status="Delivered" /></Pop>
      {t < 19 && <Captions t={t} />}
      {/* light film grain / warmth */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 60%, rgba(70,35,15,0.18) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

// ---------------- character reference sheets (3 frames) ----------------
const Label: React.FC<{ x: number; y: number; text: string; size?: number }> = ({ x, y, text, size = 40 }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily="Inter Display, Inter" fontWeight={900} fontSize={size} fill="#2A1A12">{text}</text>
);
export const Sheets: React.FC = () => {
  const f = useCurrentFrame();
  const P = (o: object) => ({ ...poseAt(0, []), ...o });
  if (f === 0) {
    return (
      <AbsoluteFill style={{ background: "#F4E5CD" }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <Label x={540} y={170} text="REEL CAST" size={80} />
          <Overthinker id="s0a" pose={P({ lookX: 0.4, smile: 0.2 })} talk={0} eye={1} scale={0.95} x={285} y={1050} />
          <Friend id="s0b" pose={P({ lookX: -0.4, smirk: 0.6, browR: 0.4 })} talk={0} eye={1} scale={0.95} x={800} y={1050} />
          <Label x={285} y={1720} text="THE OVERTHINKER" /><Label x={800} y={1720} text="THE FRIEND" />
          <Label x={285} y={1775} text="curly hair · green hoodie" size={28} /><Label x={800} y={1775} text="round glasses · cream sweatshirt" size={28} />
        </svg>
      </AbsoluteFill>
    );
  }
  const A = f === 1;
  const cells: [string, object, number][] = A
    ? [["NEUTRAL", { lookY: 0.3 }, 0], ["SHOCKED", { eyeScale: 1.3, browL: 0.8, browR: 0.8, browAng: 10, mouth: 0.4 }, 0], ["DEAD SERIOUS", { eyeOpen: 0.8, browAng: -3, tilt: -5 }, 0], ["WORRIED", { browAng: 15, browL: 0.35, browR: 0.35, smile: -0.5, lookY: 0.8, phoneY: 0.3 }, 0]]
    : [["CURIOUS", { browR: 0.8, tilt: 5, smirk: 0.5, lookX: -0.5 }, 0], ["SILENT STARE", { eyeScale: 1.34, browL: 1.05 }, 0], ["OUTBURST", { eyeScale: 1.4, browL: 1.15, browR: 1.15, browAng: -6, mouth: 0.75 }, 0], ["EXHAUSTED", { eyeOpen: 0.5, browL: -0.3, browR: -0.3, glasses: 1 }, 0]];
  return (
    <AbsoluteFill style={{ background: "#F4E5CD" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Label x={540} y={150} text={A ? "THE OVERTHINKER · EXPRESSIONS" : "THE FRIEND · EXPRESSIONS"} size={52} />
        {cells.map(([name, o], i) => {
          const cx = i % 2 ? 790 : 290, cy = i < 2 ? 760 : 1560;
          return (
            <g key={i}>
              <clipPath id={`c${i}`}><rect x={cx - 250} y={cy - 560} width={500} height={640} rx={30} /></clipPath>
              <rect x={cx - 250} y={cy - 560} width={500} height={640} rx={30} fill={A ? "#F0CFA8" : "#E3925F"} />
              <g clipPath={`url(#c${i})`}>
                {A ? <Overthinker id={`x${i}`} pose={P(o)} talk={0} eye={1} scale={0.78} x={cx} y={cy - 40} />
                   : <Friend id={`x${i}`} pose={P(o)} talk={0} eye={1} scale={0.78} x={cx} y={cy - 40} />}
              </g>
              <Label x={cx} y={cy + 130} text={name} size={36} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
