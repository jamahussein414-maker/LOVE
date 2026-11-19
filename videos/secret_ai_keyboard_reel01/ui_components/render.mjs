import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const mode = process.argv[2] || "video";
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const composition = await selectComposition({ serveUrl, id: "Reel", browserExecutable, chromiumOptions: { gl: "swangle" } });
if (mode === "stills") {
  for (const s of process.argv.slice(3)) {
    const frame = Math.round(parseFloat(s) * composition.fps);
    await renderStill({ serveUrl, composition, frame, output: `stills/s_${s.padStart(5, "0")}.png`, browserExecutable, chromiumOptions: { gl: "swangle" } });
  }
} else {
  let last = -1;
  await renderMedia({ serveUrl, composition, codec: "h264", crf: 14, x264Preset: "slow", pixelFormat: "yuv420p", muted: true,
    outputLocation: "out/video.mp4", browserExecutable, concurrency: 4, chromiumOptions: { gl: "swangle" },
    onProgress: ({ progress }) => { const p = Math.floor(progress * 20); if (p !== last) { last = p; console.log(`render ${p * 5}%`); } } });
}
console.log("ok");
