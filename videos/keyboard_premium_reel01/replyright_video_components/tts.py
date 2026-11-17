import sys, json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
K = Kokoro(sys.argv[1] + "/kokoro-v1.0.onnx", sys.argv[1] + "/voices-v1.0.bin")
VOICE, SPEED = sys.argv[2], float(sys.argv[3])
L = [  # (spoken, caption)
 ("Someone you really like just texts you...", "Someone you really like just texts you…"),
 ("So when are you taking me out?", "“So when are you taking me out?”"),
 ("And suddenly, you're rewriting the same reply, over and over.", "And suddenly, you’re rewriting the same reply over and over."),
 ("You know what you mean.", "You know what you mean."),
 ("You just can't find the right words.", "You just can’t find the right words."),
 ("Now imagine having Reply Right, inside your keyboard.", "Now imagine having ReplyRight inside your keyboard."),
 ("Copy their message,", "Copy their message,"),
 ("open Reply Right,", "open ReplyRight,"),
 ("and paste it in.", "and paste it in."),
 ("Choose how you want to sound.", "Choose how you want to sound."),
 ("Let's go with flirty.", "Let’s go with flirty."),
 ("And there it is.", "And there it is."),
 ("That depends. Are you free this Saturday?", "“That depends. Are you free this Saturday?”"),
 ("Tap Use Reply, and it's right in your message box.", "Tap Use Reply, and it’s right in your message box."),
 ("No switching back and forth between apps.", "No switching back and forth between apps."),
 ("Want early access?", "Want early access?"),
 ("Comment, reply.", "Comment REPLY."),
]
out = []
for i, (sp, cap) in enumerate(L):
    a, sr = K.create(sp, voice=VOICE, speed=SPEED, lang="en-us")
    idx = np.where(np.abs(a) > 0.01)[0]; a = a[max(0, idx[0] - 600): idx[-1] + 2000]
    fn = f"public/vo/v{i:02d}.wav"; sf.write(fn, a, sr)
    out.append({"i": i, "speak": sp, "caption": cap, "file": fn, "dur": round(len(a) / sr, 3), "words": len(cap.split())})
    print("%2d %5.2f %s" % (i, out[-1]["dur"], sp))
json.dump(out, open("vo.json", "w"), indent=1)
w = sum(o["words"] for o in out); d = sum(o["dur"] for o in out)
print("words %d speech %.1fs -> %.0f wpm while speaking" % (w, d, w / d * 60))
