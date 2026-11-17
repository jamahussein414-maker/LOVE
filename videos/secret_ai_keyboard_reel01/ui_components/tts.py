import sys, json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
K = Kokoro(sys.argv[1] + "/kokoro-v1.0.onnx", sys.argv[1] + "/voices-v1.0.bin")
VOICE = sys.argv[2]
L = [  # (spoken, caption, speed)
 ("Okay. They just sent this.", "Okay… they just sent THIS.", 0.97),
 ("And somehow, you're rewriting the same reply again.", "And somehow, you’re rewriting the same reply again.", 0.9),
 ("There's a much easier way.", "There’s a much easier way.", 0.9),
 ("Just copy their message.", "Just copy their message.", 0.9),
 ("Then open your AI keyboard.", "Then open your AI keyboard.", 0.9),
 ("Paste it in.", "Paste it in.", 0.9),
 ("Pick your vibe.", "Pick your vibe.", 0.9),
 ("Let's go with flirty.", "Let’s go with flirty.", 0.92),
 ("And there you go.", "And there you go.", 0.92),
 ("Something you'd actually send.", "Something you’d actually send.", 0.9),
 ("One tap, and it's right in your message box.", "One tap, and it’s right in your message box.", 0.9),
 ("No switching apps.", "No switching apps.", 0.9),
 ("No overthinking.", "No overthinking.", 0.9),
 ("Text with confidence.", "Text with confidence.", 0.9),
 ("Comment, text, for early access.", "Comment TEXT for early access.", 0.9),
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
