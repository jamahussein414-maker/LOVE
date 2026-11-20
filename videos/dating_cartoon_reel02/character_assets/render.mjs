import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const mode = process.argv[2] || "video";
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const chromiumOptions = { gl: "swangle" };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
if (mode === "sheets") {
  const composition = await selectComposition({ serveUrl, id: "Sheets", browserExecutable, chromiumOptions });
  for (const f of [0, 1, 2]) await renderStill({ serveUrl, composition, frame: f, output: `stills/sheet_${f}.png`, browserExecutable, chromiumOptions });
} else {
  const composition = await selectComposition({ serveUrl, id: "Reel", browserExecutable, chromiumOptions });
  if (mode === "stills") {
    for (const s of process.argv.slice(3)) await renderStill({ serveUrl, composition, frame: Math.round(parseFloat(s) * composition.fps), output: `stills/s_${s.padStart(5, "0")}.png`, browserExecutable, chromiumOptions });
  } else {
    let last = -1;
    await renderMedia({ serveUrl, composition, codec: "h264", crf: 15, x264Preset: "slow", pixelFormat: "yuv420p", muted: true, outputLocation: mode === "seg" ? "out/seg.mp4" : "out/video.mp4", frameRange: mode === "seg" ? [1140, 1379] : undefined,
      browserExecutable, concurrency: 4, chromiumOptions, onProgress: ({ progress }) => { const p = Math.floor(progress * 10); if (p !== last) { last = p; console.log(`render ${p * 10}%`); } } });
  }
}
console.log("ok");
