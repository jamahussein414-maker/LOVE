import sys, json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
K = Kokoro(sys.argv[1] + "/kokoro-v1.0.onnx", sys.argv[1] + "/voices-v1.0.bin")
VOICE = sys.argv[2]; SPEED = float(sys.argv[3])
CHUNKS = [
 ("Someone texts you,", "hook"),
 ("I had a really good time tonight.", "hook"),
 ("And now you're rewriting the same reply, five times.", "problem"),
 ("Too eager?", "problem"),
 ("Too dry?", "problem"),
 ("You know what you mean.", "problem"),
 ("You just can't find the words.", "problem"),
 ("Imagine pasting their message into Reply Right,", "product"),
 ("picking warm and confident,", "product"),
 ("and getting a reply that actually sounds like you.", "product"),
 ("I had a great time too.", "payoff"),
 ("I'd love to see you again.", "payoff"),
 ("Want early access?", "cta"),
 ("Comment reply.", "cta"),
]
out = []
for i, (txt, sc) in enumerate(CHUNKS):
    a, sr = K.create(txt, voice=VOICE, speed=SPEED, lang="en-us")
    # trim leading/trailing silence
    idx = np.where(np.abs(a) > 0.01)[0]; a = a[max(0, idx[0] - 600): idx[-1] + 1500]
    fn = f"c{i:02d}.wav"; sf.write(fn, a, sr)
    out.append({"i": i, "text": txt, "scene": sc, "file": fn, "dur": round(len(a) / sr, 3), "peak": float(np.abs(a).max())})
json.dump(out, open("chunks.json", "w"), indent=1)
tot = sum(o["dur"] for o in out); words = sum(len(o["text"].split()) for o in out)
for o in out: print("%5.2f %.2f %s" % (o["dur"], o["peak"], o["text"]))
print("speech %.1fs, %d words, %.0f wpm while speaking, sr %d" % (tot, words, words / tot * 60, sr))
