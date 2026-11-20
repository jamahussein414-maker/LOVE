// Reusable rigged 2D characters. Local units: neck base at (0,0), head above, torso below.
// Every part is driven by a Pose so the same asset can act in any future episode.
import React from "react";
import { Pose } from "./lib";

type Rig = { pose: Pose; talk: number; eye: number; scale?: number; x?: number; y?: number; flip?: boolean; id: string };

const Eye: React.FC<{ cx: number; cy: number; rx: number; ry: number; p: Pose; eye: number; skin: string; id: string; lid: string }> =
  ({ cx, cy, rx, ry, p, eye, skin, id, lid }) => {
    const sx = rx * p.eyeScale, sy = ry * p.eyeScale;
    const open = Math.max(0, Math.min(1, p.eyeOpen * eye));
    const lidH = (1 - open) * sy * 2;
    return (
      <g>
        <clipPath id={id}><ellipse cx={cx} cy={cy} rx={sx} ry={sy} /></clipPath>
        <ellipse cx={cx} cy={cy} rx={sx} ry={sy} fill="#FFFDF8" />
        <g clipPath={`url(#${id})`}>
          <circle cx={cx + p.lookX * sx * 0.42 + p.turn * 6} cy={cy + p.lookY * sy * 0.38} r={sx * 0.5} fill="#2A1A12" />
          <circle cx={cx + p.lookX * sx * 0.42 + p.turn * 6 + sx * 0.17} cy={cy + p.lookY * sy * 0.38 - sy * 0.18} r={sx * 0.16} fill="#fff" />
          <rect x={cx - sx - 2} y={cy - sy - 2} width={sx * 2 + 4} height={lidH + 2} fill={skin} />
          {open < 0.98 && <line x1={cx - sx} x2={cx + sx} y1={cy - sy + lidH} y2={cy - sy + lidH} stroke={lid} strokeWidth={5} strokeLinecap="round" />}
        </g>
        <ellipse cx={cx} cy={cy} rx={sx} ry={sy} fill="none" stroke={lid} strokeWidth={4} />
      </g>
    );
  };

const Brow: React.FC<{ cx: number; cy: number; w: number; h: number; ang: number; color: string }> = ({ cx, cy, w, h, ang, color }) => (
  <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={h / 2} fill={color} transform={`rotate(${ang} ${cx} ${cy})`} />
);

/** mouth: closed line shaped by smile/smirk, opening into a rounded mouth when talking */
const Mouth: React.FC<{ y: number; w: number; p: Pose; talk: number; line: string }> = ({ y, w, p, talk, line }) => {
  const open = Math.min(1, p.mouth + talk);
  const cx = p.turn * 10;
  const curve = p.smile * 18, sk = p.smirk * 14;
  if (open < 0.07) {
    return <path d={`M ${cx - w} ${y - curve * 0.3 + sk} Q ${cx} ${y + curve} ${cx + w} ${y - curve * 0.3 - sk}`} stroke={line} strokeWidth={7} fill="none" strokeLinecap="round" />;
  }
  const rx = w * (0.75 + 0.35 * open), ry = 6 + open * 34;
  return (
    <g>
      <ellipse cx={cx} cy={y + ry * 0.35} rx={rx} ry={ry} fill="#5B2020" stroke={line} strokeWidth={5} />
      <ellipse cx={cx} cy={y + ry * 0.35 + ry * 0.55} rx={rx * 0.6} ry={ry * 0.38} fill="#D9686A" />
      {open > 0.35 && <rect x={cx - rx * 0.62} y={y + ry * 0.35 - ry + 2} width={rx * 1.24} height={Math.min(10, ry * 0.3)} rx={4} fill="#FFFDF8" />}
    </g>
  );
};

