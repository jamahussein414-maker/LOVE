import sys, json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
K = Kokoro(sys.argv[1] + "/kokoro-v1.0.onnx", sys.argv[1] + "/voices-v1.0.bin")
VOICE = sys.argv[2]
L = [  # (spoken, caption, speed)
 ("Okay... they just sent this.", "Okay… they just sent THIS.", 1.0),
 ("And now I'm rewriting the same reply. Again.", "And now I’m rewriting the same reply. Again.", 1.0),
 ("So here's my trick.", "So here’s my trick.", 0.98),
 ("Copy their message.", "Copy their message.", 0.97),
 ("Switch to my AI keyboard.", "Switch to my AI keyboard.", 0.97),
 ("Paste it,", "Paste it,", 0.97),
 ("pick a vibe... flirty, obviously.", "pick a vibe… flirty, obviously.", 0.95),
 ("And look at that!", "And look at that!", 1.0),
 ("I was wondering when you'd ask. Saturday?", "“I was wondering when you’d ask 😌 Saturday?”", 0.95),
 ("One tap, and it's right in my message box.", "One tap, and it’s right in my message box.", 0.98),
 ("No switching apps.", "No switching apps.", 0.97),
 ("Less overthinking. More confidence.", "Less overthinking. More confidence.", 0.92),
 ("Comment, text, for early access!", "Comment TEXT for early access.", 0.95),
]
out = []
for i, (sp, cap, spd) in enumerate(L):
    a, sr = K.create(sp, voice=VOICE, speed=spd, lang="en-us")
    idx = np.where(np.abs(a) > 0.01)[0]; a = a[max(0, idx[0] - 600): idx[-1] + 2000]
    fn = f"public/vo/v{i:02d}.wav"; sf.write(fn, a, sr)
    out.append({"i": i, "speak": sp, "caption": cap, "file": fn, "dur": round(len(a) / sr, 3), "words": len(cap.split())})
    print("%2d %5.2f %s" % (i, out[-1]["dur"], sp))
json.dump(out, open("vo.json", "w"), indent=1)
w = sum(o["words"] for o in out); d = sum(o["dur"] for o in out)
print("words %d speech %.1fs -> %.0f wpm while speaking" % (w, d, w / d * 60))
