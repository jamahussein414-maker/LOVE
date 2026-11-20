import React from "react";
import { Composition, continueRender, delayRender, staticFile } from "remotion";
import { Reel, Sheets } from "./scenes";
import { TL, FPS } from "./lib";

const FACES: [string, string, string][] = [
  ["Inter", "Inter-Regular.otf", "400"], ["Inter", "Inter-Medium.otf", "500"], ["Inter", "Inter-SemiBold.otf", "600"],
  ["Inter", "Inter-Bold.otf", "700"], ["Inter", "Inter-ExtraBold.otf", "800"],
  ["Inter Display", "InterDisplay-SemiBold.otf", "600"], ["Inter Display", "InterDisplay-Bold.otf", "700"],
];
const handle = delayRender("fonts");
Promise.all(FACES.map(([fam, file, w]) => {
  const f = new FontFace(fam, `url(${staticFile("fonts/" + file)})`, { weight: w });
  return f.load().then((x) => document.fonts.add(x));
})).then(() => continueRender(handle)).catch((e) => { console.error(e); continueRender(handle); });

export const Root: React.FC = () => (
  <><Composition id="Reel" component={Reel} durationInFrames={Math.round(TL.end * FPS)} fps={FPS} width={1080} height={1920} /><Composition id="Sheets" component={Sheets} durationInFrames={3} fps={FPS} width={1080} height={1920} /></>
);
