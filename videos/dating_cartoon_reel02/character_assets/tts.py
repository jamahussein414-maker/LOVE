import sys, json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
K = Kokoro(sys.argv[1] + "/kokoro-v1.0.onnx", sys.argv[1] + "/voices-v1.0.bin")
VA, VB = "am_eric", "am_michael"
L = [  # id, who, spoken, caption, speed
 ("a1", "A", "She said she had an amazing time last night.", "She said she had an AMAZING time last night.", 0.98),
 ("b1", "B", "Okay... what'd you say?", "Okay… what’d you say?", 0.92),
 ("a2", "A", "Thank you for your feedback. We appreciate your time.", "“Thank you for your feedback. We appreciate your time.”", 0.86),
 ("b2", "B", "Are you dating her... or running customer support?!", "ARE YOU DATING HER… OR RUNNING CUSTOMER SUPPORT?!", 1.04),
 ("a3", "A", "So... is that bad?", "So… is that bad?", 0.85),
]
out = []
for i, who, sp, cap, spd in L:
    a, sr = K.create(sp, voice=VA if who == "A" else VB, speed=spd, lang="en-us")
    idx = np.where(np.abs(a) > 0.01)[0]; a = a[max(0, idx[0] - 500): idx[-1] + 1500].astype(np.float32)
    if i == "a3": a *= 0.75          # quieter, sheepish
    if i == "b2": a = np.tanh(a * 1.6) / np.tanh(1.6) * 0.95   # a bit of extra punch
    fn = f"public/vo/{i}.wav"; sf.write(fn, a, sr)
    # mouth envelope at 60 fps
    hop = sr // 60; env = []
    for k in range(0, len(a), hop):
        x = a[k:k + hop]; env.append(float(np.sqrt((x ** 2).mean())) if len(x) else 0.0)
    env = np.array(env); env = np.clip(env / (np.percentile(env, 95) + 1e-6), 0, 1.2)
    out.append({"id": i, "who": who, "text": sp, "caption": cap, "file": fn, "dur": round(len(a) / sr, 3), "env": [round(v, 3) for v in env]})
    print(f"{i} {who} {len(a)/sr:5.2f}s {sp}")
json.dump(out, open("lines.json", "w"))
