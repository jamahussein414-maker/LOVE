import sys, json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
K = Kokoro(sys.argv[1] + "/kokoro-v1.0.onnx", sys.argv[1] + "/voices-v1.0.bin")
VOICE, SPEED = sys.argv[2], float(sys.argv[3])
# (spoken text, caption text)
L = [
 ("They just asked you out...", "They just asked you out…"),
 ("and somehow, you're still staring at your keyboard.", "and somehow you're still staring at your keyboard."),
 ("You know what you want to say.", "You know what you want to say."),
 ("You just don't know how to make it sound right.", "You just don't know how to make it sound right."),
 ("Now imagine having Reply Right, built right into your keyboard.", "Now imagine having ReplyRight built right into your keyboard."),
 ("Copy the message,", "Copy the message,"),
 ("choose your vibe,", "choose your vibe,"),
 ("and get a reply that actually sounds like you.", "and get a reply that actually sounds like you."),
 ("One tap, and it's ready to send.", "One tap, and it's ready to send."),
 ("No more switching apps, just to figure out what to say.", "No more switching apps just to figure out what to say."),
 ("Want early access?", "Want early access?"),
 ("Comment, reply.", "Comment REPLY."),
]
out = []
for i, (sp, cap) in enumerate(L):
    a, sr = K.create(sp, voice=VOICE, speed=SPEED, lang="en-us")
    idx = np.where(np.abs(a) > 0.01)[0]; a = a[max(0, idx[0] - 600): idx[-1] + 1800]
    fn = f"public/vo/v{i:02d}.wav"; sf.write(fn, a, sr)
    out.append({"i": i, "speak": sp, "caption": cap, "file": fn, "dur": round(len(a) / sr, 3)})
    print("%5.2f  %s" % (out[-1]["dur"], sp))
json.dump(out, open("vo.json", "w"), indent=1)
w = sum(len(o["caption"].split()) for o in out); d = sum(o["dur"] for o in out)
print("words %d, speech %.1fs, %.0f wpm while speaking" % (w, d, w / d * 60))