// ---------------- Character A: "The Overthinker" ----------------
export const Overthinker: React.FC<Rig> = ({ pose: p, talk, eye, scale = 1, x = 0, y = 0, flip, id }) => {
  const skin = "#F2C49D", skinD = "#DFA57D", hair = "#3A2316", hood = "#2F5E46", hoodD = "#244B38", line = "#4A2A1C";
  const bob = Math.sin((x + 1) * 0.001) * 0; // placeholder for future gestures
  const phoneY = 165 + p.phoneY * 120;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${flip ? -scale : scale} ${scale})`}>
      <g transform={`translate(0 ${p.lean * 10}) rotate(${p.lean * 2})`}>
        {/* hood + torso */}
        <ellipse cx={0} cy={62} rx={165} ry={60} fill={hoodD} />
        <path d="M -255 640 C -258 330 -215 125 -118 74 L 118 74 C 215 125 258 330 255 640 Z" fill={hood} />
        <path d="M -255 640 C -258 330 -215 125 -118 74 L -90 74 C -170 140 -200 330 -195 640 Z" fill={hoodD} opacity={0.55} />
        <path d="M -44 92 L -52 205 M 44 92 L 52 205" stroke="#EADFC8" strokeWidth={9} strokeLinecap="round" />
        <circle cx={-52} cy={210} r={9} fill="#EADFC8" /><circle cx={52} cy={210} r={9} fill="#EADFC8" />
        <rect x={-46} y={-40} width={92} height={115} rx={34} fill={skinD} />
        {/* head */}
        <g transform={`rotate(${p.tilt} 0 -60) translate(${p.turn * 10} 0)`}>
          <ellipse cx={0} cy={-268} rx={168} ry={122} fill={hair} />
          <ellipse cx={-134} cy={-168} rx={24} ry={34} fill={skinD} /><ellipse cx={134} cy={-168} rx={24} ry={34} fill={skinD} />
          <ellipse cx={0} cy={-182} rx={136} ry={150} fill={skin} />
          <ellipse cx={-88} cy={-122} rx={26} ry={15} fill="#F29C86" opacity={0.3 + 0.4 * p.blush} />
          <ellipse cx={88} cy={-122} rx={26} ry={15} fill="#F29C86" opacity={0.3 + 0.4 * p.blush} />
          {/* curls */}
          {[[-150, -250, 50], [-112, -305, 54], [-55, -330, 56], [5, -338, 58], [65, -328, 55], [118, -300, 52], [152, -248, 46],
            [-122, -262, 38], [-62, -288, 42], [0, -298, 44], [60, -290, 42], [114, -262, 36]].map(([cx, cy, rr], i) => (
            <g key={i}><circle cx={cx} cy={cy} r={rr} fill={hair} /><circle cx={cx - rr * 0.3} cy={cy - rr * 0.35} r={rr * 0.28} fill="#563527" /></g>
          ))}
          {[[-72, -268, 22], [-24, -276, 24], [26, -274, 23], [78, -266, 21]].map(([cx, cy, rr], i) => (
            <circle key={"f" + i} cx={cx} cy={cy} r={rr} fill={hair} />
          ))}
          <g transform={`translate(${p.turn * 12} 0)`}>
            <Brow cx={-55} cy={-216 - p.browL * 26} w={74} h={18} ang={-p.browAng} color={hair} />
            <Brow cx={55} cy={-216 - p.browR * 26} w={74} h={18} ang={p.browAng} color={hair} />
            <Eye id={`${id}-el`} cx={-54} cy={-170} rx={26} ry={31} p={p} eye={eye} skin={skin} lid={line} />
            <Eye id={`${id}-er`} cx={54} cy={-170} rx={26} ry={31} p={p} eye={eye} skin={skin} lid={line} />
            <path d="M -4 -138 Q 12 -120 -2 -108" stroke="#C98560" strokeWidth={7} fill="none" strokeLinecap="round" />
            <Mouth y={-82} w={30} p={p} talk={talk} line={line} />
          </g>
        </g>
        {/* arms, hands and phone */}
        <path d={`M -205 260 C -190 ${phoneY + 60} -120 ${phoneY + 140} -70 ${phoneY + 110}`} stroke={hood} strokeWidth={92} fill="none" strokeLinecap="round" />
        <path d={`M 205 260 C 190 ${phoneY + 60} 120 ${phoneY + 140} 70 ${phoneY + 110}`} stroke={hood} strokeWidth={92} fill="none" strokeLinecap="round" />
        <g transform={`translate(0 ${phoneY}) rotate(${-4 + p.phoneY * 6})`}>
          <rect x={-62} y={-10} width={124} height={205} rx={22} fill="#1C1C22" />
          <rect x={-53} y={0} width={106} height={185} rx={15} fill="#BFE3FF" />
          <rect x={-40} y={20} width={60} height={14} rx={7} fill="#fff" opacity={0.9} />
          <rect x={-40} y={42} width={44} height={14} rx={7} fill="#fff" opacity={0.9} />
          <rect x={2} y={70} width={40} height={14} rx={7} fill="#2E8BFF" opacity={0.9} />
        </g>
        <ellipse cx={-70} cy={phoneY + 115} rx={44} ry={50} fill={skin} stroke={line} strokeWidth={4} />
        <ellipse cx={70} cy={phoneY + 115} rx={44} ry={50} fill={skin} stroke={line} strokeWidth={4} />
        <ellipse cx={-46} cy={phoneY + 82} rx={14} ry={24} fill={skin} stroke={line} strokeWidth={4} transform={`rotate(25 -46 ${phoneY + 82})`} />
        <ellipse cx={46} cy={phoneY + 82} rx={14} ry={24} fill={skin} stroke={line} strokeWidth={4} transform={`rotate(-25 46 ${phoneY + 82})`} />
      </g>
    </g>
  );
};

// ---------------- Character B: "The Friend" ----------------
export const Friend: React.FC<Rig> = ({ pose: p, talk, eye, scale = 1, x = 0, y = 0, flip, id }) => {
  const skin = "#D49A70", skinD = "#BD8058", hair = "#221815", top = "#F2E7D3", topD = "#DCCBAE", line = "#3E2418";
  const gy = p.glasses * 26;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      <g transform={`translate(0 ${p.lean * 16}) rotate(${p.lean * -1.5})`}>
        {/* sweatshirt */}
        <path d="M -268 640 C -270 300 -235 128 -132 80 L 132 80 C 235 128 270 300 268 640 Z" fill={top} stroke={topD} strokeWidth={6} />
        <path d="M 268 640 C 270 300 235 128 132 80 L 105 80 C 190 140 215 320 208 640 Z" fill={topD} opacity={0.55} />
        <path d="M -98 84 Q 0 150 98 84" stroke={topD} strokeWidth={22} fill="none" strokeLinecap="round" />
        <rect x={-48} y={-38} width={96} height={112} rx={34} fill={skinD} />
        {/* forearms resting forward */}
        <path d={`M -215 300 C -230 ${470 - p.lean * 30} -120 ${520 - p.lean * 30} -10 ${505 - p.lean * 30}`} stroke={top} strokeWidth={96} fill="none" strokeLinecap="round" />
        <path d={`M 215 300 C 230 ${470 - p.lean * 30} 120 ${520 - p.lean * 30} 10 ${505 - p.lean * 30}`} stroke={top} strokeWidth={96} fill="none" strokeLinecap="round" />
        {/* head */}
        <g transform={`rotate(${p.tilt} 0 -60) translate(${p.turn * 10} ${-p.lean * 6})`}>
          <ellipse cx={-133} cy={-165} rx={24} ry={33} fill={skinD} /><ellipse cx={133} cy={-165} rx={24} ry={33} fill={skinD} />
          <path d="M -134 -190 C -136 -40 -80 -24 0 -24 C 80 -24 136 -40 134 -190 C 134 -300 80 -330 0 -330 C -80 -330 -134 -300 -134 -190 Z" fill={skin} />
          <ellipse cx={-86} cy={-112} rx={24} ry={13} fill="#E07F6A" opacity={0.25 + 0.4 * p.blush} />
          <ellipse cx={86} cy={-112} rx={24} ry={13} fill="#E07F6A" opacity={0.25 + 0.4 * p.blush} />
          {/* short hair with a little quiff */}
          <path d="M -142 -190 C -150 -330 -60 -372 10 -366 C 90 -372 160 -320 142 -190 C 128 -238 100 -262 40 -268 C 70 -250 40 -240 10 -262 C -40 -258 -110 -252 -142 -190 Z" fill={hair} />
          <path d="M -20 -350 C 30 -392 92 -372 104 -330 C 70 -350 30 -352 -20 -350 Z" fill={hair} />
          <g transform={`translate(${p.turn * 12} 0)`}>
            <Brow cx={-58} cy={-232 - p.browL * 30} w={66} h={13} ang={-p.browAng} color={hair} />
            <Brow cx={58} cy={-232 - p.browR * 30} w={66} h={13} ang={p.browAng} color={hair} />
            <Eye id={`${id}-el`} cx={-57} cy={-176} rx={29} ry={33} p={p} eye={eye} skin={skin} lid={line} />
            <Eye id={`${id}-er`} cx={57} cy={-176} rx={29} ry={33} p={p} eye={eye} skin={skin} lid={line} />
            {/* round glasses (can slide down the nose) */}
            <g transform={`translate(0 ${gy})`}>
              <circle cx={-57} cy={-176} r={52} fill="rgba(255,255,255,0.10)" stroke="#2A2A2A" strokeWidth={9} />
              <circle cx={57} cy={-176} r={52} fill="rgba(255,255,255,0.10)" stroke="#2A2A2A" strokeWidth={9} />
              <path d="M -8 -182 Q 0 -192 8 -182" stroke="#2A2A2A" strokeWidth={8} fill="none" />
              <path d="M -109 -186 L -132 -178 M 109 -186 L 132 -178" stroke="#2A2A2A" strokeWidth={8} strokeLinecap="round" />
              <path d="M -84 -204 L -70 -214 M 30 -204 L 44 -214" stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.7} />
            </g>
            <path d="M 2 -132 Q 16 -112 0 -100" stroke="#A86B45" strokeWidth={7} fill="none" strokeLinecap="round" />
            <Mouth y={-74} w={32} p={p} talk={talk} line={line} />
          </g>
        </g>
      </g>
    </g>
  );
};
